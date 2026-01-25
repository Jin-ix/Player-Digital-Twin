from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class PlayerProfile(Base):
    __tablename__ = "player_profiles"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(String, ForeignKey("users.id"), unique=True, index=True)
    height = Column(Float, nullable=True) # in cm
    weight = Column(Float, nullable=True) # in kg
    position = Column(String, nullable=True)
    jersey_number = Column(Integer, nullable=True)
    bio = Column(Text, nullable=True)
    
    # Relationships
    # user = relationship("User", back_populates="profile") # Assuming User has backref, or we can leave it decoupled for now
