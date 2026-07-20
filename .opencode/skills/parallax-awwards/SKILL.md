---
name: parallax-awwwards
description: "Awwwards-grade parallax landing pages. Use when: scroll-driven animations, multi-layer depth, immersive hero sections, or Site of the Day quality. Teaches WHY, not HOW."
---

# Parallax Awwwards — Principles

## Core Concept

Parallax creates depth by moving multiple layers at different speeds from a single scroll progress value. The brain reads differential motion as spatial depth.

## Before You Start — Ask User

1. "Is this new or refactor?"
2. "Pure layered, frame scrub, or hybrid?"
3. "Do you have assets or need guidance?"
4. "What is the scroll budget?" (suggest: 4800px)
5. "Which effects? (grain, vignette, mouse parallax)"
6. "What is the 5-scene story?"
7. "Color accent and light direction?"
8. "Desktop-only or responsive?"

Do NOT proceed without answers to 1, 2, 3, 6.

## Engineering Principles

- **Inspect before editing** — Read existing code first
- **Reuse before creating** — Extend working code
- **Prefer deletion over addition** — Remove unused code
- **Configuration over code** — Can this be a config change?
- **One source of truth** — Single lerped progress drives all motion

## Quality Constraints (Measurable)

| Constraint | Target | Why |
|------------|--------|-----|
| FPS | 60 | GPU-only properties |
| Layers | 3+ | Minimum for depth perception |
| Speed progression | Strictly increasing bg→fg | Creates depth illusion |
| Lerp factor | 0.15 (default) | Smooth but responsive |
| Pixel rounding | Whole pixels | Prevents sub-pixel blur |
| Transform method | translate3d only | GPU acceleration |
| Initial payload | ≤5MB | Fast load on 4G |
| Asset size | ≤350KB each | Per-layer budget |
| FCP | &lt;2.5s | User retention |
| Text contrast | ≥4.5:1 | Accessibility |

## Visual Identity

- **Fonts**: Anton (headlines), Caveat (accents), Inter (body)
- **Text color**: #f5f1ea (warm off-white, never #fff)
- **Effects**: Film grain 4% + vignette 25%, both pointer-events:none
- **Light**: One direction, consistent across all layers

## Narrative Structure

5 scenes with 0.02 silence gaps:
- S1 (0.00–0.20): Hook
- S2 (0.22–0.40): Build
- S3 (0.42–0.60): Climax (signature moment)
- S4 (0.62–0.80): Resolve
- S5 (0.82–1.00): CTA (final scene, no .end section)

## Accessibility Requirements

- prefers-reduced-motion: disable effects, native scroll
- Keyboard: Arrow/Page keys advance scroll
- Touch: Vertical swipe with momentum
- Fallback: If layers fail, gradient+grain+text still works

## What This Skill Does NOT Cover

- **Implementation code** → Use custom tools
- **File structure** → Project-specific decision
- **Testing** → Use project pipeline (pnpm check, pnpm build)
- **Asset generation** → Use design tools or manual creation