import api from './api';
import type { Pago, Stats, MetodoPago } from '../types';

export const pagoService = {
  async getAll(filters?: {
    fechaDesde?: string;
    fechaHasta?: string;
    pacienteId?: number;
    estado?: string;
  }): Promise<Pago[]> {
    const params = new URLSearchParams();
    if (filters?.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
    if (filters?.fechaHasta) params.append('fechaHasta', filters.fechaHasta);
    if (filters?.pacienteId) params.append('pacienteId', String(filters.pacienteId));
    if (filters?.estado) params.append('estado', filters.estado);
    
    const response = await api.get<Pago[]>(`/pagos?${params.toString()}`);
    return response.data;
  },

  async getById(id: number): Promise<Pago> {
    const response = await api.get<Pago>(`/pagos/${id}`);
    return response.data;
  },

  /** Crea un pago (rol: doctor). Devuelve el pago en estado 'pendiente_cobro'. */
  async create(data: {
    paciente_id: number;
    tratamiento_id?: number;
    concepto: string;
    detalles: { descripcion: string; monto: number; es_cuota_principal?: boolean }[];
  }): Promise<Pago> {
    const response = await api.post<Pago>('/pagos', data);
    return response.data;
  },

  /** Obtiene pagos en estado pendiente_cobro (rol: secretaria/admin). */
  async getPendientes(): Promise<Pago[]> {
    const response = await api.get<Pago[]>('/pagos/pendientes');
    return response.data;
  },

  /** Finaliza (cobra) un pago y emite el comprobante (rol: secretaria/admin). */
  async finalizar(id: number, data: {
    metodo_pago: MetodoPago;
    firma_dataurl?: string;
    enviar_email?: boolean;
  }): Promise<{ pago: Pago; numero: string }> {
    const response = await api.put<{ pago: Pago; numero: string }>(`/pagos/${id}/finalizar`, data);
    return response.data;
  },

  async annul(id: number): Promise<Pago> {
    const response = await api.put<Pago>(`/pagos/${id}/anular`);
    return response.data;
  },

  async getStats(filters?: { fechaDesde?: string; fechaHasta?: string }): Promise<Stats> {
    const params = new URLSearchParams();
    if (filters?.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
    if (filters?.fechaHasta) params.append('fechaHasta', filters.fechaHasta);
    
    const response = await api.get<Stats>(`/pagos/stats?${params.toString()}`);
    return response.data;
  },

  async getAdvancedStats(): Promise<any> {
    const response = await api.get('/pagos/stats/advanced');
    return response.data;
  },
};
