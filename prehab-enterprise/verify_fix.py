from sqlalchemy import create_engine, text
from urllib.parse import quote_plus

# Constructing the URL with PROPER encoding for the hash
# User: postgres.lobmtyvthfsjhdpadvdi
# Pass: SuperSecretPass123# -> Encoded: SuperSecretPass123%23
# Host: aws-1-ap-south-1.pooler.supabase.com
# Port: 6543
# DB: postgres

user = "postgres.lobmtyvthfsjhdpadvdi"
password = "SuperSecretPass123#"
encoded_password = quote_plus(password)
host = "aws-1-ap-south-1.pooler.supabase.com"
port = "6543"
dbname = "postgres"

test_url = f"postgresql://{user}:{encoded_password}@{host}:{port}/{dbname}"

print(f"Testing connection with encoded URL...")
# print(test_url) # Don't print full secrets if possible, but for debug it's okay locally

try:
    engine = create_engine(test_url, connect_args={"options": "-c client_encoding=UTF8"})
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print(f"Connection Successful! Result: {result.scalar()}")
except Exception as e:
    print(f"Connection Failed: {e}")
