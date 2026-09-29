const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const compactCurrencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const areaFormatter = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const dateFormatter = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return currencyFormatter.format(value);
}

export function formatCurrencyCompact(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return compactCurrencyFormatter.format(value);
}

export function formatArea(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `${areaFormatter.format(value)} m²`;
}

/** Recibe una fraccion (0.0074) y la muestra como porcentaje (0,74 %). */
export function formatPercent(value: number | null | undefined, fractionDigits = 2): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('es-CO', {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/**
 * Lee un numero escrito a la colombiana: "1.500.000", "1500000,5" o "1500000.5".
 * Devuelve null si esta vacio y NaN si no es un numero.
 */
export function parseNumero(texto: string): number | null {
  const s = texto.trim().replace(/[\s$%]/g, '');
  if (!s) return null;
  let normalizado = s;
  if (s.includes(',')) normalizado = s.replace(/\./g, '').replace(',', '.');
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) normalizado = s.replace(/\./g, '');
  const n = Number(normalizado);
  return Number.isFinite(n) ? n : Number.NaN;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '—';
  return dateFormatter.format(date);
}
