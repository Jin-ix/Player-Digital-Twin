from app.db.database import SessionLocal
from app.models.injury import InjuryLibrary

db = SessionLocal()
count = db.query(InjuryLibrary).filter_by(body_area="Hamstring").count()
print(f"Hamstring Count: {count}")
db.close()
