"""
Matching Worker
===============
Subscribes to TWO queues (non-blocking):

1. CONTENT_FINGERPRINTED  →  add hash to FAISS index
2. CONTENT_DETECTED       →  search index, emit MATCH_FOUND if similar
"""

import asyncio
from core.events import event_bus
from core.models import (
    MatchFoundEvent,
    CONTENT_FINGERPRINTED,
    CONTENT_DETECTED,
    MATCH_FOUND,
)
from core.logging_config import get_logger
from services.matching.faiss_index import faiss_index
from services.fingerprint.processor import extract_hashes

log = get_logger("worker.matching")


# ── Handler 1: index new content ────────────────────────────────
async def on_content_fingerprinted(payload: dict):
    content_id = payload["content_id"]
    hash_csv = payload["hash_value"]

    # Index the first hash (representative frame)
    first_hash = hash_csv.split(",")[0]
    faiss_index.add(content_id, first_hash)


# ── Handler 2: search for matches ───────────────────────────────
async def on_content_detected(payload: dict):
    detection_id = payload["detection_id"]
    file_path = payload["file_path"]
    platform = payload.get("platform", "unknown")
    source_url = payload.get("source_url", "")

    log.info("Searching index for detection_id=%s  (%s)", detection_id, platform)

    try:
        is_video = file_path.lower().endswith((".mp4", ".avi", ".mkv", ".mov"))
        hashes = extract_hashes(file_path, is_video=is_video)
    except Exception as exc:
        log.exception("Cannot hash detected file %s: %s", file_path, exc)
        return

    if not hashes:
        log.warning("No hashes extracted for detection %s", detection_id)
        return

    match = faiss_index.search(hashes[0])

    if match:
        log.info(
            "🔥 MATCH  detection=%s → content=%s  score=%.1f%%",
            detection_id,
            match["matched_content_id"],
            match["similarity_score"],
        )
        event = MatchFoundEvent(
            detection_id=detection_id,
            matched_content_id=match["matched_content_id"],
            similarity_score=match["similarity_score"],
            platform=platform,
            source_url=source_url,
        )
        await event_bus.publish(MATCH_FOUND, event)
    else:
        log.info("No match for detection %s", detection_id)


# ── Entrypoint ──────────────────────────────────────────────────
async def main():
    await event_bus.connect()

    # Both subscriptions are non-blocking — they coexist in the same loop
    await event_bus.subscribe(
        queue_name="matching_index_queue",
        routing_key=CONTENT_FINGERPRINTED,
        callback=on_content_fingerprinted,
    )
    await event_bus.subscribe(
        queue_name="matching_search_queue",
        routing_key=CONTENT_DETECTED,
        callback=on_content_detected,
    )

    log.info("Matching Worker READY — listening on 2 queues …")
    await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())
