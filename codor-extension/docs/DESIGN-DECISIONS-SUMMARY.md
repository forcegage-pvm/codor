# CODOR Extension - Design Decisions Summary

**Date**: October 1, 2025  
**Status**: Final Gap Resolution Pending (Gap E)

---

## ✅ FINALIZED DECISIONS

### 1. Core Philosophy: Test-Driven with Guided Autonomy

**NOT**: Unlimited AI freedom  
**NOT**: Micromanagement of every step  
**YES**: AI autonomy with test-driven boundaries and safety guardrails

**Key Principles**:
- Tests validate ALL outputs (linting, build, unit, integration, contract)
- AI has freedom to implement, but bounded by retry limits
- Idle timer catches forgotten completion signals
- Visual progress tracking (tree view + status bar)
- Auto-commit per task for traceability

---

### 2. Test Plan Engine (CORE PURPOSE) ✅

**Decision**: YAML-based test plan generation and tracking

**Workflow**:
1. Sprint created → Tasks generated
2. **For each task**: CODOR prompts AI to generate YAML test plan
3. AI analyzes task + spec → produces YAML
4. CODOR validates and stores in database
5. Test execution engine runs YAML-defined tests
6. Test plans versioned (AI can refine after failures)

**Database Schema**:
```sql
CREATE TABLE test_plans (
  id INTEGER PRIMARY KEY,
  task_id TEXT NOT NULL,
  yaml_content TEXT NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE test_executions (
  id INTEGER PRIMARY KEY,
  test_plan_id INTEGER NOT NULL,
  attempt_number INTEGER NOT NULL,
  status TEXT CHECK(status IN ('running', 'passed', 'failed')),
  results_json TEXT
);
```

**This is CODOR's defining feature** ✅

---

### 3. Completion Detection: Hybrid Approach ✅

**Primary**: Chat marker `@codor done`  
**Secondary**: Idle timer (10 min configurable) for safety net  
**Tertiary**: Manual override (developer can trigger)

**Use Case for Idle Timer**: AI completes work, verifies tests pass, then forgets to signal. Idle timer prompts: "Are you done?"

**No file watching** (unnecessary complexity)

---

### 4. Error Recovery: Bounded Retries ✅

**Decision**: Max 5 retries (configurable), then escalate to developer

**Rationale**:
- Prevents fabrication escalation ("let me try a simpler approach")
- AI gets multiple attempts to solve legitimately
- Developer can override limit via settings
- Clear escalation path when truly stuck

**After max retries**:
- Pause sprint
- Show errors to developer
- Developer chooses: Retry, Skip, Stop, Manual Fix

---

### 5. Progress Tracking: Visual Indicators ✅

**Tree View**:
```
Sprint: S001 - Core Features
├─ ✅ T001: Add customer search (12 min)
├─ ✅ T002: Add order search (8 min)
├─ 🔵 T003: Add product search (retry 2/5, 4 min)
├─ ⏳ T004: Add inventory sync
```

**Status Bar**: `$(sync~spin) CODOR: T003 (4min)`

**No AI progress reporting** required (visual indicators sufficient)

---

### 6. Auto-Commit: Traceability & Rollback ✅

**Decision**: Auto-commit after EVERY successful task

**Commit Message Structure**:
```
feat(T001): Add customer search endpoint

Automated implementation by CODOR

Tests:
  ✅ Unit Tests: PASSED
  ✅ Integration Tests: PASSED
  ✅ Linting: PASSED
  ✅ Contract Validation: PASSED

Coverage: 87%
Evidence: evidence/T001/
Duration: 342s
Attempts: 2

Co-authored-by: CODOR <codor@automation>
```

**Git Tags**: Each task tagged as `task/T001` for easy rollback

**Benefits**:
- Rollback to any task (`git reset --hard task/T003`)
- Audit trail in git history
- Evidence committed with code
- Developer can review commits later

---

### 7. Evidence Management ✅

**Policy**: Compress after 7 days (configurable)

**Options**:
- `forever`: Never delete, never compress
- `compress-7days`: Compress old evidence (default) ✅
- `delete-30days`: Delete evidence after 30 days

**Evidence Structure**:
```
evidence/
  T001/
    test-plan.yaml           # AI-generated YAML
    test-results.json        # Final test outputs
    linting-report.txt       # Clean linting proof
    coverage-report.html     # Coverage metrics
    contract-certificate.json # Spec-kit validation
    build-log.txt            # Compilation proof
    attempt-1/               # Failed attempts (for review)
      errors.log
      test-results.json
    attempt-2/
      errors.log
```

**All retry attempts saved** for developer review

---

### 8. Flaky Test Handling ✅

**Decision**: Flag flaky tests, don't block sprint

**Detection**: Test fails 2+ times, then passes = flaky

**Action**:
- Flag in database
- Badge in tree view: `✅ T001 ⚠️ (flaky test)`
- Non-blocking notification to developer
- Add to task metadata for review

**Developer can review later** via CODOR flaky test panel

---

### 9. Large Spec Handling 🔮

**Decision**: Defer to Spec Kit (future enhancement)

**Rationale**:
- Not CODOR's responsibility
- Large specs = poor feature decomposition
- Spec Kit should enforce manageable sizes

**Future v2 Enhancement**:
- Auto-summarize specs > 5k lines
- Prompt developer to split features
- Support spec chunking/references

---

### 10. Configuration Settings ✅

```json
{
  "codor.automation.enabled": true,
  "codor.automation.maxRetries": 5,
  "codor.automation.idleTimeout": 600,
  "codor.automation.strictLinting": true,
  "codor.automation.coverageThreshold": 80,
  "codor.automation.autoCommit": true,
  "codor.automation.failFast": true,
  "codor.automation.chatVisibility": "always-visible",
  "codor.automation.evidenceRetention": "compress-7days"
}
```

**Balanced approach**: Safety nets without micromanagement

---

## ✅ FINALIZED: Gap E - Chat History Persistence

### Decision: Hybrid Smart Adaptive (Option D)

**Strategy**: Adaptive context management with on-demand injection

**How It Works**:

1. **Tasks 1-3**: Persistent chat (build foundational context)
   - AI sees full conversation history
   - Builds understanding of sprint patterns
   - Token count: ~25-35k

2. **Task 4+**: Smart summarization
   - Summarize old tasks (T001: "Customer search ✅")
   - Keep last 2 tasks full context
   - Token count: ~30-40k (stable)

3. **On-Demand Injection**: If AI references old task
   - CODOR detects: "How did we handle pagination in T001?"
   - Temporarily re-inject T001 full context
   - Token count: ~45-50k (only when needed)

**Implementation**:
```typescript
class ContextManager {
  async buildContext(currentTask: Task, chatHistory: Message[]): Promise<string> {
    const completedTasks = await db.getCompletedTasksInSprint(currentTask.sprint_id);
    
    // Early sprint: Full context
    if (completedTasks.length <= 3) {
      return this.buildFullContext(chatHistory);
    }
    
    // Later sprint: Smart summarization
    const recentFull = completedTasks.slice(-2); // Last 2 tasks
    const oldSummaries = completedTasks.slice(0, -2).map(t => 
      `✅ ${t.id}: ${t.title} - Completed`
    );
    
    // Detect if AI asking about old task
    const lastMessage = chatHistory[chatHistory.length - 1];
    const referencedOldTask = this.detectOldTaskReference(lastMessage);
    
    if (referencedOldTask) {
      // On-demand: Re-inject old task context
      const oldContext = await this.getTaskFullContext(referencedOldTask);
      return this.buildHybridContext(oldSummaries, recentFull, currentTask, oldContext);
    }
    
    // Normal: Summaries + recent
    return this.buildHybridContext(oldSummaries, recentFull, currentTask);
  }
  
  private detectOldTaskReference(message: string): string | null {
    // Patterns: "in T001", "like T002", "T003's approach", etc.
    const match = message.match(/\b(T\d{3})\b/);
    return match ? match[1] : null;
  }
}
```

**Benefits**:
- ✅ **Optimal context quality**: Recent tasks fully accessible
- ✅ **No overflow risk**: Stable ~30-40k tokens
- ✅ **Cost-effective**: ~$0.12/sprint
- ✅ **Smart adaptation**: Injects old context only when needed
- ✅ **Best of all worlds**: Foundation building + efficiency + on-demand

**Token Budget**:
- Average per request: ~30-40k tokens
- Peak (on-demand injection): ~50k tokens
- Well under 128k limit (GPT-4o)

**Cost Analysis**:
- 10-task sprint: ~$0.12
- 20-task sprint: ~$0.20
- Negligible compared to development time saved

---

## 📝 NEXT STEPS

1. ✅ **All gaps resolved** - Design finalized!
2. **Awaiting UI designs** - User will provide interface mockups
3. **Update SPECIFICATION.md** - Incorporate finalized design decisions
4. **Begin Phase 1 implementation**:
   - Database schema (test_plans, test_executions, sprint_executions)
   - Sprint controller architecture
   - Test plan generation workflow
   - YAML validation engine
   - Context manager with hybrid adaptive strategy

---

## 🎯 Implementation Phases (Revised)

### Phase 1: Test Plan Engine (Week 1)
- Database schema (test_plans, test_executions)
- YAML template definition
- AI prompt for test plan generation
- YAML validation and storage
- Test plan versioning

### Phase 2: Test Execution (Week 1-2)
- YAML-driven test runner
- Setup/teardown script execution
- Coverage enforcement
- Fail-fast logic
- Evidence generation

### Phase 3: Sprint Automation (Week 2)
- Sprint controller (task loop)
- Chat marker detection
- Idle timer implementation
- Retry logic with escalation
- Visual progress tracking (tree view)

### Phase 4: Traceability (Week 2-3)
- Auto-commit per task
- Git tagging
- Evidence compression
- Flaky test detection
- Failed attempt archival

### Phase 5: Developer Controls (Week 3)
- Stop/Skip/Retry commands
- Configuration settings
- Blocker handling
- Manual override points

---

**Document Status**: ✅ **Design Finalized - All Gaps Resolved**  
**Awaiting**: UI design mockups from user  
**Ready to implement**: Phase 1 can begin once UI designs provided
