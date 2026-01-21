import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import Head from 'next/head'
import Link from 'next/link'

interface Order {
  id: string
  buyerName: string
  buyerEmail: string
  address: string
  total: number
  status: string
  createdAt: string
  items: Array<{
    id: string
    productId: string
    name: string
    price: number
    quantity: number
    product: {
      slug: string
      images: string[]
    } | null
  }>
}

export default function AdminOrderDetail() {
  const router = useRouter()
  const { id } = router.query
  const [token, setToken] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken')
    if (!adminToken) {
      router.push('/admin')
      return
    }
    setToken(adminToken)
  }, [router])

  const fetcher = async (url: string) => {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
  }

  const { data: order, error, mutate } = useSWR<Order>(
    token && id ? `${process.env.NEXT_PUBLIC_API_URL}/orders/${id}` : null,
    fetcher
  )

  const handleUpdateStatus = async (newStatus: string) => {
    if (!confirm(`Change order status to "${newStatus}"?`)) return

    try {
      setUpdating(true)
      // Note: Backend API would need PUT /admin/orders/:id endpoint
      // For now, we'll show this is where it would be implemented
      alert(`Status update to "${newStatus}" - API endpoint needed`)
      
      // When API is ready:
      // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders/${id}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify({ status: newStatus }),
      // })
      // if (!res.ok) throw new Error('Failed to update')
      // mutate()
    } catch (error) {
      alert('Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  if (!token) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Order Not Found - Admin</title>
        </Head>
        <div className="text-center py-12 text-red-500">
          <p className="mb-4">Failed to load order</p>
          <Link href="/admin/orders" className="text-primary hover:underline">
            ← Back to Orders
          </Link>
        </div>
      </>
    )
  }

  if (!order) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <>
      <Head>
        <title>Order #{order.id} - Admin</title>
      </Head>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/orders"
            className="text-primary hover:underline mb-4 inline-block"
          >
            ← Back to Orders
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Order #{order.id}</h1>
              <p className="text-gray-600">
                Placed on {new Date(order.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                statusColors[order.status] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold mb-4">Customer Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Name</label>
                  <p className="font-medium">{order.buyerName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="font-medium">{order.buyerEmail}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Shipping Address</label>
                  <p className="font-medium">{order.address}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 pb-4 border-b last:border-b-0 last:pb-0"
                  >
                    <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product?.images[0] || '/placeholder-product.png'}
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                    </div>

                    <div className="flex-grow">
                      {item.product ? (
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="font-medium hover:text-primary"
                          target="_blank"
                        >
                          {item.name}
                        </Link>
                      ) : (
                        <p className="font-medium">{item.name}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        {item.price.toLocaleString('vi-VN')} ₫ × {item.quantity}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold">
                        {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t mt-6 pt-6 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>{order.total.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-2">
                  <span>Total</span>
                  <span className="text-primary">
                    {order.total.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Actions</h2>

              <div className="space-y-3">
                <button
                  onClick={() => handleUpdateStatus('processing')}
                  disabled={updating || order.status === 'processing'}
                  className="w-full px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Mark Processing
                </button>

                <button
                  onClick={() => handleUpdateStatus('shipped')}
                  disabled={updating || order.status === 'shipped'}
                  className="w-full px-4 py-2 bg-purple-100 text-purple-800 rounded-lg font-medium hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Mark Shipped
                </button>

                <button
                  onClick={() => handleUpdateStatus('delivered')}
                  disabled={updating || order.status === 'delivered'}
                  className="w-full px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Mark Delivered
                </button>

                <button
                  onClick={() => handleUpdateStatus('cancelled')}
                  disabled={updating || order.status === 'cancelled'}
                  className="w-full px-4 py-2 bg-red-100 text-red-800 rounded-lg font-medium hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel Order
                </button>
              </div>

              <div className="mt-6 pt-6 border-t">
                <button
                  onClick={() => window.print()}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Print Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
