---
name: test-coverage
description: Expand test coverage for Flow-Monitor beyond the existing plugin_system tests. Use this skill when asked to "agregar tests", "cobertura de pruebas", "pytest", "test unitarios", or any task involving writing or improving tests for intelligence_core, ingestion, or action_layer.
---

# Test Coverage Expansion — Flow-Monitor

## Current State

Only `tests/test_plugin_system.py` exists, covering the plugin normalization system in `ingestion/`.

## Target Coverage

### Priority 1 — RulesEngine (intelligence_core)

File: `tests/test_rules_engine.py`

Test all 4 sensor types against their threshold levels from `config.py`:

```python
import pytest
from intelligence_core.rules_engine import RulesEngine  # adjust import to actual path
from intelligence_core.models import NormalizedReading

@pytest.fixture
def engine():
    return RulesEngine()

def test_temperature_normal(engine):
    reading = NormalizedReading(sensor_id="s1", sensor_type="temperature", value=60.0, timestamp="...")
    result = engine.evaluate(reading)
    assert result.risk_level == "LOW"

def test_temperature_warning(engine):
    # Use threshold value from config.py warning level
    ...

def test_temperature_critical(engine):
    ...

# Repeat for: vibration, pressure, flow
```

Before writing the tests, read `intelligence_core/config.py` to get exact threshold values. Use those values as test inputs — do not hardcode guesses.

### Priority 2 — Ingestion normalization

File: `tests/test_ingestion_normalization.py`

Test at least 2 different sensor plugins:

```python
def test_normalize_temperature_sensor():
    # Given a raw temperature sensor payload
    # When normalized via the registry
    # Then output is a valid NormalizedReading with correct sensor_type

def test_normalize_unknown_sensor_returns_default_or_raises():
    # Edge case: payload from unregistered sensor type
    ...
```

Read `ingestion/registry.py` and available plugin files to understand payload formats before writing tests.

### Priority 3 — Action Layer API

File: `tests/test_action_layer_api.py`

Use FastAPI's `TestClient`:

```python
from fastapi.testclient import TestClient
from action_layer.api import app  # adjust to actual module path

client = TestClient(app)

def test_process_enriched_data():
    payload = {
        "sensor_id": "sensor_test",
        "timestamp": "2026-01-01T00:00:00",
        "value": 95.0,
        "sensor_type": "temperature",
        "risk_level": "HIGH",
        "failure_probability": 0.8,
        "recommendations": ["Check system"],
        "anomaly_detected": True
    }
    response = client.post("/api/dashboard/process", json=payload)
    assert response.status_code == 200

def test_get_alerts_returns_list():
    response = client.get("/api/alerts")
    assert response.status_code == 200
    assert "alerts" in response.json()
```

## Running Tests

```bash
source venv/bin/activate
python -m pytest tests/ -v --tb=short
```

## Notes

- Adjust all import paths to match the actual module structure — read the relevant source files before writing tests
- Do not mock the RulesEngine thresholds — test against real config values
- The `alert-persistence` skill must be applied before Priority 3 tests will pass (the `/api/alerts` endpoint won't exist otherwise)
