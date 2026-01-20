import sys
import os

# Add current directory to path so we can import app
sys.path.append(os.getcwd())

try:
    from app.core.config import settings
    from sqlalchemy.engine.url import make_url

    print(f"-- START CONFIG CHECK --")
    # Hide sensitive part but show structure
    url_str = settings.DATABASE_URL
    print(f"Loaded URL length: {len(url_str)}")
    
    u = make_url(url_str)
    print(f"Parsed User: {u.username}")
    print(f"Parsed Host: {u.host}")
    # Show first/last chars of password to verify trace
    pwd = u.password
    if pwd:
        safe_pwd = pwd[0] + "*" * (len(pwd)-2) + pwd[-1] if len(pwd) > 2 else "***"
        print(f"Parsed Password (masked): {safe_pwd}")
        if "#" in pwd:
           print("WARNING: Password contains raw '#' character!")
        else:
           print("Password does not contain '#' character (good, or truncated).")
    else:
        print("No password found in URL.")

except Exception as e:
    print(f"Error: {e}")
