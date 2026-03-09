/**
 * Esquema de Sanity para el tipo "service".
 */
export const serviceSchema = {
  name: 'service',
  title: 'Servicio',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Título',
      type: 'localeString',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Categoría',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Descripción',
      type: 'localeText',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'price',
      title: 'Precio',
      type: 'string',
      description: 'Ej: "$80"',
    },
    {
      name: 'duration',
      title: 'Duración',
      type: 'string',
      description: 'Ej: "1 hr 40 min"',
    },
    {
      name: 'image',
      title: 'Imagen',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'imageAlt',
      title: 'Texto alternativo de la imagen',
      type: 'localeString',
    },
    {
      name: 'calLink',
      title: 'Enlace Cal.com',
      type: 'string',
      description: 'Usuario (ej. daniel-torres-calvo), evento (usuario/evento).',
    },
    {
      name: 'addons',
      title: 'Add-ons Disponibles',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'addon' }] }],
      description: 'Selecciona los add-ons que se pueden añadir a este servicio.',
    },
    {
      name: 'order',
      title: 'Orden',
      type: 'number',
      description: 'Orden de aparición dentro de la categoría',
      initialValue: 0,
    },
    // ctaLabel eliminado
  ],
  orderings: [
    {
      title: 'Orden manual',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title.en', subtitle: 'category.title.en', media: 'image' },
  },
};
