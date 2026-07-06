import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import 'dotenv/config';
import authRoutes from './routes/auth.js';
import carsRoutes from './routes/cars.js';
import purchasesRoutes from './routes/purchases.js';
import adminRoutes from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

if (!process.env.JWT_SECRET) {
  console.warn('[veltra] JWT_SECRET no está definido — usando un valor de desarrollo inseguro. Define JWT_SECRET en server/.env para producción.');
  process.env.JWT_SECRET = 'dev-only-insecure-secret';
}

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/cars', carsRoutes);
app.use('/api/purchases', purchasesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
const clientIndex = path.join(clientDist, 'index.html');
if (fs.existsSync(clientIndex)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(clientIndex);
  });
} else {
  app.get(/^(?!\/api).*/, (req, res) => {
    res.status(503).send('Build del cliente no encontrado. Corre "npm run build --workspace client" o usa "npm run dev" para desarrollo con Vite.');
  });
}

app.listen(PORT, () => {
  console.log(`[veltra] servidor escuchando en http://localhost:${PORT}`);
});
