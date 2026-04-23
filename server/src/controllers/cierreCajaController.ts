import { Request, Response } from 'express';
import * as CierreCajaModel from '../models/cierreCaja.js';
import * as PagoModel from '../models/pago.js';

export async function getPreview(req: Request, res: Response) {
  try {
    const { fecha } = req.query;
    if (!fecha) {
      return res.status(400).json({ error: 'La fecha es requerida' });
    }

    const stats = await PagoModel.getByMetodoPago(fecha as string, fecha as string);
    
    // Agrupar por método de pago para facilitar al frontend
    const resumen = {
      efectivo: stats.filter(s => s.metodo_pago === 'efectivo'),
      tarjeta: stats.filter(s => s.metodo_pago === 'tarjeta'),
      transferencia: stats.filter(s => s.metodo_pago === 'transferencia'),
      otros: stats.filter(s => !['efectivo', 'tarjeta', 'transferencia'].includes(s.metodo_pago))
    };

    // También buscar si ya existe un cierre para esa fecha
    const cierreExistente = await CierreCajaModel.getByFecha(fecha as string);

    res.json({ resumen, cierreExistente });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function saveCierre(req: Request, res: Response) {
  try {
    const data = req.body;
    // El usuario_id debería venir del token (req.user), pero por ahora lo sacamos del body o asumimos 1
    const usuario_id = (req as any).user?.id || data.usuario_id || 1;

    const nuevoCierre = await CierreCajaModel.create({
      ...data,
      usuario_id,
      estado: 'cerrado'
    });

    res.json(nuevoCierre);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getHistory(req: Request, res: Response) {
  try {
    const { limit } = req.query;
    const historial = await CierreCajaModel.getHistorial(limit ? parseInt(limit as string) : 30);
    res.json(historial);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
