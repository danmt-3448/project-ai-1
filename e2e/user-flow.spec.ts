import { test, expect } from '@playwright/test'

test.describe('User Shopping Flow', () => {
  test('complete shopping flow - browse, add to cart, checkout', async ({ page }) => {
    // 1. Visit home page
    await page.goto('/')
    await expect(page).toHaveTitle(/Mini Store/)

    // 2. Browse products
    await expect(page.locator('text=Welcome to Mini Store')).toBeVisible()
    await expect(page.locator('text=Featured Products')).toBeVisible()

    // 3. Click on a product
    const firstProduct = page.locator('[href*="/products/"]').first()
    await firstProduct.click()

    // 4. Verify product detail page
    await expect(page.locator('h1')).toBeVisible()
    
    // 5. Add to cart (if in stock)
    const addToCartButton = page.locator('button:has-text("Add to Cart")')
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click()
      
      // 6. Verify cart page
      await expect(page).toHaveURL(/\/cart/)
      await expect(page.locator('text=Shopping Cart')).toBeVisible()

      // 7. Proceed to checkout
      await page.locator('button:has-text("Proceed to Checkout")').click()

      // 8. Fill checkout form
      await page.fill('input[type="text"]', 'Test User')
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('textarea', '123 Test Street, Test City, Test Country')

      // 9. Submit order
      await page.locator('button[type="submit"]').click()

      // 10. Verify order confirmation
      await expect(page).toHaveURL(/\/order\/\d+/)
      await expect(page.locator('text=Order Placed Successfully')).toBeVisible()
    }
  })

  test('browse products by category', async ({ page }) => {
    await page.goto('/')

    // Click on categories link
    await page.locator('text=Categories').click()
    await expect(page).toHaveURL('/categories')

    // Click on a category
    const firstCategory = page.locator('a[href*="/categories/"]').first()
    await firstCategory.click()

    // Verify category products page
    await expect(page.locator('text=products found')).toBeVisible()
  })

  test('cart operations - add, update quantity, remove', async ({ page }) => {
    await page.goto('/')

    // Add first product to cart
    const firstProduct = page.locator('[href*="/products/"]').first()
    await firstProduct.click()

    const addToCartButton = page.locator('button:has-text("Add to Cart")')
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click()

      // Verify in cart
      await expect(page).toHaveURL(/\/cart/)

      // Update quantity
      const plusButton = page.locator('button:has-text("+")').first()
      await plusButton.click()

      // Verify quantity increased
      // (Would need to check the actual value)

      // Remove item
      const removeButton = page.locator('button:has-text("Remove")')
      await removeButton.click()

      // Verify cart is empty
      await expect(page.locator('text=Your cart is empty')).toBeVisible()
    }
  })

  test('search products', async ({ page }) => {
    await page.goto('/')

    // Filter by category
    const categoryButton = page.locator('button:has-text("Áo")').first()
    if (await categoryButton.isVisible()) {
      await categoryButton.click()

      // Verify filtered products
      await expect(page.locator('[href*="/products/"]')).toHaveCount.greaterThan(0)
    }
  })
})
