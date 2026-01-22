import { useRouter } from 'next/router';
import useSWR from 'swr';
import Head from 'next/head';
import Link from 'next/link';
import { api, Product } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { useMemo } from 'react';

export default function CategoryProducts() {
  const router = useRouter();
  const { slug } = router.query;

  const { data, error } = useSWR<Product[]>(slug ? `/api/categories/${slug}/products` : null, () =>
    api.getCategoryProducts(slug as string)
  );

  const products = data?.products;

  // Ensure products is always an array (memoized)
  const productList = useMemo<Product[]>(
    () => (Array.isArray(products) ? products : []),
    [products]
  );

  if (error) {
    return (
      <>
        <Head>
          <title>Category Not Found - Mini Store</title>
        </Head>

        <div className="py-12 text-center">
          <h1 className="mb-4 text-3xl font-bold text-red-500">Category Not Found</h1>
          <Link href="/categories" className="text-primary hover:underline">
            Browse all categories
          </Link>
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <div className="animate-pulse">
        <div className="mb-8 h-8 w-1/4 rounded bg-gray-200"></div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-80 rounded-lg bg-gray-200"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{data?.category?.name || slug} - Mini Store</title>
        <meta
          name="description"
          content={`Browse ${data?.category?.name || slug} products`}
        />
      </Head>

      <div>
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/categories" className="hover:text-primary">
            Categories
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{data?.category?.name || slug}</span>
        </nav>

        <h1 className="mb-8 text-3xl font-bold">{data?.category?.name || slug}</h1>

        {productList.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p className="mb-4 text-lg">No products found in this category</p>
            <Link href="/categories" className="inline-block text-primary hover:underline">
              Browse other categories
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-gray-600">{productList.length} products found</p>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {productList.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
