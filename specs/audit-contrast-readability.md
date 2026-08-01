# Contrast & Readability Audit

**Status:** Audit — no files modified  
**Date:** 2026-08-01  
**Scope:** All components, icons, text tokens, borders against DESIGN.md "Midnight Protocol" dark theme  

---

## Executive Summary

The audit identified **3 critical failures**, **4 major issues**, and **5 minor/enhancement items**. The most severe problems stem from the `filter: invert(1)` approach used to theme SVG icons, which produces inconsistent and sometimes invisible results. Secondary issues involve low-contrast borders and one failing text color.

---

## P0 — CRITICAL (Content invisible or broken)

### 1. Contact Section: Medium social icon is nearly invisible

| Detail | Value |
|---|---|
| **File** | `src/components/ContactSection.astro` (lines 81-83, 384-386) |
| **SVG** | `public/icons/medium-svgrepo-com.svg` — uses `stroke="currentColor"`, no fill |
| **Inheritance chain** | `.cta-social-link` → no `color` set → inherits `body` → `var(--text)` = `#dce4e4` |
| **CSS filter** | `[data-theme="dark"] .cta-social-link img { filter: invert(1); }` |
| **Result** | `#dce4e4` inverted → `#231b1b` (nearly black) on `--bg: #0d1515` |
| **Contrast** | ~1.2:1 — **FAILS WCAG AAA, AA, and even large-text thresholds** |

**Root cause:** `filter: invert(1)` inverts light gray to near-black. The approach assumes all SVGs are solid black, but this SVG uses `currentColor`.

**Token-based fix:**
- Replace `medium-svgrepo-com.svg` with a version using `fill="currentColor"` (solid, not stroked)
- Remove `filter: invert(1)` from `.cta-social-link img`
- Set `.cta-social-link { color: var(--primary-container); }` — gives 12.6:1 contrast
- Hover: `color: var(--primary);` — gives 15:1+ contrast

---

### 2. Contact Section: LinkedIn icon renders as orange (brand color destroyed)

| Detail | Value |
|---|---|
| **File** | `src/components/ContactSection.astro` (lines 78-80, 384-386) |
| **SVG** | `public/icons/linkedin-1-svgrepo-com.svg` — `fill="#0A66C2"` (LinkedIn blue) |
| **CSS filter** | `filter: invert(1)` → `#0A66C2` becomes `#f5993d` (orange) |
| **Contrast** | Orange on dark bg is visible (~5:1) but **wrong brand color** — looks broken |

**Token-based fix:**
- Replace `linkedin-1-svgrepo-com.svg` with a `fill="currentColor"` version
- Same `.cta-social-link { color: var(--primary-container); }` fix as above
- All three social icons become monochrome, consistent, and theme-responsive

---

### 3. Project Section: ALL link icons render as wrong color (red instead of cyan)

| Detail | Value |
|---|---|
| **File** | `src/components/ProjectsSection.astro` (lines 287-289, 324-326) |
| **SVGs affected** | `github-outline.svg`, `medium-outline.svg`, `external-link-svgrepo-com.svg`, `colab-svgrepo-com.svg` — all use `stroke="currentColor"` |
| **Inheritance** | `.project-link-icon { color: var(--primary-container) }` = `#00f2ff`; `.btn-primary { color: var(--primary-container) }` = `#00f2ff` |
| **CSS filter** | `[data-theme="dark"] .project-link-icon img { filter: invert(1); }` and `[data-theme="dark"] .project-btn img { filter: invert(1); }` |
| **Result** | `#00f2ff` (cyan) inverted → `#ff0d00` (red) |
| **Contrast** | Red on dark bg ≈ 5.2:1 — visible but **completely wrong hue**; breaks the design system's cyan identity |

**Token-based fix:**
- Remove ALL `filter: invert(1)` rules from `.project-link-icon img` and `.project-btn img`
- The SVGs already use `stroke="currentColor"` — they inherit the correct cyan from their parent's `color` property
- No SVG changes needed; the CSS color inheritance already works perfectly without the filter

---

## P1 — MAJOR (WCAG AA failures or significant readability problems)

### 4. Footer copyright text fails WCAG AA

| Detail | Value |
|---|---|
| **File** | `src/components/ContactSection.astro` (lines 400-406) |
| **Selector** | `.footer-copyright` |
| **Current value** | `color: color-mix(in srgb, var(--muted) 50%, transparent)` ≈ `#637070` |
| **Background** | `--bg: #0d1515` |
| **Contrast** | ~3.4:1 — **FAILS WCAG AA** (4.5:1 required for normal text) |
| **Font size** | `0.625rem` (10px) — extremely small, makes low contrast worse |

**Token-based fix:**
- Change to `color: var(--muted)` (10.3:1) or at minimum `color-mix(in srgb, var(--muted) 70%, transparent)` (~5.8:1)
- Consider bumping font-size to `var(--fs-label)` (0.75rem / 12px) minimum

---

### 5. `--border` token is nearly invisible on dark backgrounds

| Detail | Value |
|---|---|
| **File** | `src/layouts/Layout.astro` (line 237) |
| **Token** | `--border: rgba(58, 73, 75, 0.25)` ≈ effective `#191d1d` |
| **Background** | `--bg: #0d1515` |
| **Contrast** | ~1.2:1 — borders are essentially invisible |
| **Affected components** | `.glass-card`, `.card-ui`, `.filter-chip`, form inputs, `.exp-tech` tags, `.year-pill`, education focus items, `.tag-ui` |

**Impact:** Cards, tags, and form fields lack visible boundaries. Users cannot distinguish interactive elements from background. While WCAG 1.4.3 doesn't cover decorative borders, WCAG 1.4.11 (Non-text Contrast, 3:1 for UI components) applies to borders that define interactive elements.

**Token-based fix:**
- Change `--border` from `rgba(58, 73, 75, 0.25)` to `rgba(58, 73, 75, 0.5)` or use `var(--outline-variant)` directly
- Alternatively, add `--border-visible: rgba(132, 148, 149, 0.3)` using `--outline: #849495` as base (~3.5:1 effective contrast)

---

### 6. `--outline-variant` borders fail 3:1 UI component threshold

| Detail | Value |
|---|---|
| **File** | `src/layouts/Layout.astro` (line 236) |
| **Token** | `--outline-variant: #3a494b` |
| **Background** | `--bg: #0d1515` |
| **Contrast** | ~1.85:1 — **FAILS WCAG 1.4.11** (3:1 for UI components) |
| **Affected** | `.exp-tech` tags, `.edu-focus li`, `.year-pill`, `.tag-ui`, form inputs, `.filter-chip` |

**Token-based fix:**
- Darken `--outline-variant` to at least `#5a6e70` (~3.1:1) or use `var(--outline)` (`#849495`, ~5.5:1) for interactive element borders
- Reserve `--outline-variant` for purely decorative separators only

---

### 7. GitHub social icon (`github-svgrepo-com.svg`) relies on accidental correctness

| Detail | Value |
|---|---|
| **File** | `public/icons/github-svgrepo-com.svg` |
| **SVG** | `fill="#000000"` — hardcoded black |
| **CSS filter** | `filter: invert(1)` → black becomes white → works, but only by coincidence |
| **Risk** | If the filter is ever removed or overridden, the icon becomes invisible (black on dark) |

**Token-based fix:**
- Replace with a `fill="currentColor"` version (like `github-outline.svg` already is)
- Remove `filter: invert(1)` dependency entirely
- Consistent approach across all social icons

---

## P2 — MINOR (Visual polish / hardening)

### 8. Hero scanlines overlay reduces text legibility

| Detail | Value |
|---|---|
| **File** | `src/components/HeroSection.astro` (lines 338-352) |
| **Selector** | `[data-theme="dark"] .hero::after` |
| **Issue** | Repeating gradient at `opacity: 0.5` overlays semi-transparent cyan lines on top of hero text. While subtle, it reduces effective contrast for the hero name and title. |

**Suggestion:** Reduce opacity to `0.25` or add `mix-blend-mode: overlay` to minimize impact on text.

---

### 9. `.card-desc` text could benefit from higher contrast

| Detail | Value |
|---|---|
| **File** | `src/components/ProjectsSection.astro` (lines 243-248) |
| **Selector** | `.card-desc` |
| **Current** | `color: var(--muted)` = `#b9cacb` (10.3:1 on `--bg`) |
| **Context** | Inside `.glass-card` with `background: rgba(21, 29, 30, 0.7)` — the card surface is slightly lighter than `--bg`, so actual contrast is slightly lower than 10.3:1 but still AAA. |

**Status:** Technically fine. No action required unless design wants more visual weight.

---

### 10. Skill list items use `--muted` but `>` prefix uses `--primary-container`

| Detail | Value |
|---|---|
| **File** | `src/components/SkillsSection.astro` (lines 141-152) |
| **Issue** | The `> ` prefix is `--primary-container` (12.6:1) but the list text is `--muted` (10.3:1). The 2.3:1 difference makes the prefix much more prominent than the content. This is intentional design but worth noting for readability. |

**Status:** Intentional. No action needed.

---

### 11. Form input placeholder text opacity

| Detail | Value |
|---|---|
| **File** | `src/components/ContactSection.astro` (lines 298-302) |
| **Selector** | `input::placeholder, textarea::placeholder` |
| **Current** | `color: var(--muted); opacity: 0.7;` |
| **Issue** | Placeholders at 70% opacity reduce contrast. WCAG allows low-contrast placeholders (they're not real content), but very low placeholder contrast can confuse users about whether the field has a value. |

**Suggestion:** Increase to `opacity: 0.8` or use `color-mix(in srgb, var(--muted) 80%, var(--bg))`.

---

## Summary: `filter: invert(1)` Anti-Pattern

The `filter: invert(1)` CSS approach is the single largest source of contrast failures. It was applied to SVG icons under the assumption that all SVGs are solid black, but:

| SVG | Fill/Stroke | After `invert(1)` | Result |
|---|---|---|---|
| `github-svgrepo-com.svg` | `fill="#000"` | `#fff` (white) | Works by accident |
| `linkedin-1-svgrepo-com.svg` | `fill="#0A66C2"` | `#f5993d` (orange) | Wrong color |
| `medium-svgrepo-com.svg` | `stroke="currentColor"` → `#dce4e4` | `#231b1b` (near-black) | **INVISIBLE** |
| `github-outline.svg` | `stroke="currentColor"` → `#00f2ff` | `#ff0d00` (red) | Wrong color |
| `medium-outline.svg` | `stroke="currentColor"` → `#00f2ff` | `#ff0d00` (red) | Wrong color |
| `external-link-svgrepo-com.svg` | `stroke="currentColor"` → `#00f2ff` | `#ff0d00` (red) | Wrong color |
| `colab-svgrepo-com.svg` | `stroke="currentColor"` → `#00f2ff` | `#ff0d00` (red) | Wrong color |

**Recommended global fix:**
1. Convert all SVGs to `fill="currentColor"` or `stroke="currentColor"` (most already do)
2. Remove ALL `filter: invert(1)` rules from the codebase
3. Let CSS `color` inheritance handle icon theming — the parent's `color` property flows into `currentColor` naturally
4. This eliminates the entire class of icon contrast bugs and makes icons theme-responsive without filters

---

## Prioritized Fix Order

| Priority | Issue | Files | Effort |
|---|---|---|---|
| **P0-1** | Remove `filter: invert(1)` from all icon CSS; fix SVG fills | `ProjectsSection.astro`, `ContactSection.astro` | Low |
| **P0-2** | Replace `linkedin-1-svgrepo-com.svg` with `currentColor` version | `public/icons/` | Low |
| **P0-3** | Replace `medium-svgrepo-com.svg` with `currentColor` version | `public/icons/` | Low |
| **P0-4** | Replace `github-svgrepo-com.svg` with `currentColor` version | `public/icons/` | Low |
| **P1-1** | Fix footer copyright contrast | `ContactSection.astro` | Trivial |
| **P1-2** | Increase `--border` token opacity | `Layout.astro` | Trivial |
| **P1-3** | Increase `--outline-variant` contrast | `Layout.astro` | Trivial |
| **P2-1** | Reduce hero scanline opacity | `HeroSection.astro` | Trivial |
| **P2-2** | Increase placeholder opacity | `ContactSection.astro` | Trivial |

---

## Token Changes Required (Summary)

```css
/* Layout.astro :root */
--border: rgba(58, 73, 75, 0.5);        /* was 0.25 — now ~3:1 effective */
--outline-variant: #5a6e70;              /* was #3a494b — now ~3.1:1 */

/* ContactSection.astro */
.cta-social-link { color: var(--primary-container); }  /* new — drives currentColor icons */
.footer-copyright { color: var(--muted); }              /* was color-mix 50% — now 10.3:1 */

/* Remove all filter: invert(1) rules */
/* ProjectsSection.astro lines 287-289, 324-326 */
/* ContactSection.astro lines 384-398 */
```

---

## WCAG Reference

| Criterion | Level | Requirement | Status |
|---|---|---|---|
| 1.4.3 Contrast (Minimum) | AA | 4.5:1 normal text, 3:1 large text | Footer copyright FAILS |
| 1.4.6 Contrast (Enhanced) | AAA | 7:1 normal text, 4.5:1 large text | `--muted` passes AA, not AAA on card surfaces |
| 1.4.11 Non-text Contrast | AA | 3:1 for UI components (borders, icons) | `--border`, `--outline-variant`, social icons FAIL |
| 1.4.1 Use of Color | A | Color not sole means of conveying info | Pass (icons have text labels) |
