interface OccupancyRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
}

/** Gauge circular: patron de dashboard para una unica proporcion (0-100). */
export function OccupancyRing({
  percentage,
  size = 112,
  strokeWidth = 12,
  color = 'var(--accent)',
  trackColor = 'var(--line-2)',
}: OccupancyRingProps) {
  const clamped = Math.max(0, Math.min(100, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const center = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }} role="img" aria-label={`Ocupacion ${Math.round(clamped)}%`}>
      <circle cx={center} cy={center} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
        style={{ transition: 'stroke-dashoffset 500ms cubic-bezier(0.4, 0, 0.2, 1)' }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: size * 0.2, fontWeight: 800, fill: 'var(--ink)' }}
      >
        {Math.round(clamped)}%
      </text>
    </svg>
  );
}
