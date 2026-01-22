# Copilot Instructions — Mini Storefront

## Architecture Overview

**Monorepo Structure**: Yarn workspaces with `apps/frontend` (Next.js 14 Pages Router) and `apps/backend` (Next.js 14 API Routes). Shared `prisma/` at root for database schema and migrations.

**Data Flow**: Frontend (port 3000) → API calls via `lib/api.ts` → Backend API Routes (port 3001) → Prisma ORM → SQLite/PostgreSQL. State managed by Zustand (`store/cartStore.ts`) with localStorage persistence.

**Authentication**: JWT-based admin auth. Backend `lib/auth.ts` exports `requireAdmin()` HOF that wraps protected API routes. Token stored in localStorage/cookies on frontend, sent as `Authorization: Bearer <token>`.

## Critical Patterns

### 1. API Route Protection
```typescript
// apps/backend/pages/api/admin/products/index.ts
import { requireAdmin } from '@/lib/auth';

export default requireAdmin(async (req, res) => {
  // Handler has req.adminId injected
});
```
**Why**: `requireAdmin()` applies CORS, verifies JWT, injects `adminId` into request. Always use this wrapper for admin endpoints.

### 2. Database Transactions
```typescript
// apps/backend/pages/api/checkout.ts
await prisma.$transaction(async (tx) => {
  // 1. Fetch products and check inventory
  // 2. Decrement inventory atomically
  // 3. Create Order and OrderItems
  // Rollback on any error
});
```
**Critical**: Checkout uses Prisma transactions to prevent race conditions. Never update inventory outside transactions.

### 3. Prisma Client Singleton
```typescript
// apps/backend/lib/prisma.ts
export const prisma = globalForPrisma.prisma ?? new PrismaClient({...});
```
**Why**: Prevents multiple Prisma instances in dev hot-reload. Always import from `@/lib/prisma`.

### 4. Cart State Management
```typescript
// apps/frontend/store/cartStore.ts
export const useCartStore = create<CartStore>()(
  persist((set, get) => ({...}), { name: 'cart-storage' })
);
```
**Pattern**: Zustand with persist middleware. Cart state syncs to localStorage automatically. Respects product inventory limits.

### 5. Image Storage
```typescript
// Database: images stored as JSON string: "[]" or '["url1","url2"]'
// API: Parse on read, stringify on write
const images = JSON.parse(product.images || '[]');
```
**Convention**: Images are JSON arrays stored as strings in DB. Always parse before returning from API.

## Development Workflow

### Initial Setup
```bash
nvm use                    # Switch to Node 20 (reads .nvmrc)
yarn install               # Install all workspace dependencies
yarn prisma:migrate        # Run Prisma migrations
yarn seed                  # Seed database with sample data
```

### Daily Development
```bash
yarn dev                   # Starts both FE (3000) & BE (3001)
yarn format                # Auto-format with Prettier (includes Tailwind plugin for FE)
yarn test                  # Run Vitest unit tests
yarn test:e2e              # Run Playwright E2E tests
```

### Database Operations
```bash
yarn prisma:studio         # Visual DB browser (localhost:5555)
yarn prisma:generate       # Regenerate Prisma Client after schema changes
cd apps/backend && npx prisma migrate dev --name <name>  # Create new migration
```

## Project-Specific Conventions

1. **Validation**: Use Zod schemas for API request validation (see `apps/backend/pages/api/checkout.ts`)
2. **CORS**: All API routes use `withCors()` wrapper from `lib/cors.ts` or rely on `requireAdmin()` which includes CORS
3. **Error Responses**: Return `{ error: string, message?: string, details?: object }` format
4. **Success Responses**: Return data directly or `{ data, total?, page?, limit? }` for paginated endpoints
5. **Route Naming**: Backend API routes mirror frontend pages: `/api/products/:slug` ↔ `/products/[slug]`
6. **Component Naming**: Pascal case for components, kebab-case for files when multi-word (e.g., `ProductCard.tsx`)

## Key Integration Points

- **Frontend API Client**: `apps/frontend/lib/api.ts` — Centralized Axios instance with base URL from `NEXT_PUBLIC_API_URL`
- **Prisma Schema**: `prisma/schema.prisma` — Source of truth for data models (Category, Product, Order, OrderItem, AdminUser)
- **Seed Script**: `prisma/seed.ts` — Creates default admin (admin/admin123) and sample products
- **Cart-Checkout Bridge**: Cart items from Zustand store must match `checkoutItemSchema` format (productId, quantity)

## Testing Strategy

- **Unit Tests**: Vitest for business logic, utilities, API handlers (mocked DB)
- **Component Tests**: React Testing Library for UI components in `apps/frontend/tests/components/`
- **E2E Tests**: Playwright for user flows in `e2e/` (user-flow.spec.ts, admin-flow.spec.ts)
- **Test Files**: Co-located in `apps/*/tests/` directories

## Common Gotchas

1. **Prisma Client Updates**: Run `yarn prisma:generate` after any schema changes, or imports will fail
2. **Environment Variables**: Backend needs `DATABASE_URL` and `JWT_SECRET`. Frontend needs `NEXT_PUBLIC_API_URL`
3. **Port Conflicts**: Backend runs on 3001, frontend on 3000. Check terminal output if connections fail
4. **Image Arrays**: Always parse `product.images` JSON string before rendering. Empty default is `"[]"` not `null`
5. **Admin Password**: Hashed with bcryptjs. Seed script creates default admin. Never store plaintext passwords
6. **Inventory Checks**: Always check `product.inventory >= quantity` before allowing add-to-cart or checkout

## Reference Files

- Architecture decisions: `context/specs.md`
- Task breakdown: `context/tasks.md`
- Implementation status: `IMPLEMENTATION_PROGRESS.md`
- Setup instructions: `SETUP.md`
- API testing: `API_TESTING.md`
- Deployment guide: `DEPLOYMENT.md`
