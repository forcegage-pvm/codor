/**
 * Base interface and abstract class for technical debt detectors.
 * All technical debt detector plugins MUST extend this class.
 */

export interface TechnicalDebtItem {
  detector: string;
  category: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  description: string;
  recommendation: string;
  detectedAt: string;
  evidence: {
    metric?: string;
    threshold?: number;
    actual?: number;
    [key: string]: any;
  };
}

export interface TechnicalDebtDetectorConfig {
  [key: string]: any;
}

/**
 * Abstract base class for technical debt detectors.
 * Provides common functionality and enforces interface contract.
 */
export abstract class BaseTechnicalDebtDetector {
  public readonly name: string;
  protected config: TechnicalDebtDetectorConfig;

  constructor(name: string, config: TechnicalDebtDetectorConfig = {}) {
    this.name = name;
    this.config = config;
  }

  /**
   * Analyze passed test execution to detect technical debt.
   *
   * @param steps - Array of executed test steps
   * @param taskSpec - Original task specification
   * @returns Array of technical debt items (empty array if none found)
   */
  abstract analyze(steps: any[], taskSpec: any): Promise<TechnicalDebtItem[]>;

  /**
   * Optional cleanup method called after analysis.
   * Override if your detector needs cleanup.
   */
  async cleanup(): Promise<void> {
    // Default: no cleanup needed
  }

  /**
   * Helper method to create standardized debt item.
   */
  protected createDebtItem(
    category: string,
    severity: "LOW" | "MEDIUM" | "HIGH",
    description: string,
    recommendation: string,
    evidence: any
  ): TechnicalDebtItem {
    return {
      detector: this.name,
      category,
      severity,
      description,
      recommendation,
      detectedAt: new Date().toISOString(),
      evidence,
    };
  }
}
