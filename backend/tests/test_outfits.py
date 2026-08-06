from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base
from app.database import get_db as _original_get_db
from app.main import app
from app.models import ClothingItem, Outfit, OutfitItem, User


def _setup_test_db():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    session_local = sessionmaker(
        autocommit=False, autoflush=False, bind=engine, expire_on_commit=False
    )
    return engine, session_local


def _make_test_client(session_local):
    def _override_get_db():
        db = session_local()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides.clear()
    app.dependency_overrides[_original_get_db] = _override_get_db
    return TestClient(app)


@pytest.fixture
def client():
    _engine, session_local = _setup_test_db()
    tc = _make_test_client(session_local)
    yield tc, session_local
    app.dependency_overrides.clear()


class TestCreateOutfit:
    def test_create_outfit_returns_201(self, client):
        tc, session_local = client
        db = session_local()
        user = User(id=1, email="a@b.com", password_hash="h")
        item = ClothingItem(
            id=1, name="Shirt", category="tops", image_path="/img/1.jpg", owner_id=1
        )
        db.add_all([user, item])
        db.commit()
        db.close()

        with patch("app.routers.outfits.get_current_user", return_value=user):
            resp = tc.post("/api/outfits", json={"name": "My Outfit", "item_ids": [1]})

        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "My Outfit"
        assert data["owner_id"] == 1
        assert len(data["items"]) == 1
        assert data["items"][0]["name"] == "Shirt"

    def test_create_outfit_with_foreign_item_returns_403(self, client):
        tc, session_local = client
        db = session_local()
        user = User(id=1, email="a@b.com", password_hash="h")
        other_user = User(id=2, email="other@b.com", password_hash="h")
        item = ClothingItem(
            id=1, name="Shirt", category="tops", image_path="/img/1.jpg", owner_id=2
        )
        db.add_all([user, other_user, item])
        db.commit()
        db.close()

        with patch("app.routers.outfits.get_current_user", return_value=user):
            resp = tc.post("/api/outfits", json={"name": "Bad", "item_ids": [1]})

        assert resp.status_code == 403

    def test_create_outfit_with_nonexistent_item_returns_404(self, client):
        tc, session_local = client
        db = session_local()
        user = User(id=1, email="a@b.com", password_hash="h")
        db.add(user)
        db.commit()
        db.close()

        with patch("app.routers.outfits.get_current_user", return_value=user):
            resp = tc.post("/api/outfits", json={"name": "Bad", "item_ids": [999]})

        assert resp.status_code == 404

    def test_create_outfit_with_empty_ids_returns_400(self, client):
        tc, session_local = client
        db = session_local()
        user = User(id=1, email="a@b.com", password_hash="h")
        db.add(user)
        db.commit()
        db.close()

        with patch("app.routers.outfits.get_current_user", return_value=user):
            resp = tc.post("/api/outfits", json={"name": "Empty", "item_ids": []})

        assert resp.status_code == 400


class TestListOutfits:
    def test_list_outfits_returns_200_with_items(self, client):
        tc, session_local = client
        db = session_local()
        user = User(id=1, email="a@b.com", password_hash="h")
        item1 = ClothingItem(
            id=1, name="Shirt", category="tops", image_path="/img/1.jpg", owner_id=1
        )
        item2 = ClothingItem(
            id=2, name="Jeans", category="bottoms", image_path="/img/2.jpg", owner_id=1
        )
        db.add_all([user, item1, item2])
        db.commit()

        outfit = Outfit(id=1, name="Casual", owner_id=1)
        db.add(outfit)
        db.flush()
        db.add(OutfitItem(outfit_id=1, clothing_item_id=1))
        db.add(OutfitItem(outfit_id=1, clothing_item_id=2))
        db.commit()
        db.close()

        with patch("app.routers.outfits.get_current_user", return_value=user):
            resp = tc.get("/api/outfits")

        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["name"] == "Casual"
        assert len(data[0]["items"]) == 2

    def test_list_outfits_excludes_other_users(self, client):
        tc, session_local = client
        db = session_local()
        user = User(id=1, email="a@b.com", password_hash="h")
        other_user = User(id=2, email="other@b.com", password_hash="h")
        item = ClothingItem(
            id=1, name="Shirt", category="tops", image_path="/img/1.jpg", owner_id=1
        )
        db.add_all([user, other_user, item])
        db.commit()

        other_outfit = Outfit(id=1, name="Theirs", owner_id=2)
        db.add(other_outfit)
        db.flush()
        db.add(OutfitItem(outfit_id=1, clothing_item_id=1))
        db.commit()
        db.close()

        with patch("app.routers.outfits.get_current_user", return_value=user):
            resp = tc.get("/api/outfits")

        assert resp.status_code == 200
        assert resp.json() == []


class TestDeleteOutfit:
    def test_delete_outfit_returns_200(self, client):
        tc, session_local = client
        db = session_local()
        user = User(id=1, email="a@b.com", password_hash="h")
        item = ClothingItem(
            id=1, name="Shirt", category="tops", image_path="/img/1.jpg", owner_id=1
        )
        db.add_all([user, item])
        db.commit()

        outfit = Outfit(id=1, name="To Delete", owner_id=1)
        db.add(outfit)
        db.flush()
        db.add(OutfitItem(outfit_id=1, clothing_item_id=1))
        db.commit()
        db.close()

        with patch("app.routers.outfits.get_current_user", return_value=user):
            resp = tc.delete("/api/outfits/1")

        assert resp.status_code == 200
        assert resp.json() == {"message": "Outfit deleted"}

        with patch("app.routers.outfits.get_current_user", return_value=user):
            list_resp = tc.get("/api/outfits")
        assert list_resp.status_code == 200
        assert list_resp.json() == []

    def test_delete_other_users_outfit_returns_403(self, client):
        tc, session_local = client
        db = session_local()
        user = User(id=1, email="a@b.com", password_hash="h")
        other_user = User(id=2, email="other@b.com", password_hash="h")
        item = ClothingItem(
            id=1, name="Shirt", category="tops", image_path="/img/1.jpg", owner_id=2
        )
        db.add_all([user, other_user, item])
        db.commit()

        outfit = Outfit(id=1, name="Theirs", owner_id=2)
        db.add(outfit)
        db.flush()
        db.add(OutfitItem(outfit_id=1, clothing_item_id=1))
        db.commit()
        db.close()

        with patch("app.routers.outfits.get_current_user", return_value=user):
            resp = tc.delete("/api/outfits/1")

        assert resp.status_code == 403

    def test_delete_nonexistent_outfit_returns_404(self, client):
        tc, session_local = client
        db = session_local()
        user = User(id=1, email="a@b.com", password_hash="h")
        db.add(user)
        db.commit()
        db.close()

        with patch("app.routers.outfits.get_current_user", return_value=user):
            resp = tc.delete("/api/outfits/999")

        assert resp.status_code == 404
