import os
from typing import List, Optional
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Load project .env file with override=True so it takes priority over OS env vars
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
load_dotenv(dotenv_path=env_path, override=True)

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
        "https://resume3-0.vercel.app",
        "https://resume3-admin.vercel.app",
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
    
    # SMS Gateway Provider (Fast2SMS / Twilio)
    FAST2SMS_API_KEY: Optional[str] = None
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None
    
    # Meta WhatsApp Business Cloud API
    META_WHATSAPP_TOKEN: Optional[str] = None
    META_WHATSAPP_PHONE_ID: Optional[str] = None

    
    # AI Engine Provider (ollama, openai, gemini, or mock)
    AI_PROVIDER: str = "mock"  # "mock", "ollama", "openai"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3:latest"
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    
    # Speech-to-Text Provider (whisper, faster-whisper, mock)
    STT_PROVIDER: str = "mock"  # "mock", "whisper"
    
    # Storage Provider (local, google_drive, cloudinary)
    STORAGE_PROVIDER: str = "cloudinary"  # "local", "google_drive", "cloudinary"
    LOCAL_STORAGE_DIR: str = "./storage/recordings"
    GOOGLE_DRIVE_FOLDER_ID: Optional[str] = None
    GOOGLE_DRIVE_SERVICE_ACCOUNT_FILE: Optional[str] = None
    
    # Cloudinary Storage
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None
    CLOUDINARY_URL: Optional[str] = None
    
    # Recording Retention
    RECORDING_RETENTION_DAYS: int = 90
    
    # Default Assessment Passing Score (percentage)
    DEFAULT_PASSING_SCORE: float = 80.0

    # Email / SMTP Configuration (Gmail App Password)
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: Optional[str] = None
    SMTP_FROM_NAME: str = "CloudOps AI Assessment Platform"

settings = Settings()
