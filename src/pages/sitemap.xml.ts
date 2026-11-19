import type { APIRoute } from 'astro';
import { SITE_URL } from '../config';

export const prerender = true;

// Each page exists in English (/) and Spanish (/es/); list both with hreflang alternates.
const pages = [
  { path: '/', priority: '1.0' },
  { path: '/about/', priority: '0.7' },
];

export const GET: APIRoute = () => {
  const lastmod = new Date().toISOString().split('T')[0];
  const urls = pages.flatMap(({ path, priority }) => {
    const en = `${SITE_URL}${path}`;
    const es = `${SITE_URL}/es${path}`;
    const alts = `
    <xhtml:link rel="alternate" hreflang="en" href="${en}"/>
    <xhtml:link rel="alternate" hreflang="es" href="${es}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${en}"/>`;
    return [en, es].map(
      (loc) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${priority}</priority>${alts}
  </url>`,
    );
  });
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
