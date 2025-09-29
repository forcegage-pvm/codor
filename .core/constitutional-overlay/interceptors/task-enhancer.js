/**
 * Task Enhancement Layer
 * Extends vanilla GitHub Spec Kit tasks with constitutional requirements
 *
 * This module takes vanilla task markdown and enhances it with:
 * - Evidence directory requirements
 * - Three-gate validation system
 * - MCP testing requirements
 * - Anti-circumnavigation protocols
 */

const fs = require("fs").promises;

class TaskEnhancer {
  constructor(config) {
    this.config = config;
  }

  async enhance(vanillaTasksContent) {
    console.log("🔧 Parsing vanilla tasks...");

    // Parse the vanilla tasks content
    const lines = vanillaTasksContent.split("\n");
    const enhancedLines = [];
    let currentTask = null;
    let taskCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if this line is a task
      if (this.isTaskLine(line)) {
        // If we have a previous task, enhance it
        if (currentTask) {
          const enhancedTask = await this.enhanceTask(currentTask);
          enhancedLines.push(...enhancedTask);
          taskCount++;
        }

        // Start new task
        currentTask = {
          originalLine: line,
          lineNumber: i,
          id: this.extractTaskId(line),
          description: this.extractTaskDescription(line),
          isParallel: line.includes("[P]"),
        };
      } else {
        // If we're not in a task, add the line as-is
        if (!currentTask) {
          enhancedLines.push(line);
        }
      }
    }

    // Handle the last task
    if (currentTask) {
      const enhancedTask = await this.enhanceTask(currentTask);
      enhancedLines.push(...enhancedTask);
      taskCount++;
    }

    // Add constitutional header if tasks were enhanced
    if (taskCount > 0) {
      const headerLines = this.generateConstitutionalHeader(taskCount);
      enhancedLines.unshift(...headerLines);
    }

    console.log(
      `✅ Enhanced ${taskCount} tasks with constitutional requirements`
    );
    return enhancedLines.join("\n");
  }

  isTaskLine(line) {
    // Matches patterns like:
    // - [ ] T001 Description
    // - [ ] T008 [P] Description
    return /^- \[ \] T\d+/.test(line.trim());
  }

  extractTaskId(line) {
    const match = line.match(/T(\d+)/);
    return match ? match[0] : "T000";
  }

  extractTaskDescription(line) {
    // Remove checkbox, task ID, and [P] marker to get description
    const cleaned = line
      .replace(/^- \[ \]/, "")
      .replace(/T\d+/, "")
      .replace(/\[P\]/, "")
      .trim();
    return cleaned;
  }

  async enhanceTask(task) {
    const taskType = this.classifyTask(task);
    const evidenceReqs = this.generateEvidenceRequirements(task, taskType);
    const mcpReqs = this.generateMCPRequirements(task, taskType);
    const validationGates = this.generateValidationGates(task);

    const enhancedLines = [
      task.originalLine,
      `  - Evidence: ${evidenceReqs}`,
      `  - MCP: ${mcpReqs}`,
      `  - Validation: ${validationGates.preTask}`,
      `  - Completion: ${validationGates.postTask}`,
      "", // Empty line for readability
    ];

    return enhancedLines;
  }

  classifyTask(task) {
    const desc = task.description.toLowerCase();

    if (
      desc.includes("ui") ||
      desc.includes("component") ||
      desc.includes("modal") ||
      desc.includes("button") ||
      desc.includes("form") ||
      desc.includes("page")
    ) {
      return "ui";
    } else if (
      desc.includes("api") ||
      desc.includes("endpoint") ||
      desc.includes("route")
    ) {
      return "api";
    } else if (
      desc.includes("service") ||
      desc.includes("model") ||
      desc.includes("schema")
    ) {
      return "service";
    } else if (desc.includes("test") || desc.includes("contract")) {
      return "test";
    } else if (
      desc.includes("setup") ||
      desc.includes("config") ||
      desc.includes("init")
    ) {
      return "setup";
    }

    return "general";
  }

  generateEvidenceRequirements(task, type) {
    const baseEvidence = `evidence/${task.id}/ with`;

    switch (type) {
      case "ui":
        return `${baseEvidence} component implementation, browser testing screenshots`;
      case "api":
        return `${baseEvidence} endpoint implementation, contract test results`;
      case "service":
        return `${baseEvidence} service implementation, unit test coverage`;
      case "test":
        return `${baseEvidence} test implementation, test execution results`;
      case "setup":
        return `${baseEvidence} configuration changes, setup validation`;
      default:
        return `${baseEvidence} implementation artifacts, validation results`;
    }
  }

  generateMCPRequirements(task, type) {
    switch (type) {
      case "ui":
        return `**REQUIRED** - Browser test ${task.description} with interaction validation`;
      case "api":
        return `Browser test API endpoint with network tab validation`;
      case "test":
        return `N/A (test implementation)`;
      case "service":
        return `N/A (service layer)`;
      case "setup":
        return `N/A (configuration)`;
      default:
        return `Conditional based on task requirements`;
    }
  }

  generateValidationGates(task) {
    return {
      preTask: `node .specify/tools/pre-task-check.js ${task.id}`,
      postTask: `node .specify/tools/post-task-validation.js ${task.id}`,
    };
  }

  generateConstitutionalHeader(taskCount) {
    return [
      "",
      "## Constitutional Enforcement (MANDATORY)",
      "",
      "**CRITICAL**: ALL tasks below are protected by Constitutional Amendments 1-3:",
      "",
      "- **Pre-Task Gate**: node .specify/tools/pre-task-check.js [taskId] - MUST pass before starting",
      "- **Evidence Directory**: Create evidence/[taskId]/ with required artifacts",
      "- **MCP Browser Testing**: **REQUIRED** for ALL UI functionality - no exceptions",
      "- **Post-Task Gate**: node .specify/tools/post-task-validation.js [taskId] - 3-gate validation",
      "- **Constitutional Audit**: node .specify/tools/constitutional-audit.js - regular compliance checks",
      "",
      "**ANTI-HALLUCINATION PROTOCOL**: NO task completion marking [x] without validation evidence",
      "",
      `**Enhanced Tasks**: ${taskCount} tasks enhanced with constitutional compliance requirements`,
      "",
      "",
    ];
  }
}

module.exports = TaskEnhancer;
