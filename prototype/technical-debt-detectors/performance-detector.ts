/**
 * Performance-Based Technical Debt Detector Plugin
 * Analyzes PASSED tests for quality, performance, and implementation issues
 */

import {
  BaseTechnicalDebtDetector,
  TechnicalDebtDetectorConfig,
  TechnicalDebtItem,
} from "../core/base-technical-debt-detector";

interface PerformanceThresholds {
  httpRequest: number;
  dbQuery: number;
  memoryUsage: number;
}

interface PerformanceDetectorConfig extends TechnicalDebtDetectorConfig {
  performanceThresholds?: Partial<PerformanceThresholds>;
}

interface ExecutionStep {
  success: boolean;
  action?: any;
  data?: any;
  durationMs?: number;
}

export class PerformanceDetector extends BaseTechnicalDebtDetector {
  private thresholds: PerformanceThresholds;

  constructor(config: PerformanceDetectorConfig = {}) {
    super("performance-detector", config);

    this.thresholds = {
      httpRequest: 1000, // ms
      dbQuery: 500, // ms
      memoryUsage: 100 * 1024 * 1024, // 100MB
      ...config.performanceThresholds,
    };
  }

  /**
   * Analyze passed task for technical debt
   */
  async analyze(steps: any[], taskSpec: any): Promise<TechnicalDebtItem[]> {
    const debts: TechnicalDebtItem[] = [];

    for (const step of steps as ExecutionStep[]) {
      if (!step.success) continue; // Only analyze successful steps

      // Check performance issues
      debts.push(...this.detectPerformanceIssues(step));

      // Check validation issues
      debts.push(...this.detectValidationIssues(step));

      // Check error handling issues
      debts.push(...this.detectErrorHandlingIssues(step));

      // Check API endpoint issues
      debts.push(...this.detectApiEndpointIssues(step));

      // Check code quality issues
      debts.push(...this.detectCodeQualityIssues(step));

      // Check integration issues
      debts.push(...this.detectIntegrationIssues(step));
    }

    return debts;
  }

  /**
   * Detect performance degradation
   */
  private detectPerformanceIssues(step: ExecutionStep): TechnicalDebtItem[] {
    const issues: TechnicalDebtItem[] = [];
    const action = step.action || {};
    const duration = step.durationMs || 0;

    // HTTP request performance
    if (
      action.type === "HTTP_REQUEST" &&
      duration > this.thresholds.httpRequest
    ) {
      issues.push(
        this.createDebtItem(
          "PERFORMANCE_DEGRADATION",
          this.calculateSeverity(duration, this.thresholds.httpRequest),
          `HTTP request took ${duration}ms, exceeds ${this.thresholds.httpRequest}ms threshold`,
          "Optimize API endpoint, add caching, or implement pagination",
          {
            location: `${action.parameters?.method || "GET"} ${
              action.parameters?.url || "Unknown URL"
            }`,
            metric: "duration",
            threshold: this.thresholds.httpRequest,
            actual: duration,
            relatedSteps: [action.actionId],
          }
        )
      );
    }

    // Terminal command performance (database queries, etc.)
    if (
      action.type === "TERMINAL_COMMAND" &&
      duration > this.thresholds.dbQuery &&
      (action.parameters?.command?.includes("query") ||
        action.parameters?.command?.includes("test"))
    ) {
      issues.push(
        this.createDebtItem(
          "PERFORMANCE_DEGRADATION",
          this.calculateSeverity(duration, this.thresholds.dbQuery),
          `Command execution took ${duration}ms, exceeds ${this.thresholds.dbQuery}ms threshold`,
          "Profile and optimize slow operations, add database indexes",
          {
            location: action.parameters?.command || "Unknown command",
            metric: "duration",
            threshold: this.thresholds.dbQuery,
            actual: duration,
            relatedSteps: [action.actionId],
          }
        )
      );
    }

    return issues;
  }

  /**
   * Detect missing validation
   */
  private detectValidationIssues(step: ExecutionStep): TechnicalDebtItem[] {
    const issues: TechnicalDebtItem[] = [];
    const action = step.action || {};
    const data = step.data || {};

    // HTTP response missing expected validations
    if (
      action.type === "HTTP_REQUEST" &&
      data.status >= 200 &&
      data.status < 300
    ) {
      const body = data.body || {};

      // Check for missing pagination on list endpoints
      if (
        Array.isArray(body) &&
        body.length > 10 &&
        !data.headers?.["x-total-count"]
      ) {
        issues.push(
          this.createDebtItem(
            "API_ENDPOINT_INCOMPLETE",
            "LOW",
            "List endpoint missing pagination metadata",
            "Add pagination support with totalCount, page, limit metadata",
            {
              location: `${action.parameters?.method || "GET"} ${
                action.parameters?.url || "Unknown URL"
              }`,
              relatedSteps: [action.actionId],
            }
          )
        );
      }

      // Check for generic error handling (if error field exists but is generic)
      if (
        body.error &&
        typeof body.error === "string" &&
        body.error.length < 20
      ) {
        issues.push(
          this.createDebtItem(
            "ERROR_HANDLING_INCOMPLETE",
            "MEDIUM",
            "API returns generic error message without details",
            "Add specific error codes and detailed error messages",
            {
              location: `${action.parameters?.method || "GET"} ${
                action.parameters?.url || "Unknown URL"
              }`,
              relatedSteps: [action.actionId],
            }
          )
        );
      }
    }

    return issues;
  }

  /**
   * Detect incomplete error handling
   */
  private detectErrorHandlingIssues(step: ExecutionStep): TechnicalDebtItem[] {
    const issues: TechnicalDebtItem[] = [];
    const action = step.action || {};
    const data = step.data || {};

    // HTTP 500 errors that succeed (shouldn't happen, but if retry logic makes it succeed)
    if (action.type === "HTTP_REQUEST" && data.status >= 500) {
      issues.push(
        this.createDebtItem(
          "ERROR_HANDLING_INCOMPLETE",
          "HIGH",
          "API endpoint returned 500 error (should be 4xx for client errors)",
          "Add proper error handling to return 400-level errors for validation issues",
          {
            location: `${action.parameters?.method || "GET"} ${
              action.parameters?.url || "Unknown URL"
            }`,
            relatedSteps: [action.actionId],
          }
        )
      );
    }

    // Terminal commands with warnings in output
    if (action.type === "TERMINAL_COMMAND" && data.stdout) {
      const warnings = this.extractWarnings(data.stdout);
      if (warnings.length > 0) {
        issues.push(
          this.createDebtItem(
            "CODE_QUALITY",
            "LOW",
            `Command produced ${warnings.length} warning(s)`,
            "Address warnings: " + warnings.slice(0, 2).join("; "),
            {
              location: action.parameters?.command || "Unknown command",
              relatedSteps: [action.actionId],
            }
          )
        );
      }
    }

    return issues;
  }

  /**
   * Detect API endpoint issues
   */
  private detectApiEndpointIssues(step: ExecutionStep): TechnicalDebtItem[] {
    const issues: TechnicalDebtItem[] = [];
    const action = step.action || {};
    const data = step.data || {};

    if (action.type !== "HTTP_REQUEST") return issues;

    // Missing standard headers
    const headers = data.headers || {};
    if (!headers["content-type"]) {
      issues.push(
        this.createDebtItem(
          "API_ENDPOINT_INCOMPLETE",
          "LOW",
          "Response missing Content-Type header",
          "Add Content-Type header to response",
          {
            location: `${action.parameters?.method || "GET"} ${
              action.parameters?.url || "Unknown URL"
            }`,
            relatedSteps: [action.actionId],
          }
        )
      );
    }

    return issues;
  }

  /**
   * Detect code quality issues
   */
  private detectCodeQualityIssues(step: ExecutionStep): TechnicalDebtItem[] {
    const issues: TechnicalDebtItem[] = [];
    const action = step.action || {};
    const data = step.data || {};

    // TypeScript compilation with --noEmit that succeeds but might have used 'any'
    if (
      action.type === "TERMINAL_COMMAND" &&
      action.parameters?.command?.includes("tsc") &&
      data.stdout?.includes("any")
    ) {
      issues.push(
        this.createDebtItem(
          "CODE_QUALITY",
          "LOW",
          "TypeScript code may contain 'any' types",
          "Replace 'any' types with proper interfaces or types",
          {
            location: action.parameters?.command || "tsc",
            relatedSteps: [action.actionId],
          }
        )
      );
    }

    // Test output with .skip or .only
    if (
      action.type === "TERMINAL_COMMAND" &&
      action.parameters?.command?.includes("test") &&
      (data.stdout?.includes(".skip") || data.stdout?.includes(".only"))
    ) {
      issues.push(
        this.createDebtItem(
          "CODE_QUALITY",
          "MEDIUM",
          "Tests using .skip() or .only() detected",
          "Remove .skip() and .only() from tests before committing",
          {
            location: action.parameters?.command || "test",
            relatedSteps: [action.actionId],
          }
        )
      );
    }

    return issues;
  }

  /**
   * Detect integration issues
   */
  private detectIntegrationIssues(step: ExecutionStep): TechnicalDebtItem[] {
    const issues: TechnicalDebtItem[] = [];
    const action = step.action || {};
    const data = step.data || {};

    // Check for mock/stub usage in production tests
    if (
      action.type === "TERMINAL_COMMAND" &&
      action.parameters?.command?.includes("test") &&
      data.stdout &&
      (data.stdout.includes("mock") || data.stdout.includes("stub"))
    ) {
      issues.push(
        this.createDebtItem(
          "INTEGRATION_ISSUE",
          "MEDIUM",
          "Tests may be using mocks instead of real integrations",
          "Replace mocks with real integration tests where appropriate",
          {
            location: action.parameters?.command || "test",
            relatedSteps: [action.actionId],
          }
        )
      );
    }

    return issues;
  }

  /**
   * Calculate severity based on threshold exceedance
   */
  private calculateSeverity(
    actual: number,
    threshold: number
  ): "LOW" | "MEDIUM" | "HIGH" {
    const ratio = actual / threshold;
    if (ratio > 3) return "HIGH";
    if (ratio > 2) return "MEDIUM";
    return "LOW";
  }

  /**
   * Extract warnings from command output
   */
  private extractWarnings(output: string): string[] {
    const warnings: string[] = [];
    const lines = output.split("\n");

    for (const line of lines) {
      if (
        line.toLowerCase().includes("warning") ||
        line.toLowerCase().includes("deprecated")
      ) {
        warnings.push(line.trim().substring(0, 100)); // Max 100 chars per warning
      }
    }

    return warnings;
  }
}

export default PerformanceDetector;
