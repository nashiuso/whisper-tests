import { defineConfig } from 'astro/config';

// Copyright (c) 2026, Nashi Uso, (嘘無し).

export default defineConfig({
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
