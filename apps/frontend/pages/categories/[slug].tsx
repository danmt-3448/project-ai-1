import { useRouter } from 'next/router'
import useSWR from 'swr'
import Head from 'next/head'
import Link from 'next/link'
import { api } from '@/lib/api'
import ProductCard from '@/components/ProductCard'

interface CategoryProductsResponse {
  category: {
    id: number
    name: string
    slug: string
  }
  products: Array<{
    id: number
    name: string
    slug: string
    description: string
    price: number
    inventory: number
    images: string[]
    category: {
      id: number
      name: string
      slug: string
    }
  }>
}

export default function CategoryProducts() {
  const router = useRouter()
  const { slug } = router.query

  const { data, error } = useSWR<CategoryProductsResponse>(
    slug ? `/api/categories/${slug}/products` : null,
    () => api.getCategoryProducts(slug as string)
  )

  if (error) {
    return (
      <>
        <Head>
          <title>Category Not Found - Mini Store</title>
        </Head>

        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Category Not Found</h1>
          <Link href="/categories" className="text-primary hover:underline">
            Browse all categories
          </Link>
        </div>
      </>
    )
  }

  if (!data) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
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

        <h1 className="text-3xl font-bold mb-8">{data.category.name}</h1>

        {data.products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-4">No products found in this category</p>
            <Link
              href="/categories"
              className="inline-block text-primary hover:underline"
            >
              Browse other categories
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">{data.products.length} products found</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
