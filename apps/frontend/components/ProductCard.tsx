import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: number
  inventory: number
  images: string[]
  category?: {
    id: number
    name: string
    slug: string
  }
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0] || '/images/placeholder.jpg'
  const isOutOfStock = product.inventory === 0

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary/30 h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            unoptimized
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold text-sm">
                Hết hàng
              </div>
            </div>
          )}
          {!isOutOfStock && product.inventory < 5 && (
            <div className="absolute top-3 right-3">
              <span className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                Còn {product.inventory}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          {product.category && (
            <span className="inline-block text-xs font-medium text-primary uppercase tracking-wider mb-2 px-2 py-1 bg-primary/5 rounded w-fit">
              {product.category.name}
            </span>
          )}
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors text-lg leading-snug">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{product.description}</p>
          
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-primary">
                {product.price.toLocaleString('vi-VN')}₫
              </span>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {product.inventory} sản phẩm
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
