import { apiGet, apiPost } from './client';

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: string;
}

export interface LoginResponse {
  token: string;
  expiraEn: string;
  usuario: Usuario;
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiPost<LoginResponse>('/api/auth/login', { email, password }, { authRequired: false });
}

export function fetchMe(): Promise<Usuario> {
  return apiGet<Usuario>('/api/auth/me');
}

export function resetPassword(email: string, newPassword: string): Promise<{ message: string }> {
  return apiPost<{ message: string }>('/api/auth/reset-password', { email, newPassword }, { authRequired: false });
}
