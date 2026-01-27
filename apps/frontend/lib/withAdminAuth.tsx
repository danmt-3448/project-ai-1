import { useEffect } from 'react';
import { useRouter } from 'next/router';

export function withAdminAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function AdminAuthWrapper(props: P) {
    const router = useRouter();
    useEffect(() => {
      const token = localStorage.getItem('adminToken');
      if (!token && router.pathname !== '/admin') {
        router.replace('/admin');
      } else if (token && router.pathname === '/admin') {
        router.replace('/admin/dashboard');
      }
      // else: do nothing (already at correct page)
    }, [router]);
    return <WrappedComponent {...props} />;
  };
}
