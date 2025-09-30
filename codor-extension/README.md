# CODOR VS Code Extension

**AI Agent Task Manager & Quality Gate for Specification-Driven Development**

## Overview

CODOR Extension is a VS Code extension that acts as an authoritative task manager and quality gate for AI coding agents (GitHub Copilot Workspace, Cursor, etc.) implementing tasks from GitHub Spec Kit.

## Core Features

- ✅ **Task Management**: Import and manage tasks from Spec Kit `tasks.md`
- ✅ **Verification Gates**: Automatically verify task completion against requirements
- ✅ **AI Agent Control**: Force AI agents to follow task order and meet acceptance criteria
- ✅ **Evidence Collection**: Track test results, failures, and technical debt
- ✅ **Real-time Monitoring**: Watch file changes and auto-verify on completion

## Architecture

```
CODOR Extension
├── Task Database (SQLite)           # Authoritative task storage
├── Spec Kit Parser                  # Import from tasks.md
├── Task Manager                     # Get next task, verify completion
├── Verification Engine              # Run CODOR tests, check requirements
├── File Watcher                     # Monitor code changes
└── UI Components                    # Tree view, status bar, webview
```

## Project Status

**Status:** 🚧 In Development (Design Complete)  
**Version:** 0.1.0-alpha  
**Last Updated:** September 30, 2025

## Design Documents

See the root repository for comprehensive design documents:
- `CODOR-TECHNICAL-OVERVIEW.md` - System architecture and philosophy
- `ENGINE-CURRENT-STATE.md` - Core engine status
- `ARCHITECTURE-CORE-VS-EXTENSION.md` - Separation of concerns
- `CODOR-SPEC-KIT-INTEGRATION.md` - Spec Kit integration design
- `CODOR-TASK-MANAGEMENT-DESIGN.md` - Task management architecture ⭐

## Development Setup

### Prerequisites

- Node.js 18+
- VS Code 1.85+
- TypeScript 5.0+

### Installation

```bash
cd codor-extension
npm install
npm run compile
```

### Running in Development

Press `F5` in VS Code to launch Extension Development Host.

## Roadmap

**Phase 1: Core Task Manager (Week 1)**
- [x] Design & Documentation
- [ ] Extension scaffold
- [ ] SQLite task database
- [ ] Spec Kit parser
- [ ] Basic tree view

**Phase 2: Verification Engine (Week 2)**
- [ ] CODOR engine integration
- [ ] File watching
- [ ] Auto-verification
- [ ] Evidence collection

**Phase 3: AI Integration (Week 3)**
- [ ] API endpoints (REST)
- [ ] Copilot integration
- [ ] Prompt injection
- [ ] Attribution tracking

**Phase 4: Polish (Week 4)**
- [ ] Configuration system
- [ ] Manual override
- [ ] Reporting & export
- [ ] Documentation

## Configuration

```json
{
  "codor.taskManager": {
    "strictMode": true,
    "autoVerify": true,
    "blockOnFailure": true,
    "allowManualOverride": true
  },
  "codor.database": {
    "path": ".codor/tasks.db",
    "commitToGit": true
  },
  "codor.verification": {
    "requirementsCoverage": true,
    "acceptanceCriteria": true,
    "technicalDebtThreshold": "medium"
  }
}
```

## License

Same as parent project (to be determined)

## Contributing

This extension will likely be moved to its own repository in the future.

---

**This is the way.** 🎯
