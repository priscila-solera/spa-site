/**
 * Configuración de Sanity Studio.
 * Usa los esquemas creados en la raíz: /schema (service, etc.).
 * structureTool = la "mesa" donde ves y editas los documentos (Servicios).
 */
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from '../schema/index.js';

export default defineConfig({
  name: 'blue-royale-studio',
  title: 'Blue Royale Spa',
  projectId: 'fcrjghqs',
  dataset: 'production',
  basePath: '/studio',
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
});
