# Failure Analysis Specification

**Version:** 1.0.0  
**Date:** 2025-09-30  
**Status:** Active

## Overview

Failure analysis is a **metadata system** that categorizes test failures and provides actionable guidance when `status === "FAILED"`. It helps developers understand WHY a task failed and WHAT to do next.

## Core Principle

```
When status === "FAILED":
└── failureAnalysis: {
      category: "INCOMPLETE_IMPLEMENTATION" | "COMPILATION_ERROR" | ...,
      reason: "Human-readable explanation",
      blockedBy: ["list", "of", "missing", "things"],
      suggestedAction: "What to do next",
      detectedAt: "ISO timestamp"
    }
```

## Failure Categories

### 1. `INCOMPLETE_IMPLEMENTATION`

**Trigger:**
- File doesn't exist (404, ENOENT)
- Function/class not defined
- API endpoint returns 404
- Database table doesn't exist

**Example:**
```json
{
  "category": "INCOMPLETE_IMPLEMENTATION",
  "reason": "Contract test file doesn't exist",
  "blockedBy": [
    "packages/web/src/api/__tests__/quotes.get.contract.test.ts"
  ],
  "suggestedAction": "Create the contract test file following TDD approach",
  "evidence": {
    "actionId": "PREREQ.1",
    "errorType": "ENOENT",
    "expectedPath": "D:\\...\\quotes.get.contract.test.ts"
  }
}
```

**Common Messages:**
- "File not found"
- "Cannot find module"
- "404 Not Found"
- "Table does not exist"

---

### 2. `COMPILATION_ERROR`

**Trigger:**
- TypeScript compilation fails
- Syntax errors
- Import/export errors
- Type checking fails

**Example:**
```json
{
  "category": "COMPILATION_ERROR",
  "reason": "TypeScript compilation failed with 3 errors",
  "blockedBy": [
    "src/api/quotes.ts:45 - Type 'string' is not assignable to type 'number'",
    "src/api/quotes.ts:67 - Cannot find name 'Quote'"
  ],
  "suggestedAction": "Fix TypeScript errors before running tests",
  "evidence": {
    "actionId": "STEP.1",
    "command": "tsc --noEmit",
    "exitCode": 1
  }
}
```

**Common Messages:**
- "TS2345: Argument of type..."
- "SyntaxError: Unexpected token"
- "Cannot find name..."

---

### 3. `RUNTIME_ERROR`

**Trigger:**
- Uncaught exceptions
- Null pointer errors
- Division by zero
- Out of bounds errors

**Example:**
```json
{
  "category": "RUNTIME_ERROR",
  "reason": "Unhandled exception: Cannot read property 'id' of undefined",
  "blockedBy": [
    "src/api/quotes.ts:123"
  ],
  "suggestedAction": "Add null check before accessing quote.customer.id",
  "evidence": {
    "actionId": "STEP.5",
    "stackTrace": "TypeError: Cannot read property...\n  at getQuotes (quotes.ts:123)",
    "errorType": "TypeError"
  }
}
```

**Common Messages:**
- "TypeError: Cannot read property..."
- "ReferenceError: X is not defined"
- "RangeError: Maximum call stack size exceeded"

---

### 4. `VALIDATION_FAILURE`

**Trigger:**
- Test assertion fails
- Expected output doesn't match actual
- Response validation fails
- Schema validation fails

**Example:**
```json
{
  "category": "VALIDATION_FAILURE",
  "reason": "API response schema validation failed",
  "blockedBy": [
    "Response missing required field: 'totalCount'",
    "Field 'status' expected 'pending' but got 'draft'"
  ],
  "suggestedAction": "Update API response to match contract schema",
  "evidence": {
    "actionId": "STEP.6",
    "expected": {"status": "pending", "totalCount": 10},
    "actual": {"status": "draft"}
  }
}
```

**Common Messages:**
- "Expected X but got Y"
- "Assertion failed"
- "Schema validation error"

---

### 5. `ENVIRONMENT_ERROR`

**Trigger:**
- Database connection fails
- Port already in use
- Missing environment variables
- File system permissions

**Example:**
```json
{
  "category": "ENVIRONMENT_ERROR",
  "reason": "Database connection failed",
  "blockedBy": [
    "PostgreSQL not running on localhost:5432"
  ],
  "suggestedAction": "Start PostgreSQL service or update DATABASE_URL",
  "evidence": {
    "actionId": "PREREQ.3",
    "errorType": "ECONNREFUSED",
    "connectionString": "postgresql://localhost:5432/codor_test"
  }
}
```

**Common Messages:**
- "ECONNREFUSED"
- "Port 3000 already in use"
- "Environment variable X is not set"

---

### 6. `DEPENDENCY_ERROR`

**Trigger:**
- npm install fails
- Package not found
- Version conflict
- Missing peer dependency

**Example:**
```json
{
  "category": "DEPENDENCY_ERROR",
  "reason": "npm install failed - package not found",
  "blockedBy": [
    "@types/react@^18.0.0 not found in registry"
  ],
  "suggestedAction": "Update package.json to use available version or check npm registry",
  "evidence": {
    "actionId": "PREREQ.2",
    "command": "npm install",
    "exitCode": 1
  }
}
```

**Common Messages:**
- "404 Not Found - GET https://registry.npmjs.org/..."
- "ERESOLVE unable to resolve dependency tree"
- "Peer dependency missing"

---

### 7. `TIMEOUT`

**Trigger:**
- Request exceeds timeout threshold
- Process hangs
- Infinite loop detected

**Example:**
```json
{
  "category": "TIMEOUT",
  "reason": "HTTP request exceeded 30s timeout",
  "blockedBy": [
    "GET /api/quotes timeout after 30000ms"
  ],
  "suggestedAction": "Check API endpoint performance or increase timeout threshold",
  "evidence": {
    "actionId": "STEP.4",
    "url": "http://localhost:3000/api/quotes",
    "timeout": 30000
  }
}
```

**Common Messages:**
- "Request timeout"
- "Operation timed out"
- "ETIMEDOUT"

---

### 8. `AUTHENTICATION_ERROR`

**Trigger:**
- 401 Unauthorized
- 403 Forbidden
- Invalid credentials
- Token expired

**Example:**
```json
{
  "category": "AUTHENTICATION_ERROR",
  "reason": "API request returned 401 Unauthorized",
  "blockedBy": [
    "Missing or invalid authentication token"
  ],
  "suggestedAction": "Ensure AUTH_TOKEN environment variable is set correctly",
  "evidence": {
    "actionId": "STEP.4",
    "status": 401,
    "url": "http://localhost:3000/api/quotes",
    "headers": {"authorization": "[REDACTED]"}
  }
}
```

**Common Messages:**
- "401 Unauthorized"
- "403 Forbidden"
- "Invalid token"

---

### 9. `CONFIGURATION_ERROR`

**Trigger:**
- Invalid configuration file
- Missing required config
- Config parsing fails

**Example:**
```json
{
  "category": "CONFIGURATION_ERROR",
  "reason": "Invalid tsconfig.json - JSON parse error",
  "blockedBy": [
    "tsconfig.json:5 - Unexpected token }"
  ],
  "suggestedAction": "Fix JSON syntax in tsconfig.json",
  "evidence": {
    "actionId": "STEP.1",
    "file": "tsconfig.json",
    "errorType": "SyntaxError"
  }
}
```

---

## Detection Logic

### Priority Order (First Match Wins)

1. **File/Path Errors** → `INCOMPLETE_IMPLEMENTATION`
   - ENOENT, 404, "File not found", "Cannot find module"

2. **Compilation Errors** → `COMPILATION_ERROR`
   - "TS\d+:", "SyntaxError", tsc exitCode !== 0

3. **Environment Issues** → `ENVIRONMENT_ERROR`
   - ECONNREFUSED, "Port already in use", "not running"

4. **Authentication** → `AUTHENTICATION_ERROR`
   - Status 401, 403, "Unauthorized", "Forbidden"

5. **Timeout** → `TIMEOUT`
   - "timeout", "ETIMEDOUT", duration > threshold

6. **Dependencies** → `DEPENDENCY_ERROR`
   - npm exitCode !== 0, "404 Not Found" from registry

7. **Runtime Exceptions** → `RUNTIME_ERROR`
   - TypeError, ReferenceError, uncaught exception

8. **Validation** → `VALIDATION_FAILURE`
   - Test assertion fails, schema mismatch

9. **Default** → `UNKNOWN_ERROR`
   - Fallback category with full error details

---

## Output Format

Failure analysis is stored in execution report:

```json
{
  "taskId": "T004",
  "status": "FAILED",
  "failureAnalysis": {
    "category": "INCOMPLETE_IMPLEMENTATION",
    "reason": "Contract test file doesn't exist",
    "blockedBy": [
      "packages/web/src/api/__tests__/quotes.get.contract.test.ts"
    ],
    "suggestedAction": "Create the contract test file following TDD approach",
    "detectedAt": "2025-09-30T13:34:21.276Z",
    "evidence": {
      "actionId": "PREREQ.1",
      "errorType": "ENOENT",
      "expectedPath": "D:\\...\\quotes.get.contract.test.ts"
    }
  },
  "technicalDebt": null
}
```

---

## Integration with Engine

```javascript
// In engine.js after task fails:
if (taskResult.status === "FAILED") {
  const failureAnalysis = await this.failureAnalyzer.analyze(
    taskResult.steps,
    taskResult.failureReason,
    taskSpec
  );
  taskResult.failureAnalysis = failureAnalysis;
}
```

---

## Example Scenarios

### Scenario 1: Missing File (TDD)
```
Action: PREREQ.1 - Verify file exists
Error: ENOENT - File not found

Category: INCOMPLETE_IMPLEMENTATION
Reason: "Contract test file doesn't exist"
BlockedBy: ["quotes.get.contract.test.ts"]
SuggestedAction: "Create the contract test file following TDD approach"
```

### Scenario 2: TypeScript Error
```
Action: STEP.1 - Run tsc --noEmit
Exit Code: 1
Output: "TS2345: Argument of type 'string' is not assignable to type 'number'"

Category: COMPILATION_ERROR
Reason: "TypeScript compilation failed with 1 error"
BlockedBy: ["src/api/quotes.ts:45"]
SuggestedAction: "Fix TypeScript errors before running tests"
```

### Scenario 3: API Returns 500
```
Action: STEP.4 - GET /api/quotes
Status: 500
Body: {"error": "Internal Server Error"}

Category: RUNTIME_ERROR
Reason: "API endpoint returned 500 Internal Server Error"
BlockedBy: ["GET /api/quotes"]
SuggestedAction: "Check server logs for exception details, fix error handling"
```

---

## Notes

- Failure analysis is ONLY for `status === "FAILED"`
- Always provide actionable `suggestedAction`
- Include relevant evidence (error messages, stack traces, exit codes)
- Don't create technical debt when status is FAILED
- Link to specific action that triggered failure
