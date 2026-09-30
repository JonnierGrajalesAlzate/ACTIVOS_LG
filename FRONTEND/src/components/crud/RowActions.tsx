import { Pencil, Trash2 } from 'lucide-react';
import type { MouseEvent } from 'react';
import { usePermisos } from '../../auth/permisos';
import styles from './RowActions.module.css';

interface RowActionsProps {
  /** Nombre del registro, para las etiquetas accesibles ("Editar Comercio 104"). */
  label: string;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
  /** Proyectos y etapas: solo los modifica un administrador. */
  soloAdmin?: boolean;
}

/**
 * Botones Editar / Eliminar de una fila o tarjeta. No propagan el clic al contenedor.
 * No se muestran si el rol del usuario no permite el cambio.
 */
export function RowActions({ label, onEdit, onDelete, className, soloAdmin }: RowActionsProps) {
  const { puedeEditar, esAdmin } = usePermisos();
  if (soloAdmin ? !esAdmin : !puedeEditar) return null;

  const handle = (fn: () => void) => (e: MouseEvent) => {
    e.stopPropagation();
    fn();
  };
  return (
    <span className={`${styles.actions} ${className ?? ''}`}>
      <button type="button" className={styles.btn} onClick={handle(onEdit)} aria-label={`Editar ${label}`} title="Editar">
        <Pencil size={15} strokeWidth={2} />
      </button>
      <button
        type="button"
        className={`${styles.btn} ${styles.delete}`}
        onClick={handle(onDelete)}
        aria-label={`Eliminar ${label}`}
        title="Eliminar"
      >
        <Trash2 size={15} strokeWidth={2} />
      </button>
    </span>
  );
}
