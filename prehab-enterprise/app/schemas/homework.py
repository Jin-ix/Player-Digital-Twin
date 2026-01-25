from typing import List, Optional, Any, Dict
from pydantic import BaseModel

class HomeworkTask(BaseModel):
    id: str
    title: str
    description: str = ""
    reps: str
    sets: str
    video_url: Optional[str] = None
    is_locked: bool = False
    is_completed: bool = False

class HomeworkResponse(BaseModel):
    date: str
    status: str # "Active" | "Injured"
    tasks: List[HomeworkTask]
