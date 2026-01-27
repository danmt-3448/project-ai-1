import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Head from 'next/head';
import { withAdminAuth } from '@/lib/withAdminAuth';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import OrderActivityTimeline from '@/components/OrderActivityTimeline';

interface Order {
  id: string;
  buyerName: string;
  buyerEmail: string;
  address: string;
  total: number;
  status: string;
  createdAt: string;
  trackingNumber?: string | null;
  carrier?: string | null;
  shipDate?: string | null;
  deliveryDate?: string | null;
  cancellationReason?: string | null;
  items: Array<{
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    product: {
      slug: string;
      images: string[];
    } | null;
  }>;
}

function AdminOrderDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showShipModal, setShowShipModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Form states
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [shouldRestock, setShouldRestock] = useState(true);

  useEffect(() => {
    // Không cần setToken nữa
  }, [router]);

  const {
    data: order,
    error: fetchError,
    mutate,
  } = useSWR<Order>(
    id ? `/admin/orders/${id}` : null,
    () => api.adminGetOrderById(id as string) as any
  );

  const handleMarkProcessing = async () => {
    if (!id) return;
    try {
      setUpdating(true);
      setError(null);
      await api.adminUpdateOrderStatus(id as string, {
        status: 'PROCESSING',
        note: 'Order confirmed and ready for preparation',
      });
      await mutate();
      toast.success('Order marked as Processing successfully!');
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkShipped = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setUpdating(true);
      setError(null);
      await api.adminUpdateOrderStatus(id as string, {
        status: 'SHIPPED',
        trackingNumber,
        carrier,
        shipDate: new Date().toISOString(),
        note: `Shipped via ${carrier}`,
      });
      await mutate();
      setShowShipModal(false);
      setTrackingNumber('');
      setCarrier('');
      toast.success('Order marked as Shipped successfully!');
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkDelivered = async () => {
    if (!id) return;
    // eslint-disable-next-line no-restricted-globals
    if (!window.confirm('Mark this order as Delivered?')) return;
    try {
      setUpdating(true);
      setError(null);
      await api.adminUpdateOrderStatus(id as string, {
        status: 'DELIVERED',
        deliveryDate: new Date().toISOString(),
        note: 'Order delivered successfully',
      });
      await mutate();
      toast.success('Order marked as Delivered successfully!');
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setUpdating(true);
      setError(null);
      const result = await api.adminUpdateOrderStatus(id as string, {
        status: 'CANCELLED',
        cancellationReason,
        shouldRestock,
        note: `Order cancelled: ${cancellationReason}`,
      });
      await mutate();
      setShowCancelModal(false);
      setCancellationReason('');
      if (result.restocked && result.restocked.length > 0) {
        toast.success(`Order cancelled and ${result.restocked.length} product(s) restocked!`);
      } else {
        toast.success('Order cancelled successfully!');
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const canTransitionTo = (targetStatus: string): boolean => {
    if (!order) return false;
    const current = order.status.toUpperCase();
    const target = targetStatus.toUpperCase();

    const transitions: Record<string, string[]> = {
      PENDING: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
    };

    return transitions[current]?.includes(target) || false;
  };

  if (fetchError) {
    return (
      <>
        <Head>
          <title>Order Not Found - Admin</title>
        </Head>
        <div className="py-12 text-center text-red-500">
          <p className="mb-4">Failed to load order</p>
          <Link href="/admin/orders" className="text-primary hover:underline">
            ← Back to Orders
          </Link>
        </div>
      </>
    );
  }

  if (!order) {
    return <div className="py-12 text-center">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Order #{order.id} - Admin</title>
      </Head>

      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/orders" className="mb-4 inline-block text-blue-600 hover:underline">
            ← Back to Orders
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold">Order #{order.id.slice(0, 8)}</h1>
              <p className="text-gray-600">
                Placed on{' '}
                {new Date(order.createdAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="text-right">
              export default withAdminAuth(AdminOrderDetail);
              {order?.trackingNumber && (
                <p className="mt-2 text-sm text-gray-600">
                  {order.carrier}: {order.trackingNumber}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Order Details */}
          <div className="space-y-6 md:col-span-2">
            {/* Customer Info */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold">Customer Information</h2>
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
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={item.product?.images[0] || '/placeholder-product.png'}
                        alt={item.name}
                        fill
                        className="object-cover"
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

            {/* Activity Timeline */}
            {id && (
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-bold">Order History</h2>
                <OrderActivityTimeline orderId={id as string} />
              </div>
            )}
          </div>

          {/* Actions Sidebar */}
          <div className="md:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Status Badge */}
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h2 className="mb-3 text-sm font-medium text-gray-600">Current Status</h2>
                <OrderStatusBadge status={order.status.toUpperCase() as any} size="lg" />

                {order.trackingNumber && (
                  <div className="mt-4 space-y-2 border-t pt-4">
                    <div>
                      <p className="text-xs text-gray-600">Tracking Number</p>
                      <p className="font-mono text-sm font-medium">{order.trackingNumber}</p>
                    </div>
                    {order.carrier && (
                      <div>
                        <p className="text-xs text-gray-600">Carrier</p>
                        <p className="text-sm font-medium">{order.carrier}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-bold">Actions</h2>

                {error && (
                  <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-800">{error}</div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={handleMarkProcessing}
                    disabled={updating || !canTransitionTo('PROCESSING')}
                    className="w-full rounded-lg bg-blue-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updating ? 'Updating...' : 'Mark Processing'}
                  </button>

                  <button
                    onClick={() => setShowShipModal(true)}
                    disabled={updating || !canTransitionTo('SHIPPED')}
                    className="w-full rounded-lg bg-purple-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Mark Shipped
                  </button>

                  <button
                    onClick={handleMarkDelivered}
                    disabled={updating || !canTransitionTo('DELIVERED')}
                    className="w-full rounded-lg bg-green-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Mark Delivered
                  </button>

                  <button
                    onClick={() => setShowCancelModal(true)}
                    disabled={updating || !canTransitionTo('CANCELLED')}
                    className="w-full rounded-lg bg-red-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel Order
                  </button>
                </div>

                <div className="mt-6 border-t pt-6">
                  <button
                    onClick={() => window.print()}
                    className="w-full rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200"
                  >
                    Print Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ship Modal */}
      {showShipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-2xl font-bold">Mark as Shipped</h2>
            <form onSubmit={handleMarkShipped} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Tracking Number *</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  required
                  placeholder="e.g., FDX1234567890"
                  className="w-full rounded-lg border px-4 py-2 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Carrier *</label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  required
                  className="w-full rounded-lg border px-4 py-2 focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select carrier...</option>
                  <option value="FedEx">FedEx</option>
                  <option value="UPS">UPS</option>
                  <option value="DHL">DHL</option>
                  <option value="USPS">USPS</option>
                  <option value="Viettel Post">Viettel Post</option>
                  <option value="Giao Hàng Nhanh">Giao Hàng Nhanh</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowShipModal(false);
                    setTrackingNumber('');
                    setCarrier('');
                  }}
                  className="flex-1 rounded-lg border px-4 py-2 font-medium hover:bg-gray-50"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 rounded-lg bg-purple-500 px-4 py-2 font-medium text-white hover:bg-purple-600 disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-2xl font-bold text-red-600">Cancel Order</h2>
            <p className="mb-4 text-sm text-gray-600">
              This action will cancel the order. Please provide a reason.
            </p>
            <form onSubmit={handleCancelOrder} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Cancellation Reason *</label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  required
                  rows={3}
                  placeholder="e.g., Customer requested cancellation"
                  className="w-full rounded-lg border px-4 py-2 focus:border-red-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="shouldRestock"
                  checked={shouldRestock}
                  onChange={(e) => setShouldRestock(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="shouldRestock" className="text-sm font-medium">
                  Restock inventory (restore product quantities)
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancellationReason('');
                    setShouldRestock(true);
                  }}
                  className="flex-1 rounded-lg border px-4 py-2 font-medium hover:bg-gray-50"
                  disabled={updating}
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 rounded-lg bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600 disabled:opacity-50"
                >
                  {updating ? 'Cancelling...' : 'Cancel Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default withAdminAuth(AdminOrderDetail);
