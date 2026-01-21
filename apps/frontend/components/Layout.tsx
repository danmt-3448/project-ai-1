import Link from 'next/link'
import { useRouter } from 'next/router'
import { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/store/cartStore'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
      <Footer />
    </div>
  )
}

function Header() {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-50 bg-white shadow-lg border-b-2 border-purple-100">
      <nav className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                Mini Store
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/"
              className={`px-6 py-3 rounded-xl font-extrabold text-lg transition-all flex items-center gap-3 ${
                router.pathname === '/' 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105' 
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >


               <div className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <span className="text-2xl leading-none">🏠</span>
                </div>
              <span>Home</span>
            </Link>
            <Link
              href="/categories"
              className={`px-6 py-3 rounded-xl font-extrabold text-lg transition-all flex items-center gap-3 ${
                router.pathname.startsWith('/categories')
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >

                     <div className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <span className="text-2xl leading-none">📂</span>
                </div>
              <span>Categories</span>
            </Link>
            <Link
              href="/cart"
              aria-label="View cart"
              className={`group px-6 py-3 rounded-xl font-extrabold text-lg transition-all flex items-center gap-4 ${
                router.pathname === '/cart'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl scale-105'
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <span className="text-2xl leading-none">🛒</span>
                </div>
                <CartBadge />
              </div>

              <span className="ml-1">Cart</span>
            </Link>
            <Link
              href="/admin"
              className={`px-6 py-3 rounded-xl font-extrabold text-lg transition-all flex items-center gap-3 ${
                router.pathname.startsWith('/admin')
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >

              <div className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <span className="text-2xl leading-none">👤</span>
                </div>
              <span>Admin</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-3 rounded-xl hover:bg-purple-50 transition-colors">
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  )
}

function CartBadge({ small = false }: { small?: boolean }) {
  const total = useCartStore((s) => s.getTotalItems())
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(total > 0)
  }, [total])

  if (!visible) return null

  return (
    <span
      className={
        small
          ? 'absolute -top-1 -right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-pink-600 rounded-full shadow-lg animate-pulse ring-1 ring-white'
          : 'absolute -top-2 -right-3 inline-flex items-center justify-center px-2.5 py-1.5 text-sm font-bold leading-none text-white bg-pink-600 rounded-full shadow-2xl animate-pulse ring-2 ring-white'
      }
    >
      {total}
    </span>
  )
}

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-purple-100 mt-auto">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-700 font-medium">
            © {new Date().getFullYear()} Mini Store. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/about" className="text-gray-700 hover:text-purple-600 font-semibold transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-purple-600 font-semibold transition-colors">
              Contact
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-primary text-sm">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
