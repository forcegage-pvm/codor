# Complete Workflow Guide: Hybrid Test Specification Generation

**Date**: September 30, 2025  
**System Version**: 1.0.0  
**Audience**: Developers, AI Agents, Project Managers

---

## Table of Contents
1. [System Overview](#system-overview)
2. [What Each Component Does](#what-each-component-does)
3. [Complete Workflow](#complete-workflow)
4. [How Agents Use This System](#how-agents-use-this-system)
5. [YAML Template Injection](#yaml-template-injection)
6. [Real-World Example](#real-world-example)
7. [Troubleshooting](#troubleshooting)

---

## System Overview

### The Problem We Solved
**Before**: Generating a test specification was painful
- Agent writes 365+ lines of JSON directly
- 15+ tool calls
- 6 validation errors
- 5+ minutes
- 40,000 tokens consumed

**After**: Using the hybrid generation system
- Human/Agent writes 40 lines of YAML
- 1 tool call (generator script)
- 0 validation errors
- 30 seconds
- 5,000 tokens consumed

### The Solution: 3-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER 1: SIMPLE INPUT                        │
│                                                                 │
│  Human or Agent writes a simple YAML file (40 lines)           │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ task_id: T004                                            │ │
│  │ type: contract-test                                      │ │
│  │ title: "Contract Test GET /api/quotes"                   │ │
│  │ api:                                                     │ │
│  │   method: GET                                            │ │
│  │   endpoint: /api/v1/quotes                               │ │
│  │ validation_policy:                                       │ │
│  │   eslint: BLOCK_ON_ERRORS_ONLY                          │ │
│  │   max_warnings: 20                                       │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  LAYER 2: TEMPLATE + GENERATOR                  │
│                                                                 │
│  Generator Script (Node.js)                                     │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 1. Read YAML file                                        │ │
│  │ 2. Validate against simple schema                        │ │
│  │ 3. Select template (contract-test-template.json)         │ │
│  │ 4. Build variable substitution map                       │ │
│  │ 5. Replace all {{PLACEHOLDERS}} with actual values       │ │
│  │ 6. Validate output against authoritative schema          │ │
│  │ 7. Write JSON file                                       │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                 LAYER 3: VALID JSON OUTPUT                      │
│                                                                 │
│  Complete test specification (365+ lines)                       │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ {                                                        │ │
│  │   "$schema": "../test-task-specification.schema.json",  │ │
│  │   "schemaVersion": "2.0.0",                             │ │
│  │   "metadata": { ... },                                   │ │
│  │   "globalConfiguration": { ... },                        │ │
│  │   "tasks": {                                             │ │
│  │     "T004": {                                            │ │
│  │       "testExecution": {                                 │ │
│  │         "prerequisites": [...],  // 3 steps             │ │
│  │         "steps": [...],          // 8 steps             │ │
│  │         "cleanup": [...]         // 2 steps             │ │
│  │       }                                                  │ │
│  │     }                                                    │ │
│  │   }                                                      │ │
│  │ }                                                        │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## What Each Component Does

### 1. YAML Schema (`simple-test-task-spec.yaml.schema`)
**Purpose**: Defines the simple input format that humans/agents write

**What it does**:
- Describes what fields are required/optional in the YAML
- Validates YAML before generation starts
- Supports 5 test types: `contract-test`, `component-test`, `integration-test`, `e2e-test`, `custom`

**Example fields**:
```yaml
task_id: string (required)
type: enum (required)
title: string (required)
api:
  method: GET/POST/PUT/DELETE
  endpoint: string
  expected_status: number
validation_policy:
  eslint: strategy enum
  typescript: strategy enum
  max_warnings: number
```

**Who uses it**: 
- Generator (to validate input)
- Agents (as reference for what to write)

---

### 2. JSON Templates (e.g., `contract-test-template.json`)
**Purpose**: Pre-validated, complete JSON structure with placeholders

**What it does**:
- Contains the full 365-line JSON structure
- Has 30+ placeholder variables like `{{TASK_ID}}`, `{{API_ENDPOINT}}`, `{{MAX_WARNINGS}}`
- Already validated against the authoritative schema
- Guarantees zero schema errors in output

**Why it exists**:
- Agent doesn't need to know the complex JSON structure
- Schema compliance is guaranteed (template is pre-validated)
- All test steps, prerequisites, cleanup actions are already defined
- Only variable values need to be substituted

**Current templates**:
- ✅ `contract-test-template.json` (API contract tests)
- 🔜 `component-test-template.json` (planned)
- 🔜 `integration-test-template.json` (planned)
- 🔜 `e2e-test-template.json` (planned)

**Who uses it**:
- Generator script (reads and populates placeholders)

---

### 3. Generator Script (`tools/generate-test-spec.js`)
**Purpose**: Transform YAML → JSON using templates

**What it does**:
1. **Load schemas**: Simple YAML schema + Authoritative JSON schema
2. **Read YAML**: Parse the input YAML file
3. **Validate input**: Ensure YAML matches simple schema
4. **Select template**: Choose template based on `type` field
5. **Build variable map**: Extract values from YAML and format them
6. **Substitute variables**: Replace all `{{PLACEHOLDERS}}` with actual values
7. **Validate output**: Ensure generated JSON passes authoritative schema
8. **Write file**: Save the complete JSON specification

**Key features**:
- Type-safe substitution (numbers stay numbers, booleans stay booleans)
- Batch processing (multiple YAML files at once)
- Validation at every step
- Detailed error reporting

**Who uses it**:
- Agents (via terminal command)
- Humans (via CLI)
- CI/CD pipelines (automated generation)

---

### 4. Authoritative Schema (`test-task-specification.schema.json`)
**Purpose**: The source of truth for valid test specifications

**What it does**:
- Defines the complete structure of a test specification
- Used by the test engine to validate tasks
- Referenced by templates (templates must comply with this)
- Final validation gate for generated JSON

**Who uses it**:
- Test execution engine (runtime validation)
- Generator (output validation)
- Templates (compliance requirement)

---

## Complete Workflow

### Scenario 1: Agent Generates Test Specification

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: User Request                                            │
├─────────────────────────────────────────────────────────────────┤
│ User: "Create a test specification for T006: Contract test for │
│        POST /api/v1/quotes/bulk endpoint"                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Agent Reads Documentation                               │
├─────────────────────────────────────────────────────────────────┤
│ Agent reads: AGENT-USAGE-GUIDE.md                              │
│ Agent learns:                                                   │
│   - Don't write JSON directly                                   │
│   - Write simple YAML instead                                   │
│   - Use generator to produce JSON                               │
│   - YAML structure defined in simple-test-task-spec.yaml.schema │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Agent Analyzes Task Requirements                        │
├─────────────────────────────────────────────────────────────────┤
│ Agent examines:                                                 │
│   - Task definition in tasks.md                                 │
│   - API contract specification                                  │
│   - Validation requirements                                     │
│   - Dependencies                                                │
│                                                                 │
│ Agent determines:                                               │
│   ✓ Test type: contract-test                                   │
│   ✓ HTTP method: POST                                          │
│   ✓ Endpoint: /api/v1/quotes/bulk                              │
│   ✓ Expected status: 201                                       │
│   ✓ Validation policy: BLOCK_ON_ERRORS_ONLY                    │
│   ✓ Dependencies: [T004, T005]                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Agent Creates YAML File                                │
├─────────────────────────────────────────────────────────────────┤
│ Agent uses create_file tool to write:                          │
│ docs/specifications/testing-system/examples/T006-bulk-spec.yaml│
│                                                                 │
│ Content (30 lines):                                             │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ task_id: T006                                             │ │
│ │ type: contract-test                                       │ │
│ │ title: "Contract Test POST /api/v1/quotes/bulk"          │ │
│ │ description: "Bulk quote creation endpoint test"          │ │
│ │                                                           │ │
│ │ workspace_root: "D:/Dropbox/Repositories/Python/codor/test-case" │
│ │ test_file: "packages/web/__tests__/contracts/quotes-bulk.test.ts" │
│ │                                                           │ │
│ │ api:                                                      │ │
│ │   method: POST                                            │ │
│ │   endpoint: /api/v1/quotes/bulk                           │ │
│ │   expected_status: 201                                    │ │
│ │   request_body:                                           │ │
│ │     quotes:                                               │ │
│ │       - { customer: "C001", items: [...] }                │ │
│ │       - { customer: "C002", items: [...] }                │ │
│ │                                                           │ │
│ │ validation_policy:                                        │ │
│ │   eslint: BLOCK_ON_ERRORS_ONLY                           │ │
│ │   typescript: BLOCK_ON_ERRORS_ALWAYS                     │ │
│ │   max_warnings: 20                                        │ │
│ │                                                           │ │
│ │ dependencies:                                             │ │
│ │   - T004                                                  │ │
│ │   - T005                                                  │ │
│ │                                                           │ │
│ │ priority: HIGH                                            │ │
│ │ timeout: 300000                                           │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Time: 15 seconds                                                │
│ Token cost: ~2,000 tokens                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: Agent Runs Generator                                   │
├─────────────────────────────────────────────────────────────────┤
│ Agent uses run_in_terminal tool:                               │
│                                                                 │
│ cd docs/specifications/testing-system                           │
│ node tools/generate-test-spec.js \                             │
│   examples/T006-bulk-spec.yaml \                               │
│   -o examples/                                                  │
│                                                                 │
│ Generator output:                                               │
│ ✓ Schemas loaded successfully                                  │
│ ✓ Loaded YAML spec: examples/T006-bulk-spec.yaml              │
│ ✓ YAML spec validated                                          │
│ ✓ Loaded template: contract-test-template.json                │
│ ✓ Generated JSON validates against authoritative schema        │
│ ✓ Written to: examples/T006-bulk-spec-test-specification.json │
│                                                                 │
│ Time: 2 seconds                                                 │
│ Token cost: 0 tokens (local execution)                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: Agent Validates Output                                 │
├─────────────────────────────────────────────────────────────────┤
│ Agent optionally runs validation:                              │
│                                                                 │
│ npx ajv-cli validate \                                          │
│   -s test-task-specification.schema.json \                     │
│   -d examples/T006-bulk-spec-test-specification.json           │
│                                                                 │
│ Result: ✓ examples/T006-bulk-spec-test-specification.json valid│
│                                                                 │
│ Time: 1 second                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: Agent Reports Success                                  │
├─────────────────────────────────────────────────────────────────┤
│ Agent: "✅ Test specification T006 created successfully!"       │
│        "File: examples/T006-bulk-spec-test-specification.json"  │
│        "Lines: 365"                                             │
│        "Schema: Valid"                                          │
│        "Ready for test execution"                               │
│                                                                 │
│ Total time: ~20 seconds                                         │
│ Total tokens: ~2,000 tokens                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

### Scenario 2: Batch Generation for Sprint Planning

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: Sprint Planning                                        │
├─────────────────────────────────────────────────────────────────┤
│ Project Manager: "We have 15 tasks in Sprint 007:              │
│   - 8 contract tests                                            │
│   - 4 component tests                                           │
│   - 3 integration tests                                         │
│                                                                 │
│ Create test specifications for all tasks."                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Agent Creates YAML Files                               │
├─────────────────────────────────────────────────────────────────┤
│ Agent creates 15 YAML files (30-40 lines each):                │
│   examples/sprint-007/T007-contract-get-customers.yaml         │
│   examples/sprint-007/T008-contract-post-customer.yaml         │
│   examples/sprint-007/T009-contract-get-invoices.yaml          │
│   ... (12 more files) ...                                       │
│                                                                 │
│ Time: ~5 minutes total                                          │
│ Token cost: ~30,000 tokens                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Agent Runs Batch Generation                            │
├─────────────────────────────────────────────────────────────────┤
│ Single command generates all 15 specifications:                │
│                                                                 │
│ node tools/generate-test-spec.js \                             │
│   examples/sprint-007/*.yaml \                                  │
│   -o examples/sprint-007/                                       │
│                                                                 │
│ Generator processes all files:                                  │
│ ✓ T007: contract-get-customers-test-specification.json         │
│ ✓ T008: contract-post-customer-test-specification.json         │
│ ✓ T009: contract-get-invoices-test-specification.json          │
│ ... (12 more) ...                                               │
│ Summary: 15 succeeded, 0 failed                                 │
│                                                                 │
│ Time: ~30 seconds total                                         │
│ Token cost: 0 tokens (local execution)                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ RESULT: Sprint Ready                                           │
├─────────────────────────────────────────────────────────────────┤
│ 15 test specifications generated                                │
│ All validated against authoritative schema                      │
│ Ready for test execution                                        │
│                                                                 │
│ Total time: ~6 minutes                                          │
│ Total tokens: ~30,000 tokens                                    │
│                                                                 │
│ Compare to manual generation:                                   │
│ Would take: ~75 minutes (15 tasks × 5 minutes)                 │
│ Would cost: ~600,000 tokens (15 tasks × 40,000 tokens)         │
│                                                                 │
│ Savings: 92% time saved, 95% tokens saved                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## How Agents Use This System

### Agent's Mental Model

**OLD WAY (Don't do this)**:
```
User request → Agent writes 365-line JSON → Many errors → Many fixes → Done
Problem: Slow, expensive, error-prone
```

**NEW WAY (Do this)**:
```
User request → Agent writes 40-line YAML → Run generator → Done
Benefits: Fast, cheap, zero errors
```

### Agent Instructions

When an agent receives a request to create a test specification, follow this workflow:

#### 1. Check Documentation
```
Read: docs/specifications/testing-system/AGENT-USAGE-GUIDE.md
Learn: YAML structure, generator usage, examples
```

#### 2. Analyze Requirements
```
- What is the task ID?
- What type of test? (contract, component, integration, e2e)
- What API endpoint? (if applicable)
- What validation policies apply?
- Any dependencies on other tasks?
```

#### 3. Create YAML File
```
Tool: create_file
Location: docs/specifications/testing-system/examples/{TASK_ID}-{name}-spec.yaml
Content: 30-40 lines of YAML (see examples)
```

#### 4. Run Generator
```
Tool: run_in_terminal
Command: node tools/generate-test-spec.js examples/{TASK_ID}-spec.yaml -o examples/
```

#### 5. Verify Success
```
Check: Generator output shows "✓ Written to: ..."
Optional: Run ajv-cli validation
Report: Success message to user
```

### Example Agent Prompts

**Prompt 1: Single Test**
```
"Create a test specification for T010: Contract test for GET /api/v1/customers endpoint. 
Use BLOCK_ON_ERRORS_ONLY for ESLint, BLOCK_ON_ERRORS_ALWAYS for TypeScript, 
max 20 warnings, depends on T004."
```

**Agent Response**:
```
I'll create the test specification using the YAML generation system.

[Creates T010-contract-get-customers-spec.yaml]
[Runs generator]
[Reports success]

✓ Test specification T010 created successfully!
  File: examples/T010-contract-get-customers-spec-test-specification.json
  Size: 365 lines
  Schema: Valid
  Time: 20 seconds
```

**Prompt 2: Batch Generation**
```
"Create test specifications for tasks T015-T020 from the sprint plan. 
All are contract tests with standard validation policies."
```

**Agent Response**:
```
I'll create YAML files for all 6 tasks and generate them in batch.

[Creates 6 YAML files: T015.yaml, T016.yaml, ..., T020.yaml]
[Runs batch generator]
[Reports success]

✓ All 6 test specifications created successfully!
  T015: contract-get-products-test-specification.json
  T016: contract-post-product-test-specification.json
  T017: contract-get-orders-test-specification.json
  T018: contract-post-order-test-specification.json
  T019: contract-get-payments-test-specification.json
  T020: contract-post-payment-test-specification.json
  
  Total time: 2 minutes
  All specifications validated
```

---

## YAML Template Injection

### Question: "How do we inject the YAML template so the agent can use it?"

**Answer**: The YAML schema is **self-documenting** and available to agents through multiple methods:

### Method 1: Schema File Reference (Primary)
```
File: docs/specifications/testing-system/simple-test-task-spec.yaml.schema
Location: In the workspace
Access: Agent reads file using read_file tool
```

**Agent prompt**:
```
"Read the YAML schema at docs/specifications/testing-system/simple-test-task-spec.yaml.schema 
to understand the structure needed for test specifications."
```

### Method 2: Example Files (Best Practice)
```
Files: docs/specifications/testing-system/examples/*.yaml
Examples:
  - T004-contract-get-spec.yaml (GET endpoint example)
  - T005-contract-post-spec.yaml (POST endpoint example)
```

**Agent prompt**:
```
"Look at examples/T004-contract-get-spec.yaml for a reference structure, 
then create a similar YAML file for T010."
```

### Method 3: Documentation (Comprehensive)
```
File: docs/specifications/testing-system/AGENT-USAGE-GUIDE.md
Contains:
  - Step-by-step instructions
  - YAML examples
  - Field descriptions
  - Common patterns
  - Troubleshooting
```

**Agent prompt**:
```
"Read AGENT-USAGE-GUIDE.md to learn how to create test specifications."
```

### Method 4: Context Injection (Advanced)
```
In your agent's system prompt or context, include:

"When creating test specifications for the CODOR project:
1. Do NOT write JSON directly
2. Create a YAML file instead using this structure:
   
   task_id: TXXX
   type: contract-test | component-test | integration-test | e2e-test
   title: "Descriptive title"
   api:
     method: GET | POST | PUT | DELETE
     endpoint: /api/path
   validation_policy:
     eslint: BLOCK_ON_ERRORS_ONLY
     typescript: BLOCK_ON_ERRORS_ALWAYS
   
3. Run: node tools/generate-test-spec.js your-file.yaml -o output-dir/
4. The generator produces a complete JSON specification
   
See: docs/specifications/testing-system/AGENT-USAGE-GUIDE.md for details"
```

### Method 5: Semantic Search (Runtime)
```
Agent can use semantic_search to find:
  - "YAML schema for test specifications"
  - "Example test specification YAML"
  - "How to generate test specifications"
```

**Example**:
```javascript
// Agent internally:
semantic_search("YAML structure for creating test specifications")

// Returns:
// - simple-test-task-spec.yaml.schema
// - AGENT-USAGE-GUIDE.md
// - Example YAML files
```

---

## Real-World Example

### Full Conversation: User → Agent → System

```
┌─────────────────────────────────────────────────────────────────┐
│ USER                                                            │
├─────────────────────────────────────────────────────────────────┤
│ "I need test specifications for Sprint 008. We have 5 tasks:   │
│  - T021: Contract test GET /api/v1/dashboard/stats             │
│  - T022: Contract test POST /api/v1/reports                    │
│  - T023: Component test for ReportViewer component             │
│  - T024: Integration test for report generation workflow       │
│  - T025: E2E test for complete dashboard flow                  │
│                                                                 │
│ All should use BLOCK_ON_ERRORS_ONLY for ESLint,               │
│ BLOCK_ON_ERRORS_ALWAYS for TypeScript, max 15 warnings.       │
│ T022 depends on T021, T024 depends on T021-T023,              │
│ T025 depends on all previous tasks."                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ AGENT (Internal Reasoning)                                      │
├─────────────────────────────────────────────────────────────────┤
│ 1. Read AGENT-USAGE-GUIDE.md → Learn YAML structure           │
│ 2. Check examples/T004-contract-get-spec.yaml → Reference      │
│ 3. Analyze requirements:                                        │
│    - 2 contract tests (T021, T022)                             │
│    - 1 component test (T023)                                    │
│    - 1 integration test (T024)                                  │
│    - 1 E2E test (T025)                                          │
│ 4. Plan: Create 5 YAML files, then batch generate              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ AGENT ACTION 1: Create T021 YAML                               │
├─────────────────────────────────────────────────────────────────┤
│ create_file(                                                    │
│   path: "examples/T021-dashboard-stats-spec.yaml",             │
│   content: """                                                  │
│     task_id: T021                                               │
│     type: contract-test                                         │
│     title: "Contract Test GET /api/v1/dashboard/stats"         │
│     workspace_root: "D:/Dropbox/Repositories/Python/codor/test-case" │
│     test_file: "packages/web/__tests__/contracts/dashboard-stats.test.ts" │
│     api:                                                        │
│       method: GET                                               │
│       endpoint: /api/v1/dashboard/stats                         │
│       expected_status: 200                                      │
│     validation_policy:                                          │
│       eslint: BLOCK_ON_ERRORS_ONLY                             │
│       typescript: BLOCK_ON_ERRORS_ALWAYS                       │
│       max_warnings: 15                                          │
│     priority: HIGH                                              │
│   """                                                           │
│ )                                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ AGENT ACTION 2-5: Create T022-T025 YAML files                  │
├─────────────────────────────────────────────────────────────────┤
│ [Creates T022-reports-spec.yaml with dependency: [T021]]       │
│ [Creates T023-report-viewer-spec.yaml (component test)]        │
│ [Creates T024-report-workflow-spec.yaml with deps: T021-T023]  │
│ [Creates T025-dashboard-e2e-spec.yaml with deps: T021-T024]    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ AGENT ACTION 6: Batch Generate All Specifications              │
├─────────────────────────────────────────────────────────────────┤
│ run_in_terminal(                                                │
│   command: "node tools/generate-test-spec.js \                 │
│             examples/T021-dashboard-stats-spec.yaml \           │
│             examples/T022-reports-spec.yaml \                   │
│             examples/T023-report-viewer-spec.yaml \             │
│             examples/T024-report-workflow-spec.yaml \           │
│             examples/T025-dashboard-e2e-spec.yaml \             │
│             -o examples/"                                       │
│ )                                                               │
│                                                                 │
│ Output:                                                         │
│ ✓ Schemas loaded successfully                                  │
│ ✓ T021: dashboard-stats-spec-test-specification.json           │
│ ✓ T022: reports-spec-test-specification.json                   │
│ ✗ T023: Failed - component-test-template.json not found        │
│ ✗ T024: Failed - integration-test-template.json not found      │
│ ✗ T025: Failed - e2e-test-template.json not found              │
│ Summary: 2 succeeded, 3 failed                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ AGENT RESPONSE                                                  │
├─────────────────────────────────────────────────────────────────┤
│ "✅ Generated test specifications for T021-T022 successfully!   │
│                                                                 │
│  Contract tests (completed):                                    │
│  ✓ T021: dashboard-stats-spec-test-specification.json          │
│  ✓ T022: reports-spec-test-specification.json                  │
│                                                                 │
│  ⚠️  T023-T025 require templates that don't exist yet:          │
│  - T023 needs: component-test-template.json                    │
│  - T024 needs: integration-test-template.json                  │
│  - T025 needs: e2e-test-template.json                          │
│                                                                 │
│  Options:                                                       │
│  1. I can create T023-T025 manually (old method, 15 min)       │
│  2. You can create the missing templates (reusable for future) │
│  3. We can prioritize T021-T022 and defer T023-T025             │
│                                                                 │
│  What would you like to do?"                                    │
└─────────────────────────────────────────────────────────────────┘
```

This example shows:
1. ✅ Agent successfully uses the system for supported test types
2. ✅ Agent handles batch generation
3. ✅ Agent detects missing templates and communicates clearly
4. ✅ Agent offers options when limitations are encountered

---

## Troubleshooting

### Problem 1: "Generator says template not found"
**Cause**: Test type has no template yet

**Solution**:
```bash
# Check available templates
ls templates/

# Current templates:
# - contract-test-template.json ✓

# If you need other types, either:
# 1. Create the template (one-time effort, reusable)
# 2. Use manual generation for that specific task
# 3. Change test type to 'contract-test' if applicable
```

### Problem 2: "YAML validation failed"
**Cause**: YAML doesn't match schema

**Solution**:
```bash
# Check the error message for specific field
# Common issues:
# - Missing required field (task_id, type, title)
# - Invalid enum value (type, validation_policy strategies)
# - Wrong data type (max_warnings should be number, not string)

# Fix example:
# Wrong:  max_warnings: "20"
# Right:  max_warnings: 20
```

### Problem 3: "Generated JSON validation failed"
**Cause**: Template has issues OR generator has bug

**Solution**:
```bash
# This should not happen (templates are pre-validated)
# If it does:
# 1. Check generator output for error details
# 2. Validate template manually:
npx ajv-cli validate -s test-task-specification.schema.json \
  -d templates/contract-test-template.json

# 3. Report issue with details
```

### Problem 4: "Agent doesn't know about YAML generation"
**Cause**: Agent hasn't read the documentation

**Solution**:
```
# In your prompt to the agent:
"Before creating test specifications, please read 
docs/specifications/testing-system/AGENT-USAGE-GUIDE.md 
to learn the YAML-based generation workflow."

# Or add to agent's system context:
"For test specifications in the CODOR project, always use 
the YAML generation system documented in AGENT-USAGE-GUIDE.md.
Never write JSON test specifications directly."
```

---

## Summary

### What the Template Does
The **JSON template** (`contract-test-template.json`) is a **pre-validated, complete test specification structure** with placeholders. It:
- Contains all required sections (metadata, configuration, steps, validation, etc.)
- Has 30+ placeholder variables (e.g., `{{TASK_ID}}`, `{{API_ENDPOINT}}`)
- Is already validated against the authoritative schema
- Guarantees zero schema errors when properly populated
- Currently exists for contract tests (more templates coming)

### How the Agent Uses It
The agent **never touches the template directly**. Instead:
1. Agent writes a **simple 40-line YAML file** describing the task
2. Agent runs the **generator script** via terminal
3. Generator **reads the template**, **replaces placeholders**, **validates output**
4. Agent receives a **complete 365-line JSON specification** that's ready to use

### YAML Template Injection Methods
Agents learn about YAML structure through:
1. **Schema file**: `simple-test-task-spec.yaml.schema` (defines structure)
2. **Example files**: `examples/T004-contract-get-spec.yaml` (shows usage)
3. **Documentation**: `AGENT-USAGE-GUIDE.md` (step-by-step guide)
4. **System context**: Injected in agent's instructions
5. **Semantic search**: Runtime discovery of relevant docs

### Complete Workflow
```
User Request 
  ↓
Agent reads AGENT-USAGE-GUIDE.md
  ↓
Agent analyzes task requirements
  ↓
Agent creates 40-line YAML file (using examples as reference)
  ↓
Agent runs: node tools/generate-test-spec.js input.yaml -o output/
  ↓
Generator: YAML → Template → JSON (with validation)
  ↓
Complete 365-line JSON specification created
  ↓
Agent reports success to user
```

### Key Benefits
- **10x faster** than manual JSON creation
- **8x fewer tokens** consumed
- **Zero schema errors** (template is pre-validated)
- **Batch processing** for multiple tasks
- **Scalable** to 50+ tasks per sprint
- **Reusable** templates for consistent structure

---

**The system transforms test specification generation from a painful, error-prone manual process into a fast, automated, reliable workflow.**
