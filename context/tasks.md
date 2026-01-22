# Mini Storefront — Task Breakdown (Chi tiết)

Breakdown chi tiết các task từ `specs.md` và `plan.md` thành các đầu việc cụ thể, có thể assign trực tiếp cho developer. Mỗi task đủ nhỏ để hoàn thành trong 0.5-2 ngày.

---

## Sprint 1: Foundation & Data Setup

### Database & Schema (DB)

#### DB-01: Tạo Prisma schema file
- **ID:** DB-01
- **Estimate:** 2h
- **Assignee:** Backend Dev
- **Description:** Tạo `prisma/schema.prisma` với đầy đủ models: Category, Product, Order, OrderItem, AdminUser
- **Acceptance Criteria:**
  - [ ] File `prisma/schema.prisma` tồn tại
  - [ ] Định nghĩa đầy đủ 5 models với fields, types, relations
  - [ ] Unique constraints cho slug, username
  - [ ] Default values (published=false, timestamps)
- **Dependencies:** None
- **Files:** `prisma/schema.prisma`

#### DB-02: Tạo initial migration
- **ID:** DB-02
- **Estimate:** 1h
- **Assignee:** Backend Dev
- **Description:** Chạy `prisma migrate dev` để tạo migration đầu tiên
- **Acceptance Criteria:**
  - [ ] Migration file được tạo trong `prisma/migrations/`
  - [ ] Tables được tạo trong local Postgres
  - [ ] `prisma generate` chạy thành công
- **Dependencies:** DB-01
- **Files:** `prisma/migrations/*/migration.sql`

#### DB-03: Viết seed script
- **ID:** DB-03
- **Estimate:** 3h
- **Assignee:** Backend Dev
- **Description:** Tạo `prisma/seed.ts` để seed categories, products, admin user
- **Acceptance Criteria:**
  - [ ] Script tạo 2-3 categories (Áo, Quần, Phụ kiện)
  - [ ] Script tạo 5-10 products với giá, inventory, images
  - [ ] Script tạo 1 admin user (username: admin, password hashed)
  - [ ] `npm run seed` chạy thành công
  - [ ] Idempotent: chạy nhiều lần không bị duplicate
- **Dependencies:** DB-02
- **Files:** `prisma/seed.ts`

---

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
  - [ ] Fetch products từ `/api/categories/:slug/products`
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
- **Assignee:** Frontend Dev
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

#### BE-15: API CRUD /api/admin/categories
- **ID:** BE-15
- **Estimate:** 4h
- **Assignee:** Backend Dev
- **Description:** Admin endpoints cho categories
- **Acceptance Criteria:**
  - [ ] GET /api/admin/categories (list all)
  - [ ] POST /api/admin/categories (create)
  - [ ] PUT /api/admin/categories/:id (update)
  - [ ] DELETE /api/admin/categories/:id (delete, check no products)
  - [ ] All protected by auth middleware
- **Dependencies:** BE-10
- **Files:** `apps/backend/pages/api/admin/categories/*.ts`

#### BE-16: API GET /api/admin/orders
- **ID:** BE-16
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
- **Estimate:** 5h
- **Assignee:** Frontend Dev
- **Description:** Tạo trang quản lý categories
- **Acceptance Criteria:**
  - [ ] File `pages/admin/categories.tsx`
  - [ ] Protected route
  - [ ] List categories
  - [ ] Inline create form
  - [ ] Inline edit form
  - [ ] Delete button (confirm)
- **Dependencies:** FE-17, BE-15
- **Files:** `apps/frontend/pages/admin/categories.tsx`

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

#### TEST-04: Frontend unit tests - ProductCard
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

#### TEST-06: Integration test - checkout E2E
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

## Task Summary

**Total tasks:** ~80 tasks

**Estimated total:** ~250-300 hours

**Sprint breakdown:**
- Sprint 1: ~50h (Foundation)
- Sprint 2: ~40h (Cart & Product Detail)
- Sprint 3: ~35h (Checkout)
- Sprint 4: ~70h (Admin Panel)
- Sprint 5: ~60h (Testing, Polish, Deploy)

**Priority labels:**
- 🔴 Critical: DB schema, checkout transaction, auth
- 🟡 High: Core features (product listing, cart, admin CRUD)
- 🟢 Medium: Polish, optional features
- ⚪ Low: Nice-to-have

**Dependencies map:** See each task's "Dependencies" field

---

## How to use this document

1. **Assign tasks:** Assign task ID to developers trong sprint planning
2. **Track progress:** Check off tasks khi done
3. **Update estimates:** Adjust khi có actual time spent
4. **Add subtasks:** Break down thêm nếu task quá lớn
5. **Link to PRs:** Thêm PR link vào task khi implement

**Export to project management tool:** Copy tasks to Jira/Linear/GitHub Projects với task ID, estimates, dependencies.
