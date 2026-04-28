"""
MongoDB async connection manager using motor.
"""

from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings
from core.logging_config import get_logger

log = get_logger("core.db")


class Database:
    client: AsyncIOMotorClient = None
    db = None


_db = Database()


async def connect_to_mongo():
    _db.client = AsyncIOMotorClient(settings.MONGO_URL)
    _db.db = _db.client[settings.MONGO_DB_NAME]

    # Create indexes for fast lookups
    await _db.db.content.create_index("content_id", unique=True)
    await _db.db.violations.create_index("violation_id", unique=True)
    await _db.db.violations.create_index("created_at")
    await _db.db.detections.create_index("detection_id", unique=True)

    log.info("Connected to MongoDB (%s)", settings.MONGO_DB_NAME)


async def close_mongo_connection():
    if _db.client:
        _db.client.close()
        log.info("Closed MongoDB connection.")


def get_db():
    return _db.db
