// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import cloudflare from '@astrojs/cloudflare';

// On Vercel (VERCEL=1 is set by its build env) ship a plain static build;
// Cloudflare Workers Builds keeps using the Cloudflare adapter.
const isVercel = !!process.env.VERCEL;

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://frontend-portfolio.varor-joseroberto.workers.dev',
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [react()],
  // Optimize images at build time (sharp) — no runtime Cloudflare Images binding needed.
  adapter: isVercel ? undefined : cloudflare({ imageService: 'compile' }),
  vite: {
    ssr: {
      noExternal: ['react', 'react-dom'],
    },
    optimizeDeps: {
      exclude: [
        'astro/virtual-modules/transitions-router.js',
        'astro/virtual-modules/transitions-types.js',
        'astro/virtual-modules/transitions-events.js',
        'astro/virtual-modules/transitions-swap-functions.js',
      ],
    },
  },
});