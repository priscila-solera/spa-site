# Blue Royale — Sanity Studio

Panel de control para editar el contenido del sitio (servicios, fotos, precios).

## Primera vez

1. En la **raíz del proyecto** asegúrate de tener el `.env` con `PUBLIC_SANITY_PROJECT_ID` y `PUBLIC_SANITY_DATASET` (el sitio Astro los usa para leer los datos).
2. En esta carpeta (`/studio`):

   ```bash
   npm install
   npm run dev
   ```

3. Abre **http://localhost:3333** (o la URL que indique el CLI).
4. Inicia sesión con tu cuenta de Sanity; los esquemas (Servicios) ya están configurados desde `/schema` en la raíz.

## Esquemas

Los tipos de contenido se definen en la raíz del repo: `../schema/` (p. ej. `service.js`). No hace falta duplicarlos aquí; el Studio los importa desde ahí.

## Despliegue

Para publicar el Studio en un subdominio de sanity.studio:

```bash
npm run deploy
```
