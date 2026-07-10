const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function replaceInFile(filePath, replacements) {
  const fullPath = path.join(srcDir, filePath);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  replacements.forEach(r => {
    content = content.replace(r.search, r.replace);
  });
  fs.writeFileSync(fullPath, content);
}

// Admin App
replaceInFile('adminApp/components/ProtectedRoute.tsx', [
  { search: /'\.\.\/\.\.\/context\/AuthContext'/g, replace: "'../../shared/context/AuthContext'" }
]);

replaceInFile('adminApp/layouts/AdminLayout.tsx', [
  { search: /'\.\.\/\.\.\/context\/AuthContext'/g, replace: "'../../shared/context/AuthContext'" }
]);

replaceInFile('adminApp/pages/Dashboard.tsx', [
  { search: /'\.\.\/\.\.\/context\/AuthContext'/g, replace: "'../../shared/context/AuthContext'" },
  { search: /'\.\.\/\.\.\/components\/common\/SEO'/g, replace: "'../../shared/components/SEO'" }
]);

replaceInFile('adminApp/pages/Login.tsx', [
  { search: /'\.\.\/context\/AuthContext'/g, replace: "'../../shared/context/AuthContext'" },
  { search: /'\.\.\/components\/common\/SEO'/g, replace: "'../../shared/components/SEO'" }
]);

// Public App
replaceInFile('publicApp/layouts/PublicLayout.tsx', [
  // Was components/layout/MainLayout.tsx
  { search: /export const MainLayout/g, replace: 'export const PublicLayout' }
]);

replaceInFile('publicApp/routes/PublicRoutes.tsx', [
  { search: /import \{ PublicLayout \} from '\.\.\/layouts\/PublicLayout'/g, replace: "import { PublicLayout } from '../layouts/PublicLayout'" }
]);

replaceInFile('publicApp/pages/Home.tsx', [
  { search: /'\.\.\/components\/common\/SEO'/g, replace: "'../../shared/components/SEO'" },
  { search: /'\.\.\/hooks\/useGallery'/g, replace: "'../../shared/hooks/useGallery'" }
]);

replaceInFile('publicApp/pages/About.tsx', [
  { search: /'\.\.\/components\/common\/SEO'/g, replace: "'../../shared/components/SEO'" },
  { search: /'\.\.\/components\/layout\/Section'/g, replace: "'../components/layout/Section'" },
  { search: /'\.\.\/components\/layout\/Container'/g, replace: "'../components/layout/Container'" }
]);

replaceInFile('publicApp/pages/Services.tsx', [
  { search: /'\.\.\/components\/common\/SEO'/g, replace: "'../../shared/components/SEO'" }
]);

replaceInFile('publicApp/pages/ServiceDetail.tsx', [
  { search: /'\.\.\/components\/common\/SEO'/g, replace: "'../../shared/components/SEO'" }
]);

replaceInFile('publicApp/pages/Gallery.tsx', [
  { search: /'\.\.\/components\/common\/SEO'/g, replace: "'../../shared/components/SEO'" },
  { search: /'\.\.\/hooks\/useGallery'/g, replace: "'../../shared/hooks/useGallery'" }
]);

replaceInFile('publicApp/pages/Packages.tsx', [
  { search: /'\.\.\/components\/common\/SEO'/g, replace: "'../../shared/components/SEO'" },
  { search: /'\.\.\/hooks\/usePackages'/g, replace: "'../../shared/hooks/usePackages'" }
]);

replaceInFile('publicApp/pages/Testimonials.tsx', [
  { search: /'\.\.\/components\/common\/SEO'/g, replace: "'../../shared/components/SEO'" },
  { search: /'\.\.\/hooks\/useTestimonials'/g, replace: "'../../shared/hooks/useTestimonials'" }
]);

replaceInFile('publicApp/pages/Contact.tsx', [
  { search: /'\.\.\/components\/common\/SEO'/g, replace: "'../../shared/components/SEO'" },
  { search: /'\.\.\/hooks\/useSubmitInquiry'/g, replace: "'../../shared/hooks/useSubmitInquiry'" }
]);

replaceInFile('publicApp/pages/NotFound.tsx', [
  { search: /'\.\.\/components\/common\/SEO'/g, replace: "'../../shared/components/SEO'" }
]);

// Shared App
replaceInFile('shared/hooks/useSubmitInquiry.ts', [
  { search: /'\.\.\/api\/axios'/g, replace: "'../api/axios'" } // wait, this was 'hooks/useSubmitInquiry.ts' calling '../api/axios', which is now '../api/axios'. No change needed.
]);

console.log("Fixes applied");
