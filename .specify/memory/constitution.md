# CODOR Constitutional Framework v4.0

## Core Principles

### I. NO CIRCUMNAVIGATION (NON-NEGOTIABLE)
AI agents MUST NOT attempt to bypass constitutional mandates through:
- Semantic manipulation or creative interpretation
- Technical exploits or indirect methods  
- Emergency exceptions or special circumstances
- Bypassing validation gates or evidence collection

### II. THREE-GATE VALIDATION SYSTEM (MANDATORY)
All implementations MUST complete mandatory validation gates:
- **Gate 1 - Pre-Implementation**: Constitutional compliance review, resource validation, success criteria establishment
- **Gate 2 - Integration Testing**: Mandatory integration testing with constitutional validation during execution  
- **Gate 3 - Post-Implementation**: Final constitutional compliance verification, complete evidence package validation

### III. EVIDENCE DOCUMENTATION (NON-NEGOTIABLE)
All implementations MUST generate verifiable evidence including:
- **Test Results**: Comprehensive testing with documented results in `/evidence/test-results/`
- **Screenshots**: Visual evidence of functionality in `/evidence/screenshots/`
- **Logs**: Complete execution logs and error handling validation in `/evidence/logs/`
- **Compliance Reports**: Constitutional adherence certificates in `/evidence/compliance/`

### IV. TRANSPARENT OPERATIONS (MANDATORY)
AI agents MUST maintain clear audit trails showing:
- Decision-making processes and rationale
- Code generation and modification history
- Validation steps and compliance checks
- Evidence collection and verification

### V. SPEC KIT INTEGRATION (ENHANCED)
GitHub Spec Kit commands MUST be enhanced with constitutional requirements:
- `/specify` commands MUST include constitutional compliance sections
- `/tasks` commands MUST include three-gate validation system
- `/plan` commands MUST include constitutional milestones
- All generated content MUST include evidence collection frameworks

### VI. EXACT FUNCTIONAL CORRESPONDENCE (CRITICAL)
Integration testing MUST directly validate the EXACT functionality specified in the task:
- **Task-Evidence Mapping**: Evidence must prove the specific API endpoint/method being tested
- **Functional Proof Requirement**: Integration evidence must show the actual operation (e.g., POST request when POST is required)
- **Substitution Prevention**: Testing adjacent functionality (GET) cannot satisfy requirements for target functionality (POST)
- **Evidence-Task Alignment Check**: Validation tools must verify integration evidence matches task requirements exactly

### VII. MANDATORY TDD DEBT MANAGEMENT (NON-NEGOTIABLE)
Every failing TDD test creates trackable technical debt with sprint-based enforcement:
- **Automatic Debt Detection**: All test failures analyzed and classified (CRITICAL, HIGH, MEDIUM, LOW)
- **Inventory Management**: All debt tracked in inventory for future sprint planning
- **Sprint Assignment**: Only debt specifically assigned to current sprint blocks development
- **Real-Time Task Generation**: Implementation tasks auto-generated in format T{base}.{increment}
- **Development Blocking**: Current sprint debt blocks non-debt development until resolved
- **Sprint Integration**: Debt assigned to sprint must be completed before new features

### VIII. ANTI-FRAUD ENFORCEMENT (ZERO TOLERANCE)
Constitutional compliance system MUST detect and prevent validation gaming:
- **Evidence Fabrication Detection**: Screenshot analysis, timestamp validation, content inspection
- **Validation Circumvention Prevention**: Directory pattern analysis, evidence copying detection
- **Mandatory Failure Protocol**: STOP → DOCUMENT → REPORT → WAIT (no workarounds allowed)
- **Zero Tolerance Policy**: Any circumnavigation attempts result in immediate constitutional violation

## TDD Debt Classification System

### CRITICAL (Development Blocking)
- API business logic gaps (discount calculation, validation, ID generation)
- Security vulnerabilities (authentication, authorization, data sanitization)
- Data integrity issues (corruption risks, consistency problems)
- Breaking changes (existing functionality compromised)

### HIGH (Next Sprint Priority)
- Performance degradation (>100ms response time increases)
- Accessibility violations (WCAG compliance gaps)
- UX friction (user workflow interruptions)
- Maintainability debt (code duplication, architectural violations)

### MEDIUM/LOW (Future Consideration)
- Enhancement opportunities, code quality improvements
- Documentation gaps, test coverage improvements
- Optimization opportunities, legacy cleanup

## Development Workflow

All development activities must follow constitutional compliance:
- **Pre-Task Gate**: Check for blocking TDD debt assigned to current sprint
- **Implementation Gate**: Complete functionality with exact correspondence validation
- **Integration Testing Gate**: Validate EXACT functionality specified in task requirements
- **Post-Task Gate**: Verify debt resolution, evidence completeness, constitutional compliance
- **Debt Lifecycle**: Auto-detect → Classify → Add to inventory → Assign to sprint → Block if current sprint → Resolve → Validate

## TDD Debt Sprint Management

- **Inventory**: All detected debt tracked in inventory (does not block development)
- **Sprint Assignment**: Team decides which debt to assign to current sprint
- **Blocking**: Only current sprint assigned debt blocks development
- **Completion**: Current sprint debt must be resolved before sprint completion

## Governance

- Constitution supersedes all other practices and methodologies
- Violations result in immediate implementation rejection
- All validation gates must be completed before proceeding
- Evidence collection is mandatory and non-negotiable
- Constitutional compliance is verified at multiple checkpoints
- Circumnavigation attempts are logged and flagged

**Version**: 4.0 | **Ratified**: 2025-09-29 | **Last Amended**: 2025-09-29