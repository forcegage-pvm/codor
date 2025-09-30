# CODOR Test Execution Engine v2.0

**Plugin-based, language-agnostic test execution engine designed for open-source collaboration.**

## 🎯 Features

- **Zero-config plugin discovery**: Drop a file in `/executors` and it's ready to use
- **Language-agnostic**: Supports any language/framework via plugins
- **Minimal merge conflicts**: Each feature is a separate file
- **Extensible validation**: Custom validation criteria evaluation
- **Structured evidence**: Unfakeable JSON evidence for compliance
- **Real-time output**: See test execution as it happens

## 🚀 Quick Start

```bash
# Install dependencies (minimal)
npm install

# List available plugins
node run.js --list-plugins

# Run a test specification
node run.js path/to/test-spec.json

# Run with options
node run.js test-spec.json --verbose --stop-on-failure
```

## 📦 Built-in Executors

| Executor | Action Type | Description |
|----------|-------------|-------------|
| `terminal-command.js` | `TERMINAL_COMMAND` | Execute PowerShell commands (Windows) |
| `http-request.js` | `HTTP_REQUEST` | HTTP API testing |
| `file-validation.js` | `FILE_VALIDATION` | File existence/content validation |
| `mcp-browser.js` | `MCP_BROWSER_COMMAND` | Browser automation via MCP |

## 🏗️ Architecture

```
prototype/
├── core/                    # Core engine (stable, rarely changes)
│   ├── engine.js           # Main orchestration
│   ├── plugin-registry.js  # Auto-discovers plugins
│   ├── base-executor.js    # Executor interface
│   ├── specification-loader.js
│   ├── validation-engine.js
│   └── evidence-collector.js
├── executors/              # 👈 ADD NEW EXECUTORS HERE
│   ├── terminal-command.js
│   ├── http-request.js
│   ├── file-validation.js
│   └── mcp-browser.js
├── validators/             # 👈 ADD NEW VALIDATORS HERE
│   └── (future plugins)
├── reporters/              # 👈 ADD NEW REPORTERS HERE
│   └── (future plugins)
├── run.js                  # CLI entry point
└── CONTRIBUTING.md         # How to add plugins
```

## 📝 Test Specification Format

```json
{
  "schemaVersion": "2.0.0",
  "metadata": {
    "taskTitle": "My Test",
    "author": "Your Name"
  },
  "tasks": {
    "task-001": {
      "title": "Test Task",
      "testExecution": {
        "prerequisites": [
          {
            "actionId": "PREREQ.1",
            "type": "TERMINAL_COMMAND",
            "description": "Setup environment",
            "parameters": {
              "command": "echo 'Setup'"
            }
          }
        ],
        "steps": [
          {
            "actionId": "STEP.1",
            "type": "HTTP_REQUEST",
            "description": "Test API endpoint",
            "parameters": {
              "url": "http://localhost:3000/api/test",
              "method": "GET"
            }
          }
        ],
        "cleanup": [
          {
            "actionId": "CLEANUP.1",
            "type": "TERMINAL_COMMAND",
            "description": "Cleanup",
            "parameters": {
              "command": "echo 'Cleanup'",
              "continueOnFailure": true
            }
          }
        ]
      },
      "validationCriteria": {
        "successConditions": [
          {
            "condition": "STEP.1.success === true",
            "description": "API request succeeded"
          },
          {
            "condition": "STEP.1.status === 200",
            "description": "Status code is 200"
          }
        ]
      }
    }
  },
  "globalConfiguration": {
    "workspaceRoot": "D:/your/workspace",
    "evidenceDirectory": "evidence",
    "timeout": 60000
  }
}
```

## 🔧 Adding New Executors

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guide.

Quick example:

```javascript
// executors/your-executor.js
const BaseExecutor = require('../core/base-executor');

class YourExecutor extends BaseExecutor {
  getActionTypes() {
    return ['YOUR_ACTION_TYPE'];
  }

  async execute(parameters, globalConfig) {
    // Your logic here
    return { result: 'data', timestamp: new Date().toISOString() };
  }
}

module.exports = YourExecutor;
```

That's it! The engine auto-discovers and loads your executor.

## 📊 Evidence Generation

Each action generates structured JSON evidence:

```
evidence/
├── task-001/
│   ├── PREREQ-1.json      # Individual action evidence
│   ├── STEP-1.json
│   ├── CLEANUP-1.json
│   └── task-summary.json  # Task summary
└── execution-report.json  # Final report
```

## 🧪 Validation Criteria

The engine evaluates JavaScript expressions with execution context:

```json
{
  "successConditions": [
    {
      "condition": "STEP.1.exitCode === 0",
      "description": "Command succeeded"
    },
    {
      "condition": "STEP.2.status === 200",
      "description": "HTTP 200 OK"
    },
    {
      "condition": "STEP.3.errorCount === 0",
      "description": "No errors in output"
    }
  ]
}
```

Available in context:
- `STEP.N.exitCode` - Exit code (terminal commands)
- `STEP.N.status` - HTTP status code (HTTP requests)
- `STEP.N.success` - Boolean success flag
- `STEP.N.stdout` - Standard output
- `STEP.N.stderr` - Standard error
- `STEP.N.body` - Response body (HTTP)
- `STEP.N.errorCount` - Error count in stderr
- `STEP.N.warningCount` - Warning count in stdout

## 🌍 Multi-Language Support

The engine is **designed for multi-language ecosystems**:

### Current: Node.js Implementation
- Executors for Node.js, npm, PowerShell, etc.
- JavaScript validation expressions
- Native async/await patterns

### Future: Python Implementation
```python
# codor-engine-python/executors/python_command.py
class PythonCommandExecutor(BaseExecutor):
    def get_action_types(self):
        return ['PYTHON_COMMAND']
    
    async def execute(self, parameters, global_config):
        # Python-specific execution
        pass
```

### Future: Go Implementation
```go
// codor-engine-go/executors/go_test.go
type GoTestExecutor struct{}

func (e *GoTestExecutor) GetActionTypes() []string {
    return []string{"GO_TEST"}
}

func (e *GoTestExecutor) Execute(params, config map[string]interface{}) (map[string]interface{}, error) {
    // Go-specific execution
}
```

**All engines share the same JSON specification format.**

## 🎯 Design Goals

1. **Open-Source Collaboration**: 1000s of contributors can add features without conflicts
2. **Zero Core Changes**: Add features by creating files, not modifying engine
3. **Language Agnostic**: Support any language/framework via plugins
4. **Unfakeable Evidence**: Structured JSON evidence for compliance/auditing
5. **Production Ready**: Real-time output, error handling, timeouts, cleanup

## 📚 CLI Options

```
node run.js <test-spec.json> [options]

Options:
  --verbose          Verbose output
  --dry-run          Validate without executing
  --stop-on-failure  Stop on first task failure
  --list-plugins     List all available plugins
```

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Creating new executors
- Adding validators
- Adding reporters
- Testing your plugins
- Best practices

## 📄 License

See repository LICENSE file.

## 🎉 Example: Running a Test

```bash
$ node run.js ../docs/specifications/testing-system/examples/T004-quotes-get-test-specification.json

🚀 Initializing Test Execution Engine v2.0
🔌 Loading plugins...
  📦 Loaded executor: TERMINAL_COMMAND (terminal-command.js)
  📦 Loaded executor: HTTP_REQUEST (http-request.js)
  📦 Loaded executor: FILE_VALIDATION (file-validation.js)
  📦 Loaded executor: MCP_BROWSER_COMMAND (mcp-browser.js)
✅ Loaded 4 executors, 0 validators, 0 reporters
✅ Loaded specification: T004 - Quotes GET API Test
📋 Tasks: CONTRACT-001-quotes-get

🎯 Beginning Test Execution
============================================================
📋 Task: CONTRACT-001-quotes-get - Test GET /api/quotes
============================================================

📋 Executing Prerequisites
🔹 PREREQ.1: Start development server
✅ PREREQ.1 completed successfully

⚡ Executing Test Steps
🔹 STEP.1: GET quotes list
✅ STEP.1 completed successfully

🔹 STEP.2: Validate response structure
✅ STEP.2 completed successfully

✓ Evaluating Validation Criteria
✅ Passed: Server started successfully
✅ Passed: GET request succeeded
✅ Passed: Response has quotes array

🧹 Executing Cleanup
🔹 CLEANUP.1: Stop development server
✅ CLEANUP.1 completed successfully

📊 Final report: D:/workspace/evidence/execution-report.json
✅ Passed: 1/1
❌ Failed: 0/1
```

## 🔗 Related

- [Test Specification Schema](../docs/specifications/testing-system/current-test-task.schema.json)
- [YAML Input Schema](../docs/specifications/testing-system/current-yaml-input.schema.yaml)
- [Architecture Documentation](../docs/)
