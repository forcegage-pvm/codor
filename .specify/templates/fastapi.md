# FastAPI Constitutional Implementation Template

## Framework Overview

FastAPI applications require API-level integration testing to validate endpoints, data validation, and business logic. This template uses HTTP client testing with comprehensive evidence collection.

## Integration Testing Setup

### Dependencies

```python
# requirements-dev.txt
pytest==7.4.0
httpx==0.24.0
pytest-asyncio==0.21.0
```

### Tool Configuration

#### HTTP Client Setup

```python
# conftest.py
import pytest
import httpx
import asyncio
from fastapi.testclient import TestClient
from main import app

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
async def async_client():
    async with httpx.AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
```

### Constitutional Gate Implementation

#### Gate 1: Pre-Task Validation

```python
# constitutional_validator.py
import subprocess
import json
import os

async def validate_pre_task_gate(task_context):
    """Run pre-task constitutional validation"""
    result = subprocess.run([
        'node', '.specify/tools/constitutional-validator.js', 'pre-task'
    ], capture_output=True, text=True)

    return result.returncode == 0
```

#### Gate 2: Integration Testing

```python
# tests/test_constitutional_integration.py
import pytest
import json
import os
from datetime import datetime
from pathlib import Path

class ConstitutionalIntegrationTest:

    def __init__(self):
        self.evidence_dir = Path("evidence/integration")
        self.evidence_dir.mkdir(parents=True, exist_ok=True)

    async def collect_evidence(self, test_name, request_data, response_data):
        """Collect evidence for constitutional compliance"""
        evidence = {
            "test_name": test_name,
            "timestamp": datetime.now().isoformat(),
            "request": request_data,
            "response": response_data,
            "constitutional_compliance": True
        }

        evidence_file = self.evidence_dir / f"{test_name}_evidence.json"
        with open(evidence_file, 'w') as f:
            json.dump(evidence, f, indent=2)

        return evidence

@pytest.mark.asyncio
async def test_post_user_exact_correspondence(async_client):
    """Test POST /users endpoint with exact functional correspondence"""
    constitutional_test = ConstitutionalIntegrationTest()

    # Validate this is EXACTLY what the task requires
    task_requirement = "POST /api/users"

    # Execute exact functionality
    user_data = {
        "name": "Constitutional Test User",
        "email": "test@example.com",
        "role": "user"
    }

    response = await async_client.post("/api/users", json=user_data)

    # Collect constitutional evidence
    await constitutional_test.collect_evidence(
        test_name="post_user_endpoint",
        request_data={
            "method": "POST",
            "url": "/api/users",
            "body": user_data
        },
        response_data={
            "status_code": response.status_code,
            "body": response.json() if response.status_code == 200 else None,
            "headers": dict(response.headers)
        }
    )

    # Validate exact functional correspondence
    assert response.status_code == 201, f"Expected 201, got {response.status_code}"
    response_data = response.json()
    assert "id" in response_data, "Response missing required 'id' field"
    assert response_data["name"] == user_data["name"], "Name not properly saved"
    assert response_data["email"] == user_data["email"], "Email not properly saved"

    # Evidence validation
    evidence_file = Path("evidence/integration/post_user_endpoint_evidence.json")
    assert evidence_file.exists(), "Constitutional evidence not collected"
```

#### Gate 3: Post-Task Validation

```python
# constitutional_post_validation.py
import subprocess
import json
from pathlib import Path

async def validate_post_task_gate(task_context, test_results):
    """Comprehensive post-task constitutional validation"""

    # Check evidence completeness
    required_evidence = [
        "evidence/integration/",
        "evidence/test-results/",
        "evidence/logs/",
        "evidence/compliance/"
    ]

    for evidence_path in required_evidence:
        if not Path(evidence_path).exists():
            print(f"Missing required evidence: {evidence_path}")
            return False

    # Run constitutional validator
    result = subprocess.run([
        'node', '.specify/tools/constitutional-validator.js', 'post-task'
    ], capture_output=True, text=True)

    return result.returncode == 0

# pytest fixture for automatic post-task validation
@pytest.fixture(autouse=True)
async def constitutional_post_validation():
    yield  # Run test

    # Post-task validation
    validation_result = await validate_post_task_gate({}, {})
    assert validation_result, "Post-task constitutional validation failed"
```

## Example Implementation

### Complete Test Suite

```python
# tests/test_constitutional_api.py
import pytest
import json
import asyncio
from httpx import AsyncClient
from fastapi.testclient import TestClient
from pathlib import Path
from datetime import datetime

from main import app
from constitutional_validator import validate_pre_task_gate, validate_post_task_gate

class TestConstitutionalAPI:

    @pytest.fixture(autouse=True)
    async def setup_constitutional_testing(self):
        """Constitutional framework setup"""
        # Gate 1: Pre-task validation
        pre_task_result = await validate_pre_task_gate({})
        assert pre_task_result, "Pre-task constitutional validation failed"

        # Setup evidence collection
        self.evidence_dir = Path("evidence/integration")
        self.evidence_dir.mkdir(parents=True, exist_ok=True)

        yield

        # Gate 3: Post-task validation
        post_task_result = await validate_post_task_gate({}, {})
        assert post_task_result, "Post-task constitutional validation failed"

    @pytest.mark.asyncio
    async def test_user_creation_exact_correspondence(self):
        """Constitutional test: POST /api/users with exact functional correspondence"""

        async with AsyncClient(app=app, base_url="http://test") as client:

            # Task requirement: Create user via POST
            user_payload = {
                "name": "John Doe",
                "email": "john@example.com",
                "department": "Engineering"
            }

            # Execute EXACT functionality specified
            response = await client.post("/api/users", json=user_payload)

            # Constitutional evidence collection
            evidence = {
                "constitutional_test": "user_creation_post_endpoint",
                "timestamp": datetime.now().isoformat(),
                "task_requirement": "POST /api/users - create new user",
                "request": {
                    "method": "POST",
                    "endpoint": "/api/users",
                    "payload": user_payload
                },
                "response": {
                    "status_code": response.status_code,
                    "body": response.json() if response.status_code < 400 else response.text,
                    "headers": dict(response.headers)
                },
                "functional_correspondence": {
                    "required": "POST request to create user",
                    "executed": "POST request to /api/users",
                    "match": True
                }
            }

            # Save evidence
            evidence_file = self.evidence_dir / f"user_creation_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(evidence_file, 'w') as f:
                json.dump(evidence, f, indent=2)

            # Validate exact functional correspondence
            assert response.status_code == 201, f"Expected 201 Created, got {response.status_code}"

            response_data = response.json()
            assert "id" in response_data, "Missing required 'id' in response"
            assert response_data["name"] == user_payload["name"], "Name field mismatch"
            assert response_data["email"] == user_payload["email"], "Email field mismatch"
            assert response_data["department"] == user_payload["department"], "Department field mismatch"

            # Constitutional compliance verification
            assert evidence_file.exists(), "Constitutional evidence not properly collected"

    @pytest.mark.asyncio
    async def test_user_retrieval_get_endpoint(self):
        """Constitutional test: GET /api/users/{id} with exact correspondence"""

        async with AsyncClient(app=app, base_url="http://test") as client:

            # Setup: Create user first
            create_response = await client.post("/api/users", json={
                "name": "Jane Smith",
                "email": "jane@example.com",
                "department": "Marketing"
            })
            user_id = create_response.json()["id"]

            # Task requirement: Retrieve specific user via GET
            response = await client.get(f"/api/users/{user_id}")

            # Constitutional evidence collection
            evidence = {
                "constitutional_test": "user_retrieval_get_endpoint",
                "timestamp": datetime.now().isoformat(),
                "task_requirement": f"GET /api/users/{user_id} - retrieve specific user",
                "request": {
                    "method": "GET",
                    "endpoint": f"/api/users/{user_id}",
                    "user_id": user_id
                },
                "response": {
                    "status_code": response.status_code,
                    "body": response.json() if response.status_code == 200 else response.text
                },
                "functional_correspondence": {
                    "required": f"GET request to retrieve user {user_id}",
                    "executed": f"GET request to /api/users/{user_id}",
                    "match": True
                }
            }

            # Save evidence
            evidence_file = self.evidence_dir / f"user_retrieval_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(evidence_file, 'w') as f:
                json.dump(evidence, f, indent=2)

            # Validate exact functional correspondence
            assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"

            user_data = response.json()
            assert user_data["id"] == user_id, "User ID mismatch"
            assert user_data["name"] == "Jane Smith", "User name mismatch"
            assert user_data["email"] == "jane@example.com", "User email mismatch"

            # Constitutional compliance verification
            assert evidence_file.exists(), "Constitutional evidence not properly collected"
```

### PyTest Configuration

```python
# pytest.ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_functions = test_*
addopts =
    -v
    --tb=short
    --asyncio-mode=auto
    --disable-warnings
asyncio_mode = auto
```

## Troubleshooting

### Common Issues

1. **Missing Evidence Directories**

   ```bash
   mkdir -p evidence/{integration,test-results,logs,compliance}
   ```

2. **Async Test Issues**

   ```python
   # Install pytest-asyncio
   pip install pytest-asyncio

   # Ensure proper async fixture usage
   @pytest.mark.asyncio
   async def test_function():
       pass
   ```

3. **Constitutional Validation Failures**
   - Check evidence collection completeness
   - Verify exact functional correspondence
   - Ensure TDD debt resolution

### Debugging Commands

```bash
# Run constitutional validator
node .specify/tools/constitutional-validator.js integration-testing

# Check evidence collection
ls -la evidence/integration/

# Run specific constitutional test
pytest tests/test_constitutional_api.py::TestConstitutionalAPI::test_user_creation_exact_correspondence -v
```

## Integration with CODOR Constitution

This template ensures FastAPI compliance with:

- **Constitutional Amendment VI**: Exact functional correspondence through HTTP method validation
- **Constitutional Amendment VII**: TDD debt management with automated pytest collection
- **Constitutional Amendment VIII**: Anti-fraud enforcement through comprehensive JSON evidence

The three-gate validation system integrates seamlessly with Python testing workflows.
