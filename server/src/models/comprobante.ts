import { query, getClient } from '../config/database.js';

export interface Comprobante {
  id: number;
  pago_id: number;
  numero: string;
  created_at: Date;
}

export async function findByPagoId(pagoId: number) {
  const result = await query(
    `SELECT c.*, p.monto, p.metodo_pago, p.moneda, p.concepto, p.created_at as pago_fecha,
            p.firma_dataurl,
            pa.nombre as paciente_nombre, pa.dni as paciente_dni,
            pa.telefono as paciente_telefono, pa.email as paciente_email,
            pa.direccion as paciente_direccion,
            d.nombre_completo as doctor_nombre,
            s.nombre_completo as cajero_nombre,
            t.monto_total as tratamiento_monto_total,
            t.monto_pagado as tratamiento_monto_pagado,
            t.tipo as tratamiento_tipo
     FROM comprobantes c
     JOIN pagos p ON c.pago_id = p.id
     LEFT JOIN pacientes pa ON p.paciente_id = pa.id
     LEFT JOIN usuarios d ON p.doctor_id = d.id
     LEFT JOIN usuarios s ON p.secretaria_id = s.id
     LEFT JOIN tratamientos t ON p.tratamiento_id = t.id
     WHERE c.pago_id = $1`,
    [pagoId]
  );
  
  const comprobante = result.rows[0];
  if (!comprobante) return null;
  
  // Obtener los detalles del pago
  const detallesResult = await query(
    `SELECT dp.*, tm.nombre as macro_nombre
     FROM detalle_pago dp
     LEFT JOIN tratamiento_macro tm ON dp.tratamiento_macro_id = tm.id
     WHERE dp.pago_id = $1
     ORDER BY dp.es_cuota_principal DESC, dp.id ASC`,
    [pagoId]
  );
  
  comprobante.detalles = detallesResult.rows;
  return comprobante;
}

export async function findByNumero(numero: string) {
  const result = await query(
    `SELECT c.*, p.monto, p.metodo_pago, p.moneda, p.concepto, p.created_at as pago_fecha,
            p.firma_dataurl,
            pa.nombre as paciente_nombre, pa.dni as paciente_dni,
            pa.telefono as paciente_telefono, pa.email as paciente_email,
            pa.direccion as paciente_direccion,
            d.nombre_completo as doctor_nombre,
            s.nombre_completo as cajero_nombre,
            t.monto_total as tratamiento_monto_total,
            t.monto_pagado as tratamiento_monto_pagado,
            t.tipo as tratamiento_tipo
     FROM comprobantes c
     JOIN pagos p ON c.pago_id = p.id
     LEFT JOIN pacientes pa ON p.paciente_id = pa.id
     LEFT JOIN usuarios d ON p.doctor_id = d.id
     LEFT JOIN usuarios s ON p.secretaria_id = s.id
     LEFT JOIN tratamientos t ON p.tratamiento_id = t.id
     WHERE c.numero = $1`,
    [numero]
  );
  
  if (result.rows.length === 0) return null;
  
  const comprobante = result.rows[0];
  
  // Obtener los detalles del pago
  const detallesResult = await query(
    `SELECT dp.*, tm.nombre as macro_nombre
     FROM detalle_pago dp
     LEFT JOIN tratamiento_macro tm ON dp.tratamiento_macro_id = tm.id
     WHERE dp.pago_id = $1
     ORDER BY dp.es_cuota_principal DESC, dp.id ASC`,
    [comprobante.pago_id]
  );
  
  comprobante.detalles = detallesResult.rows;
  return comprobante;
}

export async function getUltimoNumero() {
  const result = await query(
    'SELECT ultimo_numero, anio FROM sequence_comprobantes ORDER BY anio DESC, id DESC LIMIT 1'
  );
  return result.rows[0];
}

export async function ensureComprobanteExists(pagoId: number) {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    
    const existing = await client.query(
      `SELECT c.id, c.pago_id, c.numero, c.created_at
       FROM comprobantes c WHERE c.pago_id = $1`,
      [pagoId]
    );
    
    if (existing.rows.length > 0) {
      await client.query('COMMIT');
      client.release();
      return await findByPagoId(pagoId);
    }
    
    const pagoResult = await client.query(
      "SELECT id FROM pagos WHERE id = $1 AND estado = 'completado'",
      [pagoId]
    );
    if (pagoResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return null;
    }
    
    const seqResult = await client.query(`
      INSERT INTO sequence_comprobantes (anio, ultimo_numero, updated_at)
      VALUES (EXTRACT(YEAR FROM CURRENT_DATE)::INT, 1, CURRENT_TIMESTAMP)
      ON CONFLICT (anio)
      DO UPDATE
        SET ultimo_numero = sequence_comprobantes.ultimo_numero + 1,
            updated_at = CURRENT_TIMESTAMP
      RETURNING ultimo_numero, anio
    `);

    const { ultimo_numero, anio } = seqResult.rows[0];
    const numero = `${anio}-${String(ultimo_numero).padStart(4, '0')}`;

    await client.query('INSERT INTO comprobantes (pago_id, numero) VALUES ($1, $2)', [pagoId, numero]);
    await client.query('COMMIT');
    client.release();
    
    return await findByPagoId(pagoId);
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    client.release();
    throw error;
  }
}

export async function getAll(limit = 50, offset = 0) {
  const result = await query(
    `SELECT c.*, p.monto, p.metodo_pago, p.concepto,
            pa.nombre as paciente_nombre, pa.dni as paciente_dni
     FROM comprobantes c
     JOIN pagos p ON c.pago_id = p.id
     LEFT JOIN pacientes pa ON p.paciente_id = pa.id
     ORDER BY c.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
}
