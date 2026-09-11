import os
import sys
from pathlib import Path

# Add backend directory to sys.path so app, db, core, etc. are importable
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Enable VERCEL environment flag if running in serverless environment
os.environ.setdefault("VERCEL", "1")

from app.main import app
