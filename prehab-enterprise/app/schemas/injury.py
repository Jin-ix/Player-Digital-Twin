from typing import List, Optional, Any, Dict
from pydantic import BaseModel
from datetime import date

# Shared Properties
class InjuryLibraryBase(BaseModel):
    body_area: str
    injury_type: str
    immediate_action: Optional[str] = None
    recovery_exercises: Optional[List[Dict[str, Any]]] = None
    video_url: Optional[str] = None
    red_flags: Optional[str] = None
    estimated_recovery_days: Optional[int] = 14

class InjuryLibrary(InjuryLibraryBase):
    id: int

    class Config:
        from_attributes = True

# Assignment
class InjuryAssignmentCreate(BaseModel):
    player_id: str
    injury_library_id: int
    start_date: Optional[date] = None

class InjuryAssignmentUpdate(BaseModel):
    status: Optional[str] = None
    healed_date: Optional[date] = None
    progress_percent: Optional[int] = None

class InjuryAssignment(BaseModel):
    id: int
    player_id: str
    injury_library_id: int
    status: str
    start_date: Optional[date]
    healed_date: Optional[date]
    progress_percent: int
    injury_details: Optional[InjuryLibrary] = None

    class Config:
        from_attributes = True
