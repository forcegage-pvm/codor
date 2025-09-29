# Next.js Constitutional Implementation Template

## Framework Overview

Next.js applications require browser-based integration testing to validate server-side rendering, API routes, and client-side functionality. This template uses Chrome DevTools MCP for comprehensive testing.

## Integration Testing Setup

### Dependencies

```json
{
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "puppeteer": "^21.0.0"
  }
}
```

### Tool Configuration

#### Chrome DevTools MCP Setup

1. Install Chrome DevTools MCP server
2. Configure MCP connection in your testing environment
3. Set up evidence collection directories

```bash
# Evidence directory structure
evidence/
├── integration/           # Integration test evidence
│   ├── screenshots/      # Visual evidence
│   ├── network-logs/     # Network request logs
│   └── console-logs/     # Browser console outputs
├── test-results/         # Test execution results
├── logs/                 # Application logs
└── compliance/           # Constitutional compliance reports
```

### Constitutional Gate Implementation

#### Gate 1: Pre-Task Validation

```javascript
// constitutional-validator.js integration
const validator = require("./.specify/tools/constitutional-validator");

async function preTaskGate(taskContext) {
  return await validator.validateGate("pre-task", taskContext);
}
```

#### Gate 2: Integration Testing

```javascript
// next-js-integration-test.js
import { chromium } from "playwright";
import fs from "fs/promises";
import path from "path";

async function runIntegrationTest(taskRequirements) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Evidence collection setup
  const evidenceDir = path.join(process.cwd(), "evidence", "integration");
  await fs.mkdir(evidenceDir, { recursive: true });

  try {
    // Navigate to application
    await page.goto("http://localhost:3000");

    // Validate exact functional correspondence
    if (taskRequirements.endpoint === "POST /api/users") {
      // Test POST endpoint specifically
      const response = await page.evaluate(async () => {
        return fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Test User" }),
        }).then((r) => r.json());
      });

      // Collect evidence
      await page.screenshot({
        path: path.join(evidenceDir, "screenshots", "post-user-test.png"),
      });

      // Log network activity
      const networkLogs = await page.evaluate(() =>
        window.performance.getEntriesByType("navigation")
      );

      await fs.writeFile(
        path.join(evidenceDir, "network-logs", "post-user-network.json"),
        JSON.stringify(networkLogs, null, 2)
      );

      // Validate response matches requirements
      if (!response.id || !response.name) {
        throw new Error("POST /api/users response missing required fields");
      }
    }

    return true;
  } finally {
    await browser.close();
  }
}
```

#### Gate 3: Post-Task Validation

```javascript
async function postTaskGate(taskContext, testResults) {
  const validator = require("./.specify/tools/constitutional-validator");

  // Validate evidence completeness
  const evidenceComplete = await validateEvidencePackage();

  // Run constitutional compliance check
  const complianceResult = await validator.validateGate("post-task", {
    ...taskContext,
    testResults,
    evidenceComplete,
  });

  return complianceResult;
}

async function validateEvidencePackage() {
  const requiredEvidence = [
    "evidence/integration/screenshots/",
    "evidence/integration/network-logs/",
    "evidence/test-results/",
    "evidence/compliance/",
  ];

  for (const dir of requiredEvidence) {
    try {
      await fs.access(dir);
    } catch {
      console.error(`Missing required evidence directory: ${dir}`);
      return false;
    }
  }

  return true;
}
```

## Example Implementation

### Complete Test Suite

```javascript
// tests/constitutional-integration.test.js
import { test, expect } from "@playwright/test";
import { runConstitutionalValidation } from "../.specify/tools/constitutional-validator";

test.describe("Constitutional Integration Testing", () => {
  test.beforeEach(async () => {
    // Gate 1: Pre-task validation
    const preTaskResult = await runConstitutionalValidation("pre-task");
    expect(preTaskResult).toBe(true);
  });

  test("API POST endpoint exact functional correspondence", async ({
    page,
  }) => {
    // Navigate to application
    await page.goto("http://localhost:3000");

    // Evidence collection setup
    await page.addInitScript(() => {
      window.constitutionalEvidence = [];
    });

    // Test exact functionality specified in task
    const response = await page.evaluate(async () => {
      const result = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Constitutional Test User",
          email: "test@example.com",
        }),
      });

      window.constitutionalEvidence.push({
        type: "network_request",
        method: "POST",
        url: "/api/users",
        timestamp: new Date().toISOString(),
        status: result.status,
      });

      return result.json();
    });

    // Validate exact functional correspondence
    expect(response).toHaveProperty("id");
    expect(response.name).toBe("Constitutional Test User");

    // Collect evidence
    await page.screenshot({
      path: "evidence/integration/screenshots/post-user-success.png",
    });

    const evidence = await page.evaluate(() => window.constitutionalEvidence);
    await page.context().storageState({
      path: "evidence/integration/network-logs/post-user-evidence.json",
    });

    // Gate 2: Integration testing validation
    const integrationResult = await runConstitutionalValidation(
      "integration-testing",
      {
        taskType: "POST /api/users",
        evidence: evidence,
      }
    );
    expect(integrationResult).toBe(true);
  });

  test.afterEach(async () => {
    // Gate 3: Post-task validation
    const postTaskResult = await runConstitutionalValidation("post-task");
    expect(postTaskResult).toBe(true);
  });
});
```

### Package.json Scripts

```json
{
  "scripts": {
    "test:constitutional": "playwright test tests/constitutional-integration.test.js",
    "validate:pre-task": "node .specify/tools/constitutional-validator.js pre-task",
    "validate:integration": "node .specify/tools/constitutional-validator.js integration-testing",
    "validate:post-task": "node .specify/tools/constitutional-validator.js post-task"
  }
}
```

## Troubleshooting

### Common Issues

1. **Missing Evidence Directories**

   ```bash
   # Create evidence structure
   mkdir -p evidence/{integration/{screenshots,network-logs,console-logs},test-results,logs,compliance}
   ```

2. **Integration Test Failures**

   - Ensure Next.js dev server is running on port 3000
   - Check that API routes are properly implemented
   - Verify Chrome DevTools MCP connection

3. **Constitutional Validation Failures**
   - Review evidence collection completeness
   - Ensure exact functional correspondence
   - Check TDD debt resolution

### Debugging Commands

```bash
# Run constitutional validator with debug output
DEBUG=1 node .specify/tools/constitutional-validator.js integration-testing

# Check evidence directories
ls -la evidence/integration/

# Validate specific evidence files
cat evidence/compliance/constitutional-report.json
```

## Integration with CODOR Constitution

This template ensures compliance with:

- **Constitutional Amendment VI**: Exact functional correspondence through targeted API testing
- **Constitutional Amendment VII**: TDD debt management with automated detection
- **Constitutional Amendment VIII**: Anti-fraud enforcement through comprehensive evidence collection

The three-gate validation system is fully integrated, ensuring no constitutional circumnavigation while maintaining development velocity.
