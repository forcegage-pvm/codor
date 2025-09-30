# Contributing to CODOR Test Execution Engine

Welcome! This guide explains how to extend the CODOR test execution engine with new executors, validators, and reporters.

## 🏗️ Architecture Overview

The engine uses a **plugin-based architecture** designed for open-source collaboration:

```
prototype/
├── core/                    # Core engine (rarely modified)
│   ├── engine.js           # Main orchestration
│   ├── plugin-registry.js  # Auto-discovers plugins
│   ├── base-executor.js    # Executor interface
│   └── ...
├── executors/              # 👈 ADD NEW EXECUTORS HERE
│   ├── terminal-command.js
│   ├── http-request.js
│   ├── file-validation.js
│   └── mcp-browser.js
├── validators/             # 👈 ADD NEW VALIDATORS HERE
│   └── (future)
└── reporters/              # 👈 ADD NEW REPORTERS HERE
    └── (future)
```

## ✨ Key Principles

1. **Zero Core Changes**: Add features by creating new files, not modifying core
2. **Auto-Discovery**: Drop a file in the right folder and it's automatically loaded
3. **Minimal Merge Conflicts**: Each plugin is a separate file
4. **Consistent Interface**: All plugins extend base classes

## 📝 Creating a New Executor

### Step 1: Create File

Create `prototype/executors/your-executor-name.js`:

```javascript
const BaseExecutor = require('../core/base-executor');

class YourExecutor extends BaseExecutor {
  getActionTypes() {
    // Return action types this executor handles
    return ['YOUR_ACTION_TYPE'];
  }

  async execute(parameters, globalConfig) {
    // Validate required parameters
    this.validateParameters(parameters, ['requiredParam1', 'requiredParam2']);
    
    // Your execution logic here
    const result = {
      // Return structured result
      timestamp: new Date().toISOString()
    };
    
    return result;
  }

  async cleanup() {
    // Optional: cleanup resources
  }
}

module.exports = YourExecutor;
```

### Step 2: Test It

```bash
node run.js test-spec.json --list-plugins
# Should show YOUR_ACTION_TYPE in the list

node run.js test-spec.json
# Will automatically use your executor for YOUR_ACTION_TYPE actions
```

That's it! No core engine modifications needed.

## 🎯 Real Examples

### Example 1: Python Command Executor

For contributors adding Python support:

```javascript
// prototype/executors/python-command.js
const { spawn } = require('child_process');
const BaseExecutor = require('../core/base-executor');

class PythonCommandExecutor extends BaseExecutor {
  getActionTypes() {
    return ['PYTHON_COMMAND'];
  }

  async execute(parameters, globalConfig) {
    this.validateParameters(parameters, ['script']);
    
    const { script, pythonPath = 'python', args = [] } = parameters;
    
    return new Promise((resolve, reject) => {
      const child = spawn(pythonPath, [script, ...args], {
        cwd: globalConfig.workspaceRoot
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => { stdout += data; });
      child.stderr.on('data', (data) => { stderr += data; });
      
      child.on('close', (code) => {
        resolve({
          script,
          exitCode: code,
          stdout,
          stderr,
          timestamp: new Date().toISOString()
        });
      });
    });
  }
}

module.exports = PythonCommandExecutor;
```

### Example 2: Database Query Executor

For contributors adding database support:

```javascript
// prototype/executors/database-query.js
const BaseExecutor = require('../core/base-executor');

class DatabaseQueryExecutor extends BaseExecutor {
  getActionTypes() {
    return ['DATABASE_QUERY'];
  }

  async execute(parameters, globalConfig) {
    this.validateParameters(parameters, ['connectionString', 'query']);
    
    const { connectionString, query, timeout = 30000 } = parameters;
    
    // Use your preferred DB library (pg, mysql2, etc.)
    const client = await this.connect(connectionString);
    
    try {
      const startTime = Date.now();
      const result = await client.query(query);
      const queryTime = Date.now() - startTime;
      
      return {
        query,
        rows: result.rows,
        rowCount: result.rowCount,
        queryTime,
        timestamp: new Date().toISOString()
      };
    } finally {
      await client.close();
    }
  }
}

module.exports = DatabaseQueryExecutor;
```

### Example 3: Docker Command Executor

For contributors adding Docker support:

```javascript
// prototype/executors/docker-command.js
const { spawn } = require('child_process');
const BaseExecutor = require('../core/base-executor');

class DockerCommandExecutor extends BaseExecutor {
  getActionTypes() {
    return ['DOCKER_COMMAND'];
  }

  async execute(parameters, globalConfig) {
    this.validateParameters(parameters, ['command']);
    
    const { command, image, containerName } = parameters;
    
    const dockerArgs = ['run'];
    if (containerName) dockerArgs.push('--name', containerName);
    dockerArgs.push(image, ...command.split(' '));
    
    return new Promise((resolve, reject) => {
      const child = spawn('docker', dockerArgs);
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => { stdout += data; });
      child.stderr.on('data', (data) => { stderr += data; });
      
      child.on('close', (code) => {
        resolve({
          command,
          image,
          exitCode: code,
          stdout,
          stderr,
          timestamp: new Date().toISOString()
        });
      });
    });
  }
}

module.exports = DockerCommandExecutor;
```

## 🔧 Language/Framework Extensions

### Adding Support for New Languages

Each language can have its own executor(s):

```
executors/
├── terminal-command.js      # PowerShell (Windows)
├── bash-command.js          # Bash (Linux/Mac)
├── python-command.js        # Python scripts
├── ruby-command.js          # Ruby scripts
├── go-test.js               # Go test runner
├── rust-test.js             # Cargo test runner
├── dotnet-test.js           # .NET test runner
└── ...
```

### Adding Support for New Frameworks

Framework-specific executors:

```
executors/
├── playwright-browser.js    # Playwright automation
├── puppeteer-browser.js     # Puppeteer automation
├── selenium-browser.js      # Selenium automation
├── cypress-test.js          # Cypress tests
├── jest-test.js             # Jest tests
├── pytest-test.js           # Pytest tests
└── ...
```

## 📋 Parameter Validation

Use `validateParameters()` helper:

```javascript
async execute(parameters, globalConfig) {
  // Throws error if missing
  this.validateParameters(parameters, ['url', 'method']);
  
  // Optional parameters with defaults
  const {
    url,
    method,
    timeout = 30000,
    headers = {}
  } = parameters;
  
  // Your logic...
}
```

## 🎨 Best Practices

### DO ✅

- **Keep executors focused**: One executor per action type/technology
- **Return structured data**: Always return objects with predictable structure
- **Handle errors gracefully**: Throw descriptive errors
- **Add timestamps**: Include `timestamp: new Date().toISOString()`
- **Document parameters**: Add JSDoc comments explaining parameters
- **Test thoroughly**: Create test specs that use your executor

### DON'T ❌

- **Don't modify core files**: Add new files instead
- **Don't use global state**: Keep executors stateless when possible
- **Don't hardcode paths**: Use `globalConfig.workspaceRoot`
- **Don't mix concerns**: Terminal commands ≠ HTTP requests
- **Don't skip validation**: Always validate required parameters

## 🚀 Contribution Workflow

1. **Fork** the repository
2. **Create** new executor in `prototype/executors/`
3. **Test** with `--list-plugins` and real test specs
4. **Document** in your PR what action types are added
5. **Submit** PR - reviewers focus only on your new file

## 📚 Testing Your Executor

Create a test specification:

```json
{
  "schemaVersion": "2.0.0",
  "tasks": {
    "test-your-executor": {
      "title": "Test Your Executor",
      "testExecution": {
        "steps": [
          {
            "actionId": "STEP.1",
            "type": "YOUR_ACTION_TYPE",
            "description": "Test your executor",
            "parameters": {
              "requiredParam1": "value1"
            }
          }
        ]
      },
      "validationCriteria": {
        "successConditions": [
          {
            "condition": "STEP.1.success === true",
            "description": "Executor succeeded"
          }
        ]
      }
    }
  },
  "globalConfiguration": {
    "workspaceRoot": "D:/your/workspace"
  }
}
```

Run: `node run.js test-spec.json`

## 🌍 Multi-Language Support

The engine is **language-agnostic** by design. Current implementation is Node.js, but the architecture supports:

- **Python**: Create `codor-engine-python` package with same plugin pattern
- **Go**: Create `codor-engine-go` with same plugin pattern
- **Rust**: Create `codor-engine-rust` with same plugin pattern

All engines share the same **test specification format** (JSON schema v2.0.0).

## 💡 Questions?

- Check existing executors for examples
- Open an issue for questions
- Join discussions for architectural questions

Happy contributing! 🎉
