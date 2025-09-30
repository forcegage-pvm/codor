/**
 * Reporter Plugin Interface
 *
 * Defines the contract for plugins that generate reports from test execution results.
 * Reporters can output in various formats (JSON, HTML, XML, etc.).
 */

export interface ExecutionResults {
  startTime: Date;
  endTime?: Date;
  durationMs?: number;
  tasks: { [taskId: string]: any };
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
}

export interface IReporter {
  /**
   * Plugin identifier (must be unique)
   */
  readonly name: string;

  /**
   * Output format (e.g., "json", "html", "xml", "markdown")
   */
  readonly format: string;

  /**
   * Generate report from execution results
   *
   * @param results - Complete test execution results
   * @returns Promise<void> - Reporter handles file I/O or output internally
   */
  generate(results: ExecutionResults): Promise<void>;
}
