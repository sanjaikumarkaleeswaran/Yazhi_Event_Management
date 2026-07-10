const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// Define new directory structure
const dirs = [
  'publicApp/assets',
  'publicApp/components/common',
  'publicApp/components/layout',
  'publicApp/components/ui',
  'publicApp/components/animated',
  'publicApp/hooks',
  'publicApp/layouts',
  'publicApp/pages',
  'publicApp/routes',
  'publicApp/context',
  'publicApp/styles',
  'publicApp/services',
  'adminApp/assets',
  'adminApp/components',
  'adminApp/hooks',
  'adminApp/layouts',
  'adminApp/pages',
  'adminApp/routes',
  'adminApp/context',
  'adminApp/styles',
  'adminApp/services',
  'shared/api',
  'shared/constants',
  'shared/hooks',
  'shared/services',
  'shared/types',
  'shared/utils',
  'shared/validation',
  'shared/config',
  'shared/components'
];

dirs.forEach(d => {
  fs.mkdirSync(path.join(srcDir, d), { recursive: true });
});

// Define mapping of old paths to new paths (relative to src/)
const fileMapping = {
  // Public Pages
  'pages/Home.tsx': 'publicApp/pages/Home.tsx',
  'pages/About.tsx': 'publicApp/pages/About.tsx',
  'pages/Services.tsx': 'publicApp/pages/Services.tsx',
  'pages/ServiceDetail.tsx': 'publicApp/pages/ServiceDetail.tsx',
  'pages/Gallery.tsx': 'publicApp/pages/Gallery.tsx',
  'pages/Packages.tsx': 'publicApp/pages/Packages.tsx',
  'pages/Testimonials.tsx': 'publicApp/pages/Testimonials.tsx',
  'pages/Contact.tsx': 'publicApp/pages/Contact.tsx',
  'pages/NotFound.tsx': 'publicApp/pages/NotFound.tsx',
  
  // Login (let's keep one Login for admin, or separate? Prompt says /admin/login. Let's move Login to adminApp/pages for now, or public? The prompt says "Redirect unauthorized users to /admin/login". I'll put it in adminApp/pages/Login.tsx)
  'pages/Login.tsx': 'adminApp/pages/Login.tsx',

  // Admin Pages
  'pages/admin/Blog.tsx': 'adminApp/pages/Blog.tsx',
  'pages/admin/Bookings.tsx': 'adminApp/pages/Bookings.tsx',
  'pages/admin/Calendar.tsx': 'adminApp/pages/Calendar.tsx',
  'pages/admin/Dashboard.tsx': 'adminApp/pages/Dashboard.tsx',
  'pages/admin/Gallery.tsx': 'adminApp/pages/Gallery.tsx',
  'pages/admin/Inquiries.tsx': 'adminApp/pages/Inquiries.tsx',
  'pages/admin/Packages.tsx': 'adminApp/pages/Packages.tsx',
  'pages/admin/Payments.tsx': 'adminApp/pages/Payments.tsx',
  'pages/admin/Settings.tsx': 'adminApp/pages/Settings.tsx',
  'pages/admin/Team.tsx': 'adminApp/pages/Team.tsx',
  'pages/admin/Testimonials.tsx': 'adminApp/pages/Testimonials.tsx',
  'pages/admin/Users.tsx': 'adminApp/pages/Users.tsx',

  // Components - Public
  'components/layout/Header.tsx': 'publicApp/components/layout/Header.tsx',
  'components/layout/Footer.tsx': 'publicApp/components/layout/Footer.tsx',
  'components/layout/MainLayout.tsx': 'publicApp/layouts/PublicLayout.tsx',
  'components/layout/Navigation.tsx': 'publicApp/components/layout/Navigation.tsx',
  'components/layout/Container.tsx': 'publicApp/components/layout/Container.tsx',
  'components/layout/Section.tsx': 'publicApp/components/layout/Section.tsx',
  'components/animated/ScrollReveal.tsx': 'publicApp/components/animated/ScrollReveal.tsx',
  'components/animated/TextReveal.tsx': 'publicApp/components/animated/TextReveal.tsx',
  'components/ui/Button.tsx': 'publicApp/components/ui/Button.tsx',
  'components/ui/Card.tsx': 'publicApp/components/ui/Card.tsx',
  'components/common/SEO.tsx': 'shared/components/SEO.tsx', // SEO can be shared, but mostly public
  'components/common/ErrorBoundary.tsx': 'shared/components/ErrorBoundary.tsx',

  // Components - Admin
  'components/layout/AdminLayout.tsx': 'adminApp/layouts/AdminLayout.tsx',
  'components/layout/ProtectedRoute.tsx': 'adminApp/components/ProtectedRoute.tsx',

  // Shared
  'context/AuthContext.tsx': 'shared/context/AuthContext.tsx',
  'api/axios.ts': 'shared/api/axios.ts',
  'hooks/useGallery.ts': 'shared/hooks/useGallery.ts',
  'hooks/usePackages.ts': 'shared/hooks/usePackages.ts',
  'hooks/useSubmitInquiry.ts': 'shared/hooks/useSubmitInquiry.ts',
  'hooks/useTeam.ts': 'shared/hooks/useTeam.ts',
  'hooks/useTestimonials.ts': 'shared/hooks/useTestimonials.ts',

  // Styles
  'styles/luxury.css': 'publicApp/styles/luxury.css',
  'styles/admin.css': 'adminApp/styles/admin.css',
  
  // Assets
  'assets/hero.png': 'publicApp/assets/hero.png',
  'assets/react.svg': 'shared/assets/react.svg',
  'assets/vite.svg': 'shared/assets/vite.svg'
};

// Step 1: Move files
const movedFiles = [];
for (const [oldPath, newPath] of Object.entries(fileMapping)) {
  const oldFullPath = path.join(srcDir, oldPath);
  const newFullPath = path.join(srcDir, newPath);
  if (fs.existsSync(oldFullPath)) {
    // Ensure dir exists
    fs.mkdirSync(path.dirname(newFullPath), { recursive: true });
    fs.renameSync(oldFullPath, newFullPath);
    movedFiles.push({ old: oldPath, new: newPath });
  }
}

console.log("Moved", movedFiles.length, "files.");

// We will fix imports in another step or inside App/Routes manually.
// For now, let's output a success.
