import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import CarCard from '../components/CarCard.jsx';
import { TierFrame, TierChip } from '../components/TierBadge.jsx';
import { fetchCars, formatPrice, getCarById, similarCars } from '../lib/carsApi.js';
import { getSession } from '../lib/auth.js';

export default function VehicleDetail() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [activeThumb, setActiveThumb] = useState(0);
  const [down, setDown] = useState(20);
  const [term, setTerm] = useState(48);
  const [rate, setRate] = useState(12);
  const [phoneRevealed, setPhoneRevealed] = useState(false);

  useEffect(() => {
    fetchCars().then((all) => {
      const base = id ? getCarById(all, id) : all[0] || null;
      if (!base) {
        setLoaded(true);
        setNotFound(true);
        return;
      }
      const withFmt = {
        ...base,
        priceFmt: formatPrice(base.price),
        mileageFmt: Number(base.mileage || 0).toLocaleString('en-US'),
        sellerTypeLabel: base.sellerType === 'Concesionario' ? 'de concesionario' : 'de particular',
        sellerInitial: (base.seller || '?').trim().charAt(0),
      };
      const sim = similarCars(all, base, 4).map((c) => ({
        ...c,
        priceFmt: formatPrice(c.price),
        mileageFmt: Number(c.mileage || 0).toLocaleString('en-US'),
      }));
      setCar(withFmt);
      setSimilar(sim);
      setLoaded(true);
      setNotFound(false);
    });
  }, [id]);

  const { downFmt, financedFmt, monthlyFmt } = useMemo(() => {
    const price = car ? car.price : 0;
    const downAmount = (price * down) / 100;
    const financed = price - downAmount;
    const monthlyRate = rate / 100 / 12;
    const n = term;
    const monthly = monthlyRate > 0 ? (financed * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n)) : financed / n;
    return {
      downFmt: '$' + Math.round(downAmount).toLocaleString('en-US'),
      financedFmt: '$' + Math.round(financed || 0).toLocaleString('en-US'),
      monthlyFmt: '$' + Math.round(monthly || 0).toLocaleString('en-US'),
    };
  }, [car, down, rate, term]);

  const placeholder = {
    make: '', model: '', year: '', mileageFmt: '', city: '', priceFmt: '', transmission: '', fuel: '', color: '', doors: '',
    g1: 'oklch(0.4 0.05 30)', g2: 'oklch(0.3 0.05 30)', verified: false, seller: '', sellerTypeLabel: '', sellerInitial: '', rating: '', photos: [],
    sellerTier: 'bronce', sellerRatingAvg: 0, sellerRatingCount: 0,
  };
  const displayCar = car || placeholder;
  const hasPhotos = displayCar.photos?.length > 0;
  const mainPhoto = hasPhotos ? displayCar.photos[Math.min(activeThumb, displayCar.photos.length - 1)] : null;
  const isLoggedIn = !!getSession().token;
  const phoneLabel = phoneRevealed
    ? displayCar.sellerPhone || (isLoggedIn ? 'No disponible' : 'Inicia sesión para ver el teléfono')
    : 'Mostrar teléfono';

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", background: 'oklch(0.16 0.014 30)', color: 'oklch(0.97 0.008 30)', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 32px 0' }}>
        <Link to="/catalogo" style={{ textDecoration: 'none', color: 'oklch(0.65 0.015 30)', fontSize: 13.5, fontWeight: 600 }}>
          ← Volver al catálogo
        </Link>
      </div>

      {notFound && (
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '100px 32px', textAlign: 'center' }}>
          <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, margin: '0 0 10px' }}>Anuncio no encontrado</p>
          <p style={{ fontSize: 15, color: 'oklch(0.65 0.015 30)', margin: 0 }}>Revisa que el id en la URL sea correcto o que el backend tenga ese anuncio.</p>
        </div>
      )}

      {!!car && (
        <div className="veltra-sidebar-layout" style={{ maxWidth: 1400, margin: '0 auto', padding: '20px 32px 110px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 36, alignItems: 'flex-start' }}>
          <div>
            <div
              className="veltra-detail-photo"
              style={{
                position: 'relative',
                borderRadius: 24,
                overflow: 'hidden',
                border: '1px solid oklch(1 0 0 / 0.1)',
                background: `linear-gradient(135deg,${displayCar.g1},${displayCar.g2})`,
                height: 460,
              }}
            >
              {mainPhoto ? (
                <img src={mainPhoto} alt={`${displayCar.make} ${displayCar.model}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 11px, oklch(1 0 0 / 0.05) 11px, oklch(1 0 0 / 0.05) 12px)',
                    }}
                  />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 12.5,
                        letterSpacing: '.08em',
                        textTransform: 'uppercase',
                        color: 'oklch(1 0 0 / 0.65)',
                        background: 'oklch(0 0 0 / 0.3)',
                        padding: '8px 16px',
                        borderRadius: 8,
                      }}
                    >
                      foto · {displayCar.make} {displayCar.model}
                    </span>
                  </div>
                </>
              )}
              <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8 }}>
                {displayCar.verified && (
                  <span
                    style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'oklch(0.14 0.012 30)',
                      background: 'oklch(0.72 0.17 55)',
                      padding: '6px 12px 6px 9px',
                      borderRadius: 100,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="oklch(0.14 0.012 30)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                    Verificado
                  </span>
                )}
              </div>
            </div>
            {hasPhotos && displayCar.photos.length > 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${displayCar.photos.length},1fr)`, gap: 10, marginTop: 10 }}>
                {displayCar.photos.map((photo, i) => (
                  <button
                    key={photo}
                    onClick={() => setActiveThumb(i)}
                    style={{
                      height: 70,
                      borderRadius: 12,
                      overflow: 'hidden',
                      border: `2px solid ${i === activeThumb ? 'oklch(0.72 0.17 55)' : 'transparent'}`,
                      cursor: 'pointer',
                      padding: 0,
                      opacity: i === activeThumb ? 1 : 0.55,
                    }}
                  >
                    <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </button>
                ))}
              </div>
            )}

            <div style={{ marginTop: 36, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
              <div>
                <h1 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 40, margin: '0 0 8px' }}>
                  {displayCar.make} {displayCar.model}
                </h1>
                <p style={{ fontSize: 15, color: 'oklch(0.68 0.015 30)', margin: 0 }}>
                  {displayCar.year} · {displayCar.mileageFmt} mi · {displayCar.city}
                </p>
              </div>
              <p style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 38, color: 'oklch(0.72 0.17 55)', margin: 0, whiteSpace: 'nowrap' }}>
                {displayCar.priceFmt}
              </p>
            </div>

            <div className="veltra-specs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginTop: 32 }}>
              {[
                ['Transmisión', displayCar.transmission],
                ['Combustible', displayCar.fuel],
                ['Color', displayCar.color],
                ['Puertas', displayCar.doors],
              ].map(([label, value]) => (
                <div key={label} style={{ padding: 18, borderRadius: 16, background: 'oklch(0.21 0.016 30 / 0.5)', border: '1px solid oklch(1 0 0 / 0.08)' }}>
                  <p style={{ margin: 0, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.05em', color: 'oklch(0.58 0.015 30)' }}>{label}</p>
                  <p style={{ margin: '6px 0 0', fontWeight: 700, fontSize: 15 }}>{value}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 40 }}>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 26, margin: '0 0 14px' }}>Descripción</h2>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: 'oklch(0.75 0.015 30)', margin: 0 }}>
                {displayCar.make} {displayCar.model} {displayCar.year} en excelente estado, con {displayCar.mileageFmt} millas recorridas. Vehículo{' '}
                {displayCar.sellerTypeLabel}, listo para revisión física y prueba de manejo en {displayCar.city}. Historial de mantenimiento disponible bajo
                solicitud.
              </p>
            </div>

            <div id="financiamiento" style={{ marginTop: 44, padding: 30, borderRadius: 24, background: 'oklch(0.21 0.016 30 / 0.5)', border: '1px solid oklch(1 0 0 / 0.08)' }}>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 26, margin: '0 0 22px' }}>Calculadora de financiamiento</h2>
              <div className="veltra-split-panel" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13.5, color: 'oklch(0.68 0.015 30)', fontWeight: 600 }}>Enganche</span>
                      <span style={{ fontSize: 13.5, fontWeight: 700 }}>
                        {downFmt} ({down}%)
                      </span>
                    </div>
                    <input type="range" min={0} max={80} step={5} value={down} onChange={(e) => setDown(Number(e.target.value))} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13.5, color: 'oklch(0.68 0.015 30)', fontWeight: 600 }}>Plazo</span>
                      <span style={{ fontSize: 13.5, fontWeight: 700 }}>{term} meses</span>
                    </div>
                    <select
                      value={term}
                      onChange={(e) => setTerm(Number(e.target.value))}
                      style={{
                        width: '100%',
                        background: 'oklch(0.16 0.014 30)',
                        border: '1px solid oklch(1 0 0 / 0.12)',
                        color: 'oklch(0.95 0.008 30)',
                        fontFamily: "'Manrope', sans-serif",
                        fontSize: 14,
                        padding: '10px 12px',
                        borderRadius: 10,
                      }}
                    >
                      {[24, 36, 48, 60, 72].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13.5, color: 'oklch(0.68 0.015 30)', fontWeight: 600 }}>Tasa anual estimada</span>
                      <span style={{ fontSize: 13.5, fontWeight: 700 }}>{rate}%</span>
                    </div>
                    <input type="range" min={6} max={18} step={0.5} value={rate} onChange={(e) => setRate(Number(e.target.value))} style={{ width: '100%' }} />
                  </div>
                </div>
                <div
                  style={{
                    background: 'linear-gradient(135deg, oklch(0.63 0.20 25), oklch(0.72 0.17 55))',
                    borderRadius: 18,
                    padding: 26,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'oklch(0.2 0.02 30 / 0.8)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    Mensualidad estimada
                  </p>
                  <p style={{ margin: '10px 0 0', fontFamily: "'Instrument Serif', serif", fontSize: 48, color: 'oklch(0.14 0.012 30)' }}>{monthlyFmt}</p>
                  <p style={{ margin: '8px 0 0', fontSize: 12.5, color: 'oklch(0.2 0.02 30 / 0.75)' }}>
                    Financiando {financedFmt} a {term} meses
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 56 }}>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 26, margin: '0 0 22px' }}>Vehículos similares</h2>
              <div className="veltra-cards-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
                {similar.map((s) => (
                  <CarCard key={s.id} car={s} />
                ))}
              </div>
            </div>
          </div>

          <aside style={{ position: 'sticky', top: 94, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ padding: 26, borderRadius: 20, background: 'oklch(0.21 0.016 30 / 0.55)', border: '1px solid oklch(1 0 0 / 0.08)', backdropFilter: 'blur(20px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <TierFrame tier={displayCar.sellerTier}>
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, oklch(0.63 0.20 25), oklch(0.72 0.17 55))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Instrument Serif', serif",
                      fontSize: 22,
                      color: 'oklch(0.14 0.012 30)',
                    }}
                  >
                    {displayCar.sellerInitial}
                  </div>
                </TierFrame>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{displayCar.seller}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'oklch(0.62 0.015 30)' }}>
                    {displayCar.sellerTypeLabel} · ★ {displayCar.sellerRatingAvg.toFixed(1)} ({displayCar.sellerRatingCount})
                  </p>
                  <div style={{ marginTop: 6 }}>
                    <TierChip tier={displayCar.sellerTier} />
                  </div>
                </div>
              </div>
              {displayCar.verified && (
                <p style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: 'oklch(0.72 0.17 55)', margin: '0 0 18px' }}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="oklch(0.72 0.17 55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                  Identidad verificada
                </p>
              )}
              <button
                onClick={() => setPhoneRevealed(true)}
                style={{
                  width: '100%',
                  padding: 14,
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, oklch(0.63 0.20 25), oklch(0.72 0.17 55))',
                  color: 'oklch(0.14 0.012 30)',
                  fontWeight: 800,
                  fontSize: 14.5,
                  cursor: 'pointer',
                  marginBottom: 10,
                }}
              >
                {phoneLabel}
              </button>
              <button
                style={{
                  width: '100%',
                  padding: 14,
                  borderRadius: 12,
                  border: '1px solid oklch(1 0 0 / 0.15)',
                  background: 'transparent',
                  color: 'oklch(0.95 0.008 30)',
                  fontWeight: 700,
                  fontSize: 14.5,
                  cursor: 'pointer',
                }}
              >
                Enviar mensaje
              </button>
            </div>

            <div style={{ padding: 26, borderRadius: 20, background: 'oklch(0.21 0.016 30 / 0.55)', border: '1px solid oklch(1 0 0 / 0.08)' }}>
              <h3 style={{ margin: '0 0 16px', fontFamily: "'Instrument Serif', serif", fontSize: 18 }}>Agenda una visita</h3>
              <input type="text" placeholder="Tu nombre" style={sidebarInputStyle} />
              <input type="text" placeholder="Teléfono" style={sidebarInputStyle} />
              <textarea placeholder="Mensaje (opcional)" rows={3} style={{ ...sidebarInputStyle, resize: 'vertical' }} />
              <button
                style={{
                  width: '100%',
                  padding: 13,
                  borderRadius: 12,
                  border: '1px solid oklch(0.72 0.17 55 / 0.5)',
                  background: 'oklch(0.72 0.17 55 / 0.12)',
                  color: 'oklch(0.85 0.13 55)',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Solicitar visita
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

const sidebarInputStyle = {
  width: '100%',
  background: 'oklch(0.16 0.014 30)',
  border: '1px solid oklch(1 0 0 / 0.12)',
  color: 'oklch(0.95 0.008 30)',
  fontFamily: "'Manrope', sans-serif",
  fontSize: 13.5,
  padding: '11px 13px',
  borderRadius: 10,
  marginBottom: 10,
};
