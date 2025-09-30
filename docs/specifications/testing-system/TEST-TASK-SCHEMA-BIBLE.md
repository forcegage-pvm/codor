# CODOR Test Task Specification Schema - Bible

**Version**: 2.0.0  
**Status**: Authoritative - All Test Tasks MUST Conform  
**Last Updated**: September 30, 2025

---

## Purpose

This schema is the **authoritative bible** for all agent-generated test task specifications. It enforces:
- ✅ **Executability**: Every test task can be executed by script-execution-engine without agent involvement
- ✅ **Compliance**: All specifications conform to Script-Based Testing Framework requirements
- ✅ **Completeness**: All required information for test execution and evidence collection is present
- ✅ **Consistency**: Uniform structure across all test specifications

**CRITICAL**: Agents generating test tasks MUST produce JSON that validates against this schema. Non-compliant specifications will be REJECTED by the execution engine.

---

## Schema Location

**File**: `docs/specifications/testing-system/test-task-specification.schema.json`

**Schema ID**: `https://codor.dev/schemas/test-task-specification.v2.0.json`

**JSON Schema Version**: Draft-07

---

## Quick Reference

### Required Top-Level Properties

```json
{
  "schemaVersion": "2.0.0",                    // MUST be 2.0.0
  "metadata": { /* project info */ },          // REQUIRED
  "globalConfiguration": { /* workspace */ },  // REQUIRED
  "executionEngine": { /* action types */ },   // REQUIRED
  "tasks": { /* test tasks */ }                // REQUIRED (min 1 task)
}
```

### Supported Action Types

| Action Type | Purpose | Parameters |
|-------------|---------|------------|
| **TERMINAL_COMMAND** | Run shell commands | command, workingDirectory, environment |
| **MCP_BROWSER_COMMAND** | Browser automation | action, url, selector, script |
| **HTTP_REQUEST** | API testing | url, method, headers, body |
| **DOCKER_COMMAND** | Container testing | dockerCommand, containerOrImage, volumes |
| **DATABASE_QUERY** | Database validation | connectionString, query, expectedRowCount |
| **CUSTOM_SCRIPT** | Custom executables | scriptPath, interpreter, arguments |
| **FILE_VALIDATION** | File system checks | filePath, validationType, expectedContent |

---

## Schema Structure

### 1. Metadata (REQUIRED)

Provides context about the test specification:

```json
{
  "metadata": {
    "projectName": "codor-quotes-api",           // REQUIRED
    "sprintId": "SPRINT_006",                    // REQUIRED (pattern: ^[A-Z0-9_-]+$)
    "generatedAt": "2025-09-30T10:30:00.000Z",  // REQUIRED (ISO 8601)
    "generatedBy": "GitHub Copilot Agent v5.0",  // REQUIRED
    "description": "Contract tests for quotes API endpoints"  // Optional
  }
}
```

**Validation Rules**:
- `projectName`: Free-form string
- `sprintId`: Must match pattern `^[A-Z0-9_-]+$` (uppercase, numbers, underscore, hyphen)
- `generatedAt`: Must be valid ISO 8601 timestamp
- `generatedBy`: String identifying the agent/system

---

### 2. Global Configuration (REQUIRED)

Defines workspace-level settings:

```json
{
  "globalConfiguration": {
    "workspaceRoot": "D:/Projects/codor",           // REQUIRED (absolute path)
    "evidenceDirectory": "evidence",                 // REQUIRED (relative to workspace)
    
    "devServer": {                                   // Optional
      "command": "npm run dev",
      "workingDirectory": "D:/Projects/codor/packages/web",
      "healthCheckUrl": "http://localhost:3000/api/health",
      "startupTimeout": 30000,                       // milliseconds
      "port": 3000
    },
    
    "environment": {                                 // Optional
      "NODE_ENV": "test",
      "DATABASE_URL": "postgresql://localhost:5432/test"
    },
    
    "timeout": 300000                                // Optional (default: 300000ms = 5 min)
  }
}
```

**Validation Rules**:
- `workspaceRoot`: Must be absolute path
- `evidenceDirectory`: Relative path where evidence will be stored
- `devServer.port`: Must be 1024-65535
- `devServer.startupTimeout`: Milliseconds to wait for server startup
- `timeout`: Global timeout for entire suite execution

---

### 3. Execution Engine (REQUIRED)

Declares available action types and their configurations:

```json
{
  "executionEngine": {
    "availableActionTypes": [                    // REQUIRED (min 1 item)
      "TERMINAL_COMMAND",
      "MCP_BROWSER_COMMAND",
      "HTTP_REQUEST"
    ],
    
    "executorConfigurations": {                  // Optional
      "TERMINAL_COMMAND": {
        "defaultShell": "powershell",
        "defaultTimeout": 30000
      },
      "MCP_BROWSER_COMMAND": {
        "mcpServerCommand": "npx -y @modelcontextprotocol/server-brave-search",
        "browserType": "chromium",
        "headless": true
      },
      "HTTP_REQUEST": {
        "defaultTimeout": 10000,
        "followRedirects": true,
        "validateSSL": true
      }
    }
  }
}
```

**Validation Rules**:
- `availableActionTypes`: Must contain at least 1 valid action type
- Each action type used in tasks MUST be declared here
- Executor configurations are optional but recommended

---

### 4. Tasks (REQUIRED)

Test tasks indexed by task ID:

```json
{
  "tasks": {
    "T001": { /* TestTask object */ },
    "T002": { /* TestTask object */ },
    "T042": { /* TestTask object */ }
  }
}
```

**Validation Rules**:
- Property names MUST match pattern `^T[0-9]{3,}$` (e.g., T001, T042, T1234)
- Must contain at least 1 task
- No additional properties allowed (strict validation)

---

## TestTask Object (The Heart of the Schema)

### Required Properties

```json
{
  "taskId": "T001",                              // REQUIRED (pattern: ^T[0-9]{3,}$)
  "title": "Validate POST /api/quotes endpoint", // REQUIRED (10-200 chars)
  "description": "Contract tests...",            // REQUIRED (min 50 chars)
  "testExecution": { /* steps */ },              // REQUIRED
  "validationCriteria": { /* conditions */ },    // REQUIRED
  "completionCriteria": { /* requirements */ }   // REQUIRED
}
```

### Optional Properties

```json
{
  "priority": "CRITICAL",                        // Optional (CRITICAL|HIGH|MEDIUM|LOW)
  "dependencies": ["T001", "T002"],              // Optional (task IDs)
  "mcpValidation": { /* browser steps */ },      // Optional
  "technicalDebtExpectations": { /* failures */ }, // Optional
  "executionWorkflow": { /* prerequisites */ }   // Optional
}
```

---

## TestExecution Object

Defines the actual test steps to execute:

```json
{
  "testExecution": {
    "prerequisites": [                           // Optional (run before tests)
      {
        "actionId": "T001.0",
        "type": "TERMINAL_COMMAND",
        "description": "Install dependencies",
        "parameters": {
          "command": "npm install",
          "workingDirectory": "D:/Projects/codor/packages/web"
        }
      }
    ],
    
    "steps": [                                   // REQUIRED (min 1 step)
      {
        "actionId": "T001.1",
        "type": "TERMINAL_COMMAND",
        "description": "Run contract tests for POST /api/quotes",
        "parameters": {
          "command": "npm test -- __tests__/contracts/quotes-post.test.ts",
          "workingDirectory": "D:/Projects/codor/packages/web",
          "environment": { "NODE_ENV": "test" },
          "expectedExitCodes": [0]
        },
        "evidenceCapture": {
          "stdout": true,
          "stderr": true,
          "exitCode": true,
          "duration": true
        },
        "timeout": 60000,
        "retryAttempts": 0,
        "continueOnFailure": false
      },
      {
        "actionId": "T001.2",
        "type": "HTTP_REQUEST",
        "description": "Verify endpoint returns 201 Created",
        "parameters": {
          "url": "http://localhost:3000/api/v1/quotes",
          "method": "POST",
          "headers": {
            "Content-Type": "application/json"
          },
          "body": {
            "customerId": "CUST001",
            "items": [
              { "productId": "PROD001", "quantity": 2, "price": 100 }
            ]
          },
          "expectedStatus": 201
        },
        "evidenceCapture": {
          "requestResponse": true,
          "duration": true
        },
        "timeout": 5000
      }
    ],
    
    "cleanup": [                                 // Optional (run after tests)
      {
        "actionId": "T001.99",
        "type": "DATABASE_QUERY",
        "description": "Clean up test data",
        "parameters": {
          "connectionString": "${DATABASE_URL}",
          "query": "DELETE FROM quotes WHERE customerId = 'CUST001'",
          "queryType": "DELETE"
        }
      }
    ]
  }
}
```

**Validation Rules**:
- `steps`: Must contain at least 1 action
- Each action MUST have unique `actionId`
- `actionId` pattern: `^[A-Z][A-Z0-9_]*\.[0-9]+$` (e.g., T001.1, T042.3)
- `type` must be one of the declared `availableActionTypes`
- `parameters` validated based on action type (see Parameter Schemas below)

---

## Action Parameter Schemas

### TERMINAL_COMMAND Parameters

```json
{
  "type": "TERMINAL_COMMAND",
  "parameters": {
    "command": "npm test -- path/to/test.ts",    // REQUIRED
    "workingDirectory": "/absolute/path",        // REQUIRED
    "environment": {                             // Optional
      "NODE_ENV": "test"
    },
    "expectedExitCodes": [0],                    // Optional (default: [0])
    "shell": "powershell"                        // Optional (powershell|bash|cmd|sh)
  }
}
```

### MCP_BROWSER_COMMAND Parameters

```json
{
  "type": "MCP_BROWSER_COMMAND",
  "parameters": {
    "action": "browser_navigate",                // REQUIRED (browser_navigate|browser_click|etc.)
    "url": "http://localhost:3000",             // Required for navigate
    "selector": ".submit-button",                // Required for click/fill
    "script": "return document.title",           // Required for evaluate
    "formData": {                                // Required for fill_form
      "username": "test@example.com",
      "password": "test123"
    },
    "waitTimeout": 5000                          // Optional (default: 5000ms)
  }
}
```

**Available MCP Actions**:
- `browser_navigate`: Navigate to URL
- `browser_click`: Click element
- `browser_fill_form`: Fill form fields
- `browser_evaluate`: Execute JavaScript
- `browser_screenshot`: Capture screenshot
- `browser_wait_for_selector`: Wait for element
- `browser_get_content`: Get page content

### HTTP_REQUEST Parameters

```json
{
  "type": "HTTP_REQUEST",
  "parameters": {
    "url": "http://localhost:3000/api/endpoint", // REQUIRED
    "method": "POST",                            // REQUIRED (GET|POST|PUT|PATCH|DELETE|etc.)
    "headers": {                                 // Optional
      "Content-Type": "application/json",
      "Authorization": "Bearer ${TOKEN}"
    },
    "body": {                                    // Optional (object or string)
      "key": "value"
    },
    "expectedStatus": 200,                       // Optional
    "validateResponse": {                        // Optional
      "jsonSchema": { /* JSON schema */ },
      "containsText": "success",
      "matchesRegex": "^\\{.*\\}$"
    }
  }
}
```

### DOCKER_COMMAND Parameters

```json
{
  "type": "DOCKER_COMMAND",
  "parameters": {
    "dockerCommand": "run",                      // REQUIRED (run|exec|build|compose|ps|logs|inspect)
    "containerOrImage": "postgres:14",           // Required for most commands
    "volumes": [                                 // Optional
      "/host/data:/var/lib/postgresql/data"
    ],
    "ports": [                                   // Optional
      "5432:5432"
    ],
    "environment": {                             // Optional
      "POSTGRES_PASSWORD": "test123"
    },
    "command": "pg_isready",                     // Optional (command inside container)
    "detached": false                            // Optional (default: false)
  }
}
```

### DATABASE_QUERY Parameters

```json
{
  "type": "DATABASE_QUERY",
  "parameters": {
    "connectionString": "${DATABASE_URL}",       // REQUIRED
    "query": "SELECT * FROM users WHERE id = 1", // REQUIRED
    "queryType": "SELECT",                       // Optional (SELECT|INSERT|UPDATE|DELETE|DDL|PROCEDURE)
    "expectedRowCount": 1,                       // Optional
    "validateResults": {                         // Optional
      "rowSchema": { /* JSON schema */ },
      "containsValues": {
        "username": "test@example.com"
      }
    }
  }
}
```

### CUSTOM_SCRIPT Parameters

```json
{
  "type": "CUSTOM_SCRIPT",
  "parameters": {
    "scriptPath": "/absolute/path/to/script.py", // REQUIRED
    "interpreter": "python3",                    // REQUIRED (node|python|python3|bash|sh|powershell|ruby|perl)
    "arguments": [                               // Optional
      "--verbose",
      "--output=results.json"
    ],
    "environment": {                             // Optional
      "PYTHONPATH": "/custom/path"
    }
  }
}
```

### FILE_VALIDATION Parameters

```json
{
  "type": "FILE_VALIDATION",
  "parameters": {
    "filePath": "/absolute/path/to/file.json",   // REQUIRED
    "validationType": "SCHEMA_VALID",            // REQUIRED (EXISTS|CONTENT_MATCH|SCHEMA_VALID|HASH_MATCH|SIZE_CHECK)
    "expectedContent": "expected text",          // Required for CONTENT_MATCH
    "contentRegex": "^.*success.*$",             // Optional
    "schema": { /* JSON schema */ },             // Required for SCHEMA_VALID
    "expectedHash": "abc123...",                 // Required for HASH_MATCH
    "minSize": 1024,                             // Optional (bytes)
    "maxSize": 102400                            // Optional (bytes)
  }
}
```

---

## ValidationCriteria Object

Defines success/failure conditions:

```json
{
  "validationCriteria": {
    "successConditions": [                       // REQUIRED (min 1)
      {
        "condition": "exitCode === 0",
        "description": "Tests exit with success code"
      },
      {
        "condition": "stdout.includes('All tests passed')",
        "description": "Success message appears in output"
      },
      {
        "condition": "responseStatus === 201",
        "description": "API returns 201 Created"
      }
    ],
    
    "failureConditions": [                       // Optional
      {
        "condition": "stderr.includes('ERROR')",
        "description": "Errors appear in stderr"
      }
    ],
    
    "expectedOutput": {                          // Optional
      "stdoutContains": [
        "Test Suites: 1 passed",
        "Tests: 15 passed"
      ],
      "stderrEmpty": true,
      "exitCode": 0
    }
  }
}
```

**Validation Rules**:
- Must have at least 1 success condition
- Conditions are evaluated by result analysis engine
- Use JavaScript-like expressions

---

## CompletionCriteria Object

Defines task completion requirements:

```json
{
  "completionCriteria": {
    "allStepsMustPass": true,                    // REQUIRED
    "minimumPassRate": 90,                       // Optional (if allStepsMustPass=false)
    "requiredEvidence": [                        // Optional
      "test-execution-log",
      "terminal-output",
      "api-responses"
    ],
    "taskStatusLock": true                       // Optional (default: true)
  }
}
```

**Evidence Types**:
- `test-execution-log`: Main execution log
- `terminal-output`: Command stdout/stderr
- `screenshots`: Browser screenshots
- `api-responses`: HTTP response bodies
- `error-logs`: Error stack traces
- `performance-metrics`: Duration/timing data

**Task Status Lock**:
- When `true` (default): Script controls task status, agent cannot modify
- When `false`: Task status can be influenced by agent (NOT RECOMMENDED)

---

## TechnicalDebtExpectations Object

Documents expected failure scenarios:

```json
{
  "technicalDebtExpectations": {
    "likelyFailures": [
      {
        "scenario": "POST /api/quotes endpoint returns 404",
        "expectedDebtCategory": "API_ENDPOINT_MISSING",
        "expectedSeverity": "CRITICAL",
        "suggestedFix": "Implement POST /api/v1/quotes route handler with proper validation"
      },
      {
        "scenario": "Request validation fails with 400",
        "expectedDebtCategory": "VALIDATION_MISSING",
        "expectedSeverity": "HIGH",
        "suggestedFix": "Add Zod schema validation for quote creation request body"
      }
    ]
  }
}
```

**Debt Categories**:
- `API_ENDPOINT_MISSING`: Endpoint doesn't exist
- `VALIDATION_MISSING`: Input validation not implemented
- `ERROR_HANDLING_MISSING`: Error handling inadequate
- `BUSINESS_LOGIC_ERROR`: Business logic incorrect
- `DATABASE_SCHEMA_ISSUE`: Database schema problem
- `INTEGRATION_FAILURE`: External service integration failing
- `PERFORMANCE_ISSUE`: Performance below acceptable
- `SECURITY_VULNERABILITY`: Security issue detected

---

## Technical Debt Configuration

Top-level configuration for debt generation:

```json
{
  "technicalDebtConfiguration": {
    "enabled": true,                             // REQUIRED
    "routingStrategy": "CAPACITY_BASED",         // REQUIRED (CAPACITY_BASED|SEVERITY_BASED|MANUAL)
    
    "capacityThresholds": {                      // For CAPACITY_BASED strategy
      "sprintTasksMaxItems": 6,                  // Max tasks in sprint
      "sprintTasksMaxCritical": 4                // Max CRITICAL tasks in sprint
    },
    
    "severityLevels": [                          // Optional (default shown)
      "CRITICAL",
      "HIGH",
      "MEDIUM",
      "LOW"
    ]
  }
}
```

**Routing Strategies**:
- `CAPACITY_BASED`: Route to sprint if capacity available, else inventory
- `SEVERITY_BASED`: Route based on severity (CRITICAL→sprint, LOW→inventory)
- `MANUAL`: Manual routing decision required

---

## Complete Example

See `prototype/enhanced-test.json` for a complete working example:

```json
{
  "schemaVersion": "2.0.0",
  "metadata": {
    "projectName": "codor-quotes-api",
    "sprintId": "SPRINT_006",
    "generatedAt": "2025-09-30T10:30:00.000Z",
    "generatedBy": "GitHub Copilot Agent v5.0",
    "description": "Contract tests for quotes API endpoints"
  },
  "globalConfiguration": {
    "workspaceRoot": "D:/Projects/codor",
    "evidenceDirectory": "evidence",
    "devServer": {
      "command": "npm run dev",
      "workingDirectory": "D:/Projects/codor/packages/web",
      "healthCheckUrl": "http://localhost:3000/api/health",
      "startupTimeout": 30000,
      "port": 3000
    },
    "environment": {
      "NODE_ENV": "test"
    }
  },
  "executionEngine": {
    "availableActionTypes": [
      "TERMINAL_COMMAND",
      "HTTP_REQUEST",
      "MCP_BROWSER_COMMAND"
    ]
  },
  "tasks": {
    "T001": {
      "taskId": "T001",
      "title": "Validate POST /api/quotes endpoint returns 201 Created",
      "description": "Contract test validating that POST /api/quotes endpoint accepts valid quote creation requests and returns 201 with proper JSON structure",
      "priority": "CRITICAL",
      "testExecution": {
        "steps": [
          {
            "actionId": "T001.1",
            "type": "TERMINAL_COMMAND",
            "description": "Run Jest contract tests",
            "parameters": {
              "command": "npm test -- __tests__/contracts/quotes-post.test.ts",
              "workingDirectory": "D:/Projects/codor/packages/web",
              "environment": { "NODE_ENV": "test" },
              "expectedExitCodes": [0]
            },
            "evidenceCapture": {
              "stdout": true,
              "stderr": true,
              "exitCode": true,
              "duration": true
            },
            "timeout": 60000
          }
        ]
      },
      "validationCriteria": {
        "successConditions": [
          {
            "condition": "exitCode === 0",
            "description": "Tests pass successfully"
          }
        ]
      },
      "completionCriteria": {
        "allStepsMustPass": true,
        "requiredEvidence": ["test-execution-log", "terminal-output"],
        "taskStatusLock": true
      }
    }
  },
  "technicalDebtConfiguration": {
    "enabled": true,
    "routingStrategy": "CAPACITY_BASED",
    "capacityThresholds": {
      "sprintTasksMaxItems": 6,
      "sprintTasksMaxCritical": 4
    }
  }
}
```

---

## Agent Compliance Requirements

### When Generating Test Specifications

**YOU MUST**:
1. ✅ Generate JSON that validates against this schema
2. ✅ Use absolute paths for all file references
3. ✅ Declare all action types in `executionEngine.availableActionTypes`
4. ✅ Provide complete `parameters` for each action type
5. ✅ Include at least 1 success condition in `validationCriteria`
6. ✅ Set `completionCriteria.taskStatusLock = true` (script controls status)
7. ✅ Provide meaningful descriptions (min 50 chars for task description)

**YOU MUST NOT**:
1. ❌ Use relative paths without context
2. ❌ Omit required properties
3. ❌ Use action types not declared in `availableActionTypes`
4. ❌ Leave parameters incomplete or ambiguous
5. ❌ Generate specifications that require manual intervention
6. ❌ Assume agent will execute tests (script executes, agent generates specs only)

### Validation Process

1. **Schema Validation**: JSON MUST validate against `test-task-specification.schema.json`
2. **Completeness Check**: All required properties MUST be present
3. **Executability Check**: All commands/paths MUST be absolute and executable
4. **Evidence Check**: All evidence capture requirements MUST be specified

**Non-compliant specifications will be REJECTED** before execution begins.

---

## Schema Evolution

**Current Version**: 2.0.0

**Version History**:
- 2.0.0 (2025-09-30): Initial authoritative schema with 7 action types
- Future versions will maintain backward compatibility where possible

**Breaking Changes**:
- Schema version updates indicate breaking changes
- Agents MUST generate specifications matching the `schemaVersion` field

---

## Validation Tools

### JSON Schema Validator

```javascript
const Ajv = require('ajv');
const schema = require('./test-task-specification.schema.json');

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

const valid = validate(testSpecification);
if (!valid) {
  console.error('Specification validation failed:');
  console.error(validate.errors);
}
```

### CLI Validation

```bash
# Validate test specification
node .specify/tools/validate-test-spec.js path/to/test-spec.json

# Output:
# ✅ Schema validation: PASSED
# ✅ Completeness check: PASSED
# ✅ Executability check: PASSED
# ✅ Specification is COMPLIANT and ready for execution
```

---

## Summary

This schema is the **single source of truth** for test task specifications in CODOR v5.0.

**Key Principles**:
1. **Strict Validation**: All specifications MUST validate
2. **Script-Executable**: No agent involvement in execution
3. **Evidence-Driven**: All evidence requirements specified
4. **Status-Locked**: Task completion controlled by script

**Next Steps**:
1. Use this schema when generating test specifications
2. Validate all specifications before execution
3. Update schema documentation when adding new action types

---

**Schema URI**: `https://codor.dev/schemas/test-task-specification.v2.0.json`  
**Documentation**: `docs/specifications/testing-system/TEST-TASK-SCHEMA-BIBLE.md`  
**Last Updated**: September 30, 2025
