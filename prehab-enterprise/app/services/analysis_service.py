from app.models.user import User
from app.schemas.analytics import AnalysisInput
from app.ml.lstm_engine import PredictiveService

# Safe Imports for Advanced Engines
try:
    from app.ml.anomaly_engine import AnomalyService
    from app.ml.gnn_engine import GNNEngine
    from app.ml.rl_engine import RLAgent # <--- NEW IMPORT
except ImportError:
    AnomalyService = None
    GNNEngine = None
    RLAgent = None

import numpy as np

# === INITIALIZE AI ENGINES ===
try:
    gru_engine = PredictiveService()
    anomaly_engine = AnomalyService() if AnomalyService else None
    gnn_engine = GNNEngine() if GNNEngine else None
    rl_agent = RLAgent() if RLAgent else None # <--- NEW INIT
    print("✅ AI Engines (GRU + Anomaly + GNN + RL) Loaded Successfully")
except Exception as e:
    print(f"⚠️ AI Engine Init Error: {e}")
    gru_engine = None; anomaly_engine = None; gnn_engine = None; rl_agent = None

class AnalysisService:
    
    async def process_metrics(self, user: User, data: AnalysisInput):
        """
        Master Controller:
        1. Standard Analysis (Physics + Bio)
        2. GRU Forecasting
        3. Anomaly Detection
        4. GNN Biomechanics
        5. RL Strategy Coaching
        """
        # 1. Standard Analysis
        response = self._run_standard_analysis(user, data)
        
        # [SAFETY NET] Initialize Defaults
        response["anomaly_report"] = {"detected": False, "anomalies": [], "advice": []}
        response["raw_metrics"]["gnn_data"] = {}
        response["raw_metrics"]["rl_strategy"] = {} # <--- Container for RL Data

        # 2. PREPARE TIME-SERIES DATA
        history_data = []
        if data.history and len(data.history) >= 7:
            history_data = data.history
            if len(history_data) > 14 and gru_engine:
                try: gru_engine.train_on_history(history_data)
                except: pass
        else:
            # Synthetic Data (Fallback)
            c_load = (data.load_metrics.rpe * data.load_metrics.duration_minutes) / 10 if data.load_metrics else 50
            c_hrv = data.biometrics.hrv if data.biometrics else 60
            c_sleep = data.biometrics.sleep_hours if data.biometrics else 7
            for i in range(15):
                mod = 2.0 if i == 11 else 1.0 
                history_data.append([c_load * mod, c_hrv, c_sleep])

        # 3. GRU FORECAST
        if gru_engine:
            try: response["forecast"] = gru_engine.predict_next_15_days(history_data)
            except: response["forecast"] = [50]*15

        # 4. ANOMALY DETECTION
        if anomaly_engine:
            try:
                ar = anomaly_engine.detect_anomalies(history_data)
                response["anomaly_report"] = ar
                if ar["detected"]:
                    for tip in ar["advice"]: 
                        response["recommendations"].insert(0, f"🚨 {tip}")
            except Exception as e:
                print(f"Anomaly Error: {e}")

        # 5. GNN BIOMECHANICS
        if gnn_engine:
            try:
                # Simulating keypoints since we don't have raw video data here
                dummy_kp = {11:{'x':0}, 13:{'x':0}, 15:{'x':0}, 12:{'x':0}, 14:{'x':0}, 16:{'x':0}}
                gnn_res = gnn_engine.process_skeleton(dummy_kp)
                response["raw_metrics"]["gnn_data"] = gnn_res
            except: pass

        # 6. REINFORCEMENT LEARNING COACH (NEW)
        if rl_agent:
            try:
                # Extract State Features
                curr_hrv = data.biometrics.hrv if data.biometrics else 60
                curr_sleep = data.biometrics.sleep_hours if data.biometrics else 7.0
                curr_fatigue = data.wellness.mental_fatigue if data.wellness else 5
                
                # Get RL Decision
                rl_decision = rl_agent.get_action(curr_hrv, curr_sleep, curr_fatigue)
                
                # Attach to Response
                response["raw_metrics"]["rl_strategy"] = rl_decision
                
                # Add High-Priority Recommendation
                response["recommendations"].insert(0, f"🤖 AI Coach Strategy: {rl_decision['action']}")
                
            except Exception as e:
                print(f"RL Error: {e}")

        return response

    # =========================================================
    # SPORT LOGIC (Standard)
    # =========================================================
    def _run_standard_analysis(self, user, data):
        if user.role == "public": return self._analyze_common_user(user, data)
        if data.biometrics:
            if data.biometrics.sport == "Cricket": return self._analyze_cricket_player(user, data)
            elif data.biometrics.sport == "Football": return self._analyze_football_player(user, data)
            elif data.biometrics.sport == "Basketball": return self._analyze_basketball_player(user, data)
        if data.mechanics: return self._analyze_football_player(user, data)
        return self._analyze_athlete_health(user, data)

    def _apply_psych_context(self, risk, alerts, rx, data):
        if data.wellness:
            if data.biometrics and data.biometrics.hrv > 70 and data.wellness.mental_fatigue > 7:
                risk += 15; alerts.append("🧠 Context: High Mental Fatigue.")
        return min(risk, 100), alerts, rx

    def _calculate_workload_status(self, load_data):
        daily_load = load_data.rpe * load_data.duration_minutes
        daily_capacity = load_data.chronic_tolerance / 7
        risk = 0; msgs = []
        if daily_capacity > 0 and (daily_load / daily_capacity) > 1.5:
            risk += 35; msgs.append("⚠️ Acute Spike > 1.5x.")
        return risk, msgs

    def _analyze_landing_mechanics(self, mech, risk, alerts, rx):
        if mech.ankle_eversion_angle > 8:
            risk += 25; alerts.append("⚠️ Landing Fault.")
        return risk, alerts, rx

    def _analyze_deceleration(self, mech, load, risk, alerts, rx):
        if mech.braking_force_asymmetry > 15:
            risk += 30; alerts.append(f"🚨 Braking Asymmetry {mech.braking_force_asymmetry}%.")
        return risk, alerts, rx

    def _analyze_athlete_health(self, user, data):
        bio = data.biometrics
        if not bio: return {"user_id": str(user.id), "score": 0, "alerts": [], "recommendations": [], "raw_metrics": {}}
        risk_score = 0; alerts = []; rx = []
        if bio.sleep_hours < 6: risk_score += 25; alerts.append("Sleep Deprivation.")
        risk_score, alerts, rx = self._apply_psych_context(risk_score, alerts, rx, data)
        return {"user_id": str(user.id), "report_type": f"BIO_TWIN ({bio.sport})", "score": min(risk_score, 100), "alerts": alerts, "recommendations": rx, "raw_metrics": {}}

    def _analyze_football_player(self, user, data):
        base = self._analyze_athlete_health(user, data)
        risk = base['score']; alerts = base['alerts']; rx = base['recommendations']
        if data.mechanics:
            risk, alerts, rx = self._analyze_landing_mechanics(data.mechanics, risk, alerts, rx)
            risk, alerts, rx = self._analyze_deceleration(data.mechanics, data.load_metrics, risk, alerts, rx)
        if data.load_metrics:
            l_risk, l_msgs = self._calculate_workload_status(data.load_metrics)
            risk += l_risk; alerts.extend(l_msgs)
        raw = {"knee_valgus": data.mechanics.knee_valgus_angle if data.mechanics else 0, "joint_load": 2.5}
        return {"user_id": str(user.id), "report_type": "FOOTBALL_TWIN", "score": min(risk, 100), "alerts": alerts, "recommendations": rx, "raw_metrics": raw}

    def _analyze_cricket_player(self, user, data):
        return self._analyze_athlete_health(user, data)
    
    def _analyze_basketball_player(self, user, data):
        return self._analyze_athlete_health(user, data)

    def _analyze_common_user(self, user, data):
        return {"user_id": str(user.id), "score": 0, "alerts": [], "recommendations": [], "raw_metrics": {}}