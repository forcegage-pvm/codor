/**
 * Evidence Collector
 *
 * Generates structured evidence files for unfakeable test results
 */

const fs = require("fs");
const path = require("path");

class EvidenceCollector {
  constructor(workspaceRoot, evidenceDir) {
    this.workspaceRoot = workspaceRoot;
    this.evidenceBaseDir = path.join(workspaceRoot, evidenceDir);
    this.ensureDirectory(this.evidenceBaseDir);
  }

  ensureDirectory(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  }

  async saveActionEvidence(taskId, actionId, result) {
    const taskDir = path.join(this.evidenceBaseDir, taskId);
    this.ensureDirectory(taskDir);

    const evidenceFile = path.join(
      taskDir,
      `${actionId.replace(/\./g, "-")}.json`
    );

    const evidence = {
      actionId,
      taskId,
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

  async saveTaskEvidence(taskId, taskResult) {
    const taskDir = path.join(this.evidenceBaseDir, taskId);
    this.ensureDirectory(taskDir);

    const summaryFile = path.join(taskDir, "task-summary.json");
    fs.writeFileSync(summaryFile, JSON.stringify(taskResult, null, 2));
    console.log(`📊 Saved task summary: ${summaryFile}`);
  }

  async generateFinalReport(results) {
    const reportFile = path.join(this.evidenceBaseDir, "execution-report.json");

    const report = {
      ...results,
      metadata: {
        generatedBy: "CODOR Test Execution Engine v2.0",
        generatedAt: new Date().toISOString(),
        platform: process.platform,
        nodeVersion: process.version,
      },
    };

    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📊 Final report: ${reportFile}`);
    console.log(
      `✅ Passed: ${results.summary.passed}/${results.summary.total}`
    );
    console.log(
      `❌ Failed: ${results.summary.failed}/${results.summary.total}`
    );
  }
}

module.exports = EvidenceCollector;
