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

class BaseExecutor {
  /**
   * Return array of action types this executor handles
   * Example: ['TERMINAL_COMMAND', 'SHELL_COMMAND']
   */
  getActionTypes() {
    throw new Error("getActionTypes() must be implemented by executor plugin");
  }

  /**
   * Execute the action
   * @param {Object} parameters - Action parameters from test spec
   * @param {Object} globalConfig - Global configuration from test spec
   * @returns {Promise<any>} - Execution result data
   */
  async execute(parameters, globalConfig) {
    throw new Error("execute() must be implemented by executor plugin");
  }

  /**
   * Optional cleanup method
   * Called when engine shuts down
   */
  async cleanup() {
    // Override if cleanup needed
  }

  /**
   * Helper: Validate required parameters
   */
  validateParameters(parameters, requiredFields) {
    for (const field of requiredFields) {
      if (parameters[field] === undefined) {
        throw new Error(`Missing required parameter: ${field}`);
      }
    }
  }
}

module.exports = BaseExecutor;
