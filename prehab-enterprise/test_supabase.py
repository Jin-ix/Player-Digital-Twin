import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

print(f"Connecting to {url}...")
try:
    supabase = create_client(url, key)
    # Ping or simple fetch
    # Assuming player_history table exists, or just check 'auth'
    print("Client initialized. Fetching data...")
    res = supabase.table('player_history').select("*").limit(1).execute()
    print("Success!", res)
except Exception as e:
    print("Failed:", e)
