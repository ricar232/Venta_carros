import fs from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { carPhotosDir } from '../middleware/upload.js';
import { sellerRatingStats } from '../tier.js';

const router = Router();
router.use(requireAuth, requireAdmin);

function userApiShape(row) {
  const stats = sellerRatingStats(db, row.id);
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    phone: row.phone,
    sellerType: row.seller_type,
    status: row.status,
    role: row.role,
    createdAt: row.created_at,
    ratingAvg: stats.avg,
    ratingCount: stats.count,
    tier: stats.tier,
  };
}

router.get('/users', (req, res) => {
  const rows = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
  res.json(rows.map(userApiShape));
});

router.post('/users/:id/approve', (req, res) => {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ message: 'Usuario no encontrado.' });
  db.prepare("UPDATE users SET status = 'approved' WHERE id = ?").run(row.id);
  res.json(userApiShape({ ...row, status: 'approved' }));
});

router.delete('/users/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ message: 'Usuario no encontrado.' });

  const cars = db.prepare('SELECT * FROM cars WHERE owner_user_id = ?').all(row.id);
  for (const car of cars) {
    JSON.parse(car.photos || '[]').forEach((filename) => {
      try {
        fs.unlinkSync(path.join(carPhotosDir, filename));
      } catch {
        // el archivo ya no está — no es un error real
      }
    });
  }
  db.prepare('DELETE FROM cars WHERE owner_user_id = ?').run(row.id);
  db.prepare('DELETE FROM purchases WHERE seller_id = ? OR buyer_id = ?').run(row.id, row.id);
  db.prepare('DELETE FROM users WHERE id = ?').run(row.id);

  res.status(204).end();
});

export default router;
