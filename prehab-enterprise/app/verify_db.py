from app.db.database import engine
from sqlalchemy import text

try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("\n✅ SUCCESS: Database connection established!")
except Exception as e:
    print(f"\n❌ FAILURE: {e}")