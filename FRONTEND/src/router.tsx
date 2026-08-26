import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ArrendadoresPage } from './pages/ArrendadoresPage';
import { ArrendatariosPage } from './pages/ArrendatariosPage';
import { ContratosPage } from './pages/ContratosPage';
import { EgresosPage } from './pages/EgresosPage';
import { InicioPage } from './pages/InicioPage';
import { InmueblesPage } from './pages/InmueblesPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { ReportesPage } from './pages/ReportesPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/inicio" replace /> },
      { path: 'inicio', element: <InicioPage /> },
      { path: 'inmuebles', element: <InmueblesPage /> },
      { path: 'egresos', element: <EgresosPage /> },
      { path: 'arrendadores', element: <ArrendadoresPage /> },
      { path: 'arrendatarios', element: <ArrendatariosPage /> },
      { path: 'contratos', element: <ContratosPage /> },
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
