/**
 * Plugin Registry
 *
 * Dynamically discovers and loads all plugins from core/plugins/ directories.
 * Supports multiple plugins per type (e.g., multiple executors for same action type).
 *
 * Directory structure:
 * - core/plugins/executors/
 * - core/plugins/failure-analyzers/
 * - core/plugins/technical-debt-detectors/
 * - core/plugins/validators/
 * - core/plugins/reporters/
 *
 * This implements the Dependency Inversion Principle:
 * - Registry depends on interfaces (IExecutor, IFailureAnalyzer, etc.)
 * - Plugins implement interfaces
 * - Engine depends on registry, not on concrete plugins
 */

import * as fs from "fs";
import * as path from "path";
import { IExecutor } from "./interfaces/IExecutor";
import { IFailureAnalyzer } from "./interfaces/IFailureAnalyzer";
import { IReporter } from "./interfaces/IReporter";
import { ITechnicalDebtDetector } from "./interfaces/ITechnicalDebtDetector";
import { IValidator } from "./interfaces/IValidator";

export class PluginRegistry {
  private baseDir: string;

  // Multiple executors per action type
  private executorsByActionType: Map<string, IExecutor[]>;

  // All plugins stored in arrays
  private allExecutors: IExecutor[];
  private failureAnalyzers: IFailureAnalyzer[];
  private debtDetectors: ITechnicalDebtDetector[];
  private validators: IValidator[];
  private reporters: IReporter[];

  constructor(baseDir: string) {
    this.baseDir = baseDir;
    this.executorsByActionType = new Map();
    this.allExecutors = [];
    this.failureAnalyzers = [];
    this.debtDetectors = [];
    this.validators = [];
    this.reporters = [];
  }

  /**
   * Load all plugins from their directories
   */
  async loadAll(): Promise<void> {
    console.log("🔌 Loading plugins...");

    await this.loadExecutors();
    await this.loadFailureAnalyzers();
    await this.loadDebtDetectors();
    await this.loadValidators();
    await this.loadReporters();

    console.log(
      `✅ Loaded ${this.allExecutors.length} executors, ${this.validators.length} validators, ${this.reporters.length} reporters, ${this.failureAnalyzers.length} failure analyzers, ${this.debtDetectors.length} debt detectors`
    );
  }

  /**
   * Auto-discover and load all executor plugins
   */
  private async loadExecutors(): Promise<void> {
    const executorsDir = path.join(this.baseDir, "core/plugins/executors");

    if (!fs.existsSync(executorsDir)) {
      console.warn(`⚠️  Executors directory not found: ${executorsDir}`);
      return;
    }

    const files = fs
      .readdirSync(executorsDir)
      .filter(
        (f) => (f.endsWith(".js") || f.endsWith(".ts")) && !f.startsWith("_")
      );

    for (const file of files) {
      try {
        const modulePath = path.join(executorsDir, file);
        const ExecutorModule = require(modulePath);

        // Handle both CommonJS and ES6 exports
        const ExecutorClass = ExecutorModule.default || ExecutorModule;
        const executor: IExecutor = new ExecutorClass();

        // Validate interface compliance
        if (!executor.name || !executor.version || !executor.getActionTypes) {
          throw new Error(
            `Executor ${file} does not implement IExecutor interface correctly`
          );
        }

        // Register executor for each action type it handles
        const actionTypes = executor.getActionTypes();
        for (const type of actionTypes) {
          if (!this.executorsByActionType.has(type)) {
            this.executorsByActionType.set(type, []);
          }
          this.executorsByActionType.get(type)!.push(executor);
          console.log(
            `  📦 Loaded executor: ${executor.name} v${executor.version} -> ${type}`
          );
        }

        this.allExecutors.push(executor);
      } catch (error: any) {
        console.error(`  ❌ Failed to load executor ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Auto-discover and load all failure analyzer plugins
   */
  private async loadFailureAnalyzers(): Promise<void> {
    const analyzersDir = path.join(
      this.baseDir,
      "core/plugins/failure-analyzers"
    );

    if (!fs.existsSync(analyzersDir)) {
      console.warn(
        `⚠️  Failure analyzers directory not found: ${analyzersDir}`
      );
      return;
    }

    const files = fs
      .readdirSync(analyzersDir)
      .filter(
        (f) => (f.endsWith(".js") || f.endsWith(".ts")) && !f.startsWith("_")
      );

    for (const file of files) {
      try {
        const modulePath = path.join(analyzersDir, file);
        const AnalyzerModule = require(modulePath);

        const AnalyzerClass = AnalyzerModule.default || AnalyzerModule;
        const analyzer: IFailureAnalyzer = new AnalyzerClass();

        // Validate interface compliance
        if (
          !analyzer.name ||
          analyzer.priority === undefined ||
          !analyzer.analyze
        ) {
          throw new Error(
            `Analyzer ${file} does not implement IFailureAnalyzer interface correctly`
          );
        }

        this.failureAnalyzers.push(analyzer);
        console.log(
          `  📦 Loaded failure analyzer: ${analyzer.name} (priority: ${analyzer.priority})`
        );
      } catch (error: any) {
        console.error(`  ❌ Failed to load analyzer ${file}: ${error.message}`);
      }
    }

    // Sort by priority (highest first)
    this.failureAnalyzers.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Auto-discover and load all technical debt detector plugins
   */
  private async loadDebtDetectors(): Promise<void> {
    const detectorsDir = path.join(
      this.baseDir,
      "core/plugins/technical-debt-detectors"
    );

    if (!fs.existsSync(detectorsDir)) {
      console.warn(`⚠️  Debt detectors directory not found: ${detectorsDir}`);
      return;
    }

    const files = fs
      .readdirSync(detectorsDir)
      .filter(
        (f) => (f.endsWith(".js") || f.endsWith(".ts")) && !f.startsWith("_")
      );

    for (const file of files) {
      try {
        const modulePath = path.join(detectorsDir, file);
        const DetectorModule = require(modulePath);

        const DetectorClass = DetectorModule.default || DetectorModule;
        const detector: ITechnicalDebtDetector = new DetectorClass();

        // Validate interface compliance
        if (
          !detector.name ||
          detector.priority === undefined ||
          !detector.analyze
        ) {
          throw new Error(
            `Detector ${file} does not implement ITechnicalDebtDetector interface correctly`
          );
        }

        this.debtDetectors.push(detector);
        console.log(
          `  📦 Loaded debt detector: ${detector.name} (priority: ${detector.priority})`
        );
      } catch (error: any) {
        console.error(`  ❌ Failed to load detector ${file}: ${error.message}`);
      }
    }

    // Sort by priority (highest first)
    this.debtDetectors.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Auto-discover and load all validator plugins
   */
  private async loadValidators(): Promise<void> {
    const validatorsDir = path.join(this.baseDir, "core/plugins/validators");

    if (!fs.existsSync(validatorsDir)) {
      console.warn(`⚠️  Validators directory not found: ${validatorsDir}`);
      return;
    }

    const files = fs
      .readdirSync(validatorsDir)
      .filter(
        (f) => (f.endsWith(".js") || f.endsWith(".ts")) && !f.startsWith("_")
      );

    for (const file of files) {
      try {
        const modulePath = path.join(validatorsDir, file);
        const ValidatorModule = require(modulePath);

        const ValidatorClass = ValidatorModule.default || ValidatorModule;
        const validator: IValidator = new ValidatorClass();

        // Validate interface compliance
        if (!validator.name || !validator.validate) {
          throw new Error(
            `Validator ${file} does not implement IValidator interface correctly`
          );
        }

        this.validators.push(validator);
        console.log(`  📦 Loaded validator: ${validator.name}`);
      } catch (error: any) {
        console.error(
          `  ❌ Failed to load validator ${file}: ${error.message}`
        );
      }
    }
  }

  /**
   * Auto-discover and load all reporter plugins
   */
  private async loadReporters(): Promise<void> {
    const reportersDir = path.join(this.baseDir, "core/plugins/reporters");

    if (!fs.existsSync(reportersDir)) {
      console.warn(`⚠️  Reporters directory not found: ${reportersDir}`);
      return;
    }

    const files = fs
      .readdirSync(reportersDir)
      .filter(
        (f) => (f.endsWith(".js") || f.endsWith(".ts")) && !f.startsWith("_")
      );

    for (const file of files) {
      try {
        const modulePath = path.join(reportersDir, file);
        const ReporterModule = require(modulePath);

        const ReporterClass = ReporterModule.default || ReporterModule;
        const reporter: IReporter = new ReporterClass();

        // Validate interface compliance
        if (!reporter.name || !reporter.format || !reporter.generate) {
          throw new Error(
            `Reporter ${file} does not implement IReporter interface correctly`
          );
        }

        this.reporters.push(reporter);
        console.log(
          `  📦 Loaded reporter: ${reporter.name} (${reporter.format})`
        );
      } catch (error: any) {
        console.error(`  ❌ Failed to load reporter ${file}: ${error.message}`);
      }
    }
  }

  // =========================================================================
  // GETTER METHODS FOR ENGINE
  // =========================================================================

  /**
   * Get all executors for a specific action type
   * Returns array to support multiple executors per type
   */
  getExecutorsForAction(actionType: string): IExecutor[] {
    return this.executorsByActionType.get(actionType) || [];
  }

  /**
   * Get all failure analyzers (sorted by priority)
   */
  getFailureAnalyzers(): IFailureAnalyzer[] {
    return [...this.failureAnalyzers]; // Return copy
  }

  /**
   * Get all technical debt detectors (sorted by priority)
   */
  getDebtDetectors(): ITechnicalDebtDetector[] {
    return [...this.debtDetectors]; // Return copy
  }

  /**
   * Get all validators
   */
  getValidators(): IValidator[] {
    return [...this.validators]; // Return copy
  }

  /**
   * Get all reporters
   */
  getReporters(): IReporter[] {
    return [...this.reporters]; // Return copy
  }

  /**
   * Get total executor count
   */
  getExecutorCount(): number {
    return this.allExecutors.length;
  }

  /**
   * Cleanup all plugins
   */
  async cleanupAll(): Promise<void> {
    console.log("🧹 Cleaning up plugins...");

    // Cleanup all executors
    for (const executor of this.allExecutors) {
      try {
        await executor.cleanup();
      } catch (error: any) {
        console.error(
          `  ❌ Failed to cleanup executor ${executor.name}: ${error.message}`
        );
      }
    }

    console.log("✅ Plugin cleanup complete");
  }

  /**
   * List all loaded plugins for debugging
   */
  listAll(): {
    executors: string[];
    failureAnalyzers: string[];
    debtDetectors: string[];
    validators: string[];
    reporters: string[];
  } {
    return {
      executors: this.allExecutors.map((e) => `${e.name} v${e.version}`),
      failureAnalyzers: this.failureAnalyzers.map((a) => a.name),
      debtDetectors: this.debtDetectors.map((d) => d.name),
      validators: this.validators.map((v) => v.name),
      reporters: this.reporters.map((r) => `${r.name} (${r.format})`),
    };
  }
}
