#!/usr/bin/env node

/**
 * CODOR Test Execution Engine - CLI Entry Point
 *
 * Usage: ts-node run.ts <test-spec.json> [options]
 */

import TestExecutionEngine from "./core/engine";
import { PluginRegistry } from "./core/plugin-registry";

interface CLIConfig {
  verbose: boolean;
  dryRun: boolean;
  stopOnFailure: boolean;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help")) {
    console.log(`
🎯 CODOR Test Execution Engine v2.0

Usage: ts-node run.ts <test-spec.json> [options]

Options:
  --verbose          Verbose output
  --dry-run          Validate without executing
  --stop-on-failure  Stop on first task failure
  --list-plugins     List all available plugins
  
Example:
  ts-node run.ts ../docs/specifications/testing-system/examples/T004-quotes-get-test-specification.json
    `);
    process.exit(0);
  }

  // List plugins
  if (args.includes("--list-plugins")) {
    const registry = new PluginRegistry(__dirname);
    await registry.loadAll();

    const plugins = registry.listAll();
    console.log("\n📦 Available Plugins:");
    console.log("\nExecutors:", plugins.executors.join(", "));
    console.log("Failure Analyzers:", plugins.failureAnalyzers.join(", "));
    console.log("Debt Detectors:", plugins.debtDetectors.join(", "));
    process.exit(0);
  }

  const testSpecPath = args[0];
  const config: CLIConfig = {
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
    const err = error as Error;
    console.error(`💥 Fatal error: ${err.message}`);
    if (err.stack) {
      console.error(err.stack);
    }
    await engine.cleanup();
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export default main;
