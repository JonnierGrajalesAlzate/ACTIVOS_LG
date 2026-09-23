import { apiGet, apiPost } from './client';

export interface InmuebleListItem {
  id: number;
  nombre: string;
  proyecto: string;
  arrendatario: string | null;
  areaM2: number | null;
  canonMensual: number | null;
  proximoVencimiento: string | null;
  estado: string;
  contratoVencido: boolean;
}

export interface InmueblesKpis {
  canonMensualTotal: number;
  areaTotalM2: number;
  ocupacionPorcentaje: number;
  vencenEn90Dias: number;
  contratosVencidos: number;
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

export interface InmueblesQuery {
  proyecto?: number;
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

export function createProyecto(nombre: string): Promise<Proyecto> {
  return apiPost<Proyecto>('/api/inmuebles/proyectos', { nombre });
}
