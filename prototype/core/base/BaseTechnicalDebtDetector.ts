/**
 * Base Technical Debt Detector Class
 *
 * Abstract base class that implements ITechnicalDebtDetector interface.
 * Provides common functionality and helper methods for technical debt detector plugins.
 */

import {
  ITechnicalDebtDetector,
  TechnicalDebtItem,
} from "../interfaces/ITechnicalDebtDetector";

export abstract class BaseTechnicalDebtDetector
  implements ITechnicalDebtDetector
{
  abstract readonly name: string;
  abstract readonly priority: number;

  /**
   * Analyze a passing test for technical debt
   */
  abstract analyze(steps: any[], taskSpec: any): Promise<TechnicalDebtItem[]>;

  /**
   * Helper method to create a technical debt item
   */
  protected createDebtItem(
    category: string,
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    description: string,
    recommendation: string,
    evidence: any,
    effort?: "TRIVIAL" | "EASY" | "MEDIUM" | "HARD" | "VERY_HARD"
  ): TechnicalDebtItem {
    return {
      detector: this.name,
      category,
      severity,
      description,
      recommendation,
      detectedAt: new Date().toISOString(),
      evidence,
      effort,
    };
  }

  /**
   * Helper method to calculate total duration from steps
   */
  protected calculateTotalDuration(steps: any[]): number {
    return steps.reduce((total, step) => total + (step.durationMs || 0), 0);
  }

  /**
   * Helper method to find slow actions
   */
  protected findSlowActions(steps: any[], thresholdMs: number): any[] {
    return steps.filter((step) => (step.durationMs || 0) > thresholdMs);
  }
}
