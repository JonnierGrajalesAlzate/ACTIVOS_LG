import { apiGet, apiPost } from './client';
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

// ---- Arrendatarios ----
export interface ArrendatarioListItem {
  nit: string;
  nombre: string;
  inmuebles: number;
  principalInmueble: string | null;
  principalProyecto: string | null;
  canonMensual: number;
  proximoVencimiento: string | null;
  contratoVencido: boolean;
}

export interface ArrendatariosKpis {
  totalArrendatarios: number;
  canonMensualTotal: number;
  vencenEn120Dias: number;
}

export interface ArrendatariosResponse {
  pagina: PagedResult<ArrendatarioListItem>;
  kpis: ArrendatariosKpis;
}

export function fetchArrendatarios(query: {
  q?: string;
  orden?: string;
  dir?: 'asc' | 'desc';
  pagina?: number;
  tamano?: number;
}): Promise<ArrendatariosResponse> {
  return apiGet<ArrendatariosResponse>('/api/arrendatarios', { ...query });
}

// ---- Contratos ----
export type GestionContrato = 'Vigente' | 'Por vencer' | 'Vencido' | 'Sin vencimiento';

export interface ContratoListItem {
  id: number;
  inmueble: string;
  proyecto: string;
  arrendatario: string | null;
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

export function fetchContratos(query: {
  proyecto?: number;
  gestion?: string;
  q?: string;
  orden?: string;
  dir?: 'asc' | 'desc';
  pagina?: number;
  tamano?: number;
}): Promise<ContratosResponse> {
  return apiGet<ContratosResponse>('/api/contratos', { ...query });
}
