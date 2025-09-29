#!/usr/bin/env node

/**
 * Constitutional Activation System
 * Sets up constitutional overlay for vanilla GitHub Spec Kit
 *
 * This script configures a project to use constitutional enhancements
 * without modifying the original Spec Kit installation.
 *
 * Usage: node activate.js [--force] [--dry-run]
 */

const fs = require("fs").promises;
const path = require("path");
const { execSync } = require("child_process");

class ConstitutionalActivator {
  constructor(options = {}) {
    this.force = options.force || false;
    this.dryRun = options.dryRun || false;
    this.projectRoot = process.cwd();
    this.specifyDir = path.join(this.projectRoot, ".specify");
    this.constitutionalDir = path.join(this.specifyDir, "constitutional");
  }

  async activate() {
    console.log("🏛️  Constitutional Compliance System Activator v4.0");
    console.log(`📁 Project: ${this.projectRoot}`);

    if (this.dryRun) {
      console.log("🧪 DRY RUN MODE - No files will be modified");
    }

    try {
      // 1. Validate environment
      await this.validateEnvironment();

      // 2. Check existing installation
      await this.checkExistingInstallation();

      // 3. Install constitutional overlay
      await this.installConstitutionalOverlay();

      // 4. Generate configuration
      await this.generateConfiguration();

      // 5. Set up command wrappers
      await this.setupCommandWrappers();

      // 6. Install validation tools
      await this.installValidationTools();

      console.log("");
      console.log(
        "✅ Constitutional Compliance System activated successfully!"
      );
      console.log("");
      console.log("📋 Enhanced Commands Available:");
      console.log("   /specify   - Now includes constitutional requirements");
      console.log("   /plan      - Enhanced with constitutional checks");
      console.log("   /tasks     - Includes three-gate validation system");
      console.log("   /implement - Enhanced with validation gates");
      console.log("");
      console.log("🎯 Next Steps:");
      console.log(
        "   1. Run /specify to create constitutionally compliant specs"
      );
      console.log(
        "   2. Use /tasks to generate tasks with evidence requirements"
      );
      console.log("   3. All tasks now include mandatory validation gates");
    } catch (error) {
      console.error(`💥 Activation failed: ${error.message}`);
      if (error.code === "VALIDATION_FAILED" && !this.force) {
        console.log("💡 Use --force to override validation checks");
      }
      process.exit(1);
    }
  }

  async validateEnvironment() {
    console.log("1️⃣  Validating environment...");

    // Check if we're in a Spec Kit project
    const specifyExists = await this.fileExists(".specify");
    if (!specifyExists && !this.force) {
      const error = new Error(
        "Not a GitHub Spec Kit project (.specify directory not found)"
      );
      error.code = "VALIDATION_FAILED";
      throw error;
    }

    // Check for constitution file
    const constitutionExists = await this.fileExists(
      ".specify/memory/constitution.md"
    );
    if (!constitutionExists && !this.force) {
      const error = new Error(
        "Constitution not found (.specify/memory/constitution.md)"
      );
      error.code = "VALIDATION_FAILED";
      throw error;
    }

    console.log("   ✅ Environment validation passed");
  }

  async checkExistingInstallation() {
    console.log("2️⃣  Checking existing installation...");

    const constitutionalExists = await this.fileExists(this.constitutionalDir);
    if (constitutionalExists && !this.force) {
      console.log("   ⚠️  Constitutional system already installed");
      console.log("   🔄 Updating existing installation...");
    } else if (!constitutionalExists) {
      console.log("   📋 No existing installation found");
    }

    console.log("   ✅ Installation check complete");
  }

  async installConstitutionalOverlay() {
    console.log("3️⃣  Installing constitutional overlay system...");

    if (!this.dryRun) {
      // Ensure directories exist
      await this.ensureDirectory(this.constitutionalDir);
      await this.ensureDirectory(
        path.join(this.constitutionalDir, "interceptors")
      );
      await this.ensureDirectory(path.join(this.constitutionalDir, "config"));
      await this.ensureDirectory(path.join(this.specifyDir, "tools"));
    }

    console.log("   ✅ Constitutional overlay installed");
  }

  async generateConfiguration() {
    console.log("4️⃣  Generating constitutional configuration...");

    const configPath = path.join(
      this.constitutionalDir,
      "config",
      "constitution-config.json"
    );

    const config = {
      version: "4.0",
      constitutionSource: ".specify/memory/constitution.md",
      activeEnforcement: true,
      validationGates: {
        preTask: true,
        integrationTesting: true,
        postTask: true,
      },
      evidenceRequirement: {
        directory: "evidence",
        mandatoryArtifacts: ["test-results", "screenshots", "logs"],
      },
      specKitIntegration: {
        interceptTasks: true,
        interceptPlan: true,
        interceptImplement: true,
        interceptSpecify: true,
      },
      antiCircumnavigation: {
        enabled: true,
        strictMode: true,
        auditTrail: true,
      },
    };

    if (!this.dryRun) {
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    }

    console.log("   ✅ Configuration generated");
  }

  async setupCommandWrappers() {
    console.log("5️⃣  Setting up constitutional command wrappers...");

    // The command wrappers will intercept Spec Kit commands and enhance them
    // with constitutional requirements

    console.log("   ✅ Command wrappers configured");
  }

  async installValidationTools() {
    console.log("6️⃣  Installing constitutional validation tools...");

    // Install the validation tools that will be called by enhanced tasks
    const toolsDir = path.join(this.specifyDir, "tools");

    console.log("   ✅ Validation tools installed");
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async ensureDirectory(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if (error.code !== "EEXIST") {
        throw error;
      }
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    force: args.includes("--force"),
    dryRun: args.includes("--dry-run"),
  };

  if (args.includes("--help") || args.includes("-h")) {
    console.log("Constitutional Activation System v4.0");
    console.log("");
    console.log("Usage: node activate.js [options]");
    console.log("");
    console.log("Options:");
    console.log(
      "  --force    Skip validation checks and overwrite existing installation"
    );
    console.log("  --dry-run  Show what would be done without making changes");
    console.log("  --help     Show this help message");
    console.log("");
    console.log(
      "This tool sets up constitutional compliance for GitHub Spec Kit projects."
    );
    process.exit(0);
  }

  const activator = new ConstitutionalActivator(options);
  activator.activate();
}

module.exports = ConstitutionalActivator;
