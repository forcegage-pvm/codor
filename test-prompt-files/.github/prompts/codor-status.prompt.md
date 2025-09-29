---
description: Provide comprehensive constitutional compliance status report showing framework state, system operational status, and compliance metrics.
---

The user input to you can be provided directly by the agent or as a command argument - you **MUST** consider it before proceeding with the prompt (if not empty).

User input:

$ARGUMENTS

You are providing constitutional compliance status for this workspace.

## CONSTITUTIONAL STATUS REPORT

**SCAN AND REPORT:**

1. **Constitutional Framework Status**
   - Check if `.codor/core/constitution.md` exists
   - Verify constitutional framework version
   - Confirm framework completeness

2. **Compliance System Status**
   - Evidence system operational status
   - Audit trail status  
   - Constitutional enforcement active/inactive

3. **Recent Constitutional Activity**
   - List recent evidence files in `.codor/evidence/`
   - Show constitutional audit trail entries
   - Display compliance metrics

## STATUS REPORT FORMAT

```
📊 CODOR CONSTITUTIONAL STATUS REPORT

Workspace: [project name]
Generated: [timestamp]

CONSTITUTIONAL FRAMEWORK:
├─ Framework File: [✅ Present / ❌ Missing]
├─ Version: [version number]
├─ Mandates: [number] loaded
└─ Status: [ACTIVE / INACTIVE]

COMPLIANCE SYSTEMS:
├─ Evidence System: [🟢 OPERATIONAL / 🔴 INACTIVE]
├─ Audit Trail: [🟢 ACTIVE / 🔴 INACTIVE]  
├─ Enforcement: [🟢 ENABLED / 🔴 DISABLED]
└─ Validation: [🟢 AVAILABLE / 🔴 UNAVAILABLE]

RECENT ACTIVITY:
├─ Evidence Files: [count] generated
├─ Last Evidence: [timestamp]
├─ Audit Entries: [count]
└─ Last Validation: [timestamp]

COMPLIANCE RATING: [🟢 FULLY COMPLIANT / 🟡 PARTIAL / 🔴 NON_COMPLIANT]

Next Actions:
- [Recommendations for maintaining compliance]
```

**INSTRUCTIONS:**
- Scan workspace for constitutional files and systems
- Generate comprehensive status report
- Provide actionable recommendations

Begin constitutional status assessment now.