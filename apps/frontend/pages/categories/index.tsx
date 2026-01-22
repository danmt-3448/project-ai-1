import useSWR from 'swr';
import Head from 'next/head';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function Categories() {
  const { data: categories, error } = useSWR<Category[]>('/api/categories', () =>
    api.getCategories()
  );

  if (error) {
    return (
      <>
        <Head>
          <title>Categories - Mini Store</title>
        </Head>
        <div className="py-12 text-center text-red-500">Failed to load categories</div>
      </>
    );
  }

  if (!categories) {
    return (
      <>
        <Head>
          <title>Categories - Mini Store</title>
        </Head>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200"></div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Categories - Mini Store</title>
        <meta name="description" content="Browse products by category" />
      </Head>

      <div>
        <h1 className="mb-8 text-3xl font-bold">Shop by Category</h1>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group rounded-lg border bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 text-4xl text-primary">🏷️</div>
              <h2 className="text-xl font-bold transition-colors group-hover:text-primary">
                {category.name}
              </h2>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
