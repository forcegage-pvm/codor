/**
 * Terminal Command Executor (Node.js/PowerShell)
 *
 * Executes shell commands via PowerShell on Windows
 * Contributors can create similar executors for bash, zsh, cmd.exe, etc.
 *
 * Action Type: TERMINAL_COMMAND
 */

import { ChildProcess, spawn } from "child_process";
import { BaseExecutor } from "../../base/BaseExecutor";
import { ExecutionResult, ExecutorConfig } from "../../interfaces/IExecutor";

interface TerminalCommandParameters {
  command: string;
  workingDirectory?: string;
  environment?: Record<string, string>;
  expectedExitCodes?: number[];
  shell?: string;
  background?: boolean;
}

interface TerminalCommandResult {
  command: string;
  workingDirectory: string;
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  expectedExitCodes?: number[];
  timestamp: string;
  background?: boolean;
  pid?: number;
  status?: string;
}

export class TerminalCommandExecutor extends BaseExecutor {
  readonly name = "terminal-command";
  readonly version = "1.0.0";

  private backgroundProcesses: ChildProcess[] = [];

  getActionTypes(): string[] {
    return ["TERMINAL_COMMAND"];
  }

  async execute(
    parameters: TerminalCommandParameters,
    globalConfig: ExecutorConfig
  ): Promise<ExecutionResult> {
    this.validateParameters(parameters, ["command"]);

    const {
      command,
      workingDirectory,
      environment = {},
      expectedExitCodes = [0],
      shell = "powershell.exe", // Default to PowerShell on Windows
      background = false,
    } = parameters;

    // Background process (e.g., dev server)
    if (background) {
      return this.executeBackground(
        command,
        workingDirectory || (globalConfig.workspaceRoot as string),
        environment,
        globalConfig
      );
    }

    // Foreground process (normal execution)
    return new Promise((resolve, reject) => {
      const mergedEnv = {
        ...process.env,
        ...(globalConfig.environment as Record<string, string>),
        ...environment,
      };

      const child = spawn(shell, ["-Command", command], {
        cwd: workingDirectory || (globalConfig.workspaceRoot as string),
        env: mergedEnv,
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      child.stdout?.on("data", (data: Buffer) => {
        const output = data.toString();
        stdout += output;
        process.stdout.write(output); // Real-time output
      });

      child.stderr?.on("data", (data: Buffer) => {
        const output = data.toString();
        stderr += output;
        process.stderr.write(output);
      });

      child.on("close", (code: number | null) => {
        const result: TerminalCommandResult = {
          command,
          workingDirectory:
            workingDirectory || (globalConfig.workspaceRoot as string),
          exitCode: code || 0,
          stdout,
          stderr,
          expectedExitCodes,
          timestamp: new Date().toISOString(),
        };

        // Check if exit code is acceptable
        if (expectedExitCodes.includes(code || 0)) {
          resolve({ success: true, data: result });
        } else {
          const error: any = new Error(
            `Command exited with code ${code}. Expected: ${expectedExitCodes.join(
              ", "
            )}`
          );
          error.result = result; // Attach result for evidence
          reject(error);
        }
      });

      child.on("error", (error: Error) => {
        reject(error);
      });
    });
  }

  /**
   * Execute command in background (for dev servers, etc.)
   */
  private executeBackground(
    command: string,
    workingDirectory: string,
    environment: Record<string, string>,
    globalConfig: ExecutorConfig
  ): Promise<ExecutionResult> {
    const mergedEnv = {
      ...process.env,
      ...(globalConfig.environment as Record<string, string>),
      ...environment,
    };

    const child = spawn("powershell.exe", ["-Command", command], {
      cwd: workingDirectory,
      env: mergedEnv,
      stdio: ["ignore", "pipe", "pipe"],
      detached: false,
    });

    // Store process for cleanup
    this.backgroundProcesses.push(child);

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr?.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    // Return immediately for background process
    return Promise.resolve({
      success: true,
      data: {
        command,
        workingDirectory,
        background: true,
        pid: child.pid,
        status: "started",
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Cleanup background processes
   */
  async cleanup(): Promise<void> {
    if (this.backgroundProcesses.length > 0) {
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

export default TerminalCommandExecutor;
