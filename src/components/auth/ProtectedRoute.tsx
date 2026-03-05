import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/data/authUsers';

interface RequireAuthProps {
  children: ReactNode;
}

interface RequireRoleProps {
  roles: UserRole[];
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const isAuthorPath = location.pathname.startsWith('/dashboard/author');
    return <Navigate to={isAuthorPath ? '/login' : '/admin-login'} replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export function RequireRole({ roles, children }: RequireRoleProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const needsAuthorLogin = roles.includes('author');
    return <Navigate to={needsAuthorLogin ? '/login' : '/admin-login'} replace state={{ from: location.pathname }} />;
  }

  if (!roles.includes(user.role)) {
    if (user.role === 'author') {
      return <Navigate to="/dashboard/author" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
