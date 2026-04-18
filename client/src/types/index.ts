export type Rol = 'admin' | 'doctor' | 'secretaria';

export type TipoMoneda = 'CRC' | 'USD';

export const MONEDAS: { value: TipoMoneda; label: string; simbolo: string }[] = [
  { value: 'CRC', label: 'Colones Costarricenses (₡)', simbolo: '₡' },
  { value: 'USD', label: 'Dólares Americanos ($)', simbolo: '$' },
];

export interface Usuario {
  id: number;
  username: string;
  nombre_completo: string;
  rol: Rol;
  activo: boolean;
  created_at: string;
}

export interface Paciente {
  id: number;
  nombre: string;
  dni: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface DetallePagoItem {
  id?: number;
  tratamiento_macro_id?: number;
  tratamiento_micro_id?: number;
  descripcion: string;
  observaciones?: string;
  monto: number;
  es_cuota_principal: boolean;
}

export interface Pago {
  id: number;
  paciente_id: number;
  doctor_id: number;
  secretaria_id: number | null;
  tratamiento_id: number | null;
  monto: number;
  moneda: TipoMoneda;
  metodo_pago: MetodoPago | null;
  concepto: string;
  observaciones: string | null;
  firma_dataurl: string | null;
  estado: 'pendiente_cobro' | 'completado' | 'anulado';
  created_at: string;
  finalizado_at: string | null;
  // Joins
  paciente_nombre?: string;
  paciente_dni?: string;
  paciente_telefono?: string;
  paciente_email?: string;
  doctor_nombre?: string;
  secretaria_nombre?: string;
  comprobante_numero?: string;
  detalles?: DetallePagoItem[];
  // Tratamiento
  tratamiento_monto_total?: number;
  tratamiento_monto_pagado?: number;
  tratamiento_tipo?: string;
}

export interface TratamientoMacro {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  micros?: TratamientoMicro[];
}

export interface TratamientoMicro {
  id: number;
  macro_tratamiento_id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
  macro_nombre?: string;
}

export interface Tratamiento {
  id: number;
  paciente_id: number;
  macro_tratamiento_id: number | null;
  tipo: string;
  descripcion: string | null;
  monto_total: number;
  monto_pagado: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado: 'activo' | 'completado' | 'cancelado';
  created_at: string;
  updated_at: string;
  paciente_nombre?: string;
  paciente_dni?: string;
  macro_nombre?: string;
}

export interface Comprobante {
  id: number;
  pago_id: number;
  numero: string;
  created_at: string;
}

export interface LoginResponse {
  token: string;
  user: Usuario;
}

export interface StatsItem {
  moneda: TipoMoneda;
  cantidad: string;
  total: string;
}

export interface Stats {
  resumen: StatsItem[];
  por_metodo: { moneda: TipoMoneda; metodo_pago: string; cantidad: string; total: string }[];
}

export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia' | 'yape' | 'plin';

export const METODOS_PAGO: { value: MetodoPago; label: string; emoji: string }[] = [
  { value: 'efectivo',      label: 'Efectivo',      emoji: '💵' },
  { value: 'tarjeta',       label: 'Tarjeta',       emoji: '💳' },
  { value: 'transferencia', label: 'Transferencia', emoji: '🏦' },
  { value: 'yape',          label: 'Yape',          emoji: '📱' },
  { value: 'plin',          label: 'Plin',          emoji: '📲' },
];

export const TIPOS_TRATAMIENTO: { value: string; label: string }[] = [
  { value: 'ortodoncia',      label: 'Ortodoncia' },
  { value: 'endodoncia',      label: 'Endodoncia' },
  { value: 'limpieza',        label: 'Limpieza Dental' },
  { value: 'corona',          label: 'Corona' },
  { value: 'extraccion',      label: 'Extracción' },
  { value: 'blanqueamiento',  label: 'Blanqueamiento' },
  { value: 'implante',        label: 'Implante' },
  { value: 'ortopedia',       label: 'Ortopedia' },
  { value: 'resina',          label: 'Resina' },
  { value: 'brackets',        label: 'Brackets' },
  { value: 'consulta',        label: 'Consulta' },
  { value: 'radiografia',     label: 'Radiografía' },
  { value: 'otro',            label: 'Otro' },
];
