"""
Violation Worker
================
Consumes  : RIGHTS_EVALUATED  (only events with decision == VIOLATION)

Stores violation records in MongoDB.
"""

import asyncio
import resend
from core.events import event_bus
from core.db import connect_to_mongo, close_mongo_connection, get_db
from core.models import ViolationDocument, RIGHTS_EVALUATED
from core.logging_config import get_logger
from core.config import settings

log = get_logger("worker.violation")


async def on_rights_evaluated(payload: dict):
    decision = payload.get("decision", "")

    if decision == "AUTHORIZED":
        log.info(
            "✅ Authorized — detection=%s (no violation stored)",
            payload["detection_id"],
        )
        return

    # decision == "VIOLATION"
    db = get_db()

    # Deduplication: skip if we already have this detection_id
    existing = await db.violations.find_one(
        {"detection_id": payload["detection_id"]}
    )
    if existing:
        log.warning(
            "Duplicate detection_id=%s — skipping.", payload["detection_id"]
        )
        return

    doc = ViolationDocument(
        content_id=payload["content_id"],
        detection_id=payload["detection_id"],
        platform=payload.get("platform", "unknown"),
        source_url=payload.get("source_url", ""),
        similarity_score=payload["similarity_score"],
        decision=decision,
        status="OPEN",
    )

    await db.violations.insert_one(doc.model_dump())
    log.info(
        "🚨 VIOLATION STORED  violation_id=%s  content=%s  platform=%s  score=%.1f%%",
        doc.violation_id,
        doc.content_id,
        doc.platform,
        doc.similarity_score,
    )

    if settings.RESEND_API_KEY and settings.RESEND_EMAIL_FROM and settings.RESEND_EMAIL_TO:
        try:
            resend.api_key = settings.RESEND_API_KEY
            resend.Emails.send({
                "from": settings.RESEND_EMAIL_FROM,
                "to": settings.RESEND_EMAIL_TO,
                "subject": f"Piracy Violation: {doc.platform}",
                "html": f"<p>A piracy violation was detected on <strong>{doc.platform}</strong>.</p><p>Content ID: {doc.content_id}<br>Similarity Score: {doc.similarity_score}%<br>Violation ID: {doc.violation_id}</p>"
            })
            log.info("📧 Email notification sent for violation_id=%s", doc.violation_id)
        except Exception as e:
            log.error("Failed to send Resend email: %s", e)
    else:
        log.info(
            "Resend notification skipped: RESEND_API_KEY, RESEND_EMAIL_FROM, or RESEND_EMAIL_TO is not configured."
        )


async def main():
    await connect_to_mongo()
    await event_bus.connect()
    await event_bus.subscribe(
        queue_name="violation_queue",
        routing_key=RIGHTS_EVALUATED,
        callback=on_rights_evaluated,
    )
    log.info("Violation Worker READY — waiting for events …")
    await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())
