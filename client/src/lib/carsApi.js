// Data layer for the VELTRA marketplace.
//
// Fetches real data from the Node.js/Express backend. Expected endpoint:
// GET {API_BASE}/cars -> JSON array of car objects shaped like:
// {
//   id: string,
//   make: string,                // "Toyota"
//   model: string,                // "Corolla Cross"
//   year: number,                 // 2023
//   price: number,                 // 24500 (USD, no formatting)
//   mileage: number,               // 18200 (miles)
//   type: string,                   // "SUV" | "Sedán" | "Pickup" | "Deportivo" | "Eléctrico"
//   fuel: string,                    // "Gasolina" | "Híbrido" | "Eléctrico"
//   transmission: string,             // "Automática" | "Manual"
//   city: string,                      // "Orlando, FL"
//   color: string,                      // "Blanco Perla"
//   doors: number,                        // 4
//   verified: boolean,                     // seller identity verified
//   rating: number,                          // 4.8
//   sellerType: "Concesionario" | "Particular",
//   seller: string,                            // seller display name
//   sellerPhone: string,                         // "(407) 555-0148"
//   g1: string, g2: string                        // two CSS colors for the
//                                                   // placeholder gradient, used
//                                                   // only as a fallback when
//                                                   // photos is empty.
//   photos: string[]                                // uploaded photo URLs
//                                                     // (/uploads/cars/<file>)
//   ownerUserId: number                               // id of the user who
//                                                       // published this car
// }

const API_BASE = '/api';

export async function fetchCars() {
  try {
    const res = await fetch(`${API_BASE}/cars`);
    if (!res.ok) throw new Error('Request failed: ' + res.status);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn(`[VELTRA] No se pudo cargar ${API_BASE}/cars — revisa que el backend esté corriendo.`, err);
    return [];
  }
}

export function formatPrice(n) {
  return '$' + Number(n || 0).toLocaleString('en-US');
}

export function getCarById(cars, id) {
  return cars.find((c) => c.id === id) || null;
}

export function similarCars(cars, car, count) {
  return cars.filter((c) => c.id !== car.id && (c.type === car.type || c.make === car.make)).slice(0, count || 4);
}

export async function createCar(formData, token) {
  let res;
  try {
    res = await fetch(`${API_BASE}/cars`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
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

export async function deleteCar(id, token) {
  let res;
  try {
    res = await fetch(`${API_BASE}/cars/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
  }
  if (!res.ok) {
    let data = {};
    try {
      data = await res.json();
    } catch (err) {
      data = {};
    }
    throw new Error(data.message || 'No se pudo eliminar el anuncio.');
  }
}
