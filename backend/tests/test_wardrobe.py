import os
from io import BytesIO

import pytest
from fastapi import HTTPException, UploadFile
from fastapi.testclient import TestClient
from PIL import Image

from app.auth import create_access_token, hash_password
from app.database import Base, SessionLocal, engine
from app.image_utils import create_thumbnail, strip_exif, validate_image
from app.main import app
from app.models import ClothingItem, User


@pytest.fixture(scope="module", autouse=True)
def _setup_module():
    Base.metadata.create_all(bind=engine)
    yield


def _make_jpeg_bytes(w: int = 100, h: int = 100) -> bytes:
    img = Image.new("RGB", (w, h), color="red")
    buf = BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def _make_jpeg_with_exif_bytes() -> bytes:
    img = Image.new("RGB", (200, 200), color="blue")
    exif = img.getexif()
    exif[0x010E] = "Test EXIF Description"
    buf = BytesIO()
    img.save(buf, format="JPEG", exif=exif.tobytes())
    return buf.getvalue()


def _make_png_bytes() -> bytes:
    img = Image.new("RGB", (100, 100), color="green")
    buf = BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def _auth_header(user_id: int) -> dict:
    token = create_access_token({"sub": str(user_id)})
    return {"Authorization": f"Bearer {token}"}


class TestImageUtils:
    def test_validate_image_accepts_jpeg(self):
        upload = UploadFile(BytesIO(_make_jpeg_bytes()), filename="test.jpg")
        validate_image(upload)

    def test_validate_image_accepts_png(self):
        upload = UploadFile(BytesIO(_make_png_bytes()), filename="test.png")
        validate_image(upload)

    def test_validate_image_rejects_pdf_magic(self):
        pdf_bytes = b"%PDF-1.4\n%..."
        upload = UploadFile(BytesIO(pdf_bytes), filename="test.pdf")
        with pytest.raises(HTTPException) as exc:
            validate_image(upload)
        assert exc.value.status_code == 400

    def test_validate_image_rejects_gif_magic(self):
        gif_bytes = b"GIF89a\x00\x00\x00\x00"
        upload = UploadFile(BytesIO(gif_bytes), filename="test.gif")
        with pytest.raises(HTTPException) as exc:
            validate_image(upload)
        assert exc.value.status_code == 400

    def test_validate_image_rejects_oversized_file(self):
        big_data = b"\xff\xd8\xff" + b"\x00" * (5 * 1024 * 1024 + 1)
        upload = UploadFile(BytesIO(big_data), filename="big.jpg")
        with pytest.raises(HTTPException) as exc:
            validate_image(upload)
        assert exc.value.status_code == 400

    def test_strip_exif_removes_metadata(self):
        jpeg_with_exif = _make_jpeg_with_exif_bytes()
        upload = UploadFile(BytesIO(jpeg_with_exif), filename="exif.jpg")
        result = strip_exif(upload)
        img = Image.open(BytesIO(result))
        exif = img.getexif()
        assert 0x010E not in exif or exif[0x010E] == ""

    def test_create_thumbnail_respects_aspect_ratio(self):
        jpeg = _make_jpeg_bytes(200, 100)
        thumb = create_thumbnail(jpeg, (50, 200))
        img = Image.open(BytesIO(thumb))
        assert img.width <= 50
        assert img.height <= 200

    def test_create_thumbnail_returns_jpeg(self):
        jpeg = _make_jpeg_bytes()
        thumb = create_thumbnail(jpeg)
        assert thumb[:3] == b"\xff\xd8\xff"


class TestWardrobeAPI:
    _email_counter = 100

    @pytest.fixture(autouse=True)
    def _setup(self):
        db = SessionLocal()
        try:
            db.query(ClothingItem).delete()
            db.commit()
        finally:
            db.close()
        upload_dir = os.environ.get("UPLOAD_DIR", "")
        if upload_dir and os.path.isdir(upload_dir):
            for f in os.listdir(upload_dir):
                os.remove(os.path.join(upload_dir, f))

    def _create_user(self, email: str = "test@example.com") -> int:
        db = SessionLocal()
        try:
            user = User(email=email, password_hash=hash_password("password123"))
            db.add(user)
            db.commit()
            db.refresh(user)
            return user.id
        finally:
            db.close()

    def _unique_email(self) -> str:
        TestWardrobeAPI._email_counter += 1
        return f"test{TestWardrobeAPI._email_counter}@example.com"

    def test_unauthorized_no_token(self):
        with TestClient(app) as client:
            resp = client.get("/api/wardrobe")
            assert resp.status_code == 401

    def test_upload_and_list_item(self):
        user_id = self._create_user(self._unique_email())
        headers = _auth_header(user_id)
        jpeg = _make_jpeg_bytes()

        with TestClient(app) as client:
            resp = client.post(
                "/api/wardrobe",
                data={"name": "Red Shirt", "category": "Oberteile"},
                files={"image": ("shirt.jpg", BytesIO(jpeg), "image/jpeg")},
                headers=headers,
            )
            assert resp.status_code == 201
            data = resp.json()
            assert data["name"] == "Red Shirt"
            assert data["category"] == "Oberteile"
            assert data["owner_id"] == user_id

            list_resp = client.get("/api/wardrobe", headers=headers)
            assert list_resp.status_code == 200
            items = list_resp.json()
            assert len(items) == 1
            assert items[0]["name"] == "Red Shirt"

    def test_upload_png(self):
        user_id = self._create_user(self._unique_email())
        headers = _auth_header(user_id)
        png = _make_png_bytes()

        with TestClient(app) as client:
            resp = client.post(
                "/api/wardrobe",
                data={"name": "Green PNG", "category": "Kleider"},
                files={"image": ("dress.png", BytesIO(png), "image/png")},
                headers=headers,
            )
            assert resp.status_code == 201

    def test_category_filter(self):
        user_id = self._create_user(self._unique_email())
        headers = _auth_header(user_id)
        jpeg = _make_jpeg_bytes()

        with TestClient(app) as client:
            client.post(
                "/api/wardrobe",
                data={"name": "Jeans", "category": "Hosen"},
                files={"image": ("jeans.jpg", BytesIO(jpeg), "image/jpeg")},
                headers=headers,
            )
            client.post(
                "/api/wardrobe",
                data={"name": "Jacket", "category": "Oberteile"},
                files={"image": ("jacket.jpg", BytesIO(jpeg), "image/jpeg")},
                headers=headers,
            )

            resp = client.get("/api/wardrobe?category=Hosen", headers=headers)
            assert resp.status_code == 200
            items = resp.json()
            assert len(items) == 1
            assert items[0]["name"] == "Jeans"

    def test_upload_rejects_pdf_magic(self):
        user_id = self._create_user(self._unique_email())
        headers = _auth_header(user_id)

        with TestClient(app) as client:
            resp = client.post(
                "/api/wardrobe",
                data={"name": "Fake", "category": "Oberteile"},
                files={"image": ("fake.pdf", BytesIO(b"%PDF-1.4\n..."), "application/pdf")},
                headers=headers,
            )
            assert resp.status_code == 400

    def test_upload_rejects_oversized(self):
        user_id = self._create_user(self._unique_email())
        headers = _auth_header(user_id)
        big = b"\xff\xd8\xff" + b"\x00" * (5 * 1024 * 1024 + 1)

        with TestClient(app) as client:
            resp = client.post(
                "/api/wardrobe",
                data={"name": "Big", "category": "Oberteile"},
                files={"image": ("big.jpg", BytesIO(big), "image/jpeg")},
                headers=headers,
            )
            assert resp.status_code == 400

    def test_upload_rejects_invalid_category(self):
        user_id = self._create_user(self._unique_email())
        headers = _auth_header(user_id)
        jpeg = _make_jpeg_bytes()

        with TestClient(app) as client:
            resp = client.post(
                "/api/wardrobe",
                data={"name": "BadCat", "category": "InvalidCategory"},
                files={"image": ("bad.jpg", BytesIO(jpeg), "image/jpeg")},
                headers=headers,
            )
            assert resp.status_code == 400

    def test_get_image_own_item(self):
        user_id = self._create_user(self._unique_email())
        headers = _auth_header(user_id)
        jpeg = _make_jpeg_bytes()

        with TestClient(app) as client:
            create_resp = client.post(
                "/api/wardrobe",
                data={"name": "Test", "category": "Accessoires"},
                files={"image": ("test.jpg", BytesIO(jpeg), "image/jpeg")},
                headers=headers,
            )
            item_id = create_resp.json()["id"]

            img_resp = client.get(f"/api/wardrobe/{item_id}/image", headers=headers)
            assert img_resp.status_code == 200
            assert img_resp.headers["content-type"] == "image/jpeg"
            assert img_resp.content[:3] == b"\xff\xd8\xff"

    def test_get_image_other_user_forbidden(self):
        user1_id = self._create_user(self._unique_email())
        user2_id = self._create_user(self._unique_email())
        jpeg = _make_jpeg_bytes()

        with TestClient(app) as client:
            create_resp = client.post(
                "/api/wardrobe",
                data={"name": "Mine", "category": "Schuhe"},
                files={"image": ("mine.jpg", BytesIO(jpeg), "image/jpeg")},
                headers=_auth_header(user1_id),
            )
            item_id = create_resp.json()["id"]

            img_resp = client.get(
                f"/api/wardrobe/{item_id}/image",
                headers=_auth_header(user2_id),
            )
            assert img_resp.status_code == 403

    def test_delete_item(self):
        user_id = self._create_user(self._unique_email())
        headers = _auth_header(user_id)
        jpeg = _make_jpeg_bytes()

        with TestClient(app) as client:
            create_resp = client.post(
                "/api/wardrobe",
                data={"name": "ToDelete", "category": "Kleider"},
                files={"image": ("del.jpg", BytesIO(jpeg), "image/jpeg")},
                headers=headers,
            )
            item_id = create_resp.json()["id"]

            del_resp = client.delete(f"/api/wardrobe/{item_id}", headers=headers)
            assert del_resp.status_code == 200
            assert del_resp.json()["message"] == "Item deleted successfully"

            list_resp = client.get("/api/wardrobe", headers=headers)
            assert list_resp.status_code == 200
            assert len(list_resp.json()) == 0

            upload_dir = os.environ.get("UPLOAD_DIR", "")
            assert not os.path.isfile(os.path.join(upload_dir, f"img_{item_id}.jpg"))
            assert not os.path.isfile(os.path.join(upload_dir, f"thumb_{item_id}.jpg"))

    def test_delete_other_user_forbidden(self):
        user1_id = self._create_user(self._unique_email())
        user2_id = self._create_user(self._unique_email())
        jpeg = _make_jpeg_bytes()

        with TestClient(app) as client:
            create_resp = client.post(
                "/api/wardrobe",
                data={"name": "Mine", "category": "Schuhe"},
                files={"image": ("mine.jpg", BytesIO(jpeg), "image/jpeg")},
                headers=_auth_header(user1_id),
            )
            item_id = create_resp.json()["id"]

            del_resp = client.delete(
                f"/api/wardrobe/{item_id}",
                headers=_auth_header(user2_id),
            )
            assert del_resp.status_code == 403

    def test_exif_stripped_on_upload(self):
        user_id = self._create_user(self._unique_email())
        headers = _auth_header(user_id)
        jpeg_with_exif = _make_jpeg_with_exif_bytes()

        with TestClient(app) as client:
            create_resp = client.post(
                "/api/wardrobe",
                data={"name": "NoExif", "category": "Oberteile"},
                files={"image": ("exif.jpg", BytesIO(jpeg_with_exif), "image/jpeg")},
                headers=headers,
            )
            assert create_resp.status_code == 201
            item_id = create_resp.json()["id"]

            upload_dir = os.environ.get("UPLOAD_DIR", "")
            saved_path = os.path.join(upload_dir, f"img_{item_id}.jpg")
            assert os.path.isfile(saved_path)
            saved_img = Image.open(saved_path)
            saved_exif = saved_img.getexif()
            assert 0x010E not in saved_exif or saved_exif[0x010E] == ""

    def test_wardrobe_does_not_return_other_users_items(self):
        user1_id = self._create_user(self._unique_email())
        user2_id = self._create_user(self._unique_email())
        jpeg = _make_jpeg_bytes()

        with TestClient(app) as client:
            client.post(
                "/api/wardrobe",
                data={"name": "User1 Item", "category": "Oberteile"},
                files={"image": ("u1.jpg", BytesIO(jpeg), "image/jpeg")},
                headers=_auth_header(user1_id),
            )

            resp = client.get("/api/wardrobe", headers=_auth_header(user2_id))
            assert resp.status_code == 200
            assert len(resp.json()) == 0

    def test_get_image_nonexistent_item_returns_404(self):
        user_id = self._create_user(self._unique_email())
        headers = _auth_header(user_id)

        with TestClient(app) as client:
            resp = client.get("/api/wardrobe/99999/image", headers=headers)
            assert resp.status_code == 404

    def test_delete_nonexistent_item_returns_404(self):
        user_id = self._create_user(self._unique_email())
        headers = _auth_header(user_id)

        with TestClient(app) as client:
            resp = client.delete("/api/wardrobe/99999", headers=headers)
            assert resp.status_code == 404
