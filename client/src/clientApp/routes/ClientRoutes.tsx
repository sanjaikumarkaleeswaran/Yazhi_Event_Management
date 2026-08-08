import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ClientLayout } from '../layouts/ClientLayout';
import { ClientProtectedRoute } from '../components/ClientProtectedRoute';

const ClientLogin = lazy(() => import('../pages/ClientLogin'));
const ClientPassword = lazy(() => import('../pages/ClientPassword'));
const ClientDashboard = lazy(() => import('../pages/ClientDashboard'));
const ClientBookings = lazy(() => import('../pages/ClientBookings'));
const ClientProfile = lazy(() => import('../pages/ClientProfile'));
const BookingDetails = lazy(() => import('../pages/BookingDetails'));
const Calendar = lazy(() => import('../pages/Calendar'));
const Documents = lazy(() => import('../pages/Documents'));
const Notifications = lazy(() => import('../pages/Notifications'));
const Messages = lazy(() => import('../pages/Messages'));
const ClientSettings = lazy(() => import('../pages/ClientSettings'));

export const ClientRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<ClientLogin />} />
      <Route path="/forgot-password" element={<ClientPassword mode="forgot" />} />
      <Route path="/reset-password" element={<ClientPassword mode="reset" />} />

      <Route element={<ClientProtectedRoute />}>
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<ClientDashboard />} />
          <Route path="bookings" element={<ClientBookings />} />
          <Route path="bookings/:id" element={<BookingDetails />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="documents" element={<Documents />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="messages" element={<Messages />} />
          <Route path="profile" element={<ClientProfile />} />
          <Route path="settings" element={<ClientSettings />} />
          <Route path="*" element={<div className="flex items-center justify-center h-64 text-gray-400 text-lg font-medium">404 — Page Not Found</div>} />
        </Route>
      </Route>
    </Routes>
  );
};
