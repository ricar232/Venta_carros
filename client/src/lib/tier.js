// Presentación de los niveles de vendedor. Los umbrales que determinan el
// tier de cada vendedor los calcula el backend (server/src/tier.js); acá solo
// mapeamos el nombre que ya viene en la API a color/etiqueta para mostrarlo.
export const TIER_INFO = {
  bronce: { label: 'Bronce', color: 'oklch(0.62 0.09 55)', glow: 'oklch(0.62 0.09 55 / 0.5)' },
  plata: { label: 'Plata', color: 'oklch(0.82 0.005 260)', glow: 'oklch(0.82 0.005 260 / 0.5)' },
  oro: { label: 'Oro', color: 'oklch(0.82 0.16 85)', glow: 'oklch(0.82 0.16 85 / 0.6)' },
  platino: { label: 'Platino', color: 'oklch(0.88 0.03 230)', glow: 'oklch(0.88 0.03 230 / 0.7)' },
};

export function tierInfo(tier) {
  return TIER_INFO[tier] || TIER_INFO.bronce;
}

export const TIER_RANK = { bronce: 0, plata: 1, oro: 2, platino: 3 };
