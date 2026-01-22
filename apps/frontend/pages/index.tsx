import { useState } from 'react';
import useSWR from 'swr';
import Head from 'next/head';
import Link from 'next/link';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  inventory: number;
  images: string[];
  category: {
    id: number;
    name: string;
    slug: string;
  };
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  // Fetch categories
  const { data: categories, error: categoriesError } = useSWR<Category[]>('/api/categories', () =>
    api.getCategories()
  );

  // Fetch products
  const { data: productsData, error: productsError } = useSWR(
    ['/api/products', selectedCategory],
    () => api.getProducts({ category: selectedCategory, limit: 8 })
  );

  const isLoading = !categories || !productsData;
  const hasError = categoriesError || productsError;

  return (
    <>
      <Head>
        <title>Mini Store - Home</title>
        <meta name="description" content="Shop the best products at Mini Store" />
      </Head>

      <div className="space-y-12 pb-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-12 text-white shadow-2xl md:p-16">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h1 className="mb-6 text-5xl font-extrabold drop-shadow-lg md:text-6xl">
              Welcome to Mini Store
            </h1>
            <p className="mb-8 max-w-2xl text-xl font-medium leading-relaxed md:text-2xl">
              Discover amazing products at great prices
            </p>
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-purple-600 shadow-xl transition-all hover:scale-105 hover:bg-gray-50 hover:shadow-2xl"
            >
              Browse Categories
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </section>

        {/* Categories Filter */}
        <section>
          <h2 className="mb-6 text-3xl font-bold text-gray-900">Shop by Category</h2>
          {categoriesError ? (
            <div className="rounded-lg bg-red-50 p-4 font-semibold text-red-600">
              Failed to load categories
            </div>
          ) : !categories ? (
            <div className="flex space-x-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 w-28 animate-pulse rounded-xl bg-gray-200"></div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory(undefined)}
                className={`rounded-xl px-6 py-3 font-bold shadow-md transition-all hover:shadow-lg ${
                  !selectedCategory
                    ? 'scale-105 bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'border-2 border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`rounded-xl px-6 py-3 font-bold shadow-md transition-all hover:shadow-lg ${
                    selectedCategory === category.slug
                      ? 'scale-105 bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'border-2 border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Products Grid */}
        <section>
          <h2 className="mb-6 text-3xl font-bold text-gray-900">Featured Products</h2>

          {hasError ? (
            <div className="rounded-lg bg-red-50 p-4 font-semibold text-red-600">
              Failed to load products
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-96 animate-pulse rounded-2xl bg-gray-200"></div>
              ))}
            </div>
          ) : productsData.data.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <p className="text-lg">No products found</p>
              <button
                onClick={() => setSelectedCategory(undefined)}
                className="mt-4 text-primary hover:underline"
              >
                Show all products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {productsData.data.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {productsData && productsData.data.length > 0 && (
            <div className="mt-8 text-center">
              <Link
                href="/products"
                className="inline-block rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                View All Products
              </Link>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
