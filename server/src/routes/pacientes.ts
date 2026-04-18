import { Router, Request, Response } from 'express';
import { z } from 'zod';
import * as pacienteModel from '../models/paciente.js';
import { authenticateToken, requireDoctorOrSecretaria, AuthRequest } from '../middleware/auth.js';

const router = Router();

const createPacienteSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido').max(150),
  dni: z.string().length(8).optional().or(z.literal('')),
  telefono: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal('')),
  direccion: z.string().optional(),
});

const updatePacienteSchema = z.object({
  nombre: z.string().min(1).max(150).optional(),
  dni: z.string().length(8).optional().or(z.literal('')),
  telefono: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal('')),
  direccion: z.string().optional(),
  activo: z.boolean().optional(),
});

router.use(authenticateToken, requireDoctorOrSecretaria);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const activo = req.query.activo === 'true' ? true : req.query.activo === 'false' ? false : undefined;
    const pacientes = await pacienteModel.getAll(activo);
    res.json(pacientes);
  } catch (error) {
    console.error('Get pacientes error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.get('/buscar', async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string' || q.length < 1) {
      return res.status(400).json({ error: 'Parámetro de búsqueda requerido' });
    }
    const pacientes = await pacienteModel.search(q);
    res.json(pacientes);
  } catch (error) {
    console.error('Search pacientes error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.get('/dni/:dni', async (req: AuthRequest, res: Response) => {
  try {
    const paciente = await pacienteModel.findByDni(req.params.dni);
    if (!paciente) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    res.json(paciente);
  } catch (error) {
    console.error('Get paciente by DNI error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const paciente = await pacienteModel.findById(id);
    if (!paciente) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    res.json(paciente);
  } catch (error) {
    console.error('Get paciente error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createPacienteSchema.parse(req.body);
    const paciente = await pacienteModel.create(data);
    res.status(201).json(paciente);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    const dbError = error as { code?: string };
    if (dbError.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un paciente con este DNI' });
    }
    console.error('Create paciente error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const data = updatePacienteSchema.parse(req.body);
    const paciente = await pacienteModel.update(id, data);
    if (!paciente) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    res.json(paciente);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    const dbError = error as { code?: string };
    if (dbError.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un paciente con este DNI' });
    }
    console.error('Update paciente error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pacienteModel.deletePatient(id);
    if (!result) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    res.json({ message: 'Paciente desactivado correctamente' });
  } catch (error) {
    console.error('Delete paciente error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
