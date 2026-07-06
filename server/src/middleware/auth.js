import jwt from 'jsonwebtoken';
import { db } from '../db.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Sesión requerida.' });

  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).sub;
    next();
  } catch {
    res.status(401).json({ message: 'Sesión inválida o expirada.' });
  }
}

export function requireApproved(req, res, next) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(401).json({ message: 'Sesión inválida.' });
  if (user.status !== 'approved') {
    return res.status(403).json({ message: 'Tu cuenta está pendiente de aprobación de un administrador.' });
  }
  req.user = user;
  next();
}

export function requireAdmin(req, res, next) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(401).json({ message: 'Sesión inválida.' });
  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'No tenés permisos de administrador.' });
  }
  req.user = user;
  next();
}
