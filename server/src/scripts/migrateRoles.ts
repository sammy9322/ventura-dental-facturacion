import { pool } from '../config/database.js';

/**
 * Script de migración robusto:
 * 1. Elimina cualquier restricción de roles previa para permitir la limpieza de datos.
 * 2. Normaliza todos los roles existentes a los nuevos permitidos (admin, doctor, secretaria).
 * 3. Aplica la nueva restricción de seguridad.
 */
export async function migrateRoles() {
  const client = await pool.connect();
  try {
    // ── Paso 1: Eliminar restricción vieja para poder operar sin errores ──────
    await client.query(`ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check`);
    console.log('✓ Restricción de roles antigua eliminada temporalmente');

    // ── Paso 2: Normalizar datos ─────────────────────────────────────────────
    // Cualquier rol que no sea de la triada permitida se mapea a secretaria
    const updateRes = await client.query(`
      UPDATE usuarios 
      SET rol = CASE 
        WHEN rol = 'admin' THEN 'admin'
        WHEN rol = 'doctor' THEN 'doctor'
        ELSE 'secretaria'
      END
      WHERE rol NOT IN ('admin', 'doctor', 'secretaria')
    `);
    const affectedRows = updateRes.rowCount ?? 0;
    if (affectedRows > 0) {
      console.log(`✓ ${affectedRows} usuarios normalizados a los nuevos roles`);
    }

    // ── Paso 3: Re-aplicar la restricción de seguridad ───────────────────────
    await client.query(`
      ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check
        CHECK (rol IN ('admin', 'doctor', 'secretaria'))
    `);
    console.log('✓ Nueva restricción de roles (admin, doctor, secretaria) aplicada');

  } catch (error: any) {
    console.error('⚠️ Error crítico en migración de roles:', error.message);
    // No lanzamos error para que no bloquee el arranque si no es fatal
  } finally {
    client.release();
  }
}
