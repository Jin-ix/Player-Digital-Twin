import app
import os
print(f"App Package File: {getattr(app, '__file__', 'No file')}")
print(f"App Package Path: {getattr(app, '__path__', 'No path')}")

import app.models.user
print(f"User Model File: {app.models.user.__file__}")
