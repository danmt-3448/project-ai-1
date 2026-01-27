import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product as ApiProduct } from '@/types';

interface ProductCardProps {
  product: ApiProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0] || '/images/placeholder.jpg';
  const isOutOfStock = product.inventory === 0;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:border-primary/30 hover:shadow-xl">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            unoptimized
          />
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white">
                Hết hàng
              </div>
            </div>
          )}
          {!isOutOfStock && product.inventory < 5 && (
            <div className="absolute right-3 top-3">
              <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                Còn {product.inventory}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-5">
          {product.category && (
            <span className="mb-2 inline-block w-fit rounded bg-primary/5 px-2 py-1 text-xs font-medium uppercase tracking-wider text-primary">
              {product.category.name}
            </span>
          )}
          <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-primary">
            {product.name}
          </h3>
          <p className="mb-4 line-clamp-2 flex-1 text-sm text-gray-600">{product.description}</p>

          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-primary">
                {product.price.toLocaleString('vi-VN')}₫
              </span>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                {product.inventory} sản phẩm
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
