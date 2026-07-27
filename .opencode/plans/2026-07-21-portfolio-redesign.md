# Portfolio Redesign — "Midnight Protocol" Theme

**Date:** 2026-07-21  
**Status:** Plan phase — awaiting user approval  
**Theme:** Midnight Protocol (see `DESIGN.md` for all color, typography, elevation, spacing, and component rules)

---

## Summary

Replace all placeholder content with real CV data. Restructure sections following the user-provided template aesthetic, but derive all visual decisions from `DESIGN.md` "Midnight Protocol" theme. Add photo + WhatsApp/Gmail buttons to hero. Maintain blog, LoadingScreen, and existing animation infrastructure.

---

## Phase 1: CSS Token Alignment → `DESIGN.md`

### What Changes in `Layout.astro` `:root`

**Current tokens are wrong** — they use a blue-ish palette (`#04070f`, `#2de2e6`, `#55ff9f`) that does NOT match Midnight Protocol.

**Must mirror DESIGN.md exactly:**

| CSS Variable | DESIGN.md Token | Value |
|-------------|-----------------|-------|
| `--bg` | `background` | `#0d1515` |
| `--surface` | `surface-container` | `rgba(25, 33, 34, 0.7)` (glass) |
| `--surface-high` | `surface-container-high` | `#232b2c` |
| `--text` | `on-surface` | `#dce4e4` |
| `--muted` | `on-surface-variant` | `#b9cacb` |
| `--primary` | `primary` | `#e1fdff` |
| `--primary-container` | `primary-container` | `#00f2ff` |
| `--secondary` | `secondary` | `#c3c6cf` |
| `--border` | `outline-variant` (20% opacity) | `rgba(58, 73, 75, 0.2)` |
| `--radius-sm` | `rounded.sm` | `0.125rem` |
| `--radius-md` | `rounded.DEFAULT` | `0.25rem` |
| `--radius-lg` | `rounded.lg` | `0.5rem` |
| `--radius-xl` | `rounded.xl` | `0.75rem` |

**Remove:** `--accent: #8f6bff`, `--shadow-sm/md/lg`, old blue gradient background.

**Add:** `--surface-variant: #2e3637`, `--on-primary: #00363a`, `--error: #ffb4ab`.

**Typography tokens per DESIGN.md:**
- `--font-body`: Inter (keep)
- `--font-mono`: JetBrains Mono (keep)
- `--fs-display`: `clamp(2.5rem, 8vw, 3rem)` (48px spec, responsive)
- `--fs-headline-lg`: `clamp(1.75rem, 5vw, 2rem)` (32px spec)
- `--fs-headline-md`: `clamp(1.35rem, 3vw, 1.5rem)` (24px spec)
- `--fs-body-lg`: `1.125rem`
- `--fs-body-md`: `1rem`
- `--fs-code`: `0.875rem`
- `--fs-label`: `0.75rem`

**Body background:** `background-color: var(--bg); color: var(--text);` — no gradient. Per DESIGN.md: "Level 0 (Base): Midnight navy background."

---

## Phase 2: Section Implementation

### 2.1 Hero Section (`HeroSection.astro`) — REDESIGN

**New requirements:**
- Photo area (user avatar/profile image) — with fallback placeholder
- WhatsApp rapid contact button → `https://wa.me/59162642144`
- Gmail rapid contact button → `mailto:varor.joseroberto@gmail.com`
- Terminal-style intro card (from template, adapted to Midnight Protocol)

**Layout (per DESIGN.md fluid grid, 1200px max-width):**
```
┌─────────────────────────────────────────────┐
│  [LABEL: Engineering Digital Excellence]     │
│                                              │
│  ┌──────┐  JOSE ROBERTO                     │
│  │ PHOTO │  VARGAS ORELLANA                  │
│  │ 200px │  Software Engineer                │
│  └──────┘                                    │
│                                              │
│  [  WhatsApp  ]  [  Gmail  ]  [   CV    ]   │
│                                              │
│  ┌─ Terminal Card (zsh — intro.md) ────────┐ │
│  │ ● ● ●                                    │ │
│  │ ➜ ~/portfolio cat intro.md              │ │
│  │ # Designing systems that scale.           │ │
│  │ # Building interfaces that inspire.       │ │
│  │ Focusing on performance + human-centered  │ │
│  │ design principles.                        │ │
│  │ ➜ ~/portfolio █ (blinking cursor)        │ │
│  └──────────────────────────────────────────┘ │
│                                              │
│  [scroll indicator ▼]                        │
└─────────────────────────────────────────────┘
```

**Mobile:** Photo shrinks to 120px, name/title stack vertically above photo, terminal full-width, buttons stack.

**Buttons per DESIGN.md:**
- **Primary** (WhatsApp/Gmail): Cyan (#00f2ff) text, transparent bg, 1px cyan border. Hover: glow + white text.
- **Ghost** (Download CV): Slate text, no border. Hover: 1px slate border.

**Photo fallback:** Use a gradient avatar placeholder (`#00dbe7` → `#00696f`) with user initials "JRVO" in JetBrains Mono. Replace with `<img>` when user provides a photo.

**Animations:** Keep existing SplitText/GSAP reveals. Add `RevealMask` for photo fade-in. Terminal typewriter effect after title completes.

### 2.2 Skills Section (`SkillsSection.astro`) — CONTENT + DESIGN UPDATE

**Content from CV (no more fake data).** Organize as glass cards per `DESIGN.md` "Cards (Project/Blog)" spec:

| Card | Icon (Material) | Skills |
|------|-----------------|--------|
| Core Engineering | `terminal` | Clean Architecture, DDD, SOLID, System Design, TS, JS, Python, Node.js, PostgreSQL |
| Blockchain | `token` | Solidity, Smart Contracts, Celestia, Rollups, Web3.js, Ethers.js, Hardhat, Foundry |
| 3D & Immersive | `view_in_ar` | Three.js, WebGL, GLSL, Shaders, GSAP, Real-time Rendering |
| Mobile | `smartphone` | Flutter, Dart, React Native, Expo, State Management |
| DevOps | `dns` | Docker, Linux, CI/CD, Apache, Nginx, AWS |
| AI-Assisted | `neurology` | Copilot, Cursor IDE, Prompt Engineering, AI Documentation, AI Testing |

**Design (per DESIGN.md):**
- 3x2 grid (desktop), 2x3 (tablet), 1x6 (mobile)
- Each card: Glass surface (Level 1), 1px outline-variant border
- Icon: `--primary-container` color, large (3rem)
- Skill list: monospaced `>` prefix, `--on-surface-variant` color
- Hover: border → `--primary-container`, bg brightness +5%

**Remove:** Progress bars (replaced with skill lists, more honest).

### 2.3 Experience Section — NEW (`ExperienceSection.astro`)

**Content:** All 11 roles from CV, grouped:
- **Professional** (8 roles): Tilinka (3), Cumulo.pro, Pictoaudios, SilloRoll, Hacklab BrickHeads
- **University Projects** (3 roles): Oh Sansi, Dulce Aroma, Election System

**Design (per DESIGN.md):** Timeline or card grid with filter tabs.

Each card:
```
┌────────────────────────────────────────┐
│ [DATE]  ROLE                           │
│ Company — Location                     │
│                                        │
│ [Tag] [Tag] [Tag]                      │
│                                        │
│ • Highlight 1                          │
│ • Highlight 2                          │
│ • Highlight 3                          │
└────────────────────────────────────────┘
```

- Date: `--label-caps` style (monospaced, 12px, uppercase, expanded tracking)
- Role: `--headline-md` (monospaced, 24px)
- Company: `--on-surface-variant`, `--body-md`
- Tags: `--code` style chips with `--outline-variant` border
- Bullets: `--body-md`, `--muted`

**Filter tabs:** ALL | PROFESSIONAL | UNIVERSITY — per DESIGN.md "Chips/Tags" spec (monospaced, uppercase, border-only pill).

### 2.4 Projects Section (`ProjectsSection.astro`) — CONTENT UPDATE

Replace fake projects with CREDIBLE entries derived from work experience:

1. 3D Environment (ARK Studio) — Three.js, WebGL, GLSL, GSAP
2. ROSCA Smart Contracts (Cumulo.pro) — Solidity, Celestia, Docker
3. Fitness App (Tilinka) — Flutter, DDD, Clean Architecture
4. Corporate Website (Tilinka) — React, Accessibility, SEO
5. Pictoaudios Platform — React, REST API, Accessibility
6. SilloRoll Mobile App — React Native, Expo, WhatsApp API

Keep existing card grid, filter system, and animations. Add category tags matching DESIGN.md chip spec. Use gradient thumbnails as project images (no real screenshots available).

### 2.5 Education Section — NEW (`EducationSection.astro`)

**Content:** 3 entries as glass cards:

1. **B.S. Computer Engineering** — UMSS, 2021–Present, Cochabamba
2. **Diploma in Data Science** — Online/UMSS, 2026–Present
3. **Self-Directed Track** — WebGL/Blockchain/Mobile Architecture, 2023–Present

**Design:** Follow "Cards (Project/Blog)" from DESIGN.md. Institution in `--headline-md`, details in `--body-md`.

### 2.6 Leadership Section — NEW (`LeadershipSection.astro`)

**Content:** 4 entries:

1. Vice President, SCESI (2023) — 200+ students, tech events
2. Organizer, Llajtita Flisol (2023) — 500+ attendees, open-source fair
3. Hackmeeting Cochabamba (2023) — cybersecurity conference
4. Member, HackLab BrickHeads (2023–Present) — digital rights, open-source

**Design:** Compact cards in 2×2 grid (desktop), with role in `--headline-md` and description in `--body-md`.

### 2.7 Blog Section (`LatestPosts.astro`) — MAINTAIN

Keep exactly as-is. The Content Collection system is correct. Only verify colors render correctly with updated tokens.

### 2.8 Contact & Footer — REDESIGN

**Design per DESIGN.md:** Large glass CTA card (Level 2: backdrop-blur, semi-transparent fill). 

Content:
- "Let's Work Together" (headline-lg)
- Description: "Open to technical consultations and freelance opportunities."
- Primary buttons: WhatsApp, Gmail (both cyan-border style)
- Ghost links: GitHub, LinkedIn

**Footer:** Minimal — `© 2025 Jose Roberto Vargas Orellana` with monospaced label-caps style.

---

## Phase 3: Navbar Update (`Navbar.astro`)

**Per DESIGN.md:** "Floating glassmorphic pill at the top of the screen."

Hash links (absolute with `data-astro-reload`):  
`/#home` | `/#skills` | `/#experience` | `/#work` | `/#education` | `/#leadership` | `/#blog` | `/#contact`

Add leading `>` character on active link per DESIGN.md spec.

**Mobile:** Add hamburger menu that opens a glass overlay with links.

---

## Phase 4: Loading Screen (`LoadingScreen.astro`) — ADJUSTMENTS

**Keep all 5 scenes** — the cinematic splash is already excellent.

**Only changes:**
1. Update Scene 4 terminal text:
   - Line 1: `Jose Roberto`
   - Line 2: `Vargas Orellana`
   - Line 3: `Computer Engineer & UI/UX Designer` (respects the UX/UI title)
2. Responsive fixes for mobile:
   - Cube: `clamp(100px, 30vw, 200px)` for faces
   - Terminal: `font-size: clamp(1rem, 3.5vw, 2.8rem)`
   - Security counter: `font-size: clamp(0.9rem, 3vw, 1.5rem)`
3. Background colors match Midnight Protocol (`#000` → `#0d1515`, `#00007F` → `#0a1628`)

---

## Phase 5: index.astro Restructure

```astro
<Layout title="Jose Roberto Vargas Orellana | Portfolio">
  <TideEffect client:only="react" />
  <ParallaxLayer speed={-0.3}>  <!-- bg layer per DESIGN.md parallax spec -->
    <HeroSection />
  </ParallaxLayer>
  <SkillsSection skills={skills} />
  <ExperienceSection experiences={experiences} />
  <ProjectsSection projects={projects} />
  <EducationSection educations={educations} />
  <LeadershipSection leaderships={leaderships} />
  <LatestPosts />
  <ContactSection />
</Layout>
```

All data objects defined in frontmatter as typed constants.

---

## Phase 6: Responsive Strategy (per DESIGN.md)

**Breakpoints from DESIGN.md:**
- **Mobile:** `margin-mobile: 20px`, sections gaps reduce to 80px
- **Desktop:** `margin-desktop: 80px`, 1200px max-width, 160px section gaps

**Grid behavior:**
- Mobile (< 720px): `1fr`
- Tablet (720–1040px): `repeat(2, 1fr)`
- Desktop (> 1040px): `repeat(3, 1fr)` or `repeat(4, 1fr)`

**Typography:** All headings use `clamp()` with DESIGN.md base sizes. Body stays at `1rem` minimum.

---

## Phase 7: Quality Gates

| Gate | Command | Pass Criteria |
|------|---------|---------------|
| TypeScript | `pnpm check` | Zero errors |
| Build | `pnpm build` | Successful static + Cloudflare bundle |
| Design compliance | Visual check | All colors/tokens match DESIGN.md |
| Content accuracy | Manual | No placeholder/fake data remains |
| Responsive | Manual | Mobile/tablet/desktop breakpoints work |
| Blog intact | Navigate to `/blog/` | Posts render, links work |
| About intact | Navigate to `/about/` | Page renders with new tokens |
| Animations guard | Test | Reduced motion = no animation, preloader lifecycle respected |
| Hash links | Click nav items | Smooth scroll to section, data-astro-reload present |

---

## File Inventory

### Create (3 new)
- `src/components/ExperienceSection.astro`
- `src/components/EducationSection.astro`
- `src/components/LeadershipSection.astro`

### Modify (8 existing)
- `src/layouts/Layout.astro` — `:root` tokens → DESIGN.md
- `src/components/Navbar.astro` — glass pill + all section links + mobile menu
- `src/components/HeroSection.astro` — photo + buttons + terminal card
- `src/components/SkillsSection.astro` — real content + glass cards
- `src/components/ProjectsSection.astro` — real project data
- `src/components/ContactSection.astro` — WhatsApp/Gmail CTA + footer
- `src/pages/index.astro` — data objects, section order
- `src/components/LoadingScreen.astro` — terminal text + responsive fixes

### Keep unchanged (14)
- `src/components/LatestPosts.astro`, `TideEffect.tsx`, `WaterShader.ts`, `ParallaxLayer.astro`, `RevealMask.astro`, `SplitText.astro`, `MagneticCursor.tsx`, `AudioController.tsx`, `BlogLayout.astro`, `blog.astro`, `[...slug].astro`, `about.astro`, `content.config.ts`, `src/content/blog/*`

---

## Approval Check — RESOLVED

1. Photo area in hero with initials fallback — ✅ **APPROVED**
2. WhatsApp (`+591 62642144`) + Gmail (`varor.joseroberto@gmail.com`) rapid contact buttons — ✅ **APPROVED**
3. Title: "Software Engineer" (user prefers over "Computer Engineer & UI/UX Designer") — ✅ **APPROVED**
4. All 11 experience roles included — ✅ **APPROVED**
5. LinkedIn URL: `https://www.linkedin.com/in/jroberto-vargas-orellana/` — ✅ **RESOLVED**
6. Project images: gradient/code-pattern placeholders — ✅ **APPROVED**
7. Hacklab BrickHeads: **Leadership section only** — ✅ **RESOLVED**

→ Plan approved. Proceeding to BUILD phase.
