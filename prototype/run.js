#!/usr/bin/env node

/**
 * CODOR Test Execution Engine - CLI Entry Point
 *
 * Usage: node run.js <test-spec.json> [options]
 */

const TestExecutionEngine = require("./core/engine");

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help")) {
    console.log(`
🎯 CODOR Test Execution Engine v2.0

Usage: node run.js <test-spec.json> [options]

Options:
  --verbose          Verbose output
  --dry-run          Validate without executing
  --stop-on-failure  Stop on first task failure
  --list-plugins     List all available plugins
  
Example:
  node run.js ../docs/specifications/testing-system/examples/T004-quotes-get-test-specification.json
    `);
    process.exit(0);
  }

  // List plugins
  if (args.includes("--list-plugins")) {
    const PluginRegistry = require("./core/plugin-registry");
    const registry = new PluginRegistry(__dirname);
    await registry.loadAll();

    const plugins = registry.listAll();
    console.log("\n📦 Available Plugins:");
    console.log("\nExecutors:", plugins.executors.join(", "));
    console.log("Validators:", plugins.validators.join(", "));
    console.log("Reporters:", plugins.reporters.join(", "));
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

module.exports = main;
