from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from app.db.database import get_db
from app.services import injury_service
from app.schemas.homework import HomeworkResponse, HomeworkTask

router = APIRouter()

@router.get("/{player_id}", response_model=HomeworkResponse)
def get_daily_homework(player_id: str, db: Session = Depends(get_db)):
    # 1. Check for Active Injury
    active_injury = injury_service.get_active_injury(db, player_id)
    
    tasks = []
    status = "Active"

    if active_injury:
        status = "Injured"
        # 2. Get details manually because active_injury is a raw dict (SQL workaround)
        # Handle dict vs object access safely
        def get_attr(obj, key):
            if isinstance(obj, dict): return obj.get(key)
            return getattr(obj, key, None)

        lib_id = get_attr(active_injury, "injury_library_id")
        injury_details = injury_service.get_injury_library_item(db, lib_id)
        
        exercises = []
        video_url = None
        if injury_details:
             # Deserialize if needed (it might be string in DB)
             if isinstance(injury_details.recovery_exercises, str):
                 import json
                 try:
                     exercises = json.loads(injury_details.recovery_exercises)
                 except:
                     exercises = []
             else:
                 exercises = injury_details.recovery_exercises
             video_url = injury_details.video_url

        if exercises:
            for idx, ex in enumerate(exercises):
                # Parse "3x30s" or similar into sets/reps loosely if needed
                # For now just mapping structure
                tasks.append(HomeworkTask(
                    id=f"locked_{get_attr(active_injury, 'id')}_{idx}",
                    title=ex.get("name", "Rehab Exercise"),
                    description="Mandatory Recovery Protocol",
                    reps=ex.get("reps", ""),
                    sets="", # parsing logic can be improved
                    video_url=video_url,
                    is_locked=True
                ))
    else:
        # 2. Return standard training (Mocked for now as per plan focus)
        tasks = [
            HomeworkTask(
                id="daily_1", title="Nordic Hamstring Curls", reps="5", sets="3", 
                video_url="https://youtube.com/...", is_locked=False
            ),
            HomeworkTask(
                id="daily_2", title="Copenhagen Planks", reps="30s", sets="3", 
                video_url="https://youtube.com/...", is_locked=False
            )
        ]

    return HomeworkResponse(
        date=str(date.today()),
        status=status,
        tasks=tasks
    )
