import { useState } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Head from 'next/head';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Category } from '@/types';

export default function CreateProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    inventory: '',
    categoryId: '',
    images: [''],
    published: false,
  });

  const { data: categories } = useSWR<Category[]>('/categories', () => api.getCategories());

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const removeImageField = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const images = formData.images.filter((img) => img.trim() !== '');

      await api.adminCreateProduct({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        price: parseFloat(formData.price),
        inventory: parseInt(formData.inventory, 10),
        categoryId: formData.categoryId,
        images,
        published: formData.published,
      });

      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Product - Admin</title>
      </Head>

      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link href="/admin/products" className="mb-4 inline-block text-primary hover:underline">
            ← Back to Products
          </Link>
          <h1 className="text-3xl font-bold">Create New Product</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
            {/* Name */}
            <div>
              <label className="mb-1 block text-sm font-medium">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Áo Thun Cơ Bản"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="mb-1 block text-sm font-medium">Slug *</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="ao-thun-co-ban"
              />
              <p className="mt-1 text-xs text-gray-500">
                URL-friendly version of name (auto-generated)
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-sm font-medium">Description *</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Product description..."
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-1 block text-sm font-medium">Category *</label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a category</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Price */}
              <div>
                <label className="mb-1 block text-sm font-medium">Price (₫) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="150000"
                />
              </div>

              {/* Inventory */}
              <div>
                <label className="mb-1 block text-sm font-medium">Inventory *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.inventory}
                  onChange={(e) => setFormData({ ...formData, inventory: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="50"
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="mb-2 block text-sm font-medium">Product Images</label>
              <div className="space-y-2">
                {formData.images.map((image, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://via.placeholder.com/400"
                    />
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="rounded-lg bg-red-100 px-4 py-2 text-red-600 hover:bg-red-200"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImageField}
                  className="text-sm text-primary hover:underline"
                >
                  + Add another image
                </button>
              </div>
            </div>

            {/* Published */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="published" className="ml-2 text-sm font-medium">
                Publish immediately
              </label>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
            <Link
              href="/admin/products"
              className="rounded-lg bg-gray-100 px-6 py-3 text-center font-semibold text-gray-700 transition-colors hover:bg-gray-200"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
