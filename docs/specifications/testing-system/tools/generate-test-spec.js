#!/usr/bin/env node

/**
 * CODOR Test Specification Generator
 *
 * Transforms simple YAML specifications into full JSON test task specifications.
 *
 * Usage:
 *   node generate-test-spec.js <yaml-file> [-o output.json] [--validate-only]
 *   node generate-test-spec.js examples/*.yaml -o generated/
 *
 * Version: 1.0.0
 * Date: 2025-09-30
 */

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const Ajv = require("ajv");
const glob = require("glob");

// Configuration
const TEMPLATES_DIR = path.join(__dirname, "../templates");
const SCHEMA_PATH = path.join(
  __dirname,
  "../schemas/current-test-task.schema.json"
);
const SIMPLE_SCHEMA_PATH = path.join(
  __dirname,
  "../schemas/current-yaml-input.schema.yaml"
);

// Template mapping
const TEMPLATE_MAP = {
  "contract-test": "contract-test-template.json",
  "component-test": "component-test-template.json",
  "integration-test": "integration-test-template.json",
  "unit-test": "unit-test-template.json",
  "e2e-test": "e2e-test-template.json",
  "database-migration": "database-migration-template.json",
};

class TestSpecGenerator {
  constructor() {
    this.ajv = new Ajv({ strict: false, allErrors: true });
    this.authoritativeSchema = null;
    this.simpleSchema = null;
  }

  /**
   * Load schemas for validation
   */
  loadSchemas() {
    try {
      this.authoritativeSchema = JSON.parse(
        fs.readFileSync(SCHEMA_PATH, "utf8")
      );
      this.simpleSchema = yaml.load(
        fs.readFileSync(SIMPLE_SCHEMA_PATH, "utf8")
      );
      console.log("✓ Schemas loaded successfully");
    } catch (error) {
      console.error("✗ Failed to load schemas:", error.message);
      process.exit(1);
    }
  }

  /**
   * Load YAML specification
   */
  loadYamlSpec(yamlPath) {
    try {
      const content = fs.readFileSync(yamlPath, "utf8");
      const spec = yaml.load(content);
      console.log(`✓ Loaded YAML spec: ${yamlPath}`);
      return spec;
    } catch (error) {
      console.error(`✗ Failed to load YAML spec ${yamlPath}:`, error.message);
      process.exit(1);
    }
  }

  /**
   * Validate YAML spec against simple schema
   */
  validateYamlSpec(spec, yamlPath) {
    const validate = this.ajv.compile(this.simpleSchema);
    const valid = validate(spec);

    if (!valid) {
      console.error(`✗ YAML validation failed for ${yamlPath}:`);
      validate.errors.forEach((error) => {
        console.error(`  - ${error.instancePath}: ${error.message}`);
      });
      process.exit(1);
    }

    console.log(`✓ YAML spec validated`);
  }

  /**
   * Load template based on type
   */
  loadTemplate(type) {
    const templateFile = TEMPLATE_MAP[type];

    if (!templateFile) {
      console.error(`✗ Unknown template type: ${type}`);
      console.error(
        `  Available types: ${Object.keys(TEMPLATE_MAP).join(", ")}`
      );
      process.exit(1);
    }

    const templatePath = path.join(TEMPLATES_DIR, templateFile);

    try {
      const template = JSON.parse(fs.readFileSync(templatePath, "utf8"));
      console.log(`✓ Loaded template: ${templateFile}`);
      return template;
    } catch (error) {
      console.error(
        `✗ Failed to load template ${templateFile}:`,
        error.message
      );
      process.exit(1);
    }
  }

  /**
   * Build variable substitution map
   */
  buildVariableMap(spec) {
    const now = new Date().toISOString();
    const testFileName = path.basename(spec.test_file);

    // Extract project and sprint from workspace path or use defaults
    const projectName = spec.project_name || "CODOR-Project";
    const sprintId = spec.sprint_id || "CURRENT_SPRINT";

    // Build validation policy values
    const eslintStrategy =
      spec.validation_policy?.eslint || "BLOCK_ON_ERRORS_ONLY";
    const typescriptStrategy =
      spec.validation_policy?.typescript || "BLOCK_ON_ERRORS_ALWAYS";
    const maxWarnings = spec.validation_policy?.max_warnings ?? 10;
    const ignoredRules = JSON.stringify(
      spec.validation_policy?.ignored_rules || []
    );
    const errorOnRules = JSON.stringify(
      spec.validation_policy?.error_on_rules || []
    );
    const strictMode = spec.validation_policy?.strict_mode !== false; // default true

    // Build completion criteria
    const allStepsMustPass = spec.completion?.all_steps_must_pass || false;
    const minimumPassRate = spec.completion?.minimum_pass_rate || 60;

    // Build dependencies
    const dependencies = JSON.stringify(spec.dependencies || []);

    // Priority
    const priority = spec.priority || "MEDIUM";

    // Timeout
    const globalTimeout = spec.timeout || 300000;

    // API-specific variables
    const httpMethod = spec.api?.method || "GET";
    const apiEndpoint = spec.api?.endpoint || "/api/endpoint";
    const baseUrl = spec.api?.base_url || "http://localhost:3000";

    return {
      "{{PROJECT_NAME}}": projectName,
      "{{SPRINT_ID}}": sprintId,
      "{{TASK_ID}}": spec.task_id,
      "{{TASK_TITLE}}": spec.title,
      "{{TASK_DESCRIPTION}}":
        spec.description || `Execute ${spec.type} for ${spec.title}`,
      "{{GENERATED_AT}}": now,
      "{{WORKSPACE_ROOT}}": spec.workspace_root || "${WORKSPACE_ROOT}",
      "{{TEST_FILE_PATH}}": spec.test_file,
      "{{TEST_FILE_NAME}}": testFileName,
      "{{HTTP_METHOD}}": httpMethod,
      "{{API_ENDPOINT}}": apiEndpoint,
      "{{BASE_URL}}": baseUrl,
      "{{ESLINT_STRATEGY}}": eslintStrategy,
      "{{ESLINT_BLOCK_ON}}": this.convertStrategyToBlockOn(eslintStrategy),
      "{{TYPESCRIPT_STRATEGY}}": typescriptStrategy,
      "{{TYPESCRIPT_BLOCK_ON}}":
        this.convertStrategyToBlockOn(typescriptStrategy),
      "{{MAX_WARNINGS}}": maxWarnings.toString(),
      "{{IGNORED_RULES}}": ignoredRules,
      "{{ERROR_ON_RULES}}": errorOnRules,
      "{{STRICT_MODE}}": strictMode.toString(),
      "{{ALL_STEPS_MUST_PASS}}": allStepsMustPass.toString(),
      "{{MINIMUM_PASS_RATE}}": minimumPassRate.toString(),
      "{{DEPENDENCIES}}": dependencies,
      "{{PRIORITY}}": priority,
      "{{GLOBAL_TIMEOUT}}": globalTimeout.toString(),
    };
  }

  /**
   * Convert strategy enum to blockOn enum
   */
  convertStrategyToBlockOn(strategy) {
    const mapping = {
      BLOCK_ON_ERRORS_ALWAYS: "ERRORS_ALWAYS",
      BLOCK_ON_ERRORS_ONLY: "ERRORS_ONLY",
      BLOCK_ON_ERRORS_AND_WARNINGS: "ERRORS_AND_WARNINGS",
      WARN_ONLY: "WARN_ONLY",
      NEVER: "NEVER",
    };
    return mapping[strategy] || "ERRORS_ONLY";
  }

  /**
   * Substitute variables in template
   * Strategy: Determine if value should be unquoted (numbers, booleans, arrays) or quoted (strings)
   */
  substituteVariables(template, variableMap) {
    let jsonString = JSON.stringify(template, null, 2);

    for (const [placeholder, value] of Object.entries(variableMap)) {
      // Determine if value represents a non-string type
      const isNonString =
        value === "true" ||
        value === "false" || // booleans
        /^\d+(\.\d+)?$/.test(value) || // numbers
        value.startsWith("[") ||
        value.startsWith("{"); // arrays/objects

      if (isNonString) {
        // Replace quoted placeholder with unquoted value (type conversion)
        const quotedPlaceholder = `"${placeholder}"`;
        const quotedRegex = new RegExp(
          quotedPlaceholder.replace(/[{}]/g, "\\$&"),
          "g"
        );
        jsonString = jsonString.replace(quotedRegex, value);
      } else {
        // For strings, keep the quotes - replace only the placeholder part
        const regex = new RegExp(placeholder.replace(/[{}]/g, "\\$&"), "g");
        jsonString = jsonString.replace(regex, value);
      }
    }

    return JSON.parse(jsonString);
  }

  /**
   * Validate generated JSON against authoritative schema
   */
  validateGeneratedJson(jsonSpec, yamlPath) {
    const validate = this.ajv.compile(this.authoritativeSchema);
    const valid = validate(jsonSpec);

    if (!valid) {
      console.error(`✗ Generated JSON validation failed for ${yamlPath}:`);
      validate.errors.forEach((error) => {
        console.error(`  - ${error.instancePath}: ${error.message}`);
        if (error.params) {
          console.error(`    Params:`, JSON.stringify(error.params, null, 2));
        }
      });
      return false;
    }

    console.log(`✓ Generated JSON validates against authoritative schema`);
    return true;
  }

  /**
   * Write generated JSON to file
   */
  writeOutput(jsonSpec, outputPath) {
    try {
      const jsonString = JSON.stringify(jsonSpec, null, 2);
      fs.writeFileSync(outputPath, jsonString, "utf8");
      console.log(`✓ Written to: ${outputPath}`);
    } catch (error) {
      console.error(`✗ Failed to write output:`, error.message);
      process.exit(1);
    }
  }

  /**
   * Generate test specification from YAML
   */
  generate(yamlPath, outputPath, validateOnly = false) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Generating: ${yamlPath}`);
    console.log("=".repeat(60));

    // Load and validate YAML
    const yamlSpec = this.loadYamlSpec(yamlPath);
    this.validateYamlSpec(yamlSpec, yamlPath);

    // Load template
    const template = this.loadTemplate(yamlSpec.type);

    // Build variable map and substitute
    const variableMap = this.buildVariableMap(yamlSpec);
    const generatedJson = this.substituteVariables(template, variableMap);

    // Validate generated JSON
    const valid = this.validateGeneratedJson(generatedJson, yamlPath);

    if (!valid) {
      process.exit(1);
    }

    // Write output (unless validate-only)
    if (!validateOnly) {
      this.writeOutput(generatedJson, outputPath);
    } else {
      console.log(`✓ Validation successful (dry run, no output written)`);
    }

    return generatedJson;
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
CODOR Test Specification Generator v1.0.0

Usage:
  node generate-test-spec.js <yaml-file> [-o output.json] [--validate-only]
  node generate-test-spec.js examples/*.yaml -o generated/

Options:
  -o, --output <path>   Output file or directory
  --validate-only       Validate without writing output
  -h, --help            Show this help message

Examples:
  # Generate single spec
  node generate-test-spec.js T004-spec.yaml -o T004-test-specification.json

  # Generate multiple specs
  node generate-test-spec.js examples/*.yaml -o generated/

  # Validate only (dry run)
  node generate-test-spec.js T004-spec.yaml --validate-only

Available Template Types:
  - contract-test         (API endpoint contract testing)
  - integration-test      (Multi-component integration)
  - unit-test             (Isolated unit tests)
  - e2e-test              (Browser-based E2E)
  - database-migration    (Database schema changes)
    `);
    process.exit(0);
  }

  // Parse arguments
  const validateOnly = args.includes("--validate-only");
  const outputIndex = args.findIndex(
    (arg) => arg === "-o" || arg === "--output"
  );
  const outputPath = outputIndex !== -1 ? args[outputIndex + 1] : null;
  const yamlFiles = args.filter(
    (arg) =>
      !arg.startsWith("-") &&
      arg !== outputPath &&
      (arg.endsWith(".yaml") || arg.endsWith(".yml"))
  );

  if (yamlFiles.length === 0) {
    console.error("✗ No YAML files specified");
    process.exit(1);
  }

  // Initialize generator
  const generator = new TestSpecGenerator();
  generator.loadSchemas();

  // Process each YAML file
  let successCount = 0;
  let failCount = 0;

  yamlFiles.forEach((yamlFile) => {
    try {
      // Determine output path
      let output;
      if (validateOnly) {
        output = null;
      } else if (outputPath) {
        if (
          fs.existsSync(outputPath) &&
          fs.statSync(outputPath).isDirectory()
        ) {
          // Output is directory
          const baseName = path.basename(yamlFile, path.extname(yamlFile));
          output = path.join(outputPath, `${baseName}-test-specification.json`);
        } else {
          // Output is file (only works for single input)
          output = outputPath;
        }
      } else {
        // Default: same directory as YAML, with -test-specification.json suffix
        const baseName = path.basename(yamlFile, path.extname(yamlFile));
        const dirName = path.dirname(yamlFile);
        output = path.join(dirName, `${baseName}-test-specification.json`);
      }

      generator.generate(yamlFile, output, validateOnly);
      successCount++;
    } catch (error) {
      console.error(`✗ Failed to process ${yamlFile}:`, error.message);
      failCount++;
    }
  });

  // Summary
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Summary: ${successCount} succeeded, ${failCount} failed`);
  console.log("=".repeat(60));

  process.exit(failCount > 0 ? 1 : 0);
}

// Run CLI
if (require.main === module) {
  main();
}

module.exports = { TestSpecGenerator };
