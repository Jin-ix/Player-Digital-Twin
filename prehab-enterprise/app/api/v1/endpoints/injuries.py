from typing import List, Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.database import get_db
from app.models import injury as models
from app.schemas import injury as schemas
from app.services import injury_service

router = APIRouter()

@router.get("/library/{body_area}", response_model=List[schemas.InjuryLibrary])
def read_injuries_by_area(body_area: str, db: Session = Depends(get_db)):
    injuries = injury_service.get_injuries_by_body_area(db, body_area=body_area)
    return injuries

@router.get("/test", response_model=Dict[str, str])
def test_endpoint():
    return {"status": "ok", "message": "Injury router is active"}

@router.get("/check_db", response_model=Dict[str, str])
def check_db_connection(db: Session = Depends(get_db)):
    try:
        # Simple query
        db.execute(text("SELECT 1"))
        return {"status": "ok", "message": "Database connected"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.get("/current/{player_id}", response_model=Optional[schemas.InjuryAssignment])
def read_active_injury(player_id: str, db: Session = Depends(get_db)):
    try:
        injury = injury_service.get_active_injury(db, player_id=player_id)
        if not injury:
            return None
        return injury
    except Exception as e:
        import traceback
        print(f"CRITICAL ERROR in read_active_injury: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal Error: {str(e)}")

@router.get("/all/active", response_model=List[schemas.InjuryAssignment])
def read_all_active_injuries(db: Session = Depends(get_db)):
    # Simple query to get all active assignments
    return db.query(models.InjuryAssignment).filter(models.InjuryAssignment.status == "Active").all()

@router.post("/assign", response_model=schemas.InjuryAssignment)
def assign_injury(assignment: schemas.InjuryAssignmentCreate, db: Session = Depends(get_db)):
    return injury_service.create_injury_assignment(db, assignment=assignment)

@router.post("/resolve/{assignment_id}", response_model=Optional[schemas.InjuryAssignment])
def resolve_injury_status(assignment_id: int, db: Session = Depends(get_db)):
    injury = injury_service.resolve_injury(db, assignment_id=assignment_id)
    if not injury:
        # If it returns None, maybe it doesn't exist or error.
        # But if we just want to avoid 500 on error (caught in service), we might handle it.
        # Service returns None on error.
        raise HTTPException(status_code=404, detail="Injury assignment not found or failed to update")
    return injury

@router.post("/progress/{assignment_id}", response_model=Any)
def update_rehab_progress(assignment_id: int, percent: int, db: Session = Depends(get_db)):
    injury = injury_service.update_progress(db, assignment_id=assignment_id, percent=percent)
    if not injury:
         raise HTTPException(status_code=404, detail="Injury assignment not found or failed to update")
    return injury
