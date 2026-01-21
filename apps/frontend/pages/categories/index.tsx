import useSWR from 'swr'
import Head from 'next/head'
import Link from 'next/link'
import { api } from '@/lib/api'

interface Category {
  id: number
  name: string
  slug: string
}

export default function Categories() {
  const { data: categories, error } = useSWR<Category[]>('/api/categories', () =>
    api.getCategories()
  )

  if (error) {
    return (
      <>
        <Head>
          <title>Categories - Mini Store</title>
        </Head>
        <div className="text-center py-12 text-red-500">Failed to load categories</div>
      </>
    )
  }

  if (!categories) {
    return (
      <>
        <Head>
          <title>Categories - Mini Store</title>
        </Head>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Categories - Mini Store</title>
        <meta name="description" content="Browse products by category" />
      </Head>

      <div>
        <h1 className="text-3xl font-bold mb-8">Shop by Category</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border p-6 text-center"
            >
              <div className="mb-4 text-primary text-4xl">🏷️</div>
              <h2 className="text-xl font-bold group-hover:text-primary transition-colors">
                {category.name}
              </h2>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
