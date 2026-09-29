import { useQuery } from '@tanstack/react-query';
import {
  CATALOGO_INMUEBLES_KEY,
  CATALOGOS_KEY,
  fetchCatalogos,
  fetchInmueblesOpciones,
  type Contraparte,
  type Opcion,
} from '../../api/catalogos';
import {
  createContrato,
  fetchContrato,
  updateContrato,
  type ContratoDetalle,
  type CrearContrato,
} from '../../api/contrapartes';
import { formatCurrency, formatDate, formatPercent, parseNumero } from '../../utils/format';
import {
  CheckboxField,
  DateField,
  FormModal,
  FormModalCargando,
  FormPreview,
  FormSection,
  NumberField,
  SelectField,
  TextAreaField,
  TextField,
  type SelectOption,
} from '../forms/FormModal';
import {
  ErrorFormulario,
  SI_NO_OPTIONS,
  aTexto,
  entero,
  errorCatalogo,
  idRequerido,
  idSeleccionado,
  numero,
  texto,
  useAlta,
  useCampos,
} from '../forms/formUtils';

const SIN_INCREMENTO = 'Sin incremento';
const TIPOS_CANON = ['Fijo', 'Variable', 'Mixto'];
const TIPOS_INCREMENTO = ['IPC', 'Fijo', SIN_INCREMENTO];

/** Opciones fijas mas el valor actual si es uno heredado del Excel que no esta en la lista. */
function conValorActual(base: string[], actual: string): SelectOption[] {
  const valores = actual && !base.includes(actual) ? [...base, actual] : base;
  return valores.map((t) => ({ value: t, label: t }));
}

const opciones = (items: Opcion[] | undefined) => (items ?? []).map((o) => ({ value: String(o.id), label: o.nombre }));
const contrapartes = (items: Contraparte[] | undefined) =>
  (items ?? []).map((c) => ({ value: c.nit, label: `${c.nombre} · ${c.nit}` }));

function leer(valor: string): number | null {
  const n = parseNumero(valor);
  return n === null || Number.isNaN(n) ? null : n;
}

/** yyyy-MM-dd + n anios (29-feb pasa a 28-feb, igual que DateOnly.AddYears) + dias. */
function sumarFecha(iso: string, anios: number, dias = 0): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const y = Number(m[1]) + anios;
  const mes = Number(m[2]) - 1;
  const ultimoDia = new Date(Date.UTC(y, mes + 1, 0)).getUTCDate();
  const fecha = new Date(Date.UTC(y, mes, Math.min(Number(m[3]), ultimoDia)));
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

function aCampos(d?: ContratoDetalle) {
  const x: Partial<ContratoDetalle['datos']> = d?.datos ?? {};
  return {
    idProyecto: aTexto(d?.idProyecto),
    idInmueble: aTexto(x.idInmueble),
    // En alta se marca por defecto; al editar, el estado del inmueble no se toca salvo que se pida.
    marcarArrendado: d === undefined,
    nitArrendador: aTexto(x.nitArrendador),
    nitArrendatario: aTexto(x.nitArrendatario),
    idMarca: aTexto(x.idMarca),
    idSeguro: aTexto(x.idSeguro),
    porcentSeguro: aTexto(x.porcentSeguro),
    fechaContrato: aTexto(x.fechaContrato),
    plazoAnios: aTexto(x.plazoAnios),
    vtoPrimeraVigencia: aTexto(x.vtoPrimeraVigencia),
    proximoVencimiento: aTexto(x.proximoVencimiento),
    proximoIncremento: aTexto(x.proximoIncremento),
    canonActualMensual: aTexto(x.canonActualMensual),
    tipoCanon: aTexto(x.tipoCanon),
    porcentajeCanonVariable: aTexto(x.porcentajeCanonVariable),
    porcentajeVentas: aTexto(x.porcentajeVentas),
    tipoIncrementoActual: d === undefined ? 'IPC' : (x.tipoIncrementoActual ?? SIN_INCREMENTO),
    puntosAdicionalesIpc: aTexto(x.puntosAdicionalesIpc),
    incrementoAnual: aTexto(x.incrementoAnual),
    admonIncrementaCanon: aTexto(x.admonIncrementaCanon),
    valorReembolsoAdmon: aTexto(x.valorReembolsoAdmon),
    comisionEntidad: aTexto(x.comisionEntidad),
    porcentajeComisionEntidad: aTexto(x.porcentajeComisionEntidad),
    observaciones: aTexto(x.observaciones),
  };
}

interface ContratoModalProps {
  id?: number;
  onClose: () => void;
  /** Solo en alta: NIT del arrendatario del filtro activo, para no tener que elegirlo de nuevo. */
  arrendatarioInicial?: string;
}

export function ContratoModal({ id, onClose, arrendatarioInicial }: ContratoModalProps) {
  const detalle = useQuery({
    queryKey: ['contrato', id],
    queryFn: () => fetchContrato(id!),
    enabled: id !== undefined,
    gcTime: 0,
  });

  if (id !== undefined && !detalle.data) {
    return <FormModalCargando title="Editar contrato" error={detalle.error?.message ?? null} onClose={onClose} />;
  }
  const inicial = aCampos(detalle.data);
  if (id === undefined && arrendatarioInicial) inicial.nitArrendatario = arrendatarioInicial;
  return <ContratoForm id={id} inicial={inicial} onClose={onClose} />;
}

function ContratoForm({ id, inicial, onClose }: { id?: number; inicial: ReturnType<typeof aCampos>; onClose: () => void }) {
  const { valores: v, set } = useCampos(inicial);

  const { data: cat, error: catError } = useQuery({ queryKey: CATALOGOS_KEY, queryFn: fetchCatalogos });
  const proyecto = v.idProyecto ? Number(v.idProyecto) : undefined;
  const { data: inmuebles, isFetching } = useQuery({
    queryKey: [CATALOGO_INMUEBLES_KEY, proyecto ?? null],
    queryFn: () => fetchInmueblesOpciones(proyecto),
    enabled: proyecto !== undefined,
  });
  const inmueble = (inmuebles ?? []).find((i) => String(i.id) === v.idInmueble);

  const alta = useAlta((body: CrearContrato) => (id !== undefined ? updateContrato(id, body) : createContrato(body)), onClose);

  // Previsualizacion con las mismas reglas del backend.
  const canon = leer(v.canonActualMensual);
  const plazo = leer(v.plazoAnios);
  const vtoAuto = v.fechaContrato && plazo && Number.isInteger(plazo) ? sumarFecha(v.fechaContrato, plazo, -1) : null;
  const vto = v.vtoPrimeraVigencia || vtoAuto;
  const valorM2Canon = canon !== null && inmueble?.areaM2 ? canon / inmueble.areaM2 : null;
  const rentalRate = canon !== null && inmueble?.valorComercial ? canon / inmueble.valorComercial : null;
  const esIpc = v.tipoIncrementoActual.toUpperCase().includes('IPC');
  const esVariable = v.tipoCanon === 'Variable' || v.tipoCanon === 'Mixto';
  // Un contrato heredado puede tener % variable sin tipo de canon: no se esconde lo que ya existe.
  const variableHabilitado = esVariable || ((!!inicial.porcentajeCanonVariable || !!inicial.porcentajeVentas) && !v.tipoCanon);

  const guardar = () =>
    alta.guardar((): CrearContrato => {
      const idInmueble = idRequerido(v.idInmueble, 'el inmueble');
      const canonMensual = numero(v.canonActualMensual, 'Canon mensual', { requerido: true, min: 0 })!;
      if (canonMensual <= 0) throw new ErrorFormulario('El canon mensual debe ser mayor que cero.');
      if (v.fechaContrato && v.vtoPrimeraVigencia && v.vtoPrimeraVigencia <= v.fechaContrato) {
        throw new ErrorFormulario('El vencimiento de la primera vigencia debe ser posterior a la fecha del contrato.');
      }
      const tipoIncremento = texto(v.tipoIncrementoActual);
      return {
        idInmueble,
        nitArrendador: texto(v.nitArrendador),
        nitArrendatario: texto(v.nitArrendatario),
        idMarca: idSeleccionado(v.idMarca),
        idSeguro: idSeleccionado(v.idSeguro),
        fechaContrato: texto(v.fechaContrato),
        plazoAnios: entero(v.plazoAnios, 'Plazo', { min: 1 }),
        vtoPrimeraVigencia: texto(v.vtoPrimeraVigencia),
        proximoVencimiento: texto(v.proximoVencimiento),
        proximoIncremento: texto(v.proximoIncremento),
        canonActualMensual: canonMensual,
        tipoCanon: texto(v.tipoCanon),
        // Los campos deshabilitados no se envian aunque tengan un valor escrito antes.
        porcentajeCanonVariable: variableHabilitado ? numero(v.porcentajeCanonVariable, '% canon variable', { min: 0 }) : null,
        porcentajeVentas: variableHabilitado ? numero(v.porcentajeVentas, '% sobre ventas', { min: 0 }) : null,
        // "Sin incremento" no se guarda como tipo: la columna queda vacia.
        tipoIncrementoActual: tipoIncremento === SIN_INCREMENTO ? null : tipoIncremento,
        puntosAdicionalesIpc: esIpc ? numero(v.puntosAdicionalesIpc, 'Puntos adicionales', { min: 0 }) : null,
        incrementoAnual: texto(v.incrementoAnual),
        admonIncrementaCanon: (texto(v.admonIncrementaCanon) as 'S' | 'N' | null) ?? null,
        valorReembolsoAdmon: numero(v.valorReembolsoAdmon, 'Reembolso administracion', { min: 0 }),
        comisionEntidad: (texto(v.comisionEntidad) as 'S' | 'N' | null) ?? null,
        porcentajeComisionEntidad:
          v.comisionEntidad === 'S' ? numero(v.porcentajeComisionEntidad, '% comision entidad', { min: 0 }) : null,
        porcentSeguro: numero(v.porcentSeguro, '% seguro', { min: 0 }),
        observaciones: texto(v.observaciones),
        marcarArrendado: v.marcarArrendado,
      };
    });

  return (
    <FormModal
      title={id !== undefined ? 'Editar contrato' : 'Nuevo contrato'}
      subtitle="Contrato de arrendamiento de un inmueble. Las fechas vacias se calculan a partir de la fecha y el plazo."
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
          options={opciones(cat?.proyectos)}
        />
        <SelectField
          label="Inmueble"
          required
          value={v.idInmueble}
          onChange={(x) => {
            set('idInmueble', x);
            // El dueño del inmueble es el propietario por defecto del contrato.
            const elegido = (inmuebles ?? []).find((i) => String(i.id) === x);
            if (elegido?.nitPropietario && !v.nitArrendador) set('nitArrendador', elegido.nitPropietario);
          }}
          options={(inmuebles ?? []).map((i) => ({
            value: String(i.id),
            label: i.matricula ? `${i.nombre} · Mat. ${i.matricula}` : i.nombre,
          }))}
          placeholder={!proyecto ? 'Primero elige el proyecto' : isFetching ? 'Cargando...' : 'Seleccionar...'}
          disabled={!proyecto}
          hint={
            id === undefined && inmueble?.canonActual
              ? `Ya tiene contrato con canon ${formatCurrency(inmueble.canonActual)}.`
              : undefined
          }
        />
        <CheckboxField
          label="Marcar el inmueble como Arrendado"
          checked={v.marcarArrendado}
          onChange={(x) => set('marcarArrendado', x)}
        />
      </FormSection>

      <FormSection title="Partes y seguro" cols={3}>
        <SelectField
          label="Propietario (arrendador)"
          value={v.nitArrendador}
          onChange={(x) => set('nitArrendador', x)}
          options={contrapartes(cat?.arrendadores)}
          placeholder="Sin propietario"
          hint="¿No aparece? Registralo en Propietarios."
        />
        <SelectField
          label="Arrendatario"
          value={v.nitArrendatario}
          onChange={(x) => set('nitArrendatario', x)}
          options={contrapartes(cat?.arrendatarios)}
          placeholder="Sin arrendatario"
          hint="¿No aparece? Registralo con + Nuevo arrendatario, junto al filtro de Contratos."
        />
        <SelectField label="Marca" value={v.idMarca} onChange={(x) => set('idMarca', x)} options={opciones(cat?.marcas)} placeholder="Sin marca" />
        <SelectField
          label="Aseguradora"
          value={v.idSeguro}
          onChange={(x) => set('idSeguro', x)}
          options={opciones(cat?.seguros)}
          placeholder="Sin seguro"
        />
        <NumberField label="% seguro" value={v.porcentSeguro} onChange={(x) => set('porcentSeguro', x)} suffix="%" placeholder="Ej. 1,74" />
      </FormSection>

      <FormSection title="Vigencia" cols={3}>
        <DateField label="Fecha del contrato" value={v.fechaContrato} onChange={(x) => set('fechaContrato', x)} />
        <NumberField label="Plazo" value={v.plazoAnios} onChange={(x) => set('plazoAnios', x)} suffix="años" placeholder="Ej. 5" />
        <DateField
          label="Vto. primera vigencia"
          value={v.vtoPrimeraVigencia}
          onChange={(x) => set('vtoPrimeraVigencia', x)}
          hint={!v.vtoPrimeraVigencia && vtoAuto ? `Vacio = ${formatDate(vtoAuto)}` : undefined}
        />
        <DateField
          label="Proximo vencimiento"
          value={v.proximoVencimiento}
          onChange={(x) => set('proximoVencimiento', x)}
          hint={!v.proximoVencimiento && vto ? `Vacio = ${formatDate(vto)}` : undefined}
        />
        <DateField
          label="Proximo incremento"
          value={v.proximoIncremento}
          onChange={(x) => set('proximoIncremento', x)}
          hint={
            !v.proximoIncremento && v.fechaContrato && v.tipoIncrementoActual !== SIN_INCREMENTO
              ? 'Vacio = siguiente aniversario del contrato'
              : undefined
          }
        />
      </FormSection>

      <FormSection title="Canon" cols={4}>
        <NumberField label="Canon mensual" required moneda value={v.canonActualMensual} onChange={(x) => set('canonActualMensual', x)} />
        <SelectField
          label="Tipo de canon"
          value={v.tipoCanon}
          onChange={(x) => set('tipoCanon', x)}
          options={conValorActual(TIPOS_CANON, inicial.tipoCanon)}
          placeholder="Sin definir"
        />
        <NumberField
          label="% canon variable"
          value={v.porcentajeCanonVariable}
          onChange={(x) => set('porcentajeCanonVariable', x)}
          suffix="%"
          disabled={!variableHabilitado}
        />
        <NumberField
          label="% sobre ventas"
          value={v.porcentajeVentas}
          onChange={(x) => set('porcentajeVentas', x)}
          suffix="%"
          disabled={!variableHabilitado}
        />
        <FormPreview
          items={[
            { label: 'Valor m² canon', value: inmueble?.areaM2 ? formatCurrency(valorM2Canon) : 'Sin area' },
            { label: 'Rental rate', value: inmueble?.valorComercial ? formatPercent(rentalRate) : 'Sin valor comercial' },
          ]}
        />
      </FormSection>

      <FormSection title="Incremento y administracion" cols={3}>
        <SelectField
          label="Tipo de incremento"
          value={v.tipoIncrementoActual}
          onChange={(x) => set('tipoIncrementoActual', x)}
          options={conValorActual(TIPOS_INCREMENTO, inicial.tipoIncrementoActual)}
          placeholder="Sin definir"
        />
        <NumberField
          label="Puntos adicionales IPC"
          value={v.puntosAdicionalesIpc}
          onChange={(x) => set('puntosAdicionalesIpc', x)}
          suffix="%"
          placeholder="Ej. 1"
          disabled={!esIpc}
        />
        <TextField
          label="Incremento anual"
          value={v.incrementoAnual}
          onChange={(x) => set('incrementoAnual', x)}
          placeholder="Ej. IPC + 1 punto"
          maxLength={100}
        />
        <SelectField
          label="Admon incrementa canon"
          value={v.admonIncrementaCanon}
          onChange={(x) => set('admonIncrementaCanon', x)}
          options={SI_NO_OPTIONS}
          placeholder="Sin definir"
        />
        <NumberField label="Reembolso administracion" moneda value={v.valorReembolsoAdmon} onChange={(x) => set('valorReembolsoAdmon', x)} />
      </FormSection>

      <FormSection title="Comision" cols={3}>
        <SelectField
          label="Comision entidad"
          value={v.comisionEntidad}
          onChange={(x) => set('comisionEntidad', x)}
          options={SI_NO_OPTIONS}
          placeholder="Sin definir"
        />
        <NumberField
          label="% comision entidad"
          value={v.porcentajeComisionEntidad}
          onChange={(x) => set('porcentajeComisionEntidad', x)}
          suffix="%"
          disabled={v.comisionEntidad !== 'S'}
        />
      </FormSection>

      <FormSection cols={1}>
        <TextAreaField label="Observaciones" value={v.observaciones} onChange={(x) => set('observaciones', x)} />
      </FormSection>
    </FormModal>
  );
}
