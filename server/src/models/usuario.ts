import { query } from '../config/database.js';
import bcrypt from 'bcrypt';

export interface Usuario {
  id: number;
  username: string;
  password_hash: string;
  nombre_completo: string;
  rol: 'admin' | 'doctor' | 'secretaria';
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export async function findByUsername(username: string) {
  const result = await query(
    'SELECT * FROM usuarios WHERE username = $1 AND activo = true',
    [username]
  );
  return result.rows[0] as Usuario | undefined;
}

export async function findById(id: number) {
  const result = await query(
    'SELECT id, username, nombre_completo, rol, activo, created_at FROM usuarios WHERE id = $1',
    [id]
  );
  return result.rows[0] as Omit<Usuario, 'password_hash'> | undefined;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function getAll() {
  const result = await query(
    'SELECT id, username, nombre_completo, rol, activo, created_at FROM usuarios ORDER BY created_at DESC'
  );
  return result.rows;
}

export async function create(
  username: string,
  password: string,
  nombreCompleto: string,
  rol: 'admin' | 'doctor' | 'secretaria'
) {
  const passwordHash = await hashPassword(password);
  const result = await query(
    'INSERT INTO usuarios (username, password_hash, nombre_completo, rol) VALUES ($1, $2, $3, $4) RETURNING id, username, nombre_completo, rol',
    [username, passwordHash, nombreCompleto, rol]
  );
  return result.rows[0];
}

export async function update(id: number, data: { nombre_completo?: string; rol?: string; activo?: boolean }) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.nombre_completo) {
    fields.push(`nombre_completo = $${idx++}`);
    values.push(data.nombre_completo);
  }
  if (data.rol) {
    fields.push(`rol = $${idx++}`);
    values.push(data.rol);
  }
  if (data.activo !== undefined) {
    fields.push(`activo = $${idx++}`);
    values.push(data.activo);
  }

  if (fields.length === 0) return null;

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await query(
    `UPDATE usuarios SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, username, nombre_completo, rol, activo`,
    values
  );
  return result.rows[0];
}

export async function changePassword(id: number, newPassword: string) {
  const hash = await hashPassword(newPassword);
  await query('UPDATE usuarios SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [hash, id]);
}

export async function getSecretarias() {
  const result = await query(
    "SELECT id, username, nombre_completo FROM usuarios WHERE rol = 'secretaria' AND activo = true ORDER BY nombre_completo"
  );
  return result.rows;
}
