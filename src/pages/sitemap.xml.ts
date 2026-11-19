import type { APIRoute } from 'astro';
import { SITE_URL } from '../config';

export const prerender = true;

const paths = ['/', '/about'];

export const GET: APIRoute = () => {
  const lastmod = new Date().toISOString().split('T')[0];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map(
    (p) =>
      `  <url><loc>${SITE_URL}${p}</loc><lastmod>${lastmod}</lastmod><priority>${p === '/' ? '1.0' : '0.7'}</priority></url>`,
  )
  .join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
