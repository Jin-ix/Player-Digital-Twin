import sqlite3

def verify_data():
    conn = sqlite3.connect("prehab_v5.db")
    cursor = conn.cursor()
    
    print("--- USERS ---")
    try:
        cursor.execute("SELECT id, email, role FROM users")
        users = cursor.fetchall()
        for u in users:
            print(u)
        if not users:
            print("No users found!")
    except Exception as e:
        print(f"User check failed: {e}")

    print("\n--- INJURIES ---")
    try:
        cursor.execute("SELECT id, body_area, injury_type FROM injury_library LIMIT 5")
        injuries = cursor.fetchall()
        for i in injuries:
            print(i)
    except Exception as e:
        print(f"Injury check failed: {e}")
        
    conn.close()

if __name__ == "__main__":
    verify_data()
