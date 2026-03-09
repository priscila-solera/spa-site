import { defineCollection, z } from 'astro:content';

const servicesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    order: z.number().default(0),
    ctaLabel: z.string().optional(),
    ctaLink: z.string().optional(),
    calLink: z.string().optional(),
    price: z.string().optional(),
    duration: z.string().optional(),
  }),
});

export const collections = {
  services: servicesCollection,
};
