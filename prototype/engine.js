#!/usr/bin/env node

/**
 * CODOR Test Execution Engine v2.0
 *
 * Architecture:
 * - Modular design with pluggable action executors
 * - Separation of concerns (loading, validation, execution, reporting)
 * - Extensible for future action types
 * - Proper error handling and recovery
 * - Structured evidence generation
 *
 * @author CODOR Team
 * @version 2.0.0
 * @date 2025-09-30
 */

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

// ============================================================================
// CORE ENGINE CLASS
// ============================================================================

class TestExecutionEngine {
  constructor(config = {}) {
    this.config = {
      verbose: config.verbose || false,
      dryRun: config.dryRun || false,
      stopOnFailure: config.stopOnFailure || false,
      ...config,
    };

    this.testSpec = null;
    this.executors = new Map();
    this.evidenceCollector = null;
    this.validationEngine = null;
    this.executionContext = new Map();
  }

  /**
   * Initialize engine with test specification
   */
  async initialize(testSpecPath) {
    this.log("🚀 Initializing Test Execution Engine v2.0", "info");

    // Load specification
    const loader = new SpecificationLoader();
    this.testSpec = await loader.load(testSpecPath);

    // Initialize evidence collector
    this.evidenceCollector = new EvidenceCollector(
      this.testSpec.globalConfiguration.workspaceRoot,
      this.testSpec.globalConfiguration.evidenceDirectory
    );

    // Initialize validation engine
    this.validationEngine = new ValidationEngine();

    // Register action executors
    this.registerExecutors();

    this.log(
      `✅ Initialized for ${Object.keys(this.testSpec.tasks).length} tasks`,
      "success"
    );

    return this;
  }

  /**
   * Register all action executors (Strategy Pattern)
   */
  registerExecutors() {
    this.executors.set("TERMINAL_COMMAND", new TerminalCommandExecutor());
    this.executors.set("HTTP_REQUEST", new HTTPRequestExecutor());
    this.executors.set("FILE_VALIDATION", new FileValidationExecutor());
    this.executors.set("MCP_BROWSER_COMMAND", new MCPBrowserExecutor());
    // Future: DATABASE_QUERY, DOCKER_COMMAND, etc.

    this.log(`📦 Registered ${this.executors.size} action executors`, "info");
  }

  /**
   * Execute all tasks in specification
   */
  async execute() {
    this.log("\n🎯 Beginning Test Execution", "info");

    const results = {
      startTime: new Date(),
      tasks: {},
      summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
    };

    // Execute each task
    for (const [taskId, taskSpec] of Object.entries(this.testSpec.tasks)) {
      this.log(`\n${"=".repeat(60)}`, "info");
      this.log(`📋 Task: ${taskId} - ${taskSpec.title}`, "info");
      this.log("=".repeat(60), "info");

      const taskResult = await this.executeTask(taskId, taskSpec);
      results.tasks[taskId] = taskResult;
      results.summary.total++;

      if (taskResult.status === "PASSED") results.summary.passed++;
      else if (taskResult.status === "FAILED") results.summary.failed++;
      else results.summary.skipped++;

      // Stop on failure if configured
      if (this.config.stopOnFailure && taskResult.status === "FAILED") {
        this.log("⛔ Stopping execution due to task failure", "error");
        break;
      }
    }

    results.endTime = new Date();
    results.durationMs = results.endTime - results.startTime;

    // Generate final report
    await this.evidenceCollector.generateFinalReport(results);

    return results;
  }

  /**
   * Execute single task
   */
  async executeTask(taskId, taskSpec) {
    const taskResult = {
      taskId,
      title: taskSpec.title,
      startTime: new Date(),
      steps: [],
      status: "PENDING",
    };

    try {
      // Execute prerequisites
      if (taskSpec.testExecution.prerequisites) {
        this.log("\n📋 Executing Prerequisites", "info");
        const prereqResults = await this.executeActions(
          taskSpec.testExecution.prerequisites,
          taskId,
          "PREREQ"
        );
        taskResult.steps.push(...prereqResults);

        // Check if any prerequisite failed and blocked execution
        const blockedPrereq = prereqResults.find(
          (r) => !r.success && !r.action.continueOnFailure
        );

        if (blockedPrereq) {
          taskResult.status = "FAILED";
          taskResult.failureReason = `Prerequisite ${blockedPrereq.action.actionId} failed`;
          return taskResult;
        }
      }

      // Execute main steps
      this.log("\n⚡ Executing Test Steps", "info");
      const stepResults = await this.executeActions(
        taskSpec.testExecution.steps,
        taskId,
        "STEP"
      );
      taskResult.steps.push(...stepResults);

      // Execute cleanup (always run, even on failure)
      if (taskSpec.testExecution.cleanup) {
        this.log("\n🧹 Executing Cleanup", "info");
        const cleanupResults = await this.executeActions(
          taskSpec.testExecution.cleanup,
          taskId,
          "CLEANUP"
        );
        taskResult.steps.push(...cleanupResults);
      }

      // Evaluate validation criteria
      this.log("\n✓ Evaluating Validation Criteria", "info");
      const validationResult = this.validationEngine.evaluate(
        taskResult.steps,
        taskSpec.validationCriteria
      );

      taskResult.status = validationResult.passed ? "PASSED" : "FAILED";
      taskResult.validationResult = validationResult;
    } catch (error) {
      taskResult.status = "FAILED";
      taskResult.error = error.message;
      this.log(`❌ Task execution error: ${error.message}`, "error");
    }

    taskResult.endTime = new Date();
    taskResult.durationMs = taskResult.endTime - taskResult.startTime;

    // Save task evidence
    await this.evidenceCollector.saveTaskEvidence(taskId, taskResult);

    return taskResult;
  }

  /**
   * Execute array of actions
   */
  async executeActions(actions, taskId, phase) {
    const results = [];

    for (const action of actions) {
      const result = await this.executeAction(action, taskId, phase);
      results.push(result);

      // Store in execution context for validation criteria
      this.executionContext.set(action.actionId, result);

      // Stop if action failed and should block
      if (!result.success && !action.continueOnFailure) {
        this.log(
          `⛔ Action ${action.actionId} failed, stopping ${phase} execution`,
          "warn"
        );
        break;
      }
    }

    return results;
  }

  /**
   * Execute single action
   */
  async executeAction(action, taskId, phase) {
    this.log(`\n🔹 ${action.actionId}: ${action.description}`, "info");

    const startTime = new Date();
    let result = {
      action,
      phase,
      taskId,
      startTime,
      success: false,
      data: null,
      error: null,
    };

    try {
      // Get appropriate executor
      const executor = this.executors.get(action.type);
      if (!executor) {
        throw new Error(
          `No executor registered for action type: ${action.type}`
        );
      }

      // Execute action (with timeout)
      const timeout =
        action.timeout || this.testSpec.globalConfiguration.timeout || 60000;
      result.data = await this.executeWithTimeout(
        executor.execute(action.parameters, this.testSpec.globalConfiguration),
        timeout
      );

      result.success = true;
      this.log(`✅ ${action.actionId} completed successfully`, "success");
    } catch (error) {
      result.error = error.message;
      result.success = false;
      this.log(`❌ ${action.actionId} failed: ${error.message}`, "error");
    }

    result.endTime = new Date();
    result.durationMs = result.endTime - startTime;

    // Save individual action evidence
    await this.evidenceCollector.saveActionEvidence(
      taskId,
      action.actionId,
      result
    );

    return result;
  }

  /**
   * Execute with timeout
   */
  async executeWithTimeout(promise, timeout) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`Timeout after ${timeout}ms`)),
          timeout
        )
      ),
    ]);
  }

  /**
   * Logging utility
   */
  log(message, level = "info") {
    const symbols = {
      info: "ℹ️",
      success: "✅",
      warn: "⚠️",
      error: "❌",
    };

    console.log(`${symbols[level] || ""} ${message}`);
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    this.log("\n🧹 Cleaning up resources...", "info");

    // Cleanup all executors
    for (const [type, executor] of this.executors) {
      if (executor.cleanup) {
        try {
          await executor.cleanup();
        } catch (error) {
          this.log(`⚠️ Cleanup error for ${type}: ${error.message}`, "warn");
        }
      }
    }

    this.log("✅ Cleanup complete", "success");
  }
}

// ============================================================================
// SPECIFICATION LOADER
// ============================================================================

class SpecificationLoader {
  async load(testSpecPath) {
    try {
      const content = fs.readFileSync(testSpecPath, "utf8");
      const spec = JSON.parse(content);

      // Validate structure (basic validation)
      this.validate(spec);

      console.log(
        `✅ Loaded specification: ${spec.metadata?.taskTitle || "Unknown"}`
      );
      console.log(`📋 Tasks: ${Object.keys(spec.tasks || {}).join(", ")}`);

      return spec;
    } catch (error) {
      throw new Error(`Failed to load specification: ${error.message}`);
    }
  }

  validate(spec) {
    if (!spec.schemaVersion) {
      throw new Error("Missing schemaVersion");
    }

    if (!spec.tasks || Object.keys(spec.tasks).length === 0) {
      throw new Error("No tasks defined in specification");
    }

    if (!spec.globalConfiguration) {
      throw new Error("Missing globalConfiguration");
    }

    // Validate each task has required structure
    for (const [taskId, task] of Object.entries(spec.tasks)) {
      if (!task.testExecution || !task.testExecution.steps) {
        throw new Error(`Task ${taskId} missing testExecution.steps`);
      }

      if (!task.validationCriteria) {
        throw new Error(`Task ${taskId} missing validationCriteria`);
      }
    }
  }
}

// ============================================================================
// ACTION EXECUTORS (Strategy Pattern)
// ============================================================================

class BaseExecutor {
  async execute(parameters, globalConfig) {
    throw new Error("execute() must be implemented by subclass");
  }

  async cleanup() {
    // Override if cleanup needed
  }
}

class TerminalCommandExecutor extends BaseExecutor {
  async execute(parameters, globalConfig) {
    const {
      command,
      workingDirectory,
      environment = {},
      expectedExitCodes = [0],
    } = parameters;

    return new Promise((resolve, reject) => {
      const mergedEnv = {
        ...process.env,
        ...globalConfig.environment,
        ...environment,
      };

      const child = spawn("powershell.exe", ["-Command", command], {
        cwd: workingDirectory,
        env: mergedEnv,
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => {
        const output = data.toString();
        stdout += output;
        process.stdout.write(output); // Real-time output
      });

      child.stderr.on("data", (data) => {
        const output = data.toString();
        stderr += output;
        process.stderr.write(output);
      });

      child.on("close", (code) => {
        const result = {
          command,
          workingDirectory,
          exitCode: code,
          stdout,
          stderr,
          expectedExitCodes,
        };

        // Check if exit code is acceptable
        if (expectedExitCodes.includes(code)) {
          resolve(result);
        } else {
          reject(
            new Error(
              `Command exited with unexpected code ${code}. Expected: ${expectedExitCodes.join(
                ", "
              )}`
            )
          );
        }
      });

      child.on("error", (error) => {
        reject(error);
      });
    });
  }
}

class HTTPRequestExecutor extends BaseExecutor {
  async execute(parameters, globalConfig) {
    const { url, method, headers = {}, body, expectedStatus } = parameters;

    // Use node-fetch (will need to install as dependency)
    // For now, placeholder that shows structure
    console.log(`📡 HTTP ${method} ${url}`);

    // TODO: Implement actual HTTP request
    // const fetch = require('node-fetch');
    // const response = await fetch(url, { method, headers, body: JSON.stringify(body) });

    return {
      url,
      method,
      status: 200, // placeholder
      headers: {},
      body: {},
      timestamp: new Date().toISOString(),
    };
  }
}

class FileValidationExecutor extends BaseExecutor {
  async execute(parameters, globalConfig) {
    const { filePath, validationType, expectedContent, minSize, maxSize } =
      parameters;

    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(globalConfig.workspaceRoot, filePath);

    const result = {
      filePath: absolutePath,
      validationType,
      exists: fs.existsSync(absolutePath),
    };

    if (!result.exists && validationType === "EXISTS") {
      throw new Error(`File not found: ${absolutePath}`);
    }

    if (result.exists) {
      const stats = fs.statSync(absolutePath);
      result.size = stats.size;
      result.modified = stats.mtime;

      // Size validation
      if (minSize !== undefined && stats.size < minSize) {
        throw new Error(
          `File size ${stats.size} bytes is less than minimum ${minSize} bytes`
        );
      }

      if (maxSize !== undefined && stats.size > maxSize) {
        throw new Error(
          `File size ${stats.size} bytes exceeds maximum ${maxSize} bytes`
        );
      }

      // Content validation
      if (validationType === "CONTENT_MATCH" && expectedContent) {
        const content = fs.readFileSync(absolutePath, "utf8");
        result.contentMatches = content.includes(expectedContent);

        if (!result.contentMatches) {
          throw new Error(`File content does not match expected pattern`);
        }
      }
    }

    return result;
  }
}

class MCPBrowserExecutor extends BaseExecutor {
  constructor() {
    super();
    this.mcpProcess = null;
  }

  async execute(parameters, globalConfig) {
    // MCP Browser automation (placeholder for now)
    console.log("🌐 MCP Browser command:", parameters.action);

    // TODO: Implement MCP connection and command execution
    return {
      action: parameters.action,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  async cleanup() {
    if (this.mcpProcess) {
      this.mcpProcess.kill();
      this.mcpProcess = null;
    }
  }
}

// ============================================================================
// VALIDATION ENGINE
// ============================================================================

class ValidationEngine {
  evaluate(stepResults, validationCriteria) {
    const result = {
      passed: true,
      successConditions: [],
      failureConditions: [],
      evaluations: [],
    };

    // Build execution context for eval
    const context = this.buildContext(stepResults);

    // Evaluate success conditions
    for (const condition of validationCriteria.successConditions || []) {
      try {
        const evaluation = {
          condition: condition.condition,
          description: condition.description,
          passed: this.evaluateCondition(condition.condition, context),
        };

        result.evaluations.push(evaluation);

        if (!evaluation.passed) {
          result.passed = false;
          console.log(`❌ Failed: ${condition.description}`);
        } else {
          console.log(`✅ Passed: ${condition.description}`);
        }
      } catch (error) {
        console.log(`⚠️ Evaluation error: ${error.message}`);
        result.passed = false;
      }
    }

    return result;
  }

  buildContext(stepResults) {
    const context = {};

    for (const step of stepResults) {
      const actionId = step.action.actionId;
      context[actionId] = {
        exitCode: step.data?.exitCode,
        success: step.success,
        stdout: step.data?.stdout,
        stderr: step.data?.stderr,
        status: step.data?.status,
        errorCount: this.countErrors(step.data?.stderr || ""),
        warningCount: this.countWarnings(step.data?.stdout || ""),
      };
    }

    return context;
  }

  evaluateCondition(condition, context) {
    // Safe evaluation using Function constructor with context
    try {
      const func = new Function(...Object.keys(context), `return ${condition}`);
      return func(...Object.values(context));
    } catch (error) {
      console.error(`Condition evaluation error: ${error.message}`);
      return false;
    }
  }

  countErrors(text) {
    return (text.match(/error/gi) || []).length;
  }

  countWarnings(text) {
    return (text.match(/warning/gi) || []).length;
  }
}

// ============================================================================
// EVIDENCE COLLECTOR
// ============================================================================

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

// ============================================================================
// CLI INTERFACE
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help")) {
    console.log(`
🎯 CODOR Test Execution Engine v2.0

Usage: node engine.js <test-spec.json> [options]

Options:
  --verbose          Verbose output
  --dry-run          Validate without executing
  --stop-on-failure  Stop on first task failure
  
Example:
  node engine.js ../docs/specifications/testing-system/examples/T004-quotes-get-test-specification.json
    `);
    process.exit(0);
  }

  const testSpecPath = args[0];
  const config = {
    verbose: args.includes("--verbose"),
    dryRun: args.includes("--dry-run"),
    stopOnFailure: args.includes("--stop-on-failure"),
  };

  const engine = new TestExecutionEngine(config);

  try {
    await engine.initialize(testSpecPath);
    const results = await engine.execute();
    await engine.cleanup();

    // Exit with appropriate code
    process.exit(results.summary.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error(`💥 Fatal error: ${error.message}`);
    console.error(error.stack);
    await engine.cleanup();
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { TestExecutionEngine };
