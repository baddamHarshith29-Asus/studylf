import os
from typing import List, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "STUDLYF Backend"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = os.getenv("JWT_SECRET", "supersecretkeychangeinproduction12345678")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # DB URL: Default to SQLite for local development if PostgreSQL is not available
    DATABASE_URL: str = os.getenv("DATABASE_URL", "mongodb://localhost:27017/studlyf")
    
    # Cache & Background Worker
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # AI APIs
    GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY")
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
    TAVILY_API_KEY: Optional[str] = os.getenv("TAVILY_API_KEY")
    FIRECRAWL_API_KEY: Optional[str] = os.getenv("FIRECRAWL_API_KEY")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3")
    
    # Supabase (Auth + Storage)
    SUPABASE_URL: Optional[str] = os.getenv("SUPABASE_URL")
    SUPABASE_KEY: Optional[str] = os.getenv("SUPABASE_KEY")
    SUPABASE_BUCKET: str = os.getenv("SUPABASE_BUCKET", "studlyf-assets")
    
    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: Optional[str] = os.getenv("GOOGLE_CLIENT_SECRET")
    
    # Email Senders
    RESEND_API_KEY: Optional[str] = os.getenv("RESEND_API_KEY")
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
