import os
import shutil
import tempfile

import pytest

os.environ.setdefault("SECRET_KEY", "test-secret-key-for-tests-only")

_test_db_dir = tempfile.mkdtemp(prefix="test_wardrobe_db_")
os.environ.setdefault("DATABASE_URL", f"sqlite:///{_test_db_dir}/test.db")

_upload_dir = tempfile.mkdtemp(prefix="test_wardrobe_uploads_")
os.environ.setdefault("UPLOAD_DIR", _upload_dir)


@pytest.fixture(scope="session", autouse=True)
def _cleanup_temp_dirs():
    yield
    shutil.rmtree(_upload_dir, ignore_errors=True)
    shutil.rmtree(_test_db_dir, ignore_errors=True)
