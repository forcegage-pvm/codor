/**
 * Evidence Collector
 *
 * Generates structured evidence files for unfakeable test results
 */

import * as fs from "fs";
import * as path from "path";

export interface ActionResult {
  phase?: string;
  action: {
    type: string;
    description?: string;
  };
  startTime: string;
  success: boolean;
  durationMs: number;
  data?: any;
  error?: string;
}

export interface TaskResult {
  endTime: string;
  validationResult?: {
    passed: boolean;
    evaluations?: any[];
  };
  [key: string]: any;
}

export interface ExecutionReport {
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
  [key: string]: any;
}

export class EvidenceCollector {
  private workspaceRoot: string;
  private evidenceBaseDir: string;

  constructor(workspaceRoot: string, evidenceDir: string) {
    this.workspaceRoot = workspaceRoot;
    this.evidenceBaseDir = path.join(workspaceRoot, evidenceDir);
    this.ensureDirectory(this.evidenceBaseDir);
  }

  private ensureDirectory(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  }

  async saveActionEvidence(
    taskId: string,
    actionId: string,
    result: ActionResult
  ): Promise<void> {
    const taskDir = path.join(this.evidenceBaseDir, taskId);
    this.ensureDirectory(taskDir);

    // Organize by phase and action type
    const phase = result.phase || "STEP";
    const actionType = result.action.type || "UNKNOWN";

    const phaseDir = path.join(taskDir, `${phase.toLowerCase()}`);
    this.ensureDirectory(phaseDir);

    const typeDir = path.join(phaseDir, actionType.toLowerCase());
    this.ensureDirectory(typeDir);

    const evidenceFile = path.join(
      typeDir,
      `${actionId.replace(/\./g, "-")}.json`
    );

    const evidence = {
      actionId,
      taskId,
      phase,
      actionType,
      timestamp: result.startTime,
      action: {
        type: result.action.type,
        description: result.action.description,
      },
      result: {
        success: result.success,
        durationMs: result.durationMs,
        data: result.data,
        error: result.error,
      },
      metadata: {
        generatedBy: "CODOR Test Execution Engine v2.0",
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid,
      },
    };

    fs.writeFileSync(evidenceFile, JSON.stringify(evidence, null, 2));
  }

  async saveTaskEvidence(
    taskId: string,
    taskResult: TaskResult
  ): Promise<void> {
    const taskDir = path.join(this.evidenceBaseDir, taskId);
    this.ensureDirectory(taskDir);

    // Save summary at task level
    const summaryFile = path.join(taskDir, "task-summary.json");
    fs.writeFileSync(summaryFile, JSON.stringify(taskResult, null, 2));

    // Save validations separately
    if (taskResult.validationResult) {
      const validationsDir = path.join(taskDir, "validations");
      this.ensureDirectory(validationsDir);

      const evaluations = taskResult.validationResult.evaluations || [];

      const validationsFile = path.join(
        validationsDir,
        "validation-results.json"
      );
      const validationsSummary = {
        taskId,
        timestamp: taskResult.endTime,
        overallPassed: taskResult.validationResult.passed,
        total: evaluations.length,
        passed: evaluations.filter((v: any) => v.passed).length,
        failed: evaluations.filter((v: any) => !v.passed).length,
        results: evaluations,
      };
      fs.writeFileSync(
        validationsFile,
        JSON.stringify(validationsSummary, null, 2)
      );
    }

    console.log(`📊 Saved task summary: ${summaryFile}`);
  }

  async generateFinalReport(results: ExecutionReport): Promise<void> {
    // Generate timestamped report to preserve history
    const timestamp = new Date()
      .toISOString()
      .replace(/:/g, "-")
      .replace(/\..+/, "");
    const reportFile = path.join(
      this.evidenceBaseDir,
      `execution-report-${timestamp}.json`
    );

    // Also create/update latest report
    const latestReport = path.join(
      this.evidenceBaseDir,
      "execution-report-latest.json"
    );

    const report = {
      ...results,
      metadata: {
        generatedBy: "CODOR Test Execution Engine v2.0",
        generatedAt: new Date().toISOString(),
        platform: process.platform,
        nodeVersion: process.version,
      },
    };

    // Save timestamped version (never overwritten)
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    // Save latest version (always current)
    fs.writeFileSync(latestReport, JSON.stringify(report, null, 2));

    console.log(`\n📊 Final report: ${reportFile}`);
    console.log(`📊 Latest report: ${latestReport}`);
    console.log(
      `✅ Passed: ${results.summary.passed}/${results.summary.total}`
    );
    console.log(
      `❌ Failed: ${results.summary.failed}/${results.summary.total}`
    );
  }
}

export default EvidenceCollector;
