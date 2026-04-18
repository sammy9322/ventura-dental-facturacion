import { Router, Response } from 'express';
import * as comprobanteModel from '../models/comprobante.js';
import { authenticateToken, requireDoctorOrSecretaria, AuthRequest } from '../middleware/auth.js';
import { config } from '../config/index.js';

const router = Router();

router.use(authenticateToken, requireDoctorOrSecretaria);

router.get('/numero/:numero', async (req: AuthRequest, res: Response) => {
  try {
    const comprobante = await comprobanteModel.findByNumero(req.params.numero);

    if (!comprobante) {
      return res.status(404).json({ error: 'Comprobante no encontrado' });
    }

    res.json({
      ...comprobante,
      negocio: {
        nombre: config.business.name,
        ruc: config.business.ruc,
        direccion: config.business.address,
        telefono: config.business.phone,
      },
    });
  } catch (error) {
    console.error('Get comprobante by numero error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.get('/:pagoId', async (req: AuthRequest, res: Response) => {
  try {
    const pagoId = parseInt(req.params.pagoId);
    const comprobante = await comprobanteModel.findByPagoId(pagoId);
    
    if (!comprobante) {
      return res.status(404).json({ error: 'Comprobante no encontrado' });
    }
    
    res.json({
      ...comprobante,
      negocio: {
        nombre: config.business.name,
        ruc: config.business.ruc,
        direccion: config.business.address,
        telefono: config.business.phone,
      },
    });
  } catch (error) {
    console.error('Get comprobante error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const comprobantes = await comprobanteModel.getAll(limit, offset);
    res.json(comprobantes);
  } catch (error) {
    console.error('Get comprobantes error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
