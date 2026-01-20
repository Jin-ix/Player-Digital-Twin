from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.database import get_db
from app.db.models import UserDB
from app.core import security
from app.core.config import settings

# ✅ Initialize the Router FIRST
router = APIRouter()

# --- SCHEMAS ---
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "player"

# --- ENDPOINTS ---
@router.post("/signup")
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    # 1. Check if user exists
    user = db.query(UserDB).filter(UserDB.email == user_in.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 2. Create new user
    new_user = UserDB(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"msg": "User created successfully"}

@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    # 1. Find user
    user = db.query(UserDB).filter(UserDB.email == form_data.username).first()
    
    # 2. Verify Password
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. Create Token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    return {
        "access_token": security.create_access_token(
            subject=user.id,  # Store User ID in the token
            expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }