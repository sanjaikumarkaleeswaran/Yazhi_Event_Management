import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';

const Login = lazy(() => import('../pages/Login'));
const AdminDashboard = lazy(() => import('../pages/Dashboard'));
const AdminInquiries = lazy(() => import('../pages/Inquiries'));
const AdminBookings = lazy(() => import('../pages/Bookings'));
const AdminCalendar = lazy(() => import('../pages/Calendar'));
const AdminGallery = lazy(() => import('../pages/Gallery'));
const AdminPackages = lazy(() => import('../pages/Packages'));
const AdminTestimonials = lazy(() => import('../pages/Testimonials'));
const AdminTeam = lazy(() => import('../pages/Team'));
const AdminBlog = lazy(() => import('../pages/Blog'));
const AdminPayments = lazy(() => import('../pages/Payments'));
const AdminUsers = lazy(() => import('../pages/Users'));
const AdminSettings = lazy(() => import('../pages/Settings'));

export const AdminRoutes = () => {
  return (
    <Routes>
      {/* Admin Login is not protected */}
      <Route path="/login" element={<Login />} />

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="inquiries" element={<AdminInquiries />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="calendar" element={<AdminCalendar />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="packages" element={<AdminPackages />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="team" element={<AdminTeam />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="*" element={<div className="p-8 text-center text-gray-500">404 - Admin Page Not Found</div>} />
        </Route>
      </Route>
    </Routes>
  );
};
