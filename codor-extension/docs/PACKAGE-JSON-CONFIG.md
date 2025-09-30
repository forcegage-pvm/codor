# CODOR Extension Package Configuration

This document contains the full VS Code extension configuration for reference during implementation.

## Full package.json Template

```json
{
  "name": "codor",
  "displayName": "CODOR Task Manager",
  "description": "Specification-driven development with task management, verification gates, and AI agent control",
  "version": "0.0.1",
  "publisher": "forcegage",
  "engines": {
    "vscode": "^1.104.0"
  },
  "categories": ["Testing", "Other"],
  "keywords": ["testing", "task management", "spec kit", "verification", "ai agent"],
  "activationEvents": ["onStartupFinished", "workspaceContains:.specify/**"],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "codor.newFeature",
        "title": "CODOR: New Feature",
        "icon": "$(add)"
      },
      {
        "command": "codor.generateSpec",
        "title": "CODOR: Generate Specification",
        "icon": "$(file-text)"
      },
      {
        "command": "codor.generatePlan",
        "title": "CODOR: Generate Plan",
        "icon": "$(list-tree)"
      },
      {
        "command": "codor.generateTasks",
        "title": "CODOR: Generate Tasks",
        "icon": "$(checklist)"
      },
      {
        "command": "codor.startTask",
        "title": "CODOR: Start Task",
        "icon": "$(play)"
      },
      {
        "command": "codor.verifyAndNext",
        "title": "CODOR: Verify & Next Task",
        "icon": "$(pass)"
      },
      {
        "command": "codor.viewTaskDetails",
        "title": "CODOR: View Task Details"
      },
      {
        "command": "codor.openInEditor",
        "title": "CODOR: Open in Editor"
      },
      {
        "command": "codor.viewInUI",
        "title": "CODOR: View in CODOR UI"
      },
      {
        "command": "codor.refreshTasks",
        "title": "CODOR: Refresh",
        "icon": "$(refresh)"
      },
      {
        "command": "codor.applySpecKitPatches",
        "title": "CODOR: Apply Spec Kit Patches"
      },
      {
        "command": "codor.checkSpecKitPatches",
        "title": "CODOR: Check Spec Kit Patches"
      }
    ],
    "viewsContainers": {
      "activitybar": [
        {
          "id": "codor",
          "title": "CODOR",
          "icon": "$(checklist)"
        }
      ]
    },
    "views": {
      "codor": [
        {
          "id": "codor-features",
          "name": "Features",
          "icon": "$(folder)",
          "contextualTitle": "CODOR Features"
        },
        {
          "id": "codor-task-queue",
          "name": "Task Queue",
          "icon": "$(checklist)",
          "contextualTitle": "CODOR Task Queue"
        }
      ]
    },
    "menus": {
      "view/title": [
        {
          "command": "codor.newFeature",
          "when": "view == codor-features",
          "group": "navigation"
        },
        {
          "command": "codor.refreshTasks",
          "when": "view == codor-features || view == codor-task-queue",
          "group": "navigation"
        }
      ],
      "view/item/context": [
        {
          "command": "codor.openInEditor",
          "when": "viewItem == spec-file || viewItem == plan-file",
          "group": "inline"
        },
        {
          "command": "codor.viewInUI",
          "when": "viewItem == spec-file || viewItem == plan-file"
        },
        {
          "command": "codor.generateSpec",
          "when": "viewItem == feature && !hasSpec"
        },
        {
          "command": "codor.generatePlan",
          "when": "viewItem == feature && hasSpec && !hasPlan"
        },
        {
          "command": "codor.generateTasks",
          "when": "viewItem == feature && hasPlan && !hasTasks"
        },
        {
          "command": "codor.startTask",
          "when": "viewItem == pending-task"
        },
        {
          "command": "codor.verifyAndNext",
          "when": "viewItem == current-task"
        },
        {
          "command": "codor.viewTaskDetails",
          "when": "viewItem == task || viewItem == current-task || viewItem == pending-task"
        }
      ],
      "commandPalette": [
        {
          "command": "codor.openInEditor",
          "when": "false"
        },
        {
          "command": "codor.viewInUI",
          "when": "false"
        }
      ]
    },
    "configuration": {
      "title": "CODOR",
      "properties": {
        "codor.taskManagement.enabled": {
          "type": "boolean",
          "default": true,
          "description": "Enable CODOR task management"
        },
        "codor.taskManagement.strictMode": {
          "type": "boolean",
          "default": true,
          "description": "Require verification before providing next task"
        },
        "codor.taskManagement.allowManualOverride": {
          "type": "boolean",
          "default": true,
          "description": "Allow developer to manually override verification failures"
        },
        "codor.taskManagement.requireOverrideReason": {
          "type": "boolean",
          "default": true,
          "description": "Require reason when manually overriding verification"
        },
        "codor.taskManagement.autoVerifyOnSave": {
          "type": "boolean",
          "default": false,
          "description": "Automatically verify task when file is saved"
        },
        "codor.specKit.autoImportOnGenerate": {
          "type": "boolean",
          "default": true,
          "description": "Automatically import spec.md and plan.md to database when generated"
        },
        "codor.specKit.patchingEnabled": {
          "type": "boolean",
          "default": true,
          "description": "Enable automatic Spec Kit patching for CODOR integration"
        },
        "codor.specKit.autoReapplyPatches": {
          "type": "boolean",
          "default": true,
          "description": "Automatically reapply patches when Spec Kit is updated"
        },
        "codor.database.path": {
          "type": "string",
          "default": ".codor/tasks.db",
          "description": "Path to CODOR database (relative to workspace root)"
        },
        "codor.evidence.path": {
          "type": "string",
          "default": ".codor/evidence",
          "description": "Path to CODOR evidence directory (relative to workspace root)"
        }
      }
    }
  },
  "scripts": {
    "vscode:prepublish": "npm run compile",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "pretest": "npm run compile && npm run lint",
    "lint": "eslint src",
    "test": "vscode-test"
  },
  "devDependencies": {
    "@types/vscode": "^1.104.0",
    "@types/mocha": "^10.0.10",
    "@types/node": "22.x",
    "@typescript-eslint/eslint-plugin": "^8.42.0",
    "@typescript-eslint/parser": "^8.42.0",
    "eslint": "^9.34.0",
    "typescript": "^5.9.2",
    "@vscode/test-cli": "^0.0.11",
    "@vscode/test-electron": "^2.4.1"
  },
  "dependencies": {
    "better-sqlite3": "^11.8.1"
  }
}
```

## Notes

- Commands will be implemented incrementally as features are developed
- Views will be populated by TreeDataProvider implementations
- Configuration settings will be accessed via VS Code settings API
- The minimal package.json is sufficient for initial development
- Full configuration will be added once we implement the actual command handlers and views
