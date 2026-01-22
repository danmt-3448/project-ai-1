# Mini Storefront

A minimal online store built with Next.js, TypeScript, and PostgreSQL.

## Features

- 🛍️ Product browsing and filtering by category
- 🛒 Shopping cart with localStorage persistence
- 💳 Simulated checkout flow
- 👨‍💼 Admin panel for inventory management
- 🔐 JWT-based authentication for admin

## Tech Stack

- **Frontend:** Next.js 14 (Pages Router), React, TypeScript, Tailwind CSS, Zustand
- **Backend:** Next.js 14 API Routes, Prisma ORM
- **Database:** PostgreSQL (production), SQLite (dev optional)
- **Deployment:** Vercel
- **Testing:** Vitest (unit/integration), Playwright (E2E)

---

## 🚀 Local Development

### Prerequisites

- **Node.js 20+** (`.nvmrc` provided, use `nvm use`)
- **Yarn 1.22.19** (workspace setup)
- **PostgreSQL** (local or Docker)
- **Docker** (optional, for Postgres via Colima/Docker Desktop)

### Initial Setup

#### 1. Clone & Install

```bash
git clone <repo-url>
cd mini-storefront

# Use Node 20
nvm use

# Install all workspace dependencies
yarn install
```

#### 2. Start PostgreSQL

**Option A: Using Docker (Colima on macOS)**

```bash
# Start Colima
colima start

# Run PostgreSQL container
docker run --name postgres-dev \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres

# Verify it's running
docker ps
```

**Option B: Local PostgreSQL**

Ensure PostgreSQL is running on `localhost:5432` with credentials matching your `.env`.

#### 3. Configure Environment Variables

**Backend** (`apps/backend/.env`):

```env
# Database (PostgreSQL for dev)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/storefront_dev?schema=public"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"
```

**Frontend** (`apps/frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Root** (`.env` - optional, for convenience):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/storefront_dev?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
FRONTEND_URL="http://localhost:3000"
```

#### 4. Setup Database

```bash
# Generate Prisma Client
yarn prisma:generate

# Run migrations (creates tables)
yarn prisma:migrate

# Seed database with sample data
yarn seed
```

#### 5. Start Development Servers

```bash
# Start both frontend (3000) and backend (3001)
yarn dev
```

**Individual servers:**

```bash
yarn dev:backend   # Backend only → http://localhost:3001
yarn dev:frontend  # Frontend only → http://localhost:3000
```

#### 6. Access Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api
- **Prisma Studio:** `yarn prisma:studio` → http://localhost:5555

### Default Admin Credentials

- **Username:** `admin`
- **Password:** `admin123`

---

## 🗄️ Database Management

### Clear & Reset Database

**Full reset** (drops all data, recreates tables, runs seed):

```bash
yarn clear:db
```

This command:
1. Runs `prisma migrate reset --force` (drops DB, reruns migrations)
2. Automatically runs seed script via Prisma's `prisma.seed` config

### Manual Operations

```bash
# Generate Prisma Client after schema changes
yarn prisma:generate

# Create new migration
cd apps/backend
npx prisma migrate dev --name <migration-name> --schema prisma/schema.postgres.prisma

# View database in browser
yarn prisma:studio

# Seed database manually
yarn seed
```

---

## 🧪 Testing

### Unit & Integration Tests (Vitest)

```bash
# Run all tests (frontend + backend)
yarn test

# Watch mode
cd apps/backend && yarn test:watch
cd apps/frontend && yarn test:watch
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
yarn test:e2e

# Run in UI mode
yarn test:e2e:ui
```

---

## 📦 Build & Production

### Local Production Build

```bash
# Build both apps
yarn build

# Start production servers
yarn start:backend   # Port 3001
yarn start:frontend  # Port 3000
```

---

## ☁️ Vercel Deployment

### Prerequisites

- Vercel account
- PostgreSQL database (e.g., Neon, Supabase, Railway)

### Setup Steps

#### 1. Create Vercel Project

```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Login
vercel login

# Link project
vercel link
```

#### 2. Configure Environment Variables

In Vercel Dashboard → **Settings → Environment Variables**, add:

**Backend Environment Variables:**

```
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
JWT_SECRET=your-production-secret-key
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

**Frontend Environment Variables:**

```
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
```

#### 3. Database Setup (One-time)

After deploying backend, run migrations:

```bash
# From local machine, with production DATABASE_URL in .env
cd apps/backend
DATABASE_URL="postgresql://..." npx prisma migrate deploy --schema prisma/schema.postgres.prisma

# Seed production database
DATABASE_URL="postgresql://..." npx tsx prisma/seed.ts
```

**Or** use Vercel's build command (already configured in `apps/backend/package.json`):

```json
"vercel-build": "prisma generate --schema=prisma/schema.postgres.prisma && prisma db push --schema=prisma/schema.postgres.prisma --accept-data-loss && prisma db seed --schema=prisma/schema.postgres.prisma && next build"
```

This runs migrations + seed automatically on deploy.

#### 4. Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

Or push to `main` branch (auto-deploy if connected to GitHub).

### Vercel Configuration

Root `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/backend/package.json",
      "use": "@vercel/next"
    },
    {
      "src": "apps/frontend/package.json",
      "use": "@vercel/next"
    }
  ]
}
```

Individual `vercel.json` files in `apps/backend` and `apps/frontend` handle deployment specifics.

### Post-Deployment Verification

1. Check backend health: `https://your-backend.vercel.app/api/products`
2. Check frontend: `https://your-frontend.vercel.app`
3. Test admin login with seeded credentials
4. Verify checkout flow

---

## 📂 Project Structure

```
/
├── apps/
│   ├── backend/                    # Next.js API backend (port 3001)
│   │   ├── pages/api/              # API routes
│   │   │   ├── checkout.ts         # Checkout endpoint
│   │   │   ├── categories.ts       # Categories list
│   │   │   ├── products/           # Products endpoints
│   │   │   └── admin/              # Admin-only endpoints
│   │   ├── lib/
│   │   │   ├── auth.ts             # JWT auth middleware
│   │   │   ├── cors.ts             # CORS wrapper
│   │   │   └── prisma.ts           # Prisma client singleton
│   │   ├── prisma/
│   │   │   ├── schema.postgres.prisma  # PostgreSQL schema
│   │   │   ├── seed.ts                 # Seed script
│   │   │   └── migrations/             # DB migrations
│   │   └── tests/                  # Vitest tests
│   │
│   └── frontend/                   # Next.js frontend (port 3000)
│       ├── pages/                  # Pages (Pages Router)
│       │   ├── index.tsx           # Home (product list)
│       │   ├── cart.tsx            # Shopping cart
│       │   ├── checkout.tsx        # Checkout page
│       │   ├── products/[slug].tsx # Product detail
│       │   ├── categories/         # Category pages
│       │   └── admin/              # Admin dashboard
│       ├── components/
│       │   ├── Layout.tsx          # Main layout
│       │   └── ProductCard.tsx     # Product card component
│       ├── store/
│       │   └── cartStore.ts        # Zustand cart state
│       ├── lib/
│       │   └── api.ts              # Axios API client
│       └── tests/                  # Component tests
│
├── context/                        # Documentation
│   ├── specs.md                    # Full specification
│   ├── plan.md                     # Development plan
│   └── tasks.md                    # Task breakdown
│
├── e2e/                            # Playwright E2E tests
│   ├── user-flow.spec.ts           # User journey tests
│   └── admin-flow.spec.ts          # Admin workflow tests
│
├── package.json                    # Root workspace config
├── playwright.config.ts            # Playwright config
├── docker-compose.yml              # Docker setup
└── vercel.json                     # Vercel deployment config
```

---

## 🛠️ Available Scripts

### Root-Level Scripts

```bash
# Development
yarn dev                 # Start both FE (3000) & BE (3001)
yarn dev:backend         # Backend only
yarn dev:frontend        # Frontend only

# Build
yarn build               # Build both apps
yarn build:backend       # Backend only
yarn build:frontend      # Frontend only

# Production
yarn start:backend       # Start backend in production mode
yarn start:frontend      # Start frontend in production mode

# Testing
yarn test                # Run all Vitest tests
yarn test:e2e            # Run Playwright E2E tests
yarn test:e2e:ui         # Run E2E tests in UI mode

# Code Quality
yarn lint                # ESLint check
yarn format              # Prettier format all files
yarn format:check        # Check formatting without modifying

# Database
yarn prisma:generate     # Generate Prisma Client
yarn prisma:migrate      # Run migrations (dev)
yarn prisma:studio       # Open Prisma Studio
yarn seed                # Seed database
yarn clear:db            # Reset DB + seed (⚠️ deletes all data)
```

---

## 🐳 Docker (Optional)

Run entire stack with Docker Compose:

```bash
# Build and start
docker-compose up --build

# Stop
docker-compose down

# Remove volumes (reset DB)
docker-compose down -v
```

Services:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- PostgreSQL: localhost:5432

---

## 📚 Documentation

- **[API Testing Guide](./API_TESTING.md)** - API endpoint documentation
- **[Setup Guide](./SETUP.md)** - Detailed setup instructions
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment
- **[Testing Guide](./TESTING.md)** - Test suite documentation
- **[Specification](./context/specs.md)** - Full project spec
- **[Contributing](./CONTRIBUTING.md)** - Contribution guidelines

---

## 🔑 Key Implementation Details

### API Request Format (Checkout)

```bash
curl -X POST http://localhost:3001/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "buyer": {
      "name": "John Doe",
      "email": "john@example.com",
      "address": "123 Main St, City, Country"
    },
    "items": [
      {
        "productId": "cm...",
        "quantity": 2
      }
    ]
  }'
```

### Cart State (Zustand)

Cart persists to `localStorage` automatically. Clear cart:

```javascript
useCartStore.getState().clearCart()
```

### Admin Routes Protection

All `/api/admin/*` routes use `requireAdmin()` HOF:

```typescript
import { requireAdmin } from '@/lib/auth';

export default requireAdmin(async (req, res) => {
  // Handler logic with req.adminId available
});
```

---

## 🐛 Troubleshooting

### Common Issues

**1. `tsx: command not found`**
```bash
yarn install  # Ensure devDependencies are installed
```

**2. Prisma Client errors after schema changes**
```bash
yarn prisma:generate
```

**3. Database connection errors**
- Verify PostgreSQL is running: `docker ps` or `pg_isready`
- Check `DATABASE_URL` in `.env` files
- Test connection: `psql $DATABASE_URL`

**4. Port already in use**
```bash
# Find and kill process on port 3000/3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

**5. Colima Docker daemon not running**
```bash
colima start
docker ps  # Verify
```

---

## 📄 License

MIT

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

**Happy coding! 🚀**
