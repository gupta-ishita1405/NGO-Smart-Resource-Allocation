# NeedSync — Silent & Smart Resource Allocation Platform

> *"Most platforms assume people can ask for help publicly. We built NeedSync for those who can't."*

A web platform that connects people in need with the right volunteers — anonymously, locally, and quickly. Built for hackathon prototyping with a production-grade architecture.

---

## Tech Stack

| Layer    | Technology                           |
|----------|--------------------------------------|
| Frontend | React 19 + Tailwind CSS + shadcn/ui  |
| Backend  | FastAPI (Python 3.10+)               |
| Database | MongoDB                              |
| Auth     | JWT (Bearer token) with bcrypt       |
| Icons    | lucide-react                         |
| Fonts    | Cormorant Garamond + Manrope         |

---

## Features

- **Anonymous help requests** — 4 categories: Food, Medical, Safety, Emotional Support
- **Smart matching engine** — ranks volunteers by location + skills + trust score
- **Urgency system** — High / Medium / Low with priority sorting
- **Trust score** — automatically updates when volunteers complete tasks
- **Volunteer dashboard** — accept/complete requests, see live stats
- **Tracking codes** — every request gets a `NS-XXXXXXX` code for status updates
- **Hyperlocal filtering** — by city, category, urgency

---

## Quick Start (Local Desktop Setup)

### Prerequisites

Install these on your machine:

1. **Node.js 18+** — https://nodejs.org/ (`node --version` should show 18+)
2. **Yarn** — `npm install -g yarn`
3. **Python 3.10+** — https://www.python.org/ (`python3 --version`)
4. **MongoDB Community** — https://www.mongodb.com/try/download/community
   - Start MongoDB locally: `mongod` (or use MongoDB Compass / Atlas)

### Step 1 — Clone / Extract

```bash
unzip needsync.zip
cd needsync
```

### Step 2 — Backend setup

```bash
cd backend
python3 -m venv venv

# Mac / Linux
source venv/bin/activate
# Windows
# venv\Scripts\activate

pip install -r requirements.txt
```

Create / edit `backend/.env`:

```
MONGO_URL="mongodb://localhost:27017"
DB_NAME="needsync_db"
CORS_ORIGINS="http://localhost:3000"
JWT_SECRET="change-me-to-a-random-64-char-string"
ADMIN_EMAIL="admin@needsync.org"
ADMIN_PASSWORD="Admin@123"
```

Run the backend:

```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

The API will be live at **http://localhost:8001/api**.

On first run, two seed users are created automatically:
- `admin@needsync.org` / `Admin@123`
- `demo@needsync.org` / `Demo@123`

### Step 3 — Frontend setup

In a new terminal:

```bash
cd frontend
yarn install
```

Create / edit `frontend/.env`:

```
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=0
```

Run the frontend:

```bash
yarn start
```

App opens at **http://localhost:3000**.

### Step 4 — Try it!

1. Visit `http://localhost:3000`
2. Click **"Ask for Help"** → submit an anonymous request → copy your `NS-XXXX` code
3. **Login** as `demo@needsync.org` / `Demo@123` → open **Dashboard**
4. Accept the request, then mark it complete → trust score goes up

---

## Project Structure

```
needsync/
├── backend/
│   ├── server.py            # FastAPI app + all endpoints
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── api.js           # axios with JWT interceptor
│   │   ├── context/AuthContext.jsx
│   │   ├── components/      # Navbar, Tags, ui/...
│   │   └── pages/           # Landing, RequestHelp, Track, Browse, Login, Register, Dashboard
│   ├── package.json
│   └── .env
└── README.md
```

---

## API Reference

| Method | Endpoint                            | Auth | Description                    |
|--------|-------------------------------------|------|--------------------------------|
| POST   | `/api/auth/register`                | —    | Create volunteer account       |
| POST   | `/api/auth/login`                   | —    | Returns `{user, token}`        |
| GET    | `/api/auth/me`                      | ✓    | Current user                   |
| POST   | `/api/requests`                     | —    | Create help request (anon ok)  |
| GET    | `/api/requests`                     | —    | List + filter requests         |
| GET    | `/api/requests/track/{code}`        | —    | Track by `NS-XXXXX` code       |
| GET    | `/api/requests/{id}`                | —    | Single request                 |
| POST   | `/api/requests/{id}/accept`         | ✓    | Volunteer accepts              |
| POST   | `/api/requests/{id}/complete`       | ✓    | Mark completed (+trust score)  |
| POST   | `/api/requests/{id}/cancel`         | ✓    | Release back to pool           |
| GET    | `/api/match/{request_id}`           | —    | Top 5 matched volunteers       |
| GET    | `/api/volunteer/dashboard`          | ✓    | Volunteer dashboard data       |
| GET    | `/api/stats/public`                 | —    | Counts for landing page        |

---


