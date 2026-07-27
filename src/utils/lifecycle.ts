import { logLifecycle, fail, mark, measure } from './debug';

type DestroyFn = () => void;

/**
 * Registers an interactive module with symmetric init/destroy lifecycle.
 * - init runs on astro:page-load (and immediately if document already interactive)
 * - destroy runs on astro:before-swap
 * - Idempotent: repeated registration after SPA nav is safe (previous instance destroyed first)
 * - Init failures are caught, logged, and leave the page usable
 */
export function defineModule(name: string, init: () => DestroyFn | void): void {
  let destroy: DestroyFn | null = null;
  let initialized = false;

  const boot = () => {
    if (initialized) return;
    initialized = true;
    mark(`${name}:init`);
    try {
      const result = init();
      destroy = typeof result === 'function' ? result : null;
      logLifecycle(name, 'init');
    } catch (err) {
      fail(name, err);
      destroy = null;
    }
    measure(`${name}:init`, `${name}:init`);
  };

  const teardown = () => {
    if (!initialized) return;
    initialized = false;
    try {
      destroy?.();
      logLifecycle(name, 'destroy');
    } catch (err) {
      fail(name, err);
    } finally {
      destroy = null;
    }
  };

  document.addEventListener('astro:page-load', boot);
  document.addEventListener('astro:before-swap', teardown);

  // First load: astro:page-load fires on initial load in Astro 6 with ClientRouter,
  // but guard for direct script execution timing:
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    boot();
  }
}
