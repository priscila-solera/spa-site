/**
 * Esquema Sanity: ficha de terapeuta (nombre, foto, orden).
 */
export const therapistSchema = {
  name: 'therapist',
  title: 'Terapeuta',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Nombre',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'image',
      title: 'Foto',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'order',
      title: 'Orden',
      type: 'number',
      description: 'Orden de aparición al elegir terapeuta (menor primero).',
      initialValue: 0,
    },
  ],
  orderings: [
    { title: 'Orden manual', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'name', media: 'image' },
  },
};
