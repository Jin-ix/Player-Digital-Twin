from app.db.database import SessionLocal
from sqlalchemy import text

def inspect_library():
    print("Inspecting Library Table...")
    db = SessionLocal()
    try:
        result = db.execute(text("SELECT id, body_area, injury_type FROM injury_library"))
        rows = result.fetchall()
        print(f"Total Rows: {len(rows)}")
        for row in rows:
            print(f"ID: {row.id} | Area: '{row.body_area}' | Type: {row.injury_type}")
    except Exception as e:
        print(e)
    finally:
        db.close()

if __name__ == "__main__":
    inspect_library()
