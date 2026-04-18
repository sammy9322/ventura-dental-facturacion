import { query } from '../config/database.js';

export interface Tratamiento {
  id: number;
  paciente_id: number;
  macro_tratamiento_id: number | null;
  tipo: string;
  descripcion: string | null;
  monto_total: number;
  monto_pagado: number;
  fecha_inicio: Date;
  fecha_fin: Date | null;
  estado: 'activo' | 'completado' | 'cancelado';
  created_at: Date;
  updated_at: Date;
}

export interface TratamientoWithPaciente extends Tratamiento {
  paciente_nombre?: string;
  paciente_dni?: string;
  macro_nombre?: string;
}

export async function getAll(filters?: {
  pacienteId?: number;
  tipo?: string;
  estado?: string;
}) {
  let sql = `
    SELECT t.*, p.nombre as paciente_nombre, p.dni as paciente_dni, m.nombre as macro_nombre
    FROM tratamientos t
    LEFT JOIN pacientes p ON t.paciente_id = p.id
    LEFT JOIN tratamientos_macro m ON t.macro_tratamiento_id = m.id
    WHERE 1=1
  `;
  const params: unknown[] = [];
  let idx = 1;

  if (filters?.pacienteId) {
    sql += ` AND t.paciente_id = $${idx++}`;
    params.push(filters.pacienteId);
  }
  if (filters?.tipo) {
    sql += ` AND t.tipo = $${idx++}`;
    params.push(filters.tipo);
  }
  if (filters?.estado) {
    sql += ` AND t.estado = $${idx++}`;
    params.push(filters.estado);
  }

  sql += ' ORDER BY t.created_at DESC';

  const result = await query(sql, params);
  return result.rows;
}

export async function findById(id: number) {
  const result = await query(
    `SELECT t.*, p.nombre as paciente_nombre, p.dni as paciente_dni, m.nombre as macro_nombre
     FROM tratamientos t
     LEFT JOIN pacientes p ON t.paciente_id = p.id
     LEFT JOIN tratamientos_macro m ON t.macro_tratamiento_id = m.id
     WHERE t.id = $1`,
    [id]
  );
  return result.rows[0] as TratamientoWithPaciente | undefined;
}

export async function findByPacienteId(pacienteId: number) {
  const result = await query(
    `SELECT t.*, m.nombre as macro_nombre
     FROM tratamientos t
     LEFT JOIN tratamientos_macro m ON t.macro_tratamiento_id = m.id
     WHERE t.paciente_id = $1 ORDER BY t.created_at DESC`,
    [pacienteId]
  );
  return result.rows;
}

export async function create(data: {
  paciente_id: number;
  macro_tratamiento_id?: number;
  tipo: string;
  descripcion?: string;
  monto_total: number;
  fecha_inicio: string;
  fecha_fin?: string | null;
}) {
  const result = await query(
    `INSERT INTO tratamientos (paciente_id, macro_tratamiento_id, tipo, descripcion, monto_total, fecha_inicio, fecha_fin)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.paciente_id,
      data.macro_tratamiento_id || null,
      data.tipo,
      data.descripcion || null,
      data.monto_total,
      data.fecha_inicio,
      data.fecha_fin || null
    ]
  );
  return result.rows[0] as Tratamiento;
}

export async function update(id: number, data: {
  tipo?: string;
  descripcion?: string;
  monto_total?: number;
  fecha_inicio?: string;
  fecha_fin?: string | null;
  estado?: string;
}) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.tipo !== undefined) {
    fields.push(`tipo = $${idx++}`);
    values.push(data.tipo);
  }
  if (data.descripcion !== undefined) {
    fields.push(`descripcion = $${idx++}`);
    values.push(data.descripcion);
  }
  if (data.monto_total !== undefined) {
    fields.push(`monto_total = $${idx++}`);
    values.push(data.monto_total);
  }
  if (data.fecha_inicio !== undefined) {
    fields.push(`fecha_inicio = $${idx++}`);
    values.push(data.fecha_inicio);
  }
  if (data.fecha_fin !== undefined) {
    fields.push(`fecha_fin = $${idx++}`);
    values.push(data.fecha_fin);
  }
  if (data.estado !== undefined) {
    fields.push(`estado = $${idx++}`);
    values.push(data.estado);
  }

  if (fields.length === 0) return null;

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await query(
    `UPDATE tratamientos SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0] as Tratamiento | undefined;
}

export async function deleteTratamiento(id: number) {
  const result = await query(
    `UPDATE tratamientos SET estado = 'cancelado', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rows[0];
}

export async function updateMontoPagado(id: number, monto: number) {
  const result = await query(
    `UPDATE tratamientos 
     SET monto_pagado = monto_pagado + $1, 
         updated_at = CURRENT_TIMESTAMP,
         estado = CASE 
           WHEN monto_pagado + $1 >= monto_total THEN 'completado' 
           ELSE estado 
         END
     WHERE id = $2 
     RETURNING *`,
    [monto, id]
  );
  return result.rows[0];
}

export async function getSaldo(id: number) {
  const result = await query(
    `SELECT monto_total, monto_pagado, (monto_total - monto_pagado) as saldo
     FROM tratamientos WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}
