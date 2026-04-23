import { pool } from '../config/database.js';

export const auditoriaService = {
  async registrar(data: {
    usuario_id: number | null;
    accion: string;
    entidad: string;
    entidad_id?: number;
    valor_anterior?: any;
    valor_nuevo?: any;
    ip_address?: string;
    user_agent?: string;
  }) {
    try {
      await pool.query(
        `INSERT INTO logs_auditoria 
        (usuario_id, accion, entidad, entidad_id, valor_anterior, valor_nuevo, ip_address, user_agent) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          data.usuario_id,
          data.accion,
          data.entidad,
          data.entidad_id || null,
          data.valor_anterior ? JSON.stringify(data.valor_anterior) : null,
          data.valor_nuevo ? JSON.stringify(data.valor_nuevo) : null,
          data.ip_address || null,
          data.user_agent || null
        ]
      );
    } catch (error) {
      console.error('Error al registrar auditoría:', error);
    }
  },

  async obtenerLogs(limit = 100) {
    const result = await pool.query(`
      SELECT a.*, u.nombre_completo as usuario_nombre
      FROM logs_auditoria a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      ORDER BY a.created_at DESC
      LIMIT $1
    `, [limit]);
    return result.rows;
  }
};
