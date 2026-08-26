interface ProgressBarProps {
  /** Porcentaje 0-100. */
  value: number;
  height?: number;
  color?: string;
}

/** Patron G: pista + relleno redondeados. */
export function ProgressBar({ value, height = 6, color = 'var(--accent)' }: ProgressBarProps) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div
      style={{
        height,
        borderRadius: 50,
        background: 'var(--line-2)',
        overflow: 'hidden',
        marginTop: 7,
      }}
    >
      <div style={{ width: `${width}%`, height: '100%', borderRadius: 50, background: color }} />
    </div>
  );
}
