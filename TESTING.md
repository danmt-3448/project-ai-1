# Testing Guide - Mini Storefront

Comprehensive testing strategy with Vitest (unit) and Playwright (E2E).

---

## 🧪 Testing Stack

- **Vitest**: Unit and integration tests
- **Testing Library**: React component tests
- **Playwright**: End-to-end browser tests

---

## 📦 Installation

Dependencies are already configured in `package.json`. Run:

```bash
# Install all dependencies
npm install

# Install Playwright browsers
npx playwright install
```

---

## 🎯 Unit Tests (Vitest)

### Frontend Unit Tests

Located in `apps/frontend/tests/`

**Run tests**:
```bash
cd apps/frontend
npm run test

# Watch mode
npm run test -- --watch

# UI mode
npm run test:ui

# Coverage
npm run test -- --coverage
```

### Test Files

1. **Cart Store Tests** (`tests/cart.test.ts`):
   - Add item to cart
   - Update quantities
   - Remove items
   - Calculate totals
   - Inventory constraints

2. **Component Tests** (`tests/components/ProductCard.test.tsx`):
   - Render product information
   - Out of stock display
   - Category display
   - Link behavior

3. **API Tests** (`tests/api/checkout.test.ts`):
   - Successful checkout
   - Insufficient inventory
   - Validation errors

### Running Specific Tests

```bash
# Run single test file
npm run test cart.test.ts

# Run tests matching pattern
npm run test -- --grep "cart"

# Run only changed tests
npm run test -- --changed
```

### Example Test Output

```
✓ tests/cart.test.ts (9)
  ✓ Cart Store (9)
    ✓ should add item to cart
    ✓ should increase quantity when adding existing item
    ✓ should not exceed inventory when adding items
    ✓ should remove item from cart
    ✓ should update item quantity
    ✓ should remove item when quantity is set to 0
    ✓ should calculate total items correctly
    ✓ should calculate subtotal correctly
    ✓ should clear cart

Test Files  1 passed (1)
     Tests  9 passed (9)
  Start at  10:30:00
  Duration  234ms
```

---

## 🎭 E2E Tests (Playwright)

### Setup

E2E tests are located in `e2e/` directory at project root.

**Install browsers**:
```bash
npx playwright install
```

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (recommended for debugging)
npm run test:e2e:ui

# Run specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run specific test file
npx playwright test e2e/user-flow.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug
```

### Test Suites

#### 1. User Flow Tests (`e2e/user-flow.spec.ts`)

Tests the complete shopping experience:

- ✅ Browse products on home page
- ✅ View product detail
- ✅ Add to cart
- ✅ Update cart quantities
- ✅ Remove from cart
- ✅ Checkout with form validation
- ✅ View order confirmation
- ✅ Filter by category
- ✅ Search products

**Run**:
```bash
npx playwright test user-flow
```

#### 2. Admin Flow Tests (`e2e/admin-flow.spec.ts`)

Tests admin panel functionality:

- ✅ Admin login
- ✅ Dashboard access
- ✅ View products list
- ✅ Create new product
- ✅ Edit product
- ✅ Delete product
- ✅ View orders list
- ✅ Filter orders by status
- ✅ Admin logout

**Run**:
```bash
npx playwright test admin-flow
```

### Viewing Test Reports

After running tests:

```bash
# Open HTML report
npx playwright show-report
```

### Example E2E Test Output

```
Running 8 tests using 3 workers

  ✓ [chromium] › user-flow.spec.ts:3:3 › complete shopping flow (5.2s)
  ✓ [chromium] › user-flow.spec.ts:45:3 › browse products by category (2.1s)
  ✓ [chromium] › admin-flow.spec.ts:12:3 › admin login and dashboard (1.8s)
  ✓ [firefox] › user-flow.spec.ts:3:3 › complete shopping flow (5.5s)
  ✓ [firefox] › admin-flow.spec.ts:12:3 › admin login and dashboard (2.0s)
  ✓ [webkit] › user-flow.spec.ts:3:3 › complete shopping flow (6.1s)
  ✓ [webkit] › admin-flow.spec.ts:12:3 › admin login and dashboard (2.3s)
  ✓ [chromium] › user-flow.spec.ts:60:3 › cart operations (3.4s)

  8 passed (22.4s)
```

---

## 🎯 Test Coverage Goals

### Unit Tests (Frontend)

- ✅ Cart store logic: 100%
- ✅ Critical components: ProductCard, Layout
- ✅ API client functions
- ⏳ Form validation
- ⏳ Utility functions

### Integration Tests

- ⏳ API endpoints (backend)
- ⏳ Database operations
- ⏳ Authentication flow

### E2E Tests

- ✅ User shopping flow (browse → cart → checkout → order)
- ✅ Admin management flow
- ⏳ Error handling scenarios
- ⏳ Mobile responsiveness

---

## 🐛 Debugging Tests

### Vitest Debugging

**VS Code**:
1. Set breakpoint in test file
2. Run "Debug Test" from Test Explorer
3. Or use VS Code debugger with `--inspect-brk`

**Console logging**:
```typescript
import { test } from 'vitest'

test('my test', () => {
  console.log('Debug info:', someVariable)
  // Your test code
})
```

### Playwright Debugging

**UI Mode** (recommended):
```bash
npm run test:e2e:ui
```

**Debug Mode**:
```bash
npx playwright test --debug
```

**Trace Viewer**:
```bash
# Run with trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

**Screenshots on failure**:
```typescript
test('my test', async ({ page }) => {
  await page.screenshot({ path: 'screenshot.png' })
})
```

---

## 📊 CI/CD Integration

Tests are configured to run in GitHub Actions.

**Workflow** (`.github/workflows/ci.yml`):
```yaml
- name: Run unit tests
  run: npm run test

- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
```

---

## 🚀 Quick Test Commands

```bash
# Run all tests (unit + E2E)
npm run test && npm run test:e2e

# Frontend unit tests only
cd apps/frontend && npm run test

# Backend unit tests only
cd apps/backend && npm run test

# E2E tests with UI
npm run test:e2e:ui

# Run tests in watch mode
cd apps/frontend && npm run test -- --watch

# Generate coverage report
cd apps/frontend && npm run test -- --coverage
```

---

## 📝 Writing New Tests

### Unit Test Example

```typescript
// apps/frontend/tests/myfeature.test.ts
import { describe, it, expect } from 'vitest'

describe('MyFeature', () => {
  it('should do something', () => {
    const result = myFunction()
    expect(result).toBe(expectedValue)
  })
})
```

### Component Test Example

```typescript
// apps/frontend/tests/components/MyComponent.test.tsx
import { render, screen } from '@testing-library/react'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent prop="value" />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### E2E Test Example

```typescript
// e2e/my-feature.spec.ts
import { test, expect } from '@playwright/test'

test('my feature works', async ({ page }) => {
  await page.goto('/my-page')
  await page.click('button')
  await expect(page.locator('text=Success')).toBeVisible()
})
```

---

## ✅ Test Checklist

Before deploying:

- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] Test coverage > 70%
- [ ] Critical paths tested (checkout, auth)
- [ ] Error scenarios covered
- [ ] Mobile viewport tested
- [ ] CI/CD pipeline passes

---

## 🎓 Best Practices

1. **Test behavior, not implementation**
   - Focus on what users see and do
   - Avoid testing internal state

2. **Keep tests independent**
   - Each test should run standalone
   - No shared state between tests

3. **Use descriptive names**
   - Test names should describe what they test
   - Use "should" statements

4. **Mock external dependencies**
   - Mock API calls in unit tests
   - Use test databases for integration tests

5. **Test edge cases**
   - Empty states
   - Error conditions
   - Boundary values

6. **Keep tests fast**
   - Unit tests should be < 100ms
   - E2E tests should be < 10s per test

---

**Testing is ready! Run tests before every commit and deployment.** ✅
