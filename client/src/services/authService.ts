import api from './api';
import type { LoginResponse, Usuario } from '../types';

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', { username, password });
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getUser(): Usuario | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  async getMe(): Promise<Usuario> {
    const response = await api.get<Usuario>('/auth/me');
    return response.data;
  },

  async getUsuarios(): Promise<Usuario[]> {
    const response = await api.get<Usuario[]>('/auth/usuarios');
    return response.data;
  },

  async createUsuario(data: { username: string; password: string; nombre_completo: string; rol: 'admin' | 'doctor' | 'secretaria' }): Promise<Usuario> {
    const response = await api.post<Usuario>('/auth/usuarios', data);
    return response.data;
  },
};
