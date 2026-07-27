/** Development-only diagnostics. All output is stripped from production UX. */
export function isDebug(): boolean {
  return import.meta.env.DEV;
}

export function logLifecycle(module: string, event: string, data?: unknown): void {
  if (isDebug()) console.debug(`[${module}] ${event}`, data ?? '');
}

export function mark(name: string): void {
  if (isDebug() && typeof performance !== 'undefined') performance.mark(name);
}

export function measure(name: string, start: string, end?: string): void {
  if (isDebug() && typeof performance !== 'undefined') {
    try { performance.measure(name, start, end); } catch { /* marks may not exist */ }
  }
}

export function fail(module: string, error: unknown): void {
  // Always observable, even in production
  console.error(`[${module}] FAILED:`, error);
}
