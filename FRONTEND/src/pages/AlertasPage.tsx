import { useQuery } from '@tanstack/react-query';
import { DIAS_ALERTA_VENCIMIENTO, fetchResumen } from '../api/resumen';
import { AlertaItem } from '../components/alertas/AlertaItem';
import { IpcConfig } from '../components/alertas/IpcConfig';
import { Header } from '../components/layout/Header';
import { pageMeta } from '../nav/navConfig';
import styles from './AlertasPage.module.css';

export function AlertasPage() {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['resumen'], queryFn: fetchResumen });
  const alertas = data?.alertas ?? [];

  return (
    <div>
      <Header meta={pageMeta.alertas} onAction={() => refetch()} />

      <IpcConfig />

      {isError ? (
        <div style={{ padding: 24, color: 'var(--danger)' }}>No se pudo cargar las alertas del portafolio.</div>
      ) : (
        <div className={styles.alertList}>
          {isLoading && Array.from({ length: 6 }).map((_, i) => <div key={`sk-${i}`} className={styles.skeleton} />)}
          {!isLoading && alertas.map((a, i) => <AlertaItem key={`${a.tipo}-${a.titulo}-${i}`} alerta={a} />)}
          {!isLoading && alertas.length === 0 && (
            <div className={styles.emptyState}>
              Sin alertas: ningun contrato vence en los proximos {DIAS_ALERTA_VENCIMIENTO} dias, no hay incrementos de
              IPC pendientes y ningun inmueble esta en perdida.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
