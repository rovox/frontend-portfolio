---
name: performance
description: "Performance optimization principles. Use when: reviewing code for speed, optimizing assets, or setting performance budgets."
---

# Performance Principles

## Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| FPS | 60 | Chrome DevTools Performance |
| FCP | &lt;2.5s | Lighthouse, throttled 4G |
| TTI | &lt;3.5s | Lighthouse |
| Payload | ≤5MB | Network tab |
| Long tasks | 0 | &gt;50ms blocks main thread |

## GPU Optimization

- Use `transform` and `opacity` only
- Avoid: `top`, `left`, `margin`, `width`, `height`
- Use `will-change: transform` sparingly
- Remove `will-change` after animation

## Asset Optimization

- Format: WebP (JPEG fallback)
- Max: 350KB per asset, 1920px wide
- Lazy load below-fold
- Preload critical assets

## Code Optimization

- Debounce scroll handlers
- RAF for animations (not setInterval)
- Pause animations when tab hidden
- Cap DPR at 2x for mobile