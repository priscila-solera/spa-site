/**
 * Fetch de reseñas de Google Places API (Place Details) para el negocio.
 * Uso: build-time en Testimonials.astro. Caché por placeId para evitar llamadas repetidas en el mismo build.
 */

const MIN_STARS = 4;
const FIELD_MASK = 'displayName,reviews,googleMapsUri';

/** @type {Map<string, { reviews: import('./googlePlaces.js').GoogleReview[]; placeName: string; placeUrl: string } | null>} */
const cache = new Map();

/**
 * @typedef {{
 *   authorName: string;
 *   profilePhotoUrl: string | null;
 *   rating: number;
 *   text: string;
 *   relativeTime: string | null;
 * }} GoogleReview
 */

/**
 * Obtiene las reseñas del negocio desde Google Places API (v1).
 * Solo se devuelven reseñas de 4 y 5 estrellas.
 * Resultado cacheado por placeId durante el proceso (build).
 *
 * @param {string} placeId - Place ID de Google (ej. ChIJ...).
 * @param {string} [apiKey] - API Key de Google Cloud (Places API habilitada). Por defecto: PUBLIC_GOOGLE_PLACES_API_KEY.
 * @returns {Promise<{ reviews: Array<{ authorName: string; profilePhotoUrl: string | null; rating: number; text: string; relativeTime: string | null }>; placeName: string; placeUrl: string } | null>}
 */
export async function getPlaceReviews(placeId, apiKey) {
  const key = apiKey ?? (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_GOOGLE_PLACES_API_KEY) ?? '';
  const cacheKey = `${placeId}:${key}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  if (!placeId || !key) {
    cache.set(cacheKey, null);
    return null;
  }
  const placeIdClean = placeId.replace(/^places\//, '');
  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeIdClean)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': FIELD_MASK,
      },
    });
    if (!res.ok) {
      cache.set(cacheKey, null);
      return null;
    }
    const data = await res.json();
    const rawReviews = Array.isArray(data.reviews) ? data.reviews : [];
    const reviews = rawReviews
      .filter((r) => typeof r.rating === 'number' && r.rating >= MIN_STARS)
      .map((r) => ({
        authorName:
          r.authorAttribution?.displayName ?? 'Anónimo',
        profilePhotoUrl: r.authorAttribution?.photoUri ?? null,
        rating: r.rating,
        text: typeof r.text === 'string' ? r.text : (r.text?.text ?? ''),
        relativeTime: r.relativePublishTimeDescription ?? null,
      }));
    const placeName = data.displayName?.text ?? 'Google Maps';
    const placeUrl = data.googleMapsUri ?? `https://www.google.com/maps/place/?q=place_id:${placeIdClean}`;
    const result = { reviews, placeName, placeUrl };
    cache.set(cacheKey, result);
    return result;
  } catch {
    cache.set(cacheKey, null);
    return null;
  }
}
