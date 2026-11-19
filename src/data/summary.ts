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
