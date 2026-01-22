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

**Tech Stack (Implemented)**
- **Frontend**: Next.js 14.0.4 (Pages Router), React 18.2.0, TypeScript 5.3.3, Tailwind CSS 3.3.6, SWR 2.2.4 (data fetching), Zustand 4.4.7 (state management with persist middleware), Axios 1.6.2 (API client)
- **Backend**: Next.js 14.0.4 (API Routes), TypeScript 5.3.3, Prisma ORM 5.7.0, Zod 3.22.4 (validation), jsonwebtoken 9.0.2 (JWT auth), bcryptjs 2.4.3 (password hashing)
- **Database**: SQLite (development), PostgreSQL (production recommended)
- **Package Manager**: Yarn 1.22.19 (enforced via packageManager field), workspace support enabled
- **Code Quality**: Prettier 3.1.0/3.1.1 (with prettier-plugin-tailwindcss 0.5.9 for FE), ESLint 8.54.0, TypeScript strict mode
- **Node Version**: Node.js 20+ (enforced via .nvmrc files at root and per-app)
- **Testing**: Vitest 1.0.4 (unit/integration), Playwright 1.40.1 (E2E), React Testing Library 14.1.2, jsdom 23.0.1
- **Deployment**: Vercel (with monorepo routing via vercel.json), Docker support (node:20-alpine multi-stage builds), concurrently 8.2.2 for dev orchestration

---

**User Roles**
- Guest/Buyer: browse categories, view products, add to cart, checkout (simulated), view order confirmation.
- Admin: login to admin panel, create/update products and categories, manage inventory, change prices, publish/unpublish products, view orders.

---

1) Frontend — Pages & Components

**Public Store Routes** (no authentication required):
- `/` — Home ([index.tsx](apps/frontend/pages/index.tsx)): Featured categories grid with navigation, featured products list with ProductCard components. Uses SWR for data fetching from `/api/categories` and `/api/products`.
- `/categories` — Category listing ([categories/index.tsx](apps/frontend/pages/categories/index.tsx)): Browse all categories with links to filtered product views.
- `/categories/[slug]` — Products by category ([categories/[slug].tsx](apps/frontend/pages/categories/[slug].tsx)): Filtered product listing for specific category with pagination support.
- `/products/[slug]` — Product detail ([products/[slug].tsx](apps/frontend/pages/products/[slug].tsx)): Full product information including image gallery, description, price, inventory status, quantity selector (respects inventory limits), add-to-cart button. Only published products accessible.
- `/cart` — Shopping cart ([cart.tsx](apps/frontend/pages/cart.tsx)): Lists cart items from Zustand store, quantity adjustment controls (respects inventory), remove item buttons, subtotal calculation, proceed to checkout button. Cart persists via localStorage.
- `/checkout` — Checkout form ([checkout.tsx](apps/frontend/pages/checkout.tsx)): Collects buyer name (required, min 1 char), email (email validation), shipping address (required, min 10 chars); displays order summary from cart; POST to `/api/checkout` on submit; redirects to order confirmation on success.
- `/order/[id]` — Order confirmation ([order/[id].tsx](apps/frontend/pages/order/[id].tsx)): Displays order details fetched from `/api/orders/:id` including buyer info, items, total, status.

**Admin Routes** (JWT authentication required, client-side token validation):
- `/admin` — Admin login redirect ([admin/index.tsx](apps/frontend/pages/admin/index.tsx)): Redirects to `/admin/dashboard` if authenticated, otherwise redirects to login.
- `/admin/dashboard` — Admin overview ([admin/dashboard.tsx](apps/frontend/pages/admin/dashboard.tsx)): Summary metrics (total products, inventory warnings), quick links to management pages.
- `/admin/products` — Products list ([admin/products/index.tsx](apps/frontend/pages/admin/products/index.tsx)): Table of all products (including unpublished), quick actions (edit, delete), filters by published status.
- `/admin/products/create` — Create product ([admin/products/create.tsx](apps/frontend/pages/admin/products/create.tsx)): Form with fields: name, slug (auto-generated option), description (textarea), category (dropdown from `/api/categories`), price (number, min 0), inventory (integer, min 0), published (checkbox), images (text input for JSON array or file upload future). POST to `/api/admin/products` with JWT token in Authorization header.
- `/admin/products/[id]/edit` — Edit product ([admin/products/[id]/edit.tsx](apps/frontend/pages/admin/products/[id]/edit.tsx)): Pre-filled form with product data from `GET /api/admin/products/:id`, same fields as create. PUT to `/api/admin/products/:id`.
- `/admin/orders` — Orders list ([admin/orders/index.tsx](apps/frontend/pages/admin/orders/index.tsx)): Table of all orders with filters by status (CONFIRMED, FAILED, CANCELLED), search by buyer name/email, pagination.
- `/admin/orders/[id]` — Order detail ([admin/orders/[id].tsx](apps/frontend/pages/admin/orders/[id].tsx)): Full order information, buyer details, itemized list, status update UI (future).
- `/admin/categories` — Categories management ([admin/categories/index.tsx](apps/frontend/pages/admin/categories/index.tsx)): Table of all categories with inline create/edit forms, delete buttons with confirmation dialogs. Features:
  - List all categories with id, name, slug, product count
  - Inline "Add New Category" form at top (name → auto-generate slug option)
  - Edit button toggles inline edit mode for each row
  - Delete button with confirmation dialog, checks for products using category
  - Real-time validation (slug uniqueness, name min length, slug format)
  - Uses SWR for data fetching with optimistic updates via `mutate()`
  - Product count displayed to show which categories are in use
  - Prevents deletion if category has associated products

**Reusable Components**:
- `Layout.tsx` — Main layout wrapper with navigation, handles admin auth state
- `ProductCard.tsx` — Displays product thumbnail, name, price, quick add-to-cart. Tested in `tests/components/ProductCard.test.tsx`.

**State Management**:
- **Cart State**: Zustand store ([store/cartStore.ts](apps/frontend/store/cartStore.ts)) with persist middleware. Operations: `addItem` (respects inventory max), `removeItem`, `updateQuantity` (auto-removes if quantity <= 0), `clearCart`, `getTotalItems`, `getSubtotal`. Syncs to localStorage key `cart-storage`. Cart items include productId, name, slug, price, quantity, image, inventory. Fully tested in `tests/cart.test.ts`.
- **Data Fetching**: SWR with default revalidation on focus, custom `api.ts` client using Axios. Base URL from `NEXT_PUBLIC_API_URL` env var. No caching for admin mutations (revalidate after create/update/delete).

**Client-Side Behavior**:
- **Optimistic Updates**: Cart operations update Zustand state immediately, no backend sync (cart is client-only).
- **Inventory Awareness**: Cart enforces `Math.min(requestedQuantity, product.inventory)` on add/update operations.
- **Form Validation**: Zod schemas on backend, basic HTML5 validation on frontend forms.
- **Loading States**: SWR provides `isLoading` and `error` states for all data fetching.
- **Error Handling**: API errors displayed via alert/toast (basic implementation), more robust UI needed.

**Accessibility**:
- Semantic HTML used throughout (nav, main, article, button, form elements)
- Form labels associated with inputs
- Focus outlines preserved (Tailwind default styles)
- ARIA attributes on interactive elements (buttons, links)
- **Gap**: No comprehensive WCAG 2.1 AA compliance audit performed yet, keyboard navigation not explicitly tested.

---

2) Backend — API Endpoints

**Authentication** ([apps/backend/pages/api/admin/login.ts](apps/backend/pages/api/admin/login.ts)):
- `POST /api/admin/login`
  - **Request**: `{ username: string, password: string }`
  - **Response 200**: `{ token: string, admin: { id: string, username: string } }`
  - **Errors**: 400 (invalid credentials), 405 (method not allowed)
  - **Implementation**: Bcrypt password verification against AdminUser table, JWT signed with `JWT_SECRET`, no expiration set (infinite token lifetime - MVP simplification)
  - **CORS**: Applied via `withCors` wrapper

**Public Store Endpoints** (no authentication, CORS enabled):
- `GET /api/categories` ([categories.ts](apps/backend/pages/api/categories.ts))
  - **Response 200**: `[{ id: string, name: string, slug: string }]`
  - **Errors**: 500 (database error)
  - **Implementation**: Returns all categories, no pagination

- `GET /api/categories/:slug/products` ([categories/[slug]/products.ts](apps/backend/pages/api/categories/[slug]/products.ts))
  - **Query Params**: `page` (default 1), `limit` (default 10)
  - **Response 200**: `{ data: Product[], total: number, page: number, limit: number, totalPages: number }`
  - **Product Fields**: id, name, slug, description, price, inventory, published (always true), images (parsed JSON array), category { id, name, slug }, createdAt, updatedAt
  - **Errors**: 404 (category not found), 500
  - **Implementation**: Filters by category slug AND published=true, includes pagination

- `GET /api/products` ([products/index.ts](apps/backend/pages/api/products/index.ts))
  - **Query Params**: `category` (slug), `search` (name/description), `page`, `limit`, `sort` (future)
  - **Response 200**: `{ data: Product[], total, page, limit, totalPages }`
  - **Errors**: 500
  - **Implementation**: Filters by published=true, optional category filter, full-text search on name/description (case-insensitive contains), includes category relation

- `GET /api/products/:slug` ([products/[slug].ts](apps/backend/pages/api/products/[slug].ts))
  - **Response 200**: `Product` (single object with category relation, images parsed)
  - **Errors**: 404 (not found or unpublished), 500
  - **Implementation**: Fetches by slug WHERE published=true

- `POST /api/checkout` ([checkout.ts](apps/backend/pages/api/checkout.ts)) **[TRANSACTIONAL - CRITICAL]**
  - **Request**: Validated with Zod schema:
    ```typescript
    {
      buyerName: string (min 1),
      buyerEmail: string (email format),
      address: string (min 10 chars),
      items: [{ productId: string, quantity: number (int, positive, min 1) }] (min 1 item),
      simulateFail?: boolean (optional, for testing)
    }
    ```
  - **Response 200**: `{ orderId: string, status: "CONFIRMED", total: number }`
  - **Errors**:
    - 400: Validation failed (`{ error: "Validation failed", details: ZodError }`)
    - 400: Simulated failure (`{ error: "Simulated checkout failure", message: "This is a test failure" }`)
    - 400: Insufficient inventory (`{ error: "Insufficient inventory", details: { productId, requested, available } }`)
    - 400: Product not found/unpublished (`{ error: "Some products not found or not published" }`)
    - 500: Transaction failed
  - **Implementation**: Prisma `$transaction` wrapping:
    1. Fetch all products WHERE id IN items AND published=true
    2. Validate all products exist
    3. Check inventory >= quantity for each item (throws if insufficient)
    4. Calculate total and build orderItems array
    5. Create Order with nested OrderItems creation
    6. Decrement inventory for each product atomically
    7. Commit transaction (all-or-nothing)
  - **Race Condition Handling**: Transaction isolation prevents concurrent checkouts from overselling

- `GET /api/orders/:id` ([orders/[id].ts](apps/backend/pages/api/orders/[id].ts))
  - **Response 200**: `Order` with items relation `{ id, buyerName, buyerEmail, address, total, status, createdAt, items: [{ id, productId, name, price, quantity }] }`
  - **Errors**: 404 (order not found), 500
  - **Implementation**: No authentication required (public confirmation link), includes OrderItem relation

**Admin Endpoints** (JWT required via `requireAdmin` middleware, CORS applied):

- `POST /api/admin/products` ([admin/products/index.ts](apps/backend/pages/api/admin/products/index.ts) or [admin/products/create.ts](apps/backend/pages/api/admin/products/create.ts))
  - **Auth**: Bearer token in Authorization header
  - **Request**: Zod validated: `{ name, slug, description?, categoryId, price (number), inventory (int), published (boolean), images? (JSON string) }`
  - **Response 200**: `{ product: Product }`
  - **Errors**: 401 (unauthorized), 400 (validation failed / duplicate slug), 500
  - **Implementation**: Creates product with images as JSON string (e.g., `"[]"`), associates with category

- `GET /api/admin/products` ([admin/products/index.ts](apps/backend/pages/api/admin/products/index.ts))
  - **Auth**: Required
  - **Query Params**: `page`, `limit`, `published` (filter by true/false/all)
  - **Response 200**: `{ data: Product[], total, page, limit, totalPages }`
  - **Implementation**: Returns ALL products including unpublished, with category relation and parsed images

- `GET /api/admin/products/:id` ([admin/products/[id].ts](apps/backend/pages/api/admin/products/[id].ts))
  - **Auth**: Required
  - **Response 200**: `Product` with category relation
  - **Errors**: 401, 404, 500

- `PUT /api/admin/products/:id` ([admin/products/[id].ts](apps/backend/pages/api/admin/products/[id].ts))
  - **Auth**: Required
  - **Request**: Partial update allowed (all fields optional except at least one must be present)
  - **Response 200**: `{ product: Product }`
  - **Errors**: 401, 404, 400 (validation), 500

- `DELETE /api/admin/products/:id` ([admin/products/[id].ts](apps/backend/pages/api/admin/products/[id].ts))
  - **Auth**: Required
  - **Response 200**: `{ message: "Product deleted" }`
  - **Errors**: 401, 404, 500
  - **Implementation**: Soft delete not implemented, hard delete from database

- `GET /api/admin/orders` ([admin/orders/index.ts](apps/backend/pages/api/admin/orders/index.ts))
  - **Auth**: Required
  - **Query Params**: `status` (CONFIRMED/FAILED/CANCELLED), `page`, `limit`
  - **Response 200**: `{ data: Order[], total, page, limit, totalPages }` (includes items relation)
  - **Errors**: 401, 500

**Category Management (Admin)**:

- `GET /api/admin/categories` ([admin/categories/index.ts](apps/backend/pages/api/admin/categories/index.ts))
  - **Auth**: Bearer token required via `requireAdmin` middleware
  - **Query Params**: None (returns all categories, no pagination for MVP)
  - **Response 200**: `[{ id: string, name: string, slug: string, _count: { products: number } }]`
  - **Errors**: 401 (unauthorized), 500
  - **Implementation**: Returns all categories with product count using Prisma `include: { _count: { select: { products: true } } }`. Helps admin identify categories in use.

- `POST /api/admin/categories` ([admin/categories/index.ts](apps/backend/pages/api/admin/categories/index.ts))
  - **Auth**: Required
  - **Request**: Zod validated: `{ name: string (min 1, max 100), slug: string (min 1, max 100, lowercase, regex: /^[a-z0-9-]+$/) }`
  - **Response 201**: `{ id: string, name: string, slug: string }`
  - **Errors**: 
    - 401: Unauthorized
    - 400: Validation failed (`{ error: "Validation failed", details: ZodError }`)
    - 400: Duplicate slug (`{ error: "Slug already exists" }`)
    - 405: Method not allowed
    - 500: Server error
  - **Implementation**: 
    - Validates name and slug format with Zod
    - Checks slug uniqueness with `findUnique` before creation
    - Slug must be lowercase letters, numbers, and hyphens only
    - Creates category with `prisma.category.create()`

- `PUT /api/admin/categories/:id` ([admin/categories/[id].ts](apps/backend/pages/api/admin/categories/[id].ts))
  - **Auth**: Required
  - **Request**: Zod validated: `{ name?: string (min 1, max 100), slug?: string (min 1, max 100, lowercase, regex: /^[a-z0-9-]+$/) }` (partial update, at least one field required)
  - **Response 200**: `{ id: string, name: string, slug: string }`
  - **Errors**:
    - 401: Unauthorized
    - 404: Category not found
    - 400: Validation failed (no fields provided or invalid format)
    - 400: Duplicate slug (`{ error: "Slug already exists" }`) if slug changed to existing value
    - 405: Method not allowed
    - 500: Server error
  - **Implementation**:
    - Validates at least one field is provided for update
    - If slug is being changed, verifies new slug doesn't conflict with existing categories (excluding current category)
    - Updates category with `prisma.category.update()`

- `DELETE /api/admin/categories/:id` ([admin/categories/[id].ts](apps/backend/pages/api/admin/categories/[id].ts))
  - **Auth**: Required
  - **Response 200**: `{ message: "Category deleted" }`
  - **Errors**:
    - 401: Unauthorized
    - 404: Category not found
    - 400: Cannot delete (`{ error: "Cannot delete category with products", details: { productCount: number } }`)
    - 405: Method not allowed
    - 500: Server error
  - **Implementation**:
    - First fetches category with product count: `findUnique({ include: { _count: { select: { products: true } } } })`
    - Prevents deletion if `category._count.products > 0` (data integrity protection)
    - Deletes category with `prisma.category.delete()` only if no products exist
    - **Note**: Schema has `onDelete: Cascade` for Product → Category relation, but we prevent cascading deletes at API level to avoid accidental data loss

**API Architecture Notes**:
- **CORS Configuration** ([lib/cors.ts](apps/backend/lib/cors.ts)): Allows all origins (`*`) for local dev, credentials disabled, handles OPTIONS preflight
- **Authentication** ([lib/auth.ts](apps/backend/lib/auth.ts)): `requireAdmin` HOF applies CORS and verifies JWT, injects `adminId` into request
- **Database Client** ([lib/prisma.ts](apps/backend/lib/prisma.ts)): Singleton pattern prevents multiple instances in dev hot-reload
- **JWT Secret**: Defaults to `'your-secret-key-change-in-production'` if `JWT_SECRET` env var not set (INSECURE)
- **Token Expiration**: Not implemented - tokens are infinite lifetime (suitable for MVP admin panel)
- **Rate Limiting**: Not implemented
- **Image Parsing**: All product responses parse `images` field from JSON string to array before returning

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

**Database**: SQLite for development (file: `dev.db`), PostgreSQL recommended for production. Configured via `DATABASE_URL` environment variable.

**Prisma Schema** ([prisma/schema.prisma](prisma/schema.prisma)):

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"  // Change to "postgresql" for production
  url      = env("DATABASE_URL")
}

model Category {
  id       String    @id @default(cuid())
  name     String
  slug     String    @unique
  products Product[]

  @@map("categories")
}

model Product {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  price       Float    // Note: Decimal not supported in SQLite, using Float
  inventory   Int      @default(0)
  published   Boolean  @default(false)
  images      String   @default("[]")  // JSON string array, not native array (SQLite limitation)
  category    Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  categoryId  String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([categoryId])    // Optimizes category filtering
  @@index([published])     // Optimizes published product queries
  @@index([slug])          // Optimizes slug lookups (redundant with @unique but explicit)
  @@map("products")
}

model Order {
  id         String      @id @default(cuid())
  buyerName  String
  buyerEmail String
  address    String
  total      Float
  status     String      @default("CONFIRMED") // CONFIRMED, FAILED, CANCELLED
  items      OrderItem[]
  createdAt  DateTime    @default(now())

  @@index([status])        // Optimizes admin order filtering by status
  @@index([createdAt])     // Optimizes order sorting by date
  @@map("orders")
}

model OrderItem {
  id        String @id @default(cuid())
  order     Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId   String
  productId String // Snapshot of product ID (not FK - order preserves data even if product deleted)
  name      String // Snapshot of product name at purchase time
  price     Float  // Snapshot of price at purchase time
  quantity  Int

  @@index([orderId])       // Optimizes order item lookups
  @@map("order_items")
}

model AdminUser {
  id       String @id @default(cuid())
  username String @unique
  password String // bcrypt hashed with 10 salt rounds

  @@map("admin_users")
}
```

**Key Schema Decisions**:
- **Images as JSON String**: SQLite doesn't support array types natively. Images stored as JSON string (e.g., `"[]"` or `"[\"url1\",\"url2\"]"`) and parsed to arrays in API layer. For PostgreSQL migration, change to `String[]`.
- **Float vs Decimal**: SQLite limitation - using Float for prices. May cause precision issues with large sums (acceptable for MVP). PostgreSQL should use `Decimal @db.Decimal(10,2)`.
- **Cascade Deletes**: Category deletion cascades to products. Order deletion cascades to OrderItems. Product deletion does NOT cascade to OrderItems (orders preserve snapshot).
- **OrderItem Snapshots**: productId, name, price stored as snapshots at purchase time. If product is later deleted/updated, order history remains intact.
- **Indexes**: Strategic indexes on frequently queried fields (categoryId, published, slug, status, createdAt, orderId) to optimize common queries.

**Inventory Transaction Rules** (Implemented in [checkout.ts](apps/backend/pages/api/checkout.ts)):
1. **Start Transaction**: `await prisma.$transaction(async (tx) => { ... })`
2. **Fetch Products**: `tx.product.findMany({ where: { id: { in: productIds }, published: true } })`
3. **Validate Existence**: Verify all requested products exist and are published
4. **Check Inventory**: For each item, verify `product.inventory >= item.quantity`. If ANY insufficient, throw error (triggers rollback)
5. **Create Order**: `tx.order.create({ data: { ...buyer, total, items: { create: orderItems } } })`
6. **Decrement Inventory**: `tx.product.update({ where: { id }, data: { inventory: { decrement: quantity } } })` for each item
7. **Commit**: All operations succeed atomically, or all rollback on any error

**Race Condition Prevention**: Prisma transactions use database-level isolation. Two concurrent checkouts for the same product:
- Transaction 1 reads inventory: 5
- Transaction 2 reads inventory: 5
- Transaction 1 attempts to buy 5, decrements to 0, commits
- Transaction 2 attempts to buy 5, sees inventory now 0, throws insufficient inventory error
- Result: No overselling, second customer gets clear error message

**Seed Data** ([prisma/seed.ts](prisma/seed.ts)):
- 1 admin user: `username: "admin", password: "admin123"` (bcrypt hashed)
- 3 categories: Áo (ao), Quần (quan), Phụ kiện (phu-kien)
- 10 products with Vietnamese names, realistic prices (150k-800k VND), inventory 5-20 units
- All seed products are published by default

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

8) Testing Strategy & Acceptance Criteria

**Unit Tests** (Vitest 1.0.4):

**Frontend Tests**:
- ✅ **Cart Store** ([apps/frontend/tests/cart.test.ts](apps/frontend/tests/cart.test.ts)): 
  - Add item to empty cart
  - Add duplicate item (quantity merges)
  - Update quantity (respects inventory max)
  - Remove item
  - Clear cart
  - Calculate totals (items count, subtotal)
  - Enforce inventory limits (cannot exceed product.inventory)
  - Auto-remove items when quantity set to 0
- ⚠️ **Component Tests** ([apps/frontend/tests/components/ProductCard.test.tsx](apps/frontend/tests/components/ProductCard.test.tsx)): Basic structure exists, needs expansion

**Backend Tests** (files exist in apps/backend/tests/, implementation incomplete):
- 🟡 **API Tests** (admin.test.ts, auth.test.ts, checkout.test.ts, products.test.ts): 
  - Stubs present but most tests not implemented
  - Test helpers exist in `tests/helpers/testHelpers.ts` for mock database setup
- ❌ **Category API Tests** (categories.test.ts): Should test:
  - GET /api/admin/categories returns all categories with product counts
  - POST /api/admin/categories creates new category
  - POST returns 400 for duplicate slug
  - POST validates slug format (lowercase, hyphens only)
  - PUT /api/admin/categories/:id updates category
  - PUT returns 404 for non-existent category
  - PUT prevents duplicate slug conflicts
  - DELETE prevents deletion when products exist
  - DELETE succeeds when category has no products
  - All admin endpoints return 401 without valid token
- ❌ **Checkout Transaction Tests**: Critical - should test:
  - Happy path: successful order creation and inventory decrement
  - Insufficient inventory: transaction rollback
  - Product not found: error handling
  - Concurrent checkouts: race condition prevention
  - Simulated failure: `simulateFail` flag
- ❌ **Auth Middleware Tests**: Should verify JWT validation, token expiration (when implemented), unauthorized access

**Integration Tests**:
- ❌ **Full API Flow**: Not implemented. Should test:
  - Browse products → Add to cart (client-side) → Checkout API → Verify order in DB → Verify inventory decremented
  - Admin login → Create product → Verify visible in public API

**E2E Tests** (Playwright 1.40.1):
- ✅ **User Flow** ([e2e/user-flow.spec.ts](e2e/user-flow.spec.ts)):
  - Homepage loads with categories and products
  - Navigate to category page
  - View product detail
  - Add product to cart (updates cart badge)
  - View cart page with correct item
  - Proceed to checkout
  - Fill checkout form (validation tested)
  - Submit order (success case)
  - View order confirmation page
- ✅ **Admin Flow** ([e2e/admin-flow.spec.ts](e2e/admin-flow.spec.ts)):
  - Admin login with credentials
  - Navigate to admin dashboard
  - View products list
  - Create new product (form submission)
  - Edit existing product
  - Verify changes reflected in admin list
- ❌ **Admin Category Management Flow**: Should test:
  - Navigate to /admin/categories
  - View categories list with product counts
  - Create new category with name and slug
  - Verify slug format validation (rejects spaces, uppercase)
  - Edit category name and slug
  - Attempt to delete category with products (should show error)
  - Delete empty category (should succeed)
  - Verify changes reflected in product category dropdown

**Test Configuration**:
- **Vitest Config**: `apps/*/vitest.config.ts` - uses jsdom environment for React components
- **Playwright Config**: `playwright.config.ts` - uses Chromium/Firefox/WebKit, baseURL configurable
- **Test Scripts**: `yarn test` (unit), `yarn test:e2e` (E2E), `yarn test:e2e:ui` (Playwright UI mode)

**Acceptance Criteria** (MVP):

**Public Store**:
- ✅ Visitors can view homepage with categories and featured products
- ✅ Visitors can browse products by category with pagination
- ✅ Visitors can view product detail page for published products only
- ✅ Visitors can add products to cart with quantity selector
- ✅ Cart respects inventory limits (cannot add more than available stock)
- ✅ Cart persists across page refreshes (localStorage)
- ✅ Visitors can update cart quantities and remove items
- ✅ Checkout form validates buyer name (required), email (format), address (min 10 chars)
- ✅ Checkout verifies inventory availability before order creation
- ✅ Checkout decrements inventory atomically (no race conditions)
- ✅ Checkout returns order ID and redirects to confirmation page
- ✅ Order confirmation page displays buyer info, items, total, status
- ✅ Unpublished products are hidden from public APIs

**Admin Panel**:
- ✅ Admin can login with username/password
- ✅ Admin sees dashboard with summary metrics
- ✅ Admin can view all products (including unpublished)
- ✅ Admin can create new products with category, price, inventory, published flag
- ✅ Admin can edit existing products (all fields updatable)
- ✅ Admin can delete products
- ✅ Admin can view all orders with status filter
- ✅ Admin can view order details
- ⚠️ Admin cannot update order status (UI not implemented, API ready)
- ✅ Published flag changes immediately affect public store visibility
- ❌ **Admin can view all categories with product counts** (not implemented)
- ❌ **Admin can create new category with name and slug** (not implemented)
- ❌ **System prevents duplicate slugs during category create/update** (not implemented)
- ❌ **Admin can edit category name and slug** (not implemented)
- ❌ **Admin can delete categories without products** (not implemented)
- ❌ **System prevents deletion of categories with products** (not implemented)
- ❌ **Clear error message when trying to delete category in use** (not implemented)
- ❌ **Form validates slug format (lowercase, hyphens only, no spaces)** (not implemented)
- ❌ **Category changes immediately reflect in product forms** (not implemented)

**Error Handling**:
- ✅ Checkout fails gracefully when inventory insufficient (clear error message)
- ✅ Checkout fails when product not found or unpublished
- ✅ API returns 404 for invalid product slugs
- ✅ API returns 401 for unauthorized admin access
- ✅ Form validation errors displayed to user (basic implementation)
- ⚠️ Generic error messages for unhandled exceptions (needs improvement)

**Security**:
- ✅ Admin passwords hashed with bcrypt (10 salt rounds)
- ✅ JWT tokens required for admin endpoints
- ✅ CORS configured to allow frontend origin
- ⚠️ JWT tokens have no expiration (infinite lifetime - acceptable for MVP)
- ⚠️ No rate limiting on public endpoints (potential abuse vector)
- ⚠️ Default JWT_SECRET if not configured (insecure for production)

**Testing Gaps** (Technical Debt):
1. ❌ Backend API unit tests incomplete (critical for checkout logic)
2. ❌ No integration tests for full user flow with database
3. ❌ No load testing for concurrent checkout race conditions
4. ❌ No accessibility testing (WCAG compliance unknown)
5. ❌ No mobile/responsive testing in E2E suite
6. ❌ No error boundary tests (unhandled exception UI)
7. ❌ No JWT token validation edge cases (malformed, expired when implemented)

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

## Current Implementation (workspace snapshot)

Note: summary of what is already implemented in this repository (helps keep the spec aligned with code).

- Backend implemented endpoints:
  - `GET /api/categories` — returns [{ id, name, slug }] (see [apps/backend/pages/api/categories.ts](apps/backend/pages/api/categories.ts#L1)).
  - `GET /api/products` — supports `?category=&search=&page=&limit=`; returns `{ data, total, page, limit, totalPages }` and only published products (see [apps/backend/pages/api/products/index.ts](apps/backend/pages/api/products/index.ts#L1)).
  - `GET /api/products/:slug` — returns product detail including `category` and parsed `images` array (see [apps/backend/pages/api/products/[slug].ts](apps/backend/pages/api/products/[slug].ts#L1)).
  - `POST /api/checkout` — transactional checkout validating `buyerName`, `buyerEmail`, `address`, `items[]`; decrements inventory and creates `Order`/`OrderItem`; supports `simulateFail` boolean for testing (see [apps/backend/pages/api/checkout.ts](apps/backend/pages/api/checkout.ts#L1)).
  - `POST /api/admin/login` — admin auth returning JWT token and admin info (see [apps/backend/pages/api/admin/login.ts](apps/backend/pages/api/admin/login.ts#L1)).

- Backend implementation notes:
  - `lib/prisma.ts` exports a Prisma client singleton (see [apps/backend/lib/prisma.ts](apps/backend/lib/prisma.ts#L1)).
  - CORS helper `withCors` wraps API handlers and allows OPTIONS handling (see [apps/backend/lib/cors.ts](apps/backend/lib/cors.ts#L1)).
  - Products' `images` field is stored as a JSON string in the DB and is parsed to an array before returning to clients.

- Frontend implemented pages/components:
  - Home: `/` — uses `api.getCategories()` and `api.getProducts()` (see [apps/frontend/pages/index.tsx](apps/frontend/pages/index.tsx#L1)).
  - Product detail: `/products/[slug]` — fetches `/api/products/:slug` and supports images, quantity selector, add-to-cart (see [apps/frontend/pages/products/[slug].tsx](apps/frontend/pages/products/[slug].tsx#L1)).
  - Cart: `/cart` — uses `store/cartStore.ts` (Zustand) with localStorage persistence (see [apps/frontend/store/cartStore.ts](apps/frontend/store/cartStore.ts#L1) and [apps/frontend/pages/cart.tsx](apps/frontend/pages/cart.tsx#L1)).
  - Checkout page exists at `/checkout` (see [apps/frontend/pages/checkout.tsx](apps/frontend/pages/checkout.tsx#L1)).

These notes are intended to keep the spec synchronized with the codebase; use them when updating tasks or writing new tests.


10) Development Workflow & Scripts

**Package Manager**: Yarn 1.22.19 (enforced via `"packageManager": "yarn@1.22.19"` in root package.json). Yarn workspaces automatically discover apps in `apps/*`.

**Node Version**: Node.js 20+ required. Enforced via `.nvmrc` files at:
- Root: `/` (version 20)
- Frontend: `apps/frontend/` (version 20) 
- Backend: `apps/backend/` (version 20)

Run `nvm use` in any directory to switch to the correct Node version.

**Root `package.json` Scripts** ([package.json](package.json)):

```json
{
  "scripts": {
    "dev": "concurrently \"yarn dev:backend\" \"yarn dev:frontend\"",
    "dev:backend": "cd apps/backend && yarn dev",
    "dev:frontend": "cd apps/frontend && yarn dev",
    "build": "yarn build:backend && yarn build:frontend",
    "build:backend": "cd apps/backend && yarn build",
    "build:frontend": "cd apps/frontend && yarn build",
    "start:backend": "cd apps/backend && yarn start",
    "start:frontend": "cd apps/frontend && yarn start",
    "test": "yarn test --workspaces",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "lint": "eslint \"**/*.{ts,tsx,js,jsx}\" --max-warnings=0",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "prisma:generate": "cd apps/backend && yarn prisma:generate",
    "prisma:migrate": "cd apps/backend && yarn prisma:migrate",
    "prisma:studio": "cd apps/backend && yarn prisma:studio",
    "seed": "cd apps/backend && npx ts-node ../../prisma/seed.ts"
  }
}
```

**Frontend Scripts** (apps/frontend/package.json):
```json
{
  "scripts": {
    "dev": "next dev",                    // Port 3000
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\" --plugin=prettier-plugin-tailwindcss"
  }
}
```

**Backend Scripts** (apps/backend/package.json):
```json
{
  "scripts": {
    "dev": "next dev -p 3001",            // Port 3001 to avoid conflict
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint",
    "test": "vitest",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"      // Opens GUI at localhost:5555
  }
}
```

**Initial Setup Workflow**:

```bash
# 1. Switch to Node 20 (reads .nvmrc)
nvm use

# 2. Install all dependencies (workspace-aware)
yarn install

# 3. Configure environment variables
# Create apps/backend/.env:
echo 'DATABASE_URL="file:../../dev.db"' > apps/backend/.env
echo 'JWT_SECRET="your-secret-key-change-in-production"' >> apps/backend/.env

# Create apps/frontend/.env.local:
echo 'NEXT_PUBLIC_API_URL="http://localhost:3001"' > apps/frontend/.env.local

# 4. Generate Prisma Client
yarn prisma:generate

# 5. Run database migrations
yarn prisma:migrate

# 6. Seed sample data (admin user + products)
yarn seed

# 7. Start development servers (Frontend:3000 + Backend:3001)
yarn dev
```

**Daily Development Commands**:

```bash
# Start both servers (recommended)
yarn dev

# Or start individually:
yarn dev:frontend  # Port 3000
yarn dev:backend   # Port 3001

# Run tests
yarn test          # All unit tests (Vitest)
yarn test:e2e      # Playwright E2E tests
yarn test:e2e:ui   # Playwright UI mode (debugging)

# Code quality
yarn format        # Auto-fix with Prettier
yarn format:check  # Check formatting without fixing
yarn lint          # ESLint check

# Database operations
yarn prisma:studio # Visual DB browser (localhost:5555)
yarn prisma:generate # Regenerate Prisma Client after schema changes
cd apps/backend && npx prisma migrate dev --name <migration-name>  # Create new migration
yarn seed          # Re-seed database (wipes existing data)
```

**Environment Variables**:

**Backend** (apps/backend/.env):
```env
DATABASE_URL="file:../../dev.db"          # SQLite for dev, postgres:// for prod
JWT_SECRET="your-secret-key-change-in-production"  # CRITICAL: Change in production
NODE_ENV="development"                     # Optional, auto-detected by Next.js
```

**Frontend** (apps/frontend/.env.local):
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"  # Backend URL, change for production
```

**Configuration Files**:
- **TypeScript**: `tsconfig.json` in root and per-app. Backend uses `@/` path alias for `apps/backend/`.
- **ESLint**: Config embedded in each package.json, extends Next.js rules
- **Prettier**: `.prettierrc` in root and per-app. Frontend includes Tailwind plugin for class sorting.
- **Tailwind**: `tailwind.config.js` in frontend only, uses `content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"]`
- **Prisma**: `prisma/schema.prisma` at repository root (shared)
- **Playwright**: `playwright.config.ts` at root, tests in `e2e/`
- **Vitest**: `vitest.config.ts` per app, tests in `apps/*/tests/`

**Build & Production**:

```bash
# Build both apps
yarn build

# Or individually:
yarn build:backend
yarn build:frontend

# Start production servers
yarn start:backend   # Port 3001
yarn start:frontend  # Port 3000

# For production deployment, see DEPLOYMENT.md
```

**Troubleshooting Common Issues**:

1. **"Prisma Client not found"**: Run `yarn prisma:generate`
2. **Port 3000/3001 already in use**: Kill existing processes with `lsof -ti:3000 | xargs kill` (macOS/Linux)
3. **Module resolution errors**: Delete `node_modules` and `.next` folders, run `yarn install` again
4. **Database locked (SQLite)**: Close Prisma Studio or other DB connections
5. **Workspace dependency issues**: Run `yarn install --force` to rebuild symlinks
6. **CI/CD uses npm**: `.github/workflows/ci.yml` currently has `npm ci` commands - should be changed to `yarn install --frozen-lockfile` (known issue)

---

11) Performance & Scaling Considerations

**Database Query Optimization**:

**Indexes** (implemented in schema.prisma):
- `Product.categoryId` — Accelerates category filtering (most common query pattern)
- `Product.published` — Separates published/unpublished products for public API
- `Product.slug` — Unique index for fast slug lookups (primary access pattern)
- `Order.status` — Enables fast admin filtering by order status
- `Order.createdAt` — Optimizes order sorting by date (recent orders first)
- `OrderItem.orderId` — Speeds up order item fetching

**Query Patterns**:
- **N+1 Prevention**: All product listings include `{ include: { category: true } }` to avoid separate category fetches
- **Pagination**: All list endpoints use `skip` and `take` for efficient pagination instead of fetching all records
- **Filtered Queries**: Published filter applied at database level (`WHERE published = true`) rather than filtering in application code
- **Transaction Isolation**: Checkout uses Prisma transactions to ensure consistent inventory reads/writes

**Caching Strategy**:

**Frontend (SWR)**:
- **Default TTL**: SWR uses stale-while-revalidate with revalidation on focus/reconnect
- **Product Listings**: Cached with short TTL (~30s), revalidated on page visibility change
- **Product Detail**: Cached until navigation away, revalidated on return
- **Categories**: Long cache (categories rarely change), revalidated only on mount
- **No Cache**: Admin mutations (create/update/delete) trigger immediate revalidation via `mutate()`
- **Gap**: No cache invalidation across tabs/windows (user may see stale data after updates)

**Backend**:
- **No Response Caching**: All API responses computed fresh (suitable for MVP)
- **Future Optimization**: Could add Redis for:
  - Category list (high read, low write)
  - Published product listings (invalidate on admin updates)
  - Product detail pages (most accessed)

**Frontend State Persistence**:
- **Cart**: Zustand persist middleware syncs to localStorage on every state change, restores on page load
- **Auth Token**: Stored in localStorage (key: `admin-token` or similar, implementation varies)
- **Limitation**: LocalStorage is synchronous and blocks UI on large data - cart limited to ~100 items max recommended

**Race Condition Handling**:

**Inventory Management** (critical for checkout):
- **Problem**: Two users checkout same product simultaneously with low stock
- **Solution**: Prisma `$transaction` with database-level locks
- **Example**: Product has 1 unit, User A and B both try to buy 1:
  1. Both transactions start
  2. Transaction A reads inventory: 1
  3. Transaction B reads inventory: 1 (but transaction A hasn't committed yet)
  4. Transaction A decrements inventory to 0, commits
  5. Transaction B attempts decrement, detects inventory now insufficient, rolls back
  6. User B receives "Insufficient inventory" error
- **Result**: No overselling, clear error feedback

**Limitations**:
- **SQLite Concurrency**: Supports only one write transaction at a time - multiple concurrent checkouts serialize automatically (acceptable for MVP)
- **PostgreSQL**: Better concurrency with MVCC (Multi-Version Concurrency Control)

**Scalability Bottlenecks & Recommendations**:

**Current MVP Limitations**:
1. **No CDN**: Images served from Next.js public folder (slow for users far from server)
   - **Fix**: Upload images to Cloudinary/S3, serve via CDN
2. **No Image Optimization**: Full-size images loaded regardless of display size
   - **Fix**: Use Next.js `<Image>` component with automatic optimization
3. **No API Rate Limiting**: Public endpoints vulnerable to abuse
   - **Fix**: Add `express-rate-limit` or use Vercel Edge Config rate limiting
4. **Unbounded Pagination**: Frontend allows page=999999 (expensive query)
   - **Fix**: Add max page limit (e.g., 100 pages) or cursor-based pagination
5. **Full Table Scans**: Search uses case-insensitive `contains` (no full-text index)
   - **Fix**: PostgreSQL full-text search with GIN index on name/description
6. **Synchronous Checkout**: Checkout blocks until all DB operations complete
   - **Fix**: Move to background job queue (BullMQ/Celery) for order processing
7. **No Monitoring**: No visibility into slow queries, error rates, or user behavior
   - **Fix**: Add Sentry (errors), Vercel Analytics (web vitals), Prisma APM (queries)

**Scaling Plan** (beyond MVP):
- **< 1000 users**: Current architecture sufficient, optimize queries, add CDN
- **1000-10000 users**: Add Redis caching, move to PostgreSQL, optimize images
- **10000+ users**: Separate read replicas for product listings, queue-based checkout, microservices for high-traffic endpoints

**Load Testing Recommendations**:
- **Checkout Flow**: Simulate 100 concurrent checkouts for same product, verify no overselling
- **Product Listings**: Load test with 10k products, ensure pagination response < 200ms
- **Admin Operations**: Test bulk product updates don't block public API

---

12) What I can generate next (automation)

- `prisma/schema.prisma` and `prisma/seed.ts` script
- OpenAPI (YAML) for API endpoints
- Starter Next.js pages and API route files per the structure above
- CI updates to run migrations and seed test DB in workflow

Tell me which of the above artifacts you'd like me to generate now and I will add them to the repo (I can start with `prisma/schema.prisma` + seeds).
