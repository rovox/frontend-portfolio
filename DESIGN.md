---
name: Midnight Protocol
colors:
  surface: '#0d1515'
  surface-dim: '#0d1515'
  surface-bright: '#333b3b'
  surface-container-lowest: '#080f10'
  surface-container-low: '#151d1e'
  surface-container: '#192122'
  surface-container-high: '#232b2c'
  surface-container-highest: '#2e3637'
  on-surface: '#dce4e4'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#dce4e4'
  inverse-on-surface: '#2a3232'
  outline: '#849495'
  outline-variant: '#3a494b'
  surface-tint: '#00dbe7'
  primary: '#e1fdff'
  on-primary: '#00363a'
  primary-container: '#00f2ff'
  on-primary-container: '#006a71'
  inverse-primary: '#00696f'
  secondary: '#c3c6cf'
  on-secondary: '#2d3137'
  secondary-container: '#454950'
  on-secondary-container: '#b5b8c1'
  tertiary: '#f5f7ff'
  on-tertiary: '#213145'
  tertiary-container: '#ccdcf6'
  on-tertiary-container: '#516177'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#74f5ff'
  primary-fixed-dim: '#00dbe7'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#dfe2eb'
  secondary-fixed-dim: '#c3c6cf'
  on-secondary-fixed: '#181c22'
  on-secondary-fixed-variant: '#43474e'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#0d1515'
  on-background: '#dce4e4'
  surface-variant: '#2e3637'
typography:
  display:
    fontFamily: JetBrains Mono
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: JetBrains Mono
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  code:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
  headline-lg-mobile:
    fontFamily: JetBrains Mono
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.375rem
  DEFAULT: 0.625rem
  md: 0.625rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 80px
  parallax-bg-z: -10px
  parallax-mid-z: -5px
  parallax-fg-z: 0px
---

## Brand & Style

This design system establishes a **Cyberpunk-lite** aesthetic for a high-end developer portfolio and technical blog. It communicates technical mastery through a precision-oriented UI that balances the raw, "coded" feel of terminal environments with the polished sophistication of modern SaaS products.

The visual narrative is built on high contrast, using a deep midnight foundation to make neon accents "pop" as if they are self-illuminated. It leverages a **Hybrid-Modernism** style:
- **Atmospheric Depth:** Utilizing parallax layers to create a sense of vast digital space.
- **Precision Engineering:** Monospaced type and sharp geometric containers suggest a "built-from-scratch" developer ethos.
- **Subtle Glassmorphism:** Translucent surfaces with fine borders provide focus areas without breaking the atmospheric immersion of the dark theme.

## Colors

The palette is strictly dark-mode, designed for prolonged reading and high visual impact.

- **Primary (#00f2ff):** A neon cyan used for critical actions, active states, and code highlights. It represents energy and interactivity.
- **Secondary/Base (#0a0e14):** A rich, deep midnight navy that serves as the canvas for the entire experience.
- **Neutral/Slate (#64748b):** Used for secondary text and decorative borders to ensure the hierarchy remains clear without competing with the primary accent.
- **Accent Teal (#2dd4bf):** A softer variant of the primary used for hover states and secondary highlights to add tonal variety.

Visual depth is achieved through "Glow" tokens—low-opacity primary color spreads that simulate light bleed from digital interfaces.

## Typography

The typography system uses a functional split between **JetBrains Mono** and **Inter**.

- **JetBrains Mono** is the "voice" of the developer. It is used for all headings, labels, and UI controls. For Section Headers, it is paired with code-like syntax (e.g., `<Projects />`) to reinforce the developer identity.
- **Inter** handles the "heavy lifting" of the content. Its neutral, highly legible character makes long-form blog posts and project descriptions comfortable to read against a dark background.

Headlines should utilize slightly tighter letter-spacing for a modern feel, while uppercase labels benefit from expanded tracking to improve scannability.

## Layout & Spacing

The layout employs a **Fluid Grid** with generous vertical breathing room to allow individual projects and sections to command the user's full attention.

- **Grid Model:** 12-column desktop grid with a 1200px max-width container. 
- **Vertical Rhythm:** Large 160px sections gaps create a cinematic "scrolling" experience.
- **Parallax System:** 
    - **Background:** Deepest layer, containing slow-moving gradient meshes or star-fields.
    - **Midground:** Contains decorative "circuit" lines or faint code snippets that move at 50% scroll speed.
    - **Foreground:** The primary UI content layer.

For mobile, margins compress to 20px and sections gaps reduce to 80px. All monospaced headings should wrap naturally without losing their "tag" syntax.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Glassmorphism** rather than traditional drop shadows.

- **Level 0 (Base):** Midnight navy background.
- **Level 1 (Cards/Surface):** A slightly lighter navy (#111827) with a 1px border (#64748b at 20% opacity).
- **Level 2 (Glass):** Used for navigation bars and floating controls. Uses a backdrop-blur (12px) and a semi-transparent fill of the primary color at 5% opacity.
- **Glow Accents:** High-priority elements (like active primary buttons) feature a soft 20px cyan outer glow to simulate luminescence.

## Shapes

The shape language is **geometric and precise**. 

- **Corners:** Use "Soft" (0.625rem) rounding for standard buttons and input fields to maintain a modern, professional feel. Large project cards use `rounded-lg` (1rem). Tags and chips use `rounded-sm` (0.375rem). The softened scale avoids bubbly shapes while providing visible, friendly curvature suitable for Linear/Vercel-style interfaces.
- **Containers:** Large project cards use `rounded-lg` (1rem) to soften the technical edge.
- **Accents:** Use 45-degree chamfered corners on specific decorative elements (like section tags) to evoke a "military-tech" or "sci-fi" interface.

## Components

### Buttons
- **Primary:** Solid Cyan (#00f2ff) text on a transparent background with a 1px Cyan border. On hover, the button gains a subtle glow and the text shifts to White.
- **Ghost:** Slate text with no border. On hover, 1px slate border appears.

### Cards (Project/Blog)
- Surfaces use the Level 1 elevation.
- Borders are ultra-thin (1px) and low contrast.
- On hover, the border color transitions to the Primary Cyan and the background brightness increases by 5%.

### Navigation Bar
- A floating glassmorphic pill at the top of the screen.
- Active links are marked by a Primary Cyan underline or a leading `>` character in the monospaced font.

### Form Inputs
- Dark backgrounds with 1px slate borders.
- On focus, the border turns Primary Cyan and a faint glow is applied to the entire input field.
- Placeholder text uses the Code typography style in Slate.

### Chips/Tags
- Small, uppercase monospaced text.
- Contained in a border-only pill with 0.25rem rounding.
- Used for tech stack icons (React, Node, etc.).

## Dawn Protocol — Light Theme

A warm pastel light variant of Midnight Protocol. Maintains the same typography and spacing, inverts the surface scale, and adjusts the primary accent for legibility on light backgrounds.

### Light Palette
- **Background (#faf6f1):** Warm ivory — avoids clinical white.
- **Surface (#ffffff @ 65% opacity):** Light cards with subtle elevation instead of glassmorphism.
- **Text (#1e293b):** Dark slate. AAA contrast (13.6:1).
- **Muted (#5c6d80):** Medium slate. AA contrast (4.8:1).
- **Primary (#0c4a6e):** Dark cyan for text on light backgrounds.
- **Primary Container (#0e7490):** Darker cyan for borders, icons, and active states on light backgrounds. 4.6:1 contrast on #faf6f1 — AA compliant for text and UI components. Used where the dark-mode #00f2ff would lack sufficient contrast.
- **Accent Identity:** The neon #00f2ff is reserved for dark mode. Light mode uses a darker, more saturated cyan to preserve contrast while keeping the same hue family.