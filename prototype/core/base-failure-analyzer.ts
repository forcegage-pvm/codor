/**
 * Base interface and abstract class for failure analyzers.
 * All failure analyzer plugins MUST extend this class.
 */

export interface FailureAnalysisResult {
  analyzer: string;
  category: string;
  reason: string;
  blockedBy?: string[];
  suggestedAction: string;
  detectedAt: string;
  evidence: {
    actionId: string;
    actionType: string;
    error?: string;
    [key: string]: any;
  };
}

export interface FailureAnalyzerConfig {
  [key: string]: any;
}

/**
 * Abstract base class for failure analyzers.
 * Provides common functionality and enforces interface contract.
 */
export abstract class BaseFailureAnalyzer {
  public readonly name: string;
  protected config: FailureAnalyzerConfig;

  constructor(name: string, config: FailureAnalyzerConfig = {}) {
    this.name = name;
    this.config = config;
  }

  /**
   * Analyze failed test execution to categorize failure.
   *
   * @param steps - Array of executed test steps
   * @param failureReason - Reason string from the executor
   * @param taskSpec - Original task specification
   * @returns Analysis result object or null if no pattern matches
   */
  abstract analyze(
    steps: any[],
    failureReason: string,
    taskSpec: any
  ): Promise<FailureAnalysisResult | null>;

  /**
   * Optional cleanup method called after analysis.
   * Override if your analyzer needs cleanup.
   */
  async cleanup(): Promise<void> {
    // Default: no cleanup needed
  }

  /**
   * Helper method to create standardized analysis result.
   */
  protected createResult(
    category: string,
    reason: string,
    suggestedAction: string,
    evidence: any,
    blockedBy?: string[]
  ): FailureAnalysisResult {
    return {
      analyzer: this.name,
      category,
      reason,
      blockedBy,
      suggestedAction,
      detectedAt: new Date().toISOString(),
      evidence,
    };
  }
}
