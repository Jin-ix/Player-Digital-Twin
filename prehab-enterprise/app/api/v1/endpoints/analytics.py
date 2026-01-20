# app/api/v1/endpoints/analytics.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Any
from app.db.database import get_db
from app.db.models import PlayerHistory

router = APIRouter()

@router.get("/history", summary="Fetch History from Supabase")
def get_player_history(
    player_id: str = None, 
    db: Session = Depends(get_db)
) -> Any:
    """
    Fetch training history directly from the Supabase database.
    Optional: Filter by player_id if provided.
    """
    query = db.query(PlayerHistory)
    
    # If the frontend sends a specific player ID, filter for it
    if player_id:
        query = query.filter(PlayerHistory.player_id == player_id)
    
    # Execute the query
    history_data = query.all()
    
    if not history_data:
        return {"msg": "No history data found", "data": []}

    return {"data": history_data}