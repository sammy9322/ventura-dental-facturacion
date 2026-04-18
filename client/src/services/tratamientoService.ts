import api from './api';
import type { Tratamiento } from '../types';

export const tratamientoService = {
  async getAll(filters?: {
    pacienteId?: number;
    tipo?: string;
    estado?: string;
  }): Promise<Tratamiento[]> {
    const params = new URLSearchParams();
    if (filters?.pacienteId) params.append('pacienteId', String(filters.pacienteId));
    if (filters?.tipo) params.append('tipo', filters.tipo);
    if (filters?.estado) params.append('estado', filters.estado);
    
    const response = await api.get<Tratamiento[]>(`/tratamientos?${params.toString()}`);
    return response.data;
  },

  async getByPacienteId(pacienteId: number): Promise<Tratamiento[]> {
    const response = await api.get<Tratamiento[]>(`/tratamientos/paciente/${pacienteId}`);
    return response.data;
  },

  async getById(id: number): Promise<Tratamiento> {
    const response = await api.get<Tratamiento>(`/tratamientos/${id}`);
    return response.data;
  },

  async getSaldo(id: number): Promise<{ monto_total: number; monto_pagado: number; saldo: number }> {
    const response = await api.get<{ monto_total: number; monto_pagado: number; saldo: number }>(`/tratamientos/${id}/saldo`);
    return response.data;
  },

  async create(data: {
    paciente_id: number;
    macro_tratamiento_id?: number;
    tipo: string;
    descripcion?: string;
    monto_total: number;
    fecha_inicio: string;
    fecha_fin?: string;
  }): Promise<Tratamiento> {
    const response = await api.post<Tratamiento>('/tratamientos', data);
    return response.data;
  },

  async update(id: number, data: Partial<Tratamiento>): Promise<Tratamiento> {
    const response = await api.put<Tratamiento>(`/tratamientos/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/tratamientos/${id}`);
  },
};
