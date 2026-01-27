import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

/**
 * Unit tests for GET /api/admin/analytics/revenue
 * 
 * Tests revenue analytics endpoint with 4 groupBy modes:
 * - order: Individual orders with pagination
 * - product: Revenue per product
 * - month: Monthly aggregation
 * - category: Revenue per category
 * 
 * TDD Approach: Tests written before implementation
 */

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

const generateAdminToken = (adminId: string = '1'): string => {
  return jwt.sign({ adminId, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
};

describe('GET /api/admin/analytics/revenue', () => {
  let adminToken: string;

  beforeAll(async () => {
    const admin = await prisma.adminUser.upsert({
      where: { username: 'test-admin-revenue' },
      update: {},
      create: {
        username: 'test-admin-revenue',
        password: 'hashed-password',
      },
    });
    adminToken = generateAdminToken(admin.id);
  });

  afterAll(async () => {
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.adminUser.deleteMany({ where: { username: 'test-admin-revenue' } });
  });

  it('should return 401 if no auth token provided', async () => {
    const response = await fetch('http://localhost:3001/api/admin/analytics/revenue?groupBy=product');
    expect(response.status).toBe(401);
  });

  it('should return 400 if groupBy parameter is missing', async () => {
    const response = await fetch('http://localhost:3001/api/admin/analytics/revenue', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('should return 400 for invalid groupBy value', async () => {
    const response = await fetch('http://localhost:3001/api/admin/analytics/revenue?groupBy=invalid', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('groupBy');
  });

  describe('groupBy=order', () => {
    beforeAll(async () => {
      const category = await prisma.category.create({
        data: { name: 'Test Category', slug: 'test-cat' },
      });
      await prisma.product.create({
        data: {
          name: 'Product 1',
          slug: 'p1',
          price: 100,
          inventory: 10,
          published: true,
          categoryId: category.id,
          images: '[]',
        },
      });

      await prisma.order.createMany({
        data: [
          {
            buyerName: 'Buyer 1',
            buyerEmail: 'buyer1@test.com',
            address: 'Address 1',
            status: 'CONFIRMED',
            total: 200,
          },
          {
            buyerName: 'Buyer 2',
            buyerEmail: 'buyer2@test.com',
            address: 'Address 2',
            status: 'DELIVERED',
            total: 300,
          },
        ],
      });
    });

    it('should return individual orders with pagination', async () => {
      const response = await fetch('http://localhost:3001/api/admin/analytics/revenue?groupBy=order&limit=10&offset=0', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('summary');
      expect(Array.isArray(data.data)).toBe(true);

      if (data.data.length > 0) {
        const order = data.data[0];
        expect(order).toHaveProperty('id');
        expect(order).toHaveProperty('buyerName');
        expect(order).toHaveProperty('revenue');
        expect(order).toHaveProperty('itemCount');
        expect(order).toHaveProperty('status');
        expect(order).toHaveProperty('createdAt');
      }
    });
  });

  describe('groupBy=product', () => {
    it('should return revenue per product', async () => {
      const response = await fetch('http://localhost:3001/api/admin/analytics/revenue?groupBy=product', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('summary');
      expect(Array.isArray(data.data)).toBe(true);

      if (data.data.length > 0) {
        const productRevenue = data.data[0];
        expect(productRevenue).toHaveProperty('productId');
        expect(productRevenue).toHaveProperty('name');
        expect(productRevenue).toHaveProperty('slug');
        expect(productRevenue).toHaveProperty('categoryName');
        expect(productRevenue).toHaveProperty('revenue');
        expect(productRevenue).toHaveProperty('unitsSold');
        expect(productRevenue).toHaveProperty('orderCount');
      }
    });
  });

  describe('groupBy=month', () => {
    it('should return monthly revenue aggregation', async () => {
      const response = await fetch('http://localhost:3001/api/admin/analytics/revenue?groupBy=month', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('summary');
      expect(Array.isArray(data.data)).toBe(true);

      if (data.data.length > 0) {
        const monthData = data.data[0];
        expect(monthData).toHaveProperty('month');
        expect(monthData).toHaveProperty('year');
        expect(monthData).toHaveProperty('revenue');
        expect(monthData).toHaveProperty('orderCount');
        expect(monthData).toHaveProperty('averageOrderValue');
      }
    });

    it('should sort monthly data by year and month DESC', async () => {
      const response = await fetch('http://localhost:3001/api/admin/analytics/revenue?groupBy=month', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const data = await response.json();
      if (data.data.length > 1) {
        const first = data.data[0];
        const second = data.data[1];
        const firstDate = new Date(first.year, first.month - 1);
        const secondDate = new Date(second.year, second.month - 1);
        expect(firstDate.getTime()).toBeGreaterThanOrEqual(secondDate.getTime());
      }
    });
  });

  describe('groupBy=category', () => {
    it('should return revenue per category', async () => {
      const response = await fetch('http://localhost:3001/api/admin/analytics/revenue?groupBy=category', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('summary');
      expect(Array.isArray(data.data)).toBe(true);

      if (data.data.length > 0) {
        const categoryRevenue = data.data[0];
        expect(categoryRevenue).toHaveProperty('categoryId');
        expect(categoryRevenue).toHaveProperty('name');
        expect(categoryRevenue).toHaveProperty('slug');
        expect(categoryRevenue).toHaveProperty('revenue');
        expect(categoryRevenue).toHaveProperty('unitsSold');
        expect(categoryRevenue).toHaveProperty('orderCount');
        expect(categoryRevenue).toHaveProperty('productCount');
      }
    });
  });

  describe('Date range filtering', () => {
    it('should support startDate and endDate parameters', async () => {
      const startDate = new Date('2026-01-01').toISOString();
      const endDate = new Date('2026-01-31').toISOString();

      const response = await fetch(
        `http://localhost:3001/api/admin/analytics/revenue?groupBy=product&startDate=${startDate}&endDate=${endDate}`,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );

      expect(response.status).toBe(200);
    });

    it('should return 400 for invalid date formats', async () => {
      const response = await fetch(
        'http://localhost:3001/api/admin/analytics/revenue?groupBy=product&startDate=invalid-date',
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });
  });

  describe('Pagination and sorting', () => {
    it('should support limit and offset for order mode', async () => {
      const response = await fetch(
        'http://localhost:3001/api/admin/analytics/revenue?groupBy=order&limit=5&offset=0',
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.length).toBeLessThanOrEqual(5);
    });

    it('should support sortBy and sortOrder parameters', async () => {
      const response = await fetch(
        'http://localhost:3001/api/admin/analytics/revenue?groupBy=product&sortBy=revenue&sortOrder=desc',
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      if (data.data.length > 1) {
        const first = data.data[0];
        const second = data.data[1];
        expect(first.revenue).toBeGreaterThanOrEqual(second.revenue);
      }
    });
  });

  describe('Summary calculations', () => {
    it('should include summary with total revenue and order count', async () => {
      const response = await fetch('http://localhost:3001/api/admin/analytics/revenue?groupBy=product', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const data = await response.json();
      expect(data.summary).toHaveProperty('totalRevenue');
      expect(data.summary).toHaveProperty('totalOrders');
      expect(typeof data.summary.totalRevenue).toBe('number');
      expect(typeof data.summary.totalOrders).toBe('number');
    });
  });
});
