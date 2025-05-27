import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import './index.css';
import App from './App.jsx';
import Home from './pages/home/index.jsx';
import Login from './pages/auth/index.jsx';
import ErrorPage from './components/ui/error/index.jsx';
import HomeRegister from './pages/register/index.jsx';
import CadastroToner from "./pages/register/toner/index.jsx";
import PrivateRoutes from './routes/PrivateRoutes';
import CadastroImpressora from './pages/register/impressora';
import CadastroTablet from './pages/register/tablet';
import CadastroNotebook from './pages/register/notebook/index.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <PrivateRoutes />, // rotas protegidas
    children: [
      {
        path: '/',
        element: <App />, // App com Outlet + layout
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
            path: '/register-option',
            element: <HomeRegister />
          },
          {
            path: '/register-notebook',
            element: <CadastroNotebook />
          },
          {
            path: '/register-toner',
            element: <CadastroToner />
          },
          {
            path: '/register-impressora',
            element: <CadastroImpressora />
          },
          {
            path: '/register-tablet',
            element: <CadastroTablet />
          },
        ]
      }
    ],
    errorElement: <ErrorPage />,
  },
  {
    path: '/login', // rota pública
    element: <Login />,
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
