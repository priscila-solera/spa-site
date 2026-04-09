# Global Add-ons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all add-ons appear on every service automatically by fetching them globally instead of per-service.

**Architecture:** Remove the `addons` reference array from the `service` Sanity schema. Add a global `ADDONS_QUERY` in `sanity.js` and fetch it in parallel with `SERVICES_QUERY`. Inject the same global addon list into every service in `fetchServices`.

**Tech Stack:** Sanity Studio (schema JS), GROQ, JavaScript

---

### Task 1: Remove `addons` field from service schema

**Files:**
- Modify: `schema/service.js`

- [ ] **Step 1: Delete the `addons` field from `schema/service.js`**

Find and remove this entire block from the `fields` array:

```js
{
  name: 'addons',
  title: 'Add-ons Disponibles',
  type: 'array',
  of: [{ type: 'reference', to: [{ type: 'addon' }] }],
  description: 'Selecciona los add-ons que se pueden añadir a este servicio.',
},
```

The resulting `fields` array should go directly from the `calLink` field to the `therapistBooking` field:

```js
{
  name: 'calLink',
  title: 'Enlace Cal.com (por defecto)',
  type: 'string',
  description:
    'Si no hay filas en "Reserva por terapeuta", se usa este enlace. Formato: usuario/evento.',
},
{
  name: 'therapistBooking',
  title: 'Reserva por terapeuta',
  // ...rest unchanged
},
```

- [ ] **Step 2: Commit**

```bash
git add schema/service.js
git commit -m "feat: remove per-service addons field from service schema"
```

---

### Task 2: Update `sanity.js` — remove addons from query, add global fetch

**Files:**
- Modify: `src/lib/sanity.js`

- [ ] **Step 1: Remove the `addons` projection from `SERVICES_QUERY`**

Find and delete this block from `SERVICES_QUERY` (currently after the `category` projection):

```groq
"addons": addons[]->{
  _id,
  "title": coalesce(title[$lang], title.en),
  "slug": slug.current,
  price,
  "description": coalesce(description[$lang], description.en)
},
```

- [ ] **Step 2: Add `ADDONS_QUERY` constant right after `SERVICES_QUERY`**

Add this immediately after the closing backtick of `SERVICES_QUERY`:

```js
const ADDONS_QUERY = `*[_type == "addon"] | order(coalesce(order, 0) asc) {
  _id,
  "title": coalesce(title[$lang], title.en),
  "slug": slug.current,
  price,
  "description": coalesce(description[$lang], description.en)
}`;
```

- [ ] **Step 3: Update `fetchServices` to fetch addons in parallel**

Replace the current single fetch:

```js
const docs = await client.fetch(SERVICES_QUERY, { lang });
if (!Array.isArray(docs) || docs.length === 0) return null;
```

With a parallel fetch:

```js
const [docs, addonDocs] = await Promise.all([
  client.fetch(SERVICES_QUERY, { lang }),
  client.fetch(ADDONS_QUERY, { lang }),
]);
if (!Array.isArray(docs) || docs.length === 0) return null;
const globalAddons = Array.isArray(addonDocs)
  ? addonDocs.map((addon) => ({
      id: addon._id,
      title: addon.title,
      slug: addon.slug,
      price: addon.price,
      description: addon.description,
    }))
  : [];
```

- [ ] **Step 4: Replace per-service addons with `globalAddons` in the `.map()`**

Find and replace this block inside `docs.map((doc) => ({ ... }))`:

```js
// REMOVE:
addons: doc.addons ? doc.addons.map(addon => ({
  id: addon._id,
  title: addon.title,
  slug: addon.slug,
  price: addon.price,
  description: addon.description
})) : [],
```

Replace with:

```js
addons: globalAddons,
```

- [ ] **Step 5: Verify the full `fetchServices` function looks correct**

The complete updated function should be:

```js
export async function fetchServices(urlForBuilder, lang = 'en') {
  const client = getSanityClient();
  if (!client) return null;
  try {
    const [docs, addonDocs] = await Promise.all([
      client.fetch(SERVICES_QUERY, { lang }),
      client.fetch(ADDONS_QUERY, { lang }),
    ]);
    if (!Array.isArray(docs) || docs.length === 0) return null;
    const globalAddons = Array.isArray(addonDocs)
      ? addonDocs.map((addon) => ({
          id: addon._id,
          title: addon.title,
          slug: addon.slug,
          price: addon.price,
          description: addon.description,
        }))
      : [];
    const defaultImage = 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80';
    return docs.map((doc) => {
      const imgSrc =
        doc.image && typeof doc.image === 'object' && doc.image !== null
          ? urlForBuilder(doc.image).width(800).format('webp').quality(80).url()
          : defaultImage;
      const therapistRows = Array.isArray(doc.therapistBooking) ? doc.therapistBooking : [];
      const therapistOptions = therapistRows
        .filter((row) => row?.therapistId && row?.calLink && row?.active !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((row) => ({
          id: row.therapistId,
          name: row.name ?? '',
          calLink: row.calLink,
        }));
      return {
        id: doc._id,
        title: doc.title ?? '',
        shortDescription: doc.shortDescription ?? null,
        description: doc.description ?? '',
        image: imgSrc,
        imageAlt: doc.imageAlt ?? doc.title ?? 'Service',
        order: doc.order ?? 0,
        calLink: doc.calLink,
        therapistOptions,
        ctaLabel: null,
        price: doc.price,
        duration: doc.duration,
        category: doc.category ? { title: doc.category.title, order: doc.category.order } : { title: 'General', order: 999 },
        addons: globalAddons,
      };
    });
  } catch {
    return null;
  }
}
```

- [ ] **Step 6: Run build to verify no errors**

```bash
npm run build
```

Expected output ends with:
```
[build] Complete!
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/sanity.js
git commit -m "feat: fetch add-ons globally and inject into all services"
```

---

### Task 3: Push and verify in production

- [ ] **Step 1: Push to production**

```bash
git push
```

- [ ] **Step 2: Verify in the site**

Open any service in the booking flow. All add-ons should appear in the add-ons step regardless of which service was selected.

- [ ] **Step 3: Verify adding a new addon in Sanity Studio**

Create a new `addon` document in Sanity Studio. Reload the site — the new addon should appear in every service's add-ons step automatically.
