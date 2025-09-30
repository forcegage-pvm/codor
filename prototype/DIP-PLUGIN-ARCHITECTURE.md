# DIP-Based Plugin Architecture

## Overview

This document describes the Dependency Inversion Principle (DIP) based plugin architecture for the CODOR Test Execution Engine. The architecture enables:

- **Multiple plugins per type** - Multiple executors can handle the same action type
- **Dynamic plugin loading** - Plugins discovered automatically from directories
- **Interface-based contracts** - Engine depends on interfaces, not implementations
- **Zero core changes** - Add new features by dropping files in plugin directories

## Architecture Principles

###  1. Dependency Inversion Principle (DIP)

**High-level modules** (Engine) depend on **abstractions** (Interfaces), not on low-level modules (Plugins).

```
Engine (high-level)
   ↓ depends on
IExecutor (interface/abstraction)
   ↑ implemented by
FileValidationExecutor (low-level plugin)
```

### 2. Polymorphism

Engine works with arrays of interface types (`IExecutor[]`, `IFailureAnalyzer[]`), allowing multiple implementations to coexist and be executed.

### 3. Open/Closed Principle

System is **open for extension** (add plugins) but **closed for modification** (no engine changes needed).

## Directory Structure

```
core/
├── interfaces/           # Pure interface definitions (contracts)
│   ├── IExecutor.ts
│   ├── IFailureAnalyzer.ts
│   ├── ITechnicalDebtDetector.ts
│   ├── IValidator.ts
│   ├── IReporter.ts
│   └── index.ts
│
├── base/                 # Optional base classes (helpers)
│   ├── BaseExecutor.ts
│   ├── BaseFailureAnalyzer.ts
│   ├── BaseTechnicalDebtDetector.ts
│   ├── BaseValidator.ts
│   ├── BaseReporter.ts
│   └── index.ts
│
├── plugins/              # All plugins in subdirectories
│   ├── executors/
│   │   ├── file-validation.ts
│   │   ├── http-request.ts
│   │   ├── terminal-command.ts
│   │   └── mcp-browser.ts
│   ├── failure-analyzers/
│   │   ├── pattern-based-analyzer.ts
│   │   └── timeout-analyzer.ts
│   ├── technical-debt-detectors/
│   │   ├── performance-detector.ts
│   │   └── complexity-detector.ts
│   ├── validators/
│   │   └── criteria-validator.ts
│   └── reporters/
│       └── json-reporter.ts
│
├── plugin-registry-new.ts # Dynamic plugin loader (DIP-compliant)
├── engine.ts             # Test execution engine
├── evidence-collector.ts
├── specification-loader.ts
└── validation-engine.ts
```

## Interface Contracts

### IExecutor

```typescript
export interface IExecutor {
  readonly name: string;          // Unique plugin identifier
  readonly version: string;        // Semver version
  getActionTypes(): string[];      // Action types handled
  execute(parameters: any, globalConfig: ExecutorConfig): Promise<ExecutionResult>;
  cleanup(): Promise<void>;
}
```

**Responsibilities:**
- Execute specific action types (e.g., FILE_VALIDATION, HTTP_REQUEST)
- Return standardized ExecutionResult with success flag
- Clean up resources when engine shuts down

### IFailureAnalyzer

```typescript
export interface IFailureAnalyzer {
  readonly name: string;
  readonly priority: number;       // Higher = runs first
  analyze(steps: any[], failureReason: string, taskSpec: any): Promise<FailureAnalysisResult | null>;
}
```

**Responsibilities:**
- Analyze FAILED tests
- Categorize failures (e.g., TIMEOUT, MISSING_DEPENDENCY)
- Provide actionable remediation suggestions
- Return null if cannot categorize

**Multiple analyzers** can analyze the same failure, each providing different insights.

### ITechnicalDebtDetector

```typescript
export interface ITechnicalDebtDetector {
  readonly name: string;
  readonly priority: number;
  analyze(steps: any[], taskSpec: any): Promise<TechnicalDebtItem[]>;
}
```

**Responsibilities:**
- Analyze PASSING tests for quality issues
- Detect performance problems, complexity issues, maintainability concerns
- Return array of debt items (empty if none found)

**Multiple detectors** can analyze the same test, each focusing on different aspects.

### IValidator

```typescript
export interface IValidator {
  readonly name: string;
  validate(criteria: any, executionContext: Map<string, any>): Promise<ValidationResult>;
}
```

**Responsibilities:**
- Evaluate validation criteria against execution results
- Determine if test PASSED or FAILED

### IReporter

```typescript
export interface IReporter {
  readonly name: string;
  readonly format: string;         // e.g., "json", "html", "xml"
  generate(results: ExecutionResults): Promise<void>;
}
```

**Responsibilities:**
- Generate reports in specific formats
- Handle file I/O internally

## Plugin Loading Process

### 1. Discovery

Plugin Registry scans `core/plugins/{type}/` directories for `.ts` or `.js` files (excluding files starting with `_`).

### 2. Loading

```typescript
// Dynamic require/import
const ExecutorModule = require(modulePath);
const ExecutorClass = ExecutorModule.default || ExecutorModule;
const executor: IExecutor = new ExecutorClass();
```

### 3. Validation

Registry validates that plugin implements interface correctly:

```typescript
if (!executor.name || !executor.version || !executor.getActionTypes) {
  throw new Error(`Executor does not implement IExecutor interface`);
}
```

### 4. Registration

```typescript
// Multiple executors per action type
for (const actionType of executor.getActionTypes()) {
  if (!this.executorsByActionType.has(actionType)) {
    this.executorsByActionType.set(actionType, []);
  }
  this.executorsByActionType.get(actionType)!.push(executor);
}
```

### 5. Sorting

Analyzers and detectors sorted by priority (highest first):

```typescript
this.failureAnalyzers.sort((a, b) => b.priority - a.priority);
```

## Engine Execution Flow

### Multiple Executors Per Action

```typescript
async executeAction(action: any): Promise<ActionResult> {
  const executors = this.pluginRegistry.getExecutorsForAction(action.type);
  
  if (executors.length === 0) {
    throw new Error(`No executor for action type: ${action.type}`);
  }
  
  // Use first executor (or implement strategy pattern)
  const executor = executors[0];
  const result = await executor.execute(action.parameters, this.globalConfig);
  
  return {
    action,
    executorName: executor.name,
    executorVersion: executor.version,
    ...result
  };
}
```

### Collecting All Analyzer Outputs

```typescript
async analyzeFailure(steps: any[], failureReason: string, taskSpec: any): Promise<FailureAnalysisResult[]> {
  const analyzers = this.pluginRegistry.getFailureAnalyzers();
  const results: FailureAnalysisResult[] = [];
  
  for (const analyzer of analyzers) {
    try {
      const result = await analyzer.analyze(steps, failureReason, taskSpec);
      if (result) {
        results.push(result);  // Collect all results
      }
    } catch (error) {
      console.error(`Analyzer ${analyzer.name} failed: ${error.message}`);
    }
  }
  
  return results;
}
```

### Task Result Structure

```typescript
interface TaskResult {
  taskId: string;
  status: "PASSED" | "FAILED";
  
  // Arrays from ALL analyzers/detectors
  failureAnalysis: FailureAnalysisResult[];    // Multiple analyzers
  technicalDebt: TechnicalDebtItem[];          // Multiple detectors
  
  steps: ActionResult[];
  // ...
}
```

## Creating a New Plugin

### Example: Creating a New Executor

**1. Create file in `core/plugins/executors/my-executor.ts`:**

```typescript
import { BaseExecutor, ExecutorConfig, ExecutionResult } from "../../base/BaseExecutor";

export class MyExecutor extends BaseExecutor {
  readonly name = "my-executor";
  readonly version = "1.0.0";
  
  getActionTypes(): string[] {
    return ["MY_ACTION"];
  }
  
  async execute(parameters: any, globalConfig: ExecutorConfig): Promise<ExecutionResult> {
    try {
      // Your logic here
      return this.createSuccessResult({ message: "Success" });
    } catch (error) {
      return this.createFailureResult(error.message);
    }
  }
  
  async cleanup(): Promise<void> {
    // Optional cleanup
  }
}

export default MyExecutor;
```

**2. That's it!** Plugin auto-loads on next engine start.

### Example: Creating a New Failure Analyzer

```typescript
import { BaseFailureAnalyzer, FailureAnalysisResult } from "../../base/BaseFailureAnalyzer";

export class MyAnalyzer extends BaseFailureAnalyzer {
  readonly name = "my-analyzer";
  readonly priority = 50;  // Higher = runs first
  
  async analyze(steps: any[], failureReason: string, taskSpec: any): Promise<FailureAnalysisResult | null> {
    // Check if this analyzer applies
    if (!failureReason.includes("my-error-pattern")) {
      return null;  // Not applicable
    }
    
    return this.createResult(
      "MY_CATEGORY",
      "Description of failure",
      "Suggested fix",
      { evidence: "data" },
      undefined,  // blockedBy
      0.95        // confidence
    );
  }
}

export default MyAnalyzer;
```

## Benefits of This Architecture

### 1. Testability

Each plugin can be unit tested independently:

```typescript
const executor = new FileValidationExecutor();
const result = await executor.execute({ filePath: "test.json", validationType: "EXISTS" }, {});
expect(result.success).toBe(true);
```

### 2. Extensibility

Add new features without modifying core:
- Drop file in `core/plugins/{type}/`
- Implements interface
- Auto-loads and integrates

### 3. Maintainability

- Clear separation of concerns
- Each plugin is isolated
- Breaking changes limited to plugin
- Easy to deprecate/replace plugins

### 4. Community Contributions

Contributors can:
- Add plugins in any language (via executors)
- Focus on single plugin
- No need to understand entire engine
- Follow clear interface contract

### 5. Runtime Flexibility

- Enable/disable plugins dynamically
- Multiple implementations available
- Select plugins based on criteria
- Hot-reload plugins (future enhancement)

## Migration Path

### From Old Architecture to New

**Old (Before):**
```typescript
// Base class mixing interface + implementation
export abstract class BaseExecutor {
  abstract execute(...): Promise<any>;
  
  // Helper methods mixed in
  validateParameters(...) { }
}
```

**New (After):**
```typescript
// Pure interface
export interface IExecutor {
  execute(...): Promise<ExecutionResult>;
}

// Optional base class
export abstract class BaseExecutor implements IExecutor {
  // Helper methods separate
  protected validateParameters(...) { }
}
```

### Required Changes

1. **Import paths:**
   - Old: `import { BaseExecutor } from "../core/base-executor"`
   - New: `import { BaseExecutor } from "../../base/BaseExecutor"`

2. **Add properties:**
   ```typescript
   readonly name = "my-plugin";
   readonly version = "1.0.0";
   readonly priority = 50;  // For analyzers/detectors
   ```

3. **Update registry path:**
   - Old: `path.join(this.baseDir, "executors")`
   - New: `path.join(this.baseDir, "core/plugins/executors")`

## Future Enhancements

1. **Plugin Configuration**
   - Pass config to plugin constructors
   - Enable/disable plugins via config file

2. **Plugin Dependencies**
   - Declare dependencies between plugins
   - Automatic ordering based on dependencies

3. **Plugin Marketplace**
   - npm packages for plugins
   - Auto-discovery from package.json

4. **Hot Reload**
   - Reload plugins without restarting engine
   - Useful for development

5. **Plugin Versioning**
   - Semantic versioning support
   - Compatibility checking

6. **Plugin Metrics**
   - Track execution time per plugin
   - Success/failure rates
   - Performance monitoring

## Conclusion

This DIP-based architecture provides a solid foundation for extensible, maintainable, and community-driven plugin ecosystem. The clear separation between interfaces, base classes, and plugins enables independent development while maintaining system integrity.

---

**Status:** Architecture designed and interfaces/base classes implemented. Plugin migration in progress.

**Next Steps:**
1. Update all existing plugins to implement new interfaces
2. Update engine to use new plugin registry
3. Test complete system
4. Document plugin development guide with examples
