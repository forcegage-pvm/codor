# CODOR VS Code Extension - Specification

**Version:** 1.1.0-draft  
**Date:** October 1, 2025  
**Status:** Draft - AI Sprint Automation Integrated  
**Project:** CODOR (Contract-Driven Outcome Reliability)

**Latest Updates:**
- ✅ AI Sprint Automation design integrated (Section 5.5)
- ✅ Database schema expanded (test_plans, test_executions, sprint_executions, flaky_test_flags)
- ✅ Implementation phases updated (6 phases, 12 weeks)
- ✅ Hybrid Smart Adaptive context management strategy
- ✅ Test-driven enforcement workflow
- ✅ Bounded retry and error recovery
- ✅ Auto-commit and traceability

---

## 1. Executive Summary

### 1.1 Purpose

The CODOR VS Code Extension is an authoritative task manager and quality gate for AI coding agents implementing tasks from GitHub Spec Kit. It solves the critical problem of AI agent task drift, fabrication, and poor verification by intercepting task generation at the source and controlling task distribution through a database-backed system.

### 1.2 Key Innovation

Instead of letting AI agents freely access `tasks.md` files (leading to drift and fabrication), CODOR:
1. Intercepts Spec Kit task generation BEFORE `tasks.md` is created
2. Stores tasks in a SQLite database (the single source of truth)
3. Exposes only ONE task at a time to the AI agent
4. Verifies completion before providing the next task
5. Maintains spec.md and plan.md as files for git-friendliness

### 1.3 Target Users

- **Primary:** Development teams using GitHub Spec Kit with AI coding agents
- **Secondary:** Individual developers using Copilot Workspace, Cursor, or similar AI tools
- **Context:** Specification-driven development workflows

---

## 2. Problem Statement

### 2.1 Current Issues with AI Agent Task Management

**Problem:** AI agents do not reliably follow `tasks.md` files, leading to:

1. **Task Drift:** Agent works on tasks out of order or skips tasks
2. **Fabrication:** Agent invents tasks not in the specification
3. **Poor Verification:** Checkboxes updated without actual completion
4. **No Enforcement:** No programmatic way to verify task completion
5. **Lost Context:** Agent forgets requirements and acceptance criteria
6. **No Evidence:** No audit trail of what was actually done

### 2.2 Root Cause Analysis

**Why `tasks.md` Fails:**
- File is fully visible to AI agent (can see all tasks at once)
- No programmatic verification mechanism
- Checkboxes are just markdown (no enforcement)
- No connection between task completion and test results
- Agent can modify the file arbitrarily
- No dependency tracking or ordering enforcement

---

## 3. Solution Overview

### 3.1 Architecture Approach

**Hybrid System:**
- ✅ **Spec Kit Integration:** Augment (not replace) GitHub Spec Kit
- ✅ **File-Based Storage:** Keep spec.md/plan.md as files (git-friendly)
- ✅ **Database Tasks:** Store tasks in SQLite (single source of truth)
- ✅ **UI Control:** VS Code tree views for developer visibility
- ✅ **Programmatic Verification:** Automated test execution and validation

### 3.2 Core Principles

1. **Augmentation over Replacement:** Feed off Spec Kit, don't replace it
2. **Information Control:** Agent sees only current task, developer sees all
3. **Verification Gates:** No next task until current task verified
4. **Evidence Collection:** Track what was actually done, not just claimed
5. **Git-Friendly:** Commit database to repository for team sync
6. **Minimal Patching:** Small, targeted changes to Spec Kit scripts

---

## 4. System Architecture

### 4.1 High-Level Components

```
┌─────────────────────────────────────────────────────────────┐
│                    CODOR VS Code Extension                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │ Spec Kit       │  │ Task Database  │  │ UI Layer     │  │
│  │ Integration    │←→│ (SQLite)       │←→│ (Tree Views) │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
│         ↑                    ↑                    ↑          │
│         │                    │                    │          │
│  ┌──────┴──────┐  ┌─────────┴────────┐  ┌────────┴──────┐  │
│  │ Script      │  │ Verification     │  │ Command       │  │
│  │ Patches     │  │ Engine           │  │ Handlers      │  │
│  └─────────────┘  └──────────────────┘  └───────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
         ↑                                          ↓
         │                                          │
┌────────┴──────────┐                    ┌─────────┴─────────┐
│  Spec Kit Scripts │                    │  AI Agent         │
│  (.specify/)      │                    │  (Copilot, etc.)  │
└───────────────────┘                    └───────────────────┘
```

### 4.2 Data Flow

```
Developer Workflow:
1. Developer: "CODOR: New Feature"
   ↓
2. CODOR: Shows input form
   ↓
3. Developer: Enters feature description
   ↓
4. CODOR: Calls Spec Kit /specify script
   ↓
5. Spec Kit: Generates spec.md (as file)
   ↓
6. CODOR: Imports spec.md to database
   ↓
7. Developer: "CODOR: Generate Plan"
   ↓
8. CODOR: Calls Spec Kit /plan script
   ↓
9. Spec Kit: Generates plan.md (as file)
   ↓
10. CODOR: Imports plan.md to database
    ↓
11. Developer: "CODOR: Generate Tasks"
    ↓
12. CODOR: Calls Spec Kit /tasks script (PATCHED)
    ↓
13. Spec Kit: Sends output to CODOR (not tasks.md file)
    ↓
14. CODOR: Parses tasks, stores in database
    ↓
15. CODOR: Shows first task in UI
    ↓
16. Agent: Sees only current task (T001)
    ↓
17. Agent: Implements T001
    ↓
18. Developer/Agent: "CODOR: Verify & Next"
    ↓
19. CODOR: Runs verification tests
    ↓
20. CODOR: Checks acceptance criteria
    ↓
21. CODOR: Collects evidence
    ↓
22. CODOR: If pass → shows T002; If fail → blocks with report
```

---

## 5. Functional Requirements

### 5.1 Feature Management

**FR-001: Create New Feature**
- **Actor:** Developer
- **Trigger:** Command "CODOR: New Feature"
- **Process:**
  1. Show webview with feature description input
  2. Validate input (not empty, follows naming convention)
  3. Create feature record in database
  4. Create folder: `specs/[ID]-[name]/`
  5. Update tree view
- **Output:** Feature created, ready for specification

**FR-002: Generate Specification**
- **Actor:** Developer
- **Trigger:** Command "CODOR: Generate Specification" (on feature)
- **Process:**
  1. Validate feature selected
  2. Call Spec Kit `/specify` script with feature context
  3. Spec Kit generates `specs/[ID]-[name]/spec.md`
  4. CODOR parses spec.md
  5. Extract requirements (FR-XXX, NFR-XXX)
  6. Store spec and requirements in database
  7. Update tree view
- **Output:** Specification created (file + database)

**FR-003: Generate Plan**
- **Actor:** Developer
- **Trigger:** Command "CODOR: Generate Plan" (on feature with spec)
- **Process:**
  1. Validate specification exists
  2. Call Spec Kit `/plan` script with spec context
  3. Spec Kit generates `specs/[ID]-[name]/plan.md`
  4. CODOR parses plan.md
  5. Extract phases, milestones
  6. Store plan in database
  7. Update tree view
- **Output:** Plan created (file + database)

**FR-004: Generate Tasks**
- **Actor:** Developer
- **Trigger:** Command "CODOR: Generate Tasks" (on feature with plan)
- **Process:**
  1. Validate plan exists
  2. Call Spec Kit `/tasks` script (PATCHED VERSION)
  3. Spec Kit sends output to CODOR (via environment variable)
  4. CODOR parses task list
  5. Extract task ID, title, description, file paths, requirements
  6. Store all tasks in database with status='pending'
  7. Build dependency graph if specified
  8. Update tree view with first task only
  9. **NO tasks.md file created**
- **Output:** Tasks in database, first task visible

### 5.2 Task Execution

**FR-005: Start Task**
- **Actor:** Developer or AI Agent
- **Trigger:** Command "CODOR: Start Task" (on pending task)
- **Process:**
  1. Validate task is next in sequence
  2. Update task status to 'in-progress'
  3. Show task details in webview
  4. Display requirements and acceptance criteria
  5. Update tree view
- **Output:** Task marked as in-progress, details shown

**FR-006: View Task Details**
- **Actor:** Developer or AI Agent
- **Trigger:** Command "CODOR: View Task Details" (on any task)
- **Process:**
  1. Query task from database
  2. Render webview with:
     - Task ID, title, description
     - File paths to modify
     - Related requirements
     - Acceptance criteria
     - Test commands
     - Current status
  3. Show evidence if task completed
- **Output:** Task details webview displayed

**FR-007: Verify and Next Task**
- **Actor:** Developer
- **Trigger:** Command "CODOR: Verify & Next Task" (on in-progress task)
- **Process:**
  1. Validate task is in-progress
  2. Run verification tests (if specified)
  3. Check acceptance criteria
  4. Collect evidence:
     - Test results (pass/fail)
     - Files modified
     - Requirements covered
     - Timestamp
  5. If verification passes:
     - Update task status to 'completed'
     - Store evidence
     - Show next task
  6. If verification fails:
     - Keep task as in-progress
     - Show failure report
     - Allow manual override (if configured)
- **Output:** Task verified and next task shown, or failure report

**FR-008: Manual Override**
- **Actor:** Developer
- **Trigger:** Verification failure with override enabled
- **Process:**
  1. Show override dialog
  2. Require reason for override
  3. Store override reason in evidence
  4. Mark task as 'completed-override'
  5. Show next task
- **Output:** Task marked completed with override flag

### 5.3 UI Components

**FR-009: Features Tree View**
- **Location:** Activity Bar > CODOR
- **Display:**
  ```
  CODOR
  ├─ Features
  │  ├─ 📁 001-core-features ✅
  │  │  ├─ 📄 spec.md
  │  │  ├─ 📄 plan.md
  │  │  └─ 📋 Tasks (5/5 completed)
  │  ├─ 📁 002-ui-components 🔄
  │  │  ├─ 📄 spec.md
  │  │  ├─ 📄 plan.md
  │  │  └─ 📋 Tasks (2/8 completed)
  │  └─ ➕ New Feature
  └─ Task Queue
     ├─ Current Task
     │  └─ ▶️ T003: Implement user authentication
     └─ Pending (6 tasks hidden)
  ```
- **Actions:**
  - Click feature → Expand/collapse
  - Right-click spec.md → "Open in Editor" | "View in CODOR UI"
  - Right-click feature → "Generate Spec" | "Generate Plan" | "Generate Tasks"
  - Click task → Show details

**FR-010: Task Queue View**
- **Location:** Activity Bar > CODOR > Task Queue
- **Display:**
  - Current task (one at a time)
  - Status indicator (pending, in-progress, completed)
  - Quick actions (Start, Verify & Next)
- **Behavior:**
  - Shows only current task to AI agent
  - Developer can see all tasks via Features view
  - Updates in real-time as tasks complete

**FR-011: Task Details Webview**
- **Trigger:** Click task or "View Task Details"
- **Content:**
  ```
  ┌────────────────────────────────────────┐
  │ Task T003                              │
  ├────────────────────────────────────────┤
  │ Implement user authentication          │
  │                                        │
  │ Description:                           │
  │ Create JWT-based authentication...     │
  │                                        │
  │ Files to Modify:                       │
  │ • src/auth/jwt.ts (create)            │
  │ • src/middleware/auth.ts (create)     │
  │                                        │
  │ Requirements:                          │
  │ • FR-001: User login                  │
  │ • FR-002: Token generation            │
  │ • NFR-003: Security (JWT)             │
  │                                        │
  │ Acceptance Criteria:                   │
  │ ✓ User can login with email/password  │
  │ ✓ JWT token generated on success      │
  │ ✓ Token includes user ID and role     │
  │                                        │
  │ Test Command:                          │
  │ npm test -- auth.test.ts              │
  │                                        │
  │ [Start Task] [Mark Complete]          │
  └────────────────────────────────────────┘
  ```

### 5.4 Spec Kit Integration

**FR-012: Patch Spec Kit Scripts**
- **Actor:** Extension activation
- **Trigger:** Workspace contains `.specify/` folder
- **Process:**
  1. Detect Spec Kit installation
  2. Check if patches already applied (version hash)
  3. If not patched or Spec Kit updated:
     - Backup original scripts
     - Apply minimal patches to:
       - `create-tasks.ps1` (or equivalent)
       - Add environment variable check: `$env:CODOR_INTERCEPT`
       - If set, emit JSON to stdout instead of creating file
     - Store patch version hash
  4. Show notification: "Spec Kit patches applied"
- **Output:** Spec Kit scripts patched for CODOR integration

**FR-013: Call Spec Kit Scripts**
- **Actor:** CODOR command handlers
- **Trigger:** Generate Spec/Plan/Tasks commands
- **Process:**
  1. Set environment variable: `$env:CODOR_INTERCEPT = "true"`
  2. Set context variables (feature ID, name, description)
  3. Execute Spec Kit PowerShell script
  4. Capture stdout (JSON output) or file output
  5. Parse result
  6. Clear environment variables
- **Output:** Spec Kit output captured by CODOR

**FR-014: Reapply Patches on Update**
- **Actor:** Extension file watcher
- **Trigger:** Spec Kit files modified
- **Process:**
  1. Detect changes to `.specify/scripts/`
  2. Calculate new hash
  3. Compare with stored hash
  4. If different:
     - Show notification: "Spec Kit updated, reapplying patches"
     - Reapply patches
     - Update stored hash
- **Output:** Patches stay current with Spec Kit updates

### 5.5 Verification Engine

**FR-015: Run Verification Tests**
- **Actor:** Verification engine
- **Trigger:** "Verify & Next Task" command
- **Process:**
  1. Read task test command from database
  2. Execute test command in terminal
  3. Parse test output (exit code, stdout, stderr)
  4. Extract pass/fail status
  5. Extract test results (if JSON/XML output)
  6. Store results in evidence table
- **Output:** Test results captured

**FR-016: Check Acceptance Criteria**
- **Actor:** Verification engine
- **Trigger:** "Verify & Next Task" command
- **Process:**
  1. Read acceptance criteria from database
  2. For each criterion:
     - Check if associated test passed
     - Check if required files exist
     - Check if requirements covered
  3. Calculate overall pass/fail
  4. Generate report
- **Output:** Acceptance criteria validation report

**FR-017: Collect Evidence**
- **Actor:** Verification engine
- **Trigger:** Task verification (pass or fail)
- **Process:**
  1. Store in evidence table:
     - Task ID
     - Timestamp
     - Verification status (pass/fail/override)
     - Test results
     - Files modified
     - Requirements covered
     - Override reason (if applicable)
  2. Generate evidence JSON file: `.codor/evidence/[task-id].json`
  3. Commit to git (if configured)
- **Output:** Evidence stored and committed

### 5.6 Configuration

**FR-018: Extension Settings**
- **Location:** VS Code Settings > CODOR
- **Settings:**
  - `codor.taskManagement.enabled` (boolean, default: true)
  - `codor.taskManagement.strictMode` (boolean, default: true)
  - `codor.taskManagement.allowManualOverride` (boolean, default: true)
  - `codor.taskManagement.requireOverrideReason` (boolean, default: true)
  - `codor.taskManagement.autoVerifyOnSave` (boolean, default: false)
  - `codor.specKit.autoImportOnGenerate` (boolean, default: true)
  - `codor.specKit.patchingEnabled` (boolean, default: true)
  - `codor.specKit.autoReapplyPatches` (boolean, default: true)
  - `codor.database.path` (string, default: ".codor/tasks.db")
  - `codor.evidence.path` (string, default: ".codor/evidence")
  - `codor.automation.maxRetries` (number, default: 5, range: 1-20)
  - `codor.automation.idleTimeout` (number, default: 10, unit: minutes)
  - `codor.automation.evidenceRetention` (enum, default: "compress-7days", options: "forever", "compress-7days", "delete-30days")
  - `codor.automation.contextStrategy` (enum, default: "hybrid-smart", options: "persistent", "fresh-per-task", "rolling-window", "hybrid-smart")
- **Output:** User-configurable behavior

### 5.5 AI Sprint Automation ⭐ NEW

#### Overview

CODOR's defining feature is **test-driven sprint automation** where the AI agent implements tasks while CODOR enforces quality through automated testing. This section describes the automated sprint execution workflow introduced in design finalization.

#### FR-011: Start Automated Sprint

**Actor:** Developer  
**Trigger:** Command "CODOR: Start Sprint" (on feature with tasks)

**Workflow:**
```
1. Developer clicks "Start Sprint" button
2. CODOR validates prerequisites (tasks exist, tests defined)
3. CODOR loads first task (T001)
4. Loop until all tasks complete:
   a. CODOR prompts AI agent with task context
   b. AI implements task
   c. AI signals completion ("@codor done")
   d. CODOR runs test suite (YAML-driven)
   e. If tests pass → Mark complete, auto-commit, next task
   f. If tests fail → Send errors to AI, bounded retry (max 5)
5. Sprint complete → Generate compliance report
```

**Process Details:**

1. **Task Context Injection:**
   - CODOR builds prompt from spec.md, plan.md, task details
   - Includes acceptance criteria, file paths, requirements
   - Injects recent task context (hybrid smart adaptive strategy)

2. **AI Integration:**
   - Uses VS Code Language Model API (`vscode.lm.selectChatModels`)
   - Sends structured prompt to AI agent
   - Monitors for completion signal ("@codor done")
   - Idle timer (10 min) catches forgotten signals

3. **Test Plan Execution:**
   - CODOR loads YAML test plan for current task
   - Runs linting (ESLint) - BLOCKS if fail
   - Runs build - BLOCKS if fail
   - Runs unit tests - reports failures
   - Runs integration tests - reports failures
   - Runs contract tests (if defined) - reports failures

4. **Completion Detection:**
   - **Primary:** Chat message marker ("@codor done")
   - **Fallback:** File save event detection
   - **Safety:** Idle timer (10 min configurable timeout)

5. **Error Recovery (Bounded):**
   - Max 5 retries per task (configurable 1-20)
   - Structured error feedback to AI:
     ```
     ❌ Task T003 failed verification (attempt 2/5)
     
     **Linting Errors:**
     - src/auth.ts:42 - Missing semicolon
     
     **Test Failures:**
     - AuthService.login should validate email: Expected true, got false
     
     **Files to Fix:**
     - src/auth.ts
     - tests/auth.test.ts
     ```
   - If max retries exceeded → Escalate to developer

6. **Evidence Generation:**
   - Test results (JSON format)
   - Linting report
   - Coverage report (if available)
   - Files modified (git diff)
   - Duration and attempt count
   - Compliance certificate

7. **Auto-Commit:**
   - Commits after each successful task
   - Structured message: `[CODOR] T003: Implement user authentication`
   - Tags: `task/T003`
   - Enables rollback if needed

**Output:** 
- All tasks completed with evidence
- Auto-committed git history
- Compliance report generated
- Sprint summary displayed

---

#### FR-012: Generate Test Plan

**Actor:** AI Agent (automated) or Developer (manual)  
**Trigger:** Task started, no test plan exists

**Process:**
1. CODOR detects missing test plan for task
2. CODOR prompts AI with test plan template:
   ```yaml
   task_id: T001
   description: Add user authentication
   test_suite:
     pre_conditions:
       - name: Linting
         command: npm run lint
         blocking: true
       - name: Build
         command: npm run build
         blocking: true
     
     unit_tests:
       - name: User login validation
         command: npm test -- auth.test.ts
         expected_outcome: All tests pass
     
     integration_tests:
       - name: API authentication flow
         command: npm test -- integration/auth.test.ts
         expected_outcome: All tests pass
     
     acceptance_criteria:
       - description: User can login with valid credentials
         verification: Manual check in UI
   ```
3. AI generates YAML test plan
4. CODOR validates YAML structure
5. Store in `test_plans` table
6. Link to task

**Output:** Test plan stored, ready for execution

---

#### FR-013: Manage Chat Context (Hybrid Smart Adaptive)

**Actor:** CODOR (automated)  
**Trigger:** Task execution during sprint

**Strategy:**
- **Tasks 1-3:** Full persistent chat context
- **Task 4+:** Smart summarization with on-demand injection

**Process:**
1. Load completed tasks for current sprint
2. If ≤ 3 tasks completed:
   - Send full context (all tasks)
3. If > 3 tasks completed:
   - Summarize old tasks (T001-Tn-2): `✅ T001: Setup project - 15min`
   - Full context for recent 2 tasks
   - Detect old task references in AI messages
   - On-demand: Re-inject full context for referenced old task

**Old Task Reference Detection:**
```typescript
// Patterns: "in T001", "like T002", "T003's approach"
const patterns = [
  /\b(T\d{3})\b/i,
  /task\s+(T?\d{3})/i,
  /like\s+(?:in\s+)?(T\d{3})/i
];
```

**Token Budget:**
- T001-T003: ~35k tokens
- T004-T010: ~40k tokens (stable)
- On-demand injection: ~50k tokens (peak)
- Limit: 128k tokens (GPT-4o)

**Benefits:**
- ✅ Foundation building (early tasks full context)
- ✅ Efficient operation (later tasks summarized)
- ✅ On-demand retrieval (AI can reference any old task)
- ✅ No overflow risk (stable 30-50k tokens)
- ✅ Cost-effective (~$0.12/sprint)

**Output:** Optimal context per task, no token overflow

---

#### FR-014: Handle Flaky Tests

**Actor:** CODOR (automated)  
**Trigger:** Test fails multiple times then passes

**Detection Logic:**
```typescript
if (task.attempts >= 2 && currentAttempt.status === 'passed') {
  // Same test failed 2+ times, now passes
  const flakyTests = detectFlakyTests(task);
  if (flakyTests.length > 0) {
    await flagFlakyTests(task.id, flakyTests);
  }
}
```

**Process:**
1. Track test execution history per task
2. If test fails 2+ attempts, then passes:
   - Flag as "flaky test"
   - Store in `flaky_test_flags` table
   - Show warning notification
   - Set review status to "pending"
3. Task still completes (non-blocking)
4. Developer reviews flaky tests later

**Output:** Task completes, flaky tests flagged for review

---

#### FR-015: Manage Evidence Retention

**Actor:** CODOR (automated)  
**Trigger:** Daily/weekly background job

**Policy:** Compress evidence after 7 days (configurable)

**Process:**
1. Scan `evidence/` directory
2. Find directories older than retention threshold
3. For each old directory:
   - Create `.zip` archive
   - Delete original files
   - Update evidence record with archive path
4. Configurable options:
   - "forever" - No compression
   - "compress-7days" - Compress after 7 days (default)
   - "delete-30days" - Delete after 30 days

**Output:** Evidence storage optimized, old evidence preserved

---

## 6. Non-Functional Requirements


### 6.1 Performance

**NFR-001: Database Response Time**
- All database queries complete in < 100ms
- Task list for 1000 tasks loads in < 500ms

**NFR-002: UI Responsiveness**
- Tree views update in < 50ms after database change
- Webview rendering completes in < 200ms

**NFR-003: Script Execution**
- Spec Kit script execution does not block UI
- Progress indicator shown for operations > 1 second

### 6.2 Reliability

**NFR-004: Data Integrity**
- Database uses transactions (ACID compliance)
- No data loss on extension crash
- Database schema versioning and migration

**NFR-005: Error Handling**
- All errors caught and logged
- User-friendly error messages
- Graceful degradation (if database unavailable, show warning)

**NFR-006: Backup and Recovery**
- Database backed up before major operations
- Ability to restore from backup
- Git-friendly database format (committed to repository)

### 6.3 Usability

**NFR-007: Developer Experience**
- Clear visual indicators (icons, colors) for task status
- Keyboard shortcuts for common actions
- Inline help and tooltips

**NFR-008: Onboarding**
- First-run wizard to configure Spec Kit integration
- Sample project template
- Link to documentation

### 6.4 Compatibility

**NFR-009: VS Code Version**
- Supports VS Code >= 1.104.0
- Uses stable APIs only (no proposed APIs)

**NFR-010: Spec Kit Version**
- Compatible with Spec Kit v1.x
- Detects Spec Kit version and adjusts patching

**NFR-011: Cross-Platform**
- Works on Windows, macOS, Linux
- PowerShell Core used for cross-platform script execution

### 6.5 Security

**NFR-012: Script Execution Safety**
- Validates Spec Kit scripts before patching
- No arbitrary code execution
- User confirmation before applying patches

**NFR-013: Data Privacy**
- No telemetry without user consent
- Database stored locally only
- No external API calls

---

## 7. Database Schema

### 7.1 Tables

**features**
```sql
CREATE TABLE features (
  id TEXT PRIMARY KEY,              -- e.g., "001-core-features"
  name TEXT NOT NULL,               -- e.g., "Core Features"
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

**specs**
```sql
CREATE TABLE specs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feature_id TEXT NOT NULL,
  file_path TEXT NOT NULL,         -- e.g., "specs/001-core-features/spec.md"
  content TEXT,                     -- Full markdown content
  created_at TEXT NOT NULL,
  FOREIGN KEY (feature_id) REFERENCES features(id)
);
```

**requirements**
```sql
CREATE TABLE requirements (
  id TEXT PRIMARY KEY,              -- e.g., "FR-001"
  spec_id INTEGER NOT NULL,
  type TEXT NOT NULL,               -- "functional" | "non-functional"
  title TEXT NOT NULL,
  description TEXT,
  FOREIGN KEY (spec_id) REFERENCES specs(id)
);
```

**plans**
```sql
CREATE TABLE plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feature_id TEXT NOT NULL,
  file_path TEXT NOT NULL,         -- e.g., "specs/001-core-features/plan.md"
  content TEXT,                     -- Full markdown content
  created_at TEXT NOT NULL,
  FOREIGN KEY (feature_id) REFERENCES features(id)
);
```

**tasks**
```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,              -- e.g., "T001"
  feature_id TEXT NOT NULL,
  plan_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_paths TEXT,                  -- JSON array of file paths
  status TEXT NOT NULL,             -- "pending" | "in-progress" | "completed" | "completed-override"
  order_index INTEGER NOT NULL,
  test_command TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT,
  FOREIGN KEY (feature_id) REFERENCES features(id),
  FOREIGN KEY (plan_id) REFERENCES plans(id)
);
```

**task_requirements**
```sql
CREATE TABLE task_requirements (
  task_id TEXT NOT NULL,
  requirement_id TEXT NOT NULL,
  PRIMARY KEY (task_id, requirement_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  FOREIGN KEY (requirement_id) REFERENCES requirements(id)
);
```

**acceptance_criteria**
```sql
CREATE TABLE acceptance_criteria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id TEXT NOT NULL,
  description TEXT NOT NULL,
  verified BOOLEAN DEFAULT 0,
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);
```

**evidence**
```sql
CREATE TABLE evidence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id TEXT NOT NULL,
  verification_status TEXT NOT NULL,  -- "pass" | "fail" | "override"
  test_results TEXT,                  -- JSON test output
  files_modified TEXT,                -- JSON array of files
  requirements_covered TEXT,          -- JSON array of requirement IDs
  override_reason TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);
```

**test_plans** ⭐ NEW
```sql
CREATE TABLE test_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id TEXT NOT NULL,
  yaml_content TEXT NOT NULL,         -- YAML test plan definition
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);
```

**test_executions** ⭐ NEW
```sql
CREATE TABLE test_executions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  test_plan_id INTEGER NOT NULL,
  task_id TEXT NOT NULL,
  attempt_number INTEGER NOT NULL,
  status TEXT NOT NULL,               -- "running" | "passed" | "failed"
  results_json TEXT,                  -- Full test output
  duration_minutes INTEGER,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  FOREIGN KEY (test_plan_id) REFERENCES test_plans(id),
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);
```

**sprint_executions** ⭐ NEW
```sql
CREATE TABLE sprint_executions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feature_id TEXT NOT NULL,
  status TEXT NOT NULL,               -- "running" | "completed" | "paused" | "failed"
  total_tasks INTEGER NOT NULL,
  completed_tasks INTEGER NOT NULL,
  failed_tasks INTEGER NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  FOREIGN KEY (feature_id) REFERENCES features(id)
);
```

**flaky_test_flags** ⭐ NEW
```sql
CREATE TABLE flaky_test_flags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id TEXT NOT NULL,
  test_name TEXT NOT NULL,            -- Name of flaky test
  failure_count INTEGER NOT NULL,     -- Number of times it failed
  detected_at TEXT NOT NULL,
  review_status TEXT NOT NULL,        -- "pending" | "reviewed" | "ignored"
  notes TEXT,
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);
```

### 7.2 Indexes

```sql
CREATE INDEX idx_tasks_feature_id ON tasks(feature_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_order ON tasks(order_index);
CREATE INDEX idx_evidence_task_id ON evidence(task_id);
CREATE INDEX idx_test_plans_task_id ON test_plans(task_id);
CREATE INDEX idx_test_executions_task_id ON test_executions(task_id);
CREATE INDEX idx_test_executions_status ON test_executions(status);
CREATE INDEX idx_sprint_executions_feature_id ON sprint_executions(feature_id);
CREATE INDEX idx_sprint_executions_status ON sprint_executions(status);
CREATE INDEX idx_flaky_test_flags_task_id ON flaky_test_flags(task_id);
CREATE INDEX idx_flaky_test_flags_review_status ON flaky_test_flags(review_status);
```

---

## 8. User Interface Specifications

### 8.1 Commands

| Command ID | Title | Icon | When Available |
|------------|-------|------|----------------|
| `codor.newFeature` | CODOR: New Feature | $(add) | Always |
| `codor.generateSpec` | CODOR: Generate Specification | $(file-text) | Feature selected without spec |
| `codor.generatePlan` | CODOR: Generate Plan | $(list-tree) | Feature with spec, no plan |
| `codor.generateTasks` | CODOR: Generate Tasks | $(checklist) | Feature with plan, no tasks |
| `codor.startTask` | CODOR: Start Task | $(play) | Pending task selected |
| `codor.verifyAndNext` | CODOR: Verify & Next Task | $(pass) | In-progress task selected |
| `codor.viewTaskDetails` | CODOR: View Task Details | - | Any task selected |
| `codor.openInEditor` | CODOR: Open in Editor | - | Spec/plan file selected |
| `codor.viewInUI` | CODOR: View in CODOR UI | - | Spec/plan file selected |
| `codor.refreshTasks` | CODOR: Refresh | $(refresh) | Always |
| `codor.applySpecKitPatches` | CODOR: Apply Spec Kit Patches | - | Spec Kit detected |
| `codor.checkSpecKitPatches` | CODOR: Check Spec Kit Patches | - | Always |

### 8.2 Views

**Features View (`codor-features`)**
- Type: TreeDataProvider
- Location: CODOR activity bar
- Refresh: On database change
- Context values:
  - `feature` - Feature item
  - `spec-file` - Spec.md file
  - `plan-file` - Plan.md file
  - `tasks-group` - Tasks group

**Task Queue View (`codor-task-queue`)**
- Type: TreeDataProvider
- Location: CODOR activity bar
- Refresh: On task status change
- Context values:
  - `current-task` - Currently active task
  - `pending-task` - Next pending task
  - `completed-task` - Completed task

### 8.3 Webviews

**Task Details Webview**
- Title: "Task [ID]: [Title]"
- Content: HTML/CSS/JavaScript
- Data: Fetched from database via message passing
- Actions: Start, Complete, View Evidence

**Feature Creation Webview**
- Title: "New Feature"
- Content: Form with name and description inputs
- Validation: Client-side and server-side
- Submit: Creates feature and closes webview

---

## 9. Implementation Phases

### Phase 1: Test Plan Engine (Week 1-2) ⭐ UPDATED
- ✅ Extension scaffold complete
- [ ] Database schema implementation (including new tables: test_plans, test_executions, sprint_executions, flaky_test_flags)
- [ ] Basic CRUD operations for features, specs, plans, tasks
- [ ] Database migrations system
- [ ] Test plan YAML template definition
- [ ] AI prompt for test plan generation (using VS Code Language Model API)
- [ ] YAML validation and parsing
- [ ] Test plan storage and versioning
- [ ] Unit tests for database layer

### Phase 2: Sprint Automation Core (Week 3-4) ⭐ NEW
- [ ] Sprint controller implementation
- [ ] Task executor with AI integration (vscode.lm.selectChatModels)
- [ ] Completion detection (chat marker + idle timer)
- [ ] Test suite runner (YAML-driven execution)
- [ ] Bounded error recovery (max 5 retries)
- [ ] Auto-commit implementation with git tagging
- [ ] Evidence generation and storage
- [ ] Integration tests for sprint workflow

### Phase 3: Context Management (Week 5-6) ⭐ NEW
- [ ] ContextManager class implementation
- [ ] Hybrid Smart Adaptive strategy
- [ ] Old task reference detection (regex patterns)
- [ ] On-demand context injection
- [ ] Token budget monitoring
- [ ] Chat history persistence
- [ ] Context optimization tests

### Phase 4: UI Components (Week 7-8) ⭐ UPDATED
- [ ] Features tree view implementation
- [ ] Task queue tree view with status icons
- [ ] Sprint progress tree view (visual task status)
- [ ] Status bar updates (current task, elapsed time)
- [ ] Task details webview
- [ ] Feature creation webview
- [ ] Sprint control panel (Start/Pause/Resume/Stop)
- [ ] Command handlers implementation
- [ ] UI state management

### Phase 5: Quality & Management (Week 9-10) ⭐ NEW
- [ ] Flaky test detection and flagging
- [ ] Evidence retention policy (compression)
- [ ] Sprint execution reporting
- [ ] Compliance certificate generation
- [ ] Manual override workflow
- [ ] Configuration UI (settings)
- [ ] Performance optimization
- [ ] End-to-end testing

### Phase 6: Polish and Release (Week 11-12) ⭐ NEW
- [ ] Spec Kit integration refinement
- [ ] Error handling and edge cases
- [ ] Documentation and help system
- [ ] User onboarding flow
- [ ] Beta testing
- [ ] Marketplace preparation
- [ ] Release v1.0.0

---

## 10. Success Criteria

### 10.1 Functional Success

- ✅ Developer can create features via CODOR UI
- ✅ Specs, plans, and tasks generated via Spec Kit integration
- ✅ Tasks stored in database, NOT as tasks.md file
- ✅ AI agent sees only one task at a time
- ✅ Task completion requires verification
- ✅ Evidence collected for all tasks
- ✅ Spec Kit patches apply automatically and persist across updates

### 10.2 Quality Metrics

- ✅ 90%+ code coverage with unit tests
- ✅ Zero critical bugs in production
- ✅ < 100ms database query response time
- ✅ < 5 seconds for Spec Kit script execution
- ✅ 100% of tasks have verifiable evidence
- ✅ AI sprint automation completes 10-task sprint with <5 manual interventions ⭐ NEW
- ✅ Test plan generation success rate > 95% ⭐ NEW
- ✅ Context overflow rate < 1% (hybrid smart adaptive) ⭐ NEW
- ✅ Evidence compression reduces storage by > 60% after 30 days ⭐ NEW

### 10.3 User Satisfaction

- ✅ Positive feedback from beta testers
- ✅ < 10 minute onboarding time
- ✅ No manual `tasks.md` management needed
- ✅ Clear visibility into task progress
- ✅ Reliable AI agent task compliance
- ✅ Automated sprint reduces developer effort by > 70% ⭐ NEW
- ✅ Flaky test detection prevents false positives ⭐ NEW

---

## 11. Risks and Mitigations

### 11.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Spec Kit updates break patches | High | Medium | Version detection, auto-reapply, backup scripts |
| Database corruption | High | Low | Transaction safety, backups, git commits |
| AI agent bypasses CODOR | High | Medium | Remove tasks.md entirely, file watching |
| Cross-platform script issues | Medium | Medium | PowerShell Core, platform detection |
| Performance with large projects | Medium | Low | Database indexing, lazy loading, pagination |
| **AI context overflow (>128k tokens)** ⭐ NEW | **High** | **Low** | **Hybrid smart adaptive context, token monitoring** |
| **Test plan generation failures** ⭐ NEW | **Medium** | **Medium** | **Template validation, fallback to manual, retry logic** |
| **Idle timer false positives** ⭐ NEW | **Low** | **Medium** | **Configurable timeout, manual override, log analysis** |
| **Flaky tests block progress** ⭐ NEW | **Medium** | **Low** | **Detection and flagging, non-blocking completion** |

### 11.2 Process Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Spec Kit team rejects patches | Medium | Low | Contribute upstream, maintain fork |
| User adoption resistance | Medium | Medium | Clear documentation, video tutorials |
| Maintenance burden | Medium | High | Automated testing, CI/CD, community contributions |
| **AI cost escalation (large sprints)** ⭐ NEW | **Low** | **Medium** | **Context management, cost monitoring, budget alerts** |
| **Developer over-reliance on automation** ⭐ NEW | **Medium** | **High** | **Evidence review workflow, manual checkpoints** |

---

## 12. Future Enhancements

### 12.1 Version 2.0 Features

- Multi-user collaboration (shared database)
- Real-time task status sync
- Advanced analytics dashboard
- Custom verification plugins
- Integration with other AI coding tools (not just Copilot)
- Visual task dependency graph editor
- Automated technical debt tracking
- Integration with JIRA, GitHub Issues
- **Large spec handling (Spec Kit integration for >5k line specs)** ⭐ NEW
- **Multi-AI agent support (parallel task execution)** ⭐ NEW
- **Advanced flaky test analytics** ⭐ NEW
- **Sprint templates and presets** ⭐ NEW

### 12.2 Version 3.0 Vision

- Standalone task orchestration platform
- Language-agnostic (support for Rust, Go, Python Spec Kits)
- Cloud-hosted verification service
- Machine learning for task estimation
- Predictive failure detection
- Automated refactoring suggestions
- **AI cost optimization engine** ⭐ NEW
- **Cross-project context sharing** ⭐ NEW

---

## 13. References

### 13.1 Design Documents

1. `docs/CODOR-AS-SPEC-KIT-FRONTEND.md` - UI wrapper vision
2. `docs/SPEC-KIT-AUGMENTATION-STRATEGY.md` - Integration approach
3. `docs/SPEC-KIT-WORKFLOW-INTERCEPTION.md` - Task interception design
4. `docs/UI-STRATEGY-DECISION.md` - UI architecture
5. `docs/API-INTEGRATION-DECISION.md` - Communication approach
6. `docs/WORKFLOW-INTERCEPTION-RISKS.md` - Risk analysis
7. **`docs/AI-AGENT-AUTOMATION-DESIGN.md`** - Test-driven sprint automation ⭐ NEW
8. **`docs/DESIGN-DECISIONS-SUMMARY.md`** - Executive summary of design decisions ⭐ NEW
7. `docs/SPEC-KIT-STRUCTURE-ANALYSIS.md` - Spec Kit internals
8. `docs/INTEGRATION-COMPLETE.md` - Scaffold integration summary
9. `docs/PACKAGE-JSON-CONFIG.md` - Extension configuration reference

### 13.2 External Dependencies

- **VS Code Extension API:** https://code.visualstudio.com/api
- **better-sqlite3:** https://github.com/WiseLibs/better-sqlite3
- **GitHub Spec Kit:** https://github.com/githubnext/copilot-workspace-user-manual
- **TypeScript:** https://www.typescriptlang.org/
- **ESLint:** https://eslint.org/

---

## 14. Glossary

| Term | Definition |
|------|------------|
| **AI Agent** | GitHub Copilot Workspace, Cursor, or similar AI-powered coding assistant |
| **CODOR** | Contract-Driven Outcome Reliability - the task management and verification system |
| **Spec Kit** | GitHub's specification-driven development framework |
| **Task Drift** | When AI agent works on tasks out of order or invents tasks |
| **Verification Gate** | Automated check that must pass before next task is provided |
| **Evidence** | Audit trail of test results, files modified, and requirements covered |
| **Acceptance Criteria** | Specific conditions that must be met for task to be considered complete |
| **Override** | Manual approval to proceed despite verification failure |
| **Patch** | Minimal modification to Spec Kit scripts for CODOR integration |
| **Test Plan** ⭐ NEW | YAML-based definition of tests to run for a task |
| **Sprint Execution** ⭐ NEW | Automated process of AI implementing all tasks in sequence |
| **Hybrid Smart Adaptive** ⭐ NEW | Context management strategy balancing quality, cost, and overflow risk |
| **Flaky Test** ⭐ NEW | Test that fails inconsistently, then passes without code changes |
| **Bounded Retry** ⭐ NEW | Error recovery with maximum attempt limit (default 5) |
| **Context Injection** ⭐ NEW | Adding old task details when AI references them |
| **Auto-Commit** ⭐ NEW | Automatic git commit after each successful task completion |

---

## 15. Approval

This specification requires review and approval from:

- [ ] **Technical Lead:** Architecture and feasibility
- [ ] **Product Owner:** Feature completeness and priorities
- [ ] **UX Designer:** User interface and workflows
- [ ] **QA Lead:** Testability and success criteria
- [ ] **Security Reviewer:** Security and privacy considerations

**Approval Date:** _________________

**Version Approved:** _________________

---

**Document History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0-draft | Sept 30, 2025 | System | Initial specification |
| 1.1.0-draft | Oct 1, 2025 | System | AI Sprint Automation integrated (FR-011 to FR-015, DB schema updates, implementation phases revised) |

---

**END OF SPECIFICATION**
