/**
 * Validation Engine
 *
 * Evaluates validation criteria against execution results
 */

export interface ValidationCondition {
  condition: string;
  description: string;
}

export interface ValidationCriteria {
  successConditions?: ValidationCondition[];
  failureConditions?: ValidationCondition[];
}

export interface ValidationEvaluation {
  condition: string;
  description: string;
  passed: boolean;
}

export interface ValidationResult {
  passed: boolean;
  successConditions: any[];
  failureConditions: any[];
  evaluations: ValidationEvaluation[];
}

export interface StepResult {
  success: boolean;
  action: {
    actionId: string;
    [key: string]: any;
  };
  data?: {
    stdout?: string;
    stderr?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export class ValidationEngine {
  evaluate(
    stepResults: StepResult[],
    validationCriteria: ValidationCriteria
  ): ValidationResult {
    const result: ValidationResult = {
      passed: true,
      successConditions: [],
      failureConditions: [],
      evaluations: [],
    };

    // Build execution context for eval
    const context = this.buildContext(stepResults);

    // Evaluate success conditions
    for (const condition of validationCriteria.successConditions || []) {
      try {
        const evaluation: ValidationEvaluation = {
          condition: condition.condition,
          description: condition.description,
          passed: this.evaluateCondition(condition.condition, context),
        };

        result.evaluations.push(evaluation);

        if (!evaluation.passed) {
          result.passed = false;
          console.log(`❌ Failed: ${condition.description}`);
        } else {
          console.log(`✅ Passed: ${condition.description}`);
        }
      } catch (error: any) {
        console.log(`⚠️ Evaluation error: ${error.message}`);
        result.passed = false;
      }
    }

    return result;
  }

  private buildContext(stepResults: StepResult[]): Record<string, any> {
    const context: Record<string, any> = {};

    for (const step of stepResults) {
      const actionId = step.action.actionId;
      // Use original actionId as key (e.g., "STEP.1")
      // Include all data fields plus computed fields
      context[actionId] = {
        success: step.success,
        // Include all data from executor result
        ...step.data,
        // Computed fields
        errorCount: this.countErrors(step.data?.stderr || ""),
        warningCount: this.countWarnings(step.data?.stdout || ""),
      };
    }

    return context;
  }

  private evaluateCondition(
    condition: string,
    context: Record<string, any>
  ): boolean {
    // Replace STEP.N notation with bracket notation STEP["N"]
    // This allows JavaScript to handle numeric IDs
    try {
      // Create scope objects for STEP, PREREQ, CLEANUP
      const STEP: Record<string, any> = {};
      const PREREQ: Record<string, any> = {};
      const CLEANUP: Record<string, any> = {};

      // Populate with context data
      for (const [actionId, data] of Object.entries(context)) {
        const [prefix, num] = actionId.split(".");
        if (prefix === "STEP") STEP[num] = data;
        else if (prefix === "PREREQ") PREREQ[num] = data;
        else if (prefix === "CLEANUP") CLEANUP[num] = data;
      }

      // Evaluate condition with proper scope
      return eval(condition);
    } catch (error: any) {
      console.error(`Condition evaluation error: ${error.message}`);
      return false;
    }
  }

  private countErrors(text: string): number {
    return (text.match(/error/gi) || []).length;
  }

  private countWarnings(text: string): number {
    return (text.match(/warning/gi) || []).length;
  }
}

export default ValidationEngine;
