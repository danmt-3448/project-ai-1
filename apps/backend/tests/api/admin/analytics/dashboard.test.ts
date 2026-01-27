import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

/**
 * Unit tests for GET /api/admin/analytics/dashboard
 * 
 * Tests the comprehensive dashboard analytics endpoint that aggregates:
 * - Products: total, published, unpublished counts
 * - Inventory: total units, by category, low stock alerts
 * - Revenue: total, average order value, monthly trends
 * - Orders: status breakdown
 * 
 * TDD Approach: Tests written before implementation
 */

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

// Helper to generate valid admin JWT token
const generateAdminToken = (adminId: string = '1'): string => {
  return jwt.sign({ adminId, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
};

describe('GET /api/admin/analytics/dashboard', () => {
  let adminToken: string;

  beforeAll(async () => {
    // Setup: Create admin user for auth
    const admin = await prisma.adminUser.upsert({
      where: { username: 'test-admin' },
      update: {},
      create: {
        username: 'test-admin',
        password: 'hashed-password',
      },
    });
    adminToken = generateAdminToken(admin.id);
  });

  afterAll(async () => {
    // Cleanup
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.adminUser.deleteMany({ where: { username: 'test-admin' } });
  });

  it('should return 401 if no auth token provided', async () => {
    // TDD: Test auth requirement first
    const response = await fetch('http://localhost:3001/api/admin/analytics/dashboard');
    expect(response.status).toBe(401);
  });

  it('should return 401 for invalid JWT token', async () => {
    const response = await fetch('http://localhost:3001/api/admin/analytics/dashboard', {
      headers: {
        Authorization: 'Bearer invalid-token-here',
      },
    });
    expect(response.status).toBe(401);
  });

  it('should return dashboard data with all expected fields', async () => {
    // TDD: Define expected response structure
    const response = await fetch('http://localhost:3001/api/admin/analytics/dashboard', {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    // Assert structure
    expect(data).toHaveProperty('products');
    expect(data.products).toHaveProperty('total');
    expect(data.products).toHaveProperty('published');
    expect(data.products).toHaveProperty('unpublished');

    expect(data).toHaveProperty('inventory');
    expect(data.inventory).toHaveProperty('totalUnits');
    expect(data.inventory).toHaveProperty('byCategory');
    expect(data.inventory).toHaveProperty('lowStock');
    expect(Array.isArray(data.inventory.byCategory)).toBe(true);
    expect(Array.isArray(data.inventory.lowStock)).toBe(true);

    expect(data).toHaveProperty('revenue');
    expect(data.revenue).toHaveProperty('totalRevenue');
    expect(data.revenue).toHaveProperty('totalOrders');
    expect(data.revenue).toHaveProperty('averageOrderValue');
    expect(data.revenue).toHaveProperty('byMonth');
    expect(data.revenue).toHaveProperty('topProducts');
    expect(Array.isArray(data.revenue.byMonth)).toBe(true);
    expect(Array.isArray(data.revenue.topProducts)).toBe(true);

    expect(data).toHaveProperty('orders');
    expect(data.orders).toHaveProperty('total');
    expect(data.orders).toHaveProperty('confirmed');
    expect(data.orders).toHaveProperty('processing');
    expect(data.orders).toHaveProperty('shipped');
    expect(data.orders).toHaveProperty('delivered');
    expect(data.orders).toHaveProperty('cancelled');
    expect(data.orders).toHaveProperty('failed');
  });

  it('should return correct product counts', async () => {
    // Setup: Create test products
    const category = await prisma.category.create({
      data: { name: 'Test Category', slug: 'test-cat' },
    });

    await prisma.product.createMany({
      data: [
        { name: 'Product 1', slug: 'p1', price: 100, inventory: 10, published: true, categoryId: category.id, images: '[]' },
        { name: 'Product 2', slug: 'p2', price: 200, inventory: 5, published: true, categoryId: category.id, images: '[]' },
        { name: 'Product 3', slug: 'p3', price: 300, inventory: 0, published: false, categoryId: category.id, images: '[]' },
      ],
    });

    const response = await fetch('http://localhost:3001/api/admin/analytics/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const data = await response.json();
    expect(data.products.total).toBe(3);
    expect(data.products.published).toBe(2);
    expect(data.products.unpublished).toBe(1);
  });

  it('should return correct inventory totals and low stock alerts', async () => {
    const response = await fetch('http://localhost:3001/api/admin/analytics/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const data = await response.json();
    expect(data.inventory.totalUnits).toBe(15); // 10 + 5 + 0
    expect(data.inventory.lowStock.length).toBeGreaterThanOrEqual(2); // inventory <= 5
  });

  it('should calculate revenue only from confirmed orders', async () => {
    // Setup: Create orders with different statuses
    const product = await prisma.product.findFirst();
    if (!product) throw new Error('No product found');

    const confirmedTotal = 2 * product.price;
    const cancelledTotal = 1 * product.price;

    await prisma.order.create({
      data: {
        buyerName: 'Buyer 1',
        buyerEmail: 'buyer1@test.com',
        address: 'Address 1',
        status: 'CONFIRMED',
        total: confirmedTotal,
        items: {
          create: [
            { productId: product.id, quantity: 2, price: product.price, name: product.name },
          ],
        },
      },
    });

    await prisma.order.create({
      data: {
        buyerName: 'Buyer 2',
        buyerEmail: 'buyer2@test.com',
        address: 'Address 2',
        status: 'CANCELLED',
        total: cancelledTotal,
        items: {
          create: [
            { productId: product.id, quantity: 1, price: product.price, name: product.name },
          ],
        },
      },
    });

    const response = await fetch('http://localhost:3001/api/admin/analytics/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const data = await response.json();
    // Only confirmed order should count
    expect(data.revenue.totalRevenue).toBe(confirmedTotal);
    expect(data.revenue.totalOrders).toBe(1);
    expect(data.revenue.averageOrderValue).toBe(confirmedTotal);
  });

  it('should support date range filtering with query params', async () => {
    const startDate = new Date('2026-01-01').toISOString();
    const endDate = new Date('2026-01-31').toISOString();

    const response = await fetch(
      `http://localhost:3001/api/admin/analytics/dashboard?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('revenue');
  });

  it('should return 400 for invalid date formats', async () => {
    const response = await fetch(
      'http://localhost:3001/api/admin/analytics/dashboard?startDate=invalid-date',
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('should return order status breakdown', async () => {
    const response = await fetch('http://localhost:3001/api/admin/analytics/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const data = await response.json();
    expect(data.orders.confirmed).toBeGreaterThanOrEqual(1);
    expect(data.orders.cancelled).toBeGreaterThanOrEqual(1);
    expect(data.orders.total).toBeGreaterThanOrEqual(2);
  });

  it('should return top products by revenue (top 10)', async () => {
    const response = await fetch('http://localhost:3001/api/admin/analytics/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const data = await response.json();
    expect(Array.isArray(data.revenue.topProducts)).toBe(true);
    expect(data.revenue.topProducts.length).toBeLessThanOrEqual(10);
    
    if (data.revenue.topProducts.length > 0) {
      const topProduct = data.revenue.topProducts[0];
      expect(topProduct).toHaveProperty('productId');
      expect(topProduct).toHaveProperty('name');
      expect(topProduct).toHaveProperty('revenue');
      expect(topProduct).toHaveProperty('unitsSold');
    }
  });

  it('should return monthly revenue trends (last 12 months)', async () => {
    const response = await fetch('http://localhost:3001/api/admin/analytics/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const data = await response.json();
    expect(Array.isArray(data.revenue.byMonth)).toBe(true);
    expect(data.revenue.byMonth.length).toBeLessThanOrEqual(12);
    
    if (data.revenue.byMonth.length > 0) {
      const monthData = data.revenue.byMonth[0];
      expect(monthData).toHaveProperty('month');
      expect(monthData).toHaveProperty('year');
      expect(monthData).toHaveProperty('revenue');
      expect(monthData).toHaveProperty('orderCount');
    }
  });
});
