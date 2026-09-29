import { apiGet } from './client';

export interface Opcion {
  id: number;
  nombre: string;
}

export interface EtapaOpcion extends Opcion {
  idProyecto: number;
}

export interface Contraparte {
  nit: string;
  nombre: string;
}

/** Listas para los desplegables de los formularios de alta. */
export interface Catalogos {
  proyectos: Opcion[];
  etapas: EtapaOpcion[];
  estados: Opcion[];
  destinaciones: Opcion[];
  /** Catalogo `tipo_local`: en el Excel de origen es la columna USO. */
  tiposLocal: Opcion[];
  tiposInmueble: Opcion[];
  marcas: Opcion[];
  seguros: Opcion[];
  arrendadores: Contraparte[];
  arrendatarios: Contraparte[];
}

/** Inmueble para elegir en los formularios de egreso y contrato. */
export interface InmuebleOpcion {
  id: number;
  nombre: string;
  idProyecto: number;
  proyecto: string;
  matricula: string | null;
  areaM2: number | null;
  valorComercial: number | null;
  predialAnual: number | null;
  /** Canon del contrato mas reciente. */
  canonActual: number | null;
  tieneEgreso: boolean;
  /** Dueño del inmueble (tabla arrendador). */
  nitPropietario: string | null;
  propietario: string | null;
}

export const CATALOGOS_KEY = ['catalogos'];
export const CATALOGO_INMUEBLES_KEY = 'catalogo-inmuebles';

export function fetchCatalogos(): Promise<Catalogos> {
  return apiGet<Catalogos>('/api/catalogos');
}

export function fetchInmueblesOpciones(proyecto?: number): Promise<InmuebleOpcion[]> {
  return apiGet<InmuebleOpcion[]>('/api/catalogos/inmuebles', { proyecto });
}
