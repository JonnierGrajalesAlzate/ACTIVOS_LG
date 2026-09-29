import { apiDelete, apiGet, apiPost, apiPut } from './client';
import type { PagedResult } from './inmuebles';

// ---- Propietarios ----
// En la base de datos y en la API se llaman "arrendadores" (tabla `arrendador`, `/api/arrendadores`);
// en la interfaz se muestran como propietarios. Los nombres de campos JSON siguen los del backend.
export interface PropietarioListItem {
  nit: string;
  nombre: string;
  inmuebles: number;
  contratos: number;
  giroMensual: number;
}

export interface PropietariosKpis {
  totalArrendadores: number;
  giroMensualTotal: number;
  inmueblesRepresentados: number;
}

export interface PropietariosResponse {
  pagina: PagedResult<PropietarioListItem>;
  kpis: PropietariosKpis;
}

export function fetchPropietarios(query: {
  q?: string;
  orden?: string;
  dir?: 'asc' | 'desc';
  pagina?: number;
  tamano?: number;
}): Promise<PropietariosResponse> {
  return apiGet<PropietariosResponse>('/api/arrendadores', { ...query });
}

/** Alta o edicion de propietario con los inmuebles de los que es dueño (reemplaza la lista anterior). */
export function guardarPropietario(
  nitExistente: string | undefined,
  body: { nit: string; nombre: string; inmuebles: number[] },
): Promise<{ nit: string; nombre: string }> {
  return nitExistente
    ? apiPut(`/api/arrendadores/${encodeURIComponent(nitExistente)}`, body)
    : apiPost('/api/arrendadores', body);
}

// ---- Contratos ----
export type GestionContrato = 'Vigente' | 'Por vencer' | 'Vencido' | 'Sin vencimiento';

export interface ContratoListItem {
  id: number;
  inmueble: string;
  proyecto: string;
  arrendatario: string | null;
  nitArrendatario: string | null;
  /** Propietario del inmueble (el backend lo expone como `arrendador`). */
  arrendador: string | null;
  marca: string | null;
  canonMensual: number | null;
  fechaContrato: string | null;
  proximoVencimiento: string | null;
  proximoIncremento: string | null;
  plazoAnios: number | null;
  tipoIncremento: string | null;
  diasRestantes: number | null;
  porcentajeTranscurrido: number | null;
  gestion: GestionContrato;
}

export interface ContratosKpis {
  contratosVigentes: number;
  vencenEn120Dias: number;
  canonMensualTotal: number;
}

export interface AplicarIncrementoResult {
  idContrato: number;
  canonAnterior: number;
  canonNuevo: number;
  proximoIncremento: string | null;
}

export function aplicarIncremento(idContrato: number): Promise<AplicarIncrementoResult> {
  return apiPost<AplicarIncrementoResult>(`/api/contratos/${idContrato}/aplicar-incremento`);
}

export interface ContratosResponse {
  pagina: PagedResult<ContratoListItem>;
  kpis: ContratosKpis;
}

// ---- Altas ----
export type TipoContraparte = 'propietario' | 'arrendatario';

const rutaContraparte = (tipo: TipoContraparte) => (tipo === 'propietario' ? '/api/arrendadores' : '/api/arrendatarios');

export function createContraparte(tipo: TipoContraparte, body: { nit: string; nombre: string }): Promise<{ nit: string; nombre: string }> {
  return apiPost(rutaContraparte(tipo), body);
}

/** El NIT es la llave: solo se puede cambiar el nombre. */
export function updateContraparte(tipo: TipoContraparte, nit: string, nombre: string): Promise<{ nit: string; nombre: string }> {
  return apiPut(`${rutaContraparte(tipo)}/${encodeURIComponent(nit)}`, { nit, nombre });
}

/** Falla (409) si la contraparte figura en contratos. */
export function deleteContraparte(tipo: TipoContraparte, nit: string): Promise<void> {
  return apiDelete(`${rutaContraparte(tipo)}/${encodeURIComponent(nit)}`);
}

/**
 * Porcentajes en porcentaje (1,74 = 1,74 %). Fechas `yyyy-MM-dd`. Si faltan, el backend calcula
 * vencimientos, proximo incremento, valor m2 canon y rental rate.
 */
export interface CrearContrato {
  idInmueble: number;
  nitArrendador: string | null;
  nitArrendatario: string | null;
  idMarca: number | null;
  idSeguro: number | null;
  fechaContrato: string | null;
  plazoAnios: number | null;
  vtoPrimeraVigencia: string | null;
  proximoVencimiento: string | null;
  proximoIncremento: string | null;
  canonActualMensual: number;
  tipoCanon: string | null;
  porcentajeCanonVariable: number | null;
  porcentajeVentas: number | null;
  tipoIncrementoActual: string | null;
  puntosAdicionalesIpc: number | null;
  incrementoAnual: string | null;
  admonIncrementaCanon: 'S' | 'N' | null;
  valorReembolsoAdmon: number | null;
  comisionEntidad: 'S' | 'N' | null;
  porcentajeComisionEntidad: number | null;
  porcentSeguro: number | null;
  observaciones: string | null;
  marcarArrendado: boolean;
}

export function createContrato(body: CrearContrato): Promise<{ id: number }> {
  return apiPost('/api/contratos', body);
}

/** En `datos.canonActualMensual` puede venir null en contratos cargados sin canon. */
export interface ContratoDetalle {
  idProyecto: number;
  datos: Omit<CrearContrato, 'canonActualMensual'> & { canonActualMensual: number | null };
}

export function fetchContrato(id: number): Promise<ContratoDetalle> {
  return apiGet<ContratoDetalle>(`/api/contratos/${id}`);
}

export function updateContrato(id: number, body: CrearContrato): Promise<{ id: number }> {
  return apiPut(`/api/contratos/${id}`, body);
}

/** Tambien elimina el historial de incrementos del contrato. */
export function deleteContrato(id: number): Promise<void> {
  return apiDelete(`/api/contratos/${id}`);
}

export function fetchContratos(query: {
  proyecto?: number;
  /** NIT del arrendatario. */
  arrendatario?: string;
  gestion?: string;
  q?: string;
  orden?: string;
  dir?: 'asc' | 'desc';
  pagina?: number;
  tamano?: number;
}): Promise<ContratosResponse> {
  return apiGet<ContratosResponse>('/api/contratos', { ...query });
}
