/**
 * Base Reporter Class
 *
 * Abstract base class that implements IReporter interface.
 * Provides common functionality for reporter plugins.
 */

import { ExecutionResults, IReporter } from "../interfaces/IReporter";

export abstract class BaseReporter implements IReporter {
  abstract readonly name: string;
  abstract readonly format: string;

  /**
   * Generate report from execution results
   */
  abstract generate(results: ExecutionResults): Promise<void>;

  /**
   * Helper method to format date as ISO string
   */
  protected formatDate(date: Date): string {
    return date.toISOString();
  }

  /**
   * Helper method to calculate success rate
   */
  protected calculateSuccessRate(summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  }): number {
    if (summary.total === 0) return 0;
    return (summary.passed / summary.total) * 100;
  }
}
