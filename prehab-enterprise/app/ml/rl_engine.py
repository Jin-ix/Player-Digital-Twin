import numpy as np
import random

class RLAgent:
    def __init__(self):
        # Actions the AI Coach can prescribe
        self.actions = [
            "💤 Complete Rest", 
            "🧘 Active Recovery (Yoga/Swim)", 
            "📉 Reduce Load (-30%)", 
            "🔄 Maintain Load", 
            "📈 Overload (+10%)"
        ]
        
        # Q-Table (State-Action Map) - Pre-trained simulation
        # States: [Low Recovery, Med Recovery, High Recovery]
        # We assign higher values to 'smart' decisions manually for this demo
        self.q_table = {
            "low_recovery":  [0.8, 0.9, 0.6, -0.5, -0.9], # Best: Active Recovery
            "med_recovery":  [-0.2, 0.4, 0.2, 0.8, 0.1],  # Best: Maintain
            "high_recovery": [-0.8, -0.5, -0.2, 0.6, 0.9] # Best: Overload
        }

    def get_action(self, hrv: float, sleep: float, fatigue: int):
        """
        Determines the optimal training intervention based on biological state.
        """
        # 1. Discretize State (Classify the athlete)
        if hrv < 50 or sleep < 6.0 or fatigue > 7:
            state = "low_recovery"
        elif hrv < 75 and sleep > 6.5:
            state = "med_recovery"
        else:
            state = "high_recovery"

        # 2. Select Best Action (Greedy Policy)
        # Find index of highest Q-value
        best_action_idx = np.argmax(self.q_table[state])
        confidence = self.q_table[state][best_action_idx]
        
        selected_action = self.actions[best_action_idx]

        # 3. Generate Explanation
        explanation = ""
        if state == "low_recovery":
            explanation = "Athlete is in a deficit. High intensity now carries negative reward (injury risk)."
        elif state == "high_recovery":
            explanation = "System is primed. Overloading now yields maximum fitness adaptation reward."
        else:
            explanation = "Stable state detected. Maintaining load preserves fitness without spiking risk."

        return {
            "action": selected_action,
            "confidence": round(abs(confidence) * 100, 1),
            "state_assessment": state.replace("_", " ").title(),
            "explanation": explanation
        }