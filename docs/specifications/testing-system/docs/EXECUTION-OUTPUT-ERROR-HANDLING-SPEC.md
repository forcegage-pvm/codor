# Execution Output & Error Handling Specification

**Version**: 1.0.0  
**Date**: September 30, 2025  
**Status**: Design Specification

---

## Table of Contents

1. [Overview](#overview)
2. [Execution Result Taxonomy](#execution-result-taxonomy)
3. [Output Structures](#output-structures)
4. [Error Classification](#error-classification)
5. [Evidence Collection](#evidence-collection)
6. [Technical Debt Generation](#technical-debt-generation)
7. [Agent Integration Points](#agent-integration-points)

---

## Overview

The script-execution-engine must produce **structured, comprehensive outputs** for every execution scenario. These outputs serve multiple purposes:

1. **Verification**: Prove test execution occurred and was authentic
2. **Debugging**: Enable root cause analysis of failures
3. **Debt Generation**: Provide complete context for technical debt items
4. **Audit Trail**: Create unfakeable execution history
5. **Agent Consumption**: Give agents structured data (not raw logs)

---

## Execution Result Taxonomy

### Result Categories

Every action execution falls into one of these mutually exclusive categories:

```typescript
enum ExecutionResultType {
  // ✅ Everything succeeded
  SUCCESS = "SUCCESS",
  
  // ❌ Test failed as expected (TDD red phase)
  TEST_FAILURE = "TEST_FAILURE",
  
  // ⚠️ Tool/command failed (infrastructure issue)
  EXECUTION_ERROR = "EXECUTION_ERROR",
  
  // 🔧 Tool succeeded but detected code issues
  VALIDATION_FAILURE = "VALIDATION_FAILURE",
  
  // 🚫 Timeout or resource exhaustion
  TIMEOUT = "TIMEOUT",
  
  // 🔌 Prerequisite not met (server down, file missing)
  PREREQUISITE_FAILURE = "PREREQUISITE_FAILURE",
  
  // 🛑 Specification error (invalid parameters)
  SPECIFICATION_ERROR = "SPECIFICATION_ERROR"
}
```

### Decision Tree

```
Execute Action
  │
  ├─> Prerequisite Check
  │     ├─> FAIL → PREREQUISITE_FAILURE
  │     └─> PASS → Continue
  │
  ├─> Parameter Validation
  │     ├─> INVALID → SPECIFICATION_ERROR
  │     └─> VALID → Continue
  │
  ├─> Tool Execution
  │     ├─> TIMEOUT → TIMEOUT
  │     ├─> TOOL_CRASH → EXECUTION_ERROR
  │     └─> COMPLETED → Continue
  │
  ├─> Exit Code Analysis
  │     ├─> Non-zero AND test command → TEST_FAILURE
  │     ├─> Non-zero AND non-test → EXECUTION_ERROR
  │     └─> Zero → Continue
  │
  ├─> Output Analysis
  │     ├─> Errors in stdout/stderr → VALIDATION_FAILURE
  │     ├─> Warnings only → SUCCESS (with warnings)
  │     └─> Clean → SUCCESS
  │
  └─> Success Criteria Check
        ├─> Met → SUCCESS
        └─> Not Met → TEST_FAILURE or VALIDATION_FAILURE
```

---

## Configurable Validation Policies

### Validation Blocking Strategy

Different projects have different tolerance for validation issues (linting, type checking, etc.). The test specification schema supports configurable validation policies.

#### Configuration Location

**File**: Test specification `globalConfiguration.validationPolicy`

```json
{
  "globalConfiguration": {
    "validationPolicy": {
      "linting": {
        "strategy": "BLOCK_ON_ERRORS_ONLY",
        "tools": {
          "eslint": {
            "enabled": true,
            "blockOn": "ERRORS_ONLY",
            "treatWarningsAsErrors": false,
            "maxWarnings": null
          },
          "prettier": {
            "enabled": false,
            "blockOn": "NEVER"
          }
        }
      },
      "typeChecking": {
        "strategy": "BLOCK_ON_ERRORS_ALWAYS",
        "tools": {
          "typescript": {
            "enabled": true,
            "blockOn": "ERRORS_ALWAYS",
            "allowImplicitAny": false
          }
        }
      },
      "compilation": {
        "strategy": "BLOCK_ON_ERRORS_ALWAYS"
      }
    }
  }
}
```

#### Blocking Strategies

| Strategy | Description | Blocking Behavior | Debt Generation |
|----------|-------------|-------------------|-----------------|
| `BLOCK_ON_ERRORS_ALWAYS` | Block on any errors | Exit code 1+ → FAILED | YES (CRITICAL) |
| `BLOCK_ON_ERRORS_ONLY` | Block on errors, allow warnings | Errors → FAILED<br>Warnings → PARTIAL | Errors: YES (HIGH)<br>Warnings: YES (MEDIUM) |
| `BLOCK_ON_ERRORS_AND_WARNINGS` | Block on errors and warnings | Errors/Warnings → FAILED | YES (HIGH) |
| `WARN_ONLY` | Never block, always report | Always → PARTIAL | YES (MEDIUM) |
| `NEVER` | Ignore completely | Always → SUCCESS | NO |

#### ESLint-Specific Configuration

```json
{
  "validationPolicy": {
    "linting": {
      "tools": {
        "eslint": {
          "enabled": true,
          "blockOn": "ERRORS_ONLY",
          "treatWarningsAsErrors": false,
          "maxWarnings": 10,  // Block if warnings > 10
          "ignoredRules": [
            "no-console",
            "@typescript-eslint/no-explicit-any"
          ],
          "errorOnRules": [
            "no-unused-vars",
            "@typescript-eslint/no-unused-vars"
          ]
        }
      }
    }
  }
}
```

#### Classification Logic with Configurable Policies

```javascript
/**
 * Determine if validation failure should block execution
 * @param {Object} result - Validation tool execution result
 * @param {Object} policy - Validation policy from test specification
 * @returns {Object} Classification with blocking decision
 */
function classifyValidationFailure(result, policy) {
  const tool = detectValidationTool(result); // 'eslint', 'typescript', 'prettier'
  const toolPolicy = policy.linting?.tools?.[tool] || policy.typeChecking?.tools?.[tool];
  
  if (!toolPolicy || !toolPolicy.enabled) {
    // Tool not configured - default to non-blocking
    return {
      status: 'VALIDATION_FAILURE',
      blocking: false,
      severity: 'LOW',
      reason: 'Validation tool not configured in policy'
    };
  }
  
  // Parse validation output
  const issues = parseValidationOutput(result, tool);
  
  // Apply policy
  switch (toolPolicy.blockOn) {
    case 'ERRORS_ALWAYS':
      if (issues.errors > 0) {
        return {
          status: 'VALIDATION_FAILURE',
          blocking: true,
          severity: 'CRITICAL',
          reason: `${issues.errors} ${tool} errors (BLOCK_ON_ERRORS_ALWAYS)`
        };
      }
      if (issues.warnings > 0) {
        return {
          status: 'VALIDATION_FAILURE',
          blocking: false,
          severity: 'MEDIUM',
          reason: `${issues.warnings} ${tool} warnings (allowed by policy)`
        };
      }
      break;
      
    case 'ERRORS_ONLY':
      if (issues.errors > 0) {
        return {
          status: 'VALIDATION_FAILURE',
          blocking: true,
          severity: 'HIGH',
          reason: `${issues.errors} ${tool} errors (BLOCK_ON_ERRORS_ONLY)`
        };
      }
      if (issues.warnings > 0) {
        // Check maxWarnings threshold
        if (toolPolicy.maxWarnings !== null && issues.warnings > toolPolicy.maxWarnings) {
          return {
            status: 'VALIDATION_FAILURE',
            blocking: true,
            severity: 'HIGH',
            reason: `${issues.warnings} warnings exceeds maxWarnings (${toolPolicy.maxWarnings})`
          };
        }
        return {
          status: 'VALIDATION_FAILURE',
          blocking: false,
          severity: 'MEDIUM',
          reason: `${issues.warnings} ${tool} warnings (non-blocking)`
        };
      }
      break;
      
    case 'ERRORS_AND_WARNINGS':
      if (issues.errors > 0 || issues.warnings > 0) {
        return {
          status: 'VALIDATION_FAILURE',
          blocking: true,
          severity: 'HIGH',
          reason: `${issues.errors} errors, ${issues.warnings} warnings (BLOCK_ON_ERRORS_AND_WARNINGS)`
        };
      }
      break;
      
    case 'WARN_ONLY':
      if (issues.errors > 0 || issues.warnings > 0) {
        return {
          status: 'VALIDATION_FAILURE',
          blocking: false,
          severity: 'LOW',
          reason: `${issues.errors} errors, ${issues.warnings} warnings (WARN_ONLY)`
        };
      }
      break;
      
    case 'NEVER':
      return {
        status: 'SUCCESS',
        blocking: false,
        severity: 'NONE',
        reason: 'Validation issues ignored (NEVER policy)'
      };
  }
  
  // No issues found
  return {
    status: 'SUCCESS',
    blocking: false,
    severity: 'NONE',
    reason: 'No validation issues'
  };
}

/**
 * Parse validation tool output to extract errors and warnings
 */
function parseValidationOutput(result, tool) {
  switch (tool) {
    case 'eslint':
      return parseESLintOutput(result.stdout + result.stderr);
    case 'typescript':
      return parseTypeScriptOutput(result.stdout + result.stderr);
    case 'prettier':
      return parsePrettierOutput(result.stdout + result.stderr);
    default:
      // Generic parser - look for common patterns
      return parseGenericValidationOutput(result.stdout + result.stderr);
  }
}
```

#### Example Classification Outcomes

**Scenario 1: ESLint with BLOCK_ON_ERRORS_ONLY**
```
Output: "5 errors, 12 warnings"
Policy: { blockOn: "ERRORS_ONLY", maxWarnings: null }
Result: 
  - status: VALIDATION_FAILURE
  - blocking: true (has errors)
  - severity: HIGH
  - taskStatus: FAILED
  - debtGenerated: YES (HIGH priority)
```

**Scenario 2: ESLint with BLOCK_ON_ERRORS_ONLY + maxWarnings**
```
Output: "0 errors, 15 warnings"
Policy: { blockOn: "ERRORS_ONLY", maxWarnings: 10 }
Result:
  - status: VALIDATION_FAILURE
  - blocking: true (warnings exceed threshold)
  - severity: HIGH
  - taskStatus: FAILED
  - debtGenerated: YES (MEDIUM priority)
```

**Scenario 3: ESLint with WARN_ONLY**
```
Output: "3 errors, 8 warnings"
Policy: { blockOn: "WARN_ONLY" }
Result:
  - status: VALIDATION_FAILURE
  - blocking: false (warn only)
  - severity: LOW
  - taskStatus: PARTIAL
  - debtGenerated: YES (LOW priority)
```

**Scenario 4: TypeScript with BLOCK_ON_ERRORS_ALWAYS**
```
Output: "error TS2345: Type mismatch"
Policy: { blockOn: "ERRORS_ALWAYS" }
Result:
  - status: VALIDATION_FAILURE
  - blocking: true (always block on TS errors)
  - severity: CRITICAL
  - taskStatus: FAILED
  - debtGenerated: YES (CRITICAL priority)
```

#### Default Policies by Tool Type

If no policy is specified in test specification, use these defaults:

| Tool Type | Default Strategy |
|-----------|------------------|
| TypeScript | `BLOCK_ON_ERRORS_ALWAYS` |
| Compilation | `BLOCK_ON_ERRORS_ALWAYS` |
| ESLint | `BLOCK_ON_ERRORS_ONLY` |
| Prettier | `WARN_ONLY` |
| Other Linters | `BLOCK_ON_ERRORS_ONLY` |

#### Agent Guidance for Setting Policies

When generating test specifications, agents should:

1. **Analyze project configuration files**:
   - Check `.eslintrc.json` for `"max-warnings": 0` → Use `BLOCK_ON_ERRORS_AND_WARNINGS`
   - Check `package.json` scripts for `--max-warnings` flags
   - Check if project has strict linting in CI

2. **Match project's existing standards**:
   - If project blocks CI on warnings → Use `BLOCK_ON_ERRORS_AND_WARNINGS`
   - If project allows warnings → Use `BLOCK_ON_ERRORS_ONLY`
   - If project is lenient → Use `WARN_ONLY`

3. **Document policy decisions**:
   ```json
   {
     "metadata": {
       "validationPolicyRationale": "Project uses eslint --max-warnings 0 in CI, so blocking on errors and warnings"
     }
   }
   ```

---

## Output Structures

### 1. Master Execution Report

**File**: `evidence/{TASK_ID}/execution-report.json`

This is the **single source of truth** for what happened during test execution.

```json
{
  "reportVersion": "2.0.0",
  "generatedAt": "2025-09-30T14:45:00.000Z",
  "generatedBy": "CODOR Script Execution Engine v2.0",
  "agentInvolved": false,
  
  "testSpecification": {
    "file": "T030-quote-service-test-specification.json",
    "schemaVersion": "2.0.0",
    "taskId": "T030",
    "taskTitle": "QuoteService CRUD Implementation",
    "sprintId": "SPRINT_004"
  },
  
  "executionSummary": {
    "overallStatus": "PARTIAL_SUCCESS",
    "startTime": "2025-09-30T14:30:00.000Z",
    "endTime": "2025-09-30T14:45:00.000Z",
    "totalDuration": 900000,
    "
": {
      "total": 16,
      "executed": 16,
      "skipped": 0,
      "prerequisites": 3,
      "steps": 12,
      "cleanup": 1
    },
    "actionResults": {
      "SUCCESS": 10,
      "TEST_FAILURE": 4,
      "EXECUTION_ERROR": 1,
      "VALIDATION_FAILURE": 1,
      "TIMEOUT": 0,
      "PREREQUISITE_FAILURE": 0,
      "SPECIFICATION_ERROR": 0
    },
    "testResults": {
      "passed": 8,
      "failed": 7,
      "total": 15,
      "passRate": 53.3
    }
  },
  
  "prerequisiteExecution": {
    "allMet": true,
    "results": [
      {
        "actionId": "PREREQ.1",
        "type": "FILE_VALIDATION",
        "status": "SUCCESS",
        "description": "Verify TypeScript type dependencies exist",
        "duration": 15,
        "evidence": "evidence/T030/PREREQ.1-file-validation.json"
      },
      {
        "actionId": "PREREQ.2",
        "type": "TERMINAL_COMMAND",
        "status": "SUCCESS",
        "description": "Install dependencies",
        "duration": 12500,
        "evidence": "evidence/T030/PREREQ.2-terminal-output.log"
      },
      {
        "actionId": "PREREQ.3",
        "type": "TERMINAL_COMMAND",
        "status": "SUCCESS",
        "description": "Start Next.js dev server",
        "duration": 8200,
        "evidence": "evidence/T030/PREREQ.3-server-startup.log"
      }
    ]
  },
  
  "stepExecution": {
    "results": [
      {
        "actionId": "STEP.1",
        "type": "FILE_VALIDATION",
        "status": "SUCCESS",
        "description": "Verify QuoteService.ts exists",
        "duration": 8,
        "evidence": "evidence/T030/STEP.1-file-validation.json",
        "result": {
          "fileExists": true,
          "filePath": "D:\\...\\QuoteService.ts",
          "fileSize": 2450,
          "lastModified": "2025-09-30T14:20:00.000Z"
        }
      },
      {
        "actionId": "STEP.3",
        "type": "TERMINAL_COMMAND",
        "status": "VALIDATION_FAILURE",
        "description": "Run TypeScript compiler",
        "duration": 3200,
        "evidence": "evidence/T030/STEP.3-typescript-compilation.log",
        "result": {
          "exitCode": 2,
          "stdout": "",
          "stderr": "error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.\n  at QuoteService.ts:45:18",
          "diagnostics": [
            {
              "file": "QuoteService.ts",
              "line": 45,
              "column": 18,
              "code": "TS2345",
              "message": "Argument of type 'string' is not assignable to parameter of type 'number'",
              "severity": "error"
            }
          ]
        },
        "classification": {
          "category": "VALIDATION_FAILURE",
          "reason": "TypeScript compilation errors detected",
          "toolSucceeded": true,
          "codeHasIssues": true,
          "isExpectedFailure": false
        }
      },
      {
        "actionId": "STEP.4",
        "type": "TERMINAL_COMMAND",
        "status": "TEST_FAILURE",
        "description": "Run contract test T005 (GET /api/v1/quotes)",
        "duration": 2100,
        "evidence": "evidence/T030/STEP.4-contract-test-T005.log",
        "result": {
          "exitCode": 1,
          "stdout": "FAIL __tests__/contracts/quotes-list.test.ts\n  ● should return 200 OK with quotes array\n    \n    expect(received).toBe(expected)\n    \n    Expected: 200\n    Received: 404\n",
          "stderr": "",
          "testResults": {
            "passed": 3,
            "failed": 2,
            "total": 5,
            "failures": [
              {
                "testName": "should return 200 OK with quotes array",
                "error": "Expected status 200, received 404",
                "stack": "at Object.<anonymous> (__tests__/contracts/quotes-list.test.ts:15:23)"
              }
            ]
          }
        },
        "classification": {
          "category": "TEST_FAILURE",
          "reason": "Contract test assertions failed",
          "toolSucceeded": true,
          "testsRan": true,
          "isExpectedFailure": false,
          "isTDDRedPhase": false
        }
      },
      {
        "actionId": "STEP.9",
        "type": "HTTP_REQUEST",
        "status": "EXECUTION_ERROR",
        "description": "Validate GET /api/v1/quotes returns 200",
        "duration": 100,
        "evidence": "evidence/T030/STEP.9-http-error.json",
        "result": {
          "error": "ECONNREFUSED",
          "errorCode": "ECONNREFUSED",
          "message": "connect ECONNREFUSED 127.0.0.1:3000",
          "errno": -4078,
          "syscall": "connect",
          "address": "127.0.0.1",
          "port": 3000
        },
        "classification": {
          "category": "EXECUTION_ERROR",
          "reason": "HTTP client could not connect to server",
          "toolFailed": true,
          "possibleCauses": [
            "Dev server not running",
            "Server crashed during test",
            "Port 3000 not accessible",
            "Firewall blocking connection"
          ]
        }
      },
      {
        "actionId": "STEP.11",
        "type": "TERMINAL_COMMAND",
        "status": "VALIDATION_FAILURE",
        "description": "Run ESLint for code quality",
        "duration": 1800,
        "evidence": "evidence/T030/STEP.11-eslint-report.json",
        "result": {
          "exitCode": 1,
          "stdout": "",
          "stderr": "",
          "eslintResults": [
            {
              "filePath": "src/services/quotes/QuoteService.ts",
              "errorCount": 3,
              "warningCount": 5,
              "messages": [
                {
                  "ruleId": "no-unused-vars",
                  "severity": 2,
                  "message": "'customerId' is defined but never used",
                  "line": 23,
                  "column": 10
                },
                {
                  "ruleId": "@typescript-eslint/no-explicit-any",
                  "severity": 1,
                  "message": "Unexpected any. Specify a different type",
                  "line": 45,
                  "column": 28
                }
              ]
            }
          ]
        },
        "classification": {
          "category": "VALIDATION_FAILURE",
          "reason": "ESLint found code quality issues",
          "toolSucceeded": true,
          "codeHasIssues": true,
          "severity": "MEDIUM",
          "fixable": true
        }
      }
    ]
  },
  
  "cleanupExecution": {
    "executed": true,
    "results": [
      {
        "actionId": "CLEANUP.1",
        "type": "TERMINAL_COMMAND",
        "status": "SUCCESS",
        "description": "Stop dev server",
        "duration": 500,
        "evidence": "evidence/T030/CLEANUP.1-server-shutdown.log"
      }
    ]
  },
  
  "validationCriteriaEvaluation": {
    "successConditions": {
      "total": 6,
      "met": 2,
      "failed": 4,
      "details": [
        {
          "condition": "STEP.1.exitCode === 0",
          "description": "QuoteService.ts file exists",
          "met": true
        },
        {
          "condition": "STEP.3.exitCode === 0",
          "description": "TypeScript compilation succeeds",
          "met": false,
          "actualValue": 2,
          "reason": "TypeScript found 1 error"
        },
        {
          "condition": "STEP.4.exitCode === 0",
          "description": "Contract test T005 passes",
          "met": false,
          "actualValue": 1,
          "reason": "2 test assertions failed"
        }
      ]
    },
    "failureConditions": {
      "total": 4,
      "triggered": 3,
      "details": [
        {
          "condition": "STEP.3.exitCode !== 0",
          "description": "TypeScript compilation fails",
          "triggered": true
        },
        {
          "condition": "STEP.9.statusCode !== 200",
          "description": "HTTP endpoint returned error",
          "triggered": true
        }
      ]
    },
    "overallResult": "FAILED",
    "reason": "4 of 6 success conditions not met"
  },
  
  "completionCriteriaEvaluation": {
    "allStepsMustPass": true,
    "minimumPassRate": 100,
    "actualPassRate": 62.5,
    "requiredEvidence": {
      "required": ["terminal-output", "test-execution-log", "api-responses"],
      "collected": ["terminal-output", "test-execution-log"],
      "missing": ["api-responses"]
    },
    "taskStatusLock": true,
    "completionStatus": "INCOMPLETE",
    "reason": "Success criteria not met, evidence incomplete"
  },
  
  "technicalDebtGenerated": {
    "itemsCreated": 4,
    "debtDataFile": "evidence/T030/technical-debt-data.json",
    "summary": {
      "CRITICAL": 2,
      "HIGH": 1,
      "MEDIUM": 1,
      "LOW": 0
    },
    "routing": {
      "toSprint": 3,
      "toInventory": 1
    }
  },
  
  "authenticity": {
    "executionId": "exec-2025-09-30-1430",
    "generatorVersion": "CODOR Script Execution Engine v2.0",
    "platform": "win32",
    "nodeVersion": "v22.19.0",
    "processId": 12345,
    "signatureAlgorithm": "SHA-256",
    "reportHash": "abc123def456...",
    "tamperDetection": "enabled",
    "agentModificationDetected": false
  }
}
```

---

## Error Classification

### Classification Matrix

| Scenario | Result Type | Exit Code | Tool Behavior | Code Status | Policy Applied | Blocking | Debt Category |
|----------|-------------|-----------|---------------|-------------|----------------|----------|---------------|
| **TDD Red Phase** | TEST_FAILURE | 1 | Ran successfully | Tests fail (expected) | N/A | No | None (expected) |
| **Actual Test Failure** | TEST_FAILURE | 1 | Ran successfully | Tests fail (unexpected) | N/A | Yes | FEATURE / BUG_FIX |
| **TypeScript Errors** | VALIDATION_FAILURE | 0-2 | Ran successfully | Has type errors | BLOCK_ON_ERRORS_ALWAYS | Yes | VALIDATION_MISSING |
| **ESLint Errors** | VALIDATION_FAILURE | 1 | Ran successfully | Has lint errors | BLOCK_ON_ERRORS_ONLY | Yes | REFACTOR |
| **ESLint Warnings** | VALIDATION_FAILURE | 0 | Ran successfully | Has lint warnings | BLOCK_ON_ERRORS_ONLY | No | REFACTOR |
| **ESLint (Strict)** | VALIDATION_FAILURE | 1 | Ran successfully | Errors/Warnings | BLOCK_ON_ERRORS_AND_WARNINGS | Yes | REFACTOR |
| **Prettier Issues** | VALIDATION_FAILURE | 1 | Ran successfully | Format issues | WARN_ONLY | No | REFACTOR |
| **Tool Not Found** | EXECUTION_ERROR | 127 | Failed to run | Unknown | N/A | Yes | INTEGRATION_FAILURE |
| **Invalid Command** | EXECUTION_ERROR | 1 | Ran but crashed | Unknown | N/A | Yes | SPECIFICATION_ERROR |
| **Server Down** | PREREQUISITE_FAILURE | N/A | Couldn't connect | N/A | N/A | Yes | INTEGRATION_FAILURE |
| **Timeout** | TIMEOUT | N/A | Killed | Unknown | N/A | Yes | PERFORMANCE_ISSUE |
| **Missing File** | PREREQUISITE_FAILURE | N/A | Couldn't start | N/A | N/A | Yes | INTEGRATION_FAILURE |
| **Invalid Parameters** | SPECIFICATION_ERROR | N/A | Not executed | N/A | N/A | Yes | None (spec bug) |

---

### Detailed Error Structures

#### 1. TEST_FAILURE (TDD or Actual)

```json
{
  "actionId": "STEP.4",
  "status": "TEST_FAILURE",
  "classification": {
    "category": "TEST_FAILURE",
    "reason": "Test assertions failed",
    "toolSucceeded": true,
    "testsRan": true,
    "isExpectedFailure": false,  // ← Key distinction
    "isTDDRedPhase": false
  },
  "result": {
    "exitCode": 1,
    "testResults": {
      "passed": 3,
      "failed": 2,
      "total": 5,
      "failures": [
        {
          "testName": "should return 200 OK with quotes array",
          "testFile": "__tests__/contracts/quotes-list.test.ts",
          "error": "Expected status 200, received 404",
          "expected": 200,
          "received": 404,
          "stack": "at Object.<anonymous> (__tests__/contracts/quotes-list.test.ts:15:23)",
          "line": 15,
          "column": 23
        }
      ]
    }
  },
  "debtGeneration": {
    "shouldGenerate": true,
    "category": "API_ENDPOINT_MISSING",
    "severity": "CRITICAL",
    "title": "API Endpoint Missing: GET /api/v1/quotes",
    "reason": "Endpoint returns 404 - not implemented"
  }
}
```

#### 2. EXECUTION_ERROR (Tool Failure)

```json
{
  "actionId": "STEP.9",
  "status": "EXECUTION_ERROR",
  "classification": {
    "category": "EXECUTION_ERROR",
    "reason": "HTTP client connection failed",
    "toolFailed": true,
    "errorType": "ECONNREFUSED",
    "recoverableAction": "Verify dev server running"
  },
  "result": {
    "error": {
      "code": "ECONNREFUSED",
      "errno": -4078,
      "syscall": "connect",
      "address": "127.0.0.1",
      "port": 3000,
      "message": "connect ECONNREFUSED 127.0.0.1:3000"
    },
    "diagnostics": {
      "serverHealthCheck": {
        "attempted": true,
        "url": "http://localhost:3000/api/health",
        "result": "CONNECTION_REFUSED"
      },
      "portCheck": {
        "port": 3000,
        "inUse": false,
        "process": null
      }
    }
  },
  "debtGeneration": {
    "shouldGenerate": true,
    "category": "INTEGRATION_FAILURE",
    "severity": "HIGH",
    "title": "Dev Server Not Running or Crashed",
    "suggestedFix": "Verify PREREQ.3 succeeded, check server logs"
  }
}
```

#### 3. VALIDATION_FAILURE (Code Issues)

**Example 3A: TypeScript Errors (Always Blocking)**

```json
{
  "actionId": "STEP.3",
  "status": "VALIDATION_FAILURE",
  "classification": {
    "category": "VALIDATION_FAILURE",
    "reason": "TypeScript type errors detected",
    "toolSucceeded": true,
    "codeHasIssues": true,
    "issueType": "TYPE_ERROR",
    "severity": "CRITICAL",
    "blocksCompilation": true,
    "validationTool": "typescript",
    "policyApplied": {
      "strategy": "BLOCK_ON_ERRORS_ALWAYS",
      "blocking": true,
      "reason": "TypeScript errors always block compilation"
    }
  },
  "result": {
    "exitCode": 2,
    "stderr": "error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.\n  at QuoteService.ts:45:18",
    "diagnostics": [
      {
        "file": "src/services/quotes/QuoteService.ts",
        "line": 45,
        "column": 18,
        "length": 10,
        "code": "TS2345",
        "category": "Error",
        "message": "Argument of type 'string' is not assignable to parameter of type 'number'",
        "relatedInformation": [],
        "source": "const result = calculateTotal(customerId, items);",
        "fix": {
          "suggestion": "Convert customerId to number or change parameter type",
          "automated": false
        }
      }
    ],
    "summary": {
      "errors": 1,
      "warnings": 0,
      "totalFiles": 1
    }
  },
  "debtGeneration": {
    "shouldGenerate": true,
    "category": "VALIDATION_MISSING",
    "severity": "CRITICAL",
    "title": "TypeScript Type Error in QuoteService.ts:45",
    "specificFile": "src/services/quotes/QuoteService.ts",
    "specificLine": 45,
    "suggestedFix": "Fix type mismatch: customerId parameter expects number, receiving string"
  }
}
```

**Example 3B: ESLint Errors (Policy: BLOCK_ON_ERRORS_ONLY)**

```json
{
  "actionId": "STEP.8",
  "status": "VALIDATION_FAILURE",
  "classification": {
    "category": "VALIDATION_FAILURE",
    "reason": "ESLint errors detected",
    "toolSucceeded": true,
    "codeHasIssues": true,
    "issueType": "LINT_ERROR",
    "severity": "HIGH",
    "blocksCompilation": false,
    "validationTool": "eslint",
    "policyApplied": {
      "strategy": "BLOCK_ON_ERRORS_ONLY",
      "blocking": true,
      "reason": "5 ESLint errors found (policy: block on errors only)"
    }
  },
  "result": {
    "exitCode": 1,
    "stdout": "/path/to/QuoteService.ts\n  45:18  error  'customerId' is assigned a value but never used  no-unused-vars\n  67:5   error  'result' is not defined  no-undef\n...",
    "diagnostics": [
      {
        "file": "src/services/quotes/QuoteService.ts",
        "line": 45,
        "column": 18,
        "severity": "error",
        "message": "'customerId' is assigned a value but never used",
        "ruleId": "no-unused-vars",
        "fixable": true
      },
      {
        "file": "src/services/quotes/QuoteService.ts",
        "line": 67,
        "column": 5,
        "severity": "error",
        "message": "'result' is not defined",
        "ruleId": "no-undef",
        "fixable": false
      }
    ],
    "summary": {
      "errors": 5,
      "warnings": 12,
      "fixable": 3,
      "totalFiles": 3
    }
  },
  "debtGeneration": {
    "shouldGenerate": true,
    "category": "REFACTOR",
    "severity": "HIGH",
    "title": "ESLint Errors: 5 errors across 3 files",
    "suggestedFix": "Fix ESLint errors (3 auto-fixable with --fix)"
  }
}
```

**Example 3C: ESLint Warnings (Policy: BLOCK_ON_ERRORS_ONLY, Non-Blocking)**

```json
{
  "actionId": "STEP.8",
  "status": "VALIDATION_FAILURE",
  "classification": {
    "category": "VALIDATION_FAILURE",
    "reason": "ESLint warnings detected (non-blocking)",
    "toolSucceeded": true,
    "codeHasIssues": true,
    "issueType": "LINT_WARNING",
    "severity": "MEDIUM",
    "blocksCompilation": false,
    "validationTool": "eslint",
    "policyApplied": {
      "strategy": "BLOCK_ON_ERRORS_ONLY",
      "blocking": false,
      "reason": "0 errors, 8 warnings (policy allows warnings)"
    }
  },
  "result": {
    "exitCode": 0,
    "stdout": "/path/to/QuoteService.ts\n  12:5  warning  Missing JSDoc comment  jsdoc/require-jsdoc\n  28:3  warning  Unexpected console statement  no-console\n...",
    "diagnostics": [
      {
        "file": "src/services/quotes/QuoteService.ts",
        "line": 12,
        "column": 5,
        "severity": "warning",
        "message": "Missing JSDoc comment",
        "ruleId": "jsdoc/require-jsdoc",
        "fixable": false
      }
    ],
    "summary": {
      "errors": 0,
      "warnings": 8,
      "fixable": 2,
      "totalFiles": 2
    }
  },
  "debtGeneration": {
    "shouldGenerate": true,
    "category": "REFACTOR",
    "severity": "MEDIUM",
    "title": "ESLint Warnings: 8 warnings across 2 files (non-blocking)",
    "suggestedFix": "Address ESLint warnings when convenient"
  }
}
```

#### 4. PREREQUISITE_FAILURE

```json
{
  "actionId": "PREREQ.3",
  "status": "PREREQUISITE_FAILURE",
  "classification": {
    "category": "PREREQUISITE_FAILURE",
    "reason": "Dev server failed to start within timeout",
    "prerequisiteType": "SERVICE_HEALTHY",
    "canContinue": false
  },
  "result": {
    "timeout": 30000,
    "actualDuration": 30050,
    "serverOutput": "Error: Port 3000 already in use\n  at Server.listen (node:net:1234:12)",
    "healthCheck": {
      "attempted": true,
      "url": "http://localhost:3000/api/health",
      "result": "TIMEOUT",
      "duration": 30000
    },
    "diagnostics": {
      "portCheck": {
        "port": 3000,
        "inUse": true,
        "process": {
          "pid": 9876,
          "name": "node.exe",
          "command": "npm run dev"
        }
      }
    }
  },
  "impact": {
    "subsequentStepsSkipped": 12,
    "testExecutionAborted": true,
    "reason": "Cannot proceed without running dev server"
  },
  "debtGeneration": {
    "shouldGenerate": true,
    "category": "INTEGRATION_FAILURE",
    "severity": "CRITICAL",
    "title": "Dev Server Prerequisite Failed: Port Already in Use",
    "suggestedFix": "Kill existing process on port 3000 or configure different port"
  }
}
```

#### 5. TIMEOUT

```json
{
  "actionId": "STEP.10",
  "status": "TIMEOUT",
  "classification": {
    "category": "TIMEOUT",
    "reason": "Action exceeded configured timeout",
    "timeoutValue": 10000,
    "actualDuration": 10050
  },
  "result": {
    "killed": true,
    "signal": "SIGTERM",
    "partialOutput": "Starting long-running operation...\nProcessing 1000 items...\nProgress: 45%...",
    "lastUpdate": "2025-09-30T14:35:08.000Z"
  },
  "debtGeneration": {
    "shouldGenerate": true,
    "category": "PERFORMANCE_ISSUE",
    "severity": "MEDIUM",
    "title": "Operation Timeout: Exceeded 10s limit",
    "suggestedFix": "Optimize operation or increase timeout value"
  }
}
```

#### 6. SPECIFICATION_ERROR

```json
{
  "actionId": "STEP.12",
  "status": "SPECIFICATION_ERROR",
  "classification": {
    "category": "SPECIFICATION_ERROR",
    "reason": "Invalid action parameters in test specification",
    "validationErrors": [
      "Missing required parameter: 'filePath'",
      "Invalid validationType: 'CONTENT_REGEX' (must be one of: EXISTS, CONTENT_MATCH, SCHEMA_VALID, HASH_MATCH, SIZE_CHECK)"
    ]
  },
  "result": {
    "executed": false,
    "schemaValidation": {
      "valid": false,
      "errors": [
        {
          "instancePath": "/parameters/validationType",
          "schemaPath": "#/definitions/FileValidationParameters/properties/validationType/enum",
          "keyword": "enum",
          "params": {"allowedValues": ["EXISTS", "CONTENT_MATCH", "SCHEMA_VALID", "HASH_MATCH", "SIZE_CHECK"]},
          "message": "must be equal to one of the allowed values"
        }
      ]
    }
  },
  "impact": {
    "actionSkipped": true,
    "reason": "Cannot execute invalid specification"
  },
  "debtGeneration": {
    "shouldGenerate": false,
    "reason": "This is a specification bug, not a code issue"
  },
  "agentAction": {
    "required": true,
    "action": "FIX_SPECIFICATION",
    "message": "Test specification has errors. Fix and regenerate."
  }
}
```

---

## Evidence Collection

### Evidence Files Per Action

Each action generates specific evidence files:

```
evidence/
  T030/
    execution-report.json              ← Master report
    technical-debt-data.json           ← Generated debt items
    
    PREREQ.1-file-validation.json      ← File check results
    PREREQ.2-terminal-output.log       ← npm install output
    PREREQ.3-server-startup.log        ← Dev server logs
    
    STEP.1-file-validation.json        ← File exists check
    STEP.2-content-match.json          ← Export validation
    STEP.3-typescript-compilation.log  ← tsc output
    STEP.3-typescript-diagnostics.json ← Parsed TS errors
    STEP.4-contract-test-T005.log      ← Jest output
    STEP.4-test-results.json           ← Parsed test results
    STEP.9-http-error.json             ← Connection error
    STEP.11-eslint-report.json         ← ESLint results
    
    CLEANUP.1-server-shutdown.log      ← Cleanup logs
```

### Evidence File Standards

#### Terminal Output Evidence

```json
{
  "actionId": "STEP.3",
  "type": "TERMINAL_COMMAND",
  "command": "npx tsc --noEmit --project tsconfig.json",
  "workingDirectory": "D:\\...\\packages\\web",
  "execution": {
    "startTime": "2025-09-30T14:32:00.000Z",
    "endTime": "2025-09-30T14:32:03.200Z",
    "duration": 3200,
    "exitCode": 2,
    "signal": null,
    "killed": false
  },
  "output": {
    "stdout": "",
    "stderr": "src/services/quotes/QuoteService.ts:45:18 - error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.\n\n45     const result = calculateTotal(customerId, items);\n                    ~~~~~~~~~~~~~~~~~~\n\nFound 1 error.\n",
    "combined": "src/services/quotes/QuoteService.ts:45:18 - error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.\n\n45     const result = calculateTotal(customerId, items);\n                    ~~~~~~~~~~~~~~~~~~\n\nFound 1 error.\n"
  },
  "environment": {
    "NODE_ENV": "test",
    "PATH": "...",
    "PWD": "D:\\...\\packages\\web"
  },
  "authenticity": {
    "capturedBy": "CODOR Script Execution Engine",
    "timestamp": "2025-09-30T14:32:03.200Z",
    "outputHash": "abc123..."
  }
}
```

#### Test Results Evidence

```json
{
  "actionId": "STEP.4",
  "type": "TERMINAL_COMMAND",
  "testFramework": "jest",
  "testFile": "__tests__/contracts/quotes-list.test.ts",
  "execution": {
    "startTime": "2025-09-30T14:33:00.000Z",
    "endTime": "2025-09-30T14:33:02.100Z",
    "duration": 2100,
    "exitCode": 1
  },
  "results": {
    "numTotalTests": 5,
    "numPassedTests": 3,
    "numFailedTests": 2,
    "numPendingTests": 0,
    "numTodoTests": 0,
    "testResults": [
      {
        "ancestorTitles": ["GET /api/v1/quotes"],
        "fullName": "GET /api/v1/quotes should return 200 OK with quotes array",
        "status": "failed",
        "title": "should return 200 OK with quotes array",
        "duration": 234,
        "failureMessages": [
          "Expected status 200, received 404"
        ],
        "location": {
          "file": "__tests__/contracts/quotes-list.test.ts",
          "line": 15,
          "column": 23
        }
      },
      {
        "ancestorTitles": ["GET /api/v1/quotes"],
        "fullName": "GET /api/v1/quotes should return array in response body",
        "status": "passed",
        "title": "should return array in response body",
        "duration": 123
      }
    ]
  },
  "coverage": null,
  "authenticity": {
    "capturedBy": "CODOR Script Execution Engine",
    "jestVersion": "30.1.3",
    "outputHash": "def456..."
  }
}
```

#### HTTP Request Evidence

```json
{
  "actionId": "STEP.9",
  "type": "HTTP_REQUEST",
  "request": {
    "url": "http://localhost:3000/api/v1/quotes",
    "method": "GET",
    "headers": {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    "body": null,
    "timestamp": "2025-09-30T14:34:00.000Z"
  },
  "response": {
    "success": false,
    "error": {
      "code": "ECONNREFUSED",
      "errno": -4078,
      "syscall": "connect",
      "address": "127.0.0.1",
      "port": 3000,
      "message": "connect ECONNREFUSED 127.0.0.1:3000"
    },
    "duration": 100
  },
  "diagnostics": {
    "serverHealthCheck": {
      "url": "http://localhost:3000/api/health",
      "result": "CONNECTION_REFUSED"
    },
    "portInUse": false,
    "dnsResolution": "127.0.0.1"
  },
  "authenticity": {
    "capturedBy": "CODOR Script Execution Engine",
    "timestamp": "2025-09-30T14:34:00.100Z"
  }
}
```

---

## Technical Debt Generation

### Debt Generation Rules

```javascript
class TechnicalDebtGenerator {
  shouldGenerateDebt(executionResult) {
    const { status, classification } = executionResult;
    
    // Debt generation decision tree
    switch (status) {
      case 'SUCCESS':
        return false; // No debt for success
        
      case 'TEST_FAILURE':
        // Only if unexpected (not TDD red phase)
        return !classification.isExpectedFailure && !classification.isTDDRedPhase;
        
      case 'VALIDATION_FAILURE':
        // Always generate debt for code issues
        return true;
        
      case 'EXECUTION_ERROR':
        // Always generate debt for tool failures
        return true;
        
      case 'PREREQUISITE_FAILURE':
        // Always generate debt for env issues
        return true;
        
      case 'TIMEOUT':
        // Always generate debt for performance issues
        return true;
        
      case 'SPECIFICATION_ERROR':
        // Never generate debt - this is a spec bug
        return false;
        
      default:
        return false;
    }
  }
  
  categorizeDebt(executionResult) {
    const { status, classification, result } = executionResult;
    
    // Map execution results to debt categories
    const categoryMap = {
      'TEST_FAILURE': {
        '404': 'API_ENDPOINT_MISSING',
        '500': 'BUSINESS_LOGIC_ERROR',
        'default': 'VALIDATION_MISSING'
      },
      'VALIDATION_FAILURE': {
        'TypeScript': 'VALIDATION_MISSING',
        'ESLint': 'ERROR_HANDLING_MISSING',
        'default': 'VALIDATION_MISSING'
      },
      'EXECUTION_ERROR': {
        'ECONNREFUSED': 'INTEGRATION_FAILURE',
        'ENOENT': 'INTEGRATION_FAILURE',
        'default': 'INTEGRATION_FAILURE'
      },
      'TIMEOUT': 'PERFORMANCE_ISSUE',
      'PREREQUISITE_FAILURE': 'INTEGRATION_FAILURE'
    };
    
    // Determine specific category
    if (status === 'TEST_FAILURE') {
      const statusCode = this.extractStatusCode(result);
      return categoryMap.TEST_FAILURE[statusCode] || categoryMap.TEST_FAILURE.default;
    }
    
    if (status === 'VALIDATION_FAILURE') {
      const toolType = this.identifyTool(result);
      return categoryMap.VALIDATION_FAILURE[toolType] || categoryMap.VALIDATION_FAILURE.default;
    }
    
    return categoryMap[status] || 'INTEGRATION_FAILURE';
  }
}
```

### Debt Item Structure

See Amendment 2 in `SCRIPT-BASED-TESTING-FRAMEWORK-AMENDMENTS.md` for complete debt structure.

Key additions for error handling:

```json
{
  "debtId": "DEBT-T030-001",
  "errorDetails": {
    "executionResult": "TEST_FAILURE",
    "originalError": {
      "type": "AssertionError",
      "message": "Expected status 200, received 404",
      "expected": 200,
      "received": 404,
      "file": "__tests__/contracts/quotes-list.test.ts",
      "line": 15
    },
    "contextualInformation": {
      "prerequisitesMet": true,
      "serverRunning": true,
      "previousStepsSucceeded": ["STEP.1", "STEP.2"],
      "relatedFailures": ["STEP.5", "STEP.6", "STEP.7"]
    },
    "diagnostics": {
      "httpTrace": {
        "request": "GET http://localhost:3000/api/v1/quotes",
        "responseStatus": 404,
        "responseBody": "Cannot GET /api/v1/quotes"
      },
      "filesChecked": [
        "packages/web/src/app/api/v1/quotes/route.ts: NOT_FOUND"
      ]
    }
  }
}
```

---

## Agent Integration Points

### What Agents Receive

Agents receive **ONLY** the master execution report (`execution-report.json`). They do NOT receive:
- Raw terminal logs
- Individual evidence files
- Unstructured output

### Agent Response Protocol

```javascript
// Agent reads execution report
const report = JSON.parse(fs.readFileSync('evidence/T030/execution-report.json'));

// Agent decision tree
if (report.executionSummary.overallStatus === 'SUCCESS') {
  // Mark task complete (request status update)
  console.log('✅ T030 complete: All tests passed');
  return { action: 'REQUEST_STATUS_UPDATE', taskId: 'T030', status: 'COMPLETE' };
}

if (report.executionSummary.overallStatus === 'SPECIFICATION_ERROR') {
  // Fix test specification and regenerate
  console.log('⚠️ Test specification has errors');
  return { action: 'FIX_SPECIFICATION', errors: report.stepExecution.results.filter(r => r.status === 'SPECIFICATION_ERROR') };
}

// Read technical debt items
const debtData = JSON.parse(fs.readFileSync('evidence/T030/technical-debt-data.json'));

// Implement fixes for each debt item
for (const debtItem of debtData.debtItems) {
  console.log(`🔧 Implementing fix for: ${debtItem.title}`);
  
  // Agent uses implementationGuidance from debt item
  const guidance = debtItem.implementationGuidance;
  
  // Implement fix based on steps provided
  await implementFix(guidance);
}

// Request retest
return { action: 'REQUEST_RETEST', taskId: 'T030' };
```

### Agent Restrictions

❌ **Agents CANNOT**:
- Mark tasks complete without passing tests
- Modify execution-report.json
- Interpret raw logs directly
- Override error classifications
- Skip technical debt generation

✅ **Agents CAN**:
- Read execution-report.json
- Read technical-debt-data.json
- Implement fixes based on guidance
- Request retests
- Fix test specifications if SPECIFICATION_ERROR

---

## Summary

### Output Guarantees

1. ✅ **Complete**: All execution scenarios have structured output
2. ✅ **Classified**: Every result has a clear category and reason
3. ✅ **Actionable**: Errors include specific fixes and context
4. ✅ **Traceable**: Full evidence trail with authenticity markers
5. ✅ **Agent-Ready**: Structured JSON for agent consumption
6. ✅ **Debt-Enabled**: Automatic technical debt generation
7. ✅ **Debuggable**: Sufficient detail for root cause analysis

### Error Handling Coverage

| Scenario | Detection | Classification | Evidence | Debt Generation | Agent Action |
|----------|-----------|----------------|----------|-----------------|--------------|
| TDD Red Phase | ✅ | TEST_FAILURE (expected) | ✅ | ❌ | Continue |
| Test Failure | ✅ | TEST_FAILURE | ✅ | ✅ | Implement fix |
| Type Error | ✅ | VALIDATION_FAILURE | ✅ | ✅ | Fix types |
| Lint Error | ✅ | VALIDATION_FAILURE | ✅ | ✅ | Fix code |
| Tool Not Found | ✅ | EXECUTION_ERROR | ✅ | ✅ | Install tool |
| Server Down | ✅ | PREREQUISITE_FAILURE | ✅ | ✅ | Start server |
| Timeout | ✅ | TIMEOUT | ✅ | ✅ | Optimize/increase |
| Spec Error | ✅ | SPECIFICATION_ERROR | ✅ | ❌ | Fix spec |

---

**END OF SPECIFICATION**
