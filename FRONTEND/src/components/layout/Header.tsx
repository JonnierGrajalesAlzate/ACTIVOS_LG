import { Search } from 'lucide-react';
import type { PageMeta } from '../../nav/navConfig';
import styles from './Header.module.css';

interface HeaderProps {
  meta: PageMeta;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onAction?: () => void;
}

export function Header({ meta, searchValue, onSearchChange, searchPlaceholder, onAction }: HeaderProps) {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>{meta.title}</h1>
      {meta.subtitle && <span className={styles.subtitle}>{meta.subtitle}</span>}
      <div className={styles.actions}>
        {onSearchChange && (
          <div className={styles.searchWrap}>
            <Search size={17} strokeWidth={2} className={styles.searchIcon} />
            <input
              className={styles.search}
              type="search"
              placeholder={searchPlaceholder ?? 'Buscar...'}
              value={searchValue ?? ''}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}
        <button type="button" className={styles.action} onClick={onAction}>
          {meta.actionLabel}
        </button>
      </div>
    </div>
  );
}
