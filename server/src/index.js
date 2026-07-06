import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import 'dotenv/config';
import authRoutes from './routes/auth.js';
import carsRoutes from './routes/cars.js';
import purchasesRoutes from './routes/purchases.js';
import adminRoutes from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

if (!process.env.JWT_SECRET) {
  // Nunca un valor fijo: cualquiera que lea el código fuente podría firmar
  // tokens válidos para cualquier usuario. Un secreto aleatorio por arranque
  // sigue sin requerir configuración, pero invalida las sesiones activas
  // cada vez que el proceso se reinicia — por eso conviene fijar JWT_SECRET
  // en server/.env para producción.
  console.warn('[veltra] JWT_SECRET no está definido — generando uno aleatorio para este arranque. Las sesiones no sobrevivirán un reinicio. Define JWT_SECRET en server/.env para producción.');
  process.env.JWT_SECRET = crypto.randomBytes(48).toString('hex');
}

app.use(helmet());
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
