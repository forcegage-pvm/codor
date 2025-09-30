# CODOR Architecture: Core Engine vs. VS Code Extension
**Date:** September 30, 2025  
**Strategic Decision:** VS Code Extension as Primary Interface

---

## Architecture Split: Core vs. Extension

### 🔧 Core Engine (Headless, Library-Style)
**Purpose:** Pure execution and analysis logic, no UI concerns

```typescript
// Core engine is a library that extension calls
import { TestExecutionEngine } from './core/engine';

const engine = new TestExecutionEngine(config);
await engine.initialize(specPath);
const results = await engine.execute();
```

**Responsibilities:**
- Parse specifications (JSON/YAML)
- Load and manage plugins
- Execute tasks/actions
- Collect evidence
- Analyze results (failures, technical debt)
- Emit events for streaming results

**Key Principle:** Engine knows nothing about VS Code, UI, or human interaction

---

### 🎨 VS Code Extension (UI + UX Layer)
**Purpose:** Developer experience and visual feedback

**Responsibilities:**
- Task generation (from templates, AI, OpenAPI)
- Test explorer tree view
- Inline results (CodeLens)
- Evidence visualization (webviews)
- Watch mode / auto-rerun
- Configuration management
- User interactions

---

## Revised Priority Matrix

### ❌ **Remove from Core Engine** (Move to Extension)

| Feature | Why It Belongs in Extension | Extension Implementation |
|---------|----------------------------|--------------------------|
| **Task Generation** | UI-driven workflow | Wizard, templates, AI prompts in extension |
| **HTML Reports** | VS Code has webviews | Extension renders evidence in webview panel |
| **Watch Mode** | VS Code has file watchers | Extension's `vscode.workspace.createFileSystemWatcher()` |
| **Test History/Trends** | Visual graphs/charts | Extension stores history, renders charts in webview |
| **Interactive Debugging** | VS Code debugger integration | Extension's debug adapter protocol |
| **Configuration UI** | VS Code settings | Extension contributes configuration schema |

### ✅ **Keep in Core Engine** (Extension-Agnostic)

| Feature | Why It Stays in Core | Implementation Status |
|---------|---------------------|----------------------|
| **Specification Parsing** | Pure logic, no UI | ✅ Working (JSON), 🚧 Need YAML |
| **Plugin System** | DIP architecture | ✅ Complete |
| **Task Execution** | Orchestration logic | ✅ Working |
| **Action Execution** | Plugin delegation | ✅ Working (4 executors) |
| **Validation Engine** | Rule evaluation | ✅ Engine exists, ⚠️ Need validators |
| **Failure Analysis** | Categorization logic | ✅ Working (1 analyzer) |
| **Technical Debt Detection** | Quality analysis | ✅ Working (1 detector) |
| **Evidence Collection** | Structured data output | ✅ Working (JSON) |
| **JUnit XML Export** | CI/CD integration | ❌ Missing (still valuable for CLI) |

---

## New Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                    VS Code Extension                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    UI Layer                               │  │
│  │  - Test Explorer (tree view)                             │  │
│  │  - Task Generation Wizard                                │  │
│  │  - Evidence Viewer (webview)                             │  │
│  │  - Inline Results (CodeLens)                             │  │
│  │  - Configuration UI                                      │  │
│  │  - Watch Mode Manager                                    │  │
│  └─────────────────────┬────────────────────────────────────┘  │
│                        │                                        │
│  ┌─────────────────────▼────────────────────────────────────┐  │
│  │              Extension Logic Layer                        │  │
│  │  - File watchers (auto-rerun)                            │  │
│  │  - History tracking (store results)                      │  │
│  │  - AI integration (task generation)                      │  │
│  │  - Template engine (new specs)                           │  │
│  │  - Event handlers (commands, clicks)                     │  │
│  └─────────────────────┬────────────────────────────────────┘  │
└────────────────────────┼───────────────────────────────────────┘
                         │ API Boundary
         ┌───────────────▼────────────────┐
         │      CODOR Core Engine          │
         │      (Headless Library)         │
         │                                 │
         │  - Specification Loading        │
         │  - Plugin Management            │
         │  - Task Execution               │
         │  - Evidence Collection          │
         │  - Analysis (Failure/Debt)      │
         │                                 │
         │  Events: progress, results      │
         │  Returns: ExecutionResults      │
         └─────────────────────────────────┘
```

---

## Revised Core Engine Priorities

### 🎯 **High Priority (Must Have for Extension)**

1. **Event Emitter for Streaming Results** ⭐
   ```typescript
   class TestExecutionEngine extends EventEmitter {
     async execute() {
       this.emit('taskStart', { taskId: 'TASK-1' });
       this.emit('actionComplete', { actionId: 'STEP.1', success: true });
       this.emit('taskComplete', { taskId: 'TASK-1', status: 'PASSED' });
     }
   }
   ```
   **Why:** Extension needs real-time updates for UI (progress bars, status updates)

2. **YAML Specification Support** ⭐
   ```yaml
   tasks:
     API-TEST:
       steps:
         - actionId: STEP.1
           type: HTTP_REQUEST
   ```
   **Why:** More human-friendly for developers editing in VS Code

3. **Validator Plugins** ⭐
   ```typescript
   // Core validates, extension doesn't need to
   validationResult = validator.validate(criteria, context);
   ```
   **Why:** Core responsibility - extension just displays results

4. **JUnit XML Export** ⭐
   ```typescript
   // CLI and CI/CD still need this
   await reporter.generate(results, 'junit.xml');
   ```
   **Why:** Enables GitHub Actions, Jenkins, GitLab CI integration

### ⏸️ **Low Priority (Extension Handles These)**

5. ~~**HTML Reporter**~~ → Extension renders in webview
6. ~~**Watch Mode**~~ → Extension uses VS Code file watcher
7. ~~**Task Generation**~~ → Extension provides UI wizard
8. ~~**Test History**~~ → Extension stores in workspace state
9. ~~**Interactive Debugging**~~ → Extension uses VS Code debugger

---

## Core Engine API for Extension

### What the Extension Needs from Core:

```typescript
// 1. Initialize with config
const engine = new TestExecutionEngine({
  verbose: false,
  stopOnFailure: false
});

// 2. Load specification
await engine.initialize(specPath);

// 3. Subscribe to events (streaming updates)
engine.on('taskStart', (task) => {
  // Update tree view: show task as "running"
});

engine.on('actionComplete', (action) => {
  // Update CodeLens: show inline pass/fail
});

engine.on('taskComplete', (task) => {
  // Update tree view: show final status
  // Generate webview content
});

engine.on('error', (error) => {
  // Show error notification
});

// 4. Execute tests
const results = await engine.execute();

// 5. Access results
results.tasks['TASK-1'].status;  // "PASSED" | "FAILED"
results.tasks['TASK-1'].technicalDebt;  // Quality issues
results.tasks['TASK-1'].failureAnalysis;  // Failure categories

// 6. Query evidence
const evidence = await engine.getEvidence('TASK-1');

// 7. Cleanup
await engine.cleanup();
```

### What Extension Provides to Users:

```typescript
// VS Code Command Palette:
> CODOR: Run Test
> CODOR: Generate Test from Template
> CODOR: View Evidence
> CODOR: Show Technical Debt
> CODOR: Enable Watch Mode

// Context Menu (right-click on spec file):
> Run This Test
> Debug This Test
> View Last Results

// Test Explorer Sidebar:
📋 CODOR Tests
├── ✅ API-TEST (2.3s)
│   └── 💡 View Evidence | 🔄 Rerun | 🐛 Debug
└── ⚠️  PERF-TEST (passed with 3 debt items)
    └── 📊 View Debt Analysis
```

---

## Extension-Specific Features (Not in Core)

### 1. Task Generation UI

**Command:** `CODOR: New Test Specification`

**Workflow:**
```
Step 1: Choose Template
  ○ Empty Test
  ○ API Test (HTTP)
  ○ File Validation Test
  ○ Performance Test
  ● Generate from OpenAPI Spec

Step 2: Select OpenAPI File
  📄 openapi.yaml

Step 3: Configure
  ☑ Generate authentication tests
  ☑ Generate validation tests
  ☑ Generate error tests
  Test file name: [api-tests.yaml]

Step 4: Generate!
  ✅ Created: tests/api-tests.yaml
  📝 Open file? [Yes] [No]
```

**Implementation:**
```typescript
// Extension command
vscode.commands.registerCommand('codor.newTest', async () => {
  // Show quick pick for template
  const template = await vscode.window.showQuickPick([
    'Empty Test',
    'API Test',
    'Generate from OpenAPI'
  ]);
  
  if (template === 'Generate from OpenAPI') {
    const openApiFile = await vscode.window.showOpenDialog({
      filters: { 'OpenAPI': ['yaml', 'json'] }
    });
    
    // Parse OpenAPI, generate CODOR spec
    const spec = generateFromOpenAPI(openApiFile);
    
    // Save and open
    const uri = vscode.Uri.file('tests/api-tests.yaml');
    await vscode.workspace.fs.writeFile(uri, Buffer.from(spec));
    await vscode.window.showTextDocument(uri);
  }
});
```

### 2. Evidence Viewer (Webview)

**UI:**
```html
┌─────────────────────────────────────────────────────────────┐
│ 📊 Test Evidence: API-TEST                                  │
├─────────────────────────────────────────────────────────────┤
│ Status: ✅ PASSED    Duration: 2.3s                         │
│                                                             │
│ 📋 Steps                                                    │
│ ├─ ✅ STEP.1: Health check (123ms)                          │
│ ├─ ✅ STEP.2: Create user (456ms)                           │
│ └─ ✅ STEP.3: Verify user (789ms)                           │
│                                                             │
│ ⚠️  Technical Debt (2 items)                                │
│ ├─ 🐌 PERFORMANCE: STEP.2 took 456ms (threshold: 200ms)     │
│ │   Recommendation: Add database indexes                    │
│ └─ 🔒 SECURITY: Password sent over HTTP (use HTTPS)         │
│                                                             │
│ 📁 Evidence Files                                           │
│ ├─ execution-report.json                                    │
│ ├─ task-summary.json                                        │
│ └─ STEP.1.json, STEP.2.json, STEP.3.json                   │
│                                                             │
│ [Export HTML] [Export JUnit XML] [View in Browser]         │
└─────────────────────────────────────────────────────────────┘
```

**Implementation:**
```typescript
const panel = vscode.window.createWebviewPanel(
  'codorEvidence',
  `Evidence: ${taskId}`,
  vscode.ViewColumn.Two,
  { enableScripts: true }
);

panel.webview.html = `
  <!DOCTYPE html>
  <html>
  <head>
    <link rel="stylesheet" href="${cssUri}">
  </head>
  <body>
    <h1>${taskResult.title}</h1>
    <div class="status ${taskResult.status}">${taskResult.status}</div>
    <div class="steps">
      ${taskResult.steps.map(step => `
        <div class="step ${step.success ? 'passed' : 'failed'}">
          <span class="icon">${step.success ? '✅' : '❌'}</span>
          <span>${step.action.description}</span>
          <span class="duration">${step.durationMs}ms</span>
        </div>
      `).join('')}
    </div>
    ${taskResult.technicalDebt ? renderDebt(taskResult.technicalDebt) : ''}
  </body>
  </html>
`;
```

### 3. Inline Results (CodeLens)

**What User Sees:**
```json
{
  "actionId": "STEP.1",
  "type": "HTTP_REQUEST",           // ✅ Passed (123ms) | 🔄 Rerun | 📋 Evidence
  "parameters": {
    "url": "http://localhost:3000/health"
  }
}
```

**Implementation:**
```typescript
class CodorCodeLensProvider implements vscode.CodeLensProvider {
  provideCodeLenses(document: vscode.TextDocument) {
    const spec = JSON.parse(document.getText());
    const lenses: vscode.CodeLens[] = [];
    
    for (const [taskId, task] of Object.entries(spec.tasks)) {
      for (const step of task.testExecution.steps) {
        const range = findRangeForAction(step.actionId, document);
        
        // Get last result from cache
        const lastResult = getLastResult(taskId, step.actionId);
        
        lenses.push(
          new vscode.CodeLens(range, {
            title: lastResult 
              ? `${lastResult.success ? '✅' : '❌'} ${lastResult.durationMs}ms`
              : '▶️ Run',
            command: 'codor.runAction',
            arguments: [taskId, step.actionId]
          })
        );
      }
    }
    
    return lenses;
  }
}
```

### 4. Watch Mode

**Status Bar:**
```
CODOR: 👀 Watching | ✅ 3 passed | ⚠️ 2 debt items | Last run: 2s ago
```

**Implementation:**
```typescript
const watcher = vscode.workspace.createFileSystemWatcher(
  '**/*.{json,yaml}'
);

let timeout: NodeJS.Timeout;
watcher.onDidChange((uri) => {
  // Debounce (wait 500ms after last change)
  clearTimeout(timeout);
  timeout = setTimeout(async () => {
    if (isTestSpec(uri)) {
      await runTest(uri);
      updateStatusBar();
    }
  }, 500);
});
```

### 5. AI Task Generation

**Command:** `CODOR: Generate Test with AI`

**Workflow:**
```
Prompt: What do you want to test?
User: Test the user registration API endpoint

AI generates:
tasks:
  USER-REGISTRATION:
    title: "Test user registration API"
    testExecution:
      steps:
        - actionId: STEP.1
          type: HTTP_REQUEST
          description: "Register new user"
          parameters:
            url: http://localhost:3000/api/register
            method: POST
            body:
              email: "test@example.com"
              password: "SecurePass123"
            expectedStatus: 201
        - actionId: STEP.2
          type: HTTP_REQUEST
          description: "Verify user exists"
          parameters:
            url: http://localhost:3000/api/users/test@example.com
            method: GET
            expectedStatus: 200

Accept this test? [Yes] [Edit] [Cancel]
```

**Implementation:**
```typescript
vscode.commands.registerCommand('codor.generateWithAI', async () => {
  const prompt = await vscode.window.showInputBox({
    prompt: 'What do you want to test?',
    placeHolder: 'e.g., Test the login endpoint with invalid credentials'
  });
  
  // Call AI (GitHub Copilot API, OpenAI, etc.)
  const spec = await generateTestWithAI(prompt);
  
  // Show preview
  const previewDoc = await vscode.workspace.openTextDocument({
    content: spec,
    language: 'yaml'
  });
  await vscode.window.showTextDocument(previewDoc);
  
  // Prompt to save
  const action = await vscode.window.showInformationMessage(
    'Accept generated test?',
    'Save', 'Edit', 'Cancel'
  );
  
  if (action === 'Save') {
    // Save to workspace
  }
});
```

---

## Revised Implementation Priorities

### Core Engine (Next Steps)

1. **Add Event Emitter** ⭐⭐⭐
   ```typescript
   engine.on('taskStart', ...)
   engine.on('actionComplete', ...)
   engine.on('taskComplete', ...)
   ```
   **Benefit:** Extension can show real-time progress

2. **YAML Support** ⭐⭐⭐
   ```bash
   npm install js-yaml
   ```
   **Benefit:** Better developer experience in VS Code

3. **Validator Plugins** ⭐⭐
   - RESPONSE_CONTAINS
   - RESPONSE_STATUS
   - JSON_PATH_EQUALS
   **Benefit:** Makes validation criteria useful

4. **JUnit XML Reporter** ⭐⭐
   - For CLI usage
   - For CI/CD integration
   **Benefit:** Enables GitHub Actions workflow

5. **More Executors** ⭐
   - Database executor (SQL queries)
   - GraphQL executor
   **Benefit:** Broader use cases

### VS Code Extension (New Development)

1. **Basic Extension Scaffold** ⭐⭐⭐
   - Test explorer tree view
   - Run test command
   - View evidence command

2. **Evidence Webview** ⭐⭐⭐
   - Render task results
   - Show technical debt
   - Display step details

3. **Task Generation Wizard** ⭐⭐
   - Templates (API, File, Performance)
   - OpenAPI import
   - Save to workspace

4. **Watch Mode** ⭐⭐
   - File watcher
   - Auto-rerun
   - Status bar indicator

5. **AI Integration** ⭐
   - Generate from prompt
   - Use GitHub Copilot
   - Preview and accept

---

## Summary: Clear Separation of Concerns

### Core Engine = **Execution + Analysis**
- No UI
- No user interaction
- No VS Code dependencies
- Pure Node.js/TypeScript
- Can be used via CLI or programmatically
- Emits events for extension to consume

### VS Code Extension = **UX + Developer Workflow**
- All UI/UX features
- Task generation
- Evidence visualization
- Watch mode
- History tracking
- AI integration
- Wraps core engine

### Benefits of This Split:
✅ Core remains simple and focused
✅ Core can be used without VS Code (CLI, CI/CD)
✅ Extension can innovate on UX without changing core
✅ Clear API boundary between layers
✅ Easier to test (core has no UI dependencies)
✅ Easier to maintain (changes in one layer don't affect other)

---

## Next Steps

**Immediate (This Week):**
1. Add event emitter to core engine
2. Add YAML support to core engine
3. Create basic VS Code extension scaffold
4. Implement test explorer tree view

**This gives us:**
- Core engine with streaming events ✅
- Extension can show tests in sidebar ✅
- Foundation for all other extension features ✅

**Does this architectural split make sense?** 🎯
