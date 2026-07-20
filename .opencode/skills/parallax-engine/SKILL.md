---
name: parallax-engine
description: "Technical implementation of parallax engines. Use when: writing scroll controllers, layer transforms, mouse parallax, effects (grain, vignette, motion blur), or optimizing for 60fps. Loaded by parallax-awwwards skill."
---

# Parallax Engine — Technical Implementation

## Motion Architecture

### Single Source of Truth

```typescript
// One lerped progress value drives everything
const progress = useRef(0) // current
const target = useRef(0)  // target from scroll

useFrame(() => {
  progress.current += (target.current - progress.current) * 0.15
})
```

### Layer Transform

```typescript
// Per layer
const offset = progress * maxTravel * (speed / maxSpeed)
// Apply ONLY as:
transform: translate3d(0, ${offset}px, 0)
```

Rules:
- Round to whole pixels before DOM write (no sub-pixel blur)
- NEVER animate: top, left, margin, width, height, background-position
- Each layer: `will-change: transform`, `backface-visibility: hidden`

## Scroll Controller

```typescript
// Virtual scroll with lerp
const SCROLL_BUDGET = 4800 // px
const LERP_FACTOR = 0.15

useEffect(() => {
  const handleScroll = (e: WheelEvent) => {
    target.current = clamp(target.current + e.deltaY / SCROLL_BUDGET, 0, 1)
  }
  window.addEventListener('wheel', handleScroll, { passive: true })
}, [])
```

## Mouse Parallax

```typescript
const MOUSE_INTENSITY = 0.05
const MOUSE_LERP = 0.08
const MAX_MOUSE_OFFSET = 12 // px

// Additive to scroll offset
const mouseOffsetX = mouseX * MAX_MOUSE_OFFSET * MOUSE_INTENSITY
const mouseOffsetY = mouseY * MAX_MOUSE_OFFSET * MOUSE_INTENSITY
```

## Effects

### Film Grain (SVG Noise)

```css
.film-grain {
  position: fixed; inset: 0;
  background: url('data:image/svg+xml,...'); /* SVG noise */
  opacity: 0.04;
  pointer-events: none;
  z-index: 100;
}
```

### Vignette

```css
.vignette {
  position: fixed; inset: 0;
  background: radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.25) 100%);
  pointer-events: none;
  z-index: 101;
}
```

### Motion Blur (Velocity-Reactive)

```typescript
const velocity = Math.abs(target.current - progress.current) * 60 // px/s
const blur = velocity > 120 ? Math.min((velocity - 120) / 80 * 2, 2) : 0
```

## Performance Contract

| Metric | Target | How |
|--------|--------|-----|
| FPS | 60 | GPU-only props, no layout thrashing |
| FCP | <2.5s | WebP, lazy load, preload critical |
| Payload | ≤5MB | WebP ≤350KB each, ≤1920px |
| Long tasks | 0 | RAF per frame, no blocking |

## What to Ask Before Implementing

1. "Is this Astro + React or vanilla JS?"
2. "Do you use GSAP or native RAF?"
3. "Is this desktop-only or responsive?"
4. "What is the target scroll budget?"
```

---

### 📄 2.3 `parallax-guidelines/SKILL.md`

```markdown
---
name: parallax-guidelines
description: "Best practices and refactoring guidelines for parallax landings. Use when: reviewing existing code, refactoring for performance, fixing scroll issues, or improving accessibility. Loaded by parallax-awwwards skill."
---

# Parallax Guidelines — Best Practices & Refactoring

## Common Issues & Fixes

### Issue: Stuttering Scroll
**Symptom**: FPS drops during scroll, janky motion
**Causes**:
- Animating `top`/`left` instead of `transform`
- Not rounding to whole pixels
- Too many layers (>5) or too large assets
- No `will-change: transform`

**Fix**:
```css
/* Before */
.layer { top: 100px; }

/* After */
.layer { transform: translate3d(0, 100px, 0); will-change: transform; }
```

### Issue: Edge Reveal
**Symptom**: Empty canvas visible at max scroll
**Cause**: `scale < 1.05` or `maxTravel` too large for layer size

**Fix**: Increase `scale` to `1.15` for bg, `1.05` for fg. Reduce `maxTravel`.

### Issue: Sub-pixel Blur
**Symptom**: Text and images look blurry during motion
**Cause**: Transform values with decimals (e.g., `100.5px`)

**Fix**:
```typescript
// Round before applying
element.style.transform = `translate3d(0, ${Math.round(offset)}px, 0)`
```

### Issue: Mobile Performance
**Symptom**: 30fps or less on mobile
**Cause**: Too many layers, heavy effects, no DPR limit

**Fix**:
```typescript
const maxDPR = Math.min(window.devicePixelRatio, 2) // Cap at 2x
```

## Refactoring Checklist

When refactoring an existing parallax:

- [ ] Replace `top/left` with `translate3d`
- [ ] Add `will-change: transform` to all layers
- [ ] Round offsets to whole pixels
- [ ] Reduce layer count if >5
- [ ] Compress assets to WebP ≤350KB
- [ ] Add `prefers-reduced-motion` fallback
- [ ] Cap DPR at 2x
- [ ] Pause RAF when tab hidden (`document.visibilitychange`)

## Accessibility Must-Haves

```css
@media (prefers-reduced-motion: reduce) {
  .parallax-layer {
    transform: none !important;
    transition: none !important;
  }
  /* Show all scenes stacked, native scroll */
}
```

## Keyboard & Touch

- Arrow keys: ±100px per press
- PageUp/PageDown: ±500px per press
- Touch: vertical swipe with momentum decay

## What to Ask Before Refactoring

1. "What is the current FPS on target device?"
2. "Which browsers/devices must be supported?"
3. "Is the issue performance, visual, or accessibility?"
4. "Can we reduce layer count or asset size?"
```

---

### 📄 2.4 `parallax-checklist/SKILL.md`

```markdown
---
name: parallax-checklist
description: "Awwwards-derived quality checklist for parallax landings. Use when: validating a completed landing against Site of the Day criteria. Loaded by parallax-awwwards skill."
---

# Parallax Checklist — Awwwards Quality Criteria

## Motion & Depth (4 items)

- [ ] **3+ layers** with strictly increasing speeds (bg → fg)
- [ ] **60fps** during scroll (no long tasks >50ms; GPU-only properties)
- [ ] **Lerp 0.1–0.2**, whole-pixel rounding, mouse parallax ≤12px smoothed
- [ ] **One signature moment** (scene 3: layers sync, scale pulse, or reveal)

## Visual (4 items)

- [ ] **One coherent light source** + color grade across all layers
- [ ] **Film grain 3–5%** + vignette 20–30%, both `pointer-events:none`
- [ ] **Font stack**: Anton (headlines) / Caveat (accents) / Inter (body) — no 4th font
- [ ] **Text color #f5f1ea**, never pure white; contrast ≥4.5:1 over every layer

## Narrative (3 items)

- [ ] **5 scenes**, windows 0.00–0.20 / 0.22–0.40 / 0.42–0.60 / 0.62–0.80 / 0.82–1.00
- [ ] **0.02 silence gaps** respected (image only, no text)
- [ ] **Final scene IS the CTA**; no .end section

## Performance (4 items)

- [ ] **Initial payload ≤5MB**; layer assets WebP ≤350KB each, ≤1920px
- [ ] **FCP <2.5s** on throttled 4G; loader shows real progress
- [ ] **No console errors**; no layout shift after load
- [ ] **Zero long tasks** (>50ms) during scroll

## Accessibility & Robustness (5 items)

- [ ] **prefers-reduced-motion** fallback works (native scroll, static scene)
- [ ] **Full keyboard** + touch parity
- [ ] **Layer-failure fallback** renders (gradient + grain + text)
- [ ] **Works 360px → 4K** without horizontal scroll or clipped text
- [ ] **No horizontal scroll** on any device

## Scoring

| Score | Meaning |
|-------|---------|
| 20/20 | Site of the Day quality |
| 17–19 | Honorable Mention |
| 14–16 | Needs polish |
| <14 | Major rework needed |

## What to Ask Before Validating

1. "Has the landing been tested on target devices?"
2. "Are all assets finalized and compressed?"
3. "Is the scroll budget locked?"
