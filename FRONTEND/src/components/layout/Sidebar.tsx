import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logoUrl from '../../assets/logo.png';
import { useAuth } from '../../auth/AuthContext';
import { nombreRol } from '../../auth/permisos';
import { navGroups, navItems } from '../../nav/navConfig';
import styles from './Sidebar.module.css';

const STORAGE_KEY = 'activos-lg.nav-expanded';

function readInitialExpanded(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function initials(nombre: string): string {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function Sidebar() {
  const [expanded, setExpanded] = useState(readInitialExpanded);
  const { usuario, logout } = useAuth();

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // localStorage no disponible (modo privado, etc.); la preferencia solo dura la sesion.
    }
  };

  return (
    <aside className={`${styles.sidebar} ${expanded ? styles.expanded : styles.collapsed}`} data-no-print>
      <div className={styles.brandRow}>
        <img src={logoUrl} alt="Activos LG" className={styles.brandLogo} />
        {expanded && (
          <div className={styles.brandText}>
            <b className={styles.brandName}>Activos Fijos</b>
            <span className={styles.brandSub}>LONDONO GOMEZ</span>
          </div>
        )}
      </div>

      {expanded && (
        <div className={styles.project}>
          <div className={styles.projectLabel}>Proyecto activo</div>
          <div className={styles.projectValue}>
            <i className={styles.dot} />
            Portafolio 2026
          </div>
        </div>
      )}

      <nav className={styles.nav}>
        {navGroups.map((group, groupIndex) => (
          <div key={group}>
            {expanded ? <div className={styles.groupLabel}>{group}</div> : groupIndex > 0 && <div className={styles.divider} />}
            {navItems
              .filter((item) => item.group === group)
              .map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) => `${styles.row} ${isActive ? styles.rowActive : ''}`}
                    title={item.label}
                  >
                    <span className={styles.rowIcon}>
                      <Icon size={17} strokeWidth={2} />
                    </span>
                    {expanded && item.label}
                  </NavLink>
                );
              })}
          </div>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.footerRow}>
          {!expanded && (
            <button type="button" className={styles.toggle} onClick={toggle} aria-label="Expandir navegacion" aria-expanded={false}>
              <ChevronRight size={16} />
            </button>
          )}

          <div className={styles.avatar}>{usuario ? initials(usuario.nombre) : ''}</div>

          {expanded && (
            <>
              <div className={styles.userInfo}>
                <b className={styles.userName}>{usuario?.nombre ?? ''}</b>
                <em className={styles.userRole}>{nombreRol(usuario?.rol)}</em>
              </div>
              <button type="button" className={styles.iconButton} onClick={logout} aria-label="Cerrar sesion" title="Cerrar sesion">
                <LogOut size={15} />
              </button>
              <button type="button" className={styles.toggle} onClick={toggle} aria-label="Colapsar navegacion" aria-expanded={true}>
                <ChevronLeft size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
