# Mist

Mist discovers potential customers for website development, application development, and video editing services. It searches Tavily or Brave, evaluates evidence of a customer need, scores and deduplicates results, and stores source-backed leads in PostgreSQL.

> The application does not fabricate contact information or estimate budgets. Each lead retains its source URL and evidence.

## Stack

| Area | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js 20, TypeScript, Express |
| Persistence | PostgreSQL 16, Prisma |
| Search | Tavily or Brave Search |
| Testing | Vitest, Supertest, Playwright |

## Repository layout

```text
frontend/web       React application
backend/api        Express REST API and Prisma schema
backend/shared     Shared Zod schemas and TypeScript DTOs
docker-compose.yml Local PostgreSQL, API, and frontend services
```

The backend uses routes, controllers, services, providers, repositories, and Prisma models. A search creates a `SearchRun`, queries the configured provider, analyzes evidence, scores valid results, removes duplicates, and transactionally stores leads and their sources.

## Requirements

- Node.js 20 or later
- npm
- Docker Desktop (recommended for PostgreSQL)
- A Tavily or Brave Search API key

## Run locally

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Create local configuration:

   ```powershell
   Copy-Item .env.example .env
   ```

   Set `DATABASE_URL` and a matching `TAVILY_API_KEY` or `BRAVE_SEARCH_API_KEY` in `.env`.

3. Start PostgreSQL:

   ```powershell
   docker compose up -d postgres
   ```

4. Generate Prisma Client and apply the schema:

   ```powershell
   npm run db:generate
   npm run db:migrate
   ```

5. Start frontend and backend:

   ```powershell
   npm run dev
   ```

   Open http://localhost:5173. The API is available at http://localhost:3000.

## Run the complete Docker stack

Docker Compose starts PostgreSQL, the API, and the frontend:

```powershell
docker compose up -d --build
```

Useful commands:

```powershell
docker compose ps
docker compose logs -f api
docker compose down
```

The Docker stack exposes PostgreSQL on port `5433`, the API on `3000`, and the frontend on `5173`.

## Environment variables

| Variable | Required | Default | Description |
|---|---:|---|---|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `SEARCH_PROVIDER` | No | `tavily` | `tavily` or `brave` |
| `TAVILY_API_KEY` | Provider-dependent | — | Tavily API key |
| `BRAVE_SEARCH_API_KEY` | Provider-dependent | — | Brave Search API key |
| `CELESTO_API_KEY` | Optional | — | Celesto Cloud Computers API key |
| `API_PORT` | No | `3000` | Backend port |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Allowed frontend origin |
| `SEARCH_TIMEOUT_MS` | No | `20000` | External search timeout |
| `SEARCH_MAX_RESULTS` | No | `20` | Configured result limit |
| `LOG_LEVEL` | No | `info` | Pino log level |

Never commit `.env`, API keys, or other credentials. Use `.env.example` as the safe configuration template.

## Celesto Cloud Computers

Mist can connect to Celesto Cloud Computers from the backend. The API key must stay server-side; never place it in frontend code or commit it to `.env.example`.

1. Revoke any Celesto key that was shared in chat or another public location.
2. Create a new key in the Celesto dashboard with only the permissions required to create, run, and delete computers.
3. Configure it locally:

   ```powershell
   Copy-Item .env.example .env -ErrorAction SilentlyContinue
   Add-Content .env "`nCELESTO_API_KEY=your-new-key"
   ```

4. Install dependencies and run the Windows smoke test:

   ```powershell
   npm install
   npm run celesto:smoke --workspace=@clientfinder/api
   ```

The smoke test creates a temporary default computer, runs `uname -a`, prints the result, and deletes the computer in a `finally` block. Celesto Cloud Computers do not require Docker Desktop on the Windows host; Docker remains available for running Mist and PostgreSQL locally.

## Commands

```powershell
npm run dev          # Frontend and backend development servers
npm run build        # Build API and frontend
npm run typecheck    # TypeScript checks for all workspaces
npm run lint         # Lint all workspaces
npm run test         # Run workspace tests
npm run db:generate  # Generate Prisma Client
npm run db:migrate   # Apply development Prisma migrations
npm run db:studio    # Open Prisma Studio
```

## API

All API routes use the `/api/v1` prefix.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Database and provider health |
| POST | `/searches` | Run a new search |
| GET | `/searches` | List search history |
| GET | `/searches/:searchId` | Get a search run |
| GET | `/searches/:searchId/leads` | Get leads for a search |
| GET | `/leads` | Filter and paginate leads |
| GET | `/leads/:leadId` | Get lead details and evidence |
| POST | `/leads/:leadId/save` | Save a lead |
| DELETE | `/leads/:leadId/save` | Unsave a lead |
| GET | `/saved-leads` | List saved leads |
| GET | `/settings` | Read application settings |
| PATCH | `/settings` | Change the theme |
| GET | `/settings/dashboard-stats` | Get dashboard statistics |

## Lead scoring

Scores range from 0 to 100 and combine hiring intent, evidence strength, recency, source reliability, and keyword/location matches. Scores indicate evidence quality, not guaranteed customer value or payment likelihood.

## Current limitations

- This is a single-user MVP; authentication and per-user data isolation are not implemented.
- Evidence comes from search results and snippets; pages are not fully crawled.
- Outreach is manual.
- External provider quotas and rate limits apply.
- Searches run synchronously in the API request; a background job queue is not currently used.
