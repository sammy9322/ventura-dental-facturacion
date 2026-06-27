import { pool } from '../config/database.js';

export interface CitaFilters {
  doctor_id?: number;
  desde?: string; // ISO date
  hasta?: string; // ISO date
}

export interface CitaInput {
  paciente_id?: number | null;
  doctor_id: number;
  tratamiento_id?: number | null;
  macro_tratamiento_id?: number | null;
  titulo: string;
  notas?: string;
  fecha_inicio: string; // ISO timestamp
  fecha_fin: string;
  estado?: string;
  es_nota_personal?: boolean;
}

export async function getAll(filters: CitaFilters) {
  let query = `
    SELECT c.*,
           p.nombre AS paciente_nombre,
           u.nombre_completo AS doctor_nombre,
           tm.nombre AS macro_nombre
    FROM citas c
    LEFT JOIN pacientes p ON c.paciente_id = p.id
    LEFT JOIN usuarios u ON c.doctor_id = u.id
    LEFT JOIN tratamientos_macro tm ON c.macro_tratamiento_id = tm.id
    WHERE 1=1
  `;
  const params: any[] = [];
  let idx = 1;

  if (filters.doctor_id) {
    query += ` AND c.doctor_id = $${idx++}`;
    params.push(filters.doctor_id);
  }
  if (filters.desde) {
    query += ` AND c.fecha_inicio >= $${idx++}`;
    params.push(filters.desde);
  }
  if (filters.hasta) {
    query += ` AND c.fecha_fin <= $${idx++}`;
    params.push(filters.hasta);
  }

  query += ` ORDER BY c.fecha_inicio ASC`;
  const { rows } = await pool.query(query, params);
  return rows;
}

export async function getById(id: number) {
  const { rows } = await pool.query(
    `SELECT c.*,
            p.nombre AS paciente_nombre,
            u.nombre_completo AS doctor_nombre,
            tm.nombre AS macro_nombre,
            t.tipo AS tratamiento_tipo,
            t.descripcion AS tratamiento_descripcion
     FROM citas c
     LEFT JOIN pacientes p ON c.paciente_id = p.id
     LEFT JOIN usuarios u ON c.doctor_id = u.id
     LEFT JOIN tratamientos_macro tm ON c.macro_tratamiento_id = tm.id
     LEFT JOIN tratamientos t ON c.tratamiento_id = t.id
     WHERE c.id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function create(data: CitaInput) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: conflictos } = await client.query(
      `SELECT id FROM citas
       WHERE doctor_id = $1
         AND estado NOT IN ('cancelada', 'no_asistio')
         AND fecha_inicio < $3
         AND fecha_fin > $2`,
      [data.doctor_id, data.fecha_inicio, data.fecha_fin]
    );
    if (conflictos.length > 0) {
      await client.query('ROLLBACK');
      return { conflict: true };
    }

    const { rows } = await client.query(
      `INSERT INTO citas (paciente_id, doctor_id, tratamiento_id, macro_tratamiento_id,
                          titulo, notas, fecha_inicio, fecha_fin, estado, es_nota_personal)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        data.paciente_id || null,
        data.doctor_id,
        data.tratamiento_id || null,
        data.macro_tratamiento_id || null,
        data.titulo,
        data.notas || null,
        data.fecha_inicio,
        data.fecha_fin,
        data.estado || 'programada',
        data.es_nota_personal || false,
      ]
    );

    await client.query('COMMIT');
    return { conflict: false, cita: rows[0] };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function update(id: number, data: Partial<CitaInput>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (data.fecha_inicio && data.fecha_fin && data.doctor_id) {
      const { rows: conflictos } = await client.query(
        `SELECT id FROM citas
         WHERE doctor_id = $1
           AND id != $4
           AND estado NOT IN ('cancelada', 'no_asistio')
           AND fecha_inicio < $3
           AND fecha_fin > $2`,
        [data.doctor_id, data.fecha_inicio, data.fecha_fin, id]
      );
      if (conflictos.length > 0) {
        await client.query('ROLLBACK');
        return { conflict: true };
      }
    }

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowedFields = [
      'paciente_id', 'doctor_id', 'tratamiento_id', 'macro_tratamiento_id',
      'titulo', 'notas', 'fecha_inicio', 'fecha_fin', 'estado', 'es_nota_personal'
    ];

    for (const key of allowedFields) {
      if (key in data) {
        fields.push(`${key} = $${idx++}`);
        values.push((data as any)[key]);
      }
    }

    if (fields.length === 0) {
      await client.query('ROLLBACK');
      return { conflict: false, cita: await getById(id) };
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const { rows } = await client.query(
      `UPDATE citas SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    await client.query('COMMIT');
    return { conflict: false, cita: rows[0] };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function updateEstado(id: number, estado: string) {
  const { rows } = await pool.query(
    `UPDATE citas SET estado = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [estado, id]
  );
  return rows[0] || null;
}

export async function remove(id: number) {
  const { rowCount } = await pool.query(`DELETE FROM citas WHERE id = $1`, [id]);
  return (rowCount ?? 0) > 0;
}

export async function countToday(doctorId?: number) {
  const today = new Date().toISOString().split('T')[0];
  let query = `SELECT COUNT(*)::int AS total FROM citas WHERE fecha_inicio::date = $1 AND estado NOT IN ('cancelada', 'no_asistio')`;
  const params: any[] = [today];
  if (doctorId) {
    query += ` AND doctor_id = $2`;
    params.push(doctorId);
  }
  const { rows } = await pool.query(query, params);
  return rows[0].total;
}
