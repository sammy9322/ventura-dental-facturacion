import { Request, Response, NextFunction } from 'express';
import { logError } from '../services/errorLog.js';

export async function errorHandler(err: Error, req: any, res: Response, next: NextFunction) {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Error de validación',
      details: err.message 
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      error: 'No autorizado' 
    });
  }

  // Registrar error inesperado en la base de datos
  const errorId = await logError({
    usuario_id: req.user?.id,
    modulo: req.path,
    error_mensaje: err.message,
    stack_trace: err.stack,
    metadata: {
      method: req.method,
      query: req.query,
      body: req.method !== 'GET' ? req.body : undefined
    }
  });

  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    error_id: errorId // Proporcionar el ID para facilitar el soporte técnico
  });
}
