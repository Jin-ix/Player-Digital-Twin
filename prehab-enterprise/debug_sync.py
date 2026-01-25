import requests
import json

url = "http://127.0.0.1:8000/api/v1/analytics/log"
payload = {
    "player_id": "player_10",
    "rpe": 7,
    "duration": 90,
    "sleep_hours": 7.5,
    "mood": 3,
    "soreness": 2
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
