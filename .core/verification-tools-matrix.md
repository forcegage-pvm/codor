# Platform Verification Tools Matrix
*MCP-Equivalent Verification Tools Across All Major Platforms & Frameworks*

## Overview

This document provides a comprehensive matrix of verification tools that serve as equivalents to the Chrome DevTools MCP server for different platforms and frameworks. Each tool category includes **anti-circumnavigation enforcement** to prevent agents from faking validation evidence.

## Core Verification Categories

### 1. Screenshot & Visual Evidence Tools
### 2. Runtime Inspection & Debugging Tools  
### 3. Performance Monitoring Tools
### 4. Network & API Monitoring Tools
### 5. Automated Testing & Integration Tools
### 6. Build & Deployment Verification Tools

---

## Platform-Specific Verification Tools

### Next.js / React Web Applications

| Category | Tool | Constitutional Usage | Anti-Circumnavigation |
|----------|------|----------------------|----------------------|
| **Visual Evidence** | Chrome DevTools MCP Server | `mcp screenshot --full-page` | Mandatory real browser screenshots |
| **Runtime Inspection** | React DevTools | Browser extension + automation | Component tree validation required |
| **Performance** | Web Vitals | Lighthouse CLI automation | Core Web Vitals measurement mandatory |
| **Network** | Chrome DevTools MCP Network | `mcp network-requests` | API call validation required |
| **Testing** | Playwright + Screenshots | Automated E2E with evidence | Real browser automation only |
| **Build** | Next.js Build Analyzer | Bundle size analysis | Build artifacts verification |

**Constitutional Commands:**
```bash
# Visual Evidence (MANDATORY)
mcp navigate http://localhost:3000
mcp screenshot --full-page --output=evidence/screenshots/page-{timestamp}.png

# Performance Evidence (MANDATORY)  
mcp performance-trace --start
mcp interact --click --scroll --navigate
mcp performance-trace --stop --output=evidence/performance/{timestamp}.json

# Build Evidence (MANDATORY)
next build --experimental-build-trace
next analyze --output=evidence/build-analysis.json
```

### Flutter (Web & Mobile)

| Category | Tool | Constitutional Usage | Anti-Circumnavigation |
|----------|------|----------------------|----------------------|
| **Visual Evidence** | Flutter Screenshot | `flutter screenshot --device-id` | Device-specific screenshots mandatory |
| **Runtime Inspection** | Flutter Inspector | Widget tree capture | Real app runtime required |
| **Performance** | Flutter Performance | `flutter run --profile --trace-startup` | Actual device profiling |
| **Network** | Charles Proxy / Wireshark | HTTP/HTTPS traffic capture | Real network monitoring |
| **Testing** | Flutter Driver + Integration Tests | Screenshot capture during tests | Device interaction evidence |
| **Build** | Flutter Build Analyzer | `flutter build --analyze-size` | Multi-platform build verification |

**Constitutional Commands:**
```bash
# Device Evidence (MANDATORY - NO CIRCUMNAVIGATION)
flutter devices --machine  # Must show available devices
flutter screenshot --device-id=<device-id> --out=evidence/device-screenshots/
flutter drive --screenshot=evidence/integration-test/

# Multi-Platform Build Evidence (MANDATORY)
flutter build web --analyze-size
flutter build apk --analyze-size  
flutter build ios --analyze-size
```

### Python Applications

| Category | Tool | Constitutional Usage | Anti-Circumnavigation |
|----------|------|----------------------|----------------------|
| **Visual Evidence** | Selenium WebDriver | `driver.save_screenshot()` | Browser automation screenshots |
| **Runtime Inspection** | Python Debugger (pdb) | Runtime state capture | Memory/variable inspection |
| **Performance** | cProfile + py-spy | Performance profiling | CPU/memory usage evidence |
| **Network** | requests-mock / VCR.py | HTTP interaction recording | API call evidence |
| **Testing** | pytest-html + coverage | HTML test reports | Coverage evidence required |
| **Build** | pip-audit + safety | Dependency vulnerability scan | Security validation |

**Constitutional Commands:**
```bash
# Testing Evidence (MANDATORY)
pytest --html=evidence/test-reports/report.html --cov=src --cov-report=html:evidence/coverage/

# Performance Evidence (MANDATORY)
python -m cProfile -o evidence/performance/profile.stats main.py
py-spy record -o evidence/performance/flame-graph.svg -d 30 -- python main.py

# Security Evidence (MANDATORY)
pip-audit --output=json --desc > evidence/security/audit-report.json
safety check --json > evidence/security/safety-report.json
```

### Java / Spring Boot Applications

| Category | Tool | Constitutional Usage | Anti-Circumnavigation |
|----------|------|----------------------|----------------------|
| **Visual Evidence** | Selenium WebDriver | TestNG/JUnit screenshots | Browser automation evidence |
| **Runtime Inspection** | JVisualVM / JProfiler | JVM monitoring | Heap/thread analysis |
| **Performance** | Micrometer / Actuator | Metrics collection | Application metrics evidence |
| **Network** | WireMock / Testcontainers | Service interaction testing | Mock service evidence |
| **Testing** | JUnit 5 + Allure Reports | Test execution reports | Coverage + evidence |
| **Build** | Maven/Gradle + OWASP | Dependency check + build | Security scan evidence |

**Constitutional Commands:**
```bash
# Testing Evidence (MANDATORY)
mvn test -Dtest.report.format=html jacoco:report
# OR
gradle test jacocoTestReport --info

# Performance Evidence (MANDATORY)
java -XX:+FlightRecorder -XX:StartFlightRecording=duration=60s,filename=evidence/performance/app-profile.jfr

# Security Evidence (MANDATORY) 
mvn org.owasp:dependency-check-maven:check -Dformat=JSON -DoutputDirectory=evidence/security/
```

### .NET Applications

| Category | Tool | Constitutional Usage | Anti-Circumnavention |
|----------|------|----------------------|---------------------|
| **Visual Evidence** | Playwright for .NET | Browser automation screenshots | Real browser evidence |
| **Runtime Inspection** | dotTrace / PerfView | Performance profiling | Memory/CPU analysis |
| **Performance** | BenchmarkDotNet | Benchmarking evidence | Performance measurement |
| **Network** | Fiddler / HttpClient logging | HTTP traffic capture | API interaction logs |
| **Testing** | xUnit + ReportGenerator | Test coverage reports | Evidence collection |
| **Build** | NuGet Audit + SonarQube | Security + quality analysis | Build validation |

**Constitutional Commands:**
```bash
# Testing Evidence (MANDATORY)
dotnet test --collect:"XPlat Code Coverage" --results-directory:evidence/coverage/
reportgenerator -reports:evidence/coverage/**/coverage.cobertura.xml -targetdir:evidence/coverage/html

# Performance Evidence (MANDATORY) 
dotnet run --configuration Release --verbosity normal > evidence/performance/runtime-logs.txt

# Security Evidence (MANDATORY)
dotnet list package --vulnerable --include-transitive > evidence/security/vulnerable-packages.txt
```

### Node.js Applications

| Category | Tool | Constitutional Usage | Anti-Circumnavention |
|----------|------|----------------------|---------------------|
| **Visual Evidence** | Puppeteer / Playwright | Headless browser screenshots | Real browser automation |
| **Runtime Inspection** | Node Inspector / Chrome DevTools | Runtime debugging | Process monitoring |
| **Performance** | clinic.js / 0x | Performance profiling | CPU/memory evidence |
| **Network** | nock / msw | API mocking with evidence | Request/response logs |
| **Testing** | Jest + Istanbul | Test coverage reports | Evidence generation |
| **Build** | npm audit + bundlesize | Security + bundle analysis | Build verification |

**Constitutional Commands:**
```bash
# Testing Evidence (MANDATORY)
npm test -- --coverage --coverageReporters=html --coverageDirectory=evidence/coverage/
jest --coverage --outputFile=evidence/test-results/results.json --json

# Performance Evidence (MANDATORY)
clinic doctor --dest=evidence/performance/ -- node app.js
0x --output-dir=evidence/performance/ -- node app.js

# Security Evidence (MANDATORY)
npm audit --json > evidence/security/npm-audit.json
bundlesize --config=bundlesize.config.js > evidence/build/bundle-analysis.txt
```

### PHP Applications

| Category | Tool | Constitutional Usage | Anti-Circumnavention |
|----------|------|----------------------|---------------------|
| **Visual Evidence** | PHP WebDriver | Browser automation | Screenshot evidence |
| **Runtime Inspection** | Xdebug / Blackfire | Profiling and debugging | Performance analysis |
| **Performance** | New Relic / Tideways | APM monitoring | Real-world performance |
| **Network** | Guzzle HTTP | HTTP client testing | Request logging |
| **Testing** | PHPUnit + PCOV | Unit testing + coverage | Evidence reports |
| **Build** | Composer audit + PHPCS | Security + code quality | Build validation |

**Constitutional Commands:**
```bash
# Testing Evidence (MANDATORY)
phpunit --coverage-html evidence/coverage/ --log-junit evidence/test-results/junit.xml

# Performance Evidence (MANDATORY)
php -d xdebug.profiler_enable=1 -d xdebug.profiler_output_dir=evidence/performance/ script.php

# Security Evidence (MANDATORY)
composer audit --format=json > evidence/security/composer-audit.json
```

### Ruby Applications

| Category | Tool | Constitutional Usage | Anti-Circumnavention |
|----------|------|----------------------|---------------------|
| **Visual Evidence** | Capybara + Selenium | Feature testing screenshots | Browser evidence |
| **Runtime Inspection** | ruby-prof / stackprof | Performance profiling | Runtime analysis |
| **Performance** | rack-mini-profiler | Web request profiling | Response time evidence |
| **Network** | WebMock / VCR | HTTP interaction testing | Request recording |
| **Testing** | RSpec + SimpleCov | BDD testing + coverage | Evidence reports |
| **Build** | bundler-audit + brakeman | Security scanning | Vulnerability evidence |

**Constitutional Commands:**
```bash
# Testing Evidence (MANDATORY)
rspec --format html --out evidence/test-results/rspec-report.html
COVERAGE=true rspec # SimpleCov generates coverage/index.html

# Performance Evidence (MANDATORY)
ruby-prof --printer=graph --file=evidence/performance/profile.html script.rb

# Security Evidence (MANDATORY)
bundler-audit check --format=json > evidence/security/bundler-audit.json
brakeman --output evidence/security/brakeman-report.json
```

### Go Applications  

| Category | Tool | Constitutional Usage | Anti-Circumnavention |
|----------|------|----------------------|---------------------|
| **Visual Evidence** | Chromedp / Selenium | Browser automation | Screenshot capture |
| **Runtime Inspection** | go tool pprof | CPU/memory profiling | Performance analysis |
| **Performance** | go test -bench | Benchmarking | Performance evidence |
| **Network** | httptest / gock | HTTP testing | Request/response mocking |
| **Testing** | go test + go cover | Testing with coverage | Evidence generation |
| **Build** | govulncheck + golangci-lint | Security + quality | Build validation |

**Constitutional Commands:**
```bash
# Testing Evidence (MANDATORY)
go test -v -race -coverprofile=evidence/coverage/coverage.out ./...
go tool cover -html=evidence/coverage/coverage.out -o evidence/coverage/coverage.html

# Performance Evidence (MANDATORY)
go test -bench=. -cpuprofile=evidence/performance/cpu.prof -memprofile=evidence/performance/mem.prof

# Security Evidence (MANDATORY)
govulncheck -json ./... > evidence/security/vuln-check.json
```

### Rust Applications

| Category | Tool | Constitutional Usage | Anti-Circumnavention |
|----------|------|----------------------|---------------------|
| **Visual Evidence** | fantoccini / thirtyfour | WebDriver automation | Browser screenshots |
| **Runtime Inspection** | perf / valgrind | System-level profiling | Memory analysis |
| **Performance** | criterion.rs | Benchmarking framework | Statistical evidence |
| **Network** | mockito / wiremock | HTTP mocking | Request evidence |
| **Testing** | cargo test + tarpaulin | Testing + coverage | Evidence reports |
| **Build** | cargo audit + clippy | Security + linting | Build validation |

**Constitutional Commands:**
```bash
# Testing Evidence (MANDATORY)
cargo test -- --nocapture
cargo tarpaulin --out Html --output-dir evidence/coverage/

# Performance Evidence (MANDATORY)  
cargo bench -- --save-baseline evidence/performance/baseline

# Security Evidence (MANDATORY)
cargo audit --json > evidence/security/audit.json
```

---

## Universal Anti-Circumnavention Protocols

### 1. Evidence Authenticity Verification

```bash
# File existence and content validation
for evidence_file in evidence/**/*; do
    if [[ ! -s "$evidence_file" ]]; then
        echo "ERROR: Empty evidence file detected: $evidence_file"
        exit 1
    fi
done

# Timestamp validation (evidence must be recent)
find evidence/ -type f -not -newermt "5 minutes ago" | while read old_file; do
    echo "WARNING: Evidence file may be pre-existing fake: $old_file"
done

# File type validation for screenshots
find evidence/ -name "*.png" -o -name "*.jpg" | while read img_file; do
    if ! file "$img_file" | grep -q "image"; then
        echo "ERROR: Invalid image file: $img_file"
        exit 1
    fi
done
```

### 2. Tool Availability Validation

```bash
# Verify required tools are available before claiming functionality
check_tool_availability() {
    local tool_name="$1"
    local platform="$2"
    
    if ! command -v "$tool_name" >/dev/null 2>&1; then
        echo "ERROR: Required verification tool '$tool_name' not available for $platform"
        echo "Cannot validate $platform functionality without proper tools"
        echo "Install $tool_name before proceeding or acknowledge limitation"
        return 1
    fi
    
    return 0
}

# Platform-specific tool checks
check_tool_availability "mcp" "Next.js web validation"
check_tool_availability "flutter" "Flutter multi-platform validation" 
check_tool_availability "pytest" "Python testing validation"
check_tool_availability "mvn" "Java Maven validation"
check_tool_availability "dotnet" "dotnet validation"
```

### 3. Graceful Failure Protocol

```bash
# Graceful failure when verification tools unavailable
handle_verification_failure() {
    local platform="$1"
    local error_message="$2"
    
    echo "🚨 VERIFICATION FAILURE: $platform"
    echo "Error: $error_message"
    echo ""
    echo "CONSTITUTIONAL RESPONSE OPTIONS:"
    echo "1. HALT development until verification tools are available (RECOMMENDED)"
    echo "2. Document limitation and proceed with reduced confidence"
    echo "3. Set up verification environment before claiming functionality"
    echo ""
    echo "⚠️  DO NOT proceed with functionality claims without verification"
    echo "⚠️  DO NOT fake or simulate verification evidence"
    echo "⚠️  DO NOT circumnavigate validation requirements"
    
    # Create failure evidence  
    mkdir -p evidence/verification-failures/
    cat > "evidence/verification-failures/failure-$(date +%s).json" << EOF
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "platform": "$platform", 
    "error": "$error_message",
    "action": "development_halted",
    "reason": "verification_tools_unavailable"
}
EOF
}
```

### 4. Evidence Collection Standards

#### Minimum Evidence Requirements by Platform:

| Platform | Required Evidence | Validation Method |
|----------|-------------------|-------------------|
| **Web** | Full page screenshots, performance traces, network logs | Chrome DevTools MCP / Playwright |
| **Mobile** | Device screenshots, app installation logs, runtime data | Platform-specific tools |  
| **Desktop** | Application screenshots, system integration evidence | OS-specific automation |
| **API** | Request/response logs, performance metrics | HTTP client evidence |
| **Database** | Query execution logs, performance data | DB-specific monitoring |
| **CI/CD** | Build logs, test results, deployment evidence | Pipeline artifacts |

#### Evidence Integrity Checklist:

```bash
# Constitutional evidence validation
validate_evidence_integrity() {
    echo "🔍 EVIDENCE INTEGRITY VALIDATION"
    
    # Check for required evidence files
    local required_evidence=(
        "screenshots"
        "test-results" 
        "performance"
        "build-analysis"
        "security-scans"
    )
    
    for evidence_type in "${required_evidence[@]}"; do
        if [[ ! -d "evidence/$evidence_type" ]] || [[ -z "$(ls -A evidence/$evidence_type 2>/dev/null)" ]]; then
            echo "❌ Missing evidence: $evidence_type"
            return 1
        fi
    done
    
    # Verify file formats
    local screenshot_count=$(find evidence/screenshots/ -name "*.png" -o -name "*.jpg" | wc -l)
    if [[ $screenshot_count -eq 0 ]]; then
        echo "❌ No screenshot evidence found"
        return 1
    fi
    
    # Check for empty files (circumnavigation indicator)
    local empty_files=$(find evidence/ -type f -empty)
    if [[ -n "$empty_files" ]]; then
        echo "❌ Empty evidence files detected:"
        echo "$empty_files"
        return 1
    fi
    
    echo "✅ Evidence integrity validation passed"
    return 0
}
```

---

## Platform Integration Matrix

### Cross-Platform Testing Strategies

| Scenario | Primary Tools | Secondary Tools | Evidence Requirements |
|----------|---------------|-----------------|----------------------|
| **Full Stack Web** | Chrome DevTools MCP, Playwright | Lighthouse, WebPageTest | End-to-end screenshots, performance data |
| **Mobile App** | Flutter Driver, Appium | Firebase Test Lab, Device farms | Multi-device screenshots, crash logs |
| **Desktop App** | Platform automation tools | Process monitors | Installation evidence, system integration |
| **Microservices** | Postman/Newman, K6 | Service mesh monitoring | API documentation, load test results |
| **Data Pipeline** | SQL profilers, ETL tools | Data validation frameworks | Data quality reports, lineage evidence |

### Constitutional Enforcement Hierarchy

1. **CRITICAL (Development Halting):**
   - Missing verification tools for claimed functionality
   - Empty or fake evidence files 
   - Build failures without explanation
   - Security vulnerabilities in dependencies

2. **ERROR (Immediate Attention Required):**
   - Test failures without documentation
   - Performance degradation
   - Broken functionality without acknowledgment
   - Missing evidence for recent changes

3. **WARNING (Must Be Documented):**
   - Tool limitations that affect validation
   - Partial coverage or evidence
   - Performance concerns
   - Deprecated dependencies

4. **INFO (For Tracking):**
   - Tool version updates
   - Configuration changes
   - Optimization opportunities
   - Documentation improvements

This comprehensive verification tools matrix ensures that **every major platform and framework has equivalent validation capabilities to the Chrome DevTools MCP server**, with **strict anti-circumnavigation enforcement** that makes it impossible for AI agents to fake validation evidence while providing **graceful failure protocols** when verification tools are genuinely unavailable.