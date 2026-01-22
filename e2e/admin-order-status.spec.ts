/**
 * E2E Tests: Admin Order Status Management
 * Sprint 6: Order Management Enhancement - TEST-11
 * 
 * Tests full order status workflows from admin perspective
 */

import { test, expect } from '@playwright/test';

// Helper: Login as admin
async function loginAsAdmin(page: any) {
  await page.goto('http://localhost:3000/admin');
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin/dashboard');
}

// Helper: Create test order via checkout
async function createTestOrder(page: any) {
  // Add product to cart
  await page.goto('http://localhost:3000');
  await page.click('text=View All Products');
  await page.click('.product-card:first-child button:has-text("Add to Cart")');
  
  // Go to cart
  await page.click('a[href="/cart"]');
  await expect(page.locator('h1:has-text("Shopping Cart")')).toBeVisible();
  
  // Checkout
  await page.click('a[href="/checkout"]');
  await page.fill('input[name="buyerName"]', 'E2E Test User');
  await page.fill('input[name="buyerEmail"]', 'e2e@test.com');
  await page.fill('textarea[name="address"]', '123 Test Street, Test City');
  await page.click('button:has-text("Place Order")');
  
  // Wait for success and get order ID
  await page.waitForURL('**/order/**');
  const url = page.url();
  const orderId = url.split('/order/')[1];
  return orderId;
}

test.describe('Admin Order Status Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should mark order as Processing', async ({ page }) => {
    // Create test order
    const orderId = await createTestOrder(page);
    
    // Navigate to admin order detail
    await page.goto(`http://localhost:3000/admin/orders/${orderId}`);
    
    // Verify initial status is PENDING
    await expect(page.locator('text=PENDING')).toBeVisible();
    
    // Click Mark Processing button
    await page.click('button:has-text("Mark Processing")');
    
    // Verify alert (confirm action)
    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('Processing');
      dialog.accept();
    });
    
    // Wait for status update
    await page.waitForTimeout(1000);
    
    // Verify status changed to PROCESSING
    await expect(page.locator('text=PROCESSING')).toBeVisible();
    
    // Verify activity timeline shows transition
    await expect(page.locator('text=PENDING → PROCESSING')).toBeVisible();
  });

  test('should mark order as Shipped with tracking info', async ({ page }) => {
    // Create order and mark as Processing first
    const orderId = await createTestOrder(page);
    await page.goto(`http://localhost:3000/admin/orders/${orderId}`);
    await page.click('button:has-text("Mark Processing")');
    page.once('dialog', d => d.accept());
    await page.waitForTimeout(1000);
    
    // Click Mark Shipped
    await page.click('button:has-text("Mark Shipped")');
    
    // Fill shipping modal
    await expect(page.locator('h2:has-text("Mark as Shipped")')).toBeVisible();
    await page.fill('input[placeholder*="FDX"]', 'TEST-TRACK-123');
    await page.selectOption('select', 'FedEx');
    await page.click('button:has-text("Confirm")');
    
    // Wait for update
    await page.waitForTimeout(1000);
    
    // Verify status changed to SHIPPED
    await expect(page.locator('text=SHIPPED')).toBeVisible();
    
    // Verify tracking number displayed
    await expect(page.locator('text=TEST-TRACK-123')).toBeVisible();
    await expect(page.locator('text=FedEx')).toBeVisible();
    
    // Verify activity timeline
    await expect(page.locator('text=PROCESSING → SHIPPED')).toBeVisible();
  });

  test('should mark order as Delivered', async ({ page }) => {
    // Create order and progress to SHIPPED
    const orderId = await createTestOrder(page);
    await page.goto(`http://localhost:3000/admin/orders/${orderId}`);
    
    // Progress: PENDING → PROCESSING
    await page.click('button:has-text("Mark Processing")');
    page.once('dialog', d => d.accept());
    await page.waitForTimeout(1000);
    
    // Progress: PROCESSING → SHIPPED
    await page.click('button:has-text("Mark Shipped")');
    await page.fill('input[placeholder*="FDX"]', 'TRACK-456');
    await page.selectOption('select', 'UPS');
    await page.click('button:has-text("Confirm")');
    await page.waitForTimeout(1000);
    
    // Mark as Delivered
    await page.click('button:has-text("Mark Delivered")');
    page.once('dialog', d => {
      expect(d.message()).toContain('Delivered');
      d.accept();
    });
    await page.waitForTimeout(1000);
    
    // Verify status changed to DELIVERED
    await expect(page.locator('text=DELIVERED')).toBeVisible();
    
    // Verify complete activity timeline
    await expect(page.locator('text=SHIPPED → DELIVERED')).toBeVisible();
    
    // Verify all action buttons are disabled (terminal state)
    await expect(page.locator('button:has-text("Mark Processing")')).toBeDisabled();
    await expect(page.locator('button:has-text("Mark Shipped")')).toBeDisabled();
    await expect(page.locator('button:has-text("Mark Delivered")')).toBeDisabled();
    await expect(page.locator('button:has-text("Cancel Order")')).toBeDisabled();
  });

  test('should cancel order with inventory restock', async ({ page }) => {
    // Create test order
    const orderId = await createTestOrder(page);
    const productBefore = await getProductInventory(page, 'first-product');
    
    // Navigate to admin order detail
    await page.goto(`http://localhost:3000/admin/orders/${orderId}`);
    
    // Click Cancel Order
    await page.click('button:has-text("Cancel Order")');
    
    // Fill cancellation modal
    await expect(page.locator('h2:has-text("Cancel Order")')).toBeVisible();
    await page.fill('textarea', 'Customer requested cancellation');
    
    // Ensure restock checkbox is checked
    const restockCheckbox = page.locator('input[type="checkbox"]#shouldRestock');
    await expect(restockCheckbox).toBeChecked();
    
    // Confirm cancellation
    await page.click('button:has-text("Cancel Order"):last-of-type');
    
    // Wait for update
    await page.waitForTimeout(1000);
    
    // Verify status changed to CANCELLED
    await expect(page.locator('text=CANCELLED')).toBeVisible();
    
    // Verify cancellation reason in activity timeline
    await expect(page.locator('text=Customer requested cancellation')).toBeVisible();
    
    // Verify inventory was restocked
    const productAfter = await getProductInventory(page, 'first-product');
    expect(productAfter).toBeGreaterThan(productBefore);
  });

  test('should prevent invalid status transitions', async ({ page }) => {
    // Create order
    const orderId = await createTestOrder(page);
    await page.goto(`http://localhost:3000/admin/orders/${orderId}`);
    
    // Verify only valid transitions are enabled
    await expect(page.locator('button:has-text("Mark Processing")')).toBeEnabled();
    await expect(page.locator('button:has-text("Mark Shipped")')).toBeDisabled();
    await expect(page.locator('button:has-text("Mark Delivered")')).toBeDisabled();
    await expect(page.locator('button:has-text("Cancel Order")')).toBeEnabled();
    
    // After marking as Processing
    await page.click('button:has-text("Mark Processing")');
    page.once('dialog', d => d.accept());
    await page.waitForTimeout(1000);
    
    // Verify button states changed
    await expect(page.locator('button:has-text("Mark Processing")')).toBeDisabled();
    await expect(page.locator('button:has-text("Mark Shipped")')).toBeEnabled();
    await expect(page.locator('button:has-text("Mark Delivered")')).toBeDisabled();
    await expect(page.locator('button:has-text("Cancel Order")')).toBeEnabled();
  });

  test('should prevent cancellation after shipping', async ({ page }) => {
    // Create order and ship it
    const orderId = await createTestOrder(page);
    await page.goto(`http://localhost:3000/admin/orders/${orderId}`);
    
    // Progress to SHIPPED
    await page.click('button:has-text("Mark Processing")');
    page.once('dialog', d => d.accept());
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Mark Shipped")');
    await page.fill('input[placeholder*="FDX"]', 'NO-CANCEL-123');
    await page.selectOption('select', 'DHL');
    await page.click('button:has-text("Confirm")');
    await page.waitForTimeout(1000);
    
    // Verify Cancel Order button is disabled
    await expect(page.locator('button:has-text("Cancel Order")')).toBeDisabled();
  });

  test('should display activity timeline chronologically', async ({ page }) => {
    // Create order and perform multiple transitions
    const orderId = await createTestOrder(page);
    await page.goto(`http://localhost:3000/admin/orders/${orderId}`);
    
    // Transition 1: PENDING → PROCESSING
    await page.click('button:has-text("Mark Processing")');
    page.once('dialog', d => d.accept());
    await page.waitForTimeout(1000);
    
    // Transition 2: PROCESSING → SHIPPED
    await page.click('button:has-text("Mark Shipped")');
    await page.fill('input[placeholder*="FDX"]', 'TIMELINE-TEST-789');
    await page.selectOption('select', 'Viettel Post');
    await page.click('button:has-text("Confirm")');
    await page.waitForTimeout(1000);
    
    // Verify activity timeline shows both transitions in order
    const timeline = page.locator('[data-testid="activity-timeline"]');
    await expect(timeline).toBeVisible();
    
    const activities = timeline.locator('.activity-item');
    await expect(activities).toHaveCount(2);
    
    // First activity should be PENDING → PROCESSING
    await expect(activities.first()).toContainText('PENDING');
    await expect(activities.first()).toContainText('PROCESSING');
    
    // Second activity should be PROCESSING → SHIPPED
    await expect(activities.last()).toContainText('PROCESSING');
    await expect(activities.last()).toContainText('SHIPPED');
  });

  test('should show admin username in activity timeline', async ({ page }) => {
    // Create order and make a transition
    const orderId = await createTestOrder(page);
    await page.goto(`http://localhost:3000/admin/orders/${orderId}`);
    
    await page.click('button:has-text("Mark Processing")');
    page.once('dialog', d => d.accept());
    await page.waitForTimeout(1000);
    
    // Verify admin username appears in timeline
    await expect(page.locator('text=admin')).toBeVisible(); // Default admin username
  });
});

// Helper function to get product inventory
async function getProductInventory(page: any, productSlug: string): Promise<number> {
  await page.goto('http://localhost:3000/admin/products');
  const inventoryText = await page.locator(`tr:has-text("${productSlug}") td:nth-child(5)`).textContent();
  return parseInt(inventoryText || '0', 10);
}
