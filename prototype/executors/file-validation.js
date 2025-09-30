/**
 * File Validation Executor (Node.js)
 *
 * Validates file existence, size, content, etc.
 * Contributors can extend for specific file types (JSON schema, XML, etc.)
 *
 * Action Type: FILE_VALIDATION
 */

const fs = require("fs");
const path = require("path");
const BaseExecutor = require("../core/base-executor");

class FileValidationExecutor extends BaseExecutor {
  getActionTypes() {
    return ["FILE_VALIDATION"];
  }

  async execute(parameters, globalConfig) {
    this.validateParameters(parameters, ["filePath", "validationType"]);

    const {
      filePath,
      validationType,
      expectedContent,
      contentPattern,
      minSize,
      maxSize,
      encoding = "utf8",
    } = parameters;

    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(globalConfig.workspaceRoot, filePath);

    const result = {
      filePath: absolutePath,
      validationType,
      exists: fs.existsSync(absolutePath),
      timestamp: new Date().toISOString(),
    };

    // Check existence
    if (!result.exists) {
      if (validationType === "NOT_EXISTS") {
        return result; // Success - file doesn't exist as expected
      } else {
        throw new Error(`File not found: ${absolutePath}`);
      }
    }

    // File exists - get stats
    const stats = fs.statSync(absolutePath);
    result.size = stats.size;
    result.modified = stats.mtime.toISOString();
    result.isDirectory = stats.isDirectory();

    // Size validation
    if (minSize !== undefined && stats.size < minSize) {
      throw new Error(
        `File size ${stats.size} bytes is less than minimum ${minSize} bytes`
      );
    }

    if (maxSize !== undefined && stats.size > maxSize) {
      throw new Error(
        `File size ${stats.size} bytes exceeds maximum ${maxSize} bytes`
      );
    }

    // Content validation
    if (
      validationType === "CONTENT_MATCH" ||
      validationType === "CONTENT_PATTERN"
    ) {
      if (stats.isDirectory()) {
        throw new Error("Cannot validate content of a directory");
      }

      const content = fs.readFileSync(absolutePath, encoding);
      result.contentLength = content.length;

      if (validationType === "CONTENT_MATCH" && expectedContent !== undefined) {
        result.contentMatches = content.includes(expectedContent);

        if (!result.contentMatches) {
          throw new Error("File content does not match expected string");
        }
      }

      if (validationType === "CONTENT_PATTERN" && contentPattern) {
        const regex = new RegExp(contentPattern);
        result.patternMatches = regex.test(content);

        if (!result.patternMatches) {
          throw new Error(
            `File content does not match pattern: ${contentPattern}`
          );
        }
      }
    }

    // JSON validation
    if (validationType === "JSON_VALID") {
      try {
        const content = fs.readFileSync(absolutePath, encoding);
        result.json = JSON.parse(content);
        result.isValidJSON = true;
      } catch (error) {
        result.isValidJSON = false;
        throw new Error(`Invalid JSON: ${error.message}`);
      }
    }

    return result;
  }
}

module.exports = FileValidationExecutor;
