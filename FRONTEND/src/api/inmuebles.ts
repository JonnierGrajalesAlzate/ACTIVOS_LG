import { apiDelete, apiGet, apiPost, apiPut } from './client';

export interface InmuebleListItem {
  id: number;
  /** Uso + numero de local ("Comercio 104"), para textos y confirmaciones. */
  nombre: string;
  numeroLocal: string | null;
  /** Piso o nivel: "1", "-3", "M"... */
  nivel: string | null;
  /** Tipo de inmueble: Local, Oficina, Consultorio... */
  tipologia: string;
  uso: string;
  tieneLeasing: boolean;
  observaciones: string | null;
  proyecto: string;
  etapa: string | null;
  arrendatario: string | null;
  areaM2: number | null;
  canonMensual: number | null;
  /** Canon mensual / valor comercial del contrato vigente (fraccion: 0.0096 = 0,96 %). */
  rentalRate: number | null;
  proximoVencimiento: string | null;
  estado: string;
  contratoVencido: boolean;
}

export interface InmueblesKpis {
  canonMensualTotal: number;
  areaTotalM2: number;
  ocupacionPorcentaje: number;
  vencenEn120Dias: number;
}

export interface EstadoConteo {
  estado: string;
  conteo: number;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface InmueblesResponse {
  pagina: PagedResult<InmuebleListItem>;
  kpis: InmueblesKpis;
  estados: EstadoConteo[];
}

export interface Proyecto {
  id: number;
  nombre: string;
}

/** Tarjeta de etapa. `id === SIN_ETAPA` agrupa los inmuebles del proyecto sin etapa asignada. */
export interface EtapaResumen {
  id: number;
  nombre: string;
  inmuebles: number;
  arrendados: number;
  ocupacionPorcentaje: number;
  canonMensual: number;
}

export interface ProyectoEtapas {
  id: number;
  nombre: string;
  etapas: EtapaResumen[];
}

export const SIN_ETAPA = 0;

export interface InmueblesQuery {
  proyecto?: number;
  etapa?: number;
  estado?: string;
  leasing?: 'si' | 'no';
  q?: string;
  orden?: string;
  dir?: 'asc' | 'desc';
  pagina?: number;
  tamano?: number;
}

export function fetchInmuebles(query: InmueblesQuery): Promise<InmueblesResponse> {
  return apiGet<InmueblesResponse>('/api/inmuebles', {
    proyecto: query.proyecto,
    etapa: query.etapa,
    estado: query.estado,
    leasing: query.leasing,
    q: query.q,
    orden: query.orden,
    dir: query.dir,
    pagina: query.pagina,
    tamano: query.tamano,
  });
}

export function fetchProyectos(): Promise<Proyecto[]> {
  return apiGet<Proyecto[]>('/api/inmuebles/proyectos');
}

export function fetchEtapas(proyectoId: number): Promise<ProyectoEtapas> {
  return apiGet<ProyectoEtapas>(`/api/inmuebles/proyectos/${proyectoId}/etapas`);
}

export function createProyecto(nombre: string): Promise<Proyecto> {
  return apiPost<Proyecto>('/api/inmuebles/proyectos', { nombre });
}

export function updateProyecto(id: number, nombre: string): Promise<Proyecto> {
  return apiPut<Proyecto>(`/api/inmuebles/proyectos/${id}`, { nombre });
}

/** Falla (409) si el proyecto tiene inmuebles; sus etapas se eliminan con el. */
export function deleteProyecto(id: number): Promise<void> {
  return apiDelete(`/api/inmuebles/proyectos/${id}`);
}

export interface Etapa {
  id: number;
  idProyecto: number;
  nombre: string;
}

export function createEtapa(proyectoId: number, nombre: string): Promise<Etapa> {
  return apiPost<Etapa>(`/api/inmuebles/proyectos/${proyectoId}/etapas`, { nombre });
}

export function updateEtapa(id: number, nombre: string): Promise<Etapa> {
  return apiPut<Etapa>(`/api/inmuebles/etapas/${id}`, { nombre });
}

/** Falla (409) si la etapa tiene inmuebles asignados. */
export function deleteEtapa(id: number): Promise<void> {
  return apiDelete(`/api/inmuebles/etapas/${id}`);
}

export interface IncrementoCanon {
  fechaIncremento: string;
  canonAnterior: number;
  canonNuevo: number;
  /** Fraccion: 0.052 = 5,2 %. */
  ipc: number;
  puntosAdicionales: number | null;
  aplicadoPor: string | null;
}

export interface HistorialContrato {
  id: number;
  arrendatario: string | null;
  nitArrendatario: string | null;
  marca: string | null;
  fechaContrato: string | null;
  plazoAnios: number | null;
  proximoVencimiento: string | null;
  canonMensual: number | null;
  observaciones: string | null;
  /** El contrato mas reciente: el que cuenta como vigente. */
  actual: boolean;
  incrementos: IncrementoCanon[];
}

export interface HistorialInmueble {
  id: number;
  inmueble: string;
  proyecto: string;
  contratos: HistorialContrato[];
}

export function fetchHistorialInmueble(id: number): Promise<HistorialInmueble> {
  return apiGet<HistorialInmueble>(`/api/inmuebles/${id}/historial`);
}

/** Porcentajes en porcentaje (1,5 = 1,5 %). Los campos derivados que falten los calcula el backend. */
export interface CrearInmueble {
  idProyecto: number;
  idEtapa: number | null;
  idEstado: number;
  idDestinacion: number;
  idTipoLocal: number;
  idTipoInmueble: number;
  matriculaInmobiliaria: string | null;
  numeroLocal: string;
  nivel: string | null;
  mesanine: boolean;
  pisos: number | null;
  areaPiso1: number | null;
  areaLibrePriv: number | null;
  coeficiente: number | null;
  valorComercial: number | null;
  valorM2Construido: number | null;
  avaluoCatastral: number | null;
  tarifaCatastro: number | null;
  predialAnual: number | null;
  valorM2Admon: number | null;
  observaciones: string | null;
  /** NIT del propietario (dueño) del inmueble. */
  nitPropietario: string | null;
}

export function createInmueble(body: CrearInmueble): Promise<{ id: number; nombre: string }> {
  return apiPost('/api/inmuebles', body);
}

/** Datos del inmueble para editar, con la misma forma que el alta. */
export function fetchInmueble(id: number): Promise<CrearInmueble> {
  return apiGet<CrearInmueble>(`/api/inmuebles/${id}`);
}

export function updateInmueble(id: number, body: CrearInmueble): Promise<{ id: number; nombre: string }> {
  return apiPut(`/api/inmuebles/${id}`, body);
}

/** Falla (409) si el inmueble tiene contratos, leasing o administracion; su egreso se elimina con el. */
export function deleteInmueble(id: number): Promise<void> {
  return apiDelete(`/api/inmuebles/${id}`);
}
