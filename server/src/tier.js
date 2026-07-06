// Umbrales de nivel de vendedor según cantidad de calificaciones y promedio.
// Se evalúan de mayor a menor exigencia; el primero que cumpla, gana.
const TIERS = [
  { name: 'platino', minCount: 25, minAvg: 4.7 },
  { name: 'oro', minCount: 10, minAvg: 4.2 },
  { name: 'plata', minCount: 3, minAvg: 3.5 },
];

export function computeTier(avg, count) {
  for (const tier of TIERS) {
    if (count >= tier.minCount && avg >= tier.minAvg) return tier.name;
  }
  return 'bronce';
}

export function sellerRatingStats(db, sellerId) {
  const row = db
    .prepare('SELECT AVG(score) as avg, COUNT(*) as count FROM purchases WHERE seller_id = ? AND score IS NOT NULL')
    .get(sellerId);
  const avg = row.avg || 0;
  const count = row.count || 0;
  return { avg, count, tier: computeTier(avg, count) };
}
