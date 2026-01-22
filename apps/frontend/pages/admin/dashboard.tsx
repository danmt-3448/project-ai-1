import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<{ username: string } | null>(null);

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

      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {adminUser.username}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="mt-2 text-3xl font-bold text-primary">--</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary bg-opacity-10">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="mt-2 text-3xl font-bold text-primary">--</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary bg-opacity-10">
                <span className="text-2xl">🛍️</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="mt-2 text-3xl font-bold text-primary">--</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary bg-opacity-10">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Link href="/admin/products">
            <div className="group cursor-pointer rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex items-center">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <span className="text-2xl">📦</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold transition-colors group-hover:text-primary">
                    Manage Products
                  </h3>
                  <p className="text-sm text-gray-600">Add, edit, or remove products</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/categories">
            <div className="group cursor-pointer rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex items-center">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <span className="text-2xl">🏷️</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold transition-colors group-hover:text-primary">
                    Manage Categories
                  </h3>
                  <p className="text-sm text-gray-600">Create and organize categories</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/orders">
            <div className="group cursor-pointer rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex items-center">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <span className="text-2xl">🛍️</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold transition-colors group-hover:text-primary">
                    Manage Orders
                  </h3>
                  <p className="text-sm text-gray-600">View and update order status</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 px-6 py-4 text-blue-800">
          <h3 className="mb-2 font-semibold">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/products/create"
              className="rounded-lg bg-white px-4 py-2 text-sm transition-colors hover:bg-blue-100"
            >
              + Add New Product
            </Link>
            <Link
              href="/"
              className="rounded-lg bg-white px-4 py-2 text-sm transition-colors hover:bg-blue-100"
            >
              View Store
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
