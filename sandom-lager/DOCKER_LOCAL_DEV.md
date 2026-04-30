# Docker Local Development Setup

## Overview

This project supports local development with Docker using `docker-compose`. The setup allows you to run the full stack (frontend, backend, database) in containers while maintaining live development features like hot reload (HMR) and debugging.

## Prerequisites

- Docker and Docker Compose installed
- Your Auth0 credentials (for the `frontend/.env` file)
- Repository cloned: `sandom-lager`

## Setup Steps

### 1. Create `frontend/.env`

Copy the template and fill in your Auth0 credentials:

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:
```env
VITE_AUTH0_DOMAIN=your-auth0-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_API_BASE_URL=http://backend:5000
VITE_AUTH0_AUDIENCE=https://sandom-api
```

### 2. Create backend/.env

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with:
```env
# Database - use the Postgres service name from docker-compose
DATABASE_URL=postgresql://your_user:your_password@postgres:5432/sandom_db

# Auth0
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_AUDIENCE=https://sandom-api

# Cloudinary (if using image uploads)
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://frontend:5173,http://frontend:5174

# API keys for admin operations
ADMIN_API_KEY=your-admin-key-for-local-testing
```

### 3. Start Docker Compose

```bash
docker-compose up --build
```

This starts three services:
- **frontend**: Vite dev server on `http://localhost:5173`
- **backend**: Node/Express server on `http://localhost:5000`
- **postgres**: PostgreSQL database

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Backend health check: http://localhost:5000/api/health

## HMR (Hot Module Replacement) Setup

The Vite dev server should automatically connect for live reloading. If you see WebSocket errors:

**Solution 1 - Default (Usually works):**
Just use default config - Vite auto-detects and uses `localhost:5173`

**Solution 2 - If WebSocket fails:**
Add to `frontend/.env`:
```env
VITE_HMR_HOST=localhost
VITE_HMR_PORT=5173
```

**Solution 3 - Docker Desktop on Mac/Windows:**
Add to `frontend/.env`:
```env
VITE_HMR_HOST=host.docker.internal
VITE_HMR_PORT=5173
```

## Production vs Local Development

| Aspect | Local Docker | Production |
|--------|--------------|-----------|
| **Frontend** | Vite dev server (HMR) | Cloudflare Pages (static build) |
| **Backend** | Docker container | Render.com |
| **Database** | Docker PostgreSQL | Supabase (managed) |
| **Auth0 Domain** | Your dev Auth0 app | Your production Auth0 app |
| **API URL** | `http://backend:5000` | `https://sandom-backend.onrender.com` |
| **Auto-reload** | Yes (HMR) | Manual deploy to Pages |

## Common Issues and Solutions

### Issue: WebSocket connection fails
**Error**: `WebSocket connection to 'ws://localhost:5173' failed`

**Fix**: Add to `frontend/.env`:
```env
VITE_HMR_HOST=localhost
VITE_HMR_PORT=5173
```

Or for Docker Desktop:
```env
VITE_HMR_HOST=host.docker.internal
```

### Issue: Cannot connect to backend API
**Error**: `CORS error` or `Connection refused`

**Fix**: Ensure `backend/.env` has correct `DATABASE_URL` and `ALLOWED_ORIGINS` includes frontend URL:
```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://frontend:5173
DATABASE_URL=postgresql://user:password@postgres:5432/sandom_db
```

### Issue: React hooks error (useAuth0)
**Error**: `Invalid hook call. Hooks can only be called inside of the body of a function component.`

**Fix**: 
1. Ensure `frontend/.env` has Auth0 domain and client ID
2. Frontend defaults to demo values if not set (for development only)
3. Make sure `Auth0Provider` wraps the app in `main.tsx`

### Issue: Database schema missing
**Error**: Backend returns 500 errors on `/api/recipes`, etc.

**Fix**: Schema is applied on backend startup. Ensure:
1. `DATABASE_URL` is set correctly in `backend/.env`
2. PostgreSQL container is running: `docker-compose ps`
3. Check backend logs: `docker-compose logs backend`

## Development Workflow

### Making changes to frontend code
- Edit files in `frontend/src/`
- Vite automatically reloads (HMR) - no restart needed
- Check browser for changes at http://localhost:5173

### Making changes to backend code
- Edit files in `backend/src/`
- Restart backend container: `docker-compose restart backend`
- Or stop and rebuild: `docker-compose down && docker-compose up --build`

### Database changes
- Edit schema in `backend/src/db/schema.sql`
- Restart backend to re-apply schema
- Or manually run SQL in PostgreSQL container:
  ```bash
  docker-compose exec postgres psql -U postgres -d sandom_db -f /app/src/db/schema.sql
  ```

## Debugging

### View logs for a service
```bash
docker-compose logs backend     # Backend logs
docker-compose logs frontend    # Frontend logs
docker-compose logs postgres    # Database logs
docker-compose logs -f backend  # Follow backend logs (live)
```

### Connect to PostgreSQL database
```bash
docker-compose exec postgres psql -U postgres -d sandom_db
```

Then in psql:
```sql
\dt                    -- List tables
SELECT * FROM users;   -- Query users table
```

### Stop everything
```bash
docker-compose down
```

### Remove volumes (reset database)
```bash
docker-compose down -v
```

## Environment Variables Reference

### Frontend (frontend/.env)
- `VITE_AUTH0_DOMAIN` - Auth0 tenant domain
- `VITE_AUTH0_CLIENT_ID` - Auth0 application client ID
- `VITE_AUTH0_AUDIENCE` - Auth0 API identifier (default: `https://sandom-api`)
- `VITE_API_BASE_URL` - Backend API URL (local: `http://backend:5000`)
- `VITE_HMR_HOST` - Vite HMR host for Docker
- `VITE_HMR_PORT` - Vite HMR port (default: 5173)

### Backend (backend/.env)
- `DATABASE_URL` - PostgreSQL connection string (local: `postgresql://user:pass@postgres:5432/sandom_db`)
- `AUTH0_DOMAIN` - Auth0 tenant domain
- `AUTH0_AUDIENCE` - Auth0 API identifier
- `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - Image upload service
- `ALLOWED_ORIGINS` - CORS allowed origins (local: `http://localhost:5173,http://frontend:5173`)
- `NODE_ENV` - Environment (default: `development`)

## Production Deployment Notes

When deploying to production:

1. **Frontend**: Build and deploy to Cloudflare Pages
   - Uses production Auth0 credentials
   - API base URL points to production backend (Render)
   - No HMR needed

2. **Backend**: Deploy to Render.com
   - Uses Supabase PostgreSQL (managed database)
   - Production Auth0 credentials
   - CORS allows Cloudflare Pages domain

3. **Database**: Supabase PostgreSQL
   - Schema automatically applied via backend startup
   - No Docker container needed

## Additional Resources

- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Vite Server Configuration](https://vitejs.dev/config/server-options.html#server-hmr)
- [Auth0 Getting Started](https://auth0.com/docs/get-started)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres)
