import styles from './KpiStrip.module.css';

export interface KpiItem {
  label: string;
  value: string;
  tone?: 'accent' | 'danger';
}

interface KpiStripProps {
  items: KpiItem[];
}

export function KpiStrip({ items }: KpiStripProps) {
  return (
    <div className={styles.strip} style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
      {items.map((item) => (
        <div key={item.label} className={styles.cell}>
          <div className={styles.label}>{item.label}</div>
          <div
            className={`${styles.value} ${item.tone === 'accent' ? styles.valueAccent : ''} ${
              item.tone === 'danger' ? styles.valueDanger : ''
            }`}
          >
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
