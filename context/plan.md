# Mini Storefront — Planning & Roadmap

Dựa trên đặc tả trong `specs.md`, document này phân tích, lên kế hoạch triển khai, chia sprint, backlog và checklist cho dự án Mini Storefront (FE + BE).

---

## 1. Tổng quan dự án

**Tên dự án:** Mini Storefront — Bán hàng tối giản

**Mục tiêu:** Xây dựng cửa hàng online tối giản với các tính năng: danh mục sản phẩm, giỏ hàng, thanh toán giả lập, và quản trị admin (quản lý kho, giá, publish/unpublish).

**Phạm vi MVP:**
- Guest/Buyer: xem danh mục, sản phẩm, thêm vào giỏ, checkout giả lập
- Admin: đăng nhập, quản lý sản phẩm/danh mục, tồn kho, giá, trạng thái publish

**Công nghệ:**
- FE: Next.js + TypeScript + Tailwind CSS
- BE: Next.js API routes + TypeScript + Prisma
- DB: PostgreSQL
- Deploy: Vercel + Docker optional

**Team size:** 2-4 developers (có thể chia FE/BE hoặc overlap)

---

## 2. Roadmap tổng thể — 5 Sprint (2 tuần/sprint)

## Current Implementation (snapshot)

This project already implements many core features — updating the plan to match the codebase.

- Backend (implemented):
  - `GET /api/categories` — implemented ([apps/backend/pages/api/categories.ts](apps/backend/pages/api/categories.ts#L1)).
  - `GET /api/products` — implemented with `category`, `search`, `page`, `limit` support; returns parsed `images` arrays in responses ([apps/backend/pages/api/products/index.ts](apps/backend/pages/api/products/index.ts#L1)).
  - `GET /api/products/:slug` — implemented; returns product + `category`, parses `images` ([apps/backend/pages/api/products/[slug].ts](apps/backend/pages/api/products/[slug].ts#L1)).
  - `POST /api/checkout` — implemented with Zod validation and Prisma transaction; supports `simulateFail` ([apps/backend/pages/api/checkout.ts](apps/backend/pages/api/checkout.ts#L1)).
  - `GET /api/orders/:id` — implemented and enriches items with product slug/images ([apps/backend/pages/api/orders/[id].ts](apps/backend/pages/api/orders/[id].ts#L1)).
  - Admin endpoints: `POST /api/admin/login` and admin product CRUD under `/api/admin/products` implemented; admin routes protected with `requireAdmin` helper in `apps/backend/lib/auth.ts`.
  - `lib/prisma.ts` exports a singleton Prisma client; `lib/cors.ts` and `lib/auth.ts` exist for CORS and auth.

- Frontend (implemented):
  - Home page `/` fetches categories and products ([apps/frontend/pages/index.tsx](apps/frontend/pages/index.tsx#L1)).
  - Product detail `/products/[slug]` implemented ([apps/frontend/pages/products/[slug].tsx](apps/frontend/pages/products/[slug].tsx#L1)).
  - Cart page `/cart` and Zustand store `apps/frontend/store/cartStore.ts` with localStorage persistence implemented ([apps/frontend/pages/cart.tsx](apps/frontend/pages/cart.tsx#L1)).
  - Checkout page `/checkout` and Order confirmation page `/order/[id]` implemented and wired to backend endpoints.

Notes:
- Product `images` are stored as JSON strings in the DB and parsed to arrays in API responses.
- Admin auth exists (`/api/admin/login`) and admin routes use `requireAdmin` middleware (JWT) defined in `apps/backend/lib/auth.ts`.

## Updated Sprint Status (align with code)

- Sprint 1: Foundation — **Done** (DB client, categories/products endpoints, frontend home)
- Sprint 2: Cart & Product Detail — **Done** (product pages, cart store, cart page)
- Sprint 3: Checkout & Order Flow — **Mostly Done**
  - Backend `POST /api/checkout` and `GET /api/orders/:id` implemented ✅
  - Frontend `checkout` and `order` pages implemented ✅
  - Remaining: add more integration tests and edge-case tests (concurrent checkout race conditions)
- Sprint 4: Admin Panel & Auth — **Partially Done**
  - Backend admin APIs (products CRUD, protected) implemented ✅
  - Frontend admin pages exist under `apps/frontend/pages/admin` (some pages implemented) — remaining work: finish admin UI flows, token storage, protected-route HOC, and polish UX.
- Sprint 5: Testing, Polish & Deploy — **In progress**
  - Many tests not yet added or incomplete. CI / Docker needs verification.

## Minimal plan updates / next actions (recommended)

1. Update `context/tasks.md` to mark implemented tasks as completed (many were updated already).
2. Add/expand tests:
   - Backend unit tests for products and checkout (including `simulateFail` and insufficient-inventory cases).
   - Integration test for concurrent checkouts (race condition).
   - Frontend tests for `store/cartStore.ts` and components (`ProductCard`, `Cart`).
3. Finish admin UI: implement token storage (localStorage/cookie), protected-route HOC, and admin product/category pages flows.
4. CI & Deploy: verify GitHub Actions workflow, Docker compose, and run `pnpm`/`npm` scripts to ensure dev environment matches plan.
5. Docs: add `Implementation status` block to `README.md` and keep `context/specs.md` / `context/tasks.md` synchronized.
### Sprint 1: Foundation & Data Setup (2 tuần)
**Mục tiêu:** Thiết lập cơ sở hạ tầng, DB schema, seed data, backend CRUD cơ bản, FE layout cơ bản.

**Deliverables:**
- Repository setup: monorepo structure, Docker, CI/CD config
- Prisma schema + migrations cho Category, Product, Order, OrderItem, AdminUser
- Seed data: 2-3 categories, 5-10 products, 1 admin user
- Backend API: GET /api/categories, GET /api/products, GET /api/products/:slug
- Frontend: Layout, Home page, Product listing page (fetch từ API)

**Acceptance Criteria:**
- ✅ DB migrations chạy thành công local và CI
- ✅ Seed script tạo được dữ liệu mẫu
- ✅ Frontend hiển thị được danh sách sản phẩm từ backend API
- ✅ Docker compose up thành công với FE, BE, DB

---

### Sprint 2: Cart & Product Detail (2 tuần)
**Mục tiêu:** Hoàn thiện trang chi tiết sản phẩm, thêm vào giỏ hàng, quản lý giỏ hàng client-side.

**Deliverables:**
- FE: Product detail page với images, description, add-to-cart button
- FE: Cart page (display items, adjust quantity, remove items, subtotal)
- Client-side cart state: localStorage hoặc React Context/Zustand
- FE: Category filter page `/category/[slug]`
- Backend: GET /api/categories/:slug/products

**Acceptance Criteria:**
- ✅ Người dùng xem được chi tiết sản phẩm đầy đủ (tên, giá, mô tả, ảnh, tồn kho)
- ✅ Thêm sản phẩm vào giỏ, điều chỉnh số lượng, xóa item
- ✅ Cart state persist qua refresh (localStorage)
- ✅ Filter sản phẩm theo category

---

### Sprint 3: Checkout & Order Flow (2 tuần)
**Mục tiêu:** Triển khai luồng checkout giả lập, tạo order, kiểm tra tồn kho, giảm inventory transactional.

**Deliverables:**
- FE: Checkout page (form buyer info: name, email, address)
- FE: Order confirmation page `/order/[id]`
- Backend: POST /api/checkout (validate stock, create order, decrement inventory in transaction)
- Backend: GET /api/orders/:id
- Error handling: out-of-stock, validation errors

**Acceptance Criteria:**
- ✅ Checkout thành công → tạo order, inventory giảm đúng
- ✅ Checkout thất bại khi sản phẩm hết hàng → rollback transaction, hiển thị lỗi
- ✅ Order confirmation hiển thị đầy đủ thông tin (id, items, total, buyer)
- ✅ Integration test cho checkout flow

---

### Sprint 4: Admin Panel & Auth (2 tuần)
**Mục tiêu:** Xây dựng admin panel, authentication JWT, quản lý sản phẩm/danh mục/orders.

**Deliverables:**
- Backend: POST /api/admin/login (JWT auth)
- Backend middleware: protect admin routes
- FE: Admin login page `/admin/login`
- FE: Admin dashboard `/admin` (summary: total products, low stock, recent orders)
- FE: Admin products list `/admin/products` (CRUD operations)
- FE: Admin product edit page `/admin/products/[id]/edit`
- **FE: Admin categories management `/admin/categories` (inline create/edit, delete with protection)**
- Backend: GET/POST/PUT/DELETE /api/admin/products
- **Backend: GET /api/admin/categories (with product counts)**
- **Backend: POST /api/admin/categories (with slug validation)**
- **Backend: PUT /api/admin/categories/:id (prevent duplicate slugs)**
- **Backend: DELETE /api/admin/categories/:id (prevent if products exist)**
- Backend: GET /api/admin/orders

**Acceptance Criteria:**
- ✅ Admin đăng nhập thành công với JWT token
- ✅ Admin tạo/sửa/xóa sản phẩm
- ✅ Admin publish/unpublish product → public store chỉ hiển thị published products
- ✅ Admin điều chỉnh inventory và giá
- ✅ Admin xem danh sách orders
- ✅ Protected routes: không có token → redirect login
- ❌ **Admin xem tất cả categories với product count**
- ❌ **Admin tạo mới category với name và slug validation**
- ❌ **Admin sửa category (name/slug) với duplicate check**
- ❌ **Admin xóa category (chỉ khi không có products)**
- ❌ **System ngăn xóa category đang có products với error message rõ ràng**
- ❌ **Slug format validation (lowercase, hyphens only, no spaces)**

---

### Sprint 5: Testing, Polish & Deploy (2 tuần)
**Mục tiêu:** Hoàn thiện tests, UI/UX polish, CI/CD, deploy production.

**Deliverables:**
- Unit tests: backend (product queries, checkout logic, auth middleware)
- Unit tests: frontend (ProductCard, Cart logic, form validation)
- Integration tests: checkout E2E với test DB
- E2E tests (optional): Playwright/Cypress cho user flow
- UI polish: responsive design, loading states, error messages
- Deploy: Vercel production (FE + BE), managed Postgres
- Documentation: README, DEPLOYMENT.md updates
- Security review: env secrets, input validation, bcrypt passwords

**Acceptance Criteria:**
- ✅ Test coverage ≥70% cho critical paths
- ✅ CI pipeline pass: lint, typecheck, tests, build
- ✅ Production deploy thành công trên Vercel
- ✅ Smoke test production: browse → add to cart → checkout → admin login
- ✅ No security issues (secrets, SQL injection, XSS)

---

## 3. Backlog theo tính năng (Feature Backlog)

### 3.1 Database & Backend Foundation
- [ ] **DB-01:** Tạo Prisma schema (Category, Product, Order, OrderItem, AdminUser)
- [ ] **DB-02:** Viết migration scripts
- [ ] **DB-03:** Viết seed script với dữ liệu mẫu
- [ ] **BE-01:** Setup Next.js backend project structure
- [ ] **BE-02:** Cấu hình Prisma client
- [ ] **BE-03:** API GET /api/categories
- [ ] **BE-04:** API GET /api/products (với query params: category, search, page, limit)
- [ ] **BE-05:** API GET /api/products/:slug

**Dependencies:** DB schema phải xong trước khi làm API endpoints.

---

### 3.2 Frontend Foundation
- [ ] **FE-01:** Setup Next.js frontend project (tsconfig, tailwind, eslint)
- [ ] **FE-02:** Tạo layout component (Header, Footer, Navigation)
- [ ] **FE-03:** Trang Home `/` (featured categories, featured products)
- [ ] **FE-04:** Component ProductCard (reusable)
- [ ] **FE-05:** Component ProductList
- [ ] **FE-06:** Trang Product listing `/category/[slug]`
- [ ] **FE-07:** API client/hooks (useSWR hoặc React Query)

**Dependencies:** Backend API /categories và /products phải sẵn sàng.

---

### 3.3 Product Detail & Cart
- [ ] **FE-08:** Trang Product detail `/product/[slug]`
- [ ] **FE-09:** Add-to-cart logic (client state)
- [ ] **FE-10:** Component CartItem, CartSummary
- [ ] **FE-11:** Trang Cart `/cart`
- [ ] **FE-12:** Cart state management (Context/Zustand/localStorage)
- [ ] **FE-13:** Adjust quantity, remove item trong cart

**Dependencies:** Product detail cần API GET /api/products/:slug hoàn tất.

---

### 3.4 Checkout & Order
- [ ] **BE-06:** API POST /api/checkout (transactional)
- [ ] **BE-07:** API GET /api/orders/:id
- [ ] **FE-14:** Trang Checkout `/checkout` (form buyer info)
- [ ] **FE-15:** Order confirmation page `/order/[id]`
- [ ] **FE-16:** Error handling (out-of-stock, validation)
- [ ] **BE-08:** Inventory decrement logic trong transaction
- [ ] **BE-09:** Rollback nếu thiếu hàng

**Dependencies:** Product model với inventory field; transaction support trong Prisma.

---

### 3.5 Admin Panel & Auth
- [ ] **BE-10:** API POST /api/admin/login (JWT)
- [ ] **BE-11:** Middleware verify JWT cho admin routes
- [ ] **BE-12:** API GET /api/admin/products
- [ ] **BE-13:** API POST /api/admin/products
- [ ] **BE-14:** API PUT /api/admin/products/:id
- [ ] **BE-15:** API DELETE /api/admin/products/:id
- [ ] **BE-16:** API GET /api/admin/categories (with product count via Prisma _count)
- [ ] **BE-16a:** API POST /api/admin/categories (Zod validation: name, slug format, uniqueness check)
- [ ] **BE-16b:** API PUT /api/admin/categories/:id (partial update, prevent duplicate slugs)
- [ ] **BE-16c:** API DELETE /api/admin/categories/:id (check product count, prevent if > 0)
- [ ] **BE-17:** API GET /api/admin/orders
- [ ] **FE-17:** Admin login page `/admin/login`
- [ ] **FE-18:** Admin dashboard `/admin`
- [ ] **FE-19:** Admin products list `/admin/products`
- [ ] **FE-20:** Admin product create/edit form
- [ ] **FE-21:** Admin categories management `/admin/categories`
  - [ ] **FE-21a:** Table list với name, slug, product count, actions (edit, delete)
  - [ ] **FE-21b:** Inline create form ở top (name + slug inputs)
  - [ ] **FE-21c:** Inline edit mode cho từng category row
  - [ ] **FE-21d:** Delete button với confirmation dialog
  - [ ] **FE-21e:** Prevent delete nếu category có products (show alert với product count)
  - [ ] **FE-21f:** Client-side slug format validation (lowercase, hyphens only)
  - [ ] **FE-21g:** SWR integration với optimistic updates via mutate()
- [ ] **FE-22:** Admin orders list
- [ ] **FE-23:** Protected route HOC/middleware cho admin pages

**Dependencies:** JWT lib (jsonwebtoken), bcrypt cho hash password.

---

### 3.6 Tests & Quality Assurance
- [ ] **TEST-01:** Unit test backend: product queries
- [ ] **TEST-02:** Unit test backend: checkout happy path
- [ ] **TEST-03:** Unit test backend: checkout out-of-stock
- [ ] **TEST-04:** Unit test backend: admin auth middleware
- [ ] **TEST-04a:** Unit test backend: category API GET (returns product counts)
- [ ] **TEST-04b:** Unit test backend: category API POST (validates slug format, checks duplicates)
- [ ] **TEST-04c:** Unit test backend: category API PUT (prevents duplicate slug conflicts)
- [ ] **TEST-04d:** Unit test backend: category API DELETE (prevents deletion when products exist)
- [ ] **TEST-04e:** Unit test backend: category endpoints return 401 without token
- [ ] **TEST-05:** Unit test frontend: ProductCard component
- [ ] **TEST-06:** Unit test frontend: Cart logic
- [ ] **TEST-06a:** Unit test frontend: Admin categories page (render, create, edit, delete flows)
- [ ] **TEST-07:** Integration test: checkout E2E
- [ ] **TEST-08:** E2E test (optional): browse → cart → checkout
- [ ] **TEST-08a:** E2E test: admin category management flow (create → edit → delete protection → delete empty)
- [ ] **TEST-09:** Lint & typecheck pass trên CI
- [ ] **TEST-10:** Security audit (secrets, input validation)

**Dependencies:** Cần test DB riêng, mock data.

---

### 3.7 Deployment & DevOps
- [ ] **DEVOPS-01:** Setup Docker (frontend, backend, db)
- [ ] **DEVOPS-02:** docker-compose.yml cho local dev
- [ ] **DEVOPS-03:** vercel.json config
- [ ] **DEVOPS-04:** GitHub Actions CI (lint, test, build)
- [ ] **DEVOPS-05:** Deploy Vercel production (FE)
- [ ] **DEVOPS-06:** Deploy Vercel production (BE)
- [ ] **DEVOPS-07:** Setup managed Postgres (Vercel Postgres hoặc Railway)
- [ ] **DEVOPS-08:** Env variables setup trên Vercel
- [ ] **DEVOPS-09:** Smoke test production

**Dependencies:** Vercel account, GitHub repo connected.

---

## 4. Phân công vai trò (Team Assignment)

### Nếu team 2 người:
- **Dev A (Fullstack lead, focus BE):**
  - Sprint 1: DB schema, seed, backend API foundation
  - Sprint 2: Backend API cho products/categories
  - Sprint 3: Checkout API, transaction logic
  - Sprint 4: Admin API, JWT auth
  - Sprint 5: Backend tests, security review
  
- **Dev B (Fullstack, focus FE):**
  - Sprint 1: FE setup, layout, home page
  - Sprint 2: Product detail, cart UI
  - Sprint 3: Checkout UI, order confirmation
  - Sprint 4: Admin UI (all pages)
  - Sprint 5: Frontend tests, UI polish

### Nếu team 4 người:
- **Dev 1 (Backend):** DB, API endpoints, auth
- **Dev 2 (Backend):** Checkout logic, tests, deploy
- **Dev 3 (Frontend):** Public store (home, product, cart, checkout)
- **Dev 4 (Frontend):** Admin panel, UI polish, E2E tests

---

## 5. Dependencies & Blockers

### Critical dependencies (phải xong trước):
1. **DB schema + migrations** → tất cả backend API
2. **Backend API /products, /categories** → Frontend product listing
3. **Backend API /checkout** → Frontend checkout page
4. **JWT auth middleware** → Admin panel backend + frontend

### Potential blockers:
- Chờ Vercel account setup → có thể test local/Docker trước
- Chờ managed Postgres provisioning → dùng local Postgres trong lúc đó
- Inventory transaction logic phức tạp → cần review kỹ, test nhiều edge cases

---

## 6. Tiêu chí nghiệm thu (Acceptance Criteria Summary)

### Sprint 1 done khi:
- [ ] `docker compose up` chạy thành công (FE, BE, DB)
- [ ] Seed data hiển thị trên FE home page
- [ ] CI pipeline xanh (lint, typecheck, build)

### Sprint 2 done khi:
- [ ] User thêm sản phẩm vào cart, điều chỉnh số lượng
- [ ] Cart persist qua refresh
- [ ] Filter theo category hoạt động

### Sprint 3 done khi:
- [ ] Checkout thành công → order được tạo, inventory giảm
- [ ] Checkout fail nếu out-of-stock
- [ ] Order confirmation hiển thị đúng

### Sprint 4 done khi:
- [ ] Admin login và access admin panel
- [ ] Admin publish/unpublish product → public store update
- [ ] Admin CRUD products (create, edit, delete)
- [ ] Admin CRUD categories (view with product counts, create with validation, edit, delete with protection)
- [ ] System prevents category deletion when products exist
- [ ] Slug format validation works (rejects uppercase, spaces)
- [ ] Category changes reflect in product category dropdown

### Sprint 5 done khi:
- [ ] Test coverage ≥70%
- [ ] Production deploy thành công
- [ ] Smoke test pass trên production

---

## 7. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Inventory race condition khi nhiều user checkout cùng lúc | High | Dùng DB transaction với row-level lock |
| JWT secret bị leak | High | Dùng env variable, không commit vào git, rotate định kỳ |
| Vercel serverless timeout cho checkout | Medium | Optimize query, dùng connection pooling, cân nhắc dedicated backend |
| Admin không có 2FA | Low | Document risk, có thể thêm 2FA sau MVP |

---

## 8. Estimation & Timeline

**Total:** 5 sprints × 2 tuần = 10 tuần (2.5 tháng)

**Team 2 người:** ~10 tuần (overlap tasks khi có thể)
**Team 4 người:** ~6-8 tuần (parallel work nhiều hơn)

**Buffer:** +2 tuần cho bug fixes, polish, edge cases

**Target launch:** Tuần thứ 12

---

## 9. Checklist tổng hợp (Sprint-independent tasks)

### Setup & Config
- [ ] Init monorepo structure (`apps/frontend`, `apps/backend`, `prisma/`)
- [ ] Setup pnpm workspaces hoặc npm workspaces
- [ ] Config TypeScript (root + per-app)
- [ ] Config ESLint + Prettier
- [ ] Config Tailwind CSS cho frontend
- [ ] Setup Prisma với PostgreSQL
- [ ] Tạo `.env.example` files
- [ ] Add `.gitignore` cho `.env`, `node_modules`, `.next`

### Documentation
- [ ] README.md với hướng dẫn setup local
- [ ] DEPLOYMENT.md (đã có)
- [ ] CONTRIBUTING.md (đã có)
- [ ] API documentation (OpenAPI/Swagger optional)

### CI/CD
- [ ] GitHub Actions workflow cho lint, test, build
- [ ] Docker build trong CI
- [ ] Vercel deployment hooks

---

## 10. Next Actions

**Ngay bây giờ (tuần 1):**
1. Setup repository structure theo `specs.md` section 9
2. Tạo `prisma/schema.prisma` với các model đã define
3. Chạy `prisma migrate dev` để tạo DB
4. Viết seed script và chạy seed
5. Setup frontend + backend packages
6. Implement API GET /api/products
7. Implement frontend home page fetch products

**Tools & automation có thể tạo:**
- Script generate Prisma schema từ specs → ✅ (có thể tạo ngay)
- Script generate OpenAPI YAML → ✅
- Starter files (pages, API routes) → ✅

---

**Kết luận:** Planning document này cung cấp roadmap chi tiết, backlog, acceptance criteria, và dependencies cho Mini Storefront project. Team có thể sử dụng document này để track progress, assign tasks, và đảm bảo không bỏ sót requirement nào từ specs.

**Câu hỏi cho team:**
1. Team prefer monorepo hay separate repos cho FE/BE?
2. Dùng pnpm, npm, hay yarn?
3. Vercel account và managed Postgres đã sẵn sàng chưa?
4. Cần thiết lập Jira/Linear/GitHub Projects để track không?
