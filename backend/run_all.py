"""
Local development runner — starts all APIs and workers in one terminal.
For production, use docker-compose up instead.
"""

import subprocess
import sys
import time
import os

# Ensure PYTHONPATH includes the project root
os.environ["PYTHONPATH"] = os.path.dirname(os.path.abspath(__file__))


def spawn(cmd: str, name: str):
    print(f"  > Starting {name}")
    return subprocess.Popen(
        cmd, shell=True, env={**os.environ, "PYTHONUNBUFFERED": "1"}
    )


if __name__ == "__main__":
    py = sys.executable
    procs = []

    print("\n==========================================")
    print("   ShieldStream Backend - Local Runner    ")
    print("==========================================\n")
    print("Make sure RabbitMQ and MongoDB are running:")
    print("  docker-compose up -d rabbitmq mongodb\n")

    try:
        # ── APIs ────────────────────────────────────────────────
        procs.append(spawn(
            f"{py} -m uvicorn services.upload.main:app --host 0.0.0.0 --port 8000 --reload",
            "Upload API        (http://localhost:8000/docs)",
        ))
        procs.append(spawn(
            f"{py} -m uvicorn services.violation.main:app --host 0.0.0.0 --port 8001 --reload",
            "Violation API     (http://localhost:8001/docs)",
        ))

        time.sleep(2)

        # ── Workers ────────────────────────────────────────────
        procs.append(spawn(f"{py} -m services.fingerprint.worker", "Fingerprint Worker"))
        procs.append(spawn(f"{py} -m services.matching.worker", "Matching Worker"))
        procs.append(spawn(f"{py} -m services.rights.worker", "Rights Worker"))
        procs.append(spawn(f"{py} -m services.violation.worker", "Violation Worker"))
        procs.append(spawn(f"{py} -m services.monitor.worker", "Monitor Worker"))
        procs.append(spawn(f"{py} -m services.vision.worker", "Vision Worker"))

        print("\nAll services started!")
        print("   Upload API  →  http://localhost:8000/docs")
        print("   Violation   →  http://localhost:8001/docs")
        print("   RabbitMQ UI →  http://localhost:15672")
        print("\nPress Ctrl+C to stop all.\n")

        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        print("\nShutting down …")
        for p in procs:
            p.terminate()
        print("All services stopped.")
