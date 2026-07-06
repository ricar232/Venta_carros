import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import CarCard from '../components/CarCard.jsx';
import { useReveal } from '../lib/useReveal.js';
import { fetchCars, formatPrice } from '../lib/carsApi.js';

const MARQUEE_BRANDS = [
  'Toyota', 'Honda', 'BMW', 'Tesla', 'Mercedes-Benz', 'Ford', 'Mazda', 'Hyundai', 'Kia', 'Volkswagen', 'Nissan', 'Porsche',
  'Toyota', 'Honda', 'BMW', 'Tesla', 'Mercedes-Benz', 'Ford', 'Mazda', 'Hyundai', 'Kia', 'Volkswagen', 'Nissan', 'Porsche',
];

const STEPS = [
  { n: '1', title: 'Busca y compara', desc: 'Filtra por marca, precio, ciudad y tipo entre miles de anuncios verificados.' },
  { n: '2', title: 'Contacta al vendedor', desc: 'Habla directo con vendedores verificados y agenda una revisión sin presión.' },
  { n: '3', title: 'Cierra con confianza', desc: 'Financiamiento, papeleo y garantía acompañan cada transacción hasta el final.' },
];

const WHY_US = [
  {
    title: 'Vendedores verificados',
    desc: 'Identidad y documentos revisados antes de publicar cualquier anuncio.',
    icon: <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />,
    icon2: <path d="M9 12l2 2 4-4" />,
  },
  {
    title: 'Inspección de 150 puntos',
    desc: 'Reportes mecánicos disponibles en autos participantes del programa.',
    icon: <rect x="6" y="4" width="12" height="16" rx="2" />,
    icon2: <path d="M9 13l2 2 4-4" />,
  },
  {
    title: 'Financiamiento flexible',
    desc: 'Simula tu mensualidad y compara tasas de varios bancos aliados.',
    icon: <rect x="3" y="6" width="18" height="13" rx="2" />,
    icon2: <path d="M3 10h18M7 15h4" />,
  },
  {
    title: 'Garantía de recompra',
    desc: '7 días para devolver el auto si algo no coincide con lo publicado.',
    icon: <path d="M3 12a9 9 0 1 0 3-6.7" />,
    icon2: <path d="M3 4v5h5" />,
  },
];

const CATEGORIES = [
  { type: 'SUV', label: 'SUV', key: 'suv', icon: <><path d="M3 16.5h18M4 16.5l1-6a2 2 0 0 1 2-1.6h10a2 2 0 0 1 2 1.6l1 6" /><path d="M7 9v-1.2M17 9v-1.2M7 12.5h10" /><circle cx="7" cy="16.5" r="1.5" /><circle cx="17" cy="16.5" r="1.5" /></> },
  { type: 'Sedán', label: 'Sedán', key: 'sedan', icon: <><path d="M3 16h18M4 16l1.3-4a2 2 0 0 1 1.9-1.4h9.6a2 2 0 0 1 1.9 1.4L20 16" /><path d="M8 10.6l1-2.2a1.5 1.5 0 0 1 1.4-.9h3.2a1.5 1.5 0 0 1 1.4.9l1 2.2" /><circle cx="7" cy="16" r="1.4" /><circle cx="17" cy="16" r="1.4" /></> },
  { type: 'Pickup', label: 'Pickup', key: 'pickup', icon: <><path d="M3.5 15.5h1M3.5 15.5V9.8a.8.8 0 0 1 .8-.8H10a1 1 0 0 1 1 1v5.5M11 12h5.6a1 1 0 0 1 .9.55l1.5 2.95H20" /><circle cx="7" cy="15.5" r="1.5" /><circle cx="16" cy="15.5" r="1.5" /></> },
  { type: 'Deportivo', label: 'Deportivo', key: 'sport', icon: <><path d="M4 15a8 8 0 0 1 16 0" /><path d="M12 15l3.3-3.3" /><circle cx="12" cy="15" r="1.1" /></> },
  { type: 'Eléctrico', label: 'Eléctrico', key: 'electric', icon: <path d="M13 3 5 13h5l-1 8 8-10h-5l1-8Z" fill="oklch(0.85 0.13 55)" stroke="none" /> },
];

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [cars, setCars] = useState([]);
  const [carsLoaded, setCarsLoaded] = useState(false);
  const [counts, setCounts] = useState({ listings: 0, sellers: 0, cities: 0, rating: 0 });

  const [trustRef, , trustStyle] = useReveal();
  const [statsRef, statsVisible, statsStyle] = useReveal();
  const [categoriesRef, , categoriesStyle] = useReveal();
  const [featuredRef, , featuredStyle] = useReveal();
  const [howRef, , howStyle] = useReveal();
  const [whyRef, , whyStyle] = useReveal();
  const [ctaRef, , ctaStyle] = useReveal();

  const countedRef = useRef(false);

  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement;
      const max = (doc.scrollHeight || 0) - (window.innerHeight || 0);
      const pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
      setScrolled(window.scrollY > 40);
      setScrollProgress(pct);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    fetchCars().then((raw) => {
      const withFmt = raw.map((c) => ({
        ...c,
        priceFmt: formatPrice(c.price),
        mileageFmt: Number(c.mileage || 0).toLocaleString('en-US'),
      }));
      setCars(withFmt);
      setCarsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!statsVisible || !cars.length || countedRef.current) return;
    countedRef.current = true;
    const sellers = new Set(cars.map((c) => c.seller)).size;
    const cities = new Set(cars.map((c) => c.city)).size;
    const avgRating = cars.length ? cars.reduce((s, c) => s + Number(c.rating || 0), 0) / cars.length : 0;
    const targets = { listings: cars.length, sellers, cities, rating: Math.round(avgRating * 10) };
    const start = performance.now();
    const dur = 1400;
    function tick(now) {
      const p = Math.min(1, (now - start) / dur);
      const ease = 1 - Math.pow(1 - p, 3);
      setCounts({
        listings: Math.round(targets.listings * ease),
        sellers: Math.round(targets.sellers * ease),
        cities: Math.round(targets.cities * ease),
        rating: Math.round(targets.rating * ease),
      });
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [statsVisible, cars]);

  function onHeroMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouse({ x: (e.clientX - rect.left) / rect.width - 0.5, y: (e.clientY - rect.top) / rect.height - 0.5 });
  }

  const typeCount = (t) => cars.filter((c) => c.type === t).length;
  const heroCar = cars.length ? cars[0] : null;
  const heroBadge = cars.length ? cars.length + ' autos verificados' : carsLoaded ? 'Sé el primero en publicar' : 'Cargando anuncios…';
  const heroImageLabel = cars.length ? 'foto del auto destacado' : carsLoaded ? 'aún no hay anuncios publicados' : 'cargando…';
  const noCarsYet = carsLoaded && cars.length === 0;

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", background: 'oklch(0.16 0.014 30)', color: 'oklch(0.97 0.008 30)', minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          transition: 'background .3s ease, border-color .3s ease, backdrop-filter .3s ease',
          background: scrolled ? 'oklch(0.14 0.012 30 / 0.75)' : 'transparent',
          backdropFilter: scrolled ? 'blur(18px)' : undefined,
          WebkitBackdropFilter: scrolled ? 'blur(18px)' : undefined,
          borderBottom: `1px solid ${scrolled ? 'oklch(1 0 0 / 0.08)' : 'transparent'}`,
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', height: 78, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', color: 'oklch(0.97 0.008 30)' }}>
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 7,
                background: 'linear-gradient(135deg, oklch(0.63 0.20 25), oklch(0.72 0.17 55))',
                display: 'inline-block',
                transform: 'rotate(-8deg)',
                boxShadow: '0 4px 14px -4px oklch(0.63 0.20 25 / 0.7)',
                flexShrink: 0,
              }}
            />
            <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 28, lineHeight: 1 }}>VELTRA</span>
            <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'oklch(0.68 0.015 30)' }}>marketplace</span>
          </Link>
          <div className="veltra-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
            <Link to="/catalogo" style={{ textDecoration: 'none', color: 'oklch(0.9 0.01 30)', fontSize: 14.5, fontWeight: 600 }}>Explorar</Link>
            <a href="#como-funciona" style={{ textDecoration: 'none', color: 'oklch(0.9 0.01 30)', fontSize: 14.5, fontWeight: 600 }}>Cómo funciona</a>
            <a href="#vender" style={{ textDecoration: 'none', color: 'oklch(0.9 0.01 30)', fontSize: 14.5, fontWeight: 600 }}>Vender</a>
            <a href="#financiamiento" style={{ textDecoration: 'none', color: 'oklch(0.9 0.01 30)', fontSize: 14.5, fontWeight: 600 }}>Financiamiento</a>
          </div>
          <div className="veltra-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link to="/login" style={{ textDecoration: 'none', color: 'oklch(0.9 0.01 30)', fontSize: 14.5, fontWeight: 600, padding: '10px 4px' }}>Iniciar sesión</Link>
            <Link
              to="/publicar"
              className="veltra-cta"
              style={{
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: 14,
                color: 'oklch(0.16 0.014 30)',
                background: 'linear-gradient(135deg, oklch(0.63 0.20 25), oklch(0.72 0.17 55))',
                padding: '12px 22px',
                borderRadius: 100,
                boxShadow: '0 8px 24px -8px oklch(0.63 0.20 25 / 0.6)',
                transition: 'transform .25s ease, box-shadow .25s ease',
              }}
            >
              Publicar anuncio
            </Link>
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
            <Link to="/catalogo" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: 'oklch(0.9 0.01 30)', fontSize: 14.5, fontWeight: 600 }}>Explorar</Link>
            <a href="#como-funciona" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: 'oklch(0.9 0.01 30)', fontSize: 14.5, fontWeight: 600 }}>Cómo funciona</a>
            <a href="#vender" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: 'oklch(0.9 0.01 30)', fontSize: 14.5, fontWeight: 600 }}>Vender</a>
            <a href="#financiamiento" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: 'oklch(0.9 0.01 30)', fontSize: 14.5, fontWeight: 600 }}>Financiamiento</a>
            <Link to="/login" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: 'oklch(0.9 0.01 30)', fontSize: 14.5, fontWeight: 600 }}>Iniciar sesión</Link>
            <Link
              to="/publicar"
              onClick={() => setMenuOpen(false)}
              className="veltra-cta"
              style={{
                marginTop: 8,
                textAlign: 'center',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: 14,
                color: 'oklch(0.16 0.014 30)',
                background: 'linear-gradient(135deg, oklch(0.63 0.20 25), oklch(0.72 0.17 55))',
                padding: '12px 22px',
                borderRadius: 100,
              }}
            >
              Publicar anuncio
            </Link>
          </div>
        )}
      </nav>

      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 60, background: 'oklch(1 0 0 / 0.06)' }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg, oklch(0.63 0.20 25), oklch(0.72 0.17 55))', width: `${scrollProgress}%`, transition: 'width .1s linear' }} />
      </div>

      {/* HERO */}
      <section onMouseMove={onHeroMouseMove} style={{ position: 'relative', padding: '170px 32px 120px', minHeight: '92vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100vh', overflow: 'hidden', pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: '-10vh',
              width: '260%',
              height: '60vh',
              transform: 'translateX(-50%) perspective(300px) rotateX(68deg)',
              backgroundImage:
                'linear-gradient(oklch(0.72 0.17 55 / 0.16) 1px, transparent 1px), linear-gradient(90deg, oklch(0.72 0.17 55 / 0.16) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
              animation: 'gridFlow 2.4s linear infinite',
              maskImage: 'linear-gradient(to top, black 0%, transparent 75%)',
              WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 75%)',
            }}
          />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: '38vh', height: 1, background: 'linear-gradient(90deg, transparent, oklch(0.72 0.17 55 / 0.6), transparent)', animation: 'horizonPulse 3.5s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '16%', left: 0, width: 180, height: 2, borderRadius: 2, background: 'linear-gradient(90deg, transparent, oklch(0.72 0.17 55 / 0.95), transparent)', filter: 'blur(0.5px)', animation: 'streakA 3.2s linear infinite', animationDelay: '.2s' }} />
          <div style={{ position: 'absolute', top: '34%', left: 0, width: 130, height: 2, borderRadius: 2, background: 'linear-gradient(90deg, transparent, oklch(0.63 0.20 25 / 0.85), transparent)', filter: 'blur(0.5px)', animation: 'streakB 4.1s linear infinite', animationDelay: '1.4s' }} />
          <div style={{ position: 'absolute', top: '53%', left: 0, width: 220, height: 2, borderRadius: 2, background: 'linear-gradient(90deg, transparent, oklch(0.72 0.17 55 / 0.8), transparent)', filter: 'blur(0.5px)', animation: 'streakA 3.8s linear infinite', animationDelay: '2.3s' }} />
          <div style={{ position: 'absolute', top: '9%', left: 0, width: 100, height: 1.5, borderRadius: 2, background: 'linear-gradient(90deg, transparent, oklch(0.63 0.20 25 / 0.7), transparent)', filter: 'blur(0.5px)', animation: 'streakB 5s linear infinite', animationDelay: '.8s' }} />
        </div>
        <div
          style={{
            position: 'absolute',
            width: 640,
            height: 640,
            borderRadius: '50%',
            background: 'radial-gradient(circle, oklch(0.63 0.20 25 / 0.35), transparent 70%)',
            top: -160,
            left: -120,
            filter: 'blur(40px)',
            animation: 'floatBlobA 14s ease-in-out infinite',
            transform: `translate(${mouse.x * 30}px, ${mouse.y * 30}px)`,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 560,
            height: 560,
            borderRadius: '50%',
            background: 'radial-gradient(circle, oklch(0.72 0.17 55 / 0.28), transparent 70%)',
            bottom: -200,
            right: -100,
            filter: 'blur(40px)',
            animation: 'floatBlobB 16s ease-in-out infinite',
            transform: `translate(${mouse.x * -24}px, ${mouse.y * -24}px)`,
            pointerEvents: 'none',
          }}
        />

        <div className="veltra-hero-grid" style={{ position: 'relative', maxWidth: 1280, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 64, alignItems: 'center' }}>
          <div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12.5,
                fontWeight: 700,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                color: 'oklch(0.72 0.17 55)',
                background: 'oklch(0.72 0.17 55 / 0.12)',
                border: '1px solid oklch(0.72 0.17 55 / 0.35)',
                padding: '7px 14px',
                borderRadius: 100,
                marginBottom: 26,
              }}
            >
              ● {heroBadge}
            </span>
            <h1 className="veltra-hero-title" style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 70, lineHeight: 1.02, margin: '0 0 24px', letterSpacing: '-.01em' }}>
              Encuentra el auto{' '}
              <span style={{ position: 'relative', display: 'inline-block' }}>
                <em style={{ fontStyle: 'italic', color: 'oklch(0.72 0.17 55)' }}>perfecto</em>
                <span style={{ position: 'absolute', left: 0, right: 0, bottom: 6, height: 9, background: 'linear-gradient(90deg, oklch(0.63 0.20 25 / 0.35), oklch(0.72 0.17 55 / 0.35))', borderRadius: 100, zIndex: -1 }} />
              </span>
              ,<br />sin sorpresas.
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: 'oklch(0.72 0.015 30)', maxWidth: 520, margin: '0 0 40px' }}>
              El marketplace donde compradores y vendedores se conectan con confianza: cada anuncio verificado, cada historial revisado.
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', background: 'oklch(0.21 0.016 30 / 0.6)', border: '1px solid oklch(1 0 0 / 0.1)', backdropFilter: 'blur(20px)', padding: 10, borderRadius: 100, maxWidth: 640 }}>
              <select style={heroSelectStyle}>
                <option style={{ color: '#000' }}>Marca</option>
                <option style={{ color: '#000' }}>Toyota</option>
                <option style={{ color: '#000' }}>Honda</option>
                <option style={{ color: '#000' }}>Tesla</option>
                <option style={{ color: '#000' }}>BMW</option>
              </select>
              <div style={{ width: 1, height: 24, background: 'oklch(1 0 0 / 0.12)' }} />
              <select style={heroSelectStyle}>
                <option style={{ color: '#000' }}>Tipo</option>
                <option style={{ color: '#000' }}>SUV</option>
                <option style={{ color: '#000' }}>Sedán</option>
                <option style={{ color: '#000' }}>Pickup</option>
                <option style={{ color: '#000' }}>Deportivo</option>
              </select>
              <div style={{ width: 1, height: 24, background: 'oklch(1 0 0 / 0.12)' }} />
              <select style={{ ...heroSelectStyle, minWidth: 130 }}>
                <option style={{ color: '#000' }}>Presupuesto</option>
                <option style={{ color: '#000' }}>Hasta $25,000</option>
                <option style={{ color: '#000' }}>Hasta $45,000</option>
                <option style={{ color: '#000' }}>Sin límite</option>
              </select>
              <Link
                to="/catalogo"
                className="veltra-search-btn"
                style={{
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: 14.5,
                  color: 'oklch(0.16 0.014 30)',
                  background: 'linear-gradient(135deg, oklch(0.63 0.20 25), oklch(0.72 0.17 55))',
                  padding: '14px 26px',
                  borderRadius: 100,
                  whiteSpace: 'nowrap',
                  transition: 'transform .25s ease, box-shadow .25s ease',
                }}
              >
                Buscar →
              </Link>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: -30, background: 'radial-gradient(circle, oklch(0.63 0.20 25 / 0.25), transparent 65%)', filter: 'blur(30px)', animation: 'pulseGlow 5s ease-in-out infinite' }} />
            <div style={{ position: 'relative', borderRadius: 28, overflow: 'hidden', border: '1px solid oklch(1 0 0 / 0.12)', background: 'linear-gradient(135deg, oklch(0.60 0.20 25), oklch(0.55 0.02 260))', boxShadow: '0 40px 100px -20px oklch(0 0 0 / 0.7)' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 11px, oklch(1 0 0 / 0.05) 11px, oklch(1 0 0 / 0.05) 12px)' }} />
              <div style={{ height: 460, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', color: 'oklch(1 0 0 / 0.65)', background: 'oklch(0 0 0 / 0.3)', padding: '8px 14px', borderRadius: 8 }}>
                  {heroImageLabel}
                </span>
              </div>
              {heroCar && (
                <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ background: 'oklch(0 0 0 / 0.45)', backdropFilter: 'blur(12px)', borderRadius: 16, padding: '14px 18px' }}>
                    <p style={{ margin: 0, fontFamily: "'Instrument Serif', serif", fontSize: 24 }}>{heroCar.make} {heroCar.model}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'oklch(0.85 0.01 30)' }}>{heroCar.year} · {heroCar.mileageFmt} mi · {heroCar.city}</p>
                  </div>
                  <div style={{ background: 'oklch(0 0 0 / 0.45)', backdropFilter: 'blur(12px)', borderRadius: 16, padding: '14px 18px' }}>
                    <p style={{ margin: 0, fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 22, color: 'oklch(0.78 0.15 55)' }}>{heroCar.priceFmt}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* TRUST MARQUEE */}
      <section ref={trustRef} style={{ ...trustStyle, padding: '36px 0', borderTop: '1px solid oklch(1 0 0 / 0.07)', borderBottom: '1px solid oklch(1 0 0 / 0.07)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', width: 'max-content', animation: 'marqueeScroll 28s linear infinite', gap: 80, padding: '0 40px' }}>
          {MARQUEE_BRANDS.map((b, i) => (
            <span key={i} style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, color: 'oklch(0.5 0.015 30)', whiteSpace: 'nowrap' }}>{b}</span>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} className="veltra-stats-grid" style={{ ...statsStyle, maxWidth: 1280, margin: '0 auto', padding: '90px 32px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
        {[
          [cars.length ? counts.listings.toLocaleString('en-US') : '—', 'autos activos'],
          [cars.length ? counts.sellers.toLocaleString('en-US') : '—', 'vendedores verificados'],
          [cars.length ? counts.cities.toString() : '—', 'ciudades cubiertas'],
          [cars.length ? (counts.rating / 10).toFixed(1) + '/5' : '—', 'satisfacción promedio'],
        ].map(([value, label]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontFamily: "'Instrument Serif', serif", fontSize: 52, color: 'oklch(0.72 0.17 55)' }}>{value}</p>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: 'oklch(0.68 0.015 30)', fontWeight: 600 }}>{label}</p>
          </div>
        ))}
      </section>

      {/* CATEGORIES */}
      <section ref={categoriesRef} style={{ ...categoriesStyle, maxWidth: 1280, margin: '0 auto', padding: '40px 32px 100px' }}>
        <span style={{ display: 'inline-flex', fontSize: 11.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'oklch(0.72 0.17 55)', marginBottom: 14 }}>● Categorías</span>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 40, margin: '0 0 8px' }}>Explora por categoría</h2>
        <p style={{ fontSize: 16, color: 'oklch(0.68 0.015 30)', margin: '0 0 40px' }}>Encuentra exactamente el tipo de vehículo que buscas</p>
        <div className="veltra-categories-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 16 }}>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.key}
              to={`/catalogo?type=${encodeURIComponent(cat.type)}`}
              className="veltra-category-card"
              style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '28px 16px', borderRadius: 20, background: 'oklch(0.21 0.016 30 / 0.5)', border: '1px solid oklch(1 0 0 / 0.08)', transition: 'all .3s ease' }}
            >
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, oklch(0.63 0.20 25 / 0.25), oklch(0.72 0.17 55 / 0.25))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid oklch(1 0 0 / 0.1)' }}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="oklch(0.85 0.13 55)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {cat.icon}
                </svg>
              </div>
              <span style={{ fontWeight: 700, fontSize: 14.5 }}>{cat.label}</span>
              <span style={{ fontSize: 12, color: 'oklch(0.6 0.015 30)' }}>{cars.length ? typeCount(cat.type) + ' anuncios' : '—'}</span>
            </Link>
          ))}
          <Link
            to="/catalogo"
            className="veltra-category-card"
            style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '28px 16px', borderRadius: 20, background: 'oklch(0.21 0.016 30 / 0.5)', border: '1px solid oklch(1 0 0 / 0.08)', transition: 'all .3s ease' }}
          >
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, oklch(0.63 0.20 25 / 0.25), oklch(0.72 0.17 55 / 0.25))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid oklch(1 0 0 / 0.1)' }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="oklch(0.85 0.13 55)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="8" />
                <path d="M12 8v4l3 2" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 14.5 }}>Clásico</span>
            <span style={{ fontSize: 12, color: 'oklch(0.6 0.015 30)' }}>—</span>
          </Link>
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      <section ref={featuredRef} style={{ ...featuredStyle, maxWidth: 1280, margin: '0 auto', padding: '20px 32px 110px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
          <div>
            <span style={{ display: 'inline-flex', fontSize: 11.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'oklch(0.72 0.17 55)', marginBottom: 14 }}>● Inventario</span>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 40, margin: '0 0 8px' }}>Recién publicados</h2>
            <p style={{ fontSize: 16, color: 'oklch(0.68 0.015 30)', margin: 0 }}>Seleccionados por su historial y condición</p>
          </div>
          <Link to="/catalogo" style={{ textDecoration: 'none', color: 'oklch(0.72 0.17 55)', fontWeight: 700, fontSize: 14.5 }}>Ver catálogo completo →</Link>
        </div>
        {cars.length > 0 && (
          <div className="veltra-cards-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
            {cars.slice(0, 6).map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
        {noCarsYet && (
          <div style={{ textAlign: 'center', padding: '90px 20px', border: '1px dashed oklch(1 0 0 / 0.15)', borderRadius: 20 }}>
            <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, margin: '0 0 8px' }}>Aún no hay anuncios publicados</p>
            <p style={{ fontSize: 14.5, color: 'oklch(0.65 0.015 30)', margin: 0 }}>Corre <code>npm run seed</code> para poblar el catálogo con datos de ejemplo.</p>
          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" ref={howRef} style={{ ...howStyle, padding: '110px 32px', background: 'oklch(0.13 0.012 30)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 40, margin: '0 0 60px', textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: 11.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'oklch(0.72 0.17 55)', fontFamily: "'Manrope', sans-serif", marginBottom: 16 }}>● Proceso</span>
            Cómo funciona VELTRA
          </h2>
          <div className="veltra-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 28, left: '16%', right: '16%', height: 1, background: 'linear-gradient(90deg, transparent, oklch(1 0 0 / 0.2), transparent)' }} />
            {STEPS.map((step) => (
              <div key={step.n} style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, oklch(0.63 0.20 25), oklch(0.72 0.17 55))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontFamily: "'Instrument Serif', serif", fontSize: 24, color: 'oklch(0.14 0.012 30)', position: 'relative', zIndex: 1 }}>
                  {step.n}
                </div>
                <h3 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 22, margin: '0 0 10px' }}>{step.title}</h3>
                <p style={{ fontSize: 14.5, color: 'oklch(0.68 0.015 30)', lineHeight: 1.6, maxWidth: 280, margin: '0 auto' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section ref={whyRef} style={{ ...whyStyle, maxWidth: 1280, margin: '0 auto', padding: '110px 32px' }}>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 40, margin: '0 0 8px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: 11.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'oklch(0.72 0.17 55)', fontFamily: "'Manrope', sans-serif", marginBottom: 16 }}>● Confianza</span>
          Por qué comprar en VELTRA
        </h2>
        <p style={{ fontSize: 16, color: 'oklch(0.68 0.015 30)', margin: '0 0 50px', textAlign: 'center' }}>Confianza en cada paso de tu compra</p>
        <div className="veltra-why-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          {WHY_US.map((item) => (
            <div key={item.title} style={{ padding: '30px 24px', borderRadius: 20, background: 'oklch(0.21 0.016 30 / 0.5)', border: '1px solid oklch(1 0 0 / 0.08)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, oklch(0.63 0.20 25 / 0.3), oklch(0.72 0.17 55 / 0.3))', marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="oklch(0.9 0.05 40)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {item.icon}
                  {item.icon2}
                </svg>
              </div>
              <h3 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 19, margin: '0 0 8px' }}>{item.title}</h3>
              <p style={{ fontSize: 13.5, color: 'oklch(0.65 0.015 30)', lineHeight: 1.55, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="vender" ref={ctaRef} style={{ ...ctaStyle, margin: '60px 32px', padding: '80px 40px', borderRadius: 32, background: 'linear-gradient(135deg, oklch(0.63 0.20 25), oklch(0.72 0.17 55))', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <h2 className="veltra-cta-title" style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 44, margin: '0 0 16px', color: 'oklch(0.14 0.012 30)' }}>¿Tienes un auto para vender?</h2>
        <p style={{ fontSize: 17, margin: '0 0 32px', color: 'oklch(0.2 0.02 30 / 0.85)' }}>Publica tu anuncio gratis en minutos y llega a miles de compradores verificados.</p>
        <Link
          to="/publicar"
          className="veltra-cta-banner-btn"
          style={{
            display: 'inline-block',
            textDecoration: 'none',
            fontWeight: 800,
            fontSize: 15.5,
            color: 'oklch(0.97 0.008 30)',
            background: 'oklch(0.14 0.012 30)',
            padding: '16px 34px',
            borderRadius: 100,
            transition: 'transform .25s ease, box-shadow .25s ease',
          }}
        >
          Publicar mi anuncio →
        </Link>
      </section>

      {/* FOOTER */}
      <footer id="financiamiento" style={{ maxWidth: 1280, margin: '0 auto', padding: '70px 32px 40px' }}>
        <div className="veltra-footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 40, borderBottom: '1px solid oklch(1 0 0 / 0.08)', paddingBottom: 50, marginBottom: 30 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ width: 20, height: 20, borderRadius: 6, background: 'linear-gradient(135deg, oklch(0.63 0.20 25), oklch(0.72 0.17 55))', display: 'inline-block', transform: 'rotate(-8deg)', flexShrink: 0 }} />
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 26, lineHeight: 1 }}>VELTRA</span>
            </div>
            <p style={{ fontSize: 13.5, color: 'oklch(0.6 0.015 30)', lineHeight: 1.6, margin: '14px 0 0', maxWidth: 260 }}>
              El marketplace de autos con verificación real, financiamiento flexible y soporte en cada paso.
            </p>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 13.5, margin: '0 0 16px' }}>Marketplace</p>
            <Link to="/catalogo" style={footerLinkStyle}>Catálogo</Link>
            <Link to="/registro" style={footerLinkStyle}>Vender mi auto</Link>
            <a href="#financiamiento" style={{ ...footerLinkStyle, marginBottom: 0 }}>Financiamiento</a>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 13.5, margin: '0 0 16px' }}>Compañía</p>
            <a href="#" style={footerLinkStyle}>Nosotros</a>
            <a href="#" style={footerLinkStyle}>Contacto</a>
            <a href="#" style={{ ...footerLinkStyle, marginBottom: 0 }}>Blog</a>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 13.5, margin: '0 0 16px' }}>Legal</p>
            <a href="#" style={footerLinkStyle}>Términos</a>
            <a href="#" style={{ ...footerLinkStyle, marginBottom: 0 }}>Privacidad</a>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 12.5, color: 'oklch(0.5 0.015 30)', margin: 0 }}>© 2026 VELTRA. Todos los derechos reservados.</p>
          <div style={{ display: 'flex', gap: 12 }}>
            {['IG', 'FB', 'X'].map((s) => (
              <a key={s} href="#" style={{ width: 34, height: 34, borderRadius: '50%', background: 'oklch(1 0 0 / 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'oklch(0.7 0.015 30)', fontSize: 12, fontWeight: 700 }}>
                {s}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

const heroSelectStyle = {
  flex: 1,
  minWidth: 120,
  background: 'transparent',
  border: 'none',
  color: 'oklch(0.95 0.008 30)',
  fontFamily: "'Manrope', sans-serif",
  fontSize: 14,
  fontWeight: 600,
  padding: '10px 14px',
  outline: 'none',
};

const footerLinkStyle = { display: 'block', textDecoration: 'none', color: 'oklch(0.65 0.015 30)', fontSize: 13.5, marginBottom: 12 };
