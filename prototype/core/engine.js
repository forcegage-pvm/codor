#!/usr/bin/env node

/**
 * CODOR Test Execution Engine v2.0
 *
 * Plugin-based architecture for open-source extensibility
 * - Dynamic loading of executors, validators, reporters from plugin directories
 * - Zero core changes needed for new features
 * - Designed for 1000s of contributors across multiple languages/frameworks
 *
 * @author CODOR Team
 * @version 2.0.0
 * @date 2025-09-30
 */

const fs = require("fs");
const path = require("path");
const { PluginRegistry } = require("./plugin-registry");
const { SpecificationLoader } = require("./specification-loader");
const { EvidenceCollector } = require("./evidence-collector");
const { ValidationEngine } = require("./validation-engine");

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
    this.pluginRegistry = null;
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

    // Initialize plugin registry (auto-discovers all plugins)
    this.pluginRegistry = new PluginRegistry(path.join(__dirname, ".."));
    await this.pluginRegistry.loadAll();

    // Initialize evidence collector
    this.evidenceCollector = new EvidenceCollector(
      this.testSpec.globalConfiguration.workspaceRoot,
      this.testSpec.globalConfiguration.evidenceDirectory
    );

    // Initialize validation engine
    this.validationEngine = new ValidationEngine();

    this.log(
      `✅ Initialized with ${this.pluginRegistry.getExecutorCount()} executors`,
      "success"
    );

    return this;
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

        const blockedPrereq = prereqResults.find(
          (r) => !r.success && !r.action.continueOnFailure
        );

        if (blockedPrereq) {
          taskResult.status = "FAILED";
          taskResult.failureReason = `Prerequisite ${blockedPrereq.action.actionId} failed`;

          // Analyze failure before returning
          taskResult.endTime = new Date();
          taskResult.durationMs = taskResult.endTime - taskResult.startTime;

          this.log("\n🔍 Analyzing Failure", "info");

          // Run ALL failure analyzers and collect results
          const failureAnalyses = [];
          const analyzers = this.pluginRegistry.getFailureAnalyzers();

          for (const analyzer of analyzers) {
            try {
              const result = await analyzer.analyze(
                taskResult.steps,
                taskResult.failureReason,
                taskSpec
              );

              if (result) {
                failureAnalyses.push(result);
              }
            } catch (error) {
              this.log(
                `⚠️  Analyzer ${analyzer.name} failed: ${error.message}`,
                "warn"
              );
            }
          }

          taskResult.failureAnalysis = failureAnalyses;
          taskResult.technicalDebt = null;

          if (failureAnalyses.length > 0) {
            this.log(
              `📊 Failure Categories: ${failureAnalyses
                .map((a) => a.category)
                .join(", ")}`,
              "info"
            );
          }

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

      // Analyze results based on status
      if (taskResult.status === "PASSED") {
        // Detect technical debt in passing tests - run ALL detectors
        this.log("\n🔍 Analyzing for Technical Debt", "info");

        const debts = [];
        const detectors = this.pluginRegistry.getDebtDetectors();

        for (const detector of detectors) {
          try {
            const results = await detector.analyze(taskResult.steps, taskSpec);

            if (results && results.length > 0) {
              debts.push(...results);
            }
          } catch (error) {
            this.log(
              `⚠️  Detector ${detector.name} failed: ${error.message}`,
              "warn"
            );
          }
        }

        taskResult.technicalDebt = debts.length > 0 ? debts : null;

        if (debts.length > 0) {
          this.log(`⚠️  Found ${debts.length} technical debt item(s)`, "warn");
        }
      } else {
        // Analyze failure for categorization - run ALL analyzers
        this.log("\n🔍 Analyzing Failure", "info");

        const failureAnalyses = [];
        const analyzers = this.pluginRegistry.getFailureAnalyzers();

        for (const analyzer of analyzers) {
          try {
            const result = await analyzer.analyze(
              taskResult.steps,
              taskResult.failureReason || "Unknown failure",
              taskSpec
            );

            if (result) {
              failureAnalyses.push(result);
            }
          } catch (error) {
            this.log(
              `⚠️  Analyzer ${analyzer.name} failed: ${error.message}`,
              "warn"
            );
          }
        }

        taskResult.failureAnalysis = failureAnalyses;
        taskResult.technicalDebt = null; // No debt on failures

        if (failureAnalyses.length > 0) {
          this.log(
            `📊 Failure Categories: ${failureAnalyses
              .map((a) => a.category)
              .join(", ")}`,
            "info"
          );
        }
      }
    } catch (error) {
      taskResult.status = "FAILED";
      taskResult.error = error.message;
      this.log(`❌ Task execution error: ${error.message}`, "error");

      // Analyze unexpected error - run ALL analyzers
      const failureAnalyses = [];
      const analyzers = this.pluginRegistry.getFailureAnalyzers();

      for (const analyzer of analyzers) {
        try {
          const result = await analyzer.analyze(
            taskResult.steps,
            error.message,
            taskSpec
          );

          if (result) {
            failureAnalyses.push(result);
          }
        } catch (analyzerError) {
          this.log(
            `⚠️  Analyzer ${analyzer.name} failed: ${analyzerError.message}`,
            "warn"
          );
        }
      }

      taskResult.failureAnalysis = failureAnalyses;
      taskResult.technicalDebt = null;
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
   * Execute single action (delegates to plugin)
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
      // Get executor from plugin registry
      const executor = this.pluginRegistry.getExecutor(action.type);
      if (!executor) {
        throw new Error(
          `No executor plugin found for action type: ${action.type}`
        );
      }

      // Execute action with timeout
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

    // Cleanup all executor plugins
    await this.pluginRegistry.cleanupAll();

    this.log("✅ Cleanup complete", "success");
  }
}

module.exports = TestExecutionEngine;
