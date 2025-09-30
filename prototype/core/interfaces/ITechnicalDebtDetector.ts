/**
 * Technical Debt Detector Plugin Interface
 *
 * Defines the contract for plugins that detect technical debt in PASSING tests.
 * Detectors identify quality issues, performance problems, or maintenance concerns.
 *
 * Multiple detectors can analyze the same test results, each focusing on different aspects.
 * Higher priority detectors run first.
 */

export interface TechnicalDebtItem {
  /**
   * Name of the detector that found this debt
   */
  detector: string;

  /**
   * Debt category (e.g., "PERFORMANCE", "COMPLEXITY", "MAINTAINABILITY")
   */
  category: string;

  /**
   * Severity level
   */
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

  /**
   * Description of the technical debt
   */
  description: string;

  /**
   * Recommended remediation action
   */
  recommendation: string;

  /**
   * When this debt was detected (ISO 8601)
   */
  detectedAt: string;

  /**
   * Evidence supporting this detection
   */
  evidence: {
    metric?: string;
    threshold?: number;
    actual?: number;
    [key: string]: any;
  };

  /**
   * Estimated effort to fix (optional)
   */
  effort?: "TRIVIAL" | "EASY" | "MEDIUM" | "HARD" | "VERY_HARD";
}

export interface ITechnicalDebtDetector {
  /**
   * Plugin identifier (must be unique)
   */
  readonly name: string;

  /**
   * Execution priority (higher = runs first)
   */
  readonly priority: number;

  /**
   * Analyze a passing test for technical debt
   *
   * @param steps - Array of executed action results
   * @param taskSpec - The task specification
   * @returns Array of detected technical debt items (empty if none found)
   */
  analyze(steps: any[], taskSpec: any): Promise<TechnicalDebtItem[]>;
}
