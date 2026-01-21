import { useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCartStore, CartItem } from '@/store/cartStore'

export default function Cart() {
  const router = useRouter()
  const { items, updateQuantity, removeItem, getSubtotal, getTotalItems } = useCartStore()

  const subtotal = getSubtotal()
  const totalItems = getTotalItems()

  if (items.length === 0) {
    return (
      <>
        <Head>
          <title>Shopping Cart - Mini Store</title>
        </Head>

        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <svg
                className="w-20 h-20 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Your cart is empty</h1>
          <p className="text-xl text-gray-600 mb-8">Add some products to get started 🛍️</p>
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Shopping Cart ({totalItems}) - Mini Store</title>
      </Head>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">🛒 Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItemRow
                key={item.productId}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 sticky top-24 border-2 border-purple-200 shadow-xl">
              <h2 className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Order Summary</h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-700 text-lg">
                  <span className="font-semibold">Subtotal ({totalItems} items)</span>
                  <span className="font-bold">{subtotal.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between text-gray-700 text-lg">
                  <span className="font-semibold">Shipping</span>
                  <span className="text-green-600 font-bold">Free 🚚</span>
                </div>
                <div className="border-t-2 border-purple-200 pt-4 flex justify-between text-2xl font-extrabold">
                  <span>Total</span>
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{subtotal.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all mb-4"
              >
                💳 Proceed to Checkout
              </button>

              <Link
                href="/"
                className="block text-center text-purple-600 hover:text-pink-600 font-semibold text-base"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

interface CartItemRowProps {
  item: CartItem
  onUpdateQuantity: (productId: number, quantity: number) => void
  onRemove: (productId: number) => void
}

function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const maxQuantity = Math.min(item.inventory, 10)
  const itemTotal = item.price * item.quantity

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 p-6 flex gap-6 hover:shadow-xl transition-shadow">
      {/* Image */}
      <Link href={`/products/${item.slug}`} className="flex-shrink-0">
        <div className="relative w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl overflow-hidden shadow-md">
          <Image
            src={item.image || '/placeholder-product.png'}
            alt={item.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      </Link>

      {/* Details */}
      <div className="flex-grow">
        <Link href={`/products/${item.slug}`} className="hover:text-purple-600">
          <h3 className="font-extrabold text-2xl mb-2">{item.name}</h3>
        </Link>
        <p className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-extrabold text-xl mb-3">
          {item.price.toLocaleString('vi-VN')} ₫
        </p>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
              className="w-10 h-10 rounded-lg border-2 border-purple-300 hover:bg-purple-100 flex items-center justify-center font-bold text-lg transition-all"
              disabled={item.quantity <= 1}
            >
              -
            </button>
            <span className="w-16 text-center font-bold text-xl">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
              className="w-10 h-10 rounded-lg border-2 border-purple-300 hover:bg-purple-100 flex items-center justify-center font-bold text-lg transition-all"
              disabled={item.quantity >= maxQuantity}
            >
              +
            </button>
          </div>

          <button
            onClick={() => onRemove(item.productId)}
            className="text-red-500 hover:text-red-700 font-bold text-base px-4 py-2 rounded-lg hover:bg-red-50 transition-all"
          >
            🗑️ Remove
          </button>
        </div>

        {item.quantity >= item.inventory && (
          <p className="text-sm text-orange-600 mt-2 font-semibold">⚠️ Maximum available quantity</p>
        )}
      </div>

      {/* Total */}
      <div className="flex-shrink-0 text-right">
        <p className="font-extrabold text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{itemTotal.toLocaleString('vi-VN')} ₫</p>
      </div>
    </div>
  )
}
