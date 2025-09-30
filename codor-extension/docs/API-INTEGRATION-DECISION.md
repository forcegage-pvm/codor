# API Integration Approach Decision

**Date:** September 30, 2025  
**Status:** Discussion / Decision Pending

---

## The Question

How should CODOR Extension communicate with AI agents (GitHub Copilot Workspace, Cursor, etc.)?

Three options:
1. **REST API** - Extension runs HTTP server, AI calls endpoints
2. **File Watching** - Extension monitors file changes, no AI integration needed
3. **Hybrid** - Both approaches for maximum compatibility

---

## Option 1: REST API

### How It Works

```
┌─────────────────────────────────────┐
│  CODOR Extension                     │
│  - Runs Express server on :3141      │
│  - Exposes /codor/next-task          │
│  - Exposes /codor/complete           │
│  - Exposes /codor/status             │
└──────────────┬──────────────────────┘
               │
               │ HTTP Requests
               ▼
┌─────────────────────────────────────┐
│  AI Agent (Copilot Workspace)       │
│  - Configured to use CODOR API       │
│  - GET /codor/next-task              │
│  - Implements task                   │
│  - POST /codor/complete              │
└─────────────────────────────────────┘
```

### Pros ✅
- **Explicit control** - AI must call API to get tasks
- **Enforced workflow** - Cannot bypass task manager
- **Real-time communication** - Immediate feedback
- **Clean integration** - Formal API contract
- **Blocking mechanism** - Can reject completion if verification fails
- **Session tracking** - Know which AI is working on what

### Cons ❌
- **Requires AI agent support** - Copilot must be configured to use API
- **Network complexity** - Need to run HTTP server in extension
- **Configuration burden** - Developer must configure AI to use CODOR
- **Limited compatibility** - Only works with AI agents that support custom APIs
- **Security concerns** - Need authentication mechanism

### Implementation

```typescript
// extension/src/api/server.ts
import express from 'express';

export class CodorApiServer {
  private app = express();
  private port = 3141;
  
  start() {
    this.app.get('/codor/next-task', async (req, res) => {
      const task = await taskManager.getNextTask();
      res.json({ task });
    });
    
    this.app.post('/codor/complete', async (req, res) => {
      const { taskId, commit } = req.body;
      const result = await taskManager.completeTask(taskId, commit);
      res.json({ result });
    });
    
    this.app.listen(this.port);
  }
}
```

### Copilot Configuration

```json
// .copilot/config.json (hypothetical - may not exist)
{
  "taskManager": {
    "provider": "codor",
    "apiUrl": "http://localhost:3141/codor"
  }
}
```

**Problem:** GitHub Copilot Workspace doesn't support custom task manager APIs (yet?).

---

## Option 2: File Watching

### How It Works

```
┌─────────────────────────────────────┐
│  CODOR Extension                     │
│  - Monitors tasks.db for status      │
│  - Watches task.filePath for changes │
│  - Auto-verifies on file save        │
│  - Updates task status automatically │
└─────────────────────────────────────┘
               │
               │ No direct communication
               ▼
┌─────────────────────────────────────┐
│  AI Agent (Any agent)                │
│  - Works independently               │
│  - Edits files mentioned in tasks    │
│  - No knowledge of CODOR             │
└─────────────────────────────────────┘
```

### Workflow

```
1. Developer: "Implement T022: Customer model"
2. CODOR: Marks T022 as in-progress in database
3. Copilot: Edits packages/web/src/models/Customer.ts
4. CODOR: Detects file change via FileSystemWatcher
5. CODOR: Runs verification tests
6. CODOR: Updates task status based on results
7. Developer sees: T022 ✅ Verified or ❌ Failed
```

### Pros ✅
- **Universal compatibility** - Works with ANY AI agent (Copilot, Cursor, Claude, etc.)
- **No configuration needed** - AI doesn't need to know about CODOR
- **No network complexity** - Pure file system monitoring
- **Simpler implementation** - Just file watchers + database
- **Passive enforcement** - Doesn't interfere with AI workflow
- **Developer-friendly** - Can manually trigger tasks too

### Cons ❌
- **Less control** - Cannot prevent AI from working on wrong tasks
- **Detection lag** - Only knows task complete when file saved
- **Ambiguity** - Hard to know which task AI is working on
- **No blocking** - Cannot stop AI from proceeding to next task
- **Guess work** - Must infer task completion from file changes

### Implementation

```typescript
// extension/src/monitors/file-watcher.ts
export class TaskFileWatcher {
  private watchers: Map<string, vscode.FileSystemWatcher> = new Map();
  
  async watchTask(task: Task) {
    const watcher = vscode.workspace.createFileSystemWatcher(
      task.filePath
    );
    
    watcher.onDidSave(async (uri) => {
      console.log(`File saved: ${uri.fsPath}`);
      
      // Auto-verify task
      const result = await verifyTask(task);
      
      if (result.success) {
        await taskDb.markVerified(task.id);
        vscode.window.showInformationMessage(`✅ ${task.id} verified!`);
      } else {
        await taskDb.markFailed(task.id);
        vscode.window.showErrorMessage(`❌ ${task.id} failed verification`);
      }
    });
    
    this.watchers.set(task.id, watcher);
  }
}
```

---

## Option 3: Hybrid (Recommended) 🎯

### How It Works

```
┌─────────────────────────────────────────────────────────┐
│  CODOR Extension                                         │
│                                                          │
│  ┌────────────────────┐     ┌──────────────────────┐  │
│  │   REST API         │     │   File Watcher       │  │
│  │   (if supported)   │     │   (always works)     │  │
│  └──────┬─────────────┘     └────────┬─────────────┘  │
│         │                             │                 │
│         │                             │                 │
└─────────┼─────────────────────────────┼─────────────────┘
          │                             │
          ▼                             ▼
┌──────────────────────┐   ┌──────────────────────┐
│  AI with API support │   │  Any AI (fallback)   │
│  (future)            │   │  (current reality)   │
└──────────────────────┘   └──────────────────────┘
```

### Strategy

**Phase 1 (Now):** File Watching Only
- Implement robust file monitoring
- Works with all AI agents
- Get system working end-to-end

**Phase 2 (Future):** Add REST API
- Expose endpoints for AI agents
- Document API for AI vendors
- Provide opt-in API integration

**Phase 3 (Dream):** Native Integration
- Work with GitHub to integrate CODOR into Copilot Workspace
- Formal task manager protocol
- Deep integration

### Benefits ✅
- **Start immediately** - File watching works today
- **Future-proof** - Can add API later
- **Maximum compatibility** - Works with any AI
- **Gradual enhancement** - Add features over time
- **No dependencies** - Don't wait for AI vendor support

### Implementation Plan

```typescript
// extension/src/extension.ts
export function activate(context: vscode.ExtensionContext) {
  // Always: File watching (works with all AI)
  const fileWatcher = new TaskFileWatcher(taskDb);
  fileWatcher.start();
  
  // Optional: REST API (if configured)
  if (config.get('enableRestApi')) {
    const apiServer = new CodorApiServer(taskDb);
    apiServer.start();
  }
  
  // UI: Tree view (always)
  const treeProvider = new TaskTreeProvider(taskDb);
  vscode.window.registerTreeDataProvider('codor-tasks', treeProvider);
}
```

---

## Recommendation: Hybrid Approach 🎯

### Phase 1: File Watching (MVP)

**Implement Now:**
1. Task database (SQLite)
2. Spec Kit parser (import tasks.md)
3. File system watcher (monitor task files)
4. Auto-verification on save
5. Task tree view UI
6. Status updates

**Workflow:**
```
Developer → Opens task in CODOR UI → Tells AI "implement T022" →
AI edits file → File saved → CODOR detects → Verifies → Updates status
```

**Limitations:**
- Cannot force AI to follow order (but shows violations)
- Cannot block AI from proceeding (but shows warnings)
- Relies on developer discipline

**But:** Gets us 90% of value with 50% of complexity!

### Phase 2: REST API (Future Enhancement)

**Add Later:**
1. Express server in extension
2. /codor/next-task endpoint
3. /codor/complete endpoint
4. Authentication
5. AI agent integration docs

**Workflow:**
```
AI → GET /codor/next-task → Implements → POST /codor/complete →
CODOR verifies → Returns next task or failure
```

**Benefits:**
- Tighter integration when AI vendors support it
- Formal API contract
- Better enforcement

---

## Discussion Points

### For File Watching Approach:

**Q:** How do we know which task AI is working on?  
**A:** Developer selects task in UI, or we infer from file changes

**Q:** How do we prevent AI from jumping to wrong task?  
**A:** We can't prevent, but we can detect and warn

**Q:** What if AI edits multiple files?  
**A:** Watch all files in task.filePath + detect unexpected changes

**Q:** When do we trigger verification?  
**A:** On file save + on developer command + on task completion

### For REST API Approach:

**Q:** Will GitHub Copilot Workspace support it?  
**A:** Unknown - may need to request feature from GitHub

**Q:** How do we handle authentication?  
**A:** API key in extension settings, validated on each request

**Q:** What if AI doesn't call API?  
**A:** Fall back to file watching

---

## Decision Matrix

| Criteria | REST API | File Watch | Hybrid |
|----------|----------|------------|--------|
| Works today | ❌ No | ✅ Yes | ✅ Yes |
| Works with any AI | ❌ No | ✅ Yes | ✅ Yes |
| Tight control | ✅ Yes | ⚠️ Partial | ⚠️ Partial |
| Simple to implement | ❌ Complex | ✅ Simple | ⚠️ Medium |
| Future-proof | ⚠️ Maybe | ✅ Yes | ✅ Yes |
| Developer friction | ⚠️ Medium | ✅ Low | ✅ Low |

**Winner:** Hybrid (start with File Watching)

---

## Implementation Proposal

### Week 1: File Watching Foundation

```typescript
// Core components
- TaskDatabase (SQLite)
- SpecKitParser (tasks.md → Task objects)
- TaskFileWatcher (monitor files, auto-verify)
- TaskTreeProvider (UI)
- VerificationEngine (call CODOR core, check results)
```

### Week 2: Enhanced File Watching

```typescript
// Smarter detection
- Multi-file tracking
- Change pattern analysis
- Task inference from file paths
- Unexpected edit detection
```

### Week 3: REST API (Optional)

```typescript
// If time permits
- Express server
- Basic endpoints
- API documentation
```

---

## Questions for Discussion

1. **Start with file watching only?** (Recommended: Yes)
2. **Add REST API in Phase 2?** (Recommended: Yes, but low priority)
3. **How strict should file watching be?**
   - Just informational (passive)
   - Warnings when violations detected (semi-passive)
   - Block commit if tasks not verified (active)
4. **When should verification run?**
   - On every file save? (could be slow)
   - On developer command only?
   - On task completion signal?
5. **How do we signal task completion?**
   - Developer clicks "Complete Task" button?
   - Detect file save + ask "Is T022 complete?"
   - Automatic after X minutes of no changes?

---

## Recommendation Summary

**Primary Approach:** File Watching (Week 1-2)
- Works with all AI agents today
- Simple, robust, no external dependencies
- Gets us to working system fastest

**Secondary Approach:** REST API (Week 3+)
- Add when file watching proven
- Document API for AI vendors
- Prepare for future native integration

**Configuration:**
```json
{
  "codor.monitoring": {
    "fileWatching": true,          // Always on
    "restApi": false,              // Off by default, enable when AI supports it
    "strictMode": "warn",          // "passive" | "warn" | "block"
    "verifyOnSave": true,
    "verifyOnCommand": true
  }
}
```

**This gives us the best of both worlds: works immediately, room to grow.** ✅

---

## Your Decision Needed

1. Agree with hybrid approach (file watching first)?
2. When should verification run (on save vs on command)?
3. How strict should warnings be?
4. Should we implement REST API in Phase 1 or defer?

**Let's discuss!** 🤔
