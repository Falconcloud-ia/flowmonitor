# 🔥 Flow-Monitor: Industrial IoT Monitoring System

![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?logo=fastapi)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![License](https://img.shields.io/badge/license-MIT-blue)

Real-time IoT sensor monitoring system with high-throughput ingestion, AI-based anomaly detection, and a reactive dashboard. Built with a 3-layer microservices architecture designed to scale to >2M requests/cycle.

> **GitHub Topics:** `iot` `fastapi` `python` `real-time` `anomaly-detection` `react` `kubernetes`
>
> **Description:** Industrial IoT real-time monitoring system — anomaly detection, predictive analytics, 3-layer pipeline. FastAPI + React + Kubernetes.

---

## 🏗️ Architecture

Three-layer pipeline where data flows from sensors to the frontend in real time:

```
Virtual Sensors (DataPulse)
        │  HTTP/JSON
        ▼
Layer 1 — Ingestion API          :8000   Plugin-based normalization
        │
        ▼
Layer 2 — Intelligence Core      worker  Rules engine + predictive model
        │
        ▼
Layer 3 — Action Layer API       :8001   SSE streaming + alert dispatch
        │
        ▼
Frontend Dashboard               :5173   React + Vite + Tailwind
```

| Layer | Module | Responsibility |
|---|---|---|
| 1 | `ingestion/` | Receive, validate, normalize sensor payloads via plugin registry |
| 2 | `intelligence_core/` | Evaluate thresholds (LOW/MEDIUM/HIGH/CRITICAL), compute failure probability |
| 3 | `action_layer/` | Serve real-time SSE stream, dispatch omnichannel alerts |
| UI | `dashboard/` | Visualize live sensor data and alert history |

---

## 🚀 Quick Start

**Prerequisites:** Python 3.10+, Node.js 18+

### Backend
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend
```bash
cd dashboard
npm install
cd ..
```

---

## ▶️ Running the System

Start these in 3 separate terminals:

**Terminal 1 — Backend API**
```bash
source venv/bin/activate
python -m action_layer.api
# http://localhost:8001
```

**Terminal 2 — Frontend**
```bash
cd dashboard
npm run dev
# http://localhost:5173
```

**Terminal 3 — Sensor Simulator**
```bash
source venv/bin/activate
python sensors/datapulse_sensor.py
```

---

## 🧪 Load Testing (Industrial Benchmark)

**Standard test** — 20 sensors sending data simultaneously:
```bash
python run_load_test.py --nodes 20 --duration 60
```

**Extreme test (Nuclear Mode)** — uses `aiohttp` + `uvloop` for >200,000 requests:
```bash
# ⚠️ May saturate local network
python load_async_test.py --total 1000000 --concurrency 500
```

---

## 📂 Project Structure

| Path | Description |
|---|---|
| `action_layer/` | FastAPI backend — SSE, alerts, dashboard API |
| `ingestion/` | Data ingestion adapters and plugin registry |
| `intelligence_core/` | Business rules, AI models, threshold config |
| `dashboard/` | React + Vite + Tailwind frontend |
| `sensors/` | Virtual IoT device simulators |
| `devops/` | Docker Compose + Kubernetes manifests |

---

## ☁️ Deployment

Docker Compose (full stack):
```bash
docker-compose -f devops/docker-compose.yml up
```

Kubernetes manifests in `devops/k8s/` — includes HPA configured for 3–30 API replicas at 60% CPU utilization, designed for >2M req/cycle throughput.

---

## Español

Sistema de monitoreo de sensores IoT en tiempo real con ingesta masiva, detección de anomalías mediante IA y dashboard reactivo.

**Arquitectura:** 3 capas — Ingesta (`:8000`) → Core de Inteligencia (worker) → Capa de Acción (`:8001`) → Frontend (`:5173`).

**Inicio rápido:**
```bash
# Backend
python -m venv venv && source venv/bin/activate && pip install -r requirements.txt
python -m action_layer.api

# Frontend
cd dashboard && npm install && npm run dev

# Sensores
python sensors/datapulse_sensor.py
```

Para detalles completos ver las secciones en inglés arriba. Para despliegue con Docker/Kubernetes ver `devops/`.
