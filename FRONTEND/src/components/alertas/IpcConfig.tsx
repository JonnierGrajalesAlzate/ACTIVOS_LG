import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { actualizarIpc, fetchIpc } from '../../api/resumen';
import { usePermisos } from '../../auth/permisos';
import styles from './IpcConfig.module.css';

const fechaFormatter = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

// La base guarda la fecha en UTC y el backend la serializa sin zona; se marca como UTC para mostrarla en hora local.
function parseUtc(value: string): Date {
  return new Date(/[zZ]|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`);
}

/** IPC anual vigente con el que se calcula el canon sugerido en las notificaciones de incremento. */
export function IpcConfig() {
  const queryClient = useQueryClient();
  const { esAdmin } = usePermisos();
  const { data } = useQuery({ queryKey: ['ipc'], queryFn: fetchIpc });
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState('');

  const mutation = useMutation({
    mutationFn: (v: number) => actualizarIpc(v),
    onSuccess: (ipc) => {
      queryClient.setQueryData(['ipc'], ipc);
      queryClient.invalidateQueries({ queryKey: ['resumen'] });
      setEditando(false);
    },
  });

  const configurado = data?.valor !== null && data?.valor !== undefined;

  const abrir = () => {
    setValor(configurado ? String(data!.valor).replace('.', ',') : '');
    mutation.reset();
    setEditando(true);
  };

  const guardar = (e: FormEvent) => {
    e.preventDefault();
    const numero = Number(valor.replace(',', '.'));
    if (Number.isFinite(numero)) mutation.mutate(numero);
  };

  return (
    <div className={`${styles.box} ${configurado ? '' : styles.boxPendiente}`}>
      <div>
        <div className={styles.label}>IPC anual vigente</div>
        {configurado ? (
          <div className={styles.value}>{data!.valor!.toLocaleString('es-CO', { maximumFractionDigits: 2 })} %</div>
        ) : (
          <div className={styles.pendiente}>Sin configurar: las notificaciones no pueden calcular el canon nuevo.</div>
        )}
        {configurado && data?.fechaActualizacion && (
          <div className={styles.meta}>
            Actualizado {fechaFormatter.format(parseUtc(data.fechaActualizacion))}
            {data.actualizadoPor ? ` · ${data.actualizadoPor}` : ''}
          </div>
        )}
      </div>

      {editando ? (
        <form className={styles.form} onSubmit={guardar}>
          <input
            className={styles.input}
            inputMode="decimal"
            placeholder="Ej: 5,2"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            aria-label="IPC anual en porcentaje"
            autoFocus
          />
          <span className={styles.suffix}>%</span>
          <button type="button" className={styles.ghost} onClick={() => setEditando(false)} disabled={mutation.isPending}>
            Cancelar
          </button>
          <button type="submit" className={styles.primary} disabled={mutation.isPending || valor.trim() === ''}>
            {mutation.isPending ? 'Guardando...' : 'Guardar'}
          </button>
          {mutation.isError && <div className={styles.error}>{mutation.error.message}</div>}
        </form>
      ) : (
        esAdmin && (
          <button type="button" className={styles.primary} onClick={abrir}>
            {configurado ? 'Cambiar IPC' : 'Configurar IPC'}
          </button>
        )
      )}
    </div>
  );
}
