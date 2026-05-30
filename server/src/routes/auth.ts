import { Router, Request, Response } from 'express';
import { z } from 'zod';
import * as usuarioModel from '../models/usuario.js';
import crypto from 'crypto';
import { generateToken, authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { query } from '../config/database.js';
import { sendPasswordResetEmail } from '../services/email.js';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1, 'Usuario requerido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  nombre_completo: z.string().min(1).max(100),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  rol: z.enum(['admin', 'doctor', 'secretaria']),
});

const updateUserSchema = z.object({
  nombre_completo: z.string().min(1).max(100).optional(),
  username: z.string().min(3).max(50).optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
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
    const user = await usuarioModel.create(data.username, data.password, data.nombre_completo, data.rol, data.email);
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
    const dbError = error as { code?: string };
    if (dbError.code === '23505') {
      return res.status(400).json({ error: 'El nombre de usuario ya existe' });
    }
    console.error('Update usuario error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// DELETE /usuarios/:id
router.delete('/usuarios/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    await usuarioModel.remove(parseInt(req.params.id));
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    const dbError = error as { code?: string };
    if (dbError.code === '23503') {
      return res.status(400).json({ error: 'No se puede eliminar porque tiene historial clínico o pagos asociados. Por favor, desactívelo en su lugar.' });
    }
    res.status(500).json({ error: 'Error al eliminar usuario' });
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

// POST /auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requerido' });

    const userResult = await query(
      'SELECT id, nombre_completo FROM usuarios WHERE email = $1',
      [email]
    );

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      const token = crypto.randomBytes(32).toString('hex');
      await query(
        "INSERT INTO password_resets (usuario_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 hour')",
        [user.id, token]
      );
      await sendPasswordResetEmail(email, token, user.nombre_completo);
    }

    res.json({ message: 'Si el correo existe, enviaremos un enlace para restablecer tu contraseña.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /auth/reset-password
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token) return res.status(400).json({ error: 'Token requerido' });
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

    const tokenResult = await query(
      'SELECT usuario_id FROM password_resets WHERE token = $1 AND expires_at > NOW()',
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    const { usuario_id } = tokenResult.rows[0];
    const passwordHash = await usuarioModel.hashPassword(newPassword);
    await query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [passwordHash, usuario_id]);
    await query('DELETE FROM password_resets WHERE token = $1', [token]);

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
