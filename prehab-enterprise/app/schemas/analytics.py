from pydantic import BaseModel
from typing import List, Optional, Dict, Any

# ==========================================
# 1. INPUT MODELS (What the Dashboard Sends)
# ==========================================

class BiometricsInput(BaseModel):
    sport: str
    age: int
    weight: float
    height: float
    hrv: float
    vo2_max: float
    sleep_hours: float
    stress_index: float
    sleep_quality: float
    resting_hr: float
    blood_oxygen: float
    hr_response: float

class LoadMetricsInput(BaseModel):
    rpe: float
    duration_minutes: float
    chronic_tolerance: float
    acwr: float
    sprint_distance: float
    bowling_overs: Optional[float] = 0.0 # Made Optional with default
    jump_count: Optional[float] = 0.0    # Made Optional with default

class WellnessInput(BaseModel):
    mood_score: int
    motivation: int
    life_stress: int
    mental_fatigue: int

class AnalysisInput(BaseModel):
    biometrics: Optional[BiometricsInput] = None
    load_metrics: Optional[LoadMetricsInput] = None
    wellness: Optional[WellnessInput] = None
    mechanics: Optional[Dict[str, Any]] = None
    # REQUIRED: The dashboard sends a list of lists [[load, hrv, sleep], ...]
    history: Optional[List[List[float]]] = None 

# ==========================================
# 2. OUTPUT MODELS (What the Backend Returns)
# ==========================================

class AnalysisResponse(BaseModel):
    user_id: Optional[str] = "unknown"
    report_type: Optional[str] = "Standard"
    score: Optional[float] = 0.0
    alerts: Optional[List[str]] = []
    recommendations: Optional[List[str]] = []
    
    # Graphs & Data
    forecast: Optional[List[float]] = []
    raw_metrics: Optional[Dict[str, Any]] = {}
    
    # This allows ANY extra data (like anomaly_report) without crashing
    anomaly_report: Optional[Dict[str, Any]] = None
    
    # Legacy support (prevents crash if old keys linger)
    tabnet_analysis: Optional[Dict[str, Any]] = None 
    longterm_pattern: Optional[Dict[str, Any]] = None

    class Config:
        extra = "allow" # CRITICAL: Allows backend to send extra fields without error