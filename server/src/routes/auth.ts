import { Router, Request, Response } from 'express';
import { z } from 'zod';
import * as usuarioModel from '../models/usuario.js';
import { generateToken, authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1, 'Usuario requerido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  nombre_completo: z.string().min(1).max(100),
  rol: z.enum(['admin', 'doctor', 'secretaria']),
});

const updateUserSchema = z.object({
  nombre_completo: z.string().min(1).max(100).optional(),
  rol: z.enum(['admin', 'doctor', 'secretaria']).optional(),
  activo: z.boolean().optional(),
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    
    const user = await usuarioModel.findByUsername(data.username);
    if (!user) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const validPassword = await usuarioModel.verifyPassword(data.password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      rol: user.rol,
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        nombre_completo: user.nombre_completo,
        rol: user.rol,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await usuarioModel.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.get('/usuarios', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const usuarios = await usuarioModel.getAll();
    res.json(usuarios);
  } catch (error) {
    console.error('Get usuarios error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.post('/usuarios', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const data = createUserSchema.parse(req.body);
    const user = await usuarioModel.create(data.username, data.password, data.nombre_completo, data.rol);
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    const dbError = error as { code?: string };
    if (dbError.code === '23505') {
      return res.status(400).json({ error: 'El nombre de usuario ya existe' });
    }
    console.error('Create usuario error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.put('/usuarios/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const data = updateUserSchema.parse(req.body);
    const user = await usuarioModel.update(id, data);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update usuario error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.put('/usuarios/:id/password', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (req.user!.rol !== 'admin' && req.user!.id !== id) {
      return res.status(403).json({ error: 'No tienes permiso para cambiar esta contraseña' });
    }

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    await usuarioModel.changePassword(id, newPassword);
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.get('/secretarias', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const secretarias = await usuarioModel.getSecretarias();
    res.json(secretarias);
  } catch (error) {
    console.error('Get secretarias error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
