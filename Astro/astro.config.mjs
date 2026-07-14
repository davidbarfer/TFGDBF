// @ts-check
import { defineConfig } from 'astro/config';
import path from 'node:path';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  vite: {
    resolve: {
      alias: {
        '@': path.resolve('./src')
      }
    }
  },

  output: 'server',

  server: {
    port: 4321,
    host: '0.0.0.0'
  },

  adapter: node({
    mode: 'standalone'
  })
});