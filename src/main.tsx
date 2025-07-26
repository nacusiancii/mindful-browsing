import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import Popup from './pages/popup';
import Options from './pages/options';
import Onboarding from './pages/onboarding';
import IntentionCheck from './pages/intention-check';
import MindfulPause from './pages/mindful-pause';

const router = createBrowserRouter([
  { path: '/', element: <Popup /> },
  { path: '/options', element: <Options /> },
  { path: '/onboarding', element: <Onboarding /> },
  { path: '/intention-check', element: <IntentionCheck /> },
  { path: '/mindful-pause', element: <MindfulPause /> },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
