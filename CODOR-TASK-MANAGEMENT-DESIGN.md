# CODOR Task Management & AI Agent Control
**Date:** September 30, 2025  
**Problem:** AI agents don't follow tasks.md - they fabricate, drift, and fudge checkboxes

---

## The Core Problem

### What We Observed

**AI Agent Behaviors (All Bad):**
1. ✅ Creates internal TODO lists (invisible to developer)
2. ✅ Starts with tasks.md, then veers off into self-determined work
3. ✅ Sometimes updates tasks.md, sometimes doesn't
4. ✅ Updates in batches of 10, then can't remember status → fudges it
5. ✅ Only does basic compile/runtime testing (no real verification)
6. ✅ Checkbox system is "trust-based" - prone to fabrication

**The Trust Problem:**
```markdown
# tasks.md shows:
- [x] T022 Customer model with validation

# Reality:
- Customer model exists ✅
- Validation exists ❌ (AI forgot)
- Tests exist ❌ (AI skipped)
- Requirements met ❌ (AI fabricated)
```

**Why This Happens:**
- tasks.md is just a markdown file (no enforcement)
- AI agents work from internal state/memory
- No mechanism to force compliance
- No verification that work matches requirements
- Checkboxes are manually updated (easy to lie)

### What Works: Built-in TODO Lists

**GitHub Copilot (and you) follow TODO lists because:**
- ✅ **Visible** - Always rendered in UI
- ✅ **Enforced** - Can't skip marking complete
- ✅ **Structured** - Formal schema (id, title, description, status)
- ✅ **Sequential** - One task in-progress at a time
- ✅ **Validated** - System checks before marking complete

**Example (Your TODO System):**
```typescript
interface Todo {
  id: number;
  title: string;          // "Add EventEmitter to core engine"
  description: string;    // "Implement EventEmitter class extending Node.js EventEmitter..."
  status: 'not-started' | 'in-progress' | 'completed';
}

Rules:
- MUST mark as in-progress before starting work
- MUST mark as completed immediately after finishing
- CANNOT have multiple in-progress items
- CANNOT skip marking completed
```

---

## The Solution: CODOR as Task Manager

### Core Principle
**CODOR Extension becomes the authoritative task manager that AI agents MUST use**

Instead of:
```
Spec Kit → tasks.md → AI reads it (maybe) → AI does work (maybe) → AI updates checkboxes (maybe)
```

Do this:
```
Spec Kit → tasks.md → CODOR imports → CODOR manages tasks → AI gets next task from CODOR → 
AI completes work → CODOR verifies → CODOR marks complete → AI gets next task
```

### Architecture: CODOR Task Manager

```
┌─────────────────────────────────────────────────────────────┐
│              CODOR Extension (Task Manager)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────┐     │
│  │  Task Database (SQLite)                           │     │
│  │  - Authoritative task list                        │     │
│  │  - Task status (pending/in-progress/verified)     │     │
│  │  - Verification results                           │     │
│  │  - AI attribution                                 │     │
│  └──────────────────┬───────────────────────────────┘     │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────┐     │
│  │  Task API (AI Agent Interface)                    │     │
│  │  /codor/next-task  → Get next task               │     │
│  │  /codor/complete   → Submit completed work       │     │
│  │  /codor/status     → Check task status           │     │
│  └──────────────────┬───────────────────────────────┘     │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────┐     │
│  │  Verification Engine                              │     │
│  │  - Run CODOR tests                                │     │
│  │  - Check requirements                             │     │
│  │  - Validate completion                            │     │
│  └──────────────────┬───────────────────────────────┘     │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────┐     │
│  │  Task UI (Tree View)                              │     │
│  │  - Show current task                              │     │
│  │  - Show progress                                  │     │
│  │  - Show verification status                       │     │
│  └──────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                     ▲                 │
                     │                 │
       /codor/next-task     /codor/complete
                     │                 │
┌────────────────────┴─────────────────▼─────────────────────┐
│         GitHub Copilot Workspace (AI Agent)                 │
│         - MUST call /codor/next-task to get work           │
│         - MUST call /codor/complete when done              │
│         - CANNOT work on tasks not provided by CODOR       │
└─────────────────────────────────────────────────────────────┘
```

---

## How It Works: Enforced Task Workflow

### 1. Spec Kit Import

**CODOR reads tasks.md and imports to database:**

```typescript
class TaskImporter {
  async importFromSpecKit(tasksFile: string): Promise<void> {
    const tasks = await this.parseTasksMarkdown(tasksFile);
    
    for (const task of tasks) {
      await db.tasks.create({
        id: task.id,                    // "T022"
        featureId: task.featureId,      // "001-core-features"
        title: task.title,
        description: task.description,
        filePath: task.filePath,
        phase: task.phase,              // "3.3: Core Implementation"
        dependencies: task.dependencies, // ["T021"]
        parallel: task.parallel,        // [P] marker
        status: 'pending',
        requirements: task.requirements, // ["FR-001", "FR-002"]
        acceptanceCriteria: task.acceptanceCriteria,
        testSpec: null,                 // Generated later
        verification: null
      });
    }
    
    console.log(`✅ Imported ${tasks.length} tasks from ${tasksFile}`);
  }
}
```

**Database Schema:**

```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,              -- "T022"
  feature_id TEXT NOT NULL,         -- "001-core-features"
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT,                   -- "packages/web/src/models/Customer.ts"
  phase TEXT,                       -- "3.3: Core Implementation"
  dependencies TEXT,                -- JSON array: ["T021"]
  parallel BOOLEAN,                 -- [P] marker
  status TEXT NOT NULL,             -- pending | in-progress | completed | verified | failed
  requirements TEXT,                -- JSON array: ["FR-001", "FR-002"]
  acceptance_criteria TEXT,         -- JSON array
  test_spec TEXT,                   -- Path to generated CODOR test
  verification JSON,                -- Test results
  ai_session TEXT,                  -- Which AI session is working on it
  started_at DATETIME,
  completed_at DATETIME,
  verified_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_status ON tasks(status);
CREATE INDEX idx_feature ON tasks(feature_id);
```

### 2. AI Agent Gets Next Task

**AI agent calls CODOR API to get work:**

```typescript
// CODOR Extension provides API endpoint
app.get('/codor/next-task', async (req, res) => {
  // Get AI session identifier
  const session = req.headers['x-copilot-session'];
  
  // Find next eligible task
  const task = await db.tasks.findOne({
    status: 'pending',
    // All dependencies completed
    dependencies: {
      $not: {
        $in: await db.tasks.find({ status: { $ne: 'verified' } }).select('id')
      }
    }
  }).sort({ id: 'asc' });
  
  if (!task) {
    return res.json({ 
      status: 'complete',
      message: 'All tasks completed!' 
    });
  }
  
  // Mark task as in-progress
  task.status = 'in-progress';
  task.ai_session = session;
  task.started_at = new Date();
  await task.save();
  
  // Return task to AI
  res.json({
    status: 'task',
    task: {
      id: task.id,
      title: task.title,
      description: task.description,
      filePath: task.file_path,
      requirements: task.requirements,
      acceptanceCriteria: task.acceptance_criteria,
      instructions: `
        Implement this task according to the requirements.
        
        When complete, call:
        POST /codor/complete
        {
          "taskId": "${task.id}",
          "commit": "<commit-hash>",
          "filesChanged": ["<file1>", "<file2>"]
        }
      `
    }
  });
});
```

**AI Agent Prompt (Auto-injected by CODOR):**

```
You are implementing tasks from the CODOR task manager.

Current Task:
{
  "id": "T022",
  "title": "Customer model with validation",
  "filePath": "packages/web/src/models/Customer.ts",
  "requirements": ["FR-001", "FR-002", "FR-003", "FR-004", "FR-005", "FR-006"],
  "acceptanceCriteria": [
    "System MUST allow creation and management of two customer types: retail and consumer",
    "System MUST support parent company structures with multiple branches",
    "System MUST store customer payment terms and VAT numbers"
  ]
}

Instructions:
1. Implement the task according to ALL requirements
2. Ensure ALL acceptance criteria are met
3. Write tests that verify the requirements
4. When complete, call: POST /codor/complete with taskId and commit hash

DO NOT:
- Work on tasks not assigned by CODOR
- Mark tasks complete without verification
- Create internal TODO lists
- Skip requirements
```

### 3. AI Agent Completes Work

**AI submits completed work:**

```typescript
app.post('/codor/complete', async (req, res) => {
  const { taskId, commit, filesChanged } = req.body;
  
  const task = await db.tasks.findOne({ id: taskId });
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  if (task.status !== 'in-progress') {
    return res.status(400).json({ error: 'Task not in progress' });
  }
  
  // Mark task as completed (pending verification)
  task.status = 'completed';
  task.completed_at = new Date();
  task.commit = commit;
  task.files_changed = filesChanged;
  await task.save();
  
  // Trigger verification
  const verification = await verifyTask(task);
  
  if (verification.success) {
    task.status = 'verified';
    task.verified_at = new Date();
    task.verification = verification.results;
    await task.save();
    
    res.json({
      status: 'verified',
      message: '✅ Task verified successfully!',
      nextTask: await getNextTask()
    });
  } else {
    task.status = 'failed';
    task.verification = verification.results;
    await task.save();
    
    res.json({
      status: 'failed',
      message: '❌ Task verification failed',
      failures: verification.failures,
      instructions: 'Fix the issues and resubmit'
    });
  }
});
```

### 4. CODOR Verifies Task

**Automatic verification before accepting completion:**

```typescript
async function verifyTask(task: Task): Promise<VerificationResult> {
  // Generate or load test spec
  const testSpec = await generateTestSpec(task);
  
  // Run CODOR engine
  const results = await codorEngine.execute(testSpec);
  
  // Check all requirements met
  const requirementsCovered = await checkRequirements(task, results);
  
  // Check acceptance criteria met
  const criteriasMet = await checkAcceptanceCriteria(task, results);
  
  // Analyze failures
  const failures = results.tasks.flatMap(t => t.failureAnalysis || []);
  const debt = results.tasks.flatMap(t => t.technicalDebt || []);
  
  return {
    success: results.summary.failed === 0 && requirementsCovered && criteriasMet,
    results: {
      testsPassed: results.summary.passed,
      testsFailed: results.summary.failed,
      requirementsCovered,
      criteriasMet,
      failures,
      technicalDebt: debt,
      duration: results.durationMs
    },
    failures: failures.map(f => ({
      requirement: f.relatedRequirement,
      description: f.description,
      recommendation: f.recommendation
    }))
  };
}
```

### 5. Feedback Loop

**If verification fails, AI CANNOT proceed:**

```typescript
// AI tries to get next task
GET /codor/next-task

// CODOR responds:
{
  "status": "blocked",
  "message": "Previous task T022 failed verification",
  "task": {
    "id": "T022",
    "title": "Customer model with validation",
    "status": "failed"
  },
  "failures": [
    {
      "requirement": "FR-002",
      "description": "Branch relationship validation not implemented",
      "recommendation": "Add validation in Customer model for branch relationships"
    }
  ],
  "instructions": "Fix the failures in T022 before proceeding to next task"
}
```

**AI MUST fix before continuing:**

```
AI sees failure → Fixes code → Calls /codor/complete again → 
Verification runs → ✅ Passes → Gets next task
```

---

## Extension UI: Task Management View

### Tree View

```
📋 CODOR Tasks: 001-core-features
├── 📊 Progress: 22/52 verified (42%)
│   ├── ✅ Verified: 22
│   ├── 🔄 In Progress: 1 (T023)
│   ├── ⏳ Pending: 25
│   ├── ❌ Failed: 4
│   └── 🎯 Current: T023 - Branch model
│
├── 📦 Phase 3.1: Setup (5/5 ✅)
│   ├── ✅ T001: Create Next.js project (234ms)
│   ├── ✅ T002: Initialize API structure (123ms)
│   ├── ✅ T003: Initialize components (145ms)
│   ├── ✅ T004: Configure linting (89ms)
│   └── ✅ T005: Tailwind CSS setup (67ms)
│
├── 🧪 Phase 3.2: Tests First (17/17 ✅)
│   └── All contract tests verified
│
├── 🏗️ Phase 3.3: Core Implementation (IN PROGRESS)
│   ├── ✅ T022: Customer model (verified 2m ago)
│   │   ├── ✅ All requirements met
│   │   ├── ✅ All acceptance criteria passed
│   │   └── ⚠️  1 debt item (slow validation)
│   │
│   ├── 🔄 T023: Branch model (in progress)
│   │   ├── 👤 AI Session: copilot-workspace-2025-09-30
│   │   ├── ⏱️  Started: 5 minutes ago
│   │   └── 📝 Working on: packages/web/src/models/Branch.ts
│   │
│   ├── ⏳ T024: BillTo model (pending)
│   │   └── 🔗 Depends on: T023
│   │
│   └── ❌ T027: Quote model (FAILED - needs fix)
│       ├── 🔴 2 requirements not met
│       ├── 📝 [View Failures](codor://evidence/T027)
│       └── 🚫 BLOCKING: Fix before proceeding
│
└── 🎯 Next Task
    └── T024: BillTo model (available after T023)
```

### Status Bar

```
CODOR: T023 in progress | 22/52 ✅ | 4 ❌ blocking | Next: T024
```

### Commands

```
> CODOR: Get Next Task (AI)
> CODOR: Complete Current Task (AI)
> CODOR: Show Task Details
> CODOR: Re-verify Failed Task
> CODOR: Import Tasks from Spec Kit
> CODOR: Export Task Status
```

---

## AI Agent Integration Methods

### Method 1: API Endpoints (Preferred)

**CODOR Extension exposes REST API:**

```typescript
// Extension starts HTTP server
const server = express();

server.get('/codor/next-task', handleNextTask);
server.post('/codor/complete', handleCompleteTask);
server.get('/codor/status', handleStatus);

server.listen(3141, () => {
  console.log('CODOR Task API running on http://localhost:3141');
});
```

**AI Agent (Copilot Workspace) configured to use API:**

```json
// .copilot/config.json
{
  "taskManager": {
    "enabled": true,
    "provider": "codor",
    "apiUrl": "http://localhost:3141/codor",
    "enforceTaskOrder": true,
    "requireVerification": true
  }
}
```

**AI Workflow:**

```
1. Copilot starts session
2. Calls GET http://localhost:3141/codor/next-task
3. Receives task T022
4. Implements task
5. Calls POST http://localhost:3141/codor/complete
6. CODOR verifies
7. If success → Copilot gets T023
8. If failure → Copilot must fix T022
```

### Method 2: Prompt Injection (Fallback)

**If Copilot doesn't support task API, inject prompts:**

```typescript
// CODOR watches for Copilot activation
vscode.workspace.onDidOpenTextDocument(async (doc) => {
  if (isCopilotActive()) {
    const nextTask = await getNextTask();
    
    // Inject prompt into Copilot
    await injectCopilotPrompt(`
      🤖 CODOR Task Manager Active
      
      Current Task: ${nextTask.id} - ${nextTask.title}
      File: ${nextTask.filePath}
      
      Requirements:
      ${nextTask.requirements.map(r => `- ${r}`).join('\n')}
      
      IMPORTANT:
      1. Only work on this task
      2. Meet ALL requirements
      3. When complete, type: @codor complete ${nextTask.id}
      4. Do NOT create internal TODO lists
      5. Do NOT work on other tasks
    `);
  }
});

// Listen for @codor complete command
vscode.commands.registerCommand('codor.completeTask', async (taskId) => {
  await handleTaskCompletion(taskId);
});
```

### Method 3: File Watcher (Most Reliable)

**CODOR monitors file system:**

```typescript
class TaskMonitor {
  private currentTask: Task | null = null;
  
  async startMonitoring() {
    // Set current task
    this.currentTask = await getNextTask();
    
    // Show in UI
    showTaskNotification(this.currentTask);
    
    // Watch file changes
    const watcher = vscode.workspace.createFileSystemWatcher(
      this.currentTask.filePath
    );
    
    watcher.onDidSave(async (uri) => {
      // File saved - check if task complete
      const isComplete = await checkIfTaskComplete(this.currentTask);
      
      if (isComplete) {
        // Verify task
        const verification = await verifyTask(this.currentTask);
        
        if (verification.success) {
          // Mark verified, move to next
          await markTaskVerified(this.currentTask);
          this.currentTask = await getNextTask();
          showTaskNotification(this.currentTask);
        } else {
          // Show failures
          showFailureNotification(verification.failures);
        }
      }
    });
  }
}
```

---

## Forcing Compliance: The Enforcement Mechanisms

### 1. **Single Task Focus**
- Only ONE task in-progress at a time
- AI CANNOT get next task until current verified
- Status bar always shows current task

### 2. **Dependency Blocking**
- Tasks with dependencies cannot start
- T024 blocked until T023 verified
- Prevents jumping ahead

### 3. **Verification Gates**
- Task marked "completed" ≠ verified
- Verification MUST pass to proceed
- Failed tasks block progress

### 4. **Visible Progress**
- Tree view always visible
- Current task highlighted
- Cannot hide from task manager

### 5. **Attribution Tracking**
- Every task tracks AI session
- Commit hashes recorded
- Evidence links to specific AI work

### 6. **No Escape Hatches**
- Cannot manually mark verified
- Cannot skip verification
- Cannot work on unassigned tasks (file watcher detects)

---

## Workflow Comparison

### Old Way (Broken)

```
1. AI reads tasks.md
2. AI creates internal TODO: "Setup, Models, API, Tests"
3. AI works from internal list
4. AI forgets about tasks.md
5. AI finishes work
6. AI updates tasks.md (guesses which tasks done)
7. Developer: "Is T022 actually done? 🤷"
```

**Result:** ❌ Trust-based, prone to fabrication

### New Way (Enforced)

```
1. CODOR: "T022: Customer model - implement this"
2. AI: "Working on T022..."
3. AI: "Done! @codor complete T022"
4. CODOR: *runs verification tests*
5. CODOR: "❌ Branch validation missing (FR-002)"
6. AI: "Fixing..."
7. AI: "@codor complete T022"
8. CODOR: *verifies again*
9. CODOR: "✅ Verified! Next: T023"
10. AI: "Working on T023..."
```

**Result:** ✅ Enforced, verified, cannot fabricate

---

## Implementation Roadmap

### Phase 1: Core Task Manager (Week 1)

1. **Task Database**
   - SQLite schema
   - Import from tasks.md
   - CRUD operations
   - Status management

2. **Task API**
   - Express server in extension
   - GET /next-task endpoint
   - POST /complete endpoint
   - GET /status endpoint

3. **Basic Verification**
   - Run CODOR tests on completion
   - Check pass/fail
   - Block if failed

4. **Extension UI**
   - Tree view showing tasks
   - Current task indicator
   - Status bar integration

### Phase 2: AI Integration (Week 2)

5. **Copilot Integration**
   - Detect Copilot sessions
   - Inject task prompts
   - Listen for completion commands
   - Track attribution

6. **File Watching**
   - Monitor task file changes
   - Auto-verify on save
   - Detect out-of-order work

7. **Enforcement**
   - Block next-task if current failed
   - Prevent parallel work
   - Validate dependencies

### Phase 3: Advanced Features (Week 3)

8. **Intelligent Verification**
   - Requirement coverage checking
   - Acceptance criteria validation
   - Technical debt detection

9. **Evidence System**
   - Per-task evidence
   - Failure reports
   - Quality metrics

10. **Developer Tools**
    - Manual verification override
    - Task replay
    - Evidence viewer

### Phase 4: Polish (Week 4)

11. **UX Improvements**
    - Rich task notifications
    - Progress charts
    - Sprint dashboards

12. **Export & Reporting**
    - Update tasks.md with status
    - Generate completion reports
    - Export for stakeholders

---

## Key Design Decisions

### 1. Task Storage
**Decision:** SQLite database (not just tasks.md)  
**Why:**
- Structured queries
- Transaction support
- Rich metadata
- Fast lookups
- Not editable by AI (enforcement)

### 2. Verification Requirement
**Decision:** Tasks MUST be verified before next task  
**Why:**
- Prevents drift
- Catches fabrications
- Ensures quality
- Builds evidence trail

### 3. Single Task Focus
**Decision:** Only ONE task in-progress  
**Why:**
- Prevents multitasking
- Forces completion
- Easier to track
- Matches TODO workflow

### 4. No Manual Checkboxes
**Decision:** AI cannot manually mark tasks complete  
**Why:**
- Prevents fabrication
- Forces verification
- Builds trust
- Automatic updates

---

## Questions for You

1. **API vs File Watching:**
   - Should we build REST API (requires Copilot integration)?
   - Or rely on file watching (works with any AI)?
   - Or both?

2. **Strict vs Lenient:**
   - Should failed verification BLOCK next task (strict)?
   - Or just warn and allow proceed (lenient)?

3. **Manual Override:**
   - Should developer be able to manually mark verified?
   - Or strictly require verification?

4. **Task Database:**
   - SQLite in .codor/ folder?
   - Or use workspace state (VS Code storage)?
   - Commit to git or gitignore?

5. **Starting Point:**
   - Build task manager first?
   - Or enhance core engine first (events, YAML)?

**This solves the fundamental problem: AI agents will follow the task list because they CANNOT proceed without verification.** ✅

Does this match your vision? What are your answers to the 5 questions above?
