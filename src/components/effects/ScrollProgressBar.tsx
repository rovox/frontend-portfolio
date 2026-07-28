import { useState, useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../../utils/reduced-motion';

export default function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout>>();
  const reducedMotion = useRef(prefersReducedMotion());

  useEffect(() => {
    // Skip shimmer if user prefers reduced motion
    if (reducedMotion.current) {
      setIsScrolling(false);
    }

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, scrollPercent)));

      if (!reducedMotion.current) {
        setIsScrolling(true);

        clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
          setIsScrolling(false);
        }, 1000);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout.current);
    };
  }, []);

  return (
    <div
      className="scroll-progress-bar"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Scroll progress"
      style={{
        position: 'fixed',
        top: '70px',
        left: 0,
        width: `${progress}%`,
        height: '3px',
        background:
          'linear-gradient(90deg, var(--primary-container), var(--primary), var(--primary-container))',
        zIndex: 1001,
        transition: 'width 0.1s ease-out',
        boxShadow: !reducedMotion.current && isScrolling
          ? `0 0 10px var(--primary-container), 0 0 20px var(--primary-container), 0 0 40px var(--primary-container)`
          : 'none',
        animation: !reducedMotion.current && isScrolling ? 'shimmer 1.5s infinite' : 'none',
      }}
    />
  );
}
