"""
Rights Evaluation Worker
========================
Consumes  : MATCH_FOUND
Produces  : RIGHTS_EVALUATED

Applies a simple rule:
  similarity ≥ 90 %  →  VIOLATION
  similarity <  90 %  →  AUTHORIZED
"""

import asyncio
from core.events import event_bus
from core.config import settings
from core.google_cloud import predict_vertex_ai
from core.models import (
    RightsEvaluatedEvent,
    MATCH_FOUND,
    RIGHTS_EVALUATED,
)
from core.logging_config import get_logger

log = get_logger("worker.rights")

VIOLATION_THRESHOLD = settings.VIOLATION_SIMILARITY_MIN * 100  # 90.0


async def on_match_found(payload: dict):
    detection_id = payload["detection_id"]
    content_id = payload["matched_content_id"]
    score = payload["similarity_score"]
    platform = payload.get("platform", "unknown")
    source_url = payload.get("source_url", "")

    decision = "VIOLATION" if score >= VIOLATION_THRESHOLD else "AUTHORIZED"

    if settings.VERTEX_AI_ENDPOINT_ID:
        try:
            prediction = predict_vertex_ai(
                endpoint_id=settings.VERTEX_AI_ENDPOINT_ID,
                instances=[
                    {
                        "detection_id": detection_id,
                        "content_id": content_id,
                        "similarity_score": score,
                        "platform": platform,
                        "source_url": source_url,
                    }
                ],
            )
            if isinstance(prediction, list) and prediction:
                decision = str(prediction[0]).upper()
        except Exception as exc:
            log.warning("Vertex AI evaluation failed: %s — falling back to threshold.", exc)

    log.info(
        "⚖️  Rights decision  detection=%s  score=%.1f%%  → %s",
        detection_id,
        score,
        decision,
    )

    event = RightsEvaluatedEvent(
        detection_id=detection_id,
        content_id=content_id,
        similarity_score=score,
        platform=platform,
        source_url=source_url,
        decision=decision,
    )
    await event_bus.publish(RIGHTS_EVALUATED, event)


async def main():
    await event_bus.connect()
    await event_bus.subscribe(
        queue_name="rights_queue",
        routing_key=MATCH_FOUND,
        callback=on_match_found,
    )
    log.info("Rights Evaluation Worker READY — waiting for events …")
    await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())
