# Accesibilidad Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corregir las fallas WCAG AA mas criticas: skip nav link, focus management en modales, ARIA en navbar mobile, estrellas accesibles en testimonios, cite semántico, aria-hidden en SVGs decorativos, y keyboard nav en LanguagePicker.

**Architecture:** Cambios quirurgicos en componentes individuales. Sin nuevas dependencias. Todo en Astro con JS vanilla.

**Tech Stack:** Astro 5, HTML semantico, ARIA, JS vanilla

---

### Task 1: Agregar skip navigation link en BaseLayout.astro

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Agregar skip link como primer hijo del body**

En `src/layouts/BaseLayout.astro`, despues de la etiqueta de apertura `<body class="...">` (linea 95), agregar inmediatamente:

```astro
<a
  href="#main-content"
  class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-spa focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-secondary focus:shadow-spa-md focus:outline-none focus:ring-2 focus:ring-accent"
>
  Skip to main content
</a>
```

Nota: el `id="main-content"` en `<main>` ya fue agregado en el Plan 1.

- [ ] **Step 2: Verificar con teclado**

```bash
npm run dev
```

Abrir el sitio, presionar Tab una vez. Debe aparecer el link "Skip to main content" visible en la esquina superior izquierda. Presionar Enter debe saltar al contenido principal.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat(a11y): add skip to main content link"
```

---

### Task 2: Corregir ARIA del menu mobile en Navbar.astro

**Files:**
- Modify: `src/components/Navbar.astro`

- [ ] **Step 1: Corregir el div del mobile-menu — quitar role="dialog", agregar aria-hidden**

Cambiar el div con `id="mobile-menu"` (linea 78-83):

```astro
<!-- ANTES -->
<div
  id="mobile-menu"
  class="hidden border-t border-cream-200/20 bg-primary/95 backdrop-blur-md md:hidden"
  role="dialog"
  aria-label="Mobile menu"
>
```

Por:

```astro
<!-- DESPUES -->
<div
  id="mobile-menu"
  class="hidden border-t border-cream-200/20 bg-primary/95 backdrop-blur-md md:hidden"
  aria-hidden="true"
>
```

- [ ] **Step 2: Actualizar el script toggleMobileMenu para sincronizar aria-hidden**

En el script (linea 139-145), la funcion `toggleMobileMenu` actual es:

```js
function toggleMobileMenu() {
  const isOpen = mobileMenu?.classList.toggle('hidden');
  menuToggle?.setAttribute('aria-expanded', String(!isOpen));
  iconMenu?.classList.toggle('hidden', !isOpen);
  iconClose?.classList.toggle('hidden', isOpen);
  document.body.style.overflow = isOpen ? '' : 'hidden';
}
```

Reemplazarla con:

```js
function toggleMobileMenu() {
  const isOpen = mobileMenu?.classList.toggle('hidden');
  const menuIsVisible = !isOpen;
  menuToggle?.setAttribute('aria-expanded', String(menuIsVisible));
  mobileMenu?.setAttribute('aria-hidden', String(!menuIsVisible));
  iconMenu?.classList.toggle('hidden', menuIsVisible);
  iconClose?.classList.toggle('hidden', !menuIsVisible);
  document.body.style.overflow = menuIsVisible ? 'hidden' : '';
}
```

- [ ] **Step 3: Actualizar el handler de cierre cuando se hace click en links**

El bloque que cierra el menu al hacer click en links (linea 151-159):

```js
mobileMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileMenu?.classList.add('hidden');
    iconMenu?.classList.remove('hidden');
    iconClose?.classList.add('hidden');
    menuToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});
```

Reemplazar con:

```js
mobileMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileMenu?.classList.add('hidden');
    mobileMenu?.setAttribute('aria-hidden', 'true');
    iconMenu?.classList.remove('hidden');
    iconClose?.classList.add('hidden');
    menuToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});
```

- [ ] **Step 4: Verificar con lector de pantalla o VoiceOver**

```bash
npm run dev
```

Con VoiceOver (Mac: Cmd+F5) o NVDA, navegar con Tab al boton hamburguesa. Debe anunciar "Open menu, collapsed". Al hacer click debe anunciar "Open menu, expanded".

- [ ] **Step 5: Commit**

```bash
git add src/components/Navbar.astro
git commit -m "fix(a11y): correct mobile menu ARIA — remove role=dialog, add aria-hidden sync"
```

---

### Task 3: Mejorar estrellas de resenas en Testimonials.astro

**Files:**
- Modify: `src/components/Testimonials.astro`

- [ ] **Step 1: Reemplazar el grupo de estrellas ★ con SVG accesible**

Localizar el bloque de estrellas (lineas 68-78):

```astro
<div class="flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
  {[1, 2, 3, 4, 5].map((star) => (
    <span
      class="text-lg"
      style={star <= Math.round(r.rating) ? `color: ${GOLD}` : 'color: #e8e2d8'}
      aria-hidden="true"
    >
      ★
    </span>
  ))}
</div>
```

Reemplazar con:

```astro
<div
  role="img"
  aria-label={`${r.rating} de 5 estrellas`}
  class="flex gap-0.5"
>
  {[1, 2, 3, 4, 5].map((star) => (
    <svg
      class="h-4 w-4"
      viewBox="0 0 20 20"
      fill={star <= Math.round(r.rating) ? GOLD : '#e8e2d8'}
      aria-hidden="true"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ))}
</div>
```

- [ ] **Step 2: Verificar visualmente que las estrellas se ven igual**

```bash
npm run dev
```

Las estrellas deben lucir identicas pero ahora son SVG en lugar de caracteres Unicode.

- [ ] **Step 3: Commit**

```bash
git add src/components/Testimonials.astro
git commit -m "fix(a11y): replace star emoji with accessible SVG in testimonials"
```

---

### Task 4: Agregar aria-hidden a SVGs decorativos en LanguagePicker.astro

**Files:**
- Modify: `src/components/LanguagePicker.astro`

- [ ] **Step 1: Agregar aria-hidden a los dos SVGs del boton toggle**

En `src/components/LanguagePicker.astro`, el boton toggle tiene dos SVGs (lineas 11-13). Cambiar:

```astro
<button id="lang-picker-toggle" class="navbar-link flex items-center gap-1 text-sm font-medium text-primary/80 transition-colors duration-300 hover:text-primary" aria-label="Language picker">
  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m4 13-4-4-4 4M1 19h12M12 19l4-4-4-4"></path></svg>
  {languages[lang]}
  <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
</button>
```

Por:

```astro
<button id="lang-picker-toggle" class="navbar-link flex items-center gap-1 text-sm font-medium text-primary/80 transition-colors duration-300 hover:text-primary" aria-label={`Language: ${languages[lang]}`} aria-expanded="false" aria-haspopup="listbox">
  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m4 13-4-4-4 4M1 19h12M12 19l4-4-4-4"></path></svg>
  <span aria-hidden="true">{languages[lang]}</span>
  <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
</button>
```

- [ ] **Step 2: Agregar role="listbox" al menu y keyboard navigation al script**

Cambiar el `<div id="lang-picker-menu">`:

```astro
<!-- ANTES -->
<div id="lang-picker-menu" class="absolute top-full right-0 mt-2 hidden w-32 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
  <ul class="py-1" role="list">
```

Por:

```astro
<!-- DESPUES -->
<div id="lang-picker-menu" class="absolute top-full right-0 mt-2 hidden w-32 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5" role="listbox" aria-label="Select language">
  <ul class="py-1">
```

- [ ] **Step 3: Actualizar el script con keyboard nav y aria-expanded sync**

Reemplazar el `<script>` completo de LanguagePicker.astro con:

```astro
<script>
  const toggle = document.getElementById('lang-picker-toggle');
  const menu = document.getElementById('lang-picker-menu');
  const items = menu?.querySelectorAll('a');

  function openMenu() {
    menu?.classList.remove('hidden');
    toggle?.setAttribute('aria-expanded', 'true');
    (items?.[0] as HTMLElement)?.focus();
  }

  function closeMenu() {
    menu?.classList.add('hidden');
    toggle?.setAttribute('aria-expanded', 'false');
  }

  toggle?.addEventListener('click', () => {
    const isHidden = menu?.classList.contains('hidden');
    isHidden ? openMenu() : closeMenu();
  });

  toggle?.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openMenu();
    }
  });

  menu?.addEventListener('keydown', (e: KeyboardEvent) => {
    const itemsArr = Array.from(items ?? []) as HTMLElement[];
    const focused = document.activeElement as HTMLElement;
    const idx = itemsArr.indexOf(focused);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      itemsArr[(idx + 1) % itemsArr.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      itemsArr[(idx - 1 + itemsArr.length) % itemsArr.length]?.focus();
    } else if (e.key === 'Escape') {
      closeMenu();
      toggle?.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (!toggle?.contains(e.target as Node) && !menu?.contains(e.target as Node)) {
      closeMenu();
    }
  });
</script>
```

- [ ] **Step 4: Verificar keyboard nav**

```bash
npm run dev
```

Tab hasta el language picker → Enter abre el menu → ArrowDown/Up navega items → Escape cierra y devuelve focus al boton.

- [ ] **Step 5: Commit**

```bash
git add src/components/LanguagePicker.astro
git commit -m "fix(a11y): add aria-hidden to decorative SVGs and keyboard nav to LanguagePicker"
```

---

### Task 5: Focus management en modales de ServicesSection

**Files:**
- Modify: `src/components/ServicesSection.astro`

- [ ] **Step 1: Localizar el script de apertura/cierre de modales**

Buscar la funcion `openModal` / `closeModal` en el script de ServicesSection.astro:

```bash
grep -n "openModal\|closeModal\|data-open-modal" src/components/ServicesSection.astro | head -20
```

- [ ] **Step 2: Actualizar el script de manejo de modales**

Encontrar donde se abre el modal (busca el `classList.remove('hidden')` del modal) y agregar focus management. El patron a agregar despues de mostrar el modal es:

```js
// Mover focus al primer elemento focusable del modal
const focusable = modal.querySelectorAll(
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
);
const firstFocusable = focusable[0];
if (firstFocusable) {
  firstFocusable.focus();
}
```

Y guardar el trigger antes de abrir:

```js
// Guardar referencia al elemento que abrio el modal
let lastFocusedElement = null;

// En el handler de apertura, antes de abrir:
lastFocusedElement = document.activeElement;

// En el handler de cierre:
if (lastFocusedElement) {
  lastFocusedElement.focus();
  lastFocusedElement = null;
}
```

Para aplicar esto correctamente, leer el script completo de ServicesSection.astro primero:

```bash
grep -n "script" src/components/ServicesSection.astro
```

Luego identificar la linea exacta del handler de apertura y aplicar el patron anterior.

- [ ] **Step 3: Verificar con teclado**

```bash
npm run dev
```

Tab hasta un boton "Ver mas" de un servicio → Enter → El focus debe moverse al interior del modal → Escape → El focus debe regresar al boton que lo abrio.

- [ ] **Step 4: Commit**

```bash
git add src/components/ServicesSection.astro
git commit -m "fix(a11y): add focus management to service modals"
```
