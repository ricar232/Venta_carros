// Auth calls for the VELTRA marketplace registration/login flow.
//
// Talks to the Node.js/Express backend under /api (proxied by Vite in dev,
// same-origin in production since Express serves this app's build).
//
// POST {API_BASE}/auth/register
//   body: { name, email, phone, password, sellerType: "Particular"|"Concesionario" }
//   success (2xx): { user: { id, name, email }, token: "..." }
//   error (4xx/5xx): { message: "human readable error" }
//
// POST {API_BASE}/auth/login
//   body: { email, password }
//   success (2xx): { user: { id, name, email }, token: "..." }
//   error (4xx/5xx): { message: "human readable error" }
//
// On success we store the token in localStorage under "veltra_token" so the
// rest of the site can read it later to gate "publish a listing" flows once
// that page exists.

const API_BASE = '/api';

async function postJson(path, body) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
  }
  let data = {};
  try {
    data = await res.json();
  } catch (err) {
    data = {};
  }
  if (!res.ok) {
    throw new Error(data.message || 'Ocurrió un error. Intenta de nuevo.');
  }
  return data;
}

export function registerUser(payload) {
  return postJson('/auth/register', payload);
}

export function loginUser(payload) {
  return postJson('/auth/login', payload);
}

export function saveSession(data) {
  if (data && data.token) localStorage.setItem('veltra_token', data.token);
  if (data && data.user) localStorage.setItem('veltra_user', JSON.stringify(data.user));
}

export function getSession() {
  const token = localStorage.getItem('veltra_token');
  const userRaw = localStorage.getItem('veltra_user');
  return {
    token: token || null,
    user: userRaw ? JSON.parse(userRaw) : null,
  };
}
