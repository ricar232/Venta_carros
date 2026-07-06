import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import multer from 'multer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const carPhotosDir = path.join(__dirname, '..', '..', 'uploads', 'cars');
fs.mkdirSync(carPhotosDir, { recursive: true });

const EXT_BY_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, carPhotosDir),
  filename: (req, file, cb) => cb(null, crypto.randomUUID() + EXT_BY_MIME[file.mimetype]),
});

function fileFilter(req, file, cb) {
  if (!EXT_BY_MIME[file.mimetype]) {
    cb(new Error('Formato de imagen no soportado. Usa JPG, PNG o WEBP.'));
    return;
  }
  cb(null, true);
}

export const uploadCarPhotos = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
});
