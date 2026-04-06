# Code Quality Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidar colores duplicados en Tailwind, corregir keys en lista del carrito, agregar debounce al evento de booking, y reemplazar data-astro-reload con navigate() en LanguagePicker.

**Architecture:** Cambios quirurgicos. El useReducer para CalBookingOverlay se omite de este plan por su alto riesgo de regresion — es una refactorizacion de React compleja que merece su propio ciclo. Los demas cambios son seguros y de bajo riesgo.

**Tech Stack:** Astro 5, React 19, Tailwind CSS 3, astro:transitions

---

### Task 1: Consolidar colores duplicados en tailwind.config.mjs

**Files:**
- Modify: `tailwind.config.mjs`
- Verify: `src/` (buscar usos de `brandGold`)

- [ ] **Step 1: Verificar todos los usos de brandGold en el codebase**

```bash
grep -rn "brandGold" src/
```

Anotar cada archivo y linea que usa `brandGold`.

- [ ] **Step 2: Reemplazar brandGold por gold-DEFAULT en cada archivo**

`brandGold` es `#b8956e`, igual que `gold.DEFAULT`. Para reemplazar, en cada archivo encontrado cambiar `brandGold` por `gold-DEFAULT` (en Tailwind, `gold.DEFAULT` se usa como `text-gold` / `bg-gold` / `border-gold`).

Ejemplo: si el archivo tiene `hover:border-brandGold/50`, cambiarlo a `hover:border-gold/50`.

Hacer el reemplazo en todos los archivos encontrados en el paso 1.

- [ ] **Step 3: Eliminar brandGold de tailwind.config.mjs**

En `tailwind.config.mjs`, eliminar la linea:
```js
brandGold: '#b8956e', // Nude/arena (CTAs y acentos)
```

- [ ] **Step 4: Verificar que el build no tiene clases no encontradas**

```bash
npm run build 2>&1 | grep -i "warn\|error"
```

- [ ] **Step 5: Verificar visualmente que los colores no cambiaron**

```bash
npm run dev
```

Revisar los elementos que usaban `brandGold`. El color debe ser identico (`#b8956e`).

- [ ] **Step 6: Commit**

```bash
git add tailwind.config.mjs src/
git commit -m "refactor: consolidate brandGold into gold-DEFAULT in Tailwind config"
```

---

### Task 2: Corregir keys en lista del carrito en CalBookingOverlay.tsx

**Files:**
- Modify: `src/components/CalBookingOverlay.tsx`

- [ ] **Step 1: Encontrar las keys con indice en el carrito**

```bash
grep -n "key.*index\|key.*idx\|\`\${.*}-\${i" src/components/CalBookingOverlay.tsx
```

- [ ] **Step 2: Localizar el renderizado del carrito cerca de la linea 615**

Leer las lineas 605-640 del archivo:

```bash
sed -n '605,640p' src/components/CalBookingOverlay.tsx
```

- [ ] **Step 3: Reemplazar el patron de key con indice por key unica**

El patron actual es similar a:
```tsx
{cart.map((line, i) => (
  <div key={`${line.serviceId}-${i}`}>
```

Reemplazar con:
```tsx
{cart.map((line) => (
  <div key={line.serviceId}>
```

Si `line.serviceId` puede repetirse en el carrito (mismo servicio dos veces), usar una combinacion unica como `line.serviceId + '-' + line.therapistId` o similar sin usar el indice.

- [ ] **Step 4: Verificar que el carrito funciona correctamente**

```bash
npm run dev
```

Abrir el booking overlay, agregar servicios al carrito, verificar que no hay warnings de React en la consola sobre keys.

- [ ] **Step 5: Commit**

```bash
git add src/components/CalBookingOverlay.tsx
git commit -m "fix: replace array index keys with unique service IDs in cart list"
```

---

### Task 3: Agregar debounce al evento open-cal-booking en BaseLayout.astro

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Localizar el event listener de open-cal-booking**

En `src/layouts/BaseLayout.astro`, cerca de la linea 106:

```js
document.body.addEventListener('click', function(e) {
  var btn = e.target && e.target.closest && e.target.closest('[data-cal-link]');
  if (!btn) return;
  var link = btn.getAttribute('data-cal-link');
  if (!link || typeof link !== 'string') return;
  var serviceId = btn.getAttribute('data-service-id') || null;
  e.preventDefault();
  e.stopPropagation();
  window.dispatchEvent(new CustomEvent('open-cal-booking', {
    detail: {
      calLink: link.trim(),
      serviceId: serviceId || undefined,
    }
  }));
}, true);
```

- [ ] **Step 2: Agregar debounce guard**

Reemplazar el script completo con:

```js
document.body.addEventListener('click', function(e) {
  var btn = e.target && e.target.closest && e.target.closest('[data-cal-link]');
  if (!btn) return;
  var link = btn.getAttribute('data-cal-link');
  if (!link || typeof link !== 'string') return;

  // Debounce: evitar disparos multiples en 300ms
  if (btn._calDebounce) return;
  btn._calDebounce = true;
  setTimeout(function() { btn._calDebounce = false; }, 300);

  var serviceId = btn.getAttribute('data-service-id') || null;
  e.preventDefault();
  e.stopPropagation();
  window.dispatchEvent(new CustomEvent('open-cal-booking', {
    detail: {
      calLink: link.trim(),
      serviceId: serviceId || undefined,
    }
  }));
}, true);
```

- [ ] **Step 3: Verificar que el booking overlay se abre normalmente**

```bash
npm run dev
```

Hacer click en cualquier boton de reserva. El overlay debe abrirse una sola vez incluso al hacer click rapido multiple.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "fix: add 300ms debounce guard to open-cal-booking event listener"
```

---

### Task 4: Reemplazar data-astro-reload con navigate() en LanguagePicker

**Files:**
- Modify: `src/components/LanguagePicker.astro`

Nota: Este task depende de que el Task 3 del Plan de Accesibilidad ya haya sido completado (el script de LanguagePicker fue reescrito ahi). Si no se ejecuto antes, aplicar este cambio sobre el script original.

- [ ] **Step 1: Verificar la version actual de LanguagePicker.astro**

Leer el archivo actual para ver si ya tiene el script actualizado del plan de accesibilidad.

- [ ] **Step 2: Reemplazar data-astro-reload con navigate() en los links**

En el template de `LanguagePicker.astro`, los `<a>` tienen `data-astro-reload`. Reemplazar:

```astro
{Object.entries(languages).map(([id, name]) => (
  <li>
    <a
      href={tpath('/', id)}
      data-astro-reload
      class:list={[...]}
    >
      {name}
    </a>
  </li>
))}
```

Por (agregar `data-lang-link` para identificarlos en el script, remover `data-astro-reload`):

```astro
{Object.entries(languages).map(([id, name]) => (
  <li>
    <a
      href={tpath('/', id)}
      data-lang-link
      class:list={[...]}
    >
      {name}
    </a>
  </li>
))}
```

- [ ] **Step 3: Agregar navigate() al script**

Al inicio del `<script>` de LanguagePicker, agregar el import y el handler de click:

```ts
import { navigate } from 'astro:transitions/client';

// ... despues de declarar toggle, menu, items:

menu?.querySelectorAll('[data-lang-link]').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const href = (link as HTMLAnchorElement).href;
    navigate(href);
    closeMenu();
  });
});
```

- [ ] **Step 4: Verificar que el cambio de idioma mantiene las View Transitions**

```bash
npm run dev
```

Cambiar de ES a EN usando el picker. La navegacion debe tener la animacion de View Transitions en lugar de un reload completo de pagina.

- [ ] **Step 5: Verificar que el mobile menu tambien use navigate()**

En `src/components/Navbar.astro`, los links de idioma del menu mobile tambien tienen `data-astro-reload`. Aplicar el mismo patron:

Buscar en Navbar.astro:
```astro
<a
  href={translatePath('/', id)}
  data-astro-reload
```

Reemplazar `data-astro-reload` con un `data-lang-link` y manejar el click con `navigate()` en el script del Navbar:

```js
import { navigate } from 'astro:transitions/client';

document.querySelectorAll('[data-lang-link]').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navigate((link as HTMLAnchorElement).href);
  });
});
```

- [ ] **Step 6: Commit**

```bash
git add src/components/LanguagePicker.astro src/components/Navbar.astro
git commit -m "fix: replace data-astro-reload with navigate() to preserve View Transitions"
```
