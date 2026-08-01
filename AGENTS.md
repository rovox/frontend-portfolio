# Portfolio Frontend — Master Index

Astro 6 + React 18 portfolio, deployed to Cloudflare Workers. No Tailwind; hand-written CSS with `:root` tokens in `Layout.astro`.

## Commands

```bash
pnpm dev              # localhost:4321
pnpm check            # astro check (TypeScript)
pnpm build            # static prerender + Cloudflare bundle
pnpm preview          # build then wrangler dev
pnpm deploy           # build then wrangler deploy
pnpm generate-types   # wrangler types -> worker-configuration.d.ts
```

## Critical Rules

- **React islands require `client:only="react"`** (SSR crash in workerd — `ReactCurrentDispatcher.current` is null). Current islands: `AudioController`, `TideEffect`, `ThemeToggle`, `ScrollProgressBar`, `ScrollInactivityHint`.
- **Hash links use absolute paths** (`/#skills`) but **no `data-astro-reload`** — `data-astro-reload` forces full reloads, which re-trigger the splash screen. Client-side scroll is handled by a document-level delegated `click` listener in `Navbar.astro` (covers all `a[href^="/#"]` links including hero CTAs) plus an `astro:page-load` listener in `Layout.astro` for initial page-load hashes, both using Lenis with a native `scrollIntoView` fallback. **The delegated listener MUST be registered in capture phase** (`{ capture: true }`) so it runs before Astro's `ClientRouter`, whose bubble-phase listener would otherwise `preventDefault()` + `navigate()` every hash click and break the custom Lenis scroll. **Exception**: Splash screen is a deliberate WCAG2.3.3 exception — it always shows on fresh load (no sessionStorage guard, no reduced-motion skip). Users bypass via Skip button or Escape key.
- **GSAP: import from `../../utils/gsap-config` only** — never from `gsap` directly. This registers ScrollTrigger and sets `gsap.defaults({ ease: 'power3.out', duration: 0.8 })`.
- **Reduced motion: use `../../utils/reduced-motion`** helper (`prefersReducedMotion()`). Guard all animations; use `gsap.set({ opacity: 1, y: 0 })` as fallback.

## Design System

- **Theme "Midnight Protocol" (dark) + "Dawn Protocol" (light)** — authoritative design specs in `DESIGN.md`. All colors, typography, elevation, spacing, and component rules are defined there. No Tailwind; hand-written CSS with `:root` tokens and `:root[data-theme="light"]` overrides.
- **CSS tokens** (`:root` in `Layout.astro`): must mirror `DESIGN.md` colors/typography. Key tokens: `--primary: #e1fdff`, `--primary-container: #00f2ff`, `--surface: rgba(21,29,30,0.7)`, fonts (`--font-body: Inter`, `--font-mono: JetBrains Mono`), radii (`--radius-sm: 0.125rem` through `--radius-xl: 0.75rem`). Light tokens override via `data-theme="light"`.
- **Visibility progressive enhancement**: Section cards visible by default (CSS `opacity: 1`). GSAP `fromTo` is enhancement only; never gate content visibility on JS.
- **Contact form viewport-fit**: Must fit 667px-tall mobile viewport without clipping; controls >=44px (WCAG 2.5.5).
- **Radii**: `--radius-sm: 0.375rem`, `--radius-md: 0.625rem`, `--radius-lg: 1rem`, `--radius-xl: 1.5rem` (softened scale, mirrors DESIGN.md). Light mode: `--primary-container: #0e7490` (AA-compliant), `--accent` defined in both themes.
- **Fonts are self-hosted** via `@fontsource/inter` + `@fontsource/jetbrains-mono` imported in `Layout.astro` frontmatter. Never add Google Fonts `<link>` tags.
- **Landmarks**: `<header>` wraps Navbar, `<main id="main-content">` wraps slot. Anchor targets use `section[id] { scroll-margin-top: 90px; }` — keep when adding sections.
- **Theme initialization** must be a synchronous inline `<script is:inline>` in `<head>` to prevent FOUC. `ThemeToggle.tsx` only handles toggling and persistence.
- **Theme toggle is DISABLED — dark mode only** (this session): `<ThemeToggle client:only="react" />` (import + 2 usages in `Navbar.astro`) and the localStorage/prefers-color-scheme logic in `Layout.astro` init script are commented out; the init script forces `data-theme="dark"`. Light-mode CSS (`:root[data-theme="light"]`) remains as inert dead code. Restore all commented lines to re-enable light/dark switching.
- **Before any visual change**, read `DESIGN.md` first. Do not hardcode colors or typography values — derive from DESIGN.md tokens.

## Architecture
- **3D/WebGL**: `TideEffect.tsx` (R3F canvas, renders after `preloader:done`, z-index 5, 30vh). `WaterShader.ts` uses native Three.js types with named imports.
- **THREE.Clock ban**: Future code uses `THREE.Timer` (r166+) or `performance.now()`, never `THREE.Clock`. Current code complies. Console deprecation warnings originate from R3F/Three internals; tolerated until upstream fixes. Before upgrading `three`/`@react-three/fiber`, verify attribution (`grep -r "new Clock" node_modules/three node_modules/@react-three/fiber`).
- **WebGL context loss**: All `<Canvas>` components must handle `webglcontextlost`/`webglcontextrestored`: `preventDefault()`, show static fallback, kill ScrollTrigger on loss, **recreate ScrollTrigger on restore** (recovery is mandatory — without it scroll-driven effects stay dead forever). Never hide page content on context loss. In `TideEffect.tsx`, the canvas stays mounted — scroll visibility is driven only by wrapper CSS (opacity/visibility). **Do NOT unmount the canvas based on scroll progress**: unmounting can fire `webglcontextlost` in Firefox, which kills the fade ScrollTrigger and makes the waves disappear permanently.
- **Hash-link navigation vs Astro ClientRouter**: `ClientRouter` (`astro:transitions`) registers a document click listener in bubble phase before any page script, then `preventDefault()` + `navigate()`s every `/#hash` anchor — overriding custom hash scrolling. Any delegated hash-link handler MUST be registered in **capture phase** (`on(document, 'click', fn, { capture: true })`) so it runs first; its `preventDefault()` makes ClientRouter bail out (it checks `ev.defaultPrevented`) and the Lenis scroll wins.
- **Splash**: `LoadingScreen.astro` — FSM (`NOT_STARTED/RUNNING/COMPLETED/SKIPPED/FAILED`), overlay `display:none` by default, cleanup registry (no orphaned listeners), 12s watchdog, dispatches `preloader:done` on EVERY exit path. Never monkey-patch `window.matchMedia`. Typewriter uses one `gsap.to` on `state.progress` (no `tl.call()` loops) + WebAudio click. **WCAG2.3.3 exception**: splash always shows on fresh load (no sessionStorage guard, no reduced-motion skip). Users bypass via Skip button or Escape key. Reduced-motion respected everywhere else.
- **Module lifecycle**: interactive scripts use `defineModule(name, init)` from `src/utils/lifecycle.ts` — init on `astro:page-load`, destroy on `astro:before-swap`, idempotent after SPA nav. Every listener/ScrollTrigger/timer must have a matching cleanup.
- **Diagnostics**: `src/utils/debug.ts` — `logLifecycle`/`mark`/`measure` are dev-only; `fail` always logs. No `console.log` in committed code.
- **Lenis smooth scroll**: initialized via `defineModule('lenis', …)` in `Layout.astro`. Connected to GSAP ticker: `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(...)`, `gsap.ticker.lagSmoothing(0)`.
- **Preloader lifecycle**: components that animate on load MUST check `window.__portfolioLoaderDone` first, then listen for `preloader:done` event. All ScrollTrigger instances must be killed on `astro:before-swap`.
- **Effects components** (`src/components/effects/`): `RevealMask.astro`, `SplitText.astro` are Astro wrappers; `ScrollProgressBar.tsx`, `ScrollInactivityHint.tsx` are React islands. Deleted as obsolete: `ParallaxLayer.astro`, `HorizontalScroll.tsx`, `MagneticCursor.tsx`, `SplashFluid.astro`, `Hero3D/SplashFluid.tsx`.
- **Scroll-driven vs autonomous motion**: `prefers-reduced-motion` guards ONLY autonomous animations (entrance tweens, blink loops). Scroll-linked scrub effects (tide fade, terminal pin journey) MUST always initialize — they are user-controlled and required for visibility. Never wrap ScrollTrigger fade/pin logic in a reduced-motion early return.
- **Terminal journey** (`HeroSection.astro`): GSAP pin at `center center` (pinSpacing: false), releases at `#experience top 65%`, horizontal drift to viewport center on ≥1040px, opacity fade scrub `#experience top 85% → 65%`. Do NOT wrap `.hero` in transformed wrappers (e.g. ParallaxLayer) — transformed ancestors break `position: fixed` pinning.
- Astro config (`astro.config.mjs`): `vite.ssr.noExternal: ['react', 'react-dom']` required for workerd SSR edge case.
- Prettier formatter: `.ts`, `.tsx`, `.astro`, `.json`, `.css`, `.md` (configured in `opencode.json`).

## Data & Content

- Blog, Skills, Experiences, Projects, Education, Leadership: Astro Content Collections with `glob()` loader from `astro:loaders`. Schemas in `src/content.config.ts`. Markdown files in `src/content/blog/`, `src/content/skills/`, `src/content/experiences/`, `src/content/projects/`, `src/content/education/`, `src/content/leadership/`.
- **Blog feature is DISABLED** (spec `specs/bugfix-a11y-splash-round1.md` §H): nav link + `<LatestPosts />` commented out, `blog.astro` + `blogs/[...slug].astro` are stubs. Files/content kept in repo — restore from git history to re-enable.
- External links (CV EN/ES, social URLs, Formspree endpoint) are centralized in `src/config.ts` — never hardcode Drive URLs or endpoints in components.
- **Contact form**: uses Formspree (`FORMSPREE_ENDPOINT` in `config.ts`) with plain HTML `<form>` (no JS library). Honeypot anti-spam, success detection via `?submitted=1` query param.
- **Removed features**: `LanguageToggle.tsx` and `utils/i18n.ts` were deleted (dormant i18n scaffold). Git history preserves them if needed.
- `src/utils/cursor/cursor-system.ts` is an unused architecture scaffold (plugin registry) — do not instantiate until the cursor system feature is planned.
- No external API dependencies. No `.env` files needed.

## Scroll & Navigation Features

- **Scroll Progress Bar**: `ScrollProgressBar.tsx` — fixed below navbar (70px), neon gradient with shimmer effect during scroll, 1s timeout to deactivate shimmer. Respects `prefers-reduced-motion`.
- **Scroll Inactivity Hint**: `ScrollInactivityHint.tsx` — appears after 30s of inactivity, invites user to continue scrolling. Disappears on any interaction.
- **TideEffect**: Bidirectional fade — water effect fades out on scroll down (40vh), reappears on scroll up. Scrub: 0.3 for responsive behavior.
- **Hero Terminal Sticky**: Terminal moves from center to left on desktop (≥1040px) during scroll, fades out in last 20% of hero section. Shows "About Me" content.

## Deploy Target

- Cloudflare Workers via `@astrojs/cloudflare`. Config in `wrangler.jsonc`.

## OpenCode Ecosystem

- **Protocol**: All agents MUST follow the session protocol in `.opencode/agents/orchestrator.md`
- Skills: `.opencode/skills/<name>/SKILL.md` — loaded on-demand via `skill()`.
- Agents: `.opencode/agents/<name>.md` — custom agent definitions.
- Plans: `.opencode/plans/<name>.md` — implementation plans.

## Expansive Documentation

Before any complex implementation, review AGENTS.md and linked files. After implementation, evaluate if a new rule must be added.

Load `@docs/` files via Read tool on a need-to-know basis. Treat loaded content as mandatory instructions. Follow references recursively.

- **DESIGN.md** — authoritative theme spec ("Midnight Protocol"): colors, typography, elevation, spacing, components
- @docs/project-evolution.md — growth decisions, paradigm shifts
- @docs/architecture-deep-dive.md — GSAP configs, Lenis lifecycle, effects, splash screen details
- @docs/api-and-data.md — Content Collections schema, endpoint contracts
- @spec.md — original roadmap
- @spec_awward_page_implementation.md — Awwwards effects plan
