#!/usr/bin/env node
/**
 * Busca un lugar por nombre con Places API (New) y muestra el Place ID.
 * Uso: node scripts/find-place-id.mjs [ "Blue Royale Spa, Tamarindo, Costa Rica" ]
 * Necesita PUBLIC_GOOGLE_PLACES_API_KEY en .env
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const envPath = resolve(root, '.env');

let apiKey = process.env.PUBLIC_GOOGLE_PLACES_API_KEY;
if (!apiKey) {
  try {
    const env = readFileSync(envPath, 'utf8');
    const line = env.split('\n').find((l) => l.startsWith('PUBLIC_GOOGLE_PLACES_API_KEY='));
    if (line) apiKey = line.replace(/^PUBLIC_GOOGLE_PLACES_API_KEY=/, '').replace(/^["']|["']$/g, '').trim();
  } catch (_) {}
}

if (!apiKey) {
  console.error('❌ Falta PUBLIC_GOOGLE_PLACES_API_KEY en .env');
  process.exit(1);
}

const textQuery = process.argv[2] || 'Blue Royale Spa, Tamarindo, Costa Rica';

const url = 'https://places.googleapis.com/v1/places:searchText';
const res = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': apiKey,
    'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress',
  },
  body: JSON.stringify({ textQuery }),
});

if (!res.ok) {
  console.error('❌ Error API:', res.status, await res.text());
  process.exit(1);
}

const data = await res.json();
const places = data.places || [];

if (places.length === 0) {
  console.log('No se encontraron resultados para:', textQuery);
  process.exit(0);
}

const place = places[0];
// El ID puede venir como "places/ChIJ..." o "ChIJ..."
const rawId = place.id || '';
const placeId = rawId.replace(/^places\//, '');

console.log('\n✅ Lugar encontrado:\n');
console.log('  Nombre:', place.displayName?.text || '-');
console.log('  Dirección:', place.formattedAddress || '-');
console.log('\n  Place ID (para .env):');
console.log('  PUBLIC_GOOGLE_PLACE_ID="' + placeId + '"\n');
