"""
Upload Service — FastAPI
========================
POST /upload   → store file, register in MongoDB, emit CONTENT_UPLOADED
GET  /content  → list all registered content
"""

import os
import uuid
import shutil
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from core.events import event_bus
from core.db import connect_to_mongo, close_mongo_connection, get_db
from core.models import (
    ContentUploadedEvent,
    ContentDocument,
    CONTENT_UPLOADED,
)
from core.logging_config import get_logger

log = get_logger("service.upload")


# ── Lifespan ────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    await event_bus.connect()
    log.info("Upload Service is READY.")
    yield
    await close_mongo_connection()
    await event_bus.close()


app = FastAPI(title="ShieldStream — Upload Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routes ──────────────────────────────────────────────────────
@app.post("/upload")
async def upload_content(
    file: UploadFile = File(...),
    owner_id: str = Form(default="default_owner"),
):
    """Accept a media file, persist it locally, and fire CONTENT_UPLOADED."""
    try:
        content_id = str(uuid.uuid4())
        ext = os.path.splitext(file.filename or "")[1] or ".bin"
        local_name = f"{content_id}{ext}"
        file_path = os.path.join(settings.UPLOAD_DIR, local_name)

        # 1. Store file
        with open(file_path, "wb") as buf:
            shutil.copyfileobj(file.file, buf)
        log.info("Stored file  %s  (%s)", local_name, file.content_type)

        # 2. Register in MongoDB
        db = get_db()
        doc = ContentDocument(
            content_id=content_id,
            owner_id=owner_id,
            file_path=file_path,
            mime_type=file.content_type or "application/octet-stream",
        )
        await db.content.insert_one(doc.model_dump())

        # 3. Emit event
        event = ContentUploadedEvent(
            content_id=content_id,
            file_path=file_path,
            mime_type=file.content_type or "application/octet-stream",
            owner_id=owner_id,
        )
        await event_bus.publish(CONTENT_UPLOADED, event)

        return {
            "status": "success",
            "content_id": content_id,
            "message": "Content uploaded — pipeline started.",
        }

    except Exception as exc:
        log.exception("Upload failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/content")
async def list_content():
    """Return all registered content (newest first)."""
    db = get_db()
    cursor = db.content.find({}, {"_id": 0}).sort("created_at", -1)
    return await cursor.to_list(length=200)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "upload"}
