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

import * as fs from "fs";
import * as path from "path";
import { PluginRegistry } from "./plugin-registry";
import { SpecificationLoader, TestSpecification } from "./specification-loader";
import { EvidenceCollector } from "./evidence-collector";
import { ValidationEngine } from "./validation-engine";
import { FailureAnalysisResult } from "./base-failure-analyzer";
import { TechnicalDebtItem } from "./base-technical-debt-detector";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface EngineConfig {
  verbose?: boolean;
  dryRun?: boolean;
  stopOnFailure?: boolean;
  [key: string]: any;
}

interface ActionResult {
  action: any;
  phase: string;
  taskId: string;
  startTime: Date;
  endTime?: Date;
  durationMs?: number;
  success: boolean;
  data: any;
  error: string | null;
}

interface TaskResult {
  taskId: string;
  title: string;
  startTime: Date;
  endTime?: Date;
  durationMs?: number;
  steps: ActionResult[];
  status: "PENDING" | "PASSED" | "FAILED" | "SKIPPED";
  failureReason?: string;
  validationResult?: any;
  failureAnalysis?: FailureAnalysisResult[];
  technicalDebt?: TechnicalDebtItem[] | null;
  error?: string;
}

interface ExecutionResults {
  startTime: Date;
  endTime?: Date;
  durationMs?: number;
  tasks: { [taskId: string]: TaskResult };
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
}

type LogLevel = "info" | "success" | "warn" | "error";

// ============================================================================
// CORE ENGINE CLASS
// ============================================================================

class TestExecutionEngine {
  private config: EngineConfig;
  private testSpec: TestSpecification | null;
  private pluginRegistry: PluginRegistry | null;
  private evidenceCollector: EvidenceCollector | null;
  private validationEngine: ValidationEngine | null;
  private executionContext: Map<string, ActionResult>;

  constructor(config: EngineConfig = {}) {
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
  async initialize(testSpecPath: string): Promise<TestExecutionEngine> {
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
  async execute(): Promise<ExecutionResults> {
    if (!this.testSpec) {
      throw new Error("Engine not initialized. Call initialize() first.");
    }

    this.log("\n🎯 Beginning Test Execution", "info");

    const results: ExecutionResults = {
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
    results.durationMs = results.endTime.getTime() - results.startTime.getTime();

    // Generate final report
    await this.evidenceCollector!.generateFinalReport(results);

    return results;
  }

  /**
   * Execute single task
   */
  private async executeTask(taskId: string, taskSpec: any): Promise<TaskResult> {
    const taskResult: TaskResult = {
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
          taskResult.durationMs = taskResult.endTime.getTime() - taskResult.startTime.getTime();

          this.log("\n🔍 Analyzing Failure", "info");

          // Run ALL failure analyzers and collect results
          const failureAnalyses: FailureAnalysisResult[] = [];
          const analyzers = this.pluginRegistry!.getFailureAnalyzers();

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
              const err = error as Error;
              this.log(
                `⚠️  Analyzer ${analyzer.constructor.name} failed: ${err.message}`,
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
      const validationResult = this.validationEngine!.evaluate(
        taskResult.steps,
        taskSpec.validationCriteria
      );

      taskResult.status = validationResult.passed ? "PASSED" : "FAILED";
      taskResult.validationResult = validationResult;

      // Analyze results based on status
      if (taskResult.status === "PASSED") {
        // Detect technical debt in passing tests - run ALL detectors
        this.log("\n🔍 Analyzing for Technical Debt", "info");

        const debts: TechnicalDebtItem[] = [];
        const detectors = this.pluginRegistry!.getDebtDetectors();

        for (const detector of detectors) {
          try {
            const results = await detector.analyze(taskResult.steps, taskSpec);

            if (results && results.length > 0) {
              debts.push(...results);
            }
          } catch (error) {
            const err = error as Error;
            this.log(
              `⚠️  Detector ${detector.constructor.name} failed: ${err.message}`,
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

        const failureAnalyses: FailureAnalysisResult[] = [];
        const analyzers = this.pluginRegistry!.getFailureAnalyzers();

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
            const err = error as Error;
            this.log(
              `⚠️  Analyzer ${analyzer.constructor.name} failed: ${err.message}`,
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
      const err = error as Error;
      taskResult.status = "FAILED";
      taskResult.error = err.message;
      this.log(`❌ Task execution error: ${err.message}`, "error");

      // Analyze unexpected error - run ALL analyzers
      const failureAnalyses: FailureAnalysisResult[] = [];
      const analyzers = this.pluginRegistry!.getFailureAnalyzers();

      for (const analyzer of analyzers) {
        try {
          const result = await analyzer.analyze(
            taskResult.steps,
            err.message,
            taskSpec
          );

          if (result) {
            failureAnalyses.push(result);
          }
        } catch (analyzerError) {
          const analyzerErr = analyzerError as Error;
          this.log(
            `⚠️  Analyzer ${analyzer.constructor.name} failed: ${analyzerErr.message}`,
            "warn"
          );
        }
      }

      taskResult.failureAnalysis = failureAnalyses;
      taskResult.technicalDebt = null;
    }

    taskResult.endTime = new Date();
    taskResult.durationMs = taskResult.endTime.getTime() - taskResult.startTime.getTime();

    // Save task evidence
    await this.evidenceCollector!.saveTaskEvidence(taskId, taskResult);

    return taskResult;
  }

  /**
   * Execute array of actions
   */
  private async executeActions(
    actions: any[],
    taskId: string,
    phase: string
  ): Promise<ActionResult[]> {
    const results: ActionResult[] = [];

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
  private async executeAction(
    action: any,
    taskId: string,
    phase: string
  ): Promise<ActionResult> {
    this.log(`\n🔹 ${action.actionId}: ${action.description}`, "info");

    const startTime = new Date();
    const result: ActionResult = {
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
      const executor = this.pluginRegistry!.getExecutor(action.type);
      if (!executor) {
        throw new Error(
          `No executor plugin found for action type: ${action.type}`
        );
      }

      // Execute action with timeout
      const timeout =
        action.timeout || this.testSpec!.globalConfiguration.timeout || 60000;
      result.data = await this.executeWithTimeout(
        executor.execute(action.parameters, this.testSpec!.globalConfiguration),
        timeout
      );

      result.success = true;
      this.log(`✅ ${action.actionId} completed successfully`, "success");
    } catch (error) {
      const err = error as Error;
      result.error = err.message;
      result.success = false;
      this.log(`❌ ${action.actionId} failed: ${err.message}`, "error");
    }

    result.endTime = new Date();
    result.durationMs = result.endTime.getTime() - startTime.getTime();

    // Save individual action evidence
    await this.evidenceCollector!.saveActionEvidence(
      taskId,
      action.actionId,
      result
    );

    return result;
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
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
  private log(message: string, level: LogLevel = "info"): void {
    const symbols: Record<LogLevel, string> = {
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
  async cleanup(): Promise<void> {
    this.log("\n🧹 Cleaning up resources...", "info");

    // Cleanup all executor plugins
    await this.pluginRegistry!.cleanupAll();

    this.log("✅ Cleanup complete", "success");
  }
}

export default TestExecutionEngine;
