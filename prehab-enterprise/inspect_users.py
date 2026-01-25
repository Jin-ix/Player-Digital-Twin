import sqlite3

def inspect_users():
    conn = sqlite3.connect("prehab_v4.db")
    cursor = conn.cursor()
    
    print("Inspecting 'users' table schema...")
    try:
        cursor.execute("PRAGMA table_info(users)")
        columns = cursor.fetchall()
        for col in columns:
            print(col)
            
        print("\nExisting Rows:")
        cursor.execute("SELECT * FROM users")
        print(cursor.fetchall())
        
    except Exception as e:
        print(f"Error: {e}")
        
    conn.close()

if __name__ == "__main__":
    inspect_users()
