import sqlite3

def seed_player_10_robust():
    db_file = "prehab_v5.db"
    print(f"Seeding player_10 into {db_file}...")
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    
    # Check if exists
    cursor.execute("SELECT count(*) FROM users WHERE id='player_10'")
    if cursor.fetchone()[0] > 0:
        print("User already exists.")
        conn.close()
        return

    # Check schema for is_active
    cursor.execute("PRAGMA table_info(users)")
    cols = cursor.fetchall()
    has_is_active = any(c[1] == 'is_active' for c in cols)
    
    try:
        if has_is_active:
             print("Inserting with is_active=1...")
             # SQLite boolean is integer 0/1 usually
             cursor.execute("""
                INSERT INTO users (id, email, hashed_password, full_name, role, is_active)
                VALUES (?, ?, ?, ?, ?, ?)
            """, ("player_10", "player10@example.com", "dummyhash", "John Doe (Player 10)", "athlete", 1))
        else:
            print("Inserting without is_active...")
            cursor.execute("""
                INSERT INTO users (id, email, hashed_password, full_name, role)
                VALUES (?, ?, ?, ?, ?)
            """, ("player_10", "player10@example.com", "dummyhash", "John Doe (Player 10)", "athlete"))
            
        conn.commit()
        print("✅ SUCCESS: player_10 inserted.")
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        
    conn.close()

if __name__ == "__main__":
    seed_player_10_robust()
