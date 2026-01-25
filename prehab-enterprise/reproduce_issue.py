import sys
import os

# Ensure we can import app
sys.path.append(os.getcwd())

from app.db.database import SessionLocal
from app.models.injury import InjuryAssignment
from sqlalchemy import text

def test_query():
    print("STARTING TEST")
    try:
        db = SessionLocal()
        print("SESSION CREATED")
        
        # Test connection
        res = db.execute(text("SELECT 1")).scalar()
        print(f"CONNECTION OK: {res}")
        
        # Test Query
        print("QUERYING...")
        injury = db.query(InjuryAssignment).first()
        print(f"QUERY OK: {injury}")
        
    except Exception as e:
        print(f"CAUGHT ERROR: {e}")
    finally:
        print("DONE")

if __name__ == "__main__":
    test_query()
