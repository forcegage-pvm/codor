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
    this.mcpConnection = null;
  }

  getActionTypes() {
    return ["MCP_BROWSER_COMMAND"];
  }

  async execute(parameters, globalConfig) {
    this.validateParameters(parameters, ["action"]);

    const { action, ...actionParams } = parameters;

    // Ensure MCP server is running
    if (!this.mcpConnection) {
      await this.connectMCPServer();
    }

    // Execute MCP command
    const result = await this.executeMCPCommand(action, actionParams);

    return {
      action,
      parameters: actionParams,
      result,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Connect to MCP server
   */
  async connectMCPServer() {
    return new Promise((resolve, reject) => {
      console.log("🌐 Starting Chrome DevTools MCP server...");

      this.mcpProcess = spawn(
        "npx",
        ["-y", "@modelcontextprotocol/server-chrome-devtools"],
        {
          stdio: ["pipe", "pipe", "pipe"],
        }
      );

      let initData = "";

      this.mcpProcess.stdout.on("data", (data) => {
        initData += data.toString();

        // Look for initialization complete signal
        if (initData.includes("MCP server running")) {
          this.mcpConnection = {
            process: this.mcpProcess,
            messageId: 1,
          };
          console.log("✅ MCP server connected");
          resolve();
        }
      });

      this.mcpProcess.stderr.on("data", (data) => {
        console.error(`MCP stderr: ${data}`);
      });

      this.mcpProcess.on("error", (error) => {
        reject(new Error(`Failed to start MCP server: ${error.message}`));
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!this.mcpConnection) {
          reject(new Error("MCP server connection timeout"));
        }
      }, 10000);
    });
  }

  /**
   * Execute MCP command via JSON-RPC
   */
  async executeMCPCommand(action, params) {
    return new Promise((resolve, reject) => {
      const messageId = this.mcpConnection.messageId++;

      const request = {
        jsonrpc: "2.0",
        id: messageId,
        method: `tools/${action}`,
        params,
      };

      let responseData = "";

      const responseHandler = (data) => {
        responseData += data.toString();

        try {
          const response = JSON.parse(responseData);

          if (response.id === messageId) {
            this.mcpProcess.stdout.removeListener("data", responseHandler);

            if (response.error) {
              reject(new Error(`MCP error: ${response.error.message}`));
            } else {
              resolve(response.result);
            }
          }
        } catch (error) {
          // Incomplete JSON, wait for more data
        }
      };

      this.mcpProcess.stdout.on("data", responseHandler);

      // Send request
      this.mcpProcess.stdin.write(JSON.stringify(request) + "\n");

      // Timeout
      setTimeout(() => {
        this.mcpProcess.stdout.removeListener("data", responseHandler);
        reject(new Error(`MCP command timeout: ${action}`));
      }, 30000);
    });
  }

  /**
   * Cleanup MCP connection
   */
  async cleanup() {
    if (this.mcpProcess) {
      console.log("🧹 Closing MCP server connection...");
      this.mcpProcess.kill();
      this.mcpProcess = null;
      this.mcpConnection = null;
    }
  }
}

module.exports = MCPBrowserExecutor;
