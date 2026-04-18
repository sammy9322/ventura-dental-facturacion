import { query } from '../config/database.js';

export interface Paciente {
  id: number;
  nombre: string;
  dni: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export async function getAll(activo?: boolean) {
  let sql = 'SELECT * FROM pacientes';
  const params: unknown[] = [];
  
  if (activo !== undefined) {
    sql += ' WHERE activo = $1';
    params.push(activo);
  }
  
  sql += ' ORDER BY nombre ASC';
  
  const result = await query(sql, params);
  return result.rows;
}

export async function findById(id: number) {
  const result = await query('SELECT * FROM pacientes WHERE id = $1', [id]);
  return result.rows[0] as Paciente | undefined;
}

export async function findByDni(dni: string) {
  if (!dni || dni.length !== 8) return undefined;
  const result = await query('SELECT * FROM pacientes WHERE dni = $1', [dni]);
  return result.rows[0] as Paciente | undefined;
}

export async function search(searchTerm: string) {
  const result = await query(
    `SELECT * FROM pacientes 
     WHERE activo = true 
     AND (nombre ILIKE $1 OR dni ILIKE $1 OR telefono ILIKE $1)
     ORDER BY nombre ASC
     LIMIT 50`,
    [`%${searchTerm}%`]
  );
  return result.rows;
}

export async function create(data: {
  nombre: string;
  dni?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}) {
  const result = await query(
    `INSERT INTO pacientes (nombre, dni, telefono, email, direccion) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`,
    [data.nombre, data.dni || null, data.telefono || null, data.email || null, data.direccion || null]
  );
  return result.rows[0] as Paciente;
}

export async function update(id: number, data: {
  nombre?: string;
  dni?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  activo?: boolean;
}) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.nombre !== undefined) {
    fields.push(`nombre = $${idx++}`);
    values.push(data.nombre);
  }
  if (data.dni !== undefined) {
    fields.push(`dni = $${idx++}`);
    values.push(data.dni);
  }
  if (data.telefono !== undefined) {
    fields.push(`telefono = $${idx++}`);
    values.push(data.telefono);
  }
  if (data.email !== undefined) {
    fields.push(`email = $${idx++}`);
    values.push(data.email);
  }
  if (data.direccion !== undefined) {
    fields.push(`direccion = $${idx++}`);
    values.push(data.direccion);
  }
  if (data.activo !== undefined) {
    fields.push(`activo = $${idx++}`);
    values.push(data.activo);
  }

  if (fields.length === 0) return null;

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await query(
    `UPDATE pacientes SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0] as Paciente | undefined;
}

export async function deletePatient(id: number) {
  const result = await query(
    'UPDATE pacientes SET activo = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rows[0];
}
