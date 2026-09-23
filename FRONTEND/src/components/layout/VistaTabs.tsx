import styles from './VistaTabs.module.css';

export interface VistaTab<T extends string> {
  value: T;
  label: string;
}

interface VistaTabsProps<T extends string> {
  tabs: VistaTab<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

/** Selector segmentado para alternar vistas dentro de una misma pestana del menu. */
export function VistaTabs<T extends string>({ tabs, value, onChange, ariaLabel }: VistaTabsProps<T>) {
  return (
    <div className={styles.tabs} role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={tab.value === value}
          className={`${styles.tab} ${tab.value === value ? styles.tabActive : ''}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
