import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSession, clearSession, refreshSession } from '../lib/auth.js';
import { TierChip } from './TierBadge.jsx';

const linkBase = { textDecoration: 'none', color: 'oklch(0.9 0.01 30)', fontSize: '14.5px', fontWeight: 600 };
const linkActive = { textDecoration: 'none', color: 'oklch(0.72 0.17 55)', fontSize: '14.5px', fontWeight: 700 };
const dropdownLinkStyle = { textDecoration: 'none', color: 'oklch(0.9 0.01 30)', fontSize: 14, fontWeight: 600, padding: '10px 12px', borderRadius: 8, fontFamily: "'Manrope', sans-serif", display: 'block' };

export default function Navbar({ active }) {
  const navigate = useNavigate();
  const [session, setSession] = useState(getSession());
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  useEffect(() => {
    const token = session.token;
    if (!token) return;
    refreshSession(token).then((user) => {
      if (user) setSession((s) => ({ ...s, user }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onClickOutside(e) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) setAccountMenuOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function handleLogout() {
    clearSession();
    setSession(getSession());
    setMenuOpen(false);
    setAccountMenuOpen(false);
    navigate('/');
  }

  const ctaLink = (
    <Link
      to="/publicar"
      className="veltra-cta"
      onClick={() => setMenuOpen(false)}
      style={{
        textDecoration: 'none',
        fontWeight: 700,
        fontSize: 14,
        color: 'oklch(0.16 0.014 30)',
        background: 'linear-gradient(135deg, oklch(0.63 0.20 25), oklch(0.72 0.17 55))',
        padding: '11px 20px',
        borderRadius: 100,
        transition: 'transform .25s ease, box-shadow .25s ease',
        textAlign: 'center',
      }}
    >
      Publicar anuncio
    </Link>
  );

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

        <div className="veltra-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Link to="/catalogo" style={active === 'catalogo' ? linkActive : linkBase}>Explorar</Link>
          <Link to="/#como-funciona" style={linkBase}>Cómo funciona</Link>
          <Link to="/registro" style={linkBase}>Vender</Link>
        </div>
        <div className="veltra-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {session.token ? (
            <div ref={accountMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setAccountMenuOpen((v) => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'none', border: '1px solid oklch(1 0 0 / 0.12)', borderRadius: 100,
                  padding: '9px 14px', cursor: 'pointer', color: 'oklch(0.95 0.008 30)', fontSize: 13.5, fontFamily: "'Manrope', sans-serif",
                }}
              >
                Hola, {(session.user?.name || '').split(' ')[0]}
                {session.user?.tier && <TierChip tier={session.user.tier} />}
                <span style={{ fontSize: 10, opacity: 0.7 }}>{accountMenuOpen ? '▴' : '▾'}</span>
              </button>
              {accountMenuOpen && (
                <div
                  style={{
                    position: 'absolute', top: 'calc(100% + 10px)', right: 0, minWidth: 190, zIndex: 60,
                    background: 'oklch(0.14 0.012 30)', border: '1px solid oklch(1 0 0 / 0.1)', borderRadius: 14,
                    padding: 8, boxShadow: '0 20px 40px -10px oklch(0 0 0 / 0.6)', display: 'flex', flexDirection: 'column', gap: 2,
                  }}
                >
                  {session.user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setAccountMenuOpen(false)} style={active === 'admin' ? { ...dropdownLinkStyle, color: 'oklch(0.72 0.17 55)' } : dropdownLinkStyle}>Admin</Link>
                  )}
                  <Link to="/mis-compras" onClick={() => setAccountMenuOpen(false)} style={active === 'mis-compras' ? { ...dropdownLinkStyle, color: 'oklch(0.72 0.17 55)' } : dropdownLinkStyle}>Mis compras</Link>
                  <Link to="/mis-anuncios" onClick={() => setAccountMenuOpen(false)} style={active === 'mis-anuncios' ? { ...dropdownLinkStyle, color: 'oklch(0.72 0.17 55)' } : dropdownLinkStyle}>Mis anuncios</Link>
                  <div style={{ height: 1, background: 'oklch(1 0 0 / 0.08)', margin: '4px 0' }} />
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{ ...dropdownLinkStyle, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" style={linkBase}>Iniciar sesión</Link>
          )}
          {ctaLink}
        </div>

        <button
          type="button"
          className="veltra-nav-burger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Abrir menú"
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: 38,
            height: 38,
            background: 'none',
            border: '1px solid oklch(1 0 0 / 0.15)',
            borderRadius: 10,
            color: 'oklch(0.95 0.008 30)',
            fontSize: 18,
            cursor: 'pointer',
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div className="veltra-nav-mobile-panel">
          <Link to="/catalogo" onClick={() => setMenuOpen(false)} style={active === 'catalogo' ? linkActive : linkBase}>Explorar</Link>
          <Link to="/#como-funciona" onClick={() => setMenuOpen(false)} style={linkBase}>Cómo funciona</Link>
          <Link to="/registro" onClick={() => setMenuOpen(false)} style={linkBase}>Vender</Link>
          {session.token ? (
            <>
              {session.user?.role === 'admin' && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} style={active === 'admin' ? linkActive : linkBase}>Admin</Link>
              )}
              <Link to="/mis-compras" onClick={() => setMenuOpen(false)} style={active === 'mis-compras' ? linkActive : linkBase}>Mis compras</Link>
              <Link to="/mis-anuncios" onClick={() => setMenuOpen(false)} style={active === 'mis-anuncios' ? linkActive : linkBase}>Mis anuncios</Link>
              <span style={{ fontSize: 13.5, color: 'oklch(0.6 0.015 30)', padding: '12px 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                Hola, {(session.user?.name || '').split(' ')[0]}
                {session.user?.tier && <TierChip tier={session.user.tier} />}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                style={{ background: 'none', border: 'none', color: 'oklch(0.9 0.01 30)', fontSize: 14.5, fontWeight: 600, cursor: 'pointer', fontFamily: "'Manrope', sans-serif" }}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)} style={linkBase}>Iniciar sesión</Link>
          )}
          <div style={{ marginTop: 8 }}>{ctaLink}</div>
        </div>
      )}
    </nav>
  );
}
