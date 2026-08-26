import { apiGet } from './client';
import type { PagedResult } from './inmuebles';

export interface EgresoListItem {
  id: number;
  idInmueble: number;
  inmueble: string;
  proyecto: string;
  estadoInmueble: string;
  predialMensual: number | null;
  seguroArriendo: number | null;
  comisionAdministracion: number | null;
  camVacante: number | null;
  comisionFiduciaria: number | null;
  mantenimientoMenor: number | null;
  totalEgresos: number | null;
  ebitda: number | null;
  rentabilidadCapRate: number | null;
}

export interface EgresosKpis {
  totalEgresos: number;
  totalEbitda: number;
  predialTotal: number;
  inmueblesEnPerdida: number;
}

export interface EgresosResponse {
  pagina: PagedResult<EgresoListItem>;
  kpis: EgresosKpis;
}

export interface EgresosQuery {
  proyecto?: number;
  q?: string;
  orden?: string;
  dir?: 'asc' | 'desc';
  pagina?: number;
  tamano?: number;
}

export function fetchEgresos(query: EgresosQuery): Promise<EgresosResponse> {
  return apiGet<EgresosResponse>('/api/egresos', { ...query });
}
