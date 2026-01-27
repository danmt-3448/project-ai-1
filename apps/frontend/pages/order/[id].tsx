import { useRouter } from 'next/router';
import useSWR from 'swr';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';

interface Order {
  id: number;
  buyerName: string;
  buyerEmail: string;
  address: string;
  total: number;
  status: string;
  createdAt: string;
  items: Array<{
    id: number;
    productId: number;
    name: string;
    price: number;
    quantity: number;
    product: {
      slug: string;
      images: string[];
    };
  }>;
}

export default function OrderDetail() {
  const router = useRouter();
  const { id } = router.query;

  const { data: order, error } = useSWR<Order, Error>(id ? `/api/orders/${id}` : null, (() =>
    api.getOrder(id?.toString() || '')) as any);

  if (error) {
    return (
      <>
        <Head>
          <title>Order Not Found - Mini Store</title>
        </Head>

        <div className="mx-auto max-w-4xl py-12 text-center">
          <h1 className="mb-4 text-3xl font-bold text-red-500">Order Not Found</h1>
          <p className="mb-8 text-gray-600">The order you're looking for doesn't exist</p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Go to Home
          </Link>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/4 rounded bg-gray-200"></div>
          <div className="h-32 rounded bg-gray-200"></div>
          <div className="h-64 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <>
      <Head>
        <title>Order #{order.id} - Mini Store</title>
      </Head>

      <div className="mx-auto max-w-4xl">
        {/* Success Message */}
        <div className="mb-8 rounded-lg border border-green-200 bg-green-50 px-6 py-4 text-green-800">
          <div className="flex items-start">
            <svg
              className="mr-3 h-6 w-6 flex-shrink-0"
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
              <h2 className="mb-1 text-lg font-bold">Order Placed Successfully!</h2>
              <p>
                Thank you for your order. We've sent a confirmation email to{' '}
                <strong>{order.buyerEmail}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-2xl font-bold">Order #{order.id}</h1>
              <p className="text-sm text-gray-600">
                Placed on {new Date(order.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                statusColors[order.status] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>

          <div className="grid gap-6 border-t pt-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold">Shipping Address</h3>
              <p className="text-gray-700">{order.buyerName}</p>
              <p className="text-sm text-gray-600">{order.address}</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Contact Information</h3>
              <p className="text-gray-700">{order.buyerEmail}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Order Items</h2>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0"
              >
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={item.product.images[0] || '/placeholder-product.png'}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="80px"
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

          <div className="mt-6 space-y-2 border-t pt-6">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span>{order.total.toLocaleString('vi-VN')} ₫</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-xl font-bold">
              <span>Total</span>
              <span className="text-primary">{order.total.toLocaleString('vi-VN')} ₫</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/"
            className="flex-1 rounded-lg bg-primary px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Continue Shopping
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 rounded-lg bg-gray-100 px-6 py-3 text-center font-semibold text-gray-700 transition-colors hover:bg-gray-200"
          >
            Print Order
          </button>
        </div>
      </div>
    </>
  );
}
