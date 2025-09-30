/**
 * Base Failure Analyzer Class
 *
 * Abstract base class that implements IFailureAnalyzer interface.
 * Provides common functionality and helper methods for failure analyzer plugins.
 */

import {
  FailureAnalysisResult,
  IFailureAnalyzer,
} from "../interfaces/IFailureAnalyzer";

export abstract class BaseFailureAnalyzer implements IFailureAnalyzer {
  abstract readonly name: string;
  abstract readonly priority: number;

  /**
   * Analyze a failed test and return categorization
   */
  abstract analyze(
    steps: any[],
    failureReason: string,
    taskSpec: any
  ): Promise<FailureAnalysisResult | null>;

  /**
   * Helper method to create a failure analysis result
   */
  protected createResult(
    category: string,
    reason: string,
    suggestedAction: string,
    evidence: any,
    blockedBy?: string[],
    confidence?: number
  ): FailureAnalysisResult {
    return {
      analyzer: this.name,
      category,
      reason,
      suggestedAction,
      detectedAt: new Date().toISOString(),
      evidence,
      blockedBy,
      confidence,
    };
  }

  /**
   * Helper method to find failed actions in steps
   */
  protected findFailedActions(steps: any[]): any[] {
    return steps.filter((step) => !step.success);
  }

  /**
   * Helper method to check if error message matches patterns
   */
  protected matchesPattern(error: string, patterns: RegExp[]): boolean {
    return patterns.some((pattern) => pattern.test(error));
  }
}
