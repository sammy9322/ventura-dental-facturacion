import { Request, Response, NextFunction } from 'express';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { config } from '../config/index.js';

export type Rol = 'admin' | 'doctor' | 'secretaria';

export interface JwtPayload {
  id: number;
  username: string;
  rol: Rol;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.rol !== 'admin')
    return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
  next();
}

export function requireDoctor(req: AuthRequest, res: Response, next: NextFunction) {
  if (!['admin', 'doctor'].includes(req.user?.rol ?? ''))
    return res.status(403).json({ error: 'Acceso denegado. Solo doctores o admins.' });
  next();
}

export function requireSecretaria(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.rol !== 'secretaria' && req.user?.rol !== 'admin')
    return res.status(403).json({ error: 'Acceso denegado. Solo secretaria/admin.' });
  next();
}

export function requireDoctorOrSecretaria(req: AuthRequest, res: Response, next: NextFunction) {
  if (!['admin', 'doctor', 'secretaria'].includes(req.user?.rol ?? ''))
    return res.status(403).json({ error: 'Acceso denegado.' });
  next();
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret as Secret, {
    expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'],
  });
}
