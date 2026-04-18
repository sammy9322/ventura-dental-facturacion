import api from './api';
import type { Paciente } from '../types';

export const pacienteService = {
  async getAll(): Promise<Paciente[]> {
    const response = await api.get<Paciente[]>('/pacientes');
    return response.data;
  },

  async search(query: string): Promise<Paciente[]> {
    const response = await api.get<Paciente[]>(`/pacientes/buscar?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  async getById(id: number): Promise<Paciente> {
    const response = await api.get<Paciente>(`/pacientes/${id}`);
    return response.data;
  },

  async getByDni(dni: string): Promise<Paciente | null> {
    try {
      const response = await api.get<Paciente>(`/pacientes/dni/${dni}`);
      return response.data;
    } catch {
      return null;
    }
  },

  async create(data: Omit<Paciente, 'id' | 'activo' | 'created_at' | 'updated_at'>): Promise<Paciente> {
    const response = await api.post<Paciente>('/pacientes', data);
    return response.data;
  },

  async update(id: number, data: Partial<Paciente>): Promise<Paciente> {
    const response = await api.put<Paciente>(`/pacientes/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/pacientes/${id}`);
  },
};
