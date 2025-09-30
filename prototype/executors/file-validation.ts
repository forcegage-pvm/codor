/**
 * File Validation Executor (Node.js)
 *
 * Validates file existence, size, content, etc.
 * Contributors can extend for specific file types (JSON schema, XML, etc.)
 *
 * Action Type: FILE_VALIDATION
 */

import * as fs from "fs";
import * as path from "path";
import {
  BaseExecutor,
  ExecutionResult,
  ExecutorConfig,
} from "../core/base-executor";

interface FileValidationParameters {
  filePath: string;
  validationType:
    | "EXISTS"
    | "NOT_EXISTS"
    | "CONTENT_MATCH"
    | "CONTENT_PATTERN"
    | "JSON_VALID";
  expectedContent?: string;
  contentPattern?: string;
  minSize?: number;
  maxSize?: number;
  encoding?: BufferEncoding;
}

interface FileValidationResult {
  filePath: string;
  validationType: string;
  exists: boolean;
  timestamp: string;
  size?: number;
  modified?: string;
  isDirectory?: boolean;
  contentLength?: number;
  contentMatches?: boolean;
  patternMatches?: boolean;
  json?: any;
  isValidJSON?: boolean;
}

export class FileValidationExecutor extends BaseExecutor {
  getActionTypes(): string[] {
    return ["FILE_VALIDATION"];
  }

  async execute(
    parameters: FileValidationParameters,
    globalConfig: ExecutorConfig
  ): Promise<ExecutionResult> {
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
      : path.join(globalConfig.workspaceRoot as string, filePath);

    const result: FileValidationResult = {
      filePath: absolutePath,
      validationType,
      exists: fs.existsSync(absolutePath),
      timestamp: new Date().toISOString(),
    };

    // Check existence
    if (!result.exists) {
      if (validationType === "NOT_EXISTS") {
        return { success: true, data: result }; // Success - file doesn't exist as expected
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
      } catch (error: any) {
        result.isValidJSON = false;
        throw new Error(`Invalid JSON: ${error.message}`);
      }
    }

    return { success: true, data: result };
  }
}

export default FileValidationExecutor;
