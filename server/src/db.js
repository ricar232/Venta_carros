import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data', 'veltra.sqlite');

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    password_hash TEXT NOT NULL,
    seller_type TEXT NOT NULL DEFAULT 'Particular',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    price INTEGER NOT NULL,
    mileage INTEGER NOT NULL,
    type TEXT NOT NULL,
    fuel TEXT NOT NULL,
    transmission TEXT NOT NULL,
    city TEXT NOT NULL,
    color TEXT NOT NULL,
    doors INTEGER NOT NULL,
    verified INTEGER NOT NULL DEFAULT 0,
    rating REAL NOT NULL DEFAULT 0,
    seller_type TEXT NOT NULL,
    seller TEXT NOT NULL,
    seller_phone TEXT,
    g1 TEXT NOT NULL,
    g2 TEXT NOT NULL,
    owner_user_id INTEGER REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id INTEGER NOT NULL REFERENCES users(id),
    buyer_id INTEGER NOT NULL REFERENCES users(id),
    car_make TEXT NOT NULL,
    car_model TEXT NOT NULL,
    score INTEGER,
    rated_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Migración aditiva: nunca se recrea ni se borra veltra.sqlite, así que las
// columnas nuevas se agregan a mano y solo si todavía no existen.
const carsColumns = db.prepare("PRAGMA table_info(cars)").all().map((c) => c.name);
if (!carsColumns.includes('photos')) {
  db.exec('ALTER TABLE cars ADD COLUMN photos TEXT');
}

const usersColumns = db.prepare("PRAGMA table_info(users)").all().map((c) => c.name);
if (!usersColumns.includes('status')) {
  db.exec("ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'pending'");
}
if (!usersColumns.includes('role')) {
  db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'");
}

// Si ADMIN_EMAIL apunta a una cuenta que ya existía (registrada antes de fijar
// esa variable, o antes de que existiera el sistema de roles), la promovemos
// acá en cada arranque — el registro nuevo ya lo hace solo, pero esto cubre
// cuentas previas sin necesitar un script aparte.
if (process.env.ADMIN_EMAIL) {
  db.prepare("UPDATE users SET role = 'admin', status = 'approved' WHERE lower(email) = lower(?)").run(process.env.ADMIN_EMAIL);
}
