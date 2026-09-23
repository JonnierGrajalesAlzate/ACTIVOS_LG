const DIACRITICS = /\p{Diacritic}/gu;

/** Normaliza para comparar texto sin distinguir mayusculas ni tildes. */
export function normalizeText(value: string): string {
  return value.normalize('NFD').replace(DIACRITICS, '').toLowerCase().trim();
}

export function matchesSearch(value: string, query: string): boolean {
  if (!query.trim()) return true;
  return normalizeText(value).includes(normalizeText(query));
}
