import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute, PermissionRoute } from '../components/ProtectedRoute';

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
          <Route index element={<PermissionRoute moduleName="Dashboard" element={<AdminDashboard />} />} />
          <Route path="inquiries" element={<PermissionRoute moduleName="Inquiries" element={<AdminInquiries />} />} />
          <Route path="bookings" element={<PermissionRoute moduleName="Bookings" element={<AdminBookings />} />} />
          <Route path="calendar" element={<PermissionRoute moduleName="Calendar" element={<AdminCalendar />} />} />
          <Route path="gallery" element={<PermissionRoute moduleName="Blog" element={<AdminGallery />} />} />
          <Route path="packages" element={<PermissionRoute moduleName="Settings" element={<AdminPackages />} />} />
          <Route path="testimonials" element={<PermissionRoute moduleName="Blog" element={<AdminTestimonials />} />} />
          <Route path="team" element={<PermissionRoute moduleName="Team" element={<AdminTeam />} />} />
          <Route path="blog" element={<PermissionRoute moduleName="Blog" element={<AdminBlog />} />} />
          <Route path="payments" element={<PermissionRoute moduleName="Payments" element={<AdminPayments />} />} />
          <Route path="users" element={<PermissionRoute moduleName="Users" element={<AdminUsers />} />} />
          <Route path="settings" element={<PermissionRoute moduleName="Settings" element={<AdminSettings />} />} />
          <Route path="clients" element={<PermissionRoute moduleName="Clients" element={<AdminClients />} />} />
          <Route path="vendors" element={<PermissionRoute moduleName="Vendors" element={<AdminVendors />} />} />
          <Route path="analytics" element={<PermissionRoute moduleName="Reports" element={<AdminAnalytics />} />} />
          <Route path="reports" element={<PermissionRoute moduleName="Reports" element={<AdminReports />} />} />
          <Route path="activity" element={<PermissionRoute moduleName="Users" element={<AdminActivityLogs />} />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="*" element={<div className="flex items-center justify-center h-64 text-gray-400 text-lg font-medium">404 — Page Not Found</div>} />
        </Route>
      </Route>
    </Routes>
  );
};
