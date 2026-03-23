// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.mobila-orhei.tech',
  base: '/tum-web-lab2/',
  output: 'static',
  vite: {
    plugins: [tailwindcss()]
  }
});