"""
Intelligence Core Worker — Layer 2
Poll Layer 1 buffer → process → forward to Layer 3
"""
import time
import requests
import logging

from .intelligence_service import IntelligenceService

logging.basicConfig(level=logging.INFO, format="%(asctime)s [worker] %(message)s")
log = logging.getLogger(__name__)

INGESTION_URL = "http://ingestion-api:8000/api/buffer"
ACTION_LAYER_URL = "http://action-layer:8001/api/dashboard/process"
POLL_INTERVAL = 1.0  # seconds

service = IntelligenceService()
seen_ids: set = set()


def fetch_buffer():
    try:
        r = requests.get(INGESTION_URL, timeout=3)
        r.raise_for_status()
        return r.json().get("readings", [])
    except Exception as e:
        log.warning(f"Layer 1 unreachable: {e}")
        return []


def forward(enriched: dict):
    try:
        r = requests.post(ACTION_LAYER_URL, json=enriched, timeout=3)
        return r.status_code
    except Exception as e:
        log.warning(f"Layer 3 unreachable: {e}")
        return None


def run():
    log.info("Intelligence Worker started")
    log.info(f"Polling {INGESTION_URL} every {POLL_INTERVAL}s")
    log.info(f"Forwarding to {ACTION_LAYER_URL}")

    while True:
        readings = fetch_buffer()
        new = 0
        for reading in readings:
            uid = (reading.get("sensor_id"), reading.get("timestamp"))
            if uid in seen_ids:
                continue
            seen_ids.add(uid)
            try:
                enriched = service.process(reading).to_dict()
                status = forward(enriched)
                risk = enriched.get("risk_level", "?")
                log.info(f"[{status}] {reading.get('sensor_id')} value={reading.get('value')} risk={risk}")
                new += 1
            except Exception as e:
                log.error(f"Processing error: {e}")

        if not new:
            time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    run()
