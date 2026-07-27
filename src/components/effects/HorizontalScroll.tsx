import { useEffect, useRef } from 'react';
import { gsap } from '../../utils/gsap-config';

interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}

export default function HorizontalScroll({
  children,
  className = '',
  speed = 1,
}: HorizontalScrollProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mql.matches) return;

    const ctx = gsap.context(() => {
      const scrollWidth = track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: -scrollWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${scrollWidth * speed}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    }, section);

    return () => ctx.revert();
  }, [speed]);

  return (
    <div ref={sectionRef} className={`horizontal-scroll ${className}`}>
      <div
        ref={trackRef}
        className="horizontal-scroll-track"
        style={{
          display: 'flex',
          gap: '2rem',
          width: 'fit-content',
          height: '100vh',
          alignItems: 'center',
          padding: '0 2rem',
        }}
      >
        {children}
      </div>

      <style>{`
        .horizontal-scroll {
          overflow: hidden;
          height: 100vh;
          position: relative;
        }
        .horizontal-scroll-track > * {
          flex-shrink: 0;
          width: min(80vw, 600px);
        }
        @media (max-width: 720px) {
          .horizontal-scroll-track > * {
            width: 85vw;
          }
        }
      `}</style>
    </div>
  );
}
