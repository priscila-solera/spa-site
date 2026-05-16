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
      name: 'shortDescription',
      title: 'Descripción corta',
      type: 'localeText',
      description: 'Para la tarjeta en la sección Tratamientos (1-2 frases). Obligatoria.',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Descripción larga',
      type: 'localeText',
      description: 'Texto completo del servicio; se muestra en el modal al hacer clic en "Leer más". Opcional.',
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
      name: 'calEventType',
      title: 'Event type de Cal.com',
      type: 'string',
      description:
        'Slug del event type en Cal.com (ej: appointment-60). Se combina con el username de cada terapeuta para formar su enlace de reserva.',
    },
    {
      name: 'calLink',
      title: 'Enlace Cal.com (fallback sin terapeutas)',
      type: 'string',
      description:
        'Solo si no hay terapeutas en la lista de abajo. Formato: usuario/evento.',
    },
    {
      name: 'therapistBooking',
      title: 'Reserva por terapeuta',
      type: 'array',
      description:
        'Una fila por terapeuta que ofrece este servicio. El enlace se construye automáticamente con el username de la terapeuta y el event type del servicio.',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'therapist',
              title: 'Terapeuta',
              type: 'reference',
              to: [{ type: 'therapist' }],
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: {
              therapistName: 'therapist.name',
              calUsername: 'therapist.calUsername',
              media: 'therapist.image',
            },
            prepare({ therapistName, calUsername, media }) {
              return {
                title: therapistName || 'Terapeuta',
                subtitle: calUsername || '(sin username)',
                media,
              };
            },
          },
        },
      ],
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
