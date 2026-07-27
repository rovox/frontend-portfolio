import { useEffect, useRef, useCallback } from 'react';
import { gsap } from '../../utils/gsap-config';

export default function MagneticCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const cursorPosRef = useRef({ x: 0, y: 0 });

  const isTouchDevice = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  useEffect(() => {
    if (isTouchDevice()) return;

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mql.matches) return;

    const cursor = cursorRef.current;
    const dot = dotRef.current;
    if (!cursor || !dot) return;

    const handleCleanup: Array<() => void> = [];

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      gsap.set(dot, { x: mouseRef.current.x, y: mouseRef.current.y });
    };

    const animate = () => {
      const dx = mouseRef.current.x - cursorPosRef.current.x;
      const dy = mouseRef.current.y - cursorPosRef.current.y;
      cursorPosRef.current.x += dx * 0.12;
      cursorPosRef.current.y += dy * 0.12;
      cursor.style.transform = `translate(${cursorPosRef.current.x}px, ${cursorPosRef.current.y}px) translate(-50%, -50%)`;
      rafRef.current = requestAnimationFrame(animate);
    };

    const magneticElements = document.querySelectorAll<HTMLElement>(
      'a, button, [data-magnetic]'
    );

    magneticElements.forEach((el) => {
      const onEnter = () => {
        gsap.to(cursor, {
          scale: 1.6,
          borderColor: 'rgba(85, 255, 159, 0.8)',
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      const onLeave = () => {
        gsap.to(cursor, {
          scale: 1,
          borderColor: 'rgba(255, 255, 255, 0.4)',
          duration: 0.3,
          ease: 'power2.out',
        });
        gsap.to(el, { x: 0, y: 0, duration: 0.4, ease: 'power3.out', overwrite: true });
      };

      const onMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        gsap.to(el, {
          x: (e.clientX - centerX) * 0.25,
          y: (e.clientY - centerY) * 0.25,
          duration: 0.35,
          ease: 'power2.out',
          overwrite: true,
        });
      };

      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
      el.addEventListener('mousemove', onMove);

      handleCleanup.push(() => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
        el.removeEventListener('mousemove', onMove);
      });
    });

    window.addEventListener('mousemove', onMouseMove);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafRef.current);
      handleCleanup.forEach((fn) => fn());
    };
  }, [isTouchDevice]);

  if (isTouchDevice()) return null;

  return (
    <>
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          width: '32px',
          height: '32px',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9998,
          top: 0,
          left: 0,
          mixBlendMode: 'difference',
        }}
      />
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          width: '6px',
          height: '6px',
          backgroundColor: '#55ff9f',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          top: 0,
          left: 0,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </>
  );
}
