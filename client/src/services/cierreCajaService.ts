import api from './api.js';

export const getCierrePreview = async (fecha: string) => {
  const response = await api.get(`/cierre/preview?fecha=${fecha}`);
  return response.data;
};

export const saveCierre = async (data: any) => {
  const response = await api.post('/cierre', data);
  return response.data;
};

export const getCierreHistory = async (limit = 30) => {
  const response = await api.get(`/cierre/history?limit=${limit}`);
  return response.data;
};
