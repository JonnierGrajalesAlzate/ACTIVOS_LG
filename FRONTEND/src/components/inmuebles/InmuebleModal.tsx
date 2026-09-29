import { useQuery } from '@tanstack/react-query';
import { CATALOGOS_KEY, fetchCatalogos, type Opcion } from '../../api/catalogos';
import { createInmueble, fetchInmueble, updateInmueble, type CrearInmueble } from '../../api/inmuebles';
import { formatCurrency, formatPercent, parseNumero } from '../../utils/format';
import {
  CheckboxField,
  FormModal,
  FormModalCargando,
  FormPreview,
  FormSection,
  NumberField,
  SelectField,
  TextAreaField,
  TextField,
} from '../forms/FormModal';
import { ErrorFormulario, aTexto, entero, errorCatalogo, idRequerido, idSeleccionado, numero, texto, useAlta, useCampos } from '../forms/formUtils';

const opciones = (items: Opcion[] | undefined) => (items ?? []).map((o) => ({ value: String(o.id), label: o.nombre }));

/** Numero valido o null, para las previsualizaciones (nunca lanza). */
function leer(valor: string): number | null {
  const n = parseNumero(valor);
  return n === null || Number.isNaN(n) ? null : n;
}

/** Datos de la API a campos de formulario. */
function aCampos(d: Partial<CrearInmueble>) {
  return {
    idProyecto: aTexto(d.idProyecto),
    idEtapa: aTexto(d.idEtapa),
    idEstado: aTexto(d.idEstado),
    idDestinacion: aTexto(d.idDestinacion),
    idTipoLocal: aTexto(d.idTipoLocal),
    idTipoInmueble: aTexto(d.idTipoInmueble),
    matricula: aTexto(d.matriculaInmobiliaria),
    numeroLocal: aTexto(d.numeroLocal),
    nivel: aTexto(d.nivel),
    mesanine: d.mesanine ?? false,
    pisos: aTexto(d.pisos),
    areaPiso1: aTexto(d.areaPiso1),
    areaLibrePriv: aTexto(d.areaLibrePriv),
    coeficiente: aTexto(d.coeficiente),
    valorComercial: aTexto(d.valorComercial),
    valorM2Construido: aTexto(d.valorM2Construido),
    avaluoCatastral: aTexto(d.avaluoCatastral),
    tarifaCatastro: aTexto(d.tarifaCatastro),
    predialAnual: aTexto(d.predialAnual),
    valorM2Admon: aTexto(d.valorM2Admon),
    observaciones: aTexto(d.observaciones),
    nitPropietario: aTexto(d.nitPropietario),
  };
}

interface Props {
  onClose: () => void;
  /** Si llega, se edita ese inmueble. */
  id?: number;
  /** Solo en alta: proyecto y etapa del filtro activo, para no tener que elegirlos de nuevo. */
  proyectoInicial?: number;
  etapaInicial?: number;
}

export function InmuebleModal({ onClose, id, proyectoInicial, etapaInicial }: Props) {
  const detalle = useQuery({
    queryKey: ['inmueble', id],
    queryFn: () => fetchInmueble(id!),
    enabled: id !== undefined,
    gcTime: 0,
  });

  if (id !== undefined && !detalle.data) {
    return <FormModalCargando title="Editar inmueble" error={detalle.error?.message ?? null} onClose={onClose} />;
  }

  const inicial = detalle.data
    ? aCampos(detalle.data)
    : aCampos({ idProyecto: proyectoInicial, idEtapa: etapaInicial });
  return <InmuebleForm id={id} inicial={inicial} onClose={onClose} />;
}

function InmuebleForm({ id, inicial, onClose }: { id?: number; inicial: ReturnType<typeof aCampos>; onClose: () => void }) {
  const { data: cat, isLoading, error: catError } = useQuery({ queryKey: CATALOGOS_KEY, queryFn: fetchCatalogos });
  const { valores: v, set } = useCampos(inicial);
  const alta = useAlta((body: CrearInmueble) => (id !== undefined ? updateInmueble(id, body) : createInmueble(body)), onClose);

  const etapasProyecto = (cat?.etapas ?? []).filter((e) => String(e.idProyecto) === v.idProyecto);

  // Mismas formulas que el backend (Negocio.cs). Cuando se pueden calcular, mandan sobre lo digitado.
  const area = leer(v.areaPiso1);
  const valorComercial = leer(v.valorComercial);
  const avaluo = leer(v.avaluoCatastral);
  const tarifa = leer(v.tarifaCatastro);
  const m2Calculado = valorComercial !== null && area ? valorComercial / area : null;
  const predialCalculado = avaluo !== null && tarifa !== null ? (avaluo * tarifa) / 100 : null;
  const pctCatastral = avaluo !== null && valorComercial ? avaluo / valorComercial : null;

  const guardar = () =>
    alta.guardar((): CrearInmueble => {
      const numeroLocal = texto(v.numeroLocal);
      if (!numeroLocal) throw new ErrorFormulario('El numero de local es obligatorio.');
      return {
        idProyecto: idRequerido(v.idProyecto, 'el proyecto'),
        idEtapa: idSeleccionado(v.idEtapa),
        idEstado: idRequerido(v.idEstado, 'el estado'),
        idDestinacion: idRequerido(v.idDestinacion, 'la destinacion'),
        idTipoLocal: idRequerido(v.idTipoLocal, 'el uso'),
        idTipoInmueble: idRequerido(v.idTipoInmueble, 'el tipo de inmueble'),
        matriculaInmobiliaria: texto(v.matricula),
        numeroLocal,
        nivel: texto(v.nivel),
        mesanine: v.mesanine,
        pisos: entero(v.pisos, 'Pisos', { min: 0 }),
        areaPiso1: numero(v.areaPiso1, 'Area', { min: 0 }),
        areaLibrePriv: numero(v.areaLibrePriv, 'Area libre privada', { min: 0 }),
        coeficiente: numero(v.coeficiente, 'Coeficiente', { min: 0 }),
        valorComercial: numero(v.valorComercial, 'Valor comercial', { min: 0 }),
        valorM2Construido: m2Calculado !== null ? null : numero(v.valorM2Construido, 'Valor m2 construido', { min: 0 }),
        avaluoCatastral: numero(v.avaluoCatastral, 'Avaluo catastral', { min: 0 }),
        tarifaCatastro: numero(v.tarifaCatastro, 'Tarifa catastro', { min: 0 }),
        predialAnual: predialCalculado !== null ? null : numero(v.predialAnual, 'Predial anual', { min: 0 }),
        valorM2Admon: entero(v.valorM2Admon, 'Valor m2 administracion', { min: 0 }),
        observaciones: texto(v.observaciones),
        nitPropietario: texto(v.nitPropietario),
      };
    });

  return (
    <FormModal
      title={id !== undefined ? 'Editar inmueble' : 'Registrar inmueble'}
      subtitle="Los campos con * son obligatorios. Los valores derivados se calculan solos cuando hay datos para la formula."
      onClose={onClose}
      onSubmit={guardar}
      submitting={alta.guardando}
      error={alta.error ?? errorCatalogo(catError)}
      wide
    >
      <FormSection title="Ubicacion" cols={3}>
        <SelectField
          label="Proyecto"
          required
          value={v.idProyecto}
          onChange={(x) => {
            set('idProyecto', x);
            set('idEtapa', '');
          }}
          options={opciones(cat?.proyectos)}
          placeholder={isLoading ? 'Cargando...' : 'Seleccionar...'}
        />
        <SelectField
          label="Etapa"
          value={v.idEtapa}
          onChange={(x) => set('idEtapa', x)}
          options={opciones(etapasProyecto)}
          placeholder={etapasProyecto.length === 0 ? 'El proyecto no tiene etapas' : 'Sin etapa'}
          disabled={etapasProyecto.length === 0}
        />
        <TextField
          label="Numero de local"
          required
          value={v.numeroLocal}
          onChange={(x) => set('numeroLocal', x)}
          placeholder="Ej. 104"
          maxLength={100}
        />
        <TextField
          label="Matricula inmobiliaria"
          value={v.matricula}
          onChange={(x) => set('matricula', x)}
          placeholder="Ej. 1026190"
          maxLength={50}
        />
        <TextField label="Nivel" value={v.nivel} onChange={(x) => set('nivel', x)} placeholder="1, -3, M..." maxLength={10} />
        <NumberField label="Pisos" value={v.pisos} onChange={(x) => set('pisos', x)} placeholder="Ej. 1" />
      </FormSection>

      <FormSection title="Propietario" cols={1}>
        <SelectField
          label="Dueño del inmueble"
          value={v.nitPropietario}
          onChange={(x) => set('nitPropietario', x)}
          options={(cat?.arrendadores ?? []).map((c) => ({ value: c.nit, label: `${c.nombre} · ${c.nit}` }))}
          placeholder="Sin propietario"
          hint="¿No aparece? Registralo en Propietarios."
        />
      </FormSection>

      <FormSection title="Clasificacion" cols={4}>
        <SelectField label="Estado" required value={v.idEstado} onChange={(x) => set('idEstado', x)} options={opciones(cat?.estados)} />
        <SelectField
          label="Destinacion"
          required
          value={v.idDestinacion}
          onChange={(x) => set('idDestinacion', x)}
          options={opciones(cat?.destinaciones)}
        />
        <SelectField label="Uso" required value={v.idTipoLocal} onChange={(x) => set('idTipoLocal', x)} options={opciones(cat?.tiposLocal)} />
        <SelectField
          label="Tipo de inmueble"
          required
          value={v.idTipoInmueble}
          onChange={(x) => set('idTipoInmueble', x)}
          options={opciones(cat?.tiposInmueble)}
        />
      </FormSection>

      <FormSection title="Areas" cols={3}>
        <NumberField label="Area piso 1" value={v.areaPiso1} onChange={(x) => set('areaPiso1', x)} suffix="m²" />
        <NumberField label="Area libre privada" value={v.areaLibrePriv} onChange={(x) => set('areaLibrePriv', x)} suffix="m²" />
        <NumberField label="Coeficiente" value={v.coeficiente} onChange={(x) => set('coeficiente', x)} placeholder="Ej. 2,4779" />
        <CheckboxField label="Tiene mezanine" checked={v.mesanine} onChange={(x) => set('mesanine', x)} />
      </FormSection>

      <FormSection title="Valores" cols={3}>
        <NumberField label="Valor comercial" moneda value={v.valorComercial} onChange={(x) => set('valorComercial', x)} />
        <NumberField
          label="Valor m² construido"
          moneda={m2Calculado === null}
          value={m2Calculado !== null ? '' : v.valorM2Construido}
          onChange={(x) => set('valorM2Construido', x)}
          placeholder={m2Calculado !== null ? 'Se calcula: valor comercial / area' : 'Digitalo si no hay area o valor'}
          disabled={m2Calculado !== null}
        />
        <NumberField label="Valor m² administracion" moneda value={v.valorM2Admon} onChange={(x) => set('valorM2Admon', x)} />
        <NumberField label="Avaluo catastral" moneda value={v.avaluoCatastral} onChange={(x) => set('avaluoCatastral', x)} />
        <NumberField label="Tarifa catastro" value={v.tarifaCatastro} onChange={(x) => set('tarifaCatastro', x)} suffix="%" placeholder="Ej. 1,5" />
        <NumberField
          label="Predial anual"
          moneda={predialCalculado === null}
          value={predialCalculado !== null ? '' : v.predialAnual}
          onChange={(x) => set('predialAnual', x)}
          placeholder={predialCalculado !== null ? 'Se calcula: avaluo x tarifa' : 'Digitalo si no hay avaluo o tarifa'}
          disabled={predialCalculado !== null}
        />
        <FormPreview
          items={[
            { label: 'Valor m² construido', value: formatCurrency(m2Calculado ?? leer(v.valorM2Construido)) },
            { label: 'Predial anual', value: formatCurrency(predialCalculado ?? leer(v.predialAnual)) },
            { label: '% valor catastral', value: formatPercent(pctCatastral) },
          ]}
        />
      </FormSection>

      <FormSection cols={1}>
        <TextAreaField
          label="Observaciones"
          value={v.observaciones}
          onChange={(x) => set('observaciones', x)}
          placeholder="Direccion, ciudad, notas..."
        />
      </FormSection>
    </FormModal>
  );
}
