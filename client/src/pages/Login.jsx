import { useState } from 'react';
import AuthNavbar from '../components/AuthNavbar.jsx';
import { loginUser, saveSession } from '../lib/auth.js';

export default function Login() {
  const [fields, setFields] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function setField(key, value) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);
    loginUser(fields)
      .then((data) => {
        saveSession(data);
        setSubmitting(false);
        setSuccess(true);
      })
      .catch((err) => {
        setSubmitting(false);
        setError(err.message);
      });
  }

  return (
    <div
      style={{
        fontFamily: "'Manrope', sans-serif",
        background: 'oklch(0.16 0.014 30)',
        color: 'oklch(0.97 0.008 30)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AuthNavbar mode="login" />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 32px' }}>
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            background: 'oklch(0.21 0.016 30 / 0.55)',
            border: '1px solid oklch(1 0 0 / 0.08)',
            borderRadius: 24,
            padding: 36,
            backdropFilter: 'blur(20px)',
          }}
        >
          <h2 style={{ margin: '0 0 6px', fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 28, textAlign: 'center' }}>
            Bienvenido de vuelta
          </h2>
          <p style={{ margin: '0 0 28px', fontSize: 13.5, color: 'oklch(0.6 0.015 30)', textAlign: 'center' }}>
            Inicia sesión para publicar y administrar tus anuncios.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'oklch(0.68 0.015 30)', marginBottom: 6 }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={fields.email}
                onChange={(e) => setField('email', e.target.value)}
                placeholder="tu@correo.com"
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'oklch(0.68 0.015 30)', marginBottom: 6 }}>
                Contraseña
              </label>
              <input
                type="password"
                value={fields.password}
                onChange={(e) => setField('password', e.target.value)}
                placeholder="Tu contraseña"
                required
                style={inputStyle}
              />
            </div>

            {error && (
              <p
                style={{
                  fontSize: 13,
                  color: 'oklch(0.7 0.19 25)',
                  background: 'oklch(0.63 0.20 25 / 0.12)',
                  border: '1px solid oklch(0.63 0.20 25 / 0.35)',
                  padding: '10px 14px',
                  borderRadius: 10,
                  margin: 0,
                }}
              >
                {error}
              </p>
            )}
            {success && (
              <p
                style={{
                  fontSize: 13,
                  color: 'oklch(0.72 0.17 55)',
                  background: 'oklch(0.72 0.17 55 / 0.12)',
                  border: '1px solid oklch(0.72 0.17 55 / 0.35)',
                  padding: '10px 14px',
                  borderRadius: 10,
                  margin: 0,
                }}
              >
                Sesión iniciada correctamente.
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="veltra-submit-btn"
              style={{
                marginTop: 6,
                width: '100%',
                padding: 14,
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, oklch(0.63 0.20 25), oklch(0.72 0.17 55))',
                color: 'oklch(0.14 0.012 30)',
                fontWeight: 800,
                fontSize: 15,
                cursor: 'pointer',
                opacity: submitting ? 0.7 : 1,
                transition: 'transform .2s ease, box-shadow .2s ease',
              }}
            >
              {submitting ? 'Ingresando…' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

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
