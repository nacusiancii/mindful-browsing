import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import './index.css';
import Onboarding from './pages/onboarding';

const router = createBrowserRouter([
  { path: '/onboarding', element: <Onboarding /> },
  { path: '/', element: <Navigate to='/onboarding'/>}
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
