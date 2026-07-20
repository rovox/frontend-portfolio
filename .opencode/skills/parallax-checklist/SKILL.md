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
