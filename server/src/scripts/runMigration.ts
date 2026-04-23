import { migrateCierreCaja } from './migrateCierreCaja.js';
import { pool } from '../config/database.js';

async function run() {
  try {
    await migrateCierreCaja();
    console.log('Migración finalizada satisfactoriamente.');
    process.exit(0);
  } catch (err) {
    console.error('Error ejecutando migración:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
