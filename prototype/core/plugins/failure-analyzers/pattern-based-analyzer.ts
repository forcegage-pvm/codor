/**
 * Pattern-Based Failure Analyzer
 * Categorizes test failures based on error patterns and provides actionable guidance
 */

import { BaseFailureAnalyzer } from "../../base/BaseFailureAnalyzer";
import { FailureAnalysisResult } from "../../interfaces/IFailureAnalyzer";

interface ExecutionStep {
  success: boolean;
  error?: string;
  action?: any;
  phase?: string;
  data?: any;
}

export class PatternBasedAnalyzer extends BaseFailureAnalyzer {
  readonly name = "pattern-based-analyzer";
  readonly priority = 100; // High priority for pattern matching

  /**
   * Analyze failed task and categorize failure based on error patterns
   */
  async analyze(
    steps: any[],
    failureReason: string,
    taskSpec: any
  ): Promise<FailureAnalysisResult | null> {
    // Find first failed step
    const failedStep = steps.find((s) => !s.success) as ExecutionStep;

    if (!failedStep) {
      return this.createResult(
        "UNKNOWN_ERROR",
        "Task failed but no failed step found",
        "Review task execution logs",
        { phase: "unknown", errorType: "UnknownError" }
      );
    }

    const error = failedStep.error || "";
    const action = failedStep.action || {};

    // Detect category based on error patterns
    const category = this.detectCategory(error, action, failedStep);

    if (!category) {
      return null; // No pattern match
    }

    const analysis = this.categorizeFailure(
      category,
      error,
      action,
      failedStep
    );

    return this.createResult(
      analysis.category,
      analysis.reason,
      analysis.suggestedAction,
      {
        actionId: action.actionId,
        actionType: action.type,
        phase: failedStep.phase,
        errorType: this.extractErrorType(error),
        fullError: error,
      },
      analysis.blockedBy
    );
  }

  /**
   * Detect failure category from error patterns
   */
  private detectCategory(
    error: string,
    action: any,
    step: ExecutionStep
  ): string | null {
    const errorLower = error.toLowerCase();

    // File/Path errors -> INCOMPLETE_IMPLEMENTATION
    if (
      errorLower.includes("file not found") ||
      errorLower.includes("enoent") ||
      errorLower.includes("cannot find module") ||
      errorLower.includes("404 not found") ||
      errorLower.includes("does not exist") ||
      action.type === "FILE_VALIDATION"
    ) {
      return "INCOMPLETE_IMPLEMENTATION";
    }

    // Compilation errors
    if (
      (errorLower.includes("ts") && /ts\d+:/.test(errorLower)) ||
      errorLower.includes("syntaxerror") ||
      errorLower.includes("compilation failed") ||
      (action.type === "TERMINAL_COMMAND" &&
        action.parameters?.command?.includes("tsc"))
    ) {
      return "COMPILATION_ERROR";
    }

    // Environment errors
    if (
      errorLower.includes("econnrefused") ||
      errorLower.includes("port already in use") ||
      errorLower.includes("not running") ||
      errorLower.includes("connection refused")
    ) {
      return "ENVIRONMENT_ERROR";
    }

    // Authentication errors
    if (
      errorLower.includes("401") ||
      errorLower.includes("unauthorized") ||
      errorLower.includes("403") ||
      errorLower.includes("forbidden") ||
      errorLower.includes("invalid token")
    ) {
      return "AUTHENTICATION_ERROR";
    }

    // Timeout errors
    if (
      errorLower.includes("timeout") ||
      errorLower.includes("etimedout") ||
      errorLower.includes("timed out")
    ) {
      return "TIMEOUT";
    }

    // Dependency errors
    if (
      (errorLower.includes("npm") && errorLower.includes("err")) ||
      errorLower.includes("package not found") ||
      errorLower.includes("eresolve") ||
      (action.type === "TERMINAL_COMMAND" &&
        action.parameters?.command?.includes("npm install"))
    ) {
      return "DEPENDENCY_ERROR";
    }

    // Runtime errors
    if (
      errorLower.includes("typeerror") ||
      errorLower.includes("referenceerror") ||
      errorLower.includes("rangeerror") ||
      errorLower.includes("cannot read property") ||
      errorLower.includes("is not defined")
    ) {
      return "RUNTIME_ERROR";
    }

    // Validation failures
    if (
      (errorLower.includes("expected") && errorLower.includes("but got")) ||
      errorLower.includes("assertion failed") ||
      errorLower.includes("schema validation") ||
      (action.type === "HTTP_REQUEST" && step.data?.status >= 400)
    ) {
      return "VALIDATION_FAILURE";
    }

    // Configuration errors
    if (
      errorLower.includes("invalid configuration") ||
      (errorLower.includes("config") && errorLower.includes("error")) ||
      errorLower.includes("parse error")
    ) {
      return "CONFIGURATION_ERROR";
    }

    return "UNKNOWN_ERROR";
  }

  /**
   * Create detailed analysis for specific category
   */
  private categorizeFailure(
    category: string,
    error: string,
    action: any,
    step: ExecutionStep
  ): {
    category: string;
    reason: string;
    blockedBy: string[];
    suggestedAction: string;
  } {
    switch (category) {
      case "INCOMPLETE_IMPLEMENTATION":
        return this.analyzeIncompleteImplementation(error, action);

      case "COMPILATION_ERROR":
        return this.analyzeCompilationError(error, action);

      case "ENVIRONMENT_ERROR":
        return this.analyzeEnvironmentError(error, action);

      case "AUTHENTICATION_ERROR":
        return this.analyzeAuthenticationError(error, action, step);

      case "TIMEOUT":
        return this.analyzeTimeout(error, action, step);

      case "DEPENDENCY_ERROR":
        return this.analyzeDependencyError(error, action);

      case "RUNTIME_ERROR":
        return this.analyzeRuntimeError(error, action);

      case "VALIDATION_FAILURE":
        return this.analyzeValidationFailure(error, action, step);

      case "CONFIGURATION_ERROR":
        return this.analyzeConfigurationError(error, action);

      default:
        return this.createAnalysis(
          category,
          error,
          [],
          "Review error details and check logs"
        );
    }
  }

  private analyzeIncompleteImplementation(error: string, action: any) {
    const filePath = this.extractFilePath(error, action);
    return this.createAnalysis(
      "INCOMPLETE_IMPLEMENTATION",
      this.extractReason(error) || "Required implementation doesn't exist",
      [filePath].filter(Boolean) as string[],
      "Create the missing file/implementation following TDD approach"
    );
  }

  private analyzeCompilationError(error: string, action: any) {
    const errors = this.extractCompilationErrors(error);
    return this.createAnalysis(
      "COMPILATION_ERROR",
      "TypeScript/JavaScript compilation failed",
      errors,
      "Fix compilation errors before running tests"
    );
  }

  private analyzeEnvironmentError(error: string, action: any) {
    const service = this.extractServiceName(error);
    return this.createAnalysis(
      "ENVIRONMENT_ERROR",
      this.extractReason(error) || "Environment service unavailable",
      [service].filter(Boolean) as string[],
      "Start required services or check environment configuration"
    );
  }

  private analyzeAuthenticationError(
    error: string,
    action: any,
    step: ExecutionStep
  ) {
    return this.createAnalysis(
      "AUTHENTICATION_ERROR",
      `Authentication failed: ${
        this.extractReason(error) || "Invalid credentials"
      }`,
      ["Check authentication token or credentials"],
      "Ensure AUTH_TOKEN or credentials are set correctly"
    );
  }

  private analyzeTimeout(error: string, action: any, step: ExecutionStep) {
    const url =
      action.parameters?.url ||
      action.parameters?.command ||
      "Unknown operation";
    return this.createAnalysis(
      "TIMEOUT",
      "Operation exceeded timeout threshold",
      [url],
      "Check operation performance or increase timeout threshold"
    );
  }

  private analyzeDependencyError(error: string, action: any) {
    const packages = this.extractPackageNames(error);
    return this.createAnalysis(
      "DEPENDENCY_ERROR",
      "Package installation or dependency resolution failed",
      packages,
      "Update package.json or check npm registry availability"
    );
  }

  private analyzeRuntimeError(error: string, action: any) {
    const location = this.extractStackLocation(error);
    return this.createAnalysis(
      "RUNTIME_ERROR",
      this.extractReason(error) || "Uncaught exception during execution",
      [location].filter(Boolean) as string[],
      "Add error handling or fix the runtime exception"
    );
  }

  private analyzeValidationFailure(
    error: string,
    action: any,
    step: ExecutionStep
  ) {
    const validations = this.extractValidationErrors(error, step);
    return this.createAnalysis(
      "VALIDATION_FAILURE",
      "Test validation or assertion failed",
      validations,
      "Update implementation to match expected behavior/schema"
    );
  }

  private analyzeConfigurationError(error: string, action: any) {
    const configFile = this.extractConfigFile(error, action);
    return this.createAnalysis(
      "CONFIGURATION_ERROR",
      this.extractReason(error) || "Invalid or missing configuration",
      [configFile].filter(Boolean) as string[],
      "Fix configuration file syntax or add missing settings"
    );
  }

  /**
   * Helper: Create analysis object
   */
  private createAnalysis(
    category: string,
    reason: string,
    blockedBy: string[],
    suggestedAction: string
  ): {
    category: string;
    reason: string;
    blockedBy: string[];
    suggestedAction: string;
  } {
    return {
      category,
      reason,
      blockedBy: Array.isArray(blockedBy) ? blockedBy : [blockedBy],
      suggestedAction,
    };
  }

  /**
   * Extract helpers
   */
  private extractFilePath(error: string, action: any): string | null {
    // Try to extract from error message
    const fileMatch =
      error.match(/File not found: (.+)$/i) || error.match(/ENOENT: (.+)$/i);
    if (fileMatch) return fileMatch[1].trim();

    // Try from action parameters
    if (action.parameters?.filePath) return action.parameters.filePath;

    return null;
  }

  private extractReason(error: string): string {
    // Get first line of error (usually most descriptive)
    const firstLine = error.split("\n")[0];
    return firstLine.trim();
  }

  private extractCompilationErrors(error: string): string[] {
    // Extract TS error lines
    const lines = error.split("\n");
    return lines
      .filter((line) => /\.ts:\d+/.test(line) || /TS\d+:/.test(line))
      .slice(0, 3) // Max 3 errors
      .map((line) => line.trim());
  }

  private extractServiceName(error: string): string {
    const matches =
      error.match(/(\w+)\s+not running/i) ||
      error.match(/connect.*:(\d+)/i) ||
      error.match(/ECONNREFUSED.*\/\/([^:]+)/i);
    return matches ? matches[1] : "Required service";
  }

  private extractPackageNames(error: string): string[] {
    const packageMatch = error.match(/@[\w-]+\/[\w-]+|[\w-]+@[\d.]+/g);
    return packageMatch || ["npm dependencies"];
  }

  private extractStackLocation(error: string): string | null {
    const stackMatch = error.match(/at .+ \((.+:\d+:\d+)\)/);
    return stackMatch ? stackMatch[1] : null;
  }

  private extractValidationErrors(
    error: string,
    step: ExecutionStep
  ): string[] {
    const errors: string[] = [];

    // Extract from error message
    if (error.includes("Expected") && error.includes("but got")) {
      errors.push(error.split("\n")[0]);
    }

    // Extract from HTTP response
    if (step.data?.status >= 400) {
      errors.push(
        `HTTP ${step.data.status}: ${
          step.data.statusText || "Validation failed"
        }`
      );
    }

    return errors.length > 0 ? errors : ["Validation criteria not met"];
  }

  private extractConfigFile(error: string, action: any): string {
    const fileMatch = error.match(/([\w.]+\.json|[\w.]+\.yaml|[\w.]+\.yml)/i);
    if (fileMatch) return fileMatch[1];

    if (action.parameters?.filePath) return action.parameters.filePath;

    return "configuration file";
  }

  private extractErrorType(error: string): string {
    const typeMatch = error.match(/^(\w+Error|ENOENT|ECONNREFUSED|ETIMEDOUT):/);
    return typeMatch ? typeMatch[1] : "Error";
  }
}

export default PatternBasedAnalyzer;
