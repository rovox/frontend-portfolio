# Plan: Genesis Sequence Splash Screen

## Context

Current `LoadingScreen.astro` is a binary CRT-style loader: 3–8s hybrid timer, dispatches `preloader:done`. Functional but minimal — no narrative arc.

The "Genesis Sequence" replaces it with a 5-phase cinematic splash (~50s total, skip at 5s): Void → Emergence → Formation → Fluid Awakening → Reveal/Handoff.

## Scope: Splash Screen ONLY

Build the splash. Do NOT build the hero section. But prepare the handoff so the hero (built later) can hook into splash lifecycle events.

**3 files total — 1 rewrite, 2 new:**

| File | Action | Purpose |
|------|--------|---------|
| `components/LoadingScreen.astro` | **Rewrite** | Splash orchestrator — 5 phases, skip button, master timeline |
| `components/Hero3D/SplashFluid.tsx` | **New** | R3F island — instanced water particles, mouse-driven light |
| `components/effects/SplashFluid.astro` | **New** | Astro wrapper — lazy-loads R3F with `client:only="react"` |

**Zero new dependencies.** All packages already installed.

---

## Architecture

```
Layout.astro (no changes — Lenis, <slot>, lifecycle untouched)
  └─ LoadingScreen.astro  ← REWRITTEN: Phase orchestrator
       ├─ Phases 0-1: pure CSS + Canvas 2D (vanilla, no React)
       ├─ Phase 2: GSAP text animation (vanilla script, gsap-config)
       ├─ Phase 3: lazy R3F island (SplashFluid.astro → SplashFluid.tsx)
       ├─ Phase 4: GSAP reveal → fade splash, show content
       └─ Phase 5: CSS fade-out + DOM removal + dispatch events
```

**Existing infra reused (zero new wiring):**
- `window.__portfolioLoaderDone` / `preloader:done` — dispatched at Phase 5
- `.is-loading` on `<html>`/`<body>` — scroll blocking during splash
- Lenis in `Layout.astro` — starts when `preloader:done` fires (no re-init)
- `utils/gsap-config.ts` — GSAP + ScrollTrigger + defaults
- `utils/reduced-motion.ts` — `prefersReducedMotion()` helper
- `client:only="react"` — mandatory for all React islands

---

## Phase Map

| # | Phase | 0–50s | Tech | Description |
|---|-------|-------|------|-------------|
| 0 | Void | 0–2s | CSS only | `#000` background, 4px white breathing dot |
| 1 | Emergence | 2–8s | Canvas 2D | 200 particles, Brownian from center |
| 2 | Formation | 8–20s | GSAP | Name staggers in char-by-char, subtle float |
| 3 | Fluid | 20–35s | R3F (lazy) | InstancedMesh water sim, mouse light |
| 4 | Reveal | 35–45s | GSAP | Splash fades, content fades in |
| 5 | Handoff | 45–50s | CSS + DOM | Remove splash, dispatch events |

## GSAP SplitText: IMPORTANT

**GSAP SplitText is a Club GreenSock paid plugin.** The project has the free `gsap` package — no SplitText license. Do NOT use it.

**Use vanilla JS text splitting instead.** The existing `components/effects/SplitText.astro` already does this — split text into `.split-item` spans manually. Phase 2 will use the same pattern: `text.split('')` → wrap each character in a `<span class="char">` — then animate those spans with GSAP `fromTo()`.

---

## Handoff Contract: Events the Hero Needs

The hero section (built separately) will hook into these. The splash MUST emit them exactly as specified.

### Event 1: `splash-complete`
**When:** Phase 5 finishes (50s elapsed OR skip clicked)
**Payload:** `{ duration: number, skipped: boolean }`
**Dispatch:**
```js
window.dispatchEvent(new CustomEvent('splash-complete', {
  detail: { duration: elapsedTime, skipped: wasSkipped }
}));
```

### Event 2: `splash-phase-change`
**When:** Each phase starts (0→1→2→3→4→5)
**Payload:** `{ phase: number, phaseName: string }`
**Dispatch:**
```js
window.dispatchEvent(new CustomEvent('splash-phase-change', {
  detail: { phase: 3, phaseName: 'fluid-awakening' }
}));
```

### CSS Class: `.splash-exiting`
**When:** Phase 5 starts (45s)
**Action:** Add to `#splash-container`
**Hero reads this** to begin its entrance animation at 45s (not 50s), creating a seamless overlap.

---

## Phase 5 Handoff Sequence (45s–50s)

Exact sequence at 45s:

```js
// 45s: Signal hero to begin entering
const container = document.getElementById('splash-container');
container?.classList.add('splash-exiting');
window.dispatchEvent(new CustomEvent('splash-phase-change', {
  detail: { phase: 5, phaseName: 'handoff' }
}));

// 45s–50s: Fade splash layers over 5s
gsap.to('#splash-container', {
  opacity: 0,
  duration: 5,
  ease: 'power2.inOut'
});

// 50s: Final cleanup
setTimeout(() => {
  window.__portfolioLoaderDone = true;
  window.dispatchEvent(new CustomEvent('preloader:done'));
  window.dispatchEvent(new CustomEvent('splash-complete', {
    detail: { duration: 50000, skipped: false }
  }));
  document.getElementById('splash-container')?.remove();
  document.documentElement.classList.remove('is-loading');
  document.body.classList.remove('is-loading');
}, 50000);
```

---

## Phase Implementation Details

### Phase 0: Void (0–2s)
- CSS-only. No JS.
- `#splash-container` fixed overlay, background `#000` (matches hero background — seamless cut)
- Centered 4px white dot with `@keyframes breathe`: opacity 0→1→0, scale 0.8→1.2→0.8
- `will-change: opacity, transform` on dot, `transform: translateZ(0)` for GPU layer
- `@media (prefers-reduced-motion: reduce)`: dot static, opacity 1

### Phase 1: Emergence (2–8s)
- Canvas 2D (NOT WebGL — lighter for simple particles)
- 200 particles spawn from center, Brownian motion expands outward
- Canvas resizes on window resize, `devicePixelRatio` scaling
- **Delta clamping**: `const dt = Math.min(delta, 33)` for 30fps fallback
- `requestAnimationFrame` loop, killed when phase ends
- CSS `opacity` transition between phases
- `will-change: transform` on canvas, removed when phase ends

### Phase 2: Formation (8–20s)
- **No GSAP SplitText.** Vanilla JS splits name into `.char` spans:
  ```js
  const text = 'Jose Roberto Vargas Orellana';
  const chars = text.split('').map((c, i) =>
    `<span class="char" style="--i:${i}">${c === ' ' ? '&nbsp;' : c}</span>`
  ).join('');
  ```
- GSAP timeline: particles dissolve → chars stagger in → subtle float
- `stagger: 0.05`, ease `back.out(1.7)` for bouncy entrance
- Floating: `y: 'random(-5, 5)'`, `repeat: -1`, `yoyo: true`
- Reduced motion: chars visible immediately, no animation
- `will-change: transform, opacity` on `.char` elements, removed on complete

### Phase 3: Fluid Simulation (20–35s)
**File: `components/Hero3D/SplashFluid.tsx`**

- R3F `<Canvas>` with: `dpr={[1, 2]}`, `gl={{ antialias: false, alpha: true }}`, `frameloop="always"`
- InstancedMesh: `sphereGeometry(1, 8, 8)`, ~800 instances, 1 draw call
- `useFrame` with **delta clamping**:
  ```ts
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.033); // clamp to 30fps floor
    // ... wave physics using dt instead of delta
  });
  ```
- Wave height: `sin(x * 2 + time * 2) * 0.3 + cos(y * 1.5 + time * 1.5) * 0.2`
- Material: `color="#2de2e6"` (--primary), `roughness: 0.1`, `metalness: 0.8`, `transparent: true`
- Mouse-driven point light via `useFrame` reading `state.mouse`
- **Memory cleanup on unmount** (CRITICAL):
  ```ts
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
      // If using renderer directly: renderer.dispose();
    };
  }, []);
  ```
- Reduced motion: skip rendering, return null or static gradient
- InstancedMesh `instanceMatrix.needsUpdate = true` each frame

**File: `components/effects/SplashFluid.astro`**

Wrapper with lazy loading fallback:
```astro
---
import SplashFluid from '../Hero3D/SplashFluid.tsx';
---
<div id="phase-3-container" class="phase fluid-phase">
  <div class="fluid-fallback">
    <div class="fluid-spinner"></div>
  </div>
  <SplashFluid client:only="react" />
</div>

<style>
  .fluid-fallback {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    background: #000;
    z-index: 1;
  }
  .fluid-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid rgba(45, 226, 230, 0.2);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
```

**Lazy loading**: React.lazy() + dynamic import. R3F chunk loads only when Phase 3 starts (not at page load). The fallback spinner shows while the chunk downloads (especially on slow 3G).

### Phase 4: Reveal (35–45s)
- GSAP timeline: fade out phases 0-2 containers and fluid-fallback
- Fade in `#main-content` (the `.page` div in Layout.astro)
- Does NOT re-initialize Lenis — it already lives in Layout.astro, waiting for `preloader:done`
- `will-change` removed from all splash elements after this phase

### Phase 5: Handoff (45–50s)
- See "Phase 5 Handoff Sequence" section above — exact code
- Dispatch `preloader:done` (triggers Lenis start, HeroSection animation, AudioController)
- Dispatch `splash-complete` (triggers hero entrance animation)
- Remove `.is-loading` from html/body
- Remove `#splash-container` from DOM via `.remove()`

---

## Skip Button

- **Position**: Fixed, `bottom: 2rem`, `right: 2rem`, `z-index: 10001`
- **Visibility**: `opacity: 0` initially. At 5000ms: `transition: opacity 0.5s ease` to `opacity: 1`
- **Style**: Minimal — text "Skip", color `rgba(255,255,255,0.5)`, no border, no background, `font-family: var(--font-mono)`, `font-size: 0.85rem`, cursor pointer
- **Hover**: color → `#fff`
- **Action on click**:
  1. Kill all GSAP timelines
  2. Cancel all `requestAnimationFrame` loops
  3. Dispatch `splash-complete` with `skipped: true`
  4. Dispatch `preloader:done`
  5. Remove `.is-loading` from html/body
  6. Remove `#splash-container` from DOM

---

## Reduced Motion (Accessibility — MANDATORY)

When `prefersReducedMotion()` returns true:
1. Skip Phases 0–4 entirely
2. Show `#splash-container` at `opacity: 1` for 500ms (brief flash of `#000`)
3. Dispatch `preloader:done` immediately
4. Dispatch `splash-complete` with `{duration: 0, skipped: false}`
5. Remove `.is-loading`
6. Remove `#splash-container` from DOM

**CSS guards also required:**
```css
@media (prefers-reduced-motion: reduce) {
  .breathing-dot { animation: none; opacity: 1; }
  .char { opacity: 1; transform: none; animation: none; }
  .fluid-spinner { animation: none; opacity: 0; }
}
```

---

## Anti-Patterns (FORBIDDEN)

- ❌ Importing or initializing Lenis
- ❌ Creating elements with `id="hero"`, `id="main-content"`, or `class="language-toggle"`
- ❌ Importing from `gsap` directly — use `../../utils/gsap-config` only
- ❌ Using GSAP SplitText plugin — vanilla JS text splitting only
- ❌ Keeping splash DOM after `splash-complete` — must `.remove()`
- ❌ Emitting events with wrong names or payloads
- ❌ `client:load` or `client:visible` on R3F — must be `client:only="react"`
- ❌ Unclamped `useFrame` delta — must clamp to 33ms max
- ❌ Missing geometry/material dispose on unmount

---

## Performance Budget

| Metric | Target | How |
|--------|--------|-----|
| Initial JS (Phases 0–2) | < 30KB | Vanilla JS + Canvas 2D. R3F code-split. |
| R3F chunk | Lazy-loaded | `React.lazy()` + dynamic import. Separate bundle. |
| Phase 1 particles | 200 | Canvas 2D, no WebGL overhead |
| Phase 3 particles | 800 | InstancedMesh — 1 draw call total |
| CSS animations | transform + opacity only | `will-change` added/removed per phase |
| DPR cap | [1, 2] | Retina capped at 2x |
| Memory after unmount | 0 retained | `geometry.dispose()`, `material.dispose()`, kill RAF |
| `useFrame` delta | ≤33ms | Clamps physics to 30fps floor |

---

## Acceptance Criteria

1. Splash runs full 50s without console errors
2. Skip button visible at 5s, works at any phase
3. `splash-complete` fires exactly once per session
4. `splash-phase-change` fires exactly 6 times (phases 0–5)
5. `preloader:done` fires at Phase 5 — Lenis starts, HeroSection animates
6. `#splash-container` fully removed from DOM after completion
7. Background remains `#000` throughout — no flash of white
8. R3F chunk lazy-loads at Phase 3 (verify in Network tab)
9. All GSAP timelines killed on skip (no memory leak)
10. `geometry.dispose()` + `material.dispose()` called on unmount
11. `pnpm check` passes, `pnpm build` succeeds
12. Reduced motion skips to content immediately
13. No FOUC, no layout shift during phase transitions
14. `client:only="react"` on R3F island — NO other client directive

---

## Files NOT Modified

- `Layout.astro` — unchanged
- `HeroSection.astro` — unchanged
- `AudioController.tsx` — unchanged
- `Navbar.astro` — unchanged
- `utils/gsap-config.ts` — unchanged
- `utils/reduced-motion.ts` — unchanged
- `astro.config.mjs` — unchanged
- `index.astro` — unchanged

---

## Design Decisions (Resolved)

1. **Hero text**: `"Jose Roberto Vargas Orellana"` (full name)
2. **R3F particle color**: `#2de2e6` (--primary / cyan)
3. **Duration**: 15s total (reduced from 50s — 50s with a 4px dot was imperceptible. Phase 0 breathing dot now 12px with cyan glow + percentage counter for visible feedback.)
4. **Skip button**: Text only ("Skip"), bottom-right, appears at 5s
5. **Phase 2 float**: Keep subtle character float after formation
6. **GSAP SplitText**: Not available (paid). Use vanilla JS text splitting.
7. **Splash background**: `#000` throughout — seamless transition to hero
