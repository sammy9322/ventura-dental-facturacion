import { Router } from 'express';
import * as CierreCajaController from '../controllers/cierreCajaController.js';
import { authenticateToken, requireSecretaria } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// GET /api/cierre/preview?fecha=YYYY-MM-DD
router.get('/preview', authenticateToken, requireSecretaria, asyncHandler(CierreCajaController.getPreview));

// POST /api/cierre
router.post('/', authenticateToken, requireSecretaria, asyncHandler(CierreCajaController.saveCierre));

// GET /api/cierre/history
router.get('/history', authenticateToken, asyncHandler(CierreCajaController.getHistory));

export default router;
