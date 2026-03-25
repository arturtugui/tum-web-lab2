import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

const configCollection = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
  }),
});

export const collections = {
  config: configCollection,
};
