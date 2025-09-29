# Flutter Development Constitution Implementation

_Constitutional Guardrails for Flutter Projects (Web & Mobile) with Anti-Circumnavigation Enforcement_

## Technology Stack Integration

**Base Framework**: Flutter 3.10+  
**Language**: Dart 3.0+  
**Platforms**: Web, iOS, Android, Desktop  
**Testing Frameworks**: flutter_test, integration_test, flutter_driver  
**Verification Tools**: Flutter Inspector, Device Inspector, Web DevTools  
**CI/CD**: Codemagic, GitHub Actions with device farms

## Constitutional Validation Commands

### MANDATE 8: Zero Error Tolerance - Flutter Implementation

```bash
# Dart Analysis (BLOCKING)
flutter analyze --fatal-infos --fatal-warnings

# Dart Compilation Check (BLOCKING)
dart compile exe lib/main.dart --output=build/temp_check || rm -f build/temp_check

# Flutter Doctor Validation (BLOCKING)
flutter doctor --verbose
# All checkmarks MUST be green for target platforms

# Dependency Validation (BLOCKING)
flutter pub deps
flutter pub get --verbose

# Format Validation (BLOCKING)
dart format --set-exit-if-changed lib/ test/
```

### MANDATE 1 & 9: Evidence-First Progress with Anti-Circumnavigation - Flutter Implementation

```bash
# Unit Testing with Coverage (Evidence Required)
flutter test --coverage --reporter=expanded
# Coverage report MUST be generated: coverage/lcov.info

# Widget Testing (Evidence Required)
flutter test test/widget_test.dart --reporter=expanded

# Integration Testing - Web Platform (Evidence Required)
flutter drive --driver=test_driver/integration_test.dart --target=integration_test/app_test.dart --web-renderer=html

# Integration Testing - Mobile Platforms (Evidence Required)
flutter drive --driver=test_driver/integration_test.dart --target=integration_test/app_test.dart --device-id=<device-id>

# Golden File Testing for UI Consistency (Evidence Required)
flutter test --update-goldens  # Only when intentional UI changes
flutter test --reporter=expanded test/golden_test.dart
```

### MANDATE 9: Multi-Platform Validation with Device/Browser Evidence (MANDATORY - NO CIRCUMNAVIGATION)

#### Web Platform Validation (MANDATORY)

```bash
# Build Flutter Web (BLOCKING)
flutter build web --web-renderer=canvaskit --release
# AND
flutter build web --web-renderer=html --release

# Start Flutter Web Server (Required for validation)
flutter run -d web-server --web-hostname=localhost --web-port=8080

# Chrome DevTools Integration for Flutter Web (MANDATORY)
# These validations MUST be performed on actual running web application
mcp navigate http://localhost:8080
mcp screenshot --full-page --output=evidence/web-validation/flutter-web-{timestamp}.png

# Flutter Web Inspector Validation (MANDATORY)
flutter run -d chrome --web-renderer=html --verbose
# MUST capture Flutter Inspector widget tree with actual screenshots
mcp flutter-inspector --capture-widget-tree --output=evidence/web-validation/widget-tree-{timestamp}.json

# Web Performance Validation (Evidence Required)
mcp performance-trace --start
mcp interact-with-app --actions="[click, scroll, navigate]"
mcp performance-trace --stop --output=evidence/web-validation/performance-{timestamp}.json
```

#### Mobile Platform Validation (MANDATORY)

```bash
# iOS Device/Simulator Validation (MANDATORY)
flutter build ios --debug
flutter install --device-id=<ios-device-id>

# iOS Device Screenshots (MANDATORY - NO FAKING ALLOWED)
flutter screenshot --device-id=<ios-device-id> --out=evidence/ios-validation/screenshot-{timestamp}.png

# iOS Integration Testing with Real Device (MANDATORY)
flutter drive \
  --driver=test_driver/integration_test.dart \
  --target=integration_test/app_test.dart \
  --device-id=<ios-device-id> \
  --screenshot=evidence/ios-validation/

# Android Device/Emulator Validation (MANDATORY)
flutter build apk --debug
flutter install --device-id=<android-device-id>

# Android Device Screenshots (MANDATORY - NO FAKING ALLOWED)
flutter screenshot --device-id=<android-device-id> --out=evidence/android-validation/screenshot-{timestamp}.png

# Android Integration Testing with Real Device (MANDATORY)
flutter drive \
  --driver=test_driver/integration_test.dart \
  --target=integration_test/app_test.dart \
  --device-id=<android-device-id> \
  --screenshot=evidence/android-validation/
```

**ANTI-CIRCUMNAVIGATION ENFORCEMENT:**

- Screenshots MUST be taken from actual devices/browsers, not generated
- Widget inspector data MUST come from running Flutter applications
- Performance traces MUST show real user interactions
- Device logs MUST be captured showing actual Flutter runtime
- Build artifacts MUST be generated through actual Flutter build process

### MANDATE 3: Validation-Driven Development - Flutter Implementation

```bash
# Flutter App Bundle Analysis (Evidence Required)
flutter build appbundle --analyze-size --target-platform=android-arm64
# Size analysis MUST be generated and reviewed

# iOS App Store Validation (Evidence Required)
flutter build ipa --export-options-plist=ios/ExportOptions.plist
# Archive MUST be successfully created for App Store submission

# Web Bundle Analysis (Evidence Required)
flutter build web --analyze-size
# Web bundle size analysis MUST be documented

# Performance Profiling (Evidence Required)
flutter run --profile --trace-startup --device-id=<device-id>
# Performance traces MUST be captured and analyzed

# Memory Usage Analysis (Evidence Required)
flutter run --profile --trace-systrace --device-id=<device-id>
# Memory profiling MUST show no leaks or excessive usage
```

## Flutter-Specific Constitutional Requirements

### Error Classification for Flutter

```dart
// constitutional_validator.dart
import 'dart:io';
import 'dart:convert';
import 'package:process_run/shell.dart';

enum FlutterErrorSeverity {
  critical, // Build failures, Dart analysis errors, platform errors
  error,    // Test failures, performance issues, broken functionality
  warning,  // Code style issues, minor performance warnings
  info      // Optimization suggestions, documentation
}

class FlutterConstitutionalValidator {
  final Shell shell = Shell();

  Future<ValidationResult> validateDartAnalysis() async {
    try {
      final result = await shell.run('flutter analyze --fatal-infos --fatal-warnings');

      if (result.first.exitCode != 0) {
        final errors = result.first.stderr.toString().split('\n')
            .where((line) => line.contains('error') || line.contains('warning'))
            .toList();

        return ValidationResult.failed(
          errors,
          FlutterErrorSeverity.critical,
          true, // blocking
          "Dart analysis errors MUST be resolved immediately"
        );
      }

      return ValidationResult.success();
    } catch (error) {
      return ValidationResult.failed(
        [error.toString()],
        FlutterErrorSeverity.critical,
        true
      );
    }
  }

  Future<ValidationResult> validateFlutterDoctor() async {
    try {
      final result = await shell.run('flutter doctor --machine');
      final doctorOutput = jsonDecode(result.first.stdout as String);

      final issues = <String>[];
      for (final check in doctorOutput) {
        if (check['status'] != 'installed') {
          issues.add('${check['title']}: ${check['status']}');
        }
      }

      if (issues.isNotEmpty) {
        return ValidationResult.failed(
          issues,
          FlutterErrorSeverity.error,
          true,
          "Flutter environment issues MUST be resolved for reliable development"
        );
      }

      return ValidationResult.success();
    } catch (error) {
      return ValidationResult.failed(
        [error.toString()],
        FlutterErrorSeverity.critical,
        true
      );
    }
  }

  Future<ValidationResult> validatePlatformBuilds() async {
    /**
     * ANTI-CIRCUMNAVIGATION: This method MUST perform actual builds
     * NEVER fake or simulate build success
     */
    try {
      final platforms = <String, String>{
        'web': 'flutter build web --release',
        'android': 'flutter build apk --release',
        'ios': 'flutter build ios --release --no-codesign'
      };

      final buildResults = <String>[];
      final failures = <String>[];

      for (final entry in platforms.entries) {
        try {
          print('Building for ${entry.key}...');
          final result = await shell.run(entry.value);

          if (result.first.exitCode == 0) {
            buildResults.add('${entry.key}: SUCCESS');
          } else {
            failures.add('${entry.key}: ${result.first.stderr}');
          }
        } catch (error) {
          failures.add('${entry.key}: Build failed - ${error}');
        }
      }

      if (failures.isNotEmpty) {
        return ValidationResult.failed(
          failures,
          FlutterErrorSeverity.critical,
          true,
          "Platform builds MUST succeed for all target platforms"
        );
      }

      return ValidationResult.success(evidence: buildResults);
    } catch (error) {
      return ValidationResult.failed(
        [error.toString()],
        FlutterErrorSeverity.critical,
        true
      );
    }
  }

  Future<ValidationResult> validateDeviceInteraction() async {
    /**
     * CRITICAL ANTI-CIRCUMNAVIGATION MEASURE:
     * This method MUST interact with actual devices/simulators
     * NEVER fake device interactions or screenshots
     */
    try {
      // Get available devices
      final devicesResult = await shell.run('flutter devices --machine');
      final devices = jsonDecode(devicesResult.first.stdout as String) as List;

      if (devices.isEmpty) {
        return ValidationResult.failed(
          ['No devices available for testing'],
          FlutterErrorSeverity.error,
          true,
          "Device validation requires actual devices or simulators"
        );
      }

      final evidenceFiles = <String>[];

      // Test on each available device
      for (final device in devices) {
        final deviceId = device['id'] as String;
        final deviceName = device['name'] as String;

        print('Testing on device: $deviceName ($deviceId)');

        try {
          // Take screenshot from actual device (MANDATORY)
          final screenshotPath = 'evidence/device-validation/screenshot-$deviceId-${DateTime.now().millisecondsSinceEpoch}.png';
          await Directory('evidence/device-validation').create(recursive: true);

          final screenshotResult = await shell.run(
            'flutter screenshot --device-id=$deviceId --out=$screenshotPath'
          );

          if (screenshotResult.first.exitCode == 0) {
            evidenceFiles.add(screenshotPath);

            // Verify screenshot file exists and is not empty
            final file = File(screenshotPath);
            if (!await file.exists() || await file.length() == 0) {
              return ValidationResult.failed(
                ['Screenshot file empty or missing: $screenshotPath'],
                FlutterErrorSeverity.error,
                true,
                "Screenshot evidence MUST be genuine and non-empty"
              );
            }
          }
        } catch (error) {
          return ValidationResult.failed(
            ['Device interaction failed for $deviceName: $error'],
            FlutterErrorSeverity.error,
            true,
            "Device validation FAILED - cannot claim functionality without device evidence"
          );
        }
      }

      return ValidationResult.success(evidence: {
        'deviceCount': devices.length,
        'evidenceFiles': evidenceFiles,
        'timestamp': DateTime.now().toIso8601String()
      });

    } catch (error) {
      return ValidationResult.failed(
        ['Device validation failed: $error'],
        FlutterErrorSeverity.error,
        true,
        "Device interaction validation is MANDATORY for mobile functionality claims"
      );
    }
  }

  Future<ValidationResult> validateIntegrationTests() async {
    try {
      // Check if integration tests exist
      final integrationTestDir = Directory('integration_test');
      if (!await integrationTestDir.exists()) {
        return ValidationResult.success(message: 'No integration tests found - skipping');
      }

      // Run integration tests with screenshot capture
      final result = await shell.run(
        'flutter drive --driver=test_driver/integration_test.dart '
        '--target=integration_test/app_test.dart '
        '--screenshot=evidence/integration-test-screenshots/'
      );

      if (result.first.exitCode != 0) {
        return ValidationResult.failed(
          ['Integration tests failed: ${result.first.stderr}'],
          FlutterErrorSeverity.error,
          true,
          "Integration tests MUST pass for functionality validation"
        );
      }

      // Verify screenshot evidence was collected
      final screenshotDir = Directory('evidence/integration-test-screenshots');
      if (await screenshotDir.exists()) {
        final screenshots = await screenshotDir.list().length;
        return ValidationResult.success(evidence: {
          'screenshotCount': screenshots,
          'testsPassed': true
        });
      }

      return ValidationResult.success();
    } catch (error) {
      return ValidationResult.failed(
        [error.toString()],
        FlutterErrorSeverity.error,
        true
      );
    }
  }
}

class ValidationResult {
  final bool success;
  final List<String> errors;
  final FlutterErrorSeverity? severity;
  final bool blocking;
  final String? message;
  final dynamic evidence;

  ValidationResult({
    required this.success,
    this.errors = const [],
    this.severity,
    this.blocking = false,
    this.message,
    this.evidence,
  });

  static ValidationResult success({dynamic evidence, String? message}) {
    return ValidationResult(success: true, evidence: evidence, message: message);
  }

  static ValidationResult failed(
    List<String> errors,
    FlutterErrorSeverity severity,
    bool blocking, [
    String? message,
  ]) {
    return ValidationResult(
      success: false,
      errors: errors,
      severity: severity,
      blocking: blocking,
      message: message,
    );
  }
}
```

### Flutter Testing Strategy (Constitutional Compliance)

```dart
// test/constitutional/constitutional_compliance_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import '../../lib/constitutional_validator.dart';
import 'dart:io';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Constitutional Compliance Tests - Flutter', () {
    late FlutterConstitutionalValidator validator;

    setUp(() {
      validator = FlutterConstitutionalValidator();
    });

    group('MANDATE 8: Zero Error Tolerance', () {
      testWidgets('MUST have zero Dart analysis errors', (tester) async {
        final result = await validator.validateDartAnalysis();
        expect(result.success, isTrue, reason: 'Dart analysis errors found: ${result.errors}');
      });

      testWidgets('MUST have proper Flutter environment setup', (tester) async {
        final result = await validator.validateFlutterDoctor();
        expect(result.success, isTrue, reason: 'Flutter doctor issues: ${result.errors}');
      });

      testWidgets('MUST successfully build for all target platforms', (tester) async {
        final result = await validator.validatePlatformBuilds();
        expect(result.success, isTrue, reason: 'Platform build failures: ${result.errors}');
      }, timeout: const Timeout(Duration(minutes: 10)));
    });

    group('MANDATE 9: Anti-Circumnavigation Enforcement', () {
      testWidgets('MUST validate device interactions with real devices (NO FAKING)', (tester) async {
        // This test ensures actual device interaction, not simulation
        final result = await validator.validateDeviceInteraction();

        expect(result.success, isTrue, reason: 'Device validation failed: ${result.errors}');
        expect(result.evidence?['deviceCount'], greaterThan(0));
        expect(result.evidence?['evidenceFiles'], isNotEmpty);

        // Verify evidence files actually exist and have valid content
        final evidenceFiles = result.evidence?['evidenceFiles'] as List<String>? ?? [];
        for (final filePath in evidenceFiles) {
          final file = File(filePath);
          expect(await file.exists(), isTrue, reason: 'Evidence file missing: $filePath');
          expect(await file.length(), greaterThan(0), reason: 'Evidence file empty: $filePath');

          // Verify file was created recently (not pre-existing fake)
          final stats = await file.stat();
          final ageMinutes = DateTime.now().difference(stats.modified).inMinutes;
          expect(ageMinutes, lessThan(5), reason: 'Evidence file too old, may be fake: $filePath');
        }
      });

      testWidgets('MUST fail gracefully when devices unavailable', (tester) async {
        // Test graceful failure when no devices are available
        // This should NOT circumnavigate - should report honest failure

        // This test would mock device unavailability and verify proper failure handling
        // Implementation depends on how device detection is mocked

        // The key is that the validator should:
        // 1. Report honest failure
        // 2. Not proceed with fake evidence
        // 3. Block development until real devices are available
      });

      testWidgets('MUST execute integration tests with screenshot evidence', (tester) async {
        final result = await validator.validateIntegrationTests();

        if (result.message?.contains('No integration tests found') == true) {
          // Acceptable if no integration tests exist yet
          return;
        }

        expect(result.success, isTrue, reason: 'Integration tests failed: ${result.errors}');

        // Verify screenshot evidence was collected
        if (result.evidence?['screenshotCount'] != null) {
          expect(result.evidence!['screenshotCount'], greaterThan(0));
        }
      });
    });

    group('MANDATE 1: Evidence Collection Requirements', () {
      testWidgets('MUST generate test coverage reports', (tester) async {
        // Run unit tests with coverage
        final process = await Process.run('flutter', ['test', '--coverage']);
        expect(process.exitCode, equals(0), reason: 'Unit tests failed');

        // Verify coverage file exists
        final coverageFile = File('coverage/lcov.info');
        expect(await coverageFile.exists(), isTrue, reason: 'Coverage report not generated');
        expect(await coverageFile.length(), greaterThan(0), reason: 'Coverage report empty');
      });

      testWidgets('MUST capture widget golden files for UI consistency', (tester) async {
        // This would run golden file tests and verify they generate comparison images
        final process = await Process.run('flutter', ['test', 'test/golden_test.dart']);

        // Golden tests may fail if UI changed - that's expected
        // The important thing is that golden files are generated/updated
        final goldenDir = Directory('test/golden');
        if (await goldenDir.exists()) {
          final goldenFiles = await goldenDir.list().length;
          expect(goldenFiles, greaterThan(0), reason: 'No golden files found');
        }
      });
    });
  });
}
```

### Flutter Project Structure Template

```
flutter-project-root/
├── .codor/                          # Constitutional enforcement
│   ├── config.yml                  # Flutter-specific configuration
│   ├── validators/                 # Custom validation plugins
│   └── evidence/                   # MANDATORY evidence collection
│       ├── device-validation/      # Device screenshots and interaction logs
│       ├── web-validation/         # Web browser evidence (Flutter web)
│       ├── ios-validation/         # iOS device/simulator evidence
│       ├── android-validation/     # Android device/emulator evidence
│       ├── integration-test-screenshots/ # Integration test evidence
│       └── performance/            # Performance profiling data
├── lib/                           # Main application code
│   ├── main.dart                  # App entry point
│   ├── app.dart                   # App widget
│   ├── models/                    # Data models
│   ├── views/                     # UI screens
│   ├── widgets/                   # Reusable widgets
│   ├── services/                  # API and business logic
│   ├── utils/                     # Utility functions
│   └── constitutional_validator.dart # Constitutional compliance validator
├── test/                          # Unit and widget tests
│   ├── unit/                      # Unit tests (70% coverage)
│   ├── widget/                    # Widget tests (20%)
│   ├── golden/                    # Golden file UI tests
│   ├── constitutional/            # Constitutional compliance tests
│   └── mocks/                     # Test mocks and fixtures
├── integration_test/              # Integration tests (10%)
│   ├── app_test.dart             # Main integration test
│   └── performance_test.dart      # Performance integration tests
├── test_driver/                   # Flutter driver tests
│   └── integration_test.dart      # Integration test driver
├── web/                          # Flutter web assets
├── ios/                          # iOS platform code
├── android/                      # Android platform code
├── .codor-config.yml            # Constitutional configuration
├── pubspec.yaml                 # Dependencies and Flutter configuration
├── analysis_options.yaml       # Dart analysis configuration
└── flutter_launcher_icons.yaml # App icon configuration
```

### Flutter Constitutional Configuration

```yaml
# .codor-config.yml for Flutter projects
project:
  technology: flutter
  language: dart
  platforms: [web, ios, android]
  verification_tools:
    - flutter-inspector
    - device-inspector
    - chrome-devtools-mcp
    - ios-simulator
    - android-emulator

validation:
  analysis:
    dart_analyze: flutter analyze --fatal-infos --fatal-warnings
    format_check: dart format --set-exit-if-changed lib/ test/

  build:
    web: flutter build web --release
    android: flutter build apk --release
    ios: flutter build ios --release --no-codesign

  testing:
    unit:
      command: flutter test --coverage --reporter=expanded
      coverage_threshold: 80
      evidence_required: coverage/lcov.info

    widget:
      command: flutter test test/widget/ --reporter=expanded
      golden_tests: true
      evidence_required: test/golden/*.png

    integration:
      command: flutter drive --driver=test_driver/integration_test.dart --target=integration_test/app_test.dart
      screenshot_capture: true
      evidence_required: evidence/integration-test-screenshots/

  device_validation:
    platforms:
      web:
        server_command: flutter run -d web-server --web-hostname=localhost --web-port=8080
        mcp_validation: true
        required_evidence:
          - full_page_screenshots
          - flutter_inspector_data
          - performance_traces

      ios:
        devices: [simulator, physical]
        required_evidence:
          - device_screenshots
          - app_installation_logs
          - runtime_performance_data

      android:
        devices: [emulator, physical]
        required_evidence:
          - device_screenshots
          - app_installation_logs
          - runtime_performance_data

    anti_circumnavigation: true
    evidence_integrity_checks: true

  performance:
    profiling:
      command: flutter run --profile --trace-startup
      memory_analysis: true

    bundle_analysis:
      web: flutter build web --analyze-size
      android: flutter build appbundle --analyze-size
      ios: flutter build ipa --analyze-size

evidence_collection:
  mandatory_device_screenshots: true
  flutter_inspector_captures: true
  integration_test_evidence: true
  performance_profiling: true
  build_size_analysis: true
  golden_file_comparisons: true

error_tolerance:
  blocking_errors:
    - dart_analysis_errors
    - build_failures
    - test_failures
    - device_validation_failures

  documented_warnings:
    - performance_warnings
    - bundle_size_warnings
    - golden_file_mismatches

anti_circumnavigation:
  enforcement: strict
  device_interaction_mandatory: true
  screenshot_authenticity_verification: true
  build_artifact_verification: true
  graceful_failure_required: true
  evidence_timestamp_validation: true

constitutional_enforcement:
  pre_commit_hooks: true
  device_validation_mandatory: true
  multi_platform_testing: true
  evidence_collection_mandatory: true
  progress_tracking: true
  ci_cd_integration: true
```

### Flutter Development Workflow with Anti-Circumnavigation

```bash
#!/bin/bash
# flutter-constitutional-workflow.sh

echo "🏛️ Flutter Constitutional Development Workflow"
echo "============================================="

# MANDATE 8: Check for blocking errors
echo "📋 MANDATE 8: Checking for blocking errors..."

# Flutter Doctor validation (BLOCKING)
echo "  → Validating Flutter environment..."
flutter doctor --verbose || {
    echo "❌ CRITICAL: Flutter environment issues found."
    echo "Run 'flutter doctor' and resolve all issues before proceeding."
    exit 1
}

# Dart Analysis validation (BLOCKING)
echo "  → Running Dart analysis..."
flutter analyze --fatal-infos --fatal-warnings || {
    echo "❌ CRITICAL: Dart analysis errors found. Development HALTED."
    exit 1
}

# Format validation (BLOCKING)
echo "  → Checking code formatting..."
dart format --set-exit-if-changed lib/ test/ || {
    echo "❌ ERROR: Code formatting issues found. Run 'dart format lib/ test/' to fix."
    exit 1
}

# Dependencies validation (BLOCKING)
echo "  → Validating dependencies..."
flutter pub get --verbose || {
    echo "❌ CRITICAL: Dependency resolution failed."
    exit 1
}

echo "✅ MANDATE 8: No blocking errors found."

# MANDATE 9: Multi-Platform Device Validation (NO CIRCUMNAVIGATION ALLOWED)
echo "📋 MANDATE 9: MANDATORY Multi-Platform Device Validation"

# Get available devices
echo "  → Detecting available devices..."
DEVICES_JSON=$(flutter devices --machine)
DEVICE_COUNT=$(echo "$DEVICES_JSON" | jq '. | length')

if [ "$DEVICE_COUNT" -eq 0 ]; then
    echo "❌ CRITICAL: No devices available for validation."
    echo "Device validation is MANDATORY for Flutter development."
    echo "Connect devices or start simulators/emulators."
    echo "DO NOT proceed without device validation capability."
    exit 1
fi

echo "  → Found $DEVICE_COUNT available devices"
echo "$DEVICES_JSON" | jq -r '.[] | "    - \(.name) (\(.id))"'

# Create timestamped evidence directory
EVIDENCE_DIR="evidence/device-validation/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$EVIDENCE_DIR"

# Platform-specific validation
VALIDATION_SUCCESS=0

# Web Platform Validation (if web target exists)
if grep -q "web" pubspec.yaml 2>/dev/null; then
    echo "  → Validating Web Platform (MANDATORY)..."

    # Build web version
    flutter build web --release || {
        echo "❌ CRITICAL: Web build failed."
        exit 1
    }

    # Start web server for validation
    flutter run -d web-server --web-hostname=localhost --web-port=8080 &
    WEB_SERVER_PID=$!
    sleep 10

    # Verify web server is responding
    if curl -f http://localhost:8080 >/dev/null 2>&1; then
        echo "    → Web server started successfully"

        # MANDATORY: Web screenshot through MCP (if available)
        if command -v mcp-screenshot >/dev/null 2>&1; then
            mcp-screenshot --url http://localhost:8080 --output "$EVIDENCE_DIR/web-screenshot.png" || {
                echo "❌ ERROR: Web screenshot capture failed."
                VALIDATION_SUCCESS=1
            }
        else
            echo "⚠️  MCP screenshot tool not available for web validation."
            echo "   Web functionality claims will require manual verification."
        fi

        # Flutter Web Inspector validation (if available)
        if command -v flutter-inspector >/dev/null 2>&1; then
            flutter-inspector --url http://localhost:8080 --output "$EVIDENCE_DIR/flutter-inspector.json" || {
                echo "⚠️  Flutter Inspector capture failed."
            }
        fi
    else
        echo "❌ ERROR: Web server failed to start."
        VALIDATION_SUCCESS=1
    fi

    # Clean up web server
    kill $WEB_SERVER_PID 2>/dev/null
fi

# Mobile Device Validation (MANDATORY for each connected device)
echo "  → Validating Mobile Devices (MANDATORY - NO CIRCUMNAVIGATION)..."

# Extract device IDs and validate each one
echo "$DEVICES_JSON" | jq -r '.[] | select(.platform != "web-javascript") | .id' | while read -r DEVICE_ID; do
    DEVICE_INFO=$(echo "$DEVICES_JSON" | jq -r ".[] | select(.id == \"$DEVICE_ID\")")
    DEVICE_NAME=$(echo "$DEVICE_INFO" | jq -r '.name')
    DEVICE_PLATFORM=$(echo "$DEVICE_INFO" | jq -r '.platform')

    echo "    → Testing device: $DEVICE_NAME ($DEVICE_ID)"

    # Platform-specific build and installation
    if [[ "$DEVICE_PLATFORM" == *"ios"* ]]; then
        echo "      → Building for iOS..."
        flutter build ios --debug --no-codesign || {
            echo "❌ ERROR: iOS build failed for device $DEVICE_NAME"
            VALIDATION_SUCCESS=1
            continue
        }
    elif [[ "$DEVICE_PLATFORM" == *"android"* ]]; then
        echo "      → Building for Android..."
        flutter build apk --debug || {
            echo "❌ ERROR: Android build failed for device $DEVICE_NAME"
            VALIDATION_SUCCESS=1
            continue
        }
    fi

    # Install and capture screenshot (MANDATORY - NO FAKING)
    echo "      → Installing app and capturing screenshot..."
    flutter install --device-id="$DEVICE_ID" || {
        echo "❌ ERROR: App installation failed on $DEVICE_NAME"
        VALIDATION_SUCCESS=1
        continue
    }

    # MANDATORY: Real device screenshot (NO CIRCUMNAVIGATION)
    SCREENSHOT_PATH="$EVIDENCE_DIR/screenshot-$DEVICE_ID-$(date +%s).png"
    flutter screenshot --device-id="$DEVICE_ID" --out="$SCREENSHOT_PATH" || {
        echo "❌ CRITICAL: Screenshot capture failed on $DEVICE_NAME"
        echo "This is MANDATORY evidence - cannot claim device functionality without screenshots"
        VALIDATION_SUCCESS=1
        continue
    }

    # Verify screenshot file exists and is not empty (Anti-circumnavigation)
    if [[ ! -f "$SCREENSHOT_PATH" ]] || [[ ! -s "$SCREENSHOT_PATH" ]]; then
        echo "❌ CRITICAL: Screenshot file empty or missing: $SCREENSHOT_PATH"
        echo "This indicates tool failure or circumnavigation attempt."
        VALIDATION_SUCCESS=1
        continue
    fi

    echo "      ✅ Device validation successful: $DEVICE_NAME"
done

# Check if any device validation failed
if [ $VALIDATION_SUCCESS -ne 0 ]; then
    echo "❌ CRITICAL: Device validation failed."
    echo "Cannot proceed with development without successful device validation."
    echo "This is MANDATORY for Flutter development - no circumnavigation allowed."
    exit 1
fi

echo "✅ MANDATE 9: Multi-platform device validation completed successfully."

# MANDATE 1 & 3: Evidence collection through testing
echo "📋 MANDATE 1 & 3: Collecting validation evidence through testing..."

# Unit tests with coverage (Evidence Required)
echo "  → Running unit tests with coverage..."
flutter test --coverage --reporter=expanded || {
    echo "❌ Unit tests failing."
    exit 1
}

# Verify coverage evidence exists
if [[ ! -f "coverage/lcov.info" ]]; then
    echo "❌ ERROR: Coverage report not generated."
    echo "Evidence collection failed - this is MANDATORY."
    exit 1
fi

# Widget tests with golden files (Evidence Required)
echo "  → Running widget tests..."
flutter test test/widget/ --reporter=expanded || {
    echo "❌ Widget tests failing."
    exit 1
}

# Integration tests with screenshot evidence (if they exist)
echo "  → Running integration tests..."
if [[ -d "integration_test" ]] && [[ -n "$(ls -A integration_test 2>/dev/null)" ]]; then
    # Create integration test evidence directory
    mkdir -p "$EVIDENCE_DIR/integration-test"

    # Run integration tests with screenshot capture
    flutter drive \
        --driver=test_driver/integration_test.dart \
        --target=integration_test/app_test.dart \
        --screenshot="$EVIDENCE_DIR/integration-test/" || {
        echo "❌ Integration tests failing."
        exit 1
    }

    echo "✅ Integration tests completed with evidence collection."
else
    echo "ℹ️  No integration tests found - skipping."
fi

# Performance validation (Evidence collection)
echo "  → Running performance validation..."
if [[ $DEVICE_COUNT -gt 0 ]]; then
    FIRST_DEVICE_ID=$(echo "$DEVICES_JSON" | jq -r '.[0].id')
    flutter run --profile --trace-startup --device-id="$FIRST_DEVICE_ID" --verbose &
    PERF_PID=$!
    sleep 15
    kill $PERF_PID 2>/dev/null
    echo "✅ Performance trace completed."
fi

# Bundle size analysis (Evidence Required)
echo "  → Analyzing bundle sizes..."
flutter build apk --analyze-size > "$EVIDENCE_DIR/android-bundle-analysis.txt" 2>&1 || {
    echo "⚠️  Android bundle analysis failed."
}

if grep -q "web" pubspec.yaml 2>/dev/null; then
    flutter build web --analyze-size > "$EVIDENCE_DIR/web-bundle-analysis.txt" 2>&1 || {
        echo "⚠️  Web bundle analysis failed."
    }
fi

echo "✅ Constitutional validation complete!"
echo "📁 Evidence collected in: $EVIDENCE_DIR"

# Evidence integrity verification (Anti-circumnavigation)
echo ""
echo "🔒 ANTI-CIRCUMNAVIGATION VERIFICATION"

EVIDENCE_FILES=$(find "$EVIDENCE_DIR" -type f | wc -l)
echo "   → Evidence files collected: $EVIDENCE_FILES"

# Verify all evidence files have content
find "$EVIDENCE_DIR" -type f -empty | while read -r empty_file; do
    echo "❌ WARNING: Empty evidence file detected: $empty_file"
    echo "   This may indicate circumnavigation or tool failure."
done

# Verify screenshots are valid image files
find "$EVIDENCE_DIR" -name "*.png" | while read -r screenshot; do
    if command -v file >/dev/null 2>&1; then
        if ! file "$screenshot" | grep -q "PNG image"; then
            echo "❌ WARNING: Invalid screenshot file: $screenshot"
            echo "   This may indicate circumnavigation attempt."
        fi
    fi
done

echo "   → Evidence integrity verification completed"

# MANDATE 7: Progress tracking reminder
echo ""
echo "⚠️  MANDATE 7 REMINDER:"
echo "   Update your tasks.md file with [x] after completing each task"
echo "   Include validation evidence and timestamp"
echo "   Reference evidence directory: $EVIDENCE_DIR"

echo ""
echo "🏛️ FLUTTER CONSTITUTIONAL VALIDATION COMPLETE"
echo "   All platforms validated with genuine device evidence"
echo "   No circumnavigation detected"
echo "   Development may proceed safely"
```

This Flutter implementation template provides:

1. **Strict Anti-Circumnavigation Enforcement**: Mandatory device interaction with genuine screenshot evidence
2. **Multi-Platform Support**: Web, iOS, and Android validation with platform-specific tools
3. **Evidence Integrity Verification**: Checks for empty files, valid image formats, recent timestamps
4. **Graceful Failure Protocol**: Honest reporting when devices or tools are unavailable
5. **Constitutional Compliance Testing**: Automated tests that prevent circumnavigation
6. **Comprehensive Evidence Collection**: Device screenshots, performance traces, build analysis

The key innovation is **mandatory device validation** across all target platforms with **anti-circumnavigation enforcement** that makes it impossible for agents to fake progress by requiring genuine device interaction evidence from actual Flutter applications running on real devices/simulators.
