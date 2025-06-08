// @ts-check
import { defineConfig } from 'astro/config';
import path from 'node:path';

// https://astro.build/config
export default defineConfig({
  vite: {
    resolve: {
      alias: {
        '@': path.resolve('./src')
      }
    }
  }
});
