import { Router, Response } from 'express';
import { z } from 'zod';
import * as horarioModel from '../models/horarioClinica.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

const horarioSchema = z.array(z.object({
  dia_semana: z.number().int().min(0).max(6),
  hora_apertura: z.string().regex(/^\d{2}:\d{2}$/),
  hora_cierre: z.string().regex(/^\d{2}:\d{2}$/),
  es_laborable: z.boolean(),
}));

// GET /api/horario-clinica
router.get('/', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const horarios = await horarioModel.getAll();
  res.json(horarios);
}));

// PUT /api/horario-clinica
router.put('/', authenticateToken, requireAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = horarioSchema.parse(req.body);
  const updated = await horarioModel.updateAll(parsed);
  res.json(updated);
}));

export default router;
