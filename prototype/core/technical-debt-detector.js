/**
 * Technical Debt Detector
 * Analyzes PASSED tests for quality, performance, and implementation issues
 */

class TechnicalDebtDetector {
  constructor(config = {}) {
    this.config = {
      performanceThresholds: {
        httpRequest: 1000, // ms
        dbQuery: 500, // ms
        memoryUsage: 100 * 1024 * 1024, // 100MB
      },
      ...config,
    };
  }

  /**
   * Analyze passed task for technical debt
   * @param {Array} steps - Execution steps
   * @param {Object} taskSpec - Task specification
   * @returns {Array} List of technical debt items
   */
  async analyze(steps, taskSpec) {
    const debts = [];

    for (const step of steps) {
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
  detectPerformanceIssues(step) {
    const issues = [];
    const action = step.action || {};
    const duration = step.durationMs || 0;

    // HTTP request performance
    if (action.type === "HTTP_REQUEST" && duration > this.config.performanceThresholds.httpRequest) {
      issues.push({
        category: "PERFORMANCE_DEGRADATION",
        severity: this.calculateSeverity(duration, this.config.performanceThresholds.httpRequest),
        description: `HTTP request took ${duration}ms, exceeds ${this.config.performanceThresholds.httpRequest}ms threshold`,
        location: `${action.parameters?.method || "GET"} ${action.parameters?.url || "Unknown URL"}`,
        suggestedFix: "Optimize API endpoint, add caching, or implement pagination",
        detectedAt: new Date().toISOString(),
        relatedSteps: [action.actionId],
      });
    }

    // Terminal command performance (database queries, etc.)
    if (
      action.type === "TERMINAL_COMMAND" &&
      duration > this.config.performanceThresholds.dbQuery &&
      (action.parameters?.command?.includes("query") || action.parameters?.command?.includes("test"))
    ) {
      issues.push({
        category: "PERFORMANCE_DEGRADATION",
        severity: this.calculateSeverity(duration, this.config.performanceThresholds.dbQuery),
        description: `Command execution took ${duration}ms, exceeds ${this.config.performanceThresholds.dbQuery}ms threshold`,
        location: action.parameters?.command || "Unknown command",
        suggestedFix: "Profile and optimize slow operations, add database indexes",
        detectedAt: new Date().toISOString(),
        relatedSteps: [action.actionId],
      });
    }

    return issues;
  }

  /**
   * Detect missing validation
   */
  detectValidationIssues(step) {
    const issues = [];
    const action = step.action || {};
    const data = step.data || {};

    // HTTP response missing expected validations
    if (action.type === "HTTP_REQUEST" && data.status >= 200 && data.status < 300) {
      const body = data.body || {};

      // Check for missing pagination on list endpoints
      if (Array.isArray(body) && body.length > 10 && !data.headers?.["x-total-count"]) {
        issues.push({
          category: "API_ENDPOINT_INCOMPLETE",
          severity: "LOW",
          description: "List endpoint missing pagination metadata",
          location: `${action.parameters?.method || "GET"} ${action.parameters?.url || "Unknown URL"}`,
          suggestedFix: "Add pagination support with totalCount, page, limit metadata",
          detectedAt: new Date().toISOString(),
          relatedSteps: [action.actionId],
        });
      }

      // Check for generic error handling (if error field exists but is generic)
      if (body.error && typeof body.error === "string" && body.error.length < 20) {
        issues.push({
          category: "ERROR_HANDLING_INCOMPLETE",
          severity: "MEDIUM",
          description: "API returns generic error message without details",
          location: `${action.parameters?.method || "GET"} ${action.parameters?.url || "Unknown URL"}`,
          suggestedFix: "Add specific error codes and detailed error messages",
          detectedAt: new Date().toISOString(),
          relatedSteps: [action.actionId],
        });
      }
    }

    return issues;
  }

  /**
   * Detect incomplete error handling
   */
  detectErrorHandlingIssues(step) {
    const issues = [];
    const action = step.action || {};
    const data = step.data || {};

    // HTTP 500 errors that succeed (shouldn't happen, but if retry logic makes it succeed)
    if (action.type === "HTTP_REQUEST" && data.status >= 500) {
      issues.push({
        category: "ERROR_HANDLING_INCOMPLETE",
        severity: "HIGH",
        description: "API endpoint returned 500 error (should be 4xx for client errors)",
        location: `${action.parameters?.method || "GET"} ${action.parameters?.url || "Unknown URL"}`,
        suggestedFix: "Add proper error handling to return 400-level errors for validation issues",
        detectedAt: new Date().toISOString(),
        relatedSteps: [action.actionId],
      });
    }

    // Terminal commands with warnings in output
    if (action.type === "TERMINAL_COMMAND" && data.stdout) {
      const warnings = this.extractWarnings(data.stdout);
      if (warnings.length > 0) {
        issues.push({
          category: "CODE_QUALITY",
          severity: "LOW",
          description: `Command produced ${warnings.length} warning(s)`,
          location: action.parameters?.command || "Unknown command",
          suggestedFix: "Address warnings: " + warnings.slice(0, 2).join("; "),
          detectedAt: new Date().toISOString(),
          relatedSteps: [action.actionId],
        });
      }
    }

    return issues;
  }

  /**
   * Detect API endpoint issues
   */
  detectApiEndpointIssues(step) {
    const issues = [];
    const action = step.action || {};
    const data = step.data || {};

    if (action.type !== "HTTP_REQUEST") return issues;

    // Missing standard headers
    const headers = data.headers || {};
    if (!headers["content-type"]) {
      issues.push({
        category: "API_ENDPOINT_INCOMPLETE",
        severity: "LOW",
        description: "Response missing Content-Type header",
        location: `${action.parameters?.method || "GET"} ${action.parameters?.url || "Unknown URL"}`,
        suggestedFix: "Add Content-Type header to response",
        detectedAt: new Date().toISOString(),
        relatedSteps: [action.actionId],
      });
    }

    return issues;
  }

  /**
   * Detect code quality issues
   */
  detectCodeQualityIssues(step) {
    const issues = [];
    const action = step.action || {};
    const data = step.data || {};

    // TypeScript compilation with --noEmit that succeeds but might have used 'any'
    if (
      action.type === "TERMINAL_COMMAND" &&
      action.parameters?.command?.includes("tsc") &&
      data.stdout?.includes("any")
    ) {
      issues.push({
        category: "CODE_QUALITY",
        severity: "LOW",
        description: "TypeScript code may contain 'any' types",
        location: action.parameters?.command || "tsc",
        suggestedFix: "Replace 'any' types with proper interfaces or types",
        detectedAt: new Date().toISOString(),
        relatedSteps: [action.actionId],
      });
    }

    // Test output with .skip or .only
    if (
      action.type === "TERMINAL_COMMAND" &&
      action.parameters?.command?.includes("test") &&
      (data.stdout?.includes(".skip") || data.stdout?.includes(".only"))
    ) {
      issues.push({
        category: "CODE_QUALITY",
        severity: "MEDIUM",
        description: "Tests using .skip() or .only() detected",
        location: action.parameters?.command || "test",
        suggestedFix: "Remove .skip() and .only() from tests before committing",
        detectedAt: new Date().toISOString(),
        relatedSteps: [action.actionId],
      });
    }

    return issues;
  }

  /**
   * Detect integration issues
   */
  detectIntegrationIssues(step) {
    const issues = [];
    const action = step.action || {};
    const data = step.data || {};

    // Check for mock/stub usage in production tests
    if (
      action.type === "TERMINAL_COMMAND" &&
      action.parameters?.command?.includes("test") &&
      data.stdout &&
      (data.stdout.includes("mock") || data.stdout.includes("stub"))
    ) {
      issues.push({
        category: "INTEGRATION_ISSUE",
        severity: "MEDIUM",
        description: "Tests may be using mocks instead of real integrations",
        location: action.parameters?.command || "test",
        suggestedFix: "Replace mocks with real integration tests where appropriate",
        detectedAt: new Date().toISOString(),
        relatedSteps: [action.actionId],
      });
    }

    return issues;
  }

  /**
   * Calculate severity based on threshold exceedance
   */
  calculateSeverity(actual, threshold) {
    const ratio = actual / threshold;
    if (ratio > 3) return "HIGH";
    if (ratio > 2) return "MEDIUM";
    return "LOW";
  }

  /**
   * Extract warnings from command output
   */
  extractWarnings(output) {
    const warnings = [];
    const lines = output.split("\n");

    for (const line of lines) {
      if (line.toLowerCase().includes("warning") || line.toLowerCase().includes("deprecated")) {
        warnings.push(line.trim().substring(0, 100)); // Max 100 chars per warning
      }
    }

    return warnings;
  }
}

module.exports = TechnicalDebtDetector;
