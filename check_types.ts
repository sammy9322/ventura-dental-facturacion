import { pool } from './server/src/config/database.js';

async function checkTypes() {
  const res = await pool.query('SELECT macro_tratamiento_id FROM tratamientos_micro LIMIT 1');
  if (res.rows.length > 0) {
    console.log('Tipo de macro_tratamiento_id en DB:', typeof res.rows[0].macro_tratamiento_id);
    console.log('Valor:', res.rows[0].macro_tratamiento_id);
  } else {
    console.log('No hay micro tratamientos en DB');
  }
  process.exit(0);
}

checkTypes();
