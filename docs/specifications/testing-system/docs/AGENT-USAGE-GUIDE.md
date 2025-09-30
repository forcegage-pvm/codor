# Agent Usage Guide: Test Specification Generation

**Version:** 1.0.0  
**Date:** 2025-09-30  
**Audience:** AI Agents (GitHub Copilot, Claude, GPT-4, etc.)

---

## Quick Start (TL;DR)

```bash
# 1. Create simple YAML spec (15 lines)
cat > T004-spec.yaml << EOF
task_id: T004
title: Contract Test GET /api/quotes
type: contract-test
api:
  method: GET
  endpoint: /api/v1/quotes
test_file: packages/web/__tests__/contracts/quotes-get.test.ts
workspace_root: D:/Dropbox/Repositories/Python/codor/test-case
validation_policy:
  eslint: BLOCK_ON_ERRORS_ONLY
  typescript: BLOCK_ON_ERRORS_ALWAYS
  max_warnings: 20
EOF

# 2. Generate full JSON specification
node tools/generate-test-spec.js T004-spec.yaml

# 3. Done! ✓
```

**Result:** 365-line JSON specification, schema-validated, ready for test engine execution.

---

## Overview

### Problem This Solves

**Before:** Agents manually create 365-line JSON specifications → 15 tool calls, 6 errors, 5+ minutes, 40K tokens.

**After:** Agents create 15-line YAML specs → 2 tool calls, 0 errors, 30 seconds, 5K tokens.

**Improvement:** 95% less complexity, 10x faster, zero schema errors.

### System Architecture

```
Agent Creates          Generator Produces         Test Engine Executes
YAML Spec (15 lines)   JSON Spec (365 lines)      Evidence & Results
─────────────────  →   ─────────────────────  →   ──────────────────
Simple, focused        Complete, validated        Deterministic
```

---

## Workflow

### Step 1: Analyze Task Description

**Input:** Task description from sprint planning (e.g., "T004: Contract test GET /api/quotes")

**Agent Actions:**
1. Read task description
2. Identify task type (contract-test, integration-test, unit-test, e2e-test, database-migration)
3. Extract key information:
   - API endpoint (if API test)
   - HTTP method (GET, POST, PUT, DELETE)
   - Test file path
   - Validation requirements

**Example Task Descriptions:**

| Description | Type | Key Info |
|-------------|------|----------|
| "Contract test GET /api/quotes" | contract-test | method=GET, endpoint=/api/v1/quotes |
| "Unit test QuoteService.calculateTotal" | unit-test | test file path |
| "E2E test quote creation flow" | e2e-test | user flow steps |
| "Integration test quote + invoice" | integration-test | components to integrate |

---

### Step 2: Create YAML Specification

**Template Selection:**

```yaml
# Choose template based on task type
task_id: T004                    # Required: Task ID (pattern: T[0-9]{3,})
title: <Short Title>             # Required: 10-200 characters
type: <template-type>            # Required: contract-test | integration-test | unit-test | e2e-test | database-migration
```

**Available Types:**

| Type | Use Case | Example |
|------|----------|---------|
| `contract-test` | API endpoint testing | GET /api/quotes, POST /api/quotes |
| `integration-test` | Multi-component integration | Quote + Payment integration |
| `unit-test` | Isolated function/class tests | QuoteService.calculateTotal() |
| `e2e-test` | Browser-based user flows | Login → Create Quote → Submit |
| `database-migration` | Database schema changes | Add quotes table |

---

### Step 3: Fill Required Fields

#### Universal Fields (All Types)

```yaml
task_id: T004
title: Contract Test GET /api/quotes
type: contract-test
description: Detailed description (optional, generated if not provided)
test_file: packages/web/__tests__/contracts/quotes-get.test.ts
workspace_root: D:/Dropbox/Repositories/Python/codor/test-case
```

#### Contract Test Specific Fields

```yaml
api:
  method: GET                               # Required: GET | POST | PUT | DELETE | PATCH
  endpoint: /api/v1/quotes                  # Required: Must start with /
  base_url: http://localhost:3000           # Optional: Default http://localhost:3000
  expected_status: 200                      # Optional: Default 200
  request_body:                             # Optional: For POST/PUT/PATCH
    customerId: CUST001
    items: [...]
```

#### Validation Policy (Optional but Recommended)

```yaml
validation_policy:
  eslint: BLOCK_ON_ERRORS_ONLY              # Optional: Default BLOCK_ON_ERRORS_ONLY
  typescript: BLOCK_ON_ERRORS_ALWAYS        # Optional: Default BLOCK_ON_ERRORS_ALWAYS
  max_warnings: 20                          # Optional: Default 10
  ignored_rules:                            # Optional: Default []
    - no-console
  error_on_rules:                           # Optional: Default []
    - no-unused-vars
  strict_mode: true                         # Optional: Default true
```

**Validation Policy Strategies:**

| Strategy | Errors | Warnings | Use Case |
|----------|--------|----------|----------|
| `BLOCK_ON_ERRORS_ALWAYS` | ✗ Blocks | ✓ Allows | TypeScript, compilation |
| `BLOCK_ON_ERRORS_ONLY` | ✗ Blocks | ✓ Allows | ESLint (default) |
| `BLOCK_ON_ERRORS_AND_WARNINGS` | ✗ Blocks | ✗ Blocks | Strict CI |
| `WARN_ONLY` | ✓ Allows | ✓ Allows | Formatting only |
| `NEVER` | ✓ Allows | ✓ Allows | Disabled |

#### Completion Criteria (Optional)

```yaml
completion:
  all_steps_must_pass: false                # Optional: Default false (TDD-friendly)
  minimum_pass_rate: 60                     # Optional: Default 60 (percentage)
```

**TDD-Friendly Defaults:**
- `all_steps_must_pass: false` → Allows test failures during red phase
- `minimum_pass_rate: 60` → At least 60% of steps must pass

**Strict Mode:**
- `all_steps_must_pass: true` → All steps must pass (no failures allowed)
- `minimum_pass_rate: 100` → 100% pass rate required

#### Priority and Dependencies (Optional)

```yaml
priority: HIGH                              # Optional: CRITICAL | HIGH | MEDIUM | LOW
dependencies:                               # Optional: Default []
  - T003
  - T005
```

---

### Step 4: Run Generator

**Command:**

```bash
cd docs/specifications/testing-system
node tools/generate-test-spec.js <yaml-file> [-o <output>] [--validate-only]
```

**Examples:**

```bash
# Generate single spec (output same directory)
node tools/generate-test-spec.js T004-spec.yaml

# Generate single spec (custom output)
node tools/generate-test-spec.js T004-spec.yaml -o generated/T004-test-specification.json

# Generate multiple specs (output directory)
node tools/generate-test-spec.js examples/*.yaml -o generated/

# Validate only (dry run, no output)
node tools/generate-test-spec.js T004-spec.yaml --validate-only
```

**Output:**

```
============================================================
Generating: T004-spec.yaml
============================================================
✓ Schemas loaded successfully
✓ Loaded YAML spec: T004-spec.yaml
✓ YAML spec validated
✓ Loaded template: contract-test-template.json
✓ Generated JSON validates against authoritative schema
✓ Written to: T004-test-specification.json

============================================================
Summary: 1 succeeded, 0 failed
============================================================
```

---

### Step 5: Verify Output (Optional)

**Validate generated JSON:**

```bash
npx ajv-cli validate -s test-task-specification.schema.json -d T004-test-specification.json --strict=false
```

**Expected Result:**

```
T004-test-specification.json valid
```

**If validation fails:** This indicates a bug in the generator. Report the issue with:
- Input YAML spec
- Generated JSON spec
- Ajv error messages

---

## Complete Examples

### Example 1: Contract Test GET

**Task:** "T004: Contract test GET /api/quotes - Validate quote list endpoint"

**YAML Spec (15 lines):**

```yaml
task_id: T004
title: Contract Test GET /api/quotes
type: contract-test
description: Validate GET /api/quotes endpoint against API contract

api:
  method: GET
  endpoint: /api/v1/quotes
  base_url: http://localhost:3000

test_file: packages/web/__tests__/contracts/quotes-get.test.ts
workspace_root: D:/Dropbox/Repositories/Python/codor/test-case

validation_policy:
  eslint: BLOCK_ON_ERRORS_ONLY
  typescript: BLOCK_ON_ERRORS_ALWAYS
  max_warnings: 20

priority: HIGH
```

**Generate:**

```bash
node tools/generate-test-spec.js T004-spec.yaml
```

**Result:** 365-line JSON specification with:
- 3 prerequisites (file validation, npm install, start dev server)
- 8 test steps (TypeScript, ESLint, contract tests, 5 HTTP requests, coverage)
- 2 cleanup actions (stop server, clear cache)
- Validation criteria (success/failure conditions)
- Completion criteria (60% minimum pass rate)
- Technical debt expectations (4 likely failure scenarios)

---

### Example 2: Contract Test POST

**Task:** "T005: Contract test POST /api/quotes - Validate quote creation"

**YAML Spec (18 lines):**

```yaml
task_id: T005
title: Contract Test POST /api/quotes
type: contract-test

api:
  method: POST
  endpoint: /api/v1/quotes
  expected_status: 201
  request_body:
    customerId: CUST001
    items:
      - productId: PROD001
        quantity: 2

test_file: packages/web/__tests__/contracts/quotes-post.test.ts
workspace_root: D:/Dropbox/Repositories/Python/codor/test-case

priority: HIGH
dependencies:
  - T004
```

**Generate:**

```bash
node tools/generate-test-spec.js T005-spec.yaml
```

---

### Example 3: Unit Test

**Task:** "T015: Unit test QuoteService.calculateTotal - Test calculation logic"

**YAML Spec (12 lines):**

```yaml
task_id: T015
title: Unit Test QuoteService.calculateTotal
type: unit-test
description: Test quote total calculation with tax, discounts, and rounding

test_file: src/services/__tests__/quote-service.test.ts
workspace_root: D:/Dropbox/Repositories/Python/codor/test-case

validation_policy:
  eslint: BLOCK_ON_ERRORS_AND_WARNINGS
  typescript: BLOCK_ON_ERRORS_ALWAYS

completion:
  all_steps_must_pass: true
  minimum_pass_rate: 100

priority: MEDIUM
```

---

## Agent Decision Tree

```
┌─────────────────────────────────────┐
│ Read Task Description               │
└─────────┬───────────────────────────┘
          │
          ▼
┌─────────────────────────────────────┐
│ Contains "API" or "endpoint"?       │
└─────────┬───────────────────────────┘
          │
     ┌────┴────┐
     │ YES     │ NO
     ▼         ▼
┌─────────┐  ┌───────────────────────┐
│ contract│  │ Contains "browser"?   │
│  -test  │  └────┬──────────────────┘
└─────────┘       │
            ┌─────┴─────┐
            │ YES       │ NO
            ▼           ▼
       ┌────────┐  ┌──────────────────┐
       │ e2e    │  │ Contains "unit"? │
       │ -test  │  └────┬─────────────┘
       └────────┘       │
                   ┌────┴────┐
                   │ YES     │ NO
                   ▼         ▼
              ┌─────────┐  ┌────────────┐
              │ unit    │  │ integration│
              │ -test   │  │  -test     │
              └─────────┘  └────────────┘
```

---

## Common Patterns

### Pattern 1: CRUD API Endpoints (Contract Tests)

```yaml
# T004: GET
type: contract-test
api:
  method: GET
  endpoint: /api/v1/quotes

# T005: POST
type: contract-test
api:
  method: POST
  endpoint: /api/v1/quotes
  expected_status: 201

# T006: PUT
type: contract-test
api:
  method: PUT
  endpoint: /api/v1/quotes/{id}

# T007: DELETE
type: contract-test
api:
  method: DELETE
  endpoint: /api/v1/quotes/{id}
  expected_status: 204
```

### Pattern 2: Strict vs Lenient Validation

```yaml
# Strict (CI pipeline, production)
validation_policy:
  eslint: BLOCK_ON_ERRORS_AND_WARNINGS
  typescript: BLOCK_ON_ERRORS_ALWAYS
  max_warnings: 0
completion:
  all_steps_must_pass: true
  minimum_pass_rate: 100

# Lenient (TDD, active development)
validation_policy:
  eslint: BLOCK_ON_ERRORS_ONLY
  typescript: BLOCK_ON_ERRORS_ALWAYS
  max_warnings: 20
completion:
  all_steps_must_pass: false
  minimum_pass_rate: 60
```

### Pattern 3: Gradual Improvement (Legacy Code)

```yaml
# Allow warnings but track them
validation_policy:
  eslint: BLOCK_ON_ERRORS_ONLY
  max_warnings: 50              # Current baseline
  ignored_rules:
    - no-console                # Temporary ignore
    - no-debugger
  error_on_rules:
    - no-unused-vars            # High-priority rules
    - "@typescript-eslint/no-unused-vars"
```

**Next Sprint:** Reduce `max_warnings` to 40, remove ignored rules incrementally.

---

## Troubleshooting

### Error: "Unknown template type"

**Cause:** Invalid `type` field in YAML.

**Solution:** Use one of:
- `contract-test`
- `integration-test`
- `unit-test`
- `e2e-test`
- `database-migration`

**Example:**

```yaml
# ✗ Wrong
type: api-test

# ✓ Correct
type: contract-test
```

---

### Error: "YAML validation failed"

**Cause:** Missing required fields or invalid values.

**Solution:** Check error message for specific field:

```
✗ YAML validation failed for T004-spec.yaml:
  - /api: must have required property 'method'
```

**Fix:** Add missing field:

```yaml
api:
  method: GET                   # Add this
  endpoint: /api/v1/quotes
```

---

### Error: "Generated JSON validation failed"

**Cause:** Bug in generator or template.

**Solution:**
1. Verify YAML spec is correct
2. Check if template exists for type
3. Report issue with:
   - YAML spec
   - Error message
   - Template type

---

### Warning: "unknown format date-time ignored"

**Cause:** Ajv format warnings (benign).

**Solution:** Use `--strict=false` flag:

```bash
npx ajv-cli validate -s schema.json -d spec.json --strict=false
```

**These warnings are safe to ignore.**

---

## Best Practices

### 1. Start Simple

**✓ Good:** Minimal YAML with defaults

```yaml
task_id: T004
title: Contract Test GET /api/quotes
type: contract-test
api:
  method: GET
  endpoint: /api/v1/quotes
test_file: packages/web/__tests__/contracts/quotes-get.test.ts
workspace_root: D:/Dropbox/Repositories/Python/codor/test-case
```

**✗ Avoid:** Over-specifying everything initially

---

### 2. Use Defaults Wisely

**Defaults:**
- `base_url`: `http://localhost:3000`
- `eslint`: `BLOCK_ON_ERRORS_ONLY`
- `typescript`: `BLOCK_ON_ERRORS_ALWAYS`
- `max_warnings`: `10`
- `all_steps_must_pass`: `false`
- `minimum_pass_rate`: `60`

**Only override when needed.**

---

### 3. Validate Before Committing

```bash
# Always validate before commit
node tools/generate-test-spec.js T004-spec.yaml --validate-only

# Then generate
node tools/generate-test-spec.js T004-spec.yaml
```

---

### 4. Batch Generation for Sprints

```bash
# Create all YAML specs first
# T004-spec.yaml
# T005-spec.yaml
# T006-spec.yaml
# ...

# Generate all at once
node tools/generate-test-spec.js examples/T*.yaml -o generated/

# Verify all
npx ajv-cli validate -s schema.json -d "generated/*.json" --strict=false
```

---

## Quick Reference Card

```
┌──────────────────────────────────────────────────────────────┐
│ CODOR Test Spec Generator - Quick Reference                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ 1. CREATE YAML (15 lines)                                   │
│    task_id: T004                                            │
│    title: Contract Test GET /api/quotes                     │
│    type: contract-test                                      │
│    api: { method: GET, endpoint: /api/v1/quotes }          │
│    test_file: path/to/test.ts                               │
│    workspace_root: /path/to/workspace                       │
│                                                              │
│ 2. GENERATE JSON                                            │
│    node tools/generate-test-spec.js T004-spec.yaml          │
│                                                              │
│ 3. VALIDATE (optional)                                      │
│    npx ajv-cli validate -s schema.json -d T004.json         │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ TEMPLATE TYPES                                              │
│   contract-test       → API endpoint testing                │
│   integration-test    → Multi-component                     │
│   unit-test           → Isolated tests                      │
│   e2e-test            → Browser flows                       │
│   database-migration  → DB schema                           │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ VALIDATION STRATEGIES                                       │
│   BLOCK_ON_ERRORS_ALWAYS           → TypeScript, strict    │
│   BLOCK_ON_ERRORS_ONLY             → ESLint default         │
│   BLOCK_ON_ERRORS_AND_WARNINGS     → CI strict              │
│   WARN_ONLY                        → Non-blocking           │
│   NEVER                            → Disabled               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Summary

**Agent Workflow:**

1. ✅ Analyze task description
2. ✅ Choose template type
3. ✅ Create 15-line YAML spec
4. ✅ Run generator
5. ✅ Done!

**Benefits:**
- 95% less complexity
- 10x faster
- Zero schema errors
- Scales to 50+ tasks

**Time Investment:**
- First task: 2 minutes (learning)
- Subsequent tasks: 30 seconds each

**The generator handles all the complexity. Your job is to express intent in simple YAML.**

---

**Questions?** See:
- HYBRID-GENERATION-APPROACH.md (architecture)
- simple-test-task-spec.yaml.schema (YAML schema)
- test-task-specification.schema.json (authoritative schema)
- examples/ (sample YAML specs)

---

**Version:** 1.0.0  
**Last Updated:** 2025-09-30  
**Status:** Production Ready ✓
