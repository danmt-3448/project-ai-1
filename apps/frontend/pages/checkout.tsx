import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCartStore } from '@/store/cartStore';
import { api } from '@/lib/api';

export default function Checkout() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    buyerName: '',
    buyerEmail: '',
    address: '',
  });

  const subtotal = getSubtotal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const checkoutItems = items.map((item) => ({
        productId: String(item.productId), // Convert number to string for API
        quantity: item.quantity,
      }));

      const result = await api.checkout({
        buyer: {
          name: formData.buyerName,
          email: formData.buyerEmail,
          address: formData.address,
        },
        items: checkoutItems,
      });

      // Clear cart and redirect to success page
      clearCart();
      router.push(`/order/${result.orderId}`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to process checkout');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Head>
          <title>Checkout - Mini Store</title>
        </Head>

        <div className="mx-auto max-w-4xl py-20 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-5xl font-extrabold text-transparent">
            Your cart is empty
          </h1>
          <p className="mb-8 text-xl text-gray-600">Add some products before checking out 🛍️</p>
          <button
            onClick={() => router.push('/')}
            className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-lg font-bold text-white transition-all hover:scale-105 hover:shadow-xl"
          >
            Continue Shopping
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Checkout - Mini Store</title>
      </Head>

      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-5xl font-extrabold text-transparent">
          💳 Checkout
        </h1>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Checkout Form */}
          <div>
            <h2 className="mb-6 text-3xl font-extrabold text-gray-800">📦 Shipping Information</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="buyerName" className="mb-2 block text-base font-bold text-gray-700">
                  Full Name *
                </label>
                <input
                  id="buyerName"
                  type="text"
                  required
                  value={formData.buyerName}
                  onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                  className="w-full rounded-xl border-2 border-purple-200 px-5 py-3 text-base focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label
                  htmlFor="buyerEmail"
                  className="mb-2 block text-base font-bold text-gray-700"
                >
                  Email *
                </label>
                <input
                  id="buyerEmail"
                  type="email"
                  required
                  value={formData.buyerEmail}
                  onChange={(e) => setFormData({ ...formData, buyerEmail: e.target.value })}
                  className="w-full rounded-xl border-2 border-purple-200 px-5 py-3 text-base focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="address" className="mb-2 block text-base font-bold text-gray-700">
                  Shipping Address *
                </label>
                <textarea
                  id="address"
                  required
                  rows={4}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full resize-none rounded-xl border-2 border-purple-200 px-5 py-3 text-base focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="123 Main St, City, Country"
                  minLength={10}
                />
              </div>

              {error && (
                <div className="rounded-xl border-2 border-red-300 bg-red-50 px-5 py-4 font-semibold text-red-700">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 text-lg font-bold text-white transition-all hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? '⏳ Processing...' : '📦 Place Order'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="mb-6 text-3xl font-extrabold text-gray-800">📊 Order Summary</h2>

            <div className="space-y-6 rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-8 shadow-xl">
              {/* Items */}
              <div className="space-y-4 border-b-2 border-purple-200 pb-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-base">
                    <span className="font-semibold text-gray-700">
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
                <div className="flex justify-between text-lg text-gray-700">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-bold">{subtotal.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between text-lg text-gray-700">
                  <span className="font-semibold">Shipping</span>
                  <span className="font-bold text-green-600">Free 🚚</span>
                </div>
                <div className="flex justify-between border-t-2 border-purple-300 pt-4 text-2xl font-extrabold">
                  <span>Total</span>
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {subtotal.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border-2 border-blue-300 bg-blue-50 px-5 py-4 text-blue-700">
              <p className="mb-2 text-lg font-bold">💡 Note:</p>
              <p className="text-base font-semibold">
                This is a demo checkout. No actual payment will be processed. Your order will be
                created for demonstration purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
