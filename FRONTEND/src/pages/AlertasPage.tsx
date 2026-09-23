import { useQuery } from '@tanstack/react-query';
import { fetchResumen } from '../api/resumen';
import { AlertCard } from '../components/cards/Cards';
import { Header } from '../components/layout/Header';
import { pageMeta } from '../nav/navConfig';
import styles from './AlertasPage.module.css';

export function AlertasPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['resumen'], queryFn: fetchResumen });
  const alertas = data?.alertas ?? [];

  return (
    <div>
      <Header meta={pageMeta.alertas} />

      {isError ? (
        <div style={{ padding: 24, color: 'var(--danger)' }}>No se pudo cargar las alertas del portafolio.</div>
      ) : (
        <div className={styles.alertList}>
          {isLoading && Array.from({ length: 6 }).map((_, i) => <div key={`sk-${i}`} className={styles.skeleton} />)}
          {!isLoading &&
            alertas.map((a, i) => (
              <AlertCard
                key={`${a.tipo}-${a.titulo}-${i}`}
                titulo={a.titulo}
                contexto={a.contexto}
                motivo={a.motivo}
                detalle={a.detalle}
                severidad={a.severidad}
              />
            ))}
          {!isLoading && alertas.length === 0 && (
            <div className={styles.emptyState}>
              Sin alertas: ningun contrato vence en los proximos 90 dias y ningun inmueble esta en perdida.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
