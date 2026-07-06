import { Link } from 'react-router-dom';

export default function CarCard({ car }) {
  return (
    <Link
      to={`/vehiculo/${car.id}`}
      className="veltra-car-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        color: 'oklch(0.97 0.008 30)',
        background: 'oklch(0.21 0.016 30 / 0.55)',
        border: '1px solid oklch(1 0 0 / 0.09)',
        borderRadius: 22,
        overflow: 'hidden',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        transition: 'transform .4s cubic-bezier(.2,.8,.2,1), box-shadow .4s ease, border-color .4s ease',
        boxShadow: '0 10px 30px -15px oklch(0 0 0 / 0.5)',
        position: 'relative',
        height: '100%',
      }}
    >
      <div style={{ position: 'relative', height: 180, background: `linear-gradient(135deg,${car.g1},${car.g2})`, overflow: 'hidden' }}>
        <div
          className="veltra-car-card-photo-tint"
          style={{
            position: 'absolute',
            inset: '-4px',
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 9px, oklch(1 0 0 / 0.05) 9px, oklch(1 0 0 / 0.05) 10px)',
            transition: 'transform .5s ease',
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, oklch(1 0 0 / 0.1), transparent 40%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: 'oklch(1 0 0 / 0.55)',
              background: 'oklch(0 0 0 / 0.25)',
              padding: '6px 10px',
              borderRadius: 8,
            }}
          >
            foto · {car.make} {car.model}
          </span>
        </div>
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
          {car.verified && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontFamily: "'Manrope', sans-serif",
                fontSize: 11,
                fontWeight: 700,
                color: 'oklch(0.16 0.014 30)',
                background: 'oklch(0.72 0.17 55)',
                padding: '4px 10px 4px 7px',
                borderRadius: 100,
              }}
            >
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="oklch(0.16 0.014 30)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              Verificado
            </span>
          )}
        </div>
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <span
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              color: 'oklch(0.9 0.01 30)',
              background: 'oklch(0 0 0 / 0.4)',
              padding: '4px 10px',
              borderRadius: 100,
              backdropFilter: 'blur(6px)',
            }}
          >
            {car.type}
          </span>
        </div>
      </div>
      <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: "'Instrument Serif', serif", fontSize: 23, fontWeight: 400, lineHeight: 1.15 }}>
            {car.make} {car.model}
          </h3>
          <p style={{ margin: '4px 0 0', fontFamily: "'Manrope', sans-serif", fontSize: 13, color: 'oklch(0.68 0.015 30)' }}>
            {car.year} · {car.mileageFmt} mi · {car.city}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, fontWeight: 600, color: 'oklch(0.75 0.02 30)', background: 'oklch(1 0 0 / 0.06)', padding: '4px 9px', borderRadius: 100 }}>
            {car.fuel}
          </span>
          <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, fontWeight: 600, color: 'oklch(0.75 0.02 30)', background: 'oklch(1 0 0 / 0.06)', padding: '4px 9px', borderRadius: 100 }}>
            {car.transmission}
          </span>
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid oklch(1 0 0 / 0.07)' }}>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 22, color: 'oklch(0.72 0.17 55)' }}>{car.priceFmt}</span>
          <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 700, color: 'oklch(0.97 0.008 30)', display: 'flex', alignItems: 'center', gap: 4 }}>
            Ver detalle <span style={{ fontSize: 16 }}>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
