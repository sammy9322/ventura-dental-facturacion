import { pool } from '../config/database.js';

export async function migrateDoctorTratamiento() {
  const client = await pool.connect();
  try {
    console.log('Migrando: Añadiendo doctor_id a tratamientos...');
    await client.query('BEGIN');

    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tratamientos' AND column_name='doctor_id') THEN
          ALTER TABLE tratamientos ADD COLUMN doctor_id INTEGER REFERENCES usuarios(id);
        END IF;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error en migración doctor_id (ignorado): %', SQLERRM;
      END$$;
    `);

    await client.query('COMMIT');
    console.log('✓ Migración completada: doctor_id en tratamientos');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error migrando doctor_id:', error);
  } finally {
    client.release();
  }
}
