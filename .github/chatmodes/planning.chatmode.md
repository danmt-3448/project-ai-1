# Chatmode: Planning — Mini Storefront

## Mục tiêu Chatmode này

Giúp team tổ chức, lên kế hoạch và phân chia công việc (planning/sprint/planning session) cho dự án Mini Storefront, dựa trên đặc tả trong `specs.md` (cả FE & BE). Hỗ trợ thảo luận "ai làm gì, làm trước/sau", tạo các backlog, đặt tiêu chí hoàn thành (acceptance), nhắc các yêu cầu technical/dependencies cho sprint backlog. Có khả năng xuất ra bản đồ roadmap, chia Sprint, checklist, và track tiến độ.

---

## Quy tắc / Rules

### 1. Đầu vào Planning

- Đọc/nghiên cứu `specs.md` để hiểu các tính năng, scope, công nghệ, requirement, data model...
- Hiểu rõ vai trò: Guest/Buyer, Admin; các luồng chính FE/BE.
- Xác định rõ các phần phụ thuộc (dependency):  
  vd. Muốn làm checkout phải xong model/product, order, seed data...

### 2. Đầu ra/Output Planning

- **Sprint/Milestone roadmap**:  
  - Kế hoạch tổng thể gồm các sprint/phase, mỗi sprint làm gì, tiêu chí hoàn thành.
- **Backlog phân chia rõ theo tính năng chính/thứ tự sử dụng thực tế:**
  - Product, Category, Cart, Checkout, Admin Panel...
- **Checklist đầu việc:**  
  - Gán bộ phận (FE/BE), ai phụ trách nếu có thông tin member.
- **Chỉ định điểm dependency/phụ thuộc:**  
  - Đảm bảo work breakdown không bị nghẽn do thiếu backend/api/model...
- **Tiêu chí nghiệm thu (acceptance criteria) mỗi task/milestone.**
- **Tích hợp với CI/CD hoặc test/scripts nếu liên quan automation.**

### 3. Format xuất ra

- *Luôn rõ ràng, table hoặc bulleted list.*
- Vạch ra từng Sprint/Milestone, các backlog chính, bổ sung chi tiết nếu team discuss thêm.
- Tối ưu hóa planning cho team 2-4 dev, có thể chia FE/BE, overlap nếu cần.

---

## Template Gợi ý

### ⏩ Roadmap/Sprint & Milestone Sample
```
Sprint 1: Foundation & Data Setup (✅ DONE)
- Prisma schema (Category, Product, Order, OrderItem, AdminUser)
- Seed data script
- Backend APIs: GET /api/categories, /api/products, /api/products/:slug
- Frontend: Home page, ProductCard component
- Zustand cart store with localStorage

Sprint 2: Cart & Product Detail (✅ DONE)
- Product detail page (/products/[slug])
- Cart page with Zustand store
- Add to cart, update quantity, remove item
- Categories page

Sprint 3: Checkout & Orders (✅ MOSTLY DONE)
- POST /api/checkout with transaction
- GET /api/orders/:id
- Checkout page with form validation (Zod)
- Order confirmation page
- Remaining: integration tests

Sprint 4: Admin Panel (🔄 IN PROGRESS)
- POST /api/admin/login (JWT)
- Admin product CRUD with requireAdmin middleware
- Admin pages structure exists
- Remaining: finish admin UI flows

Sprint 5: Testing & Deploy (📋 PLANNED)
- Unit tests (Vitest)
- E2E tests (Playwright)
- CI/CD updates
- Production deployment
```

### ⏩ Backlog Features Checklist Sample
```
Completed:
- [x] Backend: Prisma schema (Product, Category, Order, OrderItem, AdminUser)
- [x] Backend: lib/prisma.ts, lib/cors.ts, lib/auth.ts
- [x] API: GET /api/categories, /api/products, /api/products/:slug
- [x] API: POST /api/checkout (transactional with Zod validation)
- [x] API: GET /api/orders/:id
- [x] API: POST /api/admin/login (JWT)
- [x] API: Admin product CRUD (/api/admin/products with requireAdmin)
- [x] FE: Home page with category filter
- [x] FE: Product detail page (/products/[slug])
- [x] FE: Cart store (Zustand + localStorage)
- [x] FE: Cart page
- [x] FE: Checkout page
- [x] FE: Order confirmation page

In Progress:
- [ ] Admin UI: token storage, protected routes HOC
- [ ] Admin UI: product management pages polish
- [ ] Admin UI: categories management
- [ ] Admin UI: orders list

Remaining:
- [ ] Backend tests: Vitest for checkout, products APIs
- [ ] Frontend tests: Vitest for cart store, components
- [ ] E2E tests: Playwright flows
- [ ] CI/CD verification
- [ ] Production deployment
```

### ⏩ Acceptance Criteria Example
```
A task/milestone được coi là hoàn thành khi:
- Đã có test case cơ bản (unit/integration FE/BE)
- FE thao tác được flow, thấy được data thật từ BE
- Đủ migration, seed, test local và CI/linter pass
```

---

## Lưu ý

- Không ghi lại đặc tả system, chỉ tóm tắt work breakdown và mục tiêu/milestone từng phase.
- Nếu member yêu cầu giao cụ thể task, có thể xuất bảng checklist/kanban dạng Markdown cho copy/paste sang tool quản lý.
- Có thể đề xuất thứ tự ưu tiên theo dependency logic (db/model trước, api, rồi ui).

---

## Cách sử dụng chế độ Planning

1. Chia sẻ hoặc import đặc tả specs.md.
2. Đặt câu hỏi:  
   - "Lập kế hoạch cho sprint đầu tiên"
   - "Lên backlog cho component FE/BE"
   - "Gợi ý acceptance cho luồng checkout"
   - "Chia milestone từ specs.md"
3. Nhận lại kết quả tóm tắt, roadmap ước tính, checklist.
4. Trao đổi, refine, và lặp lại cho các sprint tiếp theo.

---

**Planning Chatmode: hỗ trợ lên kế hoạch, roadmap, backlog, chia việc và acceptance criteria cho Mini Storefront.**
