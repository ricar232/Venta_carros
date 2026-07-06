import fs from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import { db } from '../db.js';
import { requireAuth, requireApproved } from '../middleware/auth.js';
import { uploadCarPhotos, carPhotosDir } from '../middleware/upload.js';
import { sellerRatingStats } from '../tier.js';

const router = Router();

const REQUIRED_FIELDS = ['make', 'model', 'year', 'price', 'mileage', 'type', 'fuel', 'transmission', 'city', 'color', 'doors'];

function handlePhotoUpload(req, res, next) {
  uploadCarPhotos.array('photos', 6)(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Cada foto debe pesar menos de 5MB.' });
    }
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Máximo 6 fotos por anuncio.' });
    }
    return res.status(400).json({ message: err.message || 'No se pudieron subir las fotos.' });
  });
}

// Degradado de respaldo — solo se usa si un auto no tiene fotos reales.
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
    photos: JSON.parse(row.photos || '[]').map((f) => `/uploads/cars/${f}`),
    ownerUserId: row.owner_user_id,
    ...(() => {
      const stats = sellerRatingStats(db, row.owner_user_id);
      return { sellerTier: stats.tier, sellerRatingAvg: stats.avg, sellerRatingCount: stats.count };
    })(),
  };
}

function deleteCarRow(row) {
  JSON.parse(row.photos || '[]').forEach((filename) => {
    try {
      fs.unlinkSync(path.join(carPhotosDir, filename));
    } catch {
      // el archivo ya no está — no es un error real
    }
  });
  db.prepare('DELETE FROM cars WHERE id = ?').run(row.id);
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM cars ORDER BY created_at DESC').all();
  res.json(rows.map(toApiShape));
});

router.post('/', requireAuth, requireApproved, handlePhotoUpload, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(401).json({ message: 'Sesión inválida.' });

  const body = req.body || {};
  const missing = REQUIRED_FIELDS.filter((f) => body[f] === undefined || body[f] === null || body[f] === '');
  if (missing.length) {
    return res.status(400).json({ message: `Faltan campos obligatorios: ${missing.join(', ')}.` });
  }
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'Agrega al menos una foto.' });
  }

  const [g1, g2] = GRADIENT_PALETTE[Math.floor(Math.random() * GRADIENT_PALETTE.length)];
  const photos = JSON.stringify(req.files.map((f) => f.filename));

  const info = db
    .prepare(
      `INSERT INTO cars (make, model, year, price, mileage, type, fuel, transmission, city, color, doors, verified, rating, seller_type, seller, seller_phone, g1, g2, owner_user_id, photos)
       VALUES (@make, @model, @year, @price, @mileage, @type, @fuel, @transmission, @city, @color, @doors, 0, 0, @sellerType, @seller, @sellerPhone, @g1, @g2, @ownerUserId, @photos)`
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
      photos,
    });

  const row = db.prepare('SELECT * FROM cars WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(toApiShape(row));
});

router.delete('/:id', requireAuth, (req, res) => {
  const row = db.prepare('SELECT * FROM cars WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ message: 'Anuncio no encontrado.' });

  const requester = db.prepare('SELECT role FROM users WHERE id = ?').get(req.userId);
  const isOwner = Number(row.owner_user_id) === Number(req.userId);
  const isAdmin = requester?.role === 'admin';
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'No podés eliminar un anuncio que no es tuyo.' });
  }

  deleteCarRow(row);
  res.status(204).end();
});

router.post('/:id/sold', requireAuth, (req, res) => {
  const row = db.prepare('SELECT * FROM cars WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ message: 'Anuncio no encontrado.' });
  if (Number(row.owner_user_id) !== Number(req.userId)) {
    return res.status(403).json({ message: 'No podés marcar como vendido un anuncio que no es tuyo.' });
  }

  const { buyerEmail } = req.body || {};
  if (!buyerEmail) {
    return res.status(400).json({ message: 'Indicá el correo del comprador.' });
  }
  const buyer = db.prepare('SELECT id FROM users WHERE email = ?').get(buyerEmail);
  if (!buyer) {
    return res.status(404).json({ message: 'Ese correo no está registrado en VELTRA.' });
  }
  if (Number(buyer.id) === Number(req.userId)) {
    return res.status(400).json({ message: 'No podés marcarte a vos mismo como comprador.' });
  }

  db.prepare('INSERT INTO purchases (seller_id, buyer_id, car_make, car_model) VALUES (?, ?, ?, ?)').run(
    req.userId,
    buyer.id,
    row.make,
    row.model
  );

  deleteCarRow(row);
  res.status(200).json({ message: 'Anuncio marcado como vendido.' });
});

export default router;
