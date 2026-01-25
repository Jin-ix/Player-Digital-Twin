import urllib.request
import json

try:
    url = "http://127.0.0.1:8000/api/v1/injuries/library/Hamstring"
    print(f"Fetching {url}...")
    with urllib.request.urlopen(url) as response:
        data = json.loads(response.read().decode())
        
        with open("api_result.txt", "w") as f:
            json.dump(data, f, indent=2)
            
    print("Saved to api_result.txt")
except Exception as e:
    print(f"Error: {e}")
