import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { PublicRoutes } from './publicApp/routes/PublicRoutes';
import { AdminRoutes } from './adminApp/routes/AdminRoutes';

function App() {
  return (
    <Router>
      <Suspense fallback={<div className="flex h-screen items-center justify-center text-[#C89B3C]">Loading...</div>}>
        <Routes>
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/*" element={<PublicRoutes />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
