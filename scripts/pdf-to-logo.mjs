#!/usr/bin/env node
/**
 * Convierte la primera página de un PDF a PNG para usar como logo en el header.
 * Requiere poppler: brew install poppler
 * Uso: node scripts/pdf-to-logo.mjs <ruta-al.pdf>
 */

import { execSync, execFileSync } from 'child_process';
import { existsSync, renameSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const publicDir = resolve(root, 'public');
const outputPath = resolve(publicDir, 'logo.png');

const filePath = process.argv[2];
if (!filePath) {
  console.error('Uso: node scripts/pdf-to-logo.mjs <ruta-al.pdf>');
  console.error('Ejemplo: npm run pdf-to-logo -- "/ruta/logo-2023.pdf"');
  process.exit(1);
}

const pdfPath = filePath.startsWith('/') ? filePath : resolve(process.cwd(), filePath);
if (!existsSync(pdfPath)) {
  console.error('❌ No se encuentra el archivo:', pdfPath);
  process.exit(1);
}

try {
  execSync('pdftoppm -v', { stdio: 'ignore' });
} catch {
  console.error('❌ pdftoppm no está instalado (parte de poppler).');
  console.error('   Instálalo con: brew install poppler');
  process.exit(1);
}

// pdftoppm genera logo-temp-1.png (una imagen por página)
const tempBase = resolve(publicDir, 'logo-temp');
execFileSync('pdftoppm', ['-png', '-r', '300', '-f', '1', '-l', '1', pdfPath, tempBase], {
  stdio: 'inherit',
});

const generated = resolve(publicDir, 'logo-temp-1.png');
if (existsSync(generated)) {
  renameSync(generated, outputPath);
  console.log('\n✅ Logo guardado en public/logo.png');
} else {
  console.error('❌ No se generó la imagen. Revisa que el PDF sea válido.');
  process.exit(1);
}
