/**
 * Site-wide GSAP micro-interactions.
 *
 * Everything is registered through gsap.matchMedia() so that:
 *  - pointer effects (magnetic, tilt, cursor) only run on fine pointers,
 *  - nothing animates under prefers-reduced-motion,
 *  - mm.revert() fully cleans up on Astro view-transition swaps.
 *
 * Only transform/opacity are animated; quickTo() avoids per-event tween allocation.
 */
import { gsap, ScrollTrigger } from '../utils/gsap-config';
import { defineModule } from '../utils/lifecycle';

const MOTION_OK = '(prefers-reduced-motion: no-preference)';
const FINE_POINTER = '(prefers-reduced-motion: no-preference) and (pointer: fine)';

type Cleanup = () => void;

function on(
  el: EventTarget,
  type: string,
  fn: (e: any) => void,
  opts?: AddEventListenerOptions,
): Cleanup {
  el.addEventListener(type, fn, opts);
  return () => el.removeEventListener(type, fn, opts);
}

/* ── 1. Magnetic buttons ─────────────────────────────────────────────── */
function magnetic(): Cleanup {
  const cleanups: Cleanup[] = [];
  document.querySelectorAll<HTMLElement>('.btn, .cta-social-link, [data-magnetic]').forEach((el) => {
    el.classList.add('fx-magnetic');
    const strength = Number(el.dataset.magnetic) || 0.35;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    cleanups.push(
      on(el, 'pointermove', (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      }),
      on(el, 'pointerleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
      }),
      () => el.classList.remove('fx-magnetic'),
    );
  });
  return () => cleanups.forEach((c) => c());
}

/* ── 2. Card tilt + cursor spotlight ─────────────────────────────────── */
function tilt(): Cleanup {
  const cleanups: Cleanup[] = [];
  document.querySelectorAll<HTMLElement>('.card-glow').forEach((card) => {
    card.classList.add('fx-tilt');
    gsap.set(card, { transformPerspective: 900 });
    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    cleanups.push(
      on(card, 'pointermove', (e: PointerEvent) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry((px - 0.5) * 10);
        rx((0.5 - py) * 8);
        card.style.setProperty('--mx', `${px * 100}%`);
        card.style.setProperty('--my', `${py * 100}%`);
      }),
      on(card, 'pointerleave', () => {
        rx(0);
        ry(0);
      }),
      () => {
        card.classList.remove('fx-tilt');
        card.style.removeProperty('--mx');
        card.style.removeProperty('--my');
      },
    );
  });
  return () => cleanups.forEach((c) => c());
}

/* ── 3. Custom cursor (decorative; native cursor stays visible) ──────── */
function cursor(): Cleanup {
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  const label = document.createElement('span');
  dot.className = 'fx-cursor-dot';
  ring.className = 'fx-cursor-ring';
  label.className = 'fx-cursor-label';
  dot.setAttribute('aria-hidden', 'true');
  ring.setAttribute('aria-hidden', 'true');
  ring.appendChild(label);
  document.body.append(dot, ring);

  gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 });
  const dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' });

  let visible = false;
  const move = (e: PointerEvent) => {
    if (!visible) {
      visible = true;
      gsap.to([dot, ring], { opacity: 1, duration: 0.3 });
    }
    dx(e.clientX);
    dy(e.clientY);
    rx(e.clientX);
    ry(e.clientY);
  };

  const over = (e: PointerEvent) => {
    const t = e.target as HTMLElement | null;
    const hit = t?.closest<HTMLElement>('[data-cursor], .project-card, .carousel-track, a, button');
    let text = '';
    let scale = 1;
    if (hit) {
      if (hit.dataset.cursor) text = hit.dataset.cursor;
      else if (hit.classList.contains('project-card')) text = 'View';
      else if (hit.classList.contains('carousel-track')) text = 'Drag';
      scale = text ? 2.6 : 1.6;
    }
    label.textContent = text;
    gsap.to(ring, { scale, duration: 0.35, ease: 'power3.out', overwrite: 'auto' });
    gsap.to(label, { opacity: text ? 1 : 0, duration: 0.2 });
  };

  const leave = () => {
    visible = false;
    gsap.to([dot, ring], { opacity: 0, duration: 0.3 });
  };

  const cleanups = [
    on(window, 'pointermove', move, { passive: true }),
    on(document, 'pointerover', over, { passive: true }),
    on(document.documentElement, 'pointerleave', leave),
  ];
  return () => {
    cleanups.forEach((c) => c());
    dot.remove();
    ring.remove();
  };
}

/* ── 4. Section-title scramble (once per title, on enter) ────────────── */
const GLYPHS = '!<>-_\\/[]{}=+*^?#01';
function scramble(): Cleanup {
  const triggers: ScrollTrigger[] = [];
  const restore: Cleanup[] = [];
  document.querySelectorAll<HTMLElement>('.section-title').forEach((title) => {
    const node = [...title.childNodes].find(
      (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim().length > 0,
    ) as Text | undefined;
    if (!node) return;
    const finalText = node.textContent ?? '';
    if (!title.hasAttribute('aria-label')) title.setAttribute('aria-label', finalText.trim());
    restore.push(() => {
      node.textContent = finalText;
    });
    triggers.push(
      ScrollTrigger.create({
        trigger: title,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          const state = { p: 0 };
          gsap.to(state, {
            p: 1,
            duration: 0.9,
            ease: 'none',
            onUpdate: () => {
              const reveal = Math.floor(state.p * finalText.length);
              let out = '';
              for (let i = 0; i < finalText.length; i++) {
                const ch = finalText[i];
                out += i < reveal || /\s/.test(ch) ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
              }
              node.textContent = out;
            },
            onComplete: () => {
              node.textContent = finalText;
            },
          });
        },
      }),
    );
  });
  return () => {
    triggers.forEach((t) => t.kill());
    restore.forEach((r) => r());
  };
}

/* ── 5. Animated counters ([data-count]) ─────────────────────────────── */
function counters(): Cleanup {
  const triggers: ScrollTrigger[] = [];
  const els = document.querySelectorAll<HTMLElement>('[data-count]');
  els.forEach((el) => {
    const target = Number(el.dataset.count);
    if (!Number.isFinite(target)) return;
    const suffix = el.dataset.suffix ?? '';
    const obj = { v: 0 };
    el.textContent = `0${suffix}`;
    triggers.push(
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: () =>
          gsap.to(obj, {
            v: target,
            duration: 1.6,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = `${Math.round(obj.v)}${suffix}`;
            },
          }),
      }),
    );
  });
  return () => {
    triggers.forEach((t) => t.kill());
    els.forEach((el) => {
      el.textContent = `${el.dataset.count}${el.dataset.suffix ?? ''}`;
    });
  };
}

/* ── 6. Velocity-reactive marquee ([data-marquee]) ───────────────────── */
function marquee(): Cleanup {
  const cleanups: Cleanup[] = [];
  document.querySelectorAll<HTMLElement>('[data-marquee]').forEach((root) => {
    const track = root.querySelector<HTMLElement>('.marquee-track');
    if (!track) return;
    const reverse = root.dataset.marquee === 'reverse';
    // The track renders its item list twice, so looping over 50% is seamless.
    const loop = gsap.fromTo(
      track,
      { xPercent: reverse ? -50 : 0 },
      { xPercent: reverse ? 0 : -50, duration: 40, ease: 'none', repeat: -1 },
    );
    let base = 1;
    const skewTo = gsap.quickTo(track, 'skewX', { duration: 0.4, ease: 'power3.out' });
    let settleId = 0;
    const st = ScrollTrigger.create({
      trigger: root,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
      onUpdate: (self) => {
        const v = gsap.utils.clamp(-3000, 3000, self.getVelocity());
        gsap.to(loop, { timeScale: base + Math.abs(v) / 500, duration: 0.3, overwrite: true });
        skewTo(-v / 600);
        window.clearTimeout(settleId);
        settleId = window.setTimeout(() => {
          skewTo(0);
          gsap.to(loop, { timeScale: base, duration: 0.8, overwrite: true });
        }, 150);
      },
    });
    const setBase = (b: number) => {
      base = b;
      gsap.to(loop, { timeScale: base, duration: 0.6, overwrite: true });
    };
    cleanups.push(
      on(root, 'pointerenter', () => setBase(0.15)),
      on(root, 'pointerleave', () => setBase(1)),
      () => {
        window.clearTimeout(settleId);
        st.kill();
        loop.kill();
        gsap.set(track, { clearProps: 'transform' });
      },
    );
  });
  return () => cleanups.forEach((c) => c());
}

/* ── 7. Staggered 3D reveal ([data-reveal] > [data-reveal-item]) ─────── */
function reveals(): Cleanup {
  const triggers: ScrollTrigger[] = [];
  const all: HTMLElement[] = [];
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((group) => {
    const items = [...group.querySelectorAll<HTMLElement>('[data-reveal-item]')];
    if (!items.length) return;
    // Only hide content that is still below the fold — never blank out what's on screen.
    if (group.getBoundingClientRect().top < window.innerHeight * 0.85) return;
    all.push(...items);
    gsap.set(items, { opacity: 0, y: 40, rotationX: -12, transformPerspective: 800 });
    triggers.push(
      ScrollTrigger.create({
        trigger: group,
        start: 'top 85%',
        once: true,
        onEnter: () =>
          gsap.to(items, {
            opacity: 1,
            y: 0,
            rotationX: 0,
            stagger: 0.08,
            duration: 0.9,
            ease: 'power3.out',
            overwrite: 'auto',
          }),
      }),
    );
  });
  return () => {
    triggers.forEach((t) => t.kill());
    gsap.set(all, { opacity: 1, y: 0, rotationX: 0 });
  };
}

/* ── 8. CV download feedback + live-region toast ─────────────────────── */
function cvDownload(): Cleanup {
  const toast = document.createElement('div');
  toast.className = 'fx-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);
  gsap.set(toast, { autoAlpha: 0 });

  const handler = (e: Event) => {
    const link = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>('[data-cv-download]');
    if (!link) return;
    toast.textContent = 'Downloading CV…';
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(toast, { autoAlpha: 1 });
      gsap.delayedCall(2.5, () => gsap.set(toast, { autoAlpha: 0 }));
      return;
    }
    gsap
      .timeline()
      .fromTo(link, { scale: 1 }, { scale: 0.92, duration: 0.1, yoyo: true, repeat: 1, ease: 'power2.inOut' })
      .fromTo(toast, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'back.out(2)' }, 0)
      .to(toast, { autoAlpha: 0, y: 24, duration: 0.4, ease: 'power2.in' }, 2.6);
  };
  const off = on(document, 'click', handler);
  return () => {
    off();
    toast.remove();
  };
}

defineModule('interactions', () => {
  const mm = gsap.matchMedia();
  const offCv = cvDownload();

  mm.add(FINE_POINTER, () => {
    const cleanups = [magnetic(), tilt(), cursor()];
    return () => cleanups.forEach((c) => c());
  });

  mm.add(MOTION_OK, () => {
    const cleanups = [scramble(), counters(), marquee(), reveals()];
    ScrollTrigger.refresh();
    return () => cleanups.forEach((c) => c());
  });

  // Layout shifts after init (images, fonts, hero pin spacers created on preloader:done)
  // leave trigger start positions stale; refresh once things settle.
  const timers: number[] = [];
  const refresh = () => {
    // Twice: once soon, once after the hero has built its pins.
    timers.push(window.setTimeout(() => ScrollTrigger.refresh(), 150));
    timers.push(window.setTimeout(() => ScrollTrigger.refresh(), 1500));
  };
  window.addEventListener('load', refresh, { once: true });
  window.addEventListener('preloader:done', refresh);
  document.fonts?.ready.then(refresh);

  return () => {
    timers.forEach((t) => window.clearTimeout(t));
    window.removeEventListener('preloader:done', refresh);
    window.removeEventListener('load', refresh);
    offCv();
    mm.revert();
  };
});
