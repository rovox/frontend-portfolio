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

- **React islands require `client:only="react"`** (SSR crash in workerd — `ReactCurrentDispatcher.current` is null). Current islands: `AudioController`, `MagneticCursor`, `TideEffect`.
- **Hash links must be absolute** (`/#skills`) with `data-astro-reload` — `ClientRouter` (enabled in `Layout.astro`) intercepts relative hashes.
- **GSAP: import from `../../utils/gsap-config` only** — never from `gsap` directly. This registers ScrollTrigger and sets `gsap.defaults({ ease: 'power3.out', duration: 0.8 })`.
- **Reduced motion: use `../../utils/reduced-motion`** helper (`prefersReducedMotion()`). Guard all animations; use `gsap.set({ opacity: 1, y: 0 })` as fallback.

## Architecture

- **CSS tokens** (`:root` in `Layout.astro`): colors (`--primary: #2de2e6`, `--secondary: #55ff9f`, `--accent: #8f6bff`), fonts (`--font-body: Inter`, `--font-mono: JetBrains Mono`), radii, transitions, shadows.
- **3D/WebGL**: `TideEffect.tsx` (R3F canvas, renders after `preloader:done`, z-index 5, 30vh). `WaterShader.ts` uses native Three.js types with named imports.
- **Splash**: `LoadingScreen.astro` — fixed overlay, vanilla JS, blocks scroll via `.is-loading` class, dispatches `preloader:done`. 3–8s hybrid timer. Check `window.__portfolioLoaderDone` before starting.
- **Lenis smooth scroll**: initialized in `Layout.astro` inline script. Connected to GSAP ticker: `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(...)`, `gsap.ticker.lagSmoothing(0)`. Destroyed on `astro:before-swap`.
- **Preloader lifecycle**: components that animate on load MUST check `window.__portfolioLoaderDone` first, then listen for `preloader:done` event. All ScrollTrigger instances must be killed on `astro:before-swap`.
- **Effects components** (`src/components/effects/`): `ParallaxLayer.astro`, `RevealMask.astro`, `SplitText.astro` are Astro wrappers; `MagneticCursor.tsx` is a React island; `HorizontalScroll.tsx` exists but is unreferenced.
- Astro config (`astro.config.mjs`): `vite.ssr.noExternal: ['react', 'react-dom']` required for workerd SSR edge case.
- Prettier formatter: `.ts`, `.tsx`, `.astro`, `.json`, `.css`, `.md` (configured in `opencode.json`).

## Data & Content

- Blog: Astro Content Collections with `glob()` loader from `astro:loaders`. Schema in `src/content.config.ts`. Posts in `src/content/blog/`.
- No external API dependencies. No `.env` files needed.

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

- @docs/project-evolution.md — growth decisions, paradigm shifts
- @docs/architecture-deep-dive.md — GSAP configs, Lenis lifecycle, effects, splash screen details
- @docs/api-and-data.md — Content Collections schema, endpoint contracts
- @spec.md — original roadmap
- @spec_awward_page_implementation.md — Awwwards effects plan
