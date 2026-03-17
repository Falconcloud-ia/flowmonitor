---
name: dashboard-redesign
description: Redesign the Flow-Monitor React dashboard. Use this skill when asked to improve, refactor, or extend the dashboard UI in dashboard/src/App.jsx. Triggers on: "mejorar dashboard", "rediseñar interfaz", "sensor cards", "dark theme", "alerts panel", "sparklines", or any UI improvement request.
---

# Dashboard Redesign — Flow-Monitor

## Context

The current dashboard is a single `App.jsx` file connected to the SSE stream at `http://localhost:8001/api/dashboard/stream`. It receives `EnrichedData` objects and renders them.

**EnrichedData shape (from intelligence_core):**
```json
{
  "sensor_id": "sensor_01",
  "timestamp": "...",
  "value": 87.3,
  "sensor_type": "temperature",
  "risk_level": "HIGH",
  "failure_probability": 0.73,
  "recommendations": ["Check cooling system"],
  "anomaly_detected": true
}
```

**Risk level color mapping:**
- LOW → green (`#22c55e`)
- MEDIUM → yellow (`#eab308`)
- HIGH → orange (`#f97316`)
- CRITICAL → red (`#ef4444`)

## Target Architecture

Split `App.jsx` into focused components. Do NOT create separate files unless user asks — keep everything in App.jsx using local component definitions.

```
App
├── SensorGrid
│   └── SensorCard (one per sensor_id)
│       ├── RiskBadge
│       ├── SparklineChart (last 60 readings)
│       └── FailureProbabilityGauge
└── AlertsSidebar
    └── AlertItem (last 20 HIGH/CRITICAL events)
```

## Implementation Rules

1. **Dark theme**: background `#0f172a`, cards `#1e293b`, borders `#334155`
2. **SparklineChart**: use a lightweight SVG path — do NOT add a new npm dependency. Draw a simple polyline from the last 60 values stored in a `useRef` buffer per sensor.
3. **FailureProbabilityGauge**: SVG arc gauge, 0–100%. Show percentage as text in center.
4. **SensorCard**: pulse animation on border when `anomaly_detected === true`
5. **AlertsSidebar**: fixed right panel, 280px wide, scrollable list
6. **State management**: use `useState` + `useRef` only. No Redux, no Zustand.
7. **SSE reconnection**: wrap EventSource in a `useEffect` with cleanup. Auto-reconnect on error with 3s delay.

## Styling

Use Tailwind CSS utility classes already available (React + Vite + Tailwind already configured in the project). Do not add inline styles unless strictly necessary for dynamic values (e.g., gauge arc degrees, sparkline SVG coordinates).

## What to Preserve

- The SSE connection URL and endpoint
- The existing `npm` setup — do not change `package.json` unless adding a justified dependency
- Vite config

## Output Checklist

- [ ] SensorGrid renders one card per unique `sensor_id`
- [ ] Each card shows: sensor type, current value, risk badge, failure probability gauge
- [ ] Sparkline updates in real time as SSE events arrive
- [ ] AlertsSidebar shows last 20 HIGH/CRITICAL events with timestamp
- [ ] Color-coded risk levels
- [ ] Pulse animation on anomaly detection
