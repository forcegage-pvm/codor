# CODOR + GitHub Spec Kit Integration Design
**Date:** September 30, 2025  
**Context:** AI Agent Quality Control for Specification-Driven Development (SDD)

---

## The Real Problem: AI Agent Accountability

### Current Workflow (Without CODOR)

```
1. Developer creates feature spec (GitHub Spec Kit format)
   └─> specs/001-user-authentication/spec.md
       ├─> Task 1: Implement login endpoint
       ├─> Task 2: Add JWT token generation
       └─> Task 3: Create user session management

2. AI Agent (GitHub Copilot, Cursor, etc.) implements tasks
   └─> Agent writes code based on spec
       ├─> May fabricate assumptions
       ├─> May skip requirements
       ├─> May introduce bugs
       └─> No verification happens

3. Developer reviews code
   └─> Manual testing
   └─> Trust-based verification
   └─> Time-consuming
```

**Problem:** How do you know the AI agent actually implemented what the spec requires?

---

## The Solution: CODOR as AI Agent Quality Gate

### New Workflow (With CODOR Integration)

```
1. Developer creates feature spec (Spec Kit)
   └─> specs/001-user-authentication/spec.md

2. CODOR Extension reads spec
   └─> Parses spec structure
   └─> Extracts tasks & acceptance criteria
   └─> Generates test specifications automatically

3. AI Agent implements tasks
   └─> Writes code based on spec

4. CODOR monitors & validates in real-time
   └─> Runs tests after each commit/save
   └─> Checks if acceptance criteria met
   └─> Detects fabrications/deviations

5. CODOR updates spec with test results
   └─> Marks tasks as ✅ verified or ❌ failed
   └─> Posts evidence directly in spec folder
   └─> Flags deviations from requirements

6. Developer/AI Agent see immediate feedback
   └─> AI agent can self-correct
   └─> Developer can intervene if needed
```

---

## GitHub Spec Kit Structure (Your Current Setup)

```
specs/
├── 001-user-authentication/
│   ├── spec.md              # Feature specification
│   ├── tasks.md             # Task breakdown
│   ├── acceptance.md        # Acceptance criteria
│   └── evidence/            # CODOR writes here
│       ├── test-results.json
│       ├── task-status.json
│       └── compliance-report.md
│
├── 002-payment-processing/
│   ├── spec.md
│   ├── tasks.md
│   └── evidence/
│
└── 003-notification-system/
    └── spec.md
```

---

## CODOR Extension Integration Points

### 1. Spec Kit Parser

**Reads Spec Kit format and extracts testable requirements:**

```typescript
class SpecKitParser {
  async parseSpec(specPath: string): Promise<SpecKitFeature> {
    const specContent = await fs.readFile(specPath, 'utf-8');
    
    // Parse markdown structure
    const feature = {
      id: extractFeatureId(specContent),
      title: extractTitle(specContent),
      description: extractDescription(specContent),
      tasks: extractTasks(specContent),
      acceptanceCriteria: extractAcceptanceCriteria(specContent),
      technicalRequirements: extractTechnicalReqs(specContent)
    };
    
    return feature;
  }
  
  extractTasks(content: string): SpecKitTask[] {
    // Parse task list from spec.md or tasks.md
    const taskRegex = /^[-*]\s+\[([x\s])\]\s+(.+)$/gm;
    const tasks = [];
    
    let match;
    while ((match = taskRegex.exec(content)) !== null) {
      tasks.push({
        id: generateTaskId(match[2]),
        title: match[2],
        status: match[1] === 'x' ? 'complete' : 'pending',
        // Extract acceptance criteria for this task
        acceptanceCriteria: extractTaskAcceptanceCriteria(content, match[2])
      });
    }
    
    return tasks;
  }
}
```

**Example Spec Format:**
```markdown
# Feature: User Authentication

## Tasks
- [ ] Task 1: Implement POST /api/login endpoint
  - Accept email and password
  - Return JWT token on success
  - Return 401 on invalid credentials
  
- [ ] Task 2: Add JWT token validation middleware
  - Validate token on protected routes
  - Return 403 if token invalid or expired
  
- [ ] Task 3: Implement logout endpoint
  - Invalidate user session
  - Clear authentication cookies

## Acceptance Criteria
- User can login with valid credentials
- User receives JWT token that works for 24 hours
- Invalid credentials return proper error messages
- Protected routes require valid JWT token
```

### 2. Automatic Test Generation from Spec

**CODOR generates CODOR test specs from Spec Kit requirements:**

```typescript
class SpecKitTestGenerator {
  async generateTests(feature: SpecKitFeature): Promise<CodorTestSpec> {
    const tasks = [];
    
    for (const task of feature.tasks) {
      // Generate test task for each spec task
      const testTask = {
        id: `TEST-${task.id}`,
        title: `Verify: ${task.title}`,
        metadata: {
          linkedSpecTask: task.id,
          specPath: feature.specPath,
          generatedFrom: 'spec-kit'
        },
        testExecution: await this.generateTestSteps(task)
      };
      
      tasks.push(testTask);
    }
    
    return {
      version: '5.0',
      metadata: {
        specKitFeature: feature.id,
        generatedAt: new Date().toISOString()
      },
      tasks
    };
  }
  
  async generateTestSteps(task: SpecKitTask): Promise<TestStep[]> {
    // Use AI to generate test steps from acceptance criteria
    const prompt = `
      Generate CODOR test specification for:
      Task: ${task.title}
      Acceptance Criteria:
      ${task.acceptanceCriteria.join('\n')}
      
      Generate test steps covering all acceptance criteria.
    `;
    
    const aiResponse = await this.aiAgent.generateTestSteps(prompt);
    return aiResponse.steps;
  }
}
```

**Generated CODOR Test Spec:**
```yaml
# Auto-generated from specs/001-user-authentication/spec.md
version: "5.0"

metadata:
  specKitFeature: "001-user-authentication"
  generatedFrom: "spec-kit"
  generatedAt: "2025-09-30T20:00:00Z"

tasks:
  TEST-TASK-1-LOGIN-ENDPOINT:
    title: "Verify: Implement POST /api/login endpoint"
    metadata:
      linkedSpecTask: "TASK-1"
      specPath: "specs/001-user-authentication/spec.md"
    
    testExecution:
      prerequisites:
        - type: TERMINAL_COMMAND
          description: "Start application server"
          command: "npm run dev"
          isBackground: true
          
      steps:
        # Test: Accept email and password
        - type: HTTP_REQUEST
          description: "Login with valid credentials"
          method: POST
          url: "http://localhost:3000/api/login"
          headers:
            Content-Type: "application/json"
          body:
            email: "test@example.com"
            password: "ValidPass123"
          expectedStatus: 200
          
        # Test: Return JWT token on success
        - type: HTTP_REQUEST
          description: "Verify JWT token returned"
          method: POST
          url: "http://localhost:3000/api/login"
          body:
            email: "test@example.com"
            password: "ValidPass123"
          expectedStatus: 200
          validation:
            - type: RESPONSE_CONTAINS
              contains: ["token"]
            - type: JSON_PATH_EXISTS
              path: "$.token"
        
        # Test: Return 401 on invalid credentials
        - type: HTTP_REQUEST
          description: "Login with invalid credentials"
          method: POST
          url: "http://localhost:3000/api/login"
          body:
            email: "test@example.com"
            password: "WrongPassword"
          expectedStatus: 401
          
      cleanup:
        - type: TERMINAL_COMMAND
          command: "pkill -f 'npm run dev'"
```

### 3. Spec Kit Task Tracker in Extension

**Extension UI shows Spec Kit tasks with test status:**

```
📋 Spec Kit Features
├── 📁 001-user-authentication
│   ├── 📝 Feature Spec (spec.md)
│   ├── ✅ Task 1: Login endpoint
│   │   ├── ✅ TEST: Valid credentials return token (234ms)
│   │   ├── ✅ TEST: Invalid credentials return 401 (123ms)
│   │   └── ✅ TEST: JWT token format valid (89ms)
│   │   └── 💡 All tests passing - Task verified
│   │
│   ├── ❌ Task 2: JWT validation middleware
│   │   ├── ✅ TEST: Valid token allows access (145ms)
│   │   ├── ❌ TEST: Invalid token returns 403
│   │   │   └── 🔴 FABRICATION DETECTED
│   │   │       └── Expected: 403 Forbidden
│   │   │       └── Actual: 200 OK (no auth check!)
│   │   └── ⚠️  AI agent skipped authentication logic
│   │
│   └── ⏳ Task 3: Logout endpoint (not implemented yet)
│       └── 🔄 Waiting for AI agent...
│
├── 📁 002-payment-processing
│   ├── 🔄 Task 1: Stripe integration (in progress)
│   └── ⏳ Task 2: Payment history (not started)
│
└── 📁 003-notification-system
    └── ⏳ All tasks pending
```

### 4. Real-Time Monitoring of AI Agent Work

**CODOR watches for code changes and auto-tests:**

```typescript
class AIAgentMonitor {
  private specKitWatcher: vscode.FileSystemWatcher;
  private codeWatcher: vscode.FileSystemWatcher;
  
  startMonitoring() {
    // Watch spec files for task updates
    this.specKitWatcher = vscode.workspace.createFileSystemWatcher(
      'specs/**/spec.md'
    );
    
    this.specKitWatcher.onDidChange(async (uri) => {
      // Spec changed - regenerate tests
      await this.regenerateTestsForSpec(uri);
    });
    
    // Watch source code changes
    this.codeWatcher = vscode.workspace.createFileSystemWatcher(
      'src/**/*.{ts,js,py}'
    );
    
    this.codeWatcher.onDidChange(async (uri) => {
      // Code changed - find related spec tasks
      const relatedTasks = await this.findRelatedSpecTasks(uri);
      
      // Run tests for those tasks
      for (const task of relatedTasks) {
        await this.runTestsForTask(task);
      }
      
      // Update spec with results
      await this.updateSpecWithResults(relatedTasks);
    });
  }
  
  async findRelatedSpecTasks(codeFile: string): Promise<SpecKitTask[]> {
    // AI-powered analysis: which spec tasks relate to this code file?
    // Example: src/auth/login-controller.ts → specs/001-user-authentication/tasks
    
    const analysis = await this.aiAgent.analyzeCodeToSpecMapping({
      codeFile,
      allSpecs: this.getAllSpecs()
    });
    
    return analysis.relatedTasks;
  }
  
  async updateSpecWithResults(tasks: SpecKitTask[]) {
    for (const task of tasks) {
      const specPath = task.specPath;
      const resultsPath = path.join(
        path.dirname(specPath),
        'evidence',
        `${task.id}-results.json`
      );
      
      // Write test results
      await fs.writeFile(resultsPath, JSON.stringify(task.testResults, null, 2));
      
      // Update spec.md with status
      await this.updateSpecMarkdown(specPath, task);
    }
  }
  
  async updateSpecMarkdown(specPath: string, task: SpecKitTask) {
    let content = await fs.readFile(specPath, 'utf-8');
    
    // Update task checkbox
    if (task.status === 'verified') {
      // - [ ] Task 1 → - [x] Task 1 ✅ Verified
      content = content.replace(
        new RegExp(`- \\[ \\] ${task.title}`),
        `- [x] ${task.title} ✅ Verified by CODOR`
      );
    } else if (task.status === 'failed') {
      // - [ ] Task 1 → - [x] Task 1 ❌ Tests failing
      content = content.replace(
        new RegExp(`- \\[ \\] ${task.title}`),
        `- [x] ${task.title} ❌ Tests failing - [View Results](./evidence/${task.id}-results.json)`
      );
    }
    
    await fs.writeFile(specPath, content);
  }
}
```

### 5. Feedback Loop: Spec Kit ↔ CODOR

```
┌─────────────────────────────────────────────────────────────┐
│                   Developer                                  │
│                   Creates Spec                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │  Spec Kit Feature                    │
        │  specs/001-feature/spec.md           │
        │  - Task 1: Build API endpoint        │
        │  - Task 2: Add validation            │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │  CODOR Extension                     │
        │  - Parses spec                       │
        │  - Generates test specs              │
        │  - Creates test tasks                │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │  AI Agent (Copilot/Cursor)           │
        │  - Implements Task 1                 │
        │  - Writes code                       │
        │  - Commits changes                   │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │  CODOR Auto-Test                     │
        │  - Detects code change               │
        │  - Runs tests for Task 1             │
        │  - ✅ All tests pass                 │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │  Update Spec Kit                     │
        │  - Mark Task 1 as [x] ✅             │
        │  - Write evidence to evidence/       │
        │  - Update task status                │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │  AI Agent Continues                  │
        │  - Sees Task 1 verified              │
        │  - Moves to Task 2                   │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │  CODOR Detects Issue                 │
        │  - Task 2 code committed             │
        │  - Tests run                         │
        │  - ❌ Validation not working         │
        │  - FABRICATION DETECTED              │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │  Alert & Feedback                    │
        │  - Show error in extension UI        │
        │  - Update spec.md with ❌            │
        │  - Write detailed failure report     │
        │  - Notify developer/AI agent         │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │  AI Agent Self-Corrects              │
        │  (or Developer Intervenes)           │
        │  - Reads failure report              │
        │  - Fixes validation logic            │
        │  - Re-commits                        │
        └──────────────────────────────────────┘
```

---

## Spec Kit File Format Integration

### Example: specs/001-user-authentication/spec.md

```markdown
# Feature: User Authentication
**Status:** 🔄 In Progress  
**CODOR Verification:** 2/3 tasks verified ✅

## Description
Implement secure user authentication system with JWT tokens.

## Tasks
- [x] Task 1: Implement POST /api/login endpoint ✅ Verified by CODOR
  - Acceptance Criteria:
    - Accept email and password in JSON body
    - Return JWT token on successful authentication
    - Return 401 on invalid credentials
  - Test Results: [View Evidence](./evidence/TASK-1-results.json)
  - Last Verified: 2025-09-30 20:15:00
  
- [x] Task 2: Add JWT validation middleware ❌ Tests Failing
  - Acceptance Criteria:
    - Validate JWT token on protected routes
    - Return 403 if token invalid or expired
  - Test Results: [View Evidence](./evidence/TASK-2-results.json)
  - **⚠️ FABRICATION DETECTED:** Authentication middleware not working
  - Failed Tests:
    - ❌ Protected route with invalid token (Expected 403, got 200)
    - ❌ Expired token rejection (No expiration check implemented)
  - Recommendation: Implement proper JWT verification in middleware
  
- [ ] Task 3: Implement logout endpoint
  - Acceptance Criteria:
    - Invalidate user session
    - Clear authentication cookies
  - Status: Waiting for implementation

## CODOR Quality Metrics
- ✅ Passed: 5 tests
- ❌ Failed: 2 tests
- ⚠️ Technical Debt: 1 item (slow token validation - 320ms)
- 🎯 Coverage: 67% (2/3 tasks verified)

## Evidence
All test evidence available in [./evidence/](./evidence/)
```

### Example: specs/001-user-authentication/evidence/TASK-2-results.json

```json
{
  "taskId": "TASK-2",
  "title": "Add JWT validation middleware",
  "status": "failed",
  "timestamp": "2025-09-30T20:15:00Z",
  "testResults": {
    "passed": 1,
    "failed": 2,
    "total": 3
  },
  "failures": [
    {
      "testName": "Protected route with invalid token",
      "category": "FABRICATION",
      "severity": "HIGH",
      "description": "Authentication middleware not implemented correctly. Invalid token was accepted when it should be rejected.",
      "expected": "403 Forbidden",
      "actual": "200 OK",
      "evidence": {
        "request": {
          "method": "GET",
          "url": "/api/protected",
          "headers": {
            "Authorization": "Bearer invalid_token"
          }
        },
        "response": {
          "status": 200,
          "body": { "data": "sensitive_data" }
        }
      },
      "recommendation": "Implement JWT verification in middleware. Use jsonwebtoken library to verify token signature and expiration."
    }
  ],
  "aiAgentAttribution": {
    "commitHash": "abc123def456",
    "author": "GitHub Copilot Workspace",
    "timestamp": "2025-09-30T20:10:00Z"
  }
}
```

---

## Extension Commands for Spec Kit Integration

```typescript
// package.json contribution
{
  "contributes": {
    "commands": [
      {
        "command": "codor.importSpecKit",
        "title": "CODOR: Import Spec Kit Feature"
      },
      {
        "command": "codor.generateTestsFromSpec",
        "title": "CODOR: Generate Tests from Current Spec"
      },
      {
        "command": "codor.verifySpecTask",
        "title": "CODOR: Verify Spec Task"
      },
      {
        "command": "codor.showSpecTaskEvidence",
        "title": "CODOR: Show Task Evidence"
      },
      {
        "command": "codor.startSpecMonitoring",
        "title": "CODOR: Start AI Agent Monitoring"
      }
    ],
    "menus": {
      "explorer/context": [
        {
          "when": "resourceFilename == spec.md",
          "command": "codor.generateTestsFromSpec",
          "group": "codor"
        }
      ]
    }
  }
}
```

---

## Data Model: Spec Kit + CODOR

```typescript
interface SpecKitFeature {
  id: string;                    // "001-user-authentication"
  specPath: string;              // "specs/001-user-authentication/spec.md"
  title: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'complete' | 'verified';
  tasks: SpecKitTask[];
  codorVerification: {
    testsGenerated: boolean;
    lastVerified?: Date;
    passRate: number;            // 0.67 = 67% tasks verified
  };
}

interface SpecKitTask {
  id: string;                    // "TASK-1"
  title: string;
  description: string;
  acceptanceCriteria: string[];
  status: 'pending' | 'implemented' | 'verified' | 'failed';
  
  // CODOR Integration
  codorTestSpec?: string;        // Path to generated CODOR test spec
  testResults?: {
    passed: number;
    failed: number;
    lastRun: Date;
  };
  
  // AI Agent Attribution
  implementation?: {
    commitHash: string;
    author: string;
    timestamp: Date;
  };
  
  // Verification
  verification?: {
    status: 'verified' | 'failed' | 'fabrication-detected';
    failures?: FailureAnalysisResult[];
    evidence?: string;           // Path to evidence JSON
  };
}
```

---

## Revised Architecture: Spec Kit First

```
┌─────────────────────────────────────────────────────────────┐
│                   Spec Kit (Source of Truth)                 │
│                   specs/**/spec.md                           │
├─────────────────────────────────────────────────────────────┤
│  - Feature specifications                                   │
│  - Task breakdown                                           │
│  - Acceptance criteria                                      │
│  - Progress tracking                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ watches & parses
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              CODOR Extension (Quality Gate)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────┐     │
│  │  Spec Kit Parser                                  │     │
│  │  - Read spec.md files                             │     │
│  │  - Extract tasks & criteria                       │     │
│  │  - Track task status                              │     │
│  └──────────────────┬───────────────────────────────┘     │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────┐     │
│  │  Test Generator (AI-Powered)                      │     │
│  │  - Generate CODOR specs from criteria             │     │
│  │  - One test spec per spec task                    │     │
│  └──────────────────┬───────────────────────────────┘     │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────┐     │
│  │  AI Agent Monitor                                 │     │
│  │  - Watch for code changes                         │     │
│  │  - Auto-run tests                                 │     │
│  │  - Detect fabrications                            │     │
│  └──────────────────┬───────────────────────────────┘     │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────┐     │
│  │  Spec Kit Updater                                 │     │
│  │  - Update spec.md with results                    │     │
│  │  - Write evidence files                           │     │
│  │  - Mark tasks verified/failed                     │     │
│  └──────────────────────────────────────────────────┘     │
│                                                             │
│                     │ uses ↓                               │
└─────────────────────┼─────────────────────────────────────┘
                      │
┌─────────────────────▼─────────────────────────────────────┐
│              CODOR Core Engine                              │
│              (Test Execution)                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Roadmap

### Phase 1: Spec Kit Integration (Week 1)
1. ✅ Add EventEmitter to core engine
2. Create Spec Kit parser
3. Implement spec file watcher
4. Build test generator from acceptance criteria
5. Create basic extension UI showing spec tasks

### Phase 2: AI Agent Monitoring (Week 2)
6. Implement code change watcher
7. Build code-to-spec mapping (AI-powered)
8. Add auto-test execution on code changes
9. Create fabrication detection logic
10. Build spec.md updater

### Phase 3: Evidence & Feedback (Week 3)
11. Implement evidence file writer
12. Create evidence viewer (webview)
13. Add spec.md annotation with test results
14. Build notification system (alerts for failures)
15. Add manual verification override

### Phase 4: Polish & Advanced Features (Week 4)
16. Add AI agent self-correction prompts
17. Implement test generation improvements
18. Add coverage metrics to spec
19. Build trend tracking (test history)
20. Create developer dashboard

---

## Key Decisions for Your Use Case

### 1. AI Agent Choice
**Recommendation:** GitHub Copilot API  
**Why:** 
- You're already using GitHub Spec Kit
- Native integration with GitHub workflow
- Copilot can read spec context automatically
- Can self-correct based on CODOR feedback

### 2. Task Storage
**Recommendation:** Spec Kit files are source of truth  
**Why:**
- No duplicate storage needed
- spec.md already tracks tasks
- CODOR just adds verification status
- Evidence goes in `evidence/` subfolder

### 3. Sync Strategy
**Recommendation:** Real-time with debouncing  
**Why:**
- AI agent works continuously
- Immediate feedback prevents cascading errors
- Debounce prevents spam (300ms delay)
- Update spec.md on every test completion

### 4. Test Spec Storage
**Recommendation:** Generated specs in `.codor/` folder  
**Why:**
- Keep generated files separate from spec files
- Can be gitignored or committed (your choice)
- Easy regeneration if deleted
- Linked via metadata to spec tasks

```
specs/
├── 001-user-auth/
│   ├── spec.md              # Source of truth
│   └── evidence/            # CODOR writes results here
│       └── TASK-1-results.json
│
.codor/
└── specs/
    └── 001-user-auth/
        ├── TASK-1-tests.yaml    # Generated CODOR spec
        ├── TASK-2-tests.yaml
        └── TASK-3-tests.yaml
```

---

## Questions for You

1. **Spec Kit Format:** Are you using a specific format for `spec.md` or should CODOR be flexible?

2. **AI Agent:** Are you using GitHub Copilot Workspace, Cursor, or something else?

3. **Task Tracking:** Do you want CODOR to update `spec.md` directly, or just write to `evidence/`?

4. **Fabrication Detection:** How aggressive should CODOR be? Fail on first deviation or allow warnings?

5. **Evidence Location:** Should evidence files be committed to git or gitignored?

**Does this match your vision?** 🎯
