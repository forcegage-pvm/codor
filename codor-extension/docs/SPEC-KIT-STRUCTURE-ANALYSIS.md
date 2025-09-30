# Spec Kit Structure Analysis

**Date:** September 30, 2025  
**Location:** This repository's `.github/prompts/` and `.specify/`

---

## 📁 Spec Kit Components

### 1. Prompt Files (`.github/prompts/`)

**Chat commands that trigger workflows:**

```
.github/prompts/
├── specify.prompt.md      # /specify - Create feature spec
├── plan.prompt.md         # /plan - Generate implementation plan
├── tasks.prompt.md        # /tasks - Generate task breakdown
├── implement.prompt.md    # /implement - Execute tasks
├── analyze.prompt.md      # /analyze - Code analysis
├── clarify.prompt.md      # /clarify - Ask questions
├── constitution.prompt.md # Constitutional checks
└── codor-*.prompt.md      # CODOR-specific prompts
```

### 2. Scripts (`.specify/scripts/powershell/`)

**PowerShell scripts called by prompts:**

```
.specify/scripts/powershell/
├── check-prerequisites.ps1      # Validate workflow state
├── create-new-feature.ps1       # Create feature branch & directory
├── setup-plan.ps1               # (if exists)
├── rename-feature.ps1           # Rename feature
├── update-agent-context.ps1     # Update context
└── common.ps1                   # Shared functions
```

### 3. Templates (`.specify/templates/`)

**Markdown templates for generated files:**

```
.specify/templates/
├── spec-template.md             # Feature specification
├── plan-template.md             # Implementation plan
├── tasks-template.md            # Task breakdown
├── next-js.md                   # Next.js specific
├── fastapi.md                   # FastAPI specific
└── component-status-template.md # Component tracking
```

---

## 🔄 Current Spec Kit Workflow

### Step 1: `/specify` Command

**Prompt:** `.github/prompts/specify.prompt.md`

```
User: /specify User authentication with JWT tokens

GitHub Copilot:
1. Runs: .specify/scripts/powershell/create-new-feature.ps1 -Json "User authentication..."
   
   Script does:
   ✓ Creates specs/004-user-authentication/
   ✓ Creates git branch: 004-user-authentication
   ✓ Copies spec-template.md → spec.md
   ✓ Returns JSON: { "BRANCH_NAME": "004-...", "SPEC_FILE": "..." }

2. Loads: .specify/templates/spec-template.md

3. Fills in spec.md with:
   - User scenarios
   - Functional requirements (FR-001, FR-002...)
   - Key entities
   - Non-functional requirements

4. Writes: specs/004-user-authentication/spec.md

Output: spec.md file on disk ✅
```

### Step 2: `/plan` Command

**Prompt:** `.github/prompts/plan.prompt.md`

```
User: /plan

GitHub Copilot:
1. Runs: .specify/scripts/powershell/check-prerequisites.ps1 -Json
   
   Script validates:
   ✓ Feature directory exists
   ✓ spec.md exists
   ✓ Returns JSON: { "FEATURE_DIR": "...", "FEATURE_SPEC": "..." }

2. Reads: spec.md (to extract requirements)

3. Loads: .specify/templates/plan-template.md

4. Fills in plan.md with:
   - Tech stack
   - Libraries
   - Project structure
   - Implementation phases

5. Writes: specs/004-user-authentication/plan.md

Output: plan.md file on disk ✅
```

### Step 3: `/tasks` Command

**Prompt:** `.github/prompts/tasks.prompt.md`

```
User: /tasks

GitHub Copilot:
1. Runs: .specify/scripts/powershell/check-prerequisites.ps1 -Json
   
   Script validates:
   ✓ Feature directory exists
   ✓ spec.md exists
   ✓ plan.md exists
   ✓ Returns JSON with all available docs

2. Reads design documents:
   - plan.md (tech stack, structure)
   - data-model.md (if exists)
   - contracts/ (if exists)
   - research.md (if exists)

3. Loads: .specify/templates/tasks-template.md

4. Generates tasks:
   - T001: Setup tasks
   - T002: Test tasks [P]
   - T003: Core implementation
   - T004: Integration
   - T005: Polish [P]

5. Writes: specs/004-user-authentication/tasks.md

Output: tasks.md file on disk ✅ ← PROBLEM!
```

### Step 4: `/implement` Command

**Agent reads tasks.md and implements** ← This is where chaos happens!

---

## 🎯 CODOR Integration Points

### Where We Intercept

```typescript
// Instead of this workflow:
/tasks → Script validates → Agent generates → Write tasks.md file ❌

// We do this:
CODOR UI → Call script → Capture output → Store in database ✅
                                      ↓
                                 NO FILE WRITTEN!
```

### How Scripts Work (Key Insight!)

**Scripts are just helpers that:**
1. Validate prerequisites (directories exist, files exist)
2. Return JSON with file paths
3. **Do NOT generate content themselves**

**Content generation happens in the PROMPT:**
- GitHub Copilot reads the prompt
- Copilot calls the script to get paths
- Copilot generates the content (spec, plan, tasks)
- Copilot writes the file

**This means CODOR needs to:**
1. Replace the prompt execution
2. Get paths from scripts (still useful!)
3. Generate content ourselves (or via AI API)
4. Store in database instead of writing file

---

## 🏗️ CODOR Wrapper Architecture

### Option 1: Prompt Interception (Complex)

```typescript
// Intercept GitHub Copilot prompt execution
// This is hard - we don't control Copilot's prompt engine
```

### Option 2: Script Extension (Easier!)

```typescript
// Extend Spec Kit scripts to support CODOR mode

// Modified script: create-new-feature.ps1
param(
    [switch]$CodorMode,  // NEW: Return data, don't create files
    [switch]$Json
)

if ($CodorMode) {
    # Return data structure instead of creating files
    @{
        branchName = $branchName
        featureDir = $featureDir
        featureNum = $featureNum
        template = Get-Content $template
    } | ConvertTo-Json
} else {
    # Original behavior: create files
    Copy-Item $template $specFile
}
```

### Option 3: CODOR Generates Content (Recommended!)

```typescript
// CODOR doesn't need Spec Kit scripts for generation
// Scripts are just for prerequisites and paths
// CODOR can generate content using AI API directly

class SpecKitIntegration {
  
  async createFeature(description: string) {
    // 1. Get paths using existing script
    const paths = await this.runScript('check-prerequisites.ps1', {
      PathsOnly: true,
      Json: true
    });
    
    // 2. Generate content using AI API (OpenAI, etc.)
    const spec = await this.generateSpec(description);
    
    // 3. Store in database (NOT file!)
    await db.features.insert({
      id: this.getNextFeatureId(),
      title: description,
      spec: spec,
      status: 'planning'
    });
    
    // 4. Return feature ID
    return featureId;
  }
  
  async generatePlan(featureId: string) {
    // 1. Load spec from database
    const feature = await db.features.get(featureId);
    
    // 2. Generate plan using AI
    const plan = await this.aiGeneratePlan(feature.spec);
    
    // 3. Store in database
    await db.features.update(featureId, { plan });
  }
  
  async generateTasks(featureId: string) {
    // 1. Load spec + plan from database
    const feature = await db.features.get(featureId);
    
    // 2. Generate tasks using AI
    const tasks = await this.aiGenerateTasks({
      spec: feature.spec,
      plan: feature.plan
    });
    
    // 3. Store in database (NO tasks.md file!)
    await db.tasks.insertMany(tasks);
  }
}
```

---

## 🎨 CODOR UI Flow

### Instead of Chat Commands

```
Before (Spec Kit):
User: /specify User authentication
      ↓
Copilot generates spec.md file

User: /plan
      ↓
Copilot generates plan.md file

User: /tasks
      ↓
Copilot generates tasks.md file ← Agent sees all tasks!


After (CODOR):
User: Clicks "New Feature" in CODOR panel
      ↓
CODOR shows form:
┌─────────────────────────────────────┐
│ Feature Description:                │
│ [User authentication with JWT____]  │
│                                     │
│ [Generate Specification]            │
└─────────────────────────────────────┘
      ↓
CODOR generates spec (using AI API)
CODOR stores in database
CODOR shows rich spec UI:
┌─────────────────────────────────────┐
│ 📋 Specification                    │
│                                     │
│ Requirements:                       │
│ ☐ FR-001: User login               │
│ ☐ FR-002: JWT token generation     │
│                                     │
│ [Generate Plan]                     │
└─────────────────────────────────────┘
      ↓
User: Clicks "Generate Plan"
      ↓
CODOR generates plan, stores in DB
      ↓
User: Clicks "Generate Tasks"
      ↓
CODOR generates tasks, stores in DB
(NO tasks.md file created!)
      ↓
User: Clicks "Start Implementation"
      ↓
CODOR provides ONLY T001 to agent
```

---

## 🔑 Key Insights

### 1. Scripts Are Just Helpers ✅

```powershell
# Scripts don't generate content
# They just:
- Create directories
- Validate prerequisites
- Return file paths
- Copy templates

# Content generation happens in Copilot prompts
```

### 2. We Can Reuse Scripts ✅

```typescript
// Use scripts for their intended purpose: setup
await runScript('create-new-feature.ps1', {
  Json: true,
  description: 'User authentication'
});
// → Creates directory, returns paths

// But generate content ourselves
const spec = await generateSpecWithAI(description);
// → Store in database, not file
```

### 3. Templates Are Valuable ✅

```typescript
// Load template to understand structure
const template = await fs.readFile(
  '.specify/templates/spec-template.md',
  'utf-8'
);

// Use as schema for AI generation
const prompt = `
Generate a feature specification following this structure:
${template}

Feature description: ${userInput}
`;

const spec = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: prompt }]
});
```

---

## 🚀 Implementation Strategy

### Phase 1: Use Scripts for Setup

```typescript
// Leverage existing scripts
class SpecKitBridge {
  
  async setupFeature(description: string) {
    // Call existing script
    const result = await this.exec(
      'pwsh',
      [
        '.specify/scripts/powershell/create-new-feature.ps1',
        '-Json',
        description
      ]
    );
    
    const { BRANCH_NAME, FEATURE_DIR, SPEC_FILE } = JSON.parse(result.stdout);
    
    return {
      branchName: BRANCH_NAME,
      featureDir: FEATURE_DIR,
      specFile: SPEC_FILE
    };
  }
  
  async checkPrerequisites() {
    const result = await this.exec(
      'pwsh',
      ['.specify/scripts/powershell/check-prerequisites.ps1', '-Json']
    );
    
    return JSON.parse(result.stdout);
  }
}
```

### Phase 2: Generate Content with AI

```typescript
// Replace Copilot prompt with AI API
class ContentGenerator {
  
  async generateSpec(description: string) {
    const template = await this.loadTemplate('spec-template.md');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a technical specification writer.'
        },
        {
          role: 'user',
          content: `
            Generate a feature specification following this template:
            ${template}
            
            Feature description: ${description}
            
            Output JSON with:
            - title
            - requirements (array of {id, description, priority})
            - userStories (array of {role, want, benefit})
            - entities (array of {name, attributes})
          `
        }
      ],
      response_format: { type: 'json_object' }
    });
    
    return JSON.parse(response.choices[0].message.content);
  }
  
  async generateTasks(spec, plan) {
    // Similar AI generation for tasks
  }
}
```

### Phase 3: Store in Database (NO FILES!)

```typescript
// Never write tasks.md
class FeatureRepository {
  
  async createFeature(description: string) {
    // 1. Setup using script
    const paths = await specKitBridge.setupFeature(description);
    
    // 2. Generate spec with AI
    const spec = await contentGenerator.generateSpec(description);
    
    // 3. Store in database
    const featureId = await db.features.insert({
      branchName: paths.branchName,
      directory: paths.featureDir,
      title: spec.title,
      description,
      spec: spec,
      status: 'planning',
      createdAt: new Date()
    });
    
    // 4. Create git branch (using script's branch name)
    await git.checkoutBranch(paths.branchName);
    
    return featureId;
  }
  
  async generateTasks(featureId: string) {
    const feature = await db.features.get(featureId);
    
    const tasks = await contentGenerator.generateTasks(
      feature.spec,
      feature.plan
    );
    
    // Store tasks in database (NOT tasks.md file!)
    for (const task of tasks) {
      await db.tasks.insert({
        featureId,
        ...task,
        status: 'pending'
      });
    }
    
    // NO FILE WRITTEN! Agent cannot discover tasks!
  }
}
```

---

## ✅ Summary

**Spec Kit Structure:**
- `.github/prompts/` - Chat commands (we'll replace with UI)
- `.specify/scripts/` - Helper scripts (we'll reuse for setup)
- `.specify/templates/` - Templates (we'll use for AI prompts)

**CODOR Integration:**
1. ✅ Use scripts for directory/branch setup
2. ✅ Use templates as schema for AI generation
3. ✅ Generate content with AI API (not Copilot prompts)
4. ✅ Store everything in database
5. ✅ Never create tasks.md file
6. ✅ Provide tasks one at a time to agent

**Next Steps:**
1. Build SpecKitBridge to call PowerShell scripts
2. Build ContentGenerator to use AI API
3. Build FeatureRepository to store in database
4. Build UI to replace chat commands
5. Build TaskQueue to manage task distribution

**Ready to start building?** 🚀
