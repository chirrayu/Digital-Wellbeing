"""
Violation API — FastAPI
=======================
GET  /violations           → list all violations (filterable by status)
PUT  /violations/{id}/status → update status (OPEN → REVIEWED / DISMISSED)
GET  /analytics/summary    → aggregated stats for the dashboard
GET  /health               → liveness probe
"""

from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from core.db import connect_to_mongo, close_mongo_connection, get_db
from core.logging_config import get_logger

log = get_logger("service.violation")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    log.info("Violation API is READY.")
    yield
    await close_mongo_connection()


app = FastAPI(title="ShieldStream — Violation API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Schemas ─────────────────────────────────────────────────────
class StatusUpdate(BaseModel):
    status: str  # OPEN | REVIEWED | DISMISSED


# ── Routes ──────────────────────────────────────────────────────
@app.get("/violations")
async def get_violations(
    status: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
):
    db = get_db()
    query = {}
    if status:
        query["status"] = status

    cursor = db.violations.find(query, {"_id": 0}).sort("created_at", -1)
    return await cursor.to_list(length=limit)


@app.put("/violations/{violation_id}/status")
async def update_violation_status(violation_id: str, body: StatusUpdate):
    db = get_db()
    result = await db.violations.update_one(
        {"violation_id": violation_id},
        {"$set": {"status": body.status}},
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Violation not found")
    log.info("Updated violation %s → %s", violation_id, body.status)
    return {"status": "success", "violation_id": violation_id, "new_status": body.status}


@app.get("/analytics/summary")
async def analytics_summary():
    db = get_db()

    total = await db.violations.count_documents({})
    open_count = await db.violations.count_documents({"status": "OPEN"})
    reviewed = await db.violations.count_documents({"status": "REVIEWED"})
    dismissed = await db.violations.count_documents({"status": "DISMISSED"})

    # Platform breakdown
    pipeline = [{"$group": {"_id": "$platform", "count": {"$sum": 1}}}]
    platform_stats = await db.violations.aggregate(pipeline).to_list(length=None)

    # Avg similarity
    avg_pipeline = [{"$group": {"_id": None, "avg_score": {"$avg": "$similarity_score"}}}]
    avg_result = await db.violations.aggregate(avg_pipeline).to_list(length=1)
    avg_score = round(avg_result[0]["avg_score"], 1) if avg_result else 0

    return {
        "total_violations": total,
        "open": open_count,
        "reviewed": reviewed,
        "dismissed": dismissed,
        "avg_similarity_score": avg_score,
        "platform_breakdown": {s["_id"]: s["count"] for s in platform_stats},
    }


@app.get("/health")
async def health():
    return {"status": "ok", "service": "violation"}
