/**
 * Specification Loader
 *
 * Loads and validates test specifications (v2.0.0 schema)
 */

const fs = require("fs");

class SpecificationLoader {
  async load(testSpecPath) {
    try {
      const content = fs.readFileSync(testSpecPath, "utf8");
      const spec = JSON.parse(content);

      // Validate structure
      this.validate(spec);

      console.log(
        `✅ Loaded specification: ${spec.metadata?.taskTitle || "Unknown"}`
      );
      console.log(`📋 Tasks: ${Object.keys(spec.tasks || {}).join(", ")}`);

      return spec;
    } catch (error) {
      throw new Error(`Failed to load specification: ${error.message}`);
    }
  }

  validate(spec) {
    if (!spec.schemaVersion) {
      throw new Error("Missing schemaVersion");
    }

    if (!spec.tasks || Object.keys(spec.tasks).length === 0) {
      throw new Error("No tasks defined in specification");
    }

    if (!spec.globalConfiguration) {
      throw new Error("Missing globalConfiguration");
    }

    // Validate each task has required structure
    for (const [taskId, task] of Object.entries(spec.tasks)) {
      if (!task.testExecution || !task.testExecution.steps) {
        throw new Error(`Task ${taskId} missing testExecution.steps`);
      }

      if (!task.validationCriteria) {
        throw new Error(`Task ${taskId} missing validationCriteria`);
      }
    }
  }
}

module.exports = SpecificationLoader;
