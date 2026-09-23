import { apiGet } from './client';

export interface ResumenKpis {
  canonMensual: number;
  egresosMensuales: number;
  ebitdaMensual: number;
  ocupacionPorcentaje: number;
  totalInmuebles: number;
  arrendados: number;
  disponibles: number;
  areaTotalM2: number;
}

export interface OcupacionProyecto {
  id: number;
  proyecto: string;
  inmuebles: number;
  arrendados: number;
  ocupacionPorcentaje: number;
  canonMensual: number;
}

export interface Alerta {
  tipo: string;
  titulo: string;
  contexto: string;
  motivo: string;
  detalle: string;
  severidad: 'danger' | 'warn' | string;
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

export interface ReportesResponse {
  canonPorProyecto: Distribucion[];
  canonPorTipoInmueble: Distribucion[];
  composicionEgresos: ComposicionEgresos[];
  vencimientosPorAnio: VencimientoAnio[];
}

export function fetchReportes(): Promise<ReportesResponse> {
  return apiGet<ReportesResponse>('/api/reportes');
}
