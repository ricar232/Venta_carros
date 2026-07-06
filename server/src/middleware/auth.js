import jwt from 'jsonwebtoken';
import { db } from '../db.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Sesión requerida.' });

  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] }).sub;
    next();
  } catch {
    res.status(401).json({ message: 'Sesión inválida o expirada.' });
  }
}

// A diferencia de requireAuth, nunca rechaza la request — solo completa
// req.userId si viene un token válido. Sirve para endpoints públicos que
// quieren dar más datos a quien esté logueado sin exigirlo.
export function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      req.userId = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] }).sub;
    } catch {
      // token inválido/expirado — seguimos como visitante anónimo
    }
  }
  next();
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
