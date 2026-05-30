import { Router, Response } from 'express';
import { z } from 'zod';
import * as pagoModel from '../models/pago.js';
import { authenticateToken, requireDoctor, requireSecretaria, requireDoctorOrSecretaria, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { sendComprobanteEmail } from '../services/email.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { auditoriaService } from '../services/auditoria.js';

const router = Router();

const createPagoSchema = z.object({
  paciente_id: z.number().int().positive(),
  tratamiento_id: z.number().int().positive().optional(),
  concepto: z.string().min(1),
  moneda: z.enum(['PEN', 'USD', 'CRC']).optional(),
  observaciones: z.string().optional(),
  detalles: z.array(z.object({
    tratamiento_macro_id: z.number().int().positive().optional(),
    descripcion: z.string().min(1),
    observaciones: z.string().optional(),
    monto: z.number().positive(),
    es_cuota_principal: z.boolean().optional(),
  })).min(1),
});

const finalizarSchema = z.object({
  metodo_pago: z.enum(['efectivo', 'tarjeta', 'transferencia', 'sinpe']),
  firma_dataurl: z.string().optional(),
  enviar_email: z.boolean().optional(),
});

// GET /pagos → historial (secretaria/admin/doctor)
router.get('/', authenticateToken, requireDoctorOrSecretaria, asyncHandler(async (req: AuthRequest, res: Response) => {
  const filters = {
    fechaDesde: req.query.fechaDesde as string | undefined,
    fechaHasta: req.query.fechaHasta as string | undefined,
    pacienteId: req.query.pacienteId ? parseInt(req.query.pacienteId as string) : undefined,
    estado: req.query.estado as string | undefined,
    doctorId: req.user?.rol === 'doctor' ? req.user.id : undefined,
  };
  const pagos = await pagoModel.getAll(filters);
  res.json(pagos);
}));

// GET /pagos/pendientes → pagos pendientes de cobro (secretaria/admin)
router.get('/pendientes', authenticateToken, requireSecretaria, asyncHandler(async (req: AuthRequest, res: Response) => {
  const pagos = await pagoModel.getPendientesCobro();
  res.json(pagos);
}));

// GET /pagos/stats → estadísticas
router.get('/stats', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const stats = await pagoModel.getStats(
    req.query.fechaDesde as string | undefined,
    req.query.fechaHasta as string | undefined
  );
  const porMetodo = await pagoModel.getByMetodoPago(
    req.query.fechaDesde as string | undefined,
    req.query.fechaHasta as string | undefined
  );
  res.json({ resumen: stats, por_metodo: porMetodo });
}));

// GET /pagos/stats/advanced → KPIs IE (admin)
router.get('/stats/advanced', authenticateToken, requireAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  const stats = await pagoModel.getAdvancedStats();
  res.json(stats);
}));

// GET /pagos/:id → detalle de pago
router.get('/:id', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const pago = await pagoModel.getById(parseInt(req.params.id));
  if (!pago) return res.status(404).json({ error: 'Pago no encontrado' });
  res.json(pago);
}));

// POST /pagos → registrar pago (SOLO doctor o admin)
router.post('/', authenticateToken, requireDoctor, asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const data = createPagoSchema.parse(req.body);
    const pago = await pagoModel.create({
      ...data,
      doctor_id: req.user!.id,
    });
    res.status(201).json(pago);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    if (
      error instanceof Error &&
      [
        'Tratamiento no encontrado',
        'El tratamiento no pertenece al paciente seleccionado',
        'Solo se puede registrar pago en tratamientos activos',
        'Solo se permite una cuota principal por pago',
        'No se puede marcar cuota principal sin un tratamiento asociado',
        'La cuota principal excede el saldo pendiente del tratamiento',
      ].includes(error.message)
    ) {
      return res.status(400).json({ error: error.message });
    }
    throw error; // Centralizado
  }
}));

// PUT /pagos/:id/finalizar → cobrar y emitir comprobante (SOLO secretaria o admin)
router.put('/:id/finalizar', authenticateToken, requireSecretaria, asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const data = finalizarSchema.parse(req.body);

    const result = await pagoModel.finalizar(id, {
      secretaria_id: req.user!.id,
      metodo_pago: data.metodo_pago,
      firma_dataurl: data.firma_dataurl,
    });

    // Enviar email si se solicita
    if (data.enviar_email) {
      const pagoCompleto = await pagoModel.getById(id);
      if (pagoCompleto?.paciente_email) {
        await sendComprobanteEmail(pagoCompleto).catch(err =>
          console.error('Email send error (non-fatal):', err)
        );
      }
    }

    res.json(result);

    // Registrar en auditoría
    await auditoriaService.registrar({
      usuario_id: req.user!.id,
      accion: 'COBRAR_PAGO',
      entidad: 'pagos',
      entidad_id: id,
      valor_nuevo: { estado: 'completado', metodo_pago: data.metodo_pago },
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    if (error.message === 'Pago no encontrado o ya procesado') return res.status(400).json({ error: error.message });
    throw error; // Centralizado
  }
}));

// PUT /pagos/:id/anular
router.put('/:id/anular', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);

  // Obtener pago existente
  const pagoExistente = await pagoModel.getById(id);
  if (!pagoExistente) return res.status(404).json({ error: 'Pago no encontrado' });

  // Validar: solo admin puede anular fuera de pendiente_cobro
  if (req.user?.rol !== 'admin' && pagoExistente.estado !== 'pendiente_cobro') {
    return res.status(403).json({ error: 'Solo se pueden anular pagos pendientes de cobro' });
  }

  // Validar: doctor solo puede anular sus propios cobros
  if (req.user?.rol === 'doctor' && pagoExistente.doctor_id !== req.user!.id) {
    return res.status(403).json({ error: 'No puedes anular cobros de otros doctores' });
  }

  const pago = await pagoModel.anular(id);
  if (!pago) return res.status(404).json({ error: 'Pago no encontrado' });

  // Registrar en auditoría
  await auditoriaService.registrar({
    usuario_id: req.user!.id,
    accion: 'ANULAR_PAGO',
    entidad: 'pagos',
    entidad_id: id,
    valor_anterior: { estado: 'completado' },
    valor_nuevo: { estado: 'anulado' },
    ip_address: req.ip,
    user_agent: req.get('user-agent')
  });

  res.json(pago);
}));

export default router;
