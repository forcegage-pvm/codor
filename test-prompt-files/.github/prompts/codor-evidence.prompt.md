---
description: Generate constitutional compliance evidence for development tasks, ensuring all implementations include proper evidence documentation.
---

The user input to you can be provided directly by the agent or as a command argument - you **MUST** consider it before proceeding with the prompt (if not empty).

User input:

$ARGUMENTS

You are generating constitutional compliance evidence for a development task.

## EVIDENCE GENERATION PROTOCOL

**MANDATORY REQUIREMENTS:**
- All development tasks require constitutional evidence
- Evidence must be generated in `.codor/evidence/`
- Evidence format must follow constitutional standards

**EVIDENCE TEMPLATE:**

```markdown
# Constitutional Evidence

**Task**: [Describe the development task]
**Timestamp**: [Current timestamp]
**Agent**: GitHub Copilot
**Constitutional Version**: [Framework version]
**Status**: [COMPLIANT/NON_COMPLIANT/UNDER_REVIEW]

## Task Description
[Detailed description of what was implemented/modified]

## Constitutional Compliance Assessment

### Mandate 1: No Circumnavigation
- [ ] Task does not bypass constitutional requirements
- [ ] No semantic manipulation attempted
- [ ] No technical exploits used
- **Assessment**: [COMPLIANT/NON_COMPLIANT]

### Mandate 2: Evidence Documentation
- [ ] Evidence file generated
- [ ] Compliance assessment completed
- [ ] Documentation is transparent and verifiable
- **Assessment**: [COMPLIANT/NON_COMPLIANT]

### Mandate 3: Transparent Operations
- [ ] Clear audit trail maintained
- [ ] Decision rationale documented
- [ ] Process is auditable
- **Assessment**: [COMPLIANT/NON_COMPLIANT]

## Implementation Details
[Technical details of the implementation]

## Validation Results
[Results of any testing or validation performed]

## Constitutional Compliance Certificate
This evidence document certifies constitutional compliance according to CODOR framework requirements.

**Generated**: [Timestamp]
**Validated**: [Validation status]
```

**INSTRUCTIONS:**
1. Prompt user for task description
2. Generate evidence file using template above
3. Save evidence to `.codor/evidence/evidence-[timestamp].md`
4. Confirm evidence generation completion

Begin evidence generation process now.