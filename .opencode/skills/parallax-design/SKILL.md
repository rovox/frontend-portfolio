---
name: parallax-design
description: "Visual design direction for parallax landings. Use when: creating layer manifests, choosing color palettes, defining typography, planning scene composition, or art-directing parallax assets. Loaded by parallax-awwwards skill."
---

# Parallax Design — Visual Direction

## Layer Manifest (layers.json)

Every landing MUST produce a `layers.json`:

```json
{
  "layers": [
    { "id": "bg",   "src": "layer-bg.webp",   "speed": 0.25, "axis": "y", "maxTravel": 120, "scale": 1.15 },
    { "id": "mid",  "src": "layer-mid.webp",  "speed": 0.55, "axis": "y", "maxTravel": 320, "scale": 1.08 },
    { "id": "fg",   "src": "layer-fg.webp",   "speed": 0.90, "axis": "y", "maxTravel": 520, "scale": 1.05 }
  ],
  "mouseParallax": { "enabled": true, "intensity": 0.05, "invert": ["fg"] },
  "idle": { "layer": "fg", "scaleOscillation": 0.02, "periodSec": 8 }
}
```

Rules:
- `speed ∈ [0.15, 1.0]`; strictly increasing bg → fg
- `maxTravel` bg ≤ 150px (reveals edges otherwise)
- `scale ≥ 1.05` per layer (no empty canvas on translate)
- Art direction: ONE scene, ONE light source, ONE color grade

## Typography Stack

| Role | Font | Usage |
|------|------|-------|
| Headlines | Anton | Uppercase, bold, large |
| Accents | Caveat | Handwritten, quotes, CTAs |
| Body | Inter | Readable, neutral |

- Text color: `#f5f1ea` (never pure white `#fff`)
- Contrast ≥ 4.5:1 over every layer

## 5-Scene Narrative Structure

| Scene | Window | Purpose | Content |
|-------|--------|---------|---------|
| S1 | 0.00–0.20 | Hook | Kicker + headline, grab attention |
| S2 | 0.22–0.40 | Build | Introduce subject, add context |
| S3 | 0.42–0.60 | Climax | Signature moment, all layers sync |
| S4 | 0.62–0.80 | Resolve | Transition, calm before CTA |
| S5 | 0.82–1.00 | CTA | Final call-to-action, no .end section |

Silence gaps: 0.02 between scenes (image only, no text)

## Color & Light

- One accent color per page (e.g., `gold`, `teal`, `coral`)
- Light direction consistent across ALL layer assets
- Color grade applied uniformly (teal/abyssal-blue + accent)

## Asset Specs

| Asset | Format | Max Size | Max Dimensions | Alpha |
|-------|--------|----------|----------------|-------|
| Background | WebP | ≤350KB | ≤1920px | No |
| Midground | WebP/PNG | ≤350KB | ≤1920px | Yes (cutout) |
| Foreground | WebP/PNG | ≤350KB | ≤1920px | Yes (cutout) |
| Particles | PNG | ≤150KB | ≤512px | Yes |

## What to Ask Before Designing

1. "What is the story/theme of the landing?"
2. "What emotion should it evoke?" (mysterious, energetic, calm, etc.)
3. "Do you have reference images or moodboard?"
4. "What is the CTA text and action?"
