/**
 * Validation Engine
 *
 * Evaluates validation criteria against execution results
 */

class ValidationEngine {
  evaluate(stepResults, validationCriteria) {
    const result = {
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
        const evaluation = {
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
      } catch (error) {
        console.log(`⚠️ Evaluation error: ${error.message}`);
        result.passed = false;
      }
    }

    return result;
  }

  buildContext(stepResults) {
    const context = {};

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

  evaluateCondition(condition, context) {
    // Replace STEP.N notation with bracket notation STEP["N"]
    // This allows JavaScript to handle numeric IDs
    try {
      // Create scope objects for STEP, PREREQ, CLEANUP
      const STEP = {};
      const PREREQ = {};
      const CLEANUP = {};

      // Populate with context data
      for (const [actionId, data] of Object.entries(context)) {
        const [prefix, num] = actionId.split(".");
        if (prefix === "STEP") STEP[num] = data;
        else if (prefix === "PREREQ") PREREQ[num] = data;
        else if (prefix === "CLEANUP") CLEANUP[num] = data;
      }

      // Evaluate condition with proper scope
      return eval(condition);
    } catch (error) {
      console.error(`Condition evaluation error: ${error.message}`);
      return false;
    }
  }

  countErrors(text) {
    return (text.match(/error/gi) || []).length;
  }

  countWarnings(text) {
    return (text.match(/warning/gi) || []).length;
  }
}

module.exports = ValidationEngine;
