from fastapi import FastAPI
from app.api.v1.api import api_router
from app.core.config import settings
from app.db.database import engine, Base, SessionLocal
from app.db.models import UserDB
from app.core import security # <--- Use your existing security module

app = FastAPI(title="Prehab 2.0")

@app.on_event("startup")
def startup_db():
    # 1. Create Tables
    Base.metadata.create_all(bind=engine)
    
    # 2. Seed Data
    db = SessionLocal()
    if not db.query(UserDB).filter(UserDB.email == "coach@keralablasters.com").first():
        coach = UserDB(
            email="coach@keralablasters.com", 
            hashed_password=security.get_password_hash("securepassword123"), # <--- Updated
            role="coach", full_name="Coach Ivan"
        )
        p1 = UserDB(email="luna@keralablasters.com", hashed_password=security.get_password_hash("p1"), role="player", full_name="Adrian Luna")
        p2 = UserDB(email="diaman@keralablasters.com", hashed_password=security.get_password_hash("p2"), role="player", full_name="Dimitrios")
        
        db.add(coach)
        db.add_all([p1, p2])
        db.commit()
        print("✅ Database Seeded in Supabase")
    db.close()

app.include_router(api_router, prefix="/api/v1")