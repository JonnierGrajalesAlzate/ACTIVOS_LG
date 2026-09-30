import { createContraparte, updateContraparte, type TipoContraparte } from '../../api/contrapartes';
import { FormModal, FormSection, TextField } from '../forms/FormModal';
import { ErrorFormulario, texto, useAlta, useCampos } from '../forms/formUtils';

const COPY: Record<TipoContraparte, { nuevo: string; editar: string; subtitle: string }> = {
  propietario: {
    nuevo: 'Nuevo propietario',
    editar: 'Editar propietario',
    subtitle: 'Dueño de inmuebles; luego se asocia a sus contratos.',
  },
  arrendatario: {
    nuevo: 'Nuevo arrendatario',
    editar: 'Editar arrendatario',
    subtitle: 'Contraparte que arrienda inmuebles del portafolio.',
  },
};

interface Props {
  tipo: TipoContraparte;
  /** Si llega, se edita esa contraparte (su NIT no se puede cambiar). */
  existente?: { nit: string; nombre: string };
  onClose: () => void;
}

/** Alta y edicion de arrendador (propietario) o arrendatario: ambas tablas solo tienen NIT y nombre. */
export function ContraparteModal({ tipo, existente, onClose }: Props) {
  const copy = COPY[tipo];
  const { valores, set } = useCampos({ nit: existente?.nit ?? '', nombre: existente?.nombre ?? '' });
  const alta = useAlta(
    (body: { nit: string; nombre: string }) =>
      existente ? updateContraparte(tipo, existente.nit, body.nombre) : createContraparte(tipo, body),
    onClose,
  );

  const guardar = () =>
    alta.guardar(() => {
      const nit = texto(valores.nit);
      const nombre = texto(valores.nombre);
      if (!nit) throw new ErrorFormulario('El NIT es obligatorio.');
      if (!nombre) throw new ErrorFormulario('El nombre es obligatorio.');
      return { nit, nombre };
    });

  return (
    <FormModal
      title={existente ? copy.editar : copy.nuevo}
      subtitle={copy.subtitle}
      onClose={onClose}
      onSubmit={guardar}
      submitting={alta.guardando}
      error={alta.error}
    >
      <FormSection cols={1}>
        <TextField
          label="NIT o documento"
          required
          value={valores.nit}
          onChange={(v) => set('nit', v)}
          placeholder="Ej. 900104137"
          maxLength={20}
          hint={existente ? 'El NIT identifica la contraparte en sus contratos: no se puede cambiar.' : 'Sin digito de verificacion, como en la base actual.'}
          disabled={!!existente}
          autoFocus={!existente}
        />
        <TextField
          label="Razon social o nombre"
          required
          value={valores.nombre}
          onChange={(v) => set('nombre', v)}
          placeholder="Ej. INMOBILIARIA SAN NICOLAS"
          maxLength={200}
          autoFocus={!!existente}
        />
      </FormSection>
    </FormModal>
  );
}
