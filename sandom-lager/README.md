# Sandom Lager

Sandom Lager er en webbasert fullstack-applikasjon utviklet for Sandom Retreatsenter og
Tomasgården. Løsningen er laget for å forenkle arbeid med oppskrifter, ingredienser,
lagerbeholdning, handlelister og tilgangsstyring på tvers av flere lokasjoner.

Prosjektet er utviklet som en bacheloroppgave ved Høgskolen i Østfold.

---

## Innhold

- [Sandom Lager](#sandom-lager)
  - [Innhold](#innhold)
  - [Om prosjektet](#om-prosjektet)
  - [Hovedfunksjonalitet](#hovedfunksjonalitet)
  - [Teknologier](#teknologier)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [Andre verktøy og tjenester](#andre-verktøy-og-tjenester)
  - [Prosjektstruktur](#prosjektstruktur)
    - [Backend](#backend-1)
    - [Frontend](#frontend-1)
  - [Roller og tilgang](#roller-og-tilgang)
    - [`user`](#user)
    - [`manager`](#manager)
    - [`admin`](#admin)
    - [Lokasjonstilgang](#lokasjonstilgang)
  - [Forutsetninger](#forutsetninger)
  - [Oppsett med Docker](#oppsett-med-docker)
    - [Viktig om `VITE_API_BASE_URL` i Docker](#viktig-om-vite_api_base_url-i-docker)
  - [pgAdmin](#pgadmin)
    - [Koble pgAdmin til databasen](#koble-pgadmin-til-databasen)
  - [Fylle databasen med tabeller og testdata](#fylle-databasen-med-tabeller-og-testdata)
    - [Windows](#windows)
    - [Mac og Linux](#mac-og-linux)
  - [Feilsøking ved Docker-problemer](#feilsøking-ved-docker-problemer)
  - [Manuelt oppsett uten Docker](#manuelt-oppsett-uten-docker)
  - [Backend-oppsett](#backend-oppsett)
    - [Anbefalt dev-script](#anbefalt-dev-script)
  - [Frontend-oppsett](#frontend-oppsett)
  - [Miljøvariabler](#miljøvariabler)
    - [Backend](#backend-2)
    - [Frontend](#frontend-2)
  - [Database](#database)
    - [Opprette tabeller uten Docker Compose](#opprette-tabeller-uten-docker-compose)
    - [Legge inn testdata uten Docker Compose](#legge-inn-testdata-uten-docker-compose)
    - [Viktige tabeller](#viktige-tabeller)
  - [Backend API](#backend-api)
    - [System/test](#systemtest)
    - [Bruker](#bruker)
    - [Lokasjoner](#lokasjoner)
    - [Brukertilgang til lokasjoner](#brukertilgang-til-lokasjoner)
    - [Oppskrifter](#oppskrifter)
    - [Ingredienser](#ingredienser)
    - [Oppskriftsingredienser](#oppskriftsingredienser)
    - [Lager](#lager)
    - [Handleliste](#handleliste)
    - [Varslinger](#varslinger)
    - [Brukeradministrasjon](#brukeradministrasjon)
    - [Favoritter](#favoritter)
    - [Opplasting](#opplasting)
  - [Frontend-ruter](#frontend-ruter)
  - [Auth0](#auth0)
  - [Cloudinary og bildehåndtering](#cloudinary-og-bildehåndtering)
  - [Sikkerhet](#sikkerhet)
  - [Testing](#testing)
  - [Drift og vedlikehold](#drift-og-vedlikehold)
  - [Videre arbeid](#videre-arbeid)
  - [Status](#status)
  - [Lisens og eierskap](#lisens-og-eierskap)

---

## Om prosjektet

Sandom Retreatsenter og Tomasgården hadde tidligere et eldre lokalt system basert på
DataEase. Systemet var installert på én fysisk maskin og hadde begrensninger knyttet til
tilgjengelighet, samtidige brukere, vedlikehold og bruk på tvers av lokasjoner.

Sandom Lager er utviklet for å modernisere denne arbeidsflyten. Systemet samler
sentrale kjøkkenrelaterte oppgaver i én webbasert plattform:

- oppskrifter
- ingredienser
- allergener
- lagerstatus
- handlelister
- brukerroller
- lokasjonstilgang
- varslinger
- bildeopplasting

Målet er å gi ansatte og frivillige bedre oversikt og gjøre planlegging av måltider, lager og innkjøp enklere.

---

## Hovedfunksjonalitet

Systemet støtter blant annet:

- innlogging med Auth0
- registrering og synkronisering av bruker mot lokal database
- søknad om tilgang til lokasjon
- godkjenning, avslag, tilbaketrekking og blokkering av lokasjonstilgang
- rollebasert tilgangskontroll
- støtte for flere lokasjoner
- oppretting, visning, redigering og sletting av oppskrifter
- registrering og vedlikehold av ingredienser
- allergener knyttet til oppskrifter
- lageroversikt
- oppretting, redigering og sletting av lagervarer
- generering av handleliste fra valgte oppskrifter
- manuell redigering av handleliste
- historikk for slettede handlelister
- varslinger
- profilside og kontoinnstillinger
- bildeopplasting for profilbilder og oppskrifter
- responsivt brukergrensesnitt for PC, nettbrett og mobil
- lagring av favoritt-lagervarer
- installbar webapp (PWA)

---

## Teknologier

### Frontend

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Auth0 React SDK
- Lucide React
- write-excel-file

### Backend

- Node.js
- Express
- PostgreSQL
- Auth0 JWT-validering
- Cloudinary
- Multer
- pg

### Andre verktøy og tjenester

- Docker
- Docker Compose
- Git/GitHub
- Postman
- Supabase/PostgreSQL
- Auth0
- Cloudinary
- pgAdmin
- PWA (Service Worker, manifest.json)

---

## Prosjektstruktur

Prosjektet består av to hovedmapper: `backend` og `frontend`.

```text
backend/
  src/
    controllers/
    db/
    lib/
    middleware/
    routes/
    services/
    utils/
  Dockerfile
  package.json
  .env.example

frontend/
  src/
    api/
    auth/
    components/
    config/
    constants/
    context/
    hooks/
    pages/
    router/
    styles/
    types/
  Dockerfile
  package.json
  .env.example
```

### Backend

Backend inneholder API-et som frontend kommuniserer med. Backend har ansvar for:

- autentisering og tokenvalidering
- brukerdata
- rolle- og tilgangsstyring
- lokasjonstilgang
- oppskrifter
- ingredienser
- lager
- handlelister
- varslinger
- bildeopplasting
- databasekommunikasjon

### Frontend

Frontend er brukergrensesnittet for systemet. Frontend har ansvar for:

- innlogging og utlogging
- navigasjon
- dashboard
- oppskriftsside
- lagerside
- handlelisteside
- admin-side
- innstillinger
- onboarding
- tilgangssøknader
- visning av varslinger

---

## Roller og tilgang

Systemet bruker rollebasert tilgangskontroll. Rollene lagres i `users.role` i databasen og kan være:

### `user`

Vanlig bruker. Kan bruke grunnleggende funksjonalitet, som å lese oppskrifter, se lager og arbeide med handleliste, avhengig av godkjent lokasjonstilgang.

### `manager`

Lederrolle. Har utvidede rettigheter og kan blant annet opprette og redigere oppskrifter, ingredienser og lagerdata.

### `admin`

Administrator. Har full tilgang til administrasjonsfunksjoner, inkludert godkjenning og avslag av tilgangssøknader, blokkering av brukere og sletting av innhold.

### Lokasjonstilgang

Brukere må ha godkjent tilgang til en lokasjon før de får bruke hovedfunksjonene i systemet. Lokasjonstilgang lagres i `user_locations`.

Standardlokasjoner fra `schema.sql`:

- Sandom Retreatsenter
- Tomasgården

En bruker kan søke om tilgang til en lokasjon. Administrator kan deretter godkjenne eller avslå søknaden.

---

## Forutsetninger

> Detaljert oppsett av avhengigheter og eksterne tjenester: se [SETUP.md](SETUP.md)

Før prosjektet kjøres lokalt må følgende være installert:

- Node.js
- npm
- Git
- Docker Desktop, dersom Docker-oppsett brukes
- PostgreSQL, eller tilgang til en ekstern PostgreSQL-database, dersom prosjektet kjøres uten Docker

I tillegg trengs kontoer/oppsett for:

- Auth0
- Cloudinary
- eventuelt Supabase dersom PostgreSQL hostes der

---

## Oppsett med Docker

Prosjektet kan kjøres lokalt med Docker Compose. Dette er den enkleste måten å starte hele løsningen på, fordi frontend, backend, database og eventuelt pgAdmin kan startes samlet.

Kjør fra rotmappen til prosjektet:

```bash
docker compose up --build
```

Når containerne er startet, vil tjenestene normalt være tilgjengelige på:

| Tjeneste | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:5000` |
| pgAdmin | `http://localhost:5050` |

Portene kan variere dersom de er endret i `docker-compose.yml`.

Backend-koden bruker `process.env.PORT || 3001`. Hvis backend skal kjøre på port `5000`, må `PORT=5000` være satt i backend-miljøet eller i Docker Compose-oppsettet.

For å teste at backend kjører:

```text
GET http://localhost:5000/
```

Forventet respons:

```text
Backend kjører - Sandom Lager
```

### Viktig om `VITE_API_BASE_URL` i Docker

Frontend-koden bruker `VITE_API_BASE_URL` direkte i nettleseren. Derfor må verdien være en adresse som nettleseren din kan nå.

Anbefalt for lokal Docker-kjøring:

```env
VITE_API_BASE_URL=http://localhost:5000
```

`http://backend:5000` fungerer bare for container-til-container-kommunikasjon inne i Docker-nettverket. Nettleseren på maskinen din vil vanligvis ikke kunne slå opp hostnavnet `backend`.

---

## pgAdmin

pgAdmin kan brukes for å se og administrere PostgreSQL-databasen visuelt.

Åpne pgAdmin i nettleseren:

```text
http://localhost:5050
```

Logg inn med:

```text
E-post: admin@sandom.no
Passord: admin
```

> Merk: Dette er kun ment for lokal utvikling. Ikke bruk standardpassord i produksjon.

### Koble pgAdmin til databasen

Hvis databasen ikke vises automatisk i pgAdmin, kan den legges til manuelt.

1. Høyreklikk på `Servers`
2. Velg `Register` → `Server`
3. Gi serveren et navn, for eksempel `Sandom Lager`
4. Gå til fanen `Connection`
5. Fyll inn verdiene under

| Felt | Verdi |
|---|---|
| Host name/address | `db` |
| Port | `5432` |
| Maintenance database | `sandomlager` |
| Username | `admin` |
| Password | `admin` |

Trykk deretter `Save`.

Databasen skal da vises i pgAdmin.

> Merk: `db` er Docker Compose-service-navnet til databasen. Hvis database-servicen har et annet navn i `docker-compose.yml`, må dette navnet brukes i stedet.

---

## Fylle databasen med tabeller og testdata

Når Docker-containerne kjører, kan databasen fylles med tabeller og testdata fra filene:

```text
backend/src/db/schema.sql
backend/src/db/seed.dev.sql
```

### Windows

Kjør fra rotmappen til prosjektet:

```bash
cmd /c "docker compose exec -T db psql -U admin -d sandomlager < backend/src/db/schema.sql"
cmd /c "docker compose exec -T db psql -U admin -d sandomlager < backend/src/db/seed.dev.sql"
```

### Mac og Linux

Kjør fra rotmappen til prosjektet:

```bash
docker compose exec -T db psql -U admin -d sandomlager < backend/src/db/schema.sql
docker compose exec -T db psql -U admin -d sandomlager < backend/src/db/seed.dev.sql
```

Dersom databasen allerede inneholder tabeller eller data, kan det være nødvendig å tømme databasen eller kjøre `docker compose down -v` før schema og seed kjøres på nytt.

> Merk: `docker compose down -v` sletter Docker-volumes. Dette kan fjerne lokal database-data.

---

## Feilsøking ved Docker-problemer

Dersom `docker compose up --build` feiler etter endringer i prosjektstrukturen, kan det skyldes gamle containere, images eller cache.

Prøv først:

```bash
docker compose down
docker compose up --build
```

Hvis problemet fortsatt oppstår, kan Docker-cache ryddes med:

```bash
docker compose down -v
docker builder prune -af
docker image prune -af
docker compose up --build
```

> Merk: `docker compose down -v` sletter volumes. Hvis databasen ligger i en Docker-volume, slettes lokal database-data.

---

## Manuelt oppsett uten Docker

Prosjektet kan også kjøres manuelt som to separate applikasjoner:

1. backend/API
2. frontend/brukergrensesnitt

Backend må kjøre før frontend kan hente data.

---

## Backend-oppsett

Gå til backend-mappen:

```bash
cd backend
```

Installer avhengigheter:

```bash
npm install
```

Lag en lokal `.env`-fil basert på `.env.example`:

```bash
cp .env.example .env
```

Fyll inn nødvendige miljøvariabler i `.env`.

Start backend:

```bash
npm start
```

Backend bruker `src/index.js` som startfil.

Dersom `PORT` er satt til `5000`, kjører backend på:

```text
http://localhost:5000
```

Hvis `PORT` ikke er satt, bruker backend standardverdien `3001`.

For å teste at backend kjører:

```text
GET http://localhost:5000/
```

Forventet respons:

```text
Backend kjører - Sandom Lager
```

### Anbefalt dev-script

Backend har `nodemon` installert, men `package.json` har bare `start` som script. For enklere utvikling kan dette legges til i `backend/package.json`:

```json
"scripts": {
  "start": "node src/index.js",
  "dev": "nodemon src/index.js"
}
```

Da kan backend startes i utviklingsmodus med:

```bash
npm run dev
```

---

## Frontend-oppsett

Gå til frontend-mappen:

```bash
cd frontend
```

Installer avhengigheter:

```bash
npm install
```

Lag en lokal `.env`-fil basert på `.env.example`:

```bash
cp .env.example .env
```

Fyll inn nødvendige miljøvariabler i `.env`.

Start frontend:

```bash
npm run dev
```

Frontend kjører normalt på:

```text
http://localhost:5173
```

---

## Miljøvariabler

### Backend

Backend leser miljøvariabler fra `.env` via `dotenv`. Følgende miljøvariabler brukes av backend:

```env
PORT=
DATABASE_URL=
PGSSLMODE=
AUTH0_DOMAIN=
AUTH0_AUDIENCE=
AUTH0_M2M_CLIENT_ID=
AUTH0_M2M_CLIENT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ALLOWED_ORIGINS=
```

Forklaring:

| Variabel | Beskrivelse |
|---|---|
| `PORT` | Porten backend skal kjøre på, for eksempel `5000` |
| `DATABASE_URL` | Tilkoblingsstreng til PostgreSQL |
| `PGSSLMODE` | SSL-innstilling for database, for eksempel `disable` lokalt eller `require` ved ekstern database |
| `AUTH0_DOMAIN` | Auth0-domene |
| `AUTH0_AUDIENCE` | API audience definert i Auth0 |
| `AUTH0_M2M_CLIENT_ID` | Client ID for Auth0 Machine-to-Machine-applikasjon |
| `AUTH0_M2M_CLIENT_SECRET` | Secret for Auth0 Machine-to-Machine-applikasjon |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | API key fra Cloudinary |
| `CLOUDINARY_API_SECRET` | API secret fra Cloudinary |
| `ALLOWED_ORIGINS` | Kommaseparert liste over frontend-URL-er som får kontakte backend |

Eksempel for lokal utvikling med Docker-database:

```env
PORT=5000
DATABASE_URL=postgresql://admin:admin@localhost:5432/sandomlager
PGSSLMODE=disable
AUTH0_DOMAIN=dev-example.eu.auth0.com
AUTH0_AUDIENCE=https://sandom-api
AUTH0_M2M_CLIENT_ID=...
AUTH0_M2M_CLIENT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
ALLOWED_ORIGINS=http://localhost:5173
```

Hvis backend kjører inne i Docker Compose og databasen er en service som heter `db`, brukes vanligvis:

```env
DATABASE_URL=postgresql://admin:admin@db:5432/sandomlager
```

Hvis `ALLOWED_ORIGINS` ikke er satt, tillater backend alle origins. Dette er praktisk i utvikling, men bør ikke brukes i produksjon.

### Frontend

Frontend leser miljøvariabler som starter med `VITE_`.

```env
VITE_AUTH0_DOMAIN=
VITE_AUTH0_CLIENT_ID=
VITE_AUTH0_AUDIENCE=
VITE_API_BASE_URL=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_APP_LAST_UPDATED=
PORT=
```

Forklaring:

| Variabel | Beskrivelse |
|---|---|
| `VITE_AUTH0_DOMAIN` | Auth0-domene brukt av frontend |
| `VITE_AUTH0_CLIENT_ID` | Client ID for Auth0 frontend-applikasjon |
| `VITE_AUTH0_AUDIENCE` | API audience som brukes ved tokenhenting |
| `VITE_API_BASE_URL` | URL til backend/API |
| `VITE_SUPABASE_URL` | Eventuell Supabase URL for fremtidig realtime-funksjonalitet |
| `VITE_SUPABASE_ANON_KEY` | Eventuell Supabase anon key |
| `VITE_APP_LAST_UPDATED` | Dato for siste oppdatering av appen, vises i innstillinger |
| `PORT` | Valgfri portinnstilling for Vite |

Eksempel for lokal utvikling:

```env
VITE_AUTH0_DOMAIN=dev-example.eu.auth0.com
VITE_AUTH0_CLIENT_ID=...
VITE_AUTH0_AUDIENCE=https://sandom-api
VITE_API_BASE_URL=http://localhost:5000
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_APP_LAST_UPDATED=
PORT=5173
```

I utviklingsmodus har frontend-koden fallbackverdier for Auth0-domain og client ID. Disse er kun demo/fallback og vil ikke gi fungerende innlogging uten korrekt Auth0-oppsett.

---

## Database

Databasen er PostgreSQL-basert.

Databaseskjema ligger i:

```text
backend/src/db/schema.sql
```

Utviklingsdata/testdata ligger i:

```text
backend/src/db/seed.dev.sql
```

### Opprette tabeller uten Docker Compose

Kjør `schema.sql` mot databasen som er definert i `DATABASE_URL`.

Eksempel med `psql` på Mac/Linux:

```bash
psql "$DATABASE_URL" -f backend/src/db/schema.sql
```

På Windows kan kommandoen se slik ut:

```bash
psql "%DATABASE_URL%" -f backend/src/db/schema.sql
```

### Legge inn testdata uten Docker Compose

For lokal utvikling kan testdata legges inn slik:

```bash
psql "$DATABASE_URL" -f backend/src/db/seed.dev.sql
```

### Viktige tabeller

Databasen inneholder blant annet:

- `users`
- `locations`
- `user_locations`
- `ingredients`
- `recipes`
- `recipe_ingredients`
- `allergens`
- `recipe_allergens`
- `inventory`
- `categories`
- `shopping_list`
- `shopping_list_history_batches`
- `shopping_list_history_items`
- `user_favorites`
- `notifications`
- `logs`
- `user_sessions`
- `revoked_sessions`

---

## Backend API

Backend eksponerer et REST-basert API. De fleste endepunkter krever gyldig Auth0 access token i `Authorization`-headeren:

```text
Authorization: Bearer <access_token>
```

### System/test

| Metode | Endepunkt | Beskrivelse |
|---|---|---|
| GET | `/` | Sjekker at backend kjører |
| GET | `/api/test-secure` | Test av innlogget bruker |
| GET | `/api/test-admin` | Test av admin-tilgang |
| GET | `/api/test-manager` | Test av manager-tilgang |
| GET | `/api/test-user` | Test av user-tilgang |

### Bruker

| Metode | Endepunkt | Beskrivelse |
|---|---|---|
| GET | `/api/me` | Henter innlogget bruker |
| PATCH | `/api/me/name` | Oppdaterer navn |
| PATCH | `/api/me/username` | Oppdaterer brukernavn |
| PATCH | `/api/me/email` | Oppdaterer e-post |
| PATCH | `/api/me/profile-picture` | Oppdaterer profilbilde |
| PATCH | `/api/me/notification-preferences` | Oppdaterer varslingsinnstillinger |
| GET | `/api/profile-pictures/:filename` | Henter profilbilde |
| GET | `/api/me/sessions` | Henter aktive økter |
| DELETE | `/api/me/sessions/others` | Logger ut andre økter |
| DELETE | `/api/me/sessions/:sessionId` | Logger ut valgt økt |

### Lokasjoner

| Metode | Endepunkt | Beskrivelse |
|---|---|---|
| GET | `/api/locations` | Henter tilgjengelige lokasjoner |

### Brukertilgang til lokasjoner

| Metode | Endepunkt | Beskrivelse |
|---|---|---|
| POST | `/api/user-locations/request` | Søker om tilgang til lokasjon |
| GET | `/api/user-locations/me` | Henter egne tilgangssøknader |
| GET | `/api/user-locations` | Admin henter alle søknader |
| PATCH | `/api/user-locations/:id/approve` | Admin godkjenner søknad |
| PATCH | `/api/user-locations/:id/deny` | Admin avslår søknad |
| PATCH | `/api/user-locations/:id/revoke` | Admin trekker tilbake tilgang ved å sette status til `denied` |
| PATCH | `/api/user-locations/:id/block` | Admin blokkerer bruker i Auth0 |

### Oppskrifter

Oppskriftrutene er montert på `/api/recipes`.

| Metode | Endepunkt | Beskrivelse |
|---|---|---|
| GET | `/api/recipes` | Henter alle oppskrifter |
| GET | `/api/recipes/allergens` | Henter allergener |
| GET | `/api/recipes/:id` | Henter én oppskrift |
| POST | `/api/recipes` | Oppretter oppskrift |
| PUT | `/api/recipes/:id` | Oppdaterer oppskrift |
| DELETE | `/api/recipes/:id` | Sletter oppskrift |
| PUT | `/api/recipes/:id/allergens` | Oppdaterer allergener for oppskrift |
| GET | `/api/recipes/categories` | Henter kategorier |
| POST | `/api/recipes/categories` | Oppretter kategori |
| DELETE | `/api/recipes/categories/:id` | Sletter kategori |

### Ingredienser

| Metode | Endepunkt | Beskrivelse |
|---|---|---|
| GET | `/api/ingredients` | Henter ingredienser |
| GET | `/api/ingredients/:id` | Henter én ingrediens |
| POST | `/api/ingredients` | Oppretter ingrediens |
| PUT | `/api/ingredients/:id` | Oppdaterer ingrediens |
| DELETE | `/api/ingredients/:id` | Sletter ingrediens |

### Oppskriftsingredienser

| Metode | Endepunkt | Beskrivelse |
|---|---|---|
| GET | `/api/recipes/:id/ingredients` | Henter ingredienser for oppskrift |
| POST | `/api/recipes/:id/ingredients` | Legger til ingrediens i oppskrift |
| PUT | `/api/recipe-ingredients/:id` | Oppdaterer oppskriftsingrediens |
| DELETE | `/api/recipe-ingredients/:id` | Sletter oppskriftsingrediens |

### Lager

| Metode | Endepunkt | Beskrivelse |
|---|---|---|
| GET | `/api/inventory` | Henter lagerbeholdning |
| POST | `/api/inventory` | Oppretter lagervare |
| PUT | `/api/inventory/:id` | Oppdaterer lagervare |
| DELETE | `/api/inventory/:id` | Sletter lagervare |

### Handleliste

| Metode | Endepunkt | Beskrivelse |
|---|---|---|
| GET | `/api/shopping-list` | Henter handleliste |
| GET | `/api/shopping-list/history` | Henter handlelistehistorikk |
| POST | `/api/shopping-list` | Legger til vare manuelt |
| POST | `/api/shopping-list/generate` | Genererer handleliste fra oppskrifter |
| PUT | `/api/shopping-list/:id` | Oppdaterer handlelistevare |
| DELETE | `/api/shopping-list/:id` | Sletter handlelistevare |
| DELETE | `/api/shopping-list` | Tømmer handleliste |

### Varslinger

| Metode | Endepunkt | Beskrivelse |
|---|---|---|
| GET | `/api/notifications` | Henter varslinger |
| PATCH | `/api/notifications/:id/read` | Marker én varsling som lest |
| DELETE | `/api/notifications/:id` | Sletter varsling |
| PATCH | `/api/notifications/read-all` | Marker alle varslinger som lest |
| POST | `/api/notifications/access-request` | Varsler admin om tilgangssøknad |

### Brukeradministrasjon

| Metode | Endepunkt | Beskrivelse |
|---|---|---|
| GET | `/api/admin/users` | Admin henter alle brukere |
| PATCH | `/api/admin/users/:id/role` | Admin oppdaterer brukerrolle |

### Favoritter

| Metode | Endepunkt | Beskrivelse |
|---|---|---|
| GET | `/api/user/favorites` | Henter favoritter for innlogget bruker |
| POST | `/api/user/favorites/:inventoryId` | Legger til lagervare som favoritt |
| DELETE | `/api/user/favorites/:inventoryId` | Fjerner lagervare som favoritt |

### Opplasting

| Metode | Endepunkt | Beskrivelse |
|---|---|---|
| POST | `/api/upload/profile-picture` | Laster opp profilbilde til Cloudinary |
| POST | `/api/upload/recipe-image` | Laster opp oppskriftsbilde til Cloudinary |

---

## Frontend-ruter

Frontend har følgende hovedruter:

| Rute | Beskrivelse |
|---|---|
| `/login` | Innlogging |
| `/auth/continue` | Videreføring etter innlogging |
| `/` | Dashboard |
| `/shopping-list` | Handleliste |
| `/storage` | Lager |
| `/recipes` | Oppskrifter |
| `/settings` | Innstillinger |
| `/settings/account` | Min konto |
| `/settings/applications` | Mine søknader |
| `/settings/app-settings` | Appinnstillinger |
| `/settings/about` | Om Sandom Lager |
| `/request-access` | Søknad om lokasjonstilgang |
| `/pending-approval` | Venter på godkjenning |
| `/admin` | Admin-side |

---

## Auth0

Auth0 brukes til innlogging og autentisering.

Frontend bruker Auth0 til å:

- logge inn brukeren
- hente access token
- sende token til backend ved API-kall

Backend bruker Auth0 til å:

- validere JWT/access token
- hente brukeridentitet
- synkronisere bruker mot lokal database
- støtte rollebasert tilgangskontroll
- blokkere bruker via Auth0 Management API
- håndtere enkelte sesjonsrelaterte operasjoner

Ved endringer i Auth0-oppsettet må følgende kontrolleres:

- riktig Auth0 domain
- riktig client ID i frontend
- riktig audience
- riktige callback URLs
- riktige logout URLs
- riktig API-konfigurasjon
- riktig Machine-to-Machine-applikasjon for backend
- nødvendige rettigheter/scopes for Management API

Frontend bruker følgende scope i `src/config/auth.ts`:

```text
openid profile email username
```

---

## Cloudinary og bildehåndtering

Cloudinary brukes til lagring og visning av bilder.

Systemet støtter opplasting av:

- profilbilder
- oppskriftsbilder

Backend tar imot bildefiler med Multer, sender dem til Cloudinary og returnerer URL/public ID. Selve bildefilen lagres ikke i PostgreSQL. Databasen lagrer kun referanse til bildet.

Maks filstørrelse for bildeopplasting i upload-ruten er satt til 8 MB.

Det finnes to opplastingsløp i backend:

- `/api/upload/profile-picture` for profilbilder
- `/api/upload/recipe-image` for oppskriftsbilder

I tillegg brukes `/api/me/profile-picture` for å oppdatere profilbilde på innlogget bruker.

---

## Sikkerhet

Følgende sikkerhetstiltak er implementert:

- Auth0-basert innlogging
- JWT-validering i backend
- rollebasert tilgangskontroll
- lokasjonsbasert tilgang
- parameteriserte databasespørringer via `pg`
- begrensning på filstørrelse ved bildeopplasting
- økthåndtering med `user_sessions`
- tilbakekalte økter med `revoked_sessions`
- feilhåndtering via felles error middleware
- CORS-håndtering via `ALLOWED_ORIGINS`

Ved produksjonssetting bør følgende vurderes:

- bruk av HTTPS
- streng `ALLOWED_ORIGINS`
- sikker håndtering av miljøvariabler/secrets
- backup av database
- logging og overvåking
- rate limiting på API-endepunkter
- jevnlig oppdatering av avhengigheter
- gjennomgang av admin-rettigheter
- rutiner for sletting/deaktivering av brukere
- rotasjon av nøkler dersom secrets har vært delt eller ligget i repo

---

## Testing

Prosjektet kan testes gjennom:

- manuell funksjonell testing
- Postman-testing av API-endepunkter
- testing av innlogging og rollebasert tilgang
- testing av sentrale brukerflyter i frontend
- brukertesting med Sandom

Eksempler på funksjoner som bør testes før produksjonssetting:

- innlogging
- søknad om lokasjonstilgang
- admin-godkjenning av søknad
- avslag og tilbaketrekking av lokasjonstilgang
- oppretting og redigering av oppskrift
- allergener på oppskrift
- bildeopplasting
- oppretting og redigering av lagervare
- generering av handleliste
- manuell redigering av handleliste
- tømming av handleliste
- visning av handlelistehistorikk
- rollebegrensninger for `user`, `manager` og `admin`

---

## Drift og vedlikehold

Dersom Sandom skal bruke løsningen videre, bør følgende avklares:

1. Hvor frontend skal hostes
2. Hvor backend skal hostes
3. Hvor PostgreSQL-databasen skal ligge
4. Hvem som eier Auth0-kontoen
5. Hvem som eier Cloudinary-kontoen
6. Hvem som har administratorrolle i systemet
7. Hvordan backup skal håndteres
8. Hvem som har ansvar for feilretting og oppdateringer
9. Hvordan nye brukere skal få tilgang
10. Hvordan roller og lokasjoner skal administreres videre

Det anbefales at Sandom får tilgang til:

- GitHub-repoet
- Auth0 tenant
- Cloudinary-konto
- database/Supabase-prosjekt
- hostingplattform
- teknisk dokumentasjon
- enkel brukerveiledning

---

Anbefalt `.gitignore`:

```gitignore
node_modules/
dist/
.env
.env.local
.DS_Store
npm-debug.log*
gcm-diagnose.log
```

Dersom ekte secrets allerede har blitt commitet, bør de roteres/byttes i Auth0, Cloudinary og databasen.

---

## Videre arbeid

Mulige områder for videreutvikling:

- migrering av eksisterende data fra DataEase
- mer omfattende brukertesting med Sandom
- produksjonssetting med stabil hosting
- bedre støtte for enhetskonvertering
- mer avansert mengdeberegning
- støtte for utløpsdatoer på lagervarer
- varsling ved lav lagerbeholdning
- bedre statistikk og rapportering
- eksport av handlelister
- integrasjon mot økonomi- eller leverandørsystemer
- backup- og gjenopprettingsrutiner
- mer fleksibel administrasjon av roller og tilganger
- bedre dokumentasjon for vanlige brukere

---

## Status

Dette prosjektet er utviklet som en bacheloroppgave. Systemet dekker kjernefunksjonalitet for oppskrifter, lager, handlelister og tilgangsstyring, men videre testing, produksjonssetting og langsiktig vedlikehold bør avklares før systemet brukes i full drift.

---

## Lisens og eierskap

Dette prosjektet er utviklet i samarbeid med Sandom Retreatsenter og Tomasgården som del av en bacheloroppgave. Eierskap, videre bruk og vedlikehold bør avklares mellom prosjektgruppen, oppdragsgiver og eventuelle involverte parter før produksjonssetting.
