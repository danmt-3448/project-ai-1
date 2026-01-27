# Analytics & Inventory Management Implementation Guide

## Overview

This guide provides implementation steps for adding comprehensive analytics and inventory management features to the Mini Storefront admin dashboard.

**Features:**
- ✅ Revenue analytics (per order, per product, monthly trends, by category)
- ✅ Inventory tracking (by category, publish status, low stock alerts)
- ✅ Product count breakdowns (published vs unpublished)
- ✅ Dashboard summary with key metrics

---

## 1. Database Migration

### Step 1: Generate Migration

The Prisma schema has been updated with performance indexes. Generate the migration:

```bash
cd apps/backend
npx prisma migrate dev --name add_analytics_indexes
```

This creates indexes for:
- `products(categoryId, published)` - For inventory by category queries
- `products(inventory)` - For low stock queries
- `orders(createdAt, status)` - For revenue analytics
- `order_items(productId)` - For product revenue aggregation

### Step 2: Apply Migration

```bash
yarn prisma:migrate
```

---

## 2. Backend API Implementation

### File Structure

Create new API route files:

```
apps/backend/pages/api/admin/analytics/
├── dashboard.ts          # GET - Combined dashboard stats
├── revenue.ts            # GET - Revenue analytics with groupBy
└── inventory.ts          # GET - Inventory analytics with groupBy
```

### Implementation Order

#### 2.1 Dashboard Summary Endpoint

**File:** `apps/backend/pages/api/admin/analytics/dashboard.ts`

```typescript
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default requireAdmin(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { startDate, endDate } = req.query;
    
    // Parse date filters (default: last 30 days)
    const end = endDate ? new Date(endDate as string) : new Date();
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Parallel queries for performance
    const [
      totalProducts,
      publishedProducts,
      inventoryByCategory,
      lowStockProducts,
      revenueData,
      orderStatusBreakdown,
    ] = await Promise.all([
      // Total products
      prisma.product.count(),
      
      // Published products
      prisma.product.count({ where: { published: true } }),
      
      // Inventory by category
      prisma.category.findMany({
        include: {
          _count: { select: { products: true } },
          products: {
            select: { inventory: true },
          },
        },
      }),
      
      // Low stock products (inventory <= 5)
      prisma.product.findMany({
        where: { 
          inventory: { lte: 5 },
          published: true,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          inventory: true,
          category: { select: { name: true } },
        },
        orderBy: { inventory: 'asc' },
        take: 10,
      }),
      
      // Revenue data (confirmed orders only)
      prisma.order.aggregate({
        where: {
          status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: start, lte: end },
        },
        _sum: { total: true },
        _count: true,
        _avg: { total: true },
      }),
      
      // Order status breakdown
      prisma.order.groupBy({
        by: ['status'],
        _count: true,
        where: {
          createdAt: { gte: start, lte: end },
        },
      }),
    ]);

    // Calculate inventory totals by category
    const inventoryByCategoryFormatted = inventoryByCategory.map((cat) => ({
      categoryId: cat.id,
      categoryName: cat.name,
      categorySlug: cat.slug,
      totalUnits: cat.products.reduce((sum, p) => sum + p.inventory, 0),
      productCount: cat._count.products,
    }));

    // Get monthly revenue (PostgreSQL specific)
    const monthlyRevenue = await prisma.$queryRaw<Array<{
      month: string;
      revenue: number;
      orders: bigint;
    }>>`
      SELECT 
        TO_CHAR("createdAt", 'YYYY-MM') as month,
        SUM(total)::float as revenue,
        COUNT(*)::bigint as orders
      FROM orders
      WHERE status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED')
        AND "createdAt" >= ${start}
        AND "createdAt" <= ${end}
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `;

    // Get top products by revenue
    const topProducts = await prisma.$queryRaw<Array<{
      productId: string;
      name: string;
      slug: string;
      revenue: number;
      unitsSold: bigint;
      orderCount: bigint;
    }>>`
      SELECT 
        oi."productId",
        oi.name,
        p.slug,
        SUM(oi.price * oi.quantity)::float as revenue,
        SUM(oi.quantity)::bigint as "unitsSold",
        COUNT(DISTINCT oi."orderId")::bigint as "orderCount"
      FROM order_items oi
      INNER JOIN orders o ON oi."orderId" = o.id
      LEFT JOIN products p ON oi."productId" = p.id
      WHERE o.status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED')
        AND o."createdAt" >= ${start}
        AND o."createdAt" <= ${end}
      GROUP BY oi."productId", oi.name, p.slug
      ORDER BY revenue DESC
      LIMIT 10
    `;

    // Format order status breakdown
    const ordersByStatus = {
      total: orderStatusBreakdown.reduce((sum, s) => sum + s._count, 0),
      ...Object.fromEntries(
        orderStatusBreakdown.map((s) => [s.status.toLowerCase(), s._count])
      ),
    };

    return res.status(200).json({
      products: {
        total: totalProducts,
        published: publishedProducts,
        unpublished: totalProducts - publishedProducts,
      },
      inventory: {
        totalUnits: inventoryByCategoryFormatted.reduce((sum, c) => sum + c.totalUnits, 0),
        byCategory: inventoryByCategoryFormatted,
        lowStock: lowStockProducts.map((p) => ({
          productId: p.id,
          name: p.name,
          slug: p.slug,
          inventory: p.inventory,
          categoryName: p.category.name,
        })),
      },
      revenue: {
        totalRevenue: revenueData._sum.total || 0,
        totalOrders: revenueData._count || 0,
        averageOrderValue: revenueData._avg.total || 0,
        byMonth: monthlyRevenue.map((m) => ({
          month: m.month,
          revenue: m.revenue,
          orders: Number(m.orders),
        })),
        topProducts: topProducts.map((p) => ({
          productId: p.productId,
          name: p.name,
          slug: p.slug,
          revenue: p.revenue,
          unitsSold: Number(p.unitsSold),
          orderCount: Number(p.orderCount),
        })),
      },
      orders: ordersByStatus,
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});
```

#### 2.2 Revenue Analytics Endpoint

**File:** `apps/backend/pages/api/admin/analytics/revenue.ts`

```typescript
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default requireAdmin(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      groupBy = 'order',
      startDate,
      endDate,
      limit = '50',
      offset = '0',
      sortBy = 'revenue',
      sortOrder = 'desc',
    } = req.query;

    // Validate groupBy
    if (!['order', 'product', 'month', 'category'].includes(groupBy as string)) {
      return res.status(400).json({ error: 'Invalid groupBy. Must be: order, product, month, or category' });
    }

    // Parse filters
    const end = endDate ? new Date(endDate as string) : new Date();
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const limitNum = Math.min(parseInt(limit as string), 500);
    const offsetNum = parseInt(offset as string);

    // Common filter for confirmed orders
    const orderFilter = {
      status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
      createdAt: { gte: start, lte: end },
    };

    if (groupBy === 'order') {
      // Revenue by individual order
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where: orderFilter,
          select: {
            id: true,
            buyerName: true,
            buyerEmail: true,
            total: true,
            status: true,
            createdAt: true,
            items: { select: { quantity: true } },
          },
          orderBy: { [sortBy === 'revenue' ? 'total' : 'createdAt']: sortOrder },
          take: limitNum,
          skip: offsetNum,
        }),
        prisma.order.count({ where: orderFilter }),
      ]);

      const summary = await prisma.order.aggregate({
        where: orderFilter,
        _sum: { total: true },
        _avg: { total: true },
      });

      return res.status(200).json({
        data: orders.map((o) => ({
          orderId: o.id,
          buyerName: o.buyerName,
          buyerEmail: o.buyerEmail,
          revenue: o.total,
          itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
          status: o.status,
          createdAt: o.createdAt,
        })),
        total,
        page: Math.floor(offsetNum / limitNum) + 1,
        limit: limitNum,
        summary: {
          totalRevenue: summary._sum.total || 0,
          averageRevenue: summary._avg.total || 0,
        },
      });
    }

    if (groupBy === 'product') {
      // Revenue by product
      const productRevenue = await prisma.$queryRaw<Array<{
        productId: string;
        productName: string;
        productSlug: string | null;
        categoryName: string | null;
        revenue: number;
        unitsSold: bigint;
        orderCount: bigint;
        averagePrice: number;
      }>>`
        SELECT 
          oi."productId",
          oi.name as "productName",
          p.slug as "productSlug",
          c.name as "categoryName",
          SUM(oi.price * oi.quantity)::float as revenue,
          SUM(oi.quantity)::bigint as "unitsSold",
          COUNT(DISTINCT oi."orderId")::bigint as "orderCount",
          AVG(oi.price)::float as "averagePrice"
        FROM order_items oi
        INNER JOIN orders o ON oi."orderId" = o.id
        LEFT JOIN products p ON oi."productId" = p.id
        LEFT JOIN categories c ON p."categoryId" = c.id
        WHERE o.status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED')
          AND o."createdAt" >= ${start}
          AND o."createdAt" <= ${end}
        GROUP BY oi."productId", oi.name, p.slug, c.name
        ORDER BY ${sortBy === 'revenue' ? 'revenue' : sortBy === 'units' ? '"unitsSold"' : '"orderCount"'} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}
        LIMIT ${limitNum}
        OFFSET ${offsetNum}
      `;

      const totalProducts = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(DISTINCT oi."productId")::bigint as count
        FROM order_items oi
        INNER JOIN orders o ON oi."orderId" = o.id
        WHERE o.status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED')
          AND o."createdAt" >= ${start}
          AND o."createdAt" <= ${end}
      `;

      const summary = await prisma.$queryRaw<Array<{
        totalRevenue: number;
        totalUnitsSold: bigint;
      }>>`
        SELECT 
          SUM(oi.price * oi.quantity)::float as "totalRevenue",
          SUM(oi.quantity)::bigint as "totalUnitsSold"
        FROM order_items oi
        INNER JOIN orders o ON oi."orderId" = o.id
        WHERE o.status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED')
          AND o."createdAt" >= ${start}
          AND o."createdAt" <= ${end}
      `;

      return res.status(200).json({
        data: productRevenue.map((p) => ({
          ...p,
          unitsSold: Number(p.unitsSold),
          orderCount: Number(p.orderCount),
        })),
        total: Number(totalProducts[0]?.count || 0),
        page: Math.floor(offsetNum / limitNum) + 1,
        limit: limitNum,
        summary: {
          totalRevenue: summary[0]?.totalRevenue || 0,
          totalUnitsSold: Number(summary[0]?.totalUnitsSold || 0),
        },
      });
    }

    if (groupBy === 'month') {
      // Revenue by month
      const monthlyRevenue = await prisma.$queryRaw<Array<{
        month: string;
        year: number;
        revenue: number;
        orderCount: bigint;
      }>>`
        SELECT 
          TO_CHAR("createdAt", 'YYYY-MM') as month,
          EXTRACT(YEAR FROM "createdAt")::int as year,
          SUM(total)::float as revenue,
          COUNT(*)::bigint as "orderCount"
        FROM orders
        WHERE status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED')
          AND "createdAt" >= ${start}
          AND "createdAt" <= ${end}
        GROUP BY TO_CHAR("createdAt", 'YYYY-MM'), EXTRACT(YEAR FROM "createdAt")
        ORDER BY month DESC
      `;

      const summary = await prisma.order.aggregate({
        where: orderFilter,
        _sum: { total: true },
        _count: true,
      });

      return res.status(200).json({
        data: monthlyRevenue.map((m) => ({
          month: m.month,
          year: m.year,
          monthName: new Date(m.month + '-01').toLocaleString('en-US', { month: 'long' }),
          revenue: m.revenue,
          orderCount: Number(m.orderCount),
          averageOrderValue: m.revenue / Number(m.orderCount),
        })),
        total: monthlyRevenue.length,
        summary: {
          totalRevenue: summary._sum.total || 0,
          totalOrders: summary._count || 0,
        },
      });
    }

    if (groupBy === 'category') {
      // Revenue by category
      const categoryRevenue = await prisma.$queryRaw<Array<{
        categoryId: string;
        categoryName: string;
        categorySlug: string;
        revenue: number;
        unitsSold: bigint;
        orderCount: bigint;
        productCount: bigint;
      }>>`
        SELECT 
          c.id as "categoryId",
          c.name as "categoryName",
          c.slug as "categorySlug",
          SUM(oi.price * oi.quantity)::float as revenue,
          SUM(oi.quantity)::bigint as "unitsSold",
          COUNT(DISTINCT oi."orderId")::bigint as "orderCount",
          COUNT(DISTINCT oi."productId")::bigint as "productCount"
        FROM order_items oi
        INNER JOIN orders o ON oi."orderId" = o.id
        INNER JOIN products p ON oi."productId" = p.id
        INNER JOIN categories c ON p."categoryId" = c.id
        WHERE o.status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED')
          AND o."createdAt" >= ${start}
          AND o."createdAt" <= ${end}
        GROUP BY c.id, c.name, c.slug
        ORDER BY revenue DESC
      `;

      const summary = await prisma.$queryRaw<Array<{
        totalRevenue: number;
        totalUnitsSold: bigint;
      }>>`
        SELECT 
          SUM(oi.price * oi.quantity)::float as "totalRevenue",
          SUM(oi.quantity)::bigint as "totalUnitsSold"
        FROM order_items oi
        INNER JOIN orders o ON oi."orderId" = o.id
        WHERE o.status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED')
          AND o."createdAt" >= ${start}
          AND o."createdAt" <= ${end}
      `;

      return res.status(200).json({
        data: categoryRevenue.map((c) => ({
          ...c,
          unitsSold: Number(c.unitsSold),
          orderCount: Number(c.orderCount),
          productCount: Number(c.productCount),
        })),
        total: categoryRevenue.length,
        summary: {
          totalRevenue: summary[0]?.totalRevenue || 0,
          totalUnitsSold: Number(summary[0]?.totalUnitsSold || 0),
        },
      });
    }

    return res.status(400).json({ error: 'Invalid groupBy parameter' });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    return res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
});
```

#### 2.3 Inventory Analytics Endpoint

**File:** `apps/backend/pages/api/admin/analytics/inventory.ts`

```typescript
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default requireAdmin(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      groupBy = 'category',
      lowStockThreshold = '5',
      includeUnpublished = 'false',
    } = req.query;

    const threshold = parseInt(lowStockThreshold as string);
    const includeUnpub = includeUnpublished === 'true';

    if (groupBy === 'category') {
      const categories = await prisma.category.findMany({
        include: {
          products: {
            where: includeUnpub ? {} : { published: true },
            select: {
              inventory: true,
              published: true,
            },
          },
        },
      });

      const data = categories.map((cat) => {
        const publishedProducts = cat.products.filter((p) => p.published);
        const unpublishedProducts = cat.products.filter((p) => !p.published);
        const totalUnits = cat.products.reduce((sum, p) => sum + p.inventory, 0);
        const lowStockProducts = cat.products.filter((p) => p.inventory <= threshold);

        return {
          categoryId: cat.id,
          categoryName: cat.name,
          categorySlug: cat.slug,
          totalUnits,
          productCount: cat.products.length,
          publishedProducts: publishedProducts.length,
          unpublishedProducts: unpublishedProducts.length,
          averageInventoryPerProduct: cat.products.length > 0 ? totalUnits / cat.products.length : 0,
          lowStockProducts: lowStockProducts.length,
        };
      });

      const summary = {
        totalUnits: data.reduce((sum, c) => sum + c.totalUnits, 0),
        totalProducts: data.reduce((sum, c) => sum + c.productCount, 0),
        lowStockProducts: data.reduce((sum, c) => sum + c.lowStockProducts, 0),
      };

      return res.status(200).json({ data, summary });
    }

    if (groupBy === 'product') {
      const products = await prisma.product.findMany({
        where: includeUnpub ? {} : { published: true },
        select: {
          id: true,
          name: true,
          slug: true,
          inventory: true,
          published: true,
          price: true,
          category: { select: { name: true } },
        },
        orderBy: { inventory: 'asc' },
      });

      const data = products.map((p) => ({
        productId: p.id,
        productName: p.name,
        productSlug: p.slug,
        categoryName: p.category.name,
        inventory: p.inventory,
        published: p.published,
        isLowStock: p.inventory <= threshold,
        price: p.price,
      }));

      const summary = {
        totalUnits: data.reduce((sum, p) => sum + p.inventory, 0),
        totalProducts: data.length,
      };

      return res.status(200).json({ data, summary });
    }

    if (groupBy === 'status') {
      const [publishedStats, unpublishedStats] = await Promise.all([
        prisma.product.aggregate({
          where: { published: true },
          _count: true,
          _sum: { inventory: true },
          _avg: { inventory: true },
        }),
        prisma.product.aggregate({
          where: { published: false },
          _count: true,
          _sum: { inventory: true },
          _avg: { inventory: true },
        }),
      ]);

      const data = {
        published: {
          productCount: publishedStats._count,
          totalUnits: publishedStats._sum.inventory || 0,
          averageInventory: publishedStats._avg.inventory || 0,
        },
        unpublished: {
          productCount: unpublishedStats._count,
          totalUnits: unpublishedStats._sum.inventory || 0,
          averageInventory: unpublishedStats._avg.inventory || 0,
        },
      };

      const summary = {
        totalUnits: data.published.totalUnits + data.unpublished.totalUnits,
        totalProducts: data.published.productCount + data.unpublished.productCount,
      };

      return res.status(200).json({ data, summary });
    }

    return res.status(400).json({ error: 'Invalid groupBy. Must be: category, product, or status' });
  } catch (error) {
    console.error('Inventory analytics error:', error);
    return res.status(500).json({ error: 'Failed to fetch inventory data' });
  }
});
```

---

## 3. Frontend Dashboard Update

### 3.1 Update Admin Dashboard Page

**File:** `apps/frontend/pages/admin/dashboard.tsx`

Add new sections to display analytics data:

```typescript
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';

interface DashboardData {
  products: {
    total: number;
    published: number;
    unpublished: number;
  };
  inventory: {
    totalUnits: number;
    byCategory: Array<{
      categoryName: string;
      totalUnits: number;
      productCount: number;
    }>;
    lowStock: Array<{
      productId: string;
      name: string;
      inventory: number;
      categoryName: string;
    }>;
  };
  revenue: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    byMonth: Array<{
      month: string;
      revenue: number;
      orders: number;
    }>;
    topProducts: Array<{
      productId: string;
      name: string;
      revenue: number;
      unitsSold: number;
    }>;
  };
  orders: {
    total: number;
    confirmed?: number;
    processing?: number;
    shipped?: number;
    delivered?: number;
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await api.get('/admin/analytics/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-red-600">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button
            onClick={() => {
              localStorage.removeItem('adminToken');
              window.location.href = '/admin';
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Products */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Products</p>
                <p className="text-3xl font-bold">{data?.products.total || 0}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Published: {data?.products.published || 0} | Unpublished: {data?.products.unpublished || 0}
                </p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>

          {/* Total Inventory */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Inventory</p>
                <p className="text-3xl font-bold">{data?.inventory.totalUnits || 0}</p>
                <p className="text-sm text-red-600 mt-1">
                  Low Stock: {data?.inventory.lowStock.length || 0} items
                </p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Orders</p>
                <p className="text-3xl font-bold">{data?.orders.total || 0}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Confirmed: {data?.orders.confirmed || 0}
                </p>
              </div>
              <div className="text-4xl">🛍️</div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Revenue (30 days)</p>
                <p className="text-3xl font-bold">
                  {(data?.revenue.totalRevenue || 0).toLocaleString('vi-VN')}₫
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Avg: {Math.round(data?.revenue.averageOrderValue || 0).toLocaleString('vi-VN')}₫
                </p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>
        </div>

        {/* Inventory by Category */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold mb-4">Inventory by Category</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Units</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.inventory.byCategory.map((cat) => (
                  <tr key={cat.categoryName}>
                    <td className="px-6 py-4 whitespace-nowrap">{cat.categoryName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{cat.totalUnits}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{cat.productCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert */}
        {data && data.inventory.lowStock.length > 0 && (
          <div className="bg-red-50 border border-red-200 p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-bold text-red-800 mb-4">⚠️ Low Stock Alert</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-red-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-900 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-900 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-900 uppercase">Stock</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-red-200">
                  {data.inventory.lowStock.map((product) => (
                    <tr key={product.productId}>
                      <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{product.categoryName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-red-600 font-bold">{product.inventory}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Products by Revenue */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold mb-4">Top Products by Revenue</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units Sold</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.revenue.topProducts.map((product) => (
                  <tr key={product.productId}>
                    <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.revenue.toLocaleString('vi-VN')}₫</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.unitsSold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Monthly Revenue</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.revenue.byMonth.map((month) => (
                  <tr key={month.month}>
                    <td className="px-6 py-4 whitespace-nowrap">{month.month}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{month.revenue.toLocaleString('vi-VN')}₫</td>
                    <td className="px-6 py-4 whitespace-nowrap">{month.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <a
              href="/admin/products/create"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              + Add New Product
            </a>
            <a
              href="/admin/products"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Manage Products
            </a>
            <a
              href="/admin/orders"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              View Orders
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
```

---

## 4. Testing

### 4.1 API Testing

Test the new endpoints with curl or Postman:

```bash
# Get dashboard data
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/admin/analytics/dashboard

# Get revenue by product
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/api/admin/analytics/revenue?groupBy=product&limit=10"

# Get inventory by category
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/api/admin/analytics/inventory?groupBy=category"
```

### 4.2 Unit Tests

Create test files in `apps/backend/tests/api/`:

```typescript
// apps/backend/tests/api/analytics.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
// Add test implementations
```

---

## 5. Deployment

### 5.1 Migration Deployment

When deploying to production:

```bash
# Production migration
DATABASE_URL="your-production-db-url" npx prisma migrate deploy
```

### 5.2 Environment Variables

No new environment variables required for this feature.

---

## 6. Summary of Changes

### Modified Files:
- ✅ `context/specs.md` - Added comprehensive analytics specifications
- ✅ `apps/backend/prisma/schema.postgres.prisma` - Added performance indexes

### New Files to Create:
- 📝 `apps/backend/pages/api/admin/analytics/dashboard.ts`
- 📝 `apps/backend/pages/api/admin/analytics/revenue.ts`
- 📝 `apps/backend/pages/api/admin/analytics/inventory.ts`
- 📝 Updated `apps/frontend/pages/admin/dashboard.tsx`

### Database Changes:
- New indexes on `products`, `orders`, `order_items` for query optimization

---

## Next Steps

1. Run database migration: `yarn prisma:migrate`
2. Create the 3 new API endpoint files (dashboard, revenue, inventory)
3. Update the frontend dashboard page
4. Test all endpoints with sample data
5. Add unit tests for analytics functions
6. Consider adding data visualization libraries (recharts, chart.js) for graphs
