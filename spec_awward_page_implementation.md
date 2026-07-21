# 🏆 Awwwards-Grade Effects Implementation Plan

## 📋 Overview

**Project**: Portfolio - Jose Roberto Vargas Orellana  
**Stack**: Astro + React + GSAP + Lenis + Three.js  
**Goal**: Implement premium web effects inspired by Awwwards-winning sites  
**Date**: June 29, 2026  
**Estimated Timeline**: 4 weeks (incremental phases)

---

## 🎯 Objectives

### Primary Goals
1. **Depth & Dimension**: Parallax scrolling with multi-layered backgrounds
2. **Interactive Feedback**: Custom cursor with magnetic/hover reactions
3. **Immersive 3D**: WebGL environments explorable via mouse/keyboard
4. **Fluid Navigation**: Seamless page transitions (fade, slide, morph)
5. **Alternative Layouts**: Horizontal scroll sections
6. **Dynamic Typography**: Split text animations per character/word
7. **Reveal Effects**: Mask-based animations triggered by scroll

### Success Metrics
- **Performance**: Maintain 60fps on mid-range devices
- **Accessibility**: Respect `prefers-reduced-motion`
- **SEO**: No impact on Core Web Vitals (LCP < 2.5s)
- **Compatibility**: Chrome, Firefox, Safari, Edge (last 2 versions)

---

## 🏗️ Architecture Overview

```
src/
├── components/
│   ├── effects/                    # Effects directory
│   │   └── SplitText.astro         # ✅ DONE — Server-side text split (words/chars)
│   ├── three/
│   │   ├── TideEffect.tsx          # ✅ Existing R3F water shader
│   │   └── WaterShader.ts
│   ├── LoadingScreen.astro         # ✅ Splash screen (in-flow, not overlay)
│   ├── HeroSection.astro           # ✅ Split text + GSAP stagger
│   ├── SkillsSection.astro         # ✅ Reduced motion guard
│   ├── ProjectsSection.astro       # ✅ Reduced motion guard
│   ├── ContactSection.astro        # ✅ Reduced motion guard
│   ├── LatestPosts.astro           # ✅ Reduced motion guard
│   └── existing components...
└── utils/
    ├── gsap-config.ts              # ✅ DONE — Central GSAP + ScrollTrigger setup
    ├── animation-presets.ts        # ✅ DONE — fadeUp, fadeUpFast, scaleIn presets
    └── reduced-motion.ts           # ✅ DONE — prefersReducedMotion() function
```

---

## 🛡️ Prevention Strategy (Global Rules)

### Memory Management
```typescript
// ✅ CORRECT: Always use gsap.context() for cleanup
useEffect(() => {
  const ctx = gsap.context(() => {
    // All animations here
    gsap.to('.element', { x: 100 });
  }, componentRef);
  
  return () => ctx.revert(); // Automatic cleanup
}, []);

// ❌ WRONG: Manual cleanup prone to errors
useEffect(() => {
  const tween = gsap.to('.element', { x: 100 });
  return () => tween.kill(); // Easy to forget
}, []);
```

### ScrollTrigger Best Practices
```typescript
// ✅ CORRECT: Responsive-safe configuration
ScrollTrigger.create({
  trigger: element,
  start: 'top bottom',
  end: 'bottom top',
  invalidateOnRefresh: true, // Recalculates on resize
  markers: false, // Remove in production
  onEnter: () => { /* ... */ }
});

// ❌ WRONG: Static values that break on resize
ScrollTrigger.create({
  trigger: element,
  start: 100, // Fixed pixels - breaks on mobile
  end: 500
});
```

### Performance Rules
1. **Never** use `setState` inside animation loops
2. **Always** use `will-change: transform` sparingly (remove after animation)
3. **Prefer** `transform` and `opacity` over layout properties
4. **Debounce** scroll events (or use GSAP's ScrollTrigger)
5. **Lazy load** heavy assets (3D models, videos)

### Accessibility Requirements
```typescript
// Check reduced motion preference
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (prefersReducedMotion) {
  // Skip complex animations, show content immediately
  gsap.set(elements, { autoAlpha: 1, y: 0 });
  return;
}
```

---

## 📅 Phase 1: Foundation Setup (Week 1)

### 1.1 Install Dependencies

```bash
npm install gsap @gsap/react three @react-three/fiber @react-three/drei
npm install -D @types/three
```

### 1.2 GSAP Configuration

**File**: `src/utils/gsap-config.ts`

```typescript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

// Register plugins once
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Default easing for premium feel
gsap.defaults({
  ease: 'power3.out',
  duration: 1
});

// Configure ScrollTrigger defaults
ScrollTrigger.config({
  ignoreMobileResize: true,
  limitCallbacks: true
});

export { gsap, ScrollTrigger };
```

### 1.3 Custom Hooks

**File**: `src/hooks/useReducedMotion.ts`

```typescript
import { useState, useEffect } from 'react';

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = () => setPrefersReducedMotion(mql.matches);
    
    setPrefersReducedMotion(mql.matches);
    mql.addEventListener('change', handleChange);
    
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}
```

**File**: `src/hooks/useGsap.ts`

```typescript
import { useEffect, useRef } from 'react';
import { gsap } from '../utils/gsap-config';

export function useGsap<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const ctx = useRef<gsap.Context | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    
    ctx.current = gsap.context(() => {
      // Animation logic will be added per component
    }, ref);

    return () => {
      ctx.current?.revert();
    };
  }, []);

  return { ref, ctx };
}
```

### 1.4 Animation Presets

**File**: `src/utils/animation-presets.ts`

```typescript
export const ANIMATION_PRESETS = {
  // Fade up with stagger
  fadeUp: {
    y: 50,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  },
  
  // Scale in
  scaleIn: {
    scale: 0.8,
    opacity: 0,
    duration: 0.8,
    ease: 'back.out(1.7)'
  },
  
  // Slide from left
  slideLeft: {
    x: -100,
    opacity: 0,
    duration: 1,
    ease: 'power2.out'
  },
  
  // Reveal from mask
  maskReveal: {
    clipPath: 'inset(0 100% 0 0)',
    duration: 1.2,
    ease: 'power4.inOut'
  }
} as const;
```

### ✅ Phase 1 Checklist

- [x] Dependencies installed (gsap, @gsap/react, three, @react-three/fiber, @react-three/drei, lenis, tone)
- [x] GSAP configured globally (`src/utils/gsap-config.ts`)
- [x] Utility functions created (`src/utils/reduced-motion.ts`)
- [x] Animation presets defined (`src/utils/animation-presets.ts`)
- [x] `prefers-reduced-motion` guard in all 5 section components
- [x] Test: Import works without errors
- [x] Test: Reduced motion hook responds to system settings

---

## 📅 Phase 1.5: Splash Screen Architecture ✅

### Problem (before)

- LoadingScreen was `position: fixed; z-index: 9999` (overlay)
- Lenis + GSAP ticker started immediately, wasting CPU during splash
- ScrollTrigger calculated positions on hidden content (`opacity: 0`)
- Memory leak: ticker callback not removed on view transitions
- User could scroll (via Lenis) while splash was covering content

### Solution (after)

- LoadingScreen is `min-height: 100vh` in document flow (splash, not overlay)
- Lenis + ticker start ONLY after `preloader:done` event
- ScrollTrigger calculates on real visible content
- Ticker callback properly cleaned up via `gsap.ticker.remove()`
- `body.is-loading { overflow: hidden }` prevents scroll during splash
- Navbar hidden during splash via `body.is-loading .nav { opacity: 0 }`

### Architecture

```
t=0s    body.is-loading → overflow:hidden, nav hidden
        LoadingScreen splash (100vh) visible
        Content in DOM but below viewport
        Lenis NOT running

t=3-8s  Counter 00000→10000 + scanner animation
        CRT-off animation (0.5s)

t+0.5s  LoadingScreen.style.minHeight = '0' → collapses
        LoadingScreen.remove() from DOM
        body.is-loading removed → overflow restored
        Navbar visible
        Content flows into viewport naturally
        Lenis starts (startScroll())
        ScrollTrigger refreshes on visible content
        preloader:done dispatched
        HeroSection + AudioController react
```

### Files Modified

| File | Change |
|------|--------|
| `LoadingScreen.astro` | CSS: `min-height: 100vh` instead of `position: fixed; z-index: 9999` |
| `LoadingScreen.astro` | CSS: `body.is-loading .nav { opacity: 0 }` |
| `LoadingScreen.astro` | JS: `finishLoading()` collapses height, then removes |
| `Layout.astro` | Lenis init wrapped in `startScroll()`, called after `preloader:done` |
| `Layout.astro` | `stopScroll()` properly removes ticker callback |

### ✅ Phase 1.5 Checklist

- [x] LoadingScreen in document flow (not overlay)
- [x] Lenis starts only after splash completes
- [x] Ticker callback properly cleaned up on view transitions
- [x] Navbar hidden during splash
- [x] Content visible after splash (natural flow)
- [x] ScrollTrigger calculates on real visible content

---

## 📅 Phase 2: Accessibility ✅

### Reduced Motion Compliance

All 5 section components now respect `prefers-reduced-motion`:

| Component | Guard Pattern |
|-----------|---------------|
| `HeroSection.astro` | `gsap.set(['.hero-title .split-item', '.subtitle', '.hero-actions', '.pill'], { opacity: 1, y: 0, scale: 1, filter: 'none' })` |
| `SkillsSection.astro` | `gsap.set('.skill-category', { opacity: 1, y: 0 })` + progress bars visible |
| `ProjectsSection.astro` | `gsap.set('.project-card', { opacity: 1, y: 0 })` — filter logic always active |
| `ContactSection.astro` | `gsap.set('.social a', { opacity: 1, y: 0, scale: 1 })` |
| `LatestPosts.astro` | `gsap.set('.post-link', { opacity: 1, y: 0 })` |

### Pattern Used

```typescript
import { prefersReducedMotion } from '../utils/reduced-motion';

if (prefersReducedMotion()) {
  gsap.set(elements, { opacity: 1, y: 0 }); // Visible immediately
} else {
  // GSAP animation code
}
```

### ✅ Phase 2 Checklist

- [x] `prefers-reduced-motion` detected via utility function
- [x] All 5 sections skip GSAP animations when reduced motion enabled
- [x] Elements set to visible state via `gsap.set()`
- [x] Filter logic (ProjectsSection) works without animations
- [x] Progress bars (SkillsSection) show at final width
- [x] `pnpm check` passes (0 errors)

---

## 📅 Phase 3: Parallax Scrolling (Week 1-2) — NOT STARTED

**File**: `src/components/effects/ParallaxLayer.tsx`

```tsx
import { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '../../utils/gsap-config';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ParallaxLayerProps {
  children: React.ReactNode;
  speed?: number; // -1 to 1 (negative = moves up, positive = moves down)
  className?: string;
}

export function ParallaxLayer({ 
  children, 
  speed = 0.5, 
  className = '' 
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!ref.current || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        y: () => window.innerHeight * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true
        }
      });
    }, ref);

    return () => ctx.revert();
  }, [speed, prefersReducedMotion]);

  return (
    <div 
      ref={ref} 
      className={className}
      style={{ willChange: 'transform' }}
    >
      {children}
    </div>
  );
}
```

### 2.2 Usage Example

```tsx
<section className="hero">
  {/* Background layer - slowest */}
  <ParallaxLayer speed={-0.3} className="hero-bg">
    <img src="/bg.jpg" alt="" />
  </ParallaxLayer>
  
  {/* Middle layer */}
  <ParallaxLayer speed={-0.1} className="hero-middle">
    <h1>Title</h1>
  </ParallaxLayer>
  
  {/* Foreground layer - fastest */}
  <ParallaxLayer speed={0.2} className="hero-fg">
    <button>CTA</button>
  </ParallaxLayer>
</section>
```

### 2.3 Prevention Checklist

- [ ] **Performance**: Use `will-change: transform` only during animation
- [ ] **Mobile**: Disable parallax on mobile if performance drops
- [ ] **Accessibility**: Respect `prefers-reduced-motion`
- [ ] **ScrollTrigger**: Use `invalidateOnRefresh: true` for responsive layouts
- [ ] **Z-index**: Ensure layers stack correctly
- [ ] **Test**: Verify smooth 60fps on mid-range devices

---

## 📅 Phase 3: Custom Cursor Interactions (Week 2)

### 3.1 Magnetic Cursor Component

**File**: `src/components/effects/MagneticCursor.tsx`

```tsx
import { useEffect, useRef, useState } from 'react';
import { gsap } from '../../utils/gsap-config';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export function MagneticCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !cursorRef.current) return;

    const cursor = cursorRef.current;
    const dot = cursorDotRef.current;

    // Smooth follow with lerp
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Dot follows immediately
      gsap.to(dot, {
        x: mouseX,
        y: mouseY,
        duration: 0.1
      });
    };

    // Smooth cursor follow
    const animate = () => {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      
      gsap.set(cursor, {
        x: cursorX,
        y: cursorY
      });
      
      requestAnimationFrame(animate);
    };

    // Magnetic effect on interactive elements
    const magneticElements = document.querySelectorAll(
      '[data-magnetic], a, button'
    );

    const magneticHandlers: Array<() => void> = [];

    magneticElements.forEach((el) => {
      const element = el as HTMLElement;
      
      const onMouseEnter = () => {
        setIsHovering(true);
        gsap.to(cursor, {
          scale: 1.5,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          duration: 0.3
        });
      };

      const onMouseLeave = () => {
        setIsHovering(false);
        gsap.to(cursor, {
          scale: 1,
          backgroundColor: 'transparent',
          duration: 0.3
        });
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.3
        });
      };

      const onMouseMoveMagnetic = (e: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        gsap.to(element, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.3
        });
      };

      element.addEventListener('mouseenter', onMouseEnter);
      element.addEventListener('mouseleave', onMouseLeave);
      element.addEventListener('mousemove', onMouseMoveMagnetic);

      magneticHandlers.push(() => {
        element.removeEventListener('mouseenter', onMouseEnter);
        element.removeEventListener('mouseleave', onMouseLeave);
        element.removeEventListener('mousemove', onMouseMoveMagnetic);
      });
    });

    window.addEventListener('mousemove', onMouseMove);
    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      magneticHandlers.forEach(cleanup => cleanup());
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <>
      <div
        ref={cursorRef}
        className="cursor-outer"
        style={{
          position: 'fixed',
          width: '40px',
          height: '40px',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'difference'
        }}
      />
      <div
        ref={cursorDotRef}
        className="cursor-dot"
        style={{
          position: 'fixed',
          width: '8px',
          height: '8px',
          backgroundColor: '#fff',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate(-50%, -50%)'
        }}
      />
    </>
  );
}
```

### 3.2 Usage

```tsx
// In Layout.astro or main component
<MagneticCursor client:only="react" />

// Mark interactive elements
<button data-magnetic>Click me</button>
<a href="/about" data-magnetic>About</a>
```

### 3.3 Prevention Checklist

- [ ] **Mobile**: Hide cursor on touch devices
- [ ] **Performance**: Use `requestAnimationFrame` for smooth animation
- [ ] **Accessibility**: Fallback to default cursor if JS fails
- [ ] **z-index**: Ensure cursor is above all content
- [ ] **mix-blend-mode**: Test visibility on different backgrounds
- [ ] **Test**: Verify magnetic effect doesn't interfere with clicks

---

## 📅 Phase 5: Split Text Animations ✅

### Implementation (Astro, not React)

**File**: `src/components/effects/SplitText.astro`

Server-side Astro component that splits text at build time. No React hydration needed.

```astro
---
interface Props {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  class?: string;
  splitBy?: 'words' | 'chars';
}

const { text, as: Tag = 'span', class: className = '', splitBy = 'words' } = Astro.props;
const items = splitBy === 'words' ? text.split(' ') : text.split('');
---

<Tag class:list={[className, 'split-text']} data-split={splitBy}>
  {items.map((item: string, i: number) => (
    <>
      <span class="split-item" style="display: inline-block">{item}</span>
      {splitBy === 'words' ? ' ' : ''}
    </>
  ))}
</Tag>
```

### Usage in HeroSection.astro

```astro
<SplitText text="Jose Roberto Vargas Orellana" as="h1" class="hero-title" splitBy="words" />
```

GSAP animation targets `.hero-title .split-item` with `stagger: 0.08`:
```typescript
gsap.fromTo(
  '.hero-title .split-item',
  { opacity: 0, y: 40, filter: 'blur(8px)' },
  { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.5, ease: 'power3.out', delay: 0.3, stagger: 0.08 }
);
```

### Key Details

- `text-shadow: inherit` on `.split-item` to inherit glow from parent
- Space `{' '}` between word spans for proper spacing
- Reduced motion: `gsap.set()` on `.hero-title .split-item` for immediate visibility

### ✅ Phase 5 Checklist

- [x] Server-side text splitting (SEO friendly)
- [x] Words have proper spacing between spans
- [x] `text-shadow` inherited from parent element
- [x] GSAP stagger animation per word
- [x] Reduced motion guard
- [x] `pnpm check` passes (0 errors)

---

## 📅 Phase 5: Horizontal Scroll (Week 3)

### 5.1 Horizontal Scroll Component

**File**: `src/components/effects/HorizontalScroll.tsx`

```tsx
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../utils/gsap-config';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface HorizontalScrollProps {
  children: React.ReactNode[];
  className?: string;
}

export function HorizontalScroll({ children, className = '' }: HorizontalScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!containerRef.current || !scrollRef.current || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const scrollElement = scrollRef.current!;
      const totalWidth = scrollElement.scrollWidth - window.innerWidth;

      gsap.to(scrollElement, {
        x: -totalWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: () => `+=${totalWidth}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <div ref={containerRef} className={className}>
      <div 
        ref={scrollRef} 
        style={{ 
          display: 'flex', 
          gap: '2rem',
          width: 'fit-content'
        }}
      >
        {children.map((child, i) => (
          <div 
            key={i} 
            style={{ 
              minWidth: '80vw',
              flexShrink: 0
            }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 5.2 Usage

```tsx
<HorizontalScroll>
  <ProjectCard project={projects[0]} />
  <ProjectCard project={projects[1]} />
  <ProjectCard project={projects[2]} />
  <ProjectCard project={projects[3]} />
</HorizontalScroll>
```

### 5.3 Prevention Checklist

- [ ] **Pin conflicts**: Ensure no other pinned elements overlap
- [ ] **Mobile**: Consider disabling on mobile or using swipe
- [ ] **Refresh**: Use `invalidateOnRefresh: true` for responsive
- [ ] **Accessibility**: Provide alternative navigation (arrows/dots)
- [ ] **Test**: Verify smooth scrubbing without jitter

---

## 📅 Phase 7: Page Transitions ✅

### View Transitions CSS (Layout.astro)

```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fade-out {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-20px); }
}

::view-transition-old(root) {
  animation: fade-out 0.4s ease-in-out;
}

::view-transition-new(root) {
  animation: fade-in 0.4s ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none;
  }
}
```

### ✅ Phase 7 Checklist

- [x] `ClientRouter` active in Layout.astro
- [x] `::view-transition-old/new` CSS keyframes added
- [x] `prefers-reduced-motion` respected
- [x] Fade + translateY transition on page navigation
- [x] Lenis properly destroyed on `astro:before-swap`
- [x] Lenis re-initialized on new page via `startScroll()`

---

## 📅 Phase 7: 3D/WebGL Immersive (Week 4)

### 7.1 Three.js Scene Component

**File**: `src/components/three/ImmersiveScene.tsx`

```tsx
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { useRef, Suspense } from 'react';
import * as THREE from 'three';

function AnimatedObject() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Rotate based on mouse position
    meshRef.current.rotation.x = state.mouse.y * 0.5;
    meshRef.current.rotation.y = state.mouse.x * 0.5;
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1, 0.3, 128, 32]} />
      <meshStandardMaterial 
        color="#ff6b6b" 
        metalness={0.8} 
        roughness={0.2}
      />
    </mesh>
  );
}

export function ImmersiveScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1
      }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <AnimatedObject />
        <Environment preset="city" />
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Suspense>
    </Canvas>
  );
}
```

### 7.2 Usage

```tsx
<ImmersiveScene client:only="react" />
```

### 7.3 Prevention Checklist

- [ ] **Performance**: Use `dpr={[1, 2]}` to limit pixel ratio
- [ ] **Mobile**: Reduce polygon count on mobile
- [ ] **Loading**: Show fallback while 3D loads
- [ ] **Memory**: Dispose geometries/materials on unmount
- [ ] **Accessibility**: Provide non-3D fallback
- [ ] **Test**: Verify 60fps on target devices

---

## 📅 Phase 8: Mask/Reveal Effects (Week 4)

### 8.1 Reveal Mask Component

**File**: `src/components/effects/RevealMask.tsx`

```tsx
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../utils/gsap-config';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface RevealMaskProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'top' | 'bottom' | 'circle';
  className?: string;
}

export function RevealMask({ 
  children, 
  direction = 'left',
  className = '' 
}: RevealMaskProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!ref.current || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const clipPaths: Record<string, string> = {
        left: 'inset(0 100% 0 0)',
        right: 'inset(0 0 0 100%)',
        top: 'inset(0 0 100% 0)',
        bottom: 'inset(100% 0 0 0)',
        circle: 'circle(0% at 50% 50%)'
      };

      gsap.fromTo(
        ref.current,
        { clipPath: clipPaths[direction] },
        {
          clipPath: 'inset(0 0 0 0)',
          duration: 1.2,
          ease: 'power4.inOut',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [direction, prefersReducedMotion]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
```

### 8.2 Usage

```tsx
<RevealMask direction="left">
  <img src="/image.jpg" alt="Revealed image" />
</RevealMask>

<RevealMask direction="circle">
  <h2>Circular reveal</h2>
</RevealMask>
```

### 8.3 Prevention Checklist

- [ ] **Browser support**: `clip-path` not in IE (use fallback)
- [ ] **Performance**: Avoid animating complex shapes
- [ ] **Accessibility**: Content must be readable without animation
- [ ] **Test**: Verify reveal works on all screen sizes

---

## 🧪 Testing Strategy

### Performance Testing

```bash
# Lighthouse audit
npm run build && npx lighthouse http://localhost:4321

# Check bundle size
npm run build && npx bundle analyzer
```

### Manual Testing Checklist

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)
- [ ] Reduced motion enabled
- [ ] Keyboard navigation
- [ ] Screen reader (VoiceOver/NVDA)

### Automated Testing

```typescript
// Example: Test parallax component
import { render, screen } from '@testing-library/react';
import { ParallaxLayer } from './ParallaxLayer';

describe('ParallaxLayer', () => {
  it('renders children', () => {
    render(<ParallaxLayer>Content</ParallaxLayer>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('respects reduced motion', () => {
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    render(<ParallaxLayer>Content</ParallaxLayer>);
    // Should not apply transforms
  });
});
```

---

## 🔄 Rollback Strategy

If any phase causes issues:

1. **Revert specific phase**:
   ```bash
   git revert <commit-hash>
   ```

2. **Disable effect temporarily**:
   ```tsx
   // Add feature flag
   const ENABLE_PARALLAX = false;
   
   {ENABLE_PARALLAX && <ParallaxLayer>...</ParallaxLayer>}
   ```

3. **Fallback to static content**:
   All effects should gracefully degrade to static content if JS fails.

---

## 📊 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| LCP | < 2.5s | Lighthouse |
| FID | < 100ms | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| FPS | 60fps | DevTools Performance |
| Bundle Size | < 200KB (gzipped) | Bundle analyzer |
| Accessibility | 100/100 | Lighthouse |

---

## 🎓 Resources

### Documentation
- [GSAP Docs](https://gsap.com/docs/)
- [ScrollTrigger](https://gsap.com/scroll/)
- [Three.js](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Astro View Transitions](https://docs.astro.build/en/guides/view-transitions/)

### Inspiration
- [Awwwards](https://www.awwwards.com/)
- [Godly](https://godly.website/)
- [Siteinspire](https://www.siteinspire.com/)

---

## ✅ Final Checklist

### Completed

- [x] Phase 1: Foundation (gsap-config, animation-presets, reduced-motion)
- [x] Phase 1.5: Splash screen architecture (not overlay, Lenis conditional)
- [x] Phase 2: Accessibility (prefers-reduced-motion in 5 sections)
- [x] Phase 5: Split text (Astro component, per-word stagger)
- [x] Phase 7: Page transitions (::view-transition CSS)

### Pending

- [ ] Phase 3: Parallax scrolling
- [ ] Phase 4: Custom cursor
- [ ] Phase 6: Horizontal scroll
- [ ] Phase 8: 3D/WebGL immersive
- [ ] Phase 9: Mask/reveal effects

---

## 📝 Notes

- Astro-first approach: prefer `.astro` components over React where possible
- `src/utils/` contains shared utilities usable in both `.astro` scripts and React
- Loading screen is a splash in document flow, NOT a fixed overlay
- Lenis + GSAP ticker start only after splash completes
- `prefers-reduced-motion` guards in all animated sections
- All commands use `pnpm` (not `npm`)

---

**Document Version**: 2.0  
**Last Updated**: June 29, 2026  
**Author**: AI Assistant