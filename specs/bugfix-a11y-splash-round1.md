# Bugfix Round 1 — Splash Freeze, A11y, Light Mode, Rounded Corners, Blog Disable

**Date:** 2026-07-27
**Status:** PENDING USER APPROVAL
**Scope:** Critical bug fixes, accessibility, design-system corrections, blog disable

---

## Summary Table

| # | Issue | File(s) | Fix | Priority |
|---|-------|---------|-----|----------|
| A | Splash freeze on 2nd visit | `LoadingScreen.astro` | Default `display:none`; guard path dispatches `preloader:done` + sets `__portfolioLoaderDone` + removes container; remove leaked listeners; remove matchMedia override; reduced-motion instant-finish; remove console.logs | **P0** |
| B | Typewriter perf + key-click sound | `LoadingScreen.astro` | Single-tween GSAP approach; tiny WebAudio click module (vanilla JS, no Tone.js) | **P1** |
| C | 32 TypeScript errors | `AudioController.tsx`, `package.json`, `HorizontalScroll.tsx`, `MagneticCursor.tsx`, `SplitText.astro`, `Card.astro` | Fix Tone instance types; pin `@types/react` ^18; remove unused `@react-three/drei`; clean unused vars | **P1** |
| D | Light-mode contrast + a11y | `Layout.astro`, `Navbar.astro`, `HeroSection.astro`, `Card.astro`, `blog.astro`, `about.astro`, `Tag.astro`, `ContactSection.astro`, `AudioController.tsx`, `LoadingScreen.astro`, `Layout.astro` (filter script) | New `--accent` token; light-mode overrides for `.btn-primary`, navbar, card hovers, footer-copyright; `aria-pressed` on filter chips; English aria-labels; skip-button `:focus-visible`; `aria-hidden` on decorative scenes | **P1** |
| E | Rounded corners (user override of DESIGN.md) | `Layout.astro`, `DESIGN.md` | New radius scale: sm 0.375rem / md 0.625rem / lg 1rem / xl 1.5rem; update DESIGN.md | **P2** |
| F | Hero vertical alignment vs tide wave | `HeroSection.astro` | Optically center content in clear zone above wave; resolve double-scrub transforms | **P2** |
| G | Duplicate content | `ContactSection.astro`, project `.md` files, `src/pages/projects/project-1.md` | Remove `.cta-links` block; delete 4 duplicated project files (PENDING USER CONFIRM); delete empty `project-1.md` | **P2** |
| H | Blog feature disable | `index.astro`, `Navbar.astro`, `src/pages/blog.astro`, `src/pages/blogs/[...slug].astro` | Comment out Blog nav link; comment out `<LatestPosts />`; replace blog page files with disabled stubs | **P2** |
| I | Download CV button | `HeroSection.astro`, `Navbar.astro` | Centralize CV URL; switch to direct-file link (PENDING USER: file ID) | **P3** |

---

## A. Splash Freeze — CRITICAL FIX

### Root Cause
`LoadingScreen.astro` `.splash-container` has `position:fixed; inset:0; z-index:9999; background:#000` with **no `display:none` default**. On 2nd visit (sessionStorage `'splashShown'` set), the IIFE returns early → black overlay stays forever, `preloader:done` never dispatched, `__portfolioLoaderDone` never set → Lenis never starts, navbar overlay never initializes, all section cards stay `opacity:0`, TideEffect never mounts. Total freeze.

### Changes

#### 1. CSS: default hidden state
```css
/* In <style is:global> */
.splash-container {
  /* ADD: */
  display: none;
}
```

#### 2. Script: guard path must finalize lifecycle
Replace the early-return block:
```js
// BEFORE (broken):
if (sessionStorage.getItem('splashShown')) {
  console.log('[SPLASH] Skipped — already shown this session');
  return;
}

// AFTER (fixed):
if (sessionStorage.getItem('splashShown')) {
  var container = document.getElementById('splash-container');
  if (container) container.remove();
  document.body.classList.remove('splash-active');
  var mainContent = document.getElementById('main-content');
  if (mainContent) mainContent.style.visibility = 'visible';
  window.__portfolioLoaderDone = true;
  window.dispatchEvent(new CustomEvent('preloader:done'));
  return;
}
```

#### 3. Script: show splash explicitly
```js
// BEFORE:
document.getElementById('splash-container').style.display = 'block';

// AFTER (container defaults to display:none, set to flex/block when playing):
var splashEl = document.getElementById('splash-container');
splashEl.style.display = 'flex';
```

#### 4. Script: remove matchMedia monkey-patch (WCAG 2.3.3 violation)
Delete the entire block:
```js
// DELETE:
let _splashOverrideActive = true;
const _originalMatchMedia = window.matchMedia.bind(window);
window.matchMedia = function (query) { ... };
```
And in `finishSplash()`, delete:
```js
_splashOverrideActive = false;
window.matchMedia = _originalMatchMedia;
```

#### 5. Script: reduced-motion instant-finish path
After the guard check, before `lockScroll()`:
```js
var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) {
  finishSplash();
  return;
}
```
This skips the 7s animation entirely for reduced-motion users.

#### 6. Script: fix leaked scroll-lock listeners
Store listener references so they can be removed:
```js
function lockScroll() {
  var scrollY = window.scrollY;
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';

  function preventScroll(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
  function blockKeys(e) {
    var keys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', ' ', 'Home', 'End'];
    if (keys.includes(e.key)) e.preventDefault();
  }

  window.addEventListener('wheel', preventScroll, { passive: false });
  window.addEventListener('touchmove', preventScroll, { passive: false });
  window.addEventListener('keydown', blockKeys);

  // Store for cleanup
  window.__splashScrollListeners = { preventScroll, blockKeys };
}

function unlockScroll() {
  var scrollY = parseInt(document.body.style.top || '0') * -1;
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  window.scrollTo(0, scrollY);

  // Remove leaked listeners
  var listeners = window.__splashScrollListeners;
  if (listeners) {
    window.removeEventListener('wheel', listeners.preventScroll);
    window.removeEventListener('touchmove', listeners.preventScroll);
    window.removeEventListener('keydown', listeners.blockKeys);
    delete window.__splashScrollListeners;
  }
}
```

#### 7. Script: remove all `console.log` statements
Delete all `console.log('[SPLASH]...')` calls throughout the IIFE.

#### 8. CSS: remove reduced-motion override hack
Delete this block from `<style>`:
```css
/* DELETE — this was the matchMedia override enabler */
.splash-container,
.splash-container *,
.splash-container *::before,
.splash-container *::after {
  animation-duration: inherit !important;
  transition-duration: inherit !important;
}
```

#### 9. Accessibility: `aria-hidden` on decorative scenes
```html
<div id="scene-1" class="scene" aria-hidden="true">...</div>
<div id="scene-2" class="scene terminal-scene" aria-hidden="true">...</div>
<div id="scene-3" class="scene" aria-hidden="true">...</div>
```
The container itself gets `role="status"` and `aria-label="Loading animation"`:
```html
<div id="splash-container" class="splash-container" role="status" aria-label="Loading animation">
```

#### 10. Skip button `:focus-visible`
Add to `<style>`:
```css
.skip-splash:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
  color: #fff;
  opacity: 1;
}
```

### Acceptance Criteria
- [ ] Fresh tab load: splash plays normally (~7s), then disappears; main content visible; Lenis active; navbar works; all section cards animate in.
- [ ] Navigate to `/blog/` (or any sub-page), then return to `/`: no black overlay; page fully interactive immediately.
- [ ] Open site in a new tab (same session): no splash; page renders instantly.
- [ ] `prefers-reduced-motion: reduce` enabled: splash skipped entirely, page renders immediately.
- [ ] After splash completes, `window.__portfolioLoaderDone === true`.
- [ ] After splash completes, no leaked wheel/touchmove/keydown listeners (verify via DevTools > Event Listeners on `window`).
- [ ] No `console.log` output from splash script in production.
- [ ] Skip button reachable via Tab; visible `:focus-visible` outline.
- [ ] Escape key still skips splash.

---

## B. Typewriter Performance + Key-Click Sound

### B1. Single-Tween Typewriter

Replace `typeTextTimeline()`:
```js
// BEFORE: N closures via tl.call() per character
function typeTextTimeline(element, text, duration) {
  var tl = gsap.timeline();
  element.textContent = '';
  var charDuration = duration / text.length;
  for (var i = 0; i < text.length; i++) {
    tl.call((function(ch) { return function() { element.textContent += ch; }; })(text[i]), null, i * charDuration);
  }
  return tl;
}

// AFTER: single numeric tween
function typeTextTimeline(element, text, duration) {
  var tl = gsap.timeline();
  element.textContent = '';
  var state = { progress: 0 };
  tl.to(state, {
    progress: text.length,
    duration: duration,
    ease: 'none',
    onUpdate: function () {
      var idx = Math.floor(state.progress);
      element.textContent = text.substring(0, idx);
      // Fire click sound on each new character
      if (idx > (state._lastIdx || 0)) {
        for (var k = (state._lastIdx || 0); k < idx; k++) {
          typewriterClick();
        }
      }
      state._lastIdx = idx;
    },
  });
  return tl;
}
```

### B2. WebAudio Click Module (vanilla JS, no Tone.js)

Add at the top of the `<script>` block:
```js
// ── Typewriter Click Sound ──
var _clickCtx = null;
var _clickGain = null;

function typewriterClick() {
  try {
    if (!_clickCtx) {
      _clickCtx = new (window.AudioContext || window.webkitAudioContext)();
      _clickGain = _clickCtx.createGain();
      _clickGain.gain.value = 0.06;
      _clickGain.connect(_clickCtx.destination);
    }
    if (_clickCtx.state === 'suspended') {
      // Will resume on user gesture; silently no-op
      return;
    }
    var now = _clickCtx.currentTime;
    // Short square-wave blip, 20-40ms, random pitch 1800-2600Hz
    var osc = _clickCtx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 1800 + Math.random() * 800;
    var env = _clickCtx.createGain();
    env.gain.setValueAtTime(0.08, now);
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    osc.connect(env);
    env.connect(_clickGain);
    osc.start(now);
    osc.stop(now + 0.035);
  } catch (e) {
    // Silently fail — audio is non-critical
  }
}

// Resume AudioContext on first user gesture
function _resumeClickCtx() {
  if (_clickCtx && _clickCtx.state === 'suspended') {
    _clickCtx.resume();
  }
}
window.addEventListener('pointerdown', _resumeClickCtx, { once: true });
window.addEventListener('keydown', _resumeClickCtx, { once: true });
```

**Cleanup on finish/skip:**
In `finishSplash()`, add:
```js
if (_clickCtx) {
  _clickCtx.close();
  _clickCtx = null;
  _clickGain = null;
}
window.removeEventListener('pointerdown', _resumeClickCtx);
window.removeEventListener('keydown', _resumeClickCtx);
```

### Design Decisions — Sound
- **No Tone.js dependency** — LoadingScreen is vanilla JS; adding Tone.js for click sounds would be ~200KB for no benefit.
- **Sound character:** Square-wave blip, 20-35ms, pitch randomized 1800-2600Hz, gain ~0.06-0.08. Sounds like a mechanical typewriter key strike — short, crisp, slightly different pitch each hit.
- **Volume:** Very quiet (gain 0.06). Not annoying over 7 seconds of typing.
- **prefers-reduced-motion:** Sound is NOT motion. It is kept enabled regardless of motion preference. However, if the user's OS has a "reduce sounds" or similar accessibility setting, the AudioContext approach still works — we don't gate on motion preference.
- **AudioContext lifecycle:** Lazy creation on first `typewriterClick()` call. If suspended (no user gesture yet), silently no-ops. Resume attempted on first `pointerdown`/`keydown`. Closed on splash finish/skip.

### Acceptance Criteria
- [ ] Typewriter animation uses ONE tween per text line (verify in DevTools: 3 tweens total for 3 lines, not N closures per character).
- [ ] Each newly typed character produces an audible click (test with sound on).
- [ ] Click sound stops when splash finishes or is skipped.
- [ ] No errors in console if AudioContext fails to create.
- [ ] AudioContext is closed after splash (verify in DevTools > Web Audio).

---

## C. TypeScript Errors

### C1. AudioController.tsx — Tone instance types (18 errors)

The `toneRef` type uses class types (`ToneModule['AMSynth']`) instead of instance types. Fix:

```ts
// BEFORE:
const toneRef = useRef<{
  bassSynth: ToneModule['AMSynth'] | null;
  leadSynth: ToneModule['Synth'] | null;
  drumSynth: ToneModule['NoiseSynth'] | null;
  loop: ToneModule['Loop'] | null;
  reverb: ToneModule['Reverb'] | null;
  bitCrusher: ToneModule['BitCrusher'] | null;
  filter: ToneModule['Filter'] | null;
  analyzer: ToneModule['Analyser'] | null;
  meterInterval: number | null;
}>

// AFTER:
const toneRef = useRef<{
  bassSynth: InstanceType<ToneModule['AMSynth']> | null;
  leadSynth: InstanceType<ToneModule['Synth']> | null;
  drumSynth: InstanceType<ToneModule['NoiseSynth']> | null;
  loop: InstanceType<ToneModule['Loop']> | null;
  reverb: InstanceType<ToneModule['Reverb']> | null;
  bitCrusher: InstanceType<ToneModule['BitCrusher']> | null;
  filter: InstanceType<ToneModule['Filter']> | null;
  analyzer: InstanceType<ToneModule['Analyser']> | null;
  meterInterval: number | null;
}>
```

### C2. AudioController.tsx — `togglePlay` uses bare `Tone.Transport`

```ts
// BEFORE (runtime crash):
if (isPlaying) {
  Tone.Transport.pause();
  setIsPlaying(false);
} else {
  Tone.Transport.start();
  setIsPlaying(true);
}

// AFTER:
const Tone = toneModuleRef.current;
if (!Tone) return;
if (isPlaying) {
  Tone.Transport.pause();
  setIsPlaying(false);
} else {
  Tone.Transport.start();
  setIsPlaying(true);
}
```

### C3. package.json — pin @types/react to ^18 + remove drei

```jsonc
// BEFORE:
"@react-three/drei": "^10.7.7",
"@types/react": "^19.2.14",
"@types/react-dom": "^19.2.3",

// AFTER:
// Remove: "@react-three/drei" (unused in src/)
"@types/react": "^18.3.1",
"@types/react-dom": "^18.3.1",
```

**Rationale:** `@react-three/fiber@8.18.0` augments the global JSX namespace which `@types/react@19` removed. React 18.3.1 is the runtime (per AGENTS.md). Pinning `@types/react` to ^18 restores the global JSX namespace. `@react-three/drei` is not imported anywhere in `src/` — it's dead weight and its peer deps want fiber ^9 + react ^19.

**Command:**
```bash
pnpm remove @react-three/drei
pnpm add -D @types/react@^18.3.1 @types/react-dom@^18.3.1
```

### C4. Unused variable warnings

| File | Issue | Fix |
|------|-------|-----|
| `effects/HorizontalScroll.tsx` | Unused `ScrollTrigger` import | **DEFERRED** — component is unreferenced; propose deletion in a separate cleanup PR. For now, remove the unused import: `import { gsap } from '../../utils/gsap-config';` (drop ScrollTrigger). |
| `effects/MagneticCursor.tsx` | Unused `isHovering` state | Remove `const [isHovering, setIsHovering] = useState(false);` and all `setIsHovering(...)` calls. |
| `effects/SplitText.astro` | Unused `i` and `Props` | Remove `i: number` from the map callback (use `_i` or just remove). `Props` is used implicitly by `Astro.props` — the warning is from the explicit `interface Props` not being referenced by name. Prefix with underscore or leave (cosmetic). |
| `ui/Card.astro` | Unused `Props` | Same as SplitText — `Props` is used implicitly. Prefix with underscore or leave. |

**Decision:** Fix `HorizontalScroll.tsx` import and `MagneticCursor.tsx` unused state. Leave `Props` warnings in `SplitText.astro` and `Card.astro` as cosmetic (they don't break builds).

### Acceptance Criteria
- [ ] `pnpm check` passes with 0 errors.
- [ ] `pnpm build` succeeds.
- [ ] AudioController pause/play works without runtime crash.
- [ ] TideEffect.tsx and SplashFluid.tsx compile without JSX errors.

---

## D. Accessibility + Dark/Light Mode Design Bugs

### D1. New token: `--accent`

`Tag.astro` uses `var(--accent)` which is **not defined anywhere**. Define it:

```css
/* In :root (dark mode) */
--accent: #8f6bff;  /* Purple accent for tag variant */

/* In :root[data-theme="light"] */
--accent: #6d28d9;  /* Darker purple for light-mode contrast */
```

### D2. Light-mode accessible cyan approach

**Problem:** `.btn-primary` uses `var(--primary-container)` = `#10b8c4` for text + border on `#faf6f1` background → ~2.4:1 contrast (fails WCAG 4.5:1 for text, fails 3:1 for UI components).

**Design Decision — Two-tier approach:**

1. **Text:** In light mode, interactive cyan text (`.btn-primary` text, `.hero-label`, `.prompt-arrow`, `.line-hash`, `.cursor-blink`, `.scanner-line`) should use `var(--primary)` = `#0c4a6e` (already defined, 8.5:1 contrast on `#faf6f1` — passes AAA).

2. **Borders/UI components:** `#10b8c4` on `#faf6f1` ≈ 2.4:1, fails the 3:1 non-text contrast requirement (WCAG 1.4.11). Introduce a new token `--primary-container-strong` for light mode:
   ```css
   /* Light mode override */
   :root[data-theme="light"] {
     --primary-container: #0e7490;  /* Darker cyan for borders — 4.6:1 on #faf6f1 */
   }
   ```
   **Wait — this changes `--primary-container` globally in light mode.** Currently it's used for hover borders, active states, etc. Changing it to `#0e7490` affects all those uses. Let me verify this is acceptable:
   - `.btn-primary` border → `#0e7490` on `#faf6f1` = 4.6:1 ✓
   - `.filter-chip.is-active` border → `#0e7490` ✓
   - `.nav-link:hover` color → `#0e7490` — acceptable (darker cyan, still reads as "cyan")
   - `.card-glow:hover` border → `#0e7490` ✓
   - `.scanner-line` background → `#0e7490` — acceptable
   - `.scroll-arrow` border → `#0e7490` ✓
   - `.cursor-blink` color → needs to be `var(--primary)` for text contrast

   **Decision:** Change `--primary-container` in light mode from `#10b8c4` to `#0e7490`. This is the cleanest approach — one token change fixes all contrast issues. The hue is the same (183°), just darker.

   **Update DESIGN.md** to reflect: "Primary Container (light): #0e7490 — Darker cyan for borders, icons, and active states on light backgrounds. 4.6:1 contrast on #faf6f1."

3. **Text-specific overrides** (where `--primary-container` was used as text color):
   - `.hero-label` → change from `color: var(--primary-container)` to `color: var(--primary)` in light mode. Actually, `.hero-label` uses `var(--primary-container)` which will now be `#0e7490` — that's 4.6:1, passes AA for large text but not small text (needs 4.5:1). `#0e7490` on `#faf6f1` is 4.6:1 — passes AA for normal text too.
   - `.prompt-arrow`, `.line-hash`, `.cursor-blink` → same token, same result.
   - `.scanner-line` → non-text, 3:1 requirement → `#0e7490` passes.

   **Final decision:** Simply change `--primary-container` in light mode to `#0e7490`. No per-component overrides needed for most cases. The only exception is `.btn-primary` text — it uses `color: var(--primary-container)` which will now be `#0e7490` (4.6:1 — passes). Good.

   **Actually, wait.** Let me re-check: the DESIGN.md says:
   > Primary (#0c4a6e): Dark cyan for text on light backgrounds.
   > Primary Container (#10b8c4): Cyan at 42% lightness. Used for borders, icons, and active states only — never as text on light backgrounds.

   So DESIGN.md already says `--primary-container` should NOT be used as text in light mode. But the current code uses it as text in `.btn-primary`, `.hero-label`, etc. The fix should be:
   - Keep `--primary-container: #10b8c4` in light mode (for borders, icons).
   - But `#10b8c4` on `#faf6f1` fails 3:1 for non-text UI components too.
   - **So we need a darker border token.**

   **Revised approach:**
   - Keep `--primary-container: #10b8c4` in light mode (matches DESIGN.md).
   - Introduce `--primary-container-strong: #0e7490` for light mode only, used where `#10b8c4` fails contrast.
   - Override `.btn-primary` text color in light mode to use `var(--primary)` = `#0c4a6e`.
   - Override `.btn-primary` border in light mode to use `var(--primary-container-strong)`.
   - Override `.hero-label`, `.prompt-arrow`, `.line-hash`, `.cursor-blink`, `.scanner-line` in light mode to use `var(--primary)` for text, `var(--primary-container-strong)` for non-text.

   **Actually, this is getting complex.** Let me simplify:

   **Simplest correct approach:** Change `--primary-container` in light mode to `#0e7490`. Yes, DESIGN.md says it should be `#10b8c4`, but DESIGN.md also says it should never be used as text — yet the codebase uses it as text everywhere. The pragmatic fix is to make the token itself accessible. Update DESIGN.md to match reality.

   **FINAL DECISION:** Change `--primary-container` in light mode from `#10b8c4` to `#0e7490`. Update DESIGN.md accordingly. This single change fixes all contrast issues without per-component overrides.

### D3. Light-mode overrides — CSS changes

#### Layout.astro `:root[data-theme="light"]`
```css
:root[data-theme="light"] {
  /* CHANGE: */
  --primary-container: #0e7490;  /* was #10b8c4 — now 4.6:1 on #faf6f1 */

  /* ADD (new token for accent variant): */
  --accent: #6d28d9;
}
```

#### Layout.astro — `.btn-primary` light-mode text
```css
/* ADD after existing light overrides */
:root[data-theme="light"] .btn-primary {
  color: var(--primary);  /* #0c4a6e — 8.5:1 on #faf6f1 */
}
:root[data-theme="light"] .btn-primary:hover {
  color: var(--primary);
  background: rgba(14, 116, 144, 0.08);
}
```

#### Layout.astro — `.card-glow:hover` light override
```css
:root[data-theme="light"] .card-glow:hover {
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06), 0 8px 32px rgba(0, 0, 0, 0.06);
}
```

#### Navbar.astro — light-mode glass
```css
/* ADD in <style> */
:root[data-theme="light"] .nav {
  background: rgba(255, 255, 255, 0.85);
}
:root[data-theme="light"] .nav-overlay {
  background: rgba(250, 246, 241, 0.95);
}
```

#### HeroSection.astro — `.prompt-path` hardcoded color
```css
/* BEFORE: */
.prompt-path {
  color: #b5b8c1;
}

/* AFTER: */
.prompt-path {
  color: var(--muted);
}
```

#### HeroSection.astro — light-mode text overrides
```css
/* ADD */
:root[data-theme="light"] .hero-label {
  color: var(--primary);
}
:root[data-theme="light"] .prompt-arrow,
:root[data-theme="light"] .line-hash {
  color: var(--primary-container);  /* now #0e7490 — passes 3:1 */
}
:root[data-theme="light"] .cursor-blink {
  color: var(--primary-container);
}
:root[data-theme="light"] .scanner-line {
  background: var(--primary-container);
}
:root[data-theme="light"] .scroll-arrow {
  border-color: var(--primary-container);
}
```

#### Card.astro — `.card-glow:hover` light override
```css
/* ADD */
:root[data-theme="light"] .card-glow:hover {
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}
```

#### blog.astro — `.blog-link:hover` light override
```css
/* ADD */
:root[data-theme="light"] .blog-link:hover :global(.card-ui) {
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}
```

#### about.astro — `.about-card:hover` light override
```css
/* ADD */
:root[data-theme="light"] .about-card:hover {
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}
```

#### ContactSection.astro — `.footer-copyright` hardcoded color
```css
/* BEFORE: */
.footer-copyright {
  color: rgba(185, 202, 203, 0.4);
}

/* AFTER: */
.footer-copyright {
  color: color-mix(in srgb, var(--muted) 50%, transparent);
}
```
This gives ~50% opacity of `var(--muted)` — adapts to both themes. In dark mode: `rgba(185, 202, 203, 0.5)` ≈ original. In light mode: `rgba(92, 109, 128, 0.5)` — visible.

#### AudioController.tsx — theme-aware inline styles
Replace hardcoded dark colors with CSS variables:
```tsx
// BEFORE:
style={{
  background: 'rgba(10, 16, 28, 0.85)',
  border: '1px solid rgba(45, 226, 230, 0.3)',
  // ...
}}

// AFTER:
style={{
  background: 'var(--surface)',
  border: '1px solid color-mix(in srgb, var(--primary-container) 30%, transparent)',
  // ...
}}
```
Also fix button border:
```tsx
// BEFORE:
border: '1px solid rgba(45, 226, 230, 0.4)',
// AFTER:
border: '1px solid color-mix(in srgb, var(--primary-container) 40%, transparent)',
```
And hover states:
```tsx
// BEFORE:
onMouseEnter={(e) => {
  e.currentTarget.style.background = 'rgba(45, 226, 230, 0.1)';
  e.currentTarget.style.borderColor = 'rgba(45, 226, 230, 0.7)';
}}
// AFTER:
onMouseEnter={(e) => {
  e.currentTarget.style.background = 'color-mix(in srgb, var(--primary-container) 10%, transparent)';
  e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--primary-container) 70%, transparent)';
}}
```

#### AudioController.tsx — English aria-labels
```tsx
// BEFORE:
aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
// AFTER:
aria-label={isPlaying ? 'Pause music' : 'Play music'}

// BEFORE:
aria-label="Volumen"
// AFTER:
aria-label="Volume"

// BEFORE:
<span>🔊 Click para música</span>
// AFTER:
<span>🔊 Click for music</span>
```

### D4. Filter chips — `aria-pressed`

In `Layout.astro` shared filter script, update `onClick`:
```js
const onClick = (e: Event) => {
  const chip = e.currentTarget as HTMLElement;
  const filter = chip.dataset.filter || 'all';
  chips.forEach((c) => {
    c.classList.remove('is-active');
    c.setAttribute('aria-pressed', 'false');
  });
  chip.classList.add('is-active');
  chip.setAttribute('aria-pressed', 'true');
  items.forEach((item) => {
    const tags = item.dataset.tags || '';
    const show = filter === 'all' || tags.includes(filter);
    item.classList.toggle('is-hidden', !show);
  });
};
```
Also set initial `aria-pressed` on the "All" chip (the one that starts active):
```js
chips.forEach((chip) => {
  chip.addEventListener('click', onClick);
  chip.setAttribute('aria-pressed', chip.classList.contains('is-active') ? 'true' : 'false');
});
```

### D5. LoadingScreen — `aria-hidden` on scenes
(Already covered in Section A.9)

### Acceptance Criteria
- [ ] Light mode: `.btn-primary` text passes WCAG AA (4.5:1) — verify with a contrast checker.
- [ ] Light mode: all cyan borders/icons pass 3:1 non-text contrast.
- [ ] Light mode: navbar background is light glass (not dark).
- [ ] Light mode: `.prompt-path` uses `var(--muted)`, not hardcoded `#b5b8c1`.
- [ ] Light mode: `.footer-copyright` is visible (not invisible-ish).
- [ ] Light mode: card hover backgrounds are white, not dark navy.
- [ ] AudioController: inline styles use CSS variables; switches correctly on theme toggle.
- [ ] AudioController: aria-labels are in English.
- [ ] Filter chips: `aria-pressed` toggles correctly (verify with screen reader or DevTools).
- [ ] `--accent` token resolves (Tag.astro `.tag-accent` renders with purple color).

---

## E. Rounded Corners

### Design Decision

**Current scale (DESIGN.md "sharp geometric"):**
- sm: 0.125rem (2px)
- DEFAULT: 0.25rem (4px)
- md: 0.375rem (6px)
- lg: 0.5rem (8px)
- xl: 0.75rem (12px)

**Proposed new scale (visibly rounded, professional):**
- sm: 0.375rem (6px) — tags, small chips
- md: 0.625rem (10px) — buttons, inputs, theme toggle
- lg: 1rem (16px) — cards, terminal, photo
- xl: 1.5rem (24px) — large containers
- full: 9999px — pills (unchanged)

**Rationale:** This is a "softened professional" scale — noticeably rounded but not bubbly. It's similar to what Linear, Vercel, and Raycast use. The ratios are roughly 1:1.67:2.67:4 which maintains visual harmony.

### CSS Changes

#### Layout.astro `:root`
```css
/* BEFORE: */
--radius-sm: 0.125rem;
--radius-md: 0.25rem;
--radius-lg: 0.5rem;
--radius-xl: 0.75rem;

/* AFTER: */
--radius-sm: 0.375rem;
--radius-md: 0.625rem;
--radius-lg: 1rem;
--radius-xl: 1.5rem;
```

### Consumer Audit (token-only change is sufficient)

| Component | Token Used | New Value | Notes |
|-----------|-----------|-----------|-------|
| `.btn` | `--radius-md` | 10px | Buttons get soft rounding |
| `.glass-card` | `--radius-lg` | 16px | Cards get visible rounding |
| `.card-ui` (Card.astro) | `--radius-lg` | 16px | Same |
| `.tag-ui` (Tag.astro) | `--radius-sm` | 6px | Tags get subtle rounding |
| `.theme-toggle` | `--radius-md` | 10px | Matches buttons |
| `.hero-photo` | `--radius-lg` | 16px | Photo gets soft corners |
| `.filter-chip` | `--radius-full` | 9999px | Unchanged (pill) |
| `.about-card` | `--radius-lg` | 16px | Matches cards |
| `.skills-list li` | `--radius-md` | 10px | Matches buttons |
| AudioController | hardcoded `0.5rem` | — | **Needs fix:** change to `var(--radius-lg)` |
| AudioController button | hardcoded `0.3rem` | — | **Needs fix:** change to `var(--radius-sm)` |

### DESIGN.md Update
Update the `rounded` section in the YAML frontmatter:
```yaml
rounded:
  sm: 0.375rem
  DEFAULT: 0.625rem
  md: 0.625rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
```
And update the "Shapes" section prose:
> **Corners:** Use "Soft" (0.625rem) rounding for standard buttons and input fields. Large project cards use `rounded-lg` (1rem). Tags and chips use `rounded-sm` (0.375rem).

### Acceptance Criteria
- [ ] Buttons, cards, tags, photo, theme toggle all show visibly rounded corners.
- [ ] No component looks "too round" (pill-shaped) unless it uses `--radius-full`.
- [ ] DESIGN.md matches the new values.
- [ ] AudioController inline radii use CSS variable tokens.

---

## F. Hero Vertical Alignment vs Tide Wave

### Problem
- TideEffect canvas: fixed, bottom 30vh, z-index 5, renders above hero content (z-index 1).
- HeroSection: `min-height: 100dvh`, `justify-content: center`, `padding-top/bottom: 10vh` (12vh ≥1040px).
- Content center ≈ 50vh → lower elements (terminal card, scroll-indicator at `bottom: 2rem`) collide with the top 30vh wave zone.
- **Double scrub:** ParallaxLayer wraps HeroSection (speed -0.3, y scrub) AND HeroSection's own `scrollTL` moves `.hero .container` y:-60 + fade — compounded transforms.

### Design Decision

**Hero content alignment:** Content should be optically centered in the clear zone above the wave (top ~62vh of viewport).

**Approach:**
```css
.hero {
  min-height: 100dvh;
  justify-content: center;
  padding-top: 10vh;
  padding-bottom: max(30vh, 10vh);  /* Push content up above the wave */
}
```
This makes flex-centering happen within the region above the tide wave. The content stays in the "clear" zone.

**Scroll indicator:** Keep at `bottom: 2rem` but give it `z-index: 6` (above the wave canvas at z-index 5). The wave is translucent, so content behind it is fine, but the scroll indicator must remain clearly visible.

```css
.scroll-indicator {
  z-index: 6;  /* Above tide canvas (z-index 5) */
}
```

**Double-scrub resolution:**
- **Decision:** Remove HeroSection's internal `scrollTL` (the one that fades/slides `.hero .container`). Keep ParallaxLayer as the sole scroll effect.
- **Reason:** ParallaxLayer already provides the parallax y-translation. The inner scrollTL is redundant and compounds the effect (content moves twice as fast as intended).
- **Exception:** Keep a tiny scrub for `.scroll-indicator` fade-out only (ParallaxLayer doesn't handle the scroll-indicator specifically). Actually, ParallaxLayer wraps the entire HeroSection including the scroll-indicator, so the indicator will also parallax. We just need to fade it out. Add a minimal scrollTrigger for the indicator only:

```js
// In HeroSection.astro <script>, replace the scrollTL block:
// BEFORE:
scrollTL = gsap.timeline({
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
  },
});
scrollTL.to('.hero .container', { y: -60, opacity: 0.3, ease: 'none' }, 0);
scrollTL.to('.scroll-indicator', { opacity: 0, y: -20, ease: 'none' }, 0);

// AFTER:
scrollTL = gsap.timeline({
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: '60% top',
    scrub: true,
  },
});
scrollTL.to('.scroll-indicator', { opacity: 0, ease: 'none' }, 0);
// No container transform — ParallaxLayer handles that
```

### Responsive Behavior
- On short screens (< 600px height), content may flow taller than 100dvh. `min-height: 100dvh` handles this — the section expands, and the `padding-bottom: max(30vh, 10vh)` ensures the wave zone is always reserved.
- On very wide screens (≥1040px), `padding-top: 12vh` already applies; keep that. The `padding-bottom` should also scale: `max(30vh, 12vh)` → always 30vh on desktop.

### Acceptance Criteria
- [ ] Hero content is visually centered above the tide wave (not overlapping).
- [ ] Scroll indicator is visible and above the wave canvas.
- [ ] No double-parallax effect on hero content (only ParallaxLayer moves it).
- [ ] Scroll indicator fades out on scroll.
- [ ] On short viewports, content doesn't collide with the wave.

---

## G. Duplicate Content

### G1. ContactSection — remove `.cta-links` block

Remove lines 66-78 in `ContactSection.astro`:
```html
<!-- DELETE this block: -->
<div class="cta-links">
  {socialLinks.map((link) => (
    <a href={link.href} class="cta-link" {...linkAttrs(link.href)}>
      {link.label}
    </a>
  ))}
</div>
```
And remove the CSS for `.cta-links` and `.cta-link` (lines 235-261).

**Keep:** `.cta-buttons` (Gmail + WhatsApp) and `.footer-links` (all 4 social links in footer).

### G2. Duplicate project files — PENDING USER CONFIRMATION

The following project files duplicate experience entries:
- `src/content/projects/ark-studio-3d.md` ↔ `src/content/experiences/tilinka-ark-studio/*`
- `src/content/projects/corporate-website.md` ↔ `src/content/experiences/tilinka-corporate/*`
- `src/content/projects/pictoaudios-platform.md` ↔ `src/content/experiences/pictoaudios/*`
- `src/content/projects/silloroll-mobile.md` ↔ `src/content/experiences/silloroll/*`

**Proposal:** Delete these 4 project files. Keep unique projects:
- `enterprise-fitness-app.md`
- `rosca-smart-contracts.md`

**⚠️ PENDING USER CONFIRMATION** — do not delete until user approves.

### G3. Empty project file
Delete `src/pages/projects/project-1.md` (0 bytes, creates empty route `/projects/project-1/`).

### Acceptance Criteria
- [ ] ContactSection renders CTA buttons + footer links only (no middle `.cta-links` block).
- [ ] No duplicate project/experience entries on the site (pending user confirm for G2).
- [ ] `/projects/project-1/` route no longer exists.

---

## H. Blog Feature Disable

### Approach
Comment out (not delete) per user's explicit request.

### H1. `src/pages/index.astro`
```astro
<!-- BEFORE: -->
import LatestPosts from '../components/LatestPosts.astro';
<!-- ... -->
<LatestPosts />

<!-- AFTER: -->
<!-- import LatestPosts from '../components/LatestPosts.astro'; -->
<!-- ... -->
<!-- <LatestPosts /> -->
```
**Note:** Astro doesn't support `//` comments in frontmatter. Use `/* */` for frontmatter:
```astro
---
/* import LatestPosts from '../components/LatestPosts.astro'; */
---
```
And HTML comment for template:
```astro
<!-- <LatestPosts /> -->
```

### H2. `src/components/Navbar.astro`
Comment out the Blog entry in `navLinks`:
```js
const navLinks = [
  { href: '/#work', label: 'Work' },
  { href: '/#skills', label: 'Skills' },
  { href: '/#experience', label: 'Experience' },
  { href: '/#education', label: 'Education' },
  // { href: '/blog/', label: 'Blog' },  // Blog disabled
  { href: '/#contact', label: 'Contact' },
];
```

### H3. `src/pages/blog.astro`
Replace entire file content with a disabled stub:
```astro
---
// Blog page — disabled. Re-enable by restoring from git history.
---
<!-- Blog is currently disabled. -->
```

### H4. `src/pages/blogs/[...slug].astro`
Same approach:
```astro
---
// Blog slug page — disabled. Re-enable by restoring from git history.
---
<!-- Blog is currently disabled. -->
```

### What stays in repo (unused but recoverable)
- `src/components/LatestPosts.astro`
- `src/components/BlogLayout.astro` (if exists)
- `src/content/blog/*.md`
- `src/content.config.ts` blog collection definition

### Acceptance Criteria
- [ ] No `<LatestPosts />` section on homepage.
- [ ] No "Blog" link in navbar (desktop or mobile).
- [ ] `/blog/` route returns empty/disabled page (not a 404, not a crash).
- [ ] `/blogs/[slug]/` routes return empty/disabled page.
- [ ] All blog-related files still exist in repo (recoverable via git).

---

## I. Download CV Button

### Problem
Three locations link to a Google Drive **folder**: `https://drive.google.com/drive/folders/1KcNrxqSg8towANTFRmfrMF6POSGxYoZo?usp=sharing`
Folder links don't download anything — likely why user says "doesn't load".

### Fix
1. Create a shared constant in a new file `src/config.ts`:
```ts
// src/config.ts
export const CV_URL = 'https://drive.google.com/uc?export=download&id=FILE_ID';
// ⚠️ PENDING USER: Replace FILE_ID with the actual Google Drive file ID.
// Interim fallback (folder link):
// export const CV_URL = 'https://drive.google.com/drive/folders/1KcNrxqSg8towANTFRmfrMF6POSGxYoZo?usp=sharing';
```

2. Update consumers:
- `HeroSection.astro` line 56: `href={CV_URL}`
- `Navbar.astro` line 44: `href={CV_URL}`
- `Navbar.astro` line 78: `href={CV_URL}`

**⚠️ PENDING USER INPUT:** Need the actual Google Drive **file ID** (not folder ID) for the CV PDF. The file ID is in the share URL: `https://drive.google.com/file/d/FILE_ID/view`.

### Acceptance Criteria
- [ ] Single source of truth for CV URL (`src/config.ts`).
- [ ] All three CV links use the same constant.
- [ ] CV link triggers a download (not a folder view) — pending file ID from user.

---

## Out of Scope (Deferred)

| Item | Reason |
|------|--------|
| `zod` deprecation warnings in `content.config.ts` | Cosmetic; `z` still works in Astro 6. No runtime impact. |
| `HorizontalScroll.tsx` deletion | Component is unreferenced but may be planned for future use. Defer to separate cleanup PR. |
| `SplitText.astro` / `Card.astro` unused `Props` warnings | Astro implicitly uses `Props` via `Astro.props`. Warning is cosmetic. |

---

## Execution Order (Recommended)

1. **A** — Splash freeze (P0, unblocks everything)
2. **C** — TypeScript errors (P1, unblocks build)
3. **D** — A11y + light mode (P1)
4. **E** — Rounded corners (P2, quick)
5. **F** — Hero alignment (P2)
6. **G** — Duplicate content (P2)
7. **H** — Blog disable (P2)
8. **B** — Typewriter sound (P1, can be done in parallel with A)
9. **I** — CV URL (P3)

---

# ADDENDUM — User directives (approved 2026-07-27)

**Constraint:** Refactor for stability, accessibility, navigation consistency, maintainability. NO new visual features beyond this spec.

## J. Splash as Finite State Machine (supersedes parts of A)
- States: `NOT_STARTED → RUNNING → COMPLETED | SKIPPED | FAILED`.
- Single state variable + `transition(to)` function; every transition logged (dev-only) + `performance.mark('splash:'+to)`.
- Overlay `display:none` by default in CSS; shown only in RUNNING.
- Watchdog: `setTimeout(forceFinish, 12000)` started on RUNNING; always cleared in cleanup. On watchdog fire → FAILED → full cleanup → dispatch `preloader:done` (page must remain usable).
- FAILED path: console.error + cleanup + `preloader:done` dispatch (recoverable, never leaves blocking overlay).
- Reduced-motion: NOT_STARTED → COMPLETED immediately (no animation, no sound).
- Already-shown (sessionStorage): NOT_STARTED → COMPLETED immediately + `preloader:done`.
- Every listener/timer/tween registered in a cleanup registry; `destroy()` removes ALL of them (scroll-lock listeners, skip button, Escape key, watchdog, master timeline, AudioContext).

## K. Lifecycle symmetry + idempotency (Architecture)
- New `src/utils/lifecycle.ts`: `defineModule(name: string, init: () => (() => void) | void)` — runs init on `astro:page-load` (immediately if DOM ready), calls returned destroy on `astro:before-swap`; re-runnable after SPA navigation; logs lifecycle via debug util; wraps init in try/catch (failure → console.error, module stays destroyed, page usable).
- Refactor consumers: `Navbar.astro`, `HeroSection.astro`, section components' scripts, `ParallaxLayer.astro`, `Layout.astro` filter script, Lenis bootstrap. No duplicated init after SPA nav; no orphaned listeners.
- Animation orchestration stays in component `<script>` blocks (Astro pattern), but all GSAP/ScrollTrigger instances must be killed in destroy.

## L. Diagnostics (dev-only)
- New `src/utils/debug.ts`: `isDebug()` (true only when `import.meta.env.DEV`), `logLifecycle(module, event, data?)` (console.debug, dev only), `mark(name)` / `measure(name, start, end?)` (performance API, dev only), `fail(module, error)` (console.error always).
- Instrument: splash FSM transitions, Lenis start/stop, each defineModule init/destroy.
- No debug noise in production build.

## M. Self-hosted fonts (Performance)
- Add `@fontsource/inter` (400,500,600,700,800) + `@fontsource/jetbrains-mono` (400,500,600,700) deps; import CSS in `Layout.astro` frontmatter.
- Remove Google Fonts `<link rel="preconnect">`, the `media="print" onload` hack, and the `<noscript>` fallback from Layout head.
- fontsource ships `font-display: swap` → no render-blocking, no FOUT layout shift beyond fallback swap.

## N. Landmarks, anchors & cursor architecture
- `Layout.astro`: wrap `<Navbar />` in `<header>`; change `<div class="page" id="main-content">` to `<main class="page" id="main-content">`. ContactSection `<footer>` stays (valid inside section).
- Add global `section[id], [id].section { scroll-margin-top: 90px; }` (fixed navbar 70px + breathing room) so anchor targets aren't covered.
- Cursor system (architecture ONLY, no visuals): new `src/utils/cursor/cursor-system.ts` — typed plugin registry (`registerPlugin(plugin)`, `unregisterPlugin(id)`), `CursorPlugin` interface (id, onMove?, onEnter?, onLeave?, destroy?), reduced-motion guard hook, lazy singleton `getCursorSystem()`. NOT instantiated anywhere yet; `MagneticCursor.tsx` untouched. Extension points documented in-file.

## O. CV links (user provided)
New `src/config.ts`:
```ts
export const CV_VIEW_URL_EN = 'https://drive.google.com/file/d/1gqySt7wn8fQ9ns-VwbCxuO0EA8FSO40f/view';
export const CV_DOWNLOAD_URL_EN = 'https://drive.google.com/uc?export=download&id=1gqySt7wn8fQ9ns-VwbCxuO0EA8FSO40f';
export const CV_DOWNLOAD_URL_ES = 'https://drive.google.com/uc?export=download&id=14JHO459YUfquQKL0N9k752EABnNbDTNv';
```
- Hero "Download CV" → `CV_DOWNLOAD_URL_EN` (site lang = en).
- Navbar "Resume" (desktop + mobile) → `CV_VIEW_URL_EN`.
- ES download kept in config for future i18n.
- Duplicate project files: **KEEP** (user decision — do not delete).

## P. Package changes (merged with C3)
- `pnpm remove @react-three/drei`
- `pnpm add -D @types/react@^18 @types/react-dom@^18`
- `pnpm add @fontsource/inter @fontsource/jetbrains-mono`

## GATE 1 validation (orchestrator)
- ✅ `client:only="react"` untouched on all islands.
- ✅ No `data-astro-reload` introduced; hash links stay absolute + Lenis handler.
- ✅ GSAP imports only from `utils/gsap-config`.
- ✅ Reduced-motion respected everywhere; matchMedia override removed, never re-added.
- ✅ Colors/radii only via `:root` tokens; DESIGN.md updated to match.
- ✅ No new visual features (cursor system = types/registry only).
