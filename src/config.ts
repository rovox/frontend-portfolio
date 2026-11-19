/** Shared site configuration — single source of truth for external links. */
/** Production origin (override with PUBLIC_SITE_URL at build time). */
export const SITE_URL = (
  import.meta.env.PUBLIC_SITE_URL ??
  'https://frontend-portfolio.varor-joseroberto.workers.dev'
).replace(/\/$/, '');

/** CV files served from /public. `download` filenames are what the visitor saves. */
export const CV_URL_EN = '/cv-jose-roberto-vargas-en.pdf';
export const CV_URL_ES = '/cv-jose-roberto-vargas-es.pdf';
export const CV_FILENAME_EN = 'Jose-Roberto-Vargas-CV-EN.pdf';
export const CV_FILENAME_ES = 'Jose-Roberto-Vargas-CV-ES.pdf';

/** Formspree contact form endpoint. */
export const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xlgqkyed';

/** Social media URLs */
export const MEDIUM_URL = 'https://medium.com/@varor.joseroberto';
export const GITHUB_URL = 'https://github.com/rovox';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/jroberto-vargas-orellana/';
export const EMAIL_URL = 'mailto:varor.joseroberto@gmail.com';
