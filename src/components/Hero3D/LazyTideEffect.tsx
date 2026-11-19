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
    // Perf: skip the WebGL scene for reduced motion, Save-Data, or low-end devices.
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
    const lowEnd =
      window.matchMedia('(prefers-reduced-motion: reduce), (max-width: 768px), (pointer: coarse)').matches ||
      nav.connection?.saveData === true ||
      (nav.hardwareConcurrency ?? 8) < 4 ||
      (nav.deviceMemory ?? 8) < 4;
    if (lowEnd) return;

    const start = () => {
      const idle = (window as any).requestIdleCallback as ((cb: () => void, o?: { timeout: number }) => number) | undefined;
      if (idle) idle(() => setShow(true), { timeout: 3000 });
      else setTimeout(() => setShow(true), 200);
    };

    if ((window as any).__portfolioLoaderDone) {
      start();
    } else {
      const handler = () => start();
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
