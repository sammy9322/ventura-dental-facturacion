import api from './api';
import type { Comprobante } from '../types';

export const comprobanteService = {
  async getByPagoId(pagoId: number): Promise<Comprobante> {
    const response = await api.get<Comprobante>(`/comprobantes/${pagoId}`);
    return response.data;
  },

  async getByNumero(numero: string): Promise<Comprobante> {
    const response = await api.get<Comprobante>(`/comprobantes/numero/${numero}`);
    return response.data;
  },
};
