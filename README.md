# Portfolio Frontend — Jose Roberto Vargas Orellana

Portfolio interactivo construido con Astro 6, React islands, Three.js (R3F), GSAP y Lenis. Desplegado en Cloudflare Workers.

## Stack

| Herramienta | Propósito |
|-------------|-----------|
| **Astro 6** | Framework estático con islands architecture |
| **React 18** | Componentes interactivos (`client:only="react"`) |
| **@react-three/fiber** | Canvas 3D (TideEffect water shader) |
| **GSAP + ScrollTrigger** | Animaciones de entrada y parallax |
| **@gsap/react** | Hook `useGSAP()` para cleanup automático |
| **Lenis** | Smooth scrolling integrado con GSAP ticker |
| **Tone.js** | Música procedural chiptune + lo-fi, sin archivos |
| **Cloudflare** | Adapter para deploy serverless |
| **Astro Content Collections** | Blog con `glob()` loader |

## Estructura

```
src/
├── components/
│   ├── ui/                      # Componentes atómicos reusables
│   │   ├── Button.astro
│   │   ├── Card.astro
│   │   ├── SectionWrapper.astro
│   │   └── Tag.astro
│   ├── Hero3D/                  # Three.js / R3F
│   │   ├── TideEffect.tsx       # Water shader interactivo (30vh)
│   │   ├── WaterShader.ts      # GLSL shader (sin imports THREE)
│   │   └── FloatingParticles.tsx # Inactivo (mantenido)
│   ├── HeroSection.astro       # Hero con GSAP (hover glow + CTA)
│   ├── DynamicBackground.tsx    # Particle network canvas 2D
│   ├── SkillsSection.astro
│   ├── ProjectsSection.astro
│   ├── LatestPosts.astro
│   ├── ContactSection.astro
│   ├── Navbar.astro             # Hash links absolutos (/#skills)
│   ├── LoadingScreen.astro      # Wrapper para RetroLoader
│   ├── RetroLoader.tsx          # VFD counter + scanner CSS
│   └── AudioController.tsx      # Música procedural chiptune/lo-fi
├── content/
│   └── blog/                    # Content Collections (3 posts)
├── content.config.ts            # Astro 6 glob() loader
├── layouts/
│   ├── Layout.astro             # ClientRouter + tokens + lenis
│   └── BlogLayout.astro         # Semantic article layout
└── pages/
    ├── index.astro              # Landing (Hero + Sections)
    ├── about.astro              # Bio
    ├── blog.astro               # Blog index
    └── blogs/[...slug].astro    # Dynamic blog routes
```

## Decisiones técnicas

### `client:only="react"` en todos los React islands

Los componentes React **no se renderizan en SSR**. En el runtime de Cloudflare workerd, `ReactCurrentDispatcher.current` es `null` y los hooks fallan. Todos los imports React usan `client:only="react"` para evitar el SSR.

Esto incluye: `DynamicBackground`, `TideEffect`, `RetroLoader`.

### Navbar + View Transitions

Los links hash usan rutas **absolutas** (`/#skills`, `/#projects`, `/#contact`) con atributo `data-astro-reload` para que `ClientRouter` no los intercepte como navegaciones de página.

### Lenis + GSAP integración

```js
// Layout.astro <script>
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)
```

Lenis se destruye en `astro:before-swap` para evitar leaks.

### RetroLoader

- VFD 5-dígitos (`clamp(6rem, 25vw, 20rem)`) con transición white → yellow → red
- Scanner CSS-only (no Canvas): `left` con `transition: 200ms linear`
- Proyección de dígitos con `mix-blend-mode: hard-light`, `scale(1.5)`, `blur(2px)`
- Sin Canvas particles/embers
- Sin sessionStorage — se muestra en cada refresh

### TideEffect

- R3F con water shader (simplex noise + mouse ripple)
- `z-index: 5`, height `30vh`, fixed al bottom
- Respeta `prefers-reduced-motion`: muestra gradiente estático
- DPR cap `[1, 1.5]`, IntersectionObserver para lazy render
- THREE.js imports tree-shaken: named imports (`DoubleSide`, `Mesh` type)

### AudioController

- **Generación procedural** con Tone.js (zero archivos externos)
- **Estilo**: Chiptune (square/triangle waves) + tratamiento lo-fi (BitCrusher + Reverb)
- **Tempo**: 80 BPM, swing 12%, ghost notes 30% para feel "imperfecto"
- **Autoplay**: Inicia automáticamente tras evento `preloader:done` del RetroLoader
- **Fallback**: Si el browser bloquea AudioContext, muestra "🔊 Click para música" y espera primer click
- **Controles**: Play/pause ▶/⏸, visualizer de 3 barras, slider de volumen
- **Posición**: Esquina inferior-derecha, `z-index: 1000`, semi-transparente
- **Persistencia**: Montado fuera del `<slot>` en `Layout.astro` — sobrevive View Transitions
- **Accesibilidad**: Respeta `prefers-reduced-motion: reduce`, `aria-label` en controles

## Design Tokens (`:root` en Layout.astro)

| Categoría | Tokens |
|-----------|--------|
| Colores | `--bg`, `--surface`, `--border`, `--text`, `--muted`, `--primary` (#2de2e6), `--secondary` (#55ff9f), `--accent` (#8f6bff) |
| Tipografía | `--font-body` (Inter), `--font-mono` (JetBrains Mono) |
| Radio | `--radius-sm` (0.4rem), `--radius-md` (0.6rem), `--radius-lg` (0.75rem) |
| Transición | `--transition-fast` (0.2s), `--transition-normal` (0.3s), `--transition-slow` (0.5s) |
| Sombras | `--shadow-sm`, `--shadow-md`, `--shadow-lg` |

## Accesibilidad

- Skip link al main content
- `.sr-only` para texto screen-reader
- `:focus-visible` global con outline cyan
- `aria-current="page"` en Navbar activo
- `aria-label` en R3F canvas, semantic `<article>` en blog
- `prefers-reduced-motion` respetado en GSAP y R3F

## Bugs corregidos

| Bug | Solución |
|-----|----------|
| SSR React hook crash | `client:only="react"` en todos los islands |
| Hero texto invisible | Removido `opacity: 0` CSS + fallback timeout 8s |
| Navbar hash links rotos | Rutas absolutas `/#skills` + `data-astro-reload` |
| Right-side cutoff | `100vw` → `100%`, removido GSAP scale/rotation |
| DynamicBackground GSAP leak | Eliminada animación ScrollTrigger innecesaria |

## Comandos

```bash
pnpm dev          # http://localhost:4321
pnpm check        # TypeScript check
pnpm build        # Build + pre-render
pnpm deploy       # Build + wrangler deploy
```

## Pendiente (ver `spec.md`)

- Phase 4: `prefers-reduced-motion` en secciones con ScrollTrigger
- Phase 5: JSON-LD Person/blog schemas, meta tags
- Phase 6: Mouse parallax, per-character stagger, CTA magnetic, Card tilt
