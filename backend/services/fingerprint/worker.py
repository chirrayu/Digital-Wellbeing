"""
Fingerprint Worker
==================
Consumes  : CONTENT_UPLOADED
Produces  : CONTENT_FINGERPRINTED

Extracts perceptual hashes and stores them in MongoDB.
"""

import asyncio
from core.events import event_bus
from core.db import connect_to_mongo, close_mongo_connection, get_db
from core.models import (
    ContentFingerprintedEvent,
    CONTENT_UPLOADED,
    CONTENT_FINGERPRINTED,
)
from core.logging_config import get_logger
from services.fingerprint.processor import extract_hashes

log = get_logger("worker.fingerprint")


async def on_content_uploaded(payload: dict):
    content_id = payload["content_id"]
    file_path = payload["file_path"]
    mime_type = payload.get("mime_type", "")

    log.info("Processing content_id=%s  file=%s", content_id, file_path)

    is_video = "video" in mime_type
    try:
        hashes = extract_hashes(file_path, is_video=is_video)
    except Exception as exc:
        log.exception("Hash extraction failed for %s: %s", content_id, exc)
        return

    composite = ",".join(hashes)

    # Persist hash in MongoDB
    db = get_db()
    await db.content.update_one(
        {"content_id": content_id},
        {"$set": {"hash_value": composite, "frame_count": len(hashes)}},
    )

    # Emit downstream event
    event = ContentFingerprintedEvent(
        content_id=content_id,
        hash_value=composite,
        frame_count=len(hashes),
    )
    await event_bus.publish(CONTENT_FINGERPRINTED, event)
    log.info("✅ Fingerprinted content_id=%s  (%d hashes)", content_id, len(hashes))


async def main():
    await connect_to_mongo()
    await event_bus.connect()
    await event_bus.subscribe(
        queue_name="fingerprint_queue",
        routing_key=CONTENT_UPLOADED,
        callback=on_content_uploaded,
    )
    log.info("Fingerprint Worker READY — waiting for events …")
    await asyncio.Future()  # run forever


if __name__ == "__main__":
    asyncio.run(main())
