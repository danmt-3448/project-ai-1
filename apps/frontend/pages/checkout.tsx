import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useCartStore } from '@/store/cartStore'
import { api } from '@/lib/api'

export default function Checkout() {
  const router = useRouter()
  const { items, getSubtotal, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    buyerName: '',
    buyerEmail: '',
    address: '',
  })

  const subtotal = getSubtotal()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const checkoutItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }))

      const result = await api.checkout({
        ...formData,
        items: checkoutItems,
      })

      // Clear cart and redirect to success page
      clearCart()
      router.push(`/order/${result.orderId}`)
    } catch (err: any) {
      console.error('Checkout error:', err)
      setError(err.response?.data?.message || err.message || 'Failed to process checkout')
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <>
        <Head>
          <title>Checkout - Mini Store</title>
        </Head>

        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Your cart is empty</h1>
          <p className="text-xl text-gray-600 mb-8">Add some products before checking out 🛍️</p>
          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Checkout - Mini Store</title>
      </Head>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">💳 Checkout</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div>
            <h2 className="text-3xl font-extrabold mb-6 text-gray-800">📦 Shipping Information</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="buyerName" className="block text-base font-bold mb-2 text-gray-700">
                  Full Name *
                </label>
                <input
                  id="buyerName"
                  type="text"
                  required
                  value={formData.buyerName}
                  onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                  className="w-full px-5 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="buyerEmail" className="block text-base font-bold mb-2 text-gray-700">
                  Email *
                </label>
                <input
                  id="buyerEmail"
                  type="email"
                  required
                  value={formData.buyerEmail}
                  onChange={(e) => setFormData({ ...formData, buyerEmail: e.target.value })}
                  className="w-full px-5 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-base font-bold mb-2 text-gray-700">
                  Shipping Address *
                </label>
                <textarea
                  id="address"
                  required
                  rows={4}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-5 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-base"
                  placeholder="123 Main St, City, Country"
                  minLength={10}
                />
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-300 text-red-700 px-5 py-4 rounded-xl font-semibold">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? '⏳ Processing...' : '📦 Place Order'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="text-3xl font-extrabold mb-6 text-gray-800">📊 Order Summary</h2>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200 shadow-xl space-y-6">
              {/* Items */}
              <div className="space-y-4 border-b-2 border-purple-200 pb-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-base">
                    <span className="text-gray-700 font-semibold">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-bold text-purple-600">
                      {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700 text-lg">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-bold">{subtotal.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between text-gray-700 text-lg">
                  <span className="font-semibold">Shipping</span>
                  <span className="text-green-600 font-bold">Free 🚚</span>
                </div>
                <div className="border-t-2 border-purple-300 pt-4 flex justify-between text-2xl font-extrabold">
                  <span>Total</span>
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{subtotal.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 border-2 border-blue-300 text-blue-700 px-5 py-4 rounded-xl">
              <p className="font-bold mb-2 text-lg">💡 Note:</p>
              <p className="font-semibold text-base">
                This is a demo checkout. No actual payment will be processed. Your order will
                be created for demonstration purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
