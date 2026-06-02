# Oppsett og avhengigheter

Dette dokumentet beskriver hvilke verktøy, kontoer og tjenester som må settes opp før Sandom Lager kan kjøres.

---

## Innhold

- [Lokale verktøy](#lokale-verktøy)
- [Auth0](#auth0)
- [Cloudinary](#cloudinary)
- [Database (PostgreSQL)](#database-postgresql)
- [Miljøvariabler](#miljøvariabler)
- [Oppstartsrekkefølge](#oppstartsrekkefølge)

---

## Lokale verktøy

| Verktøy | Krav | Kommentar |
|---|---|---|
| Node.js | v18 eller nyere | Kreves for backend og frontend |
| npm | Følger med Node.js | Brukes til avhengigheter |
| Git | Valgfri versjon | For kloning av repo |
| Docker Desktop | Valgfri | Kun nødvendig ved Docker-oppsett |
| PostgreSQL | Valgfri | Kun nødvendig ved manuelt oppsett uten Docker |

---

## Auth0

Auth0 brukes til innlogging og autentisering. To separate applikasjoner må opprettes i Auth0.

### 1. Opprett Auth0-tenant

Registrer konto på [auth0.com](https://auth0.com) og opprett en tenant.

### 2. Opprett SPA-applikasjon (frontend)

1. Gå til **Applications → Applications → Create Application**
2. Velg **Single Page Web Application**
3. Under **Settings**, noter:
   - **Domain** → `VITE_AUTH0_DOMAIN`
   - **Client ID** → `VITE_AUTH0_CLIENT_ID`
4. Under **Allowed Callback URLs**, legg til:
   ```
   http://localhost:5173
   ```
5. Under **Allowed Logout URLs**, legg til:
   ```
   http://localhost:5173
   ```
6. Under **Allowed Web Origins**, legg til:
   ```
   http://localhost:5173
   ```

### 3. Opprett API (backend audience)

1. Gå til **Applications → APIs → Create API**
2. Sett **Identifier** (audience), f.eks.:
   ```
   https://sandom-api
   ```
3. Noter identifier → `AUTH0_AUDIENCE` og `VITE_AUTH0_AUDIENCE`

### 4. Opprett Machine-to-Machine-applikasjon (backend)

Brukes av backend for å kalle Auth0 Management API (blokkering av brukere m.m.).

1. Gå til **Applications → Applications → Create Application**
2. Velg **Machine to Machine Application**
3. Koble til **Auth0 Management API**
4. Gi tilgang til følgende scopes (minimum):
   - `read:users`
   - `update:users`
   - `block:users`
5. Noter:
   - **Client ID** → `AUTH0_M2M_CLIENT_ID`
   - **Client Secret** → `AUTH0_M2M_CLIENT_SECRET`

---

## Cloudinary

Cloudinary brukes til lagring av bilder (profilbilder og oppskriftsbilder).

1. Registrer konto på [cloudinary.com](https://cloudinary.com)
2. Gå til **Dashboard**
3. Noter følgende:
   - **Cloud Name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

---

## Database (PostgreSQL)

Velg ett av følgende alternativ:

### Alternativ A — Docker (anbefalt lokalt)

Ingen manuell databaseinstallasjon nødvendig. Docker Compose starter PostgreSQL automatisk.

```env
DATABASE_URL=postgresql://admin:admin@db:5432/sandomlager
```

### Alternativ B — Supabase (anbefalt for produksjon)

1. Opprett prosjekt på [supabase.com](https://supabase.com)
2. Gå til **Project Settings → Database**
3. Kopier tilkoblingsstreng under **Connection string → URI**
4. Sett `PGSSLMODE=require` i backend `.env`

```env
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
PGSSLMODE=require
```

### Alternativ C — Lokal PostgreSQL

Installer PostgreSQL lokalt, opprett database og bruker:

```sql
CREATE USER admin WITH PASSWORD 'admin';
CREATE DATABASE sandomlager OWNER admin;
```

```env
DATABASE_URL=postgresql://admin:admin@localhost:5432/sandomlager
```

---

## Miljøvariabler

Etter at kontoer er opprettet, fyll inn `.env`-filer basert på `.env.example` i henholdsvis `backend/` og `frontend/`.

### Backend (`backend/.env`)

| Variabel | Hentet fra | Eksempel |
|---|---|---|
| `PORT` | Valgfri | `5000` |
| `DATABASE_URL` | PostgreSQL-oppsett (se over) | `postgresql://...` |
| `AUTH0_DOMAIN` | Auth0 tenant | `dev-xxx.eu.auth0.com` |
| `AUTH0_AUDIENCE` | Auth0 API identifier | `https://sandom-api` |
| `AUTH0_M2M_CLIENT_ID` | Auth0 M2M-applikasjon | |
| `AUTH0_M2M_CLIENT_SECRET` | Auth0 M2M-applikasjon | |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary dashboard | |
| `CLOUDINARY_API_KEY` | Cloudinary dashboard | |
| `CLOUDINARY_API_SECRET` | Cloudinary dashboard | |
| `ALLOWED_ORIGINS` | Frontend URL | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variabel | Hentet fra | Eksempel |
|---|---|---|
| `VITE_AUTH0_DOMAIN` | Auth0 SPA-applikasjon | `dev-xxx.eu.auth0.com` |
| `VITE_AUTH0_CLIENT_ID` | Auth0 SPA-applikasjon | |
| `VITE_AUTH0_AUDIENCE` | Auth0 API identifier | `https://sandom-api` |
| `VITE_API_BASE_URL` | Backend URL | `http://localhost:5000` |
| `VITE_SUPABASE_URL` | Supabase (valgfri) | |
| `VITE_SUPABASE_ANON_KEY` | Supabase (valgfri) | |
| `VITE_APP_LAST_UPDATED` | Manuelt (valgfri) | `2026-05-19` |

---

## Oppstartsrekkefølge

Når alle variabler er fylt inn:

1. Start database (Docker eller lokal PostgreSQL)
2. Kjør databaseskjema:
   ```bash
   # Docker
   docker compose exec -T db psql -U admin -d sandomlager < backend/src/db/schema.sql

   # Lokal psql
   psql "$DATABASE_URL" -f backend/src/db/schema.sql
   ```
3. (Valgfri) Last inn testdata:
   ```bash
   docker compose exec -T db psql -U admin -d sandomlager < backend/src/db/seed.dev.sql
   ```
4. Start backend:
   ```bash
   cd backend && npm install && npm start
   ```
5. Start frontend:
   ```bash
   cd frontend && npm install && npm run dev
   ```

For Docker-oppsett, erstatt steg 1–5 med:

```bash
docker compose up --build
```
