import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { sellerRatingStats } from '../tier.js';

const router = Router();
const SELLER_TYPES = new Set(['Particular', 'Concesionario']);

function issueToken(user) {
  return jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

function userApiShape(row) {
  const stats = sellerRatingStats(db, row.id);
  return { id: row.id, name: row.name, email: row.email, status: row.status, role: row.role, tier: stats.tier };
}

router.post('/register', async (req, res) => {
  const { name, email, phone, password, sellerType } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nombre, correo y contraseña son obligatorios.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres.' });
  }
  const type = SELLER_TYPES.has(sellerType) ? sellerType : 'Particular';

  const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existingEmail) {
    return res.status(409).json({ message: 'Ya existe una cuenta con ese correo.' });
  }
  if (phone) {
    const existingPhone = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
    if (existingPhone) {
      return res.status(409).json({ message: 'Ya existe una cuenta con ese teléfono.' });
    }
  }

  const isAdminEmail = !!process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();
  const status = isAdminEmail ? 'approved' : 'pending';
  const role = isAdminEmail ? 'admin' : 'user';

  const passwordHash = await bcrypt.hash(password, 10);
  const info = db
    .prepare('INSERT INTO users (name, email, phone, password_hash, seller_type, status, role) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(name, email, phone || null, passwordHash, type, status, role);

  const user = { id: info.lastInsertRowid, name, email, status, role, tier: 'bronce' };
  res.status(201).json({ user, token: issueToken(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Correo y contraseña son obligatorios.' });
  }

  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!row) {
    return res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
  }
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) {
    return res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
  }

  res.json({ user: userApiShape(row), token: issueToken(row) });
});

router.get('/me', requireAuth, (req, res) => {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  if (!row) return res.status(401).json({ message: 'Sesión inválida.' });
  res.json({ user: userApiShape(row) });
});

export default router;
