# CODOR Plugin Development Guide

## TypeScript Plugin Architecture

CODOR v2.0 uses a **fully typed plugin architecture** with TypeScript interfaces and abstract base classes. All plugins **MUST** extend the appropriate base class to ensure type safety and API compliance.

## Table of Contents

1. [Creating Executor Plugins](#creating-executor-plugins)
2. [Creating Failure Analyzer Plugins](#creating-failure-analyzer-plugins)
3. [Creating Technical Debt Detector Plugins](#creating-technical-debt-detector-plugins)
4. [Plugin Discovery](#plugin-discovery)
5. [Testing Your Plugin](#testing-your-plugin)

---

## Creating Executor Plugins

Executors handle different types of test actions (file operations, HTTP requests, terminal commands, etc.).

### Base Class

```typescript
import { BaseExecutor, ExecutorConfig, ExecutionResult } from "../core/base-executor";
```

### Required Interface

```typescript
export interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  [key: string]: any;
}
```

### Example: Custom Executor

```typescript
import { BaseExecutor, ExecutorConfig, ExecutionResult } from "../core/base-executor";

interface MyCustomParameters {
  // Define your parameter types
  targetFile: string;
  operation: "read" | "write" | "delete";
  content?: string;
}

interface MyCustomResult {
  operation: string;
  targetFile: string;
  success: boolean;
  content?: string;
  timestamp: string;
}

export class MyCustomExecutor extends BaseExecutor {
  /**
   * REQUIRED: Return array of action types this executor handles
   */
  getActionTypes(): string[] {
    return ["MY_CUSTOM_ACTION"];
  }

  /**
   * REQUIRED: Execute the action
   * @param parameters - Action parameters from test spec
   * @param globalConfig - Global configuration
   * @returns ExecutionResult with success flag and data
   */
  async execute(
    parameters: MyCustomParameters,
    globalConfig: ExecutorConfig
  ): Promise<ExecutionResult> {
    // Validate required parameters
    this.validateParameters(parameters, ["targetFile", "operation"]);

    const { targetFile, operation, content } = parameters;

    try {
      // Your implementation here
      const result: MyCustomResult = {
        operation,
        targetFile,
        success: true,
        timestamp: new Date().toISOString(),
      };

      // Return success with data
      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      // Throw errors - engine will handle them
      throw new Error(`Failed to ${operation} file: ${error.message}`);
    }
  }

  /**
   * OPTIONAL: Cleanup method called when engine shuts down
   */
  async cleanup(): Promise<void> {
    // Clean up resources (close connections, stop processes, etc.)
  }
}

export default MyCustomExecutor;
```

### File Location

Save as: `prototype/executors/my-custom-executor.ts`

The engine will **automatically discover and load** your executor.

---

## Creating Failure Analyzer Plugins

Failure analyzers categorize test failures and provide actionable guidance. They run **only on FAILED tasks**.

### Base Class

```typescript
import {
  BaseFailureAnalyzer,
  FailureAnalysisResult,
  FailureAnalyzerConfig,
} from "../core/base-failure-analyzer";
```

### Required Interface

```typescript
export interface FailureAnalysisResult {
  analyzer: string;           // Your analyzer name
  category: string;            // Failure category
  reason: string;              // Human-readable reason
  blockedBy?: string[];        // What's blocking progress
  suggestedAction: string;     // Actionable guidance
  detectedAt: string;          // ISO timestamp
  evidence: {
    actionId: string;
    actionType: string;
    error?: string;
    [key: string]: any;
  };
}
```

### Example: Custom Failure Analyzer

```typescript
import {
  BaseFailureAnalyzer,
  FailureAnalysisResult,
  FailureAnalyzerConfig,
} from "../core/base-failure-analyzer";

export class MyFailureAnalyzer extends BaseFailureAnalyzer {
  constructor(config: FailureAnalyzerConfig = {}) {
    super("my-failure-analyzer", config);
  }

  /**
   * REQUIRED: Analyze failed test execution
   * @param steps - Array of executed test steps
   * @param failureReason - Reason string from executor
   * @param taskSpec - Original task specification
   * @returns Analysis result or null if no pattern matches
   */
  async analyze(
    steps: any[],
    failureReason: string,
    taskSpec: any
  ): Promise<FailureAnalysisResult | null> {
    // Find failed step
    const failedStep = steps.find((s) => !s.success);
    if (!failedStep) return null;

    const error = failedStep.error || "";
    const action = failedStep.action || {};

    // Check if this analyzer handles this type of failure
    if (error.toLowerCase().includes("database")) {
      // Use helper method from base class
      return this.createResult(
        "DATABASE_ERROR",
        "Database connection or query failed",
        "Check database server status and connection string",
        {
          actionId: action.actionId,
          actionType: action.type,
          error: error,
        },
        ["Database server must be running", "Connection credentials must be valid"]
      );
    }

    // Return null if this analyzer doesn't handle this failure type
    return null;
  }

  /**
   * OPTIONAL: Cleanup method
   */
  async cleanup(): Promise<void> {
    // Clean up any resources
  }
}

export default MyFailureAnalyzer;
```

### File Location

Save as: `prototype/failure-analyzers/my-failure-analyzer.ts`

### Multiple Analyzers

The engine runs **ALL** failure analyzers and collects results into an array:

```json
{
  "failureAnalysis": [
    {
      "analyzer": "pattern-based-analyzer",
      "category": "INCOMPLETE_IMPLEMENTATION",
      "reason": "File not found",
      "suggestedAction": "Create the missing file"
    },
    {
      "analyzer": "my-failure-analyzer",
      "category": "DATABASE_ERROR",
      "reason": "Database connection failed",
      "suggestedAction": "Check database server status"
    }
  ]
}
```

---

## Creating Technical Debt Detector Plugins

Technical debt detectors analyze **PASSED** tests for quality issues, performance problems, and maintainability concerns.

### Base Class

```typescript
import {
  BaseTechnicalDebtDetector,
  TechnicalDebtItem,
  TechnicalDebtDetectorConfig,
} from "../core/base-technical-debt-detector";
```

### Required Interface

```typescript
export interface TechnicalDebtItem {
  detector: string;                        // Your detector name
  category: string;                        // Debt category
  severity: "LOW" | "MEDIUM" | "HIGH";    // Severity level
  description: string;                     // What's the issue
  recommendation: string;                  // How to fix it
  detectedAt: string;                      // ISO timestamp
  evidence: {
    metric?: string;
    threshold?: number;
    actual?: number;
    [key: string]: any;
  };
}
```

### Example: Custom Debt Detector

```typescript
import {
  BaseTechnicalDebtDetector,
  TechnicalDebtItem,
  TechnicalDebtDetectorConfig,
} from "../core/base-technical-debt-detector";

export class MyDebtDetector extends BaseTechnicalDebtDetector {
  constructor(config: TechnicalDebtDetectorConfig = {}) {
    super("my-debt-detector", config);
  }

  /**
   * REQUIRED: Analyze passed test for technical debt
   * @param steps - Array of executed test steps  
   * @param taskSpec - Original task specification
   * @returns Array of technical debt items (empty array if none found)
   */
  async analyze(
    steps: any[],
    taskSpec: any
  ): Promise<TechnicalDebtItem[]> {
    const debts: TechnicalDebtItem[] = [];

    for (const step of steps) {
      if (!step.success) continue; // Only analyze successful steps

      const action = step.action || {};
      const duration = step.durationMs || 0;

      // Example: Detect slow operations
      if (duration > 5000) {
        debts.push(
          this.createDebtItem(
            "PERFORMANCE_DEGRADATION",
            "MEDIUM",
            `Operation took ${duration}ms, exceeds 5000ms threshold`,
            "Optimize operation performance or add caching",
            {
              metric: "duration",
              threshold: 5000,
              actual: duration,
              actionId: action.actionId,
            }
          )
        );
      }

      // Example: Detect missing error handling
      if (action.type === "HTTP_REQUEST" && !action.parameters?.timeout) {
        debts.push(
          this.createDebtItem(
            "ERROR_HANDLING_INCOMPLETE",
            "LOW",
            "HTTP request missing timeout configuration",
            "Add timeout parameter to prevent hanging requests",
            {
              actionId: action.actionId,
              actionType: action.type,
            }
          )
        );
      }
    }

    return debts;
  }

  /**
   * OPTIONAL: Cleanup method
   */
  async cleanup(): Promise<void> {
    // Clean up any resources
  }
}

export default MyDebtDetector;
```

### File Location

Save as: `prototype/technical-debt-detectors/my-debt-detector.ts`

### Multiple Detectors

The engine runs **ALL** debt detectors and flattens results into a single array:

```json
{
  "technicalDebt": [
    {
      "detector": "performance-detector",
      "category": "PERFORMANCE_DEGRADATION",
      "severity": "HIGH",
      "description": "HTTP request took 8000ms"
    },
    {
      "detector": "my-debt-detector",
      "category": "ERROR_HANDLING_INCOMPLETE",
      "severity": "LOW",
      "description": "HTTP request missing timeout"
    }
  ]
}
```

---

## Plugin Discovery

### Automatic Loading

The engine **automatically discovers** all plugins from these directories:

- `prototype/executors/` - Executor plugins
- `prototype/failure-analyzers/` - Failure analyzer plugins
- `prototype/technical-debt-detectors/` - Technical debt detector plugins

### Supported File Types

- `.ts` - TypeScript files (recommended)
- `.js` - JavaScript files (must still import TypeScript base classes)

### File Naming

- **Include**: Any file ending in `.ts` or `.js`
- **Exclude**: Files starting with `_` (e.g., `_helper.ts`)

### Export Format

Use ES6 default export:

```typescript
export default MyPlugin;
```

Or CommonJS:

```typescript
module.exports = MyPlugin;
```

The engine handles both automatically.

---

## Testing Your Plugin

### 1. Create Your Plugin

Save your TypeScript plugin file in the appropriate directory.

### 2. Verify Loading

Run with `--list-plugins` (future feature) or check console output:

```bash
node run.js test-spec.json
```

Look for:
```
🔌 Loading plugins...
  📦 Loaded executor: MY_CUSTOM_ACTION (my-custom-executor.ts)
  📦 Loaded failure analyzer: my-failure-analyzer
  📦 Loaded debt detector: my-debt-detector
```

### 3. Create Test Specification

Create a test spec that uses your plugin:

```json
{
  "schemaVersion": "2.0.0",
  "tasks": {
    "TEST001": {
      "title": "Test My Custom Executor",
      "testExecution": {
        "steps": [
          {
            "actionId": "STEP.1",
            "type": "MY_CUSTOM_ACTION",
            "parameters": {
              "targetFile": "test.txt",
              "operation": "read"
            }
          }
        ]
      },
      "validationCriteria": {
        "successConditions": [
          {
            "condition": "STEP[1].success === true",
            "description": "Custom action executed successfully"
          }
        ]
      }
    }
  }
}
```

### 4. Run Your Test

```bash
node run.js path/to/test-spec.json
```

### 5. Check Evidence

Evidence files are generated in `evidence/` directory with full execution details.

---

## Type Safety Benefits

### IDE Autocomplete

TypeScript provides full autocomplete for:
- Base class methods
- Interface properties
- Helper functions

### Compile-Time Errors

Catch errors before runtime:
```typescript
// ❌ TypeScript Error: Missing required method
export class BadExecutor extends BaseExecutor {
  // Error: Must implement getActionTypes()
}

// ❌ TypeScript Error: Wrong return type
async analyze(): Promise<string> {  // Should return FailureAnalysisResult | null
  return "wrong type";
}

// ✅ Correct Implementation
export class GoodExecutor extends BaseExecutor {
  getActionTypes(): string[] {
    return ["MY_ACTION"];
  }
  
  async execute(params: any, config: ExecutorConfig): Promise<ExecutionResult> {
    return { success: true, data: {} };
  }
}
```

### Documentation

TypeScript interfaces serve as **living documentation** that's always up-to-date.

---

## Best Practices

### 1. Use Specific Types

Define interfaces for your parameters and results:

```typescript
// ✅ Good: Specific types
interface MyParameters {
  url: string;
  timeout: number;
  retries: number;
}

// ❌ Bad: Generic types
async execute(parameters: any, config: any): Promise<any>
```

### 2. Validate Parameters

Always validate required parameters:

```typescript
async execute(parameters: MyParameters, config: ExecutorConfig): Promise<ExecutionResult> {
  // Use helper from base class
  this.validateParameters(parameters, ["url", "timeout"]);
  
  // Your logic here
}
```

### 3. Use Helper Methods

Base classes provide helpers:

```typescript
// Failure Analyzer helpers
this.createResult(category, reason, suggestedAction, evidence, blockedBy);

// Technical Debt Detector helpers
this.createDebtItem(category, severity, description, recommendation, evidence);

// Executor helpers
this.validateParameters(parameters, requiredFields);
```

### 4. Return Proper Types

Always return the correct interface type:

```typescript
// Executor: MUST return ExecutionResult
return { success: true, data: myResult };

// Failure Analyzer: Return result or null
return this.createResult(...) || null;

// Debt Detector: MUST return array (empty if no issues)
return debts; // TechnicalDebtItem[]
```

### 5. Handle Errors Properly

Throw errors for failures - the engine handles them:

```typescript
if (!fileExists) {
  throw new Error("File not found: " + filePath);
}
```

### 6. Add Cleanup

If your plugin uses resources, implement cleanup:

```typescript
async cleanup(): Promise<void> {
  // Close connections
  // Stop processes
  // Release resources
}
```

---

## Contributing Your Plugin

Once your plugin is working:

1. **Test thoroughly** with various scenarios
2. **Document** your plugin's parameters and behavior
3. **Add type definitions** for all interfaces
4. **Submit a pull request** to the CODOR repository
5. **Add examples** showing how to use your plugin

### Plugin Checklist

- [ ] Extends correct base class
- [ ] Implements all required methods
- [ ] Uses TypeScript with proper types
- [ ] Validates parameters
- [ ] Returns correct interface types
- [ ] Handles errors appropriately
- [ ] Implements cleanup if needed
- [ ] Tested with real test specifications
- [ ] Documented with examples

---

## Questions?

See the existing plugins for reference:
- `prototype/executors/file-validation.ts` - Simple executor
- `prototype/executors/terminal-command.ts` - Complex executor with cleanup
- `prototype/failure-analyzers/pattern-based-analyzer.ts` - Pattern matching analyzer
- `prototype/technical-debt-detectors/performance-detector.ts` - Multi-category detector

The TypeScript interfaces enforce the contract - **if it compiles, it works with the engine!** 🎉
