import { Router, Response } from 'express';
import { z } from 'zod';
import * as tratamientoModel from '../models/tratamiento.js';
import { authenticateToken, requireDoctorOrSecretaria, AuthRequest } from '../middleware/auth.js';
import { auditoriaService } from '../services/auditoria.js';

const router = Router();

const createTratamientoSchema = z.object({
  paciente_id: z.number().int().positive('Seleccione un paciente'),
  macro_tratamiento_id: z.number().int().positive().optional(),
  tipo: z.string().min(1, 'El tipo es requerido'),
  descripcion: z.string().optional(),
  monto_total: z.number().positive('El monto debe ser mayor a 0'),
  fecha_inicio: z.string().min(1, 'La fecha de inicio es requerida'),
  fecha_fin: z.string().optional().nullable(),
});

const updateTratamientoSchema = z.object({
  tipo: z.string().min(1).optional(),
  descripcion: z.string().optional(),
  monto_total: z.number().positive().optional(),
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional().nullable(),
  estado: z.enum(['activo', 'completado', 'cancelado']).optional(),
});

router.use(authenticateToken, requireDoctorOrSecretaria);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const filters = {
      pacienteId: req.query.pacienteId ? parseInt(req.query.pacienteId as string) : undefined,
      tipo: req.query.tipo as string | undefined,
      estado: req.query.estado as string | undefined,
    };
    
    const tratamientos = await tratamientoModel.getAll(filters);
    res.json(tratamientos);
  } catch (error) {
    console.error('Get tratamientos error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.get('/paciente/:pacienteId', async (req: AuthRequest, res: Response) => {
  try {
    const pacienteId = parseInt(req.params.pacienteId);
    const tratamientos = await tratamientoModel.findByPacienteId(pacienteId);
    res.json(tratamientos);
  } catch (error) {
    console.error('Get tratamientos by paciente error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const tratamiento = await tratamientoModel.findById(id);
    if (!tratamiento) {
      return res.status(404).json({ error: 'Tratamiento no encontrado' });
    }
    res.json(tratamiento);
  } catch (error) {
    console.error('Get tratamiento error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.get('/:id/saldo', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const saldo = await tratamientoModel.getSaldo(id);
    if (!saldo) {
      return res.status(404).json({ error: 'Tratamiento no encontrado' });
    }
    res.json(saldo);
  } catch (error) {
    console.error('Get saldo error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createTratamientoSchema.parse(req.body);
    const tratamiento = await tratamientoModel.create(data);

    // Registrar en auditoría
    await auditoriaService.registrar({
      usuario_id: req.user!.id,
      accion: 'CREAR_TRATAMIENTO',
      entidad: 'tratamientos',
      entidad_id: tratamiento.id,
      valor_nuevo: data,
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    });

    res.status(201).json(tratamiento);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create tratamiento error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const data = updateTratamientoSchema.parse(req.body);
    const tratamiento = await tratamientoModel.update(id, data);
    if (!tratamiento) {
      return res.status(404).json({ error: 'Tratamiento no encontrado' });
    }

    // Registrar en auditoría
    await auditoriaService.registrar({
      usuario_id: req.user!.id,
      accion: 'EDITAR_TRATAMIENTO',
      entidad: 'tratamientos',
      entidad_id: id,
      valor_nuevo: data,
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    });

    res.json(tratamiento);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update tratamiento error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await tratamientoModel.deleteTratamiento(id);
    if (!result) {
      return res.status(404).json({ error: 'Tratamiento no encontrado' });
    }

    // Registrar en auditoría
    await auditoriaService.registrar({
      usuario_id: req.user!.id,
      accion: 'CANCELAR_TRATAMIENTO',
      entidad: 'tratamientos',
      entidad_id: id,
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    });

    res.json({ message: 'Tratamiento cancelado correctamente' });
  } catch (error) {
    console.error('Delete tratamiento error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
