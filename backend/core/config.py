import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Central configuration — resolved from env vars or .env file."""

    RABBITMQ_URL: str = os.getenv(
        "RABBITMQ_URL", "amqp://guest:guest@localhost:5672/"
    )
    MONGO_URL: str = os.getenv(
        "MONGO_URL", "mongodb+srv://chirrayusharma:A6qLORsbn3kbGHV4@cluster0.tzexfrk.mongodb.net/"
    )
    RESEND_API_KEY: str = os.getenv(
        "RESEND_API_KEY", "re_bdHCxEBp_Ab1E4QEZtNJ5a8J92yuMAoDj"
    )
    MONGO_DB_NAME: str = "shieldstream"
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")

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
