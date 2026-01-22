import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Head from 'next/head';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export default function AdminCategories() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  // Form states
  const [createName, setCreateName] = useState('');
  const [createSlug, setCreateSlug] = useState('');
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editError, setEditError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      router.push('/admin');
      return;
    }
    setToken(adminToken);
  }, [router]);

  const fetcher = async (url: string) => {
    if (!token) return null;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      localStorage.removeItem('adminToken');
      router.push('/admin');
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch');
    }

    return response.json();
  };

  const {
    data: categories,
    error,
    mutate,
  } = useSWR<Category[]>(
    token ? `${process.env.NEXT_PUBLIC_API_URL}/admin/categories` : null,
    fetcher
  );

  // Client-side slug validation
  const validateSlug = (slug: string): string | null => {
    if (!slug) {
      return 'Slug is required';
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return 'Slug must be lowercase letters, numbers, and hyphens only';
    }
    return null;
  };

  // Handle create category
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    // Client-side validation
    if (!createName.trim()) {
      setCreateError('Name is required');
      return;
    }

    const slugError = validateSlug(createSlug);
    if (slugError) {
      setCreateError(slugError);
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: createName,
          slug: createSlug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setCreateError(`Category with slug "${createSlug}" already exists`);
        } else if (data.error === 'Validation failed') {
          setCreateError(data.details?.[0]?.message || 'Invalid input');
        } else {
          setCreateError(data.message || 'Failed to create category');
        }
        return;
      }

      // Success - clear form and refresh list
      setCreateName('');
      setCreateSlug('');
      mutate();
    } catch (err) {
      setCreateError('Network error. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle edit mode
  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditSlug(category.slug);
    setEditError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditSlug('');
    setEditError('');
  };

  // Handle save edit
  const handleSave = async (id: string) => {
    setEditError('');

    // Client-side validation
    if (!editName.trim()) {
      setEditError('Name is required');
      return;
    }

    const slugError = validateSlug(editSlug);
    if (slugError) {
      setEditError(slugError);
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          slug: editSlug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setEditError(`Category with slug "${editSlug}" already exists`);
        } else if (data.error === 'Validation failed') {
          setEditError(data.details?.[0]?.message || 'Invalid input');
        } else {
          setEditError(data.message || 'Failed to update category');
        }
        return;
      }

      // Success - exit edit mode and refresh
      setEditingId(null);
      mutate();
    } catch (err) {
      setEditError('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const confirmDelete = (category: Category) => {
    setDeleteId(category.id);
    setDeleteError('');
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    setDeleteError('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/categories/${deleteId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 409) {
        const data = await response.json();
        const category = categories?.find((c) => c.id === deleteId);
        setDeleteError(
          data.message ||
            `Cannot delete category with ${category?.productCount || 0} associated products`
        );
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        setDeleteError(data.message || 'Failed to delete category');
        return;
      }

      // Success - close modal and refresh
      setDeleteId(null);
      mutate();
    } catch (err) {
      setDeleteError('Network error. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
    setDeleteError('');
  };

  if (!token) {
    return null;
  }

  const categoryToDelete = categories?.find((c) => c.id === deleteId);

  return (
    <>
      <Head>
        <title>Manage Categories - Admin</title>
      </Head>

      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <Link
                  href="/admin/dashboard"
                  className="flex items-center px-2 py-2 text-gray-700 hover:text-gray-900"
                >
                  Admin Dashboard
                </Link>
                <Link
                  href="/admin/products"
                  className="flex items-center px-2 py-2 text-gray-700 hover:text-gray-900"
                >
                  Products
                </Link>
                <Link
                  href="/admin/categories"
                  className="flex items-center border-b-2 border-blue-500 px-2 py-2 text-gray-900"
                >
                  Categories
                </Link>
                <Link
                  href="/admin/orders"
                  className="flex items-center px-2 py-2 text-gray-700 hover:text-gray-900"
                >
                  Orders
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Manage Categories</h1>
            <p className="mt-2 text-sm text-gray-600">
              Create, edit, and delete product categories
            </p>
          </div>

          {/* Create Category Form */}
          <div className="mb-8 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Add New Category</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="create-name" className="block text-sm font-medium text-gray-700">
                    Name *
                  </label>
                  <input
                    id="create-name"
                    type="text"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    placeholder="e.g., Electronics"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="create-slug" className="block text-sm font-medium text-gray-700">
                    Slug * <span className="text-xs text-gray-500">(lowercase, hyphens only)</span>
                  </label>
                  <input
                    id="create-slug"
                    type="text"
                    value={createSlug}
                    onChange={(e) => setCreateSlug(e.target.value.toLowerCase())}
                    pattern="[a-z0-9-]+"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    placeholder="e.g., electronics"
                    required
                  />
                </div>
              </div>

              {createError && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{createError}</div>
              )}

              <button
                type="submit"
                disabled={isCreating}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isCreating ? 'Adding...' : 'Add Category'}
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">All Categories</h2>
            </div>

            {error && (
              <div className="m-6 rounded-md bg-red-50 p-4 text-red-800">
                Failed to load categories
              </div>
            )}

            {!categories && !error && (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            )}

            {categories && categories.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No categories yet. Create one above!
              </div>
            )}

            {categories && categories.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Slug
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Products
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {categories.map((category) => (
                      <tr key={category.id}>
                        {editingId === category.id ? (
                          <>
                            {/* Edit Mode */}
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                placeholder="Name"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                value={editSlug}
                                onChange={(e) => setEditSlug(e.target.value.toLowerCase())}
                                pattern="[a-z0-9-]+"
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                placeholder="slug"
                              />
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {category.productCount}
                            </td>
                            <td className="px-6 py-4 text-right text-sm">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => handleSave(category.id)}
                                  disabled={isSaving}
                                  className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                >
                                  {isSaving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  disabled={isSaving}
                                  className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              </div>
                              {editError && (
                                <div className="mt-2 text-xs text-red-600">{editError}</div>
                              )}
                            </td>
                          </>
                        ) : (
                          <>
                            {/* View Mode */}
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                              {category.name}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                              {category.slug}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                              {category.productCount}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                              <button
                                onClick={() => startEdit(category)}
                                className="mr-4 text-blue-600 hover:text-blue-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => confirmDelete(category)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={cancelDelete}
            ></div>

            {/* Modal */}
            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Delete Category</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete "<strong>{categoryToDelete?.name}</strong>"?
                      </p>
                      {categoryToDelete && categoryToDelete.productCount > 0 && (
                        <p className="mt-2 text-sm font-medium text-red-600">
                          ⚠️ This category has {categoryToDelete.productCount} associated
                          product(s). You cannot delete it until those products are reassigned or
                          deleted.
                        </p>
                      )}
                    </div>
                    {deleteError && (
                      <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800">
                        {deleteError}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting || (categoryToDelete && categoryToDelete.productCount > 0)}
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  type="button"
                  onClick={cancelDelete}
                  disabled={isDeleting}
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
