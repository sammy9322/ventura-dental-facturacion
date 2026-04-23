import { pool } from '../config/database.js';

export async function migrateAuditoria() {
  const client = await pool.connect();
  try {
    console.log('Iniciando migración: Auditoría...');
    await client.query('BEGIN');

    // ── Tabla logs_auditoria ─────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS logs_auditoria (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id),
        accion VARCHAR(50) NOT NULL,
        entidad VARCHAR(50) NOT NULL,
        entidad_id INTEGER,
        valor_anterior JSONB,
        valor_nuevo JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabla logs_auditoria lista');

    // ── Tabla logs_errores ───────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS logs_errores (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id),
        error_mensaje TEXT NOT NULL,
        error_stack TEXT,
        ruta VARCHAR(255),
        metodo VARCHAR(10),
        parametros JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabla logs_errores lista');

    await client.query('COMMIT');
    console.log('✓ Migración de Auditoría completada con éxito');
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('⚠️ Error en migración de Auditoría:', error.message);
  } finally {
    client.release();
  }
}
