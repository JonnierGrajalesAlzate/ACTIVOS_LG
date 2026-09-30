import { clearToken, getToken } from '../auth/token';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5063';

export const AUTH_EXPIRED_EVENT = 'auth:expired';

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response, path: string, onUnauthorized: 'expire' | 'throw'): Promise<T> {
  if (res.status === 401) {
    if (onUnauthorized === 'expire') {
      clearToken();
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
      throw new Error('Sesion expirada, inicia sesion de nuevo.');
    }
    throw new Error('Credenciales invalidas.');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null) as { message?: string } | null;
    throw new Error(body?.message ?? `${res.status} ${res.statusText} al consultar ${path}`);
  }
  // DELETE responde 204 sin cuerpo.
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function apiDelete(path: string): Promise<void> {
  const url = new URL(path, API_BASE_URL);
  const res = await fetch(url, { method: 'DELETE', headers: authHeaders() });
  return handleResponse<void>(res, path, 'expire');
}

export async function apiGet<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(path, API_BASE_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const res = await fetch(url, { headers: authHeaders() });
  return handleResponse<T>(res, path, 'expire');
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const url = new URL(path, API_BASE_URL);
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res, path, 'expire');
}

export async function apiPost<T>(path: string, body?: unknown, options?: { authRequired?: boolean }): Promise<T> {
  const authRequired = options?.authRequired ?? true;
  const url = new URL(path, API_BASE_URL);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res, path, authRequired ? 'expire' : 'throw');
}
