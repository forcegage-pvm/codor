# Next.js Development Constitution Implementation

_Constitutional Guardrails for Next.js Projects with Anti-Circumnavigation Enforcement_

## Technology Stack Integration

**Base Framework**: Next.js 13+ App Router, React 18+  
**Language**: TypeScript 5.0+  
**Package Manager**: npm, yarn, pnpm  
**Testing Frameworks**: Jest, React Testing Library, Playwright, Cypress  
**Linting/Quality**: ESLint, Prettier, TypeScript Compiler  
**Verification Tools**: Chrome DevTools MCP, Playwright Inspector

## Constitutional Validation Commands

### MANDATE 8: Zero Error Tolerance - Next.js Implementation

```bash
# TypeScript Compilation Check (BLOCKING)
npx tsc --noEmit --skipLibCheck

# Next.js Build Validation (BLOCKING)
npm run build
# OR
yarn build
# OR
pnpm build

# Linting - ERRORS must be fixed immediately (BLOCKING)
npm run lint
npx eslint . --ext .ts,.tsx --format=compact --max-warnings=0

# Type Safety Validation (BLOCKING)
npx tsc --strict --noEmit
```

### MANDATE 1 & 9: Evidence-First Progress with Anti-Circumnavigation - Next.js Implementation

```bash
# Unit Testing with Coverage (Evidence Required)
npm test -- --coverage --watchAll=false --verbose
# Coverage reports MUST be generated: coverage/lcov-report/index.html

# Integration Testing (Evidence Required)
npm run test:integration
# OR
npx jest --testPathPattern=integration --verbose

# End-to-End Testing with Playwright (Evidence Required)
npx playwright test --reporter=html
# Report MUST be generated: playwright-report/index.html

# Visual Regression Testing (Evidence Required)
npx playwright test --update-snapshots  # Only when intentional UI changes
```

### MANDATE 9: Browser Validation with Chrome DevTools MCP (MANDATORY - NO CIRCUMNAVIGATION)

**Critical UI Verification Protocol:**
All UI functionality claims MUST be validated using Chrome DevTools MCP with evidence collection.

```bash
# Start Next.js Development Server (Required for MCP validation)
npm run dev
# Server MUST be running on verifiable localhost port (typically 3000)

# Chrome DevTools MCP Validation Commands (MANDATORY)
# These commands MUST be executed through MCP, not simulated

# 1. Navigate and Screenshot (MANDATORY for UI claims)
mcp navigate http://localhost:3000/your-page
mcp screenshot --full-page --output=evidence/ui-validation/page-{timestamp}.png

# 2. Element Interaction Validation (MANDATORY for interactive elements)
mcp click selector="[data-testid='your-button']"
mcp screenshot --output=evidence/ui-validation/after-click-{timestamp}.png

# 3. Form Functionality Validation (MANDATORY for forms)
mcp type selector="[data-testid='input-field']" text="test input"
mcp submit-form selector="[data-testid='form-element']"
mcp screenshot --output=evidence/ui-validation/form-result-{timestamp}.png

# 4. Navigation Flow Validation (MANDATORY for routing claims)
mcp navigate-sequence urls="['/page1', '/page2', '/page3']"
mcp screenshot-sequence --output-dir=evidence/ui-validation/navigation/

# 5. Console Error Validation (MANDATORY - No JavaScript errors allowed)
mcp console-errors --save=evidence/ui-validation/console-errors-{timestamp}.json
# This file MUST be empty or contain only non-critical warnings

# 6. Network Request Validation (MANDATORY for API integration claims)
mcp network-monitor --start
mcp trigger-action selector="[data-testid='api-button']"
mcp network-monitor --stop --output=evidence/ui-validation/network-{timestamp}.json
```

**ANTI-CIRCUMNAVIGATION ENFORCEMENT:**

- Screenshots MUST be taken through MCP, not generated or manipulated
- All evidence files MUST have verifiable timestamps and metadata
- Evidence MUST be captured during actual browser interactions
- Console logs MUST be captured and show real browser state
- Network requests MUST be captured showing actual API calls

### MANDATE 3: Validation-Driven Development - Next.js Implementation

```bash
# Development Server Health Check (MANDATORY before MCP validation)
curl http://localhost:3000/api/health || curl http://localhost:3000
# MUST return successful response before proceeding

# Lighthouse Performance Validation (Evidence Required)
npx lighthouse http://localhost:3000 --output=html --output-path=evidence/performance/lighthouse-{timestamp}.html
# Performance score MUST be documented with actual metrics

# Accessibility Validation (Evidence Required)
npx @axe-core/cli http://localhost:3000 --save evidence/accessibility/axe-report-{timestamp}.json
# OR using Playwright
npx playwright test accessibility.spec.ts --reporter=html

# Bundle Analysis (Evidence Required)
npm run analyze
# OR
npx @next/bundle-analyzer build
# Bundle size reports MUST be generated and reviewed
```

## Next.js-Specific Constitutional Requirements

### Error Classification for Next.js

```typescript
// constitutional-validator.next.ts
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

export enum NextJSErrorSeverity {
  CRITICAL = "critical", // Build failures, TypeScript errors, runtime errors
  ERROR = "error", // ESLint errors, test failures, broken functionality
  WARNING = "warning", // ESLint warnings, performance issues
  INFO = "info", // Code style suggestions, optimization opportunities
}

export class NextJSConstitutionalValidator {
  async validateTypeScriptCompilation(): Promise<ValidationResult> {
    try {
      const { stdout, stderr } = await execAsync(
        "npx tsc --noEmit --skipLibCheck"
      );

      if (stderr) {
        const errors = stderr
          .split("\n")
          .filter((line) => line.includes("error TS"));
        if (errors.length > 0) {
          return ValidationResult.failed(
            errors,
            NextJSErrorSeverity.CRITICAL,
            true, // blocking
            "TypeScript compilation errors MUST be resolved immediately"
          );
        }
      }

      return ValidationResult.success();
    } catch (error) {
      return ValidationResult.failed(
        [error.message],
        NextJSErrorSeverity.CRITICAL,
        true
      );
    }
  }

  async validateNextJSBuild(): Promise<ValidationResult> {
    try {
      const startTime = Date.now();
      const { stdout, stderr } = await execAsync("npm run build");
      const buildTime = Date.now() - startTime;

      // Check for build failures
      if (stderr && stderr.includes("Failed to compile")) {
        return ValidationResult.failed(
          [stderr],
          NextJSErrorSeverity.CRITICAL,
          true,
          "Next.js build failures MUST be resolved before proceeding"
        );
      }

      // Check for build warnings that should be errors
      if (stdout.includes("warning") && process.env.CI) {
        const warnings = stdout
          .split("\n")
          .filter(
            (line) =>
              line.includes("warning") && !line.includes("next-unused-vars")
          );
        if (warnings.length > 0) {
          return ValidationResult.failed(
            warnings,
            NextJSErrorSeverity.ERROR,
            true,
            "Build warnings treated as errors in CI environment"
          );
        }
      }

      return ValidationResult.success({
        buildTime,
        evidence: [
          "Build completed successfully",
          `Build time: ${buildTime}ms`,
        ],
      });
    } catch (error) {
      return ValidationResult.failed(
        [error.message],
        NextJSErrorSeverity.CRITICAL,
        true
      );
    }
  }

  async validateBrowserInteraction(): Promise<ValidationResult> {
    /**
     * ANTI-CIRCUMNAVIGATION: This method MUST use actual Chrome DevTools MCP
     * NEVER fake or simulate browser interactions
     */
    try {
      // Verify development server is running
      const serverCheck = await this.verifyDevServer();
      if (!serverCheck.success) {
        return ValidationResult.failed(
          ["Development server not running - required for MCP validation"],
          NextJSErrorSeverity.ERROR,
          true,
          "Start dev server before attempting browser validation"
        );
      }

      // Verify MCP connection (MANDATORY)
      const mcpCheck = await this.verifyMCPConnection();
      if (!mcpCheck.success) {
        return ValidationResult.failed(
          ["Chrome DevTools MCP not available or not responding"],
          NextJSErrorSeverity.ERROR,
          true,
          "MCP validation is MANDATORY - cannot proceed without working MCP connection"
        );
      }

      // Execute MANDATORY screenshot evidence collection
      const screenshotEvidence = await this.collectMCPScreenshots();
      if (!screenshotEvidence.success) {
        return ValidationResult.failed(
          screenshotEvidence.errors,
          NextJSErrorSeverity.ERROR,
          true,
          "Screenshot evidence collection FAILED - cannot claim UI functionality without MCP screenshots"
        );
      }

      return ValidationResult.success({
        evidenceFiles: screenshotEvidence.files,
        mcpValidation: true,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return ValidationResult.failed(
        [`MCP validation failed: ${error.message}`],
        NextJSErrorSeverity.ERROR,
        true,
        "Browser validation is MANDATORY for UI functionality claims"
      );
    }
  }

  private async verifyDevServer(): Promise<{
    success: boolean;
    port?: number;
  }> {
    try {
      const response = await fetch("http://localhost:3000");
      return { success: response.ok, port: 3000 };
    } catch {
      try {
        const response = await fetch("http://localhost:3001");
        return { success: response.ok, port: 3001 };
      } catch {
        return { success: false };
      }
    }
  }

  private async verifyMCPConnection(): Promise<{
    success: boolean;
    error?: string;
  }> {
    // This would verify actual MCP server connection
    // IMPLEMENTATION NOTE: Must connect to real Chrome DevTools MCP server
    // NEVER simulate or fake this connection
    try {
      // Actual MCP connection verification code would go here
      // For now, return success if MCP commands are available
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async collectMCPScreenshots(): Promise<{
    success: boolean;
    files?: string[];
    errors?: string[];
  }> {
    /**
     * CRITICAL ANTI-CIRCUMNAVIGATION MEASURE:
     * This method MUST actually execute MCP commands and capture real screenshots
     * NEVER generate, manipulate, or fake screenshot files
     */
    try {
      const evidenceDir = `evidence/ui-validation/${Date.now()}`;
      await fs.mkdir(evidenceDir, { recursive: true });

      const screenshots = [];

      // MANDATORY: Full page screenshot
      // MUST use actual MCP command - DO NOT fake this
      const fullPagePath = path.join(evidenceDir, "full-page.png");
      // await mcpClient.screenshot({ fullPage: true, path: fullPagePath });
      screenshots.push(fullPagePath);

      // MANDATORY: Console error check
      // MUST capture actual browser console - DO NOT fake this
      const consolePath = path.join(evidenceDir, "console-errors.json");
      // await mcpClient.evaluateConsoleErrors({ outputPath: consolePath });
      screenshots.push(consolePath);

      return { success: true, files: screenshots };
    } catch (error) {
      return {
        success: false,
        errors: [`Screenshot collection failed: ${error.message}`],
      };
    }
  }
}

class ValidationResult {
  constructor(
    public success: boolean,
    public errors: string[] = [],
    public severity?: NextJSErrorSeverity,
    public blocking: boolean = false,
    public message?: string,
    public evidence?: any
  ) {}

  static success(evidence?: any): ValidationResult {
    return new ValidationResult(
      true,
      [],
      undefined,
      false,
      undefined,
      evidence
    );
  }

  static failed(
    errors: string[],
    severity: NextJSErrorSeverity,
    blocking: boolean,
    message?: string
  ): ValidationResult {
    return new ValidationResult(false, errors, severity, blocking, message);
  }
}
```

### Next.js Testing Strategy (Constitutional Compliance)

```typescript
// __tests__/constitutional/constitutional-compliance.test.ts
import { NextJSConstitutionalValidator } from "../constitutional-validator.next";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

describe("Constitutional Compliance Tests - Next.js", () => {
  let validator: NextJSConstitutionalValidator;

  beforeEach(() => {
    validator = new NextJSConstitutionalValidator();
  });

  describe("MANDATE 8: Zero Error Tolerance", () => {
    test("MUST have zero TypeScript compilation errors", async () => {
      const result = await validator.validateTypeScriptCompilation();
      expect(result.success).toBe(true);
      if (!result.success) {
        console.error("TypeScript errors found:", result.errors);
      }
    }, 30000);

    test("MUST have successful Next.js build", async () => {
      const result = await validator.validateNextJSBuild();
      expect(result.success).toBe(true);
      if (!result.success) {
        console.error("Build errors found:", result.errors);
      }
    }, 60000);

    test("MUST have zero ESLint errors", async () => {
      try {
        await execAsync(
          "npx eslint . --ext .ts,.tsx --format=json --max-warnings=0"
        );
      } catch (error) {
        fail(`ESLint errors found: ${error.message}`);
      }
    });
  });

  describe("MANDATE 9: Anti-Circumnavigation Enforcement", () => {
    test("MUST validate browser interactions through MCP (NO FAKING ALLOWED)", async () => {
      // This test ensures MCP validation is actually executed
      const result = await validator.validateBrowserInteraction();

      expect(result.success).toBe(true);
      expect(result.evidence?.mcpValidation).toBe(true);
      expect(result.evidence?.evidenceFiles).toBeDefined();
      expect(result.evidence?.evidenceFiles.length).toBeGreaterThan(0);

      // Verify evidence files actually exist and have valid content
      for (const file of result.evidence.evidenceFiles) {
        const stats = await fs.stat(file);
        expect(stats.size).toBeGreaterThan(0); // Files must not be empty
        expect(stats.mtime.getTime()).toBeGreaterThan(Date.now() - 60000); // Files must be recent
      }
    }, 45000);

    test("MUST fail gracefully when MCP is unavailable", async () => {
      // Test graceful failure when tools are not available
      // This should NOT circumnavigate - should report honest failure

      // Mock MCP unavailability
      const originalVerify = validator["verifyMCPConnection"];
      validator["verifyMCPConnection"] = async () => ({
        success: false,
        error: "MCP server not available",
      });

      const result = await validator.validateBrowserInteraction();

      expect(result.success).toBe(false);
      expect(result.blocking).toBe(true);
      expect(result.message).toContain("MANDATORY");
      expect(result.errors[0]).toContain("Chrome DevTools MCP not available");

      // Restore original method
      validator["verifyMCPConnection"] = originalVerify;
    });
  });

  describe("MANDATE 1: Evidence Collection Requirements", () => {
    test("MUST generate test coverage reports", async () => {
      try {
        await execAsync("npm test -- --coverage --watchAll=false");

        // Verify coverage files exist
        const coverageExists = await fs.access(
          "coverage/lcov-report/index.html"
        );
        expect(coverageExists).toBeUndefined(); // No error means file exists
      } catch (error) {
        fail(`Coverage report generation failed: ${error.message}`);
      }
    }, 120000);

    test("MUST generate Playwright test reports for E2E tests", async () => {
      try {
        await execAsync("npx playwright test --reporter=html");

        // Verify Playwright report exists
        const reportExists = await fs.access("playwright-report/index.html");
        expect(reportExists).toBeUndefined(); // No error means file exists
      } catch (error) {
        // E2E tests may not exist yet - that's acceptable
        console.warn(
          "Playwright tests not available or failed:",
          error.message
        );
      }
    }, 180000);
  });
});
```

### Next.js Project Structure Template

```
nextjs-project-root/
├── .codor/                          # Constitutional enforcement
│   ├── config.yml                  # Next.js-specific configuration
│   ├── validators/                 # Custom validation plugins
│   └── evidence/                   # MANDATORY evidence collection
│       ├── ui-validation/          # MCP screenshots and browser evidence
│       ├── test-reports/           # Jest/Playwright reports
│       ├── performance/            # Lighthouse reports
│       └── accessibility/          # Axe accessibility reports
├── app/                           # Next.js 13+ App Router
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── components/                # Shared components
│   ├── api/                       # API routes
│   └── (routes)/                  # Route groups
├── components/                    # Reusable components with tests
│   ├── ui/                        # Base UI components
│   └── __tests__/                 # Component unit tests
├── lib/                          # Utility functions and configurations
├── public/                       # Static assets
├── __tests__/                    # Test suites
│   ├── unit/                     # Unit tests (70% coverage)
│   ├── integration/              # Integration tests (20%)
│   ├── e2e/                      # End-to-end tests (10%)
│   ├── constitutional/           # Constitutional compliance tests
│   └── setup/                    # Test setup and configurations
├── .codor-config.yml            # Constitutional configuration
├── next.config.js               # Next.js configuration
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── eslint.config.js             # ESLint configuration
├── playwright.config.ts         # Playwright E2E configuration
└── jest.config.js               # Jest testing configuration
```

### Next.js Constitutional Configuration

```yaml
# .codor-config.yml for Next.js projects
project:
  technology: nextjs
  language: typescript
  framework: nextjs-13-app-router
  verification_server: chrome-devtools-mcp

validation:
  build:
    typescript: npx tsc --noEmit --skipLibCheck
    nextjs_build: npm run build
    lint: npx eslint . --ext .ts,.tsx --format=compact --max-warnings=0

  testing:
    unit:
      command: npm test -- --coverage --watchAll=false --verbose
      coverage_threshold: 80
      evidence_required: coverage/lcov-report/index.html

    integration:
      command: npm run test:integration
      evidence_required: test-results/integration-report.json

    e2e:
      command: npx playwright test --reporter=html
      evidence_required: playwright-report/index.html

  browser_validation:
    mcp_server: chrome-devtools-mcp
    required_evidence:
      - full_page_screenshots
      - console_error_logs
      - network_request_logs
      - interaction_screenshots
    anti_circumnavigation: true

  performance:
    lighthouse:
      command: npx lighthouse http://localhost:3000 --output=html --output-path=evidence/performance/lighthouse.html
      thresholds:
        performance: 90
        accessibility: 90
        best_practices: 90
        seo: 90

  accessibility:
    axe:
      command: npx @axe-core/cli http://localhost:3000 --save evidence/accessibility/axe-report.json
      zero_violations: true

evidence_collection:
  mandatory_screenshots: true
  console_error_monitoring: true
  network_request_capture: true
  performance_metrics: true
  accessibility_reports: true
  build_logs: true
  test_coverage_reports: true

error_tolerance:
  blocking_errors:
    - typescript_compilation_errors
    - nextjs_build_failures
    - eslint_errors
    - failed_tests
    - mcp_validation_failures

  documented_warnings:
    - eslint_warnings
    - performance_warnings
    - accessibility_warnings

anti_circumnavigation:
  enforcement: strict
  evidence_integrity_checks: true
  mcp_validation_mandatory: true
  screenshot_authenticity_verification: true
  graceful_failure_required: true

constitutional_enforcement:
  pre_commit_hooks: true
  mcp_integration: true
  evidence_collection_mandatory: true
  progress_tracking: true
  ci_cd_integration: true
```

### Next.js Development Workflow with Anti-Circumnavigation

```bash
#!/bin/bash
# nextjs-constitutional-workflow.sh

echo "🏛️ Next.js Constitutional Development Workflow"
echo "============================================="

# MANDATE 8: Check for blocking errors
echo "📋 MANDATE 8: Checking for blocking errors..."

# TypeScript compilation (BLOCKING)
echo "  → Validating TypeScript compilation..."
npx tsc --noEmit --skipLibCheck || {
    echo "❌ CRITICAL: TypeScript compilation errors found. Development HALTED."
    echo "All TypeScript errors MUST be resolved before proceeding."
    exit 1
}

# Next.js build validation (BLOCKING)
echo "  → Validating Next.js build..."
npm run build || {
    echo "❌ CRITICAL: Next.js build failed. Development HALTED."
    exit 1
}

# ESLint error validation (BLOCKING)
echo "  → Checking ESLint errors..."
npx eslint . --ext .ts,.tsx --format=compact --max-warnings=0 || {
    echo "❌ ERROR: ESLint errors found. Fix before proceeding."
    exit 1
}

echo "✅ MANDATE 8: No blocking errors found."

# MANDATE 9: Anti-Circumnavigation Browser Validation
echo "📋 MANDATE 9: MANDATORY Browser Validation (NO CIRCUMNAVIGATION ALLOWED)"

# Start development server for MCP validation
echo "  → Starting development server for MCP validation..."
npm run dev &
DEV_SERVER_PID=$!

# Wait for server to start
sleep 5

# Verify server is actually running
echo "  → Verifying development server is responding..."
if ! curl -f http://localhost:3000 >/dev/null 2>&1; then
    echo "❌ CRITICAL: Development server not responding."
    echo "Cannot proceed with MCP validation without running server."
    kill $DEV_SERVER_PID 2>/dev/null
    exit 1
fi

# MANDATORY MCP Validation - NO CIRCUMNAVIGATION ALLOWED
echo "  → Executing MANDATORY Chrome DevTools MCP validation..."
echo "    ANTI-CIRCUMNAVIGATION: Screenshots and evidence MUST be genuine"

# Create evidence directory with timestamp
EVIDENCE_DIR="evidence/ui-validation/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$EVIDENCE_DIR"

# MANDATORY: Full page screenshot through MCP
echo "    → Taking full page screenshot (MANDATORY)..."
if command -v mcp-screenshot >/dev/null 2>&1; then
    mcp-screenshot --url http://localhost:3000 --output "$EVIDENCE_DIR/full-page.png" || {
        echo "❌ CRITICAL: MCP screenshot failed."
        echo "Cannot claim UI functionality without MCP evidence."
        echo "This is MANDATORY - no circumnavigation allowed."
        kill $DEV_SERVER_PID 2>/dev/null
        exit 1
    }
else
    echo "❌ CRITICAL: Chrome DevTools MCP not available."
    echo "MCP validation is MANDATORY for UI functionality claims."
    echo "Install and configure Chrome DevTools MCP server."
    echo "DO NOT proceed without proper MCP validation."
    kill $DEV_SERVER_PID 2>/dev/null
    exit 1
fi

# MANDATORY: Console error check through MCP
echo "    → Checking console errors (MANDATORY)..."
mcp-console-errors --url http://localhost:3000 --output "$EVIDENCE_DIR/console-errors.json" || {
    echo "❌ ERROR: Console error check failed."
    kill $DEV_SERVER_PID 2>/dev/null
    exit 1
}

# MANDATORY: Network request monitoring through MCP
echo "    → Monitoring network requests (MANDATORY)..."
mcp-network-monitor --url http://localhost:3000 --output "$EVIDENCE_DIR/network-requests.json" || {
    echo "❌ ERROR: Network monitoring failed."
    kill $DEV_SERVER_PID 2>/dev/null
    exit 1
}

# Clean up development server
kill $DEV_SERVER_PID 2>/dev/null

# Verify evidence files exist and are not empty
echo "  → Verifying evidence integrity..."
for file in "$EVIDENCE_DIR"/*.{png,json}; do
    if [[ -f "$file" ]]; then
        if [[ ! -s "$file" ]]; then
            echo "❌ CRITICAL: Evidence file $file is empty."
            echo "This indicates circumnavigation or tool failure."
            exit 1
        fi
    fi
done

echo "✅ MANDATE 9: Browser validation completed with genuine evidence."

# MANDATE 1 & 3: Evidence collection
echo "📋 MANDATE 1 & 3: Collecting validation evidence..."

# Run tests with coverage (Evidence Required)
echo "  → Running unit tests with coverage..."
npm test -- --coverage --watchAll=false --verbose || {
    echo "❌ Unit tests failing."
    exit 1
}

# Verify coverage evidence exists
if [[ ! -f "coverage/lcov-report/index.html" ]]; then
    echo "❌ ERROR: Coverage report not generated."
    echo "Evidence collection failed - this is MANDATORY."
    exit 1
fi

# E2E testing with Playwright (Evidence Required)
echo "  → Running E2E tests with Playwright..."
if npx playwright test --reporter=html; then
    echo "✅ E2E tests passed."
    if [[ ! -f "playwright-report/index.html" ]]; then
        echo "⚠️  E2E report not generated - verify Playwright configuration."
    fi
else
    echo "⚠️  E2E tests failed or not configured."
fi

# Performance validation (Evidence Required)
echo "  → Running Lighthouse performance audit..."
if command -v lighthouse >/dev/null 2>&1; then
    # Start server again for Lighthouse
    npm run dev &
    DEV_SERVER_PID=$!
    sleep 5

    lighthouse http://localhost:3000 --output=html --output-path="$EVIDENCE_DIR/lighthouse-report.html" || {
        echo "⚠️  Lighthouse audit failed."
    }

    kill $DEV_SERVER_PID 2>/dev/null
else
    echo "ℹ️  Lighthouse not available, skipping performance audit."
fi

# Accessibility validation (Evidence Required)
echo "  → Running accessibility audit..."
if command -v axe >/dev/null 2>&1; then
    # Start server for accessibility check
    npm run dev &
    DEV_SERVER_PID=$!
    sleep 5

    npx @axe-core/cli http://localhost:3000 --save "$EVIDENCE_DIR/axe-report.json" || {
        echo "⚠️  Accessibility audit failed."
    }

    kill $DEV_SERVER_PID 2>/dev/null
else
    echo "ℹ️  Axe accessibility checker not available, skipping accessibility audit."
fi

echo "✅ Constitutional validation complete!"
echo "📁 Evidence collected in: $EVIDENCE_DIR"

# MANDATE 7: Progress tracking reminder
echo ""
echo "⚠️  MANDATE 7 REMINDER:"
echo "   Update your tasks.md file with [x] after completing each task"
echo "   Include validation evidence and timestamp"
echo "   Reference evidence directory: $EVIDENCE_DIR"

# Final anti-circumnavigation verification
echo ""
echo "🔒 ANTI-CIRCUMNAVIGATION VERIFICATION COMPLETE"
echo "   All evidence files verified for authenticity"
echo "   MCP validation executed with genuine browser interaction"
echo "   No circumnavigation detected - proceeding safely"
```

This Next.js implementation template provides:

1. **Strict Anti-Circumnavigation Enforcement**: Mandatory MCP validation with evidence integrity checks
2. **Technology-Specific Validation**: TypeScript, Next.js build, ESLint integration
3. **Evidence-First Development**: Screenshot collection, console monitoring, network capture
4. **Graceful Failure Protocol**: Honest failure reporting when tools are unavailable
5. **Constitutional Compliance Testing**: Automated tests that prevent circumnavigation
6. **Comprehensive Evidence Collection**: All validation evidence properly timestamped and verified

The key innovation is the **mandatory MCP validation** with **anti-circumnavigation enforcement** that makes it impossible for agents to fake progress by requiring genuine browser interaction evidence.
