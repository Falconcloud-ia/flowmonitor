# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flow-Monitor is an industrial IoT real-time monitoring system with three backend layers, a React frontend, and Docker/Kubernetes deployment support.

## Commands

### Backend Setup
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Running Services (3 terminals needed)
```bash
# Terminal 1: Action Layer API (port 8001)
source venv/bin/activate && python -m action_layer.api

# Terminal 2: Frontend (port 5173)
cd dashboard && npm run dev

# Terminal 3: Sensor simulator
source venv/bin/activate && python sensors/datapulse_sensor.py
```

### Frontend
```bash
cd dashboard
npm install
npm run dev       # Dev server
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

### Tests
```bash
python -m pytest tests/test_plugin_system.py -v
```

### Docker
```bash
# Build images
docker build -f devops/Dockerfile.backend -t flow-monitor-backend:latest .
docker build -f dashboard/Dockerfile -t flow-monitor-dashboard:latest ./dashboard

# Run full stack
docker-compose -f devops/docker-compose.yml up
```

## Architecture

The system is a **three-layer pipeline** where data flows from sensors through ingestion, analysis, and finally to the dashboard:

```
Sensors → Layer 1 (Ingestion :8000) → Layer 2 (Intelligence) → Layer 3 (Action :8001) → Frontend (:5173)
```

### Layer 1: Ingestion (`/ingestion/`)
- FastAPI service on port 8000
- Plugin-based normalization system: sensor payloads are transformed into `NormalizedReading` objects via registered plugins (`registry.py`)
- Stores readings in an in-memory buffer (Redis in production via `REDIS_URL` env var)
- Key endpoints: `POST /api/ingest`, `GET /api/buffer`, `GET /api/plugins`

### Layer 2: Intelligence Core (`/intelligence_core/`)
- Not a standalone HTTP service — orchestrated as a worker (`python -m intelligence_core.worker` in Docker)
- `IntelligenceService` (orchestrator) → `RulesEngine` (threshold evaluation) + `PredictiveModel` (failure probability)
- Thresholds are defined in `config.py`: temperature, vibration, pressure, flow — each with `normal_max`, `warning`, `critical` levels
- Outputs `EnrichedData` with risk level (LOW/MEDIUM/HIGH/CRITICAL) and recommendations

### Layer 3: Action Layer (`/action_layer/`)
- FastAPI service on port 8001
- Receives `EnrichedData` via `POST /api/dashboard/process`, stores it, and distributes to subscribers via `DataObserver` (observer pattern)
- Streams real-time updates to frontend via Server-Sent Events: `GET /api/dashboard/stream`
- `NotificationDispatcher` handles omnichannel alerts (WhatsApp, Email, SMS, Dashboard)

### Frontend (`/dashboard/`)
- React 19 + Vite 7 + Tailwind CSS
- Single component: `App.jsx` — connects to SSE stream at the Action Layer
- Production: served by Nginx (multi-stage Docker build)

### Sensor Simulator (`/sensors/`)
- `datapulse_sensor.py`: simulates industrial sensors with sinusoidal base waves + Gaussian noise + anomaly injection (5% probability by default)
- `SensorConfig` dataclass controls all simulation parameters

## Infrastructure

- **Docker Compose** (`devops/docker-compose.yml`): Redis + ingestion-api + intelligence-worker (2 replicas) + dashboard
- **Kubernetes** (`devops/k8s/`): API deployment with HPA (3–30 replicas at 60% CPU), Redis deployment
- Backend container uses a non-root user; configured via `MODE` env var (`INGESTION` or `WORKER`)
