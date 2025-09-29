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
1. **TDD Debt Blocking Check**: Verify no CRITICAL TDD debt blocks development (Constitutional Amendment VII)
2. **Constitutional Review**: Verify the task aligns with constitutional principles
3. **Validation Criteria**: Establish clear success criteria based on constitutional requirements
4. **Evidence Framework**: Define what evidence must be collected during implementation

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

2. **Gate 2 - Integration Testing**
   - Mandatory integration testing validation
   - Exact Functional Correspondence validation (Constitutional Amendment VI)
   - Constitutional validation during execution
   - Evidence collection validation

3. **Gate 3 - Post-Implementation**
   - TDD Debt Resolution validation (if debt task)
   - Anti-Fraud Enforcement checks (Constitutional Amendment VIII)
   - Final constitutional compliance verification
   - Complete evidence package validation
   - Documentation completeness check

### TDD Debt Management Framework
If this task involves TDD tests or API implementation:

\`\`\`markdown
## TDD Debt Tracking (Constitutional Amendment VII)

### Automated Debt Detection
- All test failures automatically analyzed and classified
- All debt added to inventory for tracking
- Only current sprint assigned debt blocks development
- Implementation tasks auto-generated (T{base}.{increment})

### Debt Classification:
- **CRITICAL**: Business logic gaps, security vulnerabilities (inventory tracking)
- **HIGH**: Performance issues, UX friction (next sprint priority)  
- **MEDIUM/LOW**: Enhancements, code quality (future consideration)

### Sprint Management:
- **Inventory**: All debt tracked, does not block development
- **Sprint Assignment**: Team assigns debt to current sprint
- **Blocking**: Only current sprint debt blocks development

### Pre-Task Requirement
Run constitutional validator to check for blocking current sprint debt:
\`node .specify/tools/constitutional-validator.js pre-task\`

If current sprint debt exists, resolve debt tasks first before proceeding.
\`\`\`

### Enhanced Task Structure
Each generated task must include:

\`\`\`markdown
## Task: [Task Name]

### Constitutional Requirements
- [Specific constitutional principles that apply]
- [TDD debt management compliance if applicable]
- [Compliance criteria based on constitution]

### Implementation Steps
[Original implementation steps enhanced with validation checkpoints]

### Validation Gates
- [ ] **Gate 1**: Pre-implementation constitutional check (includes TDD debt blocking)
- [ ] **Gate 2**: Integration testing with exact functional correspondence
- [ ] **Gate 3**: Post-implementation compliance verification

### Evidence Collection Requirements
- [ ] Test results documented in /evidence/test-results/
- [ ] Screenshots saved to /evidence/screenshots/
- [ ] Execution logs in /evidence/logs/
- [ ] Constitutional compliance report
- [ ] TDD debt resolution evidence (if debt task)

### Success Criteria
- All validation gates passed
- Complete evidence package collected
- Constitutional compliance verified
- TDD debt properly managed
- No fraud or circumnavigation attempts detected
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
