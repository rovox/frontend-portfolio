# Portfolio Frontend - Specification & Roadmap

## Current Bugs — FIXED ✅

### B1: React SSR hook crash with `client:load` / `client:visible`

**Error:** `TypeError: Cannot read properties of null (reading 'useRef')` during SSR of React islands.

**Root cause:** Astro 6 + Cloudflare adapter + `@astrojs/react` tries SSR-render React components using `client:load`. The Cloudflare workerd runtime doesn't set up `ReactCurrentDispatcher.current`, causing hooks to fail.

**Fix applied:**
- `LoadingScreen.astro`: `BlackHoleLoader client:load` → `client:only="react"`
- `index.astro`: `TideEffect client:only="react"` (already done)
- `astro.config.mjs`: `vite.ssr.noExternal: ['react', 'react-dom']`

### B2: BlackHoleLoader error handling

**Fix applied:**
- Extracted `dispatchDone()` function for reuse
- Wrapped `finish()` GSAP dynamic import in try/catch — fires `preloader:done` on failure
- Added `isDisposed` guard in timeline `onComplete`
- Stored `reduceMotionTimeout` and cleared on unmount

### B3: Hero text visibility with fallback

**Fix applied:**
- Removed `opacity: 0` from `.hero-title`, `.subtitle`, `.hero-actions` CSS
- Added 8-second fallback timeout: if `preloader:done` never fires, animation auto-starts
- Fallback timer cleared when event fires to prevent double animation

### B4: Navbar hash links vs ClientRouter

**Fix applied:**
- Changed hash links from relative (`#skills`) to absolute paths (`/#skills`)
- Added `data-astro-reload` attribute on all hash links
- Prevents ClientRouter from intercepting anchor scrolls as page navigations

### B5: Right-side cutoff from DynamicBackground

**Fix applied:**
- Changed `width: '100vw'` to `width: '100%'` in DynamicBackground canvas
- Removed GSAP ScrollTrigger `scale: 1.05` and `rotation: 3` animation
- Removed GSAP/ScrollTrigger imports (no longer needed)
- Cleanup function simplified to only remove event listeners and cancel RAF

### B6: SSR handled via `client:only="react"`

**Fix applied:**
- All React islands use `client:only="react"` — no SSR rendering
- `output: 'static'` NOT used (incompatible with Cloudflare adapter)
- Cloudflare adapter handles output mode automatically
- All pages pre-rendered at build time regardless

---

## Pending Phases

### Phase 4 — Animation Performance & Reduced Motion

| Task | File | Description |
|------|------|-------------|
| P4.1 | `Layout.astro` | Add `prefers-reduced-motion` detection global class on `<html>` |
| P4.2 | `HeroSection.astro` | Skip GSAP animations if reduced motion — show content immediately |
| P4.3 | `SkillsSection.astro` | Skip ScrollTrigger on reduced motion |
| P4.4 | `ProjectsSection.astro` | Skip ScrollTrigger on reduced motion |
| P4.5 | `ContactSection.astro` | Skip ScrollTrigger on reduced motion |
| P4.6 | `LatestPosts.astro` | Skip ScrollTrigger on reduced motion |
| P4.7 | `BlackHoleLoader.tsx` | Already handles `prefers-reduced-motion` ✅ |
| P4.8 | `TideEffect.tsx` | Already handles `prefers-reduced-motion` ✅, viewport culling ✅, DPR cap ✅ |
| P4.9 | `Layout.astro` | Integrate `lenis` with GSAP ScrollTrigger for smooth scrolling ✅ |
| P4.10 | `HeroSection.astro` | GSAP hover effects on title (glow) and CTA buttons (scale + glow) ✅ |

### Phase 5 — SEO & AISEO

| Task | File | Description |
|------|------|-------------|
| P5.1 | `Layout.astro` | Add JSON-LD Person schema in `<head>` — Jose Roberto Vargas Orellana, Software Developer, Cochabamba Bolivia |
| P5.2 | `Layout.astro` | Add JSON-LD Blog schema linking to `/blog/` |
| P5.3 | Root | Create `llms.txt` — describe portfolio + link to blog |
| P5.4 | `Layout.astro` | Keep current `<link rel="preload">` for Google Fonts stylesheet |
| P5.5 | `Layout.astro` | Add `<meta name="author" content="Jose Roberto Vargas Orellana">` |
| P5.6 | Each page | Per-page meta descriptions via `title` prop |

### Phase 6 — Visual Polish & Creative Commands

| Task | Component | Description |
|------|-----------|-------------|
| P6.1 | `HeroSection.astro` | Mouse parallax on text layers — opposite cursor movement |
| P6.2 | `HeroSection.astro` | Per-character stagger: GSAP text animation on load |
| P6.3 | `HeroSection.astro` | CTA magnetic button — subtle pull toward cursor on hover |
| P6.4 | `Card.astro` | 3D tilt on hover (CSS-only `perspective` + `rotate`) |
| P6.5 | `Card.astro` | Glow border follows cursor (CSS `::after` pseudo-element) |
| P6.6 | `index.astro` | Scroll transition Hero → Skills: R3F scales + fades to solid |
| P6.7 | `BlackHoleLoader.tsx` | Reduce loading duration from 5s to 2s |
| P6.8 | `AudioController.tsx` | Procedural chiptune + lo-fi music with Tone.js ✅ |

---

## Cross-Cutting Concerns

### View Transitions Strategy

- `ClientRouter` active via `<ClientRouter />` in `Layout.astro`
- All internal page links use View Transitions
- Hash anchor links have `data-astro-reload` to skip interception
- GSAP ScrollTrigger instances killed on `astro:before-swap`
- React islands re-hydrate after View Transition with `client:only`

### Design Tokens (Layout.astro `:root`)

| Category | Tokens |
|----------|--------|
| Colors | `--bg`, `--surface`, `--surface-strong`, `--border`, `--text`, `--muted`, `--primary`, `--secondary`, `--accent` |
| Typography | `--font-body` (Inter), `--font-mono` (JetBrains Mono) |
| Radius | `--radius-sm` (0.4rem), `--radius-md` (0.6rem), `--radius-lg` (0.75rem) |
| Transitions | `--transition-fast` (0.2s), `--transition-normal` (0.3s), `--transition-slow` (0.5s) |
| Shadows | `--shadow-sm`, `--shadow-md`, `--shadow-lg` |

No Tailwind — hand-written CSS with custom properties.

### A11y Checklist

- [x] `lang="en"` on `<html>`
- [x] `:focus-visible` outlines (2px solid `--primary`)
- [x] `.sr-only` utility class
- [x] Skip-to-content link
- [x] Semantic `<nav>` with `aria-label` and `<ul>/<li>`
- [x] `aria-current="page"` on Navbar
- [x] `aria-pressed` on project filter buttons
- [x] `role="img"` and `aria-label` on R3F canvas
- [x] Blog dates use `<time datetime="">`
- [ ] Keyboard handlers for project filter buttons (arrow keys)
- [ ] Contact form labels (currently mailto link)

---

## File Manifest

```
src/
├── content.config.ts
├── content/blog/
│   ├── blog-1.md
│   ├── blog-2.md
│   └── blog-3.md
├── components/
│   ├── Hero3D/
│   │   ├── FloatingParticles.tsx     # UNUSED — kept for future
│   │   ├── TideEffect.tsx           # R3F water shader, DPR cap, viewport cull, a11y
│   │   └── WaterShader.ts           # GLSL shader
│   ├── ui/
│   │   ├── Button.astro             # primary/secondary/ghost, sm/md/lg
│   │   ├── Card.astro               # base card with glow toggle
│   │   ├── SectionWrapper.astro     # consistent section header
│   │   └── Tag.astro                # chip/tag
│   ├── BlackHoleLoader.tsx          # Canvas 2D loader, error handling
│   ├── ContactSection.astro         # Uses SectionWrapper + Button
│   ├── DynamicBackground.tsx        # Canvas 2D particle network
│   ├── HeroSection.astro            # Uses Button, fallback timeout
│   ├── LatestPosts.astro            # Static build-time getCollection()
│   ├── LoadingScreen.astro          # Wraps BlackHoleLoader (client:only)
│   ├── Navbar.astro                 # Semantic, aria-current, hash reload
│   ├── ProjectsSection.astro        # Uses Card + Tag + SectionWrapper
│   └── SkillsSection.astro          # Uses SectionWrapper
├── layouts/
│   ├── Layout.astro                 # ClientRouter, tokens, a11y globals
│   └── BlogLayout.astro            # Semantic article, time, tags
└── pages/
    ├── about.astro                  # Real profile (Cochabamba, Bolivia)
    ├── blog.astro                   # Dynamic getCollection('blog')
    ├── blogs/[...slug].astro        # Dynamic blog route
    ├── index.astro                  # Landing page
    └── projects/project-1.md        # Empty placeholder
```

## Dependencies

| Package | Status |
|---------|--------|
| `astro@6.0.5` | Current |
| `@astrojs/react@5.0.0` | Current (React 18 compatible) |
| `@astrojs/cloudflare@13.1.2` | Current |
| `react@18.3.1` | Current |
| `gsap@3.14.2` | Current |
| `@react-three/fiber@8.18.0` | Current |
| `three@0.183.2` | Current |
| `lenis@1.3.19` | **Unused** — remove in P4.9 |
