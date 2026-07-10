import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';

const Home = lazy(() => import('../pages/Home'));
const About = lazy(() => import('../pages/About'));
const Services = lazy(() => import('../pages/Services'));
const ServiceDetail = lazy(() => import('../pages/ServiceDetail'));
const Gallery = lazy(() => import('../pages/Gallery'));
const Packages = lazy(() => import('../pages/Packages'));
const Testimonials = lazy(() => import('../pages/Testimonials'));
const Contact = lazy(() => import('../pages/Contact'));
const NotFound = lazy(() => import('../pages/NotFound'));

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="services">
          <Route index element={<Services />} />
          <Route path=":type" element={<ServiceDetail />} />
        </Route>
        <Route path="gallery" element={<Gallery />} />
        <Route path="packages" element={<Packages />} />
        <Route path="testimonials" element={<Testimonials />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};
