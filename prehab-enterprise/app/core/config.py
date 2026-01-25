# app/core/config.py
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Player Digital Twin"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8 
    
    # PASTE YOUR REAL SUPABASE URL HERE
    # SUPABASE URL (From verify_fix.py credentials) - FAILED CONNECTION
    # DATABASE_URL: str = "postgresql://postgres.lobmtyvthfsjhdpadvdi:SuperSecretPass123%23@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"
    
    # FALLBACK: SQLite - Now with fixed table creation in main.py
    DATABASE_URL: str = "sqlite:///./prehab_v5.db"

    class Config:
        case_sensitive = True

settings = Settings()