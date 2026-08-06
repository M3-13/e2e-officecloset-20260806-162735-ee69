# Glamouröser Kleiderschrank-Manager – Hollywood Red-Carpet-Style

Ein eleganter Web-Kleiderschrank-Manager: Benutzer registrieren sich, legen
Kleidungsstücke mit Bildern und Kategorien an, durchstöbern ihre Garderobe und
kombinieren im Outfit-Creator Einzelteile zu gespeicherten Outfits – alles in
glamouröser Red-Carpet-Optik.

## Tech Stack

| Layer    | Technology              |
| -------- | ----------------------- |
| Backend  | Python 3.12+, FastAPI   |
| Database | SQLite (via SQLAlchemy) |
| Auth     | JWT Access Tokens       |
| Frontend | Vite + React 18 + TypeScript |
| Styling  | Tailwind CSS            |
| Storage  | Lokales Dateisystem     |

## Projektstruktur

```
backend/
  app/
    main.py          # FastAPI-App, CORS, Router-Mounting, Health-Endpoint
    database.py      # SQLAlchemy Engine, SessionLocal, Base, get_db
    models.py        # DB-Modelle: User, ClothingItem, Outfit, OutfitItem
    schemas.py       # Pydantic-Schemas für API-Requests/Responses
    auth.py          # Auth-Hilfsfunktionen (Stubs für Sprint 1)
    image_utils.py   # Bildverarbeitung (Stubs für Sprint 1)
    routers/
      auth.py        # /api/auth/*  (POST /register, POST /login, DELETE /account)
      wardrobe.py    # /api/wardrobe/* (GET /, POST /, GET /{id}/image, DELETE /{id})
      outfits.py     # /api/outfits/* (GET /, POST /, DELETE /{id})
  tests/
    test_health.py   # Health-Endpoint-Test
  requirements.txt
frontend/
  src/
    ...
```

## Installation & Start

### Voraussetzungen

- Python 3.12 oder höher
- Node.js 20 oder höher (für Frontend)

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Der Server startet unter `http://localhost:8000`.
Der Health-Endpoint ist erreichbar unter `GET /api/health` → `{"status": "ok"}`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Das Frontend startet unter `http://localhost:5173` und erwartet das Backend
unter `http://localhost:8000` (konfigurierbar via `VITE_API_URL`).

## Umgebungsvariablen

| Variable         | Beschreibung                        | Default                   |
| ---------------- | ----------------------------------- | ------------------------- |
| `SECRET_KEY`     | JWT-Signing-Key (hex, 32 Bytes)     | *generiert pro Start*     |
| `DATABASE_URL`   | SQLAlchemy-Datenbank-URL            | `sqlite:///./wardrobe.db` |
| `UPLOAD_DIR`     | Verzeichnis für hochgeladene Bilder | `./uploads`               |
| `FRONTEND_ORIGIN`| Erlaubte CORS-Origin                | `http://localhost:5173`   |
| `PORT`           | Backend-Port                        | `8000`                    |

## API-Endpunkte

### Health

| Methode | Pfad          | Antwort            | Status |
| ------- | ------------- | ------------------ | ------ |
| GET     | `/api/health` | `{"status":"ok"}`  | 200    |

### Auth (Stubs – implementiert in Ticket #1)

| Methode | Pfad               | Beschreibung      | Status |
| ------- | ------------------ | ----------------- | ------ |
| POST    | `/api/auth/register` | Registrierung   | 501    |
| POST    | `/api/auth/login`    | Login           | 501    |
| DELETE  | `/api/auth/account`  | Account löschen | 501    |

### Wardrobe (Stubs – implementiert in Ticket #5)

| Methode | Pfad                      | Beschreibung               | Status |
| ------- | ------------------------- | -------------------------- | ------ |
| GET     | `/api/wardrobe`           | Garderobe auflisten        | 501    |
| POST    | `/api/wardrobe`           | Kleidungsstück anlegen     | 501    |
| GET     | `/api/wardrobe/{id}/image`| Bild abrufen               | 501    |
| DELETE  | `/api/wardrobe/{id}`      | Kleidungsstück löschen     | 501    |

### Outfits (Stubs – implementiert in Ticket #2)

| Methode | Pfad                 | Beschreibung          | Status |
| ------- | -------------------- | --------------------- | ------ |
| GET     | `/api/outfits`       | Outfits auflisten     | 501    |
| POST    | `/api/outfits`       | Outfit erstellen      | 501    |
| DELETE  | `/api/outfits/{id}`  | Outfit löschen        | 501    |

## Features

- Benutzer-Registrierung und Login mit JWT-Authentifizierung
- Kleidungsstück-Verwaltung mit Bild-Upload, Kategorien und Filterung
- Outfit-Creator mit Live-Vorschau und Speicherung
- Account-Löschung mit vollständiger Datenbereinigung
