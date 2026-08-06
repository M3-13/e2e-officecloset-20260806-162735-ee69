import os

os.environ["SECRET_KEY"] = "0123456789abcdef0123456789abcdef"

from fastapi.testclient import TestClient

from app.auth import hash_password
from app.main import app


def test_register_returns_201_and_token():
    with TestClient(app) as client:
        resp = client.post(
            "/api/auth/register",
            json={"email": "test1@example.com", "password": "secret123"},
        )
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert len(data["access_token"]) > 0


def test_login_returns_200_and_token():
    with TestClient(app) as client:
        client.post(
            "/api/auth/register",
            json={"email": "test2@example.com", "password": "secret123"},
        )
        resp = client.post(
            "/api/auth/login",
            data={"username": "test2@example.com", "password": "secret123"},
        )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password_returns_401():
    with TestClient(app) as client:
        client.post(
            "/api/auth/register",
            json={"email": "test3@example.com", "password": "secret123"},
        )
        resp = client.post(
            "/api/auth/login",
            data={"username": "test3@example.com", "password": "wrongpassword"},
        )
    assert resp.status_code == 401


def test_login_nonexistent_user_returns_401():
    with TestClient(app) as client:
        resp = client.post(
            "/api/auth/login",
            data={"username": "noone@example.com", "password": "secret123"},
        )
    assert resp.status_code == 401


def test_duplicate_registration_returns_409():
    with TestClient(app) as client:
        client.post(
            "/api/auth/register",
            json={"email": "test4@example.com", "password": "secret123"},
        )
        resp = client.post(
            "/api/auth/register",
            json={"email": "test4@example.com", "password": "secret123"},
        )
    assert resp.status_code == 409


def test_delete_account_returns_200():
    with TestClient(app) as client:
        reg_resp = client.post(
            "/api/auth/register",
            json={"email": "test5@example.com", "password": "secret123"},
        )
        token = reg_resp.json()["access_token"]

        del_resp = client.delete(
            "/api/auth/account",
            headers={"Authorization": f"Bearer {token}"},
        )
    assert del_resp.status_code == 200
    assert del_resp.json() == {"message": "Account deleted successfully"}


def test_delete_account_without_auth_returns_401():
    with TestClient(app) as client:
        resp = client.delete("/api/auth/account")
    assert resp.status_code == 401


def test_subsequent_login_after_delete_fails():
    with TestClient(app) as client:
        reg_resp = client.post(
            "/api/auth/register",
            json={"email": "test6@example.com", "password": "secret123"},
        )
        token = reg_resp.json()["access_token"]

        client.delete(
            "/api/auth/account",
            headers={"Authorization": f"Bearer {token}"},
        )

        login_resp = client.post(
            "/api/auth/login",
            data={"username": "test6@example.com", "password": "secret123"},
        )
    assert login_resp.status_code == 401


def test_hash_format_starts_with_bcrypt_prefix():
    h = hash_password("somepassword")
    assert h.startswith("$2b$")
