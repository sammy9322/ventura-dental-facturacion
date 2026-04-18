import api from './api';
import type { TratamientoMacro, TratamientoMicro } from '../types';

export const tratamientoMacroService = {
  getAll: async () => {
    const res = await api.get<TratamientoMacro[]>('/tratamientos-macro');
    return res.data;
  },

  getById: async (id: number) => {
    const res = await api.get<TratamientoMacro>(`/tratamientos-macro/${id}`);
    return res.data;
  },

  create: async (data: { nombre: string; descripcion?: string }) => {
    const res = await api.post<TratamientoMacro>('/tratamientos-macro', data);
    return res.data;
  },

  update: async (id: number, data: { nombre?: string; descripcion?: string; activo?: boolean }) => {
    const res = await api.put<TratamientoMacro>(`/tratamientos-macro/${id}`, data);
    return res.data;
  },

  delete: async (id: number) => {
    const res = await api.delete(`/tratamientos-macro/${id}`);
    return res.data;
  },

  getAllMicro: async () => {
    const res = await api.get<TratamientoMicro[]>('/tratamientos-macro/micro');
    return res.data;
  },

  createMicro: async (data: { macro_tratamiento_id: number; nombre: string; descripcion?: string; precio?: number }) => {
    const res = await api.post<TratamientoMicro>('/tratamientos-macro/micro', data);
    return res.data;
  },

  updateMicro: async (id: number, data: { nombre?: string; descripcion?: string; precio?: number; activo?: boolean }) => {
    const res = await api.put<TratamientoMicro>(`/tratamientos-macro/micro/${id}`, data);
    return res.data;
  },

  deleteMicro: async (id: number) => {
    const res = await api.delete(`/tratamientos-macro/micro/${id}`);
    return res.data;
  },
};
