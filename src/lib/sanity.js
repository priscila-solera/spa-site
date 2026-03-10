/**
 * Cliente de Sanity para el sitio Blue Royale Spa.
 * Usa variables de entorno: PUBLIC_SANITY_PROJECT_ID y PUBLIC_SANITY_DATASET.
 */
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID ?? '';
const dataset = import.meta.env.PUBLIC_SANITY_DATASET ?? 'production';
const apiVersion = import.meta.env.PUBLIC_SANITY_API_VERSION ?? '2024-01-01';

let _client = null;
function getClient() {
  if (!projectId) return null;
  if (!_client) _client = createClient({ projectId, dataset, apiVersion, useCdn: true });
  return _client;
}
/** Cliente de Sanity (solo creado si hay PUBLIC_SANITY_PROJECT_ID). */
export function getSanityClient() {
  return getClient();
}

const builder = getClient() ? imageUrlBuilder(getClient()) : null;

export function urlFor(source) {
  const dummy = { width: () => dummy, format: () => dummy, quality: () => dummy, url: () => '' };
  if (!builder || source == null || typeof source !== 'object') return dummy;
  try {
    return builder.image(source);
  } catch {
    return dummy;
  }
}

export { projectId, dataset, apiVersion };

// Consulta GROQ dinámica que selecciona el idioma
// Ordenamos primero por el orden de la categoría, luego por el orden del servicio
const SERVICES_QUERY = `*[_type == "service"] | order(category->order asc, order asc) {
  _id,
  "title": coalesce(title[$lang], title.en),
  "shortDescription": coalesce(shortDescription[$lang], shortDescription.en),
  "description": coalesce(description[$lang], description.en),
  price,
  duration, // Duración directa, sin traducción
  image,
  "imageAlt": coalesce(imageAlt[$lang], imageAlt.en),
  calLink,
  "category": category->{
    "title": coalesce(title[$lang], title.en),
    order
  },
  "addons": addons[]->{
    _id,
    "title": coalesce(title[$lang], title.en),
    "slug": slug.current,
    price,
    "description": coalesce(description[$lang], description.en)
  },
  order
  // ctaLabel eliminado de la consulta
}`;

/**
 * Obtiene los servicios desde Sanity en el idioma especificado.
 * @param {import('@sanity/image-url').ImageUrlBuilder} urlForBuilder
 * @param {string} lang - Código de idioma ('en' o 'es')
 */
export async function fetchServices(urlForBuilder, lang = 'en') {
  const client = getSanityClient();
  if (!client) return null;
  try {
    const docs = await client.fetch(SERVICES_QUERY, { lang });
    if (!Array.isArray(docs) || docs.length === 0) return null;
    const defaultImage = 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80';
    return docs.map((doc) => {
      const imgSrc =
        doc.image && typeof doc.image === 'object' && doc.image !== null
          ? urlForBuilder(doc.image).width(800).format('webp').quality(80).url()
          : defaultImage;
      return {
        id: doc._id,
        title: doc.title ?? '',
        shortDescription: doc.shortDescription ?? null,
        description: doc.description ?? '',
        image: imgSrc,
        imageAlt: doc.imageAlt ?? doc.title ?? 'Service',
        order: doc.order ?? 0,
        calLink: doc.calLink,
        ctaLabel: null, // Dejamos que el frontend use el default
        price: doc.price,
        duration: doc.duration,
        category: doc.category ? { title: doc.category.title, order: doc.category.order } : { title: 'General', order: 999 },
        addons: doc.addons ? doc.addons.map(addon => ({
          id: addon._id,
          title: addon.title,
          slug: addon.slug,
          price: addon.price,
          description: addon.description
        })) : [],
      };
    });
  } catch {
    return null;
  }
}
