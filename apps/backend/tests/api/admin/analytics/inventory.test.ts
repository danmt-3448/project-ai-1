import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

/**
 * Unit tests for GET /api/admin/analytics/inventory
 * 
 * Tests inventory analytics endpoint with 3 groupBy modes:
 * - category: Total units per category
 * - product: Product-level inventory
 * - status: Aggregate by published status
 * 
 * TDD Approach: Tests written before implementation
 */

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

const generateAdminToken = (adminId: string = '1'): string => {
  return jwt.sign({ adminId, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
};

describe('GET /api/admin/analytics/inventory', () => {
  let adminToken: string;

  beforeAll(async () => {
    const admin = await prisma.adminUser.upsert({
      where: { username: 'test-admin-inventory' },
      update: {},
      create: {
        username: 'test-admin-inventory',
        password: 'hashed-password',
      },
    });
    adminToken = generateAdminToken(admin.id);
  });

  afterAll(async () => {
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.adminUser.deleteMany({ where: { username: 'test-admin-inventory' } });
  });

  it('should return 401 if no auth token provided', async () => {
    const response = await fetch('http://localhost:3001/api/admin/analytics/inventory');
    expect(response.status).toBe(401);
  });

  describe('groupBy=category (default)', () => {
    beforeAll(async () => {
      const category1 = await prisma.category.create({
        data: { name: 'Electronics', slug: 'electronics' },
      });
      const category2 = await prisma.category.create({
        data: { name: 'Clothing', slug: 'clothing' },
      });

      await prisma.product.createMany({
        data: [
          { name: 'Laptop', slug: 'laptop', price: 1000, inventory: 5, published: true, categoryId: category1.id, images: '[]' },
          { name: 'Phone', slug: 'phone', price: 500, inventory: 3, published: true, categoryId: category1.id, images: '[]' },
          { name: 'Shirt', slug: 'shirt', price: 50, inventory: 20, published: true, categoryId: category2.id, images: '[]' },
          { name: 'Pants', slug: 'pants', price: 80, inventory: 0, published: false, categoryId: category2.id, images: '[]' },
        ],
      });
    });

    it('should return total units per category', async () => {
      const response = await fetch('http://localhost:3001/api/admin/analytics/inventory?groupBy=category', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('summary');
      expect(Array.isArray(data.data)).toBe(true);

      const electronicsCategory = data.data.find((c: any) => c.name === 'Electronics');
      expect(electronicsCategory).toBeDefined();
      expect(electronicsCategory.totalUnits).toBe(8); // 5 + 3
      expect(electronicsCategory.productCount).toBe(2);
      expect(electronicsCategory.publishedProducts).toBe(2);
      expect(electronicsCategory.unpublishedProducts).toBe(0);
    });

    it('should include low stock products count', async () => {
      const response = await fetch('http://localhost:3001/api/admin/analytics/inventory?groupBy=category&lowStockThreshold=5', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const data = await response.json();
      const electronicsCategory = data.data.find((c: any) => c.name === 'Electronics');
      expect(electronicsCategory.lowStockProducts).toBeGreaterThanOrEqual(2); // laptop=5, phone=3
    });

    it('should exclude unpublished products by default', async () => {
      const response = await fetch('http://localhost:3001/api/admin/analytics/inventory?groupBy=category', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const data = await response.json();
      const clothingCategory = data.data.find((c: any) => c.name === 'Clothing');
      expect(clothingCategory.totalUnits).toBe(20); // Only published shirt
    });

    it('should include unpublished products when includeUnpublished=true', async () => {
      const response = await fetch('http://localhost:3001/api/admin/analytics/inventory?groupBy=category&includeUnpublished=true', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const data = await response.json();
      const clothingCategory = data.data.find((c: any) => c.name === 'Clothing');
      expect(clothingCategory.totalUnits).toBe(20); // shirt + pants (0)
      expect(clothingCategory.unpublishedProducts).toBe(1);
    });
  });

  describe('groupBy=product', () => {
    it('should return product-level inventory details', async () => {
      const response = await fetch('http://localhost:3001/api/admin/analytics/inventory?groupBy=product', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(Array.isArray(data.data)).toBe(true);
      
      if (data.data.length > 0) {
        const product = data.data[0];
        expect(product).toHaveProperty('productId');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('slug');
        expect(product).toHaveProperty('categoryName');
        expect(product).toHaveProperty('inventory');
        expect(product).toHaveProperty('published');
        expect(product).toHaveProperty('isLowStock');
        expect(product).toHaveProperty('price');
      }
    });

    it('should flag low stock products', async () => {
      const response = await fetch('http://localhost:3001/api/admin/analytics/inventory?groupBy=product&lowStockThreshold=5', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const data = await response.json();
      const laptop = data.data.find((p: any) => p.name === 'Laptop');
      const phone = data.data.find((p: any) => p.name === 'Phone');
      
      expect(laptop.isLowStock).toBe(true); // inventory = 5
      expect(phone.isLowStock).toBe(true);  // inventory = 3
    });

    it('should sort products by inventory ASC for low stock visibility', async () => {
      const response = await fetch('http://localhost:3001/api/admin/analytics/inventory?groupBy=product', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const data = await response.json();
      
      if (data.data.length > 1) {
        for (let i = 0; i < data.data.length - 1; i++) {
          expect(data.data[i].inventory).toBeLessThanOrEqual(data.data[i + 1].inventory);
        }
      }
    });
  });

  describe('groupBy=status', () => {
    it('should aggregate inventory by published status', async () => {
      const response = await fetch('http://localhost:3001/api/admin/analytics/inventory?groupBy=status', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('published');
      expect(data.data).toHaveProperty('unpublished');
      
      expect(data.data.published).toHaveProperty('totalUnits');
      expect(data.data.published).toHaveProperty('productCount');
      
      expect(data.data.unpublished).toHaveProperty('totalUnits');
      expect(data.data.unpublished).toHaveProperty('productCount');
    });
  });

  describe('Query parameters', () => {
    it('should support custom lowStockThreshold', async () => {
      const response = await fetch('http://localhost:3001/api/admin/analytics/inventory?groupBy=product&lowStockThreshold=10', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const data = await response.json();
      const lowStockProducts = data.data.filter((p: any) => p.isLowStock);
      expect(lowStockProducts.length).toBeGreaterThan(0);
    });

    it('should return 400 for invalid groupBy value', async () => {
      const response = await fetch('http://localhost:3001/api/admin/analytics/inventory?groupBy=invalid', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });
  });

  describe('Summary', () => {
    it('should include summary with total units and products', async () => {
      const response = await fetch('http://localhost:3001/api/admin/analytics/inventory?groupBy=category', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const data = await response.json();
      expect(data.summary).toHaveProperty('totalUnits');
      expect(data.summary).toHaveProperty('totalProducts');
      expect(typeof data.summary.totalUnits).toBe('number');
      expect(typeof data.summary.totalProducts).toBe('number');
    });
  });
});
