# Frontend – Red Carpet Closet

Frontend of the "Glamouröser Kleiderschrank-Manager" (Hollywood Red-Carpet style).
A Vite + React 18 + TypeScript single-page app styled with Tailwind CSS, following
the tokens in `DESIGN.md` (deep purple-black stage, champagne-gold accents,
Playfair Display headings, Inter body).

This is the sprint-1 skeleton: it ships the complete app shell (routing, navbar,
layout) with placeholder pages and API client stubs. Feature tickets fill the
pages and API modules in later sprints.

## Tech stack

- Vite (dev server + build)
- React 18 + TypeScript
- react-router-dom (BrowserRouter)
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- Vitest for tests, Oxlint for linting

## Install

```bash
npm ci
```

## Run in dev

```bash
npm run dev
```

Opens the dev server on `http://localhost:5173`. Set `VITE_API_URL` (see
`.env.example`) if the backend lives somewhere other than the default. The
backend itself is declared in the repo-root `RUN.json` and started by the run
runner, which injects `VITE_API_URL` as `${service:api.origin}`.

### Backend prerequisites

The backend must be running for the frontend to be useful. The backend is
Python/FastAPI in `backend/` (see `../RUN.json` for the full service
declaration). To start the backend manually:

```bash
cd ../backend
pip install -r requirements.txt

# JWT_SECRET is required — generate one (RUN.json rolls a fresh hex-32).
# On Windows (PowerShell):
$env:JWT_SECRET = -join ((48..57) + (97..102) | Get-Random -Count 64 | ForEach-Object { [char]$_ })
# On Unix:
export JWT_SECRET=$(python3 -c "import secrets; print(secrets.token_hex(32))")

uvicorn app.main:app --port 8000
```

The backend needs these environment variables (all declared in `RUN.json`):

| Variable       | How to set                                   |
| -------------- | -------------------------------------------- |
| `JWT_SECRET`   | Generate a random hex string (32 bytes)      |
| `DATABASE_URL` | Defaults to `sqlite:///./dev.db`             |
| `UPLOAD_DIR`   | Defaults to `./uploads`                      |

## Test

```bash
npm test
```

## Build for production

```bash
npm run build
```

Output goes to `dist/`. Serve it with `npm run preview` or any static server.

## How to use it

Routes (all pages are placeholders in this skeleton):

| Route            | Page                                  |
| ---------------- | ------------------------------------- |
| `/`              | Home (hero with register/login links) |
| `/login`         | Login                                 |
| `/register`      | Registrierung                         |
| `/wardrobe`      | Garderobe                             |
| `/outfits/create`| Outfit-Creator                        |
| `/outfits`       | Gespeicherte Outfits                  |

The navbar sticks to the top; on mobile it collapses into a hamburger menu.
Every page lives under the shared layout (`src/components/Layout.tsx`) with the
max-width container and footer.

## Feature list (skeleton status)

- App shell with routing, sticky navbar, mobile hamburger menu, layout + footer
- Placeholder pages for home, auth, wardrobe, outfit creator and outfit list
- API client (`src/api/client.ts`) with auth-token injection from localStorage
- API stubs for auth, wardrobe and outfits (to be implemented by feature tickets)
- Tailwind v4 design tokens mapped 1:1 to `DESIGN.md`