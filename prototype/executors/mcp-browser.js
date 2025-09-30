/**
 * MCP Browser Executor (Node.js/Chrome DevTools)
 *
 * Executes browser automation via Model Context Protocol
 * Contributors can create similar executors for Playwright, Puppeteer, Selenium, etc.
 *
 * Action Type: MCP_BROWSER_COMMAND
 */

const { spawn } = require("child_process");
const BaseExecutor = require("../core/base-executor");

class MCPBrowserExecutor extends BaseExecutor {
  constructor() {
    super();
    this.mcpProcess = null;
    this.mcpInitialized = false;
    this.messageId = 1;
    this.pendingRequests = new Map();
    this.mcpCapabilities = null;
    this.outputBuffer = "";
  }

  getActionTypes() {
    return ["MCP_BROWSER_COMMAND"];
  }

  async execute(parameters, globalConfig) {
    this.validateParameters(parameters, ["action"]);

    const { action, ...actionParams } = parameters;

    // Start MCP server if not running
    if (!this.mcpProcess) {
      await this.startMCPServer();
    }

    // Initialize MCP protocol
    if (!this.mcpInitialized && action === "initialize") {
      const initResult = await this.initializeMCP();
      return {
        action,
        initialized: true,
        capabilities: initResult,
        timestamp: new Date().toISOString(),
      };
    }

    // Handle special actions
    if (action === "list_tools") {
      const tools = await this.listTools();
      return {
        action,
        tools,
        count: tools.length,
        timestamp: new Date().toISOString(),
      };
    }

    // Execute MCP tool
    const result = await this.executeMCPTool(action, actionParams);

    return {
      action,
      parameters: actionParams,
      result,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Start the MCP server process
   */
  async startMCPServer() {
    return new Promise((resolve, reject) => {
      console.log("🌐 Starting Chrome DevTools MCP server...");

      // Get Chrome path from environment or use default
      const chromePath =
        process.env.CHROME_EXECUTABLE_PATH ||
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

      this.mcpProcess = spawn(
        "npx",
        ["-y", "chrome-devtools-mcp@latest", "--executablePath", chromePath],
        {
          stdio: ["pipe", "pipe", "pipe"],
          shell: true,
        }
      );

      // Set up output handling
      this.mcpProcess.stdout.on("data", (data) => {
        this.outputBuffer += data.toString();
        this.processMessages();
      });

      this.mcpProcess.stderr.on("data", (data) => {
        const message = data.toString();
        // Filter out npm warnings
        if (!message.includes("npm") && !message.includes("WARN")) {
          console.error(`MCP stderr: ${message}`);
        }
      });

      this.mcpProcess.on("error", (error) => {
        reject(new Error(`Failed to start MCP server: ${error.message}`));
      });

      this.mcpProcess.on("exit", (code) => {
        if (code !== 0 && code !== null) {
          console.log(`⚠️  MCP server exited with code ${code}`);
        }
      });

      // Server starts immediately, resolve after short delay
      setTimeout(() => {
        console.log("✅ MCP server started");
        resolve();
      }, 2000);
    });
  }

  /**
   * Initialize MCP protocol
   */
  async initializeMCP() {
    const request = {
      jsonrpc: "2.0",
      id: this.messageId++,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {},
        },
        clientInfo: {
          name: "CODOR Test Engine",
          version: "2.0.0",
        },
      },
    };

    const response = await this.sendRequest(request);
    this.mcpInitialized = true;
    this.mcpCapabilities = response.capabilities;

    // Send initialized notification
    await this.sendNotification({
      jsonrpc: "2.0",
      method: "notifications/initialized",
    });

    return response;
  }

  /**
   * List available MCP tools
   */
  async listTools() {
    const request = {
      jsonrpc: "2.0",
      id: this.messageId++,
      method: "tools/list",
      params: {},
    };

    const response = await this.sendRequest(request);
    return response.tools || [];
  }

  /**
   * Execute an MCP tool
   */
  async executeMCPTool(toolName, params) {
    const request = {
      jsonrpc: "2.0",
      id: this.messageId++,
      method: "tools/call",
      params: {
        name: toolName,
        arguments: params,
      },
    };

    return await this.sendRequest(request);
  }

  /**
   * Send JSON-RPC request and wait for response
   */
  async sendRequest(request) {
    return new Promise((resolve, reject) => {
      const requestId = request.id;

      // Store pending request
      this.pendingRequests.set(requestId, { resolve, reject });

      // Send request
      const message = JSON.stringify(request) + "\n";
      this.mcpProcess.stdin.write(message);

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(
            new Error(
              `MCP request timeout: ${request.method} (id: ${requestId})`
            )
          );
        }
      }, 30000);
    });
  }

  /**
   * Send notification (no response expected)
   */
  async sendNotification(notification) {
    const message = JSON.stringify(notification) + "\n";
    this.mcpProcess.stdin.write(message);
  }

  /**
   * Process incoming messages from MCP server
   */
  processMessages() {
    const lines = this.outputBuffer.split("\n");
    this.outputBuffer = lines.pop() || ""; // Keep incomplete line

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const message = JSON.parse(line);

        // Handle response
        if (message.id && this.pendingRequests.has(message.id)) {
          const pending = this.pendingRequests.get(message.id);
          this.pendingRequests.delete(message.id);

          if (message.error) {
            pending.reject(
              new Error(
                `MCP error: ${
                  message.error.message || JSON.stringify(message.error)
                }`
              )
            );
          } else {
            pending.resolve(message.result);
          }
        }

        // Handle notifications (if needed in future)
        if (message.method && !message.id) {
          // Server notification - can log or handle if needed
        }
      } catch (error) {
        // Invalid JSON, ignore
        console.error(`Failed to parse MCP message: ${line}`);
      }
    }
  }

  /**
   * Cleanup MCP connection
   */
  async cleanup() {
    if (this.mcpProcess) {
      console.log("🧹 Closing MCP server connection...");

      // Reject all pending requests
      for (const [id, pending] of this.pendingRequests) {
        pending.reject(new Error("MCP connection closed"));
      }
      this.pendingRequests.clear();

      // Kill process gracefully
      try {
        this.mcpProcess.kill("SIGTERM");

        // Wait briefly for graceful shutdown
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Force kill if still running
        if (this.mcpProcess.exitCode === null) {
          this.mcpProcess.kill("SIGKILL");
        }
      } catch (error) {
        // Process already dead, ignore
      }

      this.mcpProcess = null;
      this.mcpInitialized = false;
      this.messageId = 1;
    }
  }
}

module.exports = MCPBrowserExecutor;
