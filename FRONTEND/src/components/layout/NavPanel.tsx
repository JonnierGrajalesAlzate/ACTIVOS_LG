import { ChevronLeft, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { navGroups, navItems } from '../../nav/navConfig';
import styles from './NavPanel.module.css';

interface NavPanelProps {
  onCollapse: () => void;
}

function initials(nombre: string): string {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function NavPanel({ onCollapse }: NavPanelProps) {
  const { usuario, logout } = useAuth();

  return (
    <nav className={styles.panel}>
      <div className={styles.brand}>
        <b className={styles.brandName}>Activos Fijos</b>
        <span className={styles.brandSub}>LONDONO GOMEZ</span>
      </div>

      <div className={styles.project}>
        <div className={styles.projectLabel}>Proyecto activo</div>
        <div className={styles.projectValue}>
          <i className={styles.dot} />
          Portafolio 2026
        </div>
      </div>

      {navGroups.map((group) => (
        <div key={group}>
          <div className={styles.groupLabel}>{group}</div>
          {navItems
            .filter((item) => item.group === group)
            .map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) => `${styles.row} ${isActive ? styles.rowActive : ''}`}
                >
                  <span className={styles.rowIcon}>
                    <Icon size={16} strokeWidth={2} />
                  </span>
                  {item.label}
                </NavLink>
              );
            })}
        </div>
      ))}

      <div className={styles.footer}>
        <div className={styles.avatar}>{usuario ? initials(usuario.nombre) : ''}</div>
        <div>
          <b className={styles.userName}>{usuario?.nombre ?? ''}</b>
          <em className={styles.userRole}>{usuario?.rol ?? ''}</em>
        </div>
        <button type="button" className={styles.collapse} onClick={logout} aria-label="Cerrar sesion" title="Cerrar sesion">
          <LogOut size={15} />
        </button>
        <button type="button" className={styles.collapse} onClick={onCollapse} aria-label="Colapsar navegacion">
          <ChevronLeft size={16} />
        </button>
      </div>
    </nav>
  );
}
