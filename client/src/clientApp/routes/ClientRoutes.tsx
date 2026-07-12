import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ClientLayout } from '../layouts/ClientLayout';
import { ClientProtectedRoute } from '../components/ClientProtectedRoute';

const ClientLogin = lazy(() => import('../pages/ClientLogin'));
const ClientDashboard = lazy(() => import('../pages/ClientDashboard'));
const ClientBookings = lazy(() => import('../pages/ClientBookings'));
const ClientProfile = lazy(() => import('../pages/ClientProfile'));

export const ClientRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<ClientLogin />} />

      <Route element={<ClientProtectedRoute />}>
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<ClientDashboard />} />
          <Route path="bookings" element={<ClientBookings />} />
          <Route path="profile" element={<ClientProfile />} />
          <Route path="*" element={<div className="flex items-center justify-center h-64 text-gray-400 text-lg font-medium">404 — Page Not Found</div>} />
        </Route>
      </Route>
    </Routes>
  );
};
