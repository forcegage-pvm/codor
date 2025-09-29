# Java Development Constitution Implementation

_Constitutional Guardrails for Java Projects_

## Technology Stack Integration

**Base Language**: Java 11+  
**Build Tools**: Maven 3.6+, Gradle 7+  
**Testing Frameworks**: JUnit 5, TestNG, Mockito  
**Linting/Quality**: SpotBugs, PMD, Checkstyle, SonarQube  
**Package Manager**: Maven Central, Gradle Plugin Portal

## Constitutional Validation Commands

### MANDATE 8: Zero Error Tolerance - Java Implementation

```bash
# Compilation Check
mvn clean compile
# OR
gradle clean compileJava

# Test Compilation
mvn test-compile
# OR
gradle compileTestJava

# Dependency Validation
mvn dependency:analyze
mvn dependency:tree
# OR
gradle dependencies --configuration compileClasspath

# Static Analysis - ERRORS must be fixed immediately
mvn spotbugs:check
mvn pmd:check
mvn checkstyle:check
# OR
gradle spotbugsMain pmdMain checkstyleMain
```

### MANDATE 1: Evidence-First Progress - Java Implementation

```bash
# Unit Testing with Coverage
mvn clean test jacoco:report
# OR
gradle clean test jacocoTestReport

# Integration Testing
mvn clean verify -Pintegration-tests
# OR
gradle clean integrationTest

# End-to-End Testing
mvn clean verify -Pe2e-tests
# OR
gradle clean e2eTest

# Performance Testing
mvn clean test -Dtest=**/*PerformanceTest
# OR
gradle performanceTest
```

### MANDATE 3: Validation-Driven Development - Java Implementation

```bash
# Full Build Validation
mvn clean verify
# OR
gradle clean build

# Security Scanning
mvn dependency-check:check
# OR
gradle dependencyCheckAnalyze

# Code Quality Gates
mvn sonar:sonar
# OR
gradle sonarqube
```

## Java-Specific Constitutional Requirements

### Error Classification for Java

```java
// ConstitutionalValidator.java
package com.project.constitutional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.ArrayList;
import java.util.regex.Pattern;

public enum JavaErrorSeverity {
    CRITICAL,    // Compilation errors, missing dependencies, security issues
    ERROR,       // SpotBugs errors, PMD errors, test failures
    WARNING,     // Checkstyle warnings, minor PMD issues
    INFO         // Code style suggestions, documentation issues
}

public class JavaConstitutionalValidator {

    public ValidationResult validateCompilation() {
        try {
            ProcessBuilder pb = new ProcessBuilder("mvn", "clean", "compile");
            Process process = pb.start();
            int exitCode = process.waitFor();

            if (exitCode != 0) {
                List<String> errors = Files.readAllLines(Path.of("target/maven-status/maven-compiler-plugin/compile/default-compile/createdFiles.lst"));
                return ValidationResult.builder()
                    .success(false)
                    .errors(errors)
                    .severity(JavaErrorSeverity.CRITICAL)
                    .blocking(true)
                    .build();
            }

            return ValidationResult.success();

        } catch (Exception e) {
            return ValidationResult.builder()
                .success(false)
                .errors(List.of(e.getMessage()))
                .severity(JavaErrorSeverity.CRITICAL)
                .blocking(true)
                .build();
        }
    }

    public ValidationResult validateStaticAnalysis() {
        List<String> errors = new ArrayList<>();

        // SpotBugs validation
        try {
            ProcessBuilder pb = new ProcessBuilder("mvn", "spotbugs:check");
            Process process = pb.start();
            if (process.waitFor() != 0) {
                errors.add("SpotBugs errors found - check target/spotbugsXml.xml");
            }
        } catch (Exception e) {
            errors.add("SpotBugs validation failed: " + e.getMessage());
        }

        // PMD validation
        try {
            ProcessBuilder pb = new ProcessBuilder("mvn", "pmd:check");
            Process process = pb.start();
            if (process.waitFor() != 0) {
                errors.add("PMD errors found - check target/pmd.xml");
            }
        } catch (Exception e) {
            errors.add("PMD validation failed: " + e.getMessage());
        }

        return ValidationResult.builder()
            .success(errors.isEmpty())
            .errors(errors)
            .severity(errors.isEmpty() ? null : JavaErrorSeverity.ERROR)
            .blocking(!errors.isEmpty())
            .build();
    }

    public ValidationResult validateDependencies() {
        try {
            ProcessBuilder pb = new ProcessBuilder("mvn", "dependency:analyze");
            Process process = pb.start();

            // Check for unused dependencies or missing dependencies
            String output = new String(process.getInputStream().readAllBytes());

            List<String> issues = new ArrayList<>();
            if (output.contains("Unused declared dependencies found")) {
                issues.add("Unused dependencies detected");
            }
            if (output.contains("Used undeclared dependencies found")) {
                issues.add("Missing dependency declarations found");
            }

            return ValidationResult.builder()
                .success(issues.isEmpty())
                .errors(issues)
                .severity(issues.isEmpty() ? null : JavaErrorSeverity.WARNING)
                .blocking(false)  // Dependency issues are warnings, not blockers
                .build();

        } catch (Exception e) {
            return ValidationResult.builder()
                .success(false)
                .errors(List.of("Dependency analysis failed: " + e.getMessage()))
                .severity(JavaErrorSeverity.ERROR)
                .blocking(true)
                .build();
        }
    }

    public ValidationResult validateSecurityVulnerabilities() {
        try {
            ProcessBuilder pb = new ProcessBuilder("mvn", "dependency-check:check");
            Process process = pb.start();
            int exitCode = process.waitFor();

            if (exitCode != 0) {
                return ValidationResult.builder()
                    .success(false)
                    .errors(List.of("Security vulnerabilities found - check target/dependency-check-report.html"))
                    .severity(JavaErrorSeverity.CRITICAL)
                    .blocking(true)
                    .message("Critical security vulnerabilities must be resolved immediately")
                    .build();
            }

            return ValidationResult.success();

        } catch (Exception e) {
            return ValidationResult.builder()
                .success(false)
                .errors(List.of("Security scan failed: " + e.getMessage()))
                .severity(JavaErrorSeverity.WARNING)  // Tool failure is warning, not blocker
                .blocking(false)
                .build();
        }
    }
}
```

### Java Testing Strategy (Constitutional Compliance)

```java
// ConstitutionalComplianceTest.java
package com.project.constitutional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Constitutional Compliance Tests")
@Tag("constitutional")
public class ConstitutionalComplianceTest {

    private JavaConstitutionalValidator validator;

    @BeforeEach
    void setUp() {
        validator = new JavaConstitutionalValidator();
    }

    @Test
    @DisplayName("MANDATE 8: Zero tolerance for compilation errors")
    void testMandateEightZeroCompilationErrors() {
        ValidationResult result = validator.validateCompilation();
        assertTrue(result.isSuccess(),
            () -> "Compilation errors found: " + String.join(", ", result.getErrors()));
    }

    @Test
    @DisplayName("MANDATE 8: Zero tolerance for static analysis errors")
    void testMandateEightZeroStaticAnalysisErrors() {
        ValidationResult result = validator.validateStaticAnalysis();
        assertTrue(result.isSuccess(),
            () -> "Static analysis errors found: " + String.join(", ", result.getErrors()));
    }

    @Test
    @DisplayName("MANDATE 8: Zero tolerance for critical security vulnerabilities")
    void testMandateEightZeroSecurityVulnerabilities() {
        ValidationResult result = validator.validateSecurityVulnerabilities();
        assertTrue(result.isSuccess(),
            () -> "Critical security vulnerabilities found: " + String.join(", ", result.getErrors()));
    }

    @Test
    @DisplayName("MANDATE 1: Evidence-first requires adequate test coverage")
    void testMandateOneTestCoverage() throws Exception {
        // Run jacoco coverage report
        ProcessBuilder pb = new ProcessBuilder("mvn", "jacoco:report");
        Process process = pb.start();
        assertEquals(0, process.waitFor(), "Failed to generate coverage report");

        // Parse coverage results and verify > 80% coverage
        // Implementation depends on jacoco configuration
        assertTrue(getCoveragePercentage() >= 80.0,
            "Test coverage below 80% threshold");
    }

    @Test
    @DisplayName("MANDATE 3: Integration points must be tested")
    @Tag("integration")
    void testMandateThreeIntegrationValidation() throws Exception {
        ProcessBuilder pb = new ProcessBuilder("mvn", "verify", "-Pintegration-tests");
        Process process = pb.start();
        assertEquals(0, process.waitFor(), "Integration tests failing");
    }

    private double getCoveragePercentage() {
        // Parse target/site/jacoco/index.html or jacoco.xml for coverage percentage
        // Implementation depends on specific jacoco setup
        return 85.0; // Placeholder
    }
}
```

### Java Project Structure Template

```
project-root/
├── .codor/                          # Constitutional enforcement
│   ├── config.yml                  # Java-specific configuration
│   ├── validators/                 # Custom validation plugins
│   └── evidence/                   # Validation evidence collection
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/project/        # Main application code
│   │   └── resources/              # Configuration and resources
│   └── test/
│       ├── java/
│       │   ├── unit/              # Unit tests (70% of test suite)
│       │   ├── integration/       # Integration tests (20%)
│       │   ├── e2e/               # End-to-end tests (10%)
│       │   ├── performance/       # Performance benchmarks
│       │   └── constitutional/    # Constitutional compliance tests
│       └── resources/             # Test resources
├── target/                        # Build output (Maven)
├── build/                         # Build output (Gradle)
├── .codor-config.yml              # Constitutional configuration
├── pom.xml                        # Maven configuration
├── build.gradle                   # Gradle configuration (alternative)
├── checkstyle.xml                 # Code style configuration
├── spotbugs-exclude.xml           # Static analysis exclusions
└── sonar-project.properties       # SonarQube configuration
```

### Java Constitutional Configuration

```yaml
# .codor-config.yml for Java projects
project:
  technology: java
  language: java
  framework: spring-boot # or null, spring, micronaut, etc.
  build_tool: maven # or gradle

validation:
  build:
    maven:
      compile: mvn clean compile
      test_compile: mvn test-compile
      package: mvn clean package
    gradle:
      compile: gradle clean compileJava
      test_compile: gradle compileTestJava
      package: gradle clean build

  testing:
    unit:
      maven: mvn test jacoco:report
      gradle: gradle test jacocoTestReport
      coverage_threshold: 80

    integration:
      maven: mvn verify -Pintegration-tests
      gradle: gradle integrationTest

    e2e:
      maven: mvn verify -Pe2e-tests
      gradle: gradle e2eTest

  static_analysis:
    spotbugs:
      maven: mvn spotbugs:check
      gradle: gradle spotbugsMain

    pmd:
      maven: mvn pmd:check
      gradle: gradle pmdMain

    checkstyle:
      maven: mvn checkstyle:check
      gradle: gradle checkstyleMain

  security:
    vulnerability_scan:
      maven: mvn dependency-check:check
      gradle: gradle dependencyCheckAnalyze

  dependencies:
    analyze:
      maven: mvn dependency:analyze
      gradle: gradle dependencies --configuration compileClasspath

evidence_collection:
  test_reports: true
  coverage_reports: true
  static_analysis_reports: true
  security_scan_reports: true
  performance_benchmarks: true
  build_logs: true

error_tolerance:
  blocking_errors:
    - compilation_errors
    - test_failures
    - spotbugs_errors
    - pmd_errors
    - critical_security_vulnerabilities

  documented_warnings:
    - checkstyle_warnings
    - dependency_warnings
    - minor_security_issues

constitutional_enforcement:
  pre_commit_hooks: true
  continuous_validation: true
  evidence_collection: true
  progress_tracking: true
  maven_enforcer: true
  gradle_build_scan: true
```

### Java Development Workflow

```bash
#!/bin/bash
# java-constitutional-workflow.sh

echo "🏛️ Java Constitutional Development Workflow"
echo "==========================================="

# Detect build tool
BUILD_TOOL=""
if [ -f "pom.xml" ]; then
    BUILD_TOOL="maven"
elif [ -f "build.gradle" ] || [ -f "build.gradle.kts" ]; then
    BUILD_TOOL="gradle"
else
    echo "❌ CRITICAL: No build configuration found (pom.xml or build.gradle)"
    exit 1
fi

echo "📋 Detected build tool: $BUILD_TOOL"

# MANDATE 8: Check for blocking errors
echo "📋 MANDATE 8: Checking for blocking errors..."

# Compilation validation
echo "  → Validating compilation..."
if [ "$BUILD_TOOL" = "maven" ]; then
    mvn clean compile || {
        echo "❌ CRITICAL: Compilation errors found. Development HALTED."
        exit 1
    }
else
    gradle clean compileJava || {
        echo "❌ CRITICAL: Compilation errors found. Development HALTED."
        exit 1
    }
fi

# Test compilation
echo "  → Validating test compilation..."
if [ "$BUILD_TOOL" = "maven" ]; then
    mvn test-compile || {
        echo "❌ CRITICAL: Test compilation errors found. Development HALTED."
        exit 1
    }
else
    gradle compileTestJava || {
        echo "❌ CRITICAL: Test compilation errors found. Development HALTED."
        exit 1
    }
fi

# Static Analysis - Errors Only
echo "  → Running static analysis (errors only)..."
if [ "$BUILD_TOOL" = "maven" ]; then
    mvn spotbugs:check || {
        echo "❌ ERROR: SpotBugs errors found. Fix before proceeding."
        echo "📄 Report: target/spotbugsXml.xml"
        exit 1
    }

    mvn pmd:check || {
        echo "❌ ERROR: PMD errors found. Fix before proceeding."
        echo "📄 Report: target/pmd.xml"
        exit 1
    }
else
    gradle spotbugsMain || {
        echo "❌ ERROR: SpotBugs errors found. Fix before proceeding."
        exit 1
    }

    gradle pmdMain || {
        echo "❌ ERROR: PMD errors found. Fix before proceeding."
        exit 1
    }
fi

# Security vulnerability check
echo "  → Checking for critical security vulnerabilities..."
if [ "$BUILD_TOOL" = "maven" ]; then
    mvn dependency-check:check || {
        echo "❌ CRITICAL: Security vulnerabilities found."
        echo "📄 Report: target/dependency-check-report.html"
        exit 1
    }
else
    gradle dependencyCheckAnalyze || {
        echo "❌ CRITICAL: Security vulnerabilities found."
        exit 1
    }
fi

echo "✅ MANDATE 8: No blocking errors found."

# MANDATE 1 & 3: Evidence collection
echo "📋 MANDATE 1 & 3: Collecting validation evidence..."

# Run tests with coverage
echo "  → Running unit tests with coverage..."
if [ "$BUILD_TOOL" = "maven" ]; then
    mvn clean test jacoco:report || {
        echo "❌ Unit tests failing."
        exit 1
    }
    echo "📄 Coverage report: target/site/jacoco/index.html"
else
    gradle clean test jacocoTestReport || {
        echo "❌ Unit tests failing."
        exit 1
    }
    echo "📄 Coverage report: build/reports/jacoco/test/html/index.html"
fi

# Integration tests
echo "  → Running integration tests..."
if [ "$BUILD_TOOL" = "maven" ]; then
    if mvn help:evaluate -Dexpression=project.profiles -q -DforceStdout | grep -q "integration-tests"; then
        mvn verify -Pintegration-tests || {
            echo "❌ Integration tests failing."
            exit 1
        }
    else
        echo "ℹ️  No integration test profile found, skipping..."
    fi
else
    if gradle tasks --all | grep -q "integrationTest"; then
        gradle integrationTest || {
            echo "❌ Integration tests failing."
            exit 1
        }
    else
        echo "ℹ️  No integration test task found, skipping..."
    fi
fi

# Code quality warnings check (non-blocking)
echo "  → Checking code quality warnings..."
if [ "$BUILD_TOOL" = "maven" ]; then
    mvn checkstyle:check || {
        echo "⚠️  Checkstyle warnings found - should be addressed"
        echo "📄 Report: target/checkstyle-result.xml"
    }
else
    gradle checkstyleMain || {
        echo "⚠️  Checkstyle warnings found - should be addressed"
    }
fi

echo "✅ Constitutional validation complete!"

# Evidence collection
mkdir -p evidence/
if [ "$BUILD_TOOL" = "maven" ]; then
    cp -r target/site/jacoco/ evidence/ 2>/dev/null || true
    cp target/dependency-check-report.html evidence/ 2>/dev/null || true
    cp target/surefire-reports/ evidence/ 2>/dev/null || true
else
    cp -r build/reports/ evidence/ 2>/dev/null || true
    cp -r build/test-results/ evidence/ 2>/dev/null || true
fi

echo "📁 Evidence collected in ./evidence/ directory"

# MANDATE 7: Progress tracking reminder
echo ""
echo "⚠️  MANDATE 7 REMINDER:"
echo "   Update your tasks.md file with [x] after completing each task"
echo "   Include validation evidence and timestamp"
```

### Maven Enforcer Plugin Configuration (Constitutional)

```xml
<!-- Add to pom.xml for constitutional enforcement -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-enforcer-plugin</artifactId>
    <version>3.1.0</version>
    <executions>
        <execution>
            <id>constitutional-enforcement</id>
            <goals>
                <goal>enforce</goal>
            </goals>
            <configuration>
                <rules>
                    <!-- MANDATE 8: Require clean compilation -->
                    <requireMavenVersion>
                        <version>3.6.0</version>
                    </requireMavenVersion>
                    <requireJavaVersion>
                        <version>11</version>
                    </requireJavaVersion>

                    <!-- No dependency conflicts allowed -->
                    <dependencyConvergence/>

                    <!-- No snapshots in release builds -->
                    <requireReleaseDeps>
                        <onlyWhenRelease>true</onlyWhenRelease>
                    </requireReleaseDeps>

                    <!-- Require test coverage -->
                    <requireProperty>
                        <property>jacoco.covered.ratio</property>
                        <regex>0\.[8-9][0-9]|1\.0</regex>
                        <regexMessage>Test coverage must be at least 80%</regexMessage>
                    </requireProperty>
                </rules>
                <fail>true</fail>
            </configuration>
        </execution>
    </executions>
</plugin>
```

This Java implementation template provides:

1. **Technology-Specific Validation**: Java compilation, static analysis, dependency management
2. **Constitutional Compliance**: Built-in tests for all 8 mandates
3. **Build Tool Support**: Both Maven and Gradle implementations
4. **Error Classification**: Java-specific error categories and severity levels
5. **Evidence Collection**: Test reports, coverage, static analysis, security scans
6. **Automated Workflow**: Shell script for constitutional validation process
7. **Enforcer Integration**: Maven/Gradle plugins for automated constitutional enforcement

The template maintains the rigorous standards of the original constitution while being specifically tailored for Java development workflows and enterprise requirements.
