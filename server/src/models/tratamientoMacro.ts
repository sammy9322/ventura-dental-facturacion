import { query } from '../config/database.js';

export interface TratamientoMicro {
  id: number;
  macro_tratamiento_id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export async function getAll() {
  const result = await query(
    `SELECT * FROM tratamientos_macro WHERE activo = true ORDER BY nombre ASC`
  );
  return result.rows;
}

export async function getById(id: number) {
  const result = await query(
    `SELECT * FROM tratamientos_macro WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function create(data: { nombre: string; descripcion?: string }) {
  const result = await query(
    `INSERT INTO tratamientos_macro (nombre, descripcion) VALUES ($1, $2) RETURNING *`,
    [data.nombre, data.descripcion || null]
  );
  return result.rows[0];
}

export async function update(id: number, data: { nombre?: string; descripcion?: string; activo?: boolean }) {
  const updates: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (data.nombre !== undefined) { updates.push(`nombre = $${idx++}`); params.push(data.nombre); }
  if (data.descripcion !== undefined) { updates.push(`descripcion = $${idx++}`); params.push(data.descripcion); }
  if (data.activo !== undefined) { updates.push(`activo = $${idx++}`); params.push(data.activo); }

  if (updates.length === 0) return null;

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  params.push(id);

  const result = await query(
    `UPDATE tratamientos_macro SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );
  return result.rows[0];
}

export async function remove(id: number) {
  const result = await query(
    `UPDATE tratamientos_macro SET activo = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
}

export async function getMicroByMacro(macroId: number) {
  const result = await query(
    `SELECT * FROM tratamientos_micro WHERE macro_tratamiento_id = $1 AND activo = true ORDER BY nombre ASC`,
    [macroId]
  );
  return result.rows;
}

export async function getAllMicro() {
  const result = await query(
    `SELECT m.*, macro.nombre as macro_nombre 
     FROM tratamientos_micro m 
     JOIN tratamientos_macro macro ON m.macro_tratamiento_id = macro.id 
     WHERE m.activo = true 
     ORDER BY macro.nombre, m.nombre`
  );
  return result.rows;
}

export async function createMicro(data: { macro_tratamiento_id: number; nombre: string; descripcion?: string; precio?: number }) {
  const result = await query(
    `INSERT INTO tratamientos_micro (macro_tratamiento_id, nombre, descripcion, precio) VALUES ($1, $2, $3, $4) RETURNING *`,
    [data.macro_tratamiento_id, data.nombre, data.descripcion || null, data.precio || 0]
  );
  return result.rows[0];
}

export async function updateMicro(id: number, data: { nombre?: string; descripcion?: string; precio?: number; activo?: boolean }) {
  const updates: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (data.nombre !== undefined) { updates.push(`nombre = $${idx++}`); params.push(data.nombre); }
  if (data.descripcion !== undefined) { updates.push(`descripcion = $${idx++}`); params.push(data.descripcion); }
  if (data.precio !== undefined) { updates.push(`precio = $${idx++}`); params.push(data.precio); }
  if (data.activo !== undefined) { updates.push(`activo = $${idx++}`); params.push(data.activo); }

  if (updates.length === 0) return null;

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  params.push(id);

  const result = await query(
    `UPDATE tratamientos_micro SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );
  return result.rows[0];
}

export async function removeMicro(id: number) {
  const result = await query(
    `UPDATE tratamientos_micro SET activo = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
}
