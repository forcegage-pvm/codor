# AI Agent Automation Design
**CODOR Extension - Test-Driven Sprint Automation**

*Created: October 1, 2025*  
*Status: Design Phase - Philosophy Refinement*

---

## 1. Overview

This document defines the **test-driven sprint automation system** where CODOR enforces quality through rigorous testing, allowing the AI agent autonomy within the boundaries of passing tests.

### 1.1 Core Philosophy: Trust but Verify

```
AI Agent = Skilled but prone to shortcuts
CODOR = Test enforcer, not process manager
Developer = Strategic oversight, not tactical intervention
```

**The Problem We're Solving**:
- ❌ AI takes shortcuts (ignores linting, fabricates results)
- ❌ AI claims "it works" without proper validation
- ❌ Shortcuts compound across tasks, creating technical debt
- ✅ **Solution**: Block progress until ALL tests pass (unit, integration, linting, contract)

### 1.2 Key Principles

1. **Test-Driven Enforcement**: Comprehensive testing validates ALL task outputs
2. **Guided Autonomy**: AI has freedom to implement, but with safety guardrails
3. **Pragmatic Process Control**: Manage critical checkpoints without micromanaging workflow
4. **Full Visibility**: Developer observes progress and can intervene strategically
5. **Test Plan Tracking**: CODOR's CORE purpose—track test plans per task using YAML schema
6. **Traceability**: Auto-commit per task for rollback points and audit trail

---

## 2. Sprint Execution Workflow

### 2.1 High-Level Flow (Test-Driven)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Developer: Clicks "Start Sprint" in CODOR Tree View     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. CODOR: Loads sprint, initializes test enforcement       │
│    - Validates test suite exists for each task              │
│    - Creates test execution pipeline                        │
│    - Sets test failure policy: BLOCK ALL PROGRESS           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. CODOR: Prompts AI with T001 + test requirements         │
│    "Implement T001. ALL tests must pass:                   │
│     ✓ Unit tests, ✓ Integration tests,                     │
│     ✓ Linting, ✓ Contract validation"                      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. AI Agent: Full autonomy to implement                    │
│    - Writes code (may take shortcuts, fabricate)            │
│    - Installs dependencies, seeds data, configs             │
│    - Signals "@codor done" when ready                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. CODOR: Runs FULL test suite (the moment of truth)       │
│    - Unit tests (Jest/Mocha/pytest)                         │
│    - Integration tests (API contracts)                      │
│    - Linting (ESLint/Prettier/Pylint)                       │
│    - Contract tests (spec-kit validation)                   │
│    - Build verification                                     │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
    ✅ ALL PASS       ❌ ANY FAIL
        │                 │
        │                 ▼
        │   ┌──────────────────────────────────────┐
        │   │ CODOR: Blocks progression            │
        │   │ "T001 BLOCKED - Fix these errors:"  │
        │   │                                      │
        │   │ ❌ ESLint: 12 errors                │
        │   │ ❌ Unit tests: 3 failures           │
        │   │ ❌ Contract: Missing endpoint       │
        │   │                                      │
        │   │ "Fix ALL errors and signal done"    │
        │   └────────┬─────────────────────────────┘
        │            │
        │            └─────┐ (unlimited retries)
        │                  │ AI MUST solve ALL issues
        │                  │ (code, env, tooling, config)
        │                  │
        ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. CODOR: Task complete, generate evidence                 │
│    - Test reports saved                                     │
│    - Coverage metrics captured                              │
│    - Linting clean report                                   │
│    - Contract compliance certificate                        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. CODOR: Advances to T002, repeats from step 3            │
└─────────────────────────────────────────────────────────────┘
                 │
                 ▼
         Sprint completes when:
         ✅ All tasks pass ALL tests
         🛑 Developer stops execution
         ⚠️ AI declares unresolvable blocker
```

### 2.2 Critical Difference from Previous Design

| **Previous Design** | **Test-Driven Design** |
|---------------------|-------------------------|
| Manage AI's process | Let AI work autonomously |
| Retry limits (max 3) | Unlimited retries (must pass) |
| Idle timers/reprompts | No idle management (trust AI) |
| File-based completion signals | Simple chat marker only |
| Progress reporting | No intermediate progress |
| Error classification | All errors treated equally |
| Developer confirms steps | Developer observes strategically |

**Philosophy**: AI is skilled at implementation and problem-solving. Don't constrain its process—enforce its outputs through comprehensive testing.

---

## 3. Task Initiation: Simplified Prompt

### 3.1 Lean Prompt Template (No Micromanagement)

```markdown
🚀 **CODOR Sprint: Task T001**

## Implementation Required
**Task**: Add customer search endpoint
**Sprint**: S001 - Core Features Sprint

## Specification
📄 Full spec: `specs/001-core-features/F001-customer-search.md`

[FULL SPEC CONTENT EMBEDDED - ~500 lines]

## Acceptance Criteria (Test Suite)
Your implementation MUST pass all these tests:

✅ **Unit Tests**: `npm test -- customers.test.ts`
✅ **Integration Tests**: `npm run test:integration -- search.test.ts`
✅ **Linting**: `npm run lint` (0 errors, 0 warnings)
✅ **Contract Tests**: `npm run contract:validate -- T001`
✅ **Build**: `npm run build` (no errors)

## Database Schema
```sql
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT
);
```

## Your Mission
1. Implement the task according to spec
2. Ensure ALL tests pass
3. Fix ANY errors (code, environment, tooling, config—you own it)
4. Type `@codor done` when ALL tests pass

## Rules
- No shortcuts—tests will catch them
- Linting errors BLOCK progress
- Failed tests BLOCK progress
- You can install dependencies, seed data, modify configs
- Fix everything yourself—no manual intervention expected

**CODOR will run the full test suite when you signal done.**

Begin implementation.
```

### 3.2 Context Delivery: Full Injection (Simple & Clear)

**Strategy**: Embed everything the AI needs in one prompt
- ✅ Full specification (don't make AI hunt for files)
- ✅ Full plan (implementation guidance)
- ✅ Database schema (relevant tables only)
- ✅ Test commands (exact commands to run)
- ✅ Acceptance criteria (what defines "done")

**No file references** like "read this file"—just give the content directly.

**Token Budget**: ~20k tokens per prompt (GPT-4o handles it easily)

## 4. Completion Detection: Hybrid Approach

### 4.1 Primary: Chat Marker Detection

**Implementation**:
```typescript
chatParticipant.onDidReceiveMessage((message) => {
  if (message.content.includes('@codor done')) {
    taskCompletionHandler.triggerTests(currentTask);
  }
});
```

### 4.2 Idle Timer Safety Net

**Purpose**: Catch when AI completes work but forgets to signal `@codor done`

**Implementation**:
```typescript
class IdleMonitor {
  private lastActivity: Date;
  private idleThreshold: number = 10 * 60 * 1000; // 10 minutes (configurable)
  
  startMonitoring(task: Task) {
    this.lastActivity = new Date();
    
    // Watch for activity
    this.watchChatActivity();
    this.watchFileChanges();
    this.watchTerminalActivity();
    
    // Check every 60 seconds
    setInterval(() => {
      const idleTime = Date.now() - this.lastActivity.getTime();
      
      if (idleTime > this.idleThreshold) {
        this.handleIdleTimeout(task);
      }
    }, 60000);
  }
  
  handleIdleTimeout(task: Task) {
    // Gentle nudge
    chat.sendMessage(`
⏰ **CODOR: Idle Detected (${Math.floor(idleTime / 60000)} min)**

Are you done with ${task.id}? 

If complete, type \`@codor done\` to run tests.
If still working, any response will reset the timer.
    `);
  }
}
```

**Configuration**:
```json
"codor.automation.idleTimeout": {
  "type": "number",
  "default": 600, // 10 minutes
  "description": "Idle timeout (seconds) before prompting AI"
}
```

**Use Case**: AI finishes implementation, runs tests manually, verifies it works, then... forgets to signal. Idle timer catches this.

### 4.3 Manual Override

Developer can type `@codor done` anytime to trigger tests

---

## 5. Test Execution: YAML-Based Test Plan Engine

### 5.1 CORE WORKFLOW: Test Plan Generation

**This is CODOR's primary purpose—track test plans per task using YAML schema**

**Workflow**:
```
1. Sprint created → Tasks generated
2. For each task:
   a) CODOR prompts AI: "Generate test plan for T001 using YAML template"
   b) AI analyzes task + spec
   c) AI produces YAML test plan
   d) CODOR validates YAML
   e) CODOR stores test plan in database
   f) Test plan used for execution
```

**Test Plan YAML Template**:
```yaml
task_id: T001
title: "Add customer search endpoint"

test_plan:
  setup:
    - command: "npm run db:seed:customers"
      description: "Seed test data"
    
  tests:
    - id: AC001
      name: "Performance - Response time"
      type: "integration"
      command: "npm run test:integration -- search-performance.test.ts"
      expected_exit_code: 0
      timeout: 30
      
    - id: AC002
      name: "Functionality - JSON response"
      type: "integration"
      command: "npm run test:integration -- search-response.test.ts"
      expected_exit_code: 0
      
    - id: AC003
      name: "Code quality - Linting"
      type: "linting"
      command: "npm run lint -- src/api/customers/**"
      expected_exit_code: 0
      strict_warnings: true
      
    - id: AC004
      name: "Contract validation"
      type: "contract"
      command: "npm run contract:validate -- T001"
      expected_exit_code: 0
  
  teardown:
    - command: "npm run db:reset"
      description: "Clean test data"

  coverage:
    enabled: true
    threshold: 80
    paths:
      - "src/api/customers/**"
```

**AI Prompt for Test Plan Generation**:
```markdown
🧪 **CODOR: Generate Test Plan for ${task.id}**

## Task Specification
[FULL SPEC EMBEDDED]

## YAML Template
Use this exact structure to define your test plan:

```yaml
task_id: ${task.id}
title: "${task.title}"

test_plan:
  setup: []
  tests: []
  teardown: []
  coverage:
    enabled: true
    threshold: 80
```

## Requirements
1. Create tests for EVERY acceptance criterion
2. Include setup/teardown if data/environment prep needed
3. Use existing test commands from package.json
4. Specify exact test files/patterns
5. Enable coverage with appropriate threshold

Reply with ONLY the YAML (no explanation).
```

### 5.2 Test Plan Storage (Database Schema)

```sql
CREATE TABLE test_plans (
  id INTEGER PRIMARY KEY,
  task_id TEXT NOT NULL,
  yaml_content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);

CREATE TABLE test_executions (
  id INTEGER PRIMARY KEY,
  test_plan_id INTEGER NOT NULL,
  attempt_number INTEGER NOT NULL,
  status TEXT CHECK(status IN ('running', 'passed', 'failed')),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  results_json TEXT, -- Detailed results
  FOREIGN KEY (test_plan_id) REFERENCES test_plans(id)
);
```

### 5.3 Test Execution Pipeline (YAML-Driven)

```typescript
async function executeTestPlan(task: Task): Promise<TestResult> {
  // 1. Load test plan from database
  const testPlan = await db.getTestPlan(task.id);
  const yaml = YAML.parse(testPlan.yaml_content);
  
  console.log(`🧪 Executing test plan for ${task.id}...`);
  
  // 2. Run setup scripts
  for (const setup of yaml.test_plan.setup || []) {
    console.log(`  Setup: ${setup.description}`);
    await runCommand(setup.command);
  }
  
  // 3. Run all tests (fail fast)
  const results: TestResult[] = [];
  for (const test of yaml.test_plan.tests) {
    console.log(`  Running ${test.name}...`);
    
    const result = await executeTest({
      name: test.name,
      command: test.command,
      expectedExitCode: test.expected_exit_code || 0,
      timeout: test.timeout || 300,
      strictWarnings: test.strict_warnings || false
    });
    
    results.push(result);
    
    if (!result.passed) {
      console.log(`  ❌ ${test.name} FAILED`);
      break; // Fail fast
    }
  }
  
  // 4. Check coverage (if enabled)
  if (yaml.test_plan.coverage?.enabled) {
    const coverage = await checkCoverage(yaml.test_plan.coverage);
    results.push(coverage);
  }
  
  // 5. Run teardown scripts
  for (const teardown of yaml.test_plan.teardown || []) {
    console.log(`  Teardown: ${teardown.description}`);
    await runCommand(teardown.command);
  }
  
  return {
    taskId: task.id,
    passed: results.every(r => r.passed),
    results: results,
    timestamp: new Date()
  };
}
```

### 5.4 Test Plan Versioning

**Track test plan changes** (AI might refine it after failures):

```typescript
async function updateTestPlan(task: Task, newYaml: string) {
  // Archive current version
  const current = await db.getTestPlan(task.id);
  await db.archiveTestPlan(current);
  
  // Save new version
  await db.updateTestPlan({
    task_id: task.id,
    yaml_content: newYaml,
    updated_at: new Date()
  });
  
  console.log(`Updated test plan for ${task.id} (v${version})`);
}
```

---

## 6. Error Feedback: Bounded Autonomous Fixing

### 6.1 Configurable Retry Limits (Prevent Fabrication Escalation)

**Problem Observed**: After multiple retries, AI starts fabricating solutions ("let me try a simpler approach", "let's skip this for now")

**Solution**: Bounded retries with configurable limit

**Configuration**:
```json
"codor.automation.maxRetries": {
  "type": "number",
  "default": 5,
  "description": "Maximum retry attempts before escalation"
}
```

**Retry Logic**:
```typescript
async function handleTestFailure(
  task: Task, 
  testResult: TestResult, 
  attempt: number
): Promise<void> {
  const maxRetries = vscode.workspace.getConfiguration('codor.automation')
    .get<number>('maxRetries', 5);
  
  if (attempt > maxRetries) {
    // Escalate to developer
    await pauseAndEscalate(task, testResult, attempt);
    return;
  }
  
  // Send error feedback to AI
  const errorPrompt = constructErrorFeedback(task, testResult, attempt);
  await chat.sendMessage(errorPrompt);
  
  // Wait for next attempt
}

async function pauseAndEscalate(
  task: Task, 
  testResult: TestResult, 
  attempts: number
): Promise<void> {
  await chat.sendMessage(`
⚠️ **CODOR: Maximum Retries Exceeded**

Task ${task.id} failed after ${attempts} attempts.

**Last Error**:
${formatTestErrors(testResult)}

**Developer Action Required**:
- Review the errors above
- Fix manually or adjust task requirements
- Type \`@codor retry\` to restart task
- Type \`@codor skip\` to skip task
- Type \`@codor stop\` to stop sprint
  `);
  
  // Pause sprint execution
  await sprintController.pause();
  
  // Notify developer via VS Code notification
  vscode.window.showWarningMessage(
    `CODOR: Task ${task.id} blocked after ${attempts} retries`,
    'Review', 'Skip', 'Stop Sprint'
  );
}
```

**Rationale**:
- ✅ AI gets multiple attempts to solve (5 tries reasonable)
- ✅ Prevents infinite loops and escalating fabrication
- ✅ Developer can override limit via settings
- ✅ Clear escalation path when stuck

### 6.2 Error Feedback Prompt

```typescript
function constructErrorFeedback(task: Task, testResult: TestResult): string {
  const failedTests = testResult.results.filter(r => !r.passed);
  
  return `
❌ **CODOR: Task ${task.id} BLOCKED - Test Failures**

Your implementation failed these tests:

${failedTests.map(test => `
## ${test.name} FAILED

**Command**: \`${test.command}\`
**Exit Code**: ${test.exitCode}

**Output**:
\`\`\`
${test.stderr || test.stdout}
\`\`\`
`).join('\n---\n')}

## Required Actions
1. Analyze each failure above
2. Fix ALL errors (code, environment, tooling, config)
3. Verify locally that tests pass
4. Type \`@codor done\` when ALL tests pass

**You own this problem.** Fix everything yourself:
- Missing dependencies? Install them (\`npm install\`)
- Config issues? Update configs
- Database issues? Seed data, run migrations
- Linting errors? Fix the code
- Environment issues? Set up environment

**Progress is BLOCKED until ALL tests pass.**

Begin fixing now.
  `;
}
```

### 6.3 AI Autonomy: Full Problem Ownership

**AI can and should**:
- ✅ Install npm packages (`npm install axios`)
- ✅ Run database migrations (`npm run db:migrate`)
- ✅ Seed test data (`npm run db:seed`)
- ✅ Update configs (`.eslintrc.json`, `tsconfig.json`)
- ✅ Fix linting errors (remove unused imports, fix formatting)
- ✅ Set up environment variables (`.env` files)
- ✅ Install system dependencies (if needed and possible)

**Developer only intervenes if**:
- AI declares: `@codor blocker: Cannot access external API for integration tests`
- AI declares: `@codor blocker: Need AWS credentials for deployment test`
- AI stops responding (developer observes chat is idle)

### 6.4 Blocker Declaration (AI's Escape Hatch)

**If AI truly cannot solve an issue** (before hitting max retries):

```
@codor blocker: [clear description of unresolvable issue]
```

**Example**:
```
@codor blocker: Integration tests require production database credentials 
which I cannot access. Manual intervention needed.
```

**CODOR response**:
1. Pause sprint execution
2. Notify developer with blocker details
3. Wait for developer to resolve or skip task

---

## 7. Progress Tracking: Visual Task/Sprint List

### 7.1 Tree View Progress Indicator

**CODOR Tree View** shows real-time sprint progress:

```
Sprint: S001 - Core Features
├─ ✅ T001: Add customer search (12 min)
├─ ✅ T002: Add order search (8 min)
├─ 🔵 T003: Add product search (in progress - 4 min)
│   ├─ ⏳ Tests: 2/5 passed
│   ├─ ⚠️ Retry: 2/5
├─ ⏳ T004: Add inventory sync
├─ ⏳ T005: Add reporting dashboard
└─ ⏳ T006: Add export functionality

Sprint Progress: 2/6 tasks (33%)
Estimated time remaining: ~45 min
```

**Tree Item Implementation**:
```typescript
class TaskTreeItem extends vscode.TreeItem {
  constructor(public task: Task, public execution?: TaskExecution) {
    super(task.title, vscode.TreeItemCollapsibleState.Collapsed);
    
    // Status icons
    this.iconPath = this.getStatusIcon();
    
    // Description shows progress
    this.description = this.getProgressDescription();
    
    // Tooltip shows details
    this.tooltip = this.getTooltip();
  }
  
  private getStatusIcon(): vscode.ThemeIcon {
    switch (this.task.status) {
      case 'completed': return new vscode.ThemeIcon('check', 
        new vscode.ThemeColor('testing.iconPassed'));
      case 'in-progress': return new vscode.ThemeIcon('sync~spin',
        new vscode.ThemeColor('testing.iconQueued'));
      case 'failed': return new vscode.ThemeIcon('error',
        new vscode.ThemeColor('testing.iconFailed'));
      case 'blocked': return new vscode.ThemeIcon('warning',
        new vscode.ThemeColor('testing.iconErrored'));
      default: return new vscode.ThemeIcon('circle-outline');
    }
  }
  
  private getProgressDescription(): string {
    if (this.task.status === 'completed') {
      return `✅ ${this.execution?.duration || 0}min`;
    }
    
    if (this.task.status === 'in-progress' && this.execution) {
      const elapsed = Math.floor((Date.now() - this.execution.started_at.getTime()) / 60000);
      const retry = this.execution.attempt_number > 1 
        ? ` (retry ${this.execution.attempt_number})` 
        : '';
      return `⏱️ ${elapsed}min${retry}`;
    }
    
    return '⏳ Pending';
  }
  
  private getTooltip(): string {
    if (this.task.status === 'failed' && this.execution) {
      return `Failed after ${this.execution.attempt_number} attempts\nLast error: ${this.execution.last_error}`;
    }
    
    return this.task.description;
  }
}
```

### 7.2 Status Bar Updates

**VS Code Status Bar** shows current task:

```typescript
const statusBarItem = vscode.window.createStatusBarItem(
  vscode.StatusBarAlignment.Left,
  100
);

function updateStatusBar(task: Task, execution: TaskExecution) {
  if (task.status === 'in-progress') {
    const elapsed = Math.floor((Date.now() - execution.started_at.getTime()) / 60000);
    statusBarItem.text = `$(sync~spin) CODOR: ${task.id} (${elapsed}min)`;
    statusBarItem.tooltip = `${task.title}\nAttempt ${execution.attempt_number}`;
    statusBarItem.show();
  } else if (task.status === 'completed') {
    statusBarItem.text = `$(check) CODOR: Sprint 2/6 complete`;
    statusBarItem.tooltip = `Last: ${task.id} - ${task.title}`;
  }
}
```

### 7.3 No AI Progress Reporting Required

**Developer sees progress via**:
- Tree view (task statuses)
- Status bar (current task)
- Chat (AI's natural work updates)

**AI doesn't need to report** `@codor progress: 50%`—visual indicators are sufficient

---

## 8. Evidence & Traceability: Auto-Commit Per Task

### 8.1 Comprehensive Evidence Capture

**On ALL tests passing**:
```typescript
async function generateEvidence(task: Task, testResult: TestResult) {
  const evidencePath = `evidence/${task.id}/`;
  await fs.mkdir(evidencePath, { recursive: true });
  
  // 1. Test plan (YAML)
  await saveTestPlan(evidencePath, task);
  
  // 2. Test execution results
  await saveTestResults(evidencePath, testResult);
  
  // 3. Linting report (proof of clean code)
  await saveLintingReport(evidencePath);
  
  // 4. Coverage report (if configured)
  await saveCoverageReport(evidencePath);
  
  // 5. Contract compliance certificate
  await saveContractCertificate(evidencePath, task);
  
  // 6. Build artifacts (proof it compiles)
  await saveBuildLog(evidencePath);
  
  // 7. Acceptance criteria checklist
  await saveAcceptanceChecklist(evidencePath, task);
  
  // Update database
  await db.createEvidence({
    task_id: task.id,
    path: evidencePath,
    passed: true,
    created_at: new Date()
  });
}
```

**Evidence Structure**:
```
evidence/
  T001/
    test-plan.yaml          # AI-generated test plan
    test-results.json       # All test outputs
    linting-report.txt      # ESLint clean report
    coverage-report.html    # Code coverage
    contract-certificate.json  # Spec-kit validation
    build-log.txt           # TypeScript compilation log
    acceptance-checklist.md # Human-readable checklist
    attempt-1/              # Failed attempts (for review)
      errors.log
      test-results.json
    attempt-2/
      errors.log
      test-results.json
```

### 8.2 Auto-Commit: Traceability & Rollback Points

**Commit after EVERY successful task**:

```typescript
async function completeTask(task: Task, testResult: TestResult) {
  // 1. Generate evidence
  await generateEvidence(task, testResult);
  
  // 2. Stage all changes
  await runCommand('git add .');
  
  // 3. Create structured commit
  const commitMessage = `feat(${task.id}): ${task.title}

Automated implementation by CODOR

Tests:
${testResult.results.map(r => `  ✅ ${r.name}: PASSED`).join('\n')}

Coverage: ${testResult.coverage || 'N/A'}
Evidence: evidence/${task.id}/
Duration: ${testResult.duration}s
Attempts: ${testResult.attempts}

Co-authored-by: CODOR <codor@automation>`;

  await runCommand(`git commit -m "${commitMessage}"`);
  
  // 4. Tag commit for easy reference
  await runCommand(`git tag task/${task.id}`);
  
  // 5. Update task status
  await db.updateTask(task.id, { 
    status: 'completed',
    commit_sha: await getLastCommitSha(),
    completed_at: new Date()
  });
  
  console.log(`✅ Task ${task.id} committed: ${commitMessage}`);
}
```

**Benefits**:
- ✅ **Rollback**: Can revert to any task (`git reset --hard task/T003`)
- ✅ **Audit**: Git history shows what CODOR did
- ✅ **Review**: Developer can review commits later
- ✅ **Traceability**: Each task has unique commit + tag
- ✅ **Evidence**: All test results committed with code

### 8.3 Failed Attempt Evidence Retention

**Save ALL retry attempts** for developer review:

```typescript
async function saveFailedAttempt(task: Task, attempt: number, error: TestResult) {
  const attemptPath = `evidence/${task.id}/attempt-${attempt}/`;
  await fs.mkdir(attemptPath, { recursive: true });
  
  // Save error details
  await fs.writeFile(
    `${attemptPath}/errors.log`,
    formatTestErrors(error)
  );
  
  await fs.writeFile(
    `${attemptPath}/test-results.json`,
    JSON.stringify(error, null, 2)
  );
  
  // Save snapshot of code at failure
  await runCommand(`git stash push -m "CODOR-T${task.id}-attempt-${attempt}"`);
}
```

**Use case**: Developer can review why task needed 4 retries

---

## 9. Technical Debt: Simplified Handling

### 9.1 No Auto-Categorization (Developer Decides)

**AI can report blockers**, but doesn't categorize or modify task queue:

```
@codor blocker: [description of issue]
```

**CODOR response**:
1. Pause sprint
2. Show blocker to developer
3. Developer decides:
   - Fix it manually → Resume
   - Skip task → Move to next
   - Add as new task → Update queue manually
   - Stop sprint → Review strategy

**No automatic task queue modification**—keep it simple

### 9.2 Non-Blocking Issues (TODOs)

**AI can note non-blocking issues** in code comments:
```typescript
// TODO: Optimize this query (currently O(n^2))
// TODO: Add caching for frequently accessed customers
```

**Developer reviews TODOs later** (not during sprint)

---

## 10. Sprint Control & Developer Intervention

### 10.1 Developer Role: Strategic Oversight

**Developer observes via**:
- Tree view (task progress with checkmarks)
- Status bar (current task + elapsed time)
- Chat (full AI conversation)

**Developer intervenes when**:
1. AI declares blocker
2. Max retries exceeded
3. Developer wants to skip/stop
4. Reviewing flaky tests flagged by CODOR

**Developer does NOT**:
- ❌ Micromanage AI's implementation process
- ❌ Review intermediate progress
- ❌ Approve each step

### 10.2 Control Commands (Simple)

**Tree View Buttons**:
- 🚀 **Start Sprint**
- ⏹️ **Stop Sprint** (immediate stop)
- ⏭️ **Skip Task** (mark as skipped, move to next)
- 🔄 **Retry Task** (restart current task from attempt 1)

**Chat Commands**:
- `@codor stop` → Stop sprint
- `@codor skip` → Skip current task
- `@codor retry` → Restart current task
- `@codor status` → Show sprint progress

---

## 11. Configuration: Balanced Settings

### 11.1 Configuration Schema

```json
{
  "codor.automation.enabled": {
    "type": "boolean",
    "default": true,
    "description": "Enable automated sprint execution"
  },
  "codor.automation.maxRetries": {
    "type": "number",
    "default": 5,
    "minimum": 1,
    "maximum": 20,
    "description": "Maximum retry attempts before developer escalation"
  },
  "codor.automation.idleTimeout": {
    "type": "number",
    "default": 600,
    "description": "Idle timeout (seconds) before prompting AI (0 to disable)"
  },
  "codor.automation.strictLinting": {
    "type": "boolean",
    "default": true,
    "description": "Treat linting warnings as failures"
  },
  "codor.automation.coverageThreshold": {
    "type": "number",
    "default": 80,
    "minimum": 0,
    "maximum": 100,
    "description": "Minimum code coverage % to pass (0 to disable)"
  },
  "codor.automation.autoCommit": {
    "type": "boolean",
    "default": true,
    "description": "Automatically commit after successful task completion"
  },
  "codor.automation.failFast": {
    "type": "boolean",
    "default": true,
    "description": "Stop testing on first failure"
  },
  "codor.automation.chatVisibility": {
    "type": "string",
    "enum": ["always-visible", "auto-hide"],
    "default": "always-visible",
    "description": "Chat panel visibility during automation"
  },
  "codor.automation.evidenceRetention": {
    "type": "string",
    "enum": ["forever", "compress-7days", "delete-30days"],
    "default": "compress-7days",
    "description": "Evidence storage policy"
  }
}
```

---

## 12. GAP RESOLUTIONS

### Gap A: Test Plan Generation & Tracking ✅ RESOLVED

**Decision**: Use YAML-based test plan engine (Section 5)

**Workflow**:
1. After tasks generated → CODOR prompts AI to create test plan per task
2. AI uses YAML template to define tests
3. CODOR validates and stores YAML in database
4. Test execution engine runs YAML-defined tests
5. Test plans versioned (AI can refine after failures)

**Database**:
- `test_plans` table stores YAML per task
- `test_executions` table tracks execution attempts
- Full history preserved for audit

**This is CODOR's CORE PURPOSE** ✅

---

### Gap B: Evidence Storage Policy ✅ RESOLVED

**Decision**: Compress evidence after 7 days (configurable)

**Rationale**:
- ✅ **Performance**: Old evidence compressed to save disk space
- ✅ **Traceability**: Never deleted, always available
- ✅ **Best practice**: Balance between retention and performance

**Implementation**:
```typescript
// Background job runs daily
async function compressOldEvidence() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const oldEvidence = await db.getEvidenceOlderThan(sevenDaysAgo);
  
  for (const evidence of oldEvidence) {
    if (!evidence.compressed) {
      await compressDirectory(evidence.path);
      await db.updateEvidence(evidence.id, { compressed: true });
    }
  }
}
```

**Configuration**:
```json
"codor.automation.evidenceRetention": {
  "enum": ["forever", "compress-7days", "delete-30days"],
  "default": "compress-7days"
}
```

---

### Gap C: Flaky Test Handling ✅ RESOLVED

**Decision**: Flag flaky tests for developer review (don't block sprint)

**Detection Logic**:
```typescript
interface TestHistory {
  test_id: string;
  attempts: TestAttempt[];
}

function detectFlakyTest(history: TestHistory): boolean {
  // Flaky = fails multiple times, then passes
  const failures = history.attempts.filter(a => !a.passed).length;
  const finalPass = history.attempts[history.attempts.length - 1].passed;
  
  return failures >= 2 && finalPass;
}

async function handleFlakyTest(task: Task, testId: string) {
  // Flag in database
  await db.createFlakyTestFlag({
    task_id: task.id,
    test_id: testId,
    detected_at: new Date(),
    review_status: 'pending'
  });
  
  // Notify developer (non-blocking)
  vscode.window.showWarningMessage(
    `⚠️ Flaky test detected in ${task.id}: ${testId}`,
    'Review Now', 'Review Later'
  ).then(choice => {
    if (choice === 'Review Now') {
      openFlakyTestReport(task, testId);
    }
  });
  
  // Add to task metadata
  await db.updateTask(task.id, {
    metadata: { flaky_tests: [testId] }
  });
}
```

**Tree View Badge**:
```
✅ T001: Add customer search ⚠️ (flaky test)
```

**Developer can review later**:
- View flaky test list in CODOR panel
- See which tests are unstable
- Fix or mark as known issue

---

### Gap D: Large Spec Handling 🔮 DEFERRED

**Decision**: Defer to Spec Kit (future enhancement)

**Rationale**:
- Not CODOR's problem—Spec Kit should enforce manageable spec sizes
- Large specs indicate poor feature decomposition
- Workaround (if needed): Manual spec summarization before sprint

**Future Enhancement** (v2):
- Auto-summarize specs > 5k lines
- Prompt developer to split large features
- Support spec chunking/references

---

### Gap E: Chat History Persistence ✅ RESOLVED

**Decision**: Hybrid Smart Adaptive context management (Option D)

**Strategy**: Adaptive context with on-demand old task injection

**Implementation**:
```typescript
class ContextManager {
  private maxFullTasksInContext = 3;
  
  async buildContext(currentTask: Task, chatHistory: Message[]): Promise<string> {
    const completedTasks = await db.getCompletedTasksInSprint(currentTask.sprint_id);
    
    // Early sprint (T001-T003): Keep full context
    if (completedTasks.length <= this.maxFullTasksInContext) {
      return this.buildFullContext(completedTasks, currentTask);
    }
    
    // Later sprint (T004+): Smart summarization
    const recentFull = completedTasks.slice(-2); // Last 2 tasks full context
    const oldSummaries = completedTasks.slice(0, -2).map(t => 
      `✅ ${t.id}: ${t.title} - Completed in ${t.duration}min`
    );
    
    // Detect if AI is referencing old task
    const lastMessage = chatHistory[chatHistory.length - 1];
    const referencedOldTask = this.detectOldTaskReference(lastMessage.content);
    
    if (referencedOldTask) {
      // On-demand: Re-inject old task full context
      console.log(`Injecting old task context: ${referencedOldTask}`);
      const oldTaskContext = await this.getTaskFullContext(referencedOldTask);
      return this.buildHybridContext(oldSummaries, recentFull, currentTask, oldTaskContext);
    }
    
    // Normal: Summaries + recent full
    return this.buildHybridContext(oldSummaries, recentFull, currentTask);
  }
  
  private detectOldTaskReference(message: string): string | null {
    // Detect patterns: "in T001", "like T002", "T003's approach", "how we did T004"
    const patterns = [
      /\b(T\d{3})\b/i,                    // T001
      /task\s+(T?\d{3})/i,                // task 001 or task T001
      /like\s+(?:in\s+)?(T\d{3})/i,      // like in T001
      /(?:how|what|when)\s+.*?(T\d{3})/i // how did we do T001
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        const taskId = match[1].startsWith('T') ? match[1] : `T${match[1].padStart(3, '0')}`;
        return taskId;
      }
    }
    
    return null;
  }
  
  private buildHybridContext(
    oldSummaries: string[],
    recentTasks: Task[],
    currentTask: Task,
    oldTaskContext?: string
  ): string {
    return `
# Sprint: ${currentTask.sprint_id}

## Completed Tasks (Summary)
${oldSummaries.join('\n')}

${oldTaskContext ? `
## Referenced Task (Full Context)
${oldTaskContext}
` : ''}

## Recent Tasks (Full Context)
${recentTasks.map(t => this.buildTaskContext(t)).join('\n\n')}

## Current Task
${this.buildTaskContext(currentTask)}
    `;
  }
  
  private async getTaskFullContext(taskId: string): Promise<string> {
    const task = await db.getTask(taskId);
    const testPlan = await db.getTestPlan(taskId);
    const evidence = await db.getEvidence(taskId);
    
    return `
### ${task.id}: ${task.title}

**Status**: ${task.status}
**Duration**: ${task.duration}min
**Attempts**: ${task.attempts}

**Implementation Notes**:
${task.implementation_notes || 'N/A'}

**Test Plan**:
\`\`\`yaml
${testPlan.yaml_content}
\`\`\`

**Evidence**: ${evidence.path}
    `;
  }
}
```

**Token Budget Management**:
```typescript
interface TokenBudget {
  maxContextTokens: 50000;      // Safety limit (under 128k)
  estimatedSpecTokens: 15000;    // Typical spec size
  estimatedTaskTokens: 2000;     // Task description
  estimatedHistoryTokens: 25000; // Recent chat history
}

// Estimated token usage by sprint phase:
// T001-T003: ~35k tokens (full context)
// T004-T010: ~40k tokens (summaries + recent + current)
// On-demand: ~50k tokens (summaries + recent + old task + current)
```

**Benefits**:
- ✅ Foundation building (T001-T003 full context)
- ✅ Efficient operation (T004+ summarized old tasks)
- ✅ On-demand retrieval (AI can reference any old task)
- ✅ No overflow risk (stable 30-50k tokens)
- ✅ Cost-effective (~$0.12/sprint vs $0.27 persistent)

---

## 12. Simplified Architecture Diagram

```
┌──────────────────────────────────────────────────────┐
│                  CODOR Extension                     │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │  Sprint Controller                         │    │
│  │  - Load tasks from DB                      │    │
│  │  - Execute tasks sequentially              │    │
│  │  - Enforce test-driven progression         │    │
│  └────────────┬───────────────────────────────┘    │
│               │                                      │
│               ▼                                      │
│  ┌────────────────────────────────────────────┐    │
│  │  Task Executor                             │    │
│  │  - Build prompt (spec + tests)             │    │
│  │  - Send to AI via chat                     │    │
│  │  - Wait for "@codor done"                  │    │
│  └────────────┬───────────────────────────────┘    │
│               │                                      │
│               ▼                                      │
│  ┌────────────────────────────────────────────┐    │
│  │  Test Suite Runner                         │    │
│  │  - Run linting (BLOCK if fail)             │    │
│  │  - Run build (BLOCK if fail)               │    │
│  │  - Run unit tests                          │    │
│  │  - Run integration tests                   │    │
│  │  - Run contract tests                      │    │
│  └────────────┬───────────────────────────────┘    │
│               │                                      │
│      ┌────────┴────────┐                            │
│      ▼                 ▼                            │
│   ✅ PASS          ❌ FAIL                         │
│      │                 │                            │
│      │                 ▼                            │
│      │    ┌────────────────────────────┐           │
│      │    │  Error Feedback            │           │
│      │    │  - Send errors to AI       │           │
│      │    │  - Unlimited retries       │           │
│      │    │  - AI must fix everything  │           │
│      │    └────────┬───────────────────┘           │
│      │             │                                │
│      │             └──────┐ (loop)                  │
│      │                    │                         │
│      ▼                    ▼                         │
│  ┌────────────────────────────────────────────┐    │
│  │  Evidence Generator                        │    │
│  │  - Save test results                       │    │
│  │  - Save linting report                     │    │
│  │  - Save coverage report                    │    │
│  │  - Create compliance certificate           │    │
│  └────────────┬───────────────────────────────┘    │
│               │                                      │
│               ▼                                      │
│  ┌────────────────────────────────────────────┐    │
│  │  Git Auto-Commit                           │    │
│  │  - Commit completed task                   │    │
│  │  - Structured commit message               │    │
│  └────────────┬───────────────────────────────┘    │
│               │                                      │
│               ▼                                      │
│       Move to next task                              │
│                                                      │
└──────────────────────────────────────────────────────┘

External Interactions:
- VS Code Chat API → Send prompts to AI
- VS Code Language Model API → (optional) programmatic prompting
- File System → Save evidence
- Git → Auto-commit
- Terminal → Run test commands
```

---

## 13. Implementation Phases (Revised)

### Phase 1: Core Test Enforcement (Week 1)
- Database schema for tasks, acceptance criteria, test commands
- Basic sprint controller (load tasks, loop through them)
- Chat prompt construction (spec + test requirements)
- Completion detection (`@codor done` marker)
- Test suite runner (execute all tests sequentially)
- Pass/fail logic (block on any failure)

### Phase 2: Error Feedback Loop (Week 1)
- Error parsing and formatting
- Feedback prompt construction
- Unlimited retry mechanism
- Blocker detection (`@codor blocker:`)

### Phase 3: Evidence & Commits (Week 2)
- Evidence directory structure
- Save test results, linting reports, coverage
- Auto-commit after successful task
- Evidence viewer in CODOR tree view

### Phase 4: Developer Controls (Week 2)
- Stop sprint command
- Skip task command
- Sprint progress UI
- Chat visibility settings

### Phase 5: Advanced Testing (Week 3)
- Code coverage enforcement
- Per-task setup/teardown scripts
- Contract validation integration
- Build verification

---

## 14. Success Metrics (Test-Focused)

### Test Enforcement Effectiveness
- **0 linting errors** in completed sprints
- **100% test pass rate** before task completion
- **Reduced shortcuts** (measure via code review)

### AI Autonomy
- **% of tasks completed** without developer intervention
- **Average retry attempts** per task (expect 2-3 due to strict testing)
- **Blocker frequency** (should be rare)

### Developer Experience
- **Time saved** on repetitive testing/verification
- **Confidence** in sprint output quality
- **Chat visibility** clarity

### Quality Metrics
- **Code coverage** maintained/improved
- **Technical debt** accumulation rate
- **Production bugs** from sprint code (should decrease)

---

## 15. Final Gaps for Discussion

### Gap A: Test Command Discovery
**Question**: If a task doesn't have explicit test commands in DB, how does CODOR know what to run?

**Options**:
1. **Fail hard** (require all tasks to have test commands defined)
2. **Convention** (default to `npm test`, `npm run lint`, `npm run build`)
3. **AI discovers** (prompt AI to identify test commands from package.json)

**Recommendation**: **2** - Convention-based defaults with DB override

### Gap B: Evidence Storage Limits
**Question**: What if evidence directory grows too large (1000s of tasks)?

**Options**:
1. **No limits** (keep everything forever)
2. **Retention policy** (delete evidence older than 30 days)
3. **Compression** (zip old evidence directories)

**Recommendation**: **3** - Compress evidence older than 7 days

### Gap C: Test Flakiness Handling
**Question**: What if a test is flaky (passes 80% of the time)?

**Current behavior**: AI retries until it passes
**Problem**: Could retry 20 times for a flaky test

**Options**:
1. **Accept it** (flaky tests will eventually pass)
2. **Max retries per specific test** (not per task)
3. **Flaky test detection** (if same test fails 3x then passes, flag it)

**Recommendation**: **3** - Detect and flag flaky tests for developer review

### Gap D: AI Context Window Overflow
**Question**: What if spec.md is 10,000 lines (exceeds prompt token limit)?

**Options**:
1. **Truncate** (risk losing important context)
2. **Summarize** (use AI to summarize spec first)
3. **Chunk** (send spec in pieces, not all at once)

**Recommendation**: **2** - Auto-summarize if spec > 5k lines

### Gap E: Chat History Across Sprint ✅ RESOLVED
**Question**: Does chat persist all 10 tasks or clear between tasks?

**Decision**: Hybrid Smart Adaptive (see detailed implementation above)

**Summary**:
- Tasks 1-3: Persistent full context
- Task 4+: Summaries + recent 2 full + on-demand old task injection
- Token budget: 30-50k stable (under 128k limit)
- Cost: ~$0.12/sprint

---

## 16. Final Gaps Summary

**All gaps resolved!** ✅

- ✅ **Gap A**: Convention-based test discovery with DB override
- ✅ **Gap B**: Compress evidence after 7 days (configurable)
- ✅ **Gap C**: Detect and flag flaky tests for review
- ✅ **Gap D**: Defer to Spec Kit for large specs (future enhancement)
- ✅ **Gap E**: Hybrid Smart Adaptive chat history with on-demand injection

---

## 17. Next Steps

### Immediate Actions
1. ✅ **All design gaps resolved**
2. ⏳ **Receive UI design mockups from user**
3. ⏳ **Update SPECIFICATION.md with automation design**
4. ⏳ **Implement database schema updates** (test_plans, test_executions, sprint_executions, flaky_test_flags)

### Implementation Phases
- **Phase 1**: Test Plan Engine (YAML generation, storage, validation)
- **Phase 2**: Sprint Automation (task execution, test running, auto-commit)
- **Phase 3**: Context Management (ContextManager class, on-demand injection)
- **Phase 4**: Visual Progress (tree view, status bar, notifications)

---

**Document Status**: ✅ Design Finalized - All Gaps Resolved  
**Awaiting**: UI design mockups from user  
**Ready for**: SPECIFICATION.md update and Phase 1 implementation
