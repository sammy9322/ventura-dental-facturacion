import { Router } from 'express';
import { auditoriaService } from '../services/auditoria.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Solo el admin puede ver los logs de auditoría
router.get('/', authenticateToken, requireAdmin, async (req: any, res: any) => {
  try {
    const logs = await auditoriaService.obtenerLogs();
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
