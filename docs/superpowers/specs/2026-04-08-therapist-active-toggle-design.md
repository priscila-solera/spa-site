# Therapist Active Toggle

**Goal:** Allow enabling/disabling a therapist globally from Sanity Studio with a single toggle, removing them from all services at once without editing each service individually.

---

## Architecture

The `therapist` Sanity document gains an `active` boolean field (default `true`). The `fetchServices` function in `sanity.js` reads that flag via the GROQ query and filters out inactive therapists before building `therapistOptions`. No frontend changes required.

## Changes

### 1. `schema/therapist.js`

Add a boolean field `active` after the `order` field:

```js
{
  name: 'active',
  title: 'Terapeuta activo',
  type: 'boolean',
  description: 'Desactiva para ocultar este terapeuta en todos los servicios.',
  initialValue: true,
}
```

### 2. `src/lib/sanity.js` — GROQ query

The current `therapistBooking` projection resolves the therapist reference but does not include `active`. Change:

```groq
therapistBooking[]{
  "therapistId": therapist._ref,
  "name": therapist->name,
  "calLink": calLink,
  "order": therapist->order
}
```

To:

```groq
therapistBooking[]{
  "therapistId": therapist._ref,
  "name": therapist->name,
  "calLink": calLink,
  "order": therapist->order,
  "active": therapist->active
}
```

### 3. `src/lib/sanity.js` — filter in `fetchServices`

Change the filter from:

```js
.filter((row) => row?.therapistId && row?.calLink)
```

To:

```js
.filter((row) => row?.therapistId && row?.calLink && row?.active !== false)
```

`!== false` means therapists without an `active` field (existing records created before this change) are treated as active by default.

## Behavior

| `active` field value | Result |
|---|---|
| `true` (or not set) | Therapist appears in all services |
| `false` | Therapist hidden from all services immediately on next page load |

## Out of Scope

- Per-service override (disabling a therapist for only some services)
- UI indicator on the website showing a therapist is unavailable
- Scheduling/date-based availability
