import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { aplicarIncremento } from '../../api/contrapartes';
import type { Alerta } from '../../api/resumen';
import { formatCurrency } from '../../utils/format';
import { AlertCard } from '../cards/Cards';
import styles from './AlertaItem.module.css';

/** Alerta del portafolio; las de incremento IPC permiten aplicar el canon sugerido. */
export function AlertaItem({ alerta }: { alerta: Alerta }) {
  return (
    <AlertCard
      titulo={alerta.titulo}
      contexto={alerta.contexto}
      motivo={alerta.motivo}
      detalle={alerta.detalle}
      severidad={alerta.severidad}
      action={alerta.tipo === 'incremento-ipc' && alerta.idContrato !== null ? <IncrementoIpcAction alerta={alerta} /> : undefined}
    />
  );
}

function IncrementoIpcAction({ alerta }: { alerta: Alerta }) {
  const queryClient = useQueryClient();
  const [confirmando, setConfirmando] = useState(false);

  const mutation = useMutation({
    mutationFn: () => aplicarIncremento(alerta.idContrato!),
    onSuccess: () => {
      setConfirmando(false);
      // El canon cambia: se refrescan todas las vistas que lo muestran.
      for (const key of ['resumen', 'contratos', 'arrendatarios', 'inmuebles', 'reportes', 'propietarios', 'etapas']) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
    },
  });

  if (alerta.canonNuevo === null) {
    return (
      <Link to="/alertas" className={styles.link}>
        Configurar IPC
      </Link>
    );
  }

  if (mutation.isError) {
    return (
      <span className={styles.error}>
        {mutation.error.message}
        <button type="button" className={styles.ghost} onClick={() => mutation.reset()}>
          Cerrar
        </button>
      </span>
    );
  }

  if (!confirmando) {
    return (
      <button type="button" className={styles.primary} onClick={() => setConfirmando(true)}>
        Aplicar incremento
      </button>
    );
  }

  return (
    <>
      <span className={styles.confirmText}>
        Canon {formatCurrency(alerta.canonActual)} → <b>{formatCurrency(alerta.canonNuevo)}</b>
      </span>
      <button type="button" className={styles.ghost} onClick={() => setConfirmando(false)} disabled={mutation.isPending}>
        Cancelar
      </button>
      <button type="button" className={styles.primary} onClick={() => mutation.mutate()} disabled={mutation.isPending}>
        {mutation.isPending ? 'Aplicando...' : 'Confirmar'}
      </button>
    </>
  );
}
