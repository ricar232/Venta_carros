import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { getSession } from '../lib/auth.js';
import { fetchAdminUsers, approveUser, deleteUser } from '../lib/adminApi.js';
import { fetchCars, deleteCar, formatPrice } from '../lib/carsApi.js';
import { TierChip } from '../components/TierBadge.jsx';

export default function AdminDashboard() {
  const session = getSession();
  const isAdmin = session.user?.role === 'admin';
  const [users, setUsers] = useState([]);
  const [cars, setCars] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [confirmUserId, setConfirmUserId] = useState(null);
  const [confirmCarId, setConfirmCarId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (!session.token || !isAdmin) return;
    Promise.all([fetchAdminUsers(session.token), fetchCars()]).then(([u, c]) => {
      setUsers(u);
      setCars(c);
      setLoaded(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleApprove(id) {
    setBusyId(id);
    approveUser(id, session.token)
      .then((updated) => {
        setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
        setBusyId(null);
      })
      .catch((err) => {
        setError(err.message);
        setBusyId(null);
      });
  }

  function handleDeleteUser(id) {
    setBusyId(id);
    deleteUser(id, session.token)
      .then(() => {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        setCars((prev) => prev.filter((c) => String(c.ownerUserId) !== String(id)));
        setConfirmUserId(null);
        setBusyId(null);
      })
      .catch((err) => {
        setError(err.message);
        setBusyId(null);
      });
  }

  function handleDeleteCar(id) {
    setBusyId(id);
    deleteCar(id, session.token)
      .then(() => {
        setCars((prev) => prev.filter((c) => c.id !== id));
        setConfirmCarId(null);
        setBusyId(null);
      })
      .catch((err) => {
        setError(err.message);
        setBusyId(null);
      });
  }

  if (!session.token || !isAdmin) {
    return (
      <div style={{ fontFamily: "'Manrope', sans-serif", background: 'oklch(0.16 0.014 30)', color: 'oklch(0.97 0.008 30)', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 32px' }}>
          <div
            style={{
              width: '100%', maxWidth: 420, textAlign: 'center',
              background: 'oklch(0.21 0.016 30 / 0.55)', border: '1px solid oklch(1 0 0 / 0.08)',
              borderRadius: 24, padding: 36, backdropFilter: 'blur(20px)',
            }}
          >
            <h2 style={{ margin: '0 0 10px', fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 26 }}>Acceso restringido</h2>
            <p style={{ margin: 0, fontSize: 14.5, color: 'oklch(0.68 0.015 30)' }}>Esta sección es solo para administradores de VELTRA.</p>
          </div>
        </div>
      </div>
    );
  }

  const pending = users.filter((u) => u.status === 'pending');

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", background: 'oklch(0.16 0.014 30)', color: 'oklch(0.97 0.008 30)', minHeight: '100vh' }}>
      <Navbar active="admin" />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 32px 100px' }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 36, margin: '0 0 32px' }}>Panel de administración</h1>

        {error && (
          <p style={{ fontSize: 13, color: 'oklch(0.7 0.19 25)', background: 'oklch(0.63 0.20 25 / 0.12)', border: '1px solid oklch(0.63 0.20 25 / 0.35)', padding: '10px 14px', borderRadius: 10, margin: '0 0 20px' }}>
            {error}
          </p>
        )}

        {!loaded ? (
          <p style={{ color: 'oklch(0.65 0.015 30)' }}>Cargando…</p>
        ) : (
          <>
            <section style={{ marginBottom: 48 }}>
              <h2 style={sectionTitleStyle}>Cuentas pendientes de aprobación ({pending.length})</h2>
              {pending.length === 0 ? (
                <p style={{ fontSize: 14, color: 'oklch(0.6 0.015 30)' }}>No hay cuentas esperando aprobación.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pending.map((u) => (
                    <div key={u.id} style={rowStyle}>
                      <div style={{ flex: 1, minWidth: 160 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{u.name}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'oklch(0.6 0.015 30)' }}>{u.email} · {u.phone || 'sin teléfono'}</p>
                      </div>
                      <button
                        type="button"
                        disabled={busyId === u.id}
                        onClick={() => handleApprove(u.id)}
                        style={{ background: 'oklch(0.72 0.17 55)', border: 'none', color: 'oklch(0.14 0.012 30)', fontWeight: 700, fontSize: 13, padding: '8px 16px', borderRadius: 100, cursor: 'pointer' }}
                      >
                        {busyId === u.id ? 'Aprobando…' : 'Aprobar'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section style={{ marginBottom: 48 }}>
              <h2 style={sectionTitleStyle}>Todos los usuarios ({users.length})</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {users.map((u) => (
                  <div key={u.id} style={rowStyle}>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>
                        {u.name} {u.role === 'admin' && <span style={{ color: 'oklch(0.72 0.17 55)', fontSize: 12 }}>· admin</span>}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'oklch(0.6 0.015 30)' }}>
                        {u.email} · {u.status === 'approved' ? 'aprobado' : 'pendiente'}
                      </p>
                    </div>
                    <TierChip tier={u.tier} />
                    {confirmUserId === u.id ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          disabled={busyId === u.id}
                          onClick={() => handleDeleteUser(u.id)}
                          style={{ background: 'oklch(0.55 0.22 25)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 12.5, padding: '7px 12px', borderRadius: 100, cursor: 'pointer' }}
                        >
                          {busyId === u.id ? 'Eliminando…' : 'Sí, eliminar'}
                        </button>
                        <button type="button" onClick={() => setConfirmUserId(null)} style={ghostSmallBtn}>Cancelar</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setConfirmUserId(u.id)} style={dangerSmallBtn}>Eliminar</button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>Todos los anuncios ({cars.length})</h2>
              {cars.length === 0 ? (
                <p style={{ fontSize: 14, color: 'oklch(0.6 0.015 30)' }}>No hay anuncios publicados.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {cars.map((c) => (
                    <div key={c.id} style={rowStyle}>
                      <div style={{ flex: 1, minWidth: 160 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{c.make} {c.model}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'oklch(0.6 0.015 30)' }}>
                          {formatPrice(c.price)} · vendedor: {c.seller}
                        </p>
                      </div>
                      <Link to={`/vehiculo/${c.id}`} style={{ textDecoration: 'none', color: 'oklch(0.9 0.01 30)', fontSize: 12.5, fontWeight: 700, border: '1px solid oklch(1 0 0 / 0.15)', padding: '7px 12px', borderRadius: 100 }}>
                        Ver
                      </Link>
                      {confirmCarId === c.id ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            disabled={busyId === c.id}
                            onClick={() => handleDeleteCar(c.id)}
                            style={{ background: 'oklch(0.55 0.22 25)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 12.5, padding: '7px 12px', borderRadius: 100, cursor: 'pointer' }}
                          >
                            {busyId === c.id ? 'Eliminando…' : 'Sí, eliminar'}
                          </button>
                          <button type="button" onClick={() => setConfirmCarId(null)} style={ghostSmallBtn}>Cancelar</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setConfirmCarId(c.id)} style={dangerSmallBtn}>Eliminar</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

const sectionTitleStyle = { fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 22, margin: '0 0 16px' };

const rowStyle = {
  display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
  background: 'oklch(0.21 0.016 30 / 0.55)', border: '1px solid oklch(1 0 0 / 0.09)',
  borderRadius: 14, padding: '12px 16px',
};

const ghostSmallBtn = {
  background: 'none', border: '1px solid oklch(1 0 0 / 0.15)', color: 'oklch(0.85 0.01 30)',
  fontWeight: 600, fontSize: 12.5, padding: '7px 12px', borderRadius: 100, cursor: 'pointer',
};

const dangerSmallBtn = {
  background: 'none', border: '1px solid oklch(0.63 0.20 25 / 0.4)', color: 'oklch(0.75 0.18 25)',
  fontWeight: 700, fontSize: 12.5, padding: '7px 12px', borderRadius: 100, cursor: 'pointer',
};
