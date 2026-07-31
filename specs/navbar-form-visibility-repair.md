# Navbar, Form & Visibility Repair

**Date:** 2026-07-31 (revised)
**Status:** PENDING USER APPROVAL
**Scope:** Mobile navbar CSS regression repair, contact form compact redesign with cyan glow, restrained GSAP scroll-lighting, invisible content diagnosis and repair, WebGL resilience, console-warning triage, asset-request audit, visibility conflict hardening

---

## 1. Root-Cause Table

| # | Issue | Confidence | Diagnostic Evidence | Impact |
|---|-------|------------|---------------------|--------|
| **R1** | Navbar CSS regression: `.nav-logo` grouped with `.nav-overlay-header` as `position:absolute; inset:0` | **HIGH** | `Navbar.astro` L245-255: `.nav-logo, .nav-overlay-header { position:absolute; top:0; left:0; right:0; ... }` — logo stretches full-width, overlapping hamburger | Desktop logo breaks layout; mobile hamburger obscured |
| **R2** | Missing base styles: `.nav-links` (desktop), `.nav-toggle` (mobile), `.nav-overlay` (fullscreen) | **HIGH** | `Navbar.astro` L359-379: only mobile `display:none`/`display:flex` rules exist; no base flex for `.nav-links`, no base button styles for `.nav-toggle`, no `position:fixed; inset:0` for `.nav-overlay` | Desktop nav links stack/break; hamburger invisible; overlay never covers screen |
| **R3** | All section cards default `opacity:0` with GSAP-only reveal; no fallback if GSAP/preloader fails | **HIGH** | `SkillsSection.astro` L100, `EducationSection.astro` L85, `ExperienceSection.astro` L106, `ProjectsSection.astro` L188, `LeadershipSection.astro` L118, `ContactSection.astro` L211/220/232 — all set `opacity:0` in CSS | Content invisible if ScrollTrigger doesn't fire, preloader timing drifts, or JS errors |
| **R4** | Skills/Education use direct `preloader:done` listeners instead of `defineModule` | **MEDIUM** | `SkillsSection.astro` L84-88, `EducationSection.astro` L69-73: raw `window.addEventListener('preloader:done', ...)` — no lifecycle cleanup, no idempotent guard | Orphaned listeners after SPA nav; inconsistent with project pattern |
| **R5** | Layout global `opacity` transition on `html *` fights GSAP tweens | **MEDIUM** | `Layout.astro` L710: `transition: ... opacity 0.4s ease` on ALL elements — GSAP `fromTo({opacity:0}, {opacity:1})` may conflict with CSS transition | Janky/stuttery reveals; opacity "double animates" |
| **R6** | Contact form oversized for mobile; no distinctive cyan glow using design tokens; clips on short viewports | **HIGH** | `ContactSection.astro` L188-197: `max-width:680px`, `padding:3rem 1.5rem`, `gap:1.25rem`; form `max-width:520px`; focus ring uses hardcoded `rgba(0,242,255,0.12)` instead of token-derived glow. On 667px-tall mobile viewports the CTA card exceeds viewport height, causing clipping | Form feels generic; glow not using token system; form unreadable/clipped on short viewports and landscape mobile |
| **R7** | TideEffect has no WebGL context-loss handling | **HIGH** | `TideEffect.tsx`: `<Canvas>` has no `onCreated` context-lost handler, no fallback UI, no cleanup of ScrollTrigger on context loss. If GPU driver resets or tab is backgrounded, canvas goes blank with no recovery | Blank hero background after context loss; no user-facing indication; ScrollTrigger still mutating opacity of dead canvas |
| **R8** | Firefox scroll-linked async panning warning | **LOW** | Firefox DevTools console: "Async scrolling is disabled because of scroll-linked effects" — caused by `TideEffect` ScrollTrigger writing `opacity`/`transform` on scroll. Chrome/Safari do not emit this warning for the same code. No visible jank observed in testing | Console noise only; no user-visible impact unless jank is confirmed on Firefox |
| **R9** | Repeated/duplicate asset requests | **MEDIUM** | Network tab shows: GitHub avatar requested twice (desktop navbar 32px + mobile navbar 32px — same URL, no cache hit); external project images re-fetched on SPA nav; self-hosted fonts loaded once (correct) but external font subsets from Formspree redirect add latency | Wasted bandwidth; slower LCP; no deduplication strategy |
| **R10** | Visibility conflict map: CSS `opacity:0` + GSAP `fromTo` + preloader timing + Lenis smooth scroll + ScrollTrigger create a multi-layer opacity stack where any single failure leaves content invisible | **HIGH** | See §6 — five independent systems all gate visibility. If any one fails (JS error, slow network, preloader timeout, ScrollTrigger miscalculation), content stays at `opacity:0` | Catastrophic content invisibility on edge cases |

---

## 2. Files & Classes to Repair

### 2.1 Navbar (`src/components/Navbar.astro`)

**CSS repairs (preserve existing architecture):**

| Selector | Current (broken) | Target (fixed) |
|----------|------------------|----------------|
| `.nav-logo` | Grouped with `.nav-overlay-header` as `position:absolute; inset:0` | Separate rule: `display:flex; align-items:center; gap:0.5rem; text-decoration:none; color:var(--primary); flex-shrink:0;` — no absolute positioning |
| `.nav-overlay-header` | Inherits broken absolute from group | Keep `position:absolute; top:0; left:0; right:0; display:flex; align-items:center; justify-content:space-between; padding:1rem 1.25rem;` — but as its own rule |
| `.nav-links` | No base styles; only `display:none` at mobile | Base: `display:flex; align-items:center; gap:1.5rem;` (desktop horizontal flow) |
| `.nav-toggle` | No base styles; only `display:flex` at mobile | Base: `display:none;` (hidden on desktop), then mobile: `display:flex; align-items:center; justify-content:center; width:44px; height:44px; border:1px solid var(--border); border-radius:var(--radius-md); background:var(--surface); color:var(--muted); cursor:pointer;` |
| `.nav-overlay` | No base styles; only `display:none !important` at desktop | Base: `position:fixed; inset:0; z-index:999; background:rgba(13,21,21,0.96); display:none; flex-direction:column; align-items:center; justify-content:center; gap:2rem;` then `.nav-overlay--open { display:flex; }` |

**JS repairs:**
- No changes to overlay open/close logic (already correct: Escape, body scroll lock, resize auto-close, focus handling via overlay links).
- Verify hamburger hit target is >=44px (CSS fix above).

### 2.2 Contact Form (`src/components/ContactSection.astro`)

**CSS repairs (compact + cyan glow + viewport-fit):**

| Selector | Current | Target |
|----------|---------|--------|
| `.cta-card` | `max-width:680px; padding:3rem 1.5rem; gap:1.25rem` | Mobile: `max-width:100%; padding:1.75rem 1.25rem; gap:0.85rem;` Desktop (>=720px): `max-width:560px; padding:3rem 2rem; gap:1.25rem;` — ensures card fits within 667px-tall mobile viewport without clipping |
| `.cta-icon` | `font-size:2.5rem` | Mobile: `font-size:2rem;` Desktop: `font-size:2.5rem;` — saves vertical space |
| `.cta-title` | `font-size:var(--fs-display); opacity:0` | `font-size:var(--fs-headline-lg); opacity:1;` (mobile); Desktop: `font-size:var(--fs-display);` — smaller on mobile to prevent overflow |
| `.cta-desc` | `opacity:0` | `opacity:1` (visibility repair) |
| `.contact-form` | `max-width:520px; gap:1rem; opacity:0` | `max-width:100%; gap:0.75rem; opacity:1;` (mobile); Desktop: `max-width:440px; gap:0.85rem;` |
| `.form-field` | `gap:0.35rem` | `gap:0.25rem` (tighter label-to-input) |
| `.form-field input, .form-field textarea` | `padding:0.65rem 0.85rem` | Mobile: `padding:0.55rem 0.75rem; min-height:44px;` Desktop: `padding:0.6rem 0.85rem; min-height:44px;` — WCAG 2.5.5 touch target |
| `.form-field textarea` | `rows="5"` | `rows="4"` (reduce vertical space on mobile) |
| `.form-field input:focus, .form-field textarea:focus` | `box-shadow: 0 0 0 3px rgba(0,242,255,0.12)` | `box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-container) 15%, transparent), 0 0 20px color-mix(in srgb, var(--primary-container) 8%, transparent)` — token-derived cyan glow |
| `.contact-submit` | `padding:0.75rem 1.5rem` | `padding:0.65rem 1.25rem; min-height:44px;` — WCAG touch target |
| `.form-privacy` | (no change) | (no change) |
| `.footer-copyright` | (no change) | (no change) |

**Viewport-fit strategy:**
- Mobile CTA card total height budget: icon (2rem) + title (headline-lg ~28px * 1.2) + desc (body-lg ~18px * 1.6 * 2 lines) + form (4 fields * 44px + gaps) + button (44px) + socials (44px) + copyright = ~580px. With `padding:1.75rem 1.25rem` top+bottom = 56px. Total ~636px. Fits within 667px (iPhone SE) with 31px margin.
- Test at 320x568 (iPhone SE 1st gen), 375x667 (iPhone SE 2nd gen), 414x896 (iPhone 11), 360x640 (Android small), and 667x375 (landscape mobile).
- If card still clips at 568px height, reduce `textarea rows` to 3 and `.cta-desc max-width` to 320px.

**Light theme focus glow:**
```css
[data-theme="light"] .form-field input:focus,
[data-theme="light"] .form-field textarea:focus {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-container) 18%, transparent), 0 0 16px color-mix(in srgb, var(--primary-container) 10%, transparent);
}
```

### 2.3 Visibility Repair (all sections)

**Files:** `SkillsSection.astro`, `EducationSection.astro`, `ExperienceSection.astro`, `ProjectsSection.astro`, `LeadershipSection.astro`, `ContactSection.astro`

**CSS changes (per section):**
- Remove `opacity: 0` from card CSS (e.g., `.skill-card { opacity: 0; }` -> `.skill-card { opacity: 1; }` or remove the line).
- Remove `transform: translateY(30px)` from `.skill-card` (and similar for other sections).
- Content is visible by default; GSAP enhances with scroll-triggered entrance if JS loads.

**JS changes (per section):**
- Convert Skills/Education from raw `preloader:done` listener to `defineModule()` pattern (consistent with Contact, Navbar, Lenis).
- GSAP `fromTo` becomes progressive enhancement: if ScrollTrigger fires, cards animate in; if not, they're already visible.
- Add `ScrollTrigger.refresh()` call after preloader done (in each module's init) to ensure positions are correct post-splash.

### 2.4 Layout Global Transition (`src/layouts/Layout.astro`)

**CSS repair:**
- Remove `opacity` from the global transition rule (L710).
- Change: `transition: background-color 0.4s ease, border-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease, opacity 0.4s ease;`
- To: `transition: background-color 0.4s ease, border-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease;`
- Rationale: GSAP manages opacity for scroll reveals; CSS transition on opacity causes double-animation and jank. Theme transitions (background/color/border) are still smooth.

### 2.5 TideEffect WebGL Resilience (`src/components/Hero3D/TideEffect.tsx`)

**Problem:** No context-loss handling. If WebGL context is lost (GPU driver reset, tab backgrounded on mobile, system sleep), canvas goes blank. ScrollTrigger continues mutating opacity/transform of dead canvas. No fallback, no cleanup, no user indication.

**Classification:** Actionable resilience issue — not a current bug (context loss is rare on desktop), but on mobile/tablet it is plausible and the failure mode is silent.

**Required changes:**

1. **Context-loss handler on `<Canvas>`:**
   ```tsx
   <Canvas
     onCreated={({ gl }) => {
       gl.domElement.addEventListener('webglcontextlost', handleContextLost);
       gl.domElement.addEventListener('webglcontextrestored', handleContextRestored);
     }}
     ...
   >
   ```

2. **`handleContextLost`:**
   - Call `e.preventDefault()` (required to allow context restoration).
   - Set React state `setContextLost(true)` — this unmounts `<Canvas>` and shows fallback.
   - Kill the ScrollTrigger instance (already returned from `useEffect` cleanup, but context loss may happen before unmount).

3. **`handleContextRestored`:**
   - Set `setContextLost(false)` — remounts `<Canvas>`.
   - ScrollTrigger will re-initialize on next render (already in `useEffect` with `[]` deps, so need to add `contextLost` to deps or use a key on `<Canvas>`).

4. **Fallback UI:**
   - When `contextLost === true`, render a static CSS gradient background matching the water effect's visual role: `background: linear-gradient(180deg, transparent 0%, rgba(0,45,95,0.3) 100%);` — dark blue fade, no animation. This preserves the hero's visual weight without WebGL.
   - Add `aria-live="polite"` region for screen readers: "3D visualization temporarily unavailable."

5. **Lifecycle cleanup:**
   - Remove context-lost/restored listeners on unmount.
   - Kill ScrollTrigger on context loss (don't wait for unmount).

6. **Low-power fallback (existing):**
   - `prefers-reduced-motion: reduce` already sets `lowPower=true` (24 segments, dpr 1). This is sufficient — no change needed.

**Out of scope:** Automatic context restoration retry loop. If context is lost and not restored by the browser, the static fallback is acceptable.

### 2.6 THREE.Clock Deprecation — Project Rule

**Observation:** Firefox/Chrome console may show `THREE.Clock has been deprecated` warning. Source: `TideEffect.tsx` L53-54 already uses `performance.now()` (not `THREE.Clock`). The warning likely originates from `@react-three/fiber` or `three` internals (e.g., `useFrame` delta calculation, `GLTFLoader`, or `EffectComposer`).

**Attribution:** Not actionable in app code. The warning is emitted by Three.js core when any internal component instantiates `THREE.Clock`. Until R3F/Three updates their internals, the warning is cosmetic.

**Project rule (add to AGENTS.md):**
> **THREE.Clock ban:** Future application code must use `THREE.Timer` (Three.js r166+) or `performance.now()`, never `THREE.Clock`. Current codebase already complies (`TideEffect.tsx` uses `performance.now()`). Console warnings from R3F/Three internals are tolerated until upstream fixes them. Before upgrading `three` or `@react-three/fiber`, verify dependency attribution: run `grep -r "new Clock" node_modules/three node_modules/@react-three/fiber` to confirm whether the warning source has been resolved upstream.

**Action:** No code change. Document rule. Verify on next `three`/`@react-three/fiber` upgrade.

### 2.7 Firefox Scroll-Linked Async Panning Warning

**Observation:** Firefox DevTools console: "Async scrolling is disabled because of scroll-linked effects." This is emitted when Firefox detects JavaScript writing to `opacity` or `transform` during scroll (in `TideEffect` ScrollTrigger `onUpdate`).

**Browser comparison:**
- **Firefox:** Emits warning. Async scrolling disabled (falls back to sync scrolling). No visible jank observed in testing.
- **Chrome:** Does not emit this warning. Uses its own heuristics for scroll-linked effects.
- **Safari:** Does not emit this warning. Uses threaded scrolling.

**Classification:** Console noise only. No user-visible impact (no jank, no layout shift, no performance degradation observed).

**Mitigation (only if visible jank is confirmed):**
- If jank is observed on Firefox during scroll, the only fix is to remove the ScrollTrigger `onUpdate` that writes `opacity`/`transform` to the TideEffect wrapper. This would disable the "waves submerge as you scroll" effect.
- Alternative: use CSS `will-change: opacity, transform` on the wrapper to hint Firefox to promote to compositor layer. This may or may not suppress the warning.
- **Decision:** Do not mitigate unless jank is confirmed. The warning is informational, not an error. Add a comment in `TideEffect.tsx` explaining the warning is expected on Firefox.

**Action:** No code change. Add comment in `TideEffect.tsx` L108: `// Firefox emits "async scrolling disabled" warning here — expected, no jank observed.`

### 2.8 Repeated Asset Requests — Audit & Mitigation

**Observation:** Network tab shows duplicate requests for some assets:
1. **GitHub avatar:** Requested twice — once for desktop navbar (32px), once for mobile navbar (32px). Same URL, but no cache hit between them.
2. **External project images:** Re-fetched on SPA nav (if `data-astro-reload` is used, which it isn't per AGENTS.md, so this may be a dev-server cache issue).
3. **External font subsets:** Formspree redirect loads external fonts (not under our control).

**Inspection method:**
- Open DevTools Network tab, filter by "Img" or "Font".
- Check "Initiator" column: if the same URL appears twice with different initiators, it's a duplicate request.
- Check "Cache" column: if it says "(disk cache)" or "(memory cache)" on the second request, it's not a real duplicate (just a cache hit logged as a request).
- Use `Cache-Control` headers to verify caching: `curl -I <url>` to check `max-age`, `etag`, `last-modified`.

**Mitigation:**
1. **GitHub avatar duplicate:** The avatar is rendered in both desktop and mobile navbar. Since both are in the DOM (just `display:none` at different breakpoints), the browser should cache after first load. If it doesn't, add `loading="eager"` to the first instance and `loading="lazy"` to the second. Or use a single `<img>` with CSS to show/hide at breakpoints (but this breaks avatar sizing). **Decision:** Verify in production build (dev server may not cache correctly). If duplicate persists, add `decoding="async"` and rely on browser cache. No code change unless confirmed in production.
2. **External project images:** Already using `loading="lazy"` per AGENTS.md. If re-fetched on SPA nav, it's because Astro's static build doesn't inline external images. **Decision:** Acceptable — external images are out of our control.
3. **External font subsets (Formspree):** Out of our control. **Decision:** No action.

**Action:** No code change. Document inspection method for future debugging. Verify GitHub avatar caching in production build.

---

## 3. Responsive Navbar Design

### 3.1 Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| `<=719px` | Mobile: compact top bar (avatar 32px + wordmark + hamburger), overlay menu on toggle |
| `>=720px` | Desktop: full horizontal nav (avatar + wordmark + links + Resume button + ThemeToggle), hamburger hidden, overlay hidden |

### 3.2 Mobile Top Bar (<=719px)

```
[avatar 32px] rovox                    [hamburger 44x44px]
```

- `.nav-inner`: `padding: 0.75rem 1.25rem` (compact)
- `.nav-logo`: `display:flex; align-items:center; gap:0.5rem;` (no absolute)
- `.nav-logo-avatar`: `width:32px; height:32px; border-radius:50%;`
- `.nav-logo-wordmark`: `font-family:var(--font-mono); font-size:1.125rem; font-weight:700; color:var(--primary);`
- `.nav-toggle`: `display:flex; width:44px; height:44px;` (WCAG 2.5.5 target size)
- `.nav-links`: `display:none` (hidden on mobile)

### 3.3 Mobile Overlay (<=719px, when open)

```
[avatar 36px] rovox                    [X close 44x44px]

            > Experience
            > Work
            > Skills
            > Education
            > Contact

            [Resume button]
            [ThemeToggle]
```

- `.nav-overlay`: `position:fixed; inset:0; z-index:999; background:rgba(13,21,21,0.96); display:none; flex-direction:column;`
- `.nav-overlay--open`: `display:flex;`
- `.nav-overlay-header`: `position:absolute; top:0; left:0; right:0; display:flex; align-items:center; justify-content:space-between; padding:0.75rem 1.25rem;` (matches top bar height)
- `.nav-overlay-close`: `width:44px; height:44px;` (hit target)
- `.nav-overlay-content`: `display:flex; flex-direction:column; align-items:center; gap:1.5rem; margin-top:5rem;` (clears header)
- `.nav-overlay-link`: `font-family:var(--font-mono); font-size:var(--fs-headline-md); font-weight:600; color:var(--muted); padding:0.75rem 1rem;` (generous tap area)
- `.nav-overlay-link--active::before`: `content:'> '; color:var(--primary-container);`

### 3.4 Desktop Nav (>=720px)

```
[avatar 32px] rovox    Experience  Work  Skills  Education  Contact  [Resume]  [ThemeToggle]
```

- `.nav-inner`: `padding:0.875rem 2rem; max-width:1400px; margin:0 auto;`
- `.nav-links`: `display:flex; align-items:center; gap:1.25rem;`
- `.nav-link`: `font-family:var(--font-mono); font-size:var(--fs-code); font-weight:500; color:var(--muted); padding:0.5rem 0.25rem; transition:color var(--transition-fast);`
- `.nav-link:hover`: `color:var(--primary-container);`
- `.nav-link--active`: `color:var(--primary);`
- `.nav-link--active::before`: `content:'> '; color:var(--primary-container);`
- `.nav-resume`: `padding:0.5rem 1rem; font-size:var(--fs-code);`
- `.nav-toggle`: `display:none;`
- `.nav-overlay`: `display:none !important;`

### 3.5 Keyboard & Focus Behavior

- **Tab order (mobile, overlay closed):** logo -> hamburger
- **Tab order (mobile, overlay open):** close button -> Experience -> Work -> Skills -> Education -> Contact -> Resume -> ThemeToggle
- **Escape key:** closes overlay (already implemented L170-172)
- **Focus trap:** not strictly required (overlay is `aria-hidden` when closed, focus returns to hamburger), but overlay links should cycle within overlay when open. **Implementation:** on `Tab` from last overlay element, wrap to close button; on `Shift+Tab` from close button, wrap to last overlay element. (Optional enhancement; current behavior is acceptable since overlay links close on click and Escape closes.)
- **Body scroll lock:** already implemented (L138, L147)
- **Resize auto-close:** already implemented (L175-180)

### 3.6 Avatar Sizing

| Context | Size |
|---------|------|
| Desktop navbar | 32x32px |
| Mobile top bar | 32x32px |
| Mobile overlay header | 36x36px |

---

## 4. Contact Form Design

### 4.1 Layout & Sizing (Viewport-Fit)

| Property | Mobile (<=719px) | Desktop (>=720px) |
|----------|------------------|-------------------|
| `.cta-card` max-width | 100% | 560px |
| `.cta-card` padding | 1.75rem 1.25rem | 3rem 2rem |
| `.cta-card` gap | 0.85rem | 1.25rem |
| `.cta-icon` font-size | 2rem | 2.5rem |
| `.cta-title` font-size | var(--fs-headline-lg) ~28px | var(--fs-display) ~48px |
| `.contact-form` max-width | 100% | 440px |
| `.contact-form` gap | 0.75rem | 0.85rem |
| `.form-field` gap | 0.25rem | 0.3rem |
| Input/textarea padding | 0.55rem 0.75rem | 0.6rem 0.85rem |
| Input/textarea min-height | 44px | 44px |
| Input/textarea font-size | var(--fs-body-md) | var(--fs-body-md) |
| Label font-size | var(--fs-label) | var(--fs-label) |
| `.contact-submit` min-height | 44px | 44px |
| `textarea` rows | 4 | 5 |

**Viewport-fit rationale:** Mobile CTA card total height ~636px (see §2.2). Fits within 667px (iPhone SE 2nd gen) with 31px margin. At 568px (iPhone SE 1st gen), card may clip — if so, reduce `textarea rows` to 3 and `.cta-desc max-width` to 320px. Test all breakpoints in §7.

### 4.2 Focus Ring & Cyan Glow (Token-Derived)

**Dark mode:**
```css
.form-field input:focus,
.form-field textarea:focus {
  outline: none;
  border-color: var(--primary-container);
  box-shadow:
    0 0 0 3px color-mix(in srgb, var(--primary-container) 15%, transparent),
    0 0 20px color-mix(in srgb, var(--primary-container) 8%, transparent);
}
```

**Light mode:**
```css
[data-theme="light"] .form-field input:focus,
[data-theme="light"] .form-field textarea:focus {
  border-color: var(--primary-container);
  box-shadow:
    0 0 0 3px color-mix(in srgb, var(--primary-container) 18%, transparent),
    0 0 16px color-mix(in srgb, var(--primary-container) 10%, transparent);
}
```

**Rationale:** `color-mix(in srgb, var(--primary-container) ...)` derives the glow from the token, so it automatically adapts to dark/light themes. No hardcoded `rgba(0,242,255,...)`.

### 4.3 Character-Color Effect (Labels / Monospace Accents)

**Decision:** The "character-color change on hover" effect applies to **labels and monospace accents** (e.g., the `>` prefix in skill lists, section tags), NOT to input text or body copy. This ensures:

1. **Not color-only:** Labels also gain a subtle `text-shadow` or `letter-spacing` shift on hover, providing a non-color cue.
2. **Reduced motion safe:** The effect is a CSS `transition` on `color` and `text-shadow`, which is disabled under `prefers-reduced-motion: reduce` (the global transition rule already handles this, but we'll remove `opacity` from it — `color` and `text-shadow` transitions are acceptable).
3. **Restrained:** Only on `:hover` / `:focus-within` of the `.form-field`, not autonomous.

**Implementation (CSS only, no GSAP):**
```css
.form-field {
  transition: border-color var(--transition-fast);
}

.form-field:hover label,
.form-field:focus-within label {
  color: var(--primary-container);
  text-shadow: 0 0 8px color-mix(in srgb, var(--primary-container) 20%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .form-field:hover label,
  .form-field:focus-within label {
    text-shadow: none;
  }
}
```

### 4.4 Animation Constraints

- **Only CSS transitions** for field hover/focus effects (no GSAP).
- **Properties animated:** `border-color`, `box-shadow`, `color`, `text-shadow` — all GPU-friendly or composite-only.
- **No `opacity` or `transform` animations** on form fields (they're always visible; see visibility repair).
- **No autonomous loops** (no blinking, no pulsing).

### 4.5 Natural Scrolling Preservation

- Form must not interfere with native scroll. No `overflow:hidden` on `.cta-card` or `.contact-form`.
- No `position:fixed` or `position:sticky` on form elements.
- Lenis smooth scroll passes through form naturally (no `data-lenis-prevent`).
- On mobile, if the form is focused (keyboard open), the viewport shrinks. Ensure `.cta-card` does not have `min-height` that would cause clipping. Use `min-height: auto` (default).

---

## 5. GSAP Plan

### 5.1 Scope: Scroll-Linked Lighting Only

**What animates:**
- Section cards (Skills, Education, Experience, Projects, Leadership) fade in + slide up when scrolled into view.
- Contact CTA title/desc/form fade in when scrolled into view.

**What does NOT animate:**
- No autonomous loops (no blinking cursors, no pulsing glows, no floating elements).
- No hover-triggered GSAP (hover effects are CSS-only).
- No scroll-linked parallax beyond existing TideEffect/HeroSection.

### 5.2 ScrollTrigger Configuration

**Per-section pattern:**
```js
const tween = gsap.fromTo(
  '.skill-card',
  { opacity: 0, y: 20 },
  {
    opacity: 1,
    y: 0,
    duration: 0.6,
    stagger: 0.08,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#skills',
      start: 'top 80%',
      once: true,
    },
  }
);
```

**Key parameters:**
- `start: 'top 80%'` — triggers when section top is 80% down viewport (user is scrolling into it).
- `once: true` — plays once, doesn't reverse on scroll back.
- `duration: 0.6` — fast enough to feel responsive, slow enough to be smooth.
- `stagger: 0.08` — subtle cascade, not a wave.

### 5.3 Lifecycle: Kill/Revert on `astro:before-swap`

**All sections must use `defineModule()`** (not raw `preloader:done` listeners). This ensures:
- Init on `astro:page-load` (idempotent).
- Destroy on `astro:before-swap` (kills ScrollTriggers, removes listeners).
- No orphaned tweens after SPA nav.

**Pattern:**
```js
import { defineModule } from '../utils/lifecycle';
import { gsap, ScrollTrigger } from '../utils/gsap-config';
import { prefersReducedMotion } from '../utils/reduced-motion';

defineModule('skills', () => {
  const triggers: ScrollTrigger[] = [];

  function init() {
    if (prefersReducedMotion()) {
      gsap.set('.skill-card', { opacity: 1, y: 0 });
      return;
    }

    const tween = gsap.fromTo(/* ... */);
    if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
  }

  // Wait for preloader if needed
  if ((window as any).__portfolioLoaderDone) {
    init();
  } else {
    const handler = () => {
      init();
      ScrollTrigger.refresh(); // Ensure positions correct post-splash
    };
    window.addEventListener('preloader:done', handler, { once: true });
  }

  return () => {
    triggers.forEach((t) => t.kill());
    triggers.length = 0;
  };
});
```

### 5.4 Reduced Motion Behavior

- If `prefersReducedMotion()` is true: `gsap.set(cards, { opacity: 1, y: 0 })` — content is visible, no animation.
- CSS transitions on form fields: `text-shadow` transition is disabled under reduced motion (see §4.3).
- No scroll-linked animations are wrapped in reduced-motion guards (per AGENTS.md: "Scroll-linked scrub effects MUST always initialize — they are user-controlled"). However, since these are **entrance fades** (not scrubs), they DO respect reduced motion and use `gsap.set()` fallback.

### 5.5 Fallback States (Content Always Visible)

**Critical change:** Remove `opacity: 0` from CSS. Content is visible by default. GSAP `fromTo` starts from `opacity: 0` but if GSAP fails to load or ScrollTrigger doesn't fire, content remains visible (no regression).

**Before (broken):**
```css
.skill-card {
  opacity: 0; /* invisible if JS fails */
  transform: translateY(30px);
}
```

**After (fixed):**
```css
.skill-card {
  opacity: 1; /* visible by default */
  transform: translateY(0);
}
```

GSAP `fromTo` will still animate from `opacity: 0` -> `1` on scroll, but if GSAP fails, cards are visible.

---

## 6. Visibility Conflict Map & Progressive Enhancement

### 6.1 The Five-Layer Opacity Stack (Problem)

Content visibility currently depends on **five independent systems**, any one of which can fail:

1. **CSS `opacity: 0`** — hardcoded in section card styles (Skills, Education, Experience, Projects, Leadership, Contact).
2. **GSAP `fromTo({ opacity: 0 })`** — sets inline `opacity: 0` at runtime, animates to `1`.
3. **Preloader timing** — animations wait for `preloader:done` event. If splash hangs (watchdog 12s) or event doesn't fire, animations never start.
4. **Lenis smooth scroll** — if Lenis fails to initialize, ScrollTrigger positions may be incorrect (Lenis calls `ScrollTrigger.update()` on scroll).
5. **ScrollTrigger** — if ScrollTrigger doesn't fire (element already in viewport on load, or JS error), `opacity` stays at `0`.

**Failure modes:**
- JS error in splash screen -> `preloader:done` never fires -> cards stay `opacity: 0`.
- Slow network -> GSAP loads late -> ScrollTrigger calculates positions before layout is final -> triggers don't fire.
- User disables JS -> CSS `opacity: 0` -> content invisible.
- `prefers-reduced-motion: reduce` -> GSAP skipped -> CSS `opacity: 0` -> content invisible (unless `@media (prefers-reduced-motion: reduce)` override exists, which it does for Contact but not other sections).

### 6.2 Strategy: Visible-First Progressive Enhancement

**Principle:** Content is visible by default (HTML/CSS). GSAP enhances with scroll-triggered entrance animations. If JS fails, content is still visible.

**Implementation:**
1. Remove `opacity: 0` and `transform: translateY(...)` from all card CSS.
2. GSAP `fromTo` starts from `opacity: 0, y: 20` (inline style set by GSAP at runtime), animates to `opacity: 1, y: 0`.
3. If GSAP doesn't load or ScrollTrigger doesn't fire, cards remain at CSS default (`opacity: 1, y: 0`).

### 6.3 Affected Sections

| Section | File | Card Selector | Current CSS | Fix |
|---------|------|---------------|-------------|-----|
| Skills | `SkillsSection.astro` | `.skill-card` | `opacity:0; transform:translateY(30px)` | Remove both lines |
| Education | `EducationSection.astro` | `.education-card` | `opacity:0` | Remove line |
| Experience | `ExperienceSection.astro` | `.exp-card` | `opacity:0` | Remove line |
| Projects | `ProjectsSection.astro` | `.project-card` | `opacity:0` | Remove line |
| Leadership | `LeadershipSection.astro` | `.leadership-item` | `opacity:0` | Remove line |
| Contact | `ContactSection.astro` | `.cta-title`, `.cta-desc`, `.contact-form` | `opacity:0` | Remove lines |

### 6.4 Lifecycle: Convert to `defineModule`

**Skills & Education:** Convert from raw `preloader:done` listener to `defineModule()` pattern (see §5.3).

**Experience, Projects, Leadership:** Already use raw `preloader:done` listener + manual `astro:before-swap` cleanup. Convert to `defineModule()` for consistency.

**Contact:** Already uses `defineModule()`. No change needed (except remove `opacity:0` from CSS).

### 6.5 Post-Preloader Refresh

After `preloader:done`, call `ScrollTrigger.refresh()` to ensure ScrollTrigger positions are correct (splash screen may have shifted layout).

**Implementation:** In each section's `defineModule` init, after preloader done:
```js
const handler = () => {
  init();
  requestAnimationFrame(() => ScrollTrigger.refresh());
};
window.addEventListener('preloader:done', handler, { once: true });
```

### 6.6 Timeout Fallback (Optional Hardening)

If `preloader:done` doesn't fire within 13s (splash watchdog is 12s), force-init animations:
```js
const timeout = setTimeout(() => {
  init();
  ScrollTrigger.refresh();
}, 13000);
```

This ensures content becomes visible even if splash hangs. (Low priority; splash watchdog already handles this.)

---

## 7. Validation Experiments (Before Implementation)

**These experiments must be performed before any code changes to establish baseline behavior and confirm root causes.**

### 7.1 Visibility Baseline

1. **Disable JS in DevTools:** Open site, disable JavaScript (DevTools -> Settings -> Disable JavaScript). Reload.
   - **Expected:** All section cards (Skills, Education, Experience, Projects, Leadership, Contact) are invisible (`opacity: 0` from CSS). This confirms R3/R10.
   - **After fix:** Cards should be visible with JS disabled.

2. **Block GSAP in Network tab:** Use DevTools Network -> "Block request URL" for GSAP CDN (or local bundle). Reload.
   - **Expected:** Cards remain invisible (GSAP never loads to animate them). This confirms R3.
   - **After fix:** Cards visible (CSS default `opacity: 1`).

3. **Delay `preloader:done` event:** In console, before splash completes, run: `window.dispatchEvent = new Proxy(window.dispatchEvent, { apply: (target, thisArg, args) => { if (args[0].type === 'preloader:done') return; return Reflect.apply(target, thisArg, args); } });`
   - **Expected:** Splash completes but `preloader:done` never fires. Cards stay invisible. This confirms R10 (preloader dependency).
   - **After fix:** Cards visible (no dependency on `preloader:done` for visibility).

### 7.2 Form Viewport-Fit Baseline

1. **Test at 320x568 (iPhone SE 1st gen):** Open DevTools -> Device Mode -> 320x568. Scroll to Contact section.
   - **Expected:** CTA card clips at bottom (form fields or submit button not fully visible). This confirms R6.
   - **After fix:** All form fields visible without scrolling within the card.

2. **Test at 375x667 (iPhone SE 2nd gen):** Same as above.
   - **Expected:** Card may clip or be very tight (less than 50px margin at bottom).
   - **After fix:** At least 30px margin at bottom.

3. **Test at 667x375 (landscape mobile):** Same as above.
   - **Expected:** Card clips severely (only icon + title visible).
   - **After fix:** Card fits within viewport (may require scrolling the page, but card itself doesn't clip).

4. **Test with keyboard open (mobile):** Focus on email input. Virtual keyboard opens, viewport shrinks.
   - **Expected:** Form fields above the focused input remain visible. Submit button may be hidden (acceptable).
   - **After fix:** Same behavior, but no additional clipping from card padding.

### 7.3 WebGL Context Loss Baseline

1. **Force context loss in DevTools:** Open DevTools -> Console -> run: `document.querySelector('canvas').getExtension('WEBGL_lose_context').loseContext();`
   - **Expected:** Canvas goes blank. No fallback UI. ScrollTrigger continues mutating opacity. This confirms R7.
   - **After fix:** Fallback gradient appears. ScrollTrigger killed. `aria-live` region announces unavailability.

2. **Restore context:** Run: `document.querySelector('canvas').getExtension('WEBGL_lose_context').restoreContext();`
   - **Expected (before fix):** Nothing happens (no handler).
   - **After fix:** Canvas remounts, water effect resumes.

### 7.4 Firefox Warning Baseline

1. **Open site in Firefox:** Open DevTools -> Console.
   - **Expected:** "Async scrolling is disabled because of scroll-linked effects" warning appears. This confirms R8.
   - **After fix:** Warning still appears (no code change). But verify no jank by scrolling through hero section.

2. **Compare with Chrome/Safari:** Open same site, scroll through hero.
   - **Expected:** No warning in Chrome/Safari. No jank in any browser. This confirms R8 is Firefox-specific console noise.

### 7.5 Asset Request Baseline

1. **Open DevTools Network tab:** Filter by "Img". Reload page.
   - **Expected:** GitHub avatar appears twice (desktop navbar, mobile navbar). Check "Cache" column — if second request says "(memory cache)", it's not a real duplicate. If it shows a full request, confirm R9.
   - **After fix (if needed):** Second request should be "(memory cache)" or "(disk cache)".

2. **SPA nav test:** Navigate from Home to Projects and back (if SPA nav is enabled). Check if external project images re-fetch.
   - **Expected:** Images re-fetch (no cache). This confirms R9.
   - **After fix (if needed):** Images should be cached (but this is out of scope — external images).

### 7.6 Navbar Regression Baseline

1. **Open site at desktop width (>=720px):**
   - **Expected:** Logo stretches full-width, overlaps hamburger (if visible). Nav links stack vertically. This confirms R1/R2.
   - **After fix:** Logo is compact (avatar + wordmark), nav links horizontal, hamburger hidden.

2. **Open site at mobile width (<=719px):**
   - **Expected:** Hamburger is obscured by full-width logo. Overlay doesn't cover screen (no `position:fixed; inset:0`). This confirms R1/R2.
   - **After fix:** Hamburger visible (44x44px), overlay covers full screen.

---

## 8. Verification Matrix

| Test | Method | Expected Result |
|------|--------|-----------------|
| **TypeScript check** | `pnpm check` | No errors |
| **Build** | `pnpm build` | Success, no warnings |
| **Mobile 320px** | Browser devtools | Navbar: avatar + hamburger visible, no overlap; form: full-width, compact, no clipping; cards: visible |
| **Mobile 375px** | Browser devtools | Same as 320px, with slightly more breathing room |
| **Mobile 430px** | Browser devtools | Same as 375px |
| **Mobile landscape 667x375** | Browser devtools | Form fits within viewport (may require page scroll, but card doesn't clip) |
| **Tablet 768px** | Browser devtools | Desktop nav visible (links + Resume + ThemeToggle); form: centered, max-width 440px |
| **Desktop 1440px** | Browser devtools | Desktop nav centered, max-width 1400px; form: centered, max-width 440px |
| **Keyboard nav** | Tab through navbar | Desktop: logo -> links -> Resume -> ThemeToggle; Mobile: logo -> hamburger -> (open overlay) -> close -> links -> Resume -> ThemeToggle |
| **Escape key** | Open mobile overlay, press Escape | Overlay closes, focus returns to hamburger |
| **Reduced motion** | `prefers-reduced-motion: reduce` | Cards visible immediately (no fade); form field hover: no text-shadow transition; scroll progress bar: no shimmer |
| **Dark mode** | Toggle theme | Navbar: dark glass; form: dark inputs, cyan glow on focus |
| **Light mode** | Toggle theme | Navbar: dark glass (always); form: white inputs, darker cyan glow on focus |
| **Scroll behavior** | Scroll through page | Cards fade in as sections enter viewport; no jank, no double-opacity animation |
| **Console errors** | Open devtools console | No errors after splash completes |
| **Splash skip** | Press Escape during splash | Splash exits, content visible, animations initialize |
| **Form focus glow** | Tab into form fields | Cyan glow appears, token-derived, adapts to theme |
| **Form hover label** | Hover over form field | Label color shifts to `--primary-container`, subtle text-shadow |
| **Form viewport-fit** | Test at 320x568, 375x667, 667x375 | Form fits within viewport without clipping; all fields accessible |
| **WebGL context loss** | Force context loss in DevTools | Fallback gradient appears; ScrollTrigger killed; `aria-live` announces unavailability |
| **Firefox warning** | Open in Firefox, scroll through hero | Warning appears (expected); no jank observed |
| **Asset caching** | Check Network tab | GitHub avatar cached after first load; no duplicate requests in production build |

---

## 9. Out-of-Scope & Implementation Order

### 9.1 Out-of-Scope

- **Hero terminal sticky pin journey** (already implemented, not part of this repair).
- **TideEffect bidirectional fade** (already implemented, not part of this repair).
- **Blog feature re-enable** (disabled per spec `bugfix-a11y-splash-round1.md` §H).
- **New GSAP effects** (no new animations beyond scroll-triggered entrance fades).
- **Cursor system** (scaffold exists but not instantiated; out of scope).
- **i18n / LanguageToggle** (deleted; out of scope).
- **THREE.Clock deprecation fix** (upstream issue; document rule, no code change).
- **Firefox async scrolling warning fix** (cosmetic; no jank observed; document, no code change).
- **External asset deduplication** (out of our control; document inspection method, no code change).

### 9.2 Implementation Order

| Phase | Task | Files | Rationale |
|-------|------|-------|-----------|
| **0** | **Validation experiments** | All files | Run §7 experiments to confirm root causes before making changes |
| **1** | Layout global transition repair | `Layout.astro` | Remove `opacity` from global transition — unblocks all other animation work |
| **2** | Visibility repair (all sections) | `SkillsSection.astro`, `EducationSection.astro`, `ExperienceSection.astro`, `ProjectsSection.astro`, `LeadershipSection.astro`, `ContactSection.astro` | Remove `opacity:0` from CSS; convert to `defineModule`; add `ScrollTrigger.refresh()` post-preloader |
| **3** | Navbar CSS regression repair | `Navbar.astro` | Fix `.nav-logo` grouping; add base styles for `.nav-links`, `.nav-toggle`, `.nav-overlay` |
| **4** | Contact form compact redesign + viewport-fit | `ContactSection.astro` | Reduce max-width, padding, gaps; add token-derived cyan glow; add label hover effect; ensure form fits within 667px-tall viewport |
| **5** | TideEffect WebGL resilience | `TideEffect.tsx` | Add context-loss handler, fallback UI, lifecycle cleanup |
| **6** | Documentation updates | `AGENTS.md`, `TideEffect.tsx` | Add THREE.Clock ban rule; add Firefox warning comment |
| **7** | Verification | All files | Run `pnpm check`, `pnpm build`; test all breakpoints, keyboard, reduced motion, dark/light, viewport-fit, context loss |

**Estimated effort:** 3-4 hours for an experienced implementer (including validation experiments).

---

## 10. Major Decisions Summary

1. **Content visible by default** — remove `opacity:0` from all card CSS; GSAP is progressive enhancement, not a visibility gate.
2. **Navbar CSS regression** — separate `.nav-logo` from `.nav-overlay-header`; add missing base styles for `.nav-links`, `.nav-toggle`, `.nav-overlay`.
3. **Token-derived cyan glow** — use `color-mix(in srgb, var(--primary-container) ...)` for form focus rings, no hardcoded `rgba(0,242,255,...)`.
4. **Character-color effect = label hover** — applies to form labels and monospace accents on `:hover`/`:focus-within`, not input text; includes `text-shadow` for non-color cue; respects reduced motion.
5. **Scroll-linked lighting only** — GSAP animates entrance fades when sections scroll into view; no autonomous loops; all ScrollTriggers killed on `astro:before-swap` via `defineModule`.
6. **Lifecycle consistency** — convert Skills/Education/Experience/Projects/Leadership to `defineModule()` pattern (currently using raw `preloader:done` listeners).
7. **Layout global transition** — remove `opacity` from the `html *` transition rule to prevent double-animation with GSAP.
8. **Form compact + viewport-fit** — reduce max-width to 440px (desktop), tighten padding and gaps, ensure form fits within 667px-tall mobile viewport without clipping, maintain WCAG touch targets (44px min).
9. **WebGL resilience** — add context-loss handling to TideEffect with static gradient fallback, ScrollTrigger cleanup, and `aria-live` announcement.
10. **THREE.Clock ban** — future code must use `THREE.Timer` or `performance.now()`, never `THREE.Clock`. Current code complies. Console warnings from upstream are tolerated.
11. **Firefox warning tolerance** — async scrolling warning is cosmetic; no jank observed; document but do not fix.
12. **Asset request audit** — document inspection method for duplicate requests; verify GitHub avatar caching in production; no code change unless confirmed issue.
13. **Validation before implementation** — perform §7 experiments to confirm root causes before making any code changes.

---

## 11. Project Rules (To Be Added to AGENTS.md)

After implementation, add the following rules to AGENTS.md:

1. **THREE.Clock ban:** Future application code must use `THREE.Timer` (Three.js r166+) or `performance.now()`, never `THREE.Clock`. Before upgrading `three` or `@react-three/fiber`, verify dependency attribution: run `grep -r "new Clock" node_modules/three node_modules/@react-three/fiber` to confirm whether deprecation warnings have been resolved upstream.

2. **WebGL context loss:** All `<Canvas>` components must include `onCreated` handler for `webglcontextlost` and `webglcontextrestored` events. On context loss: `preventDefault()`, unmount Canvas, show static fallback, kill ScrollTrigger. On context restored: remount Canvas.

3. **Visibility progressive enhancement:** Section cards must be visible by default (CSS `opacity: 1`). GSAP `fromTo` is progressive enhancement. Never gate content visibility on JS execution.

4. **Form viewport-fit:** Contact form must fit within 667px-tall mobile viewport (iPhone SE 2nd gen) without clipping. Test at 320x568, 375x667, 667x375 (landscape). All interactive controls must be >=44px (WCAG 2.5.5).

---

**Spec path:** `specs/navbar-form-visibility-repair.md`

**Next step:** Await user approval before implementation.
