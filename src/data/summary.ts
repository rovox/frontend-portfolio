import {
  CV_URL_EN,
  CV_URL_ES,
  EMAIL_URL,
  GITHUB_URL,
  LINKEDIN_URL,
  MEDIUM_URL,
  SITE_URL,
} from '../config';

/** Single source of truth for identity data — used by SEO, llms.txt and the page summaries. */
export const summary = {
  name: 'Jose Roberto Vargas Orellana',
  handle: 'rovox',
  role: 'Software Engineer',
  longRole: 'Software Developer, Data Scientist, Full Stack Web/Mobile/Desktop',
  city: 'Cochabamba',
  country: 'Bolivia',
  countryCode: 'BO',
  email: EMAIL_URL.replace('mailto:', ''),
  site: SITE_URL,
  tagline:
    'Computer science engineer building immersive, performant web, mobile and desktop experiences with React, TypeScript, Python, WebGL and GSAP.',
  /** One-paragraph, answer-first summary for humans, search snippets and LLMs. */
  short:
    'Jose Roberto Vargas Orellana is a software engineer and data scientist from Cochabamba, Bolivia. He builds full-stack web, mobile and desktop products with React, TypeScript, Python and SQL, plus 3D/WebGL and machine-learning projects.',
  knowsAbout: [
    'Full-stack development',
    'React',
    'TypeScript',
    'Python',
    'SQL',
    'Machine learning',
    'Three.js',
    'WebGL',
    'GSAP',
    'Blockchain and smart contracts',
    'Mobile development',
    'DevOps',
  ],
  links: {
    github: GITHUB_URL,
    linkedin: LINKEDIN_URL,
    medium: MEDIUM_URL,
  },
  cv: {
    en: new URL(CV_URL_EN, SITE_URL).href,
    es: new URL(CV_URL_ES, SITE_URL).href,
  },
} as const;

export const sameAs = Object.values(summary.links);

/** Quick facts for the "At a glance" block (rendered as a <dl>). */
export const glance: ReadonlyArray<{ q: string; a: string }> = [
  { q: 'Who is he?', a: `${summary.name} — ${summary.longRole}.` },
  { q: 'Where is he based?', a: `${summary.city}, ${summary.country}.` },
  { q: 'Core stack', a: 'React, TypeScript, Python, SQL, Three.js/WebGL, GSAP, ML/AI.' },
  { q: 'What does he build?', a: 'Immersive web apps, mobile apps, smart contracts, data/ML projects and 3D experiences.' },
  { q: 'How to get in touch?', a: `Email ${summary.email}, or use the contact form on this site.` },
];

const shortEs =
  'Jose Roberto Vargas Orellana es ingeniero de software y científico de datos de Cochabamba, Bolivia. Construye productos full-stack web, móviles y de escritorio con React, TypeScript, Python y SQL, además de proyectos 3D/WebGL y de machine learning.';

const glanceEs: ReadonlyArray<{ q: string; a: string }> = [
  { q: '¿Quién es?', a: `${summary.name} — desarrollador de software, científico de datos e ingeniero Full Stack Web/Móvil/Escritorio.` },
  { q: '¿Dónde está?', a: `${summary.city}, ${summary.country}.` },
  { q: 'Stack principal', a: 'React, TypeScript, Python, SQL, Three.js/WebGL, GSAP, ML/IA.' },
  { q: '¿Qué construye?', a: 'Apps web inmersivas, apps móviles, contratos inteligentes, proyectos de datos/ML y experiencias 3D.' },
  { q: '¿Cómo contactarlo?', a: `Escribe a ${summary.email} o usa el formulario de contacto de este sitio.` },
];

/** Locale-aware view of the identity summary (EN default, ES under /es/). */
export function getSummary(locale: string | undefined) {
  const es = locale === 'es';
  return {
    ...summary,
    lang: es ? 'es' : 'en',
    short: es ? shortEs : summary.short,
    glance: es ? glanceEs : glance,
    cvUrl: es ? summary.cv.es : summary.cv.en,
  };
}
