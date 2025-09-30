/**
 * Validator Plugin Interface
 *
 * Defines the contract for plugins that validate test execution results against criteria.
 * Validators determine if a test PASSED or FAILED based on validation criteria.
 */

export interface ValidationResult {
  /**
   * Name of the validator that produced this result
   */
  validator: string;

  /**
   * Overall validation result
   */
  passed: boolean;

  /**
   * Individual criterion evaluations
   */
  evaluations: Array<{
    criterion: any;
    result: boolean;
    reason?: string;
  }>;

  /**
   * Human-readable message
   */
  message?: string;
}

export interface IValidator {
  /**
   * Plugin identifier (must be unique)
   */
  readonly name: string;

  /**
   * Validate execution results against criteria
   *
   * @param criteria - Validation criteria from test specification
   * @param executionContext - Map of actionId -> ActionResult for access to execution data
   * @returns ValidationResult indicating pass/fail with details
   */
  validate(
    criteria: any,
    executionContext: Map<string, any>
  ): Promise<ValidationResult>;
}
