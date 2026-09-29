import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { CATALOGOS_KEY, fetchCatalogos } from '../../api/catalogos';
import { fetchProyectos } from '../../api/inmuebles';
import { CargaConsultas } from '../loading/PantallaCarga';
import styles from './AppShell.module.css';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell() {
  const queryClient = useQueryClient();

  // Las listas de los formularios y el catalogo de proyectos se piden en segundo plano al entrar,
  // para que los modales y filtros abran con los datos ya disponibles.
  useEffect(() => {
    const meta = { segundoPlano: true };
    void queryClient.prefetchQuery({ queryKey: CATALOGOS_KEY, queryFn: fetchCatalogos, meta });
    void queryClient.prefetchQuery({ queryKey: ['proyectos'], queryFn: fetchProyectos, meta });
  }, [queryClient]);

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.content}>
        <Topbar />
        <main className={styles.main}>
          <Outlet />
          <CargaConsultas />
        </main>
      </div>
    </div>
  );
}
