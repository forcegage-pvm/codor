# Python Development Constitution Implementation

_Constitutional Guardrails for Python Projects_

## Technology Stack Integration

**Base Language**: Python 3.8+  
**Package Manager**: pip, poetry, or conda  
**Testing Frameworks**: pytest, unittest, hypothesis  
**Linting/Quality**: flake8, pylint, black, mypy  
**Build Tools**: setuptools, poetry, pip-tools

## Constitutional Validation Commands

### MANDATE 8: Zero Error Tolerance - Python Implementation

```bash
# Compilation/Syntax Check
python -m py_compile **/*.py
python -c "import ast; [ast.parse(open(f).read()) for f in glob.glob('**/*.py', recursive=True)]"

# Type Checking (if using mypy)
mypy . --strict

# Linting - ERRORS must be fixed immediately
flake8 . --select=E --statistics
pylint . --errors-only

# Import validation
python -c "import sys; sys.path.insert(0, '.'); [__import__(m) for m in ['mymodule1', 'mymodule2']]"
```

### MANDATE 1: Evidence-First Progress - Python Implementation

```bash
# Unit Testing with Coverage
pytest --cov=src --cov-report=html --cov-report=term
coverage report --fail-under=80

# Integration Testing
pytest tests/integration/ -v --tb=short

# End-to-End Testing (API example)
python -m pytest tests/e2e/ --capture=no

# Performance Testing
python -m pytest tests/performance/ --benchmark-only
```

### MANDATE 3: Validation-Driven Development - Python Implementation

```bash
# Environment Validation
python --version
pip check  # Verify no dependency conflicts
python -c "import pkg_resources; pkg_resources.require('requirements.txt')"

# Security Scanning
safety check
bandit -r src/

# Code Quality Gates
black --check .
isort --check-only .
```

## Python-Specific Constitutional Requirements

### Error Classification for Python

```python
# constitutional_validator.py
from enum import Enum
from typing import List, Dict, Any
import subprocess
import ast
import sys

class PythonErrorSeverity(Enum):
    CRITICAL = "critical"    # SyntaxError, ImportError, ModuleNotFoundError
    ERROR = "error"          # Flake8 E-codes, Pylint errors, type errors
    WARNING = "warning"      # Flake8 W-codes, Pylint warnings
    INFO = "info"           # Code style suggestions

class PythonConstitutionalValidator:

    def validate_syntax(self) -> Dict[str, Any]:
        """Validate Python syntax - CRITICAL errors block all development"""
        try:
            result = subprocess.run(['python', '-m', 'py_compile'] + self.get_python_files(),
                                  capture_output=True, text=True)
            return {
                'success': result.returncode == 0,
                'errors': result.stderr.split('\n') if result.stderr else [],
                'severity': PythonErrorSeverity.CRITICAL if result.returncode != 0 else None
            }
        except Exception as e:
            return {'success': False, 'errors': [str(e)], 'severity': PythonErrorSeverity.CRITICAL}

    def validate_imports(self) -> Dict[str, Any]:
        """Validate all imports can be resolved"""
        errors = []
        for file_path in self.get_python_files():
            try:
                with open(file_path, 'r') as f:
                    tree = ast.parse(f.read())

                for node in ast.walk(tree):
                    if isinstance(node, (ast.Import, ast.ImportFrom)):
                        # Validate import resolution
                        pass
            except SyntaxError as e:
                errors.append(f"{file_path}:{e.lineno}: {e.msg}")

        return {
            'success': len(errors) == 0,
            'errors': errors,
            'severity': PythonErrorSeverity.ERROR if errors else None
        }

    def validate_linting_errors(self) -> Dict[str, Any]:
        """Check for linting ERRORS (not warnings)"""
        result = subprocess.run(['flake8', '.', '--select=E'],
                              capture_output=True, text=True)

        errors = result.stdout.strip().split('\n') if result.stdout.strip() else []

        return {
            'success': len(errors) == 0,
            'errors': errors,
            'severity': PythonErrorSeverity.ERROR if errors else None,
            'blocking': True  # Linting ERRORS block development
        }

    def validate_type_checking(self) -> Dict[str, Any]:
        """Run mypy type checking if configured"""
        if not self.has_mypy_config():
            return {'success': True, 'skipped': 'No mypy configuration found'}

        result = subprocess.run(['mypy', '.'], capture_output=True, text=True)

        errors = []
        if result.stdout:
            for line in result.stdout.split('\n'):
                if 'error:' in line:
                    errors.append(line.strip())

        return {
            'success': len(errors) == 0,
            'errors': errors,
            'severity': PythonErrorSeverity.ERROR if errors else None
        }
```

### Python Testing Strategy (Constitutional Compliance)

```python
# test_constitutional_compliance.py
import pytest
from constitutional_validator import PythonConstitutionalValidator

class TestConstitutionalCompliance:
    """Tests that enforce constitutional mandates for Python development"""

    def setup_method(self):
        self.validator = PythonConstitutionalValidator()

    def test_mandate_8_zero_syntax_errors(self):
        """MANDATE 8: Zero tolerance for syntax errors"""
        result = self.validator.validate_syntax()
        assert result['success'], f"Syntax errors found: {result['errors']}"

    def test_mandate_8_zero_import_errors(self):
        """MANDATE 8: All imports must resolve"""
        result = self.validator.validate_imports()
        assert result['success'], f"Import errors found: {result['errors']}"

    def test_mandate_8_zero_linting_errors(self):
        """MANDATE 8: Zero tolerance for linting ERRORS"""
        result = self.validator.validate_linting_errors()
        assert result['success'], f"Linting errors found: {result['errors']}"

    def test_mandate_1_test_coverage(self):
        """MANDATE 1: Evidence-first requires adequate test coverage"""
        result = subprocess.run(['coverage', 'report', '--fail-under=80'],
                              capture_output=True)
        assert result.returncode == 0, "Test coverage below 80% threshold"

    @pytest.mark.integration
    def test_mandate_3_integration_validation(self):
        """MANDATE 3: Integration points must be tested"""
        # Run integration tests
        result = subprocess.run(['pytest', 'tests/integration/', '-v'],
                              capture_output=True)
        assert result.returncode == 0, "Integration tests failing"
```

### Python Project Structure Template

```
project-root/
├── .codor/                          # Constitutional enforcement
│   ├── config.yml                  # Python-specific configuration
│   ├── validators/                 # Custom validation plugins
│   └── evidence/                   # Validation evidence collection
├── src/
│   ├── __init__.py
│   ├── main/                       # Main application code
│   ├── utils/                      # Utility functions
│   └── tests/                      # Package-level tests
├── tests/
│   ├── unit/                       # Unit tests (70% of test suite)
│   ├── integration/                # Integration tests (20%)
│   ├── e2e/                        # End-to-end tests (10%)
│   ├── performance/                # Performance benchmarks
│   └── constitutional/             # Constitutional compliance tests
├── requirements/
│   ├── base.txt                    # Core dependencies
│   ├── dev.txt                     # Development dependencies
│   └── test.txt                    # Testing dependencies
├── .codor-config.yml               # Constitutional configuration
├── pyproject.toml                  # Python project configuration
├── pytest.ini                     # Test configuration
├── .flake8                         # Linting configuration
└── mypy.ini                        # Type checking configuration
```

### Python Constitutional Configuration

```yaml
# .codor-config.yml for Python projects
project:
  technology: python
  language: python
  framework: null # or flask, django, fastapi, etc.

validation:
  build:
    commands:
      - python -m py_compile src/**/*.py
      - python -c "import sys; sys.path.insert(0, 'src'); __import__('main')"

  testing:
    unit:
      command: pytest tests/unit/ --cov=src --cov-report=term
      coverage_threshold: 80

    integration:
      command: pytest tests/integration/ -v

    e2e:
      command: pytest tests/e2e/ --tb=short

  linting:
    errors_only: flake8 . --select=E,F --statistics
    warnings: flake8 . --select=W --statistics
    style: black --check .
    imports: isort --check-only .

  type_checking:
    command: mypy src/
    strict: true

  security:
    dependencies: safety check
    code: bandit -r src/

evidence_collection:
  test_reports: true
  coverage_reports: true
  linting_reports: true
  security_scans: true
  performance_benchmarks: true

error_tolerance:
  blocking_errors:
    - syntax_errors
    - import_errors
    - linting_errors
    - critical_security_issues

  documented_warnings:
    - linting_warnings
    - minor_security_issues
    - performance_warnings

constitutional_enforcement:
  pre_commit_hooks: true
  continuous_validation: true
  evidence_collection: true
  progress_tracking: true
```

### Python Development Workflow

```bash
#!/bin/bash
# python-constitutional-workflow.sh

echo "🏛️ Python Constitutional Development Workflow"
echo "============================================="

# MANDATE 8: Check for blocking errors
echo "📋 MANDATE 8: Checking for blocking errors..."

# Syntax validation
echo "  → Validating syntax..."
python -m py_compile src/**/*.py || {
    echo "❌ CRITICAL: Syntax errors found. Development HALTED."
    exit 1
}

# Import validation
echo "  → Validating imports..."
python -c "
import sys, os, glob
sys.path.insert(0, 'src')
for f in glob.glob('src/**/*.py', recursive=True):
    if '__pycache__' not in f:
        try:
            with open(f) as file:
                compile(file.read(), f, 'exec')
        except SyntaxError as e:
            print(f'❌ CRITICAL: Import/syntax error in {f}: {e}')
            sys.exit(1)
" || exit 1

# Linting errors (blocking)
echo "  → Checking linting errors..."
flake8 . --select=E,F --statistics || {
    echo "❌ ERROR: Linting errors found. Fix before proceeding."
    exit 1
}

# Type checking (if configured)
if [ -f "mypy.ini" ] || grep -q "mypy" pyproject.toml 2>/dev/null; then
    echo "  → Running type checking..."
    mypy src/ || {
        echo "❌ ERROR: Type checking failed. Fix before proceeding."
        exit 1
    }
fi

echo "✅ MANDATE 8: No blocking errors found."

# MANDATE 1 & 3: Evidence collection
echo "📋 MANDATE 1 & 3: Collecting validation evidence..."

# Run tests with coverage
echo "  → Running unit tests with coverage..."
pytest tests/unit/ --cov=src --cov-report=html --cov-report=term || {
    echo "❌ Unit tests failing."
    exit 1
}

# Integration tests
echo "  → Running integration tests..."
pytest tests/integration/ -v || {
    echo "❌ Integration tests failing."
    exit 1
}

# Security scanning
echo "  → Running security scans..."
safety check
bandit -r src/ -f json -o evidence/security-report.json

# Performance benchmarks (if exists)
if [ -d "tests/performance" ]; then
    echo "  → Running performance benchmarks..."
    pytest tests/performance/ --benchmark-json=evidence/performance.json
fi

echo "✅ Constitutional validation complete!"
echo "📁 Evidence collected in ./evidence/ directory"

# MANDATE 7: Progress tracking reminder
echo ""
echo "⚠️  MANDATE 7 REMINDER:"
echo "   Update your tasks.md file with [x] after completing each task"
echo "   Include validation evidence and timestamp"
```

### Python Package Management (Constitutional)

```python
# constitutional_deps.py
"""
Constitutional dependency management for Python projects
Ensures dependencies are validated and don't introduce errors
"""

import subprocess
import json
import pkg_resources
from typing import List, Dict, Any

class ConstitutionalDependencyManager:

    def validate_dependencies(self) -> Dict[str, Any]:
        """Validate all dependencies are properly installed and compatible"""
        try:
            # Check for dependency conflicts
            result = subprocess.run(['pip', 'check'], capture_output=True, text=True)

            if result.returncode != 0:
                return {
                    'success': False,
                    'errors': result.stdout.split('\n'),
                    'severity': 'ERROR',
                    'blocking': True
                }

            # Verify requirements are met
            with open('requirements.txt') as f:
                requirements = f.read().strip().split('\n')

            missing = []
            for req in requirements:
                if req.strip() and not req.startswith('#'):
                    try:
                        pkg_resources.require(req.strip())
                    except pkg_resources.DistributionNotFound:
                        missing.append(req.strip())
                    except pkg_resources.VersionConflict as e:
                        missing.append(str(e))

            return {
                'success': len(missing) == 0,
                'errors': missing,
                'severity': 'ERROR' if missing else None,
                'blocking': len(missing) > 0
            }

        except Exception as e:
            return {
                'success': False,
                'errors': [str(e)],
                'severity': 'CRITICAL',
                'blocking': True
            }

    def security_check_dependencies(self) -> Dict[str, Any]:
        """Check dependencies for known security vulnerabilities"""
        try:
            result = subprocess.run(['safety', 'check', '--json'],
                                  capture_output=True, text=True)

            if result.returncode != 0:
                vulnerabilities = json.loads(result.stdout) if result.stdout else []
                return {
                    'success': False,
                    'vulnerabilities': vulnerabilities,
                    'severity': 'ERROR',
                    'blocking': True,
                    'message': 'Security vulnerabilities found in dependencies'
                }

            return {'success': True, 'vulnerabilities': []}

        except Exception as e:
            return {
                'success': False,
                'errors': [str(e)],
                'severity': 'WARNING'  # Don't block on tool failure
            }
```

This Python implementation template provides:

1. **Technology-Specific Validation**: Python syntax, imports, linting, type checking
2. **Constitutional Compliance**: Built-in tests for all 8 mandates
3. **Error Classification**: Python-specific error categories and severity levels
4. **Evidence Collection**: Test reports, coverage, security scans, performance data
5. **Automated Workflow**: Bash script for constitutional validation process
6. **Dependency Management**: Constitutional approach to dependency validation and security

The template maintains the rigorous standards of the original constitution while being specifically tailored for Python development workflows.
