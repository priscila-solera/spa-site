#!/usr/bin/env node
/**
 * Sube el video del hero a Vercel Blob y muestra la URL.
 * Uso: node scripts/upload-hero-video.mjs <ruta-al-video.mp4>
 *
 * Requiere BLOB_READ_WRITE_TOKEN en .env (crear Blob store en Vercel → Storage).
 */

import { put } from '@vercel/blob';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Cargar .env desde la raíz del proyecto (cuando se ejecuta con npm run)
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  const env = readFileSync(envPath, 'utf8');
  for (const line of env.split('\n')) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match) {
      const value = match[2].replace(/^["']|["']$/g, '').trim();
      if (!process.env[match[1]]) process.env[match[1]] = value;
    }
  }
}

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error('❌ Falta BLOB_READ_WRITE_TOKEN en el entorno.');
  console.error('   Crea un Blob store en tu proyecto Vercel (Storage) y añade el token a .env');
  process.exit(1);
}

const filePath = process.argv[2];
if (!filePath) {
  console.error('Uso: node scripts/upload-hero-video.mjs <ruta-al-video.mp4>');
  process.exit(1);
}

const absolutePath = resolve(process.cwd(), filePath);
let buffer;
try {
  buffer = readFileSync(absolutePath);
} catch (err) {
  console.error('❌ No se pudo leer el archivo:', filePath, err.message);
  process.exit(1);
}

const name = filePath.split(/[/\\]/).pop() || 'hero.mp4';
const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
console.log(`Subiendo ${name} (${sizeMB} MB)...`);

const blob = await put(`hero/${name}`, buffer, {
  access: 'public',
  addRandomSuffix: false,
  ...(buffer.length > 4.5 * 1024 * 1024 && { multipart: true }),
});

console.log('\n✅ Video subido. Añade esta URL a tu .env:\n');
console.log(`PUBLIC_HERO_VIDEO=${blob.url}\n`);
