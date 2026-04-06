# Site Improvements Design — Blue Royale Spa
**Date:** 2026-04-05  
**Status:** Approved  
**Approach:** 6 independent branches, one per area

---

## Overview

Full-site improvement pass covering bugs, SEO, accessibility, performance, code quality, and contact form. Each area is an independent branch that can be reviewed and deployed separately.

---

## Area 1: Bugs Criticos

### Files affected
- `src/layouts/BaseLayout.astro`
- `src/layouts/Layout.astro` (delete)
- `src/pages/404.astro` (create)

### Changes

**Race condition scroll reset (`BaseLayout.astro` lines 71-93)**  
Remove the 3 competing scroll reset methods. Keep only the `astro:after-swap` listener with a single `window.scrollTo(0, 0)`. Remove `history.scrollRestoration = 'manual'` and the `DOMContentLoaded` listener.

**Syntax error in fallback scroll reveal (`BaseLayout.astro` lines 246-250)**  
Remove the dead code block that calls `querySelectorAll` on the wrong object.

**Unused `Layout.astro`**  
Delete the file entirely.

**Missing 404 page**  
Create `src/pages/404.astro` with the site's visual design, a message in both languages (detect via URL prefix `/es/`), and a link back to the homepage.

---

## Area 2: SEO

### Files affected
- `src/components/SEO.astro`
- `src/pages/en/cita.astro` (create)
- `src/pages/servicios/[slug].astro`
- `astro.config.mjs`

### Changes

**Hreflang tags (`SEO.astro`)**  
Add dynamically-generated hreflang links based on the current URL:
```html
<link rel="alternate" hreflang="en" href="{en_url}" />
<link rel="alternate" hreflang="es" href="{es_url}" />
<link rel="alternate" hreflang="x-default" href="{en_url}" />
```
SEO component receives `lang` and `slug` props to compute alternate URLs.

**Missing English booking confirmation page**  
Create `src/pages/en/cita.astro` as the English equivalent of `src/pages/cita.astro`. Mirror the structure and use English translations.

**Canonical URL on service detail pages**  
`[slug].astro` passes `canonicalUrl={Astro.url.href}` explicitly to the SEO component.

**`og:locale:alternate`**  
Add `<meta property="og:locale:alternate" content="{alternate_locale}" />` in `SEO.astro`.

**JSON-LD Service schema on service pages**  
`[slug].astro` constructs and passes a `Service` JSON-LD object to `SEO.astro`:
```json
{
  "@type": "Service",
  "name": "...",
  "description": "...",
  "provider": { "@type": "LocalBusiness", "name": "Blue Royale Spa" }
}
```

---

## Area 3: Accesibilidad

### Files affected
- `src/layouts/BaseLayout.astro`
- `src/components/ServicesSection.astro`
- `src/components/Navbar.astro`
- `src/components/Testimonials.astro`
- `src/components/LanguagePicker.astro`

### Changes

**Skip navigation link (`BaseLayout.astro`)**  
Add as first child of `<body>`:
```html
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-white px-4 py-2 rounded">
  Skip to content
</a>
```
Add `id="main-content"` to the `<main>` element.

**Focus management in service modals (`ServicesSection.astro`)**  
- On open: move focus to first focusable element inside the modal.
- On close: return focus to the trigger button that opened the modal.
- Store trigger reference as `data-trigger-id` on the modal.

**Navbar mobile ARIA (`Navbar.astro`)**  
- Add `aria-expanded` (true/false) to the hamburger button.
- Add `aria-hidden` (true/false) to the mobile menu panel.
- Change `role="dialog"` to no role (it's navigation, not a dialog).

**Review stars (`Testimonials.astro`)**  
Replace `★` emoji characters with an SVG star icon group that has:
```html
<span role="img" aria-label="5 de 5 estrellas">
  <!-- 5x SVG star -->
</span>
```

**`<cite>` in testimonials (`Testimonials.astro`)**  
Wrap author attribution in `<footer><cite>...</cite></footer>` inside the `<blockquote>`.

**`aria-hidden="true"` on decorative SVGs**  
Add to all decorative SVG icons in `LanguagePicker.astro` and other components where SVGs are presentational only.

**Keyboard navigation in LanguagePicker (`LanguagePicker.astro`)**  
Add `keydown` listener: ArrowDown/ArrowUp to navigate items, Enter to select, Escape to close.

---

## Area 4: Performance

### Files affected
- `src/components/ExperienceSection.astro`
- `src/components/BookingFormSection.astro`
- `src/components/ReasonsSection.astro`
- `src/layouts/BaseLayout.astro`

### Changes

**Unsplash images → Astro `<Image>` component**  
Replace raw `<img src="https://images.unsplash.com/...">` with `<Image>` from `astro:assets` in all three components. Add `?w=800&q=80&auto=format&fit=crop` params to Unsplash URLs for responsive sizes.

**`prefers-reduced-motion` in scroll reveal (`BaseLayout.astro` lines 212-252)**  
Wrap the IntersectionObserver initialization:
```js
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReduced) {
  document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('visible'));
} else {
  // existing IntersectionObserver setup
}
```

**Cache parallax selector (`BaseLayout.astro`)**  
Move `document.querySelectorAll('[data-parallax]')` outside the scroll handler. Currently re-queried on every scroll event.

**`loading="lazy"` on below-fold images**  
Add `loading="lazy"` to all `<img>` tags that are not in the hero/above-the-fold section.

---

## Area 5: Code Quality

### Files affected
- `tailwind.config.mjs`
- `src/components/CalBookingOverlay.tsx`
- `src/components/LanguagePicker.astro`
- `src/layouts/BaseLayout.astro`

### Changes

**Consolidate Tailwind colors (`tailwind.config.mjs`)**  
Remove `brandGold` and `accent` keys — both are `#b8956e`, same as `gold.500`. Update all component references from `text-brandGold` / `bg-accent` to `text-gold-500` / `bg-gold-500`.

**`useReducer` in CalBookingOverlay (`CalBookingOverlay.tsx`)**  
Replace the 11 related `useState` calls (step, cart, addons, selectedServiceId, etc.) with a single `useReducer`:
```ts
type Action =
  | { type: 'SELECT_SERVICE'; id: string }
  | { type: 'ADD_TO_CART'; item: CartItem }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESET' }

const [state, dispatch] = useReducer(bookingReducer, initialState);
```

**Fix cart item keys (`CalBookingOverlay.tsx` line ~615)**  
Change `key={\`${serviceId}-${index}\`}` to `key={line.serviceId}`.

**`navigate()` in LanguagePicker (`LanguagePicker.astro`)**  
Replace `data-astro-reload` attribute with an `onclick` handler using `import { navigate } from 'astro:transitions/client'` to preserve View Transitions.

**Debounce booking button (`BaseLayout.astro`)**  
Add a 300ms debounce guard on the `open-cal-booking` event listener to prevent multiple rapid dispatches.

---

## Area 6: Formulario de Contacto

### Files affected
- `src/pages/api/contact.ts` (create)
- `src/components/BookingFormSection.astro`
- `.env.example`

### Changes

**API endpoint (`src/pages/api/contact.ts`)**  
Astro API route (requires `output: 'server'` or hybrid). Logic:
1. Parse `FormData` from POST body: `name`, `email`, `service`, `message`, `website` (honeypot).
2. If `website` field has a value → return `200` silently (spam trap).
3. Validate required fields → return `400` with error message if missing.
4. Send email via Resend API using `RESEND_API_KEY` env var to `CONTACT_EMAIL`.
5. Return `{ success: true }` on success, `{ error: "..." }` on failure.

**Frontend (`BookingFormSection.astro`)**  
- Remove `mailto:` action from form.
- Add `id` to form element.
- Add inline JS `submit` handler:
  - Show loading state on button (spinner + disabled).
  - `fetch('/api/contact', { method: 'POST', body: new FormData(form) })`.
  - On success: show inline success message, reset form.
  - On error: show inline error message, re-enable button.
- Add honeypot field: `<input name="website" tabindex="-1" autocomplete="off" style="display:none" />`.

**New env vars**  
Add to `.env.example`:
```
RESEND_API_KEY=re_...
CONTACT_EMAIL=info@blueroyalespa.com
```

**`astro.config.mjs`**  
If not already set, add `output: 'hybrid'` to allow server-side API routes alongside static pages.

---

## Implementation Order

1. `fix/bugs-criticos` — unblocks stable base for all other work
2. `fix/seo` — independent, high production value
3. `fix/accesibilidad` — independent
4. `fix/performance` — independent
5. `fix/code-quality` — independent
6. `feat/formulario-contacto` — requires Resend account setup

---

## Out of Scope

- Service worker / PWA
- Full font subsetting
- Analytics goal tracking
- Full WCAG AAA compliance (color contrast AAA)
