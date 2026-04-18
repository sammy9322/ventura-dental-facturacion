import { Router, Response } from 'express';
import { query } from '../config/database.js';
import { authenticateToken, requireSecretaria, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /notificaciones/pendientes — cuántos pagos esperan ser cobrados
router.get('/pendientes', authenticateToken, requireSecretaria, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(`
      SELECT COUNT(*) as total
      FROM notificaciones n
      JOIN pagos p ON n.pago_id = p.id
      WHERE n.leida = false AND p.estado = 'pendiente_cobro'
    `);
    res.json({ total: parseInt(result.rows[0].total) });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PUT /notificaciones/:id/leer
router.put('/:id/leer', authenticateToken, requireSecretaria, async (req: AuthRequest, res: Response) => {
  try {
    await query(`UPDATE notificaciones SET leida = true WHERE id = $1`, [req.params.id]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
