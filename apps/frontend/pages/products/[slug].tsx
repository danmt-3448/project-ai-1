import { useState } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Head from 'next/head';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  inventory: number;
  images: string[];
  published: boolean;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ProductDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore((state) => state.addItem);

  const { data: product, error } = useSWR<Product>(
    slug ? `/api/products/${slug}` : null,
    (() => api.getProduct(slug as string)) as any
  );

  const handleAddToCart = () => {
    if (!product) return;

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
    );

    // Show success message or redirect to cart
    router.push('/cart');
  };

  if (error) {
    return (
      <div className="py-12 text-center">
        <h1 className="mb-4 text-2xl font-bold text-red-500">Product Not Found</h1>
        <button onClick={() => router.push('/')} className="text-primary hover:underline">
          Go back to home
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="animate-pulse">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square rounded-lg bg-gray-200"></div>
          <div className="space-y-4">
            <div className="h-8 w-3/4 rounded bg-gray-200"></div>
            <div className="h-6 w-1/4 rounded bg-gray-200"></div>
            <div className="h-20 rounded bg-gray-200"></div>
            <div className="h-12 w-1/2 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.inventory === 0;
  const maxQuantity = Math.min(product.inventory, 10);

  return (
    <>
      <Head>
        <title>{product.name} - Mini Store</title>
        <meta name="description" content={product.description} />
      </Head>

      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm font-medium">
          <button
            onClick={() => router.push('/')}
            className="text-gray-700 transition-colors hover:text-purple-600"
          >
            Home
          </button>
          <span className="mx-3 text-gray-400">/</span>
          <button
            onClick={() => router.push(`/categories/${product.category.slug}`)}
            className="text-gray-700 transition-colors hover:text-purple-600"
          >
            {product.category.name}
          </button>
          <span className="mx-3 text-gray-400">/</span>
          <span className="font-bold text-gray-900">{product.name}</span>
        </nav>

        <div className="grid gap-12 md:grid-cols-2">
          {/* Images */}
          <div>
            <div className="relative mb-4 aspect-square overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 shadow-xl">
              <Image
                src={product.images[selectedImage] || '/images/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                  <div className="rounded-full bg-red-500 px-6 py-3 text-xl font-bold text-white shadow-2xl">
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
                    className={`border-3 relative aspect-square overflow-hidden rounded-xl bg-gray-50 transition-all ${
                      selectedImage === index
                        ? 'scale-105 border-purple-600 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
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
              <span className="mb-3 inline-block rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-md">
                {product.category.name}
              </span>
              <h1 className="text-4xl font-extrabold leading-tight text-gray-900 md:text-5xl">
                {product.name}
              </h1>
            </div>

            <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6">
              <div className="flex items-baseline gap-3">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-4xl font-extrabold text-transparent">
                  {product.price.toLocaleString('vi-VN')}₫
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-base font-semibold text-gray-700">
                  Còn {product.inventory} sản phẩm
                </span>
              </div>
            </div>

            <p className="text-lg leading-relaxed text-gray-700">{product.description}</p>

            {!isOutOfStock && (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="quantity"
                    className="mb-3 block text-base font-bold text-gray-900"
                  >
                    Số lượng
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-gray-300 bg-white text-lg font-bold shadow-md transition-all hover:border-purple-500 hover:bg-purple-50 disabled:opacity-50"
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
                        setQuantity(
                          Math.min(maxQuantity, Math.max(1, parseInt(e.target.value) || 1))
                        )
                      }
                      className="h-12 w-24 rounded-xl border-2 border-gray-300 text-center text-xl font-bold shadow-md focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                      className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-gray-300 bg-white text-lg font-bold shadow-md transition-all hover:border-purple-500 hover:bg-purple-50 disabled:opacity-50"
                      disabled={quantity >= maxQuantity}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-lg font-bold text-white shadow-xl transition-all hover:scale-105 hover:from-purple-700 hover:to-pink-700 hover:shadow-2xl"
                >
                  🛒 Thêm vào giỏ hàng
                </button>
              </div>
            )}

            {isOutOfStock && (
              <div className="rounded-xl border-2 border-red-300 bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 text-center font-bold text-red-700 shadow-lg">
                ⚠️ Sản phẩm này hiện đang hết hàng
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
