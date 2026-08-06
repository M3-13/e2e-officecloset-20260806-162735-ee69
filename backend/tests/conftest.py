import os
from pathlib import Path

_TEST_DB = Path(__file__).resolve().parent / "test_wardrobe.db"

if "DATABASE_URL" not in os.environ:
    os.environ["DATABASE_URL"] = f"sqlite:///{_TEST_DB}"

if "SECRET_KEY" not in os.environ:
    os.environ["SECRET_KEY"] = "0123456789abcdef0123456789abcdef"


def pytest_sessionstart(session):
    if _TEST_DB.exists():
        _TEST_DB.unlink()
