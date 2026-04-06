# Formulario de Contacto Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el mailto: del formulario de contacto con un endpoint real en Vercel usando Resend para envio de emails, con honeypot anti-spam y estados de loading/error inline.

**Architecture:** Astro API Route en `src/pages/api/contact.ts` (output hybrid). El formulario hace fetch al endpoint. Resend envia el email al spa. Honeypot oculto para spam basico.

**Tech Stack:** Astro 5 (hybrid output), Resend API, TypeScript

**Prerequisito:** Necesitas una cuenta en resend.com y una API key. El dominio `blueroyalespa.com` debe estar verificado en Resend para enviar desde ese dominio.

---

### Task 1: Instalar Resend y configurar output hybrid

**Files:**
- Modify: `astro.config.mjs`
- Modify: `package.json` (via npm install)
- Create: `.env.example` additions

- [ ] **Step 1: Instalar Resend**

```bash
npm install resend
```

- [ ] **Step 2: Agregar output hybrid a astro.config.mjs**

Cambiar:
```js
export default defineConfig({
  site: 'https://www.blueroyalespa.com',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    react(),
    sitemap(),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: { prefixDefaultLocale: false },
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
```

Por:
```js
export default defineConfig({
  site: 'https://www.blueroyalespa.com',
  output: 'hybrid',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    react(),
    sitemap(),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: { prefixDefaultLocale: false },
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
```

- [ ] **Step 3: Agregar variables al .env.example**

Verificar si existe el archivo:
```bash
ls .env.example 2>/dev/null || echo "no existe"
```

Si no existe, crearlo. Si existe, agregar al final:

```
# Resend (contact form)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
CONTACT_EMAIL=info@blueroyalespa.com
```

- [ ] **Step 4: Agregar las variables a tu .env local**

```bash
# Agregar en tu archivo .env local (no commitearlo)
echo "RESEND_API_KEY=tu_api_key_aqui" >> .env
echo "CONTACT_EMAIL=info@blueroyalespa.com" >> .env
```

- [ ] **Step 5: Verificar que el build sigue funcionando**

```bash
npm run build
```

Resultado esperado: build exitoso con `output: hybrid`.

- [ ] **Step 6: Commit**

```bash
git add astro.config.mjs .env.example package.json package-lock.json
git commit -m "feat: add hybrid output and resend dependency for contact form API"
```

---

### Task 2: Crear el endpoint API de contacto

**Files:**
- Create: `src/pages/api/contact.ts`

- [ ] **Step 1: Crear el archivo del endpoint**

Crear `src/pages/api/contact.ts` con el siguiente contenido:

```typescript
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // Parsear FormData
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const nombre = formData.get('nombre')?.toString().trim() ?? '';
  const servicio = formData.get('servicio')?.toString().trim() ?? '';
  const horario = formData.get('horario')?.toString().trim() ?? '';
  const mensaje = formData.get('mensaje')?.toString().trim() ?? '';
  const website = formData.get('website')?.toString() ?? ''; // honeypot

  // Honeypot: si viene con valor, es spam — responder 200 silenciosamente
  if (website) {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validacion de campos requeridos
  if (!nombre) {
    return new Response(JSON.stringify({ error: 'El nombre es requerido.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = import.meta.env.RESEND_API_KEY;
  const contactEmail = import.meta.env.CONTACT_EMAIL ?? 'blueroyalespa@gmail.com';

  if (!apiKey) {
    console.error('RESEND_API_KEY no configurado');
    return new Response(JSON.stringify({ error: 'Error de configuracion del servidor.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const resend = new Resend(apiKey);

  const emailHtml = `
    <h2>Nueva consulta desde Blue Royale Spa</h2>
    <p><strong>Nombre:</strong> ${nombre}</p>
    <p><strong>Servicio de interés:</strong> ${servicio || 'No especificado'}</p>
    <p><strong>Horario preferido:</strong> ${horario || 'No especificado'}</p>
    <p><strong>Notas:</strong> ${mensaje || 'Ninguna'}</p>
  `;

  try {
    await resend.emails.send({
      from: 'Blue Royale Spa <noreply@blueroyalespa.com>',
      to: contactEmail,
      subject: `Consulta de ${nombre} — ${servicio || 'Servicio general'}`,
      html: emailHtml,
      replyTo: undefined,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error enviando email:', err);
    return new Response(JSON.stringify({ error: 'No se pudo enviar el mensaje. Intenta de nuevo.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

- [ ] **Step 2: Verificar que el endpoint no da error de TypeScript**

```bash
npm run build
```

Resultado esperado: sin errores de TypeScript en `src/pages/api/contact.ts`.

- [ ] **Step 3: Probar el endpoint con curl**

```bash
npm run dev
```

En otra terminal:
```bash
curl -X POST http://localhost:4321/api/contact \
  -F "nombre=Test User" \
  -F "servicio=Masaje" \
  -F "horario=10am" \
  -F "mensaje=Hola test"
```

Resultado esperado: `{"success":true}` y el email debe llegar a la direccion configurada en `CONTACT_EMAIL`.

- [ ] **Step 4: Probar honeypot**

```bash
curl -X POST http://localhost:4321/api/contact \
  -F "nombre=Spammer" \
  -F "website=http://spam.com"
```

Resultado esperado: `{"success":true}` (spam silenciado, sin email enviado).

- [ ] **Step 5: Commit**

```bash
git add src/pages/api/contact.ts
git commit -m "feat: add /api/contact endpoint with Resend and honeypot spam protection"
```

---

### Task 3: Actualizar BookingFormSection.astro para usar el endpoint

**Files:**
- Modify: `src/components/BookingFormSection.astro`

- [ ] **Step 1: Agregar campo honeypot y id al form**

En `src/components/BookingFormSection.astro`, el `<form>` tiene `id="booking-form"`. Agregar el honeypot antes del boton de submit (dentro del form, antes del cierre de `</form>`):

```astro
{/* Honeypot anti-spam — oculto visualmente y para screen readers */}
<input
  type="text"
  name="website"
  tabindex="-1"
  autocomplete="off"
  aria-hidden="true"
  style="position: absolute; left: -9999px; opacity: 0; pointer-events: none;"
/>
```

- [ ] **Step 2: Agregar el div de estado (success/error) despues del form**

Justo despues del cierre de la etiqueta `</form>` (linea 112), agregar:

```astro
<div id="form-status" role="alert" aria-live="polite" class="hidden mt-4 rounded-spa border px-4 py-3 text-sm"></div>
```

- [ ] **Step 3: Reemplazar el script completo del formulario**

El `<script>` actual (lineas 136-164) usa `mailto:`. Reemplazarlo completamente con:

```astro
<script>
  const form = document.getElementById('booking-form') as HTMLFormElement | null;
  const statusDiv = document.getElementById('form-status') as HTMLDivElement | null;
  const submitBtn = form?.querySelector('button[type="submit"]') as HTMLButtonElement | null;

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!submitBtn || !statusDiv) return;

    // Estado loading
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
      Enviando...
    `;
    statusDiv.className = 'hidden mt-4 rounded-spa border px-4 py-3 text-sm';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: new FormData(form),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        statusDiv.className = 'mt-4 rounded-spa border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700';
        statusDiv.textContent = '¡Mensaje enviado! Te contactaremos pronto.';
        form.reset();
      } else {
        statusDiv.className = 'mt-4 rounded-spa border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700';
        statusDiv.textContent = data.error || 'Hubo un error. Por favor intenta de nuevo.';
      }
    } catch {
      statusDiv.className = 'mt-4 rounded-spa border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700';
      statusDiv.textContent = 'Error de conexión. Verifica tu internet e intenta de nuevo.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
</script>
```

- [ ] **Step 4: Verificar el flujo completo en dev**

```bash
npm run dev
```

1. Llenar el formulario con datos validos → Hacer click en enviar
2. El boton debe mostrar spinner y "Enviando..."
3. Debe aparecer mensaje verde de exito
4. El formulario se resetea
5. El email llega a la direccion configurada

- [ ] **Step 5: Probar el caso de error**

Temporalmente cambiar `RESEND_API_KEY` a un valor invalido en `.env`. Enviar el formulario. Debe aparecer mensaje rojo de error. Restaurar la API key correcta despues.

- [ ] **Step 6: Commit**

```bash
git add src/components/BookingFormSection.astro
git commit -m "feat: replace mailto form with fetch to /api/contact with loading and error states"
```

---

### Task 4: Configurar variables de entorno en Vercel

- [ ] **Step 1: Agregar variables en el dashboard de Vercel**

En Vercel Dashboard → tu proyecto → Settings → Environment Variables:

| Key | Value | Environment |
|-----|-------|-------------|
| `RESEND_API_KEY` | `re_xxxx...` | Production, Preview |
| `CONTACT_EMAIL` | `info@blueroyalespa.com` | Production, Preview |

- [ ] **Step 2: Redesplegar**

```bash
git push origin master
```

O desde el dashboard de Vercel hacer "Redeploy".

- [ ] **Step 3: Probar en produccion**

Ir a `https://www.blueroyalespa.com` y enviar un mensaje de prueba via el formulario. Verificar que llega el email.
