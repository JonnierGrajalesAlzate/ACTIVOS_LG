import { createEtapa, updateEtapa } from '../../api/inmuebles';
import { FormModal, FormSection, TextField } from '../forms/FormModal';
import { ErrorFormulario, texto, useAlta, useCampos } from '../forms/formUtils';

interface Props {
  proyectoId: number;
  proyectoNombre?: string;
  /** Si llega, se renombra esa etapa. */
  existente?: { id: number; nombre: string };
  onClose: () => void;
}

export function EtapaModal({ proyectoId, proyectoNombre, existente, onClose }: Props) {
  const { valores, set } = useCampos({ nombre: existente?.nombre ?? '' });
  const alta = useAlta(
    (nombre: string) => (existente ? updateEtapa(existente.id, nombre) : createEtapa(proyectoId, nombre)),
    onClose,
  );

  const guardar = () =>
    alta.guardar(() => {
      const nombre = texto(valores.nombre);
      if (!nombre) throw new ErrorFormulario('El nombre de la etapa es obligatorio.');
      return nombre;
    });

  return (
    <FormModal
      title={existente ? 'Editar etapa' : 'Agregar etapa'}
      subtitle={proyectoNombre ? `Proyecto ${proyectoNombre}.` : undefined}
      onClose={onClose}
      onSubmit={guardar}
      submitting={alta.guardando}
      error={alta.error}
    >
      <FormSection cols={1}>
        <TextField
          label="Nombre de la etapa"
          required
          value={valores.nombre}
          onChange={(v) => set('nombre', v)}
          placeholder="Ej. Etapa 2"
          maxLength={100}
          autoFocus
          hint={existente ? undefined : 'Luego asigna la etapa a sus inmuebles desde el formulario de cada inmueble.'}
        />
      </FormSection>
    </FormModal>
  );
}
