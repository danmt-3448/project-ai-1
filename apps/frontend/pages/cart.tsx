import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCartStore, CartItem } from '@/store/cartStore';

export default function Cart() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, getSubtotal, getTotalItems } = useCartStore();

  const subtotal = getSubtotal();
  const totalItems = getTotalItems();

  if (items.length === 0) {
    return (
      <>
        <Head>
          <title>Shopping Cart - Mini Store</title>
        </Head>

        <div className="mx-auto max-w-4xl py-20 text-center">
          <div className="mb-8">
            <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100">
              <svg
                className="h-20 w-20 text-purple-400"
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
          <h1 className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-5xl font-extrabold text-transparent">
            Your cart is empty
          </h1>
          <p className="mb-8 text-xl text-gray-600">Add some products to get started 🛍️</p>
          <Link
            href="/"
            className="inline-block rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-lg font-bold text-white transition-all hover:scale-105 hover:shadow-xl"
          >
            Continue Shopping
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Shopping Cart ({totalItems}) - Mini Store</title>
      </Head>

      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-5xl font-extrabold text-transparent">
          🛒 Shopping Cart
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">
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
            <div className="sticky top-24 rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-8 shadow-xl">
              <h2 className="mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-3xl font-extrabold text-transparent">
                Order Summary
              </h2>

              <div className="mb-8 space-y-4">
                <div className="flex justify-between text-lg text-gray-700">
                  <span className="font-semibold">Subtotal ({totalItems} items)</span>
                  <span className="font-bold">{subtotal.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between text-lg text-gray-700">
                  <span className="font-semibold">Shipping</span>
                  <span className="font-bold text-green-600">Free 🚚</span>
                </div>
                <div className="flex justify-between border-t-2 border-purple-200 pt-4 text-2xl font-extrabold">
                  <span>Total</span>
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {subtotal.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="mb-4 w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 text-lg font-bold text-white transition-all hover:scale-105 hover:shadow-xl"
              >
                💳 Proceed to Checkout
              </button>

              <Link
                href="/"
                className="block text-center text-base font-semibold text-purple-600 hover:text-pink-600"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const maxQuantity = Math.min(item.inventory, 10);
  const itemTotal = item.price * item.quantity;

  return (
    <div className="flex gap-6 rounded-2xl border-2 border-purple-100 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl">
      {/* Image */}
      <Link href={`/products/${item.slug}`} className="flex-shrink-0">
        <div className="relative h-32 w-32 overflow-hidden rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 shadow-md">
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
          <h3 className="mb-2 text-2xl font-extrabold">{item.name}</h3>
        </Link>
        <p className="mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-xl font-extrabold text-transparent">
          {item.price.toLocaleString('vi-VN')} ₫
        </p>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-purple-300 text-lg font-bold transition-all hover:bg-purple-100"
              disabled={item.quantity <= 1}
            >
              -
            </button>
            <span className="w-16 text-center text-xl font-bold">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-purple-300 text-lg font-bold transition-all hover:bg-purple-100"
              disabled={item.quantity >= maxQuantity}
            >
              +
            </button>
          </div>

          <button
            onClick={() => onRemove(item.productId)}
            className="rounded-lg px-4 py-2 text-base font-bold text-red-500 transition-all hover:bg-red-50 hover:text-red-700"
          >
            🗑️ Remove
          </button>
        </div>

        {item.quantity >= item.inventory && (
          <p className="mt-2 text-sm font-semibold text-orange-600">
            ⚠️ Maximum available quantity
          </p>
        )}
      </div>

      {/* Total */}
      <div className="flex-shrink-0 text-right">
        <p className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-2xl font-extrabold text-transparent">
          {itemTotal.toLocaleString('vi-VN')} ₫
        </p>
      </div>
    </div>
  );
}
