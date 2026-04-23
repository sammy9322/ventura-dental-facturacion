import { query } from '../config/database.js';

export interface CierreCaja {
  id?: number;
  usuario_id: number;
  fecha: string; // YYYY-MM-DD
  esperado_efectivo: number;
  esperado_tarjeta: number;
  esperado_transferencia: number;
  esperado_otros: number;
  real_efectivo: number;
  real_tarjeta: number;
  real_transferencia: number;
  real_otros: number;
  diferencia: number;
  observaciones?: string;
  estado: 'abierto' | 'cerrado';
  created_at?: Date;
  updated_at?: Date;
}

export async function create(data: CierreCaja) {
  const sql = `
    INSERT INTO cierres_caja (
      usuario_id, fecha, 
      esperado_efectivo, esperado_tarjeta, esperado_transferencia, esperado_otros,
      real_efectivo, real_tarjeta, real_transferencia, real_otros,
      diferencia, observaciones, estado
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    ON CONFLICT (fecha) DO UPDATE SET
      usuario_id = EXCLUDED.usuario_id,
      esperado_efectivo = EXCLUDED.esperado_efectivo,
      esperado_tarjeta = EXCLUDED.esperado_tarjeta,
      esperado_transferencia = EXCLUDED.esperado_transferencia,
      esperado_otros = EXCLUDED.esperado_otros,
      real_efectivo = EXCLUDED.real_efectivo,
      real_tarjeta = EXCLUDED.real_tarjeta,
      real_transferencia = EXCLUDED.real_transferencia,
      real_otros = EXCLUDED.real_otros,
      diferencia = EXCLUDED.diferencia,
      observaciones = EXCLUDED.observaciones,
      estado = EXCLUDED.estado,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  const params = [
    data.usuario_id, data.fecha,
    data.esperado_efectivo, data.esperado_tarjeta, data.esperado_transferencia, data.esperado_otros,
    data.real_efectivo, data.real_tarjeta, data.real_transferencia, data.real_otros,
    data.diferencia, data.observaciones || null, data.estado
  ];
  const result = await query(sql, params);
  return result.rows[0];
}

export async function getByFecha(fecha: string) {
  const result = await query('SELECT * FROM cierres_caja WHERE fecha = $1', [fecha]);
  return result.rows[0] || null;
}

export async function getHistorial(limit = 30) {
  const sql = `
    SELECT c.*, u.nombre_completo as usuario_nombre
    FROM cierres_caja c
    LEFT JOIN usuarios u ON c.usuario_id = u.id
    ORDER BY c.fecha DESC
    LIMIT $1
  `;
  const result = await query(sql, [limit]);
  return result.rows;
}
