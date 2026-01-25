from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean
from sqlalchemy.sql import func
from app.db.database import Base

# UserDB removed - migrated to app.models.user.User

# 2. Player History Table (Used for your CSV Data)
class PlayerHistory(Base):
    __tablename__ = "player_history"

    id = Column(Integer, primary_key=True, index=True)
    # If your CSV has player_id as text, use String. If it's a UUID, change this to String/UUID.
    player_id = Column(String, index=True) 
    date = Column(Date)
    
    # Metrics (Matches your CSV columns)
    # Updated to match the SQL Schema provided
    load = Column(Float, nullable=True) # Acute Load
    hrv = Column(Float, nullable=True)
    sleep = Column(Float, nullable=True)
    fatigue = Column(Float, nullable=True)
    mood = Column(Float, nullable=True)
    
    # Detailed Inputs
    wellness_score = Column(Float, nullable=True)
    rpe_score = Column(Float, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    load_total = Column(Float, nullable=True)
    
    # Defaults handled by DB, but good to have here
    sleep_hours = Column(Float, default=0)
    sleep_quality = Column(Integer, default=5)
    energy = Column(Integer, default=5)
    soreness = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    session_date = Column(DateTime(timezone=True), server_default=func.now())