import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

/**
 * Test Suite: GET /api/admin/analytics/dashboard
 * 
 * Tests dashboard analytics endpoint covering:
 * - Authentication (401 unauthorized)
 * - Date validation (400 invalid format)
 * - Complete metrics response (products, inventory, revenue, orders)
 * - Performance requirements (< 500ms response time)
 * 
 * Following TDD approach: RED → GREEN → REFACTOR
 */

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const API_BASE = 'http://localhost:3001'

// Test data cleanup and setup
let adminId: string
let adminToken: string
let testCategoryId: string
let testProductIds: string[] = []
let testOrderIds: string[] = []

describe('GET /api/admin/analytics/dashboard', () => {
  beforeAll(async () => {
    // Create admin user for auth tests
    const admin = await prisma.adminUser.create({
      data: {
        username: 'test-admin-analytics',
        password: 'hashed-password', // Not used in JWT generation
      },
    })
    adminId = admin.id
    adminToken = jwt.sign({ adminId: admin.id }, JWT_SECRET)

    // Create test category
    const category = await prisma.category.create({
      data: {
        name: 'Test Category Analytics',
        slug: 'test-category-analytics',
      },
    })
    testCategoryId = category.id

    // Create test products (mix of published/unpublished, various inventory levels)
    const products = await Promise.all([
      // Published products with good inventory
      prisma.product.create({
        data: {
          name: 'Product High Stock',
          slug: 'product-high-stock',
          price: 100000,
          inventory: 50,
          published: true,
          categoryId: testCategoryId,
        },
      }),
      // Published product with low stock (for low stock alert)
      prisma.product.create({
        data: {
          name: 'Product Low Stock',
          slug: 'product-low-stock',
          price: 150000,
          inventory: 2, // Below threshold (5)
          published: true,
          categoryId: testCategoryId,
        },
      }),
      // Unpublished product
      prisma.product.create({
        data: {
          name: 'Product Unpublished',
          slug: 'product-unpublished',
          price: 200000,
          inventory: 20,
          published: false,
          categoryId: testCategoryId,
        },
      }),
    ])
    testProductIds = products.map((p) => p.id)

    // Create test orders with various statuses
    // Order 1: CONFIRMED (should count in revenue)
    const order1 = await prisma.order.create({
      data: {
        buyerName: 'Test Buyer 1',
        buyerEmail: 'buyer1@test.com',
        address: 'Test Address 1',
        total: 250000,
        status: 'CONFIRMED',
        createdAt: new Date('2026-01-15'),
        items: {
          create: [
            {
              productId: testProductIds[0],
              name: 'Product High Stock',
              price: 100000,
              quantity: 2,
            },
            {
              productId: testProductIds[1],
              name: 'Product Low Stock',
              price: 150000,
              quantity: 1,
            },
          ],
        },
      },
    })
    testOrderIds.push(order1.id)

    // Order 2: PROCESSING (should count in revenue)
    const order2 = await prisma.order.create({
      data: {
        buyerName: 'Test Buyer 2',
        buyerEmail: 'buyer2@test.com',
        address: 'Test Address 2',
        total: 300000,
        status: 'PROCESSING',
        createdAt: new Date('2026-01-20'),
        items: {
          create: [
            {
              productId: testProductIds[0],
              name: 'Product High Stock',
              price: 100000,
              quantity: 3,
            },
          ],
        },
      },
    })
    testOrderIds.push(order2.id)

    // Order 3: CANCELLED (should NOT count in revenue)
    const order3 = await prisma.order.create({
      data: {
        buyerName: 'Test Buyer 3',
        buyerEmail: 'buyer3@test.com',
        address: 'Test Address 3',
        total: 500000,
        status: 'CANCELLED',
        createdAt: new Date('2026-01-25'),
      },
    })
    testOrderIds.push(order3.id)

    // Order 4: FAILED (should NOT count in revenue)
    const order4 = await prisma.order.create({
      data: {
        buyerName: 'Test Buyer 4',
        buyerEmail: 'buyer4@test.com',
        address: 'Test Address 4',
        total: 400000,
        status: 'FAILED',
        createdAt: new Date('2026-01-26'),
      },
    })
    testOrderIds.push(order4.id)
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.orderItem.deleteMany({
      where: { orderId: { in: testOrderIds } },
    })
    await prisma.order.deleteMany({
      where: { id: { in: testOrderIds } },
    })
    await prisma.product.deleteMany({
      where: { id: { in: testProductIds } },
    })
    await prisma.category.deleteMany({
      where: { id: testCategoryId },
    })
    await prisma.adminUser.deleteMany({
      where: { id: adminId },
    })
  })

  /**
   * TEST 1: Authentication - Unauthorized Access
   * Should return 401 when no JWT token provided
   */
  it('should return 401 when no authorization token is provided', async () => {
    const response = await fetch(`${API_BASE}/api/admin/analytics/dashboard`)

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data).toHaveProperty('error')
  })

  /**
   * TEST 2: Authentication - Invalid Token
   * Should return 401 when JWT token is invalid
   */
  it('should return 401 when authorization token is invalid', async () => {
    const response = await fetch(`${API_BASE}/api/admin/analytics/dashboard`, {
      headers: {
        Authorization: 'Bearer invalid-token-xyz',
      },
    })

    expect(response.status).toBe(401)
  })

  /**
   * TEST 3: Validation - Invalid Date Format
   * Should return 400 when startDate or endDate has invalid format
   */
  it('should return 400 when date format is invalid', async () => {
    const response = await fetch(
      `${API_BASE}/api/admin/analytics/dashboard?startDate=invalid-date`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    )

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toHaveProperty('error')
    expect(data.error).toMatch(/invalid.*date/i)
  })

  /**
   * TEST 4: Success Response - Complete Dashboard Metrics
   * Should return 200 with all required sections:
   * - products: { total, published, unpublished }
   * - inventory: { totalUnits, byCategory[], lowStock[] }
   * - revenue: { totalRevenue, totalOrders, averageOrderValue, byMonth[], topProducts[] }
   * - orders: { total, confirmed, processing, shipped, delivered, cancelled, failed }
   */
  it('should return complete dashboard metrics when authenticated', async () => {
    const response = await fetch(`${API_BASE}/api/admin/analytics/dashboard`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    })

    expect(response.status).toBe(200)
    const data = await response.json()

    // Verify products section
    expect(data).toHaveProperty('products')
    expect(data.products).toHaveProperty('total')
    expect(data.products).toHaveProperty('published')
    expect(data.products).toHaveProperty('unpublished')
    expect(data.products.total).toBeGreaterThanOrEqual(3) // Our test products
    expect(data.products.published).toBeGreaterThanOrEqual(2)
    expect(data.products.unpublished).toBeGreaterThanOrEqual(1)

    // Verify inventory section
    expect(data).toHaveProperty('inventory')
    expect(data.inventory).toHaveProperty('totalUnits')
    expect(data.inventory).toHaveProperty('byCategory')
    expect(data.inventory).toHaveProperty('lowStock')
    expect(Array.isArray(data.inventory.byCategory)).toBe(true)
    expect(Array.isArray(data.inventory.lowStock)).toBe(true)

    // Find our test category in byCategory
    const testCategory = data.inventory.byCategory.find(
      (cat: any) => cat.categoryId === testCategoryId
    )
    expect(testCategory).toBeDefined()
    expect(testCategory.totalUnits).toBe(72) // 50 + 2 + 20

    // Verify low stock items (should include product with inventory 2)
    const lowStockProduct = data.inventory.lowStock.find(
      (p: any) => p.productId === testProductIds[1]
    )
    expect(lowStockProduct).toBeDefined()
    expect(lowStockProduct.inventory).toBe(2)

    // Verify revenue section
    expect(data).toHaveProperty('revenue')
    expect(data.revenue).toHaveProperty('totalRevenue')
    expect(data.revenue).toHaveProperty('totalOrders')
    expect(data.revenue).toHaveProperty('averageOrderValue')
    expect(data.revenue).toHaveProperty('byMonth')
    expect(data.revenue).toHaveProperty('topProducts')

    // Revenue should only count CONFIRMED and PROCESSING orders (550000)
    // NOT cancelled (500000) or failed (400000)
    expect(data.revenue.totalRevenue).toBeGreaterThanOrEqual(550000)
    expect(data.revenue.totalOrders).toBeGreaterThanOrEqual(2)

    expect(Array.isArray(data.revenue.byMonth)).toBe(true)
    expect(Array.isArray(data.revenue.topProducts)).toBe(true)

    // Verify orders section
    expect(data).toHaveProperty('orders')
    expect(data.orders).toHaveProperty('total')
    expect(data.orders).toHaveProperty('confirmed')
    expect(data.orders).toHaveProperty('processing')
    expect(data.orders).toHaveProperty('shipped')
    expect(data.orders).toHaveProperty('delivered')
    expect(data.orders).toHaveProperty('cancelled')
    expect(data.orders).toHaveProperty('failed')

    // Verify order counts match our test data
    expect(data.orders.total).toBeGreaterThanOrEqual(4)
    expect(data.orders.confirmed).toBeGreaterThanOrEqual(1)
    expect(data.orders.processing).toBeGreaterThanOrEqual(1)
    expect(data.orders.cancelled).toBeGreaterThanOrEqual(1)
    expect(data.orders.failed).toBeGreaterThanOrEqual(1)
  })

  /**
   * TEST 5: Date Range Filtering
   * Should respect startDate and endDate query parameters
   */
  it('should filter data by date range when startDate and endDate provided', async () => {
    // Query only January 2026 data
    const response = await fetch(
      `${API_BASE}/api/admin/analytics/dashboard?startDate=2026-01-01&endDate=2026-01-31`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    )

    expect(response.status).toBe(200)
    const data = await response.json()

    // All our test orders are in January 2026
    expect(data.revenue.totalOrders).toBeGreaterThanOrEqual(2)
    expect(data.orders.total).toBeGreaterThanOrEqual(4)
  })

  /**
   * TEST 6: Performance Requirement
   * Should respond within 500ms (parallel queries with Promise.all)
   */
  it('should respond within 500ms performance requirement', async () => {
    const startTime = Date.now()

    const response = await fetch(`${API_BASE}/api/admin/analytics/dashboard`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    })

    const endTime = Date.now()
    const responseTime = endTime - startTime

    expect(response.status).toBe(200)
    expect(responseTime).toBeLessThan(500)
  }, 1000) // 1s timeout for test itself

  /**
   * TEST 7: Top Products Calculation
   * Should return top products sorted by revenue DESC
   */
  it('should return top products sorted by revenue descending', async () => {
    const response = await fetch(`${API_BASE}/api/admin/analytics/dashboard`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    })

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data.revenue.topProducts.length).toBeGreaterThan(0)

    // Verify sorting: each product should have revenue >= next product
    for (let i = 0; i < data.revenue.topProducts.length - 1; i++) {
      expect(data.revenue.topProducts[i].revenue).toBeGreaterThanOrEqual(
        data.revenue.topProducts[i + 1].revenue
      )
    }

    // Verify top product has all required fields
    const topProduct = data.revenue.topProducts[0]
    expect(topProduct).toHaveProperty('productId')
    expect(topProduct).toHaveProperty('name')
    expect(topProduct).toHaveProperty('slug')
    expect(topProduct).toHaveProperty('revenue')
    expect(topProduct).toHaveProperty('unitsSold')
    expect(topProduct).toHaveProperty('orderCount')
  })
})
