import { db } from './db.js';

const cars = [
  { make: 'Honda', model: 'Civic Type R', year: 2022, price: 46900, mileage: 9800, type: 'Deportivo', fuel: 'Gasolina', transmission: 'Manual', city: 'Tampa, FL', color: 'Blanco Championship', doors: 4, verified: 1, rating: 4.9, sellerType: 'Concesionario', seller: 'Tampa Bay Motors', sellerPhone: '(813) 555-0132', g1: 'oklch(0.60 0.20 25)', g2: 'oklch(0.68 0.18 45)' },
  { make: 'Toyota', model: 'Corolla Cross', year: 2023, price: 24500, mileage: 18200, type: 'SUV', fuel: 'Híbrido', transmission: 'Automática', city: 'Orlando, FL', color: 'Gris Celestita', doors: 4, verified: 1, rating: 4.8, sellerType: 'Particular', seller: 'Marcos Díaz', sellerPhone: '(407) 555-0148', g1: 'oklch(0.55 0.03 250)', g2: 'oklch(0.4 0.02 260)' },
  { make: 'Tesla', model: 'Model 3', year: 2023, price: 38900, mileage: 12500, type: 'Eléctrico', fuel: 'Eléctrico', transmission: 'Automática', city: 'Miami, FL', color: 'Rojo Multi-Coat', doors: 4, verified: 1, rating: 4.9, sellerType: 'Concesionario', seller: 'EV Miami', sellerPhone: '(305) 555-0110', g1: 'oklch(0.55 0.22 25)', g2: 'oklch(0.3 0.02 260)' },
  { make: 'Ford', model: 'F-150', year: 2021, price: 34900, mileage: 42100, type: 'Pickup', fuel: 'Gasolina', transmission: 'Automática', city: 'Jacksonville, FL', color: 'Azul Velocity', doors: 4, verified: 0, rating: 4.5, sellerType: 'Particular', seller: 'Luis Fernández', sellerPhone: '(904) 555-0177', g1: 'oklch(0.5 0.15 250)', g2: 'oklch(0.35 0.05 260)' },
  { make: 'BMW', model: 'X3', year: 2022, price: 41900, mileage: 21800, type: 'SUV', fuel: 'Gasolina', transmission: 'Automática', city: 'Tampa, FL', color: 'Negro Zafiro', doors: 4, verified: 1, rating: 4.7, sellerType: 'Concesionario', seller: 'Bay Luxury Auto', sellerPhone: '(813) 555-0199', g1: 'oklch(0.3 0.01 260)', g2: 'oklch(0.2 0.01 260)' },
  { make: 'Mazda', model: 'MX-5 Miata', year: 2021, price: 27900, mileage: 15400, type: 'Deportivo', fuel: 'Gasolina', transmission: 'Manual', city: 'Sarasota, FL', color: 'Rojo Soul', doors: 2, verified: 1, rating: 4.8, sellerType: 'Particular', seller: 'Carla Ruiz', sellerPhone: '(941) 555-0163', g1: 'oklch(0.58 0.21 25)', g2: 'oklch(0.45 0.15 30)' },
  { make: 'Hyundai', model: 'Elantra', year: 2023, price: 21900, mileage: 9100, type: 'Sedán', fuel: 'Gasolina', transmission: 'Automática', city: 'Orlando, FL', color: 'Plata Titánio', doors: 4, verified: 1, rating: 4.6, sellerType: 'Concesionario', seller: 'Orlando Hyundai', sellerPhone: '(407) 555-0122', g1: 'oklch(0.65 0.01 260)', g2: 'oklch(0.5 0.01 260)' },
  { make: 'Kia', model: 'Sportage', year: 2022, price: 27500, mileage: 24300, type: 'SUV', fuel: 'Gasolina', transmission: 'Automática', city: 'Kissimmee, FL', color: 'Verde Bosque', doors: 4, verified: 0, rating: 4.4, sellerType: 'Particular', seller: 'Diego Morales', sellerPhone: '(689) 555-0154', g1: 'oklch(0.45 0.1 150)', g2: 'oklch(0.3 0.06 150)' },
  { make: 'Volkswagen', model: 'Jetta', year: 2020, price: 18900, mileage: 51200, type: 'Sedán', fuel: 'Gasolina', transmission: 'Manual', city: 'Tampa, FL', color: 'Blanco Puro', doors: 4, verified: 0, rating: 4.3, sellerType: 'Particular', seller: 'Ana Torres', sellerPhone: '(813) 555-0141', g1: 'oklch(0.9 0.01 90)', g2: 'oklch(0.75 0.01 90)' },
  { make: 'Nissan', model: 'Rogue', year: 2022, price: 26900, mileage: 19800, type: 'SUV', fuel: 'Gasolina', transmission: 'Automática', city: 'Fort Lauderdale, FL', color: 'Azul Caspio', doors: 4, verified: 1, rating: 4.6, sellerType: 'Concesionario', seller: 'Lauderdale Nissan', sellerPhone: '(954) 555-0188', g1: 'oklch(0.5 0.14 250)', g2: 'oklch(0.35 0.08 260)' },
  { make: 'Mercedes-Benz', model: 'C300', year: 2021, price: 39900, mileage: 27600, type: 'Sedán', fuel: 'Gasolina', transmission: 'Automática', city: 'Miami, FL', color: 'Negro Obsidiana', doors: 4, verified: 1, rating: 4.8, sellerType: 'Concesionario', seller: 'Miami Prestige Motors', sellerPhone: '(305) 555-0175', g1: 'oklch(0.25 0.01 260)', g2: 'oklch(0.15 0.01 260)' },
  { make: 'Porsche', model: '718 Cayman', year: 2020, price: 58900, mileage: 16700, type: 'Deportivo', fuel: 'Gasolina', transmission: 'Manual', city: 'Naples, FL', color: 'Amarillo Racing', doors: 2, verified: 1, rating: 4.9, sellerType: 'Concesionario', seller: 'Naples Sports Cars', sellerPhone: '(239) 555-0119', g1: 'oklch(0.85 0.18 95)', g2: 'oklch(0.7 0.16 80)' },
];

const insert = db.prepare(`
  INSERT INTO cars (make, model, year, price, mileage, type, fuel, transmission, city, color, doors, verified, rating, seller_type, seller, seller_phone, g1, g2)
  VALUES (@make, @model, @year, @price, @mileage, @type, @fuel, @transmission, @city, @color, @doors, @verified, @rating, @sellerType, @seller, @sellerPhone, @g1, @g2)
`);

const insertAll = db.transaction((rows) => {
  for (const row of rows) insert.run(row);
});

const existing = db.prepare('SELECT COUNT(*) AS n FROM cars').get().n;
if (existing > 0) {
  console.log(`[veltra] la tabla cars ya tiene ${existing} registros — no se insertó nada. Borra data/veltra.sqlite si quieres re-sembrar desde cero.`);
} else {
  insertAll(cars);
  console.log(`[veltra] se insertaron ${cars.length} autos de ejemplo.`);
}
