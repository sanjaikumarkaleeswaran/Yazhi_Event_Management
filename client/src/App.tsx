import { BrowserRouter } from 'react-router-dom';
import { Suspense } from 'react';
import { AppRoutes } from './routes';

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex h-screen items-center justify-center text-primary">Loading...</div>}>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
