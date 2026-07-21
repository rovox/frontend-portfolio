# Plan: Mejora de Pantalla de Carga Independiente

## Contexto

La pantalla de carga actual (`RetroLoader.tsx`) está acoplada a `index.astro` y depende de React para su renderizado. Esto causa:
- Solo aparece en el home, no en otras páginas
- Espera la hidratación de React antes de mostrarse (delay innecesario)
- Timer fijo de 5s no refleja carga real de recursos
- Acoplamiento con HeroSection y AudioController vía eventos

**Objetivo**: Crear una pantalla de carga independiente, optimizada y refinada que:
- Se muestre en cualquier carga inicial de página (no en navegación SPA)
- No dependa de React ni de componentes específicos
- Use progreso híbrido (timer mínimo + detección de assets reales)
- Mantenga la estética VFD/CRT pero más pulida
- No use sessionStorage ni caches persistentes

## Arquitectura Propuesta

```
Layout.astro
  ├─ Importa LoadingScreen.astro (wrapper autocontenido)
  │    ├─ HTML: estructura del overlay
  │    ├─ <style is:global>: CSS + animaciones
  │    └─ <script>: lógica vanilla JS
  ├─ <slot /> envuelto en contenedor con visibilidad condicional
  └─ AudioController.tsx (sin cambios, escucha preloader:done)
```

## Archivos a Modificar

### 1. `src/components/LoadingScreen.astro` (REESCRIBIR)

**Estado actual**: Wrapper thin que importa RetroLoader.tsx

**Nuevo estado**: Componente autocontenido con HTML/CSS/JS vanilla

**Estructura**:
```astro
---
// Sin imports de React
---

<div id="loading-overlay" class="loading-overlay" aria-hidden="true" role="status">
  <div class="scanner-line"></div>
  <div class="digit-container">
    <div class="digit-wrapper">
      <div class="digit-glow">0</div>
      <div class="digit-projection">0</div>
      <div class="digit">0</div>
    </div>
    <!-- Repetir para 5 dígitos -->
    <div class="percent-sign">%</div>
  </div>
  <div class="scanline-overlay"></div>
</div>

<style is:global>
  /* CSS completo del overlay + animaciones */
  .loading-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: #0A0A0F;
    pointer-events: all;
    overflow: hidden;
    transition: opacity 0.3s ease;
  }
  
  .loading-overlay.hidden {
    opacity: 0;
    pointer-events: none;
  }
  
  .loading-overlay.shutting-down {
    animation: crt-off 0.5s ease-in forwards;
  }
  
  /* Resto de CSS para scanner, digits, etc. */
  
  @keyframes crt-off {
    0% { transform: scale(1, 1); filter: brightness(1); }
    30% { transform: scale(1, 0.005); filter: brightness(3); }
    60% { transform: scale(0.005, 0.005); filter: brightness(5); }
    100% { transform: scale(0, 0); filter: brightness(0); opacity: 0; }
  }
  
  @media (prefers-reduced-motion: reduce) {
    .loading-overlay {
      animation: none;
      transition: opacity 0.2s ease;
    }
    .scanner-line {
      animation: none;
    }
  }
</style>

<script>
  // Lógica vanilla JS para el loading screen
  (function() {
    // Flag en memoria (no persistente)
    if (window.__portfolioLoaderShown) {
      // Navegación interna, ocultar inmediatamente
      const overlay = document.getElementById('loading-overlay');
      if (overlay) {
        overlay.classList.add('hidden');
        setTimeout(() => overlay.remove(), 300);
      }
      return;
    }
    
    window.__portfolioLoaderShown = true;
    
    const overlay = document.getElementById('loading-overlay');
    if (!overlay) return;
    
    document.body.classList.add('is-loading');
    
    const MIN_DURATION = 3000;
    const MAX_DURATION = 8000;
    const startTime = performance.now();
    let progress = 0;
    let assetsReady = false;
    let rafId: number;
    
    // Detectar carga real de assets
    const assetPromises = [
      document.fonts.ready,
      new Promise<void>((resolve) => {
        if (document.readyState === 'complete') resolve();
        else window.addEventListener('load', () => resolve(), { once: true });
      }),
    ];
    
    Promise.all(assetPromises).then(() => {
      assetsReady = true;
    });
    
    // Animación del contador
    const updateProgress = (time: number) => {
      const elapsed = time - startTime;
      const timeProgress = Math.min(elapsed / MIN_DURATION, 1);
      
      // Progreso híbrido: timer + assets
      if (assetsReady && elapsed >= MIN_DURATION) {
        progress = 1;
      } else {
        progress = timeProgress * 0.95; // Máximo 95% hasta que assets estén listos
      }
      
      // Actualizar dígitos en el DOM
      updateDigits(progress);
      
      // Actualizar posición del scanner
      const scanner = overlay.querySelector('.scanner-line') as HTMLElement;
      if (scanner) {
        scanner.style.left = `${progress * 100}%`;
      }
      
      if (progress < 1 && elapsed < MAX_DURATION) {
        rafId = requestAnimationFrame(updateProgress);
      } else {
        finishLoading();
      }
    };
    
    const updateDigits = (p: number) => {
      const counterStr = String(Math.floor(p * 10000)).padStart(5, '0');
      const digits = counterStr.split('');
      const digitElements = overlay.querySelectorAll('.digit, .digit-glow, .digit-projection');
      
      digitElements.forEach((el, i) => {
        const digitIndex = Math.floor(i / 3);
        if (digits[digitIndex]) {
          el.textContent = digits[digitIndex];
        }
      });
      
      // Color dinámico basado en progreso
      const color = getCounterColor(p);
      digitElements.forEach((el) => {
        (el as HTMLElement).style.color = color;
      });
      
      const percentSign = overlay.querySelector('.percent-sign') as HTMLElement;
      if (percentSign) {
        percentSign.style.color = color;
      }
    };
    
    const getCounterColor = (p: number): string => {
      if (p < 0.5) {
        const t = p * 2;
        const r = 255;
        const g = Math.round(255 - 255 * t);
        const b = Math.round(255 - 255 * t);
        return `rgb(${r}, ${g}, ${b})`;
      } else {
        const t = (p - 0.5) * 2;
        const r = 255;
        const g = Math.round(255 * (1 - t));
        const b = 0;
        return `rgb(${r}, ${g}, ${b})`;
      }
    };
    
    const finishLoading = () => {
      cancelAnimationFrame(rafId);
      
      // Animación CRT-off
      overlay.classList.add('shutting-down');
      
      setTimeout(() => {
        overlay.classList.add('hidden');
        document.body.classList.remove('is-loading');
        
        // Dispatch evento para otros componentes
        window.__portfolioLoaderDone = true;
        window.dispatchEvent(new CustomEvent('preloader:done'));
        
        // Remover del DOM
        setTimeout(() => overlay.remove(), 300);
      }, 500);
    };
    
    // Iniciar animación
    rafId = requestAnimationFrame(updateProgress);
  })();
</script>
```

### 2. `src/layouts/Layout.astro` (MODIFICAR)

**Cambios**:
- Importar `LoadingScreen` en el frontmatter
- Agregar `<LoadingScreen />` después de `<Navbar />`
- Envolver `<slot />` en un contenedor con clase condicional

```astro
---
import { ClientRouter } from 'astro:transitions';
import Navbar from '../components/Navbar.astro';
import AudioController from '../components/AudioController.tsx';
import LoadingScreen from '../components/LoadingScreen.astro';

interface Props {
  title: string;
}

const { title } = Astro.props;
---

<html lang="en">
  <head>
    <!-- ... head existente sin cambios ... -->
  </head>
  <body>
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <Navbar />
    
    <LoadingScreen />
    
    <div class="page" id="main-content">
      <slot />
    </div>

    <script>
      // Lenis + GSAP (sin cambios)
    </script>

    <AudioController client:only="react" />
  </body>
</html>

<style is:global>
  /* Estilos existentes */
  
  body.is-loading .page {
    opacity: 0;
    pointer-events: none;
  }
  
  .page {
    opacity: 1;
    transition: opacity 0.5s ease;
  }
</style>
```

### 3. `src/pages/index.astro` (MODIFICAR)

**Cambios**:
- Eliminar import de `LoadingScreen`
- Eliminar `<LoadingScreen />` del template

```astro
---
import Layout from '../layouts/Layout.astro';
import DynamicBackground from '../components/DynamicBackground.tsx';
import HeroSection from '../components/HeroSection.astro';
// ... otros imports
// ELIMINAR: import LoadingScreen from '../components/LoadingScreen.astro';

// ... datos existentes
---

<Layout title="Portfolio | Jose Roberto Vargas Orellana">
  <DynamicBackground client:only="react" />
  <!-- ELIMINAR: <LoadingScreen /> -->
  <TideEffect client:only="react" />
  <HeroSection />
  <SkillsSection skills={skills} />
  <ProjectsSection projects={projects} />
  <LatestPosts />
  <ContactSection socialLinks={socialLinks} />
</Layout>
```

### 4. `src/components/RetroLoader.tsx` (ELIMINAR)

**Razón**: Reemplazado por implementación vanilla JS en LoadingScreen.astro

**Acción**: Eliminar el archivo completamente

### 5. `src/components/HeroSection.astro` (SIN CAMBIOS)

**Razón**: Ya escucha `preloader:done` correctamente

**Nota**: El fallback de 8s sigue siendo útil por si el loader falla

### 6. `src/components/AudioController.tsx` (SIN CAMBIOS)

**Razón**: Ya escucha `preloader:done` correctamente

## Mejoras Visuales Implementadas

1. **Transición suave de colores**: Blanco → Cyan → Rojo más gradual
2. **Scanner line mejorado**: Movimiento más fluido con `transition: left 0.1s linear`
3. **CRT-off optimizado**: 500ms en lugar de 600ms para sensación más rápida
4. **Fade-in del contenido**: El slot aparece con `opacity` transition después del loader
5. **Accesibilidad**: Respeto por `prefers-reduced-motion`
6. **Performance**: HTML/CSS/JS vanilla, sin esperar hidratación de React

## Flujo de Ejecución

```
Carga inicial (URL directa / refresh)
  │
  ├─ Layout.astro renderiza
  ├─ LoadingScreen.astro se monta
  │   ├─ window.__portfolioLoaderShown = false
  │   ├─ Mostrar overlay, ocultar slot (opacity: 0)
  │   ├─ Iniciar requestAnimationFrame loop
  │   ├─ Detectar assets reales (fonts, images)
  │   ├─ Animar contador 00000→10000 (3-8s)
  │   ├─ Al completar:
  │   │   ├─ CRT-off animation (500ms)
  │   │   ├─ Ocultar overlay
  │   │   ├─ Mostrar slot (opacity: 1)
  │   │   ├─ Dispatch 'preloader:done'
  │   │   └─ window.__portfolioLoaderShown = true
  │   └─ HeroSection/AudioController reaccionan

Navegación interna (View Transition)
  │
  ├─ Layout.astro NO se re-renderiza (solo slot)
  ├─ LoadingScreen.astro NO se vuelve a ejecutar
  ├─ window.__portfolioLoaderShown = true (persiste en memoria)
  └─ Contenido visible inmediatamente
```

## Verificación

1. **Carga inicial**:
   - Abrir URL directamente → debe mostrar loader
   - Verificar contador 00000→10000
   - Verificar CRT-off animation
   - Verificar que HeroSection aparece después del loader

2. **Navegación interna**:
   - Navegar a /about → NO debe mostrar loader
   - Navegar a /blog → NO debe mostrar loader
   - Contenido debe aparecer inmediatamente

3. **Refresh**:
   - Presionar F5 en cualquier página → debe mostrar loader nuevamente
   - Verificar que el flag en memoria se resetea

4. **Accesibilidad**:
   - Activar `prefers-reduced-motion` en el sistema
   - Verificar que las animaciones se desactivan
   - El loader debe aparecer y desaparecer sin animaciones

5. **Performance**:
   - Verificar en DevTools que el overlay aparece antes que React se hidrate
   - Verificar que no hay flash de contenido antes del loader

## Rollback

Si hay problemas, revertir los cambios:
1. Restaurar `RetroLoader.tsx` desde git
2. Restaurar `LoadingScreen.astro` original
3. Volver a agregar `<LoadingScreen />` en `index.astro`
4. Remover `<LoadingScreen />` de `Layout.astro`
