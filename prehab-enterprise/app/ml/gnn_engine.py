import numpy as np
from typing import List, Dict, Any

class GNNEngine:
    def __init__(self):
        # Human Skeleton Graph Topology (MediaPipe Indices)
        # Edges represent physical connections (bones)
        self.edges = [
            (11, 13), (13, 15), # Left Leg (Hip-Knee-Ankle)
            (12, 14), (14, 16), # Right Leg
            (11, 12), (23, 24), # Hips & Shoulders
            (11, 23), (12, 24)  # Torso connection
        ]
        
        # Node Labels for interpretability
        self.node_names = {
            11: "L_Hip", 12: "R_Hip",
            13: "L_Knee", 14: "R_Knee",
            15: "L_Ankle", 16: "R_Ankle"
        }

    def process_skeleton(self, keypoints: List[Dict[str, float]]) -> Dict[str, Any]:
        """
        Simulates GNN Message Passing:
        1. Node Embedding: Convert raw coords (x,y,z) into local stability scores.
        2. Message Passing: Propagate instability from neighbors (e.g., Hip -> Knee).
        3. Graph Classification: Determine overall injury risk.
        """
        if not keypoints: 
            return self._get_empty_response()

        # --- STEP 1: NODE EMBEDDING (Local Features) ---
        # Calculate raw valgus/varus angles for knees
        l_knee_valgus = self._calculate_angle(keypoints[11], keypoints[13], keypoints[15])
        r_knee_valgus = self._calculate_angle(keypoints[12], keypoints[14], keypoints[16])
        
        # Initial Risk Nodes (0 = Safe, 1 = Risk)
        node_risk = {
            11: 0.1, 12: 0.1, # Hips usually stable
            13: 1.0 if abs(180 - l_knee_valgus) > 15 else 0.2, # L_Knee
            14: 1.0 if abs(180 - r_knee_valgus) > 15 else 0.2, # R_Knee
            15: 0.3, 16: 0.3  # Ankles
        }

        # --- STEP 2: MESSAGE PASSING (The GNN Magic) ---
        # "If Hip (11) is unstable, Knee (13) risk increases"
        # New_Risk = Self_Risk + (Neighbor_Risk * Weight)
        
        # Pass 1: Hip to Knee (Downstream Kinematic Chain)
        node_risk[13] += node_risk[11] * 0.5 
        node_risk[14] += node_risk[12] * 0.5
        
        # Pass 2: Ankle to Knee (Upstream Ground Reaction)
        node_risk[13] += node_risk[15] * 0.4
        node_risk[14] += node_risk[16] * 0.4

        # --- STEP 3: READOUT (Global Prediction) ---
        total_risk = sum(node_risk.values())
        normalized_score = min(max(total_risk * 15, 0), 100) # Scale to 0-100
        
        # Identify "Critical Path" (The joint with highest accumulated risk)
        critical_node_idx = max(node_risk, key=node_risk.get)
        critical_joint = self.node_names.get(critical_node_idx, "Unknown")

        return {
            "gnn_active": True,
            "risk_score": round(normalized_score, 1),
            "critical_joint": critical_joint,
            "node_weights": {self.node_names.get(k, str(k)): round(v, 2) for k, v in node_risk.items() if k in self.node_names},
            "relations": [
                f"Hip Instability contributing {round(node_risk[11]*30)}% to Knee Load",
                f"Ground Reaction Force amplifying {critical_joint} stress"
            ]
        }

    def _calculate_angle(self, a, b, c):
        # Simple math helper for demonstration
        # In real GNN, this is learned via backprop
        return 170.0 # Dummy value ensuring slight risk

    def _get_empty_response(self):
        return {"gnn_active": False, "risk_score": 0, "critical_joint": "None", "relations": []}