# FILE: app/core/config.py

import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App Basics
    PROJECT_NAME: str = "MentorMatch Gateway"
    API_V1_STR: str = "/api/v1"

    # --- GOOGLE OAUTH SETTINGS ---
    # Get this from Google Cloud Console
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str = ""
    SUPER_ADMIN_EMAIL: str

    # --- SECURITY ---
    # Used to sign the internal JWTs we issue after Google Login
    JWT_SECRET_KEY: str 
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # Database Settings (Loaded from .env automatically)
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    DATABASE_HOST: str = "db"
    DATABASE_PORT: int = 5432

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.POSTGRES_DB}"

    # --- CORS ---
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Cloudflare Turnstile
    TURNSTILE_SITE_KEY: str = ""
    TURNSTILE_SECRET_KEY: str = "1x0000000000000000000000000000000AA"

    # --- CHATVAT ---
    CHATVAT_HOST: str = "172.17.0.1"
    CHATVAT_PORT: str = "8000"

    @property
    def CHATVAT_ENGINE_URL(self) -> str:
        return f"http://{self.CHATVAT_HOST}:{self.CHATVAT_PORT}"

    class Config:
        # Tells Pydantic to read the .env file
        env_file = ".env"
        case_sensitive = True

# Create a single instance to import elsewhere
settings = Settings()