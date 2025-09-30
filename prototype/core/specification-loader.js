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

      // Substitute environment variables
      this.substituteEnvVars(spec);

      console.log(
        `✅ Loaded specification: ${spec.metadata?.taskTitle || "Unknown"}`
      );
      console.log(`📋 Tasks: ${Object.keys(spec.tasks || {}).join(", ")}`);

      return spec;
    } catch (error) {
      throw new Error(`Failed to load specification: ${error.message}`);
    }
  }

  /**
   * Substitute environment variables in the spec
   * Replaces ${VAR_NAME} with actual values
   */
  substituteEnvVars(spec) {
    const path = require("path");
    
    // Auto-detect workspace root (test-case folder)
    const repoRoot = process.cwd().replace(/[\\\/]prototype$/, "");
    const workspaceRoot = process.env.WORKSPACE_ROOT || path.join(repoRoot, "test-case");
    
    const envVars = {
      WORKSPACE_ROOT: workspaceRoot,
      API_BASE_URL: process.env.API_BASE_URL || "http://localhost:3000",
      ...process.env,
    };

    // Recursively replace variables in the spec
    const replaceInObject = (obj) => {
      if (typeof obj === "string") {
        return obj.replace(/\$\{([^}]+)\}/g, (match, varName) => {
          return envVars[varName] || match;
        });
      }

      if (Array.isArray(obj)) {
        return obj.map((item) => replaceInObject(item));
      }

      if (obj && typeof obj === "object") {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
          result[key] = replaceInObject(value);
        }
        return result;
      }

      return obj;
    };

    // Replace in entire spec
    Object.assign(spec, replaceInObject(spec));
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
