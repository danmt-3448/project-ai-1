import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function AdminDashboard() {
  const router = useRouter()
  const [adminUser, setAdminUser] = useState<{ username: string } | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    const user = localStorage.getItem('adminUser')

    if (!token) {
      router.push('/admin')
      return
    }

    if (user) {
      setAdminUser(JSON.parse(user))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    router.push('/admin')
  }

  if (!adminUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - Mini Store</title>
      </Head>

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {adminUser.username}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Products</p>
                <p className="text-3xl font-bold text-primary mt-2">--</p>
              </div>
              <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-primary mt-2">--</p>
              </div>
              <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                <span className="text-2xl">🛍️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Revenue</p>
                <p className="text-3xl font-bold text-primary mt-2">--</p>
              </div>
              <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/products">
            <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">📦</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                    Manage Products
                  </h3>
                  <p className="text-gray-600 text-sm">Add, edit, or remove products</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/orders">
            <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">🛍️</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                    Manage Orders
                  </h3>
                  <p className="text-gray-600 text-sm">View and update order status</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-8 bg-blue-50 border border-blue-200 text-blue-800 px-6 py-4 rounded-lg">
          <h3 className="font-semibold mb-2">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/products/create"
              className="text-sm bg-white px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
            >
              + Add New Product
            </Link>
            <Link
              href="/"
              className="text-sm bg-white px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
            >
              View Store
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
