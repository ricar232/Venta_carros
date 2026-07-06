import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { getSession } from '../lib/auth.js';
import { fetchCars, formatPrice, deleteCar } from '../lib/carsApi.js';

export default function MyListings() {
  const session = getSession();
  const [cars, setCars] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session.token) return;
    fetchCars().then((all) => {
      const mine = all
        .filter((c) => String(c.ownerUserId) === String(session.user?.id))
        .map((c) => ({ ...c, priceFmt: formatPrice(c.price), mileageFmt: Number(c.mileage || 0).toLocaleString('en-US') }));
      setCars(mine);
      setLoaded(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDelete(id) {
    setDeletingId(id);
    setError('');
    deleteCar(id, session.token)
      .then(() => {
        setCars((prev) => prev.filter((c) => c.id !== id));
        setConfirmingId(null);
        setDeletingId(null);
      })
      .catch((err) => {
        setError(err.message);
        setDeletingId(null);
      });
  }

  if (!session.token) {
    return (
      <div style={{ fontFamily: "'Manrope', sans-serif", background: 'oklch(0.16 0.014 30)', color: 'oklch(0.97 0.008 30)', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 32px' }}>
          <div
            style={{
              width: '100%',
              maxWidth: 420,
              textAlign: 'center',
              background: 'oklch(0.21 0.016 30 / 0.55)',
              border: '1px solid oklch(1 0 0 / 0.08)',
              borderRadius: 24,
              padding: 36,
              backdropFilter: 'blur(20px)',
            }}
          >
            <h2 style={{ margin: '0 0 10px', fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 26 }}>Inicia sesión para ver tus anuncios</h2>
            <p style={{ margin: '0 0 26px', fontSize: 14.5, color: 'oklch(0.68 0.015 30)' }}>Necesitas una cuenta VELTRA para administrar tus autos publicados.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Link to="/login" style={ghostBtnStyle}>Iniciar sesión</Link>
              <Link to="/registro" style={primaryBtnStyle}>Crear cuenta</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", background: 'oklch(0.16 0.014 30)', color: 'oklch(0.97 0.008 30)', minHeight: '100vh' }}>
      <Navbar active="mis-anuncios" />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 32px 100px' }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 36, margin: '0 0 8px' }}>Mis anuncios</h1>
        <p style={{ fontSize: 14.5, color: 'oklch(0.68 0.015 30)', margin: '0 0 32px' }}>
          {loaded ? `${cars.length} ${cars.length === 1 ? 'anuncio publicado' : 'anuncios publicados'}` : 'Cargando…'}
        </p>

        {error && (
          <p style={{ fontSize: 13, color: 'oklch(0.7 0.19 25)', background: 'oklch(0.63 0.20 25 / 0.12)', border: '1px solid oklch(0.63 0.20 25 / 0.35)', padding: '10px 14px', borderRadius: 10, margin: '0 0 20px' }}>
            {error}
          </p>
        )}

        {loaded && cars.length === 0 && (
          <div style={{ textAlign: 'center', padding: '90px 20px', background: 'oklch(0.21 0.016 30 / 0.4)', border: '1px dashed oklch(1 0 0 / 0.15)', borderRadius: 20 }}>
            <div
              style={{
                width: 64, height: 64, margin: '0 auto 20px', borderRadius: '50%',
                background: 'linear-gradient(135deg, oklch(0.63 0.20 25 / 0.25), oklch(0.72 0.17 55 / 0.25))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
              }}
            >
              🚗
            </div>
            <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, margin: '0 0 8px' }}>Todavía no publicaste ningún auto</p>
            <p style={{ fontSize: 14.5, color: 'oklch(0.65 0.015 30)', margin: '0 0 24px' }}>Publicá tu primer anuncio, es gratis.</p>
            <Link
              to="/publicar"
              style={{
                display: 'inline-block', textDecoration: 'none', background: 'linear-gradient(135deg, oklch(0.63 0.20 25), oklch(0.72 0.17 55))',
                color: 'oklch(0.14 0.012 30)', fontWeight: 700, fontSize: 14, padding: '13px 26px', borderRadius: 100,
              }}
            >
              Publicar mi auto →
            </Link>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {cars.map((car) => (
            <div
              key={car.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                background: 'oklch(0.21 0.016 30 / 0.55)', border: '1px solid oklch(1 0 0 / 0.09)',
                borderRadius: 16, padding: 14, backdropFilter: 'blur(20px)',
              }}
            >
              <div style={{ width: 90, height: 66, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: `linear-gradient(135deg,${car.g1},${car.g2})`, position: 'relative' }}>
                {car.photos?.length > 0 && (
                  <img src={car.photos[0]} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ margin: 0, fontFamily: "'Instrument Serif', serif", fontSize: 19, fontWeight: 400 }}>{car.make} {car.model}</h3>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: 'oklch(0.65 0.015 30)' }}>
                  {car.year} · {car.mileageFmt} mi · {car.city}
                </p>
              </div>
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 19, color: 'oklch(0.72 0.17 55)', whiteSpace: 'nowrap' }}>
                {car.priceFmt}
              </span>

              {confirmingId === car.id ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 13, color: 'oklch(0.75 0.015 30)' }}>¿Seguro?</span>
                  <button
                    type="button"
                    disabled={deletingId === car.id}
                    onClick={() => handleDelete(car.id)}
                    style={{ background: 'oklch(0.55 0.22 25)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 13, padding: '8px 14px', borderRadius: 100, cursor: 'pointer' }}
                  >
                    {deletingId === car.id ? 'Eliminando…' : 'Sí, eliminar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingId(null)}
                    style={{ background: 'none', border: '1px solid oklch(1 0 0 / 0.15)', color: 'oklch(0.85 0.01 30)', fontWeight: 600, fontSize: 13, padding: '8px 14px', borderRadius: 100, cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                  <Link to={`/vehiculo/${car.id}`} style={{ textDecoration: 'none', color: 'oklch(0.9 0.01 30)', fontSize: 13, fontWeight: 700, border: '1px solid oklch(1 0 0 / 0.15)', padding: '8px 14px', borderRadius: 100 }}>
                    Ver
                  </Link>
                  <button
                    type="button"
                    onClick={() => setConfirmingId(car.id)}
                    style={{ background: 'none', border: '1px solid oklch(0.63 0.20 25 / 0.4)', color: 'oklch(0.75 0.18 25)', fontWeight: 700, fontSize: 13, padding: '8px 14px', borderRadius: 100, cursor: 'pointer' }}
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const primaryBtnStyle = {
  textDecoration: 'none', fontWeight: 700, fontSize: 14, color: 'oklch(0.14 0.012 30)',
  background: 'linear-gradient(135deg, oklch(0.63 0.20 25), oklch(0.72 0.17 55))',
  padding: '12px 22px', borderRadius: 100,
};

const ghostBtnStyle = {
  textDecoration: 'none', fontWeight: 700, fontSize: 14, color: 'oklch(0.95 0.008 30)',
  border: '1px solid oklch(1 0 0 / 0.15)', padding: '12px 22px', borderRadius: 100,
};
