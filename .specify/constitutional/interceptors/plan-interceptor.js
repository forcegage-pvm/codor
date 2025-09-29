/**
 * Constitutional Plan Interceptor
 *
 * Intercepts GitHub Spec Kit /plan commands and enhances them with
 * constitutional compliance milestones and validation checkpoints.
 */

const fs = require("fs").promises;
const path = require("path");

class ConstitutionalPlanInterceptor {
  constructor() {
    this.configPath = path.join(
      __dirname,
      "../config/constitution-config.json"
    );
    this.constitutionPath = ".specify/memory/constitution.md";
  }

  async intercept(originalPlanPrompt, context = {}) {
    try {
      const config = await this.loadConfig();
      const constitution = await this.loadConstitution();

      if (!config.specKitIntegration.interceptPlan) {
        return originalPlanPrompt;
      }

      return this.enhancePlanPrompt(
        originalPlanPrompt,
        constitution,
        config,
        context
      );
    } catch (error) {
      console.error("Constitutional plan interceptor failed:", error);
      return originalPlanPrompt;
    }
  }

  async enhancePlanPrompt(originalPrompt, constitution, config, context) {
    const enhancement = `
# Constitutional Project Planning Enhancement

## Original Planning Request
${originalPrompt}

## Constitutional Planning Framework

### Enhanced Planning Structure
All project plans must incorporate constitutional compliance at every phase:

#### Phase Planning with Constitutional Gates
Each project phase must include:

\`\`\`markdown
## Phase [N]: [Phase Name]

### Phase Objectives
[Original phase objectives]

### Constitutional Compliance Requirements
- [Specific constitutional principles for this phase]
- [Compliance milestones and checkpoints]

### Validation Gates for Phase
1. **Phase Entry Gate**
   - Constitutional readiness assessment
   - Resource constitutional compliance
   - Success criteria constitutional alignment

2. **Mid-Phase Validation Gate**
   - Constitutional compliance monitoring
   - Evidence collection checkpoint
   - Course correction if needed

3. **Phase Exit Gate**
   - Constitutional compliance verification
   - Evidence package completion
   - Phase success criteria validation

### Evidence Collection Milestones
- [ ] Phase planning evidence documented
- [ ] Constitutional compliance evidence collected
- [ ] Validation gate evidence archived
- [ ] Phase completion evidence verified

### Constitutional Checkpoints
- [ ] Constitutional principle adherence verified
- [ ] Anti-circumnavigation measures active
- [ ] Validation framework operational
- [ ] Evidence collection system functional
\`\`\`

### Constitutional Project Structure Template
\`\`\`markdown
# Project Plan: [Project Name]

## Project Overview
[Enhanced with constitutional requirements]

## Constitutional Framework Integration
### Applicable Constitutional Principles
${constitution}

### Project Constitutional Requirements
- [Specific constitutional requirements for entire project]
- [Cross-phase compliance requirements]

## Phase Breakdown

### Phase 1: Constitutional Setup & Validation Framework
**Objectives:**
- Establish constitutional compliance foundation
- Set up three-gate validation system
- Create evidence collection framework

**Constitutional Requirements:**
- Constitution integration verification
- Validation system operational testing
- Evidence collection system setup

**Deliverables:**
- [ ] Constitutional compliance baseline
- [ ] Three-gate validation system active
- [ ] Evidence collection framework operational
- [ ] Anti-circumnavigation measures deployed

### Phase 2: [Original Phase] + Constitutional Integration
**Objectives:**
[Original phase objectives enhanced with constitutional requirements]

**Constitutional Milestones:**
- [ ] Constitutional compliance maintained
- [ ] Evidence collected at all gates
- [ ] Validation checkpoints passed

[Continue for all phases...]

## Project-Level Constitutional Validation
### Master Validation Gates
1. **Project Initiation Gate**
   - Constitutional framework establishment
   - Validation system deployment
   - Evidence collection readiness

2. **Mid-Project Constitutional Review**
   - Cross-phase constitutional compliance
   - Evidence package audit
   - Validation system effectiveness review

3. **Project Completion Gate**
   - Final constitutional compliance verification
   - Complete evidence package validation
   - Constitutional success criteria fulfillment

### Evidence Collection Strategy
- **Phase Evidence**: Collected at each phase completion
- **Gate Evidence**: Documented at each validation gate
- **Compliance Evidence**: Constitutional adherence documentation
- **Audit Evidence**: Anti-circumnavigation verification

### Constitutional Success Criteria
- [ ] All phases completed with constitutional compliance
- [ ] Complete evidence package collected and verified
- [ ] No constitutional violations detected
- [ ] All validation gates successfully passed
- [ ] Anti-circumnavigation measures effective throughout
\`\`\`

${
  config.antiCircumnavigation.enabled
    ? `
## Project-Level Anti-Circumnavigation Framework
**STRICT CONSTITUTIONAL ENFORCEMENT**

### Project Monitoring
- Constitutional compliance monitored at every milestone
- Evidence collection verified at each gate
- Circumnavigation attempts detected and documented
- Audit trail maintained for entire project lifecycle

### Enforcement Mechanisms
- Mandatory constitutional checkpoints
- Evidence collection verification
- Validation gate completion requirements
- Constitutional success criteria enforcement
`
    : ""
}

### Constitutional Planning Checklist
Before any project plan is considered complete, verify:
- [ ] Constitutional principles integrated into all phases
- [ ] Three-gate validation system planned for each phase
- [ ] Evidence collection framework designed and ready
- [ ] Anti-circumnavigation measures planned and documented
- [ ] Constitutional success criteria clearly defined
- [ ] Project-level constitutional validation gates established

---
*This project plan has been enhanced with comprehensive constitutional compliance requirements. All phases must complete constitutional validation gates and evidence collection before proceeding.*
`;

    return enhancement;
  }

  async loadConfig() {
    try {
      const configData = await fs.readFile(this.configPath, "utf8");
      return JSON.parse(configData);
    } catch (error) {
      return {
        specKitIntegration: { interceptPlan: true },
        antiCircumnavigation: { enabled: true },
      };
    }
  }

  async loadConstitution() {
    try {
      const constitutionData = await fs.readFile(this.constitutionPath, "utf8");
      return constitutionData;
    } catch (error) {
      return "Constitutional principles: Ensure comprehensive validation, evidence collection, and compliance verification in all project phases.";
    }
  }
}

module.exports = ConstitutionalPlanInterceptor;
