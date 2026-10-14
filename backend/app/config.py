import os
from pathlib import Path
from typing import List

# Base directory for backend
BASE_DIR = Path(__file__).resolve().parent.parent

# Locate artifacts directory (look in current dir, parent dir, or env var)
def find_artifacts_dir() -> Path:
    env_path = os.getenv("ARTIFACTS_DIR")
    if env_path and Path(env_path).exists():
        return Path(env_path)
    
    candidates = [
        BASE_DIR.parent / "artifacts",
        BASE_DIR / "artifacts",
        Path("artifacts"),
        Path("../artifacts"),
    ]
    for c in candidates:
        if c.exists() and (c / "meta.json").exists():
            return c.resolve()
            
    # Default fallback
    return (BASE_DIR.parent / "artifacts").resolve()

ARTIFACTS_DIR = find_artifacts_dir()

# CORS configuration
CORS_ORIGINS_RAW = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,*")
CORS_ORIGINS: List[str] = [origin.strip() for origin in CORS_ORIGINS_RAW.split(",") if origin.strip()]

# Server configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
