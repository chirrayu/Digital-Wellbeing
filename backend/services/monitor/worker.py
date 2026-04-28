"""
Monitor Worker  (Simulated Crawler)
====================================
Periodically scans the ./uploads directory and emits CONTENT_DETECTED
events to simulate a crawler discovering potentially pirated media on
external platforms.

Includes deduplication — each file is only emitted ONCE.
"""

import asyncio
import os
import random

from core.config import settings
from core.events import event_bus
from core.db import connect_to_mongo, get_db
from core.models import ContentDetectedEvent, CONTENT_DETECTED
from core.logging_config import get_logger

log = get_logger("worker.monitor")

PLATFORMS = ["YouTube", "TikTok", "X", "Dailymotion", "Facebook"]
PLATFORM_URL_TEMPLATES = {
    "YouTube": "https://example.com/{platform}/watch/{fid}",
    "TikTok": "https://example.com/{platform}/video/{fid}",
    "X": "https://example.com/{platform}/status/{fid}",
    "Dailymotion": "https://example.com/{platform}/video/{fid}",
    "Facebook": "https://example.com/{platform}/watch/{fid}",
}

# Track files we have already emitted to avoid duplicate detections
_emitted: set[str] = set()


async def scan_once():
    """Pick one un-emitted file from uploads and fire a detection event."""
    upload_dir = settings.UPLOAD_DIR
    if not os.path.isdir(upload_dir):
        return

    files = [
        f
        for f in os.listdir(upload_dir)
        if os.path.isfile(os.path.join(upload_dir, f)) and f not in _emitted
    ]

    if not files:
        log.info("No new files to detect — sleeping …")
        return

    chosen = random.choice(files)
    _emitted.add(chosen)

    platform = random.choice(PLATFORMS)
    fid = chosen.split(".")[0][:8]
    url = PLATFORM_URL_TEMPLATES[platform].format(platform=platform.lower(), fid=fid)

    # Deduplication in MongoDB
    db = get_db()
    existing = await db.detections.find_one({"file_name": chosen})
    if existing:
        log.info("File %s already detected — skipping.", chosen)
        return

    event = ContentDetectedEvent(
        source_url=url,
        platform=platform,
        file_path=os.path.join(upload_dir, chosen),
    )

    # Store detection record for dedup
    await db.detections.insert_one(
        {
            "detection_id": event.detection_id,
            "file_name": chosen,
            "platform": platform,
            "source_url": url,
        }
    )

    await event_bus.publish(CONTENT_DETECTED, event)
    log.info(
        "🔍 Detected file=%s  platform=%s  url=%s", chosen, platform, url
    )


async def main():
    await connect_to_mongo()
    await event_bus.connect()

    interval = settings.MONITOR_INTERVAL_SEC
    log.info(
        "Monitor Worker READY — scanning every %ds for new files …", interval
    )

    while True:
        try:
            await scan_once()
        except Exception as exc:
            log.exception("Monitor scan error: %s", exc)
        await asyncio.sleep(interval)


if __name__ == "__main__":
    asyncio.run(main())
