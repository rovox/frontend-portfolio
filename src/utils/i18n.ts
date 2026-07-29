/**
 * i18n — Language system for EN ↔ ES
 * 
 * Usage in Astro:
 *   import { t, setLang } from '../utils/i18n';
 *   const lang = Astro.url?.searchParams.get('lang') || 'en';
 *   setLang(lang);
 *   <h1>{t('hero.title')}</h1>
 */

type Locale = 'en' | 'es';

let currentLang: Locale = 'en';

export function setLang(lang: Locale) {
  currentLang = lang;
}

export function getLang(): Locale {
  return currentLang;
}

// Translation dictionary
const dict: Record<Locale, Record<string, string>> = {
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.work': 'Work',
    'nav.skills': 'Skills',
    'nav.experience': 'Experience',
    'nav.education': 'Education',
    'nav.contact': 'Contact',
    'nav.resume': 'Resume',
    'nav.switchLang': 'Switch to Spanish',

    // Hero
    'hero.label': '<Computer Science Engineer />',
    'hero.title': 'Software Engineer',
    'hero.download': 'Download CV',

    // Sections
    'section.work': '<Projects />',
    'section.skills': '<Skills />',
    'section.experience': '<Experience />',
    'section.education': '<Education />',
    'section.leadership': '<Leadership />',
    'section.contact': "Let's Work Together",
    'section.contact_desc': 'Currently accepting technical consultations and select freelance opportunities.',

    // Projects
    'projects.note': '// Featured work and open source contributions',
    'projects.live': 'Live',
    'projects.blog': 'Blog',
    'projects.colab': 'Colab',

    // Skills
    'skills.note': '// Technical expertise and creative capabilities',

    // Experience
    'experience.note': '// Professional journey and academic foundations',

    // Education
    'education.note': '// Academic foundations and continuous learning',

    // Leadership
    'leadership.note': '// Community engagement and institutional service',

    // Contact
    'contact.cta': "Let's Work Together",
    'contact.cta_desc': 'Currently accepting technical consultations and select freelance opportunities.',
    'contact.gmail': 'Gmail',
    'contact.whatsapp': 'WhatsApp',
    'contact.footer': 'Made with ❤️ , ☕ (x 8) and Astro',
  },

  es: {
    // Navbar
    'nav.home': 'Inicio',
    'nav.work': 'Trabajo',
    'nav.skills': 'Habilidades',
    'nav.experience': 'Experiencia',
    'nav.education': 'Educación',
    'nav.contact': 'Contacto',
    'nav.resume': 'Currículum',
    'nav.switchLang': 'Cambiar a Inglés',

    // Hero
    'hero.label': '<Ingeniero en Ciencias de la Computación />',
    'hero.title': 'Ingeniero de Software',
    'hero.download': 'Descargar CV',

    // Sections
    'section.work': '<Proyectos />',
    'section.skills': '<Habilidades />',
    'section.experience': '<Experiencia />',
    'section.education': '<Educación />',
    'section.leadership': '<Liderazgo />',
    'section.contact': 'Trabajemos Juntos',
    'section.contact_desc': 'Actualmente aceptando consultorías técnicas y oportunidades freelance selectas.',

    // Projects
    'projects.note': '// Trabajo destacado y contribuciones open source',
    'projects.live': 'En vivo',
    'projects.blog': 'Blog',
    'projects.colab': 'Colab',

    // Skills
    'skills.note': '// Experiencia técnica y capacidades creativas',

    // Experience
    'experience.note': '// Trayectoria profesional y bases académicas',

    // Education
    'education.note': '// Bases académicas y aprendizaje continuo',

    // Leadership
    'leadership.note': '// Participación comunitaria y servicio institucional',

    // Contact
    'contact.cta': 'Trabajemos Juntos',
    'contact.cta_desc': 'Actualmente aceptando consultorías técnicas y oportunidades freelance selectas.',
    'contact.gmail': 'Gmail',
    'contact.whatsapp': 'WhatsApp',
    'contact.footer': 'Hecho con ❤️ , ☕ (x 8) y Astro',
  },
};

export function t(key: string): string {
  return dict[currentLang]?.[key] ?? dict.en[key] ?? key;
}
