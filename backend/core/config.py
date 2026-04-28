import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Central configuration — resolved from env vars or .env file."""

    RABBITMQ_URL: str = os.getenv(
        "RABBITMQ_URL", "amqp://guest:guest@localhost:5672/"
    )
    MONGO_URL: str = os.getenv(
        "MONGO_URL", "mongodb://localhost:27017"
    )
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")
    RESEND_EMAIL_FROM: str = os.getenv("RESEND_EMAIL_FROM", "")
    RESEND_EMAIL_TO: str = os.getenv("RESEND_EMAIL_TO", "")
    MONGO_DB_NAME: str = "shieldstream"
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")

    # Google Cloud integration
    GCP_PROJECT: str = os.getenv("GCP_PROJECT", "")
    GCP_REGION: str = os.getenv("GCP_REGION", "us-central1")
    GCS_BUCKET_NAME: str = os.getenv("GCS_BUCKET_NAME", "")
    VERTEX_AI_ENDPOINT_ID: str = os.getenv("VERTEX_AI_ENDPOINT_ID", "")

    # Matching thresholds
    FAISS_MATCH_THRESHOLD: float = 10.0  # Max Hamming distance for a "match"
    VIOLATION_SIMILARITY_MIN: float = 0.90  # Rights rule: ≥90 % → VIOLATION

    # Monitor interval (seconds between simulated detections)
    MONITOR_INTERVAL_SEC: int = 30

    class Config:
        env_file = ".env"


settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
