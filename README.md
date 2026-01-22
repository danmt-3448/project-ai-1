# Mini Storefront

A minimal online store built with Next.js, TypeScript, and PostgreSQL.

## Features

- 🛍️ Product browsing and filtering by category
- 🛒 Shopping cart with localStorage persistence
- 💳 Simulated checkout flow
- 👨‍💼 Admin panel for inventory management
- 🔐 JWT-based authentication for admin

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS, SWR
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL
- **Deployment:** Vercel (optional Docker)

## Getting Started

### Prerequisites

- Node.js 20+ (we provide `.nvmrc` files; use `nvm use` before installing)
- PostgreSQL database
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd mini-storefront
```

2. Install dependencies (use Node 20 via `nvm`):

Before installing, ensure you're on Node 20 (the repo and apps include `.nvmrc`):

```bash
# From repo root (recommended)
nvm install          # installs Node 20 if missing (reads root .nvmrc)
nvm use

# Then install packages (workspace-aware installer preferred, or per-app):
npm install

# Or per-app (ensure to `nvm use` inside each app folder which has its own .nvmrc):
cd apps/backend && nvm install && nvm use && npm install
cd ../frontend && nvm install && nvm use && npm install
cd ../..
```

3. Setup environment variables:

Backend (`apps/backend/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mini_storefront"
JWT_SECRET="your-secret-key"
NODE_ENV="development"
```

Frontend (`apps/frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. Run database migrations and seed (Postgres):
```bash
cd apps/backend
# Push schema to your Postgres and seed
npx prisma db push --schema=prisma/schema.postgres.prisma
npx tsx prisma/seed.ts
```

5. Start development servers:
```bash
# From root directory
npm run dev

# Or separately:
npm run dev:backend  # Backend runs on :3001
npm run dev:frontend # Frontend runs on :3000
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Default Admin Credentials

- Username: `admin`
- Password: `admin123`

## Project Structure

```
/
├── apps/
│   ├── backend/         # Next.js API backend
│   │   ├── pages/api/   # API routes
│   │   ├── lib/         # Shared utilities
│   │   └── middleware/  # Auth middleware
│   └── frontend/        # Next.js frontend
│       ├── pages/       # Pages
│       ├── components/  # React components
│       ├── lib/         # API client
│       └── hooks/       # Custom hooks
├── apps/backend/prisma/
│   ├── schema.postgres.prisma    # Database schema (Postgres)
│   └── seed.ts                   # Seed data
└── context/
    ├── specs.md         # Project specification
    ├── plan.md          # Development roadmap
    └── tasks.md         # Task breakdown
```

## Available Scripts

```bash
npm run dev            # Run both frontend and backend
npm run build          # Build both apps
npm run lint           # Lint all code
npm run format         # Format with Prettier
npm run prisma:migrate # Run database migrations
npm run seed           # Seed database
```

## Docker

Build and run with Docker Compose:

```bash
docker compose up --build
```

## Testing

```bash
# Backend tests
cd apps/backend && npm test

# Frontend tests
cd apps/frontend && npm test
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions on Vercel.

## Documentation

- [Specification](./context/specs.md) - Full project specification
- [Planning](./context/plan.md) - Development roadmap
- [Tasks](./context/tasks.md) - Task breakdown
- [Contributing](./CONTRIBUTING.md) - Contribution guidelines

## License

MIT
