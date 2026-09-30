import { apiDelete, apiGet, apiPost, apiPut } from './client';
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

/** Perfil de egresos (uno por inmueble). Total, EBITDA y cap rate los calcula el backend. */
export interface CrearEgreso {
  idInmueble: number;
  numeroContratoServicio: string | null;
  predialMensual: number | null;
  seguroArriendo: number | null;
  comisionAdministracionInmobiliaria: number | null;
  camVacante: number | null;
  gravamenMovimientosFinancieros: number | null;
  comisionFiduciaria: number | null;
  reembolsosTerceros: number | null;
  mantenimientoMenor: number | null;
}

export function createEgreso(body: CrearEgreso): Promise<{ id: number }> {
  return apiPost('/api/egresos', body);
}

export interface EgresoDetalle {
  idProyecto: number;
  datos: CrearEgreso;
}

export function fetchEgreso(id: number): Promise<EgresoDetalle> {
  return apiGet<EgresoDetalle>(`/api/egresos/${id}`);
}

export function updateEgreso(id: number, body: CrearEgreso): Promise<{ id: number }> {
  return apiPut(`/api/egresos/${id}`, body);
}

export function deleteEgreso(id: number): Promise<void> {
  return apiDelete(`/api/egresos/${id}`);
}
