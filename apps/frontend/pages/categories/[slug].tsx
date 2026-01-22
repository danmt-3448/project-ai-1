import { useRouter } from 'next/router';
import useSWR from 'swr';
import Head from 'next/head';
import Link from 'next/link';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

interface CategoryProductsResponse {
  category: {
    id: number;
    name: string;
    slug: string;
  };
  products: Array<{
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
  }>;
}

export default function CategoryProducts() {
  const router = useRouter();
  const { slug } = router.query;

  const { data, error } = useSWR<CategoryProductsResponse>(
    slug ? `/api/categories/${slug}/products` : null,
    () => api.getCategoryProducts(slug as string)
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
        <title>{data.category.name} - Mini Store</title>
        <meta name="description" content={`Browse ${data.category.name} products`} />
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
          <span className="text-gray-900">{data.category.name}</span>
        </nav>

        <h1 className="mb-8 text-3xl font-bold">{data.category.name}</h1>

        {data.products.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p className="mb-4 text-lg">No products found in this category</p>
            <Link href="/categories" className="inline-block text-primary hover:underline">
              Browse other categories
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-gray-600">{data.products.length} products found</p>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
