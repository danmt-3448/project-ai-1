import { useState } from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import Head from 'next/head'
import Image from 'next/image'
import { api } from '@/lib/api'
import { useCartStore } from '@/store/cartStore'

interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: number
  inventory: number
  images: string[]
  published: boolean
  category: {
    id: number
    name: string
    slug: string
  }
  createdAt: string
  updatedAt: string
}

export default function ProductDetail() {
  const router = useRouter()
  const { slug } = router.query
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const addItem = useCartStore((state) => state.addItem)

  const { data: product, error } = useSWR<Product>(
    slug ? `/api/products/${slug}` : null,
    () => api.getProduct(slug as string)
  )

  const handleAddToCart = () => {
    if (!product) return

    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.images[0],
        inventory: product.inventory,
      },
      quantity
    )

    // Show success message or redirect to cart
    router.push('/cart')
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Product Not Found</h1>
        <button
          onClick={() => router.push('/')}
          className="text-primary hover:underline"
        >
          Go back to home
        </button>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="animate-pulse">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-200 aspect-square rounded-lg"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  const isOutOfStock = product.inventory === 0
  const maxQuantity = Math.min(product.inventory, 10)

  return (
    <>
      <Head>
        <title>{product.name} - Mini Store</title>
        <meta name="description" content={product.description} />
      </Head>

      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm font-medium">
          <button onClick={() => router.push('/')} className="text-gray-700 hover:text-purple-600 transition-colors">
            Home
          </button>
          <span className="mx-3 text-gray-400">/</span>
          <button
            onClick={() => router.push(`/categories/${product.category.slug}`)}
            className="text-gray-700 hover:text-purple-600 transition-colors"
          >
            {product.category.name}
          </button>
          <span className="mx-3 text-gray-400">/</span>
          <span className="text-gray-900 font-bold">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden mb-4 shadow-xl border border-gray-200">
              <Image
                src={product.images[selectedImage] || '/images/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                  <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-xl shadow-2xl">
                    Hết hàng
                  </div>
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square bg-gray-50 rounded-xl overflow-hidden border-3 transition-all ${
                      selectedImage === index ? 'border-purple-600 shadow-lg scale-105' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-8">
            <div>
              <span className="inline-block text-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 font-bold uppercase tracking-wider mb-3 px-4 py-2 rounded-full shadow-md">
                {product.category.name}
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">{product.name}</h1>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  {product.price.toLocaleString('vi-VN')}₫
                </span>
                <span className="text-base font-semibold text-gray-700 bg-white px-3 py-1 rounded-full">
                  Còn {product.inventory} sản phẩm
                </span>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed text-lg">{product.description}</p>

            {!isOutOfStock && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="quantity" className="block text-base font-bold mb-3 text-gray-900">
                    Số lượng
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 rounded-xl bg-white border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50 flex items-center justify-center font-bold text-lg transition-all shadow-md disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      id="quantity"
                      type="number"
                      min="1"
                      max={maxQuantity}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.min(maxQuantity, Math.max(1, parseInt(e.target.value) || 1)))
                      }
                      className="w-24 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-md"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                      className="w-12 h-12 rounded-xl bg-white border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50 flex items-center justify-center font-bold text-lg transition-all shadow-md disabled:opacity-50"
                      disabled={quantity >= maxQuantity}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  🛒 Thêm vào giỏ hàng
                </button>
              </div>
            )}

            {isOutOfStock && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 text-red-700 px-6 py-4 rounded-xl font-bold text-center shadow-lg">
                ⚠️ Sản phẩm này hiện đang hết hàng
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
