# CODOR VS Code Extension - Workflow Integration Design
**Date:** September 30, 2025  
**Focus:** Real Development Workflow Integration

---

## Core Question: How Does Testing Fit Into Development?

You've identified the critical gap: **Where do test tasks come from and where do results go?**

Current state:
- ✅ Engine executes manually-written test specs
- ❌ No connection to project management
- ❌ No connection to development workflow
- ❌ No feedback loop back to project

---

## 1. Test Task Collection & Generation

### The Current Problem

**Sprint Planning Generates Development Tasks:**
```yaml
# Sprint backlog (example)
tasks:
  - TASK-001: Implement user registration endpoint
  - TASK-002: Add email validation
  - TASK-003: Create user database schema
```

**But where are the TEST tasks?**
- Who creates them?
- When are they created?
- How do they relate to dev tasks?
- How do we ensure coverage?

### Proposed Solution: Multi-Source Test Task Generation

#### Source 1: AI Analysis of Development Tasks

**Workflow:**
```
1. Developer creates/is assigned development task
   └─> "Implement user registration endpoint"

2. CODOR extension detects new task (via GitHub Issues, Jira, etc.)
   
3. Extension invokes AI agent to analyze task
   
4. AI generates corresponding test tasks
   ├─> TEST-001: Validate registration with valid data
   ├─> TEST-002: Test registration with duplicate email
   ├─> TEST-003: Test registration with invalid email format
   ├─> TEST-004: Test registration with missing required fields
   └─> TEST-005: Test registration response format

5. AI generates CODOR test specifications
   └─> Creates tests/user-registration.yaml

6. Extension prompts developer
   └─> "5 test tasks generated. Review and approve?"
```

**Implementation:**
```typescript
// Extension watches for new development tasks
class TaskWatcher {
  async onNewDevelopmentTask(task: DevelopmentTask) {
    // Invoke AI agent
    const testTasks = await this.aiAgent.generateTestTasks({
      description: task.description,
      acceptanceCriteria: task.acceptanceCriteria,
      technicalSpec: task.technicalDetails
    });
    
    // Generate CODOR specs
    const testSpecs = await this.generateCodorSpecs(testTasks);
    
    // Show in UI for review
    await this.showTestTaskReview(testTasks, testSpecs);
  }
}
```

**AI Prompt Example:**
```
Given this development task:
Title: Implement user registration endpoint
Description: Create POST /api/register endpoint that accepts email and password
Acceptance Criteria:
- Accepts JSON body with email and password
- Returns 201 on success
- Returns 400 if email already exists
- Returns 400 if email format invalid
- Password must be min 8 characters

Generate comprehensive test tasks covering:
1. Happy path scenarios
2. Error scenarios
3. Edge cases
4. Security concerns
5. Performance considerations

For each test task, provide:
- Task ID and title
- Test steps (as CODOR specification)
- Expected outcomes
- Priority (P0-P3)
```

**AI Response:**
```yaml
testTasks:
  - id: TEST-REG-001
    priority: P0
    title: "Register user with valid data"
    codorSpec:
      steps:
        - type: HTTP_REQUEST
          method: POST
          url: /api/register
          body:
            email: "test@example.com"
            password: "SecurePass123"
          expectedStatus: 201
          expectedResponse:
            contains:
              - userId
              - email
  
  - id: TEST-REG-002
    priority: P0
    title: "Reject duplicate email registration"
    codorSpec:
      prerequisites:
        - type: HTTP_REQUEST  # Create user first
          method: POST
          url: /api/register
          body: { email: "duplicate@example.com", password: "Pass123" }
      steps:
        - type: HTTP_REQUEST  # Try to register again
          method: POST
          url: /api/register
          body: { email: "duplicate@example.com", password: "Pass456" }
          expectedStatus: 400
          expectedResponse:
            contains: ["Email already exists"]
```

#### Source 2: Manual Test Creation (Developer-Initiated)

**Workflow:**
```
Developer right-clicks in editor:
> CODOR: Create Test for This Function/API/Component

Extension analyzes code:
- Extracts function signature
- Identifies dependencies
- Determines test type (unit, integration, E2E)

AI generates test specification:
- Scaffolds test structure
- Suggests test cases
- Creates CODOR spec

Developer reviews and customizes
```

**Implementation:**
```typescript
vscode.commands.registerCommand('codor.createTestForSelection', async () => {
  const editor = vscode.window.activeTextEditor;
  const selection = editor.document.getText(editor.selection);
  
  // Analyze selected code
  const analysis = await analyzeCode(selection);
  
  // Generate test with AI
  const testSpec = await aiAgent.generateTestForCode({
    code: selection,
    language: editor.document.languageId,
    analysis: analysis
  });
  
  // Show preview
  const approved = await showTestPreview(testSpec);
  
  if (approved) {
    // Save to workspace
    await saveTestSpec(testSpec);
    // Create tracking issue
    await createTestTask(testSpec);
  }
});
```

#### Source 3: Import from Project Management Systems

**Supported Integrations:**
- GitHub Issues
- Jira
- Azure DevOps
- Linear
- Asana

**Workflow:**
```
Extension Settings:
☑ Sync with GitHub Issues
  Repository: forcegage-pvm/codor
  Label filter: "testing", "qa"
  
Extension syncs test tasks:
1. Fetches issues with label "testing"
2. Parses issue description for test requirements
3. Generates or updates CODOR specs
4. Links spec to issue (via metadata)
```

**Test Spec Metadata:**
```yaml
metadata:
  linkedIssue:
    system: github
    repo: forcegage-pvm/codor
    issueNumber: 42
    url: https://github.com/forcegage-pvm/codor/issues/42
  automatedBy: codor-extension
  generatedAt: "2025-09-30T18:00:00Z"
  lastSyncedAt: "2025-09-30T18:30:00Z"
```

#### Source 4: OpenAPI/Swagger Import (API Testing)

**Workflow:**
```
Developer has openapi.yaml:

Extension command:
> CODOR: Import Tests from OpenAPI

Extension analyzes OpenAPI spec:
- Extracts all endpoints
- Identifies request/response schemas
- Detects authentication requirements

Generates test tasks:
For each endpoint:
  ├─> Happy path test (200 response)
  ├─> Validation error test (400 response)
  ├─> Authentication test (401/403)
  └─> Not found test (404 response)

Creates CODOR specs automatically
```

**Generated Tests Example:**
```yaml
# Auto-generated from openapi.yaml
tasks:
  GET_USERS_200:
    title: "GET /api/users returns 200 with user list"
    metadata:
      generatedFrom: openapi.yaml
      endpoint: GET /api/users
      operation: listUsers
    testExecution:
      steps:
        - type: HTTP_REQUEST
          method: GET
          url: /api/users
          expectedStatus: 200
          expectedSchema: UserListResponse
  
  GET_USERS_401:
    title: "GET /api/users returns 401 without auth"
    testExecution:
      steps:
        - type: HTTP_REQUEST
          method: GET
          url: /api/users
          headers: {}  # No Authorization header
          expectedStatus: 401
```

---

## 2. Test Task Tracking & Feedback Loop

### The Feedback Loop

```
┌─────────────────────────────────────────────────────────────┐
│                   Development Cycle                          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  1. Sprint Planning                  │
        │  - Dev tasks created                 │
        │  - AI generates test tasks           │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │  2. Development                      │
        │  - Code written                      │
        │  - Tests auto-run (watch mode)       │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │  3. Test Execution (CODOR Engine)    │
        │  - Tests run automatically           │
        │  - Results collected                 │
        │  - Analysis performed                │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │  4. Feedback (Extension UI)          │
        │  - Show pass/fail in tree view       │
        │  - Show technical debt inline        │
        │  - Update task status                │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │  5. Sync Back to Project             │
        │  - Update GitHub issue status        │
        │  - Post test results as comment      │
        │  - Create debt tracking issues       │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │  6. Developer Action                 │
        │  - Fix failing tests                 │
        │  - Address technical debt            │
        │  - Iterate                           │
        └──────────────────────────────────────┘
```

### Test Task Status Model

**Each test task has rich status:**

```typescript
interface TestTask {
  // Identity
  id: string;              // "TEST-REG-001"
  title: string;           // "Register user with valid data"
  specPath: string;        // "tests/user-registration.yaml"
  
  // Linkage
  linkedDevTask?: {
    system: 'github' | 'jira' | 'azure-devops';
    taskId: string;
    url: string;
  };
  
  // Execution Status
  status: 'not-run' | 'running' | 'passed' | 'failed' | 'skipped';
  lastRun?: {
    timestamp: Date;
    duration: number;
    result: ExecutionResult;
  };
  
  // Quality Metrics
  failureAnalysis?: FailureAnalysisResult[];
  technicalDebt?: TechnicalDebtItem[];
  
  // Tracking
  runs: {
    timestamp: Date;
    status: 'passed' | 'failed';
    duration: number;
  }[];
  
  // Metadata
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  tags: string[];
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Extension UI for Test Tasks

#### Tree View:
```
📋 CODOR Test Tasks
├── 🎯 Sprint 5 - User Registration
│   ├── ✅ TEST-REG-001: Valid registration (234ms)
│   │   └── 💡 No issues
│   ├── ✅ TEST-REG-002: Duplicate email (123ms)
│   │   └── ⚠️  1 technical debt item
│   │       └── 🐌 Performance: Slow DB query (320ms)
│   ├── ❌ TEST-REG-003: Invalid email format
│   │   └── 🔴 Failure: Validation not working
│   │       ├── Category: LOGIC_ERROR
│   │       ├── Severity: HIGH
│   │       └── 📝 View Details | 🔧 Fix | 🐛 Debug
│   └── ⏳ TEST-REG-004: Password strength (not run)
│
├── 🎯 Sprint 5 - Email Service
│   └── 🔄 Running tests... (2/5 complete)
│
└── 📂 Other Tests
    └── ✅ Health Check Tests (all passing)
```

#### Status Bar:
```
CODOR: ✅ 12 passed | ❌ 2 failed | ⚠️ 3 debt items | 🔄 Watch: ON
```

#### Test Detail Panel (Webview):
```html
┌─────────────────────────────────────────────────────────────┐
│ TEST-REG-003: Reject invalid email format                   │
├─────────────────────────────────────────────────────────────┤
│ Status: ❌ FAILED                                           │
│ Duration: 145ms                                             │
│ Last Run: 2 minutes ago                                     │
│ Runs: 15 total (12 passed, 3 failed) - 80% success rate    │
│                                                             │
│ 🔴 Failure Analysis                                         │
│ Category: LOGIC_ERROR                                       │
│ Severity: HIGH                                              │
│ Confidence: 95%                                             │
│                                                             │
│ Description:                                                │
│ Email validation regex not working correctly. Invalid email │
│ "notanemail" was accepted when it should be rejected.       │
│                                                             │
│ Failed Step:                                                │
│ STEP.1: POST /api/register with invalid email              │
│ Expected: 400 Bad Request                                   │
│ Actual: 201 Created ❌                                      │
│                                                             │
│ Recommendation:                                             │
│ Update email validation in UserController.register()       │
│ Use proper email regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/      │
│                                                             │
│ 🔗 Linked Issue: #42 (GitHub)                              │
│ 👤 Assigned: @developer                                     │
│                                                             │
│ Actions:                                                    │
│ [🔧 Open Code] [🐛 Debug] [💬 Add Comment] [✓ Mark Fixed] │
└─────────────────────────────────────────────────────────────┘
```

### Syncing Back to Project Management

#### GitHub Integration Example:

**When test fails:**
```typescript
async function onTestFailure(testTask: TestTask) {
  if (testTask.linkedDevTask?.system === 'github') {
    // Post comment on linked issue
    await github.issues.createComment({
      owner: 'forcegage-pvm',
      repo: 'codor',
      issue_number: testTask.linkedDevTask.issueNumber,
      body: `
## ❌ Test Failed: ${testTask.title}

**Failure Analysis:**
- Category: ${testTask.failureAnalysis[0].category}
- Severity: ${testTask.failureAnalysis[0].severity}

**Details:**
${testTask.failureAnalysis[0].description}

**Recommendation:**
${testTask.failureAnalysis[0].recommendation}

**Evidence:**
[View full report](${evidenceUrl})

---
*Automated by CODOR Extension*
      `
    });
    
    // Add label
    await github.issues.addLabels({
      issue_number: testTask.linkedDevTask.issueNumber,
      labels: ['test-failing']
    });
  }
}
```

**When test passes (after being failed):**
```typescript
async function onTestRecovered(testTask: TestTask) {
  // Post comment
  await github.issues.createComment({
    body: `✅ Test now passing: ${testTask.title} (${testTask.lastRun.duration}ms)`
  });
  
  // Remove label
  await github.issues.removeLabel({
    name: 'test-failing'
  });
}
```

**When technical debt detected:**
```typescript
async function onTechnicalDebtDetected(testTask: TestTask, debt: TechnicalDebtItem) {
  // Create new issue for debt item
  const issue = await github.issues.create({
    title: `[Tech Debt] ${debt.category}: ${debt.description}`,
    body: `
## Technical Debt Detected

**Test:** ${testTask.title}
**Category:** ${debt.category}
**Severity:** ${debt.severity}

**Description:**
${debt.description}

**Recommendation:**
${debt.recommendation}

**Evidence:**
\`\`\`json
${JSON.stringify(debt.evidence, null, 2)}
\`\`\`

**Related Test:** ${testTask.linkedDevTask?.url}
    `,
    labels: ['technical-debt', `severity-${debt.severity.toLowerCase()}`]
  });
  
  // Link back to original task
  await github.issues.createComment({
    issue_number: testTask.linkedDevTask.issueNumber,
    body: `⚠️ Technical debt detected: #${issue.number}`
  });
}
```

---

## 3. Execution Flow in Extension Context

### The Complete Workflow

```typescript
// Extension activation
export function activate(context: vscode.ExtensionContext) {
  
  // 1. Initialize CODOR engine
  const engine = new TestExecutionEngine();
  
  // 2. Set up test task manager
  const taskManager = new TestTaskManager(engine);
  
  // 3. Register UI providers
  const treeProvider = new TestTaskTreeProvider(taskManager);
  vscode.window.registerTreeDataProvider('codor-tests', treeProvider);
  
  // 4. Set up watchers
  setupFileWatchers(taskManager);
  setupProjectSyncWatcher(taskManager);
  
  // 5. Register commands
  registerCommands(context, engine, taskManager);
}
```

### Test Execution Flow

```typescript
class TestTaskManager {
  private engine: TestExecutionEngine;
  private tasks: Map<string, TestTask> = new Map();
  
  async runTest(taskId: string) {
    const task = this.tasks.get(taskId);
    
    // 1. Update UI - show running
    task.status = 'running';
    this.updateUI(task);
    
    // 2. Execute via core engine
    this.engine.on('taskStart', () => {
      vscode.window.showInformationMessage(`Running: ${task.title}`);
    });
    
    this.engine.on('actionComplete', (action) => {
      // Update progress
      this.updateProgress(task, action);
    });
    
    const results = await this.engine.initialize(task.specPath)
      .then(() => this.engine.execute());
    
    // 3. Process results
    task.lastRun = {
      timestamp: new Date(),
      duration: results.durationMs,
      result: results
    };
    
    task.status = results.summary.failed > 0 ? 'failed' : 'passed';
    task.failureAnalysis = results.tasks[taskId]?.failureAnalysis;
    task.technicalDebt = results.tasks[taskId]?.technicalDebt;
    
    // 4. Update UI
    this.updateUI(task);
    
    // 5. Show results in webview
    this.showResultsPanel(task);
    
    // 6. Sync back to project
    await this.syncToProject(task);
    
    // 7. Handle failures/debt
    if (task.status === 'failed') {
      await this.onTestFailure(task);
    }
    if (task.technicalDebt?.length > 0) {
      await this.onTechnicalDebtDetected(task);
    }
    
    return task;
  }
  
  private async syncToProject(task: TestTask) {
    if (task.linkedDevTask) {
      switch (task.linkedDevTask.system) {
        case 'github':
          await this.syncToGitHub(task);
          break;
        case 'jira':
          await this.syncToJira(task);
          break;
      }
    }
  }
}
```

### Watch Mode Integration

```typescript
class TestWatcher {
  private taskManager: TestTaskManager;
  private watcher: vscode.FileSystemWatcher;
  
  start() {
    // Watch test spec files
    this.watcher = vscode.workspace.createFileSystemWatcher(
      'tests/**/*.{json,yaml}'
    );
    
    this.watcher.onDidChange(async (uri) => {
      // Debounce
      await this.debounce(async () => {
        // Find related test task
        const task = this.taskManager.findTaskBySpec(uri.fsPath);
        
        // Re-run test
        await this.taskManager.runTest(task.id);
      });
    });
    
    // Watch source code files
    const codeWatcher = vscode.workspace.createFileSystemWatcher(
      'src/**/*.{ts,js,py}'
    );
    
    codeWatcher.onDidSave(async (uri) => {
      // Find tests affected by this code change
      const affectedTests = await this.findAffectedTests(uri.fsPath);
      
      // Run affected tests
      for (const test of affectedTests) {
        await this.taskManager.runTest(test.id);
      }
    });
  }
  
  private async findAffectedTests(filePath: string): Promise<TestTask[]> {
    // AI-powered or static analysis to determine which tests
    // are affected by changes to this file
    
    // Example: If src/user-controller.ts changes,
    // run tests/user-registration.yaml
    
    return this.taskManager.tasks.filter(task => {
      // Match by convention or explicit linkage
      return task.metadata?.relatedFiles?.includes(filePath);
    });
  }
}
```

---

## 4. Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   VS Code Extension                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │  UI Layer                                          │    │
│  │  - Test Explorer Tree                              │    │
│  │  - Evidence Webview                                │    │
│  │  - CodeLens (inline results)                       │    │
│  │  - Status Bar                                      │    │
│  └──────────────────┬─────────────────────────────────┘    │
│                     │                                       │
│  ┌──────────────────▼──────────────────────────────────┐   │
│  │  TestTaskManager                                     │   │
│  │  - Track test tasks                                  │   │
│  │  - Manage execution                                  │   │
│  │  - Store results/history                            │   │
│  │  - Sync with project systems                        │   │
│  └──────────────────┬──────────────────────────────────┘   │
│                     │                                       │
│  ┌──────────────────▼──────────────────────────────────┐   │
│  │  Task Generation Layer                               │   │
│  │  - AI agent integration                              │   │
│  │  - OpenAPI import                                    │   │
│  │  - Template system                                   │   │
│  │  - Code analysis                                     │   │
│  └──────────────────┬──────────────────────────────────┘   │
│                     │                                       │
│  ┌──────────────────▼──────────────────────────────────┐   │
│  │  Project Integration Layer                           │   │
│  │  - GitHub connector                                  │   │
│  │  - Jira connector                                    │   │
│  │  - Azure DevOps connector                           │   │
│  └──────────────────┬──────────────────────────────────┘   │
└────────────────────┼───────────────────────────────────────┘
                     │
                     │ API: execute(spec) → results
                     │      events: taskStart, actionComplete, etc.
                     │
┌────────────────────▼───────────────────────────────────────┐
│             CODOR Core Engine                               │
│             (Headless, No UI)                               │
├─────────────────────────────────────────────────────────────┤
│  - Load specifications                                      │
│  - Manage plugins                                           │
│  - Execute tests                                            │
│  - Analyze results                                          │
│  - Collect evidence                                         │
│  - Emit events                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary: Key Design Decisions

### 1. Test Task Sources
✅ **AI-generated from dev tasks** - Primary source
✅ **Manual creation** - Developer-initiated
✅ **OpenAPI import** - For API testing
✅ **Project management sync** - GitHub/Jira integration

### 2. Feedback Loop
✅ **Real-time UI updates** - Tree view, status bar, CodeLens
✅ **Detailed evidence** - Webview panels
✅ **Project sync** - Post results back to GitHub/Jira
✅ **Debt tracking** - Create issues for technical debt

### 3. Execution Flow
✅ **Core engine unchanged** - Still does execution/analysis
✅ **Extension orchestrates** - Manages lifecycle
✅ **Event-driven updates** - Real-time feedback
✅ **Watch mode** - Auto-rerun on changes

---

## Next Steps: What to Build First?

**Phase 1: Foundation (Week 1)**
1. Add EventEmitter to core engine
2. Create basic extension scaffold
3. Implement test task manager (in-memory only)
4. Build test explorer tree view
5. Add "Run Test" command

**Phase 2: Test Generation (Week 2)**
6. Implement AI agent integration
7. Create test generation wizard
8. Add OpenAPI import
9. Build template system

**Phase 3: Feedback Loop (Week 3)**
10. Implement evidence webview
11. Add GitHub integration
12. Build watch mode
13. Add CodeLens for inline results

**Phase 4: Advanced (Week 4)**
14. Add Jira integration
15. Implement debt tracking
16. Add test history/trends
17. Polish UX

---

## Open Questions for Discussion

1. **AI Agent Choice:**
   - Use GitHub Copilot API?
   - Use OpenAI directly?
   - Use local model (Ollama)?
   - Build custom fine-tuned model?

2. **Task Storage:**
   - Store test tasks in workspace settings (.vscode/codor.json)?
   - Store in separate database (SQLite)?
   - Store only in project management system?

3. **Test Spec Format:**
   - Continue with JSON/YAML files in repo?
   - Or store in database with UI for editing?
   - Or hybrid (generated specs → files, manual → database)?

4. **Sync Strategy:**
   - Real-time sync (every test run updates GitHub)?
   - Manual sync (developer triggers)?
   - Batched sync (sync every N minutes)?

**What's your preference on these design choices?** 🤔
