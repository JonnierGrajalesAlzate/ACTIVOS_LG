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
