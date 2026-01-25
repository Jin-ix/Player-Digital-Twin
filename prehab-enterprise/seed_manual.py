import sqlite3
import json

def seed_manual():
    print("Manually seeding with sqlite3...")
    conn = sqlite3.connect("prehab_v5.db")
    cursor = conn.cursor()
    
    # 1. Check if table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='injury_library'")
    if not cursor.fetchone():
        print("Table 'injury_library' not found! Make sure to run init_db.py first (which uses SQLAlchemy).")
        # If SQLAlchemy init failed silently, we might need to CREATE table here too.
        # Let's trust init_db.py created it.
        # Actually init_db.py might have failed too if engine was bad.
        # Let's just create it manually if missing.
        print("Creating table manually...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS injury_library (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                body_area TEXT NOT NULL,
                injury_type TEXT NOT NULL,
                immediate_action TEXT,
                recovery_exercises TEXT,
                video_url TEXT,
                red_flags TEXT,
                estimated_recovery_days INTEGER
            )
        """)
    
    # 2. Check content
    cursor.execute("SELECT count(*) FROM injury_library")
    count = cursor.fetchone()[0]
    if count > 0:
        print(f"Already have {count} injuries.")
        return

    # 3. Insert Data
    injuries = [
        ("Knee", "Patellofemoral Pain", "Reduce load. Ice.", json.dumps([{"name": "Spanish Squats", "reps": "3x45s"}]), "https://youtu.be/1", "Locking", 14),
        ("Knee", "Patellar Tendionpathy", "Stop jumping.", json.dumps([{"name": "Decline Squats", "reps": "3x10"}]), "https://youtu.be/2", "Heat", 21),
        ("Ankle", "Lateral Ankle Sprain", "RICE.", json.dumps([{"name": "Balance", "reps": "3x1min"}]), "https://youtu.be/3", "Bone pain", 10),
        ("Hamstring", "Strain Grade 1", "Gentle motion.", json.dumps([{"name": "Glute Bridges", "reps": "3x15"}]), "https://youtu.be/4", "Bruising", 14)
    ]
    
    cursor.executemany("""
        INSERT INTO injury_library (body_area, injury_type, immediate_action, recovery_exercises, video_url, red_flags, estimated_recovery_days)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, injuries)
    
    conn.commit()
    print(f"Seeded {len(injuries)} items.")
    conn.close()

if __name__ == "__main__":
    seed_manual()
