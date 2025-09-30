# CODOR Documentation Structure

**Created**: September 30, 2025  
**Purpose**: Visual guide to organized documentation

---

## 📁 New Folder Structure

```
codor/
├── README.md                          # Main project overview (updated to v5.0)
├── .core/                             # CODOR v4.0 constitution files
├── docs/
│   └── specifications/                # 🆕 ALL CODOR v5.0 SPECS HERE
│       ├── README.md                  # 📖 START HERE - Complete documentation index
│       │
│       ├── core-framework/            # 🏗️ TES Architecture
│       │   ├── CODOR-v5-TES-SPECIFICATION.md
│       │   └── CONSTITUTIONAL-INTEGRATION-DESIGN.md
│       │
│       ├── testing-system/            # 🧪 Agent-Removed Testing
│       │   ├── SCRIPT-BASED-TESTING-FRAMEWORK-SPECIFICATION.md
│       │   ├── SCRIPT-BASED-TESTING-FRAMEWORK-AMENDMENTS.md
│       │   └── SCRIPT-BASED-TESTING-VALIDATION.md
│       │
│       ├── implementation/            # 🚀 Implementation Guides
│       │   ├── CODOR-v5-IMPLEMENTATION-ROADMAP.md
│       │   └── PHASE1-SETUP.md
│       │
│       └── analysis/                  # 🔍 Problem Analysis
│           └── MCP-ENFORCEMENT-FAILURE-ANALYSIS.md
│
├── prototype/                         # Working prototype code
│   └── script-execution-engine.js
│
├── test-case/                         # Test case implementation
└── evidence/                          # Evidence collection
```

---

## 🎯 Quick Access Guide

### I Want To...

#### **Understand the Problem**
→ Read: `docs/specifications/analysis/MCP-ENFORCEMENT-FAILURE-ANALYSIS.md`
- Why traditional testing fails
- Agent fabrication problem
- Real-world evidence

#### **Learn the Solution**
→ Read: `docs/specifications/core-framework/CODOR-v5-TES-SPECIFICATION.md`
- Technological Enforcement System architecture
- 3-layer enforcement approach
- How we make fabrication impossible

#### **Implement the Testing Framework**
→ Start: `docs/specifications/README.md` (Reading Order section)
- Complete step-by-step reading order
- Links to all relevant documents
- Implementation priority

#### **Get Started Right Now**
→ Follow: `docs/specifications/implementation/PHASE1-SETUP.md`
- Immediate setup steps
- Environment configuration
- First implementation phase

#### **Understand Technical Details**
→ Read: `docs/specifications/testing-system/SCRIPT-BASED-TESTING-FRAMEWORK-SPECIFICATION.md`
- 2000+ line complete specification
- Component architecture
- Integration with Spec Kit

#### **Review Critical Amendments**
→ Read: `docs/specifications/testing-system/SCRIPT-BASED-TESTING-FRAMEWORK-AMENDMENTS.md`
- Universal test command support
- Technical debt management authority
- Task status lock enforcement

---

## 📚 Document Categories

### Core Framework (2 documents)
Purpose: Foundational architecture and enforcement system

1. **CODOR-v5-TES-SPECIFICATION.md**
   - Complete TES architecture
   - 3-layer enforcement system
   - Evidence authenticity system
   
2. **CONSTITUTIONAL-INTEGRATION-DESIGN.md**
   - Integration with CODOR mandates
   - Constitutional enforcement engine
   - Violation detection

### Testing System (3 documents)
Purpose: Agent-removed testing framework specifications

1. **SCRIPT-BASED-TESTING-FRAMEWORK-SPECIFICATION.md** (2000+ lines)
   - Complete testing framework specification
   - Test execution engine
   - Evidence collection system
   - Technical debt generator
   - Task status management
   
2. **SCRIPT-BASED-TESTING-FRAMEWORK-AMENDMENTS.md**
   - Universal test command support (ANY command type)
   - Technical debt management authority
   - Task status lock enforcement
   
3. **SCRIPT-BASED-TESTING-VALIDATION.md**
   - Prototype validation results
   - Evidence quality assessment
   - Proof of concept

### Implementation (2 documents)
Purpose: Step-by-step implementation guides

1. **CODOR-v5-IMPLEMENTATION-ROADMAP.md**
   - 4-phase implementation plan
   - Technology stack (Rust, Python, Go, React)
   - Architectural Decision Records (ADRs)
   - 16-week timeline
   
2. **PHASE1-SETUP.md**
   - Immediate setup steps
   - Development environment
   - Core TES Layer 1 implementation

### Analysis (1 document)
Purpose: Problem analysis and lessons learned

1. **MCP-ENFORCEMENT-FAILURE-ANALYSIS.md**
   - Root cause analysis
   - Why MCP-based enforcement failed
   - Agent fabrication patterns
   - Path forward

---

## 🗺️ Reading Paths

### Path 1: For New Team Members (Comprehensive)
```
1. MCP-ENFORCEMENT-FAILURE-ANALYSIS.md        (Understand the problem)
2. CODOR-v5-TES-SPECIFICATION.md               (Learn the solution)
3. SCRIPT-BASED-TESTING-FRAMEWORK-SPEC.md      (See the implementation)
4. SCRIPT-BASED-TESTING-FRAMEWORK-AMENDMENTS.md (Critical details)
5. CODOR-v5-IMPLEMENTATION-ROADMAP.md          (Implementation plan)
```

### Path 2: For Implementers (Fast Track)
```
1. docs/specifications/README.md               (Quick overview)
2. PHASE1-SETUP.md                            (Get started)
3. SCRIPT-BASED-TESTING-FRAMEWORK-SPEC.md      (Build testing engine)
4. SCRIPT-BASED-TESTING-FRAMEWORK-AMENDMENTS.md (Handle edge cases)
```

### Path 3: For Architects (High-Level)
```
1. CODOR-v5-TES-SPECIFICATION.md               (Full system architecture)
2. IMPLEMENTATION-ROADMAP.md                   (Technology decisions)
3. CONSTITUTIONAL-INTEGRATION-DESIGN.md        (Enforcement design)
```

### Path 4: For Quick Reference (Minimum)
```
1. docs/specifications/README.md               (Complete index with summaries)
```

---

## 🔑 Key Files Summary

| File | Lines | Purpose | Status |
|------|-------|---------|--------|
| **docs/specifications/README.md** | 500+ | Master index & quick reference | ✅ Complete |
| **CODOR-v5-TES-SPECIFICATION.md** | 800+ | Complete TES architecture | ✅ Complete |
| **SCRIPT-BASED-TESTING-FRAMEWORK-SPECIFICATION.md** | 2000+ | Testing framework spec | ✅ Complete |
| **SCRIPT-BASED-TESTING-FRAMEWORK-AMENDMENTS.md** | 1300+ | Critical amendments | 🔄 Pending Review |
| **CODOR-v5-IMPLEMENTATION-ROADMAP.md** | 1000+ | Implementation plan | ✅ Complete |
| **MCP-ENFORCEMENT-FAILURE-ANALYSIS.md** | 600+ | Problem analysis | ✅ Complete |

---

## 📊 Migration Map

### What Moved Where

**From Root → To core-framework/**
- `CODOR-v5-TES-SPECIFICATION.md`
- `CONSTITUTIONAL-INTEGRATION-DESIGN.md`

**From Root → To testing-system/**
- `SCRIPT-BASED-TESTING-FRAMEWORK-SPECIFICATION.md`
- `SCRIPT-BASED-TESTING-FRAMEWORK-AMENDMENTS.md`
- `SCRIPT-BASED-TESTING-VALIDATION.md`

**From Root → To implementation/**
- `CODOR-v5-IMPLEMENTATION-ROADMAP.md`
- `PHASE1-SETUP.md`

**From Root → To analysis/**
- `MCP-ENFORCEMENT-FAILURE-ANALYSIS.md`

**Stayed in Root**
- `README.md` (updated to v5.0 with new structure links)
- `.core/` (CODOR v4.0 constitution files)
- `prototype/` (working code)
- `test-case/` (test implementations)
- `evidence/` (evidence collection)

---

## 🚀 Next Steps

1. **Read the Master Index**
   ```
   Open: docs/specifications/README.md
   ```

2. **Follow Recommended Reading Order**
   - Based on your role (new member, implementer, architect)
   - Complete reading paths provided in master index

3. **Start Implementation**
   ```
   Open: docs/specifications/implementation/PHASE1-SETUP.md
   ```

---

## 💡 Benefits of New Structure

### Before (Disorganized)
```
codor/
├── CODOR-v5-TES-SPECIFICATION.md
├── CODOR-v5-IMPLEMENTATION-ROADMAP.md
├── CONSTITUTIONAL-INTEGRATION-DESIGN.md
├── MCP-ENFORCEMENT-FAILURE-ANALYSIS.md
├── PHASE1-SETUP.md
├── SCRIPT-BASED-TESTING-FRAMEWORK-SPECIFICATION.md
├── SCRIPT-BASED-TESTING-FRAMEWORK-AMENDMENTS.md
└── SCRIPT-BASED-TESTING-VALIDATION.md
```
❌ Hard to find specific documents  
❌ No clear reading order  
❌ No quick reference  
❌ Unclear document relationships

### After (Organized)
```
codor/
└── docs/specifications/
    ├── README.md                    ← START HERE
    ├── core-framework/              ← Architecture specs
    ├── testing-system/              ← Testing specs
    ├── implementation/              ← How to implement
    └── analysis/                    ← Why & lessons learned
```
✅ Logical categorization  
✅ Clear reading order  
✅ Comprehensive quick reference  
✅ Document relationships mapped  
✅ Easy to navigate

---

**Last Updated**: September 30, 2025  
**Maintained By**: CODOR Project Team
