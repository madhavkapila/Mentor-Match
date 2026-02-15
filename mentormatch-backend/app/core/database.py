# FILE: app/core/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# 1. Create the Database Engine
engine = create_engine(settings.DATABASE_URL)

# 2. Create a SessionLocal class
# Each request gets its own temporary database session.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. Create the Base class
# All database models will inherit from this.
Base = declarative_base()

# 4. Dependency Injection
# Opens a connection for a request and closes it safely afterwards.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()