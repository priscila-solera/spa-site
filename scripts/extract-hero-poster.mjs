#!/usr/bin/env node
/**
 * Extrae el primer frame del video del hero y lo guarda como imagen (poster/fallback).
 * Así no se ve un parpadeo antes de que cargue el video.
 *
 * Requiere ffmpeg instalado: brew install ffmpeg
 * Uso: node scripts/extract-hero-poster.mjs <ruta-al-video.mp4>
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const publicDir = resolve(root, 'public');
const outputPath = resolve(publicDir, 'hero-poster.jpg');

const filePath = process.argv[2];
if (!filePath) {
  console.error('Uso: node scripts/extract-hero-poster.mjs <ruta-al-video.mp4>');
  console.error('Ejemplo: npm run extract-hero-poster -- ~/Downloads/hero-video.mp4');
  process.exit(1);
}

const videoPath = resolve(process.cwd(), filePath);
if (!existsSync(videoPath)) {
  console.error('❌ No se encuentra el archivo:', videoPath);
  process.exit(1);
}

try {
  execSync('ffmpeg -version', { stdio: 'ignore' });
} catch {
  console.error('❌ ffmpeg no está instalado.');
  console.error('   Instálalo con: brew install ffmpeg');
  process.exit(1);
}

if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}

console.log('Extrayendo primer frame...');
execSync(
  `ffmpeg -i "${videoPath}" -vframes 1 -q:v 2 -y "${outputPath}"`,
  { stdio: 'inherit' }
);

console.log('\n✅ Imagen guardada en public/hero-poster.jpg');
console.log('\nPara usarla como poster/fallback del hero, añade a tu .env:');
console.log('PUBLIC_HERO_POSTER=/hero-poster.jpg\n');
