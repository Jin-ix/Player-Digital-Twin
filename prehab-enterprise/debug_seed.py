import sys
import os
import json
from sqlalchemy import text, exc

# Ensure we can import app
sys.path.append(os.getcwd())

from app.db.database import SessionLocal, engine
from app.models.injury import InjuryLibrary

def debug_seed():
    print("DEBUG: Starting...")
    db = SessionLocal()
    print(f"DEBUG: Session Type: {type(db)}")
    
    try:
        # 1. Check Table Existence via Raw SQL
        print("DEBUG: Checking table...")
        res = db.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='injury_library';")).scalar()
        print(f"DEBUG: Table found: {res}")
        
        if not res:
            print("ERROR: Table 'injury_library' does not exist!")
            return

        # 2. Try Raw Insert
        print("DEBUG: Attempting raw insert...")
        stmt = text("INSERT INTO injury_library (body_area, injury_type) VALUES (:area, :type)")
        db.execute(stmt, {"area": "TestKnee", "type": "TestInjury"})
        db.commit()
        print("DEBUG: Raw insert success.")
        
        # 3. Try ORM Insert
        print("DEBUG: Attempting ORM insert...")
        inj = InjuryLibrary(body_area="ORM_Knee", injury_type="ORM_Injury")
        db.add(inj)
        db.commit()
        print("DEBUG: ORM insert success.")

    except Exception as e:
        print(f"DEBUG ERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    debug_seed()
