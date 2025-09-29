/**
 * Constitutional Task Interceptor
 *
 * Intercepts GitHub Spec Kit /tasks commands and enhances them with
 * constitutional requirements, validation gates, and evidence collection.
 */

const fs = require("fs").promises;
const path = require("path");

class ConstitutionalTaskInterceptor {
  constructor() {
    this.configPath = path.join(
      __dirname,
      "../config/constitution-config.json"
    );
    this.constitutionPath = ".specify/memory/constitution.md";
  }

  async intercept(originalTaskPrompt, context = {}) {
    try {
      const config = await this.loadConfig();
      const constitution = await this.loadConstitution();

      if (!config.specKitIntegration.interceptTasks) {
        return originalTaskPrompt; // Pass through if disabled
      }

      return this.enhanceTaskPrompt(
        originalTaskPrompt,
        constitution,
        config,
        context
      );
    } catch (error) {
      console.error("Constitutional task interceptor failed:", error);
      return originalTaskPrompt; // Fail gracefully
    }
  }

  async enhanceTaskPrompt(originalPrompt, constitution, config, context) {
    const enhancement = `
# Constitutional Task Enhancement

## Original Task Requirements
${originalPrompt}

## Constitutional Compliance Requirements
Based on the project constitution, the following compliance requirements are mandatory:

### Pre-Task Validation Gate
Before beginning implementation:
1. **Constitutional Review**: Verify the task aligns with constitutional principles
2. **Validation Criteria**: Establish clear success criteria based on constitutional requirements
3. **Evidence Framework**: Define what evidence must be collected during implementation

### Implementation Requirements
All tasks must include:

#### Evidence Collection
- **Test Results**: Comprehensive testing with documented results
- **Screenshots**: Visual evidence of functionality (where applicable)
- **Logs**: Complete execution logs and error handling validation
- **Documentation**: Clear explanation of constitutional compliance

#### Three-Gate Validation System
1. **Gate 1 - Pre-Implementation**
   - Constitutional compliance check
   - Resource validation
   - Success criteria definition

2. **Gate 2 - MCP Testing**
   - Mandatory MCP integration testing
   - Constitutional validation during execution
   - Evidence collection validation

3. **Gate 3 - Post-Implementation**
   - Final constitutional compliance verification
   - Complete evidence package validation
   - Documentation completeness check

### Enhanced Task Structure
Each generated task must include:

\`\`\`markdown
## Task: [Task Name]

### Constitutional Requirements
- [Specific constitutional principles that apply]
- [Compliance criteria based on constitution]

### Implementation Steps
[Original implementation steps enhanced with validation checkpoints]

### Validation Gates
- [ ] **Gate 1**: Pre-implementation constitutional check
- [ ] **Gate 2**: MCP testing with constitutional validation
- [ ] **Gate 3**: Post-implementation compliance verification

### Evidence Collection Requirements
- [ ] Test results documented in /evidence/test-results/
- [ ] Screenshots saved to /evidence/screenshots/
- [ ] Execution logs in /evidence/logs/
- [ ] Constitutional compliance report

### Success Criteria
- All validation gates passed
- Complete evidence package collected
- Constitutional compliance verified
- No circumnavigation attempts detected
\`\`\`

## Anti-Circumnavigation Measures
${
  config.antiCircumnavigation.enabled
    ? `
**STRICT ENFORCEMENT ACTIVE**
- All tasks must include mandatory validation gates
- Evidence collection is non-optional
- Constitutional compliance is verified at each gate
- Audit trail maintained for all activities
`
    : ""
}

## Constitutional Context
${constitution}

---
*This task has been enhanced with constitutional requirements. All validation gates must be completed before the task is considered complete.*
`;

    return enhancement;
  }

  async loadConfig() {
    try {
      const configData = await fs.readFile(this.configPath, "utf8");
      return JSON.parse(configData);
    } catch (error) {
      console.error("Failed to load constitutional config:", error);
      // Return default config
      return {
        specKitIntegration: { interceptTasks: true },
        antiCircumnavigation: { enabled: true },
      };
    }
  }

  async loadConstitution() {
    try {
      const constitutionData = await fs.readFile(this.constitutionPath, "utf8");
      return constitutionData;
    } catch (error) {
      console.warn("Constitution file not found, using default principles");
      return "Constitutional principles: Ensure comprehensive validation, evidence collection, and compliance verification in all implementations.";
    }
  }
}

module.exports = ConstitutionalTaskInterceptor;
