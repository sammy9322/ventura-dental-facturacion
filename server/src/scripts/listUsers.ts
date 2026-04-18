import { pool } from '../config/database.js';

async function listUsers() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT username, nombre_completo, rol, activo FROM usuarios ORDER BY rol, username;');
    console.table(result.rows);
  } finally {
    client.release();
    process.exit(0);
  }
}

listUsers();
