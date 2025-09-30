# Technical Debt Detection Specification

**Version:** 1.0.0  
**Date:** 2025-09-30  
**Status:** Active

## Overview

Technical debt detection is a **metadata annotation system** that analyzes test results to identify quality, performance, and implementation issues in **PASSED** tests. It does NOT change the binary pass/fail status of a task.

## Core Principle

```
TASK STATUS (Binary):
├── PASSED ✅ → Task can be marked complete
│   └── technicalDebt: [] (may include debt items)
│
└── FAILED ❌ → Task cannot be marked complete
    └── failureAnalysis: {...} (categorization + suggestions)
```

**Technical debt is ONLY created when `status === "PASSED"`**

## When to Create Technical Debt

### ✅ CREATE DEBT FOR:

1. **Partial Implementation**
   - Feature works but missing validation
   - API endpoint exists but lacks error handling
   - Success path works but edge cases missing

2. **Performance Issues**
   - Response time exceeds acceptable thresholds
   - Memory usage higher than expected
   - N+1 query problems detected

3. **Workarounds Used**
   - Temporary fix implemented
   - Known limitation bypassed
   - Tech debt introduced intentionally to ship

4. **Code Quality Issues**
   - Missing type definitions
   - Inadequate error messages
   - Poor variable naming or structure

5. **Related Issues Discovered**
   - Test passes but reveals problems in adjacent code
   - Deprecated dependencies detected
   - Security vulnerabilities in passing tests

### ❌ DON'T CREATE DEBT FOR:

1. **Implementation Doesn't Exist**
   - File not found
   - Endpoint returns 404
   - Function undefined
   - **Outcome:** Task status = `FAILED`, failureAnalysis category = `INCOMPLETE_IMPLEMENTATION`

2. **Implementation Broken**
   - Syntax errors
   - Runtime exceptions
   - Test failures
   - **Outcome:** Task status = `FAILED`, failureAnalysis category = `RUNTIME_ERROR` or `COMPILATION_ERROR`

3. **Prerequisites Fail**
   - Database connection fails
   - Auth service unavailable
   - Build step fails
   - **Outcome:** Task status = `FAILED`, failureAnalysis category = `ENVIRONMENT_ERROR` or `DEPENDENCY_ERROR`

## Technical Debt Categories

### 1. `PERFORMANCE_DEGRADATION`
**Trigger:** Response time > threshold, slow queries, high memory usage  
**Severity:** `LOW` | `MEDIUM` | `HIGH`  
**Example:**
```json
{
  "category": "PERFORMANCE_DEGRADATION",
  "severity": "MEDIUM",
  "description": "API response time 2.3s exceeds 1s threshold",
  "location": "GET /api/quotes",
  "suggestedFix": "Add database indexing on quotes.customerId and quotes.status",
  "detectedAt": "2025-09-30T13:45:00.000Z"
}
```

### 2. `VALIDATION_MISSING`
**Trigger:** Input validation not implemented, schema validation skipped  
**Severity:** `MEDIUM` | `HIGH`  
**Example:**
```json
{
  "category": "VALIDATION_MISSING",
  "severity": "HIGH",
  "description": "Endpoint accepts invalid email format without validation",
  "location": "POST /api/users",
  "suggestedFix": "Add Zod schema validation for user.email field",
  "detectedAt": "2025-09-30T13:45:00.000Z"
}
```

### 3. `ERROR_HANDLING_INCOMPLETE`
**Trigger:** Generic error messages, missing try-catch, unhandled edge cases  
**Severity:** `MEDIUM` | `HIGH`  
**Example:**
```json
{
  "category": "ERROR_HANDLING_INCOMPLETE",
  "severity": "MEDIUM",
  "description": "API returns 500 with generic message instead of 400 for invalid input",
  "location": "POST /api/invoices",
  "suggestedFix": "Add specific validation error responses with field-level details",
  "detectedAt": "2025-09-30T13:45:00.000Z"
}
```

### 4. `API_ENDPOINT_INCOMPLETE`
**Trigger:** Missing pagination, filtering, sorting on list endpoints  
**Severity:** `LOW` | `MEDIUM`  
**Example:**
```json
{
  "category": "API_ENDPOINT_INCOMPLETE",
  "severity": "LOW",
  "description": "GET /api/quotes missing pagination support",
  "location": "GET /api/quotes",
  "suggestedFix": "Add ?page=N&limit=M query parameters with pagination metadata",
  "detectedAt": "2025-09-30T13:45:00.000Z"
}
```

### 5. `CODE_QUALITY`
**Trigger:** Missing types, poor naming, code smells  
**Severity:** `LOW` | `MEDIUM`  
**Example:**
```json
{
  "category": "CODE_QUALITY",
  "severity": "LOW",
  "description": "Function uses 'any' type instead of proper interface",
  "location": "src/api/quotes.ts:45",
  "suggestedFix": "Define QuoteResponse interface and replace any with proper typing",
  "detectedAt": "2025-09-30T13:45:00.000Z"
}
```

### 6. `INTEGRATION_ISSUE`
**Trigger:** Workaround used, integration incomplete, mocked dependencies  
**Severity:** `MEDIUM` | `HIGH`  
**Example:**
```json
{
  "category": "INTEGRATION_ISSUE",
  "severity": "MEDIUM",
  "description": "PDF generation uses mock service instead of real renderer",
  "location": "src/services/pdf-generator.ts",
  "suggestedFix": "Integrate real PDF rendering library (puppeteer or pdf-lib)",
  "detectedAt": "2025-09-30T13:45:00.000Z"
}
```

## Detection Rules

### Automatic Detection Triggers

1. **Performance Thresholds:**
   - HTTP request > 1000ms → `PERFORMANCE_DEGRADATION`
   - Database query > 500ms → `PERFORMANCE_DEGRADATION`
   - Memory usage > 100MB for single operation → `PERFORMANCE_DEGRADATION`

2. **Response Analysis:**
   - Status 500 with generic message → `ERROR_HANDLING_INCOMPLETE`
   - Missing error details in 4xx responses → `ERROR_HANDLING_INCOMPLETE`
   - No validation error context → `VALIDATION_MISSING`

3. **Code Inspection (when available):**
   - TypeScript `any` usage → `CODE_QUALITY`
   - Missing try-catch in async functions → `ERROR_HANDLING_INCOMPLETE`
   - TODO/FIXME comments in production code → `CODE_QUALITY`

4. **Test Output Analysis:**
   - Console warnings during test → `CODE_QUALITY`
   - Deprecation warnings → `CODE_QUALITY`
   - Test uses `.skip()` or `.only()` → `CODE_QUALITY`

## Output Format

Technical debt is stored in the execution report under `technicalDebt` array:

```json
{
  "taskId": "T004",
  "status": "PASSED",
  "technicalDebt": [
    {
      "category": "PERFORMANCE_DEGRADATION",
      "severity": "MEDIUM",
      "description": "API response time 2.3s exceeds 1s threshold",
      "location": "GET /api/quotes",
      "suggestedFix": "Add database indexing on quotes.customerId",
      "detectedAt": "2025-09-30T13:45:00.000Z",
      "relatedSteps": ["STEP.4"]
    }
  ]
}
```

## Evidence Generation

When technical debt is detected, generate:

```
evidence/
└── T004/
    ├── technical-debt.json          # Full debt details
    └── steps/
        └── STEP-4.json              # Step that triggered debt
```

## Integration with Engine

```javascript
// In engine.js after validation:
if (taskResult.status === "PASSED") {
  const technicalDebt = await this.debtDetector.analyze(
    taskResult.steps,
    taskSpec
  );
  taskResult.technicalDebt = technicalDebt;
}
```

## Severity Guidelines

- **LOW:** Nice-to-have improvements, no functional impact
- **MEDIUM:** Should be addressed soon, may cause issues at scale
- **HIGH:** Urgent, likely to cause problems in production

## Example Scenarios

### Scenario 1: Slow API (Create Debt)
```
Test: GET /api/quotes
Result: 200 OK, data correct ✅
Response Time: 2.3s ⚠️

Status: PASSED
Technical Debt: [{
  category: "PERFORMANCE_DEGRADATION",
  severity: "MEDIUM",
  description: "Response time 2.3s exceeds 1s threshold"
}]
```

### Scenario 2: Missing File (Don't Create Debt)
```
Test: Verify contract test exists
Result: File not found ❌

Status: FAILED
Failure Analysis: {
  category: "INCOMPLETE_IMPLEMENTATION",
  reason: "Contract test file doesn't exist",
  blockedBy: ["quotes.get.contract.test.ts"]
}
Technical Debt: null (not created because status = FAILED)
```

### Scenario 3: Missing Validation (Create Debt)
```
Test: POST /api/users with invalid email
Result: 200 OK (accepted invalid email!) ✅

Status: PASSED (technically works)
Technical Debt: [{
  category: "VALIDATION_MISSING",
  severity: "HIGH",
  description: "Endpoint accepts invalid email without validation"
}]
```

## Notes

- Technical debt does NOT fail tests
- Always provide actionable `suggestedFix`
- Link debt to specific steps via `relatedSteps`
- Debt can be dismissed/accepted in future iterations
- Tracking debt over time shows quality trends
