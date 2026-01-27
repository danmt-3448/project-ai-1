/**
 * Shared TypeScript type definitions for Mini Storefront Frontend
 * 
 * This file contains all shared interfaces and types used across the application
 * to ensure consistency and avoid duplication.
 */

// ============================================================================
// Category Types
// ============================================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
}

// ============================================================================
// Product Types
// ============================================================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  inventory: number;
  published: boolean;
  images: string[];
  categoryId: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Order Types
// ============================================================================

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  buyerName: string;
  buyerEmail: string;
  address: string;
  total: number;
  status: string;
  items: OrderItem[];
  createdAt: string;
}

// ============================================================================
// Admin Analytics Types
// ============================================================================

/**
 * Dashboard analytics response (matches backend /api/admin/analytics/dashboard)
 */
export interface DashboardResponse {
  products: {
    total: number;
    published: number;
    unpublished: number;
  };
  inventory: {
    totalUnits: number;
    byCategory: Array<{
      categoryId: string;
      categoryName: string;
      categorySlug: string;
      totalUnits: number;
      productCount: number;
    }>;
    lowStock: Array<{
      productId: string;
      name: string;
      slug: string;
      inventory: number;
      categoryName: string;
    }>;
  };
  revenue: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    byMonth: Array<{
      month: string; // Format: "YYYY-MM" (e.g., "2026-01")
      revenue: number;
      orders: number;
    }>;
    topProducts: Array<{
      productId: string;
      name: string;
      slug: string;
      revenue: number;
      unitsSold: number;
      orderCount: number;
    }>;
  };
  orders: {
    total: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    failed: number;
  };
}
