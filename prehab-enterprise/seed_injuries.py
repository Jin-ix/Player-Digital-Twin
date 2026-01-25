import sys
import os
import json
from sqlalchemy import exc

# Ensure we can import app
sys.path.append(os.getcwd())

from app.db.database import SessionLocal
from app.models.injury import InjuryLibrary

def seed_injuries():
    print("Starting Session...")
    db = SessionLocal()
    try:
        # Check if empty
        if db.query(InjuryLibrary).count() > 0:
            print("Injury Library already seeded.")
            return

        print("Seeding Injury Library...")
        
        # Use Python list of dicts, SQLAlchemy JSON type handles serialization
        exercises = [
            {"name": "Spanish Squats", "reps": "3x45s"},
            {"name": "Wall Sits", "reps": "3x60s"}
        ]

        inj1 = InjuryLibrary(
            body_area="Knee",
            injury_type="Patellofemoral Pain",
            immediate_action="Reduce load.",
            recovery_exercises=json.dumps(exercises), # Serialize manually
            video_url="https://youtube.com/watch?1",
            estimated_recovery_days=14
        )
        
        db.add(inj1)
        db.commit()
        print("✅ Seeding One Complete!")
        
        # Add others
        injuries = [
             InjuryLibrary(
                body_area="Knee",
                injury_type="Patellar Tendinopathy",
                immediate_action="Stop jumping.",
                recovery_exercises=json.dumps([{"name": "Decline Squat", "reps": "3x10"}]),
                video_url="https://youtube.com/watch?2",
                estimated_recovery_days=21
            ),
            InjuryLibrary(
                body_area="Ankle",
                injury_type="Lateral Ankle Sprain",
                immediate_action="RICE.",
                recovery_exercises=json.dumps([{"name": "Balance", "reps": "3x1min"}]),
                video_url="https://youtube.com/watch?3",
                estimated_recovery_days=10
            )
        ]
        db.add_all(injuries)
        db.commit()
        print("✅ All Seeded")

    except exc.SQLAlchemyError as e:
        print(f"SQLAlchemy Error: {e}")
    except Exception as e:
        print(f"General Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_injuries()
