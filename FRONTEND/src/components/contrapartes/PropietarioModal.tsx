import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { CATALOGO_INMUEBLES_KEY, fetchInmueblesOpciones, type InmuebleOpcion } from '../../api/catalogos';
import { guardarPropietario } from '../../api/contrapartes';
import { matchesSearch } from '../../utils/text';
import { FormModal, FormModalCargando, FormSection, TextField } from '../forms/FormModal';
import { ErrorFormulario, texto, useAlta, useCampos } from '../forms/formUtils';
import styles from './PropietarioModal.module.css';

interface Props {
  /** Si llega, se edita ese propietario (su NIT no se puede cambiar). */
  existente?: { nit: string; nombre: string };
  onClose: () => void;
}

/** Alta y edicion de propietario: NIT, nombre y los inmuebles de los que es dueño. */
export function PropietarioModal({ existente, onClose }: Props) {
  const titulo = existente ? 'Editar propietario' : 'Nuevo propietario';
  const { data: inmuebles, error } = useQuery({
    queryKey: [CATALOGO_INMUEBLES_KEY, null],
    queryFn: () => fetchInmueblesOpciones(),
  });

  if (!inmuebles) return <FormModalCargando title={titulo} error={error?.message ?? null} onClose={onClose} />;
  return <PropietarioForm titulo={titulo} existente={existente} inmuebles={inmuebles} onClose={onClose} />;
}

function PropietarioForm({
  titulo,
  existente,
  inmuebles,
  onClose,
}: Props & { titulo: string; inmuebles: InmuebleOpcion[] }) {
  const { valores, set } = useCampos({ nit: existente?.nit ?? '', nombre: existente?.nombre ?? '' });
  const [elegidos, setElegidos] = useState<Set<number>>(
    () => new Set(existente ? inmuebles.filter((i) => i.nitPropietario === existente.nit).map((i) => i.id) : []),
  );
  const [buscar, setBuscar] = useState('');
  const [proyecto, setProyecto] = useState('');

  const alta = useAlta(
    (body: { nit: string; nombre: string; inmuebles: number[] }) => guardarPropietario(existente?.nit, body),
    onClose,
  );

  const guardar = () =>
    alta.guardar(() => {
      const nit = texto(valores.nit);
      const nombre = texto(valores.nombre);
      if (!nit) throw new ErrorFormulario('El NIT es obligatorio.');
      if (!nombre) throw new ErrorFormulario('El nombre es obligatorio.');
      return { nit, nombre, inmuebles: [...elegidos] };
    });

  const proyectos = [...new Map(inmuebles.map((i) => [i.idProyecto, i.proyecto])).entries()].sort((a, b) =>
    a[1].localeCompare(b[1]),
  );
  const visibles = inmuebles.filter(
    (i) =>
      (!proyecto || String(i.idProyecto) === proyecto) &&
      (matchesSearch(i.nombre, buscar) || matchesSearch(i.matricula ?? '', buscar) || matchesSearch(i.proyecto, buscar)),
  );
  const grupos = proyectos
    .map(([id, nombre]) => ({ id, nombre, items: visibles.filter((i) => i.idProyecto === id) }))
    .filter((g) => g.items.length > 0);

  const alternar = (ids: number[], marcar: boolean) =>
    setElegidos((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (marcar) next.add(id);
        else next.delete(id);
      }
      return next;
    });

  // Inmuebles marcados que hoy son de otro propietario: al guardar pasan a este.
  const reasignados = inmuebles.filter(
    (i) => elegidos.has(i.id) && i.nitPropietario && i.nitPropietario !== existente?.nit,
  ).length;

  return (
    <FormModal
      title={titulo}
      subtitle="Dueño de inmuebles. Marca los inmuebles que le pertenecen; en sus contratos nuevos aparecera como propietario."
      onClose={onClose}
      onSubmit={guardar}
      submitting={alta.guardando}
      error={alta.error}
      wide
    >
      <FormSection title="Datos" cols={2}>
        <TextField
          label="NIT o documento"
          required
          value={valores.nit}
          onChange={(v) => set('nit', v)}
          placeholder="Ej. 900104137"
          maxLength={20}
          hint={existente ? 'El NIT identifica al propietario: no se puede cambiar.' : 'Sin digito de verificacion, como en la base actual.'}
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
        />
      </FormSection>

      <FormSection title={`Inmuebles de los que es dueño · ${elegidos.size} seleccionado(s)`} cols={1}>
        {/* Buscador y proyecto solo acotan la lista; lo que se asigna es lo que quede marcado. */}
        <div className={styles.toolbar}>
          <span className={styles.toolbarLabel}>Filtrar por:</span>
          <input
            className={styles.input}
            type="search"
            placeholder="Buscar local, matricula o proyecto..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            aria-label="Buscar inmuebles"
          />
          <select className={styles.input} value={proyecto} onChange={(e) => setProyecto(e.target.value)} aria-label="Filtrar por proyecto">
            <option value="">Todos los proyectos</option>
            {proyectos.map(([id, nombre]) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.lista}>
          {grupos.length === 0 && <div className={styles.vacio}>Ningun inmueble coincide con la busqueda.</div>}
          {grupos.map((g) => {
            const ids = g.items.map((i) => i.id);
            const marcados = ids.filter((id) => elegidos.has(id)).length;
            return (
              <div key={g.id} className={styles.grupo}>
                <label className={styles.grupoHead}>
                  <input
                    type="checkbox"
                    checked={marcados === ids.length}
                    ref={(el) => {
                      if (el) el.indeterminate = marcados > 0 && marcados < ids.length;
                    }}
                    onChange={(e) => alternar(ids, e.target.checked)}
                  />
                  <b>{g.nombre}</b>
                  <span className={styles.conteo}>
                    {marcados}/{ids.length}
                  </span>
                </label>
                <div className={styles.items}>
                  {g.items.map((i) => {
                    const deOtro = i.nitPropietario && i.nitPropietario !== existente?.nit;
                    return (
                      <label key={i.id} className={styles.item}>
                        <input type="checkbox" checked={elegidos.has(i.id)} onChange={(e) => alternar([i.id], e.target.checked)} />
                        <span>
                          {i.nombre}
                          {i.matricula && <span className={styles.meta}> · Mat. {i.matricula}</span>}
                          {deOtro && <span className={styles.otro}> · Hoy: {i.propietario}</span>}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {reasignados > 0 && (
          <div className={styles.aviso}>
            {reasignados} inmueble(s) marcados son hoy de otro propietario: al guardar pasan a este.
          </div>
        )}
      </FormSection>
    </FormModal>
  );
}
