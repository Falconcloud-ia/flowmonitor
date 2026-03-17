---
name: alert-persistence
description: Add SQLite persistence for HIGH and CRITICAL alerts in the Action Layer. Use this skill when asked to "persistir alertas", "guardar historial", "SQLite", "GET /api/alerts", or any task involving storing or retrieving alert history in Flow-Monitor.
---

# Alert Persistence — SQLite Layer

## Context

The Action Layer (`action_layer/`) currently stores `EnrichedData` in memory only. On restart, all history is lost. This skill adds a lightweight SQLite persistence layer for alerts with `risk_level` of HIGH or CRITICAL only.

## Target

- New file: `action_layer/persistence.py` — SQLite adapter
- Modified file: `action_layer/api.py` — persist on ingest + new GET endpoint
- Database file: `alerts.db` at project root (gitignored)

## Implementation

### persistence.py

```python
import sqlite3
from pathlib import Path
from datetime import datetime

DB_PATH = Path(__file__).parent.parent / "alerts.db"

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sensor_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                sensor_type TEXT,
                value REAL,
                risk_level TEXT,
                failure_probability REAL,
                recommendations TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            )
        """)

def save_alert(data: dict):
    """Save only HIGH or CRITICAL risk events."""
    if data.get("risk_level") not in ("HIGH", "CRITICAL"):
        return
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            INSERT INTO alerts
            (sensor_id, timestamp, sensor_type, value, risk_level, failure_probability, recommendations)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            data["sensor_id"],
            data["timestamp"],
            data.get("sensor_type"),
            data.get("value"),
            data["risk_level"],
            data.get("failure_probability"),
            str(data.get("recommendations", []))
        ))

def get_recent_alerts(limit: int = 20) -> list[dict]:
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            "SELECT * FROM alerts ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
        return [dict(row) for row in rows]
```

### api.py changes

1. Call `init_db()` at startup (in the FastAPI `lifespan` or on module load)
2. In `POST /api/dashboard/process`: after processing, call `save_alert(enriched_data_dict)`
3. Add new endpoint:

```python
@app.get("/api/alerts")
async def get_alerts(limit: int = 20):
    return {"alerts": get_recent_alerts(limit)}
```

## .gitignore

Add to `.gitignore`:
```
alerts.db
```

## Validation

```bash
# Trigger some HIGH/CRITICAL events via sensor simulator
python run_live_demo.py

# Then query
curl http://localhost:8001/api/alerts
```

Response should be a list of alert objects ordered by most recent first.

## Notes

- SQLite is sufficient for demo/dev. The INFRASTRUCTURE_PLAN.md already covers Redis/Postgres for production — do not over-engineer this.
- No ORM needed — raw sqlite3 is lighter and has zero new dependencies.
- The `recommendations` field is stored as a string representation of the list — acceptable for demo purposes.
