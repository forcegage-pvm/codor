/**
 * Executor Plugin Interface
 *
 * Defines the contract that all executor plugins MUST implement.
 * Executors are responsible for executing specific action types (e.g., FILE_VALIDATION, HTTP_REQUEST).
 *
 * This interface enables:
 * - Dependency Inversion: Engine depends on IExecutor, not concrete implementations
 * - Multiple executors per action type
 * - Runtime plugin discovery and loading
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

export interface IExecutor {
  /**
   * Plugin identifier (must be unique)
   */
  readonly name: string;

  /**
   * Plugin version (semver)
   */
  readonly version: string;

  /**
   * Array of action types this executor can handle
   * Example: ['FILE_VALIDATION', 'FILE_EXISTS']
   */
  getActionTypes(): string[];

  /**
   * Execute the action
   * @param parameters - Action-specific parameters from test specification
   * @param globalConfig - Global configuration from test specification
   * @returns Promise<ExecutionResult> with success flag and data/error
   */
  execute(
    parameters: any,
    globalConfig: ExecutorConfig
  ): Promise<ExecutionResult>;

  /**
   * Cleanup resources when engine shuts down
   * Optional: called even if execute() wasn't called
   */
  cleanup(): Promise<void>;
}
