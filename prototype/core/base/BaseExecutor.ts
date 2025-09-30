/**
 * Base Executor Class
 *
 * Abstract base class that implements IExecutor interface.
 * Provides common functionality and helper methods for executor plugins.
 *
 * Plugin developers can extend this class OR implement IExecutor directly.
 */

import {
  ExecutionResult,
  ExecutorConfig,
  IExecutor,
} from "../interfaces/IExecutor";

export abstract class BaseExecutor implements IExecutor {
  abstract readonly name: string;
  abstract readonly version: string;

  /**
   * Return array of action types this executor handles
   */
  abstract getActionTypes(): string[];

  /**
   * Execute the action
   */
  abstract execute(
    parameters: any,
    globalConfig: ExecutorConfig
  ): Promise<ExecutionResult>;

  /**
   * Optional cleanup - default implementation does nothing
   */
  async cleanup(): Promise<void> {
    // Override if cleanup needed
  }

  /**
   * Helper method to validate required parameters
   * @param parameters - Parameters to validate
   * @param requiredFields - Array of required field names
   * @throws Error if required fields are missing
   */
  protected validateParameters(
    parameters: any,
    requiredFields: string[]
  ): void {
    const missing = requiredFields.filter((field) => !(field in parameters));

    if (missing.length > 0) {
      throw new Error(`Missing required parameters: ${missing.join(", ")}`);
    }
  }

  /**
   * Helper method to create a success result
   */
  protected createSuccessResult(data?: any): ExecutionResult {
    return {
      success: true,
      data,
    };
  }

  /**
   * Helper method to create a failure result
   */
  protected createFailureResult(error: string, data?: any): ExecutionResult {
    return {
      success: false,
      error,
      data,
    };
  }
}
