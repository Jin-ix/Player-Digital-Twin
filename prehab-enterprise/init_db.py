import sys
import os

# Ensure we can import app
sys.path.append(os.getcwd())

from app.db.database import engine
from app.db.database import Base as BaseOld
from app.db.base_class import Base as BaseNew

# Import models
# from app.db.models import UserDB # DEPRECATED
import app.models.injury 
import app.models.user # Ensure BaseNew has User registered

def init():
    print("Creating tables...")
    try:
        BaseOld.metadata.create_all(bind=engine)
        print("BaseOld tables created.")
        BaseNew.metadata.create_all(bind=engine)
        print("BaseNew tables created.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    init()
