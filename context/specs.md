# Mini Storefront — Specification (FE + BE)

Project: Mini Storefront — Bán hàng tối giản

Goal: Build a minimal online shop with Category, Product listing, Cart, and a simulated Checkout flow. An Admin area manages inventory, prices, and publish/unpublish products.

This specification covers both Frontend (Next.js + TypeScript) and Backend (Next.js API or Node/Express + TypeScript) responsibilities, API contract, data models, DB schema, seeds, tests, and deployment notes.

---

**Scope & Constraints**
- Minimal viable feature set: product browsing, category filtering, cart, checkout simulation, admin management (inventory/price/publish).
- No real payment integration — checkout simulates success/failure.
- Authentication: simple session/JWT-based admin auth; public store requires no login for buyers.
- Persistence: relational DB recommended (Postgres). Use lightweight ORM (Prisma) or plain SQL.

**Tech stack (recommended)**
- Frontend: Next.js (App or Pages), TypeScript, React, SWR or React Query for data fetching, Tailwind CSS for UI.
- Backend: Next.js API routes or a separate Node (Express/Nest) service in TypeScript.
- DB: PostgreSQL (local or managed). Use Prisma for schema/migrations and type safety.
- Deployment: Vercel for FE & BE (or FE on Vercel, BE on Vercel Serverless/Node), Docker optional.

---

**User Roles**
- Guest/Buyer: browse categories, view products, add to cart, checkout (simulated), view order confirmation.
- Admin: login to admin panel, create/update products and categories, manage inventory, change prices, publish/unpublish products, view orders.

---

1) Frontend — Pages & Components

- Public store (no auth required)
  - `/` — Home: Featured categories and featured products.
  - `/categories` — Category list (optional)
  - `/category/[slug]` — Product listing for a category with filtering/sorting.
  - `/product/[slug]` — Product detail page: images, description, price, stock, add to cart control (quantity, add button), publish status respected (hidden if unpublished).
  - `/cart` — Cart page: list items, adjust quantity, remove items, subtotal, shipping placeholder, proceed to checkout button.
  - `/checkout` — Simulated checkout flow: collect buyer name, email, shipping address; show order summary; place order (POST to backend) → shows success/failure page. No payment details required.
  - `/order/[id]` — Order confirmation page (public link or only after checkout).

- Admin (protected route; simple username/password)
  - `/admin` — Admin dashboard: summary (total products, low stock warnings, recent orders)
  - `/admin/login` — Login page for admin
  - `/admin/products` — Product list with quick actions (edit, publish/unpublish, adjust stock)
  - `/admin/products/new` — Create product form
  - `/admin/products/[id]/edit` — Edit product: name, slug, description, category, price, inventory, published flag
  - `/admin/categories` — Manage categories
  - `/admin/orders` — List orders and order details

UI Components (reusable)
- `ProductCard`, `ProductList`, `CategoryList`, `CartItem`, `CartSummary`, `AdminTable`, `Modal`, `Form` components.

Client-side behavior
- Use optimistic UI updates for add-to-cart and quantity changes stored in local state or localStorage.
- Cart sync: keep cart client-side; optionally persist cart to backend for logged-in users (not required).
- Data fetching: SWR/React Query with small TTL; cache invalidation on admin changes.

Accessibility
- Use semantic HTML, labels, visible focus outlines, aria attributes where needed.

---

2) Backend — API Endpoints

Auth
- POST `/api/admin/login` — body: { username, password } → returns `{ token }` (JWT) and `expiresIn`.
- POST `/api/admin/logout` — invalidates server-side session/blacklist (optional)

Public store endpoints
- GET `/api/categories` — returns list of categories { id, name, slug }
- GET `/api/categories/:slug/products` — returns products in category (published only)
- GET `/api/products` — list products with optional query params: `?category=slug&search=&page=&limit=` (published only)
- GET `/api/products/:slug` — product detail (published only)

Cart & Checkout
- POST `/api/checkout` — body: { buyer: {name,email,address}, items: [{ productId, quantity }], shippingMethod? } → behavior: validate stock, reserve/decrement stock in a transaction, create order, return order id and status. Simulated payment: respond with success unless test param `simulate=fail`.
- GET `/api/orders/:id` — returns order details (for confirmation)

Admin endpoints (require auth)
- GET `/api/admin/products` — list all products (including unpublished)
- POST `/api/admin/products` — create product
- GET `/api/admin/products/:id` — get product
- PUT `/api/admin/products/:id` — update product (price, stock, published flag)
- DELETE `/api/admin/products/:id` — delete product

- GET `/api/admin/categories` — list/create/update/delete categories
- GET `/api/admin/orders` — list orders with filters
- GET `/api/admin/orders/:id` — order detail

API notes
- Protect admin routes with JWT or session cookie. Use middleware to verify.
- Rate limit public endpoints if desired.

Minimal OpenAPI-like schema (example)

POST /api/checkout

Request body:

```
{
  "buyer": { "name": "Nguyen Van A", "email": "a@example.com", "address": "123 Nguyen Trai" },
  "items": [ { "productId": "uuid-or-int", "quantity": 2 } ],
  "simulate": "success" // or "fail"
}
```

Response (success):

```
{
  "orderId": "ord_abc123",
  "status": "CONFIRMED",
  "total": 123.45
}
```

Response (failure due to stock): status 400

```
{ "error": "OUT_OF_STOCK", "details": [{ "productId": "p1", "available": 0 }] }
```

---

3) Data Models & DB Schema

Use Postgres. Example models in Prisma schema notation.

Prisma-like schema (example)

```
model Category {
  id    String @id @default(cuid())
  name  String
  slug  String @unique
  products Product[]
}

model Product {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  price       Decimal  @db.Decimal(10,2)
  inventory   Int      // stock count
  published   Boolean  @default(false)
  category    Category @relation(fields: [categoryId], references: [id])
  categoryId  String
  images      String[] // urls
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Order {
  id        String   @id @default(cuid())
  buyerName String
  buyerEmail String
  address   String
  total     Decimal  @db.Decimal(10,2)
  status    String   // CONFIRMED, FAILED, CANCELLED
  items     OrderItem[]
  createdAt DateTime @default(now())
}

model OrderItem {
  id        String  @id @default(cuid())
  order     Order   @relation(fields: [orderId], references: [id])
  orderId   String
  productId String
  name      String
  price     Decimal @db.Decimal(10,2)
  quantity  Int
}

model AdminUser {
  id       String @id @default(cuid())
  username String @unique
  password String // hashed
}
```

Inventory and Order transaction rules
- When checkout is called: start DB transaction, for each item check `Product.inventory >= requested`, if any insufficient → rollback and return error. Otherwise decrement inventory for each product and create `Order` + `OrderItem` rows, commit transaction.

---

4) Seed Data

Example JSON seeds (small):

categories.json

```
[ { "id": "c1", "name": "Áo", "slug": "ao" }, { "id": "c2", "name": "Quần", "slug": "quan" } ]
```

products.json

```
[
  { "id":"p1","name":"Áo thun trắng","slug":"ao-thun-trang","description":"Áo cotton","price":150000,"inventory":10,"published":true,"categoryId":"c1","images":["/images/ao1.jpg"] },
  { "id":"p2","name":"Quần jean","slug":"quan-jean","description":"Quần jean xanh","price":350000,"inventory":5,"published":true,"categoryId":"c2","images":["/images/quan1.jpg"] }
]
```

admin user seed (replace password with hash in real seeds)

```
{ "id":"admin1","username":"admin","password":"$2b$10$...hash..." }
```

---

5) Tests & Acceptance Criteria

Unit tests
- Backend: test product queries, category queries, checkout happy path, checkout out-of-stock path, admin auth middleware.
- Frontend: component tests for `ProductCard`, `Cart` logic, and `Checkout` form validation.

Integration tests
- API: run checkout flow end-to-end against test DB, verify inventory changes and order creation.

E2E tests (optional)
- Use Playwright or Cypress to test user flow: browse → add to cart → checkout → view order confirmation.

Acceptance criteria (minimum)
- Visitors can view products by category and product detail for published products.
- Visitors can add products to cart and adjust quantities.
- Checkout validates stock, creates order, and returns a confirmation with an order id.
- Admin can login and publish/unpublish products; changes reflect in public store.
- Inventory decrements on successful checkout; checkout fails if insufficient stock.

---

6) Security & Operational Notes

- Hash admin passwords with bcrypt and never store plain text.
- Protect admin endpoints with JWT signed by a strong secret or with server sessions.
- Validate and sanitize all inputs (especially product creation and descriptions).
- Consider background job for sending order emails (not required for MVP).

7) Deployment notes

- For Vercel: deploy frontend and backend as separate projects for simplicity, or use monorepo with `vercel.json` for routing.
- Set environment variables in Vercel: `DATABASE_URL`, `JWT_SECRET`, `ADMIN_PASSWORD_HASH` (for initial admin seed), etc.
- Use managed Postgres for production or host on a container provider.

8) Implementation roadmap (suggested sprints)

- Sprint 1: Data models, backend CRUD for categories/products, seed data, basic public product listing and product page.
- Sprint 2: Cart UI + client-side storage, Add-to-cart, Cart page.
- Sprint 3: Checkout endpoint (transactional), checkout UI, order confirmation.
- Sprint 4: Admin UI (login, product management), publish/unpublish, inventory adjustments.
- Sprint 5: Tests, CI, deploy to Vercel, Dockerfile for production images.

---

Appendix: Minimal example API contract and sample requests are included above. If you'd like, I can now generate:
- OpenAPI (YAML) for the public and admin APIs
- Prisma schema file and migrations
- Seed scripts
- Starter Next.js frontend pages and API route stubs

Which of these should I generate next? Specify one or more and I will add them to the repo.

---

9) Source code structure (Next.js + TypeScript) — recommended layout

This section describes a concrete repository layout and starter files for a Next.js-based frontend and backend. It's suited for a monorepo with two apps under `apps/` but you can split into separate repos if preferred.

Repository layout (monorepo)

```
/
├─ apps/
│  ├─ frontend/                 # Next.js frontend (Pages or App Router)
│  │  ├─ package.json
  │  │  ├─ tsconfig.json
  │  │  ├─ next.config.js
  │  │  ├─ public/
  │  │  ├─ styles/
  │  │  ├─ components/
  │  │  ├─ pages/ or app/         # use either Pages router or App router
  │  │  │  ├─ index.tsx
  │  │  │  ├─ cart.tsx
  │  │  │  ├─ checkout.tsx
  │  │  │  ├─ product/[slug].tsx
  │  │  │  └─ category/[slug].tsx
  │  │  └─ utils/                 # api clients, hooks (useCart, useProducts)
  │  ├─ backend/                  # Next.js API-only app or Node service
  │  │  ├─ package.json
  │  │  ├─ tsconfig.json
  │  │  ├─ next.config.js         # if using Next API routes
  │  │  └─ pages/api/             # API routes for Next.js backend
  │  │     ├─ products/           # e.g., pages/api/products/[slug].ts
  │  │     ├─ categories/
  │  │     ├─ checkout.ts
  │  │     └─ admin/
  │  │        ├─ products.ts
  │  │        └─ login.ts
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ package.json                  # root (workspace) scripts: install/build/test across apps
├─ pnpm-workspace.yaml or package.json workspaces
├─ vercel.json
├─ Dockerfile.frontend
├─ Dockerfile.backend
└─ docker-compose.yml
```

package.json scripts (examples)

Root `package.json` (workspaces)

```
{
  "name": "mini-storefront",
  "private": true,
  "workspaces": ["apps/*"],
  "scripts": {
    "install": "pnpm install",
    "dev:frontend": "pnpm --filter frontend dev",
    "dev:backend": "pnpm --filter backend dev",
    "dev": "concurrently \"pnpm --filter frontend dev\" \"pnpm --filter backend dev\"",
    "build": "pnpm -w -r build",
    "start:frontend": "pnpm --filter frontend start",
    "start:backend": "pnpm --filter backend start",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "lint": "eslint \"**/*.{ts,tsx,js,jsx}\" --max-warnings=0"
  }
}
```

Frontend `package.json` (examples)

```
{
  "name": "frontend",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest"
  }
}
```

Backend `package.json` (examples)

```
{
  "name": "backend",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev --name init",
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Env variables (minimum)
- `DATABASE_URL` — Postgres connection string
- `JWT_SECRET` — secret for signing admin tokens
- `ADMIN_USERNAME` and `ADMIN_PASSWORD_HASH` (for initial seed or env-based admin)
- `NEXT_PUBLIC_API_URL` — frontend points to backend API base URL

Config files & tooling
- `tsconfig.json` in root and per-app for path mapping.
- `eslintrc.js`, `.prettierrc`, and `tailwind.config.js` in repo root.
- `prisma/schema.prisma` for DB models.

Examples of page and API route stubs

Frontend page example: `apps/frontend/pages/cart.tsx`

```tsx
import React from 'react'
import Cart from '../components/Cart'

export default function CartPage() {
  return <Cart />
}
```

Backend API route example (Next.js): `apps/backend/pages/api/checkout.ts`

```ts
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { buyer, items, simulate } = req.body

  // Basic validation
  if (!buyer || !Array.isArray(items)) return res.status(400).json({ error: 'INVALID_PAYLOAD' })

  // Transactional checkout pseudo-code
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Check stock, decrement, create order and items
      return { orderId: 'ord_test' }
    })
    return res.status(200).json({ orderId: result.orderId, status: 'CONFIRMED' })
  } catch (err) {
    return res.status(400).json({ error: 'OUT_OF_STOCK' })
  }
}
```

Development and run commands

```bash
# Install (pnpm recommended for workspaces)
pnpm install

# Run both apps locally
pnpm dev

# Build
pnpm build

# Run tests
pnpm -w -r test
```

---

10) What I can generate next (automation)

- `prisma/schema.prisma` and `prisma/seed.ts` script
- OpenAPI (YAML) for API endpoints
- Starter Next.js pages and API route files per the structure above
- CI updates to run migrations and seed test DB in workflow

Tell me which of the above artifacts you'd like me to generate now and I will add them to the repo (I can start with `prisma/schema.prisma` + seeds).
