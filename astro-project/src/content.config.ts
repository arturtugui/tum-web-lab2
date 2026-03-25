import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const config = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/config' }),
  schema: z.object({
    title: z.string(),
  }),
});

export const collections = {
  config,
};
