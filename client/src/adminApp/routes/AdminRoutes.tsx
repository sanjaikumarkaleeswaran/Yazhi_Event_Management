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
const AdminClients = lazy(() => import('../pages/Clients'));
const AdminVendors = lazy(() => import('../pages/Vendors'));
const AdminAnalytics = lazy(() => import('../pages/Analytics'));
const AdminActivityLogs = lazy(() => import('../pages/ActivityLogs'));
const AdminProfile = lazy(() => import('../pages/Profile'));
const AdminReports = lazy(() => import('../pages/Reports'));

export const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

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
          <Route path="clients" element={<AdminClients />} />
          <Route path="vendors" element={<AdminVendors />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="activity" element={<AdminActivityLogs />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="*" element={<div className="flex items-center justify-center h-64 text-gray-400 text-lg font-medium">404 — Page Not Found</div>} />
        </Route>
      </Route>
    </Routes>
  );
};
