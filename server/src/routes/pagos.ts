import { Router, Response } from 'express';
import { z } from 'zod';
import * as pagoModel from '../models/pago.js';
import { authenticateToken, requireDoctor, requireSecretaria, AuthRequest } from '../middleware/auth.js';
import { sendComprobanteEmail } from '../services/email.js';
import { asyncHandler } from '../utils/asyncHandler.js';

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
  metodo_pago: z.enum(['efectivo', 'tarjeta', 'transferencia', 'yape', 'plin']),
  firma_dataurl: z.string().optional(),
  enviar_email: z.boolean().optional(),
});

// GET /pagos → historial (secretaria/admin)
router.get('/', authenticateToken, requireSecretaria, asyncHandler(async (req: AuthRequest, res: Response) => {
  const filters = {
    fechaDesde: req.query.fechaDesde as string | undefined,
    fechaHasta: req.query.fechaHasta as string | undefined,
    pacienteId: req.query.pacienteId ? parseInt(req.query.pacienteId as string) : undefined,
    estado: req.query.estado as string | undefined,
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
router.get('/stats/advanced', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response) => {
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
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    if (error.message === 'Pago no encontrado o ya procesado') return res.status(400).json({ error: error.message });
    throw error; // Centralizado
  }
}));

// PUT /pagos/:id/anular
router.put('/:id/anular', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user?.rol !== 'admin') return res.status(403).json({ error: 'Solo administradores pueden anular pagos' });
  const id = parseInt(req.params.id);
  const pago = await pagoModel.anular(id);
  if (!pago) return res.status(404).json({ error: 'Pago no encontrado' });
  res.json(pago);
}));

export default router;
