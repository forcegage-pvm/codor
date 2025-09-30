# Component Test Template - Implementation Status

**Date**: 2025-09-30  
**Status**: IN PROGRESS (50% Complete)

## Summary

Started implementing component-test-template.json to cover 37% of Sprint 006 tasks (11 component test tasks). Discovered the template structure is more complex than initially anticipated.

## What Was Completed ✅

### 1. Updated YAML Schema (current-yaml-input.schema.yaml)
- ✅ Added `component-test` to type enum
- ✅ Created `component` field definition for component-specific data
- ✅ Created `test_framework` field for test framework configuration
- ✅ Created `scenarios` array for simplified scenario definitions
- ✅ Added conditional requirement: `component-test` type requires `component` field

### 2. Updated Generator Script
- ✅ Added `component-test` to TEMPLATE_MAP in generate-test-spec.js

### 3. Created Example YAML Input
- ✅ Created T011-component-quote-table.yaml
- ✅ Matches schema requirements (task_id, title, type, test_file, workspace_root)
- ✅ Includes component-specific fields (component, test_framework, scenarios)
- ✅ Validates successfully against current-yaml-input.schema.yaml

## What Still Needs Work ⏳

### 1. Component Test Template Structure
**Issue**: Initial template was incomplete - only included task metadata, not full specification structure.

**Required Structure** (from contract-test-template.json analysis):
```json
{
  "$schema": "../schemas/current-test-task.schema.json",
  "schemaVersion": "2.0.0",
  "metadata": { ... },
  "globalConfiguration": {
    "workspaceRoot": "{{WORKSPACE_ROOT}}",
    "evidenceDirectory": "evidence",
    "devServer": { ... },
    "environment": { ... },
    "validationPolicy": { ... }
  },
  "executionEngine": {
    "availableActionTypes": [...],
    "executorConfigurations": { ... }
  },
  "tasks": {
    "{{TASK_ID}}": {
      "taskId": "{{TASK_ID}}",
      "title": "{{TASK_TITLE}}",
      "description": "{{TASK_DESCRIPTION}}",
      "priority": "{{PRIORITY}}",
      "dependencies": "{{DEPENDENCIES}}",
      "testExecution": {
        "prerequisites": [...],
        "testSteps": [...],
        "validation": [...],
        "cleanup": [...]
      }
    }
  }
}
```

### 2. Component Test-Specific Test Steps
Need to define test steps for component testing (vs API contract testing):

**Prerequisites** (before rendering component):
- Install dependencies (npm install)
- Build types if needed (npm run build:types)
- Verify component file exists

**Test Steps** (component-specific):
- Render component with test props
- Verify rendering (no errors)
- Simulate user interactions (clicks, typing, etc.)
- Verify state changes
- Verify callbacks triggered
- Run accessibility audit (jest-axe)
- Capture snapshot

**Validation**:
- Check test output for failures
- Verify coverage meets threshold (80%)
- Verify accessibility violations = 0
- Verify snapshot matches

**Cleanup**:
- Clear mocks
- Cleanup rendered components

### 3. Placeholder Mapping
Need to map YAML fields to template placeholders for component tests:

| YAML Field | Template Placeholder | Example Value |
|------------|---------------------|---------------|
| task_id | {{TASK_ID}} | T011 |
| title | {{TASK_TITLE}} | Component Test: QuoteTable |
| description | {{TASK_DESCRIPTION}} | Test suite for QuoteTable... |
| component.name | {{COMPONENT_NAME}} | QuoteTable |
| component.path | {{COMPONENT_PATH}} | packages/web/src/components/... |
| test_file | {{TEST_FILE_PATH}} | packages/web/src/components/.../__.test.tsx |
| workspace_root | {{WORKSPACE_ROOT}} | D:/Dropbox/... |
| test_framework.name | {{TEST_FRAMEWORK}} | jest |
| validation_policy.coverage_threshold | {{COVERAGE_TARGET}} | 80 |

## Estimated Effort to Complete

**Time**: 2-3 hours  
**Complexity**: Medium-High

**Tasks**:
1. Create full component-test-template.json with proper structure (1.5 hours)
   - Copy globalConfiguration from contract-test-template
   - Adapt testExecution for component testing workflow
   - Define 4-5 test steps for component rendering, interaction, accessibility
   - Add proper placeholders for all fields

2. Update generator to handle component-specific substitutions (30 minutes)
   - Map component.* fields
   - Map test_framework.* fields
   - Map scenarios array to test steps

3. Test generation and validate output (30-60 minutes)
   - Generate T011 from YAML
   - Validate against schema
   - Verify all placeholders substituted correctly
   - Compare output to manual T011 specification

## Benefits After Completion

- **Automated generation** for 11 Sprint 006 tasks (T011-T014, T019-T022, T028-T029)
- **37% sprint coverage** with component-test template alone
- **Consistent structure** across all component tests
- **80% sprint coverage** when combined with integration-test template

## Recommendation

**Option 1: Complete component-test-template now** (2-3 hours)
- Highest ROI (covers 37% of sprint)
- Validates the multi-template approach
- Establishes pattern for other templates

**Option 2: Simplify approach first** (evaluate alternatives)
- Consider if contract-test-template can be extended
- Evaluate if full testExecution structure is needed for all template types
- Possibly create "lightweight" templates for simpler test types

## Files Modified

1. ✅ `schemas/current-yaml-input.schema.yaml` - Added component-test support
2. ✅ `tools/generate-test-spec.js` - Added component-test to template map
3. ✅ `examples/T011-component-quote-table.yaml` - Example YAML input
4. ⏳ `templates/component-test-template.json` - DELETED (needs recreation with proper structure)

## Next Steps

**If continuing with component-test-template:**
1. Study contract-test-template.json structure (lines 1-327)
2. Create component-test-template.json following same structure
3. Adapt testExecution steps for component testing workflow
4. Test generation with T011-component-quote-table.yaml
5. Validate generated JSON against schema

**If pivoting to simpler approach:**
1. Evaluate if testExecution structure can be simplified
2. Consider creating "task definition" templates (just metadata + scenarios)
3. Let test execution engine interpret scenarios dynamically
4. Reduces template size from ~300 lines to ~100 lines

---

## Question for User

Do you want me to:

**A)** Continue with full component-test-template.json (2-3 hours, follows contract-test pattern)  
**B)** Create simplified component template (1 hour, smaller but less detailed test steps)  
**C)** First complete analysis of other needed templates (integration, E2E, feature) to ensure consistent approach

**My recommendation**: **Option B** - Create simplified template first, validate it works, then enhance with detailed test steps if needed. This follows the "working software over comprehensive documentation" principle and lets us iterate faster.
