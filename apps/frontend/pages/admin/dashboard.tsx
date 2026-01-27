import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import useSWR from 'swr';
import { api } from '@/lib/api';
import type { DashboardResponse } from '@/types';

// Fetcher function for SWR
const dashboardFetcher = async () => {
  const token = localStorage.getItem('adminToken');

  if (!token) throw new Error('No auth token');

  try {
    const response = await api.adminGetDashboard(token);
    return response;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch dashboard data');
  }
};

// Format currency (VND)
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

// Format month from "YYYY-MM" string to Vietnamese display
const formatMonth = (monthStr: string) => {
  const [year, month] = monthStr.split('-');
  return `Tháng ${parseInt(month)}/${year}`;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<{ username: string } | null>(null);

  // Fetch dashboard data with SWR
  const { data, error, isLoading, mutate } = useSWR<DashboardResponse>(
    adminUser ? '/admin/analytics/dashboard' : null,
    dashboardFetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 60000, // Refresh every 1 minute
    }
  );

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');

    if (!token) {
      router.push('/admin');
      return;
    }

    if (user) {
      setAdminUser(JSON.parse(user));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin');
  };

  const handleRefresh = () => {
    mutate();
  };

  if (!adminUser) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - Mini Store</title>
      </Head>

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {adminUser.username}!</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
            >
              🔄 Refresh
            </button>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-semibold">⚠️ Failed to load dashboard data</p>
            <p className="text-sm">{error.message}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !data && (
          <div className="space-y-6">
            {/* Skeleton for stats cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200"></div>
              ))}
            </div>
            {/* Skeleton for content */}
            <div className="h-64 animate-pulse rounded-lg bg-gray-200"></div>
          </div>
        )}

        {/* Dashboard Content */}
        {data && (
          <>
            {/* Stats Cards Grid */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
              {/* Total Products */}
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="mt-2 text-3xl font-bold text-primary">{data.products.total}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {data.products.published} published, {data.products.unpublished} unpublished
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <span className="text-2xl">📦</span>
                  </div>
                </div>
              </div>

              {/* Total Inventory */}
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Inventory</p>
                    <p className="mt-2 text-3xl font-bold text-primary">
                      {data.inventory.totalUnits}
                    </p>
                    {data.inventory.lowStock.length > 0 && (
                      <p className="mt-1 text-xs text-red-600">
                        ⚠️ {data.inventory.lowStock.length} low stock items
                      </p>
                    )}
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
              </div>

              {/* Total Orders */}
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="mt-2 text-3xl font-bold text-primary">
                      {data.revenue.totalOrders}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">{data.orders.confirmed} confirmed</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <span className="text-2xl">🛍️</span>
                  </div>
                </div>
              </div>

              {/* Total Revenue */}
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="mt-2 text-2xl font-bold text-primary">
                      {formatCurrency(data.revenue.totalRevenue)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Avg: {formatCurrency(data.revenue.averageOrderValue)}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Low Stock Alert Section */}
            {data.inventory.lowStock.length > 0 && (
              <div className="mb-8 rounded-lg border-2 border-red-200 bg-red-50 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-red-800">⚠️ Low Stock Alert</h2>
                  <span className="rounded-full bg-red-600 px-3 py-1 text-sm text-white">
                    {data.inventory.lowStock.length} items
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-red-200 text-left">
                        <th className="pb-2 text-sm font-semibold text-red-900">Product</th>
                        <th className="pb-2 text-sm font-semibold text-red-900">Category</th>
                        <th className="pb-2 text-right text-sm font-semibold text-red-900">
                          Stock
                        </th>
                        <th className="pb-2 text-right text-sm font-semibold text-red-900">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.inventory.lowStock.map((product) => (
                        <tr key={product.productId} className="border-b border-red-100">
                          <td className="py-3 text-sm text-red-900">{product.name}</td>
                          <td className="py-3 text-sm text-red-700">{product.categoryName}</td>
                          <td className="py-3 text-right text-sm font-bold text-red-600">
                            {product.inventory}
                          </td>
                          <td className="py-3 text-right">
                            <Link
                              href={`/admin/products/${product.slug}/edit`}
                              className="text-sm text-red-600 hover:underline"
                            >
                              Edit →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Inventory by Category */}
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-bold">Inventory by Category</h2>
                <div className="space-y-3">
                  {data.inventory.byCategory.map((cat) => (
                    <div key={cat.categoryId} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{cat.categoryName}</p>
                        <p className="text-sm text-gray-500">{cat.productCount} products</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{cat.totalUnits}</p>
                        <p className="text-xs text-gray-500">units</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Products by Revenue */}
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-bold">Top Products by Revenue</h2>
                <div className="space-y-3">
                  {data.revenue.topProducts.slice(0, 5).map((product, index) => (
                    <div key={product.productId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-sm font-bold">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.unitsSold} sold</p>
                        </div>
                      </div>
                      <p className="font-bold text-primary">{formatCurrency(product.revenue)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Monthly Revenue Table */}
            <div className="mt-8 rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold">Monthly Revenue (Last 6 Months)</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 text-sm font-semibold text-gray-700">Month</th>
                      <th className="pb-3 text-right text-sm font-semibold text-gray-700">
                        Revenue
                      </th>
                      <th className="pb-3 text-right text-sm font-semibold text-gray-700">
                        Orders
                      </th>
                      <th className="pb-3 text-right text-sm font-semibold text-gray-700">
                        Avg Order
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.revenue.byMonth.slice(0, 6).map((month) => (
                      <tr key={month.month} className="border-b">
                        <td className="py-3 text-sm">
                          {formatMonth(month.month)}
                        </td>
                        <td className="py-3 text-right font-semibold text-primary">
                          {formatCurrency(month.revenue)}
                        </td>
                        <td className="py-3 text-right text-sm">{month.orders}</td>
                        <td className="py-3 text-right text-sm text-gray-600">
                          {formatCurrency(month.revenue / month.orders)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Quick Actions */}
        {data && (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <Link
              href="/admin/products"
              className="block rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-2 text-3xl">📦</div>
              <h3 className="mb-2 text-lg font-bold">Manage Products</h3>
              <p className="text-sm text-gray-600">Add, edit, or remove products</p>
            </Link>

            <Link
              href="/admin/categories"
              className="block rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-2 text-3xl">🏷️</div>
              <h3 className="mb-2 text-lg font-bold">Manage Categories</h3>
              <p className="text-sm text-gray-600">Create and organize categories</p>
            </Link>

            <Link
              href="/admin/orders"
              className="block rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-2 text-3xl">📋</div>
              <h3 className="mb-2 text-lg font-bold">View Orders</h3>
              <p className="text-sm text-gray-600">Track and manage orders</p>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
