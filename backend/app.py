"""
Main FastAPI application for Vercel deployment.
Combines all backend services into a single app.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from core.config import settings
from core.db import connect_to_mongo, close_mongo_connection
from core.events import event_bus
from core.logging_config import get_logger

from services.upload.main import app as upload_app
from services.violation.main import app as violation_app

log = get_logger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Global lifespan for all services."""
    await connect_to_mongo()
    await event_bus.connect()
    log.info("ShieldStream Backend is READY.")
    yield
    await close_mongo_connection()
    await event_bus.close()


# Create main app
app = FastAPI(title="ShieldStream Backend", lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount sub-applications
app.mount("/upload", upload_app)
app.mount("/violation", violation_app)


@app.get("/")
async def root():
    return {"message": "ShieldStream Backend API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok", "service": "main"}