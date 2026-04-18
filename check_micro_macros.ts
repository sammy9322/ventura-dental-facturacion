import { pool } from './server/src/config/database.js';

async function checkMicros() {
  const macros = await pool.query('SELECT id, nombre FROM tratamientos_macro ORDER BY id');
  const micros = await pool.query('SELECT id, macro_tratamiento_id, nombre FROM tratamientos_micro');
  
  console.log('--- Macros en DB ---');
  console.table(macros.rows);
  
  console.log('\n--- Relación Micros/Macros ---');
  const summary = macros.rows.map(macro => {
    const linked = micros.rows.filter(micro => Number(micro.macro_tratamiento_id) === Number(macro.id));
    return {
        macro: macro.nombre,
        id: macro.id,
        count: linked.length,
        items: linked.map(l => l.nombre).join(', ')
    };
  });
  console.table(summary);
  
  process.exit(0);
}

checkMicros();
