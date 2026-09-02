import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

    PROJECT_NAME: str = "CloudOps AI Assessment Platform"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "*"
    ]
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./cloudops_interview.db"
    # For Neon PostgreSQL: "postgresql+asyncpg://user:pass@host/dbname?ssl=require"
    
    # Security / Auth
    SECRET_KEY: str = "cloudops-ai-assessment-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    FIREBASE_PROJECT_ID: Optional[str] = None
    FIREBASE_CREDENTIALS_PATH: Optional[str] = None
    MOCK_AUTH_ENABLED: bool = True  # Allows instant dev/demo login without external Firebase setup
    
    # AI Engine Provider (ollama, openai, gemini, or mock)
    AI_PROVIDER: str = "mock"  # "mock", "ollama", "openai"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3:latest"
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    
    # Speech-to-Text Provider (whisper, faster-whisper, mock)
    STT_PROVIDER: str = "mock"  # "mock", "whisper"
    
    # Storage Provider (local, google_drive)
    STORAGE_PROVIDER: str = "local"  # "local", "google_drive"
    LOCAL_STORAGE_DIR: str = "./storage/recordings"
    GOOGLE_DRIVE_FOLDER_ID: Optional[str] = None
    GOOGLE_DRIVE_SERVICE_ACCOUNT_FILE: Optional[str] = None
    
    # Recording Retention
    RECORDING_RETENTION_DAYS: int = 90
    
    # Default Assessment Passing Score (percentage)
    DEFAULT_PASSING_SCORE: float = 80.0

settings = Settings()
