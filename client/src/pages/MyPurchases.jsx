import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { getSession } from '../lib/auth.js';
import { fetchMyPurchases, rateSeller } from '../lib/purchasesApi.js';

function StarPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} estrellas`}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontSize: 22, color: n <= value ? 'oklch(0.82 0.16 85)' : 'oklch(1 0 0 / 0.18)', lineHeight: 1,
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function MyPurchases() {
  const session = getSession();
  const [purchases, setPurchases] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [drafts, setDrafts] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session.token) return;
    fetchMyPurchases(session.token).then((rows) => {
      setPurchases(rows);
      setLoaded(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleRate(id) {
    const score = drafts[id] || 0;
    if (!score) return;
    setBusyId(id);
    setError('');
    rateSeller(id, score, session.token)
      .then((updated) => {
        setPurchases((prev) => prev.map((p) => (p.id === id ? updated : p)));
        setBusyId(null);
      })
      .catch((err) => {
        setError(err.message);
        setBusyId(null);
      });
  }

  if (!session.token) {
    return (
      <div style={{ fontFamily: "'Manrope', sans-serif", background: 'oklch(0.16 0.014 265)', color: 'oklch(0.97 0.008 265)', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 32px' }}>
          <div
            style={{
              width: '100%', maxWidth: 420, textAlign: 'center',
              background: 'oklch(0.21 0.016 265 / 0.55)', border: '1px solid oklch(1 0 0 / 0.08)',
              borderRadius: 24, padding: 36, backdropFilter: 'blur(20px)',
            }}
          >
            <h2 style={{ margin: '0 0 10px', fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 26 }}>Inicia sesión para ver tus compras</h2>
            <p style={{ margin: '0 0 26px', fontSize: 14.5, color: 'oklch(0.68 0.015 265)' }}>Necesitas una cuenta VELTRA para ver los autos que compraste y calificar al vendedor.</p>
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
    <div style={{ fontFamily: "'Manrope', sans-serif", background: 'oklch(0.16 0.014 265)', color: 'oklch(0.97 0.008 265)', minHeight: '100vh' }}>
      <Navbar active="mis-compras" />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 32px 100px' }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 36, margin: '0 0 8px' }}>Mis compras</h1>
        <p style={{ fontSize: 14.5, color: 'oklch(0.68 0.015 265)', margin: '0 0 32px' }}>
          {loaded ? `${purchases.length} ${purchases.length === 1 ? 'compra registrada' : 'compras registradas'}` : 'Cargando…'}
        </p>

        {error && (
          <p style={{ fontSize: 13, color: 'oklch(0.7 0.19 25)', background: 'oklch(0.63 0.20 25 / 0.12)', border: '1px solid oklch(0.63 0.20 25 / 0.35)', padding: '10px 14px', borderRadius: 10, margin: '0 0 20px' }}>
            {error}
          </p>
        )}

        {loaded && purchases.length === 0 && (
          <div style={{ textAlign: 'center', padding: '90px 20px', background: 'oklch(0.21 0.016 265 / 0.4)', border: '1px dashed oklch(1 0 0 / 0.15)', borderRadius: 20 }}>
            <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, margin: '0 0 8px' }}>Todavía no tenés compras registradas</p>
            <p style={{ fontSize: 14.5, color: 'oklch(0.65 0.015 265)', margin: 0 }}>
              Cuando le compres un auto a un vendedor de VELTRA, va a marcar la venta y vas a poder calificarlo acá.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {purchases.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                background: 'oklch(0.21 0.016 265 / 0.55)', border: '1px solid oklch(1 0 0 / 0.09)',
                borderRadius: 16, padding: 18, backdropFilter: 'blur(20px)',
              }}
            >
              <div style={{ flex: 1, minWidth: 160 }}>
                <h3 style={{ margin: 0, fontFamily: "'Instrument Serif', serif", fontSize: 19, fontWeight: 400 }}>{p.carMake} {p.carModel}</h3>
                <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'oklch(0.6 0.015 265)' }}>Comprado el {new Date(p.createdAt).toLocaleDateString('es-ES')}</p>
              </div>

              {p.score ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'oklch(0.82 0.16 85)', fontSize: 18 }}>{'★'.repeat(p.score)}{'☆'.repeat(5 - p.score)}</span>
                  <span style={{ fontSize: 12.5, color: 'oklch(0.6 0.015 265)' }}>Ya calificaste</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <StarPicker value={drafts[p.id] || 0} onChange={(n) => setDrafts((d) => ({ ...d, [p.id]: n }))} />
                  <button
                    type="button"
                    disabled={busyId === p.id || !drafts[p.id]}
                    onClick={() => handleRate(p.id)}
                    style={{
                      background: 'linear-gradient(135deg, oklch(0.63 0.20 275), oklch(0.72 0.17 200))', border: 'none',
                      color: 'oklch(0.14 0.012 265)', fontWeight: 700, fontSize: 13, padding: '9px 16px', borderRadius: 100, cursor: 'pointer',
                      opacity: drafts[p.id] ? 1 : 0.5,
                    }}
                  >
                    {busyId === p.id ? 'Enviando…' : 'Calificar'}
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
  textDecoration: 'none', fontWeight: 700, fontSize: 14, color: 'oklch(0.14 0.012 265)',
  background: 'linear-gradient(135deg, oklch(0.63 0.20 275), oklch(0.72 0.17 200))',
  padding: '12px 22px', borderRadius: 100,
};

const ghostBtnStyle = {
  textDecoration: 'none', fontWeight: 700, fontSize: 14, color: 'oklch(0.95 0.008 265)',
  border: '1px solid oklch(1 0 0 / 0.15)', padding: '12px 22px', borderRadius: 100,
};
