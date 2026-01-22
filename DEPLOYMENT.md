# Deployment & Local Run Guide

This repository uses Next.js + TypeScript for both frontend (FE) and backend (BE). This document explains how to run locally, build for production, deploy to Vercel, and optionally use Docker for containerized workflows.

## Project layout (examples)

- `apps/frontend` — Next.js frontend app
- `apps/backend` — Next.js backend app (API routes, server-side code)

Adjust paths below to match your repo structure.

- ## Prerequisites

- Node.js 20+ (or the version in `engines` in package.json). Use `nvm use` to pick Node 20 (repo includes `.nvmrc`).
- Yarn 1.22.19+ (package manager, configured in `packageManager` field)
- Docker (optional, for container workflows)
- Vercel account and CLI (for deployments)

## Local Development

1. Install dependencies at the repo root (monorepo) or inside each app:

```bash
# At repo root (using Yarn workspaces)
yarn install

# Or per-app
cd apps/frontend && yarn install
cd apps/backend && yarn install
```

2. Run both apps in development:

```bash
# Start both (from root)
yarn dev

# Or separately:
cd apps/frontend && yarn dev
cd apps/backend && yarn dev
```

3. Environment variables

- Create `.env.local` files in each app. Example keys:

  - `NEXT_PUBLIC_API_URL` — URL the frontend uses to call the backend (http://localhost:3001)
  - `DATABASE_URL` — production database connection string (backend)
  - `NODE_ENV` — `development` or `production`

Never commit secrets — use `.gitignore` to keep `.env*` out of git.

## Build for Production (locally)

```bash
# Build backend
cd apps/backend && yarn build

# Build frontend
cd apps/frontend && yarn build

# Optionally run previews
cd apps/frontend && yarn start
cd apps/backend && yarn start
```

## Deploy to Vercel

Vercel is the recommended hosting platform for Next.js apps. There are two common setups:

1. Separate projects per app (recommended for clarity)
2. Monorepo with a single Vercel project using `vercel.json` for routing

### Quick steps (separate projects)

- Create two projects on Vercel — point each project to the corresponding folder (`apps/frontend` and `apps/backend`).
- Add environment variables in the Vercel dashboard for each project.
- Link Git repository and enable automatic deployments on push to `main`.

### Monorepo setup (single Vercel project)

- Add a `vercel.json` file at the repository root to map routes and builds. See the example `vercel.json` in this repo.
- In Vercel project settings, set the `Root Directory` to the monorepo root and configure builds for each directory.

## Example vercel.json (monorepo)

```json
{
  "version": 2,
  "projects": {},
  "routes": [
    { "src": "/api/(.*)", "dest": "/apps/backend/api/$1" },
    { "src": "/(.*)", "dest": "/apps/frontend/$1" }
  ]
}
```

Note: Adjust `dest` paths to match how your apps export functions. Vercel's monorepo support may require custom build commands per project in the dashboard.

## Docker (optional)

Use Docker to run apps in containers for local testing or production deployment platforms that require images.

### Dockerfile (frontend)

Create `Dockerfile.frontend` in the repo root:

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY apps/frontend/package.json apps/frontend/yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY apps/frontend .
RUN yarn build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next .next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY apps/frontend/package.json ./
EXPOSE 3000
CMD ["yarn", "start"]
```

### Dockerfile (backend)

Create `Dockerfile.backend` in the repo root:

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY apps/backend/package.json apps/backend/yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY apps/backend .
RUN yarn prisma:generate
RUN yarn build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next .next
COPY --from=builder /app/node_modules ./node_modules
COPY apps/backend/package.json ./
EXPOSE 3001
CMD ["yarn", "start"]
```

### docker-compose.yml (dev)

Create `docker-compose.yml` in the repo root:

```yaml
version: '3.8'
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=${DATABASE_URL}

  # Example database service (Postgres)
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

Run with:

```bash
docker compose up --build
```

## CI / GitHub Actions (recommended checks)

- Linting: `eslint` for TS/JS
- Type checking: `tsc --noEmit`
- Tests: run unit and integration tests per app
- Build: `next build` to ensure production build succeeds

Provide a `.github/workflows/ci.yml` to run these checks on PRs and pushes.

## Environment & Secrets Best Practices

- Use Vercel's Environment Variables for production secrets.
- For GitHub Actions, use encrypted secrets for deployment tokens or Docker credentials.
- Never commit `.env` files.

## Troubleshooting

- If builds fail on Vercel, check the `Build & Development Settings` and set the correct `Install` and `Build` commands per project.
- For image size issues, use `node:20-alpine` and prune dev dependencies in the Dockerfile.

---

If you want, I can now add `vercel.json`, Dockerfiles, `docker-compose.yml`, `.github/workflows/ci.yml`, and `CONTRIBUTING.md` into the repo. Tell me which files to create next or I can add them all.
