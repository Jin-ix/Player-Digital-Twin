import numpy as np
from typing import List, Dict, Any

class AnomalyService:
    def __init__(self):
        pass

    def detect_anomalies(self, history: List[List[float]]) -> Dict[str, Any]:
        """
        Scans history for Z-score anomalies and generates specific coaching advice.
        """
        if not history or len(history) < 5:
            return {"detected": False, "anomalies": [], "advice": []}

        # Extract Metrics
        loads = np.array([day[0] for day in history])
        hrvs = np.array([day[1] for day in history])
        sleeps = np.array([day[2] for day in history])

        # Z-Score Detection Helper
        def get_outliers(data):
            if np.std(data) == 0: return []
            z_scores = (data - np.mean(data)) / np.std(data)
            return np.where(np.abs(z_scores) > 1.5)[0].tolist()

        load_idx = get_outliers(loads)
        hrv_idx = get_outliers(hrvs)
        
        anomalies = []
        coach_advice = []

        # Process Load Spikes
        for idx in load_idx:
            val = loads[idx]
            avg = np.mean(loads)
            if val > avg:
                anomalies.append({"day": int(idx), "type": "Acute Load Spike", "val": val})
                coach_advice.append(f"Day {idx+1}: Acute Load Spike detected. Reduce session intensity by 20% to normalize.")
            elif val < avg:
                anomalies.append({"day": int(idx), "type": "Undertraining", "val": val})

        # Process HRV Crashes
        for idx in hrv_idx:
            val = hrvs[idx]
            avg = np.mean(hrvs)
            if val < avg:
                anomalies.append({"day": int(idx), "type": "HRV Crash", "val": val})
                coach_advice.append(f"Day {idx+1}: Significant HRV Drop. Prioritize sleep and active recovery immediately.")

        return {
            "detected": len(anomalies) > 0,
            "anomalies": anomalies,
            "advice": list(set(coach_advice)) # Remove duplicates
        }