# AI Agent Interaction Design - Task Distribution Mechanism

**Date:** October 1, 2025  
**Status:** Critical Design Decision  
**Question:** How does the AI agent get tasks and report completion?

---

## 🤔 The Core Problem

We have tasks in a database. The AI agent needs to:
1. Get the current task
2. Work on it
3. Report completion
4. Get the next task
5. **Repeat** without deviation

**Challenge:** AI agents (Copilot Workspace, Cursor, etc.) don't have native CODOR integration. How do we bridge this gap?

---

## 🎯 Available Interaction Models

### Model 1: File-Based (Passive)
**Mechanism:** CODOR writes current task to a file, agent reads it

```
CODOR writes:
  specs/004-feature/.codor/current-task.md
    ├─ Task ID: T003
    ├─ Title: Implement user authentication
    ├─ Description: ...
    ├─ Files: src/auth/jwt.ts
    └─ When complete: Update this file with "DONE"

Agent reads file
  ↓
Agent implements task
  ↓
Agent writes: "DONE" to current-task.md
  ↓
CODOR watches file
  ↓
CODOR detects "DONE"
  ↓
CODOR runs verification
  ↓
CODOR writes next task to current-task.md
```

**Pros:**
- ✅ No agent modification needed
- ✅ Simple implementation
- ✅ Agent can read file naturally
- ✅ Git-friendly (developer can see what agent is working on)

**Cons:**
- ❌ Agent might ignore the file
- ❌ Agent might read other files (drift)
- ❌ File watching has race conditions
- ❌ No enforcement mechanism
- ❌ Agent could write "DONE" without actually completing


### Model 2: API-Based (Active Pull)
**Mechanism:** Agent calls CODOR API to get/complete tasks

```
CODOR runs HTTP server on localhost:3141

Agent (modified with custom instructions):
  "When starting work, call GET http://localhost:3141/codor/current-task"
  
  ↓
Agent: GET /codor/current-task
  ↓
CODOR responds:
  {
    "id": "T003",
    "title": "Implement user authentication",
    "description": "...",
    "files": ["src/auth/jwt.ts"],
    "requirements": ["FR-001", "FR-002"]
  }
  ↓
Agent implements task
  ↓
Agent: POST /codor/complete-task
  {
    "task_id": "T003",
    "files_modified": ["src/auth/jwt.ts", "src/auth/jwt.test.ts"]
  }
  ↓
CODOR runs verification
  ↓
CODOR responds:
  {
    "status": "verified",
    "next_task": {
      "id": "T004",
      "title": "..."
    }
  }
```

**Pros:**
- ✅ Explicit contract
- ✅ Real-time verification
- ✅ Can block agent until verification passes
- ✅ Clean separation of concerns
- ✅ Structured data exchange

**Cons:**
- ❌ Requires agent modification/configuration
- ❌ Copilot Workspace doesn't support custom APIs (yet)
- ❌ Adds complexity (HTTP server in extension)
- ❌ Agent might ignore the API
- ❌ Network configuration issues


### Model 3: Chat-Based (Conversational)
**Mechanism:** Developer acts as mediator via chat commands

```
Developer: @codor next task

CODOR (in chat):
  "Next task: T003 - Implement user authentication
   Files: src/auth/jwt.ts
   Requirements: FR-001, FR-002
   
   Details: [link to webview]
   
   When complete, say '@codor verify'"

Agent sees chat message
  ↓
Agent implements task
  ↓
Developer: @codor verify
  ↓
CODOR runs verification
  ↓
CODOR (in chat):
  "✅ T003 verified! Evidence collected.
   
   Next task: T004 - Add authentication middleware
   Files: src/middleware/auth.ts
   ..."
```

**Pros:**
- ✅ Natural workflow (developer stays in control)
- ✅ Works with any AI agent
- ✅ No agent modification needed
- ✅ Developer can override/adjust
- ✅ Clear audit trail in chat

**Cons:**
- ❌ Developer overhead (manual commands)
- ❌ Not fully automated
- ❌ Agent might not follow chat context
- ❌ Requires developer discipline


### Model 4: Workspace Context Injection (Hybrid)
**Mechanism:** CODOR injects task into workspace context that agent naturally reads

```
CODOR manages:
  .codor/
    ├─ current-task.md         (ONE task only)
    ├─ task-context.json       (Machine-readable)
    └─ instructions.md         (Agent instructions)

.codor/instructions.md:
  "IMPORTANT: You are working in CODOR-managed mode.
   
   ALWAYS:
   1. Read .codor/current-task.md for your current assignment
   2. Complete ONLY the task described in that file
   3. When done, notify developer: 'Task complete, ready for verification'
   4. Wait for next task (file will update after verification)
   
   NEVER:
   - Work on tasks not in current-task.md
   - Read specs/*/tasks.md (if exists)
   - Invent new tasks
   - Skip verification
   
   Current task: [embedded from database]"

CODOR ensures:
  - No tasks.md file exists in specs/
  - current-task.md is THE ONLY task source
  - File updates only after verification passes
  - Instructions.md always visible to agent
```

**Pros:**
- ✅ Agent reads files naturally (no API needed)
- ✅ Strong signal (instructions.md in context)
- ✅ One source of truth (current-task.md)
- ✅ Developer can monitor (.codor/ folder visible)
- ✅ No network/API complexity

**Cons:**
- ❌ Relies on agent reading .codor/ folder
- ❌ Agent might still ignore instructions
- ❌ Completion detection needs watching or developer command


### Model 5: Git-Based (Commit Hooks)
**Mechanism:** CODOR detects task completion via git commits

```
Agent implements task
  ↓
Agent commits: "feat: implement user authentication"
  ↓
CODOR git hook (pre-commit or post-commit)
  ↓
CODOR detects commit
  ↓
CODOR checks files changed vs current task
  ↓
CODOR runs verification
  ↓
If pass:
  - Update current-task.md with next task
  - Allow commit
If fail:
  - Show error in git output
  - Ask developer to fix or override
```

**Pros:**
- ✅ Natural developer workflow
- ✅ Git provides audit trail
- ✅ Works with any agent that commits
- ✅ No manual "done" signal needed

**Cons:**
- ❌ Assumes agent commits after each task
- ❌ Hard to correlate commit to task
- ❌ Agent might commit multiple tasks at once
- ❌ Blocks git workflow if verification fails


---

## 🎯 Recommended Solution: **Hybrid Multi-Layer Approach**

**Strategy:** Use multiple reinforcement mechanisms to maximize compliance

### Layer 1: Workspace Context (Primary)
```
.codor/
├─ current-task.md          ← Agent's primary task source
├─ instructions.md          ← Always visible to agent context
└─ task-context.json        ← Machine-readable for tools
```

**Why:** Agents naturally read workspace files. Make CODOR the loudest voice.

### Layer 2: Developer Commands (Control)
```
VS Code Commands:
- "CODOR: Next Task" → Updates current-task.md, notifies developer
- "CODOR: Verify & Next" → Runs verification, updates task
- "CODOR: Show Task to Agent" → Opens current-task.md, adds to chat
```

**Why:** Developer stays in control, can guide agent explicitly.

### Layer 3: Status Bar (Visibility)
```
VS Code Status Bar:
┌────────────────────────────────────────┐
│ CODOR: T003 In Progress | Verify & Next│
└────────────────────────────────────────┘
```

**Why:** Constant reminder of current task and next action.

### Layer 4: File Watching (Automation)
```
CODOR watches:
- Files in current task's file list
- Saves to those files

On file save:
  - Check if acceptance criteria might be met
  - Show notification: "Task T003 files modified. Ready to verify?"
  - One-click verification
```

**Why:** Reduce manual overhead, automate when safe.

---

## 🔧 Detailed Workflow

### Setup (One-Time)

1. **Developer installs CODOR extension**
2. **CODOR creates `.codor/` folder:**
   ```
   .codor/
   ├─ tasks.db              (SQLite database)
   ├─ current-task.md       (ONE task visible to agent)
   ├─ instructions.md       (Agent behavior instructions)
   └─ evidence/             (Verification results)
   ```

3. **CODOR adds to `.gitignore`:**
   ```
   # CODOR working files (db WAL files only)
   .codor/*.db-shm
   .codor/*.db-wal
   
   # Keep these in git:
   # .codor/tasks.db
   # .codor/instructions.md
   ```

4. **CODOR shows welcome message:**
   ```
   "CODOR initialized! 
    - Create your first feature: 'CODOR: New Feature'
    - Generate spec, plan, tasks via CODOR commands
    - AI agent will read .codor/current-task.md
    - Use 'CODOR: Verify & Next' to advance tasks"
   ```

### Task Generation

1. **Developer:** "CODOR: Generate Tasks" (on a feature)
2. **CODOR:** 
   - Calls Spec Kit scripts (patched)
   - Parses task list
   - Stores ALL tasks in database
   - Writes FIRST task to `.codor/current-task.md`
   - Updates `.codor/instructions.md`
   - Shows notification: "10 tasks created. Current: T001"

**`.codor/current-task.md`:**
```markdown
# Current Task: T001

**Status:** In Progress  
**Feature:** 004-user-authentication  
**Started:** 2025-10-01 09:30

---

## Task: Initialize authentication module

Create the authentication module structure and configure JWT settings.

**Files to Create/Modify:**
- `src/auth/index.ts` (create)
- `src/auth/jwt.ts` (create)
- `src/config/auth.config.ts` (create)

**Requirements:**
- FR-001: User authentication system
- FR-002: JWT token generation
- NFR-003: Security best practices

**Acceptance Criteria:**
- [ ] Auth module exports login/logout functions
- [ ] JWT signing and verification configured
- [ ] Environment variables for secrets
- [ ] Unit tests for JWT functions

**Test Command:**
```bash
npm test -- auth
```

---

## When Complete

When you have completed this task:
1. Ensure all acceptance criteria are met
2. Run the test command above
3. Notify the developer: "Task T001 complete, ready for verification"
4. Wait for next task assignment

**DO NOT:**
- Work on other tasks
- Read other task files
- Skip ahead in the task list
- Modify this file

The next task will appear here after verification.
```

**`.codor/instructions.md`:**
```markdown
# CODOR Workspace Instructions

**IMPORTANT:** This workspace uses CODOR (Contract-Driven Outcome Reliability) for task management.

## Your Role

You are an AI coding agent working in a CODOR-managed workspace. Your behavior must follow these rules:

### ✅ ALWAYS DO

1. **Read `.codor/current-task.md`** - This is your ONLY task assignment
2. **Complete ONLY the current task** - No other work
3. **Follow acceptance criteria** - Each task has specific requirements
4. **Notify when complete** - Say "Task [ID] complete, ready for verification"
5. **Wait for next task** - File will update after verification

### ❌ NEVER DO

1. **Don't read `specs/*/tasks.md`** - These files don't exist or are outdated
2. **Don't invent tasks** - Work only on assigned task
3. **Don't skip tasks** - Complete tasks in order
4. **Don't work on multiple tasks** - One at a time only
5. **Don't modify `.codor/` files** - These are managed by CODOR

### 🔍 Current Status

- **Active Feature:** 004-user-authentication
- **Current Task:** T001 (Initialize authentication module)
- **Total Tasks:** 10
- **Completed:** 0
- **Remaining:** 10

### 📋 Task Workflow

```
Read current-task.md
  ↓
Implement the task
  ↓
Run tests
  ↓
Notify: "Task complete"
  ↓
Wait for verification
  ↓
Next task appears in current-task.md
  ↓
Repeat
```

### 🎯 Success Criteria

A task is complete when:
- All files created/modified as specified
- All acceptance criteria met
- Tests pass
- Requirements covered

### 🆘 If Stuck

If you cannot complete the task:
1. Notify the developer with specific blockers
2. Don't skip or work around the task
3. Wait for clarification or task modification

---

**Remember:** CODOR ensures quality and compliance. Following these instructions helps maintain code quality and project success.

**Last Updated:** 2025-10-01 09:30
```

### Task Execution

**Scenario 1: Agent Follows Instructions (Happy Path)**

```
1. Agent reads .codor/current-task.md
2. Agent: "I'll implement T001: Initialize authentication module"
3. Agent creates files, writes code
4. Agent runs tests: npm test -- auth
5. Agent: "Task T001 complete, ready for verification. All tests passing."
6. Developer: "CODOR: Verify & Next"
7. CODOR:
   - Runs npm test -- auth
   - Checks files created
   - Validates acceptance criteria
   - Collects evidence
   - Updates current-task.md with T002
   - Notifies: "✅ T001 verified! Next: T002"
8. Agent reads updated current-task.md
9. Agent: "Starting T002: Implement login endpoint"
10. Repeat...
```

**Scenario 2: Agent Drifts (Correction)**

```
1. Agent reads .codor/current-task.md (T001)
2. Agent: "I'll implement the entire authentication system"  ← DRIFT!
3. Agent starts working on T001, T002, T003 simultaneously
4. CODOR file watcher detects:
   - Files from T002, T003 being modified
   - Current task is T001
5. CODOR shows warning:
   "⚠️ Files outside current task scope detected!
    Current: T001 (src/auth/index.ts, src/auth/jwt.ts)
    Modified: src/routes/auth.ts (belongs to T002)
    
    Please work on T001 only."
6. Developer intervenes: "@agent, please focus on T001 only"
7. Agent: "Understood, focusing on T001"
```

**Scenario 3: Agent Ignores Instructions (Manual Override)**

```
1. Agent completely ignores .codor/current-task.md
2. Agent works on random tasks
3. Developer notices in git diff
4. Developer: "CODOR: Show Current Task"
5. CODOR opens current-task.md prominently
6. Developer copies task to chat: "@agent this is your current task [paste]"
7. Agent: "I see, I'll work on T001 as specified"
8. If agent continues to ignore:
   - Developer uses CODOR UI directly
   - Marks tasks complete manually after verification
   - Provides override reasons
```

### Verification

**Developer-Triggered (Primary Method):**

```
Developer: "CODOR: Verify & Next" (Command Palette or button)
  ↓
CODOR:
  1. Reads current task from database
  2. Runs test command: npm test -- auth
  3. Parses test output (exit code, JSON results)
  4. Checks files:
     - Do all specified files exist?
     - Have they been modified since task started?
  5. Validates acceptance criteria:
     - Auth module exports functions? ✅
     - JWT configured? ✅
     - Unit tests exist? ✅
  6. Collects evidence:
     - Test results: { "passed": 5, "failed": 0 }
     - Files: ["src/auth/index.ts", "src/auth/jwt.ts", ...]
     - Coverage: 85%
     - Timestamp: 2025-10-01 10:15
  7. Stores evidence in database
  8. Updates task status: "completed"
  9. Gets next task (T002)
  10. Updates .codor/current-task.md with T002
  11. Shows notification:
      "✅ T001 verified and completed!
       📊 5/5 tests passed
       📁 3 files created
       ✅ All acceptance criteria met
       
       Next: T002 - Implement login endpoint"
```

**Auto-Trigger (Optional, Configurable):**

```
CODOR watches: src/auth/index.ts, src/auth/jwt.ts
  ↓
Developer saves file
  ↓
CODOR detects: "All task files saved"
  ↓
CODOR shows prompt:
  "Task T001 files modified. Run verification?
   [Yes] [No] [Auto-verify on save]"
  ↓
Developer: [Yes]
  ↓
Same verification flow as above
```

---

## 🎮 Developer Controls

### VS Code Commands

| Command | When | What It Does |
|---------|------|--------------|
| **CODOR: Next Task** | Anytime | Shows current task in UI, updates current-task.md |
| **CODOR: Verify & Next** | Task in progress | Runs verification, advances to next task |
| **CODOR: Show Task to Agent** | Anytime | Opens current-task.md, copies to chat |
| **CODOR: Skip Task** | When blocked | Marks task as skipped (with reason), shows next |
| **CODOR: Mark Complete (Manual)** | Override | Manually marks task complete, requires reason |
| **CODOR: View All Tasks** | Anytime | Opens task list webview (developer only) |

### Status Bar

```
┌────────────────────────────────────────────────────────────┐
│ CODOR: T003/10 In Progress | [Verify & Next] | [Skip]     │
└────────────────────────────────────────────────────────────┘
     ↑       ↑       ↑               ↑              ↑
   Icon  TaskID  Progress     Quick verify    Quick skip
```

Clicking status bar opens task details webview.

### Tree View

```
CODOR
├─ 📁 Features
│  ├─ 001-core ✅ (5/5)
│  └─ 004-auth 🔄 (1/10)
│     ├─ 📄 spec.md
│     ├─ 📄 plan.md
│     └─ 📋 Tasks
│        ├─ ✅ T001 Complete
│        ├─ ▶️ T002 In Progress ← CURRENT
│        └─ ⏸️ 8 pending (hidden from agent)
└─ 🎯 Current Task
   └─ ▶️ T002: Implement login endpoint
      └─ [Verify & Next]
```

---

## 🔐 Enforcement Mechanisms

### 1. File System Control
- ✅ No `tasks.md` file in specs/
- ✅ Only `.codor/current-task.md` exists
- ✅ Instructions in `.codor/instructions.md`

### 2. Contextual Reinforcement
- ✅ Instructions.md in workspace root (high visibility)
- ✅ Current-task.md updated atomically
- ✅ Status bar always visible

### 3. Developer Feedback Loop
- ✅ Notifications on task updates
- ✅ File watcher warnings for drift
- ✅ Quick commands for intervention

### 4. Verification Gates
- ✅ No next task until current verified
- ✅ Evidence collection mandatory
- ✅ Manual override requires reason

### 5. Audit Trail
- ✅ All task transitions logged
- ✅ Evidence stored in database
- ✅ Git commits include task ID

---

## 📊 Success Metrics

**Agent Compliance:**
- ✅ Agent reads current-task.md: Observable in chat/commits
- ✅ Agent completes tasks in order: Check task completion sequence
- ✅ Agent reports completion: Notification message present
- ✅ Agent waits for next task: No drift detected

**Developer Efficiency:**
- ✅ < 10 seconds to verify and advance
- ✅ < 5 clicks per task cycle
- ✅ Zero manual tasks.md updates

**Quality Assurance:**
- ✅ 100% of tasks have evidence
- ✅ 0% tasks completed without verification
- ✅ Clear audit trail for each task

---

## 🎯 Recommendation

**Use Model 4 (Workspace Context Injection) with Developer Commands**

**Rationale:**
1. **No agent modification needed** - Works with Copilot, Cursor, any agent
2. **Natural file reading** - Agents already read workspace files
3. **Developer control** - Commands for manual intervention
4. **Clear enforcement** - One task file, clear instructions
5. **Fallback options** - Developer can always guide agent via chat

**Implementation Priority:**
1. ✅ Phase 1: `.codor/current-task.md` + database
2. ✅ Phase 1: "Verify & Next" command
3. ✅ Phase 2: Instructions.md generation
4. ✅ Phase 2: Status bar integration
5. ✅ Phase 3: File watching and drift detection
6. ✅ Phase 4: Auto-verification (optional)

**Acceptance:**
- Developer can work with ANY AI agent without configuration
- Agent naturally finds and reads task instructions
- Developer maintains full control via VS Code
- Enforcement is strong but not brittle
- Degradation is graceful (developer can always intervene)

---

## 📝 Open Questions for Review

1. **Auto-verification:** Should we auto-verify on file save, or always require explicit command?
2. **Drift tolerance:** How aggressive should drift warnings be? Immediate vs. accumulative?
3. **Agent hints:** Should current-task.md include explicit "@agent" mentions?
4. **Chat integration:** Should CODOR post to chat window automatically, or only on command?
5. **Override workflow:** Should manual override require explanation, approval, or just logging?

---

**END OF DESIGN**
