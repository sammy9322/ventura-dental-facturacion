import { pool } from '../config/database.js';
import bcrypt from 'bcrypt';

export async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Verificando datos iniciales...');

    // ── Migrar cajero → secretaria si existe ────────────────────────
    await client.query(`UPDATE usuarios SET rol = 'secretaria' WHERE rol = 'cajero'`);

    // ── Usuario admin ───────────────────────────────────────────────
    const adminExists = await client.query(
      'SELECT id FROM usuarios WHERE username = $1', ['admin']
    );
    if (adminExists.rows.length === 0) {
      const hash = await bcrypt.hash('admin123', 10);
      await client.query(`
        INSERT INTO usuarios (username, password_hash, nombre_completo, rol)
        VALUES ($1, $2, $3, $4)
      `, ['admin', hash, 'Administrador', 'admin']);
      console.log('✓ Usuario admin creado (usuario: admin, contraseña: admin123)');
    }

    // ── Usuario doctor demo ─────────────────────────────────────────
    const doctorExists = await client.query(
      'SELECT id FROM usuarios WHERE username = $1', ['doctor1']
    );
    if (doctorExists.rows.length === 0) {
      const hash = await bcrypt.hash('doctor123', 10);
      await client.query(`
        INSERT INTO usuarios (username, password_hash, nombre_completo, rol)
        VALUES ($1, $2, $3, $4)
      `, ['doctor1', hash, 'Dra. Ventura', 'doctor']);
      console.log('✓ Usuario doctor creado (usuario: doctor1, contraseña: doctor123)');
    }

    // ── Usuario secretaria demo ─────────────────────────────────────
    const secretariaExists = await client.query(
      'SELECT id FROM usuarios WHERE username = $1', ['secretaria1']
    );
    if (secretariaExists.rows.length === 0) {
      const hash = await bcrypt.hash('sec123', 10);
      await client.query(`
        INSERT INTO usuarios (username, password_hash, nombre_completo, rol)
        VALUES ($1, $2, $3, $4)
      `, ['secretaria1', hash, 'Secretaria Principal', 'secretaria']);
      console.log('✓ Usuario secretaria creado (usuario: secretaria1, contraseña: sec123)');
    }

    // ── Secuencia de comprobantes ───────────────────────────────────
    const seqExists = await client.query('SELECT id FROM sequence_comprobantes LIMIT 1');
    if (seqExists.rows.length === 0) {
      await client.query(`
        INSERT INTO sequence_comprobantes (ultimo_numero, anio)
        VALUES (0, EXTRACT(YEAR FROM CURRENT_DATE))
      `);
      console.log('✓ Secuencia de comprobantes inicializada');
    }

    console.log('✓ Seed completado');
  } catch (error) {
    console.error('Error en seed:', error);
    throw error;
  } finally {
    client.release();
  }
}
