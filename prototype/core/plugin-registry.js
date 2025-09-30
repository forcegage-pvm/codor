/**
 * Plugin Registry - Dynamic loader for all plugins
 *
 * Auto-discovers and loads:
 * - Executors from /executors/ directory
 * - Validators from /validators/ directory
 * - Reporters from /reporters/ directory
 *
 * Contributors add new features by simply dropping a file in the appropriate folder
 * No core engine changes required
 */

const fs = require("fs");
const path = require("path");

class PluginRegistry {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.executors = new Map();
    this.validators = new Map();
    this.reporters = new Map();
    this.failureAnalyzers = []; // Array of analyzer instances
    this.debtDetectors = []; // Array of detector instances
  }

  /**
   * Load all plugins from their directories
   */
  async loadAll() {
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
  async loadExecutors() {
    const executorsDir = path.join(this.baseDir, "executors");

    if (!fs.existsSync(executorsDir)) {
      console.warn(`⚠️ Executors directory not found: ${executorsDir}`);
      return;
    }

    const files = fs
      .readdirSync(executorsDir)
      .filter((f) => f.endsWith(".js") && !f.startsWith("_")); // Ignore helper files starting with _

    for (const file of files) {
      try {
        const ExecutorClass = require(path.join(executorsDir, file));
        const executor = new ExecutorClass();

        // Register by the action type(s) this executor handles
        const actionTypes = executor.getActionTypes();
        for (const type of actionTypes) {
          this.executors.set(type, executor);
          console.log(`  📦 Loaded executor: ${type} (${file})`);
        }
      } catch (error) {
        console.error(`  ❌ Failed to load executor ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Auto-discover and load all validator plugins
   */
  async loadValidators() {
    const validatorsDir = path.join(this.baseDir, "validators");

    if (!fs.existsSync(validatorsDir)) {
      console.warn(`⚠️ Validators directory not found: ${validatorsDir}`);
      return;
    }

    const files = fs
      .readdirSync(validatorsDir)
      .filter((f) => f.endsWith(".js") && !f.startsWith("_"));

    for (const file of files) {
      try {
        const ValidatorClass = require(path.join(validatorsDir, file));
        const validator = new ValidatorClass();

        const validatorTypes = validator.getValidatorTypes();
        for (const type of validatorTypes) {
          this.validators.set(type, validator);
          console.log(`  📦 Loaded validator: ${type} (${file})`);
        }
      } catch (error) {
        console.error(
          `  ❌ Failed to load validator ${file}: ${error.message}`
        );
      }
    }
  }

  /**
   * Auto-discover and load all reporter plugins
   */
  async loadReporters() {
    const reportersDir = path.join(this.baseDir, "reporters");

    if (!fs.existsSync(reportersDir)) {
      console.warn(`⚠️ Reporters directory not found: ${reportersDir}`);
      return;
    }

    const files = fs
      .readdirSync(reportersDir)
      .filter((f) => f.endsWith(".js") && !f.startsWith("_"));

    for (const file of files) {
      try {
        const ReporterClass = require(path.join(reportersDir, file));
        const reporter = new ReporterClass();

        const reporterTypes = reporter.getReporterTypes();
        for (const type of reporterTypes) {
          this.reporters.set(type, reporter);
          console.log(`  📦 Loaded reporter: ${type} (${file})`);
        }
      } catch (error) {
        console.error(`  ❌ Failed to load reporter ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Auto-discover and load all failure analyzer plugins
   */
  async loadFailureAnalyzers() {
    const analyzersDir = path.join(this.baseDir, "failure-analyzers");

    if (!fs.existsSync(analyzersDir)) {
      console.warn(`⚠️ Failure analyzers directory not found: ${analyzersDir}`);
      return;
    }

    const files = fs
      .readdirSync(analyzersDir)
      .filter((f) => f.endsWith(".js") && !f.startsWith("_"));

    for (const file of files) {
      try {
        const AnalyzerClass = require(path.join(analyzersDir, file));
        const analyzer = new AnalyzerClass();

        this.failureAnalyzers.push(analyzer);
        console.log(`  📦 Loaded failure analyzer: ${analyzer.name || file}`);
      } catch (error) {
        console.error(`  ❌ Failed to load failure analyzer ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Auto-discover and load all technical debt detector plugins
   */
  async loadDebtDetectors() {
    const detectorsDir = path.join(this.baseDir, "technical-debt-detectors");

    if (!fs.existsSync(detectorsDir)) {
      console.warn(`⚠️ Technical debt detectors directory not found: ${detectorsDir}`);
      return;
    }

    const files = fs
      .readdirSync(detectorsDir)
      .filter((f) => f.endsWith(".js") && !f.startsWith("_"));

    for (const file of files) {
      try {
        const DetectorClass = require(path.join(detectorsDir, file));
        const detector = new DetectorClass();

        this.debtDetectors.push(detector);
        console.log(`  📦 Loaded debt detector: ${detector.name || file}`);
      } catch (error) {
        console.error(`  ❌ Failed to load debt detector ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Get executor for action type
   */
  getExecutor(actionType) {
    return this.executors.get(actionType);
  }

  /**
   * Get validator for validator type
   */
  getValidator(validatorType) {
    return this.validators.get(validatorType);
  }

  /**
   * Get reporter for reporter type
   */
  getReporter(reporterType) {
    return this.reporters.get(reporterType);
  }

  /**
   * Get all failure analyzers
   */
  getFailureAnalyzers() {
    return this.failureAnalyzers;
  }

  /**
   * Get all technical debt detectors
   */
  getDebtDetectors() {
    return this.debtDetectors;
  }

  /**
   * Get count of loaded executors
   */
  getExecutorCount() {
    return this.executors.size;
  }

  /**
   * List all available plugins
   */
  listAll() {
    return {
      executors: Array.from(this.executors.keys()),
      validators: Array.from(this.validators.keys()),
      reporters: Array.from(this.reporters.keys()),
      failureAnalyzers: this.failureAnalyzers.map(a => a.name || "unnamed"),
      debtDetectors: this.debtDetectors.map(d => d.name || "unnamed"),
    };
  }

  /**
   * Cleanup all plugins
   */
  async cleanupAll() {
    for (const [type, executor] of this.executors) {
      if (executor.cleanup) {
        try {
          await executor.cleanup();
        } catch (error) {
          console.error(
            `⚠️ Cleanup error for executor ${type}: ${error.message}`
          );
        }
      }
    }
  }
}

module.exports = PluginRegistry;
