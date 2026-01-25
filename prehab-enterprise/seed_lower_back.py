from app.db.database import SessionLocal, engine
from app.models.injury import Base, InjuryLibrary
import json

def seed_lower_back():
    print("Seeding Lower Back...")
    db = SessionLocal()
    
    # Force clean
    existing = db.query(InjuryLibrary).filter_by(body_area="Lower Back").all()
    if existing:
        print(f"Deleting {len(existing)} existing Lower Back entries...")
        for e in existing:
            db.delete(e)
        db.commit()

    data = [
        {
            "body_area": "Lower Back",
            "injury_type": "Lumbar Strain",
            "immediate_action": "Rest, avoid heavy lifting. Apply heat if muscle spasm persists.",
            "recovery_exercises": json.dumps([
                {"name": "Cat-Cow Stretch", "reps": "3x10"},
                {"name": "Bird Dog", "reps": "3x10"},
                {"name": "Child's Pose", "reps": "3x30s"}
            ]),
            "video_url": "https://www.youtube.com/watch?v=23456",
            "red_flags": "Numbness in legs, loss of bladder control, severe pain at night.",
            "estimated_recovery_days": 10
        },
        {
            "body_area": "Lower Back",
            "injury_type": "Facet Joint Irritation",
            "immediate_action": "Gentle movement, avoid extension (arching back).",
            "recovery_exercises": json.dumps([
                {"name": "Single Knee to Chest", "reps": "3x30s"},
                {"name": "Pelvic Tilts", "reps": "3x15"},
                {"name": "Glute Bridges", "reps": "3x12"}
            ]),
            "video_url": "https://www.youtube.com/watch?v=34567",
            "red_flags": "Radiating pain down leg (Sciatica) below knee.",
            "estimated_recovery_days": 14
        }
    ]

    for item in data:
        injury = InjuryLibrary(**item)
        db.add(injury)
    
    db.commit()
    print("Seeding Complete.")
    db.close()

if __name__ == "__main__":
    seed_lower_back()
