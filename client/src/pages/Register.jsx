import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthNavbar from '../components/AuthNavbar.jsx';
import { registerUser, saveSession } from '../lib/auth.js';

const initialFields = { name: '', email: '', phone: '', password: '', confirmPassword: '', acceptTerms: false, sellerType: 'Particular' };

export default function Register() {
  const [fields, setFields] = useState(initialFields);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function setField(key, value) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!fields.acceptTerms) {
      setError('Debes aceptar los términos y condiciones.');
      return;
    }
    if (fields.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (fields.password !== fields.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setSubmitting(true);
    setError('');
    registerUser({ name: fields.name, email: fields.email, phone: fields.phone, password: fields.password, sellerType: fields.sellerType })
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

  function sellerTypeStyle(type) {
    return fields.sellerType === type
      ? { border: '1px solid oklch(0.72 0.17 55)', background: 'oklch(0.72 0.17 55 / 0.18)', color: 'oklch(0.85 0.13 55)' }
      : { border: '1px solid oklch(1 0 0 / 0.12)', background: 'transparent', color: 'oklch(0.75 0.015 30)' };
  }

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", background: 'oklch(0.16 0.014 30)', color: 'oklch(0.97 0.008 30)', minHeight: '100vh' }}>
      <AuthNavbar mode="register" />

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '70px 32px 100px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
        <div>
          <span
            style={{
              display: 'inline-flex',
              fontSize: 12.5,
              fontWeight: 700,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: 'oklch(0.72 0.17 55)',
              background: 'oklch(0.72 0.17 55 / 0.12)',
              border: '1px solid oklch(0.72 0.17 55 / 0.35)',
              padding: '7px 14px',
              borderRadius: 100,
              marginBottom: 24,
            }}
          >
            Registro gratuito
          </span>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 46, lineHeight: 1.08, margin: '0 0 20px' }}>
            Publica tu auto <em style={{ fontStyle: 'italic', color: 'oklch(0.72 0.17 55)' }}>sin costo</em>.
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: 'oklch(0.72 0.015 30)', maxWidth: 400, margin: '0 0 32px' }}>
            Crea tu cuenta para publicar anuncios, chatear con compradores y administrar tu inventario desde un solo lugar.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {['Publicación de anuncios sin comisión', 'Insignia de vendedor verificado', 'Mensajes directos con compradores'].map((text) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: 'oklch(0.72 0.17 55 / 0.18)',
                    color: 'oklch(0.72 0.17 55)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  ✓
                </span>
                <span style={{ fontSize: 14.5, color: 'oklch(0.85 0.01 30)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'oklch(0.21 0.016 30 / 0.55)', border: '1px solid oklch(1 0 0 / 0.08)', borderRadius: 24, padding: 36, backdropFilter: 'blur(20px)' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, oklch(0.63 0.20 25), oklch(0.72 0.17 55))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: 24,
                  color: 'oklch(0.14 0.012 30)',
                }}
              >
                ✓
              </div>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 26, margin: '0 0 10px' }}>Cuenta creada</h2>
              <p style={{ fontSize: 14.5, color: 'oklch(0.68 0.015 30)', margin: '0 0 26px' }}>Ya puedes iniciar sesión y comenzar a publicar.</p>
              <Link
                to="/login"
                style={{
                  display: 'inline-block',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: 14.5,
                  color: 'oklch(0.14 0.012 30)',
                  background: 'linear-gradient(135deg, oklch(0.63 0.20 25), oklch(0.72 0.17 55))',
                  padding: '13px 28px',
                  borderRadius: 100,
                }}
              >
                Iniciar sesión →
              </Link>
            </div>
          ) : (
            <>
              <h2 style={{ margin: '0 0 6px', fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 26 }}>Crea tu cuenta</h2>
              <p style={{ margin: '0 0 24px', fontSize: 13.5, color: 'oklch(0.6 0.015 30)' }}>Es gratis y toma menos de un minuto.</p>

              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <button
                  type="button"
                  onClick={() => setField('sellerType', 'Particular')}
                  style={{ flex: 1, padding: 11, borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', ...sellerTypeStyle('Particular') }}
                >
                  Soy particular
                </button>
                <button
                  type="button"
                  onClick={() => setField('sellerType', 'Concesionario')}
                  style={{ flex: 1, padding: 11, borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', ...sellerTypeStyle('Concesionario') }}
                >
                  Soy concesionario
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Nombre completo</label>
                  <input type="text" value={fields.name} onChange={(e) => setField('name', e.target.value)} placeholder="Tu nombre" required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Correo electrónico</label>
                  <input type="email" value={fields.email} onChange={(e) => setField('email', e.target.value)} placeholder="tu@correo.com" required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Teléfono</label>
                  <input type="tel" value={fields.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="(407) 555-0148" required style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Contraseña</label>
                    <input
                      type="password"
                      value={fields.password}
                      onChange={(e) => setField('password', e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      required
                      minLength={8}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Confirmar</label>
                    <input
                      type="password"
                      value={fields.confirmPassword}
                      onChange={(e) => setField('confirmPassword', e.target.value)}
                      placeholder="Repite tu contraseña"
                      required
                      style={inputStyle}
                    />
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 12.5, color: 'oklch(0.65 0.015 30)', cursor: 'pointer', marginTop: 4 }}>
                  <input
                    type="checkbox"
                    checked={fields.acceptTerms}
                    onChange={() => setField('acceptTerms', !fields.acceptTerms)}
                    style={{ accentColor: 'oklch(0.72 0.17 55)', width: 16, height: 16, marginTop: 1, flexShrink: 0 }}
                  />
                  Acepto los términos y condiciones y la política de privacidad de VELTRA.
                </label>

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
                  {submitting ? 'Creando cuenta…' : 'Crear cuenta gratis'}
                </button>
              </form>
            </>
          )}
        </div>
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
