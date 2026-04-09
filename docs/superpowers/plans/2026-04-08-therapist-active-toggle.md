# Therapist Active Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a global `active` toggle to the `therapist` Sanity document so disabling one therapist removes them from all services at once.

**Architecture:** Add `active: boolean` field to the Sanity `therapist` schema. Expand the GROQ query to fetch `therapist->active` in `therapistBooking`. Filter out rows where `active === false` when building `therapistOptions` in `fetchServices`.

**Tech Stack:** Sanity Studio (schema JS), GROQ, JavaScript

---

### Task 1: Add `active` field to therapist schema

**Files:**
- Modify: `schema/therapist.js`

- [ ] **Step 1: Add the `active` field after the `order` field**

In `schema/therapist.js`, the `fields` array currently ends with the `order` field. Add the `active` field right after it:

```js
{
  name: 'order',
  title: 'Orden',
  type: 'number',
  description: 'Orden de aparición al elegir terapeuta (menor primero).',
  initialValue: 0,
},
{
  name: 'active',
  title: 'Terapeuta activo',
  type: 'boolean',
  description: 'Desactiva para ocultar este terapeuta en todos los servicios.',
  initialValue: true,
},
```

- [ ] **Step 2: Verify the schema file looks correct**

Full `schema/therapist.js` should be:

```js
export const therapistSchema = {
  name: 'therapist',
  title: 'Terapeuta',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Nombre',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'image',
      title: 'Foto',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'order',
      title: 'Orden',
      type: 'number',
      description: 'Orden de aparición al elegir terapeuta (menor primero).',
      initialValue: 0,
    },
    {
      name: 'active',
      title: 'Terapeuta activo',
      type: 'boolean',
      description: 'Desactiva para ocultar este terapeuta en todos los servicios.',
      initialValue: true,
    },
  ],
  orderings: [
    { title: 'Orden manual', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'name', media: 'image' },
  },
};
```

- [ ] **Step 3: Commit**

```bash
git add schema/therapist.js
git commit -m "feat: add active toggle field to therapist schema"
```

---

### Task 2: Update GROQ query and filter in sanity.js

**Files:**
- Modify: `src/lib/sanity.js`

- [ ] **Step 1: Add `active` to the `therapistBooking` projection in `SERVICES_QUERY`**

Find this block in `SERVICES_QUERY` (lines 49-54):

```js
"therapistBooking": therapistBooking[]{
  "therapistId": therapist->_id,
  "order": coalesce(therapist->order, 0),
  "name": therapist->name,
  calLink
},
```

Replace it with:

```js
"therapistBooking": therapistBooking[]{
  "therapistId": therapist->_id,
  "order": coalesce(therapist->order, 0),
  "name": therapist->name,
  "active": therapist->active,
  calLink
},
```

- [ ] **Step 2: Update the filter in `fetchServices`**

Find this line (line 89):

```js
.filter((row) => row?.therapistId && row?.calLink)
```

Replace it with:

```js
.filter((row) => row?.therapistId && row?.calLink && row?.active !== false)
```

`!== false` ensures that existing therapist documents without the `active` field yet are treated as active by default.

- [ ] **Step 3: Commit**

```bash
git add src/lib/sanity.js
git commit -m "feat: filter inactive therapists from service options via active flag"
```

---

### Task 3: Verify in Sanity Studio and production

- [ ] **Step 1: Open Sanity Studio and confirm the toggle appears**

Run the studio locally or open the deployed studio. Navigate to a Terapeuta document. Confirm the "Terapeuta activo" toggle is visible with a default value of `true`.

- [ ] **Step 2: Disable a therapist and confirm they disappear from the site**

1. Set `active` to `false` on one therapist and save.
2. Run `npm run dev` locally (or check the deployed site after `git push`).
3. Open a service that had that therapist — they should no longer appear in the therapist selection step of the booking flow.

- [ ] **Step 3: Re-enable the therapist and confirm they reappear**

Set `active` back to `true`, save, refresh — the therapist should reappear.

- [ ] **Step 4: Push to production**

```bash
git push
```
