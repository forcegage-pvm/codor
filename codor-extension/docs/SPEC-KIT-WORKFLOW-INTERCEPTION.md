# Spec Kit Workflow Interception Design

**Date:** September 30, 2025  
**Status:** APPROVED ✅  
**Approach:** Intercept `/tasks` command, control task distribution

---

## The Revelation 🤯

Instead of trying to monitor or provide APIs AFTER tasks are created, we **intercept the task creation itself**.

### User's Proposal

> 1. When the developer runs the `/tasks.prompt.md` command that generates `tasks.md`, we create these tasks directly into our internal memory/db/task list
> 2. The agent would then have to get the next task from us
> 3. The developer can see the full list of tasks, but the agent cannot - it is fed one task at a time after the previous one is complete and verified
> 4. The only way for the agent to get the next task is to request it, and at that point we will validate the previous task and depending on outcome and configuration, hand him the next task

**This is genius because:**
- ✅ No API needed - we control the source
- ✅ No file watching needed - we ARE the task provider
- ✅ Perfect enforcement - agent literally cannot see other tasks
- ✅ Clean integration - hooks into existing Spec Kit workflow
- ✅ Simple implementation - intercept one command

---

## Current Spec Kit Workflow

```
Developer: /specify
  ↓
GitHub Copilot generates spec.md
  ↓
Developer: /plan
  ↓
GitHub Copilot generates plan.md
  ↓
Developer: /tasks             ← WE INTERCEPT HERE
  ↓
GitHub Copilot generates tasks.md
  ↓
Agent reads ALL tasks from tasks.md    ← PROBLEM: Can see everything
  ↓
Agent works on tasks (order unknown)
  ↓
Agent updates checkboxes (unreliable)
```

---

## New CODOR-Controlled Workflow

```
Developer: /specify
  ↓
GitHub Copilot generates spec.md
  ↓
Developer: /plan
  ↓
GitHub Copilot generates plan.md
  ↓
Developer: /tasks
  ↓
CODOR Extension intercepts ⚡
  ↓
┌─────────────────────────────────────────────────────┐
│ CODOR parses tasks.prompt.md                        │
│ - Extracts all tasks                                │
│ - Stores in SQLite database                         │
│ - Links to spec.md requirements                     │
│ - Builds dependency graph                           │
│ - Sets all status = 'pending'                       │
└─────────────────────────────────────────────────────┘
  ↓
CODOR generates LIMITED tasks.md for agent
  ↓
┌─────────────────────────────────────────────────────┐
│ tasks.md (Agent's View) - ONLY NEXT TASK           │
│                                                     │
│ # Current Task                                      │
│                                                     │
│ - [ ] T001 Initialize database connection          │
│       File: packages/web/src/db/connection.ts      │
│       Requirements: FR-001, FR-002                  │
│                                                     │
│ ## When Complete                                    │
│ Request next task from CODOR                        │
└─────────────────────────────────────────────────────┘
  ↓
Agent implements T001
  ↓
Agent: "I've completed T001, ready for next task"
  ↓
┌─────────────────────────────────────────────────────┐
│ CODOR Verification Gate                             │
│                                                     │
│ 1. Run tests for T001                               │
│ 2. Check requirements coverage                      │
│ 3. Validate file changes                            │
│ 4. Decision:                                        │
│    ✅ Success → Provide T002                        │
│    ❌ Failure → Require fixes                       │
└─────────────────────────────────────────────────────┘
  ↓
CODOR updates tasks.md with NEXT task only
  ↓
Agent implements T002
  ↓
(Repeat until all tasks verified)
```

---

## Architecture

### Component 1: Task Interception

```typescript
// extension/src/commands/interceptTasks.ts

export async function interceptTasksCommand(context: vscode.ExtensionContext) {
  // Register command that runs INSTEAD of default /tasks
  context.subscriptions.push(
    vscode.commands.registerCommand('codor.generateTasks', async () => {
      
      // 1. Let Copilot generate tasks.prompt.md (or we generate it)
      const tasksPrompt = await vscode.workspace.findFiles('**/tasks.prompt.md');
      
      if (!tasksPrompt.length) {
        vscode.window.showErrorMessage('No tasks.prompt.md found. Run /tasks first.');
        return;
      }
      
      // 2. Parse tasks from prompt
      const tasks = await parseTasksPrompt(tasksPrompt[0]);
      
      // 3. Store in database
      const taskDb = TaskDatabase.getInstance();
      await taskDb.importTasks(tasks);
      
      // 4. Generate LIMITED tasks.md (only first task)
      await generateLimitedTasksFile();
      
      // 5. Show UI
      vscode.window.showInformationMessage(
        `✅ CODOR loaded ${tasks.length} tasks. Agent can see task 1 only.`
      );
      
      // Refresh tree view
      taskTreeProvider.refresh();
    })
  );
}
```

### Component 2: Limited Task File Generation

```typescript
// extension/src/generators/limited-tasks.ts

export async function generateLimitedTasksFile() {
  const taskDb = TaskDatabase.getInstance();
  
  // Get current in-progress or next pending task
  const currentTask = await taskDb.getCurrentTask();
  
  if (!currentTask) {
    // All done!
    const content = `# All Tasks Complete ✅\n\nGreat work! All tasks have been verified.`;
    await fs.writeFile('specs/XXX-feature/tasks.md', content);
    return;
  }
  
  // Generate tasks.md with ONLY current task
  const content = `# Current Task

## ${currentTask.id}: ${currentTask.title}

**File:** \`${currentTask.filePath}\`  
**Requirements:** ${currentTask.requirements.join(', ')}

### Acceptance Criteria

${currentTask.acceptanceCriteria.map(ac => `- ${ac}`).join('\n')}

### Task Description

${currentTask.description}

---

## When Complete

When you have implemented this task:

1. Ensure all tests pass
2. Commit your changes
3. Request next task from CODOR:
   - In VS Code: Click "Request Next Task" in CODOR view
   - Via chat: Say "CODOR next task"

**Note:** You can only see one task at a time. This ensures focus and verification.

---

## Progress

- Tasks completed: ${await taskDb.getCompletedCount()}
- Tasks remaining: ${await taskDb.getRemainingCount()}
- Current task: ${currentTask.id}
`;

  await fs.writeFile(currentTask.specPath + '/tasks.md', content);
}
```

### Component 3: Next Task Request

```typescript
// extension/src/commands/nextTask.ts

export async function requestNextTask() {
  const taskDb = TaskDatabase.getInstance();
  const currentTask = await taskDb.getCurrentTask();
  
  if (!currentTask) {
    vscode.window.showInformationMessage('No task in progress.');
    return;
  }
  
  // Verify current task
  vscode.window.showInformationMessage(`Verifying ${currentTask.id}...`);
  
  const verifier = new TaskVerifier();
  const result = await verifier.verify(currentTask);
  
  if (!result.success) {
    // Verification failed
    vscode.window.showErrorMessage(
      `❌ ${currentTask.id} verification failed:\n${result.failures.join('\n')}`
    );
    
    // Show failures in output panel
    const output = vscode.window.createOutputChannel('CODOR Verification');
    output.appendLine(`Verification failed for ${currentTask.id}:`);
    output.appendLine(JSON.stringify(result, null, 2));
    output.show();
    
    // Update task status
    await taskDb.markFailed(currentTask.id, result);
    
    // Ask user what to do
    const action = await vscode.window.showErrorMessage(
      `Task ${currentTask.id} failed verification. What would you like to do?`,
      'Fix Issues',
      'Override (Developer Only)',
      'View Details'
    );
    
    if (action === 'Override (Developer Only)') {
      // Developer manual override
      const confirm = await vscode.window.showWarningMessage(
        'Are you sure you want to override verification? This should only be used when tests are incorrect.',
        'Yes, Override',
        'Cancel'
      );
      
      if (confirm === 'Yes, Override') {
        await taskDb.markVerified(currentTask.id, { 
          ...result, 
          manualOverride: true,
          overrideReason: 'Developer override'
        });
        await provideNextTask();
      }
    }
    
    return;
  }
  
  // Verification succeeded!
  await taskDb.markVerified(currentTask.id, result);
  vscode.window.showInformationMessage(`✅ ${currentTask.id} verified!`);
  
  // Provide next task
  await provideNextTask();
}

async function provideNextTask() {
  const taskDb = TaskDatabase.getInstance();
  const nextTask = await taskDb.getNextTask();
  
  if (!nextTask) {
    vscode.window.showInformationMessage('🎉 All tasks complete!');
    await generateLimitedTasksFile(); // Shows completion message
    return;
  }
  
  // Mark next task as in-progress
  await taskDb.markInProgress(nextTask.id);
  
  // Update tasks.md with next task
  await generateLimitedTasksFile();
  
  // Show notification
  vscode.window.showInformationMessage(
    `📋 Next task: ${nextTask.id} - ${nextTask.title}`
  );
  
  // Open file if it exists
  if (await fs.pathExists(nextTask.filePath)) {
    const doc = await vscode.workspace.openTextDocument(nextTask.filePath);
    await vscode.window.showTextDocument(doc);
  }
}
```

### Component 4: Developer View (Full Task List)

```typescript
// extension/src/ui/task-tree-provider.ts

export class TaskTreeProvider implements vscode.TreeDataProvider<TaskItem> {
  
  async getChildren(element?: TaskItem): Promise<TaskItem[]> {
    const taskDb = TaskDatabase.getInstance();
    
    if (!element) {
      // Root: Show features
      const features = await taskDb.getFeatures();
      return features.map(f => new TaskItem(f, 'feature'));
    }
    
    if (element.type === 'feature') {
      // Show all tasks for feature
      const tasks = await taskDb.getTasksForFeature(element.id);
      return tasks.map(t => new TaskItem(t, 'task'));
    }
    
    return [];
  }
  
  getTreeItem(element: TaskItem): vscode.TreeItem {
    const item = new vscode.TreeItem(
      element.label,
      element.type === 'feature' 
        ? vscode.TreeItemCollapsibleState.Expanded 
        : vscode.TreeItemCollapsibleState.None
    );
    
    // Status icons
    if (element.type === 'task') {
      const icons = {
        'pending': '⏳',
        'in-progress': '🔄',
        'verified': '✅',
        'failed': '❌'
      };
      item.iconPath = new vscode.ThemeIcon(
        element.status === 'verified' ? 'pass' : 'circle-outline'
      );
      item.description = `${icons[element.status]} ${element.status}`;
      
      // Highlight current task
      if (element.status === 'in-progress') {
        item.tooltip = '🎯 Current task';
        item.contextValue = 'currentTask';
      }
    }
    
    return item;
  }
}
```

---

## Integration with Spec Kit

### Option A: Replace /tasks Command

```json
// .vscode/settings.json
{
  "github.copilot.chat.commands": {
    "/tasks": {
      "handler": "codor.generateTasks",
      "description": "Generate tasks (CODOR-managed)"
    }
  }
}
```

**Problem:** May not be possible to override built-in commands.

### Option B: New Command /codor-tasks

```
Developer workflow:
1. /specify
2. /plan
3. /codor-tasks  ← Instead of /tasks
4. Agent sees only current task in tasks.md
```

### Option C: Post-process /tasks

```
Developer workflow:
1. /specify
2. /plan
3. /tasks       ← Let Copilot generate tasks.md
4. CODOR detects tasks.md change
5. CODOR imports to database
6. CODOR rewrites tasks.md with limited view
```

**Recommended:** Option C (least friction)

---

## Agent Interaction Patterns

### Pattern 1: Chat-based Request

```
Agent: "I've completed T001. The database connection is working and all tests pass."

Developer: "@codor next task"

CODOR Extension:
  1. Verifies T001
  2. Updates tasks.md with T002
  3. Responds: "✅ T001 verified. Next task: T002 - Create User model"

Agent: Reads updated tasks.md, implements T002
```

### Pattern 2: Command-based Request

```
Agent: "Task complete. Running verification..."

Agent: (Cannot run verification - doesn't have access to CODOR)

Developer: Clicks "Request Next Task" in CODOR UI

CODOR:
  1. Runs verification
  2. Shows results in UI
  3. Updates tasks.md
  4. Agent sees updated file
```

### Pattern 3: Automated Watching

```
Agent: Commits code for T001

CODOR File Watcher:
  1. Detects commit
  2. Extracts task ID from commit message
  3. Auto-verifies T001
  4. If pass: Updates tasks.md with T002
  5. Notifies developer
  6. Agent detects tasks.md change, starts T002
```

---

## Database Schema (Simplified)

```typescript
interface Task {
  id: string;                    // "T001"
  featureId: string;             // "001-core-features"
  title: string;                 // "Initialize database connection"
  description: string;
  filePath: string;              // "packages/web/src/db/connection.ts"
  requirements: string[];        // ["FR-001", "FR-002"]
  acceptanceCriteria: string[];
  dependencies: string[];        // ["T000"] - tasks that must complete first
  status: TaskStatus;
  verificationResults?: VerificationResult;
  assignedAt?: Date;
  completedAt?: Date;
  verifiedAt?: Date;
}

type TaskStatus = 
  | 'pending'       // Not started
  | 'in-progress'   // Currently being worked on
  | 'completed'     // Implementation done, awaiting verification
  | 'verified'      // Verification passed
  | 'failed';       // Verification failed

interface VerificationResult {
  success: boolean;
  testsRun: number;
  testsPassed: number;
  requirementsCovered: string[];
  requirementsMissing: string[];
  failures: string[];
  evidence: string;  // Path to evidence file
  timestamp: Date;
  manualOverride?: boolean;
  overrideReason?: string;
}
```

---

## Key Benefits of This Approach

### 1. Perfect Information Control ✅

```
Developer View (Tree):
  ✅ T001 - Database connection
  ✅ T002 - User model
  🔄 T003 - Authentication (CURRENT)
  ⏳ T004 - Password hashing
  ⏳ T005 - Session management
  ... (all 50 tasks visible)

Agent View (tasks.md):
  # Current Task
  
  T003 - Authentication
  
  (Cannot see T004, T005, etc.)
```

### 2. Enforced Sequential Execution ✅

Agent **cannot** jump ahead because:
- tasks.md only shows current task
- File doesn't mention future tasks
- No way to discover task IDs

### 3. Verification Gates ✅

Agent **cannot** proceed without verification:
- Requests next task
- CODOR verifies current task
- If fail: Same task stays in tasks.md
- If pass: Next task appears in tasks.md

### 4. Dependency Management ✅

```typescript
async getNextTask(): Promise<Task | null> {
  // Only return tasks whose dependencies are verified
  return await db.query(`
    SELECT * FROM tasks
    WHERE status = 'pending'
    AND NOT EXISTS (
      SELECT 1 FROM task_dependencies td
      JOIN tasks t ON td.dependency_id = t.id
      WHERE td.task_id = tasks.id
      AND t.status != 'verified'
    )
    ORDER BY id ASC
    LIMIT 1
  `);
}
```

### 5. Clean Integration with Existing Workflow ✅

No changes to:
- Spec Kit file structure
- spec.md format
- plan.md format
- Copilot's generation process

Only change:
- tasks.md is now **managed** by CODOR (agent sees limited view)

---

## Implementation Phases

### Phase 1: Core Task Management (Week 1)

**Components:**
- ✅ Task database (SQLite)
- ✅ Task parser (parse tasks.prompt.md)
- ✅ Limited task file generator
- ✅ Tree view provider (developer view)
- ✅ Basic commands:
  - `codor.importTasks` - Import from tasks.prompt.md
  - `codor.nextTask` - Request next task
  - `codor.verifyTask` - Manual verification trigger

**Deliverable:**
Working task queue system. Developer can import tasks, agent sees one at a time.

### Phase 2: Verification Integration (Week 2)

**Components:**
- ✅ Call CODOR core engine
- ✅ Run tests automatically
- ✅ Check requirements coverage
- ✅ Evidence collection
- ✅ Verification gates
- ✅ Configuration (strict mode, override)

**Deliverable:**
Full verification loop. Agent cannot proceed without passing tests.

### Phase 3: Automation & Polish (Week 3)

**Components:**
- ✅ Auto-detect tasks.md changes (post-process /tasks)
- ✅ File watching (detect commits)
- ✅ Task inference from commits
- ✅ Progress tracking
- ✅ Historical evidence viewer
- ✅ Quality reports

**Deliverable:**
Seamless workflow. Minimal manual intervention.

---

## Configuration

```json
// .vscode/settings.json
{
  "codor.taskManagement": {
    "enabled": true,
    "strictMode": true,                    // Require verification before next task
    "autoImportOnTasksChange": true,       // Auto-import when /tasks generates tasks.md
    "showAgentLimitedView": true,          // Rewrite tasks.md with limited view
    "allowManualOverride": true,           // Developer can override verification
    "requireOverrideReason": true,         // Must provide reason for override
    "verifyOnCommit": false,               // Auto-verify when agent commits (future)
    "blockOnFailure": true,                // Don't provide next task if verification fails
    "parallelTasks": false                 // Allow multiple in-progress tasks (future)
  }
}
```

---

## Example Workflow

### Step 1: Generate Tasks

```bash
Developer: /specify
# Copilot generates spec.md

Developer: /plan
# Copilot generates plan.md

Developer: /tasks
# Copilot generates tasks.md with 20 tasks

CODOR Extension (auto-detects):
  1. Reads tasks.md
  2. Parses 20 tasks
  3. Stores in database
  4. Rewrites tasks.md with ONLY T001
  5. Shows notification: "✅ CODOR managing 20 tasks. Agent can see task 1."
```

### Step 2: Agent Works on T001

```markdown
# tasks.md (Agent's View)

## Current Task

**T001: Initialize database connection**

File: `packages/web/src/db/connection.ts`  
Requirements: FR-001, FR-002

### Acceptance Criteria
- Database connects successfully
- Connection pool configured
- Error handling implemented

When complete, request next task from CODOR.
```

### Step 3: Agent Completes T001

```
Agent: "I've completed T001. The database connection is implemented 
       with Prisma, connection pooling is configured, and error 
       handling is in place. All existing tests pass."

Developer: Clicks "Request Next Task" in CODOR view

CODOR:
  1. Runs verification tests
  2. Checks requirements FR-001, FR-002
  3. ✅ All pass
  4. Marks T001 as verified
  5. Marks T002 as in-progress
  6. Rewrites tasks.md with T002
  7. Shows: "✅ T001 verified! Next: T002 - Create User model"
```

### Step 4: Agent Works on T002

```markdown
# tasks.md (Agent's View)

## Current Task

**T002: Create User model**

File: `packages/web/src/models/User.ts`  
Requirements: FR-003, FR-004, FR-005

### Acceptance Criteria
- User model with validation
- Email uniqueness enforced
- Password hashing with bcrypt

When complete, request next task from CODOR.
```

**Agent cannot see T003, T004, etc. Perfect focus!**

---

## This Solves Everything! 🎉

| Problem | Old Approach | New Approach |
|---------|-------------|-------------|
| Agent sees all tasks | ❌ Can jump around | ✅ Sees one task only |
| Agent fabricates status | ❌ Updates checkboxes | ✅ Cannot update - CODOR controls |
| Agent skips verification | ❌ No enforcement | ✅ Must verify to proceed |
| Agent loses track | ❌ Internal TODO lists | ✅ CODOR is authoritative |
| Developer lost visibility | ❌ Must read tasks.md | ✅ Tree view shows all |
| No evidence trail | ❌ Just checkboxes | ✅ Full verification records |

---

## Decision Summary

**APPROVED APPROACH:** ✅

1. ✅ Intercept task generation (post-process /tasks)
2. ✅ Store tasks in SQLite database
3. ✅ Generate limited tasks.md (one task at a time)
4. ✅ Verification gate before next task
5. ✅ Developer sees full list in tree view
6. ✅ Agent sees only current task

**This is the way.** 🎯

---

## Next Steps

1. **Scaffold extension** (yo code)
2. **Implement task database** (SQLite schema, import, getNextTask)
3. **Parse tasks.prompt.md** (or tasks.md) into Task objects
4. **Generate limited tasks.md** (single task view)
5. **Create tree view** (developer full view)
6. **Integrate verification** (call CODOR core)
7. **Wire up commands** (importTasks, nextTask, verifyTask)

**Let's build this!** 🚀
