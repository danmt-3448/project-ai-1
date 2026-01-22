import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Head from 'next/head';
import Link from 'next/link';

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
    name: string;
    price: number;
    quantity: number;
  }>;
}

interface OrdersResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminOrders() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      router.push('/admin');
      return;
    }
    setToken(adminToken);
  }, [router]);

  const fetcher = async (url: string) => {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  };

  const { data, error } = useSWR<OrdersResponse>(
    token
      ? `${process.env.NEXT_PUBLIC_API_URL}/admin/orders?page=${page}&limit=20${
          statusFilter ? `&status=${statusFilter}` : ''
        }`
      : null,
    fetcher
  );

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  if (!token) {
    return <div className="py-12 text-center">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Manage Orders - Admin</title>
      </Head>

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Manage Orders</h1>
            <p className="text-gray-600">{data?.total || 0} orders total</p>
          </div>
          <Link
            href="/admin/dashboard"
            className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
          >
            ← Back
          </Link>
        </div>

        {/* Status Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setStatusFilter('');
                setPage(1);
              }}
              className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                !statusFilter
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        {error ? (
          <div className="py-12 text-center text-red-500">Failed to load orders</div>
        ) : !data ? (
          <div className="py-12 text-center">Loading...</div>
        ) : data.data.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p className="mb-4">No orders found</p>
            {statusFilter && (
              <button onClick={() => setStatusFilter('')} className="text-primary hover:underline">
                Show all orders
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {data.data.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="font-mono text-sm font-medium">#{order.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{order.buyerName}</div>
                            <div className="text-gray-500">{order.buyerEmail}</div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="text-sm text-gray-700">
                            {order.items.length} item(s)
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">
                            {order.total.toLocaleString('vi-VN')} ₫
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              statusColors[order.status] || 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2">
                  Page {page} of {data.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                  className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
