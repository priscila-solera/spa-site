# Blue Royale Spa — Sitio web

Sitio estático para **Blue Royale Spa** (Tamarindo, Costa Rica): tratamientos, testimonios, contacto y **reservas con Cal.com**, con contenido editable en **Sanity Studio**.

## Stack

| Área | Tecnología |
|------|------------|
| Framework | [Astro](https://astro.build) 5 |
| UI | Tailwind CSS, componentes `.astro` y React donde hace falta (modal de reservas) |
| CMS | [Sanity](https://www.sanity.io) — servicios, categorías, add-ons, terapeutas |
| Reservas | [Cal.com](https://cal.com) embed (`@calcom/embed-react`) |
| Analytics | Vercel Analytics & Speed Insights |

## Requisitos

- Node.js **20+** (recomendado)
- Cuenta de [Sanity](https://sanity.io) y proyecto con dataset (si usas CMS)
- Variables de entorno (ver [`.env.example`](./.env.example) y [ENV.md](./ENV.md))

## Inicio rápido

```bash
npm install
cp .env.example .env
# Edita .env con PUBLIC_CAL_LINK y, si aplica, PUBLIC_SANITY_PROJECT_ID
npm run dev
```

El sitio corre en **http://localhost:4321** (puerto por defecto de Astro).

## Scripts (raíz del repo)

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción → `dist/` |
| `npm run preview` | Previsualizar el build localmente |

Otros scripts utilitarios: `upload-hero-video`, `extract-hero-poster`, `pdf-to-logo` (ver `package.json`).

## Variables de entorno

- **`PUBLIC_CAL_LINK`** — Obligatorio para el botón de reservar: slug Cal sin dominio (ej. `usuario` o `usuario/tipo-evento`).
- **Sanity** — `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`, etc. Si falta el project ID, el sitio funciona sin servicios desde CMS.
- Opcionales: WhatsApp, mapa embebido, Google Places para testimonios, hero en video.

Instrucciones paso a paso: **[ENV.md](./ENV.md)**. Tras cambiar `.env`, reinicia `npm run dev` o vuelve a hacer build.

## Sanity Studio (CMS)

Los esquemas viven en **`/schema`**; el Studio en **`/studio`** importa esa carpeta.

```bash
cd studio
npm install
npm run dev      # http://localhost:3333 (puerto típico de Sanity)
```

**Despliegue del Studio a sanity.io** (URL `*.sanity.studio`):

```bash
cd studio
npm run deploy
```

### CI: deploy automático del Studio

Con push a **`main`** que toque `studio/`, `schema/` o el workflow, GitHub Actions ejecuta `sanity deploy` (ver [`.github/workflows/deploy-sanity-studio.yml`](./.github/workflows/deploy-sanity-studio.yml)).

**Secreto requerido en el repo:** `SANITY_AUTH_TOKEN` (token con permiso de deploy en [sanity.io/manage](https://www.sanity.io/manage) → API → Tokens).

## Reservas y terapeutas

- En **Sanity**, cada **servicio** puede tener **enlace Cal por defecto** y, opcionalmente, **reserva por terapeuta** (una fila por persona con su `calLink` `usuario/evento`).
- En **Cal.com**, cada terapeuta suele tener su propio tipo de evento apuntando a su calendario Google; el sitio abre el embed correspondiente tras elegir servicio, add-ons y terapeuta.
- Detalle de producto (parejas, disponibilidad, etc.) se documenta en flujo con el cliente; el código asume un `calLink` resoluble por línea de carrito.

## Estructura del proyecto (resumen)

```text
├── .github/workflows/     # Deploy Sanity Studio en CI
├── schema/                # Esquemas Sanity (servicios, terapeutas, …)
├── studio/                # Sanity Studio (depende de ../schema)
├── public/                # Assets estáticos
├── src/
│   ├── components/        # UI, CalBookingOverlay, secciones, …
│   ├── layouts/
│   ├── lib/sanity.js      # Cliente GROQ y fetch de servicios
│   └── pages/             # Rutas (/, /en, /es, /cita, servicios/…)
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

## Documentación útil

- [Astro](https://docs.astro.build)
- [Sanity + Astro](https://www.sanity.io/docs/js-client)
- [Cal.com Embed](https://cal.com/docs/embed)

---

Proyecto privado / cliente — mantener alineados `.env.example`, `ENV.md` y secretos de CI al cambiar integraciones.
