// schema/addon.js

export const addonSchema = {
  name: 'addon',
  title: 'Add-on',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'localeString',
      description: 'Nombre del add-on (ej. Masaje de Cuero Cabelludo)',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'ID (Slug)',
      type: 'slug',
      options: {
        source: 'title.en',
        maxLength: 96,
      },
      description: 'Identificador único para el sistema (ej. scalp-massage)',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'price',
      title: 'Precio',
      type: 'string', // Cambiado de localeString a string
      description: 'Precio a mostrar (ej. $40)',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Descripción Corta',
      type: 'localeText',
      rows: 2,
    },
  ],
  preview: {
    select: {
      title: 'title.en',
      subtitle: 'price', // Ahora es directo
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Sin título',
        subtitle: subtitle || '',
      };
    },
  },
};
