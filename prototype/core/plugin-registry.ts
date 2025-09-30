/**
 * Plugin Registry - Dynamic loader for all plugins
 *
 * Auto-discovers and loads:
 * - Executors from /executors/ directory
 * - Validators from /validators/ directory
 * - Reporters from /reporters/ directory
 * - Failure Analyzers from /failure-analyzers/ directory
 * - Technical Debt Detectors from /technical-debt-detectors/ directory
 *
 * Contributors add new features by simply dropping a file in the appropriate folder
 * No core engine changes required
 */

import * as fs from "fs";
import * as path from "path";
import { BaseExecutor } from "./base-executor";
import { BaseFailureAnalyzer } from "./base-failure-analyzer";
import { BaseTechnicalDebtDetector } from "./base-technical-debt-detector";

export class PluginRegistry {
  private baseDir: string;
  private executors: Map<string, BaseExecutor>;
  private validators: Map<string, any>;
  private reporters: Map<string, any>;
  private failureAnalyzers: BaseFailureAnalyzer[];
  private debtDetectors: BaseTechnicalDebtDetector[];

  constructor(baseDir: string) {
    this.baseDir = baseDir;
    this.executors = new Map();
    this.validators = new Map();
    this.reporters = new Map();
    this.failureAnalyzers = [];
    this.debtDetectors = [];
  }

  /**
   * Load all plugins from their directories
   */
  async loadAll(): Promise<void> {
    console.log("🔌 Loading plugins...");

    await this.loadExecutors();
    await this.loadValidators();
    await this.loadReporters();
    await this.loadFailureAnalyzers();
    await this.loadDebtDetectors();

    console.log(
      `✅ Loaded ${this.executors.size} executors, ${this.validators.size} validators, ${this.reporters.size} reporters, ${this.failureAnalyzers.length} failure analyzers, ${this.debtDetectors.length} debt detectors`
    );
  }

  /**
   * Auto-discover and load all executor plugins
   */
  private async loadExecutors(): Promise<void> {
    const executorsDir = path.join(this.baseDir, "executors");

    if (!fs.existsSync(executorsDir)) {
      console.warn(`⚠️ Executors directory not found: ${executorsDir}`);
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
        const executor = new ExecutorClass();

        const actionTypes = executor.getActionTypes();
        for (const type of actionTypes) {
          this.executors.set(type, executor);
          console.log(`  📦 Loaded executor: ${type} (${file})`);
        }
      } catch (error: any) {
        console.error(`  ❌ Failed to load executor ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Auto-discover and load all validator plugins
   */
  private async loadValidators(): Promise<void> {
    const validatorsDir = path.join(this.baseDir, "validators");

    if (!fs.existsSync(validatorsDir)) {
      console.warn(`⚠️ Validators directory not found: ${validatorsDir}`);
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
        const validator = new ValidatorClass();

        const validatorTypes = validator.getValidatorTypes();
        for (const type of validatorTypes) {
          this.validators.set(type, validator);
          console.log(`  📦 Loaded validator: ${type} (${file})`);
        }
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
    const reportersDir = path.join(this.baseDir, "reporters");

    if (!fs.existsSync(reportersDir)) {
      console.warn(`⚠️ Reporters directory not found: ${reportersDir}`);
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
        const reporter = new ReporterClass();

        const reporterTypes = reporter.getReporterTypes();
        for (const type of reporterTypes) {
          this.reporters.set(type, reporter);
          console.log(`  📦 Loaded reporter: ${type} (${file})`);
        }
      } catch (error: any) {
        console.error(`  ❌ Failed to load reporter ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Auto-discover and load all failure analyzer plugins
   */
  private async loadFailureAnalyzers(): Promise<void> {
    const analyzersDir = path.join(this.baseDir, "failure-analyzers");

    if (!fs.existsSync(analyzersDir)) {
      console.warn(`⚠️ Failure analyzers directory not found: ${analyzersDir}`);
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

        // Handle both CommonJS and ES6 exports
        const AnalyzerClass = AnalyzerModule.default || AnalyzerModule;
        const analyzer = new AnalyzerClass();

        this.failureAnalyzers.push(analyzer);
        console.log(`  📦 Loaded failure analyzer: ${analyzer.name || file}`);
      } catch (error: any) {
        console.error(
          `  ❌ Failed to load failure analyzer ${file}: ${error.message}`
        );
      }
    }
  }

  /**
   * Auto-discover and load all technical debt detector plugins
   */
  private async loadDebtDetectors(): Promise<void> {
    const detectorsDir = path.join(this.baseDir, "technical-debt-detectors");

    if (!fs.existsSync(detectorsDir)) {
      console.warn(
        `⚠️ Technical debt detectors directory not found: ${detectorsDir}`
      );
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

        // Handle both CommonJS and ES6 exports
        const DetectorClass = DetectorModule.default || DetectorModule;
        const detector = new DetectorClass();

        this.debtDetectors.push(detector);
        console.log(`  📦 Loaded debt detector: ${detector.name || file}`);
      } catch (error: any) {
        console.error(
          `  ❌ Failed to load debt detector ${file}: ${error.message}`
        );
      }
    }
  }

  /**
   * Get executor for action type
   */
  getExecutor(actionType: string): BaseExecutor | undefined {
    return this.executors.get(actionType);
  }

  /**
   * Get validator for validator type
   */
  getValidator(validatorType: string): any | undefined {
    return this.validators.get(validatorType);
  }

  /**
   * Get reporter for reporter type
   */
  getReporter(reporterType: string): any | undefined {
    return this.reporters.get(reporterType);
  }

  /**
   * Get all failure analyzers
   */
  getFailureAnalyzers(): BaseFailureAnalyzer[] {
    return this.failureAnalyzers;
  }

  /**
   * Get all technical debt detectors
   */
  getDebtDetectors(): BaseTechnicalDebtDetector[] {
    return this.debtDetectors;
  }

  /**
   * Get count of loaded executors
   */
  getExecutorCount(): number {
    return this.executors.size;
  }

  /**
   * List all available plugins
   */
  listAll(): {
    executors: string[];
    validators: string[];
    reporters: string[];
    failureAnalyzers: string[];
    debtDetectors: string[];
  } {
    return {
      executors: Array.from(this.executors.keys()),
      validators: Array.from(this.validators.keys()),
      reporters: Array.from(this.reporters.keys()),
      failureAnalyzers: this.failureAnalyzers.map((a) => a.name || "unnamed"),
      debtDetectors: this.debtDetectors.map((d) => d.name || "unnamed"),
    };
  }

  /**
   * Cleanup all plugins
   */
  async cleanupAll(): Promise<void> {
    for (const [type, executor] of this.executors) {
      if (executor.cleanup) {
        try {
          await executor.cleanup();
        } catch (error: any) {
          console.error(
            `⚠️ Cleanup error for executor ${type}: ${error.message}`
          );
        }
      }
    }
  }
}

export default PluginRegistry;
