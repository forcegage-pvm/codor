/**
 * Failure Analyzer Plugin Interface
 *
 * Defines the contract for plugins that analyze test failures and categorize them.
 * Analyzers help determine WHY a test failed (e.g., TIMEOUT, MISSING_DEPENDENCY, CONFIGURATION_ERROR).
 *
 * Multiple analyzers can analyze the same failure, each providing different insights.
 * Higher priority analyzers run first.
 */

export interface FailureAnalysisResult {
  /**
   * Name of the analyzer that produced this result
   */
  analyzer: string;

  /**
   * Failure category (e.g., "TIMEOUT", "MISSING_DEPENDENCY", "CONFIGURATION_ERROR")
   */
  category: string;

  /**
   * Human-readable reason for the failure
   */
  reason: string;

  /**
   * Task IDs that are blocking this task (if applicable)
   */
  blockedBy?: string[];

  /**
   * Recommended action to fix the failure
   */
  suggestedAction: string;

  /**
   * When this failure was detected (ISO 8601)
   */
  detectedAt: string;

  /**
   * Evidence supporting this analysis
   */
  evidence: {
    actionId?: string;
    actionType?: string;
    error?: string;
    [key: string]: any;
  };

  /**
   * Confidence level (0-1) that this analysis is correct
   */
  confidence?: number;
}

export interface IFailureAnalyzer {
  /**
   * Plugin identifier (must be unique)
   */
  readonly name: string;

  /**
   * Execution priority (higher = runs first)
   * Use for ordering when multiple analyzers apply
   */
  readonly priority: number;

  /**
   * Analyze a failed test and return categorization
   *
   * @param steps - Array of executed action results
   * @param failureReason - The error message or failure reason
   * @param taskSpec - The task specification
   * @returns FailureAnalysisResult if this analyzer can categorize the failure, null otherwise
   */
  analyze(
    steps: any[],
    failureReason: string,
    taskSpec: any
  ): Promise<FailureAnalysisResult | null>;
}
