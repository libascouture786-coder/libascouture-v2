import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Loader } from '@/components/layout/Loader';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-950">
        <Loader />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
