# Prompt Template — Tạo Specification cho Mini Storefront (FE + BE)

## Mô tả mục tiêu prompt
Bạn là AI Specs Writer/Copilot và cần sinh ra File ĐẶC TẢ (specification) đầy đủ cho một project Mini Storefront, có cả Backend và Frontend (Next.js + TypeScript). Nội dung đặc tả cần mang đủ các mục như dưới đây, match các tiêu chí thực tế triển khai, rõ ràng/đủ chi tiết, tiêu chuẩn hóa cho Dev có thể phát triển, test, và bàn giao.

---

## Hướng dẫn sinh đặc tả

### 1. Giới thiệu & Mục tiêu dự án  
- Tên dự án  
- Mục tiêu/ngữ cảnh  
- Nêu rõ phạm vi tối thiểu (MVP) và hạn chế (constraints), công nghệ đề xuất.

### 2. Stack công nghệ (bắt buộc nêu rõ cho cả FE + BE)  
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, SWR (data fetching), Zustand (state management), Axios
- **Backend**: Next.js 14 API Routes, TypeScript, Prisma ORM, PostgreSQL, Zod (validation), JWT (authentication), bcryptjs
- **Package Manager**: Yarn (v1.22.19+) with workspace support
- **Code Quality**: Prettier (with Tailwind plugin for FE), ESLint, TypeScript strict mode
- **Node Version**: Node.js 20+ (enforced via .nvmrc files)
- **Testing**: Vitest (unit/integration), Playwright (E2E), React Testing Library
- **Deployment**: Vercel (recommended), Docker support (node:20-alpine), .env configuration  

### 3. Đối tượng sử dụng & Vai trò  
- Phân biệt rõ Guest/Buyer vs Admin (bảng quyền, đặc điểm thao tác, tính năng liên quan)

### 4. Đặc tả chức năng — Giao diện (FE)  
- List các route FE, nêu rõ path, mô tả, các component chính  
- Note hành vi UI đặc biệt (client state, validation, accessibility, caching...)

### 5. Đặc tả chức năng — API (BE)  
- Liệt kê từng endpoint (public và admin)  
- Cho method, path, request/response mẫu JSON khi cần  
- Mô tả chi tiết từng trường, validation (Zod schemas), hành vi business logic, error cases
- **Authentication**: JWT tokens với requireAdmin middleware cho admin routes
- **CORS**: Configured via withCors wrapper cho cross-origin requests
- **Transaction**: Sử dụng Prisma transactions cho operations quan trọng (checkout, inventory)

### 6. Data Model & DB Schema  
- Dùng Prisma schema (prisma/schema.prisma), nêu đủ cả Product, Category, Order, OrderItem, AdminUser  
- Liên kết bảng, unique constraints, types, default values, indexes
- Seed script (prisma/seed.ts) với sample data
- **Images**: JSON string arrays parsed to arrays trong API responses
- **Inventory Management**: Track stock levels, prevent overselling via transactions  

### 7. Luồng nghiệp vụ chính
- **Checkout Flow**: 
  - Validate buyer info và items với Zod
  - Start Prisma transaction
  - Check inventory >= quantity cho mỗi product
  - Decrement inventory trong transaction
  - Create Order và OrderItem records
  - Commit hoặc rollback nếu có lỗi
- **Cart Management**: Zustand store với localStorage persistence
- **Authentication**: JWT-based với bcrypt password hashing

### 8. Test & Acceptance Criteria  
- **Unit Tests**: Vitest cho business logic, API handlers, utilities
- **Component Tests**: React Testing Library cho UI components
- **Integration Tests**: API endpoint tests với mock database
- **E2E Tests**: Playwright cho user flows (browse → cart → checkout, admin CRUD)
- Acceptance checklist tối thiểu khi demo (ai làm được gì, trạng thái xác nhận/thành công/thất bại)
- Test files trong `apps/*/tests/` và `e2e/`

### 9. Security & Deploy Notes  
- **Password Security**: bcryptjs với salt rounds cho admin passwords
- **JWT**: jsonwebtoken với JWT_SECRET trong environment variables
- **Admin Protection**: requireAdmin middleware wrapper cho protected endpoints
- **Environment Variables**: 
  - Backend: DATABASE_URL, JWT_SECRET, NODE_ENV
  - Frontend: NEXT_PUBLIC_API_URL
- **CORS**: Configured để allow frontend origin
- **Deployment**:
  - Vercel: Separate projects cho FE/BE hoặc monorepo với vercel.json
  - Docker: Multi-stage builds với node:20-alpine
  - Database: Vercel Postgres, Railway, hoặc managed PostgreSQL
  - Migrations: Run prisma migrate deploy trong production

### 10. Development Workflow & Scripts
- **Setup**: `nvm use` → `yarn install` → `yarn prisma:migrate` → `yarn seed`
- **Development**: `yarn dev` (runs both FE + BE)
- **Code Quality**: `yarn lint`, `yarn format` (Prettier)
- **Testing**: `yarn test` (Vitest), `yarn test:e2e` (Playwright)
- **Build**: `yarn build:frontend`, `yarn build:backend`
- **Monorepo**: Yarn workspaces với shared dependencies

### 11. Roadmap/Kế hoạch triển khai  
- **Sprint 1**: Database schema, seed, backend foundation, basic API endpoints
- **Sprint 2**: Frontend pages (home, products, cart), state management
- **Sprint 3**: Checkout flow với transactions, order confirmation
- **Sprint 4**: Admin panel (login, product CRUD, orders management)
- **Sprint 5**: Testing (unit + E2E), polish UI/UX, deployment
- Milestone kiểm thử sau mỗi sprint

### 11. Phụ lục:  
- **Prisma Schema**: Full schema trong `prisma/schema.prisma`
- **Seed Script**: Sample data trong `prisma/seed.ts`
- **API Documentation**: Endpoint list với examples trong `API_TESTING.md`
- **Environment Variables**: Template `.env.example` files
- **Project Structure**: Monorepo layout trong `README.md`
- **CI/CD**: GitHub Actions workflow trong `.github/workflows/`
- **Code Quality Config**: 
  - `.prettierrc` và `.prettierignore` (both apps)
  - `tsconfig.json` với strict mode
  - ESLint config trong `package.json`
- **Node Version**: `.nvmrc` files (root và per-app)

---

## Template ví dụ (Tùy chỉnh theo project thực tế)

### Quick Start Checklist for Specs:
1. ✅ Define tech stack (Next.js 14, Prisma, TypeScript, Tailwind)
2. ✅ List all pages/routes (frontend) với components
3. ✅ List all API endpoints (backend) với validation
4. ✅ Design database schema (Prisma models)
5. ✅ Define authentication flow (JWT + bcrypt)
6. ✅ Specify state management (Zustand + localStorage)
7. ✅ Plan testing strategy (Vitest + Playwright)
8. ✅ Document deployment (Vercel + Docker)
9. ✅ Create acceptance criteria per feature
10. ✅ Break down into sprints/tasks

---

**Áp dụng khi gọi AI sinh đặc tả specs cho các project Next.js + TypeScript monorepo, gồm cả FE/BE, API, DB, tests, deploy với Yarn workspaces và Node 20.**
