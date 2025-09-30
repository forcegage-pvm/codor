/**
 * Terminal Command Executor (Node.js/PowerShell)
 *
 * Executes shell commands via PowerShell on Windows
 * Contributors can create similar executors for bash, zsh, cmd.exe, etc.
 *
 * Action Type: TERMINAL_COMMAND
 */

const { spawn } = require("child_process");
const BaseExecutor = require("../core/base-executor");

class TerminalCommandExecutor extends BaseExecutor {
  getActionTypes() {
    return ["TERMINAL_COMMAND"];
  }

  async execute(parameters, globalConfig) {
    this.validateParameters(parameters, ["command"]);

    const {
      command,
      workingDirectory,
      environment = {},
      expectedExitCodes = [0],
      shell = "powershell.exe", // Default to PowerShell on Windows
      background = false, // NEW: Support background processes
    } = parameters;

    // Background process (e.g., dev server)
    if (background) {
      return this.executeBackground(
        command,
        workingDirectory || globalConfig.workspaceRoot,
        environment,
        globalConfig
      );
    }

    // Foreground process (normal execution)
    return new Promise((resolve, reject) => {
      const mergedEnv = {
        ...process.env,
        ...globalConfig.environment,
        ...environment,
      };

      const child = spawn(shell, ["-Command", command], {
        cwd: workingDirectory || globalConfig.workspaceRoot,
        env: mergedEnv,
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => {
        const output = data.toString();
        stdout += output;
        process.stdout.write(output); // Real-time output
      });

      child.stderr.on("data", (data) => {
        const output = data.toString();
        stderr += output;
        process.stderr.write(output);
      });

      child.on("close", (code) => {
        const result = {
          command,
          workingDirectory: workingDirectory || globalConfig.workspaceRoot,
          exitCode: code,
          stdout,
          stderr,
          expectedExitCodes,
          timestamp: new Date().toISOString(),
        };

        // Check if exit code is acceptable
        if (expectedExitCodes.includes(code)) {
          resolve(result);
        } else {
          const error = new Error(
            `Command exited with code ${code}. Expected: ${expectedExitCodes.join(
              ", "
            )}`
          );
          error.result = result; // Attach result for evidence
          reject(error);
        }
      });

      child.on("error", (error) => {
        reject(error);
      });
    });
  }

  /**
   * Execute command in background (for dev servers, etc.)
   */
  executeBackground(command, workingDirectory, environment, globalConfig) {
    const mergedEnv = {
      ...process.env,
      ...globalConfig.environment,
      ...environment,
    };

    const child = spawn("powershell.exe", ["-Command", command], {
      cwd: workingDirectory,
      env: mergedEnv,
      stdio: ["ignore", "pipe", "pipe"],
      detached: false,
    });

    // Store process for cleanup
    if (!this.backgroundProcesses) {
      this.backgroundProcesses = [];
    }
    this.backgroundProcesses.push(child);

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    // Return immediately for background process
    return Promise.resolve({
      command,
      workingDirectory,
      background: true,
      pid: child.pid,
      status: "started",
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Cleanup background processes
   */
  async cleanup() {
    if (this.backgroundProcesses && this.backgroundProcesses.length > 0) {
      console.log(
        `🧹 Stopping ${this.backgroundProcesses.length} background processes...`
      );

      for (const proc of this.backgroundProcesses) {
        try {
          if (proc.pid && !proc.killed) {
            process.kill(proc.pid, "SIGTERM");
          }
        } catch (error) {
          // Process already dead, ignore
        }
      }

      this.backgroundProcesses = [];
    }
  }
}

module.exports = TerminalCommandExecutor;
