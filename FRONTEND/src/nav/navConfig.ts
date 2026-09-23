import {
  BarChart3,
  Banknote,
  Building2,
  FileText,
  FolderUp,
  LayoutGrid,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react';

export type TabId =
  | 'inicio'
  | 'inmuebles'
  | 'alertas'
  | 'egresos'
  | 'propietarios'
  | 'arrendatarios'
  | 'contratos'
  | 'reportes'
  | 'carga'
  | 'config';

export interface NavItem {
  id: TabId;
  path: string;
  label: string;
  icon: LucideIcon;
  group: 'Portafolio' | 'Contrapartes' | 'Administracion';
}

export const navItems: NavItem[] = [
  { id: 'inicio', path: '/inicio', label: 'Inicio', icon: LayoutGrid, group: 'Portafolio' },
  { id: 'inmuebles', path: '/inmuebles', label: 'Inmuebles', icon: Building2, group: 'Portafolio' },
  { id: 'egresos', path: '/egresos', label: 'Egresos', icon: Banknote, group: 'Portafolio' },
  { id: 'propietarios', path: '/propietarios', label: 'Propietarios', icon: Users, group: 'Contrapartes' },
  { id: 'contratos', path: '/contratos', label: 'Contratos', icon: FileText, group: 'Contrapartes' },
  { id: 'reportes', path: '/reportes', label: 'Reportes', icon: BarChart3, group: 'Contrapartes' },
  { id: 'carga', path: '/carga', label: 'Cargar Excel', icon: FolderUp, group: 'Administracion' },
  { id: 'config', path: '/config', label: 'Configuracion', icon: Settings, group: 'Administracion' },
];

export const navGroups: Array<NavItem['group']> = ['Portafolio', 'Contrapartes', 'Administracion'];

export interface PageMeta {
  title: string;
  subtitle: string;
  actionLabel: string;
}

export const pageMeta: Record<TabId, PageMeta> = {
  inicio: { title: 'Inicio', subtitle: '', actionLabel: '+ Registrar proyecto' },
  inmuebles: { title: 'Inmuebles', subtitle: 'Inventario de predios', actionLabel: '+ Registrar inmueble' },
  alertas: { title: 'Alertas', subtitle: 'Incrementos IPC, contratos por vencer y vacantes en perdida', actionLabel: 'Actualizar' },
  egresos: { title: 'Egresos', subtitle: 'Costo mensual por inmueble', actionLabel: '+ Registrar egreso' },
  propietarios: { title: 'Propietarios', subtitle: 'Dueños de los inmuebles', actionLabel: '+ Nuevo propietario' },
  arrendatarios: { title: 'Arrendatarios', subtitle: 'Contrapartes de arrendamiento', actionLabel: '+ Nuevo arrendatario' },
  contratos: { title: 'Contratos', subtitle: 'Vigencia, vencimientos y arrendatarios', actionLabel: '+ Nuevo contrato' },
  reportes: { title: 'Reportes', subtitle: 'Distribucion del portafolio y ocupacion', actionLabel: '+ Informe a medida' },
  carga: { title: 'Cargar Excel', subtitle: 'Importa inventario, contratos o egresos', actionLabel: 'Ver plantillas' },
  config: { title: 'Configuracion', subtitle: 'Organizacion, alertas y usuarios', actionLabel: 'Guardar cambios' },
};
