/**
 * UI strings for EN / ES.
 * Routes: English at `/`, Spanish at `/es/` (Astro i18n, prefixDefaultLocale: false).
 * Components read the active locale from `Astro.currentLocale` via `useTranslations()`.
 */
export const languages = { en: 'English', es: 'Español' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'en';

export const ui = {
  en: {
    'meta.title': 'Jose Roberto Vargas Orellana | Software Engineer Portfolio',
    'meta.aboutTitle': 'About | Jose Roberto Vargas Orellana',
    'meta.aboutDesc': 'Focus: full-stack development, data science and UI/UX.',
    'skip': 'Skip to main content',

    'nav.aria': 'Main navigation',
    'nav.home': 'rovox — homepage',
    'nav.experience': 'Experience',
    'nav.work': 'Work',
    'nav.skills': 'Skills',
    'nav.education': 'Education',
    'nav.contact': 'Contact',
    'nav.resume': 'Resume',
    'nav.toggle': 'Toggle navigation menu',
    'nav.drawer': 'Navigation menu',
    'nav.menu': 'Menu',
    'nav.close': 'Close navigation menu',
    'lang.switch': 'Language',
    'lang.switchTo': 'Ver en español',

    'hero.label': '<Computer Science Engineer />',
    'hero.title': 'Software Engineer',
    'hero.contact': 'Contact me',
    'hero.download': 'Download CV',
    'hero.photoAlt': 'Portrait of Jose Roberto Vargas Orellana, software engineer',
    'hero.t1': 'Software Engineer & Data Scientist',
    'hero.t2': 'Full Stack Web/Mobile/Desktop',
    'hero.t3': 'Bolivia 🇧🇴 | Open Source Advocate',
    'hero.t4': 'Building tools that empower developers',

    'experience.title': '<Experience />',
    'experience.note': '// Professional journey and academic foundations',
    'filter.all': 'All',
    'filter.professional': 'Professional',
    'filter.university': 'University',

    'projects.title': '<Projects />',
    'projects.note': '// Featured work and open source contributions',
    'projects.live': 'Live',
    'projects.liveAria': 'Open live site',
    'projects.colabAria': 'Open in Google Colab',
    'projects.githubAria': 'View on GitHub',
    'projects.blogAria': 'Read blog post',

    'skills.title': '<Skills />',
    'skills.note': '// Technical expertise and creative capabilities',
    'education.title': '<Education />',
    'education.note': '// Academic foundations and continuous learning',
    'leadership.title': '<Leadership />',
    'leadership.note': '// Community engagement and institutional service',

    'marquee.a': 'Technologies I work with',
    'marquee.b': 'More technologies I work with',

    'glance.title': 'At a glance',
    'glance.stat.roles': 'Roles & experiences',
    'glance.stat.projects': 'Projects shipped',
    'glance.stat.tech': 'Technologies used',
    'glance.stat.leadership': 'Leadership roles',

    'contact.title': "Let's Work Together",
    'contact.desc': 'Currently accepting technical consultations and select freelance opportunities.',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.message': 'Message',
    'contact.privacy': 'Your data is sent securely via Formspree. No tracking, no analytics.',
    'contact.send': 'Send message',
    'contact.success': "✓ Message sent. I'll get back to you soon.",
    'contact.socials': 'Social links',
    'contact.footer': 'Made with ❤️ , ☕ (x 8) and Astro',

    'carousel.region': 'Card carousel',
    'carousel.nav': 'Carousel navigation',

    'about.title': 'About Me',
    'about.subtitle': 'Software Developer & Data Scientist',
    'about.p1':
      "I'm Jose Roberto Vargas Orellana, a Software Developer, Data Scientist and Full Stack Web/Mobile/Desktop engineer based in Cochabamba, Bolivia. I build immersive digital experiences across web, mobile, and desktop platforms — combining strong engineering fundamentals with a deep eye for UI/UX design.",
    'about.p2':
      "My work spans full-stack development, data science, and creative coding. I'm passionate about building tools and interfaces that are both performant and beautiful.",
    'about.location': 'Location',
    'about.focus': 'Focus',
    'about.focusValue': 'Full Stack · Data Science · UI/UX',
    'about.platforms': 'Platforms',
    'about.platformsValue': 'Web · Mobile · Desktop',
    'about.core': 'Core Technologies',
  },
  es: {
    'meta.title': 'Jose Roberto Vargas Orellana | Portafolio de Ingeniero de Software',
    'meta.aboutTitle': 'Sobre mí | Jose Roberto Vargas Orellana',
    'meta.aboutDesc': 'Enfoque: desarrollo full-stack, ciencia de datos y UI/UX.',
    'skip': 'Saltar al contenido principal',

    'nav.aria': 'Navegación principal',
    'nav.home': 'rovox — inicio',
    'nav.experience': 'Experiencia',
    'nav.work': 'Proyectos',
    'nav.skills': 'Habilidades',
    'nav.education': 'Educación',
    'nav.contact': 'Contacto',
    'nav.resume': 'Currículum',
    'nav.toggle': 'Abrir o cerrar el menú de navegación',
    'nav.drawer': 'Menú de navegación',
    'nav.menu': 'Menú',
    'nav.close': 'Cerrar el menú de navegación',
    'lang.switch': 'Idioma',
    'lang.switchTo': 'View in English',

    'hero.label': '<Ingeniero en Ciencias de la Computación />',
    'hero.title': 'Ingeniero de Software',
    'hero.contact': 'Contáctame',
    'hero.download': 'Descargar CV',
    'hero.photoAlt': 'Retrato de Jose Roberto Vargas Orellana, ingeniero de software',
    'hero.t1': 'Ingeniero de Software y Científico de Datos',
    'hero.t2': 'Full Stack Web/Móvil/Escritorio',
    'hero.t3': 'Bolivia 🇧🇴 | Defensor del código abierto',
    'hero.t4': 'Construyendo herramientas que potencian a los desarrolladores',

    'experience.title': '<Experiencia />',
    'experience.note': '// Trayectoria profesional y bases académicas',
    'filter.all': 'Todo',
    'filter.professional': 'Profesional',
    'filter.university': 'Universidad',

    'projects.title': '<Proyectos />',
    'projects.note': '// Trabajo destacado y contribuciones open source',
    'projects.live': 'En vivo',
    'projects.liveAria': 'Abrir sitio en vivo',
    'projects.colabAria': 'Abrir en Google Colab',
    'projects.githubAria': 'Ver en GitHub',
    'projects.blogAria': 'Leer artículo del blog',

    'skills.title': '<Habilidades />',
    'skills.note': '// Experiencia técnica y capacidades creativas',
    'education.title': '<Educación />',
    'education.note': '// Bases académicas y aprendizaje continuo',
    'leadership.title': '<Liderazgo />',
    'leadership.note': '// Participación comunitaria y servicio institucional',

    'marquee.a': 'Tecnologías con las que trabajo',
    'marquee.b': 'Más tecnologías con las que trabajo',

    'glance.title': 'En resumen',
    'glance.stat.roles': 'Roles y experiencias',
    'glance.stat.projects': 'Proyectos entregados',
    'glance.stat.tech': 'Tecnologías usadas',
    'glance.stat.leadership': 'Roles de liderazgo',

    'contact.title': 'Trabajemos juntos',
    'contact.desc': 'Actualmente acepto consultorías técnicas y oportunidades freelance seleccionadas.',
    'contact.name': 'Nombre',
    'contact.email': 'Correo',
    'contact.message': 'Mensaje',
    'contact.privacy': 'Tus datos se envían de forma segura vía Formspree. Sin rastreo ni analíticas.',
    'contact.send': 'Enviar mensaje',
    'contact.success': '✓ Mensaje enviado. Te responderé pronto.',
    'contact.socials': 'Redes sociales',
    'contact.footer': 'Hecho con ❤️ , ☕ (x 8) y Astro',

    'carousel.region': 'Carrusel de tarjetas',
    'carousel.nav': 'Navegación del carrusel',

    'about.title': 'Sobre mí',
    'about.subtitle': 'Desarrollador de Software y Científico de Datos',
    'about.p1':
      'Soy Jose Roberto Vargas Orellana, desarrollador de software, científico de datos e ingeniero Full Stack Web/Móvil/Escritorio en Cochabamba, Bolivia. Construyo experiencias digitales inmersivas para web, móvil y escritorio, combinando bases sólidas de ingeniería con un ojo atento al diseño UI/UX.',
    'about.p2':
      'Mi trabajo abarca desarrollo full-stack, ciencia de datos y programación creativa. Me apasiona crear herramientas e interfaces que sean a la vez rápidas y bonitas.',
    'about.location': 'Ubicación',
    'about.focus': 'Enfoque',
    'about.focusValue': 'Full Stack · Ciencia de datos · UI/UX',
    'about.platforms': 'Plataformas',
    'about.platformsValue': 'Web · Móvil · Escritorio',
    'about.core': 'Tecnologías principales',
  },
} as const;

export type UIKey = keyof (typeof ui)['en'];

export function toLang(locale: string | undefined): Lang {
  return locale === 'es' ? 'es' : 'en';
}

export function useTranslations(locale: string | undefined) {
  const lang = toLang(locale);
  return (key: UIKey): string => ui[lang][key] ?? ui.en[key];
}

/** Prefix an internal path for the given language (`/about/` → `/es/about/`). */
export function localizePath(path: string, locale: string | undefined): string {
  const lang = toLang(locale);
  const clean = path.startsWith('/') ? path : `/${path}`;
  return lang === 'en' ? clean : `/es${clean}`;
}

/** Path of the same page in the other language. */
export function alternatePath(pathname: string, target: Lang): string {
  const base = pathname.replace(/^\/es(?=\/|$)/, '') || '/';
  return localizePath(base, target);
}

/** Runtime strings for client scripts (read from <html lang>). */
export const clientStrings = {
  en: { cvToast: 'Downloading CV…', goto: 'Go to card', audioClick: 'Click for music' },
  es: { cvToast: 'Descargando CV…', goto: 'Ir a la tarjeta', audioClick: 'Clic para música' },
} as const;
