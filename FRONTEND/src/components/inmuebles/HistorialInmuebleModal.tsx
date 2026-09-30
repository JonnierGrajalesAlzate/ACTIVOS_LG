import { useQuery } from '@tanstack/react-query';
import { useEffect, useId } from 'react';
import { fetchHistorialInmueble, type HistorialContrato } from '../../api/inmuebles';
import { formatCurrency, formatDate, formatPercent } from '../../utils/format';
import modal from '../forms/FormModal.module.css';
import styles from './HistorialInmuebleModal.module.css';

/** Historial de contratos del inmueble (solo lectura): arrendatarios, vigencias, canon e incrementos. */
export function HistorialInmuebleModal({ id, nombre, onClose }: { id: number; nombre: string; onClose: () => void }) {
  const titleId = useId();
  const { data, isLoading, error } = useQuery({
    queryKey: ['historial-inmueble', id],
    queryFn: () => fetchHistorialInmueble(id),
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const contratos = data?.contratos ?? [];

  return (
    <div className={modal.overlay} onClick={onClose}>
      <div
        className={`${modal.card} ${modal.wide}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={modal.head}>
          <h2 id={titleId} className={modal.title}>
            Historial de {nombre}
          </h2>
          <p className={modal.subtitle}>
            {data ? `${data.proyecto} · ` : ''}Contratos que ha tenido el inmueble, del mas reciente al mas antiguo.
          </p>
        </div>

        <div className={modal.body}>
          {isLoading && <p className={modal.subtitle}>Cargando historial...</p>}
          {error && <p className={modal.error}>{error.message}</p>}
          {data && contratos.length === 0 && (
            <p className={styles.vacio}>El inmueble no tiene contratos registrados.</p>
          )}
          {contratos.length > 0 && (
            <ol className={styles.lista}>
              {contratos.map((c) => (
                <ContratoHistorial key={c.id} c={c} />
              ))}
            </ol>
          )}
        </div>

        <div className={modal.foot}>
          <div className={modal.spacer} />
          <button type="button" className={modal.cancel} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function ContratoHistorial({ c }: { c: HistorialContrato }) {
  return (
    <li className={`${styles.item} ${c.actual ? styles.actual : ''}`}>
      <div className={styles.cabecera}>
        <b className={styles.arrendatario}>{c.arrendatario ?? 'Sin arrendatario'}</b>
        {c.marca && <span className={styles.meta}>{c.marca}</span>}
        {c.actual && <span className={styles.badge}>Contrato actual</span>}
      </div>

      <dl className={styles.datos}>
        <div>
          <dt>Inicio</dt>
          <dd>{formatDate(c.fechaContrato)}</dd>
        </div>
        <div>
          <dt>Plazo</dt>
          <dd>{c.plazoAnios ? `${c.plazoAnios} año(s)` : '—'}</dd>
        </div>
        <div>
          <dt>Vencimiento</dt>
          <dd>{formatDate(c.proximoVencimiento)}</dd>
        </div>
        <div>
          <dt>Canon mensual</dt>
          <dd>{formatCurrency(c.canonMensual)}</dd>
        </div>
      </dl>

      {c.incrementos.length > 0 && (
        <table className={styles.incrementos}>
          <caption>Incrementos aplicados</caption>
          <thead>
            <tr>
              <th>Fecha</th>
              <th className={styles.num}>Canon anterior</th>
              <th className={styles.num}>Canon nuevo</th>
              <th className={styles.num}>IPC</th>
              <th>Aplicado por</th>
            </tr>
          </thead>
          <tbody>
            {c.incrementos.map((h) => (
              <tr key={`${h.fechaIncremento}-${h.canonNuevo}`}>
                <td>{formatDate(h.fechaIncremento)}</td>
                <td className={styles.num}>{formatCurrency(h.canonAnterior)}</td>
                <td className={styles.num}>{formatCurrency(h.canonNuevo)}</td>
                <td className={styles.num}>
                  {formatPercent(h.ipc)}
                  {h.puntosAdicionales ? ` + ${formatPercent(h.puntosAdicionales)}` : ''}
                </td>
                <td>{h.aplicadoPor ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {c.observaciones && <p className={styles.observaciones}>{c.observaciones}</p>}
    </li>
  );
}
