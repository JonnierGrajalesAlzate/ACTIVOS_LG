const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5063';

export async function apiGet<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(path, API_BASE_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} al consultar ${path}`);
  }
  return res.json() as Promise<T>;
}
