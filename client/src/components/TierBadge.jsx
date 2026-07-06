import { tierInfo } from '../lib/tier.js';

function withAlpha(color, alpha) {
  return color.replace(/\)$/, ` / ${alpha})`);
}

export function TierChip({ tier, size = 'sm' }) {
  const info = tierInfo(tier);
  const small = size === 'sm';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontFamily: "'Manrope', sans-serif",
        fontSize: small ? 11 : 12.5,
        fontWeight: 700,
        color: info.color,
        background: withAlpha(info.color, 0.14),
        border: `1px solid ${withAlpha(info.color, 0.4)}`,
        padding: small ? '3px 8px' : '4px 10px',
        borderRadius: 100,
        whiteSpace: 'nowrap',
      }}
    >
      ● {info.label}
    </span>
  );
}

export function TierFrame({ tier, size = 52, children }) {
  const info = tierInfo(tier);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        padding: 3,
        border: `2px solid ${info.color}`,
        boxShadow: `0 0 14px ${info.glow}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}
