import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import './index.css';
import IntentionCheck from './pages/intention-check';
import MindfulPause from './pages/mindful-pause';

const router = createBrowserRouter([
  { path: '/mindful-pause', element: <MindfulPause /> },
  { path: '/', element: <Navigate to='/mindful-pause' />},
  { path: '/intention-check', element: <IntentionCheck />}
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);

