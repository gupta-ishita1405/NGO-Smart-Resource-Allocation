# NeedSync

A community platform that connects people who need help with volunteers who can provide it. Users can submit assistance requests, volunteers can browse and accept them, and everyone can track progress in real time.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Tailwind CSS, shadcn/ui, React Router |
| Backend | FastAPI (Python 3.14+) |
| Database | MongoDB (via Motor async driver) |
| Auth | JWT (PyJWT) + bcrypt |

---

## Project Structure

```
needsync/
├── backend/
│   ├── server.py          # FastAPI app — all routes and business logic
│   ├── requirements.txt   # Python dependencies
│   └── .env               # Environment variables (see setup below)
└── frontend/
    ├── src/
    │   ├── App.js          # Routes
    │   ├── pages/          # Landing, RequestHelp, Track, Browse, Login, Register, Dashboard
    │   ├── components/     # Navbar, shadcn/ui components
    │   ├── context/        # AuthContext (JWT session management)
    │   └── api.js          # Axios base config
    ├── package.json
    └── .env.example
```

---

## Prerequisites

- Python 3.14+
- Node.js 18+
- MongoDB Community Server running on `localhost:27017`

> **MongoDB not running?** Download it from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community), install it, then start the service before running the backend.

---

## Setup

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd needsync
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/`:

```env
MONGO_URL=mongodb://localhost:27017/
DB_NAME=needsync
JWT_SECRET=your-secret-key-here
ADMIN_EMAIL=admin@needsync.org
ADMIN_PASSWORD=Admin@123
```

Start the server:

```bash
uvicorn server:app --reload
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### 3. Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/` (see `.env.example`):

```env
REACT_APP_API_URL=http://localhost:8000
```

Start the dev server:

```bash
npm start
```

The app will open at `http://localhost:3000`.

---

## Seeded Accounts

On first startup the backend seeds two accounts for testing:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@needsync.org` | `Admin@123` |
| Volunteer (demo) | `demo@needsync.org` | `Demo@123` |

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/request` | Submit a help request |
| `/track` | Track a request by code |
| `/browse` | Browse open requests (volunteers) |
| `/dashboard` | User dashboard — your requests and accepted tasks |
| `/login` | Sign in |
| `/register` | Create an account |

---

## API Overview

All routes are prefixed with `/api`. Authentication uses a Bearer token in the `Authorization` header.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/register` | No | Create account |
| POST | `/api/login` | No | Get JWT token |
| GET | `/api/me` | Yes | Current user profile |
| POST | `/api/requests` | Yes | Submit a help request |
| GET | `/api/requests` | No | List open requests |
| GET | `/api/requests/{id}` | No | Get request detail |
| PATCH | `/api/requests/{id}/accept` | Yes | Volunteer accepts a request |
| PATCH | `/api/requests/{id}/complete` | Yes | Mark request complete |
| GET | `/api/track/{code}` | No | Track by code |

Full interactive docs available at `/docs` when the backend is running.

---

## Environment Variables

### Backend

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URL` | Yes | MongoDB connection string |
| `DB_NAME` | Yes | Database name |
| `JWT_SECRET` | Yes | Secret key for signing tokens |
| `ADMIN_EMAIL` | No | Seeded admin email (default: `admin@needsync.org`) |
| `ADMIN_PASSWORD` | No | Seeded admin password (default: `Admin@123`) |

### Frontend

| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_API_URL` | Yes | Backend base URL |

---

## Common Issues

**`ECONNREFUSED 127.0.0.1:27017`** — MongoDB is not running. Start the `mongod` service and retry.

**`pip install` fails on numpy/pandas** — Make sure you are using Python 3.14 and have the latest pip: `pip install --upgrade pip`.

**CORS errors in browser** — Confirm `REACT_APP_API_URL` matches the address the backend is actually running on.
