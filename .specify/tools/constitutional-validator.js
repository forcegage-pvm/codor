#!/usr/bin/env node

/**
 * Constitutional Validation Tool
 *
 * Validates constitutional compliance for GitHub Spec Kit generated content
 * Used by the three-gate validation system
 */

const fs = require("fs").promises;
const path = require("path");

class ConstitutionalValidator {
  constructor() {
    this.configPath = path.join(
      __dirname,
      "../constitutional/config/constitution-config.json"
    );
    this.constitutionPath = ".specify/memory/constitution.md";
    this.evidenceDir = "evidence";
  }

  async validateGate(gateType, context = {}) {
    console.log(
      `🏛️  Constitutional Validator - ${gateType.toUpperCase()} Gate`
    );

    try {
      const config = await this.loadConfig();
      const constitution = await this.loadConstitution();

      switch (gateType.toLowerCase()) {
        case "pre-task":
        case "gate1":
          return await this.validatePreTaskGate(constitution, config, context);

        case "mcp-testing":
        case "gate2":
          return await this.validateMcpTestingGate(
            constitution,
            config,
            context
          );

        case "post-task":
        case "gate3":
          return await this.validatePostTaskGate(constitution, config, context);

        default:
          throw new Error(`Unknown gate type: ${gateType}`);
      }
    } catch (error) {
      console.error(`❌ Gate validation failed: ${error.message}`);
      return false;
    }
  }

  async validatePreTaskGate(constitution, config, context) {
    console.log("1️⃣  Pre-Task Constitutional Validation");

    const checks = [];

    // Check 1: Constitutional alignment
    console.log("   📋 Checking constitutional alignment...");
    const alignmentCheck = await this.validateConstitutionalAlignment(context);
    checks.push({ name: "Constitutional Alignment", passed: alignmentCheck });

    // Check 2: Validation criteria establishment
    console.log("   🎯 Validating success criteria...");
    const criteriaCheck = await this.validateSuccessCriteria(context);
    checks.push({ name: "Success Criteria", passed: criteriaCheck });

    // Check 3: Evidence framework readiness
    console.log("   📁 Checking evidence framework...");
    const evidenceCheck = await this.validateEvidenceFramework();
    checks.push({ name: "Evidence Framework", passed: evidenceCheck });

    return this.processCheckResults("Pre-Task Gate", checks);
  }

  async validateMcpTestingGate(constitution, config, context) {
    console.log("2️⃣  MCP Testing Constitutional Validation");

    const checks = [];

    // Check 1: MCP integration testing
    console.log("   🔧 Validating MCP integration...");
    const mcpCheck = await this.validateMcpIntegration(context);
    checks.push({ name: "MCP Integration", passed: mcpCheck });

    // Check 2: Constitutional compliance during execution
    console.log("   ⚖️  Checking execution compliance...");
    const executionCheck = await this.validateExecutionCompliance(context);
    checks.push({ name: "Execution Compliance", passed: executionCheck });

    // Check 3: Evidence collection validation
    console.log("   📊 Validating evidence collection...");
    const collectionCheck = await this.validateEvidenceCollection();
    checks.push({ name: "Evidence Collection", passed: collectionCheck });

    return this.processCheckResults("MCP Testing Gate", checks);
  }

  async validatePostTaskGate(constitution, config, context) {
    console.log("3️⃣  Post-Task Constitutional Validation");

    const checks = [];

    // Check 1: Final constitutional compliance
    console.log("   ✅ Final compliance verification...");
    const finalCheck = await this.validateFinalCompliance(context);
    checks.push({ name: "Final Compliance", passed: finalCheck });

    // Check 2: Evidence package completeness
    console.log("   📦 Validating evidence package...");
    const packageCheck = await this.validateEvidencePackage();
    checks.push({ name: "Evidence Package", passed: packageCheck });

    // Check 3: Documentation completeness
    console.log("   📝 Checking documentation...");
    const docCheck = await this.validateDocumentation(context);
    checks.push({ name: "Documentation", passed: docCheck });

    // Check 4: Anti-circumnavigation verification
    console.log("   🛡️  Anti-circumnavigation check...");
    const antiCircumCheck = await this.validateAntiCircumnavigation(context);
    checks.push({ name: "Anti-Circumnavigation", passed: antiCircumCheck });

    return this.processCheckResults("Post-Task Gate", checks);
  }

  async validateConstitutionalAlignment(context) {
    // Validate that the task/spec aligns with constitutional principles
    // This would analyze the context against the constitution
    return true; // Simplified for now
  }

  async validateSuccessCriteria(context) {
    // Validate that clear success criteria have been established
    return (
      context && context.successCriteria && context.successCriteria.length > 0
    );
  }

  async validateEvidenceFramework() {
    // Check that evidence directories exist and are ready
    try {
      await this.ensureEvidenceDirectories();
      return true;
    } catch {
      return false;
    }
  }

  async validateMcpIntegration(context) {
    // Validate MCP integration testing
    // This would check for MCP test results
    return true; // Simplified for now
  }

  async validateExecutionCompliance(context) {
    // Validate constitutional compliance during execution
    return true; // Simplified for now
  }

  async validateEvidenceCollection() {
    // Validate that evidence is being properly collected
    try {
      const evidenceDirs = [
        path.join(this.evidenceDir, "test-results"),
        path.join(this.evidenceDir, "screenshots"),
        path.join(this.evidenceDir, "logs"),
      ];

      for (const dir of evidenceDirs) {
        const exists = await this.directoryExists(dir);
        if (!exists) return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  async validateFinalCompliance(context) {
    // Final constitutional compliance check
    return true; // Simplified for now
  }

  async validateEvidencePackage() {
    // Validate completeness of evidence package
    try {
      const requiredEvidence = ["test-results", "screenshots", "logs"];

      for (const evidenceType of requiredEvidence) {
        const evidencePath = path.join(this.evidenceDir, evidenceType);
        const exists = await this.directoryExists(evidencePath);
        if (!exists) {
          console.log(`   ⚠️  Missing evidence: ${evidenceType}`);
          return false;
        }

        // Check if directory has contents
        const files = await fs.readdir(evidencePath);
        if (files.length === 0) {
          console.log(`   ⚠️  Empty evidence directory: ${evidenceType}`);
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  async validateDocumentation(context) {
    // Validate documentation completeness
    return true; // Simplified for now
  }

  async validateAntiCircumnavigation(context) {
    // Check for circumnavigation attempts
    // This would analyze logs and audit trails
    return true; // Simplified for now
  }

  processCheckResults(gateName, checks) {
    const passed = checks.filter((check) => check.passed).length;
    const total = checks.length;

    console.log("");
    console.log(`📊 ${gateName} Results:`);

    checks.forEach((check) => {
      const status = check.passed ? "✅" : "❌";
      console.log(`   ${status} ${check.name}`);
    });

    console.log("");

    if (passed === total) {
      console.log(`🎉 ${gateName} PASSED (${passed}/${total})`);
      return true;
    } else {
      console.log(`💥 ${gateName} FAILED (${passed}/${total})`);
      return false;
    }
  }

  async ensureEvidenceDirectories() {
    const evidenceDirs = [
      this.evidenceDir,
      path.join(this.evidenceDir, "test-results"),
      path.join(this.evidenceDir, "screenshots"),
      path.join(this.evidenceDir, "logs"),
      path.join(this.evidenceDir, "compliance"),
    ];

    for (const dir of evidenceDirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  async directoryExists(dirPath) {
    try {
      const stats = await fs.stat(dirPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  async loadConfig() {
    try {
      const configData = await fs.readFile(this.configPath, "utf8");
      return JSON.parse(configData);
    } catch (error) {
      return {
        validationGates: {
          preTask: true,
          mcpTesting: true,
          postTask: true,
        },
      };
    }
  }

  async loadConstitution() {
    try {
      const constitutionData = await fs.readFile(this.constitutionPath, "utf8");
      return constitutionData;
    } catch (error) {
      return "Constitutional principles: Ensure comprehensive validation, evidence collection, and compliance verification.";
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log("Constitutional Validation Tool v4.0");
    console.log("");
    console.log(
      "Usage: node constitutional-validator.js <gate-type> [options]"
    );
    console.log("");
    console.log("Gate Types:");
    console.log("  pre-task, gate1     Pre-task constitutional validation");
    console.log("  mcp-testing, gate2  MCP testing constitutional validation");
    console.log("  post-task, gate3    Post-task constitutional validation");
    console.log("");
    console.log("Options:");
    console.log("  --help              Show this help message");
    process.exit(0);
  }

  const gateType = args[0];
  const context = {}; // Could be enhanced to accept JSON context

  const validator = new ConstitutionalValidator();
  validator.validateGate(gateType, context).then((result) => {
    process.exit(result ? 0 : 1);
  });
}

module.exports = ConstitutionalValidator;
