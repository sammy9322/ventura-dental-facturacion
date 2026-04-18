import { Router, Response } from 'express';
import { z } from 'zod';
import * as tratamientoMacroModel from '../models/tratamientoMacro.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

const createMacroSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
});

const createMicroSchema = z.object({
  macro_tratamiento_id: z.number().int().positive('Seleccione un tratamiento macro'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  precio: z.number().min(0).optional(),
});

const updateMacroSchema = z.object({
  nombre: z.string().min(1).optional(),
  descripcion: z.string().optional(),
  activo: z.boolean().optional(),
});

const updateMicroSchema = z.object({
  nombre: z.string().min(1).optional(),
  descripcion: z.string().optional(),
  precio: z.number().min(0).optional(),
  activo: z.boolean().optional(),
});

router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const macros = await tratamientoMacroModel.getAll();
    res.json(macros);
  } catch (error) {
    console.error('Get macro tratamientos error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.get('/micro', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const micros = await tratamientoMacroModel.getAllMicro();
    res.json(micros);
  } catch (error) {
    console.error('Get micro tratamientos error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const macro = await tratamientoMacroModel.getById(id);
    if (!macro) {
      return res.status(404).json({ error: 'Tratamiento macro no encontrado' });
    }
    const micros = await tratamientoMacroModel.getMicroByMacro(id);
    res.json({ ...macro, micros });
  } catch (error) {
    console.error('Get macro tratamiento error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createMacroSchema.parse(req.body);
    const macro = await tratamientoMacroModel.create(data);
    res.status(201).json(macro);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create macro tratamiento error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const data = updateMacroSchema.parse(req.body);
    const macro = await tratamientoMacroModel.update(id, data);
    if (!macro) {
      return res.status(404).json({ error: 'Tratamiento macro no encontrado' });
    }
    res.json(macro);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update macro tratamiento error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await tratamientoMacroModel.remove(id);
    res.json({ message: 'Tratamiento macro eliminado correctamente' });
  } catch (error) {
    console.error('Delete macro tratamiento error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.post('/micro', async (req: AuthRequest, res: Response) => {
  try {
    const data = createMicroSchema.parse(req.body);
    const micro = await tratamientoMacroModel.createMicro(data);
    res.status(201).json(micro);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create micro tratamiento error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.put('/micro/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const data = updateMicroSchema.parse(req.body);
    const micro = await tratamientoMacroModel.updateMicro(id, data);
    if (!micro) {
      return res.status(404).json({ error: 'Tratamiento micro no encontrado' });
    }
    res.json(micro);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update micro tratamiento error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.delete('/micro/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await tratamientoMacroModel.removeMicro(id);
    res.json({ message: 'Tratamiento micro eliminado correctamente' });
  } catch (error) {
    console.error('Delete micro tratamiento error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
