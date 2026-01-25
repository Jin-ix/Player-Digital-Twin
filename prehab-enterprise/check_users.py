import sqlite3

def check_users():
    conn = sqlite3.connect("prehab_v4.db")
    cursor = conn.cursor()
    
    print("Checking users table...")
    try:
        cursor.execute("SELECT id, username, full_name FROM users")
        users = cursor.fetchall()
        print(f"Total Users: {len(users)}")
        found = False
        for u in users:
            print(f" - {u}")
            if str(u[0]) == "player_10": # ID might be int or string depending on schema
                found = True
        
        if not found:
            print("❌ 'player_10' NOT FOUND in users table.")
            # Check schema of users table too
            cursor.execute("PRAGMA table_info(users)")
            print("Schema:", cursor.fetchall())
    except Exception as e:
        print(f"Error querying users: {e}")
        
    conn.close()

if __name__ == "__main__":
    check_users()
