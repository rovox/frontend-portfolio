# Guía de Implementación — Portfolio v3

**Fecha:** 2026-07-27  
**Alcance:** Mejoras de UX, animaciones scroll-driven, contenido dinámico, scroll progress indicator  
**Estado:** Pendiente de aprobación

---

## 📋 Resumen Ejecutivo

Esta guía implementa 9 mejoras principales organizadas en fases con dependencias claras:

| # | Mejora | Prioridad | Dependencia |
|---|--------|-----------|-------------|
| 1 | Documentación + Init | P0 | Ninguna |
| 2 | TideEffect fade on scroll | P1 | Ninguna |
| 3 | LoadingScreen: sonido + texto | P1 | Ninguna |
| 4 | Hero terminal sticky + about me | P2 | #3 |
| 5 | Hero label + logo text | P2 | #4 |
| 6 | Sticky scroll inactivity (30s) | P2 | #4 |
| 7 | Scroll progress light bar | P1 | #5 |
| 8 | Developer photo | P2 | #4 |
| 9 | Social links con iconos | P2 | #4 |

---

## 🔧 FASE 1: Documentación y Init (P0)

### 1.1 Actualizar AGENTS.md

**Archivo:** `AGENTS.md`

**Cambios:**
- Agregar sección "Scroll Progress Indicator" describiendo la barra luminosa
- Documentar el comportamiento sticky del terminal hero
- Actualizar la sección de LoadingScreen con los nuevos textos
- Agregar nota sobre la WCAG exception del splash (ya documentada)

**Comando:**
```bash
# Ejecutar init para sincronizar documentación
# Esto actualizará AGENTS.md con los requerimientos actuales
```

### 1.2 Crear spec de implementación

**Archivo:** `specs/implementation-guide-v3.md` (este archivo)

**Propósito:** Documentar todas las mejoras antes de implementar para evitar rework.

---

## 🌊 FASE 2: TideEffect Fade on Scroll (P1)

### 2.1 Comportamiento actual

**Archivo:** `src/components/Hero3D/TideEffect.tsx`

El TideEffect actualmente:
- Se muestra fijo en la parte inferior (30vh)
- Tiene un ScrollTrigger que lo desplaza `-25vh` y reduce opacidad a 0
- Una vez que desaparece, no vuelve a aparecer al hacer scroll hacia arriba

### 2.2 Comportamiento deseado

- **Scroll down:** El efecto de agua se desvanece gradualmente hasta desaparecer
- **Scroll up:** El efecto de agua vuelve a aparecer gradualmente
- **Bidireccional:** La opacidad debe responder al scroll en ambas direcciones

### 2.3 Implementación propuesta

**Archivo a modificar:** `src/components/Hero3D/TideEffect.tsx`

```tsx
// Reemplazar el useEffect actual del ScrollTrigger
useEffect(() => {
  if (lowPower || !wrapperRef.current) return;

  const ctx = gsap.context(() => {
    // ScrollTrigger bidireccional
    gsap.to(wrapperRef.current, {
      opacity: 0,
      y: '-10vh', // Reducir el desplazamiento vertical
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: '50vh top', // Desaparece antes (50vh en lugar de 80vh)
        scrub: 0.6,
        // Hacer que el scrub sea verdaderamente bidireccional
        // El scrub ya es bidireccional por defecto en GSAP
      },
    });
  });

  return () => ctx.revert();
}, [lowPower]);
```

**Notas:**
- El `scrub: 0.6` ya es bidireccional por defecto
- Reducir el `end` a `50vh` hace que desaparezca más rápido
- Reducir el `y` a `-10vh` minimiza el desplazamiento vertical

### 2.4 Testing

- [ ] Scroll down: el agua se desvanece gradualmente
- [ ] Scroll up: el agua reaparece gradualmente
- [ ] No hay saltos bruscos en la animación
- [ ] Respeta reduced-motion (no animar si está activo)

---

## 🎵 FASE 3: LoadingScreen — Sonido + Textos (P1)

### 3.1 Textos del terminal

**Archivo:** `src/components/LoadingScreen.astro`

**Cambios en el markup (líneas25-39):**

```html
<!-- ANTES -->
<div class="terminal-line">
  <span class="terminal-prompt">PS C:\></span>
  <span class="terminal-typed" data-text="Jose Roberto"></span>
  <span class="terminal-cursor">_</span>
</div>
<div class="terminal-line">
  <span class="terminal-prompt">PS C:\></span>
  <span class="terminal-typed" data-text="Vargas Orellana"></span>
  <span class="terminal-cursor">_</span>
</div>
<div class="terminal-line">
  <span class="terminal-prompt">PS C:\></span>
  <span class="terminal-typed" data-text="Software Engineer"></span>
  <span class="terminal-cursor">_</span>
</div>

<!-- DESPUÉS -->
<div class="terminal-line">
  <span class="terminal-prompt">PS C:\></span>
  <span class="terminal-typed" data-text="Software Engineer"></span>
  <span class="terminal-cursor">_</span>
</div>
<div class="terminal-line">
  <span class="terminal-prompt">PS C:\></span>
  <span class="terminal-typed" data-text="Data Science Student"></span>
  <span class="terminal-cursor">_</span>
</div>
<div class="terminal-line terminal-loading">
  <span class="terminal-prompt">PS C:\></span>
  <span class="loading-text">loading</span>
  <span class="loading-dots">
    <span>.</span><span>.</span><span>.</span>
  </span>
</div>
```

### 3.2 Sonido por carácter

**Estado actual:** Ya implementado con WebAudio (líneas269-290)

**Verificar:**
- El sonido se reproduce por cada carácter nuevo
- El volumen es adecuado (gain 0.06)
- El AudioContext se cierra al finalizar el splash

**Posible mejora:** Ajustar el volumen si el usuario lo reporta muy bajo o muy alto.

### 3.3 Actualizar timelines del script

**Archivo:** `LoadingScreen.astro` (líneas403-461)

**Cambios en `createScene2Timeline()`:**

```javascript
// ANTES
var line1 = document.querySelector('#scene-2 .terminal-line:nth-child(1) .terminal-typed');
var line2 = document.querySelector('#scene-2 .terminal-line:nth-child(2) .terminal-typed');
var line3 = document.querySelector('#scene-2 .terminal-line:nth-child(3) .terminal-typed');

tl.set('#scene-2 .terminal-line:nth-child(1)', { opacity: 1 }, 0);
tl.add(typeTextTimeline(line1, 'Jose Roberto', 0.6), 0);

tl.set('#scene-2 .terminal-line:nth-child(2)', { opacity: 1 }, 0.7);
tl.add(typeTextTimeline(line2, 'Vargas Orellana', 0.7), 0.7);

tl.set('#scene-2 .terminal-line:nth-child(3)', { opacity: 1 }, 1.4);
tl.add(typeTextTimeline(line3, 'Software Engineer', 0.6), 1.4);

// DESPUÉS
var line1 = document.querySelector('#scene-2 .terminal-line:nth-child(1) .terminal-typed');
var line2 = document.querySelector('#scene-2 .terminal-line:nth-child(2) .terminal-typed');

tl.set('#scene-2 .terminal-line:nth-child(1)', { opacity: 1 }, 0);
tl.add(typeTextTimeline(line1, 'Software Engineer', 0.8), 0);

tl.set('#scene-2 .terminal-line:nth-child(2)', { opacity: 1 }, 1.0);
tl.add(typeTextTimeline(line2, 'Data Science Student', 0.8), 1.0);

// Loading dots se mueven al segundo2.0 (antes era2.0, mantener)
tl.set('#scene-2 .terminal-loading', { opacity: 1 }, 2.0);
```

### 3.4 Testing

- [ ] El splash muestra "Software Engineer" y "Data Science Student"
- [ ] El sonido de teclas se reproduce por cada carácter
- [ ] La animación dura ~7 segundos total
- [ ] El botón SKIP funciona correctamente

---

## 🖥️ FASE 4: Hero Terminal Sticky + About Me (P2)

### 4.1 Comportamiento deseado

El terminal del hero section debe:
1. Mantenerse visible (sticky) mientras el usuario hace scroll
2. Moverse a un lado (izquierda o derecha)
3. Mostrar contenido "About Me" dentro del terminal
4. Cambiar el título de "DEV_ARCHITECT" a "ROVOX - DEV ARCHITECT"

### 4.2 Implementación del terminal sticky

**Archivo:** `src/components/HeroSection.astro`

**Cambios en CSS:**

```css
/* ANTES */
.hero-terminal {
  width: 100%;
  max-width: 540px;
  overflow: hidden;
  text-align: left;
  margin-top: 0.25rem;
}

/* DESPUÉS */
.hero-terminal {
  position: sticky;
  top: 100px; /* Debajo del navbar (70px) + margen */
  width: 100%;
  max-width: 540px;
  overflow: hidden;
  text-align: left;
  margin-top: 0.25rem;
  z-index: 10;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

/* En desktop, mover a la derecha */
@media (min-width: 1040px) {
  .hero-terminal {
    position: fixed;
    right: 2rem;
    top: 100px;
    width: 350px;
    max-width: 350px;
  }
}
```

### 4.3 Contenido "About Me" dentro del terminal

**Modificar el terminal body:**

```html
<!-- ANTES -->
<div class="terminal-body">
  <p class="terminal-prompt">
    <span class="prompt-arrow">&gt;</span>
    <span class="prompt-path"> ~/portfolio</span>
    <span class="prompt-cmd"> cat intro.md</span>
  </p>
  <p class="terminal-line">
    <span class="line-hash">#</span> Designing systems that scale.
  </p>
  <p class="terminal-line">
    <span class="line-hash">#</span> Building interfaces that inspire.
  </p>
  <p class="terminal-line terminal-line-last">
    <span class="line-hash">#</span> Focusing on high-performance web
    architecture and human-centered design principles.
  </p>
  <p class="terminal-prompt terminal-prompt-bottom">
    <span class="prompt-arrow">&gt;</span>
    <span class="prompt-path"> ~/portfolio</span>
    <span class="cursor-blink" aria-hidden="true">&#9608;</span>
  </p>
</div>

<!-- DESPUÉS -->
<div class="terminal-body">
  <p class="terminal-prompt">
    <span class="prompt-arrow">&gt;</span>
    <span class="prompt-path"> ~/about</span>
    <span class="prompt-cmd"> cat rovox.md</span>
  </p>
  <p class="terminal-line">
    <span class="line-hash">#</span> Software Engineer & Data Scientist
  </p>
  <p class="terminal-line">
    <span class="line-hash">#</span> Full Stack Web/Mobile/Desktop
  </p>
  <p class="terminal-line">
    <span class="line-hash">#</span> Bolivia 🇧🇴 | Open Source Advocate
  </p>
  <p class="terminal-line terminal-line-last">
    <span class="line-hash">#</span> Building tools that empower developers
  </p>
  <p class="terminal-prompt terminal-prompt-bottom">
    <span class="prompt-arrow">&gt;</span>
    <span class="prompt-path"> ~/about</span>
    <span class="cursor-blink" aria-hidden="true">&#9608;</span>
  </p>
</div>
```

### 4.4 Testing

- [ ] El terminal se mantiene visible al hacer scroll
- [ ] En desktop (>1040px) el terminal se fija a la derecha
- [ ] El contenido del terminal muestra la información de about me
- [ ] El terminal no se superpone con otras secciones

---

## 🏷️ FASE 5: Hero Label + Logo Text (P2)

### 5.1 Cambiar hero label

**Archivo:** `src/components/HeroSection.astro` (línea10)

```html
<!-- ANTES -->
<p class="hero-label">&lt;Engineering Digital Excellence /&gt;</p>

<!-- DESPUÉS -->
<p class="hero-label">&lt;Computer Science Engineer /&gt;</p>
```

### 5.2 Cambiar logo en Navbar

**Archivo:** `src/components/Navbar.astro` (línea30)

```html
<!-- ANTES -->
<a href="/" class="nav-logo" aria-label="Homepage">DEV_ARCHITECT</a>

<!-- DESPUÉS -->
<a href="/" class="nav-logo" aria-label="Homepage">ROVOX - DEV ARCHITECT</a>
```

### 5.3 Cambiar nombre en footer

**Archivo:** `src/components/ContactSection.astro` (línea69)

```html
<!-- ANTES -->
<p class="footer-name">JROBERTO VARGAS ORELLANA</p>

<!-- DESPUÉS -->
<p class="footer-name">ROVOX</p>
```

### 5.4 Testing

- [ ] El hero label muestra "Computer Science Engineer"
- [ ] El logo dice "ROVOX - DEV ARCHITECT"
- [ ] El footer dice "ROVOX"

---

## ⏱️ FASE 6: Sticky Scroll Inactivity (P2)

### 6.1 Comportamiento deseado

Cuando el usuario NO hace scroll por30 segundos, mostrar un indicador visual de "contenido sticky" que invite a seguir leyendo.

### 6.2 Implementación propuesta

**Nuevo componente:** `src/components/effects/ScrollInactivityHint.tsx`

```tsx
import { useState, useEffect } from 'react';

export default function ScrollInactivityHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      setShow(false);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShow(true),30000); //30 segundos
    };

    // Eventos que resetean el timer
    window.addEventListener('scroll', resetTimer, { passive: true });
    window.addEventListener('mousemove', resetTimer, { passive: true });
    window.addEventListener('keydown', resetTimer);

    // Iniciar el timer
    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className="scroll-inactivity-hint"
      style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        padding: '0.75rem 1.5rem',
        background: 'rgba(0, 242, 255, 0.1)',
        border: '1px solid var(--primary-container)',
        borderRadius: 'var(--radius-lg)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--fs-label)',
        color: 'var(--primary)',
        animation: 'fadeInUp 0.3s ease',
        backdropFilter: 'blur(10px)',
      }}
    >
      ↑ Scroll to continue exploring
    </div>
  );
}
```

**Agregar al Layout:**

```astro
<!-- src/layouts/Layout.astro -->
<script>
  import ScrollInactivityHint from '../components/effects/ScrollInactivityHint';
  // Montar después del preloader
</script>
```

### 6.3 Testing

- [ ] Después de30s sin scroll, aparece el hint
- [ ] Al hacer scroll, el hint desaparece
- [ ] El hint no interfiere con la navegación

---

## 💡 FASE 7: Scroll Progress Light Bar (P1)

### 7.1 Comportamiento deseado

Una barra luminosa tipo neon-laser que:
- Se muestra justo debajo del borde inferior del header/navbar
- Indica el porcentaje de contenido leído
- Tiene un efecto de "destello" o "brillo" animado
- Reemplaza visualmente la navegación tradicional (navbar se hace invisible o se oculta)

### 7.2 Implementación propuesta

**Nuevo componente:** `src/components/effects/ScrollProgressBar.tsx`

```tsx
import { useState, useEffect } from 'react';

export default function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, scrollPercent)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Inicial

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="scroll-progress-bar"
      style={{
        position: 'fixed',
        top: '70px', // Debajo del navbar (70px)
        left: 0,
        width: `${progress}%`,
        height: '3px',
        background: 'linear-gradient(90deg, var(--primary-container), var(--primary), var(--primary-container))',
        zIndex: 1001,
        transition: 'width 0.1s ease-out',
        boxShadow: `
          0 0 10px var(--primary-container),
          0 0 20px var(--primary-container),
          0 0 40px var(--primary-container)
        `,
        // Efecto de destello animado
        animation: progress > 0 ? 'shimmer 2s infinite' : 'none',
      }}
    />
  );
}
```

**CSS para el efecto shimmer:**

```css
/* src/layouts/Layout.astro - is:global */
@keyframes shimmer {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
    box-shadow: 
      0 0 15px var(--primary-container),
      0 0 30px var(--primary-container),
      0 0 60px var(--primary-container);
  }
  100% {
    opacity: 1;
  }
}
```

### 7.3 Hacer la navbar invisible (opcional)

**Opción A:** Reducir opacidad de la navbar al hacer scroll

```css
/* src/components/Navbar.astro */
.nav {
  transition: opacity 0.3s ease;
}

.nav.nav-hidden {
  opacity: 0;
  pointer-events: none;
}
```

**Opción B:** Mantener la navbar pero con fondo transparente

```css
.nav {
  background: transparent;
  border-bottom: none;
}
```

**Implementación del comportamiento:**

```javascript
// En Navbar.astro script
let lastScroll = 0;
const nav = document.getElementById('main-nav');

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;
  
  if (currentScroll > 100) { // Después de100px de scroll
    if (currentScroll > lastScroll) {
      // Scroll down - ocultar
      nav.classList.add('nav-hidden');
    } else {
      // Scroll up - mostrar
      nav.classList.remove('nav-hidden');
    }
  } else {
    nav.classList.remove('nav-hidden');
  }
  
  lastScroll = currentScroll;
}, { passive: true });
```

### 7.4 Integración en Layout

```astro
<!-- src/layouts/Layout.astro -->
---
import ScrollProgressBar from '../components/effects/ScrollProgressBar';
---

<body>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <header>
    <Navbar />
    <ScrollProgressBar client:only="react" />
  </header>
  
  <LoadingScreen />
  
  <main class="page" id="main-content">
    <slot />
  </main>
  <!-- ... -->
</body>
```

### 7.5 Testing

- [ ] La barra aparece debajo del navbar
- [ ] La barra muestra el progreso correctamente
- [ ] El efecto de brillo/shimmer es visible
- [ ] La barra no interfiere con la navegación
- [ ] Respeta reduced-motion (sin shimmer si está activo)

---

## 📸 FASE 8: Developer Photo (P2)

### 8.1 Usar imagen profesional

**Archivo:** `src/components/HeroSection.astro` (líneas14-19)

```html
<!-- ANTES -->
<div
  class="hero-photo"
  role="img"
  aria-label="Profile photo of Jose Roberto Vargas Orellana"
>
  <span class="hero-photo-initials">JRVO</span>
</div>

<!-- DESPUÉS -->
<div
  class="hero-photo"
  role="img"
  aria-label="Profile photo of ROVOX - Software Engineer"
>
  <img 
    src="/images/profesional_photo.png" 
    alt="ROVOX - Software Engineer"
    loading="eager"
    decoding="async"
  />
</div>
```

### 8.2 CSS para la imagen

```css
/* src/components/HeroSection.astro */
.hero-photo {
  width: clamp(120px, 20vw, 200px);
  height: clamp(120px, 20vw, 200px);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 2px solid var(--primary-container);
  box-shadow: 0 0 24px rgba(0, 242, 255, 0.12);
  flex-shrink: 0;
}

.hero-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

### 8.3 Testing

- [ ] La imagen se carga correctamente
- [ ] La imagen tiene bordes redondeados
- [ ] La imagen tiene el borde cyan característico
- [ ] La imagen es responsive

---

## 🔗 FASE 9: Social Links con Iconos (P2)

### 9.1 Iconos disponibles

**Directorio:** `public/icons/`

| Icono | Archivo | Uso |
|-------|---------|-----|
| WhatsApp | `whatsapp-logo-svgrepo-com.svg` | Chat directo |
| LinkedIn | `linkedin-logo-svgrepo-com.svg` | Perfil profesional |
| GitHub | `github-svgrepo-com.svg` | Repositorio |
| Gmail | `gmail-svgrepo-com.svg` | Correo electrónico |

### 9.2 Actualizar ContactSection

**Archivo:** `src/components/ContactSection.astro`

**Cambios en el footer (líneas72-84):**

```html
<!-- ANTES -->
<nav class="footer-links" aria-label="Social links">
  {
    socialLinks.map((link) => (
      <a
        href={link.href}
        class="footer-link"
        {...linkAttrs(link.href)}
      >
        {link.label}
      </a>
    ))
  }
</nav>

<!-- DESPUÉS -->
<nav class="footer-links" aria-label="Social links">
  <a href="https://github.com/rovox" target="_blank" rel="noopener noreferrer" class="footer-link" aria-label="GitHub">
    <img src="/icons/github-svgrepo-com.svg" alt="" width="20" height="20" />
    <span>GitHub</span>
  </a>
  <a href="https://linkedin.com/in/rovox" target="_blank" rel="noopener noreferrer" class="footer-link" aria-label="LinkedIn">
    <img src="/icons/linkedin-logo-svgrepo-com.svg" alt="" width="20" height="20" />
    <span>LinkedIn</span>
  </a>
  <a href="https://wa.me/59162642144" target="_blank" rel="noopener noreferrer" class="footer-link" aria-label="WhatsApp">
    <img src="/icons/whatsapp-logo-svgrepo-com.svg" alt="" width="20" height="20" />
    <span>WhatsApp</span>
  </a>
  <a href="mailto:varor.joseroberto@gmail.com" class="footer-link" aria-label="Email">
    <img src="/icons/gmail-svgrepo-com.svg" alt="" width="20" height="20" />
    <span>Email</span>
  </a>
</nav>
```

### 9.3 CSS para iconos

```css
/* src/components/ContactSection.astro */
.footer-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  /* ... estilos existentes ... */
}

.footer-link img {
  width: 20px;
  height: 20px;
  filter: grayscale(100%) brightness(0.7);
  transition: filter 0.2s ease;
}

.footer-link:hover img {
  filter: grayscale(0%) brightness(1);
}
```

### 9.4 Actualizar Hero Section

**Archivo:** `src/components/HeroSection.astro` (líneas41-63)

```html
<!-- ANTES -->
<div class="hero-actions">
  <a href="https://wa.me/59162642144" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
    WhatsApp
  </a>
  <a href="mailto:varor.joseroberto@gmail.com" class="btn btn-primary">
    Gmail
  </a>
  <a href={CV_DOWNLOAD_URL_EN} target="_blank" rel="noopener noreferrer" class="btn btn-ghost">
    Download CV
  </a>
</div>

<!-- DESPUÉS -->
<div class="hero-actions">
  <a href="https://wa.me/59162642144" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
    <img src="/icons/whatsapp-logo-svgrepo-com.svg" alt="" width="16" height="16" />
    WhatsApp
  </a>
  <a href="mailto:varor.joseroberto@gmail.com" class="btn btn-primary">
    <img src="/icons/gmail-svgrepo-com.svg" alt="" width="16" height="16" />
    Email
  </a>
  <a href={CV_DOWNLOAD_URL_EN} target="_blank" rel="noopener noreferrer" class="btn btn-ghost">
    Download CV
  </a>
</div>
```

### 9.5 Testing

- [ ] Los iconos se cargan correctamente
- [ ] Los iconos tienen el tamaño adecuado (16px en hero, 20px en footer)
- [ ] Los links funcionan (WhatsApp, LinkedIn, GitHub, Email)
- [ ] Los iconos cambian de escala de grises a color en hover

---

## 📊 Resumen de Cambios por Archivo

| Archivo | Cambios | Fase |
|---------|---------|------|
| `LoadingScreen.astro` | Textos del terminal | #3 |
| `HeroSection.astro` | Label, photo, terminal sticky, actions | #4, #5, #8, #9 |
| `Navbar.astro` | Logo text, hide on scroll | #5, #7 |
| `ContactSection.astro` | Footer name, social links con iconos | #5, #9 |
| `TideEffect.tsx` | ScrollTrigger bidireccional | #2 |
| `Layout.astro` | ScrollProgressBar import | #7 |
| **NUEVO:** `ScrollProgressBar.tsx` | Barra de progreso neon | #7 |
| **NUEVO:** `ScrollInactivityHint.tsx` | Hint de inactividad | #6 |

---

## 🧪 Testing Global

### Funcionalidad
- [ ] Splash screen muestra los textos correctos
- [ ] El sonido de teclas funciona en el splash
- [ ] El TideEffect se desvanece y reaparece con el scroll
- [ ] El terminal hero es sticky y muestra about me
- [ ] La barra de progreso indica el scroll
- [ ] Los social links con iconos funcionan
- [ ] La foto del desarrollador se carga

### Accesibilidad
- [ ] Respeta `prefers-reduced-motion`
- [ ] Skip link funciona
- [ ] ARIA labels correctos
- [ ] Contraste de colores adecuado

### Performance
- [ ] No hay layout shifts
- [ ] Las imágenes se cargan eficientemente
- [ ] Las animaciones son fluidas (60fps)
- [ ] No hay memory leaks en event listeners

### Responsive
- [ ] Funciona en mobile (<720px)
- [ ] Funciona en tablet (720px-1040px)
- [ ] Funciona en desktop (>1040px)

---

## 📝 Notas de Implementación

1. **Orden de fases:** Seguir el orden de fases para evitar dependencias rotas
2. **Testing incremental:** Probar cada fase antes de avanzar a la siguiente
3. **Git commits:** Hacer un commit por fase para facilitar rollbacks
4. **Documentación:** Actualizar AGENTS.md después de cada fase

---

## ✅ Checklist de Aprobación

- [ ] Fase1: Documentación actualizada
- [ ] Fase2: TideEffect bidireccional
- [ ] Fase3: LoadingScreen textos + sonido
- [ ] Fase4: Hero terminal sticky
- [ ] Fase5: Hero label + logo
- [ ] Fase6: Scroll inactivity hint
- [ ] Fase7: Scroll progress bar
- [ ] Fase8: Developer photo
- [ ] Fase9: Social links con iconos

**¿Aprobado para implementar?** _______________
