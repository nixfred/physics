import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Canonical site URL. Update if the public domain changes.
export default defineConfig({
  site: 'https://physics.nixfred.com',
  integrations: [
    react(),
    mdx(),
    sitemap({
      // Per-route hints. The homepage is the priority entry; articles change
      // less often. lastmod stamped at build time.
      serialize(item) {
        item.lastmod = new Date().toISOString();
        if (item.url === 'https://physics.nixfred.com/') {
          item.changefreq = 'weekly';
          item.priority = 1.0;
        } else {
          item.changefreq = 'monthly';
          item.priority = 0.7;
        }
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
