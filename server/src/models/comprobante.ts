import { query, getClient } from '../config/database.js';

export interface Comprobante {
    id: number;
    pago_id: number;
    numero: string;
    created_at: Date;
    detalles?: any[];
}

export async function findByPagoId(pagoId: number) {
    const result = await query('SELECT c.*, p.monto, p.metodo_pago, p.moneda, p.concepto, p.created_at as pago_fecha, p.firma_dataurl, pa.nombre as paciente_nombre, pa.dni as paciente_dni, pa.telefono as paciente_telefono, pa.email as paciente_email, pa.direccion as paciente_direccion, d.nombre_completo as doctor_nombre, s.nombre_completo as cajero_nombre, t.monto_total as tratamiento_monto_total, t.monto_pagado as tratamiento_monto_pagado, t.tipo as tratamiento_tipo FROM comprobantes c JOIN pagos p ON c.pago_id = p.id LEFT JOIN pacientes pa ON p.paciente_id = pa.id LEFT JOIN usuarios d ON p.doctor_id = d.id LEFT JOIN usuarios s ON p.secretaria_id = s.id LEFT JOIN tratamientos t ON p.tratamiento_id = t.id WHERE c.pago_id = $1', [pagoId]);
    const comprobante = result.rows[0];
    if (!comprobante) return null;
    const detallesResult = await query('SELECT dp.*, tm.nombre as macro_nombre FROM detalle_pago dp LEFT JOIN tratamiento_macro tm ON dp.tratamiento_macro_id = tm.id WHERE dp.pago_id = $1 ORDER BY dp.es_cuota_principal DESC, dp.id ASC', [pagoId]);
    comprobante.detalles = detallesResult.rows;
    return comprobante;
}

export async function findByNumero(numero: string) {
    const result = await query('SELECT c.*, p.monto, p.metodo_pago, p.moneda, p.concepto, p.created_at as pago_fecha, p.firma_dataurl, pa.nombre as paciente_nombre, pa.dni as paciente_dni, pa.telefono as paciente_telefono, pa.email as paciente_email, pa.direccion as paciente_direccion, d.nombre_completo as doctor_nombre, s.nombre_completo as cajero_nombre, t.monto_total as tratamiento_monto_total, t.monto_pagado as tratamiento_monto_pagado, t.tipo as tratamiento_tipo FROM comprobantes c JOIN pagos p ON c.pago_id = p.id LEFT JOIN pacientes pa ON p.paciente_id = pa.id LEFT JOIN usuarios d ON p.doctor_id = d.id LEFT JOIN usuarios s ON p.secretaria_id = s.id LEFT JOIN tratamientos t ON p.tratamiento_id = t.id WHERE c.numero = $1', [numero]);
    const comprobante = result.rows[0];
    if (!comprobante) return null;
    const detallesResult = await query('SELECT dp.*, tm.nombre as macro_nombre FROM detalle_pago dp LEFT JOIN tratamiento_macro tm ON dp.tratamiento_macro_id = tm.id WHERE dp.pago_id = $1 ORDER BY dp.es_cuota_principal DESC, dp.id ASC', [comprobante.pago_id]);
    comprobante.detalles = detallesResult.rows;
    return comprobante;
}

export async function ensureComprobanteExists(pagoId: number) {
    const client = await getClient();
    try {
          await client.query('BEGIN');
          const existing = await client.query('SELECT * FROM comprobantes WHERE pago_id = $1', [pagoId]);
          if (existing.rows.length > 0) {
                  await client.query('COMMIT');
                  return findByPagoId(pagoId);
          }
          const lastNumResult = await client.query("SELECT numero FROM comprobantes WHERE numero LIKE 'C-%' ORDER BY id DESC LIMIT 1");
          let nextNum = 'C-0001';
          if (lastNumResult.rows.length > 0) {
                  const lastNum = lastNumResult.rows[0].numero;
                  const numPart = parseInt(lastNum.split('-')[1]);
                  const nextNumVal = (numPart + 1).toString();
                  nextNum = 'C-' + nextNumVal.padStart(4, '0');
          }
          await client.query('INSERT INTO comprobantes (pago_id, numero) VALUES ($1, $2)', [pagoId, nextNum]);
          await client.query('COMMIT');
          return findByPagoId(pagoId);
    } catch (error) {
          await client.query('ROLLBACK');
          throw error;
    } finally {
          client.release();
    }
}
