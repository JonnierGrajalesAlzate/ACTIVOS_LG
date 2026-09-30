import { useAuth } from './AuthContext';

// Mismos roles que BACKEND/Endpoints/Roles.cs. El backend es quien impone los permisos;
// aqui solo se esconden los botones que el usuario no puede usar.
export const ROLES: Record<string, string> = {
  admin: 'Administrador',
  admin_inmobiliario: 'Administrador inmobiliario',
  lectura: 'Solo lectura',
};

export function nombreRol(rol: string | undefined): string {
  return rol ? (ROLES[rol] ?? rol) : '';
}

export function usePermisos() {
  const rol = useAuth().usuario?.rol;
  return {
    /** Registrar, editar y eliminar inmuebles, contratos, egresos y contrapartes. */
    puedeEditar: rol === 'admin' || rol === 'admin_inmobiliario',
    /** Proyectos, etapas y parametros (IPC). */
    esAdmin: rol === 'admin',
  };
}
