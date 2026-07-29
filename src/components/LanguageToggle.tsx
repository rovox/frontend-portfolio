import { useState, useEffect } from 'react';

type Lang = 'en' | 'es';

const FLAGS: Record<Lang, string> = {
  en: '🇺🇸',
  es: '🇧🇴',
};

const LABELS: Record<Lang, string> = {
  en: 'EN',
  es: 'ES',
};

export default function LanguageToggle() {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const stored = localStorage.getItem('lang') as Lang | null;
    const resolved = stored || 'en';
    document.documentElement.setAttribute('data-lang', resolved);
    setLang(resolved);
  }, []);

  const toggle = () => {
    const next: Lang = lang === 'en' ? 'es' : 'en';
    document.documentElement.setAttribute('data-lang', next);
    localStorage.setItem('lang', next);
    setLang(next);
    window.dispatchEvent(
      new CustomEvent('lang-changed', { detail: { lang: next } })
    );
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="lang-toggle"
      aria-label={`Switch to ${lang === 'en' ? 'Spanish (Español)' : 'English'}`}
      title={`${lang === 'en' ? 'Cambiar a Español' : 'Switch to English'} ${FLAGS[lang === 'en' ? 'es' : 'en']}`}
    >
      <span className="lang-toggle-flag">{FLAGS[lang]}</span>
      <span className="lang-toggle-label">{LABELS[lang]}</span>
    </button>
  );
}
