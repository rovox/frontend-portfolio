import { useState, useEffect, useCallback } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme') as 'dark' | 'light';
    setTheme(current || 'dark');
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: newTheme } }));
  }, [theme]);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      className="theme-toggle"
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {theme === 'dark' ? '\u2600' : '\u263E'}
      </span>
      <span className="sr-only">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
    </button>
  );
}
