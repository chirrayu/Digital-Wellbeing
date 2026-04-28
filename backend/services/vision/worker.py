import asyncio
from typing import Any

from core.events import event_bus
from core.db import connect_to_mongo, get_db
from core.logging_config import get_logger
from core.config import settings
from core.models import CONTENT_UPLOADED
from core.google_cloud import analyze_image_labels

log = get_logger("worker.vision")


async def on_content_uploaded(payload: dict[str, Any]):
    content_id = payload["content_id"]
    metadata = payload.get("metadata", {})
    gcs_uri = metadata.get("gcs_uri")

    if not gcs_uri:
        log.warning("No GCS URI available for content %s, skipping Vision analysis.", content_id)
        return

    try:
        labels = analyze_image_labels(gcs_uri)
        db = get_db()
        await db.content.update_one(
            {"content_id": content_id},
            {"$set": {"metadata.vision_labels": labels}},
        )
        log.info("Saved Vision labels for content=%s", content_id)
    except Exception as exc:
        log.exception("Vision analysis failed for %s: %s", content_id, exc)


async def main():
    await connect_to_mongo()
    await event_bus.connect()
    await event_bus.subscribe(
        queue_name="vision_queue",
        routing_key=CONTENT_UPLOADED,
        callback=on_content_uploaded,
    )
    log.info("Vision Worker READY — waiting for upload events …")
    await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())
