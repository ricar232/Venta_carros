// Data layer for the VELTRA marketplace.
//
// This file no longer ships sample/fake listings. It fetches real data from
// your Node.js backend. Point API_BASE at wherever you're serving your API
// from your VPS (same-origin "/api" works if Node serves both the API and
// these static files; set a full URL if the API lives on a different host).
//
// Expected endpoint: GET {API_BASE}/cars -> JSON array of car objects shaped like:
// {
//   id: string,                 // unique id, used in VehicleDetail.dc.html?id=...
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
//   g1: string, g2: string                        // two CSS colors (any valid color) used
//                                                   // for the placeholder photo gradient until
//                                                   // you wire up real photos
// }
//
// Swap fetchCars() below for real photo URLs once you have them — CarCard.dc.html
// and VehicleDetail.dc.html currently render a gradient + label placeholder
// wherever a photo would go.

const API_BASE = '/api';

export async function fetchCars() {
  try {
    const res = await fetch(`${API_BASE}/cars`);
    if (!res.ok) throw new Error('Request failed: ' + res.status);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn(
      `[VELTRA] No se pudo cargar ${API_BASE}/cars — conecta tu backend de Node.js para ver anuncios reales.`,
      err
    );
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
