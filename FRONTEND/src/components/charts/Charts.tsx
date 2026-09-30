import styles from './Charts.module.css';

// Rampa secuencial de un solo tono (indigo), de claro a oscuro. Es la escala del
// design system; el paso lo decide la magnitud, nunca el orden de llegada.
const RAMP = ['#DFDCF3', '#C7C1EE', '#A79BE8', '#4B3FD4'];

function rampColor(value: number, max: number): string {
  if (max <= 0) return RAMP[0];
  const ratio = Math.max(0, Math.min(1, value / max));
  const idx = Math.min(RAMP.length - 1, Math.floor(ratio * RAMP.length));
  return RAMP[idx];
}

export interface DistributionItem {
  label: string;
  value: number;
  /** Texto ya formateado que se muestra en la punta de la barra. */
  display: string;
  /** Contexto extra para el tooltip nativo. */
  hint?: string;
}

interface DistributionBarsProps {
  items: DistributionItem[];
  emptyText?: string;
}

/** Barras horizontales para comparar magnitud entre categorias de nombre largo. */
export function DistributionBars({ items, emptyText = 'Sin datos.' }: DistributionBarsProps) {
  if (items.length === 0) return <div className={styles.empty}>{emptyText}</div>;

  // Una sola categoria no es una distribucion: una barra al 100 % no compara
  // nada. Se muestra como cifra, que es lo que el dato realmente es.
  if (items.length === 1) {
    return (
      <div className={styles.single}>
        <div className={styles.singleValue}>{items[0].display}</div>
        <div className={styles.singleLabel}>{items[0].label}</div>
      </div>
    );
  }

  const max = Math.max(...items.map((i) => Math.abs(i.value)), 0);

  return (
    <div className={styles.distList}>
      {items.map((item) => {
        const pct = max === 0 ? 0 : (Math.abs(item.value) / max) * 100;
        return (
          <div key={item.label} className={styles.distRow} title={item.hint ?? `${item.label}: ${item.display}`}>
            <span className={styles.distLabel}>{item.label}</span>
            <span className={styles.distValue}>{item.display}</span>
            <div className={styles.distTrack}>
              <div
                className={styles.distFill}
                style={{ width: `${pct}%`, background: rampColor(Math.abs(item.value), max) }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export interface ColumnItem {
  label: string;
  value: number;
  display: string;
  hint?: string;
}

interface YearColumnsProps {
  items: ColumnItem[];
  emptyText?: string;
}

/** Columnas verticales para una escala ordinal corta (anios). */
export function YearColumns({ items, emptyText = 'Sin datos.' }: YearColumnsProps) {
  if (items.length === 0) return <div className={styles.empty}>{emptyText}</div>;
  const max = Math.max(...items.map((i) => i.value), 0);

  return (
    <div>
      <div className={styles.cols}>
        {items.map((item) => (
          <div key={item.label} className={styles.col} title={item.hint ?? `${item.label}: ${item.display}`}>
            <span className={styles.colValue}>{item.display}</span>
            <div
              className={styles.colBar}
              style={{
                height: `${max === 0 ? 0 : (item.value / max) * 82}%`,
                background: rampColor(item.value, max),
              }}
            />
          </div>
        ))}
      </div>
      <div className={styles.colLabels}>
        {items.map((item) => (
          <div key={item.label} className={styles.colLabel}>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
