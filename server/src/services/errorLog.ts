import { pool } from '../config/database.js';

export interface ErrorLog {
  usuario_id?: number;
  modulo: string;
  error_mensaje: string;
  stack_trace?: string;
  metadata?: any;
}

/**
 * Registra un error en la base de datos para auditoría y futura notificación.
 */
export async function logError(data: ErrorLog) {
  try {
    const query = `
      INSERT INTO logs_errores (usuario_id, modulo, error_mensaje, stack_trace, metadata)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const values = [
      data.usuario_id || null,
      data.modulo,
      data.error_mensaje,
      data.stack_trace || null,
      data.metadata ? JSON.stringify(data.metadata) : null
    ];

    const result = await pool.query(query, values);
    console.log(`[ErrorLog] Error registrado con ID: ${result.rows[0].id}`);
    
    // Aquí se podría disparar un email al admin usando sendEmail si fuera crítico
    return result.rows[0].id;
  } catch (err) {
    console.error('CRÍTICO: No se pudo guardar el log de error en la base de datos', err);
  }
}
