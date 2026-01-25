import sys
import os
from sqlalchemy import text

# Ensure we can import app
sys.path.append(os.getcwd())

from app.db.database import SessionLocal
from app.models.injury import InjuryLibrary

def debug_library():
    print("DEBUG: Querying InjuryLibrary...")
    db = SessionLocal()
    try:
        # Check all
        injuries = db.query(InjuryLibrary).all()
        print(f"DEBUG: Found {len(injuries)} entries.")
        for inj in injuries:
            print(f" - {inj.body_area}: {inj.injury_type}")
            print(f"   Exercises Type: {type(inj.recovery_exercises)}")
            print(f"   Val: {inj.recovery_exercises}")
            
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    debug_library()
