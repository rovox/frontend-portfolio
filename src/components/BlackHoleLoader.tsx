import { useEffect, useRef } from 'react';

type Particle = {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  hueShift: number;
};

export default function BlackHoleLoader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Particle[] = [];
    let centerX = window.innerWidth / 2;
    let centerY = window.innerHeight / 2;
    let animationId = 0;
    let isDisposed = false;

    const syncCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      centerX = window.innerWidth / 2;
      centerY = window.innerHeight / 2;
    };

    syncCanvas();

    for (let index = 0; index < 170; index += 1) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * 360 + 80,
        speed: Math.random() * 0.038 + 0.012,
        size: Math.random() * 2.8 + 0.8,
        hueShift: Math.random() * 28,
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];
        particle.angle += particle.speed;
        particle.radius *= 0.992;

        const x = centerX + Math.cos(particle.angle) * particle.radius;
        const y = centerY + Math.sin(particle.angle) * particle.radius;
        const normalized = Math.max(0, Math.min(1, 1 - particle.radius / 360));
        const alpha = 0.18 + normalized * 0.82;

        ctx.beginPath();
        ctx.arc(x, y, particle.size * (0.42 + normalized), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${44 + particle.hueShift}, 92%, ${52 + normalized * 16}%, ${alpha})`;
        ctx.fill();

        if (particle.radius < 6) {
          particle.radius = Math.random() * 300 + 220;
          particle.angle = Math.random() * Math.PI * 2;
        }
      }

      animationId = window.requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => syncCanvas();
    window.addEventListener('resize', handleResize, { passive: true });
    document.body.classList.add('is-loading');

    const finish = async () => {
      const gsapModule = await import('gsap');
      if (isDisposed) return;
      const gsap = gsapModule.default;

      const timeline = gsap.timeline({
        onComplete: () => {
          document.body.classList.remove('is-loading');
          (window as Window & { __portfolioLoaderDone?: boolean }).__portfolioLoaderDone = true;
          window.dispatchEvent(new CustomEvent('preloader:done'));
        },
      });

      timeline
        .to(canvas, { duration: 5, ease: 'none' })
        .to(canvas, {
          scale: 2.8,
          opacity: 0,
          filter: 'brightness(2.8) blur(14px)',
          duration: 0.8,
          ease: 'expo.in',
        });
    };

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      window.setTimeout(() => {
        document.body.classList.remove('is-loading');
        (window as Window & { __portfolioLoaderDone?: boolean }).__portfolioLoaderDone = true;
        window.dispatchEvent(new CustomEvent('preloader:done'));
      }, 250);
    } else {
      finish();
    }

    return () => {
      isDisposed = true;
      document.body.classList.remove('is-loading');
      window.removeEventListener('resize', handleResize);
      window.cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="black-hole-loader"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#000',
        pointerEvents: 'none',
      }}
    />
  );
}