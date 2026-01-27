# Mini Storefront — Task Breakdown (Chi tiết)

Breakdown chi tiết các task từ `specs.md` và `plan.md` thành các đầu việc cụ thể, có thể assign trực tiếp cho developer. Mỗi task đủ nhỏ để hoàn thành trong 0.5-2 ngày.

---

## Sprint 1: Foundation & Data Setup

### Database & Schema (DB)

#### DB-01: Tạo Prisma schema file
- **ID:** DB-01
- **Estimate:** 2h
- **Assignee:** Backend Dev
- **Description:** Tạo `apps/backend/prisma/schema.postgres.prisma` với đầy đủ models: Category, Product, Order, OrderItem, AdminUser
- **Acceptance Criteria:**
  - [ ] File `apps/backend/prisma/schema.postgres.prisma` tồn tại
  - [ ] Định nghĩa đầy đủ 5 models với fields, types, relations
  - [ ] Unique constraints cho slug, username
  - [ ] Default values (published=false, timestamps)
- **Dependencies:** None
- **Files:** `apps/backend/prisma/schema.postgres.prisma`

#### DB-02: Tạo initial migration
- **ID:** DB-02
- **Estimate:** 1h
- **Assignee:** Backend Dev
- **Description:** Chạy `prisma migrate dev` để tạo migration đầu tiên
- **Acceptance Criteria:**
  - [ ] Migration file được tạo trong `apps/backend/prisma/migrations/`
  - [ ] Tables được tạo trong local Postgres
  - [ ] `prisma generate` chạy thành công
- **Dependencies:** DB-01
- **Files:** `prisma/migrations/*/migration.sql`

#### DB-03: Viết seed script
- **ID:** DB-03
- **Estimate:** 3h
- **Assignee:** Backend Dev
-- **Description:** Tạo `apps/backend/prisma/seed.ts` để seed categories, products, admin user
- **Acceptance Criteria:**
  - [ ] Script tạo 2-3 categories (Áo, Quần, Phụ kiện)
  - [ ] Script tạo 5-10 products với giá, inventory, images
  - [ ] Script tạo 1 admin user (username: admin, password hashed)
  - [ ] `npm run seed` chạy thành công
  - [ ] Idempotent: chạy nhiều lần không bị duplicate
- **Dependencies:** DB-02
- **Files:** `apps/backend/prisma/seed.ts`


### Backend Foundation (BE)

#### BE-01: Setup Next.js backend project
- **ID:** BE-01
- **Estimate:** 4h
- **Assignee:** Backend Dev
- **Description:** Khởi tạo Next.js app cho backend trong `apps/backend`
- **Acceptance Criteria:**
  - [ ] `apps/backend/package.json` với dependencies (next, prisma, bcrypt, jsonwebtoken)
  - [ ] `apps/backend/tsconfig.json` với strict mode
  - [ ] `apps/backend/next.config.js` với API routes config
  - [ ] Folder structure: `pages/api/`, `lib/`, `middleware/`
  - [ ] `npm run dev` chạy được backend trên port 3001
- **Dependencies:** DB-02
- **Files:** `apps/backend/package.json`, `apps/backend/tsconfig.json`, `apps/backend/next.config.js`
- **Status:** ✅ Implemented (backend app present under `apps/backend`)

#### BE-02: Setup Prisma client
- **ID:** BE-02
- **Estimate:** 2h
- **Assignee:** Backend Dev
- **Description:** Tạo Prisma client singleton và export
- **Acceptance Criteria:**
  - [ ] File `lib/prisma.ts` export prisma client instance
  - [ ] Connection pooling configured
  - [ ] Dev mode hot reload không tạo nhiều instances
  - [ ] DATABASE_URL trong `.env`
- **Dependencies:** BE-01, DB-02
- **Files:** `apps/backend/lib/prisma.ts`
- **Status:** ✅ Implemented (`apps/backend/lib/prisma.ts` exports singleton)

#### BE-03: API GET /api/categories
- **ID:** BE-03
- **Estimate:** 2h
- **Assignee:** Backend Dev
- **Description:** Implement endpoint lấy danh sách categories
- **Acceptance Criteria:**
  - [ ] File `pages/api/categories.ts`
  - [ ] Trả về JSON array: `[{ id, name, slug }]`
  - [ ] Status 200 khi thành công
  - [ ] Error handling với status 500
  - [ ] Test bằng curl/Postman
- **Dependencies:** BE-02
- **Files:** `apps/backend/pages/api/categories.ts`
- **Status:** ✅ Implemented (`GET /api/categories` exists)

#### BE-04: API GET /api/products với query params
- **ID:** BE-04
- **Estimate:** 4h
- **Assignee:** Backend Dev
- **Description:** Implement endpoint list products với filter, search, pagination
- **Acceptance Criteria:**
  - [ ] File `pages/api/products/index.ts`
  - [ ] Query params: `?category=slug&search=text&page=1&limit=10`
  - [ ] Chỉ trả về published products
  - [ ] Response format: `{ data: [...], total, page, limit }`
  - [ ] Default limit=20, max limit=100
  - [ ] Search theo name và description (case-insensitive)
- **Dependencies:** BE-02
- **Files:** `apps/backend/pages/api/products/index.ts`
- **Status:** ✅ Implemented (`GET /api/products` with filtering, pagination)

#### BE-05: API GET /api/products/:slug
- **ID:** BE-05
- **Estimate:** 2h
- **Assignee:** Backend Dev
- **Description:** Implement endpoint lấy chi tiết 1 product theo slug
- **Acceptance Criteria:**
  - [ ] File `pages/api/products/[slug].ts`
  - [ ] Trả về full product info (including category, images)
  - [ ] Chỉ trả về nếu published=true
  - [ ] 404 nếu không tìm thấy hoặc unpublished
  - [ ] Include category name trong response
- **Dependencies:** BE-02
- **Files:** `apps/backend/pages/api/products/[slug].ts`
- **Status:** ✅ Implemented (`GET /api/products/:slug` exists and returns parsed images)

---

### Frontend Foundation (FE)

#### FE-01: Setup Next.js frontend project
- **ID:** FE-01
- **Estimate:** 4h
- **Assignee:** Frontend Dev
- **Description:** Khởi tạo Next.js app cho frontend trong `apps/frontend`
- **Acceptance Criteria:**
  - [ ] `apps/frontend/package.json` với dependencies (next, react, swr, tailwindcss)
  - [ ] `apps/frontend/tsconfig.json`
  - [ ] Tailwind config: `tailwind.config.js`, `postcss.config.js`
  - [ ] Global styles trong `styles/globals.css`
  - [ ] `npm run dev` chạy được frontend trên port 3000
- **Dependencies:** None
- **Files:** `apps/frontend/package.json`, `apps/frontend/tailwind.config.js`
- **Status:** ✅ Implemented (frontend app present under `apps/frontend`)

#### FE-02: Tạo Layout component
- **ID:** FE-02
- **Estimate:** 4h
- **Assignee:** Frontend Dev
- **Description:** Tạo layout chung với Header, Footer, Navigation
- **Acceptance Criteria:**
  - [ ] Component `components/Layout.tsx`
  - [ ] Header với logo, navigation links (Home, Categories, Cart, Admin)
  - [ ] Footer với copyright
  - [ ] Responsive design (mobile-first)
  - [ ] Sticky header
- **Dependencies:** FE-01
- **Files:** `apps/frontend/components/Layout.tsx`, `apps/frontend/components/Header.tsx`, `apps/frontend/components/Footer.tsx`

#### FE-03: Trang Home (/)
- **ID:** FE-03
- **Estimate:** 6h
- **Assignee:** Frontend Dev
- **Description:** Tạo home page với featured categories và products
- **Acceptance Criteria:**
  - [ ] File `pages/index.tsx`
  - [ ] Fetch categories từ API `/api/categories`
  - [ ] Fetch products từ API `/api/products?limit=8`
  - [ ] Hiển thị grid categories
  - [ ] Hiển thị grid featured products
  - [ ] Loading state, error state
  - [ ] Responsive grid (1 col mobile, 2 tablet, 4 desktop)
- **Dependencies:** FE-02, BE-03, BE-04
- **Files:** `apps/frontend/pages/index.tsx`
- **Status:** ✅ Implemented (`apps/frontend/pages/index.tsx` uses API client)

#### FE-04: Component ProductCard
- **ID:** FE-04
- **Estimate:** 3h
- **Assignee:** Frontend Dev
- **Description:** Tạo reusable ProductCard component
- **Acceptance Criteria:**
  - [ ] File `components/ProductCard.tsx`
  - [ ] Display: image, name, price, stock status
  - [ ] Link to product detail page
  - [ ] Hover effect
  - [ ] Props: product object
  - [ ] Format giá VND
- **Dependencies:** FE-01
- **Files:** `apps/frontend/components/ProductCard.tsx`
- **Status:** ✅ Implemented (`ProductCard` component exists)

#### FE-05: Component ProductList
- **ID:** FE-05
- **Estimate:** 2h
- **Assignee:** Frontend Dev
- **Description:** Tạo ProductList wrapper component
- **Acceptance Criteria:**
  - [ ] File `components/ProductList.tsx`
  - [ ] Render grid of ProductCard
  - [ ] Props: products array
  - [ ] Empty state message
- **Dependencies:** FE-04
- **Files:** `apps/frontend/components/ProductList.tsx`

#### FE-06: Trang Category listing (/category/[slug])
- **ID:** FE-06
- **Estimate:** 4h
- **Assignee:** Frontend Dev
- **Description:** Tạo trang hiển thị products theo category
- **Acceptance Criteria:**
  - [ ] File `pages/category/[slug].tsx`
  - [ ] Display category name
  - [ ] Use ProductList component
  - [ ] Filter/sort UI (optional sprint 2)
  - [ ] Pagination (optional)
- **Dependencies:** FE-05, BE-04
- **Files:** `apps/frontend/pages/category/[slug].tsx`
- **Note:** actual frontend path is `apps/frontend/pages/categories/[slug].tsx` (plural). Update routing tasks to match repo.

#### FE-07: Setup API client và hooks
- **ID:** FE-07
- **Estimate:** 3h
- **Description:** Tạo API client và custom hooks với SWR
- **Acceptance Criteria:**
  - [ ] File `lib/api.ts` với fetch wrappers
  - [ ] Hook `hooks/useProducts.ts`
  - [ ] Hook `hooks/useCategories.ts`
  - [ ] Hook `hooks/useProduct.ts` (by slug)
  - [ ] Error handling, loading states
  - [ ] Base URL từ env `NEXT_PUBLIC_API_URL`
- **Dependencies:** FE-01
- **Files:** `apps/frontend/lib/api.ts`, `apps/frontend/hooks/useProducts.ts`, `apps/frontend/hooks/useCategories.ts`

---

### DevOps Sprint 1

#### DEVOPS-01: Setup Docker compose
- **ID:** DEVOPS-01
- **Estimate:** 4h
- **Assignee:** DevOps/Backend Dev
- **Description:** Tạo docker-compose.yml cho local development
- **Acceptance Criteria:**
  - [ ] File `docker-compose.yml` ở repo root
  - [ ] Services: postgres, frontend, backend
  - [ ] Frontend build và expose port 3000
  - [ ] Backend build và expose port 3001
  - [ ] Postgres với persistent volume
  - [ ] Env variables trong compose file
  - [ ] `docker compose up` chạy thành công
- **Dependencies:** BE-01, FE-01
- **Files:** `docker-compose.yml`

#### DEVOPS-02: Setup GitHub Actions CI
- **ID:** DEVOPS-02
- **Estimate:** 4h
- **Assignee:** DevOps
- **Description:** Tạo CI workflow cho lint, typecheck, build
- **Acceptance Criteria:**
  - [ ] File `.github/workflows/ci.yml`
  - [ ] Jobs: install, lint, typecheck, build
  - [ ] Run cho frontend và backend
  - [ ] Trigger on push to main và PRs
  - [ ] Cache node_modules
  - [ ] Badge trong README
- **Dependencies:** BE-01, FE-01
- **Files:** `.github/workflows/ci.yml`

---

## Sprint 2: Cart & Product Detail

### Backend API Sprint 2

#### BE-06: API GET /api/categories/:slug/products
- **ID:** BE-06
- **Estimate:** 3h
- **Assignee:** Backend Dev
- **Description:** Endpoint lấy products theo category slug
- **Acceptance Criteria:**
  - [ ] File `pages/api/categories/[slug]/products.ts`
  - [ ] Filter products by categoryId
  - [ ] Chỉ published products
  - [ ] Pagination support
  - [ ] 404 nếu category không tồn tại
- **Dependencies:** BE-02
- **Files:** `apps/backend/pages/api/categories/[slug]/products.ts`

---

### Frontend Sprint 2

#### FE-08: Trang Product Detail (/products/[slug])
- **ID:** FE-08
- **Estimate:** 6h
- **Assignee:** Frontend Dev
- **Description:** Tạo trang chi tiết sản phẩm
- **Acceptance Criteria:**
  - [ ] File `pages/products/[slug].tsx`
  - [ ] Fetch từ `/api/products/:slug`
  - [ ] Display: images carousel, name, price, description, stock
  - [ ] Quantity selector (1-10)
  - [ ] Add to cart button
  - [ ] Breadcrumb navigation
  - [ ] Related products (optional)
  - [ ] SEO meta tags
- **Dependencies:** BE-05, FE-09
- **Files:** `apps/frontend/pages/product/[slug].tsx`
- **Status:** ✅ Implemented (`apps/frontend/pages/products/[slug].tsx`)

#### FE-09: Implement Cart state management
- **ID:** FE-09
- **Estimate:** 6h
- **Assignee:** Frontend Dev
- **Description:** Tạo cart context/state với localStorage persistence
- **Acceptance Criteria:**
  - [ ] File `context/CartContext.tsx` hoặc `store/cartStore.ts` (Zustand)
  - [ ] Actions: addItem, removeItem, updateQuantity, clearCart
  - [ ] Persist to localStorage
  - [ ] Restore từ localStorage on load
  - [ ] Calculate subtotal, total items
  - [ ] Type-safe cart item interface
- **Dependencies:** FE-01
- **Files:** `apps/frontend/context/CartContext.tsx`
- **Note:** this project uses `apps/frontend/store/cartStore.ts` (Zustand) with persistence — implemented.
- **Status:** ✅ Implemented (`apps/frontend/store/cartStore.ts`)

#### FE-10: Component CartItem và CartSummary
- **ID:** FE-10
- **Estimate:** 4h
- **Assignee:** Frontend Dev
- **Description:** Tạo components cho cart UI
- **Acceptance Criteria:**
  - [ ] File `components/CartItem.tsx`
  - [ ] Display: image, name, price, quantity selector, remove button
  - [ ] Update quantity triggers cart state update
  - [ ] File `components/CartSummary.tsx`
  - [ ] Display: subtotal, shipping placeholder, total
  - [ ] Proceed to checkout button
- **Dependencies:** FE-09
- **Files:** `apps/frontend/components/CartItem.tsx`, `apps/frontend/components/CartSummary.tsx`

#### FE-11: Trang Cart (/cart)
- **ID:** FE-11
- **Estimate:** 4h
- **Assignee:** Frontend Dev
- **Description:** Tạo trang giỏ hàng
- **Acceptance Criteria:**
  - [ ] File `pages/cart.tsx`
  - [ ] List cart items với CartItem component
  - [ ] CartSummary component
  - [ ] Empty cart state với link back to home
  - [ ] Continue shopping button
  - [ ] Proceed to checkout button (link to /checkout)
- **Dependencies:** FE-10
- **Files:** `apps/frontend/pages/cart.tsx`
- **Status:** ✅ Implemented (`apps/frontend/pages/cart.tsx`)

#### FE-12: Add product images carousel
- **ID:** FE-12
- **Estimate:** 4h
- **Assignee:** Frontend Dev
- **Description:** Tạo image carousel cho product detail
- **Acceptance Criteria:**
  - [ ] Component `components/ImageCarousel.tsx`
  - [ ] Support multiple images
  - [ ] Thumbnail navigation
  - [ ] Zoom on hover (optional)
  - [ ] Touch swipe support mobile
- **Dependencies:** FE-08
- **Files:** `apps/frontend/components/ImageCarousel.tsx`

---

## Sprint 3: Checkout & Order Flow

### Backend Sprint 3

#### BE-07: API POST /api/checkout (transactional)
- **ID:** BE-07
- **Estimate:** 8h (critical, complex)
- **Assignee:** Backend Dev
- **Description:** Implement checkout endpoint với DB transaction
- **Acceptance Criteria:**
  - [ ] File `pages/api/checkout.ts`
  - [ ] Validate input (buyer info, items)
  - [ ] Start Prisma transaction
  - [ ] For each item: check `inventory >= quantity`
  - [ ] If any insufficient → rollback, return 400 with details
  - [ ] Decrement inventory for each product
  - [ ] Create Order record
  - [ ] Create OrderItem records
  - [ ] Calculate total
  - [ ] Commit transaction
  - [ ] Return order id, status, total
  - [ ] Simulate fail with `simulate=fail` param
- **Dependencies:** BE-02, DB-01
- **Files:** `apps/backend/pages/api/checkout.ts`
- **Status:** ✅ Implemented (transactional checkout with `simulateFail` support)

#### BE-08: API GET /api/orders/:id
- **ID:** BE-08
- **Estimate:** 3h
- **Assignee:** Backend Dev
- **Description:** Endpoint lấy chi tiết order
- **Acceptance Criteria:**
  - [ ] File `pages/api/orders/[id].ts`
  - [ ] Return order với items (include product info)
  - [ ] 404 nếu không tìm thấy
  - [ ] Public access (no auth required for MVP)
- **Dependencies:** BE-02
- **Files:** `apps/backend/pages/api/orders/[id].ts`

---

### Frontend Sprint 3

#### FE-13: Trang Checkout (/checkout)
- **ID:** FE-13
- **Estimate:** 8h
- **Assignee:** Frontend Dev
- **Description:** Tạo trang checkout với form buyer info
- **Acceptance Criteria:**
  - [ ] File `pages/checkout.tsx`
  - [ ] Form fields: name, email, address, phone
  - [ ] Form validation (Yup/Zod)
  - [ ] Order summary (items, prices)
  - [ ] Submit button → POST to `/api/checkout`
  - [ ] Loading state during checkout
  - [ ] Error handling: show out-of-stock errors
  - [ ] Success → redirect to `/order/[id]`
  - [ ] Clear cart on success
- **Dependencies:** FE-09, BE-07
- **Files:** `apps/frontend/pages/checkout.tsx`

#### FE-14: Trang Order Confirmation (/order/[id])
- **ID:** FE-14
- **Estimate:** 4h
- **Assignee:** Frontend Dev
- **Description:** Tạo trang xác nhận order
- **Acceptance Criteria:**
  - [ ] File `pages/order/[id].tsx`
  - [ ] Fetch từ `/api/orders/:id`
  - [ ] Display: order id, status, items, total, buyer info
  - [ ] Success message
  - [ ] Back to home button
  - [ ] Print order button (optional)
- **Dependencies:** BE-08
- **Files:** `apps/frontend/pages/order/[id].tsx`

#### FE-15: Error handling UI components
- **ID:** FE-15
- **Estimate:** 3h
- **Assignee:** Frontend Dev
- **Description:** Tạo error display components
- **Acceptance Criteria:**
  - [ ] Component `components/ErrorMessage.tsx`
  - [ ] Component `components/Alert.tsx` (success, error, warning)
  - [ ] Toast notification system (optional: react-hot-toast)
  - [ ] Display out-of-stock errors on checkout
- **Dependencies:** FE-01
- **Files:** `apps/frontend/components/ErrorMessage.tsx`, `apps/frontend/components/Alert.tsx`

---

## Sprint 4: Admin Panel & Auth

### Backend Sprint 4

#### BE-09: API POST /api/admin/login (JWT)
- **ID:** BE-09
- **Estimate:** 4h
- **Assignee:** Backend Dev
- **Description:** Implement admin login endpoint
- **Acceptance Criteria:**
  - [ ] File `pages/api/admin/login.ts`
  - [ ] Body: { username, password }
  - [ ] Verify username exists
  - [ ] Compare password với bcrypt
  - [ ] Generate JWT token (jsonwebtoken)
  - [ ] Return { token, expiresIn }
  - [ ] 401 nếu sai credentials
- **Dependencies:** BE-02, DB-03
- **Files:** `apps/backend/pages/api/admin/login.ts`
- **Status:** ✅ Implemented (returns JWT and admin info)

#### BE-10: Middleware verify JWT
- **ID:** BE-10
- **Estimate:** 3h
- **Assignee:** Backend Dev
- **Description:** Tạo middleware protect admin routes
- **Acceptance Criteria:**
  - [ ] File `middleware/auth.ts`
  - [ ] Extract token từ Authorization header
  - [ ] Verify token với JWT_SECRET
  - [ ] Attach user info to request
  - [ ] 401 nếu invalid/expired token
  - [ ] Reusable cho tất cả admin endpoints
- **Dependencies:** BE-09
- **Files:** `apps/backend/middleware/auth.ts`

#### BE-11: API GET /api/admin/products
- **ID:** BE-11
- **Estimate:** 2h
- **Assignee:** Backend Dev
- **Description:** Admin endpoint list all products (including unpublished)
- **Acceptance Criteria:**
  - [ ] File `pages/api/admin/products/index.ts`
  - [ ] Protected by auth middleware
  - [ ] Return ALL products (published + unpublished)
  - [ ] Include category info
  - [ ] Pagination support
- **Dependencies:** BE-10
- **Files:** `apps/backend/pages/api/admin/products/index.ts`

#### BE-12: API POST /api/admin/products
- **ID:** BE-12
- **Estimate:** 4h
- **Assignee:** Backend Dev
- **Description:** Admin endpoint tạo product mới
- **Acceptance Criteria:**
  - [ ] Protected by auth middleware
  - [ ] Body validation: name, slug, price, inventory, categoryId
  - [ ] Check slug unique
  - [ ] Default published=false
  - [ ] Return created product
  - [ ] 400 nếu validation fail
- **Dependencies:** BE-10
- **Files:** `apps/backend/pages/api/admin/products/index.ts`

#### BE-13: API PUT /api/admin/products/:id
- **ID:** BE-13
- **Estimate:** 3h
- **Assignee:** Backend Dev
- **Description:** Admin endpoint update product
- **Acceptance Criteria:**
  - [ ] File `pages/api/admin/products/[id].ts`
  - [ ] Protected by auth middleware
  - [ ] Update: name, slug, description, price, inventory, published, categoryId
  - [ ] 404 nếu không tìm thấy
  - [ ] Return updated product
- **Dependencies:** BE-10
- **Files:** `apps/backend/pages/api/admin/products/[id].ts`

#### BE-14: API DELETE /api/admin/products/:id
- **ID:** BE-14
- **Estimate:** 2h
- **Assignee:** Backend Dev
- **Description:** Admin endpoint xóa product
- **Acceptance Criteria:**
  - [ ] Protected by auth middleware
  - [ ] Soft delete hoặc hard delete (tùy chọn)
  - [ ] 404 nếu không tìm thấy
  - [ ] Return 204 No Content
- **Dependencies:** BE-10
- **Files:** `apps/backend/pages/api/admin/products/[id].ts`

#### BE-16: API GET /api/admin/categories
- **ID:** BE-16
- **Estimate:** 3h
- **Assignee:** Backend Dev
- **Description:** Admin endpoint list all categories with product counts
- **Acceptance Criteria:**
  - [ ] File `pages/api/admin/categories/index.ts` (GET handler)
  - [ ] Protected by `requireAdmin` middleware
  - [ ] Return array: `[{ id, name, slug, _count: { products: number } }]`
  - [ ] Use Prisma `include: { _count: { select: { products: true } } }`
  - [ ] No pagination (MVP: return all categories)
  - [ ] CORS applied automatically via middleware
  - [ ] 401 if no valid token
  - [ ] 500 with error message on failure
- **Dependencies:** BE-10
- **Files:** `apps/backend/pages/api/admin/categories/index.ts`

#### BE-16a: API POST /api/admin/categories
- **ID:** BE-16a
- **Estimate:** 4h
- **Assignee:** Backend Dev
- **Description:** Admin endpoint create new category with validation
- **Acceptance Criteria:**
  - [ ] File `pages/api/admin/categories/index.ts` (POST handler)
  - [ ] Protected by `requireAdmin` middleware
  - [ ] Zod validation schema: `{ name: string (min 1, max 100), slug: string (min 1, max 100, regex: /^[a-z0-9-]+$/) }`
  - [ ] Check slug uniqueness with `prisma.category.findUnique({ where: { slug } })`
  - [ ] Return 400 if slug already exists: `{ error: "Slug already exists" }`
  - [ ] Return 400 if validation fails: `{ error: "Validation failed", details: ZodError }`
  - [ ] Create category: `prisma.category.create({ data: { name, slug } })`
  - [ ] Return 201 with created category: `{ id, name, slug }`
  - [ ] Slug must be lowercase letters, numbers, hyphens only (no spaces, no uppercase)
- **Dependencies:** BE-10
- **Files:** `apps/backend/pages/api/admin/categories/index.ts`

#### BE-16b: API PUT /api/admin/categories/:id
- **ID:** BE-16b
- **Estimate:** 4h
- **Assignee:** Backend Dev
- **Description:** Admin endpoint update category (partial update)
- **Acceptance Criteria:**
  - [ ] File `pages/api/admin/categories/[id].ts` (PUT handler)
  - [ ] Protected by `requireAdmin` middleware
  - [ ] Zod validation: `{ name?: string (min 1, max 100), slug?: string (min 1, max 100, regex: /^[a-z0-9-]+$/) }`
  - [ ] At least one field (name or slug) must be provided
  - [ ] Return 400 if no fields provided: `{ error: "At least one field must be provided" }`
  - [ ] If slug is being changed, check uniqueness excluding current category
  - [ ] Query: `prisma.category.findFirst({ where: { slug: newSlug, NOT: { id } } })`
  - [ ] Return 400 if new slug conflicts: `{ error: "Slug already exists" }`
  - [ ] Update category: `prisma.category.update({ where: { id }, data: { name?, slug? } })`
  - [ ] Return 200 with updated category: `{ id, name, slug }`
  - [ ] Return 404 if category not found
- **Dependencies:** BE-10
- **Files:** `apps/backend/pages/api/admin/categories/[id].ts`

#### BE-16c: API DELETE /api/admin/categories/:id
- **ID:** BE-16c
- **Estimate:** 3h
- **Assignee:** Backend Dev
- **Description:** Admin endpoint delete category (with product count protection)
- **Acceptance Criteria:**
  - [ ] File `pages/api/admin/categories/[id].ts` (DELETE handler)
  - [ ] Protected by `requireAdmin` middleware
  - [ ] Fetch category with product count: `prisma.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } })`
  - [ ] Return 404 if category not found
  - [ ] Check if `category._count.products > 0`
  - [ ] Return 400 if products exist: `{ error: "Cannot delete category with products", details: { productCount: number } }`
  - [ ] Delete category only if no products: `prisma.category.delete({ where: { id } })`
  - [ ] Return 200 with message: `{ message: "Category deleted" }`
  - [ ] Note: Prevents accidental data loss even though schema has onDelete: Cascade
- **Dependencies:** BE-10
- **Files:** `apps/backend/pages/api/admin/categories/[id].ts`

#### BE-17: API GET /api/admin/orders
- **ID:** BE-17
- **Estimate:** 3h
- **Assignee:** Backend Dev
- **Description:** Admin endpoint list orders
- **Acceptance Criteria:**
  - [ ] File `pages/api/admin/orders/index.ts`
  - [ ] Protected by auth middleware
  - [ ] List all orders với items
  - [ ] Filter by status (optional)
  - [ ] Sort by createdAt desc
  - [ ] Pagination
- **Dependencies:** BE-10
- **Files:** `apps/backend/pages/api/admin/orders/index.ts`

---

### Frontend Sprint 4

#### FE-16: Admin Login page (/admin/login)
- **ID:** FE-16
- **Estimate:** 4h
- **Assignee:** Frontend Dev
- **Description:** Tạo trang login cho admin
- **Acceptance Criteria:**
  - [ ] File `pages/admin/login.tsx`
  - [ ] Form: username, password
  - [ ] Submit → POST to `/api/admin/login`
  - [ ] Store token in localStorage or cookie
  - [ ] Redirect to `/admin` on success
  - [ ] Error message on fail
- **Dependencies:** BE-09
- **Files:** `apps/frontend/pages/admin/login.tsx`

#### FE-17: Admin auth context/hook
- **ID:** FE-17
- **Estimate:** 3h
- **Assignee:** Frontend Dev
- **Description:** Tạo auth context cho admin session
- **Acceptance Criteria:**
  - [ ] File `context/AuthContext.tsx`
  - [ ] Store token, isAuthenticated state
  - [ ] Login, logout functions
  - [ ] Auto-logout on token expire
  - [ ] Protected route HOC `withAuth`
- **Dependencies:** FE-16
- **Files:** `apps/frontend/context/AuthContext.tsx`, `apps/frontend/hoc/withAuth.tsx`

#### FE-18: Admin Dashboard (/admin)
- **ID:** FE-18
- **Estimate:** 6h
- **Assignee:** Frontend Dev
- **Description:** Tạo admin dashboard
- **Acceptance Criteria:**
  - [ ] File `pages/admin/index.tsx`
  - [ ] Protected route
  - [ ] Display stats: total products, low stock warnings, recent orders
  - [ ] Links to: products, categories, orders
  - [ ] Logout button
- **Dependencies:** FE-17, BE-11, BE-16
- **Files:** `apps/frontend/pages/admin/index.tsx`

#### FE-19: Admin Products List (/admin/products)
- **ID:** FE-19
- **Estimate:** 6h
- **Assignee:** Frontend Dev
- **Description:** Tạo trang quản lý products
- **Acceptance Criteria:**
  - [ ] File `pages/admin/products/index.tsx`
  - [ ] Protected route
  - [ ] Fetch từ `/api/admin/products`
  - [ ] Table: image, name, price, inventory, published, actions
  - [ ] Actions: Edit, Delete, Toggle publish
  - [ ] Create new product button → link to `/admin/products/new`
  - [ ] Confirmation dialog for delete
- **Dependencies:** FE-17, BE-11
- **Files:** `apps/frontend/pages/admin/products/index.tsx`

#### FE-20: Admin Product Create/Edit form
- **ID:** FE-20
- **Estimate:** 8h
- **Assignee:** Frontend Dev
- **Description:** Tạo form tạo và sửa product
- **Acceptance Criteria:**
  - [ ] File `pages/admin/products/new.tsx`
  - [ ] File `pages/admin/products/[id]/edit.tsx`
  - [ ] Form fields: name, slug, description, price, inventory, category, images, published
  - [ ] Form validation
  - [ ] Image upload (optional: upload to CDN or base64)
  - [ ] Submit → POST or PUT to admin API
  - [ ] Redirect to products list on success
- **Dependencies:** FE-17, BE-12, BE-13
- **Files:** `apps/frontend/pages/admin/products/new.tsx`, `apps/frontend/pages/admin/products/[id]/edit.tsx`

#### FE-21: Admin Categories management (/admin/categories)
- **ID:** FE-21
- **Estimate:** 10h (total for all subtasks)
- **Assignee:** Frontend Dev
- **Description:** Tạo trang quản lý categories với inline create/edit, delete protection
- **Acceptance Criteria:** See subtasks FE-21a through FE-21g below
- **Dependencies:** FE-17 (auth context), BE-16, BE-16a, BE-16b, BE-16c
- **Files:** `apps/frontend/pages/admin/categories/index.tsx`

#### FE-21a: Categories table UI
- **ID:** FE-21a
- **Estimate:** 2h
- **Assignee:** Frontend Dev
- **Description:** Tạo table hiển thị categories với product count
- **Acceptance Criteria:**
  - [ ] Table columns: Name, Slug, Product Count, Actions (Edit, Delete buttons)
  - [ ] Fetch categories từ `GET /api/admin/categories` using SWR
  - [ ] Display product count per category (from `_count.products`)
  - [ ] Empty state message when no categories
  - [ ] Loading skeleton while fetching
  - [ ] Error state display
  - [ ] Responsive table (scrollable on mobile)
- **Dependencies:** FE-17, BE-16
- **Files:** `apps/frontend/pages/admin/categories/index.tsx`

#### FE-21b: Inline create category form
- **ID:** FE-21b
- **Estimate:** 2h
- **Assignee:** Frontend Dev
- **Description:** Form tạo category mới ở top của table
- **Acceptance Criteria:**
  - [ ] Form always visible at top with inputs: Name (text), Slug (text)
  - [ ] "Add Category" submit button
  - [ ] POST to `/api/admin/categories` with JWT token in Authorization header
  - [ ] Client-side validation: name required, slug required, slug format (lowercase, hyphens only)
  - [ ] Show validation errors inline
  - [ ] Show API errors (duplicate slug, validation failed)
  - [ ] Clear form after successful creation
  - [ ] SWR `mutate()` to refresh list after creation
  - [ ] Loading state on submit button
- **Dependencies:** FE-21a, BE-16a
- **Files:** `apps/frontend/pages/admin/categories/index.tsx`

#### FE-21c: Inline edit mode per row
- **ID:** FE-21c
- **Estimate:** 2h
- **Assignee:** Frontend Dev
- **Description:** Toggle edit mode cho từng category row
- **Acceptance Criteria:**
  - [ ] "Edit" button on each row
  - [ ] Click Edit → row switches to edit mode (inputs replace text)
  - [ ] Edit mode shows: Name input (pre-filled), Slug input (pre-filled)
  - [ ] "Save" and "Cancel" buttons in edit mode
  - [ ] Cancel → revert to display mode without changes
  - [ ] Save → PUT to `/api/admin/categories/:id` with updated fields
  - [ ] Only one row can be in edit mode at a time
  - [ ] Validation same as create form
  - [ ] Show errors (duplicate slug, validation)
  - [ ] SWR `mutate()` after successful update
- **Dependencies:** FE-21a, BE-16b
- **Files:** `apps/frontend/pages/admin/categories/index.tsx`

#### FE-21d: Delete category button with confirmation
- **ID:** FE-21d
- **Estimate:** 1.5h
- **Assignee:** Frontend Dev
- **Description:** Delete button với confirmation dialog
- **Acceptance Criteria:**
  - [ ] "Delete" button on each row (red/warning color)
  - [ ] Click Delete → show confirmation dialog (browser `confirm()` or custom modal)
  - [ ] Confirmation message: "Delete category '{name}'?"
  - [ ] If confirmed → DELETE to `/api/admin/categories/:id`
  - [ ] Handle success → SWR `mutate()` to refresh list
  - [ ] Handle error → display error message
- **Dependencies:** FE-21a, BE-16c
- **Files:** `apps/frontend/pages/admin/categories/index.tsx`

#### FE-21e: Prevent delete when category has products
- **ID:** FE-21e
- **Estimate:** 1h
- **Assignee:** Frontend Dev
- **Description:** Show alert khi delete category có products
- **Acceptance Criteria:**
  - [ ] Check product count before allowing delete
  - [ ] If `_count.products > 0`, show alert: "Cannot delete '{name}' - it has {count} products"
  - [ ] Do not call DELETE API if products exist
  - [ ] If API returns 400 error (products exist), display error message from API
  - [ ] Error message includes product count from API response
  - [ ] User-friendly error display (toast or alert)
- **Dependencies:** FE-21d, BE-16c
- **Files:** `apps/frontend/pages/admin/categories/index.tsx`

#### FE-21f: Client-side slug format validation
- **ID:** FE-21f
- **Estimate:** 1h
- **Assignee:** Frontend Dev
- **Description:** Real-time slug validation on create/edit forms
- **Acceptance Criteria:**
  - [ ] Regex validation: `/^[a-z0-9-]+$/` (lowercase, numbers, hyphens only)
  - [ ] Show error message if validation fails: "Slug must be lowercase letters, numbers, and hyphens only"
  - [ ] Validation triggers on blur or onChange (debounced)
  - [ ] Disable submit if slug invalid
  - [ ] Red border on invalid input
  - [ ] Optional: auto-convert uppercase to lowercase on input
  - [ ] Optional: replace spaces with hyphens automatically
- **Dependencies:** FE-21b, FE-21c
- **Files:** `apps/frontend/pages/admin/categories/index.tsx`

#### FE-21g: SWR integration with optimistic updates
- **ID:** FE-21g
- **Estimate:** 1.5h
- **Assignee:** Frontend Dev
- **Description:** Setup SWR với optimistic updates for better UX
- **Acceptance Criteria:**
  - [ ] Use SWR `mutate()` for cache revalidation after create/update/delete
  - [ ] Optional: Optimistic updates - update UI immediately before API call
  - [ ] Rollback optimistic update if API call fails
  - [ ] Show loading states during mutations
  - [ ] Revalidate on focus (SWR default behavior)
  - [ ] Error retry strategy (SWR config)
  - [ ] Smooth transitions between states
- **Dependencies:** FE-21a, FE-21b, FE-21c, FE-21d
- **Files:** `apps/frontend/pages/admin/categories/index.tsx`

#### FE-22: Admin Orders list (/admin/orders)
- **ID:** FE-22
- **Estimate:** 5h
- **Assignee:** Frontend Dev
- **Description:** Tạo trang xem orders
- **Acceptance Criteria:**
  - [ ] File `pages/admin/orders.tsx`
  - [ ] Protected route
  - [ ] Fetch từ `/api/admin/orders`
  - [ ] Table: order id, buyer, total, status, date
  - [ ] Click to view order detail (expand hoặc modal)
  - [ ] Filter by status (optional)
- **Dependencies:** FE-17, BE-16
- **Files:** `apps/frontend/pages/admin/orders.tsx`

#### FE-23: Component AdminTable (reusable)
- **ID:** FE-23
- **Estimate:** 4h
- **Assignee:** Frontend Dev
- **Description:** Tạo reusable table component cho admin
- **Acceptance Criteria:**
  - [ ] File `components/admin/AdminTable.tsx`
  - [ ] Props: columns, data, actions
  - [ ] Sortable columns (optional)
  - [ ] Pagination (optional)
  - [ ] Responsive table
- **Dependencies:** FE-01
- **Files:** `apps/frontend/components/admin/AdminTable.tsx`

---

## Sprint 5: Testing, Polish & Deploy

### Testing (TEST)

#### TEST-01: Backend unit tests - product queries
- **ID:** TEST-01
- **Estimate:** 4h
- **Assignee:** Backend Dev
- **Description:** Viết unit tests cho product API
- **Acceptance Criteria:**
  - [ ] Test file `__tests__/api/products.test.ts`
  - [ ] Test GET /api/products (list, filter, pagination)
  - [ ] Test GET /api/products/:slug (found, not found, unpublished)
  - [ ] Mock Prisma client
  - [ ] Coverage ≥80% cho product endpoints
- **Dependencies:** BE-04, BE-05
- **Files:** `apps/backend/__tests__/api/products.test.ts`

#### TEST-02: Backend unit tests - checkout
- **ID:** TEST-02
- **Estimate:** 6h
- **Assignee:** Backend Dev
- **Description:** Viết tests cho checkout logic
- **Acceptance Criteria:**
  - [ ] Test file `__tests__/api/checkout.test.ts`
  - [ ] Test happy path: order created, inventory decremented
  - [ ] Test out-of-stock: transaction rollback
  - [ ] Test validation errors
  - [ ] Test simulate=fail
  - [ ] Use test database
- **Dependencies:** BE-07
- **Files:** `apps/backend/__tests__/api/checkout.test.ts`

#### TEST-03: Backend unit tests - admin auth
- **ID:** TEST-03
- **Estimate:** 3h
- **Assignee:** Backend Dev
- **Description:** Viết tests cho auth middleware
- **Acceptance Criteria:**
  - [ ] Test file `__tests__/middleware/auth.test.ts`
  - [ ] Test valid token → pass
  - [ ] Test invalid token → 401
  - [ ] Test expired token → 401
  - [ ] Test missing token → 401
- **Dependencies:** BE-10
- **Files:** `apps/backend/__tests__/middleware/auth.test.ts`

#### TEST-04: Backend unit tests - admin auth
- **ID:** TEST-03
- **Estimate:** 3h
- **Assignee:** Backend Dev
- **Description:** Viết tests cho auth middleware
- **Acceptance Criteria:**
  - [ ] Test file `__tests__/middleware/auth.test.ts`
  - [ ] Test valid token → request proceeds
  - [ ] Test invalid token → 401
  - [ ] Test expired token → 401
  - [ ] Test missing token → 401
- **Dependencies:** BE-10
- **Files:** `apps/backend/__tests__/middleware/auth.test.ts`

#### TEST-04a: Backend unit tests - GET /api/admin/categories
- **ID:** TEST-04a
- **Estimate:** 2h
- **Assignee:** Backend Dev
- **Description:** Test category list endpoint with product counts
- **Acceptance Criteria:**
  - [ ] Test file `__tests__/api/admin/categories.test.ts`
  - [ ] Test returns all categories with product counts
  - [ ] Test `_count.products` is correct number
  - [ ] Test empty categories (product count = 0)
  - [ ] Test returns 401 without valid token
  - [ ] Use test database with seeded data
- **Dependencies:** BE-16
- **Files:** `apps/backend/__tests__/api/admin/categories.test.ts`

#### TEST-04b: Backend unit tests - POST /api/admin/categories
- **ID:** TEST-04b
- **Estimate:** 3h
- **Assignee:** Backend Dev
- **Description:** Test category creation with validation
- **Acceptance Criteria:**
  - [ ] Test successful creation returns 201 with category
  - [ ] Test validation: name required (400 error)
  - [ ] Test validation: slug required (400 error)
  - [ ] Test validation: slug format (rejects uppercase, spaces, special chars)
  - [ ] Test duplicate slug returns 400 "Slug already exists"
  - [ ] Test created category appears in GET list
  - [ ] Test returns 401 without valid token
- **Dependencies:** BE-16a
- **Files:** `apps/backend/__tests__/api/admin/categories.test.ts`

#### TEST-04c: Backend unit tests - PUT /api/admin/categories/:id
- **ID:** TEST-04c
- **Estimate:** 3h
- **Assignee:** Backend Dev
- **Description:** Test category update endpoint
- **Acceptance Criteria:**
  - [ ] Test successful update returns 200 with updated category
  - [ ] Test partial update (only name or only slug)
  - [ ] Test returns 400 if no fields provided
  - [ ] Test slug uniqueness check (prevents duplicate slugs)
  - [ ] Test can update to same slug (no conflict with self)
  - [ ] Test returns 404 for non-existent category
  - [ ] Test validation same as POST endpoint
  - [ ] Test returns 401 without valid token
- **Dependencies:** BE-16b
- **Files:** `apps/backend/__tests__/api/admin/categories.test.ts`

#### TEST-04d: Backend unit tests - DELETE /api/admin/categories/:id
- **ID:** TEST-04d
- **Estimate:** 3h
- **Assignee:** Backend Dev
- **Description:** Test category deletion with product protection
- **Acceptance Criteria:**
  - [ ] Test successful deletion when no products (returns 200)
  - [ ] Test prevents deletion when products exist (returns 400)
  - [ ] Test error includes product count in details
  - [ ] Test returns 404 for non-existent category
  - [ ] Test category actually removed from database after successful delete
  - [ ] Test returns 401 without valid token
  - [ ] Test with test database (seed categories with and without products)
- **Dependencies:** BE-16c
- **Files:** `apps/backend/__tests__/api/admin/categories.test.ts`

#### TEST-04e: Backend unit tests - Category endpoints auth
- **ID:** TEST-04e
- **Estimate:** 1h
- **Assignee:** Backend Dev
- **Description:** Test all category endpoints require authentication
- **Acceptance Criteria:**
  - [ ] Test GET /api/admin/categories returns 401 without token
  - [ ] Test POST /api/admin/categories returns 401 without token
  - [ ] Test PUT /api/admin/categories/:id returns 401 without token
  - [ ] Test DELETE /api/admin/categories/:id returns 401 without token
  - [ ] Test invalid token format returns 401
  - [ ] Test expired token returns 401
- **Dependencies:** BE-16, BE-16a, BE-16b, BE-16c
- **Files:** `apps/backend/__tests__/api/admin/categories.test.ts`

#### TEST-05: Frontend unit tests - ProductCard
- **ID:** TEST-04
- **Estimate:** 2h
- **Assignee:** Frontend Dev
- **Description:** Viết component tests cho ProductCard
- **Acceptance Criteria:**
  - [ ] Test file `__tests__/components/ProductCard.test.tsx`
  - [ ] Test render with valid props
  - [ ] Test click link navigation
  - [ ] Test price formatting
  - [ ] Use React Testing Library
- **Dependencies:** FE-04
- **Files:** `apps/frontend/__tests__/components/ProductCard.test.tsx`

#### TEST-05: Frontend unit tests - Cart logic
- **ID:** TEST-05
- **Estimate:** 4h
- **Assignee:** Frontend Dev
- **Description:** Viết tests cho cart state management
- **Acceptance Criteria:**
  - [ ] Test file `__tests__/context/CartContext.test.tsx`
  - [ ] Test addItem, removeItem, updateQuantity
  - [ ] Test localStorage persistence
  - [ ] Test total calculation
  - [ ] Test clearCart
- **Dependencies:** FE-09
- **Files:** `apps/frontend/__tests__/context/CartContext.test.tsx`

#### TEST-06: Frontend unit tests - Cart logic
- **ID:** TEST-05
- **Estimate:** 4h
- **Assignee:** Frontend Dev
- **Description:** Viết tests cho cart state management
- **Acceptance Criteria:**
  - [ ] Test file `__tests__/context/CartContext.test.tsx`
  - [ ] Test addItem
  - [ ] Test removeItem
  - [ ] Test updateQuantity
  - [ ] Test clearCart
- **Dependencies:** FE-09
- **Files:** `apps/frontend/__tests__/context/CartContext.test.tsx`

#### TEST-06a: Frontend unit tests - Admin categories page
- **ID:** TEST-06a
- **Estimate:** 4h
- **Assignee:** Frontend Dev
- **Description:** Test admin categories management page
- **Acceptance Criteria:**
  - [ ] Test file `__tests__/pages/admin/categories.test.tsx`
  - [ ] Test renders categories list with product counts
  - [ ] Test create form submits correctly
  - [ ] Test create form validation (name, slug format)
  - [ ] Test edit mode toggles on button click
  - [ ] Test save button updates category
  - [ ] Test cancel button reverts changes
  - [ ] Test delete shows confirmation dialog
  - [ ] Test delete prevented when products exist (shows alert)
  - [ ] Test delete succeeds when no products
  - [ ] Test SWR revalidation after mutations
  - [ ] Mock API calls with msw or jest.mock
- **Dependencies:** FE-21 (all subtasks)
- **Files:** `apps/frontend/__tests__/pages/admin/categories.test.tsx`

#### TEST-07: Integration test - checkout E2E
- **ID:** TEST-06
- **Estimate:** 6h
- **Assignee:** Backend Dev
- **Description:** Integration test cho checkout flow
- **Acceptance Criteria:**
  - [ ] Test file `__tests__/integration/checkout.test.ts`
  - [ ] Setup test DB, seed data
  - [ ] Test full flow: check stock → create order → decrement inventory
  - [ ] Verify DB state after checkout
  - [ ] Test concurrent checkout (race condition)
- **Dependencies:** BE-07
- **Files:** `apps/backend/__tests__/integration/checkout.test.ts`

#### TEST-07: E2E test - user flow (optional)
- **ID:** TEST-07
- **Estimate:** 8h
- **Assignee:** QA/Frontend Dev
- **Description:** E2E test với Playwright
- **Acceptance Criteria:**
  - [ ] Setup Playwright
  - [ ] Test: browse home → product detail → add to cart → checkout → order confirmation
  - [ ] Test: admin login → create product → publish → verify on public store
  - [ ] Screenshots on fail
- **Dependencies:** All FE/BE done
- **Files:** `e2e/checkout.spec.ts`, `e2e/admin.spec.ts`

#### TEST-07: E2E test - user flow (optional)
- **ID:** TEST-07
- **Estimate:** 8h
- **Assignee:** QA/Frontend Dev
- **Description:** E2E test với Playwright
- **Acceptance Criteria:**
  - [ ] Setup Playwright
  - [ ] Test: browse → add to cart → checkout → order confirmation
  - [ ] Test: admin login → create product → verify in public store
  - [ ] Screenshots on fail
- **Dependencies:** All FE/BE done
- **Files:** `e2e/checkout.spec.ts`, `e2e/admin.spec.ts`

#### TEST-08a: E2E test - admin category management flow
- **ID:** TEST-08a
- **Estimate:** 4h
- **Assignee:** QA/Frontend Dev
- **Description:** E2E test cho admin category CRUD flow với Playwright
- **Acceptance Criteria:**
  - [ ] Test file `e2e/admin-categories.spec.ts`
  - [ ] Test login as admin → navigate to /admin/categories
  - [ ] Test view categories list with product counts
  - [ ] Test create new category with valid name and slug
  - [ ] Test create fails with invalid slug (uppercase, spaces)
  - [ ] Test create fails with duplicate slug (shows error)
  - [ ] Test edit category name
  - [ ] Test edit category slug
  - [ ] Test edit fails with duplicate slug
  - [ ] Test delete category with products shows error alert
  - [ ] Test delete empty category succeeds
  - [ ] Test verify deleted category not in list
  - [ ] Test category changes reflect in product form dropdown (integration check)
  - [ ] Use test database with known seed data
- **Dependencies:** FE-21 (all subtasks), BE-16, BE-16a, BE-16b, BE-16c
- **Files:** `e2e/admin-categories.spec.ts`

#### TEST-08: Security audit
- **ID:** TEST-08
- **Estimate:** 4h
- **Assignee:** Backend Lead
- **Description:** Security review và fixes
- **Acceptance Criteria:**
  - [ ] Check no secrets in git history
  - [ ] Verify bcrypt hashing admin passwords
  - [ ] Verify JWT_SECRET strong và secret
  - [ ] SQL injection prevention (Prisma parameterized queries)
  - [ ] XSS prevention (React auto-escaping, sanitize inputs)
  - [ ] CSRF protection (optional: CSRF tokens)
  - [ ] Rate limiting on login endpoint (optional)
- **Dependencies:** All BE done
- **Files:** Security checklist document

---

### UI/UX Polish (POLISH)

#### POLISH-01: Responsive design audit
- **ID:** POLISH-01
- **Estimate:** 4h
- **Assignee:** Frontend Dev
- **Description:** Test và fix responsive issues
- **Acceptance Criteria:**
  - [ ] Test trên mobile (375px), tablet (768px), desktop (1280px)
  - [ ] Fix layout breaks
  - [ ] Touch-friendly buttons mobile
  - [ ] Hamburger menu mobile (optional)
- **Dependencies:** All FE pages done
- **Files:** Various component files

#### POLISH-02: Loading states
- **ID:** POLISH-02
- **Estimate:** 3h
- **Assignee:** Frontend Dev
- **Description:** Add loading skeletons/spinners
- **Acceptance Criteria:**
  - [ ] Component `components/LoadingSpinner.tsx`
  - [ ] Component `components/SkeletonCard.tsx`
  - [ ] Loading state cho all data fetching
  - [ ] Smooth transitions
- **Dependencies:** FE-01
- **Files:** `apps/frontend/components/LoadingSpinner.tsx`

#### POLISH-03: Error pages (404, 500)
- **ID:** POLISH-03
- **Estimate:** 2h
- **Assignee:** Frontend Dev
- **Description:** Custom error pages
- **Acceptance Criteria:**
  - [ ] File `pages/404.tsx`
  - [ ] File `pages/500.tsx`
  - [ ] Friendly messages
  - [ ] Back to home link
- **Dependencies:** FE-01
- **Files:** `apps/frontend/pages/404.tsx`, `apps/frontend/pages/500.tsx`

#### POLISH-04: SEO optimization
- **ID:** POLISH-04
- **Estimate:** 3h
- **Assignee:** Frontend Dev
- **Description:** Add SEO meta tags
- **Acceptance Criteria:**
  - [ ] next-seo package hoặc Head component
  - [ ] Meta tags: title, description, og:image
  - [ ] Dynamic meta cho product pages
  - [ ] sitemap.xml (optional)
- **Dependencies:** All FE pages done
- **Files:** Various page files

---

### Deployment (DEPLOY)

#### DEPLOY-01: Setup Vercel project (FE)
- **ID:** DEPLOY-01
- **Estimate:** 2h
- **Assignee:** DevOps
- **Description:** Setup Vercel project cho frontend
- **Acceptance Criteria:**
  - [ ] Connect GitHub repo
  - [ ] Set root directory to `apps/frontend`
  - [ ] Auto deploy on push to main
  - [ ] Preview deploys for PRs
- **Dependencies:** FE-01
- **Files:** Vercel dashboard config

#### DEPLOY-02: Setup Vercel project (BE)
- **ID:** DEPLOY-02
- **Estimate:** 2h
- **Assignee:** DevOps
- **Description:** Setup Vercel project cho backend
- **Acceptance Criteria:**
  - [ ] Connect GitHub repo
  - [ ] Set root directory to `apps/backend`
  - [ ] Auto deploy on push to main
- **Dependencies:** BE-01
- **Files:** Vercel dashboard config

#### DEPLOY-03: Setup managed Postgres
- **ID:** DEPLOY-03
- **Estimate:** 2h
- **Assignee:** DevOps
- **Description:** Provision production database
- **Acceptance Criteria:**
  - [ ] Create Vercel Postgres hoặc Railway Postgres
  - [ ] Get DATABASE_URL
  - [ ] Run migrations on production DB
  - [ ] Run seed script (optional, or manual data entry)
- **Dependencies:** DB-02
- **Files:** None (cloud provisioning)

#### DEPLOY-04: Configure env variables
- **ID:** DEPLOY-04
- **Estimate:** 1h
- **Assignee:** DevOps
- **Description:** Set env variables trên Vercel
- **Acceptance Criteria:**
  - [ ] Backend: DATABASE_URL, JWT_SECRET, ADMIN_PASSWORD_HASH
  - [ ] Frontend: NEXT_PUBLIC_API_URL
  - [ ] Encrypted secrets
- **Dependencies:** DEPLOY-01, DEPLOY-02, DEPLOY-03
- **Files:** Vercel dashboard

#### DEPLOY-05: Production deployment
- **ID:** DEPLOY-05
- **Estimate:** 2h
- **Assignee:** DevOps
- **Description:** Deploy to production và verify
- **Acceptance Criteria:**
  - [ ] Trigger deployment
  - [ ] Verify frontend accessible
  - [ ] Verify backend API responding
  - [ ] Smoke test: browse products, add to cart, checkout, admin login
  - [ ] Check logs for errors
- **Dependencies:** DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04
- **Files:** None

#### DEPLOY-06: Setup custom domain (optional)
- **ID:** DEPLOY-06
- **Estimate:** 1h
- **Assignee:** DevOps
- **Description:** Configure custom domain
- **Acceptance Criteria:**
  - [ ] Add domain in Vercel
  - [ ] Update DNS records
  - [ ] SSL certificate auto-provisioned
- **Dependencies:** DEPLOY-05
- **Files:** None (DNS config)

---

## Sprint 6: Order Management Enhancement (Admin)

Goal: Implement comprehensive order status management for admins with audit logging, idempotent inventory restock, concurrency handling, and responsive UI with action buttons.

---

### Database & Migration (DB)

#### DB-18: Create OrderActivity model in Prisma schema
- **ID:** DB-18
- **Estimate:** 3h
- **Assignee:** Backend Dev
- **Description:** Add `OrderActivity` model to track all order status changes with admin attribution
- **Acceptance Criteria:**
  - [ ] File `apps/backend/prisma/schema.postgres.prisma` updated
  - [ ] Model fields: `id`, `orderId`, `adminId`, `fromStatus`, `toStatus`, `note`, `timestamp`
  - [ ] Relations: `Order.activities[]`, `AdminUser` reference
  - [ ] Index on `orderId` for fast queries
  - [ ] Index on `timestamp` for chronological sorting
  - [ ] Map to `order_activities` table
- **Dependencies:** BE-07 (Order model exists)
- **Files:** `apps/backend/prisma/schema.postgres.prisma`

#### DB-19: Extend Order model with tracking fields
- **ID:** DB-19
- **Estimate:** 2h
- **Assignee:** Backend Dev
- **Description:** Add optional shipping and cancellation tracking fields to Order model
- **Acceptance Criteria:**
  - [ ] Add `trackingNumber String?`
  - [ ] Add `carrier String?` (USPS, FedEx, UPS, Other)
  - [ ] Add `shipDate DateTime?`
  - [ ] Add `deliveryDate DateTime?`
  - [ ] Add `cancellationReason String?`
  - [ ] All fields optional (nullable)
- **Dependencies:** DB-18
- **Files:** `apps/backend/prisma/schema.postgres.prisma`

#### DB-20: Create and run migration
- **ID:** DB-20
- **Estimate:** 2h
- **Assignee:** Backend Dev
- **Description:** Generate and apply Prisma migration for OrderActivity and Order extensions
- **Acceptance Criteria:**
  - [ ] Run `prisma migrate dev --name add_order_activity`
  - [ ] Migration file created in `apps/backend/prisma/migrations/`
  - [ ] `order_activities` table created with indexes
  - [ ] `orders` table altered with new columns
  - [ ] Migration applied successfully locally
  - [ ] `prisma generate` succeeds
  - [ ] Test migration rollback works (optional)
- **Dependencies:** DB-18, DB-19
- **Files:** `apps/backend/prisma/migrations/*/migration.sql`

---

### Backend API (BE)

#### BE-18: Implement PUT /api/admin/orders/:id/status
- **ID:** BE-18
- **Estimate:** 2d (16h) — Complex, critical
- **Assignee:** Backend Dev
- **Description:** Endpoint to change order status with comprehensive validation, audit logging, inventory restock, idempotency, and concurrency control
- **Acceptance Criteria:**
  - [ ] File `apps/backend/pages/api/admin/orders/[id].ts` (PUT handler)
  - [ ] Protected by `requireAdmin` middleware
  - [ ] Zod schema validates: `status` (enum), `trackingNumber`, `carrier`, `shipDate`, `deliveryDate`, `cancellationReason`, `note`, `restock` (boolean)
  - [ ] Enforce allowed transitions: PENDING→PROCESSING→SHIPPED→DELIVERED, PENDING/PROCESSING→CANCELLED
  - [ ] Return 400 for invalid transitions with clear error message
  - [ ] Prisma transaction wraps all operations:
    - [ ] Fetch current order with `FOR UPDATE` lock (prevents concurrent updates)
    - [ ] If `restock=true` AND status=CANCELLED: increment inventory for each order item
    - [ ] Update order status and optional fields
    - [ ] Create `OrderActivity` record with `adminId`, `fromStatus`, `toStatus`, `note`
  - [ ] Support `Idempotency-Key` header: check if activity already exists for this key
  - [ ] Return 409 on concurrent update conflict
  - [ ] Return 200 with updated order + activities on success
  - [ ] Comprehensive error handling with descriptive messages
- **Dependencies:** DB-20, BE-02 (Prisma), BE-10 (Auth middleware)
- **Files:** `apps/backend/pages/api/admin/orders/[id].ts`

#### BE-19: Implement GET /api/admin/orders/:id/activities
- **ID:** BE-19
- **Estimate:** 4h
- **Assignee:** Backend Dev
- **Description:** Endpoint to fetch chronological order activity history with admin usernames
- **Acceptance Criteria:**
  - [ ] File `apps/backend/pages/api/admin/orders/[id]/activities.ts`
  - [ ] Protected by `requireAdmin` middleware
  - [ ] Return array of activities sorted by timestamp ASC
  - [ ] Include admin info: `{ id, fromStatus, toStatus, note, timestamp, admin: { id, username } }`
  - [ ] Use Prisma `include: { admin: { select: { id: true, username: true } } }`
  - [ ] Optional pagination with `?page=1&limit=20` (default: all)
  - [ ] Return 404 if order doesn't exist
  - [ ] Return 200 with `{ activities: [...], total }` on success
- **Dependencies:** DB-20, BE-18
- **Files:** `apps/backend/pages/api/admin/orders/[id]/activities.ts`

#### BE-20: Write unit tests for status transition logic
- **ID:** BE-20
- **Estimate:** 1d (8h)
- **Assignee:** Backend Dev / QA
- **Description:** Comprehensive unit tests for order status business logic
- **Acceptance Criteria:**
  - [ ] File `apps/backend/tests/orderStatus.test.ts`
  - [ ] Test allowed transitions:
    - [ ] PENDING → PROCESSING (success)
    - [ ] PROCESSING → SHIPPED (success)
    - [ ] SHIPPED → DELIVERED (success)
    - [ ] PENDING → CANCELLED (success)
    - [ ] PROCESSING → CANCELLED (success)
  - [ ] Test invalid transitions:
    - [ ] DELIVERED → PROCESSING (400 error)
    - [ ] SHIPPED → PENDING (400 error)
    - [ ] CANCELLED → anything (400 error)
  - [ ] Test inventory restock:
    - [ ] Cancel with restock=true increments inventory correctly
    - [ ] Cancel with restock=false leaves inventory unchanged
    - [ ] Restock is idempotent (calling twice doesn't double-increment)
  - [ ] Test audit logging:
    - [ ] OrderActivity created on every status change
    - [ ] adminId, fromStatus, toStatus recorded correctly
  - [ ] Test concurrency:
    - [ ] Simulate two concurrent updates → one succeeds, other gets 409
  - [ ] Mock Prisma client, isolate business logic
- **Dependencies:** BE-18
- **Files:** `apps/backend/tests/orderStatus.test.ts`

#### BE-21: Write integration API tests
- **ID:** BE-21
- **Estimate:** 1d (8h)
- **Assignee:** Backend Dev / QA
- **Description:** Integration tests for full API flows with test database
- **Acceptance Criteria:**
  - [ ] File `apps/backend/tests/api/adminOrders.test.ts`
  - [ ] Test happy path: PENDING → PROCESSING → SHIPPED → DELIVERED
  - [ ] Test cancel with restock: verify inventory incremented in DB
  - [ ] Test cancel without restock: inventory unchanged
  - [ ] Test invalid transition returns 400 with error message
  - [ ] Test unauthorized request returns 401
  - [ ] Test idempotency: same Idempotency-Key returns cached result
  - [ ] Test concurrent updates: use Promise.all to simulate race condition
  - [ ] Use test DB (separate from dev/prod)
  - [ ] Seed test data before each test, clean up after
- **Dependencies:** BE-20
- **Files:** `apps/backend/tests/api/adminOrders.test.ts`

---

### Frontend Admin UI (FE)

#### FE-24: Create OrderStatusBadge component
- **ID:** FE-24
- **Estimate:** 4h
- **Assignee:** Frontend Dev
- **Description:** Reusable badge component to display order status with color coding
- **Acceptance Criteria:**
  - [ ] File `apps/frontend/components/OrderStatusBadge.tsx`
  - [ ] Props: `status: OrderStatus`, `size?: 'sm' | 'md' | 'lg'`
  - [ ] Color mapping:
    - [ ] PENDING: gray (`bg-gray-200 text-gray-700`)
    - [ ] PROCESSING: blue (`bg-blue-200 text-blue-700`)
    - [ ] SHIPPED: purple (`bg-purple-200 text-purple-700`)
    - [ ] DELIVERED: green (`bg-green-200 text-green-700`)
    - [ ] CANCELLED: red (`bg-red-200 text-red-700`)
  - [ ] Accessible text (screen readers)
  - [ ] Responsive to size prop
  - [ ] Export TypeScript type for OrderStatus
- **Dependencies:** None (standalone component)
- **Files:** `apps/frontend/components/OrderStatusBadge.tsx`

#### FE-25: Implement "Mark Processing" button
- **ID:** FE-25
- **Estimate:** 6h
- **Assignee:** Frontend Dev
- **Description:** Action button to transition order from PENDING to PROCESSING
- **Acceptance Criteria:**
  - [ ] Button visible only when `order.status === 'PENDING'`
  - [ ] On click: call `PUT /api/admin/orders/:id/status` with `{ status: 'PROCESSING' }`
  - [ ] Optimistic UI update: immediately show PROCESSING badge
  - [ ] Disable button + show loading spinner while API call pending
  - [ ] On success: show success toast "Order marked Processing ✓"
  - [ ] On error: revert optimistic update, show error toast with retry option
  - [ ] Error toast includes descriptive message from API response
  - [ ] Use SWR `mutate()` to revalidate order data after success
- **Dependencies:** BE-18, FE-24
- **Files:** `apps/frontend/pages/admin/orders/[id].tsx` or `components/OrderActions/MarkProcessingButton.tsx`

#### FE-26: Implement "Mark Shipped" button with modal
- **ID:** FE-26
- **Estimate:** 1d (8h)
- **Assignee:** Frontend Dev
- **Description:** Action button + modal to transition order to SHIPPED with tracking info
- **Acceptance Criteria:**
  - [ ] Button visible only when `order.status === 'PROCESSING'`
  - [ ] On click: open modal with form
  - [ ] Modal form fields:
    - [ ] `trackingNumber` (text input, optional)
    - [ ] `carrier` (dropdown: USPS, FedEx, UPS, Other, optional)
    - [ ] `shipDate` (date picker, default: today, optional)
  - [ ] Form validation: basic checks (no required fields for MVP)
  - [ ] On submit: call `PUT /api/admin/orders/:id/status` with form data + `{ status: 'SHIPPED' }`
  - [ ] Optimistic UI: update badge to SHIPPED immediately
  - [ ] On success: close modal, show toast "Order marked Shipped ✓"
  - [ ] On failure: revert optimistic state, show error toast
  - [ ] Modal accessible (Esc to close, focus trap, Tab navigation)
  - [ ] Use Headless UI or Radix UI for modal (optional)
- **Dependencies:** BE-18, FE-24
- **Files:** `apps/frontend/components/OrderActions/MarkShippedButton.tsx`, `apps/frontend/components/OrderActions/MarkShippedModal.tsx`

#### FE-27: Implement "Mark Delivered" button with confirmation
- **ID:** FE-27
- **Estimate:** 6h
- **Assignee:** Frontend Dev
- **Description:** Action button to transition order to DELIVERED (terminal state)
- **Acceptance Criteria:**
  - [ ] Button visible only when `order.status === 'SHIPPED'`
  - [ ] On click: show confirmation dialog "Confirm mark order as Delivered?"
  - [ ] Optional: date picker for `deliveryDate` (default: today)
  - [ ] On confirm: call `PUT /api/admin/orders/:id/status` with `{ status: 'DELIVERED' }`
  - [ ] Optimistic UI update
  - [ ] Disable ALL action buttons after DELIVERED (terminal state)
  - [ ] On success: show toast "Order marked Delivered ✓"
  - [ ] On failure: revert optimistic state, show error
  - [ ] Confirmation dialog accessible (keyboard navigation)
- **Dependencies:** BE-18, FE-24
- **Files:** `apps/frontend/components/OrderActions/MarkDeliveredButton.tsx`

#### FE-28: Implement "Cancel Order" button with strong confirmation
- **ID:** FE-28
- **Estimate:** 1d (8h)
- **Assignee:** Frontend Dev
- **Description:** Destructive action button to cancel order with optional inventory restock
- **Acceptance Criteria:**
  - [ ] Button visible only when `order.status === 'PENDING'` or `'PROCESSING'`
  - [ ] Red/destructive styling (`bg-red-600 text-white`)
  - [ ] On click: open confirmation modal with:
    - [ ] Checkbox: "Also restock inventory to products"
    - [ ] Text area: `cancellationReason` (required, min 10 chars)
    - [ ] Warning text: "This action cannot be undone"
    - [ ] Preview: list items that will be restocked (if checkbox checked)
  - [ ] Form validation: require cancellationReason
  - [ ] On confirm: call `PUT /api/admin/orders/:id/status` with `{ status: 'CANCELLED', restock: boolean, cancellationReason: string }`
  - [ ] Optimistic UI update to CANCELLED badge
  - [ ] On success: show toast "Order cancelled — inventory restocked" (if restock=true) or "Order cancelled"
  - [ ] On failure: revert optimistic state, show descriptive error (e.g., "Product no longer exists, cannot restock")
  - [ ] Error handling for partial failures
  - [ ] Modal accessible (focus trap, keyboard nav)
- **Dependencies:** BE-18, FE-24
- **Files:** `apps/frontend/components/OrderActions/CancelOrderButton.tsx`, `apps/frontend/components/OrderActions/CancelOrderModal.tsx`

#### FE-29: Implement "Print Order" button
- **ID:** FE-29
- **Estimate:** 4h
- **Assignee:** Frontend Dev
- **Description:** Client-side print functionality for order details
- **Acceptance Criteria:**
  - [ ] Button always visible to admin (no status restriction)
  - [ ] On click: open new window/tab with printable order view
  - [ ] Printable view includes: order ID, buyer info, items list, totals, order status
  - [ ] CSS print media queries for clean printing
  - [ ] Remove navigation, action buttons from print view
  - [ ] Use `window.print()` or generate printable HTML route `/admin/orders/[id]/print`
  - [ ] No backend changes required (client-only)
  - [ ] Button icon: printer SVG
- **Dependencies:** None (uses existing order data)
- **Files:** `apps/frontend/components/OrderActions/PrintOrderButton.tsx`, `apps/frontend/pages/admin/orders/[id]/print.tsx` (optional)

#### FE-30: Create Order Activity Timeline component
- **ID:** FE-30
- **Estimate:** 1d (8h)
- **Assignee:** Frontend Dev
- **Description:** Display chronological history of order status changes
- **Acceptance Criteria:**
  - [ ] File `apps/frontend/components/OrderActivityTimeline.tsx`
  - [ ] Fetch data from `GET /api/admin/orders/:id/activities`
  - [ ] Display list of activities with:
    - [ ] Timestamp (formatted: "Jan 22, 2026 14:35")
    - [ ] Admin username
    - [ ] Status transition: "Changed from PENDING to PROCESSING"
    - [ ] Note/reason (if exists)
  - [ ] Visual timeline design (vertical line with dots)
  - [ ] Most recent activity at top
  - [ ] Loading state, error state, empty state
  - [ ] Auto-refresh after status change action (listen to SWR revalidation)
  - [ ] Collapse/expand long notes
- **Dependencies:** BE-19
- **Files:** `apps/frontend/components/OrderActivityTimeline.tsx`

#### FE-31: Add concurrent update detection UI
- **ID:** FE-31
- **Estimate:** 4h
- **Assignee:** Frontend Dev
- **Description:** Handle 409 conflict responses and stale order data
- **Acceptance Criteria:**
  - [ ] Catch 409 status from API responses
  - [ ] Show banner at top of order detail page: "⚠️ This order changed since you opened it. [Refresh Page]"
  - [ ] Banner styled with warning color (yellow/orange)
  - [ ] "Refresh Page" button triggers SWR revalidation
  - [ ] Optional: poll for updates every 30s when order detail page is open (use SWR `refreshInterval`)
  - [ ] Display "Last updated: X seconds ago" timestamp
  - [ ] Clear banner after successful refresh
- **Dependencies:** BE-18 (returns 409)
- **Files:** `apps/frontend/pages/admin/orders/[id].tsx`, `apps/frontend/components/ConflictBanner.tsx`

#### FE-32: Implement optimistic UI patterns
- **ID:** FE-32
- **Estimate:** 4h
- **Assignee:** Frontend Dev
- **Description:** Consistent optimistic UI behavior across all action buttons
- **Acceptance Criteria:**
  - [ ] Disable ALL action buttons while any API call is pending
  - [ ] Show loading spinner on clicked button
  - [ ] Optimistic update applied immediately (status badge changes)
  - [ ] Revert UI state on error with clear feedback
  - [ ] Use SWR `optimisticData` option or local state management
  - [ ] Prevent double-clicks with debouncing (500ms)
  - [ ] Loading state shows "Processing..." text on button
  - [ ] After success, re-enable buttons based on new status
- **Dependencies:** FE-25, FE-26, FE-27, FE-28
- **Files:** `apps/frontend/pages/admin/orders/[id].tsx`, `apps/frontend/hooks/useOptimisticOrderUpdate.ts`

---

### Testing (QA)

#### TEST-11: E2E Playwright tests for order status management
- **ID:** TEST-11
- **Estimate:** 2d (16h)
- **Assignee:** QA Engineer / Frontend Dev
- **Description:** End-to-end tests covering all admin order status flows
- **Acceptance Criteria:**
  - [ ] File `e2e/admin-order-status.spec.ts`
  - [ ] Test: Admin marks order as Processing → verify badge updates, activity logged
  - [ ] Test: Admin marks order as Shipped with tracking → verify modal, tracking saved, activity logged
  - [ ] Test: Admin marks order as Delivered → verify confirmation, final state, no more actions
  - [ ] Test: Admin cancels order with restock → verify cancellation, inventory incremented in DB
  - [ ] Test: Print order → verify printable view opens
  - [ ] Test: View activity timeline → verify history displayed correctly with admin names
  - [ ] Test: Concurrent update conflict → verify 409 banner shown
  - [ ] Test: Invalid transition blocked → verify 400 error message
  - [ ] Run in CI against test deployment or local docker-compose
  - [ ] Use Playwright fixtures for test data setup/teardown
- **Dependencies:** BE-18, FE-25, FE-26, FE-27, FE-28, FE-30
- **Files:** `e2e/admin-order-status.spec.ts`

#### TEST-12: Accessibility tests
- **ID:** TEST-12
- **Estimate:** 6h
- **Assignee:** Frontend Dev / QA
- **Description:** Verify WCAG 2.1 AA compliance for order management UI
- **Acceptance Criteria:**
  - [ ] All action buttons have descriptive `aria-label` (e.g., "Mark order #123 as shipped")
  - [ ] Keyboard navigation: Tab through buttons, Enter/Space activates
  - [ ] Modal focus trap: Tab cycles within modal, Esc closes
  - [ ] After modal close, focus returns to trigger button
  - [ ] Loading states announced: `aria-busy="true"`, `aria-live="polite"` for status updates
  - [ ] Error messages have `role="alert"` for immediate screen reader announcement
  - [ ] OrderStatusBadge has accessible text (not just color)
  - [ ] Timeline has semantic HTML: `<ol>`, `<li>`, `<time>`
  - [ ] Run axe-core or Lighthouse accessibility audit (score ≥95)
  - [ ] Test with keyboard only (no mouse)
  - [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
- **Dependencies:** FE-25, FE-26, FE-27, FE-28, FE-30
- **Files:** `apps/frontend/tests/accessibility/orderActions.test.tsx`

#### TEST-13: Component tests (React Testing Library)
- **ID:** TEST-13
- **Estimate:** 1d (8h)
- **Assignee:** Frontend Dev
- **Description:** Unit tests for React components
- **Acceptance Criteria:**
  - [ ] File `apps/frontend/tests/components/OrderStatusBadge.test.tsx`
    - [ ] Renders correct color for each status
    - [ ] Renders correct text
  - [ ] File `apps/frontend/tests/components/OrderActions.test.tsx`
    - [ ] Action buttons visibility based on order status
    - [ ] Modal opens on button click
    - [ ] Form validation works
    - [ ] API call triggered with correct payload
  - [ ] File `apps/frontend/tests/components/OrderActivityTimeline.test.tsx`
    - [ ] Renders activity list correctly
    - [ ] Displays admin usernames
    - [ ] Formats timestamps
    - [ ] Shows empty state when no activities
  - [ ] Mock API responses with MSW (Mock Service Worker)
  - [ ] Test optimistic UI state transitions
  - [ ] Test error state rendering
  - [ ] All tests pass in CI
- **Dependencies:** FE-24, FE-25, FE-26, FE-27, FE-28, FE-30
- **Files:** `apps/frontend/tests/components/*.test.tsx`

---

### Documentation (DOC)

#### DOC-03: Update API_TESTING.md with new endpoints
- **ID:** DOC-03
- **Estimate:** 4h
- **Assignee:** Backend Dev
- **Description:** Document new order status management endpoints
- **Acceptance Criteria:**
  - [ ] File `API_TESTING.md` updated
  - [ ] Add section: "Order Status Management (Admin)"
  - [ ] Document `PUT /api/admin/orders/:id/status`:
    - [ ] Request body examples for each transition
    - [ ] Idempotency-Key header usage
    - [ ] Response examples (success, 400, 409)
    - [ ] Curl examples
  - [ ] Document `GET /api/admin/orders/:id/activities`:
    - [ ] Response format
    - [ ] Curl example
  - [ ] Explain restock behavior and idempotency
  - [ ] List allowed status transitions
  - [ ] Error codes and meanings
- **Dependencies:** BE-18, BE-19
- **Files:** `API_TESTING.md`

#### DOC-04: Update README with Order Management feature
- **ID:** DOC-04
- **Estimate:** 2h
- **Assignee:** Tech Lead / PM
- **Description:** Add Order Management feature to main README
- **Acceptance Criteria:**
  - [ ] File `README.md` updated
  - [ ] Add section: "Features > Order Management"
  - [ ] Describe admin capabilities: status transitions, tracking, cancellation, restock
  - [ ] Add screenshot of admin order detail page (optional)
  - [ ] Link to API_TESTING.md for technical details
  - [ ] Update tech stack section if new dependencies added
- **Dependencies:** All Sprint 6 tasks done
- **Files:** `README.md`

#### DOC-05: Add inline code comments for complex logic
- **ID:** DOC-05
- **Estimate:** 2h
- **Assignee:** Backend Dev
- **Description:** Document complex business logic in code
- **Acceptance Criteria:**
  - [ ] Add JSDoc comments to `PUT /api/admin/orders/:id/status` handler
  - [ ] Explain transition validation logic
  - [ ] Explain inventory restock atomicity
  - [ ] Explain idempotency implementation
  - [ ] Explain FOR UPDATE lock usage
  - [ ] Add comments to Prisma transaction steps
  - [ ] Add type definitions with TSDoc
- **Dependencies:** BE-18
- **Files:** `apps/backend/pages/api/admin/orders/[id].ts`

---

### Sprint 6 Summary

**Total tasks:** 28 tasks

**Estimated effort:**
- DB: 7h (3 tasks)
- Backend: 5.5d + 8h = 52h (5 tasks)
- Frontend: 6d + 16h = 64h (9 tasks)
- Testing: 3d + 6h = 30h (3 tasks)
- Documentation: 8h (3 tasks)
- **Total: ~153 hours (~3-4 weeks for 1 dev, or 2 weeks for 2 devs)**

**Dependencies:**
- DB-18/19/20 must be done first (schema + migration)
- BE-18/19 can proceed in parallel after DB done
- FE tasks depend on BE-18/19
- Testing depends on both BE + FE
- Docs can be done alongside implementation

**Critical path:**
1. DB-18/19/20 (schema + migration) — 1 day
2. BE-18 (status endpoint) — 2 days
3. BE-19 (activities endpoint) — 0.5 days
4. FE-24-32 (UI components + actions) — 5-6 days
5. TEST-11-13 (E2E + accessibility + unit) — 3 days
6. DOC-03-05 (documentation) — 1 day

**Risks:**
- Inventory restock idempotency logic is complex → allocate extra time for testing
- Concurrency handling requires careful DB transaction design → review with senior dev
- UI optimistic updates can get out of sync → implement robust error handling

---

## Documentation (DOC)

#### DOC-01: Update README.md
- **ID:** DOC-01
- **Estimate:** 2h
- **Assignee:** Tech Lead
- **Description:** Write comprehensive README
- **Acceptance Criteria:**
  - [ ] Project description
  - [ ] Tech stack
  - [ ] Setup instructions (local)
  - [ ] Run commands
  - [ ] Environment variables
  - [ ] Deployment instructions
  - [ ] Screenshots (optional)
- **Dependencies:** All done
- **Files:** `README.md`

#### DOC-02: API documentation
- **ID:** DOC-02
- **Estimate:** 4h
- **Assignee:** Backend Dev
- **Description:** Document API endpoints
- **Acceptance Criteria:**
  - [ ] List all endpoints (public + admin)
  - [ ] Request/response examples
  - [ ] Error codes
  - [ ] OpenAPI/Swagger YAML (optional)
- **Dependencies:** All BE done
- **Files:** `docs/API.md` or `openapi.yaml`

---

## Sprint 7: Analytics & Inventory Management Dashboard

### Database Updates (DB)

#### DB-04: Add analytics performance indexes
- **ID:** DB-04
- **Estimate:** 1h
- **Assignee:** Backend Dev
- **Description:** Add composite indexes to Prisma schema for analytics queries
- **Acceptance Criteria:**
  - [x] Add `@@index([categoryId, published])` to Product model
  - [x] Add `@@index([inventory])` to Product model
  - [x] Add `@@index([createdAt, status])` to Order model
  - [x] Add `@@index([productId])` to OrderItem model
  - [x] Generate migration with `npx prisma migrate dev --name add_analytics_indexes`
  - [x] Migration applied successfully
- **Dependencies:** Existing schema
- **Files:** `apps/backend/prisma/schema.postgres.prisma`, `prisma/migrations/*/migration.sql`
- **Status:** ✅ Completed

---

### Backend Analytics API (BE)

#### BE-27: Implement GET /api/admin/analytics/dashboard
- **ID:** BE-27
- **Estimate:** 2 days (16h)
- **Assignee:** Backend Dev
- **Description:** Create comprehensive dashboard analytics endpoint with aggregated stats
- **Acceptance Criteria:**
  - [ ] File `apps/backend/pages/api/admin/analytics/dashboard.ts`
  - [ ] Protected with `requireAdmin` middleware
  - [ ] Query params: `startDate`, `endDate` (default: last 30 days)
  - [ ] Response includes:
    - Products: `{ total, published, unpublished }`
    - Inventory: `{ totalUnits, byCategory[], lowStock[] }`
    - Revenue: `{ totalRevenue, totalOrders, averageOrderValue, byMonth[], topProducts[] }`
    - Orders: `{ total, confirmed, processing, shipped, delivered, cancelled, failed }`
  - [ ] Use parallel Promise.all() for performance
  - [ ] Use PostgreSQL `$queryRaw` for monthly revenue and top products
  - [ ] Filter only confirmed orders (CONFIRMED, PROCESSING, SHIPPED, DELIVERED)
  - [ ] Low stock threshold: inventory <= 5
  - [ ] Return 401 for unauthenticated requests
  - [ ] Return 400 for invalid date formats
  - [ ] Response time < 500ms with typical dataset (100 products, 500 orders)
- **Dependencies:** BE-02 (Prisma client), DB-04 (indexes)
- **Files:** `apps/backend/pages/api/admin/analytics/dashboard.ts`
- **Reference:** See `ANALYTICS_IMPLEMENTATION.md` for full code example

#### BE-28: Implement GET /api/admin/analytics/revenue
- **ID:** BE-28
- **Estimate:** 2 days (16h)
- **Assignee:** Backend Dev
- **Description:** Create revenue analytics endpoint with 4 groupBy modes
- **Acceptance Criteria:**
  - [ ] File `apps/backend/pages/api/admin/analytics/revenue.ts`
  - [ ] Protected with `requireAdmin` middleware
  - [ ] Query params: `groupBy` (required), `startDate`, `endDate`, `limit`, `offset`, `sortBy`, `sortOrder`
  - [ ] Zod validation for query parameters
  - [ ] Support groupBy modes:
    - `order`: Individual orders with pagination (id, buyerName, revenue, itemCount, status, createdAt)
    - `product`: Revenue per product (productId, name, slug, categoryName, revenue, unitsSold, orderCount)
    - `month`: Monthly aggregation (month, year, revenue, orderCount, averageOrderValue)
    - `category`: Revenue per category (categoryId, name, slug, revenue, unitsSold, orderCount, productCount)
  - [ ] All modes return `{ data, total, page?, limit?, summary }`
  - [ ] Filter only confirmed orders (CONFIRMED, PROCESSING, SHIPPED, DELIVERED)
  - [ ] Use `$queryRaw` for complex aggregations
  - [ ] Support pagination for order/product modes
  - [ ] Return 400 for invalid groupBy value
- **Dependencies:** BE-02, DB-04
- **Files:** `apps/backend/pages/api/admin/analytics/revenue.ts`
- **Reference:** See `ANALYTICS_IMPLEMENTATION.md` for code examples

#### BE-29: Implement GET /api/admin/analytics/inventory
- **ID:** BE-29
- **Estimate:** 1.5 days (12h)
- **Assignee:** Backend Dev
- **Description:** Create inventory analytics endpoint with 3 groupBy modes
- **Acceptance Criteria:**
  - [ ] File `apps/backend/pages/api/admin/analytics/inventory.ts`
  - [ ] Protected with `requireAdmin` middleware
  - [ ] Query params: `groupBy` (default: category), `lowStockThreshold` (default: 5), `includeUnpublished` (default: false)
  - [ ] Support groupBy modes:
    - `category`: Total units per category (categoryId, name, slug, totalUnits, productCount, publishedProducts, unpublishedProducts, averageInventory, lowStockProducts)
    - `product`: Product-level inventory (productId, name, slug, categoryName, inventory, published, isLowStock, price)
    - `status`: Aggregate by published status ({ published: {}, unpublished: {} })
  - [ ] All modes return `{ data, summary: { totalUnits, totalProducts } }`
  - [ ] Low stock flag: `inventory <= lowStockThreshold`
  - [ ] Sort products by inventory ASC for low stock visibility
  - [ ] Return 400 for invalid groupBy value
- **Dependencies:** BE-02, DB-04
- **Files:** `apps/backend/pages/api/admin/analytics/inventory.ts`
- **Reference:** See `ANALYTICS_IMPLEMENTATION.md`

#### BE-30: Add analytics error handling and validation
- **ID:** BE-30
- **Estimate:** 0.5 day (4h)
- **Assignee:** Backend Dev
- **Description:** Add comprehensive validation and error handling for analytics endpoints
- **Acceptance Criteria:**
  - [ ] Zod schemas for query parameter validation (all 3 endpoints)
  - [ ] Validate date formats (ISO 8601) with proper error messages
  - [ ] Validate enum values (groupBy, sortBy, sortOrder)
  - [ ] Handle invalid query parameters → 400 with descriptive errors
  - [ ] Database query timeout handling (10s limit)
  - [ ] Log slow queries (>100ms) to console with query details
  - [ ] Catch and handle Prisma errors gracefully → 500 with generic message
  - [ ] Add try-catch blocks in all endpoints
- **Dependencies:** BE-27, BE-28, BE-29
- **Files:** All 3 analytics endpoint files

---

### Backend Testing (TEST)

#### TEST-14: Unit tests for analytics aggregation functions
- **ID:** TEST-14
- **Estimate:** 1.5 days (12h)
- **Assignee:** Backend Dev
- **Description:** Write unit tests for analytics business logic
- **Acceptance Criteria:**
  - [ ] File `apps/backend/tests/api/analytics.test.ts`
  - [ ] Test revenue calculation accuracy (sum of order totals)
  - [ ] Test inventory aggregation by category
  - [ ] Test low stock filtering logic (inventory <= threshold)
  - [ ] Test date range filtering (edge cases: same day, future dates)
  - [ ] Mock Prisma client with test data using Vitest
  - [ ] All tests pass with `yarn test`
  - [ ] Test coverage ≥ 80% for analytics code
- **Dependencies:** BE-27, BE-28, BE-29
- **Files:** `apps/backend/tests/api/analytics.test.ts`

#### TEST-15: Integration API tests for analytics endpoints
- **ID:** TEST-15
- **Estimate:** 1 day (8h)
- **Assignee:** Backend Dev
- **Description:** Write integration tests for all 3 analytics endpoints
- **Acceptance Criteria:**
  - [ ] Test dashboard endpoint returns all expected fields (products, inventory, revenue, orders)
  - [ ] Test revenue endpoint with each groupBy mode (order, product, month, category)
  - [ ] Test inventory endpoint with each groupBy mode (category, product, status)
  - [ ] Test pagination and sorting work correctly
  - [ ] Test date range filters with edge cases
  - [ ] Test with empty database (zero orders/products) → returns empty arrays
  - [ ] Test unauthorized requests return 401
  - [ ] Test invalid parameters return 400 with error details
  - [ ] All tests use test database (not dev/production)
- **Dependencies:** BE-27, BE-28, BE-29, BE-30
- **Files:** `apps/backend/tests/api/analytics.integration.test.ts`

#### TEST-16: Performance tests for analytics
- **ID:** TEST-16
- **Estimate:** 0.5 day (4h)
- **Assignee:** Backend Dev
- **Description:** Benchmark analytics endpoints with realistic dataset
- **Acceptance Criteria:**
  - [ ] Seed test DB with 100+ products, 1000+ orders
  - [ ] Benchmark dashboard query execution time < 500ms (p95)
  - [ ] Benchmark revenue/inventory queries < 300ms (p95)
  - [ ] Test concurrent requests (10 simultaneous dashboard calls)
  - [ ] Verify no N+1 query issues (check Prisma query logs)
  - [ ] Document performance results in test output
- **Dependencies:** BE-27, BE-28, BE-29, DB-04 (indexes required for performance)
- **Files:** `apps/backend/tests/api/analytics.performance.test.ts`

---

### Frontend Dashboard (FE)

#### FE-33: Update /admin/dashboard page structure
- **ID:** FE-33
- **Estimate:** 1 day (8h)
- **Assignee:** Frontend Dev
- **Description:** Refactor admin dashboard page with new analytics structure
- **Acceptance Criteria:**
  - [ ] Update `apps/frontend/pages/admin/dashboard.tsx`
  - [ ] Create TypeScript interfaces for dashboard data types
  - [ ] Add date range selector component (Last 7/30 days, This Month, Last Month, Custom)
  - [ ] Add loading states with skeleton screens (Tailwind CSS shimmer)
  - [ ] Add error boundary with retry functionality
  - [ ] Page layout: Header with date selector → Stats cards grid → Tables sections
  - [ ] Responsive layout (mobile, tablet, desktop)
- **Dependencies:** None (UI structure only)
- **Files:** `apps/frontend/pages/admin/dashboard.tsx`

#### FE-34: Implement Stats Cards Grid
- **ID:** FE-34
- **Estimate:** 0.5 day (4h)
- **Assignee:** Frontend Dev
- **Description:** Create 4 stats cards with key metrics
- **Acceptance Criteria:**
  - [ ] Card 1: Total Products (show published/unpublished split)
  - [ ] Card 2: Total Inventory (show total units + low stock badge)
  - [ ] Card 3: Total Orders (show total + confirmed count)
  - [ ] Card 4: Revenue (show total + avg order value in VND)
  - [ ] Color-coded with emoji icons (📦, 📊, 🛍️, 💰)
  - [ ] Responsive grid: 1 col mobile, 2 col tablet, 4 col desktop
  - [ ] Tailwind CSS styling with hover effects
  - [ ] Loading skeleton for each card
- **Dependencies:** FE-33
- **Files:** `apps/frontend/pages/admin/dashboard.tsx`

#### FE-35: Implement Inventory by Category Table
- **ID:** FE-35
- **Estimate:** 1 day (8h)
- **Assignee:** Frontend Dev
- **Description:** Create inventory breakdown table by category
- **Acceptance Criteria:**
  - [ ] Table with columns: Category Name, Total Units, Product Count, Low Stock Count
  - [ ] Sortable columns (click header to sort ASC/DESC)
  - [ ] Click row → navigate to `/admin/products?category={slug}`
  - [ ] Highlight low stock categories with red badge
  - [ ] Responsive: horizontal scroll on mobile
  - [ ] Loading skeleton for table rows
  - [ ] Empty state: "No inventory data available"
- **Dependencies:** FE-33
- **Files:** `apps/frontend/pages/admin/dashboard.tsx`

#### FE-36: Implement Low Stock Alert Section
- **ID:** FE-36
- **Estimate:** 0.5 day (4h)
- **Assignee:** Frontend Dev
- **Description:** Create red-themed alert section for low stock products
- **Acceptance Criteria:**
  - [ ] Red background with warning icon ⚠️
  - [ ] Table: Product Name, Category, Current Stock
  - [ ] Sort by inventory ASC (lowest stock first)
  - [ ] "Edit" button for each product → navigate to edit page
  - [ ] Conditional rendering (only show if lowStock.length > 0)
  - [ ] Responsive table layout
- **Dependencies:** FE-33
- **Files:** `apps/frontend/pages/admin/dashboard.tsx`

#### FE-37: Implement Top Products by Revenue Table
- **ID:** FE-37
- **Estimate:** 0.5 day (4h)
- **Assignee:** Frontend Dev
- **Description:** Create table showing top 10 products by revenue
- **Acceptance Criteria:**
  - [ ] Table columns: Product Name, Revenue (VND), Units Sold, Order Count
  - [ ] Top 10 products by default
  - [ ] Vietnamese currency formatting: `toLocaleString('vi-VN')` + ₫ symbol
  - [ ] Click product name → navigate to `/admin/products/{id}/edit`
  - [ ] Responsive table
  - [ ] Loading skeleton
- **Dependencies:** FE-33
- **Files:** `apps/frontend/pages/admin/dashboard.tsx`

#### FE-38: Implement Monthly Revenue Table
- **ID:** FE-38
- **Estimate:** 1 day (8h)
- **Assignee:** Frontend Dev
- **Description:** Create table showing monthly revenue trends
- **Acceptance Criteria:**
  - [ ] Table columns: Month, Revenue (VND), Orders, Avg Order Value
  - [ ] Last 6 months by default
  - [ ] Vietnamese month names (Tháng 1, Tháng 2, etc.)
  - [ ] Currency formatting for all money columns
  - [ ] Optional: Add line/bar chart visualization (if chart library added)
  - [ ] Fallback: Clean HTML table if no chart
  - [ ] Responsive layout
- **Dependencies:** FE-33
- **Files:** `apps/frontend/pages/admin/dashboard.tsx`

#### FE-39: Implement data fetching with SWR
- **ID:** FE-39
- **Estimate:** 0.5 day (4h)
- **Assignee:** Frontend Dev
- **Description:** Integrate SWR for dashboard data fetching
- **Acceptance Criteria:**
  - [ ] Fetch `/api/admin/analytics/dashboard` on component mount
  - [ ] Pass JWT token in Authorization header
  - [ ] Revalidate on window focus
  - [ ] Handle loading state (show skeletons)
  - [ ] Handle error state (show error message + retry button)
  - [ ] Cache with 5-minute TTL (SWR config)
  - [ ] Manual refresh button to force refetch (mutate)
  - [ ] Update date range → refetch with new query params
- **Dependencies:** FE-33, BE-27
- **Files:** `apps/frontend/pages/admin/dashboard.tsx`

#### FE-40: Add date range picker component (Optional)
- **ID:** FE-40
- **Estimate:** 1 day (8h)
- **Assignee:** Frontend Dev
- **Description:** Create advanced date range picker with presets
- **Acceptance Criteria:**
  - [ ] Dropdown with presets: Last 7 days, Last 30 days, This Month, Last Month
  - [ ] Custom date range with calendar picker (react-datepicker or native input)
  - [ ] Update URL query params on selection (shareable links)
  - [ ] Display selected range in header
  - [ ] Apply button to trigger refetch
  - [ ] Responsive design
- **Dependencies:** FE-33, FE-39
- **Files:** `apps/frontend/components/DateRangePicker.tsx`, `apps/frontend/pages/admin/dashboard.tsx`
- **Priority:** Low (nice-to-have)

#### FE-41: Create /admin/analytics navigation (Optional)
- **ID:** FE-41
- **Estimate:** 0.5 day (4h)
- **Assignee:** Frontend Dev
- **Description:** Add analytics submenu to admin navigation
- **Acceptance Criteria:**
  - [ ] Update admin layout/navigation component
  - [ ] Add "Analytics" menu item with submenu
  - [ ] Submenu items: Dashboard, Revenue, Inventory
  - [ ] Highlight active page
  - [ ] Placeholder pages for Revenue/Inventory (future sprint)
- **Dependencies:** FE-33
- **Files:** `apps/frontend/components/Layout.tsx` or admin nav component
- **Priority:** Low

#### FE-42: Add responsive design for mobile/tablet
- **ID:** FE-42
- **Estimate:** 1 day (8h)
- **Assignee:** Frontend Dev
- **Description:** Optimize dashboard for mobile and tablet screens
- **Acceptance Criteria:**
  - [ ] Stats cards: 1 column on mobile, 2 on tablet, 4 on desktop
  - [ ] Tables: horizontal scroll on mobile with sticky first column
  - [ ] Collapsible sections on mobile (accordion style)
  - [ ] Touch-friendly buttons (min 44px touch target)
  - [ ] Test on real devices or browser dev tools
  - [ ] No horizontal scroll on viewport (overflow handled properly)
- **Dependencies:** FE-34 to FE-38
- **Files:** `apps/frontend/pages/admin/dashboard.tsx`

#### FE-43: Add loading skeletons
- **ID:** FE-43
- **Estimate:** 0.5 day (4h)
- **Assignee:** Frontend Dev
- **Description:** Create loading skeleton components for better UX
- **Acceptance Criteria:**
  - [ ] Skeleton for stat cards (shimmer effect with Tailwind)
  - [ ] Skeleton for table rows (5-10 placeholder rows)
  - [ ] Smooth transition from skeleton to actual content
  - [ ] Match skeleton shape to real content
  - [ ] Use `animate-pulse` for shimmer
- **Dependencies:** FE-34 to FE-38
- **Files:** `apps/frontend/components/Skeleton.tsx`, `apps/frontend/pages/admin/dashboard.tsx`

#### FE-44: Implement error states with retry
- **ID:** FE-44
- **Estimate:** 0.5 day (4h)
- **Assignee:** Frontend Dev
- **Description:** Add comprehensive error handling UI
- **Acceptance Criteria:**
  - [ ] Network error → Show "Failed to load dashboard. [Retry]" button
  - [ ] Empty state → "No data available for selected date range"
  - [ ] 401 error → Redirect to login page
  - [ ] Retry button triggers SWR mutate() to refetch
  - [ ] Error message styling (red border, icon)
  - [ ] Accessible error messages (aria-live="polite")
- **Dependencies:** FE-39
- **Files:** `apps/frontend/pages/admin/dashboard.tsx`

---

### Frontend Testing (TEST)

#### TEST-17: Component tests for dashboard sections
- **ID:** TEST-17
- **Estimate:** 1.5 days (12h)
- **Assignee:** Frontend Dev
- **Description:** Write component tests for dashboard with React Testing Library
- **Acceptance Criteria:**
  - [ ] File `apps/frontend/tests/components/Dashboard.test.tsx`
  - [ ] Test stats cards render with correct data
  - [ ] Test tables render and sort correctly
  - [ ] Test date range selector updates API calls
  - [ ] Test loading states display skeletons
  - [ ] Test error states show error message + retry
  - [ ] Mock API responses with MSW (Mock Service Worker) or similar
  - [ ] All tests pass with `yarn test`
- **Dependencies:** FE-34 to FE-44
- **Files:** `apps/frontend/tests/components/Dashboard.test.tsx`

#### TEST-18: E2E tests for analytics dashboard
- **ID:** TEST-18
- **Estimate:** 1 day (8h)
- **Assignee:** Frontend Dev or QA
- **Description:** Write E2E tests with Playwright for analytics dashboard
- **Acceptance Criteria:**
  - [ ] File `e2e/admin-analytics.spec.ts`
  - [ ] Test: Admin logs in → dashboard loads with data
  - [ ] Test: Click date range selector → data updates
  - [ ] Test: Click category row → navigates to products page
  - [ ] Test: Low stock alert displays when threshold met
  - [ ] Test: All tables render correctly
  - [ ] Test: Refresh button refetches data
  - [ ] Run with `yarn test:e2e`
- **Dependencies:** FE-39, BE-27
- **Files:** `e2e/admin-analytics.spec.ts`

#### TEST-19: Visual regression tests (Optional)
- **ID:** TEST-19
- **Estimate:** 0.5 day (4h)
- **Assignee:** Frontend Dev
- **Description:** Add screenshot comparison for dashboard layout
- **Acceptance Criteria:**
  - [ ] Use Playwright screenshot comparison
  - [ ] Capture dashboard in desktop, tablet, mobile viewports
  - [ ] Ensure charts/tables render consistently
  - [ ] Update snapshots when layout changes intentionally
- **Dependencies:** TEST-18
- **Files:** `e2e/admin-analytics.spec.ts`
- **Priority:** Low

---

### Documentation (DOC)

#### DOC-07: Update API_TESTING.md with analytics endpoints
- **ID:** DOC-07
- **Estimate:** 0.5 day (4h)
- **Assignee:** Backend Dev
- **Description:** Document new analytics API endpoints for testing
- **Acceptance Criteria:**
  - [ ] Add curl examples for `/api/admin/analytics/dashboard`
  - [ ] Add curl examples for `/api/admin/analytics/revenue` (all groupBy modes)
  - [ ] Add curl examples for `/api/admin/analytics/inventory` (all groupBy modes)
  - [ ] Document query parameters and response formats
  - [ ] Add example responses with sample data
  - [ ] Include authentication header examples
- **Dependencies:** BE-27, BE-28, BE-29
- **Files:** `API_TESTING.md`

#### DOC-08: Update README.md with analytics feature
- **ID:** DOC-08
- **Estimate:** 0.25 day (2h)
- **Assignee:** Tech Lead or Backend Dev
- **Description:** Add analytics feature description to README
- **Acceptance Criteria:**
  - [ ] Add "Analytics Dashboard" section
  - [ ] Mention key metrics available to admin
  - [ ] Add screenshot of dashboard (optional)
  - [ ] Update features list
- **Dependencies:** FE-39 (dashboard implemented)
- **Files:** `README.md`

#### DOC-09: Add inline code comments for complex aggregations
- **ID:** DOC-09
- **Estimate:** 0.5 day (4h)
- **Assignee:** Backend Dev
- **Description:** Document complex PostgreSQL queries and business logic
- **Acceptance Criteria:**
  - [ ] Add JSDoc comments for all analytics functions
  - [ ] Document PostgreSQL `$queryRaw` usage and why (performance)
  - [ ] Explain revenue calculation business logic (which statuses count)
  - [ ] Comment inventory aggregation queries
  - [ ] Add examples of expected input/output
- **Dependencies:** BE-27, BE-28, BE-29
- **Files:** All 3 analytics endpoint files

---

## Task Summary

**Total tasks:** ~105 tasks (including Sprint 7: 25 new tasks)

**Estimated total:** ~450-500 hours

**Sprint breakdown:**
- Sprint 1: ~50h (Foundation)
- Sprint 2: ~40h (Cart & Product Detail)
- Sprint 3: ~35h (Checkout)
- Sprint 4: ~70h (Admin Panel)
- Sprint 5: ~60h (Testing, Polish, Deploy)
- **Sprint 7: ~180h (Analytics & Inventory Management)** — NEW
  - Backend API: ~72h (9 days)
  - Frontend Dashboard: ~88h (11 days)
  - Documentation: ~6h (0.75 day)
  - Testing: ~20h (included in backend/frontend)

**Sprint 7 Task Breakdown:**
- Database: 1 task (✅ completed)
- Backend API: 4 tasks (BE-27 to BE-30)
- Backend Testing: 3 tasks (TEST-14 to TEST-16)
- Frontend Dashboard: 12 tasks (FE-33 to FE-44)
- Frontend Testing: 3 tasks (TEST-17 to TEST-19)
- Documentation: 3 tasks (DOC-07 to DOC-09)

**Priority labels:**
- 🔴 Critical: DB schema, checkout transaction, auth, analytics indexes
- 🟡 High: Core features (product listing, cart, admin CRUD, analytics dashboard)
- 🟢 Medium: Polish, optional features, advanced analytics
- ⚪ Low: Nice-to-have (charts, CSV export, visual regression tests)

**Dependencies map:** See each task's "Dependencies" field

---

## How to use this document

1. **Assign tasks:** Assign task ID to developers trong sprint planning
2. **Track progress:** Check off tasks khi done
3. **Update estimates:** Adjust khi có actual time spent
4. **Add subtasks:** Break down thêm nếu task quá lớn
5. **Link to PRs:** Thêm PR link vào task khi implement

**Export to project management tool:** Copy tasks to Jira/Linear/GitHub Projects với task ID, estimates, dependencies.

**Sprint 7 Quick Start:**
1. ✅ DB-04: Indexes added (completed)
2. Start with BE-27 (dashboard endpoint) - foundational API
3. Parallel: FE-33 (page structure) can start immediately
4. Backend devs: BE-27 → BE-28 → BE-29 → BE-30 → Tests
5. Frontend devs: FE-33 → FE-34 to FE-38 → FE-39 (SWR) → Polish (FE-42 to FE-44)
6. Final: Integration testing (TEST-17, TEST-18) + Documentation (DOC-07 to DOC-09)
