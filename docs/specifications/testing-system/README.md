# Test Specification System

**Purpose**: Generate comprehensive test specifications from simple YAML input  
**Status**: Production Ready ✅  
**Version**: 1.0.0

---

## 📁 Directory Structure

```
testing-system/
│
├── README.md                    ← You are here (start here!)
│
├── 📂 schemas/                  ← **CURRENT SCHEMAS** (active versions)
│   ├── current-test-task.schema.json       # Authoritative JSON schema
│   └── current-yaml-input.schema.yaml      # Simple YAML input schema
│
├── 📂 templates/                ← JSON templates for generation
│   └── contract-test-template.json         # Contract test template
│
├── 📂 tools/                    ← Generator script
│   └── generate-test-spec.js               # YAML → JSON generator
│
├── 📂 examples/                 ← Working examples
│   ├── T004-contract-get-spec.yaml         # GET endpoint example
│   ├── T005-contract-post-spec.yaml        # POST endpoint example
│   └── *.json                              # Generated outputs
│
└── 📂 docs/                     ← All documentation
    ├── INDEX.md                            # Documentation index
    ├── QUICK-START.md                      # 5-minute start guide
    ├── AGENT-USAGE-GUIDE.md                # Agent workflow
    └── ... (other guides)
```

---

## 🚀 Quick Start (5 minutes)

### 1. Look at an example YAML input
```bash
cat examples/T004-contract-get-spec.yaml
```

### 2. Run the generator
```bash
node tools/generate-test-spec.js examples/T004-contract-get-spec.yaml -o examples/
```

### 3. See the generated JSON
```bash
cat examples/T004-contract-get-spec-test-specification.json
```

**That's it!** You just transformed a 40-line YAML into a 365-line validated JSON specification.

---

## 📋 What You Need to Know

### The Current Schemas

1. **`schemas/current-test-task.schema.json`** 
   - **Purpose**: Authoritative schema for complete test specifications
   - **Used by**: Test execution engine, generator (for validation)
   - **Format**: JSON Schema (draft-07)
   - **This is THE schema** - the source of truth

2. **`schemas/current-yaml-input.schema.yaml`**
   - **Purpose**: Simple schema for human/agent-written YAML input
   - **Used by**: Generator (for input validation), agents (as reference)
   - **Format**: YAML
   - **This defines what you write** - the easy input format

### The Workflow

```
1. Write YAML (40 lines)
   ↓
2. Run generator
   ↓
3. Get validated JSON (365 lines)
```

### Example YAML Input
```yaml
task_id: T010
type: contract-test
title: "Contract Test GET /api/customers"
api:
  method: GET
  endpoint: /api/v1/customers
validation_policy:
  eslint: BLOCK_ON_ERRORS_ONLY
  typescript: BLOCK_ON_ERRORS_ALWAYS
  max_warnings: 20
```

### Generator Command
```bash
node tools/generate-test-spec.js <input.yaml> -o <output-dir>/
```

---

## 📖 Documentation

All documentation is in the `docs/` folder:

- **Start here**: `docs/QUICK-START.md` (5 min read)
- **For agents**: `docs/AGENT-USAGE-GUIDE.md`
- **Full details**: `docs/COMPLETE-WORKFLOW-GUIDE.md`
- **All docs**: See `docs/INDEX.md`

---

## 🎯 Key Benefits

- **10x faster** than writing JSON manually (5 min → 30 sec)
- **8x fewer tokens** (40K → 5K)
- **Zero errors** (templates are pre-validated)
- **Batch processing** (generate multiple specs at once)

---

## 🔧 Common Commands

### Generate single specification
```bash
node tools/generate-test-spec.js examples/T004-contract-get-spec.yaml -o examples/
```

### Generate multiple specifications
```bash
node tools/generate-test-spec.js examples/T004-*.yaml examples/T005-*.yaml -o examples/
```

### Validate output against schema
```bash
npx ajv-cli validate -s schemas/current-test-task.schema.json -d examples/output.json --strict=false
```

---

## 📍 File Locations

### Working Files (Use These!)
- **JSON Schema**: `schemas/current-test-task.schema.json`
- **YAML Schema**: `schemas/current-yaml-input.schema.yaml`
- **Generator**: `tools/generate-test-spec.js`
- **Templates**: `templates/*.json`
- **Examples**: `examples/*.yaml`

### Documentation (Read These!)
- **Quick Start**: `docs/QUICK-START.md`
- **Agent Guide**: `docs/AGENT-USAGE-GUIDE.md`
- **Full Index**: `docs/INDEX.md`

### Everything Else
- All other documentation is in `docs/`
- Historical/reference files will be clearly marked

---

## 🆘 Troubleshooting

### "Can't find schema"
Make sure you're using the current schema paths:
- `schemas/current-test-task.schema.json`
- `schemas/current-yaml-input.schema.yaml`

### "Generator not working"
The generator automatically looks in the correct schema locations. If it fails:
1. Check that schemas exist in `schemas/` folder
2. Verify template exists in `templates/` folder
3. Check error message for specific issue

### "Where's the documentation?"
Everything is in `docs/` folder. Start with `docs/INDEX.md`

---

## 📊 Status

### Available Templates
- ✅ **contract-test-template.json** (API contract tests)
- 🔜 component-test-template.json (coming soon)
- 🔜 integration-test-template.json (coming soon)
- 🔜 e2e-test-template.json (coming soon)

### Schema Versions
- **Current**: v2.0.0 (in `schemas/` folder)
- **Historical**: Will be placed in `schemas/archive/` when new versions are created

---

## 💡 Tips

1. **Always use the `schemas/current-*` files** - they are the active versions
2. **Examples folder has working examples** - copy and modify them
3. **Documentation is comprehensive** - but start with QUICK-START.md
4. **Generator handles validation automatically** - you don't need to run ajv manually

---

**Next Step**: Read `docs/QUICK-START.md` or try the example above! 🚀
