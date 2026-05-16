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
    {
      name: 'calUsername',
      title: 'Username de Cal.com',
      type: 'string',
      description: 'Username de la terapeuta en Cal.com (ej: blue-royale-spa-yalile). Se combina con el event type del servicio para formar el enlace de reserva.',
    },
    {
      name: 'active',
      title: 'Terapeuta activo',
      type: 'boolean',
      description: 'Desactiva para ocultar este terapeuta en todos los servicios.',
      initialValue: true,
    },
  ],
  orderings: [
    { title: 'Orden manual', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'name', media: 'image' },
  },
};
