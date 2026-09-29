import { useState } from 'react';

type ModalCrud<T> = { tipo: 'crear' } | { tipo: 'editar'; fila: T } | { tipo: 'eliminar'; fila: T } | null;

/**
 * Que modal de CRUD esta abierto en una pagina (alta, edicion o confirmacion de borrado).
 * `abrirAlta` abre el alta al montar la pagina (p. ej. al llegar desde otra con ?registrar=1).
 */
export function useCrud<T>(abrirAlta = false) {
  const [modal, setModal] = useState<ModalCrud<T>>(abrirAlta ? { tipo: 'crear' } : null);
  return {
    modal,
    crear: () => setModal({ tipo: 'crear' }),
    editar: (fila: T) => setModal({ tipo: 'editar', fila }),
    eliminar: (fila: T) => setModal({ tipo: 'eliminar', fila }),
    cerrar: () => setModal(null),
  };
}
