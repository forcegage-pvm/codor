/**
 * Constitutional Specify Interceptor
 *
 * Intercepts GitHub Spec Kit /specify commands and enhances them with
 * constitutional requirements and validation frameworks.
 */

const fs = require("fs").promises;
const path = require("path");

class ConstitutionalSpecifyInterceptor {
  constructor() {
    this.configPath = path.join(
      __dirname,
      "../config/constitution-config.json"
    );
    this.constitutionPath = ".specify/memory/constitution.md";
  }

  async intercept(originalSpecifyPrompt, context = {}) {
    try {
      const config = await this.loadConfig();
      const constitution = await this.loadConstitution();

      if (!config.specKitIntegration.interceptSpecify) {
        return originalSpecifyPrompt;
      }

      return this.enhanceSpecifyPrompt(
        originalSpecifyPrompt,
        constitution,
        config,
        context
      );
    } catch (error) {
      console.error("Constitutional specify interceptor failed:", error);
      return originalSpecifyPrompt;
    }
  }

  async enhanceSpecifyPrompt(originalPrompt, constitution, config, context) {
    const enhancement = `
# Constitutional Specification Enhancement

## Original Specification Request
${originalPrompt}

## Constitutional Specification Framework

### Enhanced Requirements Structure
All specifications generated must include the following constitutional compliance sections:

#### Constitutional Alignment Section
\`\`\`markdown
## Constitutional Compliance

### Applicable Constitutional Principles
- [List specific constitutional principles that apply to this specification]
- [Reference relevant sections of the constitution]

### Compliance Requirements
- [Specific requirements derived from constitutional principles]
- [Validation criteria for constitutional adherence]

### Anti-Circumnavigation Measures
- [Specific measures to prevent bypassing constitutional requirements]
- [Audit and validation checkpoints]
\`\`\`

#### Validation Framework Section
\`\`\`markdown
## Validation Framework

### Three-Gate Validation System
1. **Pre-Implementation Gate**
   - Constitutional compliance review
   - Resource availability validation
   - Success criteria establishment

2. **Integration Testing Gate**
   - Mandatory integration testing validation
   - Constitutional validation during execution
   - Real-time compliance monitoring

3. **Post-Implementation Gate**
   - Final constitutional compliance verification
   - Evidence package completeness
   - Documentation review

### Success Criteria
- [ ] All constitutional requirements met
- [ ] Three-gate validation system passes
- [ ] Complete evidence collection
- [ ] No constitutional violations detected
\`\`\`

#### Evidence Collection Requirements
\`\`\`markdown
## Evidence Collection Framework

### Mandatory Evidence Types
1. **Technical Evidence**
   - Test results and execution logs
   - Performance metrics and benchmarks
   - Error handling validation

2. **Compliance Evidence**
   - Constitutional adherence documentation
   - Validation gate completion records
   - Audit trail documentation

3. **Visual Evidence**
   - Screenshots of functionality
   - UI/UX validation captures
   - Process flow documentation

### Evidence Storage Structure
- \`/evidence/test-results/\` - All test execution results
- \`/evidence/screenshots/\` - Visual validation captures
- \`/evidence/logs/\` - Complete execution and error logs
- \`/evidence/compliance/\` - Constitutional compliance documentation
\`\`\`

### Constitutional Context Integration
The specification must incorporate these constitutional principles:

${constitution}

### Enhanced Specification Template
All specifications must follow this enhanced structure:

\`\`\`markdown
# [Specification Title]

## Overview
[Original specification content]

## Constitutional Compliance
### Applicable Constitutional Principles
[Relevant constitutional principles]

### Compliance Requirements
[Specific constitutional requirements]

## Technical Requirements
[Enhanced with constitutional validation requirements]

## Validation Framework
### Three-Gate System
[Detailed gate requirements]

### Evidence Collection
[Specific evidence requirements]

## Implementation Guidelines
[Enhanced with constitutional checkpoints]

## Success Criteria
[Including constitutional compliance criteria]

## Anti-Circumnavigation Measures
[Specific measures to ensure compliance]
\`\`\`

${
  config.antiCircumnavigation.enabled
    ? `
## Strict Enforcement Notice
**CONSTITUTIONAL ENFORCEMENT ACTIVE**
- All specifications must include mandatory validation frameworks
- Evidence collection requirements are non-negotiable
- Constitutional compliance is verified at multiple checkpoints
- Circumnavigation attempts will be detected and flagged
`
    : ""
}

---
*This specification has been enhanced with constitutional compliance requirements. Implementation must follow the three-gate validation system and complete evidence collection framework.*
`;

    return enhancement;
  }

  async loadConfig() {
    try {
      const configData = await fs.readFile(this.configPath, "utf8");
      return JSON.parse(configData);
    } catch (error) {
      return {
        specKitIntegration: { interceptSpecify: true },
        antiCircumnavigation: { enabled: true },
      };
    }
  }

  async loadConstitution() {
    try {
      const constitutionData = await fs.readFile(this.constitutionPath, "utf8");
      return constitutionData;
    } catch (error) {
      return "Constitutional principles: Ensure comprehensive validation, evidence collection, and compliance verification in all specifications.";
    }
  }
}

module.exports = ConstitutionalSpecifyInterceptor;
