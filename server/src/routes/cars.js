import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const REQUIRED_FIELDS = ['make', 'model', 'year', 'price', 'mileage', 'type', 'fuel', 'transmission', 'city', 'color', 'doors'];

// Placeholder photo gradients — the site has no photo upload yet, so every
// listing gets a two-tone gradient + "foto · Marca Modelo" label instead.
const GRADIENT_PALETTE = [
  ['oklch(0.60 0.20 25)', 'oklch(0.68 0.18 45)'],
  ['oklch(0.55 0.03 250)', 'oklch(0.4 0.02 260)'],
  ['oklch(0.55 0.22 25)', 'oklch(0.3 0.02 260)'],
  ['oklch(0.5 0.15 250)', 'oklch(0.35 0.05 260)'],
  ['oklch(0.3 0.01 260)', 'oklch(0.2 0.01 260)'],
  ['oklch(0.58 0.21 25)', 'oklch(0.45 0.15 30)'],
];

function toApiShape(row) {
  return {
    id: String(row.id),
    make: row.make,
    model: row.model,
    year: row.year,
    price: row.price,
    mileage: row.mileage,
    type: row.type,
    fuel: row.fuel,
    transmission: row.transmission,
    city: row.city,
    color: row.color,
    doors: row.doors,
    verified: !!row.verified,
    rating: row.rating,
    sellerType: row.seller_type,
    seller: row.seller,
    sellerPhone: row.seller_phone,
    g1: row.g1,
    g2: row.g2,
  };
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM cars ORDER BY created_at DESC').all();
  res.json(rows.map(toApiShape));
});

router.post('/', requireAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(401).json({ message: 'Sesión inválida.' });

  const body = req.body || {};
  const missing = REQUIRED_FIELDS.filter((f) => body[f] === undefined || body[f] === null || body[f] === '');
  if (missing.length) {
    return res.status(400).json({ message: `Faltan campos obligatorios: ${missing.join(', ')}.` });
  }

  const [g1, g2] = GRADIENT_PALETTE[Math.floor(Math.random() * GRADIENT_PALETTE.length)];

  const info = db
    .prepare(
      `INSERT INTO cars (make, model, year, price, mileage, type, fuel, transmission, city, color, doors, verified, rating, seller_type, seller, seller_phone, g1, g2, owner_user_id)
       VALUES (@make, @model, @year, @price, @mileage, @type, @fuel, @transmission, @city, @color, @doors, 0, 0, @sellerType, @seller, @sellerPhone, @g1, @g2, @ownerUserId)`
    )
    .run({
      make: body.make,
      model: body.model,
      year: Number(body.year),
      price: Number(body.price),
      mileage: Number(body.mileage),
      type: body.type,
      fuel: body.fuel,
      transmission: body.transmission,
      city: body.city,
      color: body.color,
      doors: Number(body.doors),
      sellerType: user.seller_type,
      seller: user.name,
      sellerPhone: user.phone,
      g1,
      g2,
      ownerUserId: user.id,
    });

  const row = db.prepare('SELECT * FROM cars WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(toApiShape(row));
});

export default router;
