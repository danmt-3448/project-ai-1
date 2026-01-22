# Testing Setup Issues & Solutions

## ❌ Current Issue

**Error**: `crypto$2.getRandomValues is not a function`

**Cause**: Node.js v16.20.0 không tương thích với Vitest 1.6.1 và Vite 5.4.21

**Requirement**: 
- Vitest yêu cầu Node.js >= 20
- Next.js 14 yêu cầu Node.js >= 20 (use Node 20+ for compatibility)

---

## ✅ Solutions

### Option 1: Upgrade Node.js (Recommended)

**Sử dụng nvm** (Node Version Manager):

```bash
# Install nvm nếu chưa có
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload terminal
source ~/.zshrc

# Install Node.js 20
nvm install 20

# Use Node.js 20
nvm use 20

# Set default
nvm alias default 20

# Verify
node -v  # should show v20.x.x
```

**Sau khi upgrade**, chạy lại:

```bash
cd apps/frontend
rm -rf node_modules package-lock.json
npm run test
```

---

### Option 2: Downgrade Testing Libraries

Nếu không thể upgrade Node.js, downgrade dependencies:

**Edit `apps/frontend/package.json`**:

```json
{
  "devDependencies": {
    "vitest": "^0.34.0",
    "@vitejs/plugin-react": "^4.0.4",
    "jsdom": "^22.1.0"
  }
}
```

**Reinstall**:

```bash
cd apps/frontend
rm -rf node_modules package-lock.json
npm run test
```

---

### Option 3: Use Docker (For E2E)

Run tests trong Docker container with Node.js 20+:

**Create `Dockerfile.test`**:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/

RUN npm install

COPY . .

CMD ["npm", "run", "test"]
```

**Run tests**:

```bash
docker run storefront-test
```

---

## 🎯 Quick Fix (Recommended)

**1. Upgrade to Node.js 20+**:

```bash
nvm install 20 && nvm use 20
```

**2. Reinstall dependencies**:

```bash
cd /Users/maithanhdan/Desktop/Sun/project_ai/project-ai-1/apps/frontend
rm -rf node_modules package-lock.json
npm install
```

**3. Run tests**:

```bash
npm run test:ui
```

---

## 📋 Verify Setup

After fixing Node.js version:

```bash
# Check Node version
node -v  # Should be >= 20.0.0

# Check npm version
npm -v   # Should be >= 8.0.0

# Test vitest
cd apps/frontend
npx vitest --version

npm run test
```

---

## 🧪 Expected Test Output (After Fix)

```
✓ tests/cart.test.ts (10)
  ✓ Cart Store (10)
    ✓ should add item to cart
    ✓ should increase quantity when adding existing item
    ✓ should not exceed inventory when adding items
    ✓ should remove item from cart
    ✓ should update item quantity
    ✓ should remove item when quantity is set to 0
    ✓ should calculate total items correctly
    ✓ should calculate subtotal correctly
    ✓ should clear cart

✓ tests/components/ProductCard.test.tsx (4)
  ✓ ProductCard (4)
    ✓ should render product information
    ✓ should display out of stock message
    ✓ should display category name
    ✓ should have correct link href

✓ tests/api/checkout.test.ts (3)
  ✓ Checkout API (3)
    ✓ should checkout successfully with valid data
    ✓ should fail when product is out of stock
    ✓ should fail with validation errors

Test Files  3 passed (3)
     Tests  17 passed (17)
  Duration  450ms
```

---

## 🚨 Common Issues

### Issue 1: `command not found: vitest`

**Solution**: Install dependencies
```bash
npm install
```

### Issue 2: `Cannot find module '@/...'`

**Solution**: Check vitest.config.ts alias configuration
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './'),
  },
}
```

### Issue 3: `ReferenceError: fetch is not defined`

**Solution**: Add to `tests/setup.ts`
```typescript
global.fetch = vi.fn()
```

### Issue 4: Playwright errors

**Solution**: Install browsers
npx playwright install
```

---

## 📚 Next Steps After Fixing

1. ✅ Upgrade Node.js to v20+
2. ✅ Run unit tests: `npm run test`
3. ✅ Run E2E tests: `npm run test:e2e`
5. ✅ Seed data: `npm run seed`
6. ✅ Start dev servers for E2E testing

---

**Current Node Version**: v16.20.0 ❌  
**Required Node Version**: >= v20.0.0 ✅

**Action Required**: Upgrade Node.js using nvm hoặc direct installer
