import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';

export const ClientProtectedRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-primary font-heading">Loading...</p>
        </div>
      </div>
    );
  }

  // Ensure they are authenticated and are a client
  if (!isAuthenticated || user?.role !== 'client') {
    return <Navigate to="/client/login" replace />;
  }

  return <Outlet />;
};
