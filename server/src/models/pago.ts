import { query, getClient } from '../config/database.js';

export interface DetallePago {
  tratamiento_macro_id?: number;
  tratamiento_micro_id?: number;
  descripcion: string;
  observaciones?: string;
  monto: number;
  es_cuota_principal?: boolean;
}

export interface Pago {
  id: number;
  paciente_id: number;
  doctor_id: number;
  secretaria_id: number | null;
  tratamiento_id: number | null;
  monto: number;
  moneda: 'PEN' | 'USD' | 'CRC';
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'yape' | 'plin' | null;
  concepto: string;
  observaciones: string | null;
  firma_dataurl: string | null;
  estado: 'pendiente_cobro' | 'completado' | 'anulado';
  created_at: Date;
  finalizado_at: Date | null;
}

export interface PagoWithDetails extends Pago {
  paciente_nombre?: string;
  paciente_dni?: string;
  paciente_telefono?: string;
  paciente_email?: string;
  doctor_nombre?: string;
  secretaria_nombre?: string;
  detalles?: DetallePago[];
  comprobante_numero?: string;
  // Datos del tratamiento principal
  tratamiento_monto_total?: number;
  tratamiento_monto_pagado_historico?: number;
}

// ── Crear pago (rol: doctor) ────────────────────────────────────────────────
export async function create(data: {
  paciente_id: number;
  doctor_id: number;
  tratamiento_id?: number;
  concepto: string;
  moneda?: 'PEN' | 'USD' | 'CRC';
  observaciones?: string;
  detalles: DetallePago[];  // ítems dinámicos
}) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Calcular monto total de los detalles
    const montoTotal = data.detalles.reduce((sum, d) => sum + d.monto, 0);

    const cuotasPrincipales = data.detalles.filter((d) => d.es_cuota_principal);
    if (cuotasPrincipales.length > 1) {
      throw new Error('Solo se permite una cuota principal por pago');
    }
    if (cuotasPrincipales.length > 0 && !data.tratamiento_id) {
      throw new Error('No se puede marcar cuota principal sin un tratamiento asociado');
    }

    if (data.tratamiento_id) {
      const tratamientoResult = await client.query(
        `SELECT id, paciente_id, estado, monto_total, monto_pagado
         FROM tratamientos
         WHERE id = $1
         FOR UPDATE`,
        [data.tratamiento_id]
      );

      if (tratamientoResult.rows.length === 0) {
        throw new Error('Tratamiento no encontrado');
      }

      const tratamientoSeleccionado = tratamientoResult.rows[0] as {
        id: number;
        paciente_id: number;
        estado: string;
        monto_total: number;
        monto_pagado: number;
      };

      if (tratamientoSeleccionado.paciente_id !== data.paciente_id) {
        throw new Error('El tratamiento no pertenece al paciente seleccionado');
      }

      if (tratamientoSeleccionado.estado !== 'activo') {
        throw new Error('Solo se puede registrar pago en tratamientos activos');
      }

      const cuotaPrincipal = cuotasPrincipales[0];
      if (cuotaPrincipal) {
        // Verificar si ya existe un pago PENDIENTE con cuota principal para este tratamiento
        // Esto evita duplicidad de abonos al saldo antes de ser cobrados
        const pagoPendienteResult = await client.query(`
          SELECT p.id 
          FROM pagos p
          JOIN detalle_pago dp ON p.id = dp.pago_id
          WHERE p.tratamiento_id = $1 
            AND p.estado = 'pendiente_cobro' 
            AND dp.es_cuota_principal = true
          LIMIT 1
        `, [data.tratamiento_id]);

        if (pagoPendienteResult.rows.length > 0) {
          throw new Error('Ya existe un pago pendiente de cobro con cuota principal para este tratamiento. Por favor finalice el cobro anterior primero.');
        }

        const saldoPendiente = Number(tratamientoSeleccionado.monto_total) - Number(tratamientoSeleccionado.monto_pagado);
        if (cuotaPrincipal.monto > saldoPendiente) {
          throw new Error('La cuota principal excede el saldo pendiente del tratamiento');
        }
      }
    }

    // Insertar pago con estado pendiente_cobro
    const pagoResult = await client.query(`
      INSERT INTO pagos (paciente_id, doctor_id, tratamiento_id, monto, moneda, concepto, observaciones, estado)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente_cobro')
      RETURNING *
    `, [data.paciente_id, data.doctor_id, data.tratamiento_id || null, montoTotal, data.moneda || 'PEN', data.concepto, data.observaciones || null]);

    const pago = pagoResult.rows[0];

    // Insertar detalles del pago
    for (const detalle of data.detalles) {
      await client.query(`
        INSERT INTO detalle_pago (pago_id, tratamiento_macro_id, tratamiento_micro_id, descripcion, observaciones, monto, es_cuota_principal)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [pago.id, detalle.tratamiento_macro_id || null, detalle.tratamiento_micro_id || null, detalle.descripcion, detalle.observaciones || null, detalle.monto, detalle.es_cuota_principal ?? false]);
    }

    // Actualizar monto_pagado en tratamiento si hay cuota principal
    const cuotaPrincipal = data.detalles.find(d => d.es_cuota_principal);
    if (data.tratamiento_id && cuotaPrincipal) {
      await client.query(`
        UPDATE tratamientos
        SET monto_pagado = monto_pagado + $1,
            estado = CASE
              WHEN (monto_pagado + $1) >= monto_total THEN 'completado'
              ELSE 'activo'
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [cuotaPrincipal.monto, data.tratamiento_id]);
    }

    // Crear notificación para secretaria
    await client.query(`
      INSERT INTO notificaciones (pago_id, leida) VALUES ($1, false)
    `, [pago.id]);

    await client.query('COMMIT');
    return pago;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// ── Finalizar pago (rol: secretaria) ───────────────────────────────────────
export async function finalizar(id: number, data: {
  secretaria_id: number;
  metodo_pago: string;
  firma_dataurl?: string;
}) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const pagoResult = await client.query(`
      UPDATE pagos
      SET estado = 'completado',
          secretaria_id = $1,
          metodo_pago = $2,
          firma_dataurl = $3,
          finalizado_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND estado = 'pendiente_cobro'
      RETURNING *
    `, [data.secretaria_id, data.metodo_pago, data.firma_dataurl || null, id]);

    if (pagoResult.rows.length === 0) {
      throw new Error('Pago no encontrado o ya procesado');
    }

    // Generar comprobante (upsert atomico por anio)
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

    await client.query(`
      INSERT INTO comprobantes (pago_id, numero) VALUES ($1, $2)
    `, [id, numero]);

    // Marcar notificación como leída
    await client.query(`UPDATE notificaciones SET leida = true WHERE pago_id = $1`, [id]);

    await client.query('COMMIT');
    return { pago: pagoResult.rows[0], numero };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// ── Obtener todos los pagos ─────────────────────────────────────────────────
export async function getAll(filters?: {
  fechaDesde?: string;
  fechaHasta?: string;
  pacienteId?: number;
  estado?: string;
}) {
  let sql = `
    SELECT p.*,
           pa.nombre as paciente_nombre,
           pa.dni as paciente_dni,
           pa.telefono as paciente_telefono,
           pa.email as paciente_email,
           doc.nombre_completo as doctor_nombre,
           sec.nombre_completo as secretaria_nombre,
           c.numero as comprobante_numero
    FROM pagos p
    LEFT JOIN pacientes pa ON p.paciente_id = pa.id
    LEFT JOIN usuarios doc ON p.doctor_id = doc.id
    LEFT JOIN usuarios sec ON p.secretaria_id = sec.id
    LEFT JOIN comprobantes c ON p.id = c.pago_id
    WHERE 1=1
  `;
  const params: unknown[] = [];
  let idx = 1;

  if (filters?.fechaDesde) { sql += ` AND DATE(p.created_at) >= $${idx++}`; params.push(filters.fechaDesde); }
  if (filters?.fechaHasta) { sql += ` AND DATE(p.created_at) <= $${idx++}`; params.push(filters.fechaHasta); }
  if (filters?.pacienteId) { sql += ` AND p.paciente_id = $${idx++}`; params.push(filters.pacienteId); }
  if (filters?.estado) { sql += ` AND p.estado = $${idx++}`; params.push(filters.estado); }

  sql += ` ORDER BY p.created_at DESC`;
  const result = await query(sql, params);
  return result.rows;
}

// ── Obtener pagos pendientes de cobro ───────────────────────────────────────
export async function getPendientesCobro() {
  const result = await query(`
    SELECT p.id, p.monto, p.concepto, p.estado, p.created_at, p.tratamiento_id, p.paciente_id, p.doctor_id,
           pa.nombre as paciente_nombre,
           pa.dni as paciente_dni,
           pa.telefono as paciente_telefono,
           pa.email as paciente_email,
           doc.nombre_completo as doctor_nombre,
           t.monto_total as tratamiento_monto_total,
           t.monto_pagado as tratamiento_monto_pagado,
           t.tipo as tratamiento_tipo
    FROM pagos p
    LEFT JOIN pacientes pa ON p.paciente_id = pa.id
    LEFT JOIN usuarios doc ON p.doctor_id = doc.id
    LEFT JOIN tratamientos t ON p.tratamiento_id = t.id
    WHERE p.estado = 'pendiente_cobro'
    ORDER BY p.created_at ASC
  `);

  // Añadir detalles a cada pago
  const pagos = result.rows;
  for (const pago of pagos) {
    const detallesResult = await query(
      `SELECT * FROM detalle_pago WHERE pago_id = $1 ORDER BY es_cuota_principal DESC, id ASC`,
      [pago.id]
    );
    pago.detalles = detallesResult.rows;
  }
  return pagos;
}

// ── Obtener pago por ID (con detalles completos) ────────────────────────────
export async function getById(id: number) {
  const result = await query(`
    SELECT p.*,
           pa.nombre as paciente_nombre,
           pa.dni as paciente_dni,
           pa.telefono as paciente_telefono,
           pa.email as paciente_email,
           doc.nombre_completo as doctor_nombre,
           sec.nombre_completo as secretaria_nombre,
           c.numero as comprobante_numero,
           t.monto_total as tratamiento_monto_total,
           t.monto_pagado as tratamiento_monto_pagado,
           t.tipo as tratamiento_tipo
    FROM pagos p
    LEFT JOIN pacientes pa ON p.paciente_id = pa.id
    LEFT JOIN usuarios doc ON p.doctor_id = doc.id
    LEFT JOIN usuarios sec ON p.secretaria_id = sec.id
    LEFT JOIN comprobantes c ON p.id = c.pago_id
    LEFT JOIN tratamientos t ON p.tratamiento_id = t.id
    WHERE p.id = $1
  `, [id]);

  if (result.rows.length === 0) return null;

  const pago = result.rows[0];
  const detallesResult = await query(
    `SELECT * FROM detalle_pago WHERE pago_id = $1 ORDER BY es_cuota_principal DESC, id ASC`,
    [id]
  );
  pago.detalles = detallesResult.rows;
  return pago;
}

// ── Anular pago ─────────────────────────────────────────────────────────────
export async function anular(id: number) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const pagoResult = await client.query(
      `SELECT id, estado, tratamiento_id FROM pagos WHERE id = $1 FOR UPDATE`,
      [id]
    );

    if (pagoResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return undefined;
    }

    const pago = pagoResult.rows[0] as { id: number; estado: string; tratamiento_id: number | null };

    if (pago.estado !== 'anulado' && pago.tratamiento_id) {
      const cuotaResult = await client.query(
        `SELECT COALESCE(SUM(monto), 0) AS total
         FROM detalle_pago
         WHERE pago_id = $1 AND es_cuota_principal = true`,
        [id]
      );

      const cuotaPrincipal = Number(cuotaResult.rows[0].total);
      if (cuotaPrincipal > 0) {
        await client.query(
          `UPDATE tratamientos
           SET monto_pagado = GREATEST(0, monto_pagado - $1),
               estado = CASE
                 WHEN estado = 'cancelado' THEN 'cancelado'
                 WHEN GREATEST(0, monto_pagado - $1) >= monto_total THEN 'completado'
                 ELSE 'activo'
               END,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [cuotaPrincipal, pago.tratamiento_id]
        );
      }
    }

    const result = await client.query(
      `UPDATE pagos SET estado = 'anulado' WHERE id = $1 RETURNING *`,
      [id]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// ── Stats ───────────────────────────────────────────────────────────────────
export async function getStats(fechaDesde?: string, fechaHasta?: string) {
  let sql = `
    SELECT moneda, COUNT(*) as cantidad, COALESCE(SUM(monto), 0) as total
    FROM pagos WHERE estado = 'completado'
  `;
  const params: unknown[] = [];
  let idx = 1;
  if (fechaDesde) { sql += ` AND DATE(created_at) >= $${idx++}`; params.push(fechaDesde); }
  if (fechaHasta) { sql += ` AND DATE(created_at) <= $${idx++}`; params.push(fechaHasta); }
  sql += ` GROUP BY moneda`;
  const result = await query(sql, params);
  return result.rows; // Retorna array de montos por moneda
}

export async function getByMetodoPago(fechaDesde?: string, fechaHasta?: string) {
  let sql = `
    SELECT moneda, metodo_pago, COUNT(*) as cantidad, COALESCE(SUM(monto), 0) as total
    FROM pagos WHERE estado = 'completado' AND metodo_pago IS NOT NULL
  `;
  const params: unknown[] = [];
  let idx = 1;
  if (fechaDesde) { sql += ` AND DATE(created_at) >= $${idx++}`; params.push(fechaDesde); }
  if (fechaHasta) { sql += ` AND DATE(created_at) <= $${idx++}`; params.push(fechaHasta); }
  sql += ` GROUP BY moneda, metodo_pago ORDER BY moneda, total DESC`;
  const result = await query(sql, params);
  return result.rows;
}

export async function getAdvancedStats() {
  const statsResult = await query(`
    SELECT
      (SELECT COALESCE(SUM(monto_total - monto_pagado), 0) FROM tratamientos WHERE estado = 'activo') as deuda_activa,
      (SELECT COALESCE(SUM(monto_pagado), 0) FROM tratamientos WHERE estado = 'activo') as total_cobrado_activos,
      (SELECT COALESCE(SUM(monto_total), 0) FROM tratamientos WHERE estado = 'activo') as total_contractual_activos,
      (SELECT COUNT(*) FROM pacientes WHERE activo = true) as total_pacientes_activos,
      (SELECT COUNT(*) FROM tratamientos WHERE estado = 'activo') as total_tratamientos_activos,
      (SELECT COUNT(*) FROM pagos WHERE estado = 'pendiente_cobro') as pagos_pendientes_cobro
  `);

  const monthlyResult = await query(`
    SELECT moneda, TO_CHAR(created_at, 'YYYY-MM') as mes, COUNT(*) as cantidad_pagos, SUM(monto) as total_monto
    FROM pagos WHERE estado = 'completado'
    GROUP BY moneda, mes ORDER BY mes DESC, moneda LIMIT 12
  `);

  const stats = statsResult.rows[0];
  const eficiencia = stats.total_contractual_activos > 0
    ? (stats.total_cobrado_activos / stats.total_contractual_activos) * 100
    : 0;

  return { ...stats, eficiencia_cobranza: eficiencia, tendencia_mensual: monthlyResult.rows };
}
