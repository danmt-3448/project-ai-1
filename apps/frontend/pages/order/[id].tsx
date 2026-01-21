import { useRouter } from 'next/router'
import useSWR from 'swr'
import Head from 'next/head'
import Link from 'next/link'
import { api } from '@/lib/api'

interface Order {
  id: number
  buyerName: string
  buyerEmail: string
  address: string
  total: number
  status: string
  createdAt: string
  items: Array<{
    id: number
    productId: number
    name: string
    price: number
    quantity: number
    product: {
      slug: string
      images: string[]
    }
  }>
}

export default function OrderDetail() {
  const router = useRouter()
  const { id } = router.query

  const { data: order, error } = useSWR<Order>(
    id ? `/api/orders/${id}` : null,
    () => api.getOrder(parseInt(id as string, 10))
  )

  if (error) {
    return (
      <>
        <Head>
          <title>Order Not Found - Mini Store</title>
        </Head>

        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-8">The order you're looking for doesn't exist</p>
          <Link
            href="/"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </>
    )
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <>
      <Head>
        <title>Order #{order.id} - Mini Store</title>
      </Head>

      <div className="max-w-4xl mx-auto">
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg mb-8">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 mr-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h2 className="font-bold text-lg mb-1">Order Placed Successfully!</h2>
              <p>
                Thank you for your order. We've sent a confirmation email to{' '}
                <strong>{order.buyerEmail}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Order #{order.id}</h1>
              <p className="text-gray-600 text-sm">
                Placed on {new Date(order.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                statusColors[order.status] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 border-t pt-6">
            <div>
              <h3 className="font-semibold mb-2">Shipping Address</h3>
              <p className="text-gray-700">{order.buyerName}</p>
              <p className="text-gray-600 text-sm">{order.address}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Contact Information</h3>
              <p className="text-gray-700">{order.buyerEmail}</p>
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
                <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={item.product.images[0] || '/placeholder-product.png'}
                    alt={item.name}
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="flex-grow">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="font-semibold hover:text-primary"
                  >
                    {item.name}
                  </Link>
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
              <span className="text-primary">{order.total.toLocaleString('vi-VN')} ₫</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="flex-1 text-center bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
          >
            Continue Shopping
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 text-center bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Print Order
          </button>
        </div>
      </div>
    </>
  )
}
