import { ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { navItems } from '../../nav/navConfig';
import styles from './Rail.module.css';

interface RailProps {
  onToggle: () => void;
}

export function Rail({ onToggle }: RailProps) {
  return (
    <aside className={styles.rail}>
      <div className={styles.brand}>LG</div>
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const showDivider = index > 0 && navItems[index - 1].group !== item.group;
        return (
          <div key={item.id} style={{ display: 'contents' }}>
            {showDivider && <div className={styles.divider} />}
            <NavLink
              to={item.path}
              className={({ isActive }) => `${styles.tile} ${isActive ? styles.tileActive : ''}`}
              aria-label={item.label}
              title={item.label}
            >
              <Icon size={17} strokeWidth={2} />
            </NavLink>
          </div>
        );
      })}
      <div className={styles.footer}>
        <button type="button" className={styles.toggle} onClick={onToggle} aria-label="Expandir navegacion">
          <ChevronRight size={16} />
        </button>
        <div className={styles.avatar}>SO</div>
      </div>
    </aside>
  );
}
