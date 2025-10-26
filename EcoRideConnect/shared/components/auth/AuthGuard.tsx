import React from 'react';
import { useAuth } from '@shared/hooks/useAuth';

export function AuthGuard({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return <>{fallback}</>;
  return <>{children}</>;
}

export default AuthGuard;
