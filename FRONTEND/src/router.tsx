import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { RequireAuth } from './auth/RequireAuth';
import { AlertasPage } from './pages/AlertasPage';
import { ContratosHubPage } from './pages/ContratosHubPage';
import { EgresosPage } from './pages/EgresosPage';
import { InicioPage } from './pages/InicioPage';
import { InmueblesPage } from './pages/InmueblesPage';
import { LoginPage } from './pages/LoginPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { PropietariosPage } from './pages/PropietariosPage';
import { ProyectoEtapasPage } from './pages/ProyectoEtapasPage';
import { ReportesPage } from './pages/ReportesPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/inicio" replace /> },
      { path: 'inicio', element: <InicioPage /> },
      { path: 'inicio/proyectos/:id', element: <ProyectoEtapasPage /> },
      { path: 'inmuebles', element: <InmueblesPage /> },
      { path: 'alertas', element: <AlertasPage /> },
      { path: 'egresos', element: <EgresosPage /> },
      { path: 'propietarios', element: <PropietariosPage /> },
      // Ruta anterior: se redirige para no romper enlaces o marcadores guardados.
      { path: 'arrendadores', element: <Navigate to="/propietarios" replace /> },
      { path: 'contratos', element: <ContratosHubPage /> },
      // Arrendatarios ahora es una vista dentro de Contratos; la ruta vieja redirige.
      { path: 'arrendatarios', element: <Navigate to="/contratos?vista=arrendatarios" replace /> },
      { path: 'reportes', element: <ReportesPage /> },
      {
        path: 'carga',
        element: (
          <PlaceholderPage
            tab="carga"
            note="Pendiente de alcance: la base de datos no tiene tabla de historial de cargas Excel todavia."
          />
        ),
      },
      {
        path: 'config',
        element: (
          <PlaceholderPage
            tab="config"
            note="Pendiente de alcance: la base de datos no tiene tabla de usuarios/roles todavia."
          />
        ),
      },
    ],
  },
]);
