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
      name: 'calLink',
      title: 'Enlace Cal.com (por defecto)',
      type: 'string',
      description:
        'Si no hay filas en “Reserva por terapeuta”, se usa este enlace. Formato: usuario/evento.',
    },
    {
      name: 'therapistBooking',
      title: 'Reserva por terapeuta',
      type: 'array',
      description:
        'Una fila por terapeuta con su Cal (usuario/evento). Si vacío, se usa el enlace Cal del servicio arriba. En Cal.com: un event type por fila, destino en el calendario Google de esa persona.',
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
            {
              name: 'calLink',
              title: 'Enlace Cal.com',
              type: 'string',
              description: 'Mismo formato que arriba (ej. blueroyale/masaje-maria).',
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: {
              therapistName: 'therapist.name',
              calLink: 'calLink',
              media: 'therapist.image',
            },
            prepare({ therapistName, calLink, media }) {
              return {
                title: therapistName || 'Terapeuta',
                subtitle: calLink,
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
