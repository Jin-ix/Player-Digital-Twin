from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey, BigInteger, JSON
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class InjuryLibrary(Base):
    __tablename__ = "injury_library"

    id = Column(Integer, primary_key=True, index=True)
    body_area = Column(Text, nullable=False)
    injury_type = Column(Text, nullable=False)
    immediate_action = Column(Text, nullable=True)
    # Storing as Text for SQLite compatibility simplicity
    recovery_exercises = Column(Text, nullable=True) 
    video_url = Column(Text, nullable=True)
    red_flags = Column(Text, nullable=True)
    estimated_recovery_days = Column(Integer, default=14)

class InjuryAssignment(Base):
    __tablename__ = "injury_assignments"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Text, nullable=False)
    injury_library_id = Column(Integer, ForeignKey("injury_library.id"))
    status = Column(Text, default='Active') # Active, Healed
    start_date = Column(Date)
    healed_date = Column(Date, nullable=True)
    progress_percent = Column(Integer, default=0)

    injury_details = relationship("InjuryLibrary")
