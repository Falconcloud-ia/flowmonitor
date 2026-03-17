---
name: intelligence-expose
description: Expose the PredictiveModel's failure_probability value from the Intelligence Core to the frontend dashboard. Use this skill when asked to "mostrar probabilidad de falla", "exponer modelo predictivo", "gauge de predicción", or any task involving surfacing ML/analytics output from intelligence_core to the API or UI.
---

# Intelligence Core — Expose Predictive Output

## Context

The `IntelligenceService` in `intelligence_core/` already computes `failure_probability` (float 0.0–1.0) via `PredictiveModel`. The problem: this value may not be consistently passed through to `EnrichedData` or may not be visible in the API response consumed by the dashboard.

## Steps

### 1. Verify EnrichedData schema

Open `intelligence_core/models.py` (or wherever `EnrichedData` is defined). Confirm `failure_probability: float` is present as a field. If missing, add it.

```python
@dataclass
class EnrichedData:
    sensor_id: str
    timestamp: str
    value: float
    sensor_type: str
    risk_level: str  # LOW | MEDIUM | HIGH | CRITICAL
    failure_probability: float  # ← must exist, range 0.0–1.0
    recommendations: list[str]
    anomaly_detected: bool
```

### 2. Verify PredictiveModel output is wired

In `intelligence_core/service.py` (or `orchestrator.py`), confirm that `IntelligenceService.process()` calls `PredictiveModel.predict()` and assigns the result to `EnrichedData.failure_probability`. If not, wire it.

### 3. Verify Action Layer serialization

In `action_layer/api.py`, the `POST /api/dashboard/process` endpoint receives `EnrichedData`. Confirm the Pydantic model (or dict serialization) includes `failure_probability` in the JSON response and in the SSE event payload.

### 4. Verify SSE event format

The SSE stream at `GET /api/dashboard/stream` should emit events with the full `EnrichedData` including `failure_probability`. Check the `DataObserver` notify method.

## Validation

After changes, run the sensor simulator and curl the stream:

```bash
curl -N http://localhost:8001/api/dashboard/stream
```

Each event should contain `"failure_probability": <float>`.

## Notes

- Do NOT change the prediction logic in `PredictiveModel` — only expose the existing output
- If `failure_probability` is computed as a risk score (not 0–1 float), normalize it: `probability = min(score / max_score, 1.0)`
- The dashboard skill (`dashboard-redesign`) handles the UI gauge — this skill only handles the backend pipeline
