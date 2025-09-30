# Schemas Directory

**This folder contains the CURRENT, ACTIVE schemas used by the system.**

---

## 📋 Current Schemas

### 1. `current-test-task.schema.json`
**Purpose**: The authoritative schema for complete test task specifications

**Used by**:
- Test execution engine (validates specifications before execution)
- Generator script (validates output)
- Templates (must comply with this schema)

**What it defines**:
- Complete test specification structure (365+ lines)
- All required fields (metadata, configuration, test steps, etc.)
- Validation policies
- Evidence requirements
- Technical debt tracking

**Version**: 2.0.0  
**Format**: JSON Schema (draft-07)  
**Status**: ✅ **CURRENT - USE THIS**

---

### 2. `current-yaml-input.schema.yaml`
**Purpose**: The simple schema for YAML input files (agent/human writes this)

**Used by**:
- Generator script (validates input)
- AI agents (reference for YAML structure)
- Developers (reference for creating YAML specs)

**What it defines**:
- Simple YAML structure (40 lines)
- Required fields (task_id, type, title)
- Optional fields (api, validation_policy, dependencies)
- Enum values for strategies and test types

**Version**: 1.0.0  
**Format**: YAML  
**Status**: ✅ **CURRENT - USE THIS**

---

## 🔄 Schema Relationship

```
YAML Input Schema                    JSON Output Schema
(current-yaml-input.schema.yaml)     (current-test-task.schema.json)
         │                                    │
         │ Defines structure for:             │ Defines structure for:
         │ - 40-line YAML input               │ - 365-line JSON output
         │ - Human/agent writes this          │ - Test engine reads this
         │                                    │
         └────────────┐        ┌──────────────┘
                      │        │
                      ▼        ▼
              ┌─────────────────────┐
              │  Generator Script   │
              │                     │
              │ Validates YAML ────→│
              │ Loads template      │
              │ Substitutes vars    │
              │ Validates JSON ────→│
              └─────────────────────┘
```

---

## 📏 Naming Convention

All current/active schemas use the prefix `current-*`:
- `current-test-task.schema.json` - JSON output schema
- `current-yaml-input.schema.yaml` - YAML input schema

**Why "current"?**
- Makes it obvious which schemas are active
- Easy to distinguish from historical versions
- Clear naming prevents confusion

---

## 📦 Future Versions

When a new version is created:

1. Current schemas are moved to `archive/` folder:
   ```
   schemas/archive/
   ├── v2.0.0/
   │   ├── test-task.schema.json
   │   └── yaml-input.schema.yaml
   └── v1.0.0/
       └── yaml-input.schema.yaml
   ```

2. New schemas become the current versions:
   ```
   schemas/
   ├── current-test-task.schema.json      # v2.1.0
   └── current-yaml-input.schema.yaml     # v1.1.0
   ```

3. Generator and templates are updated to reference new versions

---

## ⚠️ Important Rules

1. **Always reference `current-*` files in code**
   - Generator: `../schemas/current-test-task.schema.json`
   - Templates: `../schemas/current-test-task.schema.json`
   - Examples: Reference the current schemas

2. **Never edit archived schemas**
   - They are historical references only
   - Changes go into new versions

3. **Schema changes require new version**
   - Increment version number in schema
   - Update all references
   - Archive old version

---

## 🔍 Schema Details

### JSON Output Schema (`current-test-task.schema.json`)

**Size**: ~800 lines  
**Complexity**: High (defines entire test specification)

**Main sections**:
- `metadata` - Task identification and metadata
- `globalConfiguration` - Workspace, server, environment settings
- `tasks` - Test execution details
  - `testExecution` - Prerequisites, steps, cleanup
  - `completionCriteria` - Success conditions
  - `technicalDebtExpectations` - Expected failures

**Validation strictness**: High (enforces complete structure)

---

### YAML Input Schema (`current-yaml-input.schema.yaml`)

**Size**: ~350 lines  
**Complexity**: Low (simple input structure)

**Main sections**:
- `task_id` - Required
- `type` - Required (contract-test, component-test, etc.)
- `title` - Required
- `api` - Optional (for contract tests)
- `validation_policy` - Optional (defaults provided)
- `dependencies` - Optional

**Validation strictness**: Medium (required fields only)

---

## 📖 Related Documentation

- **Quick Start**: `../docs/QUICK-START.md`
- **Schema Bible**: `../docs/TEST-TASK-SCHEMA-BIBLE.md` (detailed schema documentation)
- **Generator Usage**: `../docs/AGENT-USAGE-GUIDE.md`

---

## ✅ Current Version Summary

| Schema | Version | Status | Purpose |
|--------|---------|--------|---------|
| `current-test-task.schema.json` | 2.0.0 | ✅ Active | Full test specification |
| `current-yaml-input.schema.yaml` | 1.0.0 | ✅ Active | Simple YAML input |

---

**Remember**: Always use `current-*` files. They are the active, authoritative schemas! 🎯
