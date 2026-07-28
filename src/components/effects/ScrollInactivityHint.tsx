import { useState, useEffect } from 'react';

export default function ScrollInactivityHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      setShow(false);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShow(true), 30000); // 30 segundos
    };

    // Eventos que resetean el timer — SOLO scroll y teclado, NO mouse
    window.addEventListener('scroll', resetTimer, { passive: true });
    window.addEventListener('keydown', resetTimer);

    // Iniciar el timer
    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className="scroll-inactivity-hint"
      style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        padding: '0.75rem 1.5rem',
        background: 'rgba(0, 242, 255, 0.1)',
        border: '1px solid var(--primary-container)',
        borderRadius: 'var(--radius-lg)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--fs-label)',
        color: 'var(--primary)',
        animation: 'fadeInUp 0.3s ease',
        backdropFilter: 'blur(10px)',
      }}
    >
      ↑ Scroll to continue exploring
    </div>
  );
}
