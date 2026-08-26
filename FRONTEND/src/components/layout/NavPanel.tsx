import { ChevronLeft } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { navGroups, navItems } from '../../nav/navConfig';
import styles from './NavPanel.module.css';

interface NavPanelProps {
  onCollapse: () => void;
}

export function NavPanel({ onCollapse }: NavPanelProps) {
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
        <div className={styles.avatar}>SO</div>
        <div>
          <b className={styles.userName}>Sergio O.</b>
          <em className={styles.userRole}>Administrador</em>
        </div>
        <button type="button" className={styles.collapse} onClick={onCollapse} aria-label="Colapsar navegacion">
          <ChevronLeft size={16} />
        </button>
      </div>
    </nav>
  );
}
