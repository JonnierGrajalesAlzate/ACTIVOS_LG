import type { ReactNode } from 'react';
import { FormModal } from '../forms/FormModal';
import { useAlta } from '../forms/formUtils';

interface ConfirmarEliminarProps {
  /** Que se elimina, p. ej. "el inmueble Comercio 104". */
  objeto: string;
  /** Consecuencias adicionales (registros que se borran en cascada). */
  detalle?: ReactNode;
  eliminar: () => Promise<void>;
  onClose: () => void;
}

/**
 * Confirmacion de borrado. Si el backend lo impide (409, p. ej. por contratos asociados),
 * su mensaje se muestra en el pie y el dialogo sigue abierto.
 */
export function ConfirmarEliminar({ objeto, detalle, eliminar, onClose }: ConfirmarEliminarProps) {
  const baja = useAlta(eliminar, onClose);
  return (
    <FormModal
      title="Confirmar eliminacion"
      onClose={onClose}
      onSubmit={() => baja.guardar(() => undefined)}
      submitting={baja.guardando}
      error={baja.error}
      submitLabel="Eliminar"
      danger
    >
      <p style={{ fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.55, margin: '14px 0 6px' }}>
        ¿Eliminar {objeto}? Esta accion no se puede deshacer.
      </p>
      {detalle && <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5, margin: '0 0 6px' }}>{detalle}</p>}
    </FormModal>
  );
}
