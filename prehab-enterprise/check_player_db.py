import sys
import os
from sqlalchemy import text

# Ensure we can import app
sys.path.append(os.getcwd())

from app.db.database import SessionLocal

def check_player_and_insert():
    print("Checking database state...")
    db = SessionLocal()
    try:
        # 1. Check if player_10 exists (implied, likely not in users table if we mock it, 
        # but the assignment might require FK if strict, or just string if loose).
        # We'll check if previous assignments exist.
        
        result = db.execute(text("SELECT * FROM injury_assignments WHERE player_id = 'player_10'"))
        rows = result.fetchall()
        print(f"Existing assignments for player_10: {len(rows)}")
        
        # 2. Try a raw insert to see if it fails (simulating the API)
        # We won't commit this test, just check if it WOULD work.
        # Actually, let's just use the API flow via verify_backend.js which we already repaired.
        # But this script is good for debug output.
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_player_and_insert()
