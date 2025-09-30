# Quick Start: Test Specification Generation

**TL;DR**: Write 40 lines of YAML, run 1 command, get 365 lines of validated JSON.

---

## The Old Way (DON'T DO THIS)

```
Agent writes JSON directly → 365 lines → 15 tool calls → 6 errors → 5 minutes → 40K tokens
```

❌ Slow  
❌ Expensive  
❌ Error-prone  

---

## The New Way (DO THIS)

```
Write YAML → Run generator → Get validated JSON
40 lines   → 1 command    → 365 lines (30 sec, 5K tokens)
```

✅ Fast  
✅ Cheap  
✅ Zero errors  

---

## Quick Example

### 1. Create YAML (40 lines)
```yaml
# examples/T010-customer-get-spec.yaml
task_id: T010
type: contract-test
title: "Contract Test GET /api/v1/customers"
description: "Test customer list endpoint"

workspace_root: "D:/Dropbox/Repositories/Python/codor/test-case"
test_file: "packages/web/__tests__/contracts/customers-get.test.ts"

api:
  method: GET
  endpoint: /api/v1/customers
  expected_status: 200

validation_policy:
  eslint: BLOCK_ON_ERRORS_ONLY
  typescript: BLOCK_ON_ERRORS_ALWAYS
  max_warnings: 20
  ignored_rules: ["no-console"]
  error_on_rules: ["no-unused-vars", "@typescript-eslint/no-unused-vars"]

dependencies: []
priority: HIGH
timeout: 300000
```

### 2. Run Generator (1 command)
```bash
node tools/generate-test-spec.js examples/T010-customer-get-spec.yaml -o examples/
```

### 3. Get Result (365 lines)
```
✓ Schemas loaded successfully
✓ Loaded YAML spec: examples/T010-customer-get-spec.yaml
✓ YAML spec validated
✓ Loaded template: contract-test-template.json
✓ Generated JSON validates against authoritative schema
✓ Written to: examples/T010-customer-get-spec-test-specification.json
```

**Done!** 🎉

---

## Batch Generation (Sprint Planning)

### Create multiple YAML files
```
examples/T010-customer-get-spec.yaml
examples/T011-customer-post-spec.yaml
examples/T012-invoice-get-spec.yaml
examples/T013-invoice-post-spec.yaml
examples/T014-payment-get-spec.yaml
```

### Generate all at once
```bash
node tools/generate-test-spec.js examples/T010-*.yaml examples/T011-*.yaml examples/T012-*.yaml examples/T013-*.yaml examples/T014-*.yaml -o examples/
```

Or using PowerShell:
```powershell
Get-ChildItem examples/T01*.yaml | ForEach-Object { 
  node tools/generate-test-spec.js $_.FullName -o examples/ 
}
```

**Result**: 5 complete test specifications in 30 seconds!

---

## What You Need to Know

### YAML Structure (Minimum)
```yaml
task_id: TXXX           # Required
type: contract-test     # Required (contract-test, component-test, etc.)
title: "Test Name"      # Required
api:
  method: GET           # GET, POST, PUT, DELETE
  endpoint: /api/path   # API path
validation_policy:
  eslint: BLOCK_ON_ERRORS_ONLY      # Validation strategy
  typescript: BLOCK_ON_ERRORS_ALWAYS
```

### Validation Strategies
- `BLOCK_ON_ERRORS_ALWAYS` - Stop on any error
- `BLOCK_ON_ERRORS_ONLY` - Stop on errors, allow warnings
- `BLOCK_ON_ERRORS_AND_WARNINGS` - Stop on errors or warnings
- `WARN_ONLY` - Never stop, just warn
- `NEVER` - Disable validation

### Test Types
- `contract-test` - API contract tests (✅ Template available)
- `component-test` - Component tests (🔜 Coming soon)
- `integration-test` - Integration tests (🔜 Coming soon)
- `e2e-test` - End-to-end tests (🔜 Coming soon)
- `custom` - Custom test workflows (🔜 Coming soon)

---

## Common Patterns

### GET Endpoint
```yaml
task_id: T100
type: contract-test
title: "Contract Test GET /api/resource"
api:
  method: GET
  endpoint: /api/resource
  expected_status: 200
```

### POST Endpoint
```yaml
task_id: T101
type: contract-test
title: "Contract Test POST /api/resource"
api:
  method: POST
  endpoint: /api/resource
  expected_status: 201
  request_body:
    name: "Test Resource"
    value: 123
```

### With Dependencies
```yaml
task_id: T102
type: contract-test
title: "Test with dependencies"
dependencies: [T100, T101]  # Runs after T100 and T101
api:
  method: GET
  endpoint: /api/derived-resource
```

---

## For AI Agents

### When you get a request to create a test specification:

1. **Read the guide**
   ```
   Read: docs/specifications/testing-system/AGENT-USAGE-GUIDE.md
   ```

2. **Look at examples**
   ```
   Read: examples/T004-contract-get-spec.yaml (GET example)
   Read: examples/T005-contract-post-spec.yaml (POST example)
   ```

3. **Create YAML file**
   ```
   create_file("examples/TXXX-name-spec.yaml", content)
   ```

4. **Run generator**
   ```
   run_in_terminal("node tools/generate-test-spec.js examples/TXXX-name-spec.yaml -o examples/")
   ```

5. **Report success**
   ```
   "✅ Test specification TXXX created successfully!"
   ```

### Do NOT:
- ❌ Write JSON directly
- ❌ Try to create the full specification manually
- ❌ Skip validation

### DO:
- ✅ Write simple YAML
- ✅ Use the generator
- ✅ Verify success

---

## Troubleshooting

### "Template not found"
Only `contract-test` has a template currently. For other types, use manual generation or wait for templates.

### "YAML validation failed"
Check required fields: `task_id`, `type`, `title`  
Check enum values: validation strategies, HTTP methods

### "Need help with YAML structure"
Look at: `examples/T004-contract-get-spec.yaml`  
Read: `AGENT-USAGE-GUIDE.md`

---

## File Locations

```
docs/specifications/testing-system/
├── simple-test-task-spec.yaml.schema    # YAML schema
├── test-task-specification.schema.json  # Authoritative JSON schema
├── AGENT-USAGE-GUIDE.md                 # Full agent guide
├── COMPLETE-WORKFLOW-GUIDE.md           # Detailed workflow
├── QUICK-START.md                       # This file
├── tools/
│   └── generate-test-spec.js            # Generator script
├── templates/
│   └── contract-test-template.json      # Contract test template
└── examples/
    ├── T004-contract-get-spec.yaml      # GET example
    ├── T005-contract-post-spec.yaml     # POST example
    └── *.json                            # Generated specifications
```

---

## Performance

| Metric | Manual | Generated | Improvement |
|--------|--------|-----------|-------------|
| Time | 5 min | 30 sec | 10x faster |
| Tokens | 40K | 5K | 8x fewer |
| Errors | 6 | 0 | 100% reduction |
| Input | 365 lines | 40 lines | 90% less |

---

## Questions?

- **Full workflow**: Read `COMPLETE-WORKFLOW-GUIDE.md`
- **Agent instructions**: Read `AGENT-USAGE-GUIDE.md`
- **YAML structure**: Read `simple-test-task-spec.yaml.schema`
- **Examples**: Check `examples/*.yaml`

---

**Remember**: YAML → Generator → JSON. That's it! 🚀
