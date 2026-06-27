import { Router, Response } from 'express';
import { z } from 'zod';
import * as citaModel from '../models/cita.js';
import { authenticateToken, requireDoctorOrSecretaria, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

const createCitaSchema = z.object({
  paciente_id: z.number().int().positive().nullable().optional(),
  doctor_id: z.number().int().positive(),
  tratamiento_id: z.number().int().positive().nullable().optional(),
  macro_tratamiento_id: z.number().int().positive().nullable().optional(),
  titulo: z.string().min(1, 'El título es requerido'),
  notas: z.string().optional(),
  fecha_inicio: z.string().min(1),
  fecha_fin: z.string().min(1),
  estado: z.enum(['programada','confirmada','en_progreso','completada','cancelada','no_asistio']).optional(),
  es_nota_personal: z.boolean().optional(),
});

const updateEstadoSchema = z.object({
  estado: z.enum(['programada','confirmada','en_progreso','completada','cancelada','no_asistio']),
});

// GET /api/citas?doctor_id=&desde=&hasta=
router.get('/', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const filters: citaModel.CitaFilters = {};

  // Doctor solo ve sus propias citas
  if (user.rol === 'doctor') {
    filters.doctor_id = user.id;
  } else if (req.query.doctor_id) {
    filters.doctor_id = Number(req.query.doctor_id);
  }

  if (req.query.desde) filters.desde = req.query.desde as string;
  if (req.query.hasta) filters.hasta = req.query.hasta as string;

  const citas = await citaModel.getAll(filters);
  res.json(citas);
}));

// GET /api/citas/hoy/count
router.get('/hoy/count', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const doctorId = user.rol === 'doctor' ? user.id : undefined;
  const total = await citaModel.countToday(doctorId);
  res.json({ total });
}));

// GET /api/citas/:id
router.get('/:id', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const cita = await citaModel.getById(Number(req.params.id));
  if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });

  // Doctor solo ve sus propias citas
  const user = req.user!;
  if (user.rol === 'doctor' && cita.doctor_id !== user.id) {
    return res.status(403).json({ error: 'No tiene acceso a esta cita' });
  }

  res.json(cita);
}));

// POST /api/citas
router.post('/', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const parsed = createCitaSchema.parse(req.body);

  // Doctor solo puede crear citas para sí mismo
  if (user.rol === 'doctor' && parsed.doctor_id !== user.id) {
    return res.status(403).json({ error: 'Solo puede crear citas para usted mismo' });
  }

  const result = await citaModel.create(parsed);
  if (result.conflict) {
    return res.status(409).json({ error: 'El doctor ya tiene una cita en ese horario' });
  }
  res.status(201).json(result.cita);
}));

// PUT /api/citas/:id
router.put('/:id', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const id = Number(req.params.id);

  // Verificar que existe y permisos
  const existing = await citaModel.getById(id);
  if (!existing) return res.status(404).json({ error: 'Cita no encontrada' });
  if (user.rol === 'doctor' && existing.doctor_id !== user.id) {
    return res.status(403).json({ error: 'No tiene acceso a esta cita' });
  }

  const parsed = createCitaSchema.partial().parse(req.body);
  // Mantener doctor_id original si el doctor edita
  if (user.rol === 'doctor') parsed.doctor_id = user.id;

  const result = await citaModel.update(id, { ...parsed, doctor_id: parsed.doctor_id ?? existing.doctor_id });
  if (result.conflict) {
    return res.status(409).json({ error: 'El doctor ya tiene una cita en ese horario' });
  }
  res.json(result.cita);
}));

// PATCH /api/citas/:id/estado
router.patch('/:id/estado', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const id = Number(req.params.id);

  const existing = await citaModel.getById(id);
  if (!existing) return res.status(404).json({ error: 'Cita no encontrada' });
  if (user.rol === 'doctor' && existing.doctor_id !== user.id) {
    return res.status(403).json({ error: 'No tiene acceso a esta cita' });
  }

  const { estado } = updateEstadoSchema.parse(req.body);
  const updated = await citaModel.updateEstado(id, estado);
  res.json(updated);
}));

// DELETE /api/citas/:id
router.delete('/:id', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const id = Number(req.params.id);

  const existing = await citaModel.getById(id);
  if (!existing) return res.status(404).json({ error: 'Cita no encontrada' });
  if (user.rol === 'doctor' && existing.doctor_id !== user.id) {
    return res.status(403).json({ error: 'No tiene acceso a esta cita' });
  }

  await citaModel.remove(id);
  res.json({ message: 'Cita eliminada' });
}));

export default router;
