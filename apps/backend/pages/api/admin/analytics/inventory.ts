import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * GET /api/admin/analytics/inventory
 * 
 * Inventory analytics endpoint with 3 groupBy modes:
 * - category: Total units per category with product counts
 * - product: Product-level inventory with low stock flags
 * - status: Aggregate by published/unpublished status
 * 
 * @requires Admin JWT authentication
 * @param groupBy 'category' | 'product' | 'status' (default: category)
 * @param lowStockThreshold Number (default: 5)
 * @param includeUnpublished Boolean (default: false)
 * @returns 200 Inventory analytics JSON
 * @returns 400 Invalid parameters
 * @returns 401 Unauthorized
 * @returns 500 Server error
 */

// Zod schema for query parameter validation
const querySchema = z.object({
  groupBy: z.enum(['category', 'product', 'status']).optional().default('category'),
  lowStockThreshold: z.coerce.number().int().positive().optional().default(5),
  includeUnpublished: z
    .enum(['true', 'false'])
    .optional()
    .default('false')
    .transform((val) => val === 'true'),
});

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

    const { groupBy, lowStockThreshold, includeUnpublished } = validationResult.data;

    // Route to appropriate groupBy handler
    switch (groupBy) {
      case 'category':
        return await handleCategoryGroupBy(res, lowStockThreshold, includeUnpublished);
      case 'product':
        return await handleProductGroupBy(res, lowStockThreshold, includeUnpublished);
      case 'status':
        return await handleStatusGroupBy(res);
      default:
        return res.status(400).json({ error: 'Invalid groupBy value' });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Inventory analytics error:', error);
    return res.status(500).json({
      error: 'Failed to fetch inventory analytics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * groupBy=category: Total units per category
 */
async function handleCategoryGroupBy(
  res: NextApiResponse,
  lowStockThreshold: number,
  includeUnpublished: boolean
) {
  const publishedFilter: Prisma.ProductWhereInput = includeUnpublished ? {} : { published: true };

  const categories = await prisma.category.findMany({
    include: {
      products: {
        where: publishedFilter,
      },
    },
  });

  const data = categories
    .map((category) => {
      const totalUnits = category.products.reduce((sum, p) => sum + p.inventory, 0);
      const productCount = category.products.length;
      const publishedProducts = category.products.filter((p) => p.published).length;
      const unpublishedProducts = category.products.filter((p) => !p.published).length;
      const lowStockProducts = category.products.filter((p) => p.inventory <= lowStockThreshold).length;
      const averageInventory = productCount > 0 ? totalUnits / productCount : 0;

      return {
        categoryId: category.id,
        name: category.name,
        slug: category.slug,
        totalUnits,
        productCount,
        publishedProducts,
        unpublishedProducts,
        averageInventory: Math.round(averageInventory * 100) / 100,
        lowStockProducts,
      };
    })
    .filter((c) => c.productCount > 0); // Only categories with products

  const summary = {
    totalUnits: data.reduce((sum, c) => sum + c.totalUnits, 0),
    totalProducts: data.reduce((sum, c) => sum + c.productCount, 0),
  };

  return res.status(200).json({ data, summary });
}

/**
 * groupBy=product: Product-level inventory
 */
async function handleProductGroupBy(
  res: NextApiResponse,
  lowStockThreshold: number,
  includeUnpublished: boolean
) {
  const publishedFilter: Prisma.ProductWhereInput = includeUnpublished ? {} : { published: true };

  const products = await prisma.product.findMany({
    where: publishedFilter,
    include: {
      category: true,
    },
    orderBy: {
      inventory: 'asc', // Sort by inventory ASC for low stock visibility
    },
  });

  const data = products.map((product) => ({
    productId: product.id,
    name: product.name,
    slug: product.slug,
    categoryName: product.category.name,
    inventory: product.inventory,
    published: product.published,
    isLowStock: product.inventory <= lowStockThreshold,
    price: product.price,
  }));

  const summary = {
    totalUnits: data.reduce((sum, p) => sum + p.inventory, 0),
    totalProducts: data.length,
  };

  return res.status(200).json({ data, summary });
}

/**
 * groupBy=status: Aggregate by published status
 */
async function handleStatusGroupBy(res: NextApiResponse) {
  const [publishedProducts, unpublishedProducts] = await Promise.all([
    prisma.product.findMany({
      where: { published: true },
      select: { inventory: true },
    }),
    prisma.product.findMany({
      where: { published: false },
      select: { inventory: true },
    }),
  ]);

  const publishedStats = {
    totalUnits: publishedProducts.reduce((sum, p) => sum + p.inventory, 0),
    productCount: publishedProducts.length,
  };

  const unpublishedStats = {
    totalUnits: unpublishedProducts.reduce((sum, p) => sum + p.inventory, 0),
    productCount: unpublishedProducts.length,
  };

  const data = {
    published: publishedStats,
    unpublished: unpublishedStats,
  };

  const summary = {
    totalUnits: publishedStats.totalUnits + unpublishedStats.totalUnits,
    totalProducts: publishedStats.productCount + unpublishedStats.productCount,
  };

  return res.status(200).json({ data, summary });
}

export default requireAdmin(handler);
