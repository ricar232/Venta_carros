import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, requireApproved } from '../middleware/auth.js';

const router = Router();

function toApiShape(row) {
  return {
    id: String(row.id),
    carMake: row.car_make,
    carModel: row.car_model,
    sellerId: row.seller_id,
    score: row.score,
    ratedAt: row.rated_at,
    createdAt: row.created_at,
  };
}

router.get('/mine', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM purchases WHERE buyer_id = ? ORDER BY created_at DESC').all(req.userId);
  res.json(rows.map(toApiShape));
});

router.post('/:id/rate', requireAuth, requireApproved, (req, res) => {
  const row = db.prepare('SELECT * FROM purchases WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ message: 'Compra no encontrada.' });
  if (Number(row.buyer_id) !== Number(req.userId)) {
    return res.status(403).json({ message: 'No podés calificar una compra que no es tuya.' });
  }
  if (row.score !== null) {
    return res.status(400).json({ message: 'Ya calificaste esta compra.' });
  }

  const score = Number((req.body || {}).score);
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return res.status(400).json({ message: 'La calificación debe ser un número entero de 1 a 5.' });
  }

  db.prepare("UPDATE purchases SET score = ?, rated_at = datetime('now') WHERE id = ?").run(score, row.id);
  const updated = db.prepare('SELECT * FROM purchases WHERE id = ?').get(row.id);
  res.json(toApiShape(updated));
});

export default router;
