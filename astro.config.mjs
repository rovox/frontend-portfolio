// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://frontend-portfolio.varor-joseroberto.workers.dev',
  integrations: [react()],
  // Optimize images at build time (sharp) — no runtime Cloudflare Images binding needed.
  adapter: cloudflare({ imageService: 'compile' }),
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