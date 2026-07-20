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
