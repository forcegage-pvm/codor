/**
 * Base Executor Interface
 *
 * All executor plugins MUST extend this class and implement:
 * - getActionTypes(): string[] - Array of action types this executor handles
 * - execute(parameters, globalConfig): Promise<any> - Execute the action
 * - cleanup(): Promise<void> - Optional cleanup
 *
 * This ensures consistent interface for all executors across all languages/frameworks
 */

export interface ExecutorConfig {
  [key: string]: any;
}

export interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  [key: string]: any;
}

/**
 * Abstract base class for all executor plugins
 */
export abstract class BaseExecutor {
  /**
   * Return array of action types this executor handles
   * Example: ['TERMINAL_COMMAND', 'SHELL_COMMAND']
   */
  abstract getActionTypes(): string[];

  /**
   * Execute the action
   * @param parameters - Action parameters from test spec
   * @param globalConfig - Global configuration from test spec
   * @returns Execution result data
   */
  abstract execute(
    parameters: any,
    globalConfig: ExecutorConfig
  ): Promise<ExecutionResult>;

  /**
   * Optional cleanup method
   * Called when engine shuts down
   */
  async cleanup(): Promise<void> {
    // Override if cleanup needed
  }

  /**
   * Helper: Validate required parameters
   */
  protected validateParameters(
    parameters: any,
    requiredFields: string[]
  ): void {
    for (const field of requiredFields) {
      if (parameters[field] === undefined) {
        throw new Error(`Missing required parameter: ${field}`);
      }
    }
  }
}

export default BaseExecutor;
