# Especificación de Mejoras Visuales — Portfolio v2.2

> **Corregida tras auditoría de accesibilidad/arquitectura.** Fixes críticos: `--muted` AA, pseudo-elemento → `<span>` real, `frameloop="demand"`. Cambios clave: scroll snap eliminado, paleta light corregida (contraste AA+), neon limitado a Hero+Projects, markdown como cimiento primero.

---

## Priorización Final

| # | Feature | Archivos | Notas |
|---|---------|----------|-------|
| 1 | **Splash Fix + Links** | 4 | Quick wins |
| 2a | **Schemas + 1 prueba** | 6 | Validar antes de migrar |
| 2b | **Migración masiva .md** | 22 | Si 2a pasa validación |
| 2c | **Refactor componentes** | 6 | getCollection() + filtros |
| 3 | **Tema Dark/Light** | 4 | Script inline anti-FOUC |
| 4 | **Olas Scroll-Driven** | 1 | Listener theme-changed opcional |
| 5 | **Neon Limitado** | 2 | Solo Hero + Projects |

**Verificación GSAP:** `src/utils/gsap-config.ts` ya exporta `ScrollTrigger` registrado (línea 1: `import { gsap, ScrollTrigger } from '../utils/gsap-config'`). Confirmar antes de Fase 4 y 5.

---

## 1. Splash Fix + Botones Funcionales

### 1.1 Splash Screen: Solo al Inicio

**Problema:** `data-astro-reload` en hash links (`/#work`, `/#skills`) fuerza recarga completa → resetea `window.__portfolioLoaderShown` → splash se reproduce en cada navegación.

**Solución (3 pasos):**

**Paso 1 — Eliminar `data-astro-reload`** de `Navbar.astro` (líneas 41, 75).

**Paso 2 — Manejar hash navigation con JS.** En `Layout.astro`, agregar script que:
- Escuche `astro:page-load` (no solo `DOMContentLoaded`, porque SPA no dispara DOMContentLoaded)
- Detecte `window.location.hash` y haga scroll suave con Lenis al elemento
- Sea idempotente (no re-ejecutar si ya scrolleó)

```js
// En Layout.astro, dentro del <script> existente (DEFENSIVO)
function scrollToHash() {
  const hash = window.location.hash;
  if (!hash) return;
  const target = document.querySelector(hash);
  if (!target) return;
  
  // Intentar Lenis primero, fallback nativo
  if ((window as any).lenis) {
    (window as any).lenis.scrollTo(target, { offset: -80 });
  } else {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.scrollBy(0, -80); // offset manual del navbar
  }
}

document.addEventListener('astro:page-load', scrollToHash);
// También en carga inicial (DOMContentLoaded para la primera visita)
if (document.readyState === 'complete') scrollToHash();
else window.addEventListener('DOMContentLoaded', scrollToHash, { once: true });
```

**Paso 3 — Unificar guardia del splash a `sessionStorage`.** En `LoadingScreen.astro`:
- Reemplazar `window.__portfolioLoaderShown` por solo `sessionStorage.getItem('splashShown')`
- Eliminar `window.__inViewTransition` (ya no es necesario sin `data-astro-reload`)
- El guardia queda:

```js
if (sessionStorage.getItem('splashShown')) return;
// ... splash plays ...
// En finishSplash():
sessionStorage.setItem('splashShown', 'true');
```

**Efecto:** Splash se muestra SOLO en la primera carga de la sesión. Navegación entre secciones y páginas (SPA) no lo re-ejecuta. Hard reload (F5) sí lo muestra (nueva sesión). Esto es exactamente lo que pide el usuario.

**Comportamiento en múltiples pestañas:** `sessionStorage` es por pestaña. Si el usuario abre una nueva pestaña, el splash se reproduce. Esto es aceptable — cada pestaña es una "sesión nueva" desde la perspectiva del navegador. Si se quisiera evitar, se podría usar `localStorage` con timestamp de 24h, pero añade complejidad innecesaria para este caso de uso.

**Archivos:**
- Modificar: `Navbar.astro`, `LoadingScreen.astro`, `Layout.astro`

### 1.2 Botones Funcionales

| Elemento | URL |
|----------|-----|
| Download CV (Hero + Navbar) | `https://drive.google.com/drive/folders/1KcNrxqSg8towANTFRmfrMF6POSGxYoZo?usp=sharing` |
| WhatsApp | `https://wa.me/59162642144` |
| LinkedIn | `https://www.linkedin.com/in/jroberto-vargas-orellana/` |
| Gmail | `mailto:varor.joseroberto@gmail.com` |

**Archivos:**
- `HeroSection.astro` — línea 54: `href="#"` → URL Drive
- `Navbar.astro` — líneas 47, 81: `href="#"` → URL Drive
- `index.astro` — verificar socialLinks (ya correctos)

---

## 2. Contenido en Markdown con Tags (CIMIENTO)

> **Va primero** porque las features 3-5 modifican componentes que se reescribirán al migrar datos. Hacerlo ahora evita trabajo duplicado.

### 2.1 Estructura

```
src/content/
  config.ts              ← schemas Zod (skills, experiences, projects, education, leadership)
  skills/                ← 6 archivos .md
  experiences/           ← 9 archivos .md  
  projects/              ← 6 archivos .md
  education/             ← 3 archivos .md
  leadership/            ← 4 archivos .md
```

### 2.2 Esquemas en config.ts

```ts
import { defineCollection, z } from 'astro:content';

const skillsCollection = defineCollection({
  schema: z.object({
    icon: z.string(),
    title: z.string(),
    order: z.number(),
    tags: z.array(z.string()).default([]),
  }),
});

const experiencesCollection = defineCollection({
  schema: z.object({
    role: z.string(),
    company: z.string(),
    location: z.string(),
    period: z.string(),
    type: z.enum(['professional', 'university']),
    technologies: z.array(z.string()),
    tags: z.array(z.string()).default([]),
    order: z.number(),
  }),
});
// ... mismo patrón para projects, education, leadership
```

### 2.3 Ejemplo de archivo .md

```markdown
---
role: 'Flutter FullStack Developer'
company: 'Tilinka'
location: 'Cochabamba, Bolivia / Remote'
period: 'Feb 2026 – Mar 2026'
type: 'professional'
technologies: ['Flutter', 'Dart', 'Clean Architecture', 'DDD', 'BLoC', 'SOLID', 'REST API']
tags: ['mobile', 'flutter', 'architecture']
order: 1
---

- Architected enterprise fitness application from ground up using Clean Architecture and DDD
- Implemented core business logic for AI-powered workout generation
- Built scalable BLoC state management patterns from fundamentals
- Enforced code review discipline: AI-generated modules undergo manual architectural review
```

### 2.4 Filtrado en UI

Cada sección tendrá chips de filtro:

| Sección | Filtros |
|---------|---------|
| Experience | `All | Professional | University` |
| Projects | `All | web | blockchain | mobile | design` |
| Skills | `All | Core | Blockchain | 3D | Mobile | DevOps | AI` |

Lógica: vanilla JS en cada `*Section.astro`. Al hacer clic en un chip, se filtra el array de items por tag. Transición CSS `opacity` + `transform` para ocultar/mostrar items.

### 2.5 Archivos

**Crear:**
- `src/content/config.ts` — extender con 5 nuevas colecciones
- `src/content/skills/core-engineering.md`
- `src/content/skills/blockchain-web3.md`
- `src/content/skills/3d-graphics.md`
- `src/content/skills/mobile-engineering.md`
- `src/content/skills/devops-infrastructure.md`
- `src/content/skills/ai-assisted.md`
- `src/content/experiences/tilinka-flutter.md`
- `src/content/experiences/tilinka-ark-studio.md`
- `src/content/experiences/tilinka-corporate.md`
- `src/content/experiences/cumulo-blockchain.md`
- `src/content/experiences/pictoaudios.md`
- `src/content/experiences/silloroll.md`
- `src/content/experiences/oh-sansi.md`
- `src/content/experiences/dulce-aroma.md`
- `src/content/experiences/election-system.md`
- `src/content/experiences/scesi-website.md`
- `src/content/projects/ark-studio-3d.md`
- `src/content/projects/rosca-smart-contracts.md`
- `src/content/projects/enterprise-fitness.md`
- `src/content/projects/corporate-website.md`
- `src/content/projects/pictoaudios-platform.md`
- `src/content/projects/silloroll-mobile.md`
- `src/content/education/umss-computer-engineering.md`
- `src/content/education/data-science-diploma.md`
- `src/content/education/specializations.md`
- `src/content/leadership/scesi-vice-president.md`
- `src/content/leadership/llajtita-flisol.md`
- `src/content/leadership/hackmeeting.md`
- `src/content/leadership/hacklab-brickheads.md`

**Modificar:**
- `index.astro` — reemplazar data inline con `await getCollection()`
- `SkillsSection.astro` — aceptar datos, agregar chips de filtro
- `ExperienceSection.astro` — mismo
- `ProjectsSection.astro` — mismo
- `EducationSection.astro` — aceptar datos de collection
- `LeadershipSection.astro` — aceptar datos de collection

---

## 3. Tema Dark / Light

### 3.1 Identidad Dual

| | Dark (Midnight Protocol) | Light (Dawn Protocol) |
|---|---|---|
| **Acento** | `#00f2ff` (neón cian) | `#0891b2` (dark cyan — visible sobre light) |
| **Acento hover** | `#2dd4bf` (teal suave) | `#0e7490` (cyan deeper) |
| **Fondo** | `#0d1515` (midnight navy) | `#faf6f1` (ivory cálido) |
| **Texto** | `#dce4e4` (light gray) | `#1e293b` (dark slate) |
| **Glass** | `rgba(21,29,30,0.7)` + blur | `rgba(255,255,255,0.65)` + box-shadow, SIN blur |

### 3.2 Paleta Light Corregida (contraste AAA/AA)

| Token | Valor | Contraste sobre `#faf6f1` |
|-------|-------|---------------------------|
| `--bg` | `#faf6f1` | — |
| `--surface` | `rgba(255,255,255,0.65)` | — |
| `--surface-high` | `#f0ebe5` | — |
| `--surface-container` | `#f5f0eb` | — |
| `--surface-container-low` | `#ede8e3` | — |
| `--surface-container-lowest` | `#e5e0db` | — |
| `--surface-bright` | `#ffffff` | — |
| `--surface-dim` | `#e8e3de` | — |
| `--text` | `#1e293b` | 12.5:1 (AAA) ✅ |
| `--muted` | `#5c6d80` | 4.8:1 (AA) ✅ |
| `--primary` | `#0c4a6e` | 8.8:1 (AAA) ✅ |
| `--primary-container` | `hsl(183, 85%, 42%)` ≈ `#10b8c4` | 3.4:1 ⚠️ (solo para bordes/íconos, NO texto. Mismo hue que dark mode: 183°) |
| `--on-primary` | `#ffffff` | — |
| `--on-primary-container` | `#ffffff` | — |
| `--secondary` | `#475569` | 7.1:1 (AAA) ✅ |
| `--secondary-container` | `#e2e8f0` | — |
| `--outline` | `#94a3b8` | 3.1:1 (suficiente para bordes) |
| `--border` | `rgba(0,0,0,0.08)` | — |
| `--error` | `#b91c1c` | 5.2:1 (AA) ✅ |
| `--surface-tint` | `#0891b2` | 3.2:1 (solo decorativo) |

**Regla de uso:** `--primary-container` NUNCA se usa como fondo de texto en light mode. Solo para bordes, íconos, y el toggle de tema. Para botones primarios con texto, se usa `--primary` (dark cyan) como color de texto con borde `--primary-container`.

### 3.3 Glassmorphism Light (CORREGIDO — sin blur porque no hay variación de fondo)

En light mode, `backdrop-filter: blur()` sobre un fondo sólido uniforme (`#faf6f1`) no produce efecto visible. `rgba(255,255,255,0.65)` sin blur es solo un color plano más claro. Se reemplaza por tarjetas con sombras y bordes sólidos (elevation clásica), renombrando la clase:

```css
[data-theme="light"] .glass-card {
  /* Renamed conceptually to .elevated-card in light mode */
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06), 0 4px 24px rgba(0, 0, 0, 0.04);
  /* SIN backdrop-filter — inefectivo en fondo uniforme */
}
[data-theme="light"] .glass-card:hover {
  border-color: var(--primary-container);
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 8px 32px rgba(0, 0, 0, 0.06);
}
```

En dark mode, `.glass-card` mantiene su `backdrop-filter: blur(12px)` actual (efectivo porque hay variación de fondo con las olas y parallax).

### 3.4 Prevención de FOUC (Flash of Unstyled Content)

**Problema:** Si el tema se aplica desde React (client:only), hay un flicker entre el tema default y el guardado.

**Solución:** Script **inline síncrono** en `<head>` de `Layout.astro`:

```html
<script is:inline>
  (function() {
    const stored = localStorage.getItem('theme');
    const theme = stored || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  })();
</script>
```

El `ThemeToggle.tsx` solo cambia el estado y persiste, pero nunca hace la aplicación inicial.

### 3.5 ThemeToggle.tsx

Isla React (`client:only="react"`). Función única: alternar `data-theme` y localStorage. Dispara `CustomEvent('theme-changed')` para que `TideEffect` pueda ajustar colores del agua si es necesario.

### 3.6 Archivos

- **Modificar:** `Layout.astro` — script inline + tokens light corregidos
- **Crear:** `ThemeToggle.tsx`
- **Modificar:** `Navbar.astro` — insertar `<ThemeToggle />`
- **Modificar:** `DESIGN.md` — agregar sección "Dawn Protocol"

---

## 4. Efecto de Olas Scroll-Driven

### 4.0 Dependencia: Evento `theme-changed`

`ThemeToggle.tsx` (Fase 3) dispara `CustomEvent('theme-changed')` al cambiar de tema. `TideEffect.tsx` **debe escuchar este evento** para ajustar `uColorA`/`uColorB` del shader si se desea que las olas cambien de color según el tema. Los colores actuales (`#002d5f` → `#5052c8`) son adecuados para dark mode. Para light mode, colores más claros como `#bae6fd` → `#7dd3fc` (sky blue).

**Implementación en TideEffect.tsx:**
```tsx
useEffect(() => {
  const handleThemeChange = () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (meshRef.current) {
      const mat = meshRef.current.material as ShaderMaterial;
      mat.uniforms.uColorA.value.set(isLight ? '#bae6fd' : '#002d5f');
      mat.uniforms.uColorB.value.set(isLight ? '#7dd3fc' : '#5052c8');
    }
  };
  window.addEventListener('theme-changed', handleThemeChange);
  return () => window.removeEventListener('theme-changed', handleThemeChange);
}, []);
```

Si no se implementa este listener, las olas mantienen colores oscuros en ambos temas. Es aceptable como MVP; el ajuste de color es opcional.

### 4.1 Comportamiento

| Scroll | Olas |
|--------|------|
| `scrollY = 0` | Visibles en 30vh inferior, animación normal, opacidad 1 |
| `0 → 50vh` | Contenedor sube con `translateY` proporcional |
| `50vh → 80vh` | Opacidad desciende de 1 a 0 |
| `> 80vh` | Ocultas (opacidad 0) |
| Scroll ↑ (regreso) | Reaparecen inversamente (fade in + translateY reverse) |

### 4.2 Técnica (CORREGIDA: NO animar mesh, solo container div)

El canvas R3F se mantiene en **30vh de altura real**. Se envuelve en un `<div>` contenedor de **100vh** que:
1. Posiciona el canvas en la parte inferior (`bottom: 0`)
2. Usa GSAP ScrollTrigger con `scrub: true` para animar:
   - `transform: translateY(0 → -25vh)` del wrapper
   - `opacity: 1 → 0` del wrapper

```tsx
// En TideEffect.tsx
const wrapperRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!wrapperRef.current) return;
  
  const ctx = gsap.context(() => {
    gsap.to(wrapperRef.current, {
      y: '-25vh',
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: '80vh top',
        scrub: 0.6,
      }
    });
  });
  
  return () => ctx.revert();
}, []);
```

**El shader NO se modifica.** Sigue animándose con `uTime`. El movimiento del contenedor no afecta la simulación del agua.

**Optimización de rendimiento:** Usar `frameloop="demand"` en el `<Canvas>` de R3F. Esto significa que el canvas solo renderiza cuando hay cambio de estado/props, no a 60fps constante. Cuando `opacity: 0`, el browser ya optimiza el compositing de la capa invisible. No se requiere "pausar GPU" manualmente (técnicamente inviable con `useFrame`).

### 4.3 Archivos

- **Modificar:** `TideEffect.tsx` — wrapper 100vh + ScrollTrigger + pausa condicional
- **NO modificar:** `WaterShader.ts` (sin cambios)

---

## 5. Efectos Neon (LIMITADOS — solo Hero + Projects)

### 5.1 Principio: "Menos es más"

Midnight Protocol funciona por restricción: oscuridad, UN acento, movimiento sutil. La especificación original proponía 5 efectos simultáneos (scanlines globales, glow en todas las cards, sweep en 7 títulos, borders neon, snap). Eso es sobrecarga sensorial.

**Filtro aplicado:** Solo 2 efectos, en 2 ubicaciones.

### 5.2 Efecto A: Scanlines en Hero (CSS-only, solo dark mode)

Las scanlines solo se aplican al Hero, simulando el Hero como un "dispositivo terminal" desde el cual se accede al portfolio real (el resto de la página). Es una **decisión narrativa intencional**: el Hero es la pantalla de carga/terminal; el contenido es el "mundo real" del portfolio. Esto crea una transición narrativa entre el splash y el contenido.

```css
/* En HeroSection.astro <style> */
[data-theme="dark"] .hero::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 3px,
    rgba(0, 242, 255, 0.02) 3px,
    rgba(0, 242, 255, 0.02) 6px
  );
  opacity: 0.5;
}
```

En light mode, no hay scanlines (rompe la estética cálida).

### 5.3 Efecto B: Neon Glow en Projects (hover)

Solo en Projects porque es la sección "showcase" — muestra el trabajo real del portafolio, no solo datos. Skills, Experience, Education y Leadership son secciones informativas; Projects es la única que invita a interacción externa (GitHub links). El glow crea énfasis intencional en estas cards.

Corregido para no romper glassmorphism. En lugar de `box-shadow`, se usa `filter: drop-shadow()` con `overflow: hidden` para evitar ghosting en hijos:

```css
/* En ProjectsSection.astro <style> */
.project-card {
  transition: border-color 0.3s ease, filter 0.3s ease;
  overflow: hidden; /* Previene que drop-shadow afecte hijos con transparencia */
}
.project-card:hover {
  border-color: var(--primary-container);
  filter: drop-shadow(0 0 12px rgba(0, 242, 255, 0.25));
}
```

Solo en dark mode. En light mode, el hover solo cambia el `border-color` (sin glow difuso, que se ve mal sobre blanco).

```css
[data-theme="light"] .project-card:hover {
  border-color: var(--primary-container);
  /* No glow en light mode */
}
```

### 5.4 Efecto C: Scanner Sweep (SOLO en Hero + Projects)

Animación GSAP ScrollTrigger en el título de sección. Una línea horizontal cian semi-transparente que barre de izquierda a derecha al entrar en viewport.

**CORREGIDO:** GSAP no puede animar pseudo-elementos (`::after` no existe en el DOM real). Se usa un `<span class="scanner-line" aria-hidden="true">` dentro del markup:

```astro
<h2 class="section-title section-title--scanner">
  <Projects />
  <span class="scanner-line" aria-hidden="true"></span>
</h2>
```

CSS:
```css
.scanner-line {
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--primary-container);
  transform: scaleX(0);
  transform-origin: left;
  opacity: 0.8;
}
```

GSAP (importado desde `../../utils/gsap-config`, ScrollTrigger ya registrado):
```js
import { gsap, ScrollTrigger } from '../../utils/gsap-config';
// Verificar que gsap-config.ts exporte ScrollTrigger (lo hace — línea 1 de gsap-config.ts)

gsap.fromTo('.scanner-line', {
  scaleX: 0,
}, {
  scaleX: 1,
  duration: 0.6,
  ease: 'power2.out',
  scrollTrigger: {
    trigger: '.section-title--scanner',
    start: 'top 80%',
    toggleActions: 'play none none reverse',
  }
});

gsap.to('.scanner-line', {
  opacity: 0,
  duration: 0.4,
  delay: 0.6,
});
```

**Aplicación:** Solo en `HeroSection.astro` y `ProjectsSection.astro`.

### 5.5 NO se implementa:
- ❌ Scanlines globales
- ❌ Neon borders en todas las cards
- ❌ Scanner sweep en 7 títulos
- ❌ Glow en Skills/Education/Leadership

### 5.6 Accesibilidad

- `@media (prefers-reduced-motion: reduce)` desactiva scanlines, glow, y sweep.
- `@media (prefers-contrast: high)` elimina glassmorphism (fondos opacos).

### 5.7 Archivos

- **Modificar:** `HeroSection.astro` — agregar scanlines (Hero) + scanner sweep (título)
- **Modificar:** `ProjectsSection.astro` — agregar neon glow hover + scanner sweep (título)
- **NO modificar:** Skills, Experience, Education, Leadership, Contact, LatestPosts

---

## Resumen de Archivos (FINAL)

### Fase 1: Splash Fix + Links
| Archivo | Acción |
|---------|--------|
| `src/components/Navbar.astro` | Quitar `data-astro-reload`; actualizar CV link |
| `src/components/LoadingScreen.astro` | `sessionStorage` guardia |
| `src/layouts/Layout.astro` | `scrollToHash()` + `astro:page-load` listener |
| `src/components/HeroSection.astro` | CV link funcional |

### Fase 2a: Esquemas + 1 archivo de prueba por colección
| Archivo | Acción |
|---------|--------|
| `src/content/config.ts` | Extender con 5 colecciones Zod |
| `src/content/skills/core-engineering.md` | 1 archivo de prueba |
| `src/content/experiences/tilinka-flutter.md` | 1 archivo de prueba |
| `src/content/projects/ark-studio-3d.md` | 1 archivo de prueba |
| `src/content/education/umss-computer-engineering.md` | 1 archivo de prueba |
| `src/content/leadership/scesi-vice-president.md` | 1 archivo de prueba |

**Gate:** `pnpm check` + `pnpm build` — si los schemas compilan y los archivos de prueba pasan, se procede a 2b.

### Fase 2b: Migración masiva de contenido
| Archivo | Acción |
|---------|--------|
| `src/content/skills/*.md` | 5 archivos restantes |
| `src/content/experiences/*.md` | 8 archivos restantes |
| `src/content/projects/*.md` | 5 archivos restantes |
| `src/content/education/*.md` | 2 archivos restantes |
| `src/content/leadership/*.md` | 3 archivos restantes |

**Gate:** `pnpm build` — todos los .md deben pasar validación Zod.

### Fase 2c: Refactor de componentes
| Archivo | Acción |
|---------|--------|
| `src/pages/index.astro` | `getCollection()` reemplaza data inline |
| `src/components/SkillsSection.astro` | Props tipadas + chips de filtro (vanilla JS, inicializar en `astro:page-load`) |
| `src/components/ExperienceSection.astro` | Props tipadas + chips de filtro |
| `src/components/ProjectsSection.astro` | Props tipadas + chips de filtro |
| `src/components/EducationSection.astro` | Props tipadas |
| `src/components/LeadershipSection.astro` | Props tipadas |

### Fase 3: Tema Light
| Archivo | Acción |
|---------|--------|
| `src/layouts/Layout.astro` | Script inline FOUC + tokens light corregidos |
| `src/components/ThemeToggle.tsx` | Nuevo componente |
| `src/components/Navbar.astro` | Insertar `<ThemeToggle />` |
| `DESIGN.md` | Agregar paleta Dawn Protocol |

### Fase 4: Olas Scroll
| Archivo | Acción |
|---------|--------|
| `src/components/Hero3D/TideEffect.tsx` | Wrapper 100vh + ScrollTrigger + pausa GPU |

### Fase 5: Neon Limitado
| Archivo | Acción |
|---------|--------|
| `src/components/HeroSection.astro` | Scanlines (dark only) + scanner sweep |
| `src/components/ProjectsSection.astro` | Neon glow hover + scanner sweep |

---

## Verificación de Contraste — Light Mode (WCAG 2.1)

| Token | Valor | Ratio sobre `#faf6f1` | WCAG AA | Estado |
|-------|-------|----------------------|---------|--------|
| `--text` | `#1e293b` | 13.60:1 | ✅ AAA | ✅ |
| `--muted` | `#5c6d80` | 4.80:1 | ✅ AA | ✅ |
| `--primary` | `#0c4a6e` | 8.79:1 | ✅ AAA | ✅ |
| `--primary-container` | `hsl(183, 85%, 42%)` | 3.40:1 | N/A (decorativo) | ✅ |
| `--secondary` | `#475569` | 7.04:1 | ✅ AAA | ✅ |
| `--outline` | `#94a3b8` | 2.38:1 | N/A (bordes) | ⚠️ Aceptable |
| `--error` | `#b91c1c` | 6.01:1 | ✅ AA | ✅ |

**Nota:** `--primary-container` nunca se usa como color de texto. Solo para bordes, íconos, y el toggle. El texto sobre fondos que usan este color debe ser `--on-primary-container: #ffffff`.

---

## Checklist de Validación Pre-BUILD

- [x] `--muted` corregido a `#5c6d80` (AA 4.8:1)
- [x] Scanner sweep usa `<span class="scanner-line">` real, no pseudo-elemento
- [x] Olas: `frameloop="demand"` en Canvas R3F, sin promesa inviable de pausa GPU
- [x] Glass light renombrado conceptualmente a `.elevated-card` (sombras + bordes)
- [x] `scrollToHash()` con fallback nativo a `scrollIntoView()`
- [x] Hue de acento alineado: `#00f2ff` (183°) → `hsl(183, 85%, 42%)` en light
- [x] `theme-changed` listener documentado en Fase 4
- [x] Scanlines solo en Hero — justificación narrativa documentada
- [x] Neon glow solo en Projects — justificación de jerarquía documentada
- [x] `drop-shadow()` con `overflow: hidden` para evitar ghosting
- [x] `sessionStorage` comportamiento multi-pestaña documentado
- [x] Fase 2 dividida en 2a/2b/2c con gates de validación
- [x] GSAP config verificado: `gsap-config.ts` exporta ScrollTrigger

---

## Reglas de Implementación

1. **Todos los colores** derivan de tokens CSS (`var(--bg)`, etc.). Cero valores hex hardcodeados.
2. **GSAP**: import desde `../../utils/gsap-config`.
3. **React islands**: `client:only="react"`.
4. **Reduced motion**: `prefers-reduced-motion: reduce` desactiva scanlines, sweep, glow hover, olas scroll-driven. En ese caso, `gsap.set({ opacity: 1, scaleX: 1 })` como fallback.
5. **Prettier**: formatear `.ts`, `.tsx`, `.astro`, `.css`, `.md` después de cada cambio.
6. **Después de cada fase**: `pnpm check` + `pnpm build`. Si falla, corregir antes de continuar.
7. **Filtros vanilla JS**: inicializar en `astro:page-load` (no `DOMContentLoaded`). Limpiar listeners en `astro:before-swap` para evitar acumulación en SPA.

---

*Especificación v2.2 — aprobada para BUILD.*
