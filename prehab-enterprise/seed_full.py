import sys
import os
import json
from sqlalchemy import exc, text

# Ensure we can import app
sys.path.append(os.getcwd())

from app.db.database import SessionLocal
from app.models.injury import InjuryLibrary

def seed_missing_injuries():
    print("Checking for missing injuries...")
    db = SessionLocal()
    try:
        # Define the full set of body parts we need
        # BodyMap has: Knee, Ankle, Hamstring, Shoulder, Lower Back
        
        required_data = [
            {
                "body_area": "Hamstring",
                "injury_type": "Hamstring Strain (Grade 1)",
                "immediate_action": "Avoid sprinting and heavy stretching.",
                "recovery_exercises": [
                    {"name": "Nordic Curls (Assisted)", "reps": "3x5"},
                    {"name": "Glute Bridges", "reps": "3x15"}
                ],
                "video_url": "https://youtu.be/hamstring_rehab",
                "red_flags": "Severe bruising or inability to walk.",
                "estimated_recovery_days": 14
            },
            {
                "body_area": "Shoulder",
                "injury_type": "Rotator Cuff Impingement",
                "immediate_action": "Avoid overhead lifting.",
                "recovery_exercises": [
                    {"name": "External Rotations", "reps": "3x15"},
                    {"name": "Scapular Wall Slides", "reps": "3x10"}
                ],
                "video_url": "https://youtu.be/shoulder_rehab",
                "red_flags": "Visible deformity or numbness in arm.",
                "estimated_recovery_days": 21
            },
             {
                "body_area": "Lower Back",
                "injury_type": "Lumbar Strain",
                "immediate_action": "Gentle movement, avoid heavy loading.",
                "recovery_exercises": [
                    {"name": "Cat-Cow Stretch", "reps": "3x10"},
                    {"name": "Bird-Dog", "reps": "3x8 each side"}
                ],
                "video_url": "https://youtu.be/lowback_rehab",
                "red_flags": "Loss of bladder control or radiating leg pain.",
                "estimated_recovery_days": 10
            },
            # Add a second Knee option to show list view nicely
            {
                "body_area": "Knee",
                "injury_type": "ACL Sprain (Minor)",
                "immediate_action": "RICE and bracing.",
                "recovery_exercises": [
                    {"name": "Quad Sets", "reps": "3x20"},
                    {"name": "SLR", "reps": "3x10"}
                ],
                "video_url": "https://youtu.be/knee_rehab",
                "red_flags": "Instability or giving way.",
                "estimated_recovery_days": 28
            }
        ]

        added_count = 0
        for item in required_data:
            # Check if exists
            exists = db.query(InjuryLibrary).filter(
                InjuryLibrary.body_area == item["body_area"],
                InjuryLibrary.injury_type == item["injury_type"]
            ).first()
            
            if not exists:
                print(f"Adding {item['injury_type']}...")
                new_injury = InjuryLibrary(
                    body_area=item["body_area"],
                    injury_type=item["injury_type"],
                    immediate_action=item["immediate_action"],
                    recovery_exercises=json.dumps(item["recovery_exercises"]),
                    video_url=item["video_url"],
                    red_flags=item.get("red_flags", "Severe pain"),
                    estimated_recovery_days=item["estimated_recovery_days"]
                )
                db.add(new_injury)
                added_count += 1
            else:
                print(f"Skipping {item['injury_type']} (Already exists)")
        
        db.commit()
        print(f"✅ Seeding Complete. Added {added_count} new entries.")

    except exc.SQLAlchemyError as e:
        print(f"SQLAlchemy Error: {e}")
    except Exception as e:
        print(f"General Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_missing_injuries()
