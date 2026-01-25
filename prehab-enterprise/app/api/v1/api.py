from fastapi import APIRouter
from app.api.v1.endpoints import analytics, auth, biometrics, squad, injuries, homework

api_router = APIRouter()

# Register the endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Digital Twin Engine"])
api_router.include_router(biometrics.router, prefix="/biometrics", tags=["Bio-Mechanics"])
api_router.include_router(squad.router, prefix="/squad", tags=["Squad Management"])
api_router.include_router(injuries.router, prefix="/injuries", tags=["Injury Management"])
api_router.include_router(homework.router, prefix="/homework", tags=["Homework Assignments"])
from app.api.v1.endpoints import player_profile
api_router.include_router(player_profile.router, prefix="/profiles", tags=["Player Profiles"])