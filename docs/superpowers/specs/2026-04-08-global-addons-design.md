# Global Add-ons Design

**Goal:** All add-ons appear on every service automatically, without having to assign them service by service.

---

## Architecture

Remove the per-service `addons` reference array from the `service` schema. Fetch all `addon` documents globally in `fetchServices` and inject the same list into every service. No frontend changes required.

## Changes

### 1. `schema/service.js`

Remove the `addons` field entirely from the `fields` array:

```js
// DELETE this entire block:
{
  name: 'addons',
  title: 'Add-ons Disponibles',
  type: 'array',
  of: [{ type: 'reference', to: [{ type: 'addon' }] }],
  description: 'Selecciona los add-ons que se pueden añadir a este servicio.',
},
```

Existing `addons` data on service documents in Sanity is silently ignored once the field is removed from the schema — no data loss, no errors.

### 2. `src/lib/sanity.js` — SERVICES_QUERY

Remove the `addons` projection from the GROQ query:

```groq
// DELETE this block from SERVICES_QUERY:
"addons": addons[]->{
  _id,
  "title": coalesce(title[$lang], title.en),
  "slug": slug.current,
  price,
  "description": coalesce(description[$lang], description.en)
},
```

### 3. `src/lib/sanity.js` — ADDONS_QUERY (new)

Add a new constant for fetching all add-ons globally:

```js
const ADDONS_QUERY = `*[_type == "addon"] | order(coalesce(order, 0) asc) {
  _id,
  "title": coalesce(title[$lang], title.en),
  "slug": slug.current,
  price,
  "description": coalesce(description[$lang], description.en)
}`;
```

Note: the `addon` schema does not currently have an `order` field. `coalesce(order, 0)` handles this gracefully — all addons sort stably until an `order` field is added.

### 4. `src/lib/sanity.js` — fetchServices

Fetch addons globally alongside services, then inject into every service:

```js
// Fetch both in parallel
const [docs, addonDocs] = await Promise.all([
  client.fetch(SERVICES_QUERY, { lang }),
  client.fetch(ADDONS_QUERY, { lang }),
]);

const globalAddons = Array.isArray(addonDocs) ? addonDocs.map(addon => ({
  id: addon._id,
  title: addon.title,
  slug: addon.slug,
  price: addon.price,
  description: addon.description,
})) : [];
```

Then in the `.map()` over services, replace the per-service addons with `globalAddons`:

```js
// BEFORE:
addons: doc.addons ? doc.addons.map(addon => ({ ... })) : [],

// AFTER:
addons: globalAddons,
```

## Behavior

| Action in Sanity Studio | Result |
|---|---|
| Add a new addon document | Appears in all services immediately |
| Edit an addon's title or price | Updates across all services |
| Delete an addon document | Disappears from all services |

## Out of Scope

- Per-service addon exclusions
- Ordering field on `addon` schema (can be added later)
