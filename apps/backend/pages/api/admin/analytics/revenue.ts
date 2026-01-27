import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * GET /api/admin/analytics/revenue
 * 
 * Revenue analytics endpoint with 4 groupBy modes:
 * - order: Individual orders with pagination
 * - product: Revenue per product with units sold
 * - month: Monthly revenue aggregation
 * - category: Revenue per category
 * 
 * @requires Admin JWT authentication
 * @param groupBy (required) 'order' | 'product' | 'month' | 'category'
 * @param startDate ISO 8601 date string
 * @param endDate ISO 8601 date string
 * @param limit Number (for pagination)
 * @param offset Number (for pagination)
 * @param sortBy Field name to sort by
 * @param sortOrder 'asc' | 'desc'
 * @returns 200 Revenue analytics JSON
 * @returns 400 Invalid parameters
 * @returns 401 Unauthorized
 * @returns 500 Server error
 */

// Zod schema for query parameter validation
const querySchema = z.object({
  groupBy: z.enum(['order', 'product', 'month', 'category']),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().int().positive().max(1000).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

const CONFIRMED_ORDER_STATUSES = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate query parameters
    const validationResult = querySchema.safeParse(req.query);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: validationResult.error.flatten(),
      });
    }

    const { groupBy, startDate, endDate, limit, offset, sortBy, sortOrder } = validationResult.data;

    // Build date filter
    const dateFilter: Prisma.OrderWhereInput['createdAt'] = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Base filter: only confirmed orders
    const baseOrderFilter: Prisma.OrderWhereInput = {
      status: { in: [...CONFIRMED_ORDER_STATUSES] },
      ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
    };

    // Route to appropriate groupBy handler
    switch (groupBy) {
      case 'order':
        return await handleOrderGroupBy(res, baseOrderFilter, limit, offset, sortBy, sortOrder);
      case 'product':
        return await handleProductGroupBy(res, baseOrderFilter, sortBy, sortOrder);
      case 'month':
        return await handleMonthGroupBy(res, baseOrderFilter);
      case 'category':
        return await handleCategoryGroupBy(res, baseOrderFilter);
      default:
        return res.status(400).json({ error: 'Invalid groupBy value' });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Revenue analytics error:', error);
    return res.status(500).json({
      error: 'Failed to fetch revenue analytics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * groupBy=order: Individual orders with pagination
 */
async function handleOrderGroupBy(
  res: NextApiResponse,
  orderFilter: Prisma.OrderWhereInput,
  limit: number,
  offset: number,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
) {
  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where: orderFilter,
      include: {
        items: true,
      },
      take: limit,
      skip: offset,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
    }),
    prisma.order.count({ where: orderFilter }),
  ]);

  const data = orders.map((order) => ({
    id: order.id,
    buyerName: order.buyerName,
    revenue: order.total,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    status: order.status,
    createdAt: order.createdAt.toISOString(),
  }));

  const summary = {
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    totalOrders: totalCount,
  };

  return res.status(200).json({
    data,
    total: totalCount,
    page: Math.floor(offset / limit) + 1,
    limit,
    summary,
  });
}

/**
 * groupBy=product: Revenue per product
 */
async function handleProductGroupBy(
  res: NextApiResponse,
  orderFilter: Prisma.OrderWhereInput,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
) {
  // Get all confirmed orders with items
  const orders = await prisma.order.findMany({
    where: orderFilter,
    include: {
      items: true,
    },
  });

  // Get all unique product IDs
  const productIds = [...new Set(orders.flatMap(o => o.items.map(i => i.productId)))];
  
  // Fetch products with categories
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { category: true },
  });
  
  const productLookup = new Map(products.map(p => [p.id, p]));

  // Aggregate by product
  const productMap = new Map<string, {
    productId: string;
    name: string;
    slug: string;
    categoryName: string;
    revenue: number;
    unitsSold: number;
    orderCount: number;
  }>();

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const product = productLookup.get(item.productId);
      if (!product) return;
      
      const existing = productMap.get(item.productId);
      const itemRevenue = item.price * item.quantity;

      if (existing) {
        existing.revenue += itemRevenue;
        existing.unitsSold += item.quantity;
        existing.orderCount += 1;
      } else {
        productMap.set(item.productId, {
          productId: item.productId,
          name: item.name,
          slug: product.slug,
          categoryName: product.category.name,
          revenue: itemRevenue,
          unitsSold: item.quantity,
          orderCount: 1,
        });
      }
    });
  });

  let data = Array.from(productMap.values());

  // Apply sorting
  if (sortBy === 'revenue') {
    data.sort((a, b) => sortOrder === 'desc' ? b.revenue - a.revenue : a.revenue - b.revenue);
  } else if (sortBy === 'unitsSold') {
    data.sort((a, b) => sortOrder === 'desc' ? b.unitsSold - a.unitsSold : a.unitsSold - b.unitsSold);
  }

  const summary = {
    totalRevenue: data.reduce((sum, p) => sum + p.revenue, 0),
    totalOrders: orders.length,
  };

  return res.status(200).json({ data, summary });
}

/**
 * groupBy=month: Monthly revenue aggregation
 */
async function handleMonthGroupBy(
  res: NextApiResponse,
  orderFilter: Prisma.OrderWhereInput
) {
  const orders = await prisma.order.findMany({
    where: orderFilter,
    select: {
      total: true,
      createdAt: true,
    },
  });

  // Group by month
  const monthMap = new Map<string, {
    month: number;
    year: number;
    revenue: number;
    orderCount: number;
  }>();

  orders.forEach((order) => {
    const date = new Date(order.createdAt);
    const month = date.getMonth() + 1; // 1-12
    const year = date.getFullYear();
    const key = `${year}-${month}`;

    const existing = monthMap.get(key);
    if (existing) {
      existing.revenue += order.total;
      existing.orderCount += 1;
    } else {
      monthMap.set(key, {
        month,
        year,
        revenue: order.total,
        orderCount: 1,
      });
    }
  });

  // Convert to array and sort DESC by year/month
  let data = Array.from(monthMap.values()).map((item) => ({
    ...item,
    averageOrderValue: item.orderCount > 0 ? item.revenue / item.orderCount : 0,
  }));

  data.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  const summary = {
    totalRevenue: data.reduce((sum, m) => sum + m.revenue, 0),
    totalOrders: data.reduce((sum, m) => sum + m.orderCount, 0),
  };

  return res.status(200).json({ data, summary });
}

/**
 * groupBy=category: Revenue per category
 */
async function handleCategoryGroupBy(
  res: NextApiResponse,
  orderFilter: Prisma.OrderWhereInput
) {
  const orders = await prisma.order.findMany({
    where: orderFilter,
    include: {
      items: true,
    },
  });

  // Get all unique product IDs
  const productIds = [...new Set(orders.flatMap(o => o.items.map(i => i.productId)))];
  
  // Fetch products with categories
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { category: true },
  });
  
  const productLookup = new Map(products.map(p => [p.id, p]));

  // Aggregate by category
  const categoryMap = new Map<string, {
    categoryId: string;
    name: string;
    slug: string;
    revenue: number;
    unitsSold: number;
    orderCount: number;
    productIds: Set<string>;
  }>();

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const product = productLookup.get(item.productId);
      if (!product) return;
      
      const categoryId = product.categoryId;
      const existing = categoryMap.get(categoryId);
      const itemRevenue = item.price * item.quantity;

      if (existing) {
        existing.revenue += itemRevenue;
        existing.unitsSold += item.quantity;
        existing.orderCount += 1;
        existing.productIds.add(item.productId);
      } else {
        categoryMap.set(categoryId, {
          categoryId,
          name: product.category.name,
          slug: product.category.slug,
          revenue: itemRevenue,
          unitsSold: item.quantity,
          orderCount: 1,
          productIds: new Set([item.productId]),
        });
      }
    });
  });

  const data = Array.from(categoryMap.values()).map(({ productIds, ...rest }) => ({
    ...rest,
    productCount: productIds.size,
  }));

  const summary = {
    totalRevenue: data.reduce((sum, c) => sum + c.revenue, 0),
    totalOrders: orders.length,
  };

  return res.status(200).json({ data, summary });
}

export default requireAdmin(handler);
