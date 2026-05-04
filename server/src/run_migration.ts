import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Utilizaremos la base de datos de producción (Neon DB)
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_YT0t4pNHEIJe@ep-misty-shape-am8ixibd-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=15',
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Conectado a PostgreSQL. Ejecutando migración...');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '../../../01_migracion_auditoria.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');

    // Ejecutar el script SQL
    await client.query(sqlScript);
    console.log('✅ Migración ejecutada con éxito: Tabla logs_auditoria creada.');
  } catch (error) {
    console.error('❌ Error ejecutando la migración:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
