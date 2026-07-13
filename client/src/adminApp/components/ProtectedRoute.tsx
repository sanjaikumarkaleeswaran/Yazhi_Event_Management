import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import type { ReactElement } from 'react';

const ADMIN_COMPATIBLE_ROLES = ['Super Admin', 'Admin', 'Manager', 'Coordinator', 'Employee'];

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#C89B3C] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-[#C89B3C] font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !ADMIN_COMPATIBLE_ROLES.includes(user?.role || '')) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

interface PermissionRouteProps {
  moduleName: string;
  action?: 'view' | 'create' | 'edit' | 'delete' | 'export' | 'approve' | 'assign';
  element: ReactElement;
}

export const PermissionRoute = ({ moduleName, action = 'view', element }: PermissionRouteProps) => {
  const { hasPermission, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-[#C89B3C]">
        Loading permissions...
      </div>
    );
  }

  const allowed = hasPermission(moduleName, action);

  if (!allowed) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Access Restricted</h2>
        <p className="text-sm text-gray-500 mt-1 max-w-sm">You do not possess the required module permission level to view this administration page.</p>
      </div>
    );
  }

  return element;
};
