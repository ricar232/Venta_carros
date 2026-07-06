import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { getSession, refreshSession } from '../lib/auth.js';
import { createCar } from '../lib/carsApi.js';

const TYPES = ['SUV', 'Sedán', 'Pickup', 'Deportivo', 'Eléctrico'];
const FUELS = ['Gasolina', 'Híbrido', 'Eléctrico'];
const TRANSMISSIONS = ['Automática', 'Manual'];
const MAX_PHOTOS = 6;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const initialFields = {
  make: '', model: '', year: '', price: '', mileage: '', city: '', color: '', doors: '4',
  type: TYPES[0], fuel: FUELS[0], transmission: TRANSMISSIONS[0],
};

export default function PublishListing() {
  const [session, setSession] = useState(getSession());
  const [fields, setFields] = useState(initialFields);
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdCar, setCreatedCar] = useState(null);

  useEffect(() => {
    if (!session.token) return;
    refreshSession(session.token).then((user) => {
      if (user) setSession((s) => ({ ...s, user }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setField(key, value) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  function handlePhotoSelect(e) {
    const chosen = Array.from(e.target.files || []);
    e.target.value = '';
    if (!chosen.length) return;

    const oversized = chosen.find((f) => f.size > MAX_PHOTO_SIZE);
    if (oversized) {
      setError(`"${oversized.name}" pesa más de 5MB.`);
      return;
    }

    setPhotos((prev) => {
      const room = MAX_PHOTOS - prev.length;
      if (room <= 0) {
        setError(`Máximo ${MAX_PHOTOS} fotos por anuncio.`);
        return prev;
      }
      const accepted = chosen.slice(0, room);
      const next = [...prev, ...accepted.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }))];
      if (chosen.length > accepted.length) setError(`Máximo ${MAX_PHOTOS} fotos por anuncio — se agregaron ${accepted.length}.`);
      else setError('');
      return next;
    });
  }

  function removePhoto(index) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (photos.length === 0) {
      setError('Agrega al menos una foto.');
      return;
    }
    setSubmitting(true);
    setError('');

    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
    photos.forEach(({ file }) => formData.append('photos', file));

    createCar(formData, session.token)
      .then((car) => {
        setSubmitting(false);
        setCreatedCar(car);
      })
      .catch((err) => {
        setSubmitting(false);
        setError(err.message);
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
            <h2 style={{ margin: '0 0 10px', fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 26 }}>Inicia sesión para publicar</h2>
            <p style={{ margin: '0 0 26px', fontSize: 14.5, color: 'oklch(0.68 0.015 30)' }}>Necesitas una cuenta VELTRA para publicar un anuncio.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Link to="/login" style={ghostBtnStyle}>Iniciar sesión</Link>
              <Link to="/registro" style={primaryBtnStyle}>Crear cuenta</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (session.user?.status !== 'approved') {
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
            <h2 style={{ margin: '0 0 10px', fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 26 }}>Tu cuenta está pendiente de aprobación</h2>
            <p style={{ margin: 0, fontSize: 14.5, color: 'oklch(0.68 0.015 30)' }}>
              Un administrador tiene que aprobar tu cuenta antes de que puedas publicar anuncios. Esto es para garantizar la autenticidad de los vendedores en VELTRA.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (createdCar) {
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
            <div
              style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'linear-gradient(135deg, oklch(0.63 0.20 25), oklch(0.72 0.17 55))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                fontSize: 24, color: 'oklch(0.14 0.012 30)',
              }}
            >
              ✓
            </div>
            <h2 style={{ margin: '0 0 10px', fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 26 }}>Anuncio publicado</h2>
            <p style={{ margin: '0 0 26px', fontSize: 14.5, color: 'oklch(0.68 0.015 30)' }}>
              {createdCar.make} {createdCar.model} ya está en el catálogo.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Link to="/catalogo" style={ghostBtnStyle}>Ver catálogo</Link>
              <Link to={`/vehiculo/${createdCar.id}`} style={primaryBtnStyle}>Ver mi anuncio →</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", background: 'oklch(0.16 0.014 30)', color: 'oklch(0.97 0.008 30)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '60px 32px 100px' }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 36, margin: '0 0 8px' }}>Publica tu auto</h1>
        <p style={{ fontSize: 14.5, color: 'oklch(0.68 0.015 30)', margin: '0 0 32px' }}>
          Los datos del vendedor se toman de tu cuenta. Agrega al menos una foto real de tu auto.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex', flexDirection: 'column', gap: 14,
            background: 'oklch(0.21 0.016 30 / 0.55)', border: '1px solid oklch(1 0 0 / 0.08)',
            borderRadius: 24, padding: 32, backdropFilter: 'blur(20px)',
          }}
        >
          <div className="veltra-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Marca</label>
              <input type="text" value={fields.make} onChange={(e) => setField('make', e.target.value)} placeholder="Toyota" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Modelo</label>
              <input type="text" value={fields.model} onChange={(e) => setField('model', e.target.value)} placeholder="Corolla Cross" required style={inputStyle} />
            </div>
          </div>

          <div className="veltra-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Año</label>
              <input type="number" value={fields.year} onChange={(e) => setField('year', e.target.value)} placeholder="2023" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Precio (USD)</label>
              <input type="number" value={fields.price} onChange={(e) => setField('price', e.target.value)} placeholder="24500" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Kilometraje (mi)</label>
              <input type="number" value={fields.mileage} onChange={(e) => setField('mileage', e.target.value)} placeholder="18200" required style={inputStyle} />
            </div>
          </div>

          <div className="veltra-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Ciudad</label>
              <input type="text" value={fields.city} onChange={(e) => setField('city', e.target.value)} placeholder="Orlando, FL" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Color</label>
              <input type="text" value={fields.color} onChange={(e) => setField('color', e.target.value)} placeholder="Blanco Perla" required style={inputStyle} />
            </div>
          </div>

          <div className="veltra-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Tipo</label>
              <select value={fields.type} onChange={(e) => setField('type', e.target.value)} style={inputStyle}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Combustible</label>
              <select value={fields.fuel} onChange={(e) => setField('fuel', e.target.value)} style={inputStyle}>
                {FUELS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Puertas</label>
              <input type="number" min={2} max={5} value={fields.doors} onChange={(e) => setField('doors', e.target.value)} required style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Transmisión</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {TRANSMISSIONS.map((t) => {
                const active = fields.transmission === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setField('transmission', t)}
                    style={{
                      flex: 1, padding: 11, borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
                      border: `1px solid ${active ? 'oklch(0.72 0.17 55)' : 'oklch(1 0 0 / 0.12)'}`,
                      background: active ? 'oklch(0.72 0.17 55 / 0.18)' : 'transparent',
                      color: active ? 'oklch(0.85 0.13 55)' : 'oklch(0.75 0.015 30)',
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Fotos ({photos.length}/{MAX_PHOTOS})</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: 10 }}>
              {photos.map((p, i) => (
                <div key={p.previewUrl} style={{ position: 'relative', height: 84, borderRadius: 10, overflow: 'hidden', border: '1px solid oklch(1 0 0 / 0.12)' }}>
                  <img src={p.previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    aria-label="Quitar foto"
                    style={{
                      position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%',
                      border: 'none', background: 'oklch(0 0 0 / 0.55)', color: '#fff', cursor: 'pointer',
                      fontSize: 13, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <label
                  style={{
                    height: 84, borderRadius: 10, border: '1.5px dashed oklch(1 0 0 / 0.2)', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    color: 'oklch(0.65 0.015 30)', fontSize: 12, gap: 4,
                  }}
                >
                  <span style={{ fontSize: 20 }}>+</span>
                  Agregar
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handlePhotoSelect} style={{ display: 'none' }} />
                </label>
              )}
            </div>
          </div>

          {error && (
            <p style={{ fontSize: 13, color: 'oklch(0.7 0.19 25)', background: 'oklch(0.63 0.20 25 / 0.12)', border: '1px solid oklch(0.63 0.20 25 / 0.35)', padding: '10px 14px', borderRadius: 10, margin: 0 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="veltra-submit-btn"
            style={{
              marginTop: 6, width: '100%', padding: 14, borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, oklch(0.63 0.20 25), oklch(0.72 0.17 55))',
              color: 'oklch(0.14 0.012 30)', fontWeight: 800, fontSize: 15, cursor: 'pointer',
              opacity: submitting ? 0.7 : 1, transition: 'transform .2s ease, box-shadow .2s ease',
            }}
          >
            {submitting ? 'Publicando…' : 'Publicar anuncio'}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: 12.5, fontWeight: 700, color: 'oklch(0.68 0.015 30)', marginBottom: 6 };

const inputStyle = {
  width: '100%',
  background: 'oklch(0.16 0.014 30)',
  border: '1px solid oklch(1 0 0 / 0.12)',
  color: 'oklch(0.95 0.008 30)',
  fontFamily: "'Manrope', sans-serif",
  fontSize: 14,
  padding: '12px 14px',
  borderRadius: 10,
};

const primaryBtnStyle = {
  textDecoration: 'none', fontWeight: 700, fontSize: 14, color: 'oklch(0.14 0.012 30)',
  background: 'linear-gradient(135deg, oklch(0.63 0.20 25), oklch(0.72 0.17 55))',
  padding: '12px 22px', borderRadius: 100,
};

const ghostBtnStyle = {
  textDecoration: 'none', fontWeight: 700, fontSize: 14, color: 'oklch(0.95 0.008 30)',
  border: '1px solid oklch(1 0 0 / 0.15)', padding: '12px 22px', borderRadius: 100,
};
