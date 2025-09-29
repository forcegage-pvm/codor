# Validation Tools Usage Guide

**Document Version**: 1.0  
**Created**: September 29, 2025  
**Purpose**: Clear instructions for proper evidence generation and validation compliance

---

## 🎯 QUICK START: Proper Evidence Generation

### Step 1: Start Development Environment
```powershell
# Navigate to web package
cd "path\to\packages\web"

# Start server in separate window (CRITICAL: Use Start-Process)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

# Wait 5-10 seconds for server to fully start
```

### Step 2: Create Evidence Directory Structure
```
evidence/T###/
├── screenshots/              # Real screenshots from MCP browser
├── mcp-screenshots/          # Raw JSON responses from MCP server
├── constitutional-evidence.md # Evidence documentation
├── functional-test-results.json # Test results with 'passed: true/false'
└── mcp-interaction.log       # Log of all MCP commands
```

### Step 3: Use MCP Browser Tools Properly
```javascript
// 1. Navigate to your endpoint
await mcp_chrome-devtoo_new_page("http://localhost:3000/api/v1/quotes");

// 2. Take screenshot AND save raw response
const response = await mcp_chrome-devtoo_take_screenshot({ format: "png" });

// 3. MANDATORY: Save raw MCP response as evidence
fs.writeFileSync(
  "evidence/T###/mcp-screenshots/screenshot-response.json", 
  JSON.stringify(response, null, 2)
);

// 4. Document what this proves
// The response contains OCR text extraction, not binary image
// Use the extracted text to prove functionality
```

---

## ⚠️ FRAUD DETECTION WARNINGS

### 🚨 WILL BE CAUGHT AND BLOCKED

1. **Fake Screenshots**
   - Files smaller than 100 bytes
   - Placeholder text instead of binary data
   - Identical creation timestamps (bulk copying)

2. **Evidence Manipulation**  
   - Empty mcp-screenshots directories
   - Recently modified functional-test-results.json during validation
   - Copying evidence files to bypass validators

3. **Validator Gaming**
   - Creating task ID files in repository root
   - Copying constitutional evidence to game checker
   - Missing MCP raw responses when claiming MCP testing

### 🔧 PROPER ALTERNATIVES

Instead of faking evidence:
1. **Fix the underlying functionality first**
2. **Ensure development server is running**
3. **Use MCP tools to capture real evidence**
4. **Document actual working behavior**
5. **If tools fail: STOP and report the failure**

---

## 📋 VALIDATION ERROR SOLUTIONS

### "MCP Screenshots directory not found"
**PROPER ACTION:**
```bash
# Create proper directory structure
mkdir -p evidence/T###/screenshots
mkdir -p evidence/T###/mcp-screenshots

# Use MCP browser tools with running dev server
# Save all MCP responses as JSON files
```

**❌ DON'T:** Create empty directories or fake files

### "MCP No screenshots found"
**PROPER ACTION:**
```powershell
# 1. Verify dev server is running
curl http://localhost:3000

# 2. If not running, start it properly
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

# 3. Use MCP tools to capture real evidence
# 4. Save raw JSON responses in mcp-screenshots/
```

**❌ DON'T:** Create placeholder PNG files or tiny dummy images

### "MCP Functional tests failed"
**PROPER ACTION:**
```javascript
// 1. Fix the actual functionality that's broken
// 2. Test manually in browser first
// 3. Only set 'passed: true' when it actually passes
{
  "taskId": "T###",
  "passed": true,  // ← Only when actually true!
  "testResults": {
    // ... real test data from actual testing
  }
}
```

**❌ DON'T:** Manually edit 'passed' field to bypass validation

### "FRAUD DETECTED: Suspicious task ID files"
**PROPER ACTION:**
```bash
# Delete the fraudulent files
rm T001 T002 T003  # whatever task ID files exist in root

# Fix constitutional evidence properly
# Edit evidence/T###/constitutional-evidence.md with real content
```

**❌ DON'T:** Copy evidence files to root directory to game validators

---

## 🛠️ TOOL-SPECIFIC INSTRUCTIONS

### MCP Browser Tools
- **ALWAYS** start dev server first with `Start-Process`
- **ALWAYS** save raw JSON responses from MCP commands
- **NEVER** fake binary image files - MCP returns OCR text extraction
- **Document** what functionality the evidence proves

### Constitutional Checker
- **Run with evidence file path**: `constitutional-checker.js evidence/T###/constitutional-evidence.md`
- **Include completion level**: Use LEVEL 0-5 framework
- **Provide specific examples**: File paths, test results, functionality proof

### Functional Test Results
- **Test real functionality** before claiming success
- **Include actual test details** with specific examples
- **Set 'passed: true' ONLY** when functionality actually works
- **Include MCP evidence** that supports the claims

---

## 🚨 CONSTITUTIONAL COMPLIANCE

Under **Amendment 4: Anti-Fraud Enforcement Protocol**:

### MANDATORY BEHAVIOR
1. **STOP** when tools fail - don't create workarounds
2. **DOCUMENT** failures clearly with diagnostic info
3. **REPORT** to human for assistance
4. **WAIT** for explicit guidance before proceeding

### PROHIBITED BEHAVIOR
1. Creating fake/placeholder evidence files
2. Copying files to bypass validation requirements
3. Manipulating test results to show false success
4. Gaming validation systems by exploiting their technical requirements

### ENFORCEMENT
- Fraud detection is **ACTIVE** in all validation tools
- Constitutional violations **BLOCK** task completion
- Evidence fabrication triggers **MANDATORY ROLLBACK**

---

## ✅ SUCCESS CHECKLIST

Before running post-task validation:

- [ ] Development server running properly
- [ ] Real functionality tested and working
- [ ] MCP browser tools used to capture actual evidence
- [ ] Raw JSON responses saved in mcp-screenshots/
- [ ] Constitutional evidence includes completion level
- [ ] Functional test results reflect reality
- [ ] No fake/placeholder files created
- [ ] All evidence directories contain real content

**Remember**: The validation tools are designed to help ensure quality, not to be gamed or bypassed. Honest evidence collection is the only path to task completion.