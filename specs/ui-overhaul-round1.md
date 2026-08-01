# UI Overhaul — Round 1

**Status:** DRAFT — awaiting approval before implementation
**Scope:** 11 user-requested changes + opportunistic fixes
**Out of scope:** splash screen, TideEffect, blog stubs, Google Fonts debt, cursor system scaffold
**Author:** design-overser (spec only — no code)
**Token authority:** `DESIGN.md` (Midnight Protocol dark + Dawn Protocol light). All colors/typography derive from `:root` tokens in `src/layouts/Layout.astro`.

---

## (a) Summary table

| # | Change | Files touched |
|---|---|---|
| 1 | Remove LanguageToggle | `Navbar.astro`, `Layout.astro`, `LanguageToggle.tsx` (delete), `utils/i18n.ts` (delete) |
| 2 | Remove WhatsApp | `HeroSection.astro`, `ContactSection.astro`, `index.astro`, `config.ts` |
| 3 | Formspree contact form (greenfield) | `ContactSection.astro`, `config.ts` (new `FORMSPREE_ENDPOINT`), `Layout.astro` (form CSS) |
| 4 | Replace hero Gmail/WhatsApp icons with single "Contáctame" CTA; remove Gmail social icon; unify LinkedIn URL | `HeroSection.astro`, `ContactSection.astro`, `index.astro`, `config.ts` |
| 5 | Reorder sections: Experience → Projects → Skills; re-anchor GSAP triggers | `index.astro`, `HeroSection.astro` (script), `Navbar.astro` (navLinks) |
| 6 | Style Live/Colab links as buttons | `ProjectsSection.astro` |
| 7 | Remove PRO/UNI badges; fix filter by prepending `type` to `data-tags` | `ExperienceSection.astro` |
| 8 | Consolidate hash-scroll handler (fix "Work" link) | `Navbar.astro` (script), `Layout.astro` (script) |
| 9 | Section titles/subtitles legibility | `Layout.astro` (global `.section-title`, `.section-note`) |
| 10 | Leadership images — commented TODO scaffold | `LeadershipSection.astro`, `content.config.ts` |
| 11 | Branding: avatar + "rovox" wordmark lockup | `Navbar.astro` |
| O1 | Fix missing semicolon in `.btn-icon` | `HeroSection.astro` (CSS) — moot after point 4 removes `.btn-icon` |
| O2 | Remove dead `.btn-icon` CSS + `socialLinks` Gmail/WhatsApp lookup logic | `HeroSection.astro`, `ContactSection.astro`, `index.astro` |

---

## (b) Per-component edit specs

### 1. Remove LanguageToggle

**Decision: DELETE both `LanguageToggle.tsx` and `utils/i18n.ts`.**
Justification: AGENTS.md already documents `i18n.ts` as a "dormant scaffold imported nowhere." Dormant code is dead code — it drifts, confuses future agents, and has zero test coverage. If i18n is ever needed, git history preserves it. A single commented line in `AGENTS.md` under "Removed features" is sufficient provenance.

**Edits:**
- `src/components/Navbar.astro`:
  - Line 3: delete `import LanguageToggle from './LanguageToggle.tsx';`
  - Line 47: delete `<LanguageToggle client:only="react" />`
  - Line 82: delete `<LanguageToggle client:only="react" />`
  - Lines 486–519: delete entire `.lang-toggle` / `.lang-toggle-flag` / `.lang-toggle-label` CSS block.
- `src/layouts/Layout.astro`:
  - Lines 44–46: delete the `data-lang` init block inside the inline `<script is:inline>` (keep the theme init intact).
  - Lines 694–703: delete the `[data-theme="light"] .lang-toggle` and `.lang-toggle:hover` overrides.
- Delete files: `src/components/LanguageToggle.tsx`, `src/utils/i18n.ts`.
- Update `AGENTS.md`: remove any LanguageToggle references; add a "Removed features" note.

### 2. Remove WhatsApp

**Edits:**
- `src/config.ts`: delete `export const WHATSAPP_URL = 'https://wa.me/59162642144';` (line 13).
- `src/pages/index.astro`: delete the WhatsApp entry from `socialLinks` (lines 39).
- `src/components/HeroSection.astro`: delete the WhatsApp `<a>` block (lines 45–57).
- `src/components/ContactSection.astro`:
  - Lines 16–18: delete the `whatsappLink` lookup.
  - Lines 53–63: delete the WhatsApp CTA render block.

### 3. Formspree contact form (greenfield)

**Design decisions:**
- **No JS library.** Plain `<form action={FORMSPREE_ENDPOINT} method="POST">`. Works with static prerender + Cloudflare workerd because Formspree handles the POST server-side and returns a redirect (303) to a thank-you page or the same page with `?submitted=true`.
- **Endpoint centralized.** `FORMSPEE_ENDPOINT` constant in `src/config.ts` (AGENTS.md requires external URLs centralized there). Value: `'https://formspree.io/f/XXXXXXXX'` (placeholder — user provides real ID later). Implementation must `console.warn` if the placeholder is used at build time? No — Astro is static; just leave the placeholder and document that the user must replace it before deploy.
- **Honeypot anti-spam:** include `<input type="text" name="_gotcha" style="display:none" tabindex="-1" autoComplete="off">` — Formspree honors this convention.
- **Redirect after submit:** add `<input type="hidden" name="_next" value="/#contact?submitted=1" />` so the user returns to the portfolio with a success state.
- **Success state:** on page load, if `window.location.hash === '#contact'` and `URLSearchParams.get('submitted') === '1'`, show a success banner inside the form card and clear the query param via `history.replaceState`. This is a small inline script in `ContactSection.astro` (no React island needed).

**Markup (inside `ContactSection.astro`, replacing the `.cta-buttons` block):**

```astro
<form
  class="contact-form"
  action={FORMSPEE_ENDPOINT}
  method="POST"
  novalidate
>
  <div class="form-field">
    <label for="contact-name">Name</label>
    <input type="text" id="contact-name" name="name" autocomplete="name" />
  </div>

  <div class="form-field">
    <label for="contact-email">
      Email <span class="required-mark" aria-hidden="true">*</span>
    </label>
    <input
      type="email"
      id="contact-email"
      name="email"
      required
      autocomplete="email"
      aria-required="true"
    />
  </div>

  <div class="form-field">
    <label for="contact-message">
      Message <span class="required-mark" aria-hidden="true">*</span>
    </label>
    <textarea
      id="contact-message"
      name="message"
      required
      rows="5"
      aria-required="true"
    ></textarea>
  </div>

  <!-- Honeypot -->
  <input type="text" name="_gotcha" style="display:none" tabindex="-1" autoComplete="off" />
  <input type="hidden" name="_next" value="/#contact?submitted=1" />

  <p class="form-privacy">
    Your data is sent securely via Formspree. No tracking, no analytics.
  </p>

  <button type="submit" class="btn btn-primary contact-submit">
    Send message
  </button>
</form>

<p class="form-success" hidden>
  ✓ Message sent. I'll get back to you soon.
</p>
```

**CSS tokens (in `ContactSection.astro` `<style>`, new block):**

```css
.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 520px;
  margin: 0.5rem auto 0;
  text-align: left;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-field label {
  font-family: var(--font-mono);
  font-size: var(--fs-label);
  font-weight: 600;
  color: var(--text);
  letter-spacing: 0.04em;
}

.required-mark {
  color: var(--primary-container);
  margin-left: 0.15em;
}

.form-field input,
.form-field textarea {
  font-family: var(--font-body);
  font-size: var(--fs-body-md);
  color: var(--text);
  background: var(--surface-container-low);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  padding: 0.65rem 0.85rem;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  width: 100%;
  resize: vertical;
}

.form-field textarea {
  font-family: var(--font-mono); /* designer choice: mono for message — "terminal" feel */
  line-height: 1.5;
}

.form-field input:focus,
.form-field textarea:focus {
  outline: none;
  border-color: var(--primary-container);
  box-shadow: 0 0 0 3px rgba(0, 242, 255, 0.12);
}

.form-field input::placeholder,
.form-field textarea::placeholder {
  color: var(--muted);
  opacity: 0.7;
}

.form-privacy {
  font-family: var(--font-body);
  font-size: var(--fs-code);
  color: var(--muted);
  margin: 0;
  line-height: 1.5;
}

.contact-submit {
  align-self: flex-start;
  margin-top: 0.25rem;
  padding: 0.75rem 1.5rem;
  font-family: var(--font-mono);
  letter-spacing: 0.04em;
}

.form-success {
  font-family: var(--font-mono);
  color: var(--primary-container);
  font-size: var(--fs-body-md);
  margin-top: 1rem;
  text-align: center;
}
```

**Light theme overrides (in `Layout.astro` Dawn Protocol block or scoped in `ContactSection.astro`):**

```css
[data-theme="light"] .form-field input,
[data-theme="light"] .form-field textarea {
  background: #ffffff;
  border-color: var(--outline-variant);
  color: var(--text);
}

[data-theme="light"] .form-field input:focus,
[data-theme="light"] .form-field textarea:focus {
  border-color: var(--primary-container);
  box-shadow: 0 0 0 3px rgba(14, 116, 144, 0.15);
}
```

**A11y checklist:**
- Every input has an explicit `<label for="...">` (WCAG 1.3.1).
- Required fields marked visually (`*` in `--primary-container`) AND programmatically (`required` + `aria-required="true"`).
- Focus ring uses `--primary-container` with 3px glow — exceeds WCAG 2.4.7 minimum.
- Contrast: `--text` on `--surface-container-low` (dark: `#dce4e4` on `#151d1e` ≈ 12.5:1 AAA; light: `#172033` on `#ffffff` ≈ 16:1 AAA). Label color `--text` same. Helper text `--muted` on dark surface ≈ 8.5:1 AA; on light ≈ 5.7:1 AA.
- `novalidate` on form so browser native validation UI doesn't conflict with Formspree's flow — actually, REMOVE `novalidate`; let the browser enforce `required`/`type="email"` for free a11y. Formspree re-validates server-side.
- Reduced motion: focus transitions already use `--transition-fast` which is fine; no animation beyond existing token transitions.

**`src/config.ts` addition:**
```ts
/** Formspree contact form endpoint — replace XXXXXXXX with real form ID before deploy. */
export const FORMSPREE_ENDPOINT = 'https://formspree.io/f/XXXXXXXX';
```

### 4. Hero CTA + Contact social row

**Hero (`HeroSection.astro` lines 44–77):**
- **Delete** both icon-button `<a>`s (WhatsApp lines 45–57, Gmail lines 58–68).
- **Add** a single primary CTA:
  ```astro
  <a href="/#contact" class="btn btn-primary hero-cta-contact">
    Contact me
  </a>
  ```
- Keep the existing "Download CV" ghost button.
- New `.hero-actions` layout: `[Contáctame (primary)] [Download CV (ghost)]`.
- **Hash-scroll interception:** the existing `handleHashLinkClick` in `Navbar.astro` only binds `.nav-link` and `.nav-overlay-link`. The new hero CTA also needs interception. Two options:
  - (A) Add a shared utility `scrollToHash(hash)` in `src/utils/scroll.ts` and call it from both navbar and hero.
  - (B) Use event delegation on `document.body` for any `a[href^="/#"]`.
  - **Recommendation: (B)** — single delegation point, future-proof. Refactor `Navbar.astro`'s `handleHashLinkClick` into a delegated listener on `document` (still inside `defineModule('navbar', …)`). This also fixes point 8.
- CSS: `.hero-cta-contact` uses existing `.btn .btn-primary` pattern — no new CSS needed. Just ensure it sits in `.hero-actions` flex row.

**ContactSection social row (lines 67–80):**
- **Delete** the Gmail icon link (lines 77–79). The form is now the contact path.
- **Keep** GitHub, LinkedIn, Medium.
- **Fix LinkedIn URL inconsistency:** `ContactSection.astro` line 71 uses `https://linkedin.com/in/rovox` while `index.astro` line 37 uses `https://www.linkedin.com/in/jroberto-vargas-orellana/`. **Decision: use the centralized `LINKEDIN_URL` from `config.ts`** (which is the full, correct URL). Pass it via props or import directly in `ContactSection.astro`.
  - Cleanest: import `LINKEDIN_URL`, `GITHUB_URL`, `MEDIUM_URL` from `../config` directly in `ContactSection.astro` and drop the hardcoded hrefs. The `socialLinks` prop becomes unnecessary — but to minimize churn, keep the prop for now and just fix the LinkedIn value in `index.astro` line 37 to match `LINKEDIN_URL`. Actually, the `socialLinks` prop is only used for the Gmail/WhatsApp lookups which are being removed. **Decision: delete the `socialLinks` prop entirely** from `ContactSection.astro` and `index.astro`. Hardcode the three remaining social icons using the centralized config imports. This eliminates the inconsistency class forever.

**`index.astro`:**
- Delete `socialLinks` array (lines 33–41).
- Change `<ContactSection socialLinks={socialLinks} />` → `<ContactSection />`.
- Remove `ContactSection` props interface.

### 5. Reorder sections

**`src/pages/index.astro` lines 46–49:**
- Current: `<HeroSection />`, `<SkillsSection />`, `<ExperienceSection />`, `<ProjectsSection />`.
- New: `<HeroSection />`, `<ExperienceSection />`, `<ProjectsSection />`, `<SkillsSection />`.

**CASCADE — `HeroSection.astro` GSAP triggers (lines 240–272):**
- `endTrigger: '#skills'` (line 252) → change to `'#experience'`.
- `trigger: '#skills'` in fade scrub (line 265) → change to `'#experience'`.
- Rationale: after reorder, `#experience` is the section immediately following the hero. The terminal pin must release before `#experience` enters, and the fade must scrub against `#experience`'s approach.

**CASCADE — `Navbar.astro` navLinks (lines 8–15):**
- Current order: Work, Skills, Experience, Education, Contact.
- New order: **Experience, Work, Skills, Education, Contact**.
  ```ts
  const navLinks = [
    { href: '/#experience', label: 'Experience' },
    { href: '/#work', label: 'Work' },
    { href: '/#skills', label: 'Skills' },
    { href: '/#education', label: 'Education' },
    { href: '/#contact', label: 'Contact' },
  ];
  ```

**Verify no other `#skills` anchors break:**
- `SkillsSection.astro` line 65: `trigger: '#skills'` — this is internal to the skills section's own entrance animation. It still works because `#skills` still exists as an id, just later in the page. ✅ No change needed.
- `TideEffect`: grep shows no `#skills` reference. ✅
- `ScrollProgressBar`, `ScrollInactivityHint`: no hash references. ✅

### 6. Demo links as buttons

**`ProjectsSection.astro` lines 77–82 (Live) and 66–69 (Colab):**
- **Decision: Live and Colab become primary buttons; GitHub and Blog remain subtle icon-links.**
- Justification: "Live" and "Colab" are the primary action (see the thing running). GitHub/Blog are secondary references (see the code / read the writeup). This mirrors Linear/Vercel card conventions.

**Markup change (Live link):**
```astro
{project.data.liveUrl && (
  <a href={project.data.liveUrl} target="_blank" rel="noopener noreferrer" class="btn btn-primary project-btn">
    <img src="/icons/external-link-svgrepo-com.svg" alt="" width="14" height="14" loading="lazy" />
    Live
  </a>
)}
```

**Same pattern for Colab** (use Colab icon, label "Colab").

**CSS (in `ProjectsSection.astro` `<style>`):**
```css
.project-btn {
  padding: 0.4rem 0.85rem;
  font-family: var(--font-mono);
  font-size: var(--fs-code);
  font-weight: 600;
  border-radius: var(--radius-full);
  letter-spacing: 0.02em;
  gap: 0.4rem;
}

.project-btn:hover {
  box-shadow: 0 0 14px rgba(0, 242, 255, 0.25);
}

[data-theme="light"] .project-btn:hover {
  box-shadow: 0 0 14px rgba(14, 116, 144, 0.18);
}

.project-btn img {
  width: 14px;
  height: 14px;
}

[data-theme="dark"] .project-btn img {
  filter: invert(1);
}
[data-theme="light"] .project-btn img {
  filter: none;
}
```

**Existing `.project-link-icon` (GitHub/Blog):** keep as-is — subtle mono icon+text links.

### 7. PRO/UNI badges + filter fix

**Remove badges (`ExperienceSection.astro` lines 30–32):**
- Delete the `<span class="exp-type-badge">…</span>` element.
- Delete the `.exp-type-badge` CSS block (lines 129–140).
- Simplify `.exp-card-top`: it now only contains the period. Change to just render the period directly without the flex wrapper, OR keep the wrapper for future extensibility. **Decision: keep `.exp-card-top` wrapper but remove `justify-content: space-between`** — period now sits alone left-aligned.

**Fix filter (the real bug):**
- Current: `<article data-tags={exp.data.tags.join(' ')}>` — only technology tags.
- Chip `data-filter="professional"` does `tags.includes('professional')` → never matches → hides everything.
- **Fix:** prepend the type to `data-tags`:
  ```astro
  data-tags={`${exp.data.type} ${exp.data.tags.join(' ')}`}
  ```
- Now chip "Professional" matches articles with `data-tags="professional React Node …"`. ✅

**Optional chip label clarity:**
- Current: "Professional" / "University".
- **Recommendation: keep as-is.** They're clear enough in context. Renaming to "Work" / "Academic" is a marginal improvement not worth the churn.

### 8. Navbar "Work" link — consolidate hash-scroll

**Root cause analysis:**
Two handlers coexist:
1. `Navbar.astro` `handleHashLinkClick` (lines 174–196) — element-level `click` listener on `.nav-link[href^="/#"]`.
2. `Layout.astro` `scrollToHash` (lines 110–125) — `astro:page-load` + `DOMContentLoaded` listener that reads `window.location.hash`.

The navbar handler calls `e.preventDefault()` so the URL never changes; the Layout handler only fires on page load / hash change. They shouldn't race — but the user reports "Work" broken. Likely causes:
- (a) Lenis not ready when clicked (handler falls back to `scrollIntoView` + `scrollBy(-80)` which is janky).
- (b) The `/#work` href is parsed correctly, but `document.querySelector('#work')` returns null if the Projects section hasn't rendered its `id="work"` yet (unlikely on static page, but possible during SPA nav).
- (c) User perception: after reorder (point 5), the nav order now matches page order, which may resolve the perceived brokenness.

**Spec:**
- **Keep ONE delegation point.** Move hash-scroll logic into a shared utility `src/utils/scroll.ts`:
  ```ts
  export function scrollToHash(hash: string) {
    if (!hash || !hash.startsWith('#')) return;
    const target = document.querySelector(hash);
    if (!target) return;
    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(target, { offset: -80 });
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.scrollBy(0, -80);
    }
  }
  ```
- **Navbar:** replace element-level listeners with a single delegated `click` on `document` for `a[href^="/#"]`. Call `scrollToHash(href.slice(1))` after `e.preventDefault()`. This covers hero CTA (point 4), navbar links, and any future hash links.
- **Layout.astro:** keep the `astro:page-load` + `DOMContentLoaded` listeners for initial page load (e.g., user arrives at `/#contact`), but have them call the same `scrollToHash`.
- **Offset:** consistent `-80` (accounts for fixed navbar height 70px + 10px breathing room). Verify `section[id] { scroll-margin-top: 90px; }` in `Layout.astro` line 338 — this is for native anchor scrolling; Lenis `offset: -80` is separate. Both should coexist harmlessly.

**Acceptance:** manual verification of ALL nav hash links (Experience, Work, Skills, Education, Contact) + hero "Contáctame" in dev server, both themes, with and without Lenis ready.

### 9. Section titles/subtitles legibility

**Current state:**
- `.section-title` (Layout.astro lines 354–359): inherits `--text` (dark `#dce4e4`, light `#172033`). Font: `--font-display` (Jersey 10 Charted pixel font).
- `.section-note` (lines 361–366): `color: var(--muted)` (dark `#b9cacb`, light `#516274`).

**User request:** section-note should use cyan accent instead of muted.

**Spec:**
- `.section-note`: change `color: var(--muted)` → `color: var(--primary-container)`.
  - Dark: `#00f2ff` on `#0d1515` background → contrast ≈ 12.8:1 (AAA). ✅
  - Light: `#0e7490` on `#faf6f1` background → contrast ≈ 4.6:1 (AA for large text; section-note is `--fs-code` = 0.875rem ≈ 14px, which at normal weight is "small text" requiring 4.5:1 — 4.6:1 passes AA). ✅
  - **However:** `--font-display` (Jersey 10 Charted) is a pixel/decorative font at small size. Legibility concern is the font, not the color. **Recommendation: switch `.section-note` to `--font-mono` (JetBrains Mono) for body readability at small size**, keeping the cyan color. This aligns with DESIGN.md's "monospaced type … for UI controls" and the existing `// comment` syntax which is code-like.
  - Final: `.section-note { color: var(--primary-container); font-family: var(--font-mono); }`.

- `.section-title`: evaluate legibility.
  - Current: `--font-display` (Jersey 10 Charted) at `--fs-headline-lg` (clamp 1.75rem–2rem). Color: inherits `--text`.
  - The pixel font is a brand choice; user didn't ask to change it. **Recommendation: keep the font, but explicitly set `color: var(--primary)`** (dark `#e1fdff`, light `#0c4a6e`) for stronger presence against the section background.
  - Dark: `#e1fdff` on `#0d1515` ≈ 15.5:1 AAA. ✅
  - Light: `#0c4a6e` on `#faf6f1` ≈ 9.3:1 AAA. ✅
  - Add `letter-spacing: -0.01em` for tighter modern feel (matches DESIGN.md "slightly tighter letter-spacing").
  - Final: `.section-title { color: var(--primary); letter-spacing: -0.01em; }` (additive; keep existing font-family/size).

**Note:** `.section-title--scanner` variant (ProjectsSection) and `.hero-name` share the `.section-title` class. The color change will propagate to `.hero-name` — but `.hero-name` already overrides `color: var(--primary)` (HeroSection.astro line 426), so no regression. ✅

**Light theme:** no additional overrides needed — `--primary` and `--primary-container` are already theme-aware.

### 10. Leadership images — commented TODO scaffold

**Decision: add `image: z.string().optional()` to the leadership schema NOW.** It's a safe, forward-compatible change — validates existing entries (which lack `image`), and allows future entries to include it.

**`src/content.config.ts` lines 72–80:**
```ts
const leadership = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/leadership' }),
  schema: z.object({
    role: z.string(),
    organization: z.string(),
    year: z.string(),
    image: z.string().optional(), // TODO: event photos — see LeadershipSection.astro
    order: z.number(),
  }),
});
```

**`src/components/LeadershipSection.astro` lines 24–33 — add commented block:**
```astro
<article class="leadership-item glass-card card-glow">
  {/* TODO: add images of these events — uncomment when leadership entries have `image` field populated.
      Expected markup:
      {item.data.image && (
        <figure class="leadership-figure">
          <img
            src={item.data.image}
            alt={`${item.data.role} at ${item.data.organization}`}
            class="leadership-img"
            loading="lazy"
            decoding="async"
          />
        </figure>
      )}
      Suggested CSS:
      .leadership-figure { margin: 0 0 1rem; }
      .leadership-img {
        width: 100%;
        aspect-ratio: 16 / 9;
        object-fit: cover;
        border-radius: var(--radius-md);
        border: 1px solid var(--border);
      }
  */}
  <h3 class="role">{item.data.role}</h3>
  …
</article>
```

**Do NOT** add real images or uncomment the block. This is purely preparatory.

### 11. Branding — avatar + wordmark lockup

**Decision: `[avatar circle] rovox` with `title="portfolio rovox.exe"` on the link.**
Justification:
- The user mentioned "portfolio rovox.exe" but that string is too long for a navbar lockup (especially mobile). Using it as a `title` tooltip preserves the intent without cluttering the UI.
- "rovox" is the established GitHub handle and brand. Short, memorable, mono-friendly.
- The circular GitHub avatar (`https://github.com/rovox.png`) is a recognizable identity marker and matches the cyberpunk-lite aesthetic (profile-as-logo is common in dev portfolios — see leerob, dan-abramov).
- Desktop + mobile overlay both use the same lockup for consistency.

**Markup (`Navbar.astro` line 31, replacing `<a class="nav-logo">…</a>`):**
```astro
<a href="/" class="nav-logo" aria-label="Homepage" title="portfolio rovox.exe">
  <img
    src="https://github.com/rovox.png"
    alt=""
    class="nav-logo-avatar"
    width="32"
    height="32"
    loading="eager"
    decoding="async"
  />
  <span class="nav-logo-wordmark">rovox</span>
</a>
```

**Mobile overlay (line 65):** same lockup, possibly larger avatar (36px).
```astro
<a href="/" class="nav-overlay-logo" aria-label="Homepage" title="portfolio rovox.exe">
  <img src="https://github.com/rovox.png" alt="" class="nav-logo-avatar nav-logo-avatar--lg" width="36" height="36" loading="eager" decoding="async" />
  <span class="nav-logo-wordmark">rovox</span>
</a>
```

**CSS (in `Navbar.astro` `<style>`, replacing existing `.nav-logo` rules):**
```css
.nav-logo,
.nav-overlay-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  transition: opacity var(--transition-fast);
}

.nav-logo:hover,
.nav-overlay-logo:hover {
  opacity: 0.85;
}

.nav-logo-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid var(--primary-container);
  flex-shrink: 0;
  background: var(--surface-container-high);
}

.nav-logo-avatar--lg {
  width: 36px;
  height: 36px;
}

.nav-logo-wordmark {
  font-family: var(--font-mono);
  font-size: var(--fs-headline-md);
  font-weight: 700;
  color: var(--primary);
  letter-spacing: 0.02em;
  white-space: nowrap;
}
```

**Light/dark border behavior:**
- Dark: avatar border `--primary-container` (`#00f2ff`) — neon ring on dark bg. ✅
- Light: avatar border `--primary-container` (`#0e7490`) — darker cyan ring on light bg. ✅
- Navbar itself stays dark in light mode (per existing `Layout.astro` line 596–598), so the avatar/border colors remain the dark-mode palette inside the navbar regardless of theme. **No additional light-mode overrides needed for the logo.**

**Delete:** existing `.nav-logo` and `.nav-overlay-logo` CSS rules (lines 239–252, 387–393) — replaced by the new rules above.

---

## Opportunistic fixes

### O1. Missing semicolon in `.btn-icon`
- `HeroSection.astro` line 476: `background: rgba(80, 82, 200, 1)` missing `;` → invalidates the following `border` declaration.
- **Moot after point 4** — `.btn-icon` CSS is deleted entirely (no longer used).

### O2. Dead code cleanup
- **`.btn-icon` CSS** (HeroSection.astro lines 468–491 + light-mode overrides lines 667–679): delete after point 4 removes usage.
- **`socialLinks` prop + lookup logic** in `ContactSection.astro`: delete per point 4 decision to drop the prop.
- **`socialLinks` array** in `index.astro`: delete per point 4.

---

## (c) Design decisions for ambiguities

| Point | Ambiguity | Decision | Justification |
|---|---|---|---|
| 1 | Keep `i18n.ts` dormant or delete? | **Delete** | Dormant code is dead code; git history preserves it. |
| 3 | Form library vs plain HTML? | **Plain HTML + Formspree** | No backend needed; works with static prerender + workerd; zero JS bundle cost. |
| 4 | Hero CTA: one button or two? | **Single "Contáctame"** | User explicitly said "replace with a single primary CTA button." |
| 4 | Keep `socialLinks` prop? | **Delete it** | Only used for Gmail/WhatsApp lookups which are being removed. Hardcode remaining 3 icons from config. |
| 4 | LinkedIn URL: which one? | **Centralized `LINKEDIN_URL` from config** | Single source of truth; eliminates inconsistency class. |
| 6 | GitHub/Blog as buttons too? | **No — keep as icon-links** | Live/Colab are primary actions; GitHub/Blog are secondary references. Visual hierarchy. |
| 7 | Rename chip labels? | **Keep "Professional" / "University"** | Clear enough; renaming is marginal churn. |
| 8 | Which hash-scroll handler to keep? | **Both, but unified via shared `scrollToHash` utility** | Navbar handler for clicks; Layout handler for initial page load. Same underlying function. |
| 9 | Change `.section-title` font? | **Keep Jersey 10 Charted; change color to `--primary`** | Font is a brand choice; user only flagged legibility, which color fixes. |
| 9 | Change `.section-note` font? | **Yes — switch to `--font-mono`** | Pixel font at 0.875rem is illegible; mono matches the `// comment` syntax aesthetic. |
| 10 | Add real images now? | **No — commented TODO only** | User explicitly said "prepare only." |
| 10 | Add `image` field to schema? | **Yes — `z.string().optional()`** | Safe, forward-compatible, validates existing entries. |
| 11 | Lockup text: "rovox" or "rovox.exe"? | **"rovox" with `title="portfolio rovox.exe"`** | "rovox.exe" too long for navbar; tooltip preserves intent. |
| 11 | Avatar source? | **`https://github.com/rovox.png`** | User specified; GitHub avatar URL is stable and recognizable. |

---

## (d) Acceptance criteria checklist

### Functional
- [ ] LanguageToggle removed from navbar (desktop + mobile); no JS errors in console.
- [ ] WhatsApp removed from hero, contact section, config, and socialLinks.
- [ ] Contact form submits to Formspree endpoint; honeypot present; success state shows after redirect.
- [ ] Hero "Contáctame" scrolls smoothly to `#contact` (with Lenis and without).
- [ ] Section order: Hero → Experience → Projects → Skills → Education → Leadership → Contact.
- [ ] Terminal pin journey releases before `#experience` (not `#skills`).
- [ ] Nav order matches page order: Experience, Work, Skills, Education, Contact.
- [ ] Live/Colab links render as pill buttons; GitHub/Blog remain icon-links.
- [ ] Experience filter chips (All / Professional / University) correctly filter cards.
- [ ] PRO/UNI badges removed from experience cards.
- [ ] All nav hash links work (manual verification in dev server, both themes, with/without Lenis).
- [ ] Hero CTA "Contáctame" scrolls to contact.
- [ ] Section subtitles use cyan accent (`--primary-container`) + mono font.
- [ ] Section titles use `--primary` color.
- [ ] Leadership section has commented TODO block; schema accepts optional `image`.
- [ ] Navbar logo shows avatar circle + "rovox" wordmark; tooltip "portfolio rovox.exe".

### Accessibility
- [ ] Form labels explicitly associated (`for`/`id`).
- [ ] Required fields marked visually + programmatically.
- [ ] Focus ring visible on all inputs (3px glow `--primary-container`).
- [ ] Contrast AA in both themes: section-note cyan on section bg; form labels; form inputs.
- [ ] Skip link still works.
- [ ] `prefers-reduced-motion`: no new animations introduced; existing transitions respected.

### Themes
- [ ] Dark mode: all new elements use dark palette tokens.
- [ ] Light mode: form inputs, buttons, avatar border, section titles/notes all have correct light overrides.
- [ ] Navbar logo: avatar border uses `--primary-container` (dark: `#00f2ff`, light: `#0e7490`); navbar itself stays dark in light mode (existing behavior).

### Performance
- [ ] No new React islands (form is plain HTML in `.astro`).
- [ ] Avatar image: 32x32px, `loading="eager"` (above fold), GitHub CDN serves optimized PNG.
- [ ] Form CSS is scoped to `ContactSection.astro` (no global bloat).

### Cleanup
- [ ] `.btn-icon` CSS removed (no longer used).
- [ ] `socialLinks` prop removed from `ContactSection`.
- [ ] `LanguageToggle.tsx` and `utils/i18n.ts` deleted.
- [ ] `WHATSAPP_URL` removed from `config.ts`.

---

## (e) Explicit out-of-scope list

- **Splash screen** (`LoadingScreen.astro`, FSM, WCAG 2.3.3 exception) — do not touch.
- **TideEffect** (bidirectional fade, R3F canvas) — do not touch.
- **Blog stubs** (`blog.astro`, `blogs/[...slug].astro`, `LatestPosts.astro`) — remain disabled per `specs/bugfix-a11y-splash-round1.md`.
- **Google Fonts issue** (known debt: Jersey 10 Charted + IBM Plex Sans loaded from Google Fonts despite AGENTS.md "fonts are self-hosted" rule) — out of scope; separate cleanup task.
- **Cursor system scaffold** (`src/utils/cursor/cursor-system.ts`) — unused; do not instantiate.
- **GSAP defaults / ScrollTrigger registration** — do not change `utils/gsap-config.ts`.
- **Lenis initialization** — do not change config, only add `scrollToHash` utility that calls `window.lenis.scrollTo`.
- **Content collections schemas** (except leadership `image` field addition) — do not modify.
- **Cloudflare Workers config** (`wrangler.jsonc`, `astro.config.mjs`) — do not touch.
- **Any new npm dependencies** — this spec uses zero new packages.

---

## Implementation order (recommended)

1. **Foundation:** config.ts (add `FORMSPREE_ENDPOINT`, remove `WHATSAPP_URL`), delete `LanguageToggle.tsx` + `i18n.ts`.
2. **Navbar:** remove LanguageToggle, update navLinks order, refactor hash-scroll to delegation, rebrand logo.
3. **Hero:** remove WhatsApp/Gmail icons, add "Contáctame" CTA, update GSAP triggers (`#skills` → `#experience`), delete `.btn-icon` CSS.
4. **Sections reorder:** `index.astro` (Experience → Projects → Skills), delete `socialLinks` prop.
5. **Experience:** remove badges, fix `data-tags` to prepend type.
6. **Projects:** style Live/Colab as buttons.
7. **Contact:** add Formspree form, remove Gmail/WhatsApp CTAs, hardcode social icons from config, add success state script.
8. **Global styles:** `.section-title` + `.section-note` legibility, Dawn Protocol form overrides.
9. **Leadership:** schema field + commented TODO.
10. **Layout.astro:** remove `data-lang` init, remove `.lang-toggle` light overrides, add `scrollToHash` utility.
11. **Acceptance:** manual verification per checklist above.
