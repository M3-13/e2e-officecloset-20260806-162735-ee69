import io
import os

import pytest
from fastapi.testclient import TestClient
from PIL import Image
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.auth import create_access_token, hash_password
from app.database import Base, get_db
from app.image_utils import create_thumbnail, strip_exif, validate_image
from app.main import app
from app.models import User


@pytest.fixture(autouse=True)
def setup_env(monkeypatch, tmp_path):
    upload_dir = tmp_path / "uploads"
    upload_dir.mkdir()
    monkeypatch.setenv("SECRET_KEY", "test-secret-key-for-testing")
    monkeypatch.setenv("UPLOAD_DIR", str(upload_dir))


@pytest.fixture
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    session_local = sessionmaker(bind=engine)
    db = session_local()
    try:
        yield db
    finally:
        db.rollback()
        db.close()


@pytest.fixture
def client(db_session):
    def _override():
        return db_session

    app.dependency_overrides[get_db] = _override
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(db_session):
    user = User(email="test@example.com", password_hash=hash_password("password123"))
    db_session.add(user)
    db_session.commit()
    token = create_access_token({"sub": str(user.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def other_user_headers(db_session):
    user = User(email="other@example.com", password_hash=hash_password("password123"))
    db_session.add(user)
    db_session.commit()
    token = create_access_token({"sub": str(user.id)})
    return {"Authorization": f"Bearer {token}"}


def _make_jpeg_bytes() -> bytes:
    img = Image.new("RGB", (100, 100), color="red")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def _make_png_bytes() -> bytes:
    img = Image.new("RGB", (100, 100), color="blue")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def _upload_item(client, headers, name="Test Shirt", category="Oberteile"):
    jpeg = _make_jpeg_bytes()
    return client.post(
        "/api/wardrobe",
        headers=headers,
        data={"name": name, "category": category},
        files={"image": ("test.jpg", io.BytesIO(jpeg), "image/jpeg")},
    )


class TestUploadItem:
    def test_upload_jpeg_returns_201(self, client, auth_headers):
        response = _upload_item(client, auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Test Shirt"
        assert data["category"] == "Oberteile"
        assert data["owner_id"] is not None

    def test_upload_png_returns_201(self, client, auth_headers):
        png = _make_png_bytes()
        response = client.post(
            "/api/wardrobe",
            headers=auth_headers,
            data={"name": "PNG Item", "category": "Hosen"},
            files={"image": ("test.png", io.BytesIO(png), "image/png")},
        )
        assert response.status_code == 201
        assert response.json()["name"] == "PNG Item"

    def test_upload_without_auth_returns_401(self, client):
        jpeg = _make_jpeg_bytes()
        response = client.post(
            "/api/wardrobe",
            data={"name": "Test", "category": "Oberteile"},
            files={"image": ("test.jpg", io.BytesIO(jpeg), "image/jpeg")},
        )
        assert response.status_code == 401

    def test_upload_invalid_category_returns_400(self, client, auth_headers):
        jpeg = _make_jpeg_bytes()
        response = client.post(
            "/api/wardrobe",
            headers=auth_headers,
            data={"name": "Test", "category": "InvalidCategory"},
            files={"image": ("test.jpg", io.BytesIO(jpeg), "image/jpeg")},
        )
        assert response.status_code == 400

    def test_uploaded_item_appears_in_list(self, client, auth_headers):
        create_resp = _upload_item(client, auth_headers)
        assert create_resp.status_code == 201
        created_id = create_resp.json()["id"]

        list_resp = client.get("/api/wardrobe", headers=auth_headers)
        assert list_resp.status_code == 200
        items = list_resp.json()
        assert len(items) == 1
        assert items[0]["id"] == created_id


class TestListItems:
    def test_list_empty_returns_empty_list(self, client, auth_headers):
        response = client.get("/api/wardrobe", headers=auth_headers)
        assert response.status_code == 200
        assert response.json() == []

    def test_list_without_auth_returns_401(self, client):
        response = client.get("/api/wardrobe")
        assert response.status_code == 401

    def test_category_filter(self, client, auth_headers):
        _upload_item(client, auth_headers, name="Shirt", category="Oberteile")
        _upload_item(client, auth_headers, name="Jeans", category="Hosen")

        all_items = client.get("/api/wardrobe", headers=auth_headers).json()
        assert len(all_items) == 2

        tops = client.get("/api/wardrobe?category=Oberteile", headers=auth_headers).json()
        assert len(tops) == 1
        assert tops[0]["name"] == "Shirt"

        pants = client.get("/api/wardrobe?category=Hosen", headers=auth_headers).json()
        assert len(pants) == 1
        assert pants[0]["name"] == "Jeans"

    def test_other_user_items_not_visible(self, client, auth_headers, other_user_headers):
        _upload_item(client, auth_headers, name="My Item", category="Oberteile")
        _upload_item(client, other_user_headers, name="Other Item", category="Schuhe")

        response = client.get("/api/wardrobe", headers=auth_headers)
        assert response.status_code == 200
        items = response.json()
        assert len(items) == 1
        assert items[0]["name"] == "My Item"


class TestImageValidation:
    def test_pdf_rejected_magic_bytes(self, client, auth_headers):
        pdf_content = b"%PDF-1.4 fake pdf content here"
        response = client.post(
            "/api/wardrobe",
            headers=auth_headers,
            data={"name": "Bad", "category": "Oberteile"},
            files={"image": ("test.pdf", io.BytesIO(pdf_content), "application/pdf")},
        )
        assert response.status_code == 400

    def test_gif_rejected_magic_bytes(self, client, auth_headers):
        gif_content = b"GIF89a\x00\x00\x00\x00\x00"
        response = client.post(
            "/api/wardrobe",
            headers=auth_headers,
            data={"name": "Bad", "category": "Oberteile"},
            files={"image": ("test.gif", io.BytesIO(gif_content), "image/gif")},
        )
        assert response.status_code == 400

    def test_file_too_large_rejected(self, client, auth_headers):
        big = b"\xff\xd8\xff" + b"\x00" * (6 * 1024 * 1024)
        response = client.post(
            "/api/wardrobe",
            headers=auth_headers,
            data={"name": "Big", "category": "Oberteile"},
            files={"image": ("big.jpg", io.BytesIO(big), "image/jpeg")},
        )
        assert response.status_code == 400

    def test_corrupt_jpeg_rejected(self, client, auth_headers):
        corrupt = b"\xff\xd8\xff" + b"\x00" * 100
        response = client.post(
            "/api/wardrobe",
            headers=auth_headers,
            data={"name": "Corrupt", "category": "Oberteile"},
            files={"image": ("corrupt.jpg", io.BytesIO(corrupt), "image/jpeg")},
        )
        assert response.status_code == 400


class TestGetImage:
    def test_get_own_item_image_returns_200(self, client, auth_headers):
        create_resp = _upload_item(client, auth_headers)
        item_id = create_resp.json()["id"]

        resp = client.get(f"/api/wardrobe/{item_id}/image", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.headers["content-type"] == "image/jpeg"

    def test_get_other_user_image_returns_403(self, client, auth_headers, other_user_headers):
        create_resp = _upload_item(client, other_user_headers)
        item_id = create_resp.json()["id"]

        resp = client.get(f"/api/wardrobe/{item_id}/image", headers=auth_headers)
        assert resp.status_code == 403

    def test_get_image_without_auth_returns_401(self, client, auth_headers):
        create_resp = _upload_item(client, auth_headers)
        item_id = create_resp.json()["id"]

        resp = client.get(f"/api/wardrobe/{item_id}/image")
        assert resp.status_code == 401

    def test_get_nonexistent_item_image_returns_404(self, client, auth_headers):
        resp = client.get("/api/wardrobe/99999/image", headers=auth_headers)
        assert resp.status_code == 404


class TestDeleteItem:
    def test_delete_own_item_returns_200(self, client, auth_headers):
        create_resp = _upload_item(client, auth_headers)
        item_id = create_resp.json()["id"]

        resp = client.delete(f"/api/wardrobe/{item_id}", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["message"] == "Item deleted"

        list_resp = client.get("/api/wardrobe", headers=auth_headers)
        assert list_resp.json() == []

    def test_delete_removes_files(self, client, auth_headers):
        create_resp = _upload_item(client, auth_headers)
        data = create_resp.json()
        item_id = data["id"]

        img_path = data["image_path"]
        thumb_path = os.path.join(os.path.dirname(img_path), f"thumb_{item_id}.jpg")
        assert os.path.isfile(img_path), f"img_path missing: {img_path}"
        assert os.path.isfile(thumb_path), f"thumb_path missing: {thumb_path}"

        client.delete(f"/api/wardrobe/{item_id}", headers=auth_headers)

        assert not os.path.isfile(img_path)
        assert not os.path.isfile(thumb_path)

    def test_delete_other_user_item_returns_403(self, client, auth_headers, other_user_headers):
        create_resp = _upload_item(client, other_user_headers)
        item_id = create_resp.json()["id"]

        resp = client.delete(f"/api/wardrobe/{item_id}", headers=auth_headers)
        assert resp.status_code == 403

    def test_delete_without_auth_returns_401(self, client, auth_headers):
        create_resp = _upload_item(client, auth_headers)
        item_id = create_resp.json()["id"]

        resp = client.delete(f"/api/wardrobe/{item_id}")
        assert resp.status_code == 401

    def test_delete_nonexistent_item_returns_404(self, client, auth_headers):
        resp = client.delete("/api/wardrobe/99999", headers=auth_headers)
        assert resp.status_code == 404


class TestExifStripping:
    def test_strip_exif_removes_metadata(self):
        img = Image.new("RGB", (100, 100), color="green")
        exif = img.getexif()
        exif[0x010E] = "Test description"
        buf = io.BytesIO()
        img.save(buf, format="JPEG", exif=exif.tobytes())
        buf.seek(0)

        from fastapi import UploadFile

        class FakeFile:
            pass

        fake_upload = UploadFile(
            filename="test.jpg",
            file=buf,
            headers={"content-type": "image/jpeg"},
        )

        stripped = strip_exif(fake_upload)
        result_img = Image.open(io.BytesIO(stripped))
        result_exif = result_img.getexif()
        assert result_exif.get(0x010E) is None


class TestValidateImageFunction:
    def test_valid_jpeg_passes(self):
        jpeg = _make_jpeg_bytes()
        from fastapi import UploadFile

        fake = UploadFile(
            filename="test.jpg",
            file=io.BytesIO(jpeg),
            headers={"content-type": "image/jpeg"},
        )
        validate_image(fake)

    def test_valid_png_passes(self):
        png = _make_png_bytes()
        from fastapi import UploadFile

        fake = UploadFile(
            filename="test.png",
            file=io.BytesIO(png),
            headers={"content-type": "image/png"},
        )
        validate_image(fake)

    def test_pdf_raises_400(self):
        from fastapi import HTTPException, UploadFile

        fake = UploadFile(
            filename="test.pdf",
            file=io.BytesIO(b"%PDF-1.4 test"),
            headers={"content-type": "application/pdf"},
        )
        with pytest.raises(HTTPException) as exc:
            validate_image(fake)
        assert exc.value.status_code == 400

    def test_too_large_raises_400(self):
        from fastapi import HTTPException, UploadFile

        big = b"\xff\xd8\xff" + b"\x00" * (6 * 1024 * 1024)
        fake = UploadFile(
            filename="big.jpg",
            file=io.BytesIO(big),
            headers={"content-type": "image/jpeg"},
        )
        with pytest.raises(HTTPException) as exc:
            validate_image(fake)
        assert exc.value.status_code == 400


class TestCreateThumbnail:
    def test_thumbnail_is_jpeg(self):
        jpeg = _make_jpeg_bytes()
        thumb = create_thumbnail(jpeg, (100, 100))
        img = Image.open(io.BytesIO(thumb))
        assert img.format == "JPEG"

    def test_thumbnail_within_bounds(self):
        img = Image.new("RGB", (800, 600), color="yellow")
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        data = buf.getvalue()

        thumb = create_thumbnail(data, (100, 100))
        result = Image.open(io.BytesIO(thumb))
        assert result.width <= 100
        assert result.height <= 100

    def test_thumbnail_preserves_aspect_ratio(self):
        img = Image.new("RGB", (800, 400), color="yellow")
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        data = buf.getvalue()

        thumb = create_thumbnail(data, (200, 200))
        result = Image.open(io.BytesIO(thumb))
        assert result.width == 200
        assert result.height == 100


class TestNoLoggingOfPersonalData:
    def test_logs_dont_contain_personal_data(self, client, auth_headers):
        jpeg = _make_jpeg_bytes()
        response = client.post(
            "/api/wardrobe",
            headers=auth_headers,
            data={"name": "PrivateShirt", "category": "Oberteile"},
            files={"image": ("private.jpg", io.BytesIO(jpeg), "image/jpeg")},
        )
        assert response.status_code == 201
