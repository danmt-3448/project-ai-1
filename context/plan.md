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

### Sprint 6: Order Management Enhancement (2 weeks) — NEW

**Goal:** Implement comprehensive order status management system for admin with action buttons, audit logging, and inventory reconciliation.

**Deliverables:**

#### Backend API (Priority: High)
- [ ] **BE-18:** Create `OrderActivity` model in Prisma schema
  - Fields: `id`, `orderId`, `adminId`, `fromStatus`, `toStatus`, `note`, `timestamp`
  - Indexes on `orderId` and `timestamp`
  - Relations: `Order.activities[]`, `AdminUser` reference
- [ ] **BE-19:** Extend `Order` model with tracking fields
  - Add: `trackingNumber`, `carrier`, `shipDate`, `deliveryDate`, `cancellationReason` (all optional)
- [ ] **BE-20:** Implement `PUT /api/admin/orders/:id/status` endpoint
  - Zod validation for status transitions
  - Business logic: validate allowed transitions (`PENDING→PROCESSING`, `PROCESSING→SHIPPED`, etc.)
  - Support `restock` flag for cancelled orders (atomic inventory increment)
  - Create `OrderActivity` audit log entry on each status change
  - Handle concurrent updates with database locking (return 409 on conflict)
  - Support `Idempotency-Key` header to prevent duplicate operations
- [ ] **BE-21:** Implement `GET /api/admin/orders/:id/activities` endpoint
  - Return chronological list of order status changes with admin attribution
  - Include admin username in response (join `AdminUser`)
- [ ] **BE-22:** Write unit tests for status transition logic
  - Test all allowed transitions (6 test cases)
  - Test disallowed transitions (backward transitions return 400)
  - Test inventory restock on cancel (verify product.inventory incremented)
  - Test idempotency: calling restock twice doesn't double inventory
  - Test concurrent updates: two admins updating same order → 409 conflict
- [ ] **BE-23:** Write integration API tests
  - Happy path: `PENDING → PROCESSING → SHIPPED → DELIVERED`
  - Cancel with restock: verify inventory changes in DB
  - Cancel without restock: inventory unchanged
  - Invalid transition returns 400 with clear error message
- [ ] **BE-24:** Add database migration
  - Create `order_activities` table
  - Add new optional columns to `orders` table
  - Run migration in dev and verify

#### Frontend Admin UI (Priority: High)
- [ ] **FE-24:** Create `OrderStatusBadge` component
  - Color-coded badges: gray (PENDING), blue (PROCESSING), purple (SHIPPED), green (DELIVERED), red (CANCELLED)
  - Props: `status`, `size`
- [ ] **FE-25:** Implement "Mark Processing" button
  - Show when `status === "PENDING"`
  - Optimistic UI update
  - No confirmation dialog
  - Success toast: "Order marked Processing"
  - Error handling with retry option
- [ ] **FE-26:** Implement "Mark Shipped" button with modal
  - Show when `status === "PROCESSING"`
  - Modal form fields: `trackingNumber` (optional), `carrier` (dropdown: USPS, FedEx, UPS, Other), `shipDate` (date picker, default: today)
  - Form validation: basic required field checks
  - Optimistic UI: update badge to "Shipped" immediately
  - On success: close modal, show toast "Order marked Shipped"
  - On failure: revert optimistic state, show error
- [ ] **FE-27:** Implement "Mark Delivered" button with confirmation
  - Show when `status === "SHIPPED"`
  - Simple confirmation dialog: "Confirm mark order as Delivered?"
  - Optional delivery date input
  - Disable all status action buttons after delivered (terminal state)
  - Success toast: "Order marked Delivered"
- [ ] **FE-28:** Implement "Cancel Order" button with strong confirmation
  - Show when `status === "PENDING"` or `status === "PROCESSING"`
  - Red/destructive styling
  - Confirmation modal with:
    - Checkbox: "Also restock inventory to products"
    - Text area: `cancellationReason` (required)
    - Warning text: "This action cannot be undone"
  - On confirm: call API with `restock` flag and reason
  - Success toast: "Order cancelled — inventory restocked" (if restocked)
  - Error handling: if restock fails, show descriptive error
- [ ] **FE-29:** Implement "Print Order" button
  - Open printable view in new window/tab
  - Styled for printing (CSS print media queries)
  - Include: order details, buyer info, items, totals
  - No server-side changes required (client-only)
- [ ] **FE-30:** Add Order Activity Timeline component
  - Fetch activities from `GET /api/admin/orders/:id/activities`
  - Display chronological list with timestamps, admin usernames, status changes
  - Show notes/reasons for each activity
  - Auto-refresh on status change
- [ ] **FE-31:** Add concurrent update detection UI
  - On 409 conflict response, show banner: "This order changed since you opened it. [Refresh Page]"
  - Optionally: poll for updates every 30s when order detail page open
- [ ] **FE-32:** Implement optimistic UI patterns
  - Disable all action buttons while API call pending
  - Show loading spinners on buttons
  - Revert UI state on error with clear feedback

#### Testing (Priority: Medium)
- [ ] **TEST-11:** E2E tests for order status management (Playwright)
  - Test: Admin marks order as Processing → verify badge updates
  - Test: Admin marks order as Shipped with tracking → verify modal, tracking saved, email triggered (mock)
  - Test: Admin marks order as Delivered → verify confirmation, final state
  - Test: Admin cancels order with restock → verify cancellation, inventory incremented in DB
  - Test: Print order → verify printable view opens
  - Test: View activity timeline → verify history displayed correctly
- [ ] **TEST-12:** Accessibility tests
  - Verify all buttons have `aria-label`
  - Test keyboard navigation (Tab, Enter/Space on buttons)
  - Test modal focus trap (Esc to close)
  - Test screen reader announcements for status changes (aria-live)
- [ ] **TEST-13:** Component tests (React Testing Library)
  - Test `OrderStatusBadge` renders correct color for each status
  - Test action buttons visibility based on order status
  - Test modal forms validation and submission
  - Test optimistic UI state transitions
  - Test error state rendering

#### Optional Features (Priority: Low)
- [ ] **OPT-01:** Email notifications
  - Configure SMTP or email service (SendGrid, Mailgun)
  - Send email on `SHIPPED` with tracking info
  - Send email on `DELIVERED` with confirmation
  - Send email on `CANCELLED` with reason and refund info (if applicable)
  - Add environment variables: `ENABLE_ORDER_EMAILS`, `SMTP_CONFIG`
- [ ] **OPT-02:** Webhook triggers
  - Configure webhook URL in environment variables
  - Trigger webhook on each status change with payload: `{ orderId, fromStatus, toStatus, timestamp }`
  - Retry logic for failed webhooks
- [ ] **OPT-03:** Admin role permissions (future enhancement)
  - Add `role` field to `AdminUser` model: `admin`, `manager`, `viewer`
  - Restrict status change actions based on role
  - `viewer` can only view orders, not change status

#### Documentation
- [ ] Update `API_TESTING.md` with new endpoints
  - Add `PUT /api/admin/orders/:id/status` examples
  - Add `GET /api/admin/orders/:id/activities` examples
- [ ] Update `README.md` with order management feature
- [ ] Add inline code comments for complex business logic (restock, transitions)

**Acceptance Criteria:**
- ✅ Admin can change order status from PENDING → PROCESSING → SHIPPED → DELIVERED via UI buttons
- ✅ Admin can cancel order at PENDING or PROCESSING stage with optional inventory restock
- ✅ Inventory is correctly restocked when order cancelled with restock=true
- ✅ All status changes logged in OrderActivity with admin attribution
- ✅ Concurrent admin updates prevented (409 conflict handling)
- ✅ Order activity timeline displays full history with timestamps and admin usernames
- ✅ All action buttons follow optimistic UI patterns for responsive UX
- ✅ Confirmation modals shown for destructive actions (cancel, deliver)
- ✅ Print order generates clean printable view
- ✅ All features accessible via keyboard and screen reader
- ✅ E2E tests cover all status transition flows and edge cases
- ✅ API integration tests verify inventory restock logic and concurrent updates

**Dependencies:**
- Requires existing admin authentication system (JWT)
- Requires existing order creation flow (checkout)
- Requires Prisma migrations for schema changes

**Risks:**
- Concurrent updates could cause race conditions if not properly locked (mitigated with DB transactions)
- Inventory restock logic must be idempotent to prevent double-increments
- Email/webhook integrations may fail silently if not properly monitored

**Estimated Effort:**
- Backend API: 3-4 days (includes tests)
- Frontend UI: 4-5 days (includes components, modals, optimistic UI)
- E2E Testing: 2-3 days
- Documentation: 1 day
- Buffer for bugs/edge cases: 2-3 days
- **Total: ~12-16 days (~2 weeks)**

---

### Sprint 7: Analytics & Inventory Management Dashboard (2-3 weeks) — NEW

**Goal:** Implement comprehensive analytics and inventory management system for admin dashboard with revenue tracking, inventory insights, and low stock alerts.

**Status:** ✅ Specs completed, ✅ Schema updated, ✅ Migration applied, 🔄 Implementation pending

---

#### **Backend API (Priority: High)**

**Database Schema Updates:**
- ✅ **BE-25:** Add performance indexes to Prisma schema (COMPLETED)
  - `products(categoryId, published)` for inventory queries
  - `products(inventory)` for low stock queries  
  - `orders(createdAt, status)` for revenue analytics
  - `order_items(productId)` for product revenue aggregation
- ✅ **BE-26:** Generate and apply migration `add_analytics_indexes` (COMPLETED)

**Analytics API Endpoints:**
- [ ] **BE-27:** Implement `GET /api/admin/analytics/dashboard`
  - Aggregate dashboard summary statistics
  - Products: total, published, unpublished counts
  - Inventory: total units, by category, low stock alerts (inventory <= 5)
  - Revenue: total, average order value, monthly trends (last 12 months)
  - Top products by revenue (top 10)
  - Orders: status breakdown (confirmed, processing, shipped, delivered, cancelled, failed)
  - Date range filtering (default: last 30 days)
  - Parallel query execution for performance
  - PostgreSQL aggregations with `$queryRaw` for complex queries
  
- [ ] **BE-28:** Implement `GET /api/admin/analytics/revenue`
  - Support 4 groupBy modes: `order`, `product`, `month`, `category`
  - **groupBy=order**: Individual order revenue with pagination
  - **groupBy=product**: Revenue per product with units sold, order count
  - **groupBy=month**: Monthly revenue aggregation with ORDER BY month DESC
  - **groupBy=category**: Revenue per category with product count
  - Query params: `startDate`, `endDate`, `limit`, `offset`, `sortBy`, `sortOrder`
  - Filter only confirmed orders (CONFIRMED, PROCESSING, SHIPPED, DELIVERED)
  - Return summary totals with paginated data
  - Zod validation for query parameters
  
- [ ] **BE-29:** Implement `GET /api/admin/analytics/inventory`
  - Support 3 groupBy modes: `category`, `product`, `status`
  - **groupBy=category**: Total units per category, product counts, low stock count
  - **groupBy=product**: Product-level inventory with low stock flags
  - **groupBy=status**: Aggregate by published/unpublished status
  - Query params: `lowStockThreshold` (default: 5), `includeUnpublished` (default: false)
  - Sort products by inventory ASC for low stock visibility
  
- [ ] **BE-30:** Add error handling and validation
  - Validate date formats (ISO 8601)
  - Validate groupBy enum values
  - Handle invalid query parameters (400 errors)
  - Database query timeout handling (10s limit)
  - Log slow queries (>100ms) for monitoring

**Testing:**
- [ ] **TEST-14:** Unit tests for analytics aggregation functions
  - Test revenue calculation accuracy
  - Test inventory aggregation by category
  - Test low stock filtering logic
  - Test date range filtering
  - Mock Prisma client with test data
  
- [ ] **TEST-15:** Integration API tests for analytics endpoints
  - Test dashboard endpoint returns all expected fields
  - Test revenue endpoint with each groupBy mode
  - Test inventory endpoint with each groupBy mode
  - Test pagination and sorting
  - Test date range filters (edge cases: same day, future dates)
  - Test with empty database (zero orders/products)
  
- [ ] **TEST-16:** Performance tests
  - Benchmark dashboard query with 1000+ orders
  - Verify query execution time < 500ms for typical dataset
  - Test concurrent requests (10 simultaneous dashboard calls)

---

#### **Frontend Admin Dashboard (Priority: High)**

**Dashboard Page Enhancement:**
- [ ] **FE-33:** Update `/admin/dashboard` page structure
  - Replace existing basic dashboard with comprehensive analytics UI
  - Implement date range selector (Last 7/30 days, This Month, Last Month, Custom)
  - Add loading states with skeleton screens
  - Error boundary with retry functionality
  
- [ ] **FE-34:** Implement Stats Cards Grid (4 cards)
  - **Card 1: Total Products** - Show published/unpublished split
  - **Card 2: Total Inventory** - Show total units + low stock alert badge
  - **Card 3: Total Orders** - Show total + confirmed count
  - **Card 4: Revenue** - Show total revenue + average order value (VND format)
  - Color-coded with emoji icons (📦, 📊, 🛍️, 💰)
  - Responsive grid layout (1 col mobile, 2 col tablet, 4 col desktop)
  
- [ ] **FE-35:** Implement Inventory by Category Table
  - Columns: Category Name, Total Units, Product Count, Low Stock Count
  - Sortable columns (click header to sort)
  - Click row to drill down to product list for that category
  - Highlight low stock categories (badge with count)
  
- [ ] **FE-36:** Implement Low Stock Alert Section
  - Red-themed alert box with warning icon ⚠️
  - Table: Product Name, Category, Current Stock
  - Sort by inventory ASC (lowest first)
  - Quick action: "Edit" button → navigate to edit product page
  - Conditional rendering (only show if low stock items exist)
  
- [ ] **FE-37:** Implement Top Products by Revenue Table
  - Columns: Product Name, Revenue (VND format), Units Sold, Order Count
  - Top 10 products by default
  - Vietnamese currency formatting with `toLocaleString('vi-VN')`
  - Click product name → navigate to product edit page
  
- [ ] **FE-38:** Implement Monthly Revenue Table/Chart
  - Table with columns: Month, Revenue (VND), Orders, Avg Order Value
  - Last 6 months by default
  - Optional: Line/bar chart visualization (if time permits)
  - Fallback: Clean HTML table if chart library not added
  
- [ ] **FE-39:** Implement data fetching with SWR
  - Fetch `/api/admin/analytics/dashboard` on mount
  - Revalidate on window focus
  - Handle loading and error states
  - Cache with 5-minute TTL
  - Manual refresh button to refetch

**Advanced Features (Optional):**
- [ ] **FE-40:** Add date range picker component
  - Presets: Last 7 days, Last 30 days, This Month, Last Month
  - Custom date range with calendar picker
  - Update URL query params for shareable links
  
- [ ] **FE-41:** Create `/admin/analytics` navigation section
  - Submenu: Dashboard, Revenue, Inventory
  - Separate pages for detailed analytics (future sprint)

**UI/UX Polish:**
- [ ] **FE-42:** Add responsive design for mobile/tablet
  - Collapsible sections on mobile
  - Horizontal scroll for wide tables
  - Touch-friendly buttons and controls
  
- [ ] **FE-43:** Add loading skeletons
  - Skeleton for stat cards (shimmer effect)
  - Skeleton for tables
  - Smooth transitions between loading and loaded states
  
- [ ] **FE-44:** Implement error states with actionable feedback
  - Network error → "Retry" button with icon
  - Empty state → "No data available for selected date range"
  - Permission error → Redirect to login

---

#### **Documentation**

- ✅ **DOC-05:** Update `context/specs.md` with analytics specifications (COMPLETED)
- ✅ **DOC-06:** Create `ANALYTICS_IMPLEMENTATION.md` implementation guide (COMPLETED)
- [ ] **DOC-07:** Update `API_TESTING.md` with new analytics endpoints
  - Add curl examples for dashboard, revenue, inventory endpoints
  - Document query parameters and response formats
  - Add example responses with sample data
- [ ] **DOC-08:** Update `README.md` with analytics feature description
  - Add "Analytics Dashboard" section
  - Mention key metrics available to admin
  - Add screenshot (optional)
- [ ] **DOC-09:** Add inline code comments for complex aggregations
  - Document PostgreSQL-specific `$queryRaw` usage
  - Explain revenue calculation business logic
  - Comment inventory aggregation queries

---

### **Acceptance Criteria:**

**Must Have (MVP):**
- ✅ Admin dashboard displays total products split by published/unpublished
- ✅ Admin can view total inventory units across all products
- ✅ Admin can view inventory breakdown by category
- ✅ Admin receives low stock alerts for products with inventory <= 5
- ✅ Admin can view total revenue for date range (default: last 30 days)
- ✅ Admin can view revenue trends by month (last 12 months)
- ✅ Admin can view top 10 products by revenue
- ✅ Admin can view order count breakdown by status
- ✅ Dashboard loads in < 2 seconds with typical dataset
- ✅ All queries use database indexes for performance
- ✅ API returns 401 for unauthenticated requests
- ✅ API validates inputs and returns 400 for invalid data

**Should Have:**
- ⚪ Monthly revenue displayed as visual chart (line or bar)
- ⚪ Low stock products highlighted with red alert box
- ⚪ Click category row to drill down to product list
- ⚪ Currency formatted in VND (₫) with thousand separators
- ⚪ Loading states with skeleton screens
- ⚪ Error states with retry functionality
- ⚪ Date range selector with presets

**Could Have (Future):**
- ⚪ Separate analytics pages for deep-dive
- ⚪ Export to CSV/Excel
- ⚪ Interactive charts with zoom/pan
- ⚪ Real-time updates with WebSocket
- ⚪ Period comparison (current vs previous)
- ⚪ Predictive analytics (forecast inventory)

---

### **Dependencies:**

**Required:**
- ✅ Admin authentication (JWT) — Available
- ✅ Order and Product models — Available
- ✅ PostgreSQL + Prisma — Available
- ✅ Performance indexes migration — Completed

**Optional:**
- ⚪ Chart library (recharts/nivo) — TBD
- ⚪ CSV export library — TBD
- ⚪ Date picker library — TBD

---

### **Risks & Mitigation:**

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Complex queries cause slow performance | High | Medium | Use indexes, caching (5-min), 10s timeout |
| Large datasets crash dashboard | High | Low | Pagination (max 500), lazy loading |
| Concurrent requests overload DB | Medium | Low | Connection pooling, rate limiting |
| Chart library increases bundle size | Low | Medium | Dynamic imports, lightweight alternatives |
| Timezone edge cases in date calcs | Medium | Medium | Use UTC consistently, document handling |
| Admin misinterprets metrics | Low | High | Add tooltips, document calculations |

---

### **Estimated Effort:**

**Backend:** 9 days
- Dashboard API: 2 days
- Revenue API: 2 days
- Inventory API: 1.5 days
- Validation: 0.5 day
- Unit tests: 1.5 days
- Integration tests: 1 day
- ✅ Schema/migration: 0.5 day (done)

**Frontend:** 11 days
- Page structure: 1 day
- Stats cards: 0.5 day
- Tables: 2.5 days
- Charts: 1.5 days
- Data fetching: 0.5 day
- Responsive: 1 day
- Loading/errors: 0.5 day
- Component tests: 1.5 days
- E2E tests: 1 day
- Polish: 1 day

**Documentation:** 0.75 day
- ✅ Specs: 0.5 day (done)
- ✅ Implementation guide: 0.5 day (done)
- API testing docs: 0.5 day
- README: 0.25 day

**Buffer:** 2 days

**Total: ~22.75 days (~4.5 weeks solo, ~2.5 weeks with 2 devs)**

---

### **Implementation Phases:**

**Phase 1: Backend Foundation (Days 1-5)**
1. Implement dashboard endpoint with all aggregations
2. Implement revenue endpoint (4 groupBy modes)
3. Implement inventory endpoint (3 groupBy modes)
4. Add validation and error handling
5. Write unit and integration tests

**Phase 2: Frontend Core (Days 6-11)**
1. Update dashboard page structure
2. Build stats cards grid
3. Build inventory and top products tables
4. Add low stock alert section
5. Integrate SWR for data fetching
6. Add monthly revenue table

**Phase 3: Polish & Advanced (Days 12-16)**
1. Add charts for revenue visualization (optional)
2. Implement date range selector
3. Responsive design and mobile optimization
4. Loading skeletons and error states
5. UI polish and animations

**Phase 4: Testing & Docs (Days 17-20)**
1. Component tests for dashboard sections
2. E2E tests with Playwright
3. Performance testing and optimization
4. Update API testing docs
5. Update README

**Phase 5: Review & Launch (Days 21-23)**
1. Code review and refactoring
2. QA testing with real data
3. Deploy to production
4. Monitor performance and errors
5. Gather admin feedback

---

### **Success Metrics:**

**Performance:**
- Dashboard loads < 2s (p95)
- API response < 500ms (p95)
- Zero N+1 queries

**Quality:**
- Test coverage ≥ 80% for analytics
- Zero critical bugs after 1 week
- WCAG 2.1 AA compliance

**Business:**
- Admin uses dashboard 3x+ per week
- Low stock alerts prevent stockouts
- Revenue insights inform decisions

---

### **Next Steps After Sprint 7:**

**Future Enhancements:**
1. **Advanced Analytics:** Customer segmentation, product trends, predictive analytics
2. **Inventory Automation:** Auto-reorder points, email notifications, CSV import/export
3. **Revenue Optimization:** Profit margins, discounts, abandoned cart, conversion funnel

---

**Questions for Team:**
1. Start with simple tables or add chart library now?
2. Include CSV export in this sprint or defer?
3. Priority: comprehensive analytics or faster delivery with basics?
4. Acceptable: 5-minute cache or need real-time?

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
2. Tạo `apps/backend/prisma/schema.postgres.prisma` với các model đã define
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
