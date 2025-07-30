import React, { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import './index.css'
import CamisetasCadastro from './pages/register/t-shirt'
import DashboardChamados from './pages/listachamados/dashboard'
import ChatChamado from './pages/listachamados/chatChamado'

const App = lazy(() => import('./App.jsx'))
const Login = lazy(() => import('./pages/auth/index'))
const Home = lazy(() => import('./pages/home'))
const ErrorPage = lazy(() => import('./components/ui/error'))

const HomeRegister = lazy(() => import('./pages/register'))
const CadastroNotebook = lazy(() => import('./pages/register/notebook'))
const CadastroToner = lazy(() => import('./pages/register/toner'))
const CadastroImpressora = lazy(() => import('./pages/register/impressora'))
const CadastroTablet = lazy(() => import('./pages/register/tablet'))
const CadastroMobiliario = lazy(() => import('./pages/register/mobiliario'))
const CadastroCamera = lazy(() => import('./pages/register/camera'))
const CadastroFones = lazy(() => import('./pages/register/fones'))
const ListaChamadosWeb = lazy(() => import('./pages/listachamados/index.jsx'))

const VisualizarNotebooks = lazy(() => import('./pages/views/notebooks'))
const HomeViews = lazy(() => import('./pages/views'))
const VisualizacaoTablet = lazy(() => import('./pages/views/tablets'))
const ConsultaToners = lazy(() => import('./pages/views/toners'))
const VisualizacaoImpressoras = lazy(() => import('./pages/views/impressora/index.jsx'))
const VisualizarMobiliario = lazy(() => import('./pages/views/mobiliario'))
const VisualizarCamera = lazy(() => import('./pages/views/camera'))
const VisualizarFones = lazy(() => import('./pages/views/fones'))

const RegistroUser = lazy(() => import('./pages/auth/register_auth'))
const DashboardRealtime = lazy(() => import('./pages/dashboard'))
const Perfil = lazy(() => import('./pages/profille'))

// Componente fallback com spinner simples
function Loader() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f0f0f0',
    }}>
      <div style={{
        border: '8px solid #ddd',
        borderTop: '8px solid #4f46e5', // roxo (tailwind indigo-600)
        borderRadius: '50%',
        width: '60px',
        height: '60px',
        animation: 'spin 1s linear infinite',
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}</style>
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Login /> },
      { path: 'Home', element: <Home /> },
      { path: 'register-option', element: <HomeRegister /> },
      { path: 'register-notebook', element: <CadastroNotebook /> },
      { path: 'register-toner', element: <CadastroToner /> },
      { path: 'register-impressora', element: <CadastroImpressora /> },
      { path: 'register-tablet', element: <CadastroTablet /> },
      { path: 'register-mobiliaria', element: <CadastroMobiliario /> },
      { path: 'register-camera', element: <CadastroCamera /> },
      { path: 'register-fone', element: <CadastroFones /> },
      { path: 'views-notebooks', element: <VisualizarNotebooks /> },
      { path: 'views', element: <HomeViews /> },
      { path: 'views-tablet', element: <VisualizacaoTablet /> },
      { path: 'views-toners', element: <ConsultaToners /> },
      { path: 'views-impressora', element: <VisualizacaoImpressoras /> },
      { path: 'view-mobiliaria', element: <VisualizarMobiliario /> },
      { path: 'views-camera', element: <VisualizarCamera /> },
      { path: 'view-fone', element: <VisualizarFones /> },
      { path: 'dashboard', element: <DashboardRealtime /> },
      { path: 'perfil', element: <Perfil /> },
      { path: 'register-user', element: <RegistroUser /> },
      { path: 'register-t-shirt', element: <CamisetasCadastro /> },
      { path: 'list-chamados', element: <ListaChamadosWeb /> },
      { path: 'admin/chat/:uid/:chamadoId', element: <ChatChamado /> },
      { path: '/dashboard-chamados', element: <DashboardChamados /> },


      
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={<Loader />}>
      <RouterProvider router={router} />
    </Suspense>
  </StrictMode>
)
