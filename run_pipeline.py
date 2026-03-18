#!/usr/bin/env python3
"""
Pipeline bridge: sensor → intelligence_core → action_layer
"""
import requests
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from intelligence_core.intelligence_service import IntelligenceService
from sensors.datapulse_sensor import DataPulseAgent, SensorConfig

ACTION_LAYER_URL = "http://localhost:8001/api/dashboard/process"

service = IntelligenceService()


def handle_reading(payload: dict):
    try:
        enriched = service.process(payload)
        data = enriched.to_dict()
        response = requests.post(ACTION_LAYER_URL, json=data, timeout=3)
        risk = data.get("risk_level", "?")
        val = payload.get("value", "?")
        status = "✓" if response.status_code == 200 else f"✗ {response.status_code}"
        print(f"[{status}] value={val:.1f} risk={risk}")
    except Exception as e:
        print(f"[error] {e}")


config = SensorConfig(
    sensor_id="sensor_01",
    send_to_api=False,
    interval_seconds=1.0,
)

sensor = DataPulseAgent(config)
sensor.register_callback(handle_reading)

print("Pipeline activo: sensor → intelligence → action_layer")
print(f"Enviando a: {ACTION_LAYER_URL}")
print("Ctrl+C para detener\n")

try:
    sensor.run_async()
    import time
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    sensor.stop()
    print("\nDetenido.")
