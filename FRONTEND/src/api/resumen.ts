import { apiGet, apiPut } from './client';

/** Horizonte (dias) para considerar un contrato "por vencer". Debe coincidir con Negocio.DiasAlertaVencimiento. */
export const DIAS_ALERTA_VENCIMIENTO = 120;

export interface ResumenKpis {
  canonMensual: number;
  egresosMensuales: number;
  ebitdaMensual: number;
  ocupacionPorcentaje: number;
  totalInmuebles: number;
  arrendados: number;
  disponibles: number;
  areaTotalM2: number;
  /** Suma del valor comercial de todos los inmuebles. */
  valorPortafolio: number;
}

export interface OcupacionProyecto {
  id: number;
  proyecto: string;
  inmuebles: number;
  arrendados: number;
  ocupacionPorcentaje: number;
  canonMensual: number;
  etapas: number;
}

export interface Alerta {
  tipo: string;
  titulo: string;
  contexto: string;
  motivo: string;
  detalle: string;
  severidad: 'danger' | 'warn' | string;
  /** Solo en alertas `incremento-ipc`. */
  idContrato: number | null;
  canonActual: number | null;
  /** null si el IPC aun no esta configurado. */
  canonNuevo: number | null;
}

export interface ResumenResponse {
  kpis: ResumenKpis;
  ocupacionPorProyecto: OcupacionProyecto[];
  alertas: Alerta[];
}

export function fetchResumen(): Promise<ResumenResponse> {
  return apiGet<ResumenResponse>('/api/resumen');
}

export interface Distribucion {
  etiqueta: string;
  valor: number;
  conteo: number;
}

export interface ComposicionEgresos {
  concepto: string;
  valor: number;
}

export interface VencimientoAnio {
  anio: number;
  contratos: number;
  canonMensual: number;
}

export interface ProyectoFinanciero {
  id: number;
  proyecto: string;
  inmuebles: number;
  arrendados: number;
  ocupacionPorcentaje: number;
  canonMensual: number;
  egresosMensuales: number;
  ebitdaMensual: number;
  valorComercial: number;
}

export interface ReportesResponse {
  canonPorProyecto: Distribucion[];
  canonPorTipoInmueble: Distribucion[];
  composicionEgresos: ComposicionEgresos[];
  vencimientosPorAnio: VencimientoAnio[];
  proyectos: ProyectoFinanciero[];
}

export function fetchReportes(proyecto?: number): Promise<ReportesResponse> {
  return apiGet<ReportesResponse>('/api/reportes', { proyecto });
}

export interface Ipc {
  /** Porcentaje (5.2 = 5,2 %); null si no se ha configurado. */
  valor: number | null;
  fechaActualizacion: string | null;
  actualizadoPor: string | null;
}

export function fetchIpc(): Promise<Ipc> {
  return apiGet<Ipc>('/api/parametros/ipc');
}

export function actualizarIpc(valor: number): Promise<Ipc> {
  return apiPut<Ipc>('/api/parametros/ipc', { valor });
}
