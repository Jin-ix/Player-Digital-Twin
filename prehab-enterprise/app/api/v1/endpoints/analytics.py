# app/api/v1/endpoints/analytics.py
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Any
from app.db.database import get_db
from app.db.models import PlayerHistory
from app.schemas.analytics import AnalysisInput, AnalysisResponse, LogEntryInput
from app.ml.anomaly_engine import AnomalyService
import numpy as np
from datetime import datetime

router = APIRouter()
anomaly_service = AnomalyService()

@router.post("/log", summary="Log Daily Metrics & Update Twin")
def log_daily_metrics(
    payload: LogEntryInput = Body(...),
    db: Session = Depends(get_db)
):
    """
    Saves daily logs to Supabase and triggers a Twin update.
    """
    try:
        # 1. Calculate Derived Metrics
        acute_load = payload.rpe * payload.duration
        
        # 2. Save to DB
        new_entry = PlayerHistory(
            player_id=payload.player_id,
            rpe_score=payload.rpe,
            duration_minutes=payload.duration,
            load=acute_load,
            load_total=acute_load,
            sleep_hours=payload.sleep_hours,
            mood=payload.mood,
            soreness=payload.soreness,
            session_date=datetime.utcnow()
        )
        
        db.add(new_entry)
        db.commit()
        db.refresh(new_entry)
        
        # 3. Assess Risks (Twin Logic)
        knee_risk = "High" if acute_load > 600 else "Normal"
        ankle_risk = "High" if payload.soreness >= 4 else "Normal"
        
        alerts = []
        if knee_risk == "High": alerts.append("🚨 High Knee Load Detected")
        if ankle_risk == "High": alerts.append("🚨 Ankle/Calf Soreness Critical")
        
        return {
            "status": "success", 
            "msg": "Daily Log Synced",
            "twin_status": {
                "knee_risk": knee_risk,
                "ankle_risk": ankle_risk,
                "acute_load": acute_load,
                "alerts": alerts
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

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

@router.post("/analyze", response_model=AnalysisResponse, summary="Run AI Anomaly Detection")
def analyze_metrics(
    payload: AnalysisInput = Body(...)
):
    """
    Main AI Engine Endpoint.
    Receives Biometrics + Load + History -> Returns Anomalies + Forecast.
    """
    # 1. Run Anomaly Detection (Statistical)
    history_matrix = payload.history if payload.history else []
    
    # Mock history if empty (for demo purposes if DB is empty)
    if not history_matrix:
        # Generate last 7 days mock data: [Load, HRV, Sleep]
        history_matrix = [
            [500, 60, 7.5], [550, 58, 7.0], [600, 55, 6.5], 
            [800, 40, 5.0], [400, 65, 8.0], [450, 68, 8.2], [500, 70, 7.8]
        ]
        
    analysis_result = anomaly_service.detect_anomalies(history_matrix)
    
    # 2. Logic for RL Strategy (Placeholder for RL Engine)
    # We use simple heuristics based on the input for now
    state_assessment = "Optimal"
    action = "Maintain Load"
    confidence = 95
    
    if payload.load_metrics:
        acwr = payload.load_metrics.acwr
        if acwr > 1.5:
            state_assessment = "Overreaching"
            action = "De-load (-20%)"
            confidence = 88
        elif acwr < 0.8:
            state_assessment = "Detraining"
            action = "Increase Volume (+10%)"
            confidence = 90
            
    if payload.wellness and payload.wellness.mood_score < 4:
        state_assessment = "Psychological Fatigue"
        action = "Active Recovery / Day Off"
        confidence = 92
 
    # 3. Generate Forecast (Mock Projection)
    # Simple linear projection modified by current fatigue
    base_risk = 10
    if payload.load_metrics:
        base_risk += (payload.load_metrics.acwr * 10)
    if payload.wellness:
        base_risk += (10 - payload.wellness.mood_score)
        
    forecast = [base_risk + np.random.normal(0, 2) for _ in range(7)]
    forecast = [max(0, min(100, x)) for x in forecast] # Clip 0-100

    # 4. Generate Additional Graph Data (Mocking for Demo)
    recovery_scatter = [{"sleep": np.random.uniform(5, 9), "hrv": np.random.randint(40, 100), "size": 10} for _ in range(20)]
    load_vol = [{"day": f"D{i}", "load": np.random.randint(300, 900)} for i in range(14)]
    recovery_tank = [{"day": f"D{i}", "fuel": np.random.randint(40, 100)} for i in range(14)]

    return AnalysisResponse(
        user_id="player_10",
        report_type="AI_Anomaly_Scan_v2",
        score=85.0, # Mock readiness
        alerts=[a['type'] for a in analysis_result['anomalies']],
        recommendations=analysis_result['advice'] + [f"Strategic Action: {action}"],
        forecast=forecast,
        raw_metrics={
            "rl_strategy": {
                "state_assessment": state_assessment,
                "action": action,
                "confidence": confidence
            },
            "anomalies": analysis_result['anomalies'],
            "recovery_scatter": recovery_scatter,
            "load_vol": load_vol,
            "recovery_tank": recovery_tank
        }
    )