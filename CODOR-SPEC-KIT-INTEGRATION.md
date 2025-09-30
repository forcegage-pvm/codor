# CODOR + GitHub Spec Kit Integration Design
**Date:** September 30, 2025  
**Purpose:** AI Agent Quality Control for Spec-Driven Development (SDD)

---

## The Real Problem

**GitHub Copilot Workspace is implementing your Spec Kit tasks, but how do you know:**
- ✅ The AI actually implemented what the spec requires?
- ✅ The acceptance criteria are met?
- ✅ The AI didn't fabricate or skip requirements?
- ✅ The code works as described in tasks.md?

**Answer: CODOR Extension as Quality Gate**

---

## Current Spec Kit Workflow

```
1. Developer runs /specify
   └─> Creates specs/001-core-features/spec.md
       └─> Contains user stories, acceptance criteria, functional requirements

2. Developer runs /plan
   └─> Creates specs/001-core-features/plan.md
   └─> Creates specs/001-core-features/data-model.md
   └─> Creates specs/001-core-features/contracts/
   └─> Creates specs/001-core-features/quickstart.md

3. Developer runs /tasks
   └─> Creates specs/001-core-features/tasks.md
       └─> T001-T052: Numbered, dependency-ordered tasks
       └─> Tasks marked [P] for parallel execution

4. GitHub Copilot Workspace implements tasks
   └─> Developer monitors via checkboxes: [ ] → [x]
   └─> NO VERIFICATION that implementation matches spec
   └─> Trust-based: assumes AI did it correctly

5. Manual testing (time-consuming, incomplete)
```

**PROBLEM: Gap between task completion [x] and actual verification ✅**

---

## New Workflow with CODOR Integration

```
1. Developer runs /specify, /plan, /tasks
   └─> Spec Kit generates specs/001-core-features/

2. CODOR Extension activates
   └─> Parses tasks.md
   └─> Generates CODOR test specifications from:
       ├─> Acceptance scenarios (spec.md)
       ├─> Contract tests (contracts/)
       ├─> Integration tests (quickstart.md)
       └─> Functional requirements (spec.md)

3. GitHub Copilot Workspace implements tasks
   └─> Marks tasks: [ ] → [x]

4. CODOR monitors file changes (watch mode)
   └─> Detects T022 [x] Customer model completed
   └─> Automatically runs CODOR tests for T022
   └─> Results:
       ├─> ✅ Customer validation works
       ├─> ❌ Branch relationship validation missing
       └─> ⚠️  Performance: Slow query (320ms)

5. CODOR updates tasks.md
   └─> [x] T022 Customer model ✅ Verified (1 debt item)
   └─> Writes evidence to specs/001-core-features/evidence/

6. Developer/Copilot sees results
   └─> Fix issues before moving to next task
   └─> AI can self-correct based on evidence

7. Sprint completion
   └─> All tasks verified: ✅ or ❌
   └─> Evidence trail for audit
   └─> Quality metrics in spec.md
```

---

## Spec Kit File Structure (Your Current Format)

```
specs/
├── 001-core-features/
│   ├── spec.md                  # Spec Kit generated (DO NOT MODIFY)
│   ├── tasks.md                 # Spec Kit generated → CODOR updates
│   ├── plan.md                  # Spec Kit generated
│   ├── data-model.md            # Spec Kit generated
│   ├── quickstart.md            # Spec Kit generated
│   ├── contracts/               # Spec Kit generated
│   │   ├── api-spec.json
│   │   └── component-contracts.md
│   └── .codor/                  # CODOR-managed directory
│       ├── test-specs/          # Generated CODOR test specs
│       │   ├── T022-customer-model.yaml
│       │   ├── T027-quote-model.yaml
│       │   └── T040-quote-api.yaml
│       └── evidence/            # Test results
│           ├── T022-results.json
│           ├── T027-results.json
│           └── execution-report.json
```

**Key Principle:** 
- **Spec Kit files** (spec.md, plan.md, contracts/) = **Source of Truth** (read-only for CODOR)
- **tasks.md** = **Progress Tracker** (CODOR updates status)
- **.codor/** = **CODOR-managed** (test specs + evidence)

---

## CODOR Extension Integration Points

### 1. Spec Kit Task Parser

**Reads tasks.md and extracts tasks:**

```typescript
interface SpecKitTask {
  id: string;                    // "T022"
  parallel: boolean;             // [P] marker
  title: string;                 // "Customer model with validation"
  filePath: string;              // "packages/web/src/models/Customer.ts"
  status: 'pending' | 'complete' | 'verified' | 'failed';
  
  // Extracted from spec.md
  relatedRequirements: string[]; // ["FR-001", "FR-002", "FR-003"]
  acceptanceCriteria: string[];  // From spec.md user stories
  
  // CODOR tracking
  codorTestSpec?: string;        // ".codor/test-specs/T022-customer-model.yaml"
  verification?: {
    status: 'verified' | 'failed' | 'debt-detected';
    timestamp: Date;
    results: TestResults;
  };
}
```

**Example parsing tasks.md:**

```markdown
# From tasks.md:
- [x] T022 [P] Customer model with validation in packages/web/src/models/Customer.ts
```

**Parsed as:**
```typescript
{
  id: "T022",
  parallel: true,
  title: "Customer model with validation",
  filePath: "packages/web/src/models/Customer.ts",
  status: "complete",  // [x] checkbox
  relatedRequirements: ["FR-001", "FR-002", "FR-003", "FR-004", "FR-005", "FR-006"],
  acceptanceCriteria: [
    "System MUST allow creation and management of two customer types",
    "System MUST support parent company structures with multiple branches",
    "System MUST allow invoicing against either parent company or branches"
  ]
}
```

### 2. Automatic Test Generation from Spec Kit

**CODOR reads Spec Kit artifacts and generates CODOR test specs:**

```typescript
class SpecKitTestGenerator {
  async generateTestsForTask(task: SpecKitTask): Promise<CodorTestSpec> {
    const spec = await this.loadSpec('specs/001-core-features/spec.md');
    const contracts = await this.loadContracts('specs/001-core-features/contracts/');
    
    // Extract relevant acceptance criteria
    const criteria = this.extractCriteriaForTask(task, spec);
    
    // Generate CODOR test spec
    return {
      version: '5.0',
      metadata: {
        specKitFeature: '001-core-features',
        taskId: task.id,
        generatedFrom: 'spec-kit',
        requirements: task.relatedRequirements
      },
      tasks: {
        [`VERIFY_${task.id}`]: {
          title: `Verify: ${task.title}`,
          testExecution: {
            steps: await this.generateSteps(task, criteria, contracts)
          }
        }
      }
    };
  }
  
  async generateSteps(task: SpecKitTask, criteria: string[], contracts: any[]): Promise<TestStep[]> {
    // Different strategies based on task type
    
    if (task.filePath.includes('/models/')) {
      // Model task → Generate validation tests
      return this.generateModelTests(task, criteria);
    }
    
    if (task.filePath.includes('/api/')) {
      // API task → Generate contract tests from contracts/
      return this.generateAPITests(task, contracts);
    }
    
    if (task.filePath.includes('/components/')) {
      // Component task → Generate component tests
      return this.generateComponentTests(task, criteria);
    }
    
    // Integration task → Generate end-to-end tests
    return this.generateIntegrationTests(task, criteria);
  }
}
```

**Example Generated Test: T022 Customer Model**

```yaml
# .codor/test-specs/T022-customer-model.yaml
version: "5.0"

metadata:
  specKitFeature: "001-core-features"
  taskId: "T022"
  generatedFrom: "spec-kit"
  requirements: ["FR-001", "FR-002", "FR-003", "FR-004", "FR-005", "FR-006"]
  sourceSpec: "specs/001-core-features/spec.md"

tasks:
  VERIFY_T022:
    title: "Verify: Customer model with validation"
    
    testExecution:
      steps:
        # Test FR-001: Two customer types
        - type: TERMINAL_COMMAND
          description: "Test retail customer creation"
          command: "npm test -- --testNamePattern='Customer model.*retail customer'"
          expectedExitCode: 0
          
        - type: TERMINAL_COMMAND
          description: "Test individual consumer creation"
          command: "npm test -- --testNamePattern='Customer model.*individual consumer'"
          expectedExitCode: 0
        
        # Test FR-002: Parent-branch structure
        - type: TERMINAL_COMMAND
          description: "Test branch relationship validation"
          command: "npm test -- --testNamePattern='Customer model.*branch relationship'"
          expectedExitCode: 0
        
        # Test FR-004: Payment terms storage
        - type: TERMINAL_COMMAND
          description: "Test payment terms validation"
          command: "npm test -- --testNamePattern='Customer model.*payment terms'"
          expectedExitCode: 0
        
        # Test FR-005: Contact information
        - type: TERMINAL_COMMAND
          description: "Test contact information validation"
          command: "npm test -- --testNamePattern='Customer model.*contact information'"
          expectedExitCode: 0
        
        # Test FR-006: Complex customer names
        - type: TERMINAL_COMMAND
          description: "Test trading alias handling"
          command: "npm test -- --testNamePattern='Customer model.*trading alias'"
          expectedExitCode: 0
      
      validation:
        - type: CUSTOM
          description: "All Customer model tests must pass"
```

**Example Generated Test: T040 Quote API**

```yaml
# .codor/test-specs/T040-quote-api.yaml
version: "5.0"

metadata:
  specKitFeature: "001-core-features"
  taskId: "T040"
  generatedFrom: "spec-kit"
  requirements: ["FR-015", "FR-016", "FR-017"]
  contracts: ["contracts/api-spec.json"]

tasks:
  VERIFY_T040:
    title: "Verify: Quote API endpoints"
    
    testExecution:
      prerequisites:
        - type: TERMINAL_COMMAND
          description: "Start development server"
          command: "npm run dev"
          isBackground: true
          
        - type: DELAY
          duration: 3000  # Wait for server startup
      
      steps:
        # Test from contracts/api-spec.json
        - type: HTTP_REQUEST
          description: "POST /api/v1/quotes creates quote"
          method: POST
          url: "http://localhost:3000/api/v1/quotes"
          headers:
            Content-Type: "application/json"
          body:
            customerId: "cust-001"
            items:
              - productId: "prod-001"
                quantity: 50
                unitPrice: 315.00
          expectedStatus: 201
          validation:
            - type: JSON_PATH_EXISTS
              path: "$.id"
            - type: JSON_PATH_EXISTS
              path: "$.quoteNumber"
            - type: RESPONSE_CONTAINS
              contains: ["customerId", "items", "totalAmount"]
        
        # Test FR-016: Multi-line quotes
        - type: HTTP_REQUEST
          description: "Create multi-line quote"
          method: POST
          url: "http://localhost:3000/api/v1/quotes"
          body:
            customerId: "cust-002"
            items:
              - productId: "prod-001"
                quantity: 10
              - productId: "prod-003"
                quantity: 20
              - productId: "prod-007"
                quantity: 5
          expectedStatus: 201
          validation:
            - type: CUSTOM
              description: "Verify total amount calculation"
      
      cleanup:
        - type: TERMINAL_COMMAND
          command: "pkill -f 'npm run dev'"
```

### 3. Watch Mode: Auto-Test on Task Completion

**CODOR monitors tasks.md changes:**

```typescript
class SpecKitMonitor {
  private tasksWatcher: vscode.FileSystemWatcher;
  private codeWatcher: vscode.FileSystemWatcher;
  
  startMonitoring() {
    // Watch tasks.md for checkbox changes
    this.tasksWatcher = vscode.workspace.createFileSystemWatcher(
      'specs/**/tasks.md'
    );
    
    this.tasksWatcher.onDidChange(async (uri) => {
      // Parse tasks.md
      const tasks = await this.parseTasksFile(uri);
      
      // Find newly completed tasks
      const newlyCompleted = tasks.filter(t => 
        t.status === 'complete' && !t.verification
      );
      
      // Run tests for newly completed tasks
      for (const task of newlyCompleted) {
        await this.verifyTask(task);
      }
    });
    
    // Watch code files mentioned in tasks
    this.codeWatcher = vscode.workspace.createFileSystemWatcher(
      '{packages,src}/**/*.{ts,tsx,js,jsx,py}'
    );
    
    this.codeWatcher.onDidSave(async (uri) => {
      // Find tasks related to this file
      const relatedTasks = await this.findTasksByFilePath(uri.fsPath);
      
      // Re-run tests for affected tasks
      for (const task of relatedTasks) {
        if (task.status === 'complete') {
          await this.verifyTask(task);
        }
      }
    });
  }
  
  async verifyTask(task: SpecKitTask) {
    // Generate or load test spec
    const testSpec = await this.getTestSpecForTask(task);
    
    // Run CODOR test
    const results = await this.codorEngine.execute(testSpec);
    
    // Update task verification
    task.verification = {
      status: results.summary.failed > 0 ? 'failed' : 'verified',
      timestamp: new Date(),
      results: results
    };
    
    // Write evidence
    await this.writeEvidence(task, results);
    
    // Update tasks.md
    await this.updateTasksMarkdown(task);
    
    // Notify user
    this.notifyUser(task);
  }
}
```

### 4. Updating tasks.md with Results

**CODOR updates tasks.md inline:**

```typescript
async function updateTasksMarkdown(task: SpecKitTask) {
  const tasksPath = `specs/${task.featureId}/tasks.md`;
  let content = await fs.readFile(tasksPath, 'utf-8');
  
  const oldLine = `- [x] ${task.id} ${task.parallel ? '[P] ' : ''}${task.title}`;
  let newLine;
  
  if (task.verification.status === 'verified') {
    newLine = `- [x] ${task.id} ${task.parallel ? '[P] ' : ''}${task.title} ✅ Verified`;
  } else if (task.verification.status === 'failed') {
    const evidencePath = `.codor/evidence/${task.id}-results.json`;
    newLine = `- [x] ${task.id} ${task.parallel ? '[P] ' : ''}${task.title} ❌ Tests failing - [Evidence](${evidencePath})`;
  } else if (task.verification.status === 'debt-detected') {
    const debtCount = task.verification.results.technicalDebt?.length || 0;
    newLine = `- [x] ${task.id} ${task.parallel ? '[P] ' : ''}${task.title} ⚠️  ${debtCount} debt item(s)`;
  }
  
  content = content.replace(oldLine, newLine);
  
  await fs.writeFile(tasksPath, content);
}
```

**Before:**
```markdown
- [x] T022 [P] Customer model with validation in packages/web/src/models/Customer.ts
- [x] T027 [P] Quote model with validation in packages/web/src/models/Quote.ts
- [ ] T040 POST /api/v1/quotes endpoint
```

**After:**
```markdown
- [x] T022 [P] Customer model with validation in packages/web/src/models/Customer.ts ✅ Verified
- [x] T027 [P] Quote model with validation in packages/web/src/models/Quote.ts ❌ Tests failing - [Evidence](.codor/evidence/T027-results.json)
- [ ] T040 POST /api/v1/quotes endpoint
```

### 5. Extension UI for Spec Kit Integration

**Tree View:**

```
📁 Spec Kit Features
├── 📁 001-core-features (75% verified)
│   ├── 📝 spec.md
│   ├── 📋 tasks.md (52 tasks: 39 complete, 29 verified, 4 failed, 6 debt)
│   ├── 📊 Quality Metrics
│   │   ├── ✅ Verified: 29/39 (74%)
│   │   ├── ❌ Failed: 4/39 (10%)
│   │   ├── ⚠️  Technical Debt: 6 items
│   │   └── ⏱️  Avg Test Duration: 234ms
│   │
│   ├── 📦 Phase 3.1: Setup (5/5 verified)
│   │   ├── ✅ T001: Create Next.js project
│   │   ├── ✅ T002: Initialize API structure
│   │   ├── ✅ T003: Initialize components
│   │   ├── ✅ T004: Configure linting
│   │   └── ✅ T005: Tailwind CSS setup
│   │
│   ├── 🧪 Phase 3.2: Tests First (17/17 verified)
│   │   ├── ✅ T006: Contract test GET /api/v1/customers
│   │   ├── ✅ T007: Contract test POST /api/v1/customers
│   │   └── ... (all tests verified)
│   │
│   ├── 🏗️ Phase 3.3: Core Implementation (7/17 tasks)
│   │   ├── ✅ T022: Customer model ✅ Verified
│   │   ├── ✅ T023: Branch model ✅ Verified
│   │   ├── ✅ T024: BillTo model ⚠️  1 debt item
│   │   │   └── 🐌 Performance: Slow validation (320ms)
│   │   ├── ✅ T025: Product model ✅ Verified
│   │   ├── ✅ T026: Pricelist model ✅ Verified
│   │   ├── ✅ T027: Quote model ❌ Tests failing
│   │   │   ├── 🔴 FR-017 not implemented
│   │   │   ├── Expected: Retail pricing applied
│   │   │   ├── Actual: All items use consumer pricing
│   │   │   └── 📝 [View Evidence](.codor/evidence/T027-results.json)
│   │   ├── ✅ T028: Invoice model ✅ Verified
│   │   └── ⏳ T029: Payment model (not started)
│   │
│   └── 📂 Evidence Files
│       ├── execution-report.json
│       ├── T022-results.json
│       ├── T027-results.json
│       └── quality-summary.md
│
└── 📁 002-002-core-ui (not monitored)
```

**Status Bar:**
```
CODOR: 001-core-features | ✅ 29 | ❌ 4 | ⚠️ 6 debt | 🔄 Watch: ON
```

**Command Palette:**
```
> CODOR: Verify Current Task
> CODOR: Verify All Completed Tasks
> CODOR: Show Quality Metrics
> CODOR: Generate Missing Tests
> CODOR: Open Evidence Viewer
> CODOR: Toggle Watch Mode
```

---

## Evidence Storage

### Evidence Files Structure

```
specs/001-core-features/.codor/evidence/
├── execution-report.json       # Latest full run
├── T022-results.json           # Per-task results
├── T027-results.json
├── T040-results.json
└── quality-summary.md          # Human-readable summary
```

### T027-results.json (Example)

```json
{
  "taskId": "T027",
  "title": "Quote model with validation",
  "filePath": "packages/web/src/models/Quote.ts",
  "timestamp": "2025-09-30T20:45:00Z",
  "status": "failed",
  "requirements": ["FR-015", "FR-016", "FR-017", "FR-018"],
  
  "testResults": {
    "passed": 6,
    "failed": 2,
    "total": 8,
    "duration": 1240
  },
  
  "failures": [
    {
      "testName": "Quote model applies correct pricing based on customer type",
      "requirement": "FR-017",
      "category": "LOGIC_ERROR",
      "severity": "HIGH",
      "description": "Quote model is applying consumer pricing to all items, regardless of customer type. Retail customers should receive retail pricing (e.g., Snowva Ultimate Ice Maker at R315), but they are being charged consumer pricing (R400).",
      "expected": "Retail customer quote uses retail pricing: R315 per unit",
      "actual": "All quotes use consumer pricing: R400 per unit",
      "evidence": {
        "testCode": "packages/web/tests/integration/quote-invoice.test.ts:45",
        "failureOutput": "Expected unit price 315, received 400",
        "customerType": "retail",
        "product": "Snowva Ultimate Ice Maker",
        "expectedPrice": 315.00,
        "actualPrice": 400.00
      },
      "recommendation": "In Quote model, check customer.type field and apply correct pricelist: retail customers → retail_pricelist, consumer customers → consumer_pricelist",
      "relatedCode": [
        "packages/web/src/models/Quote.ts:78-92",
        "packages/web/src/models/Pricelist.ts:45-60"
      ]
    },
    {
      "testName": "Quote model validates customer-specific product overrides",
      "requirement": "FR-014",
      "category": "MISSING_FEATURE",
      "severity": "MEDIUM",
      "description": "Customer-specific product overrides are not being applied to quotes. Per FR-014, retail customers can have custom pricing/descriptions that override default product settings.",
      "expected": "Custom pricing applied if customer.productOverrides exists",
      "actual": "Default pricing always used, overrides ignored",
      "recommendation": "Check for customer.productOverrides before applying default pricing"
    }
  ],
  
  "technicalDebt": [],
  
  "copilotAttribution": {
    "session": "copilot-workspace-2025-09-30",
    "timestamp": "2025-09-30T20:30:00Z",
    "commit": "abc123def"
  }
}
```

### quality-summary.md (Auto-Generated)

```markdown
# Quality Summary: 001-core-features
**Generated:** 2025-09-30 20:45:00  
**Sprint Status:** 🟡 In Progress

## Overall Metrics
- ✅ **Verified:** 29/39 tasks (74%)
- ❌ **Failed:** 4/39 tasks (10%)
- ⚠️ **Technical Debt:** 6 items
- ⏳ **Pending:** 6 tasks
- 🎯 **Coverage:** 100% of completed tasks tested

## Failed Tasks (Blocking)

### T027: Quote model with validation ❌
**Status:** FAILED  
**Failed Tests:** 2/8  
**Requirements:** FR-015, FR-016, FR-017, FR-018  
**Issues:**
- 🔴 **HIGH:** Retail pricing not applied (FR-017)
  - Expected: R315 retail price
  - Actual: R400 consumer price
  - **Fix:** Check customer.type in Quote model
- 🟡 **MEDIUM:** Customer overrides not working (FR-014)
  - **Fix:** Check customer.productOverrides before default pricing

**Evidence:** [T027-results.json](.codor/evidence/T027-results.json)  
**Related Code:** packages/web/src/models/Quote.ts:78-92

---

### T040: POST /api/v1/quotes endpoint ❌
**Status:** FAILED  
**Failed Tests:** 1/5  
**Requirements:** FR-015, FR-016, FR-017  
**Issues:**
- 🔴 **HIGH:** API returns 500 when items array empty
  - Expected: 400 Bad Request with validation error
  - Actual: 500 Internal Server Error
  - **Fix:** Add input validation before processing

**Evidence:** [T040-results.json](.codor/evidence/T040-results.json)

## Technical Debt (Non-Blocking)

### T024: BillTo model ⚠️
- 🐌 **Performance:** Slow address validation (320ms)
- **Recommendation:** Cache geocoding results

### T035: Customer Service ⚠️
- 🔍 **Code Quality:** Duplicate validation logic
- **Recommendation:** Extract to shared validator

## Recommendations

1. **Immediate:** Fix T027 and T040 (blocking sprint completion)
2. **Next Sprint:** Address 6 technical debt items
3. **Code Review:** Review Quote model and API validation logic
```

---

## Implementation Roadmap

### Phase 1: Core Integration (Week 1)

1. **Spec Kit Parser**
   - Parse tasks.md format
   - Extract task metadata (id, [P], filepath, status)
   - Link tasks to requirements in spec.md
   - Detect task completion via checkbox changes

2. **Basic Test Generator**
   - Generate CODOR specs from spec.md acceptance criteria
   - Support model tests (TERMINAL_COMMAND → npm test)
   - Support API tests (HTTP_REQUEST from contracts/)
   - Write specs to .codor/test-specs/

3. **Watch Mode**
   - Monitor tasks.md for checkbox changes
   - Auto-run tests when task marked [x]
   - Update tasks.md with ✅❌ status
   - Write evidence to .codor/evidence/

### Phase 2: Evidence & Feedback (Week 2)

4. **Evidence System**
   - Per-task evidence JSON files
   - execution-report.json for full feature
   - quality-summary.md auto-generation
   - Link evidence from tasks.md

5. **Extension UI**
   - Tree view showing Spec Kit features
   - Task list with verification status
   - Failed test details view
   - Technical debt warnings

6. **Notifications**
   - Alert when tests fail
   - Show fabrication warnings
   - Suggest fixes based on failure analysis

### Phase 3: Advanced Features (Week 3)

7. **Smart Test Generation**
   - AI-powered test generation from requirements
   - Contract-driven API tests
   - Component test generation
   - Integration test scenarios

8. **Copilot Integration**
   - Detect Copilot Workspace sessions
   - Track AI attribution in evidence
   - Provide feedback to Copilot for self-correction
   - Generate fix suggestions

9. **Quality Metrics**
   - Verification rate tracking
   - Technical debt trends
   - Coverage reporting
   - Sprint health dashboard

### Phase 4: Polish (Week 4)

10. **Configuration**
    - Per-feature CODOR settings
    - Custom test generators
    - Evidence format options
    - Watch mode filters

11. **Reporting**
    - HTML evidence viewer (webview)
    - Export evidence for stakeholders
    - Sprint quality reports
    - Trend analysis

12. **Developer Experience**
    - Quick fixes from evidence
    - Jump to failing code
    - Inline CodeLens with status
    - Keyboard shortcuts

---

## Answers to Your Questions

### 1. Spec Kit Format
**Answer:** Standard Spec Kit format (as shown above)
- spec.md contains requirements and acceptance scenarios
- tasks.md contains numbered, ordered tasks with [P] markers
- CODOR will read these files but not modify spec.md/plan.md (read-only)
- CODOR will update tasks.md inline with status icons

### 2. AI Agent
**Answer:** GitHub Copilot Workspace
- CODOR will track Copilot sessions in evidence
- Evidence includes commit attribution
- CODOR can provide feedback to Copilot for self-correction

### 3. Update Strategy
**Answer:** Direct modification of tasks.md
- Update task lines inline: `[x] T022` → `[x] T022 ✅ Verified`
- Write evidence to `.codor/evidence/`
- Generate quality-summary.md
- Keep spec.md and plan.md read-only

### 4. Fabrication Alerts
**Answer:** Non-blocking warnings
- Show warnings in extension UI
- Update tasks.md with ❌ status
- Write detailed evidence JSON
- Developer decides whether to fix or override
- **Covert tracking:** All evidence stored but doesn't block Copilot

### 5. Evidence Storage
**Answer:** Minimal, workflow-essential only
- Per-task evidence JSON (for debugging)
- execution-report.json (latest full run)
- quality-summary.md (human-readable)
- **Optional:** Commit evidence to git for audit trail
- **Default:** Gitignore .codor/ folder (ephemeral)

---

## Configuration Example

**.codor/config.json:**

```json
{
  "version": "1.0",
  "integration": "spec-kit",
  
  "monitoring": {
    "watchMode": true,
    "autoTestOnTaskComplete": true,
    "autoTestOnFileSave": true,
    "debounceMs": 300
  },
  
  "testGeneration": {
    "generateFromAcceptanceCriteria": true,
    "generateFromContracts": true,
    "generateFromQuickstart": true,
    "useAI": true,
    "aiProvider": "github-copilot"
  },
  
  "evidence": {
    "writePerTaskResults": true,
    "writeExecutionReport": true,
    "generateQualitySummary": true,
    "commitToGit": false
  },
  
  "feedback": {
    "updateTasksMarkdown": true,
    "showNotifications": true,
    "failureAlerts": "non-blocking",
    "debtWarnings": true
  },
  
  "specKit": {
    "specFile": "spec.md",
    "tasksFile": "tasks.md",
    "planFile": "plan.md",
    "contractsDir": "contracts",
    "evidenceDir": ".codor/evidence",
    "testSpecsDir": ".codor/test-specs"
  }
}
```

---

## Next Steps

1. **Review this document** - Does this match your vision?

2. **Decide on priorities:**
   - Start with Phase 1 (basic integration)?
   - Or prototype specific feature first?

3. **Answer remaining questions:**
   - Should .codor/ be committed to git or gitignored?
   - How aggressive should failure alerts be?
   - Should CODOR auto-generate tests or require manual trigger?

4. **Implementation approach:**
   - Core engine enhancements first (event emitter, YAML)?
   - Or jump straight to extension development?

**This design gives you:**
- ✅ Quality gate for AI agent work
- ✅ Automatic verification of Spec Kit tasks
- ✅ Evidence trail for audit and debugging
- ✅ Covert tracking (doesn't block Copilot)
- ✅ Feedback loop into tasks.md
- ✅ Minimal overhead (auto-generated tests)

**Ready to start building?** 🚀
