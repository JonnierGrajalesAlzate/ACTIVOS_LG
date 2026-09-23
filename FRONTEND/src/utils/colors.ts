/** Escala de un solo color (morado) para porcentajes: mas oscuro = mejor ocupacion. */
export function occupancyColor(percentage: number): string {
  if (percentage >= 90) return 'var(--accent-ink)';
  if (percentage >= 70) return 'var(--accent)';
  if (percentage >= 40) return 'var(--accent-light)';
  return 'var(--accent-pale)';
}
