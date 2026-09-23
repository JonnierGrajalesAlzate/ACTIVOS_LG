import { apiGet, apiPost } from './client';

export interface InmuebleListItem {
  id: number;
  nombre: string;
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
