import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import React from 'react';
import './index.css';
import App from './App.jsx';
import Login from './pages/auth/index';
import Home from './pages/home';
import ErrorPage from './components/ui/error';
import HomeRegister from './pages/register';
import CadastroNotebook from './pages/register/notebook';
import CadastroToner from './pages/register/toner';
import CadastroImpressora from './pages/register/impressora';
import CadastroTablet from './pages/register/tablet';
import VisualizarNotebooks from './pages/views/notebooks';
import HomeViews from './pages/views';
import VisualizacaoTablet from './pages/views/tablets';
import ConsultaToners from './pages/views/toners';
import VisualizacaoImpressoras from './pages/views/impressora/index.jsx';
import RegistroUser from './pages/auth/register_auth';
import CadastroMobiliario from './pages/register/mobiliario';
import VisualizarMobiliario from './pages/views/mobiliario';
import CadastroCamera from './pages/register/camera';
import VisualizarCamera from './pages/views/camera';
import CadastroFones from './pages/register/fones';
import VisualizarFones from './pages/views/fones';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { path: '/', element: <Login /> },
      { path: '/Home', element: <Home /> },
      // Registers
      { path: '/register-option', element: <HomeRegister />},
      { path: '/register-notebook', element: <CadastroNotebook />},
      { path: '/register-toner', element: <CadastroToner />},
      { path: '/register-impressora', element: <CadastroImpressora />},
      { path: '/register-tablet', element: <CadastroTablet />},
      { path: '/views-notebooks', element: <VisualizarNotebooks />},
      { path: '/views', element: <HomeViews />},
      { path: '/views-tablet', element: <VisualizacaoTablet />},
      { path: '/views-toners', element: <ConsultaToners />},
      { path: '/views-impressora', element: <VisualizacaoImpressoras />},
      { path: '/register-user', element: <RegistroUser />},
      { path: '/register-mobiliaria', element: <CadastroMobiliario />},
      { path: '/view-mobiliaria', element: <VisualizarMobiliario />},
      { path: '/register-camera', element: <CadastroCamera />},
      { path: '/views-camera', element: <VisualizarCamera />},
      { path: '/register-fone', element: <CadastroFones />},
      { path: '/view-fone', element: <VisualizarFones />}

    ],
  },
]);
createRoot(document.getElementById('root')).render( <StrictMode> <RouterProvider router={router} /> </StrictMode>);
