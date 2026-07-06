const API_BASE = '/api';

async function authedRequest(path, token, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) },
    });
  } catch (err) {
    throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
  }
  if (res.status === 204) return null;
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

export function fetchAdminUsers(token) {
  return authedRequest('/admin/users', token);
}

export function approveUser(id, token) {
  return authedRequest(`/admin/users/${id}/approve`, token, { method: 'POST' });
}

export function deleteUser(id, token) {
  return authedRequest(`/admin/users/${id}`, token, { method: 'DELETE' });
}
