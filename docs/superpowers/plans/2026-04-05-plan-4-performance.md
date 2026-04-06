# Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Optimizar imagenes Unsplash con parametros correctos, respetar prefers-reduced-motion en scroll reveal, cachear selector de parallax, y agregar loading="lazy" a imagenes below-fold.

**Architecture:** Cambios de imagenes con parametros de URL ya que son externas (no podemos usar el componente Image de Astro con URLs remotas arbitrarias sin configuracion). Cambios de JS puro en BaseLayout.astro.

**Tech Stack:** Astro 5, Unsplash API params, CSS prefers-reduced-motion

---

### Task 1: Optimizar parametros de imagenes Unsplash

**Files:**
- Modify: `src/components/BookingFormSection.astro`
- Modify: `src/components/ExperienceSection.astro` (si tiene imagenes Unsplash)
- Modify: `src/components/ReasonsSection.astro` (si tiene imagenes Unsplash)

- [ ] **Step 1: Verificar imagenes Unsplash en los componentes**

```bash
grep -rn "unsplash.com" src/components/
```

Esto mostrara todas las URLs de Unsplash en uso con su numero de linea.

- [ ] **Step 2: Actualizar imagen en BookingFormSection.astro**

La imagen en `src/components/BookingFormSection.astro` linea 126:

```astro
<!-- ANTES -->
<img
  src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=1200&q=80&auto=format&fit=crop"
  alt="Detail of hands receiving spa treatment with essential oils."
  class="h-full w-full object-cover"
  loading="lazy"
/>
```

La imagen ya tiene parametros buenos y `loading="lazy"`. Verificar que el `w=1200` sea apropiado — para un panel que ocupa la mitad del layout (`lg:grid-cols-2`), `w=800` es suficiente y mas eficiente:

```astro
<!-- DESPUES -->
<img
  src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80&auto=format&fit=crop"
  alt="Detail of hands receiving spa treatment with essential oils."
  class="h-full w-full object-cover"
  loading="lazy"
  decoding="async"
/>
```

- [ ] **Step 3: Actualizar imagenes Unsplash en ExperienceSection y ReasonsSection**

Para cada imagen Unsplash encontrada en el paso 1, aplicar el patron:
- Agregar `?w=800&q=80&auto=format&fit=crop` si no tiene parametros (o ajustar los existentes)
- Agregar `loading="lazy"` si no esta presente
- Agregar `decoding="async"`

Ejemplo del patron para cualquier imagen below-fold:
```astro
<img
  src="https://images.unsplash.com/photo-XXXXXXXXXX?w=800&q=80&auto=format&fit=crop"
  alt="[descripcion existente]"
  class="[clases existentes]"
  loading="lazy"
  decoding="async"
/>
```

- [ ] **Step 4: Build y verificar en Network tab**

```bash
npm run build && npm run preview
```

Abrir DevTools → Network → filtrar por `img`. Las imagenes Unsplash deben tener el parametro `w=800` en la URL. Las imagenes below-fold deben mostrar estado "pending" hasta hacer scroll.

- [ ] **Step 5: Commit**

```bash
git add src/components/BookingFormSection.astro src/components/ExperienceSection.astro src/components/ReasonsSection.astro
git commit -m "perf: optimize Unsplash image params and add lazy loading"
```

---

### Task 2: Respetar prefers-reduced-motion en scroll reveal

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Localizar el script de scroll reveal**

El script de scroll reveal esta cerca de la linea 212 en BaseLayout.astro. El bloque completo es:

```js
(function () {
  try {
    var nodes = Array.prototype.slice.call(
      document.querySelectorAll('[data-scroll-reveal]')
    );
    if (!nodes.length) return;
    // ... resto del script
```

- [ ] **Step 2: Agregar check de prefers-reduced-motion al inicio del IIFE**

Reemplazar el inicio del script (la primera parte del try block) con:

```js
(function () {
  try {
    var nodes = Array.prototype.slice.call(
      document.querySelectorAll('[data-scroll-reveal]')
    );
    if (!nodes.length) return;

    // Si el usuario prefiere menos movimiento, mostrar todo sin animacion
    var prefersReduced = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

    if (prefersReduced) {
      nodes.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    // ... continua el resto igual (setProperty de delay, IntersectionObserver, etc.)
```

El resto del script (nodes.forEach con delay, el IntersectionObserver) queda intacto.

- [ ] **Step 3: Verificar con prefers-reduced-motion activado**

En Chrome DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`.

```bash
npm run dev
```

Con la emulacion activa, los elementos `[data-scroll-reveal]` deben ser visibles inmediatamente sin animacion al cargar la pagina.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "fix(perf): respect prefers-reduced-motion in scroll reveal"
```

---

### Task 3: Cachear el selector del parallax fuera del scroll handler

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Localizar el problema**

En el script de parallax (cerca de linea 142), la funcion `update()` tiene:

```js
function update() {
  layers = layers.filter(function (el) { return el && el.isConnected; });
```

El array `layers` ya esta declarado fuera (linea 128):
```js
var layers = Array.prototype.slice.call(
  document.querySelectorAll('[data-parallax]')
);
```

Esto esta bien — el querySelectorAll ya esta fuera del handler. El `filter` dentro de `update()` es necesario para limpiar elementos desconectados. No hay cambio necesario aqui.

- [ ] **Step 2: Verificar que el viewport se recalcula solo en resize, no en scroll**

Confirmar que `readViewport()` solo se llama en:
1. El listener de `resize` (linea 200)
2. La llamada inicial (linea 205)

NO en el scroll handler. Si esta en el scroll handler, moverlo fuera. En el codigo actual esto ya es correcto.

- [ ] **Step 3: Agregar `will-change: transform` a elementos con parallax via CSS**

En `src/styles/global.css`, agregar:

```css
[data-parallax] {
  will-change: transform;
}
```

Esto le indica al browser que prepare la GPU para estos elementos, mejorando el rendimiento del parallax.

- [ ] **Step 4: Verificar que no hay jank en scroll**

```bash
npm run dev
```

Abrir DevTools → Performance → Grabar mientras scrolleas. Los frames deben mantenerse en 60fps o cerca. No debe haber "long tasks" rojas en el timeline.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css
git commit -m "perf: add will-change: transform to parallax elements"
```

---

### Task 4: Agregar loading="lazy" sistematicamente a imagenes below-fold

**Files:**
- Modify: `src/components/ServicesSection.astro`
- Modify: Otros componentes que se identifiquen

- [ ] **Step 1: Encontrar todas las imagenes sin loading="lazy"**

```bash
grep -rn "<img" src/components/ | grep -v 'loading='
```

Esto lista las imagenes que no tienen el atributo `loading`.

- [ ] **Step 2: Agregar loading="lazy" y decoding="async" a cada imagen below-fold**

Para cada imagen encontrada que NO sea la imagen hero principal o la primera imagen visible above-the-fold, agregar:

```astro
<img
  src="..."
  alt="..."
  class="..."
  loading="lazy"
  decoding="async"
/>
```

Imagenes que NO deben tener `loading="lazy"` (above-the-fold):
- La imagen del hero (`src/components/Hero.astro`)
- El poster del video hero

- [ ] **Step 3: Build y verificar**

```bash
npm run build
```

```bash
grep -rn "loading=" dist/ | grep -v lazy | grep "img src" | head -10
```

Solo la imagen hero debe aparecer sin `loading="lazy"`.

- [ ] **Step 4: Commit**

```bash
git add src/components/
git commit -m "perf: add loading=lazy and decoding=async to below-fold images"
```
