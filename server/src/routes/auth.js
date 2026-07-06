import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const router = Router();
const SELLER_TYPES = new Set(['Particular', 'Concesionario']);

function issueToken(user) {
  return jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
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

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ message: 'Ya existe una cuenta con ese correo.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const info = db
    .prepare('INSERT INTO users (name, email, phone, password_hash, seller_type) VALUES (?, ?, ?, ?, ?)')
    .run(name, email, phone || null, passwordHash, type);

  const user = { id: info.lastInsertRowid, name, email };
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

  const user = { id: row.id, name: row.name, email: row.email };
  res.json({ user, token: issueToken(user) });
});

export default router;
