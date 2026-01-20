from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# 1. USE SETTINGS INSTEAD OF HARDCODED STRING
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

# 2. CREATE ENGINE
# The connect_args dictionary addresses the "client encoding" error specific to Supabase Poolers
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    pool_pre_ping=True,
    connect_args={
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
        "options": "-c client_encoding=UTF8"
    }
)

# 3. SESSION & BASE
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 4. DEPENDENCY
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()