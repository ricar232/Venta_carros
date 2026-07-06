import { Link } from 'react-router-dom';

export default function AuthNavbar({ mode }) {
  const isLogin = mode === 'login';
  return (
    <nav
      style={{
        background: 'oklch(0.14 0.012 30 / 0.85)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid oklch(1 0 0 / 0.08)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', height: 74, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', color: 'oklch(0.97 0.008 30)' }}>
          <span
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              background: 'linear-gradient(135deg, oklch(0.63 0.20 25), oklch(0.72 0.17 55))',
              display: 'inline-block',
              transform: 'rotate(-8deg)',
              boxShadow: '0 4px 14px -4px oklch(0.63 0.20 25 / 0.7)',
              flexShrink: 0,
            }}
          />
          <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 26, lineHeight: 1 }}>VELTRA</span>
          <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'oklch(0.68 0.015 30)' }}>marketplace</span>
        </Link>
        <Link to={isLogin ? '/registro' : '/login'} style={{ textDecoration: 'none', color: 'oklch(0.9 0.01 30)', fontSize: 14.5, fontWeight: 600 }}>
          {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <span style={{ color: 'oklch(0.72 0.17 55)', fontWeight: 700 }}>{isLogin ? 'Regístrate gratis' : 'Inicia sesión'}</span>
        </Link>
      </div>
    </nav>
  );
}
