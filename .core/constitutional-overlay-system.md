# Constitutional Overlay System: Extending Vanilla GitHub Spec Kit

**Design Philosophy**: Constitutional compliance as an extensible layer over vanilla GitHub Spec Kit, following object-oriented extension principles rather than modification.

## Architecture Overview

```
┌─────────────────────────────────────┐
│         Vanilla GitHub Spec Kit     │
│  ┌─────────────────────────────────┐ │
│  │     /specify, /plan, /tasks     │ │  
│  │     /implement, /analyze        │ │
│  │     (Unmodified base behavior)  │ │
│  └─────────────────────────────────┘ │
│                  ↓                  │
│  ┌─────────────────────────────────┐ │
│  │    Constitutional Extensions    │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │  Constitutional Interceptor │ │ │
│  │  │  • Pre-command validation   │ │ │
│  │  │  • Constitutional injection │ │ │ 
│  │  │  • Post-command enhancement │ │ │
│  │  └─────────────────────────────┘ │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │   Task Enhancement Layer    │ │ │
│  │  │  • Evidence requirements    │ │ │
│  │  │  • Three-gate validation    │ │ │
│  │  │  • MCP testing injection    │ │ │
│  │  └─────────────────────────────┘ │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │   Fraud Detection Layer     │ │ │
│  │  │  • Pre-task validation      │ │ │
│  │  │  • Post-task validation     │ │ │
│  │  │  • Constitutional audit     │ │ │
│  │  └─────────────────────────────┘ │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Implementation Strategy

### 1. Constitutional Hook System

Create constitutional hooks that intercept vanilla Spec Kit commands:

```
.specify/
├── constitutional/
│   ├── interceptors/
│   │   ├── pre-specify.js      # Intercepts /specify before execution
│   │   ├── post-plan.js        # Enhances /plan output
│   │   ├── task-enhancer.js    # Injects constitutional requirements
│   │   └── implement-guard.js  # Adds validation gates
│   ├── templates/
│   │   ├── constitutional-task-template.md
│   │   ├── evidence-template.md  
│   │   └── validation-gate-template.md
│   └── tools/
│       ├── constitutional-checker.js
│       ├── pre-task-check.js
│       └── post-task-validation.js
```

### 2. Command Extension Pattern

**Vanilla Command Flow**:
```bash
/tasks → tasks-template.md → vanilla tasks.md
```

**Constitutional Extension Flow**:
```bash
/tasks → tasks-template.md → vanilla tasks.md 
       ↓
constitutional/interceptors/task-enhancer.js
       ↓
Enhanced tasks.md with constitutional requirements
```

### 3. Template Inheritance System

**Base Template (Vanilla)**:
```markdown
- [ ] T008 [P] User model in src/models/user.py
```

**Constitutional Extension Template**:
```markdown
{{VANILLA_TASK}}
  - Evidence: evidence/{{TASK_ID}}/ with {{EVIDENCE_TYPE}}
  - MCP: {{MCP_REQUIREMENT}}
  - Validation: node .specify/tools/pre-task-check.js {{TASK_ID}}
  - Completion: node .specify/tools/post-task-validation.js {{TASK_ID}}
```

**Final Output**:
```markdown
- [ ] T008 [P] User model in src/models/user.py
  - Evidence: evidence/T008/ with model implementation, unit test coverage
  - MCP: N/A (service layer)
  - Validation: node .specify/tools/pre-task-check.js T008
  - Completion: node .specify/tools/post-task-validation.js T008
```

## Constitutional Interceptor Implementation

### File Structure

```
.specify/
├── constitutional/
│   ├── config/
│   │   └── constitution-config.json     # Configuration driven by constitution.md
│   ├── interceptors/
│   │   ├── command-interceptor.js       # Main entry point
│   │   ├── task-enhancer.js            # Task enhancement logic
│   │   ├── validation-injector.js      # Validation gate injection
│   │   └── evidence-generator.js       # Evidence requirement generation
│   ├── templates/
│   │   ├── constitutional-extensions/
│   │   │   ├── task-extensions.md
│   │   │   ├── evidence-requirements.md
│   │   │   └── validation-gates.md
│   │   └── overlays/
│   │       ├── tasks-overlay.md        # Constitutional overlay for tasks
│   │       ├── plan-overlay.md         # Constitutional overlay for plans
│   │       └── implement-overlay.md    # Constitutional overlay for implementation
│   └── tools/                          # Constitutional validation tools
```

## Dynamic Constitutional Configuration

### Constitution-Driven Configuration

**File**: `.specify/constitutional/config/constitution-config.json`

```json
{
  "constitutionSource": ".specify/memory/constitution.md",
  "version": "3.4",
  "mandates": {
    "MANDATE_8": {
      "antiCircumnavigation": true,
      "fraudDetection": {
        "screenshots": true,
        "mcpResponses": true,
        "evidenceIntegrity": true
      }
    },
    "MANDATE_11": {
      "specToCompliance": true,
      "threeGateValidation": true,
      "evidenceFirst": true
    }
  },
  "validationGates": {
    "preTask": "node .specify/tools/pre-task-check.js",
    "mcpValidation": "conditional",
    "postTask": "node .specify/tools/post-task-validation.js"
  },
  "evidenceRequirements": {
    "mandatoryDirectory": "evidence/{taskId}/",
    "mcpTesting": {
      "uiTasks": "required",
      "serviceTasks": "not-applicable",
      "apiTasks": "browser-testing"
    }
  }
}
```

### Constitutional Auto-Update System

**Process**:
1. Monitor `.specify/memory/constitution.md` for changes
2. Parse mandates and requirements automatically  
3. Update `constitution-config.json` dynamically
4. Regenerate constitutional overlays based on new requirements
5. No manual prompt editing required

## Extension Hooks Implementation

### 1. Command Interceptor Hook

**File**: `.specify/constitutional/interceptors/command-interceptor.js`

```javascript
#!/usr/bin/env node

/**
 * Constitutional Command Interceptor
 * Extends vanilla GitHub Spec Kit commands with constitutional compliance
 */

class ConstitutionalInterceptor {
  constructor() {
    this.config = require('../config/constitution-config.json');
    this.constitutionPath = this.config.constitutionSource;
  }

  async interceptCommand(command, args) {
    console.log(`🏛️  Constitutional extension active for /${command}`);
    
    switch (command) {
      case 'tasks':
        return await this.enhanceTasks(args);
      case 'plan':
        return await this.enhancePlan(args);  
      case 'implement':
        return await this.enhanceImplement(args);
      default:
        return this.passthrough(command, args);
    }
  }

  async enhanceTasks(args) {
    // 1. Execute vanilla /tasks command first
    const vanillaTasks = await this.executeVanillaCommand('tasks', args);
    
    // 2. Apply constitutional enhancements
    const enhancedTasks = await this.applyConstitutionalEnhancements(vanillaTasks);
    
    // 3. Inject validation gates and evidence requirements
    const finalTasks = await this.injectValidationGates(enhancedTasks);
    
    return finalTasks;
  }

  async applyConstitutionalEnhancements(tasksContent) {
    const taskEnhancer = require('./task-enhancer.js');
    return await taskEnhancer.enhance(tasksContent, this.config);
  }
}

// CLI Integration
if (require.main === module) {
  const interceptor = new ConstitutionalInterceptor();
  const [command, ...args] = process.argv.slice(2);
  interceptor.interceptCommand(command, args);
}
```

### 2. Task Enhancement Layer

**File**: `.specify/constitutional/interceptors/task-enhancer.js`

```javascript
/**
 * Task Enhancement Layer
 * Extends vanilla tasks with constitutional requirements
 */

class TaskEnhancer {
  constructor(config) {
    this.config = config;
    this.constitutionalTemplate = require('../templates/constitutional-extensions/task-extensions.md');
  }

  async enhance(vanillaTasksContent, config) {
    const tasks = this.parseVanillaTasks(vanillaTasksContent);
    const enhancedTasks = [];

    for (const task of tasks) {
      const constitutionalTask = await this.enhanceTask(task);
      enhancedTasks.push(constitutionalTask);
    }

    return this.generateEnhancedTasksMarkdown(enhancedTasks);
  }

  async enhanceTask(vanillaTask) {
    const taskType = this.classifyTask(vanillaTask);
    const evidenceRequirements = this.generateEvidenceRequirements(vanillaTask, taskType);
    const mcpRequirements = this.generateMCPRequirements(vanillaTask, taskType);
    const validationGates = this.generateValidationGates(vanillaTask);

    return {
      ...vanillaTask,
      constitutional: {
        evidence: evidenceRequirements,
        mcp: mcpRequirements,
        validation: validationGates
      }
    };
  }

  classifyTask(task) {
    if (task.description.includes('UI') || task.description.includes('component')) {
      return 'ui';
    } else if (task.description.includes('API') || task.description.includes('endpoint')) {
      return 'api';
    } else if (task.description.includes('service') || task.description.includes('model')) {
      return 'service';
    }
    return 'general';
  }

  generateEvidenceRequirements(task, type) {
    const baseEvidence = `evidence/${task.id}/ with`;
    
    switch (type) {
      case 'ui':
        return `${baseEvidence} component implementation, browser testing screenshots`;
      case 'api': 
        return `${baseEvidence} endpoint implementation, contract test results`;
      case 'service':
        return `${baseEvidence} service implementation, unit test coverage`;
      default:
        return `${baseEvidence} implementation artifacts, validation results`;
    }
  }

  generateMCPRequirements(task, type) {
    switch (type) {
      case 'ui':
        return `**REQUIRED** - Browser test ${task.description} with interaction validation`;
      case 'api':
        return `Browser test API endpoint with network tab validation`;
      case 'service':
        return `N/A (service layer)`;
      default:
        return `Conditional based on task requirements`;
    }
  }

  generateValidationGates(task) {
    return {
      preTask: `node .specify/tools/pre-task-check.js ${task.id}`,
      postTask: `node .specify/tools/post-task-validation.js ${task.id}`
    };
  }
}
```

## Activation System

### 1. Constitutional Spec Kit Initialization

**Command**: `specify init --constitutional`

```bash
# Standard initialization
specify init my-project --ai copilot

# Constitutional enhancement activation  
cd my-project
node .specify/constitutional/activate.js
```

### 2. Automatic Hook Registration

**File**: `.specify/constitutional/activate.js`

```javascript
/**
 * Constitutional Activation System
 * Sets up constitutional hooks for vanilla GitHub Spec Kit
 */

class ConstitutionalActivator {
  async activate() {
    console.log('🏛️  Activating Constitutional Compliance System...');
    
    // 1. Backup vanilla commands
    await this.backupVanillaCommands();
    
    // 2. Register constitutional interceptors
    await this.registerInterceptors();
    
    // 3. Install constitutional tools
    await this.installConstitutionalTools();
    
    // 4. Generate configuration from constitution
    await this.generateConfig();
    
    console.log('✅ Constitutional system activated');
    console.log('📋 Vanilla Spec Kit commands now include constitutional compliance');
  }

  async registerInterceptors() {
    // Create wrapper scripts that call interceptor first
    const commands = ['specify', 'plan', 'tasks', 'implement'];
    
    for (const command of commands) {
      await this.createConstitutionalWrapper(command);
    }
  }

  async createConstitutionalWrapper(command) {
    const wrapperScript = `
#!/usr/bin/env node
const interceptor = require('./.specify/constitutional/interceptors/command-interceptor.js');
interceptor.interceptCommand('${command}', process.argv.slice(2));
`;
    
    // Install wrapper as the main command handler
    await fs.writeFile(`.specify/commands/${command}.js`, wrapperScript);
  }
}
```

## Benefits of This Approach

### 1. **Non-Destructive Extension**
- ✅ Vanilla GitHub Spec Kit remains unchanged
- ✅ Updates to Spec Kit don't break constitutional compliance
- ✅ Can be activated/deactivated as needed

### 2. **Constitution-Driven**
- ✅ Configuration automatically generated from `constitution.md`
- ✅ Changes to constitution automatically propagate to task generation
- ✅ No manual prompt editing required

### 3. **Layered Architecture**
- ✅ Clear separation between vanilla behavior and constitutional enhancements
- ✅ Modular components can be independently updated
- ✅ Easy to debug and maintain

### 4. **Backward Compatibility**
- ✅ Projects can opt-in to constitutional compliance
- ✅ Existing Spec Kit projects continue to work unchanged
- ✅ Gradual adoption path for teams

This approach solves your concern perfectly - we extend the Spec Kit's behavior through composition rather than modification, following proper software architecture principles while ensuring our constitutional requirements are dynamically applied based on the current constitution content.

## Implementation Phases

### Phase 1: Core Interceptor System
1. Create command interceptor framework
2. Implement task enhancement layer
3. Build constitution-config auto-generation

### Phase 2: Constitutional Tools Integration  
1. Port existing validation tools to overlay system
2. Create evidence requirement generators
3. Implement MCP testing injection

### Phase 3: Advanced Features
1. Real-time constitution monitoring
2. Dynamic configuration updates
3. Constitutional compliance dashboards

### Phase 4: Community Integration
1. Publish constitutional overlay as npm package
2. Create installation scripts for existing projects
3. Documentation and adoption guides

Would you like me to implement this constitutional overlay system?