import type { ReactNode } from 'react';
import styles from './FilterChipRow.module.css';

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

interface FilterChipRowProps<T extends string> {
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  trailing?: ReactNode;
}

export function FilterChipRow<T extends string>({ options, value, onChange, trailing }: FilterChipRowProps<T>) {
  return (
    <div className={styles.row}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`${styles.chip} ${option.value === value ? styles.chipActive : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
      {trailing && <span className={styles.sort}>{trailing}</span>}
    </div>
  );
}
