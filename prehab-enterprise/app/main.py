from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.config import settings
from app.db.database import engine, SessionLocal
# Import BOTH bases to handle the mixed environment
from app.db.database import Base as BaseOld
from app.db.base_class import Base as BaseNew
# Import models to ensure they are registered with their respective Bases
# UserDB usage replaced by User
from app.models.user import User  
import app.models.injury 
import uuid # For ID generation

from app.core import security 

app = FastAPI(title="Prehab 2.0")

# --- CORS CONFIGURATION ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_db():
    try:
        # 1. Create Tables for BOTH Bases
        BaseOld.metadata.create_all(bind=engine)
        BaseNew.metadata.create_all(bind=engine)
        
        # 2. Seed Data
        db = SessionLocal()
        if not db.query(User).filter(User.email == "coach@keralablasters.com").first():
            coach = User(
                id=str(uuid.uuid4()),
                email="coach@keralablasters.com", 
                hashed_password=security.get_password_hash("securepassword123"),
                role="coach", full_name="Coach Ivan"
            )
            p1 = User(id=str(uuid.uuid4()), email="luna@keralablasters.com", hashed_password=security.get_password_hash("p1"), role="player", full_name="Adrian Luna")
            p2 = User(id=str(uuid.uuid4()), email="diaman@keralablasters.com", hashed_password=security.get_password_hash("p2"), role="player", full_name="Dimitrios")
            
            db.add(coach)
            db.add_all([p1, p2])
            db.commit()
            print("✅ Database Seeded in Supabase")
        db.close()
    except Exception as e:
        print(f"⚠️ Warning: Database connection failed. Running in offline/demo mode. Error: {e}")

app.include_router(api_router, prefix="/api/v1")