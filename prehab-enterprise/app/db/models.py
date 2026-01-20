from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean
from sqlalchemy.sql import func
from app.db.database import Base

# 1. User Table (Used for Login/Auth)
class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String)
    is_active = Column(Boolean, default=True)

# 2. Player History Table (Used for your CSV Data)
class PlayerHistory(Base):
    __tablename__ = "player_history"

    id = Column(Integer, primary_key=True, index=True)
    # If your CSV has player_id as text, use String. If it's a UUID, change this to String/UUID.
    player_id = Column(String, index=True) 
    date = Column(Date)
    
    # Metrics (Matches your CSV columns)
    load = Column(Float, nullable=True)
    hrv = Column(Float, nullable=True)
    sleep = Column(Float, nullable=True)
    wellness_score = Column(Float, nullable=True)
    rpe_score = Column(Float, nullable=True)
    duration_minutes = Column(Float, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())