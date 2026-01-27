import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  inventory: number;
  published: boolean;
  images: string[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminProducts() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  const { data, error, mutate } = useSWR<ProductsResponse>(
    token
      ? `${process.env.NEXT_PUBLIC_API_URL}/admin/products?page=${page}&limit=20&search=${search}`
      : null,
    fetcher
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      setDeleteId(id);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete');

      mutate();
      alert('Product deleted successfully');
    } catch (error) {
      alert('Failed to delete product');
    } finally {
      setDeleteId(null);
    }
  };

  const handleTogglePublish = async (product: Product) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          published: !product.published,
        }),
      });

      if (!res.ok) throw new Error('Failed to update');

      mutate();
    } catch (error) {
      alert('Failed to update product');
    }
  };

  if (!token) {
    return <div className="py-12 text-center">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Manage Products - Admin</title>
      </Head>

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Manage Products</h1>
            <p className="text-gray-600">{data?.total || 0} products total</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/dashboard"
              className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
            >
              ← Back
            </Link>
            <Link
              href="/admin/products/create"
              className="rounded-lg bg-primary px-6 py-2 font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              + Add Product
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary md:w-96"
          />
        </div>

        {/* Products Table */}
        {error ? (
          <div className="py-12 text-center text-red-500">Failed to load products</div>
        ) : !data ? (
          <div className="py-12 text-center">Loading...</div>
        ) : data.data.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p className="mb-4">No products found</p>
            {search && (
              <button onClick={() => setSearch('')} className="text-primary hover:underline">
                Clear search
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
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Inventory
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {data.data.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center">
                            <div className="relative mr-3 h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                              <Image
                                src={product.images[0] || '/placeholder-product.png'}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="text-sm text-gray-700">{product.category.name}</span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">
                            {product.price.toLocaleString('vi-VN')} ₫
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`text-sm font-medium ${
                              product.inventory === 0
                                ? 'text-red-600'
                                : product.inventory < 5
                                  ? 'text-orange-600'
                                  : 'text-gray-900'
                            }`}
                          >
                            {product.inventory}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <button
                            onClick={() => handleTogglePublish(product)}
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              product.published
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {product.published ? 'Published' : 'Draft'}
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/admin/products/${product.slug}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id)}
                              disabled={deleteId === product.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              {deleteId === product.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
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
