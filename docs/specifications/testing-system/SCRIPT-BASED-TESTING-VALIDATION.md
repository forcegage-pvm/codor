# Script-Based Testing Validation: Removing Agents from Execution

**Strategy**: Generate comprehensive test specifications → Execute via automated scripts → Provide unfakeable results to agents

## Current Foundation We Can Build On

### 1. **Contract-Based Test Generation** (Already Exists)
```typescript
// From our existing contracts/api-contracts.md:
interface GetQuotesResponse extends ApiResponse<{
  quotes: Quote[]
  pagination: PaginationInfo
}>

// This generates specific testable contracts:
// ✅ Agent defines what endpoint should do
// ✅ Script validates actual endpoint behavior  
// ✅ Agent receives pass/fail results they can't fake
```

### 2. **Constitutional Validation Scripts** (Already Exists)
```javascript
// From .specify/tools/constitutional-validator.js:
async validateGate(gateType, context = {}) {
  switch (gateType) {
    case "pre-task":
      return await this.validatePreTaskGate(constitution, config, context);
    case "integration-testing": 
      return await this.validateIntegrationTestingGate(constitution, config, context);
    case "post-task":
      return await this.validatePostTaskGate(constitution, config, context);
  }
}

// ✅ Agent can't fake constitutional compliance
// ✅ Script determines pass/fail objectively
// ✅ Evidence collection automated
```

### 3. **Evidence Collection Framework** (Already Exists)
```javascript
// From Next.js template:
const response = await page.evaluate(async () => {
  const result = await fetch("/api/users", { method: "POST", ... });
  
  window.constitutionalEvidence.push({
    type: "network_request", 
    method: "POST",
    url: "/api/users",
    timestamp: new Date().toISOString(),
    status: result.status,
  });
  
  return result.json();
});

// ✅ Evidence collected automatically during script execution
// ✅ Agent receives evidence, but didn't create it
// ✅ Timestamps, network calls, results all authentic
```

## Enhanced Script-Based Implementation

### Phase 1: **Automated Contract Testing**
```javascript
// scripts/contract-tester.js - NEW
class ContractTester {
  constructor(contractsDir, resultsDir) {
    this.contractsDir = contractsDir;
    this.resultsDir = resultsDir;
    this.evidence = [];
  }
  
  async executeContractTests(serverUrl) {
    console.log("🔍 Executing contract tests via script...");
    
    // Load all API contracts
    const contracts = await this.loadContracts();
    const results = [];
    
    for (const contract of contracts) {
      console.log(`Testing: ${contract.method} ${contract.endpoint}`);
      
      const testResult = await this.testContract(serverUrl, contract);
      results.push(testResult);
      
      // Collect evidence automatically
      this.evidence.push({
        contract: contract.name,
        executedAt: new Date().toISOString(),
        request: testResult.request,
        response: testResult.response,
        passed: testResult.passed,
        evidence: testResult.evidence
      });
    }
    
    // Save results that agent will receive
    await this.saveResults(results);
    await this.saveEvidence();
    
    return results;
  }
  
  async testContract(serverUrl, contract) {
    // Execute actual HTTP request
    const response = await fetch(`${serverUrl}${contract.endpoint}`, {
      method: contract.method,
      headers: contract.headers,
      body: contract.body ? JSON.stringify(contract.body) : undefined
    });
    
    // Validate response against contract
    const responseData = await response.json();
    const validationResult = this.validateResponse(responseData, contract.expectedResponse);
    
    return {
      contractName: contract.name,
      request: { method: contract.method, endpoint: contract.endpoint },
      response: { status: response.status, data: responseData },
      passed: validationResult.passed,
      errors: validationResult.errors,
      evidence: {
        timestamp: new Date().toISOString(),
        responseHeaders: Object.fromEntries(response.headers.entries()),
        executionTime: validationResult.executionTime
      }
    };
  }
}
```

### Phase 2: **Automated UI Testing Scripts**
```javascript  
// scripts/ui-tester.js - NEW
class UITester {
  constructor(testScenariosFile, evidenceDir) {
    this.scenarios = require(testScenariosFile);
    this.evidenceDir = evidenceDir;
    this.browser = null;
  }
  
  async executeUITests(appUrl) {
    console.log("🖥️  Executing UI tests via script...");
    
    this.browser = await playwright.chromium.launch();
    const results = [];
    
    for (const scenario of this.scenarios) {
      console.log(`Testing UI scenario: ${scenario.name}`);
      
      const testResult = await this.testScenario(appUrl, scenario);
      results.push(testResult);
    }
    
    await this.browser.close();
    await this.saveResults(results);
    
    return results;
  }
  
  async testScenario(appUrl, scenario) {
    const page = await this.browser.newPage();
    
    // Start evidence collection
    const evidence = {
      screenshots: [],
      networkCalls: [],
      consoleMessages: []
    };
    
    // Capture network activity
    page.on('response', response => {
      evidence.networkCalls.push({
        url: response.url(),
        status: response.status(),
        timestamp: new Date().toISOString()
      });
    });
    
    // Execute test steps
    try {
      await page.goto(appUrl);
      
      for (const step of scenario.steps) {
        console.log(`  Step: ${step.action}`);
        
        // Take screenshot before step
        const beforeScreenshot = `${scenario.name}-step-${step.id}-before.png`;
        await page.screenshot({ 
          path: path.join(this.evidenceDir, 'screenshots', beforeScreenshot) 
        });
        evidence.screenshots.push(beforeScreenshot);
        
        // Execute step
        await this.executeStep(page, step);
        
        // Take screenshot after step
        const afterScreenshot = `${scenario.name}-step-${step.id}-after.png`;
        await page.screenshot({ 
          path: path.join(this.evidenceDir, 'screenshots', afterScreenshot) 
        });
        evidence.screenshots.push(afterScreenshot);
        
        // Validate step result
        const stepResult = await this.validateStep(page, step);
        if (!stepResult.passed) {
          throw new Error(`Step failed: ${stepResult.error}`);
        }
      }
      
      return {
        scenarioName: scenario.name,
        passed: true,
        evidence: evidence,
        executedAt: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        scenarioName: scenario.name,
        passed: false,
        error: error.message,
        evidence: evidence,
        executedAt: new Date().toISOString()
      };
    } finally {
      await page.close();
    }
  }
}
```

### Phase 3: **Master Test Orchestrator**
```javascript
// scripts/test-orchestrator.js - NEW  
class TestOrchestrator {
  constructor(projectDir) {
    this.projectDir = projectDir;
    this.contractTester = new ContractTester(
      path.join(projectDir, 'contracts'),
      path.join(projectDir, 'evidence', 'contract-tests')
    );
    this.uiTester = new UITester(
      path.join(projectDir, 'test-scenarios.json'),
      path.join(projectDir, 'evidence', 'ui-tests')
    );
  }
  
  async executeFullTestSuite() {
    console.log("🚀 Executing complete test suite via scripts...");
    
    const testResults = {
      executedAt: new Date().toISOString(),
      testSuiteVersion: "1.0",
      results: {
        contractTests: null,
        uiTests: null,
        integrationTests: null
      },
      evidence: {
        totalScreenshots: 0,
        totalNetworkCalls: 0,
        totalValidations: 0
      },
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        overallResult: "PENDING"
      }
    };
    
    try {
      // 1. Start application
      console.log("📡 Starting application server...");
      const server = await this.startApplicationServer();
      
      // 2. Execute contract tests
      console.log("📋 Running contract tests...");
      testResults.results.contractTests = await this.contractTester.executeContractTests(server.url);
      
      // 3. Execute UI tests  
      console.log("🖥️  Running UI tests...");
      testResults.results.uiTests = await this.uiTester.executeUITests(server.url);
      
      // 4. Execute integration tests
      console.log("🔄 Running integration tests...");
      testResults.results.integrationTests = await this.executeIntegrationTests(server.url);
      
      // 5. Calculate summary
      testResults.summary = this.calculateSummary(testResults.results);
      testResults.evidence = this.collectEvidenceSummary();
      
      // 6. Save final results
      await this.saveTestResults(testResults);
      
      // 7. Stop application
      await this.stopApplicationServer(server);
      
      console.log(`✅ Test suite complete: ${testResults.summary.passed}/${testResults.summary.totalTests} passed`);
      
      return testResults;
      
    } catch (error) {
      console.error("❌ Test suite failed:", error);
      testResults.summary.overallResult = "ERROR";
      testResults.error = error.message;
      await this.saveTestResults(testResults);
      throw error;
    }
  }
}
```

### Phase 4: **Agent Integration**
```javascript
// The agent now gets unfakeable results:
const testResults = await testOrchestrator.executeFullTestSuite();

// Agent receives:
console.log("Test Results Summary:");
console.log(`Total Tests: ${testResults.summary.totalTests}`);
console.log(`Passed: ${testResults.summary.passed}`);
console.log(`Failed: ${testResults.summary.failed}`);
console.log(`Overall Result: ${testResults.summary.overallResult}`);

console.log("Evidence Collected:");
console.log(`Screenshots: ${testResults.evidence.totalScreenshots}`);
console.log(`Network Calls: ${testResults.evidence.totalNetworkCalls}`);
console.log(`Validations: ${testResults.evidence.totalValidations}`);

// Agent CAN'T fake these because:
// 1. They didn't execute the tests
// 2. All evidence was generated by scripts
// 3. Results are timestamped and cross-referenced
// 4. Evidence files contain actual browser/network data
```

## Implementation Plan

### Week 1: **Contract Testing Scripts**
- Build automated contract execution system
- Integration with existing contract specifications
- Evidence collection during execution

### Week 2: **UI Testing Scripts**  
- Build Playwright/Puppeteer test execution
- Screenshot and interaction evidence capture
- Integration with existing UI specifications

### Week 3: **Integration & Orchestration**
- Master test orchestrator
- Cross-test validation and evidence correlation
- Results reporting that agents can't fake

### Week 4: **Constitutional Integration**
- Integrate with existing constitutional validators
- Add script-based evidence to constitutional system
- Deploy on current project for testing

## The Key Advantage

**Current Problem**: Agent claims "I tested the login functionality" 
**Solution**: Script executes login test → Agent gets "Login test: PASSED, evidence in /evidence/ui-tests/login/"

**Agent can't fake because**:
- They didn't control the test execution
- Evidence contains real browser data, network calls, timestamps
- Results are generated by scripts, not described by agents
- Cross-validation between different evidence types

This completely flips the incentive structure: **Real functionality becomes the only way to get passing test results.**

---

**Ready to start with Phase 1: Contract Testing Scripts?**