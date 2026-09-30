import { useQuery } from '@tanstack/react-query';
import {
  CATALOGO_INMUEBLES_KEY,
  CATALOGOS_KEY,
  fetchCatalogos,
  fetchInmueblesOpciones,
} from '../../api/catalogos';
import { createEgreso, fetchEgreso, updateEgreso, type CrearEgreso, type EgresoDetalle } from '../../api/egresos';
import { formatCurrency, formatPercent, parseNumero } from '../../utils/format';
import { FormModal, FormModalCargando, FormPreview, FormSection, NumberField, SelectField, TextField } from '../forms/FormModal';
import { ErrorFormulario, aTexto, errorCatalogo, idRequerido, numero, texto, useAlta, useCampos } from '../forms/formUtils';

function leer(valor: string): number | null {
  const n = parseNumero(valor);
  return n === null || Number.isNaN(n) ? null : n;
}

const CONCEPTOS = [
  { campo: 'predialMensual', label: 'Predial mensual' },
  { campo: 'seguroArriendo', label: 'Seguro de arriendo' },
  { campo: 'comisionAdministracionInmobiliaria', label: 'Comision administracion' },
  { campo: 'comisionFiduciaria', label: 'Comision fiduciaria' },
  { campo: 'camVacante', label: 'CAM vacante' },
  { campo: 'gravamenMovimientosFinancieros', label: 'GMF (4 x 1.000)' },
  { campo: 'reembolsosTerceros', label: 'Reembolsos a terceros' },
  { campo: 'mantenimientoMenor', label: 'Mantenimiento menor' },
] as const;

type Concepto = (typeof CONCEPTOS)[number]['campo'];

function aCampos(d?: EgresoDetalle) {
  const x: Partial<CrearEgreso> = d?.datos ?? {};
  return {
    idProyecto: aTexto(d?.idProyecto),
    idInmueble: aTexto(x.idInmueble),
    numeroContratoServicio: aTexto(x.numeroContratoServicio),
    predialMensual: aTexto(x.predialMensual),
    seguroArriendo: aTexto(x.seguroArriendo),
    comisionAdministracionInmobiliaria: aTexto(x.comisionAdministracionInmobiliaria),
    comisionFiduciaria: aTexto(x.comisionFiduciaria),
    camVacante: aTexto(x.camVacante),
    gravamenMovimientosFinancieros: aTexto(x.gravamenMovimientosFinancieros),
    reembolsosTerceros: aTexto(x.reembolsosTerceros),
    mantenimientoMenor: aTexto(x.mantenimientoMenor),
  };
}

export function EgresoModal({ id, onClose }: { id?: number; onClose: () => void }) {
  const detalle = useQuery({
    queryKey: ['egreso', id],
    queryFn: () => fetchEgreso(id!),
    enabled: id !== undefined,
    gcTime: 0,
  });

  if (id !== undefined && !detalle.data) {
    return <FormModalCargando title="Editar egreso" error={detalle.error?.message ?? null} onClose={onClose} />;
  }
  return <EgresoForm id={id} inicial={aCampos(detalle.data)} onClose={onClose} />;
}

function EgresoForm({ id, inicial, onClose }: { id?: number; inicial: ReturnType<typeof aCampos>; onClose: () => void }) {
  const { valores: v, set } = useCampos(inicial);

  const { data: cat, error: catError } = useQuery({ queryKey: CATALOGOS_KEY, queryFn: fetchCatalogos });
  const proyecto = v.idProyecto ? Number(v.idProyecto) : undefined;
  const { data: inmuebles, isFetching } = useQuery({
    queryKey: [CATALOGO_INMUEBLES_KEY, proyecto ?? null],
    queryFn: () => fetchInmueblesOpciones(proyecto),
    enabled: proyecto !== undefined,
  });

  // Un perfil de egresos por inmueble: solo se ofrecen los que aun no tienen (mas el propio al editar).
  const disponibles = (inmuebles ?? []).filter((i) => !i.tieneEgreso || String(i.id) === inicial.idInmueble);
  const conEgreso = (inmuebles ?? []).length - disponibles.length;
  const inmueble = disponibles.find((i) => String(i.id) === v.idInmueble);

  const alta = useAlta((body: CrearEgreso) => (id !== undefined ? updateEgreso(id, body) : createEgreso(body)), onClose);

  const elegirInmueble = (idInmueble: string) => {
    set('idInmueble', idInmueble);
    const elegido = disponibles.find((i) => String(i.id) === idInmueble);
    // Predial mensual sugerido = predial anual / 12, como en la hoja de origen.
    if (elegido?.predialAnual && v.predialMensual.trim() === '') {
      set('predialMensual', aTexto(Math.round((elegido.predialAnual / 12) * 100) / 100));
    }
  };

  const total = CONCEPTOS.reduce((acc, c) => acc + (leer(v[c.campo]) ?? 0), 0);
  const canon = inmueble?.canonActual ?? 0;
  const ebitda = canon - total;
  const capRate = inmueble?.valorComercial ? ebitda / inmueble.valorComercial : null;

  const guardar = () =>
    alta.guardar((): CrearEgreso => {
      const idInmueble = idRequerido(v.idInmueble, 'el inmueble');
      const montos = Object.fromEntries(
        CONCEPTOS.map((c) => [c.campo, numero(v[c.campo], c.label, { min: 0 })]),
      ) as Record<Concepto, number | null>;
      if (Object.values(montos).every((m) => m === null)) {
        throw new ErrorFormulario('Registra al menos un concepto de egreso.');
      }
      return { idInmueble, numeroContratoServicio: texto(v.numeroContratoServicio), ...montos };
    });

  return (
    <FormModal
      title={id !== undefined ? 'Editar egreso' : 'Registrar egreso'}
      subtitle="Perfil de costos mensuales del inmueble. El total, el EBITDA y el cap rate se calculan."
      onClose={onClose}
      onSubmit={guardar}
      submitting={alta.guardando}
      error={alta.error ?? errorCatalogo(catError)}
      wide
    >
      <FormSection title="Inmueble" cols={3}>
        <SelectField
          label="Proyecto"
          required
          value={v.idProyecto}
          onChange={(x) => {
            set('idProyecto', x);
            set('idInmueble', '');
          }}
          options={(cat?.proyectos ?? []).map((p) => ({ value: String(p.id), label: p.nombre }))}
        />
        <SelectField
          label="Inmueble"
          required
          value={v.idInmueble}
          onChange={elegirInmueble}
          options={disponibles.map((i) => ({
            value: String(i.id),
            label: i.matricula ? `${i.nombre} · Mat. ${i.matricula}` : i.nombre,
          }))}
          placeholder={
            !proyecto
              ? 'Primero elige el proyecto'
              : isFetching
                ? 'Cargando...'
                : disponibles.length === 0
                  ? 'Sin inmuebles disponibles'
                  : 'Seleccionar...'
          }
          disabled={!proyecto}
          hint={conEgreso > 0 ? `${conEgreso} inmueble(s) del proyecto ya tienen egresos y no se listan.` : undefined}
        />
        <TextField
          label="Contrato servicios publicos"
          value={v.numeroContratoServicio}
          onChange={(x) => set('numeroContratoServicio', x)}
          placeholder="Ej. 5864292"
          maxLength={50}
        />
      </FormSection>

      <FormSection title="Conceptos mensuales" cols={4}>
        {CONCEPTOS.map((c) => (
          <NumberField key={c.campo} label={c.label} moneda value={v[c.campo]} onChange={(x) => set(c.campo, x)} />
        ))}
        <FormPreview
          items={[
            { label: 'Total egresos', value: formatCurrency(total) },
            { label: 'Canon actual', value: inmueble ? formatCurrency(inmueble.canonActual ?? 0) : '—' },
            { label: 'EBITDA', value: inmueble ? formatCurrency(ebitda) : '—', negative: !!inmueble && ebitda < 0 },
            { label: 'Cap rate mensual', value: inmueble ? formatPercent(capRate) : '—', negative: capRate !== null && capRate < 0 },
          ]}
        />
      </FormSection>
    </FormModal>
  );
}
