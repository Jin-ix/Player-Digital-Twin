import app.models.user
print(f"File: {app.models.user.__file__}")
with open(app.models.user.__file__, 'r') as f:
    lines = f.readlines()
    found = False
    for i, line in enumerate(lines):
        if "BiometricLog" in line:
            print(f"Line {i+1}: {line.strip()}")
            found = True
    if not found:
        print("BiometricLog NOT FOUND in file.")
