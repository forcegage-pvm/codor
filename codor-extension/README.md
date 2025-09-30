# CODOR VS Code Extension

**AI Agent Task Manager & Quality Gate for Specification-Driven Development**

## Overview

CODOR Extension is a VS Code extension that acts as an authoritative task manager and quality gate for AI coding agents (GitHub Copilot Workspace, Cursor, etc.) implementing tasks from GitHub Spec Kit.

**Key Innovation:** Instead of letting AI agents freely access `tasks.md` files (leading to drift and fabrication), CODOR intercepts task generation at the source, stores tasks in a SQLite database, and exposes only one task at a time through a controlled UI.

## Core Features

- ✅ **Spec Kit Augmentation**: Minimal patches to Spec Kit scripts to emit tasks directly to CODOR
- ✅ **Database-Driven Task Management**: Tasks stored in SQLite, never exposed as `tasks.md`
- ✅ **UI Task Queue**: Tree view showing features, specs, plans, and current task only
- ✅ **Verification Gates**: Automatically verify task completion against requirements
- ✅ **AI Agent Control**: Force AI agents to follow task order and meet acceptance criteria
- ✅ **Evidence Collection**: Track test results, failures, and technical debt
- ✅ **Git-Friendly**: Spec/plan files remain as markdown for version control

## Architecture

```
CODOR Extension (Hybrid Approach)
├── Spec Kit (Minimal Patches)
│   ├── Generates spec.md/plan.md (as files)
│   └── Emits tasks to CODOR database (not tasks.md)
├── Task Database (SQLite)
│   ├── Features, specs, plans, tasks
│   └── Committed to git for team sync
├── UI Components
│   ├── Features Tree View
│   ├── Task Queue (current task only)
│   ├── Task Details Webview
│   └── Evidence Viewer
└── Verification Engine
    ├── Run CODOR tests
    ├── Check acceptance criteria
    └── Collect evidence
```

## Project Status

**Status:** 🚧 In Development (Scaffold Complete)  
**Version:** 0.0.1  
**Last Updated:** September 30, 2025

## Design Documents

See `docs/` for comprehensive design documents:
- `SPEC-KIT-AUGMENTATION-STRATEGY.md` - How CODOR patches Spec Kit
- `CODOR-AS-SPEC-KIT-FRONTEND.md` - UI wrapper approach
- `SPEC-KIT-WORKFLOW-INTERCEPTION.md` - Task interception design
- `UI-STRATEGY-DECISION.md` - User interface design
- `API-INTEGRATION-DECISION.md` - Database and API design
- `WORKFLOW-INTERCEPTION-RISKS.md` - Risk analysis
- `SPEC-KIT-STRUCTURE-ANALYSIS.md` - Spec Kit internals

## Development

### Prerequisites
- Node.js 20.x or higher
- VS Code 1.104.0 or higher
- TypeScript 5.9.2 or higher

### Setup
```bash
cd codor-extension
npm install
```

### Development Workflow
```bash
# Compile TypeScript
npm run compile

# Watch mode (auto-compile on save)
npm run watch

# Run linter
npm run lint

# Run tests
npm test
```

### Debugging
1. Open `codor-extension` folder in VS Code
2. Press `F5` to launch Extension Development Host
3. Set breakpoints in `src/` files
4. Test commands from Command Palette (`Ctrl+Shift+P`)

## Configuration

See `package.json` for available settings:
- `codor.taskManagement.*` - Task management behavior
- `codor.specKit.*` - Spec Kit integration settings
- `codor.database.path` - Database location
- `codor.evidence.path` - Evidence directory

## License

See parent repository LICENSE

## Contributing

This extension is part of the CODOR project. See parent repository for contribution guidelines.
