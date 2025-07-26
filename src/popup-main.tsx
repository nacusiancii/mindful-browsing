import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import './index.css';
import Popup from './pages/popup';

const router = createBrowserRouter([
  { path: '/popup', element: <Popup /> },
  { path: '/', element: <Navigate to='/popup'/>}
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
