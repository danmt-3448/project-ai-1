# 🚀 Setup Guide - Mini Storefront

## Prerequisites

Đảm bảo bạn đã cài đặt:
- **Node.js** v18+ và npm
- **PostgreSQL** 14+ (local hoặc remote)
- **Git**

---

## Step 1: Clone Repository

```bash
git clone <repository-url>
cd project-ai-1
```

---

## Step 2: Install Dependencies

```bash
# Install all workspace dependencies
npm install
```

Lệnh này sẽ install dependencies cho cả root, backend và frontend.

---

## Step 3: Setup PostgreSQL Database

### Option A: Local PostgreSQL

1. **Cài đặt PostgreSQL** (nếu chưa có):
   - macOS: `brew install postgresql@14`
   - Ubuntu: `sudo apt install postgresql-14`
   - Windows: Download từ [postgresql.org](https://www.postgresql.org/download/)

2. **Start PostgreSQL service**:
   ```bash
   # macOS
   brew services start postgresql@14
   
   # Ubuntu
   sudo systemctl start postgresql
   ```

3. **Tạo database**:
   ```bash
   # Login as postgres user
   psql postgres
   
   # Create database and user
   CREATE DATABASE ministore;
   CREATE USER ministore_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE ministore TO ministore_user;
   \q
   ```

### Option B: Docker PostgreSQL

```bash
# Start postgres container
docker-compose up -d postgres

# Check container is running
docker ps | grep postgres
```

Database sẽ chạy tại `localhost:5432` với credentials:
- Database: `ministore`
- Username: `postgres`
- Password: `postgres`

---

## Step 4: Configure Environment Variables

### 4.1. Root `.env`

Tạo file `.env` ở thư mục root:

```bash
# .env
DATABASE_URL="postgresql://ministore_user:your_password@localhost:5432/ministore?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

### 4.2. Backend `.env`

Tạo file `apps/backend/.env`:

```bash
# apps/backend/.env
DATABASE_URL="postgresql://ministore_user:your_password@localhost:5432/ministore?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NODE_ENV="development"
```

### 4.3. Frontend `.env.local`

Tạo file `apps/frontend/.env.local`:

```bash
# apps/frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**⚠️ Important**: Đổi `your_password` thành password thực tế của PostgreSQL user.

---

## Step 5: Run Database Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (tạo tables)
npx prisma migrate dev --name init

# Check migration success
npx prisma studio
# Mở http://localhost:5555 để xem database schema
```

---

## Step 6: Seed Database with Sample Data

```bash
# Run seed script
npm run db:seed
```

Seed script sẽ tạo:
- **3 categories**: Áo, Quần, Phụ kiện
- **10 products**: Với varied inventory và published states
- **1 admin user**: `admin / admin123`

**Verify seed data**:
```bash
npx prisma studio
# Check Products, Categories, AdminUser tables
```

---

## Step 7: Start Development Servers

### Option A: Start Both (Recommended)

```bash
# Start cả frontend và backend
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api

### Option B: Start Separately

Terminal 1 - Backend:
```bash
npm run dev:backend
```

Terminal 2 - Frontend:
```bash
npm run dev:frontend
```

---

## Step 8: Verify Installation

### Test Frontend
1. Mở http://localhost:3000
2. Xem products hiển thị trên home page
3. Click vào một product → xem detail page
4. Add to cart → xem cart page
5. Checkout → điền form → xem order confirmation

### Test Backend API

```bash
# Test categories endpoint
curl http://localhost:3001/api/categories

# Test products endpoint
curl http://localhost:3001/api/products

# Test admin login
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Test Admin Panel
1. Mở http://localhost:3000/admin
2. Login với `admin / admin123`
3. Xem dashboard

---

## 🎯 Default Credentials

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Change these in production!**

---

## 📁 Project Structure

```
project-ai-1/
├── apps/
│   ├── backend/              # Next.js API backend (port 3001)
│   │   ├── pages/api/        # API endpoints
│   │   │   ├── categories.ts
│   │   │   ├── products/
│   │   │   ├── checkout.ts
│   │   │   ├── orders/
│   │   │   └── admin/        # Admin protected routes
│   │   └── lib/
│   │       ├── prisma.ts     # Prisma client
│   │       └── auth.ts       # JWT middleware
│   │
│   └── frontend/             # Next.js frontend (port 3000)
│       ├── pages/            # Pages
│       │   ├── index.tsx     # Home
│       │   ├── products/
│       │   ├── cart.tsx
│       │   ├── checkout.tsx
│       │   ├── order/
│       │   └── admin/
│       ├── components/       # React components
│       ├── store/            # Zustand stores
│       └── lib/              # API client
│
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed data
│
└── context/
    ├── specs.md              # Project specifications
    ├── tasks.md              # Task breakdown
    └── IMPLEMENTATION_PROGRESS.md
```

---

## 🐛 Troubleshooting

### Database Connection Error

```bash
Error: P1001: Can't reach database server
```

**Solution**:
1. Check PostgreSQL is running: `pg_isready`
2. Verify DATABASE_URL in `.env`
3. Test connection: `psql <DATABASE_URL>`

### Port Already in Use

```bash
Error: Port 3000/3001 is already in use
```

**Solution**:
```bash
# Kill process on port
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Prisma Client Not Generated

```bash
Error: @prisma/client did not initialize yet
```

**Solution**:
```bash
npx prisma generate
```

### Module Not Found

```bash
Error: Cannot find module 'zustand'
```

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules apps/*/node_modules
npm install
```

---

## 🧪 Testing the App

### User Flow Test
1. ✅ Browse products on home page
2. ✅ Filter by category
3. ✅ View product detail
4. ✅ Add to cart (multiple products)
5. ✅ Update cart quantities
6. ✅ Proceed to checkout
7. ✅ Fill form and submit
8. ✅ View order confirmation

### Admin Flow Test
1. ✅ Login to admin panel
2. ⏳ View products list (API ready, UI pending)
3. ⏳ Create new product
4. ⏳ Edit product (inventory, price, publish)
5. ⏳ View orders list
6. ⏳ Update order status

---

## 📦 Available Scripts

```bash
# Development
npm run dev              # Start both FE & BE
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only

# Database
npm run db:push          # Push schema changes
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio

# Build
npm run build            # Build both apps
npm run build:frontend   # Build frontend
npm run build:backend    # Build backend

# Production
npm start                # Start production servers

# Code Quality
npm run lint             # Lint all code
npm run format           # Format with Prettier
```

---

## 🚀 Next Steps

1. ✅ Setup complete → Start development
2. ⏳ Complete admin UI pages
3. ⏳ Write tests (unit + E2E)
4. ⏳ Deploy to Vercel

---

## 🆘 Need Help?

- Check [context/specs.md](./context/specs.md) for detailed specifications
- Check [context/tasks.md](./context/tasks.md) for task breakdown
- Check [IMPLEMENTATION_PROGRESS.md](./context/IMPLEMENTATION_PROGRESS.md) for current status

---

**Setup Complete! Happy Coding! 🎉**
