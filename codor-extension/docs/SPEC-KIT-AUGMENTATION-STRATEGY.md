# CODOR Integration with Spec Kit - Augmentation Strategy

**Date:** September 30, 2025  
**Status:** Final Architecture Decision  
**Approach:** Augment Spec Kit, don't replace it

---

## 🎯 Core Principle

> **"Feed off Spec Kit, don't replace it"**

- ✅ Spec Kit remains the source of truth for workflow
- ✅ Spec Kit continues to generate spec.md, plan.md
- ✅ CODOR intercepts only the tasks generation
- ✅ User can update Spec Kit independently
- ✅ CODOR reapplies patches when Spec Kit updates

---

## 🏗️ Architecture: Spec Kit Augmentation

### What Stays the Same (Spec Kit)

```
User: /specify
  ↓
Spec Kit generates: specs/004-feature/spec.md ✅
  ↓
User: /plan
  ↓
Spec Kit generates: specs/004-feature/plan.md ✅
  ↓
User: /tasks
  ↓
Spec Kit TRIES to generate: tasks.md
  ↓
CODOR intercepts ⚡ ← WE HOOK HERE
  ↓
CODOR captures output → stores in database
  ↓
NO tasks.md file created ✅
```

### What Changes (CODOR Patches)

```
Before (Original Spec Kit):
.specify/scripts/powershell/tasks-generation.ps1
  ↓
  $content | Out-File "tasks.md"  ← Writes file


After (CODOR Patched):
.specify/scripts/powershell/tasks-generation.ps1
  ↓
  if ($env:CODOR_ENABLED) {
    # CODOR mode: emit to stdout as JSON
    $tasks | ConvertTo-Json | Write-Output
  } else {
    # Original mode: write file
    $content | Out-File "tasks.md"
  }
```

---

## 🔧 Integration Points

### 1. Minimal Script Modifications

**Files to Patch:**

```powershell
# .specify/scripts/powershell/tasks-generation.ps1 (NEW FILE)

# This is the actual task generation logic
# Currently embedded in tasks.prompt.md
# We extract it to a script that can be called by both:
# - GitHub Copilot (via prompt)
# - CODOR Extension (directly)

param(
    [switch]$CodorMode,
    [switch]$Json,
    [string]$FeatureDir
)

# ... existing task generation logic ...

if ($CodorMode) {
    # Output JSON for CODOR to capture
    @{
        tasks = $tasks
        metadata = @{
            featureDir = $FeatureDir
            generatedAt = Get-Date -Format 'o'
            specKitVersion = '1.0.0'
        }
    } | ConvertTo-Json -Depth 10
} else {
    # Original behavior: write tasks.md file
    $content | Out-File "$FeatureDir/tasks.md" -Encoding UTF8
}
```

**Patch Strategy:**

```typescript
// CODOR Extension applies patches on activation
export async function activate(context: vscode.ExtensionContext) {
  
  // Check if patches applied
  const patchStatus = await checkSpecKitPatches();
  
  if (!patchStatus.applied) {
    const action = await vscode.window.showInformationMessage(
      '🔧 CODOR needs to patch Spec Kit scripts for integration. Apply patches?',
      'Yes, Apply',
      'Not Now',
      'Learn More'
    );
    
    if (action === 'Yes, Apply') {
      await applySpecKitPatches();
      vscode.window.showInformationMessage('✅ Spec Kit patches applied!');
    }
  }
  
  // Check for Spec Kit updates
  watchSpecKitChanges(context);
}
```

### 2. Patch Management System

```typescript
// extension/src/integrations/spec-kit-patcher.ts

interface Patch {
  id: string;
  file: string;
  description: string;
  search: string;      // Code to find
  replace: string;     // Code to insert
  version: string;     // CODOR patch version
}

const CODOR_PATCHES: Patch[] = [
  {
    id: 'tasks-generation-codor-mode',
    file: '.specify/scripts/powershell/tasks-generation.ps1',
    description: 'Add CODOR mode to task generation',
    search: `
# Generate tasks.md content
$content | Out-File "$FeatureDir/tasks.md" -Encoding UTF8
`,
    replace: `
# Generate tasks.md content
if ($env:CODOR_ENABLED -eq 'true') {
    # CODOR mode: output JSON to stdout
    @{
        tasks = $tasks
        metadata = @{
            featureDir = $FeatureDir
            generatedAt = Get-Date -Format 'o'
            source = 'spec-kit'
        }
    } | ConvertTo-Json -Depth 10
} else {
    # Original mode: write file
    $content | Out-File "$FeatureDir/tasks.md" -Encoding UTF8
}
`,
    version: '1.0.0'
  }
];

export class SpecKitPatcher {
  
  async checkPatchStatus(): Promise<PatchStatus> {
    const results = await Promise.all(
      CODOR_PATCHES.map(patch => this.isPatchApplied(patch))
    );
    
    return {
      applied: results.every(r => r.applied),
      patches: results
    };
  }
  
  async isPatchApplied(patch: Patch): Promise<PatchResult> {
    const filePath = path.join(workspaceRoot, patch.file);
    
    if (!await fs.pathExists(filePath)) {
      return {
        applied: false,
        reason: 'File not found',
        file: patch.file
      };
    }
    
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Check if patch already applied
    if (content.includes('CODOR_ENABLED')) {
      return {
        applied: true,
        file: patch.file,
        version: patch.version
      };
    }
    
    // Check if search pattern exists (can we apply?)
    if (content.includes(patch.search)) {
      return {
        applied: false,
        canApply: true,
        file: patch.file
      };
    }
    
    // Pattern not found - Spec Kit might have been updated
    return {
      applied: false,
      canApply: false,
      reason: 'Search pattern not found - Spec Kit may have been updated',
      file: patch.file
    };
  }
  
  async applyPatches(): Promise<PatchApplyResult> {
    const results: PatchResult[] = [];
    
    for (const patch of CODOR_PATCHES) {
      try {
        const result = await this.applyPatch(patch);
        results.push(result);
      } catch (error) {
        results.push({
          applied: false,
          error: error.message,
          file: patch.file
        });
      }
    }
    
    return {
      success: results.every(r => r.applied),
      results
    };
  }
  
  async applyPatch(patch: Patch): Promise<PatchResult> {
    const filePath = path.join(workspaceRoot, patch.file);
    
    // Backup original file
    await fs.copy(filePath, `${filePath}.codor-backup`);
    
    // Read current content
    let content = await fs.readFile(filePath, 'utf-8');
    
    // Apply patch
    if (!content.includes(patch.search)) {
      throw new Error(`Search pattern not found in ${patch.file}`);
    }
    
    content = content.replace(patch.search, patch.replace);
    
    // Add CODOR marker
    const marker = `
# CODOR PATCH APPLIED
# Patch ID: ${patch.id}
# Version: ${patch.version}
# Description: ${patch.description}
# Applied: ${new Date().toISOString()}
# To restore original: mv ${path.basename(filePath)}.codor-backup ${path.basename(filePath)}

`;
    content = marker + content;
    
    // Write patched file
    await fs.writeFile(filePath, content, 'utf-8');
    
    return {
      applied: true,
      file: patch.file,
      version: patch.version
    };
  }
  
  async restoreOriginals(): Promise<void> {
    // Restore from backups
    for (const patch of CODOR_PATCHES) {
      const filePath = path.join(workspaceRoot, patch.file);
      const backupPath = `${filePath}.codor-backup`;
      
      if (await fs.pathExists(backupPath)) {
        await fs.copy(backupPath, filePath, { overwrite: true });
      }
    }
  }
}
```

### 3. Auto-Reapply on Spec Kit Update

```typescript
// extension/src/watchers/spec-kit-watcher.ts

export class SpecKitUpdateWatcher {
  
  private watcher: vscode.FileSystemWatcher;
  
  constructor() {
    // Watch Spec Kit scripts directory
    this.watcher = vscode.workspace.createFileSystemWatcher(
      '**/.specify/scripts/**/*.ps1'
    );
    
    this.watcher.onDidChange(this.onScriptChanged.bind(this));
  }
  
  private async onScriptChanged(uri: vscode.Uri) {
    // Check if changed file is one we patched
    const patchedFiles = CODOR_PATCHES.map(p => p.file);
    const relativePath = vscode.workspace.asRelativePath(uri);
    
    if (!patchedFiles.includes(relativePath)) {
      return; // Not a file we care about
    }
    
    // Check if our patch is still applied
    const patcher = new SpecKitPatcher();
    const patch = CODOR_PATCHES.find(p => p.file === relativePath);
    const status = await patcher.isPatchApplied(patch);
    
    if (!status.applied) {
      // Patch was removed (user updated Spec Kit)
      const action = await vscode.window.showWarningMessage(
        `⚠️ Spec Kit script updated: ${path.basename(relativePath)}\n` +
        `CODOR patches need to be reapplied. Apply now?`,
        'Yes, Reapply',
        'Not Now',
        'Show Diff'
      );
      
      if (action === 'Yes, Reapply') {
        await patcher.applyPatch(patch);
        vscode.window.showInformationMessage('✅ CODOR patches reapplied!');
      } else if (action === 'Show Diff') {
        await this.showPatchDiff(patch);
      }
    }
  }
  
  private async showPatchDiff(patch: Patch) {
    // Show diff between original and patched
    const originalUri = vscode.Uri.file(
      path.join(workspaceRoot, `${patch.file}.codor-backup`)
    );
    const patchedUri = vscode.Uri.file(
      path.join(workspaceRoot, patch.file)
    );
    
    await vscode.commands.executeCommand(
      'vscode.diff',
      originalUri,
      patchedUri,
      `CODOR Patch: ${path.basename(patch.file)}`
    );
  }
}
```

---

## 🔄 Workflow Integration

### User Experience

```
1. Install CODOR Extension
   ↓
2. CODOR detects Spec Kit
   ↓
3. CODOR prompts: "Apply patches to Spec Kit?"
   ↓
4. User clicks "Yes, Apply"
   ↓
5. CODOR patches .specify/scripts/
   ↓
6. User continues using /specify, /plan as normal
   ↓
7. User runs /tasks
   ↓
8. Spec Kit script runs with CODOR_ENABLED=true
   ↓
9. Script outputs JSON to stdout
   ↓
10. CODOR captures JSON, stores in database
   ↓
11. Agent requests task from CODOR
```

### If User Updates Spec Kit

```
1. User: npm update @spec-kit (or git pull)
   ↓
2. Spec Kit scripts updated (patches overwritten)
   ↓
3. CODOR FileSystemWatcher detects change
   ↓
4. CODOR checks if patches still applied
   ↓
5. CODOR prompts: "Spec Kit updated. Reapply patches?"
   ↓
6. User clicks "Yes, Reapply"
   ↓
7. CODOR reapplies patches
   ↓
8. Everything works again ✅
```

---

## 📦 What We Actually Patch

### Minimal Changes Required

**Option 1: Environment Variable Check (Recommended)**

```powershell
# Add to beginning of .specify/scripts/powershell/tasks-generation.ps1

# CODOR Integration Check
if ($env:CODOR_ENABLED -eq 'true') {
    # CODOR will capture this output
    # Output JSON instead of writing file
    $codorOutput = @{
        tasks = $generatedTasks
        feature = $featureInfo
    }
    $codorOutput | ConvertTo-Json -Depth 10
    exit 0
}

# Original behavior continues below...
```

**That's it!** Just check an environment variable.

**Option 2: Parameter Flag**

```powershell
# Add parameter to script
param(
    [switch]$CodorMode,
    # ... existing parameters
)

if ($CodorMode) {
    # Output JSON
    $tasks | ConvertTo-Json -Depth 10
    exit 0
}

# Original behavior
```

### How CODOR Calls Scripts

```typescript
// extension/src/integrations/spec-kit-executor.ts

export class SpecKitExecutor {
  
  async generateTasks(featureDir: string): Promise<Task[]> {
    // Set environment variable for CODOR mode
    const env = {
      ...process.env,
      CODOR_ENABLED: 'true'
    };
    
    // Call Spec Kit script
    const result = await exec(
      'pwsh',
      [
        '.specify/scripts/powershell/tasks-generation.ps1',
        '-FeatureDir', featureDir
      ],
      { env }
    );
    
    // Parse JSON output
    const output = JSON.parse(result.stdout);
    
    // Store in database
    await this.storeTasks(output.tasks);
    
    return output.tasks;
  }
}
```

---

## 🎨 CODOR UI Integration

### Spec Kit Workflow with CODOR UI

```typescript
// User clicks "Generate Tasks" in CODOR UI
async function handleGenerateTasks(featureId: string) {
  
  // Show progress
  await vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: 'Generating tasks...',
    cancellable: false
  }, async (progress) => {
    
    progress.report({ increment: 0, message: 'Calling Spec Kit...' });
    
    // 1. Call Spec Kit script (with CODOR mode)
    const executor = new SpecKitExecutor();
    const tasks = await executor.generateTasks(featureDir);
    
    progress.report({ increment: 50, message: 'Storing in database...' });
    
    // 2. Store in CODOR database
    await taskDb.importTasks(featureId, tasks);
    
    progress.report({ increment: 100, message: 'Complete!' });
  });
  
  // Refresh UI
  taskTreeProvider.refresh();
  
  // Show summary
  vscode.window.showInformationMessage(
    `✅ Generated ${tasks.length} tasks for ${featureName}`
  );
}
```

### UI Shows Tasks (Agent Doesn't)

```
CODOR Panel:
┌─────────────────────────────────────┐
│ 📋 Feature: User Authentication     │
│                                     │
│ Specification: ✅ Generated         │
│ Plan: ✅ Generated                  │
│ Tasks: ✅ 18 tasks ready            │
│                                     │
│ [Start Implementation]              │
└─────────────────────────────────────┘

Developer clicks "Start Implementation"
  ↓
CODOR shows:
┌─────────────────────────────────────┐
│ 🔄 Current Task: T001               │
│                                     │
│ Setup: Initialize project           │
│ File: package.json                  │
│                                     │
│ [View Details] [Mark Complete]      │
└─────────────────────────────────────┘

Task list (Developer view):
  🔄 T001: Setup (in progress)
  ⏳ T002: Database connection
  ⏳ T003: User model
  ... (15 more)

Agent view: (via chat/context)
  "Current task: T001 - Initialize project
   File: package.json
   Requirements: ...
   
   Focus on this task only."
```

---

## 🔒 Backward Compatibility

### Spec Kit Still Works Without CODOR

```powershell
# .specify/scripts/powershell/tasks-generation.ps1

if ($env:CODOR_ENABLED -eq 'true') {
    # CODOR mode
    $tasks | ConvertTo-Json | Write-Output
} else {
    # Original Spec Kit behavior
    # Works exactly as before!
    $content | Out-File "tasks.md"
}
```

**Result:**
- ✅ User without CODOR: Spec Kit works normally
- ✅ User with CODOR: Tasks go to database
- ✅ User can disable CODOR: Spec Kit works normally

---

## 📋 Implementation Checklist

### Phase 1: Patch System (Week 1)

```typescript
✅ Create SpecKitPatcher class
✅ Define CODOR_PATCHES array
✅ Implement checkPatchStatus()
✅ Implement applyPatches()
✅ Implement isPatchApplied()
✅ Create backup/restore system
✅ Add patch markers to files
```

### Phase 2: File Watching (Week 1)

```typescript
✅ Create SpecKitUpdateWatcher
✅ Watch .specify/scripts/ for changes
✅ Detect when patches overwritten
✅ Prompt user to reapply
✅ Show diff viewer
```

### Phase 3: Script Executor (Week 2)

```typescript
✅ Create SpecKitExecutor class
✅ Call scripts with CODOR_ENABLED=true
✅ Parse JSON output
✅ Store in database
✅ Handle errors gracefully
```

### Phase 4: UI Integration (Week 2)

```typescript
✅ Add "Generate Tasks" button
✅ Show progress indicator
✅ Display tasks in tree view
✅ Provide one task at a time to agent
```

---

## 🎯 Benefits of Augmentation Approach

| Aspect | Benefit |
|--------|---------|
| **Spec Kit Independence** | User can update Spec Kit anytime |
| **Minimal Changes** | Only patch task generation output |
| **Backward Compatible** | Spec Kit works without CODOR |
| **Easy to Disable** | Remove env var or restore backups |
| **Spec Kit Features** | All /specify, /plan features work as-is |
| **CODOR Features** | Task management, verification, enforcement |
| **Best of Both** | Proven workflow + quality control |

---

## 🚀 Summary

**What We Do:**
1. ✅ Let Spec Kit handle /specify and /plan (generate spec.md, plan.md)
2. ✅ Patch task generation to output JSON when CODOR_ENABLED=true
3. ✅ CODOR captures JSON, stores in database
4. ✅ NO tasks.md file created
5. ✅ Auto-reapply patches when Spec Kit updates
6. ✅ Provide tasks one at a time to agent

**What We Don't Do:**
- ❌ Replace Spec Kit
- ❌ Reimplement /specify or /plan
- ❌ Change Spec Kit's core workflow
- ❌ Make Spec Kit depend on CODOR

**Result:**
- ✅ Spec Kit does what it does best (specification workflow)
- ✅ CODOR does what it does best (task management + verification)
- ✅ Clean separation of concerns
- ✅ User gets best of both worlds

**This is the way!** 🎯

---

## Next Steps

1. **Create minimal patch** (add CODOR_ENABLED check)
2. **Test patch system** (apply, check, reapply)
3. **Build script executor** (call with env var)
4. **Store in database** (capture JSON output)
5. **Build UI** (show tasks, provide to agent)

Ready to implement? 🚀
