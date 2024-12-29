/// <reference types="vitest" />

// Configure Vitest (https://vitest.dev/config/)

import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
  },

  build: {
    lib: {
      name: 'taomu-fetch',
      entry: './lib/main.ts',
      formats: ['es', 'cjs'],
      fileName: 'main',
    },

    rollupOptions: {
      external: ['taomu-toolkit', 'taomu-logger'],
    },
  },
})
