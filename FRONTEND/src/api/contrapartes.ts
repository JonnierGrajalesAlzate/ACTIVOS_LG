import { apiGet } from './client';
import type { PagedResult } from './inmuebles';

// ---- Arrendadores ----
export interface ArrendadorListItem {
  nit: string;
  nombre: string;
  inmuebles: number;
  contratos: number;
  giroMensual: number;
}

export interface ArrendadoresKpis {
  totalArrendadores: number;
  giroMensualTotal: number;
  inmueblesRepresentados: number;
}

export interface ArrendadoresResponse {
  pagina: PagedResult<ArrendadorListItem>;
  kpis: ArrendadoresKpis;
}

export function fetchArrendadores(query: {
  q?: string;
  orden?: string;
  dir?: 'asc' | 'desc';
  pagina?: number;
  tamano?: number;
}): Promise<ArrendadoresResponse> {
  return apiGet<ArrendadoresResponse>('/api/arrendadores', { ...query });
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
  contratosVencidos: number;
  vencenEn90Dias: number;
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
  vencenEn90Dias: number;
  vencidos: number;
  canonMensualTotal: number;
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
