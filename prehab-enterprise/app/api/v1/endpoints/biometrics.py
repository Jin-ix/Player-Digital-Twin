from fastapi import APIRouter, File, UploadFile
from typing import List
import numpy as np

router = APIRouter()

@router.post("/analyze_video")
async def analyze_video(file: UploadFile = File(...)):
    # Simulate processing time
    # In a real scenario, we'd save the file and run CV models
    
    # Generate Mock Data (matching the Streamlit output)
    frames = list(range(0, 50))
    
    # Kinematics
    knee_flexion = [45 + 15 * np.sin(i/5) for i in frames]
    valgus_stress = [5 + 2 * np.cos(i/3) + np.random.normal(0, 0.5) for i in frames]
    
    # Kinetics (GRF)
    # Left leg active frames 10-40, Right 12-42
    grf_left = [0 if i < 10 or i > 40 else 800 + 100*np.random.randn() for i in frames]
    grf_right = [0 if i < 12 or i > 42 else 750 + 100*np.random.randn() for i in frames]

    return {
        "status": "success",
        "frames": frames,
        "metrics": {
            "acl_risk": "78.5%",
            "peak_valgus": "18.5°",
            "landing_force": "3.2 BW",
            "critical_state": "Unstable"
        },
        "timeseries": {
            "flexion": knee_flexion,
            "valgus": valgus_stress,
            "grf_left": grf_left,
            "grf_right": grf_right
        },
        "radar": {
            "athlete": [50, 40, 80, 60, 70],
            "elite": [90, 95, 80, 85, 90],
            "categories": ['Stability', 'Symmetry', 'Force', 'Mobility', 'Power']
        }
    }
