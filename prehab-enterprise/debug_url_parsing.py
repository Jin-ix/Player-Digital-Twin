from sqlalchemy.engine.url import make_url
from urllib.parse import quote_plus

# The hardcoded URL from the file
raw_url = "postgresql://postgres.lobmtyvthfsjhdpadvdi:rUwhiRNtzqeJ1Ldz@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"

print(f"--- Testing Raw URL: {raw_url} ---")
try:
    u = make_url(raw_url)
    print(f"Parsed successfully.")
    print(f"User: {u.username}")
    print(f"Password: {u.password}")
    print(f"Host: {u.host}")
    
    if u.password == "SuperSecretPass123#":
        print("RESULT: Password parsed CORRECTLY (unexpected for raw #).")
    elif u.password == "SuperSecretPass123":
        print("RESULT: Password TRUNCATED at #. This confirms the issue.")
    else:
        print(f"RESULT: Password parsed as '{u.password}'.")

except Exception as e:
    print(f"Parsing failed: {e}")

print("\n--- Testing Correct Usage with quote_plus ---")
encoded_pass = quote_plus("SuperSecretPass123#")
print(f"Encoded password: {encoded_pass}")
