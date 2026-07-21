# Plan de Implementación — LoadingScreen Rediseño

## Color Base Identificado

El efecto líquido de las olas (`TideEffect`) usa como color dominante:
- **Hex:** `#5052C8`
- **RGB:** (80, 82, 200)
- **HSL:** ~240°, 60%, 55%
- **Percepción:** Azul-púrpura medio, saturado, con efecto líquido/fluorescente

## Paleta de Colores Propuesta (combinación con `#5052C8`)

| Rol | Hex | Uso |
|-----|-----|-----|
| **Base olas** | `#5052C8` | Color dominante del TideEffect (ya existe) |
| **Primario** | `#2DE2E6` | Cyan neón — acento principal del portfolio |
| **Secundario** | `#55FF9F` | Verde neón — acento secundario |
| **Complementario** | `#FFD700` | Dorado/amarillo — opuesto al púrpura en rueda cromática |
| **Fondo oscuro** | `#0A0F1E` | Azul noche profundo — fondos de escenas |
| **Texto** | `#E9F0FF` | Blanco azulado — ya existe en tokens CSS |

Esta paleta crea contraste cromático: púrpura (`#5052C8`) + dorado (`#FFD700`) son complementarios directos, mientras que el cyan (`#2DE2E6`) actúa como puente armónico.

---

## Cambios por Escena

### Escena 1 — The Void (0-2s)
**Fondo:** `#0A0F1E` (azul noche profundo)

**Cambios:**
- Los puntos (`.void-dot`) aumentan de `2px` a `6px` para mayor visibilidad
- El segundo punto (`#dot-2`) mantiene su animación de separación
- **Test:** Verificar que los puntos sean claramente visibles contra el fondo oscuro

### Escena 2 — The Cube (2-5s)
**Fondo:** `#FFD700` (dorado/amarillo) — *como solicitado*

**Cambios:**
- Fondo de `.splash-container` transiciona a amarillo dorado
- El cubo CSS (`.cube` con caras `.face`) debe mantenerse visible:
  - Bordes blancos (`#fff`) sobre amarillo tienen buen contraste
  - Al transicionar a cyan (`#2de2e6`), el contraste sigue siendo fuerte
- **Test:** Verificar legibilidad del cubo contra fondo amarillo

### Escena 3 — The Spiral (5-8s)
**Fondo:** `#000000` (negro puro)

**Cambios:**
- Sin cambios funcionales — el canvas ya genera colores propios
- Fondo negro maximiza el contraste del espiral
- **Test:** Confirmar que el espiral HSL sigue siendo visible

### Escena 4 — The Name (8-11s)
**Fondo:** `#0A1520` (azul petróleo oscuro)

**Cambios:**
- **Línea 1** "JOSE ROBERTO": `font-size` aumenta de `2.5rem` a `3.2rem`, `font-weight: 900`
- **Línea 2** "VARGAS ORELLANA": `font-size` aumenta de `3.5rem` a `4.5rem`, `font-weight: 900`
- **Línea 3** cambia de "SOFTWARE ENGINEER" a **"FULLSTACK DEVELOPER"**, `font-size` aumenta de `1rem` a `1.4rem`, `font-weight: 700`
- Stroke-dashoffset y glow se mantienen
- **Test:** Verificar que el texto SVG no se desborde en viewports < 400px

### Escena 5 — Big Bang (11-12s)
**Fondo:** `#FFFFFF` flash → `#04070F` (vuelta a oscuro)

**Cambios:**
- Sin cambios funcionales
- **Test:** Confirmar transición suave sin parpadeo

---

## Plan de Pruebas (Checklist)

### 1. Contraste y Legibilidad
- [ ] Escena 1: Puntos de 6px visibles contra `#0A0F1E`
- [ ] Escena 2: Cubo CSS visible contra `#FFD700` (bordes blancos + cyan)
- [ ] Escena 4: Texto SVG "FULLSTACK DEVELOPER" legible, no desbordado

### 2. Tipografía
- [ ] "JOSE ROBERTO" a 3.2rem no se corta en móvil (< 375px)
- [ ] "VARGAS ORELLANA" a 4.5rem cabe en viewport
- [ ] "FULLSTACK DEVELOPER" a 1.4rem legible

### 3. Transiciones de Color
- [ ] Transición 0s → 2s: `#0A0F1E` a `#FFD700` es suave
- [ ] Transición 2s → 5s: `#FFD700` a `#000000` no genera parpadeo
- [ ] Transición 8s → 11s: `#0A1520` a `#FFFFFF` no quema la retina

### 4. Reduced Motion
- [ ] Con `prefers-reduced-motion: reduce`, el splash se saltea correctamente
- [ ] No hay fondo amarillo estático si se salta

### 5. Skip / Escape
- [ ] Botón SKIP visible desde los 3s
- [ ] Tecla Escape funciona en todas las escenas
- [ ] Al skipear, fondo vuelve a `#04070F` sin flash residual

---

## Archivos a Modificar

| Archivo | Líneas aprox. | Cambio |
|---------|--------------|--------|
| `LoadingScreen.astro` CSS | 50-110 | Tamaño de puntos, tamaño de texto SVG |
| `LoadingScreen.astro` CSS | 180-195 | Texto línea 3: "FULLSTACK DEVELOPER" |
| `LoadingScreen.astro` JS | 500-520 | Colores de fondo por escena (GSAP) |

**Estimado:** ~20 líneas de CSS + ~6 líneas de JS. Sin archivos nuevos.

---

## Dudas para Confirmar

1. **¿El fondo amarillo de la Escena 2 es `#FFD700` (dorado) o prefieres un amarillo más puro como `#FFFF00`?**
2. **¿Quieres que el cubo en Escena 2 tenga caras rellenas (no solo bordes) para contrastar mejor con el amarillo?**
3. **¿El texto "FULLSTACK DEVELOPER" debe ir en la misma línea 3 o prefieres dos líneas ("FULLSTACK" / "DEVELOPER")?**

Aprueba este plan para proceder con la implementación.
