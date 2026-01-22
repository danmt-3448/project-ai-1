import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cartStore';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto flex-grow px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
}

function Header() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 border-b-2 border-purple-100 bg-white shadow-lg">
      <nav className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="group">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg transition-transform group-hover:scale-110">
                <span className="text-xl font-bold text-white">M</span>
              </div>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-2xl font-extrabold text-transparent transition-transform group-hover:scale-105">
                Mini Store
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/"
              className={`flex items-center gap-3 rounded-xl px-6 py-3 text-lg font-extrabold transition-all ${
                router.pathname === '/'
                  ? 'scale-105 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white">
                <span className="text-2xl leading-none">🏠</span>
              </div>
              <span>Home</span>
            </Link>
            <Link
              href="/categories"
              className={`flex items-center gap-3 rounded-xl px-6 py-3 text-lg font-extrabold transition-all ${
                router.pathname.startsWith('/categories')
                  ? 'scale-105 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white">
                <span className="text-2xl leading-none">📂</span>
              </div>
              <span>Categories</span>
            </Link>
            <Link
              href="/cart"
              aria-label="View cart"
              className={`group flex items-center gap-4 rounded-xl px-6 py-3 text-lg font-extrabold transition-all ${
                router.pathname === '/cart'
                  ? 'scale-105 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl'
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              <div className="relative flex h-10 w-10 items-center justify-center">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white">
                  <span className="text-2xl leading-none">🛒</span>
                </div>
                <CartBadge />
              </div>

              <span className="ml-1">Cart</span>
            </Link>
            <Link
              href="/admin"
              className={`flex items-center gap-3 rounded-xl px-6 py-3 text-lg font-extrabold transition-all ${
                router.pathname.startsWith('/admin')
                  ? 'scale-105 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white">
                <span className="text-2xl leading-none">👤</span>
              </div>
              <span>Admin</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button className="rounded-xl p-3 transition-colors hover:bg-purple-50 md:hidden">
            <svg
              className="h-6 w-6 text-gray-700"
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
  );
}

function CartBadge({ small = false }: { small?: boolean }) {
  const total = useCartStore((s) => s.getTotalItems());
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(total > 0);
  }, [total]);

  if (!visible) return null;

  return (
    <span
      className={
        small
          ? 'absolute -right-0 -top-1 inline-flex animate-pulse items-center justify-center rounded-full bg-pink-600 px-1.5 py-0.5 text-xs font-bold leading-none text-white shadow-lg ring-1 ring-white'
          : 'absolute -right-3 -top-2 inline-flex animate-pulse items-center justify-center rounded-full bg-pink-600 px-2.5 py-1.5 text-sm font-bold leading-none text-white shadow-2xl ring-2 ring-white'
      }
    >
      {total}
    </span>
  );
}

function Footer() {
  return (
    <footer className="mt-auto border-t-2 border-purple-100 bg-gradient-to-r from-gray-50 to-gray-100">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="font-medium text-gray-700">
            © {new Date().getFullYear()} Mini Store. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/about"
              className="font-semibold text-gray-700 transition-colors hover:text-purple-600"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="font-semibold text-gray-700 transition-colors hover:text-purple-600"
            >
              Contact
            </Link>
            <Link href="/terms" className="text-sm text-gray-600 hover:text-primary">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
