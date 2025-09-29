# Tool Usage Instructions: MCP Browser & Development Server Integration

**Document Version**: 1.0  
**Created**: September 29, 2025  
**Purpose**: Comprehensive instructions for proper tool usage with mandatory protocols

---

## CRITICAL TOOL DEPENDENCIES

### Development Server + MCP Browser Integration

**DEPENDENCY CHAIN**: MCP Browser Tools → Development Server → Application Code

**FAILURE POINT**: If development server is not running or crashes, MCP browser tools will fail with connection errors.

---

## DEVELOPMENT SERVER MANAGEMENT

### Starting the Server

**CORRECT METHOD**: Use `Start-Process` to run in separate PowerShell window
```powershell
cd "path\to\packages\web"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
```

**VERIFICATION**: Wait 5-10 seconds, then test connection:
```javascript
// Should succeed if server is running
mcp_chrome-devtoo_new_page("http://localhost:3000")
```

**COMMON FAILURES**:
- ❌ Using `run_in_terminal` with `isBackground=true` often fails to maintain server
- ❌ Not waiting for server startup before attempting connections
- ❌ Killing server by running other terminal commands in same session

### Server Health Monitoring

**BEFORE ANY MCP OPERATION**: Verify server is running
```javascript
// Test page load - should not show connection refused
mcp_chrome-devtoo_new_page("http://localhost:3000/api/v1/quotes")
```

**IF CONNECTION FAILS**: Stop all work and report server failure - do not attempt workarounds.

---

## MCP BROWSER TOOLS

### Screenshot Capture Protocol

**IMPORTANT**: MCP `take_screenshot` returns OCR text extraction, NOT binary image data.

**MANDATORY EVIDENCE COLLECTION**:
1. **Raw MCP Response**: Always save the complete JSON response from MCP server
2. **OCR Text Content**: Extract and document the text content returned
3. **Interaction Log**: Document each MCP command and its response
4. **Functional Validation**: Verify the extracted content proves functionality

**Example Evidence Collection**:
```javascript
// 1. Take screenshot and capture response
const response = await mcp_chrome-devtoo_take_screenshot({ format: "png" });

// 2. Save raw response as evidence
fs.writeFileSync("evidence/taskId/mcp-raw-response.json", 
  JSON.stringify(response, null, 2));

// 3. Document what the OCR text proves
const evidence = {
  timestamp: new Date().toISOString(),
  mcpCommand: "take_screenshot",
  extractedText: response.output,
  functionalProof: [
    "API response structure visible",
    "JSON data properly formatted", 
    "Required fields present in response"
  ]
};
```

### Page Navigation Protocol

**STEP-BY-STEP PROCESS**:
1. **List Pages**: Check current browser state
2. **Navigate**: Go to target URL  
3. **Wait**: Allow page to fully load
4. **Verify**: Confirm page loaded successfully
5. **Capture**: Take screenshot/snapshot for evidence

**ERROR HANDLING**:
- If navigation fails with connection refused → Server not running
- If page loads but shows error → Application issue  
- If MCP commands timeout → Browser connectivity issue

**DO NOT PROCEED** with evidence collection if any step fails.

---

## VALIDATION EVIDENCE REQUIREMENTS

### MCP Evidence Structure

**MANDATORY FILES**:
```
evidence/taskId/
├── mcp-screenshots/
│   ├── raw-mcp-response.json      # Complete MCP server response
│   ├── ocr-text-extraction.txt    # Extracted text content
│   ├── interaction-log.md         # All MCP commands and responses
│   └── functional-proof.md        # What the evidence proves
├── screenshots/
│   └── [actual binary images if available]
└── validation-report.json
```

### Functional Proof Documentation

**REQUIRED CONTENT**:
- Exact URL tested
- MCP command used
- Raw response received
- Text content extracted
- What functionality this proves
- Any limitations or caveats

**EXAMPLE**:
```markdown
## MCP Evidence: API Endpoint Validation

**URL**: http://localhost:3000/api/v1/quotes?page=1&limit=3
**MCP Command**: take_screenshot
**Timestamp**: 2025-09-29T14:30:00Z

**Raw MCP Response**:
```json
{
  "output": "JSON response visible with quotes array...",
  "format": "text_extraction"
}
```

**Functional Proof**:
- ✅ API endpoint responding (not connection refused)
- ✅ JSON structure visible in browser
- ✅ Quotes array present with data
- ✅ Pagination parameters working
- ✅ Query filters applied correctly

**Limitations**:
- OCR extraction only - no binary image saved
- Cannot verify pixel-perfect rendering
- Text-based validation only
```

---

## CONSTITUTIONAL COMPLIANCE

### When Tools Fail

**IMMEDIATE PROTOCOL**:
1. **STOP**: Do not attempt creative workarounds
2. **DOCUMENT**: Record exact error messages and failure modes
3. **REPORT**: Create failure report with diagnostic information
4. **WAIT**: Do not proceed without human intervention

**EXAMPLE FAILURE REPORT**:
```markdown
# Tool Failure Report - Task T004

## Failure Summary
- **Tool**: MCP Chrome DevTools
- **Operation**: take_screenshot
- **Error**: Page.captureScreenshot timed out
- **Impact**: Cannot capture evidence for constitutional validation

## Diagnostic Information
- Development server: Running on localhost:3000
- Page navigation: Successful to API endpoint
- Browser connection: MCP connected successfully
- Timeout threshold: Default protocol timeout

## Root Cause Analysis
- MCP screenshot timeout suggests browser/extension issue
- Not a development server problem (page loads fine)
- Not an application problem (API responds correctly)
- Likely MCP Chrome extension configuration issue

## Status
BLOCKED - Waiting for human assistance to resolve MCP screenshot timeout
```

**NO SUGGESTIONS**: Do not recommend fixes, bypasses, or alternative approaches when tools fail fundamentally.

---

## ENFORCEMENT

This document establishes MANDATORY protocols for tool usage. Deviation from these instructions, especially attempts to work around failures, constitutes a CONSTITUTIONAL VIOLATION under Mandate 9.

All tool interactions must be documented with complete evidence collection as specified above.