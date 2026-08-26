import type { PageMeta } from '../../nav/navConfig';
import styles from './Header.module.css';

interface HeaderProps {
  meta: PageMeta;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export function Header({ meta, searchValue, onSearchChange }: HeaderProps) {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>{meta.title}</h1>
      <span className={styles.subtitle}>{meta.subtitle}</span>
      <div className={styles.actions}>
        {onSearchChange && (
          <input
            className={styles.search}
            type="search"
            placeholder="Buscar..."
            value={searchValue ?? ''}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        )}
        <button type="button" className={styles.action}>
          {meta.actionLabel}
        </button>
      </div>
    </div>
  );
}
