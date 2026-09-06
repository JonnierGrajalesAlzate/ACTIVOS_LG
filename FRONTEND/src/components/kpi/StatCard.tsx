import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import styles from './StatCard.module.css';

export type StatCardTone = 'accent' | 'danger' | 'ok' | 'warn' | 'neutral';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  help?: ReactNode;
  tone?: StatCardTone;
  children?: ReactNode;
}

/** Tarjeta de indicador con icono: patron de dashboard, una por metrica clave. */
export function StatCard({ icon: Icon, label, value, help, tone = 'neutral', children }: StatCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <span className={`${styles.iconChip} ${styles[`tone_${tone}`]}`}>
          <Icon size={18} strokeWidth={2} />
        </span>
        <span className={styles.label}>{label}</span>
      </div>
      <div className={styles.value}>{value}</div>
      {children}
      {help && <div className={styles.help}>{help}</div>}
    </div>
  );
}
