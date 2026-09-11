import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "LANDGUARD AI - Landslide Early Warning System"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "landguard-super-secret-production-key-2026-ndma")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./landguard.db")
    CORS_ORIGINS: list = ["*"]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
