import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const { status } = useAuth();

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  if (status === 'authenticated') {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
