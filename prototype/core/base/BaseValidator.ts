/**
 * Base Validator Class
 *
 * Abstract base class that implements IValidator interface.
 * Provides common functionality for validator plugins.
 */

import { IValidator, ValidationResult } from "../interfaces/IValidator";

export abstract class BaseValidator implements IValidator {
  abstract readonly name: string;

  /**
   * Validate execution results against criteria
   */
  abstract validate(
    criteria: any,
    executionContext: Map<string, any>
  ): Promise<ValidationResult>;

  /**
   * Helper method to create a validation result
   */
  protected createResult(
    passed: boolean,
    evaluations: Array<{
      criterion: any;
      result: boolean;
      reason?: string;
    }>,
    message?: string
  ): ValidationResult {
    return {
      validator: this.name,
      passed,
      evaluations,
      message,
    };
  }
}
