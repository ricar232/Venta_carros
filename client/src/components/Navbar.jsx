import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSession, clearSession } from '../lib/auth.js';

const linkBase = { textDecoration: 'none', color: 'oklch(0.9 0.01 30)', fontSize: '14.5px', fontWeight: 600 };
const linkActive = { textDecoration: 'none', color: 'oklch(0.72 0.17 55)', fontSize: '14.5px', fontWeight: 700 };

export default function Navbar({ active }) {
  const navigate = useNavigate();
  const [session, setSession] = useState(getSession());

  function handleLogout() {
    clearSession();
    setSession(getSession());
    navigate('/');
  }

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'oklch(0.14 0.012 30 / 0.85)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid oklch(1 0 0 / 0.08)',
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px', height: 74, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Link to="/catalogo" style={active === 'catalogo' ? linkActive : linkBase}>Explorar</Link>
          <Link to="/#como-funciona" style={linkBase}>Cómo funciona</Link>
          <Link to="/registro" style={linkBase}>Vender</Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {session.token ? (
            <>
              <Link to="/mis-anuncios" style={active === 'mis-anuncios' ? linkActive : linkBase}>Mis anuncios</Link>
              <span style={{ fontSize: 13.5, color: 'oklch(0.6 0.015 30)' }}>Hola, {(session.user?.name || '').split(' ')[0]}</span>
              <button
                type="button"
                onClick={handleLogout}
                style={{ background: 'none', border: 'none', color: 'oklch(0.9 0.01 30)', fontSize: 14.5, fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: "'Manrope', sans-serif" }}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link to="/login" style={linkBase}>Iniciar sesión</Link>
          )}
          <Link
            to="/publicar"
            className="veltra-cta"
            style={{
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 14,
              color: 'oklch(0.16 0.014 30)',
              background: 'linear-gradient(135deg, oklch(0.63 0.20 25), oklch(0.72 0.17 55))',
              padding: '11px 20px',
              borderRadius: 100,
              transition: 'transform .25s ease, box-shadow .25s ease',
            }}
          >
            Publicar anuncio
          </Link>
        </div>
      </div>
    </nav>
  );
}
