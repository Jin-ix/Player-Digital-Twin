import sqlite3
import json

def seed_extra():
    print("Seeding EXTRA injuries (Shoulder, Back, Groin)...")
    conn = sqlite3.connect("prehab_v5.db")
    cursor = conn.cursor()
    
    # Check if Shoulder exists
    cursor.execute("SELECT count(*) FROM injury_library WHERE body_area='Shoulder'")
    if cursor.fetchone()[0] > 0:
        print("Shoulder already seeded.")
    else:
        injuries = [
            ("Shoulder", "Rotator Cuff Tendinopathy", "Avoid overhead. External rotation iso.", json.dumps([{"name": "Ext Rotation ISO", "reps": "3x30s"}]), "https://youtu.be/shoulder", "Night pain, Weakness", 21),
            ("Shoulder", "AC Joint Sprain", "Avoid cross-body adduction.", json.dumps([{"name": "Scapular Retraction", "reps": "3x15"}]), "https://youtu.be/acjoint", "Deformity (Step off)", 14),
            ("Back", "Lumbar Strain", "Avoid flexion under load. Heat.", json.dumps([{"name": "Bird Dogs", "reps": "3x10"}]), "https://youtu.be/back", "Shooting leg pain (Sciatica)", 10),
            ("Groin", "Adductor Strain", "Squeeze iso. Avoid wide lunges.", json.dumps([{"name": "Ball Squeeze", "reps": "3x30s"}]), "https://youtu.be/groin", "Pain with cough/sneeze", 14)
        ]
        
        cursor.executemany("""
            INSERT INTO injury_library (body_area, injury_type, immediate_action, recovery_exercises, video_url, red_flags, estimated_recovery_days)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, injuries)
        print("Seeded Shoulder, Back, Groin.")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    seed_extra()
