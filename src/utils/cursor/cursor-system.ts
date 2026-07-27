/**
 * Cursor System — architecture scaffold (extension points only).
 *
 * Future: orchestrates contextual cursor micro-interactions (border highlights,
 * ripple effects, edge sweeps, hover responses) via a plugin registry.
 * Intentionally NOT instantiated yet. When enabled, instantiate lazily via
 * getCursorSystem() from a single client island, respecting prefers-reduced-motion.
 */
import { prefersReducedMotion } from '../reduced-motion';

export interface CursorPlugin {
  readonly id: string;
  /** Called on pointermove with normalized viewport coords (0..1) */
  onMove?(x: number, y: number): void;
  /** Called when pointer enters a registered target matching plugin's interest */
  onEnter?(target: HTMLElement): void;
  onLeave?(target: HTMLElement): void;
  destroy?(): void;
}

export interface CursorSystem {
  registerPlugin(plugin: CursorPlugin): () => void;
  isEnabled(): boolean;
  destroy(): void;
}

class CursorSystemImpl implements CursorSystem {
  private plugins = new Map<string, CursorPlugin>();
  private enabled = false;

  registerPlugin(plugin: CursorPlugin): () => void {
    this.plugins.set(plugin.id, plugin);
    return () => {
      this.plugins.get(plugin.id)?.destroy?.();
      this.plugins.delete(plugin.id);
    };
  }

  isEnabled(): boolean {
    return this.enabled && !prefersReducedMotion();
  }

  destroy(): void {
    this.plugins.forEach((p) => p.destroy?.());
    this.plugins.clear();
    this.enabled = false;
  }
}

let instance: CursorSystemImpl | null = null;

/** Lazy singleton — call only from a client island after user interaction. */
export function getCursorSystem(): CursorSystem {
  if (!instance) instance = new CursorSystemImpl();
  return instance;
}
