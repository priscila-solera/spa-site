# Bugs Criticos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar la race condition de scroll, el error de sintaxis en el fallback, el archivo Layout.astro sin uso, y agregar una pagina 404 personalizada.

**Architecture:** Cambios quirurgicos en BaseLayout.astro para simplificar el scroll reset a un unico metodo. Eliminar Layout.astro. Crear 404.astro con diseno consistente al sitio.

**Tech Stack:** Astro 5, Tailwind CSS, View Transitions API

---

### Task 1: Simplificar scroll reset en BaseLayout.astro

**Files:**
- Modify: `src/layouts/BaseLayout.astro:70-93`

- [ ] **Step 1: Reemplazar el bloque de scroll reset (lineas 70-93)**

El bloque actual tiene 3 metodos competidores. Reemplazarlo con uno solo:

```astro
<script is:inline>
  // Restaurar scroll al inicio en cada navegacion con View Transitions
  document.addEventListener('astro:after-swap', () => {
    window.scrollTo(0, 0);
  });
</script>
```

El bloque que hay que reemplazar empieza en la linea 70 con `<script is:inline>` y termina en la linea 93 con `</script>`. El contenido a reemplazar es:

```js
// Forzar scroll al inicio de manera agresiva y persistente
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

const forceScrollTop = () => {
  window.scrollTo(0, 0);
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
};

forceScrollTop();

document.addEventListener('DOMContentLoaded', forceScrollTop);
window.addEventListener('load', () => {
  forceScrollTop();
  // Un último intento después de un breve retraso para asegurar
  setTimeout(forceScrollTop, 10);
});

// Manejar también las transiciones de vista de Astro
document.addEventListener('astro:after-swap', forceScrollTop);
```

- [ ] **Step 2: Verificar en dev que la navegacion no salta**

```bash
npm run dev
```

Navegar entre paginas usando los links del navbar. La pagina debe iniciar desde arriba sin saltos ni parpadeos.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "fix: simplify scroll reset to single astro:after-swap listener"
```

---

### Task 2: Eliminar codigo muerto del fallback scroll reveal

**Files:**
- Modify: `src/layouts/BaseLayout.astro:243-252`

- [ ] **Step 1: Localizar y eliminar el bloque catch defectuoso**

En el bloque `<script is:inline>` del scroll reveal (cerca de la linea 243), el bloque `catch` contiene:

```js
} catch (_) {
  // Si algo falla, simplemente mostramos todo sin animación.
  document
    .querySelectorAll
    ?.('[data-scroll-reveal]')
    .forEach(function (el) {
      el.classList.add('is-visible');
    });
}
```

Reemplazarlo con:

```js
} catch (_) {
  // Si algo falla, mostramos todo sin animación.
  var fallbackNodes = document.querySelectorAll('[data-scroll-reveal]');
  for (var i = 0; i < fallbackNodes.length; i++) {
    fallbackNodes[i].classList.add('is-visible');
  }
}
```

- [ ] **Step 2: Verificar que el sitio carga sin errores en consola**

```bash
npm run dev
```

Abrir DevTools → Console. No debe haber errores de JavaScript al cargar la pagina.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "fix: correct querySelectorAll usage in scroll reveal fallback"
```

---

### Task 3: Eliminar Layout.astro sin uso

**Files:**
- Delete: `src/layouts/Layout.astro`

- [ ] **Step 1: Verificar que ningún archivo importa Layout.astro**

```bash
grep -r "layouts/Layout" src/
```

Resultado esperado: sin output (ningún archivo lo importa).

- [ ] **Step 2: Eliminar el archivo**

```bash
rm src/layouts/Layout.astro
```

- [ ] **Step 3: Build para confirmar que no hay error**

```bash
npm run build
```

Resultado esperado: build exitoso sin errores.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove unused Layout.astro"
```

---

### Task 4: Crear pagina 404 personalizada

**Files:**
- Create: `src/pages/404.astro`

- [ ] **Step 1: Crear la pagina 404**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getLangFromUrl } from '../i18n/utils';

const lang = getLangFromUrl(Astro.url);
const isEs = lang === 'es';
---

<BaseLayout
  title={isEs ? 'Página no encontrada | Blue Royale Spa' : 'Page not found | Blue Royale Spa'}
  description={isEs ? 'La página que buscas no existe.' : 'The page you are looking for does not exist.'}
  lang={lang}
>
  <section class="flex min-h-[80vh] flex-col items-center justify-center px-4 py-24 text-center">
    <p class="editorial-subtitle mb-4">404</p>
    <h1 class="section-heading mb-6">
      {isEs ? 'Página no encontrada' : 'Page not found'}
    </h1>
    <p class="mx-auto max-w-md text-base text-beige-600 leading-relaxed">
      {isEs
        ? 'Lo sentimos, la página que buscas no existe o fue movida.'
        : 'Sorry, the page you are looking for does not exist or has been moved.'}
    </p>
    <a
      href={isEs ? '/es/' : '/'}
      class="mt-10 inline-flex items-center justify-center rounded-full border border-accent bg-accent px-8 py-3 text-sm font-medium text-white shadow-spa transition-all duration-300 hover:bg-accent/90"
    >
      {isEs ? 'Volver al inicio' : 'Back to home'}
    </a>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Verificar la pagina 404**

```bash
npm run dev
```

Navegar a `http://localhost:4321/pagina-que-no-existe`. Debe mostrarse la pagina 404 con el diseno del sitio.

- [ ] **Step 3: Commit**

```bash
git add src/pages/404.astro
git commit -m "feat: add custom 404 page with bilingual support"
```

---

### Task 5: Agregar `id="main-content"` al elemento main (prerequisito para accesibilidad)

**Files:**
- Modify: `src/layouts/BaseLayout.astro:99`

- [ ] **Step 1: Agregar id al main**

Cambiar la linea 99 de:
```astro
<main class="relative">
```
a:
```astro
<main id="main-content" class="relative">
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "fix: add id=main-content to main element for skip nav"
```
