import { pool } from '../config/database.js';

export async function migrateCierreCaja() {
  const client = await pool.connect();
  try {
    console.log('Iniciando migración: Cierre de Caja...');
    await client.query('BEGIN');

    // ── Tabla cierres_caja ──────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS cierres_caja (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id),
        fecha DATE NOT NULL,
        
        -- Totales Esperados (Calculados por el sistema)
        esperado_efectivo DECIMAL(10,2) DEFAULT 0,
        esperado_tarjeta DECIMAL(10,2) DEFAULT 0,
        esperado_transferencia DECIMAL(10,2) DEFAULT 0,
        esperado_otros DECIMAL(10,2) DEFAULT 0, -- Yape, Plin, etc.
        
        -- Totales Reales (Ingresados por la secretaria)
        real_efectivo DECIMAL(10,2) DEFAULT 0,
        real_tarjeta DECIMAL(10,2) DEFAULT 0,
        real_transferencia DECIMAL(10,2) DEFAULT 0,
        real_otros DECIMAL(10,2) DEFAULT 0,
        
        -- Diferencias
        diferencia DECIMAL(10,2) DEFAULT 0,
        
        observaciones TEXT,
        estado VARCHAR(20) DEFAULT 'cerrado' CHECK (estado IN ('abierto', 'cerrado')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Un solo cierre por fecha por ahora
        UNIQUE(fecha)
      )
    `);
    console.log('✓ Tabla cierres_caja lista');

    await client.query('COMMIT');
    console.log('✓ Migración de Cierre de Caja completada con éxito');
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('⚠️ Error en migración de Cierre de Caja:', error.message);
  } finally {
    client.release();
  }
}
