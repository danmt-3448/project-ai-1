import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

/**
 * GET /api/admin/analytics/dashboard
 * 
 * Comprehensive dashboard analytics endpoint aggregating:
 * - Product counts (total, published, unpublished)
 * - Inventory stats (total units, by category, low stock alerts)
 * - Revenue metrics (total, average order value, monthly breakdown, top products)
 * - Order status breakdown
 * 
 * @requires Admin JWT authentication
 * @param startDate ISO 8601 date string (default: 30 days ago)
 * @param endDate ISO 8601 date string (default: now)
 * @returns 200 Dashboard metrics JSON
 * @returns 400 Invalid date format
 * @returns 401 Unauthorized
 * @returns 500 Server error
 */

// Constants
const DEFAULT_DATE_RANGE_DAYS = 30
const LOW_STOCK_THRESHOLD = 5
const TOP_PRODUCTS_LIMIT = 10
const MONTHLY_REVENUE_LIMIT = 12
const CONFIRMED_ORDER_STATUSES = [
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
] as const

interface DashboardResponse {
  products: {
    total: number
    published: number
    unpublished: number
  }
  inventory: {
    totalUnits: number
    byCategory: Array<{
      categoryId: string
      categoryName: string
      categorySlug: string
      totalUnits: number
      productCount: number
    }>
    lowStock: Array<{
      productId: string
      name: string
      slug: string
      inventory: number
      categoryName: string
    }>
  }
  revenue: {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    byMonth: Array<{
      month: string
      revenue: number
      orders: number
    }>
    topProducts: Array<{
      productId: string
      name: string
      slug: string
      revenue: number
      unitsSold: number
      orderCount: number
    }>
  }
  orders: {
    total: number
    confirmed: number
    processing: number
    shipped: number
    delivered: number
    cancelled: number
    failed: number
  }
}

/**
 * Parse and validate date range query parameters
 * @param startDate - ISO 8601 date string or undefined
 * @param endDate - ISO 8601 date string or undefined
 * @returns Prisma date filter object or error
 */
function parseDateRange(
  startDate?: string | string[],
  endDate?: string | string[]
): { dateFilter: any } | { error: string; message: string } {
  try {
    const startDateStr = Array.isArray(startDate) ? startDate[0] : startDate
    const endDateStr = Array.isArray(endDate) ? endDate[0] : endDate

    // Default: last 30 days
    const defaultStart = new Date(
      Date.now() - DEFAULT_DATE_RANGE_DAYS * 24 * 60 * 60 * 1000
    )
    const defaultEnd = new Date()

    const start = startDateStr ? new Date(startDateStr) : defaultStart
    const end = endDateStr ? new Date(endDateStr) : defaultEnd

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        error: 'Invalid date format',
        message: 'startDate and endDate must be valid ISO 8601 dates',
      }
    }

    return {
      dateFilter: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    }
  } catch (error) {
    return {
      error: 'Invalid date format',
      message: 'startDate and endDate must be valid ISO 8601 dates',
    }
  }
}

/**
 * Calculate total inventory units from category data
 */
function calculateTotalInventory(
  categories: Array<{ products: Array<{ inventory: number }> }>
): number {
  return categories.reduce(
    (sum, cat) =>
      sum + cat.products.reduce((catSum, p) => catSum + p.inventory, 0),
    0
  )
}

/**
 * Format inventory by category for response
 */
function formatInventoryByCategory(
  categories: Array<{
    id: string
    name: string
    slug: string
    products: Array<{ inventory: number }>
  }>
) {
  return categories.map((cat) => ({
    categoryId: cat.id,
    categoryName: cat.name,
    categorySlug: cat.slug,
    totalUnits: cat.products.reduce((sum, p) => sum + p.inventory, 0),
    productCount: cat.products.length,
  }))
}

/**
 * Build order status breakdown map from grouped data
 */
function buildOrderStatusMap(
  ordersByStatus: Array<{ status: string; _count: { id: number } }>
): Record<string, number> {
  const statusMap: Record<string, number> = {
    PENDING: 0,
    CONFIRMED: 0,
    PROCESSING: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
    FAILED: 0,
  }

  ordersByStatus.forEach((status) => {
    statusMap[status.status] = status._count.id
  })

  return statusMap
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DashboardResponse | { error: string; message?: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Parse and validate date range
  const { startDate, endDate } = req.query
  const dateResult = parseDateRange(startDate, endDate)

  if ('error' in dateResult) {
    return res.status(400).json(dateResult)
  }

  const { dateFilter } = dateResult

  try {
    // Parallel queries for performance (< 500ms requirement)
    const [
      totalProducts,
      publishedProducts,
      unpublishedProducts,
      inventoryByCategory,
      lowStockProducts,
      confirmedOrders,
      totalOrders,
      monthlyRevenue,
      topProducts,
      ordersByStatus,
    ] = await Promise.all([
      // Product counts
      prisma.product.count(),
      prisma.product.count({ where: { published: true } }),
      prisma.product.count({ where: { published: false } }),

      // Inventory by category
      prisma.category.findMany({
        include: {
          products: {
            select: {
              inventory: true,
            },
          },
        },
      }),

      // Low stock products (inventory <= threshold)
      prisma.product.findMany({
        where: {
          inventory: {
            lte: LOW_STOCK_THRESHOLD,
          },
        },
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          inventory: 'asc',
        },
      }),

      // Revenue metrics - only confirmed orders
      prisma.order.findMany({
        where: {
          status: {
            in: CONFIRMED_ORDER_STATUSES,
          },
          ...dateFilter,
        },
        select: {
          id: true,
          total: true,
          createdAt: true,
        },
      }),

      // Total orders (all statuses)
      prisma.order.findMany({
        where: dateFilter,
        select: {
          id: true,
        },
      }),

      // Monthly revenue breakdown (using raw SQL for DATE_TRUNC)
      prisma.$queryRaw<
        Array<{ month: string; revenue: number; orders: number }>
      >(Prisma.sql`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
          SUM(total)::float as revenue,
          COUNT(*)::int as orders
        FROM orders
        WHERE status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED')
          AND "createdAt" >= ${dateFilter.createdAt?.gte || new Date(0)}
          ${dateFilter.createdAt?.lte ? Prisma.sql`AND "createdAt" <= ${dateFilter.createdAt.lte}` : Prisma.empty}
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month DESC
        LIMIT ${MONTHLY_REVENUE_LIMIT}
      `),

      // Top products by revenue (using aggregation on OrderItems)
      prisma.$queryRaw<
        Array<{
          productId: string
          name: string
          slug: string
          revenue: number
          unitsSold: number
          orderCount: number
        }>
      >(Prisma.sql`
        SELECT 
          oi."productId" as "productId",
          oi.name,
          p.slug,
          SUM(oi.price * oi.quantity)::float as revenue,
          SUM(oi.quantity)::int as "unitsSold",
          COUNT(DISTINCT oi."orderId")::int as "orderCount"
        FROM order_items oi
        INNER JOIN orders o ON o.id = oi."orderId"
        LEFT JOIN products p ON p.id = oi."productId"
        WHERE o.status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED')
          AND o."createdAt" >= ${dateFilter.createdAt?.gte || new Date(0)}
          ${dateFilter.createdAt?.lte ? Prisma.sql`AND o."createdAt" <= ${dateFilter.createdAt.lte}` : Prisma.empty}
        GROUP BY oi."productId", oi.name, p.slug
        ORDER BY revenue DESC
        LIMIT ${TOP_PRODUCTS_LIMIT}
      `),

      // Orders by status
      prisma.order.groupBy({
        by: ['status'],
        where: dateFilter,
        _count: {
          id: true,
        },
      }),
    ])

    // Calculate inventory metrics
    const totalUnits = calculateTotalInventory(inventoryByCategory)
    const inventoryByCategoryFormatted =
      formatInventoryByCategory(inventoryByCategory)

    // Debug: Log lowStock products
    console.log('[Dashboard] lowStockProducts count:', lowStockProducts.length)
    console.log('[Dashboard] lowStockProducts data:', 
      lowStockProducts.map(p => ({ 
        id: p.id, 
        name: p.name, 
        slug: p.slug, 
        inventory: p.inventory,
        published: p.published 
      }))
    )

    // Calculate revenue metrics
    const totalRevenue = confirmedOrders.reduce(
      (sum, order) => sum + order.total,
      0
    )
    const averageOrderValue =
      confirmedOrders.length > 0 ? totalRevenue / confirmedOrders.length : 0

    // Format order status breakdown
    const orderStatusMap = buildOrderStatusMap(ordersByStatus)

    const response: DashboardResponse = {
      products: {
        total: totalProducts,
        published: publishedProducts,
        unpublished: unpublishedProducts,
      },
      inventory: {
        totalUnits,
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
        totalRevenue,
        totalOrders: confirmedOrders.length,
        averageOrderValue,
        byMonth: monthlyRevenue,
        topProducts,
      },
      orders: {
        total: totalOrders.length,
        confirmed: orderStatusMap.CONFIRMED,
        processing: orderStatusMap.PROCESSING,
        shipped: orderStatusMap.SHIPPED,
        delivered: orderStatusMap.DELIVERED,
        cancelled: orderStatusMap.CANCELLED,
        failed: orderStatusMap.FAILED,
      },
    }

    return res.status(200).json(response)
  } catch (error) {
    console.error('Dashboard analytics error:', error)
    return res.status(500).json({
      error: 'Failed to fetch dashboard analytics',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

// Apply admin authentication middleware
export default requireAdmin(handler)
