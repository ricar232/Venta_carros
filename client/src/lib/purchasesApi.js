const API_BASE = '/api';

async function authedJson(path, token, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) },
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

export function fetchMyPurchases(token) {
  return authedJson('/purchases/mine', token);
}

export function rateSeller(purchaseId, score, token) {
  return authedJson(`/purchases/${purchaseId}/rate`, token, {
    method: 'POST',
    body: JSON.stringify({ score }),
  });
}
