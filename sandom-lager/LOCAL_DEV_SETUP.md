# Local Development Setup Guide

## Quick Start

### Option 1: Run Frontend Locally (Best for Development)

**Prerequisites:**
- Node.js 20+ installed
- Backend running (see Option 2 below)

**Steps:**

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start frontend dev server:**
   ```bash
   npm run dev
   ```
   
   You should see:
   ```
   ➜  Local:   http://localhost:5173/
   ➜  Network: http://<your-ip>:5173/
   ```

3. **In another terminal, start backend** (see Option 2)

4. **Open browser to http://localhost:5173**

---

### Option 2: Start Backend

Choose ONE based on your setup:

#### A. Backend Running Locally (npm)

```bash
cd backend
npm install
npm run dev
```

Backend will start on `http://localhost:5000`

**Update frontend/.env:**
```env
VITE_API_BASE_URL=http://localhost:5000
```

#### B. Backend in Docker (Recommended for Isolation)

```bash
docker-compose up --build
```

This starts:
- Frontend: http://localhost:5173 (Vite dev server)
- Backend: http://localhost:5001 (mapped from Docker 5000)
- Database: PostgreSQL on 5432

**Update frontend/.env:**
```env
VITE_API_BASE_URL=http://localhost:5001
```

---

## Required Setup for Both Options

### 1. Create `frontend/.env`

```bash
cp frontend/.env.example frontend/.env
```

Edit with your Auth0 credentials:
```env
VITE_AUTH0_DOMAIN=your-dev-auth0-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-dev-client-id
VITE_AUTH0_AUDIENCE=https://sandom-api

# Set this based on where backend is running:
# Local backend: http://localhost:5000
# Docker backend: http://localhost:5001 (or http://backend:5000 if frontend in Docker too)
VITE_API_BASE_URL=http://localhost:5000
```

### 2. For Backend in Docker: Create backend/.env

```bash
cp backend/.env.example backend/.env
```

Edit with your credentials:
```env
DATABASE_URL=postgresql://admin:admin@db:5432/sandomlager
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_AUDIENCE=https://sandom-api
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://frontend:5173
```

---

## Common Issues & Solutions

### Issue: WebSocket connection fails to `ws://localhost:5173`

**Symptom:**
```
[vite] failed to connect to websocket.
```

**Solution:**
- Vite now binds to `0.0.0.0` to accept all connections
- Clear browser cache: DevTools → Application → Clear all
- Restart `npm run dev` in frontend
- Refresh browser

### Issue: API calls fail with `net::ERR_FAILED`

**Symptom:**
```
GET http://localhost:5000/api/me net::ERR_FAILED
```

**Causes & Solutions:**

1. **Backend not running:**
   ```bash
   # Check if backend is running on correct port
   lsof -i :5000  # for local backend
   lsof -i :5001  # for Docker backend
   
   # If not, start it:
   # Local: cd backend && npm run dev
   # Docker: docker-compose up --build
   ```

2. **Wrong API URL in frontend/.env:**
   - If backend on `localhost:5000`, set: `VITE_API_BASE_URL=http://localhost:5000`
   - If backend on Docker (5001): `VITE_API_BASE_URL=http://localhost:5001`
   - If frontend also in Docker: `VITE_API_BASE_URL=http://backend:5000`

3. **Service worker interfering:**
   - Service worker is now disabled in development mode
   - If still seeing errors, clear browser cache and storage:
     - DevTools → Application → Clear site data
     - Restart `npm run dev`

### Issue: HMR WebSocket on Different Machine

If you're running frontend on a different machine from where you access it:

**Set in frontend/.env:**
```env
VITE_HMR_HOST=your-machine-ip
VITE_HMR_PORT=5173
```

For example, if frontend runs on `192.168.1.100`:
```env
VITE_HMR_HOST=192.168.1.100
VITE_HMR_PORT=5173
```

---

## Full Stack Refresh

If things are really broken, do a clean restart:

```bash
# Stop all services
docker-compose down -v  # if using Docker (removes data)

# Clear frontend
rm -rf frontend/node_modules frontend/dist
cd frontend
npm install

# Clear backend
cd ../backend
npm install

# Restart
docker-compose up --build  # or npm run dev for each
```

---

## Production vs Development

| Aspect | Development | Production |
|--------|------------|-----------|
| **Frontend** | Vite dev server with HMR | Static build on Cloudflare Pages |
| **Backend** | Local or Docker | Render.com |
| **Database** | Docker PostgreSQL or Supabase | Supabase PostgreSQL |
| **Auth0** | Dev Auth0 app | Production Auth0 app |
| **Service Worker** | Disabled | Enabled |
| **Hot reload** | Yes (HMR) | No |
| **API URL** | localhost:5000/5001 | https://sandom-backend.onrender.com |

---

## Development Workflow

### Making Code Changes

**Frontend:**
```bash
cd frontend && npm run dev
# Edit files in src/
# Browser auto-refreshes (HMR)
```

**Backend:**
```bash
cd backend && npm run dev
# Edit files in src/
# Restart with: Ctrl+C then npm run dev (or docker-compose restart backend)
```

### Testing API Changes

1. Make changes in `backend/src/`
2. If using Docker: `docker-compose restart backend`
3. If local: Restart `npm run dev`
4. Frontend API calls auto-retry on HMR refresh

### Database Changes

1. Edit schema in `backend/src/db/schema.sql`
2. Restart backend (schema re-applies on startup)
3. Or manually apply in pgAdmin at http://localhost:5050

---

## Ports Reference

| Service | Port | Access |
|---------|------|--------|
| Frontend (Vite) | 5173 | http://localhost:5173 |
| Frontend (fallback) | 5174 | http://localhost:5174 |
| Backend (Docker) | 5001 | http://localhost:5001 |
| Backend (Local) | 5000 | http://localhost:5000 |
| Backend Internal | 5000 | http://backend:5000 (Docker only) |
| PostgreSQL | 5432 | localhost:5432 |
| pgAdmin | 5050 | http://localhost:5050 |

---

## Key Changes Made for Local Dev

1. **Vite now binds to `0.0.0.0`** - Accepts WebSocket HMR connections from all interfaces
2. **Service worker disabled in dev** - Prevents interfering with API calls
3. **Updated `frontend/.env`** - Correct backend port and clear instructions
4. **HMR configuration** - Respects `VITE_HMR_HOST` and `VITE_HMR_PORT` env vars

---

## Next Steps

1. Update your `frontend/.env` with correct backend port
2. Restart `npm run dev` (or `docker-compose up`)
3. Open http://localhost:5173
4. Browser DevTools → Network tab should show successful API calls
5. HMR should auto-refresh when you edit files

**If issues persist:**
- Check browser DevTools Console for errors
- Check backend logs: `docker-compose logs backend` or terminal output
- Verify ports with: `lsof -i :5000` (Unix) or `netstat -an | find ":5000"` (Windows)
