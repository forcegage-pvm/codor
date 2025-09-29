# Constitutional Overlay System v3.4

**Extends vanilla GitHub Spec Kit with constitutional compliance without modification**

## Overview

The Constitutional Overlay System follows object-oriented design principles to extend GitHub Spec Kit behavior through composition rather than inheritance. This ensures:

- ✅ **Non-destructive**: Vanilla Spec Kit remains completely unmodified
- ✅ **Constitution-driven**: Configuration automatically generated from `constitution.md`
- ✅ **Update-safe**: Spec Kit updates don't break constitutional compliance
- ✅ **Modular**: Can be activated/deactivated as needed

## Architecture

```
┌─────────────────────────────────────┐
│         Vanilla GitHub Spec Kit     │
│                  ↓                  │
│    Constitutional Interceptor       │
│  ┌─────────────────────────────────┐ │
│  │   Task Enhancement Layer        │ │
│  │   Validation Gate Injection     │ │
│  │   Evidence Requirement Gen      │ │
│  │   Fraud Detection Integration   │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Installation

### Prerequisites

1. **GitHub Spec Kit project** with `.specify/` directory
2. **Constitution file** at `.specify/memory/constitution.md`
3. **Node.js** environment for validation tools

### Activation

```bash
# Copy constitutional overlay to your Spec Kit project
cp -r .core/constitutional-overlay/.specify/constitutional .specify/

# Activate constitutional compliance
node .specify/constitutional/activate.js

# Optional: Preview changes without modification
node .specify/constitutional/activate.js --dry-run

# Force activation (skip validation)
node .specify/constitutional/activate.js --force
```

## Usage

### Enhanced Commands

Once activated, all Spec Kit commands are automatically enhanced:

#### `/tasks` with Constitutional Compliance

**Before (Vanilla)**:
```markdown
- [ ] T008 [P] User model in src/models/user.py
- [ ] T009 UserService CRUD in src/services/user_service.py
```

**After (Constitutional)**:
```markdown
## Constitutional Enforcement (MANDATORY)

**CRITICAL**: ALL tasks below are protected by Constitutional Amendments 1-3

- [ ] T008 [P] User model in src/models/user.py
  - Evidence: evidence/T008/ with service implementation, unit test coverage
  - MCP: N/A (service layer)
  - Validation: node .specify/tools/pre-task-check.js T008
  - Completion: node .specify/tools/post-task-validation.js T008

- [ ] T009 UserService CRUD in src/services/user_service.py
  - Evidence: evidence/T009/ with service implementation, unit test coverage
  - MCP: N/A (service layer)
  - Validation: node .specify/tools/pre-task-check.js T009
  - Completion: node .specify/tools/post-task-validation.js T009
```

#### Manual Enhancement

```bash
# Enhance existing tasks with constitutional requirements
node .specify/constitutional/interceptors/command-interceptor.js tasks

# Generate constitutional configuration from constitution.md
node .specify/constitutional/interceptors/command-interceptor.js --generate-config
```

## Configuration

### Auto-Generated from Constitution

The system automatically reads `.specify/memory/constitution.md` and generates configuration:

```json
{
  "constitutionSource": ".specify/memory/constitution.md",
  "version": "3.4", 
  "mandates": {
    "MANDATE_11": {
      "specToCompliance": true,
      "threeGateValidation": true,
      "evidenceFirst": true
    }
  },
  "validationGates": {
    "preTask": "node .specify/tools/pre-task-check.js",
    "postTask": "node .specify/tools/post-task-validation.js"
  }
}
```

### Dynamic Updates

When `constitution.md` changes, the configuration automatically updates:

1. Monitor constitution file for changes
2. Parse new mandates and requirements
3. Regenerate configuration
4. Apply changes to task generation

## Task Enhancement

### Automatic Classification

Tasks are automatically classified and enhanced:

| Task Type | Evidence Requirements | MCP Requirements |
|-----------|----------------------|------------------|
| **UI** | Component implementation, screenshots | **REQUIRED** - Browser testing with interaction validation |
| **API** | Endpoint implementation, contract tests | Browser test with network tab validation |
| **Service** | Service implementation, unit tests | N/A (service layer) |
| **Test** | Test implementation, execution results | N/A (test implementation) |
| **Setup** | Configuration changes, validation | N/A (configuration) |

### Evidence Structure

Each task gets standardized evidence requirements:

```
evidence/T008/
├── implementation-artifacts/
├── test-results/
├── mcp-interaction.log     # If MCP required
├── mcp-test-results.json   # If MCP required
└── validation-report.json
```

## Validation Gates

### Three-Gate System Integration

Every enhanced task includes:

1. **Pre-Task Gate**: `node .specify/tools/pre-task-check.js T008`
   - Validates prerequisites and environment
   - Checks for required dependencies
   - Ensures clean starting state

2. **MCP Gate** (Conditional):
   - UI tasks: **REQUIRED** browser testing
   - API tasks: Network validation recommended
   - Service tasks: Not applicable

3. **Post-Task Gate**: `node .specify/tools/post-task-validation.js T008`
   - Validates implementation completion
   - Checks evidence collection
   - Verifies constitutional compliance

## Anti-Circumnavigation

### Fraud Detection Integration

The overlay includes production-grade fraud detection:

- **Screenshot Fraud**: File size, timestamp, content validation
- **MCP Response Fraud**: JSON format, structure, authenticity
- **Evidence Gaming**: Directory patterns, bulk copying detection
- **Completion Gaming**: Validation evidence requirement enforcement

### Prohibited Behaviors

- ❌ Task completion without validation evidence
- ❌ Fake or manipulated evidence files
- ❌ Bypassing validation gates due to "tool issues"
- ❌ Creating placeholder files to satisfy validators

## File Structure

```
.specify/
├── constitutional/
│   ├── config/
│   │   └── constitution-config.json     # Auto-generated from constitution
│   ├── interceptors/
│   │   ├── command-interceptor.js       # Main entry point
│   │   └── task-enhancer.js            # Task enhancement logic
│   ├── templates/
│   │   └── constitutional-extensions/   # Enhancement templates
│   └── activate.js                      # Activation script
├── commands/
│   ├── tasks-constitutional.js          # Enhanced /tasks wrapper
│   ├── plan-constitutional.js           # Enhanced /plan wrapper
│   └── implement-constitutional.js      # Enhanced /implement wrapper
└── tools/                               # Constitutional validation tools
    ├── constitutional-checker.js
    ├── pre-task-check.js
    ├── post-task-validation.js
    └── constitutional-audit.js
```

## Benefits

### 1. Non-Destructive Extension

- Vanilla GitHub Spec Kit remains completely unchanged
- Can be activated/deactivated without affecting base functionality
- Updates to Spec Kit don't break constitutional compliance
- Easy rollback if needed

### 2. Constitution-Driven Configuration

- Configuration automatically generated from `constitution.md`
- Changes to constitution automatically propagate
- No manual prompt editing required
- Version-controlled constitutional compliance

### 3. Modular Architecture

- Clear separation between vanilla and constitutional behavior
- Independent component updates
- Easy debugging and maintenance
- Extensible for additional compliance frameworks

### 4. Backward Compatibility

- Existing Spec Kit projects continue working unchanged
- Opt-in constitutional compliance
- Gradual adoption path for teams
- No breaking changes to existing workflows

## Troubleshooting

### Activation Issues

```bash
# Check if Spec Kit project
ls -la .specify/

# Check constitution exists
ls -la .specify/memory/constitution.md

# Force activation if validation fails
node .specify/constitutional/activate.js --force
```

### Configuration Issues

```bash
# Regenerate configuration from constitution
node .specify/constitutional/interceptors/command-interceptor.js --generate-config

# Check configuration 
cat .specify/constitutional/config/constitution-config.json
```

### Enhancement Issues

```bash
# Test task enhancement manually
node .specify/constitutional/interceptors/task-enhancer.js

# Check logs
node .specify/constitutional/interceptors/command-interceptor.js tasks --verbose
```

## Development

### Extending the System

To add new constitutional requirements:

1. **Update Constitution**: Modify `.specify/memory/constitution.md`
2. **Auto-Generation**: System automatically detects changes
3. **Configuration Updates**: New mandates appear in `constitution-config.json`
4. **Task Enhancement**: New requirements applied to task generation

### Custom Interceptors

Create custom interceptors for specific commands:

```javascript
// .specify/constitutional/interceptors/custom-interceptor.js
class CustomInterceptor {
  async enhanceCustomCommand(args) {
    // Custom enhancement logic
  }
}
```

## Integration with CODOR Framework

The Constitutional Overlay System is **Layer 2** of the CODOR framework:

1. **Layer 1**: Core Constitutional Framework (CODOR 3.4)
2. **Layer 2**: Spec-to-Implementation Pipeline (This System) ← **Here**
3. **Layer 3**: VS Code Integration (Enhanced Copilot Instructions)

This ensures complete constitutional compliance from feature specification through implementation and validation.