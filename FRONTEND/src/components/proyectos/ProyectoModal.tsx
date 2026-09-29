import { createProyecto, updateProyecto, type Proyecto } from '../../api/inmuebles';
import { FormModal, FormSection, TextField } from '../forms/FormModal';
import { ErrorFormulario, texto, useAlta, useCampos } from '../forms/formUtils';

interface Props {
  /** Si llega, se edita ese proyecto. */
  existente?: { id: number; nombre: string };
  onClose: () => void;
  /** Solo en alta: se llama con el proyecto recien creado (en lugar de onClose). */
  onCreated?: (proyecto: Proyecto) => void;
}

export function ProyectoModal({ existente, onClose, onCreated }: Props) {
  const { valores, set } = useCampos({ nombre: existente?.nombre ?? '' });
  const alta = useAlta(
    (nombre: string) => (existente ? updateProyecto(existente.id, nombre) : createProyecto(nombre)),
    (proyecto) => (!existente && onCreated ? onCreated(proyecto) : onClose()),
  );

  const guardar = () =>
    alta.guardar(() => {
      const nombre = texto(valores.nombre);
      if (!nombre) throw new ErrorFormulario('El nombre del proyecto es obligatorio.');
      return nombre;
    });

  return (
    <FormModal
      title={existente ? 'Editar proyecto' : 'Registrar proyecto'}
      subtitle={existente ? undefined : 'Al guardarlo pasas a registrar su primer inmueble.'}
      onClose={onClose}
      onSubmit={guardar}
      submitting={alta.guardando}
      error={alta.error}
      submitLabel={existente ? 'Guardar' : 'Guardar y registrar inmueble'}
    >
      <FormSection cols={1}>
        <TextField
          label="Nombre del proyecto"
          required
          value={valores.nombre}
          onChange={(v) => set('nombre', v)}
          placeholder="Ej. Torre Central"
          maxLength={200}
          autoFocus
        />
      </FormSection>
    </FormModal>
  );
}
