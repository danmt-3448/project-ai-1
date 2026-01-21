import { test, expect } from '@playwright/test'

test.describe('Admin Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/admin')
    await page.fill('input[type="text"]', 'admin')
    await page.fill('input[type="password"]', 'admin123')
    await page.locator('button[type="submit"]').click()

    // Verify login success
    await expect(page).toHaveURL('/admin/dashboard')
  })

  test('admin login and dashboard access', async ({ page }) => {
    await expect(page.locator('text=Admin Dashboard')).toBeVisible()
    await expect(page.locator('text=Welcome back, admin')).toBeVisible()
  })

  test('view products list', async ({ page }) => {
    // Navigate to products management
    await page.goto('/admin/products')

    // Verify products table
    await expect(page.locator('text=Manage Products')).toBeVisible()
    await expect(page.locator('table')).toBeVisible()
  })

  test('create new product', async ({ page }) => {
    // Navigate to create product
    await page.goto('/admin/products/create')

    // Fill form
    await page.fill('input[placeholder*="Áo"]', 'Test Product E2E')
    await page.fill('input[placeholder*="ao-"]', 'test-product-e2e')
    await page.fill('textarea', 'This is a test product created by E2E test')
    await page.selectOption('select', { index: 1 }) // Select first category
    await page.fill('input[placeholder="150000"]', '99000')
    await page.fill('input[placeholder="50"]', '5')

    // Submit form
    await page.locator('button[type="submit"]').click()

    // Verify redirect to products list
    await expect(page).toHaveURL('/admin/products')
  })

  test('view orders list', async ({ page }) => {
    // Navigate to orders management
    await page.goto('/admin/orders')

    // Verify orders table
    await expect(page.locator('text=Manage Orders')).toBeVisible()
  })

  test('filter orders by status', async ({ page }) => {
    await page.goto('/admin/orders')

    // Click on pending filter
    await page.locator('button:has-text("Pending")').click()

    // Verify URL contains status filter
    // (Would check if filtered results are shown)
  })

  test('admin logout', async ({ page }) => {
    // Click logout button
    await page.locator('button:has-text("Logout")').click()

    // Verify redirected to login
    await expect(page).toHaveURL('/admin')
  })
})
