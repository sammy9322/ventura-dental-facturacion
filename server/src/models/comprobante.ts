import { query } from '../config/database.js';

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
            s.nombre_completo as cajero_nombre
     FROM comprobantes c
     JOIN pagos p ON c.pago_id = p.id
     LEFT JOIN pacientes pa ON p.paciente_id = pa.id
     LEFT JOIN usuarios d ON p.doctor_id = d.id
     LEFT JOIN usuarios s ON p.secretaria_id = s.id
     WHERE c.pago_id = $1`,
    [pagoId]
  );
  return result.rows[0];
}

export async function findByNumero(numero: string) {
  const result = await query(
    `SELECT c.*, p.monto, p.metodo_pago, p.moneda, p.concepto, p.created_at as pago_fecha,
            p.firma_dataurl,
            pa.nombre as paciente_nombre, pa.dni as paciente_dni,
            pa.telefono as paciente_telefono, pa.email as paciente_email,
            pa.direccion as paciente_direccion,
            d.nombre_completo as doctor_nombre,
            s.nombre_completo as cajero_nombre
     FROM comprobantes c
     JOIN pagos p ON c.pago_id = p.id
     LEFT JOIN pacientes pa ON p.paciente_id = pa.id
     LEFT JOIN usuarios d ON p.doctor_id = d.id
     LEFT JOIN usuarios s ON p.secretaria_id = s.id
     WHERE c.numero = $1`,
    [numero]
  );
  return result.rows[0];
}

export async function getUltimoNumero() {
  const result = await query(
    'SELECT ultimo_numero, anio FROM sequence_comprobantes ORDER BY anio DESC, id DESC LIMIT 1'
  );
  return result.rows[0];
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
