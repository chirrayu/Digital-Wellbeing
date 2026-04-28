"""
Pydantic schemas for every event flowing through the RabbitMQ pipeline.
Each event carries a unique id, timestamp, and domain-specific payload.
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
import uuid


# ── Routing Keys (constants) ────────────────────────────────────
CONTENT_UPLOADED = "content.uploaded"
CONTENT_FINGERPRINTED = "content.fingerprinted"
CONTENT_DETECTED = "content.detected"
MATCH_FOUND = "content.match_found"
RIGHTS_EVALUATED = "content.rights_evaluated"


# ── Base ─────────────────────────────────────────────────────────
class BaseEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ── Upload → Fingerprint ────────────────────────────────────────
class ContentUploadedEvent(BaseEvent):
    content_id: str
    file_path: str
    mime_type: str
    owner_id: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


# ── Fingerprint → Matching (index) ──────────────────────────────
class ContentFingerprintedEvent(BaseEvent):
    content_id: str
    hash_value: str  # comma-separated hex hashes
    frame_count: int = 0
    metadata: Dict[str, Any] = Field(default_factory=dict)


# ── Monitor → Matching (search) ─────────────────────────────────
class ContentDetectedEvent(BaseEvent):
    detection_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    source_url: str
    platform: str  # YouTube, TikTok, X …
    file_path: str  # local path to downloaded sample
    metadata: Dict[str, Any] = Field(default_factory=dict)


# ── Matching → Rights ────────────────────────────────────────────
class MatchFoundEvent(BaseEvent):
    detection_id: str
    matched_content_id: str
    similarity_score: float  # 0‑100
    platform: str
    source_url: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


# ── Rights → Violation ──────────────────────────────────────────
class RightsEvaluatedEvent(BaseEvent):
    detection_id: str
    content_id: str
    similarity_score: float
    platform: str
    source_url: str
    decision: str  # VIOLATION | AUTHORIZED
    metadata: Dict[str, Any] = Field(default_factory=dict)


# ── DB Documents ─────────────────────────────────────────────────
class ContentDocument(BaseModel):
    content_id: str
    owner_id: str
    file_path: str
    mime_type: str
    hash_value: Optional[str] = None
    frame_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ViolationDocument(BaseModel):
    violation_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content_id: str
    detection_id: str
    platform: str
    source_url: str
    similarity_score: float
    decision: str
    status: str = "OPEN"  # OPEN | REVIEWED | DISMISSED
    created_at: datetime = Field(default_factory=datetime.utcnow)
