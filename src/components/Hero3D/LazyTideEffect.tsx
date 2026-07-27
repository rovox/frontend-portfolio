import { lazy, Suspense, useState, useEffect } from 'react';

const TideEffect = lazy(() => import('../Hero3D/TideEffect'));

/**
 * Lazy-loaded TideEffect wrapper.
 * 
 * Loading priority:
 *   1. Splash (GSAP only)
 *   2. Content HTML (static)
 *   3. TideEffect (R3F + Three.js + WaterShader) — loaded after splash completes
 * 
 * This prevents Three.js/R3F from competing with the splash for bandwidth.
 */
export default function LazyTideEffect() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if ((window as any).__portfolioLoaderDone) {
      setShow(true);
    } else {
      const handler = () => setShow(true);
      window.addEventListener('preloader:done', handler, { once: true });
      return () => window.removeEventListener('preloader:done', handler);
    }
  }, []);

  if (!show) return null;

  return (
    <Suspense fallback={null}>
      <TideEffect />
    </Suspense>
  );
}
