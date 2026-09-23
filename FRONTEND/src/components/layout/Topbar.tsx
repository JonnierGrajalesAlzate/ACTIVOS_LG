import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { DIAS_ALERTA_VENCIMIENTO, fetchResumen } from '../../api/resumen';
import { AlertaItem } from '../alertas/AlertaItem';
import styles from './Topbar.module.css';

// Las alertas se recalculan en el backend; se refrescan cada 5 minutos para que la campana no quede desactualizada.
const REFRESCO_MS = 5 * 60 * 1000;

export function Topbar() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['resumen'],
    queryFn: fetchResumen,
    refetchInterval: REFRESCO_MS,
  });
  const alertas = data?.alertas ?? [];
  const criticas = alertas.filter((a) => a.severidad === 'danger').length;

  // Cierra el panel al hacer clic fuera (incluye la navegacion lateral) o con Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header className={styles.topbar}>
      <div className={styles.actions} ref={wrapRef}>
        <button
          type="button"
          className={`${styles.bell} ${open ? styles.bellOpen : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-label={`Notificaciones${alertas.length ? `: ${alertas.length} alertas` : ''}`}
          aria-expanded={open}
          aria-haspopup="dialog"
          title="Notificaciones"
        >
          <Bell size={19} strokeWidth={2} />
          {alertas.length > 0 && (
            <span className={`${styles.badge} ${criticas > 0 ? styles.badgeDanger : styles.badgeWarn}`}>
              {alertas.length > 9 ? '9+' : alertas.length}
            </span>
          )}
        </button>

        {open && (
          <div
            className={styles.panel}
            role="dialog"
            aria-label="Notificaciones"
            // Cualquier enlace dentro del panel navega fuera de el: se cierra.
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('a')) setOpen(false);
            }}
          >
            <div className={styles.panelHeader}>
              <b>Notificaciones</b>
              {alertas.length > 0 && <span className={styles.panelCount}>{alertas.length}</span>}
            </div>

            <div className={styles.panelBody}>
              {isLoading && Array.from({ length: 3 }).map((_, i) => <div key={`nsk-${i}`} className={styles.skeleton} />)}
              {isError && <div className={styles.empty}>No se pudieron cargar las alertas.</div>}
              {!isLoading &&
                !isError &&
                alertas.map((a, i) => <AlertaItem key={`${a.tipo}-${a.titulo}-${i}`} alerta={a} />)}
              {!isLoading && !isError && alertas.length === 0 && (
                <div className={styles.empty}>
                  Sin alertas: ningun contrato vence en los proximos {DIAS_ALERTA_VENCIMIENTO} dias, no hay incrementos de
                  IPC pendientes y ningun inmueble esta en perdida.
                </div>
              )}
            </div>

            <Link to="/alertas" className={styles.panelFooter}>
              Ver todas las alertas
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
