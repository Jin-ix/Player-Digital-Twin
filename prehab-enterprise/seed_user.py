import sys
import os
sys.path.append(os.getcwd())

from app.db.database import SessionLocal
from app.models.user import User

def seed_user_orm():
    print("Seeding USER 'player_10' via ORM...")
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == "player_10").first()
        if user:
            print("User 'player_10' already exists.")
        else:
            new_user = User(
                id="player_10",
                email="player10@example.com",
                hashed_password="dummyhash",
                full_name="John Doe (Player 10)",
                role="athlete",
                is_active=True
            )
            db.add(new_user)
            db.commit()
            print("✅ User 'player_10' created.")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed_user_orm()
