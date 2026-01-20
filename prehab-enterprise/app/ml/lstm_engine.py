import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from typing import List

# === THE NEURAL NETWORK ===
class SportsGRU(nn.Module):
    def __init__(self, input_size=3, hidden_size=64, num_layers=2, output_size=1, dropout=0.2):
        """
        Bidirectional GRU for robust time-series forecasting.
        Input Features: [Load, HRV, Sleep]
        """
        super(SportsGRU, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        # GRU Layer (Bidirectional)
        self.gru = nn.GRU(
            input_size, 
            hidden_size, 
            num_layers, 
            batch_first=True, 
            dropout=dropout, 
            bidirectional=True
        )
        
        # Fully Connected Layer
        self.fc = nn.Linear(hidden_size * 2, output_size)
    
    def forward(self, x):
        h0 = torch.zeros(self.num_layers * 2, x.size(0), self.hidden_size).to(x.device)
        out, _ = self.gru(x, h0)
        out = self.fc(out[:, -1, :])
        return out

# === THE ENGINE (TRAINING & PREDICTION) ===
class PredictiveService:
    def __init__(self):
        self.model = SportsGRU()
        self.scaler = MinMaxScaler()
        self.criterion = nn.MSELoss()
        self.optimizer = optim.Adam(self.model.parameters(), lr=0.001)
        self.is_fitted = False
        
        # Initialize with dummy data to define scaler bounds
        dummy_data = np.array([[0, 0, 0], [1000, 150, 12]]) 
        self.scaler.fit(dummy_data)

    def create_sequences(self, data: np.ndarray, seq_length: int):
        xs, ys = [], []
        if len(data) <= seq_length: return None, None
        for i in range(len(data) - seq_length):
            x = data[i:(i + seq_length)]
            y = data[i + seq_length][0] 
            xs.append(x)
            ys.append(y)
        return np.array(xs), np.array(ys)

    def train_on_history(self, raw_history: List[List[float]]):
        """ Live Training: Retrains the model instantly when user uploads CSV. """
        if len(raw_history) < 14: return False
            
        data_scaled = self.scaler.fit_transform(np.array(raw_history))
        X, y = self.create_sequences(data_scaled, seq_length=7)
        
        if X is None: return False

        X_train = torch.tensor(X, dtype=torch.float32)
        y_train = torch.tensor(y, dtype=torch.float32).view(-1, 1)
        
        self.model.train()
        epochs = 50 
        
        for epoch in range(epochs):
            self.optimizer.zero_grad()
            outputs = self.model(X_train)
            loss = self.criterion(outputs, y_train)
            loss.backward()
            self.optimizer.step()
            
        self.is_fitted = True
        return True

    def predict_next_15_days(self, recent_history: List[List[float]]):
        """
        Forecasts the next 15 days (2 Weeks).
        """
        # If not enough data, return a flatline (50% risk)
        if len(recent_history) < 7: return [50] * 15
            
        # Scale Input
        input_seq = np.array(recent_history[-7:]) # Take last 7 days
        input_scaled = self.scaler.transform(input_seq)
        
        # Convert to Tensor
        current_seq = torch.tensor(input_scaled, dtype=torch.float32).unsqueeze(0)
        
        predictions = []
        self.model.eval()
        
        with torch.no_grad():
            for _ in range(15):
                # Predict
                pred_val = self.model(current_seq)
                predictions.append(pred_val.item())
                
                # Autoregressive Update:
                # We assume HRV/Sleep stay consistent for the forecast horizon
                avg_hrv = input_seq[:, 1].mean()
                avg_sleep = input_seq[:, 2].mean()
                
                new_step = torch.tensor([[pred_val.item(), avg_hrv, avg_sleep]], dtype=torch.float32)
                current_seq = torch.cat((current_seq[:, 1:, :], new_step.unsqueeze(0)), dim=1)
        
        # Inverse Scale to 0-100 Risk Score
        risk_scores = [max(0, min(100, p * 100)) for p in predictions]
        
        return risk_scores