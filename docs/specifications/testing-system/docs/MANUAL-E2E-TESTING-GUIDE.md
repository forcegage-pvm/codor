# Manual E2E Testing Guide - Sprint 006

**Purpose**: Manual testing approach for 3 E2E tasks deferred from automation  
**Tasks Covered**: T018, T026, T030  
**Reason for Manual**: E2E automation requires browser tooling (Playwright/Cypress) setup, deferred to Sprint 007  
**Status**: Temporary - E2E template planned for future sprint

---

## Overview

Three tasks in Sprint 006 require end-to-end testing with browser automation:
- **T018**: Duplicate Detection (E2E flow)
- **T026**: Approval Workflow (E2E flow)  
- **T030**: Final Integration (E2E testing)

While these tasks are deferred from automation, they should still be tested manually to ensure quality. This guide provides structured manual testing procedures.

---

## T018: Duplicate Detection (E2E Flow)

### Test Objective
Verify the system can detect and handle duplicate quotes through the complete user workflow.

### Prerequisites
- Development server running (`npm run dev`)
- Test database with sample data
- At least 2 existing quotes in the system

### Manual Test Steps

#### Test Case 1: Duplicate Detection on Creation
1. **Navigate** to quotes page (`/quotes`)
2. **Click** "Create New Quote" button
3. **Fill in** quote details:
   - Customer: Select existing customer (e.g., "CUST001")
   - Items: Add 2-3 line items
   - Note: Use similar data to existing quote
4. **Click** "Save" or "Create Quote"
5. **Verify**: System shows duplicate warning message
6. **Verify**: Warning lists potential duplicates with details
7. **Click** "View Duplicate" link
8. **Verify**: Navigates to existing similar quote

**Expected Results:**
- ✅ Duplicate warning appears before save
- ✅ Warning includes quote numbers and customer names
- ✅ Links to potential duplicates work
- ✅ User can proceed anyway or cancel

#### Test Case 2: No False Positives
1. **Navigate** to quotes page
2. **Create** quote with completely different customer/items
3. **Verify**: No duplicate warning appears
4. **Verify**: Quote saves successfully

**Expected Results:**
- ✅ No warning for truly unique quotes
- ✅ Fast save operation

#### Test Case 3: Duplicate Detection Threshold
1. **Create** quote with 1 matching item (out of 5)
2. **Verify**: No warning (below threshold)
3. **Create** quote with 3 matching items (out of 5)  
4. **Verify**: Warning appears (above threshold)

**Expected Results:**
- ✅ Threshold-based detection works
- ✅ Configurable sensitivity

### Evidence to Capture
- Screenshots of duplicate warning
- Screenshot of quote comparison view
- List of quote IDs tested
- Any error messages encountered

---

## T026: Approval Workflow (E2E Flow)

### Test Objective
Verify multi-step approval workflow from quote submission through manager approval to final acceptance.

### Prerequisites
- Development server running
- Test database with users in different roles:
  - Sales Rep (creator)
  - Manager (approver level 1)
  - Director (approver level 2)
- At least 1 quote ready for approval

### Manual Test Steps

#### Test Case 1: Standard Approval Flow
1. **Login** as Sales Rep
2. **Navigate** to quote details page
3. **Click** "Submit for Approval"
4. **Verify**: Status changes to "Pending Approval"
5. **Verify**: Approval button becomes disabled
6. **Logout** and **Login** as Manager
7. **Navigate** to "Pending Approvals" page
8. **Verify**: Quote appears in approval queue
9. **Click** quote to view details
10. **Click** "Approve" button
11. **Add** approval comments
12. **Click** "Confirm Approval"
13. **Verify**: Quote status updates
14. **Verify**: Email notification sent (check logs)

**Expected Results:**
- ✅ Role-based permissions enforced
- ✅ Status transitions correctly
- ✅ Approval history tracked
- ✅ Notifications sent

#### Test Case 2: Rejection Flow
1. **Login** as Manager
2. **Navigate** to approval queue
3. **Select** quote
4. **Click** "Reject"
5. **Enter** rejection reason
6. **Click** "Confirm Rejection"
7. **Verify**: Quote status changes to "Rejected"
8. **Verify**: Rejection reason saved
9. **Logout** and **Login** as Sales Rep
10. **Verify**: Notification of rejection received
11. **Verify**: Can edit and resubmit

**Expected Results:**
- ✅ Rejection workflow works
- ✅ Rejection reasons captured
- ✅ Resubmission possible

#### Test Case 3: Multi-Level Approval
1. **Create** quote above threshold requiring 2 approvals
2. **Submit** for approval
3. **Login** as Manager, approve
4. **Verify**: Status = "Pending Director Approval"
5. **Login** as Director, approve
6. **Verify**: Status = "Approved"

**Expected Results:**
- ✅ Multi-level routing works
- ✅ Escalation based on value/criteria
- ✅ All approvers notified

### Evidence to Capture
- Screenshots at each approval stage
- List of users/roles tested
- Approval history log
- Email notification logs

---

## T030: Final Integration (E2E Testing)

### Test Objective
Complete end-to-end integration test covering full quote lifecycle from creation to invoice conversion.

### Prerequisites
- All services running
- Database with clean test data
- All previous Sprint 006 tasks completed
- Customer, product, and invoice modules working

### Manual Test Steps

#### Test Case 1: Complete Quote Lifecycle
1. **Login** as Sales Rep
2. **Navigate** to dashboard
3. **Click** "New Quote"
4. **Select** customer from dropdown
5. **Add** 3+ line items with different products
6. **Apply** discount (10%)
7. **Add** notes/terms
8. **Save** as draft
9. **Verify**: Quote saved successfully
10. **Click** "Preview"
11. **Verify**: PDF preview renders correctly
12. **Click** "Submit for Approval"
13. **Verify**: Status = "Pending Approval"
14. **Login** as Manager
15. **Approve** quote
16. **Login** as Sales Rep
17. **Click** "Send to Customer"
18. **Verify**: Email preview shows
19. **Click** "Send"
20. **Verify**: Status = "Sent"
21. **Navigate** to quote
22. **Click** "Convert to Invoice"
23. **Verify**: Invoice created with matching details
24. **Navigate** to invoice
25. **Verify**: All quote data transferred correctly

**Expected Results:**
- ✅ Complete workflow without errors
- ✅ Data consistency across transitions
- ✅ Status tracking accurate
- ✅ All integrations working
- ✅ Audit trail complete

#### Test Case 2: Error Recovery
1. **Start** quote creation
2. **Simulate** network disconnect
3. **Attempt** to save
4. **Verify**: Graceful error handling
5. **Reconnect** network
6. **Retry** save
7. **Verify**: Data not lost

**Expected Results:**
- ✅ No data loss on errors
- ✅ Clear error messages
- ✅ Recovery possible

#### Test Case 3: Performance Check
1. **Create** quote with 20+ line items
2. **Time** save operation (should be < 3 seconds)
3. **Time** approval workflow (should be < 2 seconds)
4. **Time** PDF generation (should be < 5 seconds)
5. **Time** invoice conversion (should be < 3 seconds)

**Expected Results:**
- ✅ All operations within performance targets
- ✅ No UI freezing
- ✅ Responsive user experience

### Evidence to Capture
- Screenshots of each major step
- Performance timings
- Error messages (if any)
- Final invoice PDF
- Database state before/after
- Audit trail export

---

## General Testing Guidelines

### Before Testing
1. ✅ Verify dev server is running
2. ✅ Clear browser cache
3. ✅ Use incognito/private window
4. ✅ Check database has test data
5. ✅ Note starting conditions

### During Testing
1. ✅ Follow steps exactly as written
2. ✅ Note any deviations or issues
3. ✅ Capture screenshots at key points
4. ✅ Record time for performance-critical operations
5. ✅ Test both success and failure paths

### After Testing
1. ✅ Document all findings
2. ✅ Create bug reports for issues found
3. ✅ Save evidence in `evidence/manual-e2e/`
4. ✅ Update test status in tracking sheet
5. ✅ Clean up test data

---

## Evidence Collection

### Required Evidence for Each Task

**Directory Structure:**
```
evidence/
  T018-duplicate-detection/
    screenshots/
      duplicate-warning.png
      duplicate-list.png
      false-positive-test.png
    test-log.md
  T026-approval-workflow/
    screenshots/
      submit-approval.png
      manager-queue.png
      approval-complete.png
      rejection-flow.png
    test-log.md
  T030-final-integration/
    screenshots/
      quote-creation.png
      approval-flow.png
      invoice-conversion.png
    performance-metrics.json
    test-log.md
```

### Test Log Template

```markdown
# Manual E2E Test Log

**Task**: T018 (or T026, T030)
**Date**: YYYY-MM-DD
**Tester**: [Your Name]
**Environment**: Development
**Browser**: Chrome 120.x

## Test Cases Executed

### Test Case 1: [Name]
- **Status**: ✅ Pass / ❌ Fail
- **Duration**: X minutes
- **Notes**: Any observations
- **Screenshots**: List filenames

### Test Case 2: [Name]
- **Status**: ✅ Pass / ❌ Fail
- **Duration**: X minutes
- **Notes**: Any observations
- **Screenshots**: List filenames

## Issues Found
1. [Issue description] - Severity: High/Medium/Low
2. [Issue description] - Severity: High/Medium/Low

## Overall Assessment
[Pass/Fail with summary]
```

---

## Migration to Automation

### When E2E Template is Ready (Sprint 007+)

These manual tests will be converted to automated tests using:
- **Browser**: Playwright or Cypress
- **Pattern**: Page Object Model
- **CI/CD**: Run on every PR

**Conversion Checklist:**
1. ✅ Install browser automation framework
2. ✅ Create page object models
3. ✅ Convert manual steps to test scripts
4. ✅ Add screenshot capture
5. ✅ Integrate with CI/CD pipeline

---

## Summary

**Manual Testing Coverage**: 3 tasks (10% of sprint)
- T018: Duplicate Detection
- T026: Approval Workflow
- T030: Final Integration

**Estimated Time**: 
- T018: 45-60 minutes
- T026: 60-90 minutes
- T030: 90-120 minutes
- **Total**: 3-4.5 hours

**Value**: Ensures quality while deferring automation complexity to next sprint.

**Next Steps**: After Sprint 006, create e2e-test-template.json to automate these workflows.
