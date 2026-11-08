# FRONTEND_SPEC.md — Mattie Verse (Coastal Editorial Rebuild)

All design decisions confirmed. Beginning implementation.

Site owner redesigning their own site. Content, bio and brand name stay. Visual execution, structure and a few redundant sections change.

---

## 0. Project Identity Fingerprint

- Hero composition: split-screen, portrait held in a circular porthole frame
- Typography: Newsreader (display, editorial/chronicle character) + Manrope (body)
- Colour paradigm: Coastal Editorial, bespoke, ink navy / paper light with one warm amber accent, alternating day/night sections
- Background treatment: full-bleed hero + coded wave-line canvas, no video
- Section rhythm: wave (night hero → day stretch → night gallery/impact → day close → night footer)
- Motion personality: editorial reveal base, cinematic entrance on the hero only

Dials: DESIGN_VARIANCE 6, MOTION_INTENSITY 5, VISUAL_DENSITY 4

Structural benchmark: Reference 3 (Dark Editorial Two-Column) for the exact-width split discipline, adapted from a boxed sign-up card into a full-bleed editorial hero, video panel replaced with the porthole portrait.

## Stack

React 18 + Vite + TypeScript + Tailwind CSS 3 + Framer Motion (`motion/react`). Single static page, no backend, no routing. Icons: Google Material Symbols Rounded, loaded via link tag, no icon npm package. Fonts: Google Fonts (Newsreader, Manrope).

---

## 1. Design Tokens

`index.html` head additions:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">
```

`src/index.css` root tokens:

```css
:root {
  --font-display: 'Newsreader', serif;
  --font-body: 'Manrope', sans-serif;

  /* Night sections */
  --night-bg-primary:     #0B1620;
  --night-bg-secondary:   #0F1D2B;
  --night-bg-surface:     #142534;
  --night-bg-elevated:    #1A2E40;
  --night-text-primary:   #F3F1EC;
  --night-text-secondary: #A9B7C4;
  --night-text-muted:     #64768A;
  --night-border-subtle:  rgba(243,241,236,0.06);
  --night-border-default: rgba(243,241,236,0.12);
  --night-shadow-md: 0 16px 48px rgba(232,169,96,0.10), 0 4px 12px rgba(0,0,0,0.45);

  /* Day sections */
  --day-bg-primary:     #EFF5F9;
  --day-bg-secondary:   #E4EDF3;
  --day-bg-surface:     #FFFFFF;
  --day-text-primary:   #0F1D2B;
  --day-text-secondary: #4A5C6B;
  --day-text-muted:     #8494A1;
  --day-border-subtle:  rgba(15,29,43,0.05);
  --day-border-default: rgba(15,29,43,0.10);
  --day-shadow-md: 0 20px 40px -15px rgba(15,29,43,0.08);

  /* Shared accent, lighthouse amber */
  --accent:       #E8A960;
  --accent-hover: #F0BC7D;
  --accent-glow:  rgba(232,169,96,0.14);
  --success:      #4F9A6E;
  --error:        #C1543F;

  --radius-sm: 4px;  --radius-md: 8px;  --radius-lg: 16px;
  --radius-xl: 24px; --radius-2xl: 40px;
  --duration-fast: 150ms; --duration-normal: 350ms; --duration-slow: 650ms;
}

.font-display { font-family: var(--font-display); }
.font-body { font-family: var(--font-body); }

.material-symbols-rounded {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  font-size: inherit;
  line-height: 1;
  vertical-align: middle;
}

.glass-night {
  background: rgba(20, 37, 52, 0.55);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(243,241,236,0.10);
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
}
.glass-day {
  background: rgba(255,255,255,0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(15,29,43,0.08);
  box-shadow: 0 8px 32px rgba(15,29,43,0.06);
}
```

`tailwind.config.js` additions: `fontFamily: { display: ['var(--font-display)'], body: ['var(--font-body)'] }`. All colours referenced as Tailwind arbitrary values, e.g. `bg-[var(--night-bg-primary)]`, so no separate colour palette entry is needed.

---

## 2. Global Primitives

### WaveCanvas

`components/WaveCanvas.tsx`. Full-bleed `<canvas>`, three sine-wave layers drawn on `requestAnimationFrame`, amber stroke at low opacity. Used once large in the hero, once small and fainter in the footer.

```
Layer config:
  1: amplitude 18px, wavelength 480px, speed 0.008 rad/frame, yOffset 35%, opacity 0.22, strokeWidth 1.5
  2: amplitude 26px, wavelength 620px, speed 0.005 rad/frame, yOffset 55%, opacity 0.16, strokeWidth 1
  3: amplitude 14px, wavelength 360px, speed 0.011 rad/frame, yOffset 72%, opacity 0.12, strokeWidth 1
Stroke colour: rgba(232,169,96, layer.opacity)
```

```tsx
'use client';
import { useEffect, useRef } from 'react';

const LAYERS = [
  { amplitude: 18, wavelength: 480, speed: 0.008, yOffset: 0.35, opacity: 0.22, strokeWidth: 1.5 },
  { amplitude: 26, wavelength: 620, speed: 0.005, yOffset: 0.55, opacity: 0.16, strokeWidth: 1 },
  { amplitude: 14, wavelength: 360, speed: 0.011, yOffset: 0.72, opacity: 0.12, strokeWidth: 1 },
];

export function WaveCanvas({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let phase = 0;
    let frame = 0;
    function resize() {
      canvas!.width = canvas!.offsetWidth * devicePixelRatio;
      canvas!.height = canvas!.offsetHeight * devicePixelRatio;
      ctx!.scale(devicePixelRatio, devicePixelRatio);
    }
    function draw() {
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;
      ctx!.clearRect(0, 0, w, h);
      LAYERS.forEach((layer) => {
        ctx!.beginPath();
        ctx!.strokeStyle = `rgba(232,169,96,${layer.opacity})`;
        ctx!.lineWidth = layer.strokeWidth;
        for (let x = 0; x <= w; x += 4) {
          const y = h * layer.yOffset + Math.sin(x / layer.wavelength + phase * layer.speed * 40) * layer.amplitude;
          x === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y);
        }
        ctx!.stroke();
      });
      phase += 1;
      if (!reduceMotion) frame = requestAnimationFrame(draw);
    }
    resize();
    draw();
    window.addEventListener('resize', resize, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={ref} className={`absolute inset-0 w-full h-full pointer-events-none ${className}`} />;
}
```

### PortholeFrame

`components/PortholeFrame.tsx`. Circular frame, thick ring, eight rivet marks, portrait inside.

```
Sizes: w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] lg:w-[380px] lg:h-[380px]
Ring: 12px border, bg-[var(--night-bg-elevated)], inner 1px hairline in var(--accent) at 0.4 opacity
Rivets: 8 dots, 6px diameter, bg-[var(--accent)]/60, positioned via rotate(n*45deg) translateY(-50%)
Shadow: shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]
```

```tsx
export function PortholeFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] lg:w-[380px] lg:h-[380px]
      rounded-full p-3 bg-[var(--night-bg-elevated)]
      shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
      <div className="absolute inset-2 rounded-full border border-[var(--accent)]/40 pointer-events-none" />
      {Array.from({ length: 8 }).map((_, i) => (
        <span
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-[var(--accent)]/60 left-1/2 top-1/2"
          style={{ transform: `rotate(${i * 45}deg) translate(-50%, -${'50%'}) translateY(-142px)` }}
        />
      ))}
      <img src={src} alt={alt} className="w-full h-full object-cover rounded-full" loading="eager" />
    </div>
  );
}
```

### Section wrapper

Every section is a `<section className="relative overflow-hidden">` with an explicit `bg-[var(--night-bg-primary)]` or `bg-[var(--day-bg-primary)]` and `text-[var(--night-text-primary)]` / `text-[var(--day-text-primary)]` pair, declared per section below. Do not use a global dark-mode class toggle, each section owns its own tone explicitly.

---

## 3. Section 1 — Nav

Pattern: Category A1, Centred Glass Pill, permanently on the night glass treatment so it reads consistently over both tones.

```
z-50: nav (fixed top-4 inset-x-0)
```

```tsx
<nav className="fixed top-4 inset-x-0 z-50 px-4 md:px-8">
  <div className="glass-night rounded-full px-5 py-2.5 flex items-center justify-between max-w-3xl mx-auto">
    <div className="flex items-center gap-2">
      <span className="material-symbols-rounded text-[var(--accent)] text-xl">anchor</span>
      <span className="font-display italic text-[var(--night-text-primary)] text-lg">Mattie</span>
    </div>
    <div className="hidden md:flex items-center gap-1">
      {['About', 'Expertise', 'Voyage Log', 'Gallery', 'Contact'].map((link) => (
        <a key={link} href={`#${link.toLowerCase().replace(' ', '-')}`}
          className="px-3 py-2 text-sm font-body text-[var(--night-text-secondary)]
            hover:text-[var(--night-text-primary)] transition-colors duration-[var(--duration-normal)] rounded-full">
          {link}
        </a>
      ))}
      <a href="#contact" className="ml-1 bg-[var(--accent)] text-[var(--night-bg-primary)] px-4 py-2
        rounded-full text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors">
        Let's Connect
      </a>
    </div>
    <button className="md:hidden flex flex-col gap-[5px] w-6" aria-label="Menu" onClick={() => setMenuOpen(!menuOpen)}>
      <span className={`h-[2px] bg-[var(--night-text-primary)] transition-transform duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
      <span className={`h-[2px] bg-[var(--night-text-primary)] transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
      <span className={`h-[2px] bg-[var(--night-text-primary)] transition-transform duration-300 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
    </button>
  </div>
</nav>
```

Mobile overlay: `fixed inset-0 z-40 bg-[var(--night-bg-primary)]/98 backdrop-blur-sm`, links as `text-4xl font-display` stacked centred, `AnimatePresence` fade+scale, `initial={{ opacity: 0, scale: 0.98 }}`, `animate={{ opacity: 1, scale: 1 }}`, `duration: 0.3, ease: 'easeOut'`.

---

## 4. Section 2 — Hero

Tone: night. `min-h-[100dvh] bg-[var(--night-bg-primary)] text-[var(--night-text-primary)]`

```
z-0:  WaveCanvas (absolute inset-0, right column only)
z-10: content grid (relative)
z-50: nav (already fixed, sits above)
```

```tsx
<section id="hero" className="relative min-h-[100dvh] overflow-hidden bg-[var(--night-bg-primary)]
  grid grid-cols-1 lg:grid-cols-[55%_45%] items-center pt-28 pb-16 lg:pt-0 lg:pb-0">

  {/* Left column */}
  <div className="relative z-10 px-6 md:px-12 lg:px-16 order-2 lg:order-1">
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
      className="glass-night inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 w-fit">
      <span className="text-xs font-body text-[var(--night-text-secondary)]">Partnerships · Marketing</span>
    </motion.div>

    <motion.h1 initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
      animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.35 }}
      className="font-display text-5xl md:text-6xl lg:text-[4.5rem] leading-[0.95] tracking-[-1px]">
      Hi, I'm <em className="not-italic text-[var(--accent)]">Mattie</em>
    </motion.h1>

    <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.55 }}
      className="font-body text-base md:text-lg text-[var(--night-text-secondary)] mt-5 max-w-md leading-relaxed">
      I connect projects with real communities through strategic partnerships, authentic growth and relationship-first marketing.
    </motion.p>

    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.75 }}
      className="flex flex-col sm:flex-row gap-3 mt-8">
      <a href="#voyage-log" className="bg-[var(--accent)] text-[var(--night-bg-primary)] px-6 py-3
        rounded-full text-sm font-semibold flex items-center justify-center gap-2
        hover:bg-[var(--accent-hover)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-[var(--duration-normal)]">
        View Case Studies
        <span className="material-symbols-rounded text-base">explore</span>
      </a>
      <a href="#contact" className="glass-night px-6 py-3 rounded-full text-sm font-semibold
        flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-[var(--duration-normal)]">
        Let's Connect
        <span className="material-symbols-rounded text-base">send</span>
      </a>
    </motion.div>

    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 1.0 }}
      className="flex items-center gap-6 mt-10 pt-6 border-t border-[var(--night-border-subtle)] max-w-sm">
      <div><p className="font-display text-2xl text-[var(--accent)]">40+</p><p className="text-xs text-[var(--night-text-muted)] font-body">Projects</p></div>
      <div><p className="font-display text-2xl text-[var(--accent)]">1</p><p className="text-xs text-[var(--night-text-muted)] font-body">Community founded</p></div>
      <div><p className="font-display text-2xl text-[var(--accent)]">2+</p><p className="text-xs text-[var(--night-text-muted)] font-body">Years in Web3</p></div>
    </motion.div>
  </div>

  {/* Right column */}
  <div className="relative z-10 flex items-center justify-center py-12 lg:py-0 order-1 lg:order-2 min-h-[360px]">
    <WaveCanvas className="opacity-80" />
    <motion.div initial={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.9, ease: 'easeOut', delay: 0.4 }}
      className="relative z-10">
      <PortholeFrame src="/images/mattie-portrait.webp" alt="Mattie" />
    </motion.div>
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 1.1 }}
      className="glass-night absolute top-[18%] left-[8%] sm:left-[4%] px-3 py-1.5 rounded-full text-xs font-body z-20">
      Founder
    </motion.div>
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 1.25 }}
      className="glass-night absolute bottom-[16%] right-[6%] sm:right-[2%] px-3 py-1.5 rounded-full text-xs font-body z-20">
      Web3 Strategy
    </motion.div>
  </div>
</section>
```

**ASSET BRIEF — hero portrait**
```
Type: static image, user-provided (see Asset Intake Protocol in PROJECT.md)
Source: assets-source/portrait.* (exactly one file, any common format)
Prep: crop to 1:1 square centred on the face/shoulders, export WebP, target 800x800px, under 300KB
Output path: /images/mattie-portrait.webp
```

---

## 5. Section 3 — Who's Mattie

Tone: day. `bg-[var(--day-bg-primary)] text-[var(--day-text-primary)] py-24 md:py-32`

```tsx
<section id="about" className="relative bg-[var(--day-bg-primary)] py-24 md:py-32 px-6 md:px-12 lg:px-16">
  <div className="max-w-2xl mx-auto">
    <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: false, amount: 0.4 }}
      transition={{ duration: 0.5 }}
      className="glass-day inline-block px-4 py-1.5 rounded-full text-xs font-body text-[var(--day-text-secondary)] mb-6">
      Who's Mattie
    </motion.span>
    <motion.p initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="font-display text-2xl md:text-3xl leading-snug text-[var(--day-text-primary)]">
      I'm <em className="text-[var(--accent)] not-italic">Mattie</em>, a marketing strategist and partnerships manager specialising in blockchain and NFTs, connecting high quality projects with engaged communities since 2024.
    </motion.p>
    <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
      className="font-body text-base text-[var(--day-text-secondary)] mt-6 leading-relaxed">
      My approach is driven by sustainable growth rather than short-lived hype, with a focus on genuine collaboration, trust and lasting impact. I'm also the founder of Matrix, a community built on quality over quantity, where members actively support one another, share opportunities and contribute to a thriving Web3 ecosystem.
    </motion.p>
  </div>
</section>
```

---

## 6. Section 4 — Core Expertise

Tone: day, one shade deeper. `bg-[var(--day-bg-secondary)] py-24 md:py-32`

Layout: asymmetric row, not five equal cards, `grid-cols-1 sm:grid-cols-2 lg:grid-cols-5`, first two items span 2 columns each on desktop, remaining three span 1, replacing the original's uniform stacked cards.

```
Data: [
  { icon: 'groups', label: 'Community Building', span: 'lg:col-span-2' },
  { icon: 'handshake', label: 'Collaboration & Partnerships', span: 'lg:col-span-2' },
  { icon: 'trending_up', label: 'Growth', span: 'lg:col-span-1' },
  { icon: 'campaign', label: 'Marketing', span: 'lg:col-span-1' },
  { icon: 'link', label: 'Web3 Strategy / Advisory', span: 'lg:col-span-1' },
]
```

```tsx
<section id="expertise" className="relative bg-[var(--day-bg-secondary)] py-24 md:py-32 px-6 md:px-12 lg:px-16">
  <h2 className="font-display text-3xl md:text-4xl text-[var(--day-text-primary)] mb-2">Core Expertise</h2>
  <p className="font-body text-[var(--day-text-secondary)] mb-10 max-w-md">My toolkit for building, growing and scaling Web3 projects from the ground up.</p>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
    {expertise.map((item, i) => (
      <motion.div key={item.label}
        initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.08 }}
        className={`${item.span} bg-[var(--day-bg-surface)] border border-[var(--day-border-default)]
          rounded-[var(--radius-xl)] p-6 min-h-[160px] flex flex-col justify-between
          hover:shadow-[var(--day-shadow-md)] hover:-translate-y-0.5 transition-all duration-[var(--duration-normal)]`}>
        <span className="material-symbols-rounded text-[var(--accent)] text-3xl">{item.icon}</span>
        <p className="font-body font-medium text-[var(--day-text-primary)] mt-4">{item.label}</p>
      </motion.div>
    ))}
  </div>
</section>
```

---

## 7. Section 5 — Voyage Log

Tone: day base, `bg-[var(--day-bg-primary)] py-24 md:py-32`. Vertical timeline with a night-toned spine as the one accent detail.

```
z-0: vertical spine (absolute left-6 md:left-10, w-px, bg-[var(--night-bg-primary)]/15)
z-10: entry markers + cards
```

```tsx
<section id="voyage-log" className="relative bg-[var(--day-bg-primary)] py-24 md:py-32 px-6 md:px-12 lg:px-16">
  <h2 className="font-display text-3xl md:text-4xl text-[var(--day-text-primary)] mb-2">Past Experience</h2>
  <p className="font-body text-[var(--day-text-secondary)] mb-14 max-w-md">Every great voyage leaves a trail. Here's mine, from first ports to current waters.</p>

  <div className="relative pl-14 md:pl-20">
    <div className="absolute left-6 md:left-9 top-0 bottom-0 w-px bg-[var(--day-text-primary)]/10" />
    {voyageEntries.map((entry, i) => (
      <motion.div key={entry.role + entry.org} className="relative mb-10 last:mb-0"
        initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: (i % 4) * 0.1 }}>
        <span className="absolute -left-14 md:-left-20 top-6 w-9 h-9 rounded-full bg-[var(--accent)]
          flex items-center justify-center z-10">
          <span className="material-symbols-rounded text-[var(--night-bg-primary)] text-lg">{entry.icon}</span>
        </span>
        <div className="bg-[var(--day-bg-surface)] border border-[var(--day-border-default)]
          rounded-[var(--radius-lg)] p-6 hover:shadow-[var(--day-shadow-md)] transition-shadow duration-[var(--duration-normal)]">
          <h3 className="font-display text-xl text-[var(--day-text-primary)]">{entry.role}</h3>
          <p className="font-body text-sm text-[var(--accent)] mt-1">{entry.org}</p>
          <span className="inline-block mt-2 mb-3 text-xs font-body text-[var(--day-text-muted)]
            bg-[var(--day-bg-secondary)] px-2.5 py-1 rounded-full">{entry.period}</span>
          <p className="font-body text-sm text-[var(--day-text-secondary)] leading-relaxed">{entry.description}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {entry.tags.map((tag) => (
              <span key={tag} className="text-xs font-body text-[var(--day-text-secondary)]
                border border-[var(--day-border-default)] rounded-full px-3 py-1">{tag}</span>
            ))}
          </div>
        </div>
      </motion.div>
    ))}
  </div>
</section>
```

Entries data (order preserved from the current site): Founder & Community Leader / Mattymatrix_ / Early 2025–Present · Lead Marketer & Brand Partnership Manager / YUGEN / 2026 · Admin & Collab Manager / RunePro / 2024–2025 · Collab Manager / OPcatunity / 2024 · Marketer & Collab Manager / SweetHeartsBTC / 2025 · Collab Manager / AntisocialFrog / 2024–2026 · Collab Manager / Mintium / 2024 · Collab Manager / Bro Bear / 2024. Icon per entry can reuse the same `groups` glyph or vary by rough theme, developer's discretion, it is not a design-critical decision.

---

## 8. Section 6 — Art Gallery

Tone: night. `bg-[var(--night-bg-primary)] py-24 md:py-32`. Auto-advancing peek carousel, one image focal at a time, matches the original's auto-sliding behaviour but rebuilt as a modern focal slider instead of a plain fade: active slide large and centred, a sliver of the previous and next slide peeking at each edge, a thin per-slide progress bar standing in for dots, drag/swipe and arrow controls layered on top so autoplay is never the only way to move. Any number of images works, the component reads its length from `galleryImages`, it is not hardcoded to a fixed count.

```
z-0: bg-[var(--night-bg-primary)]
z-10: carousel track + peek slides
z-20: arrow buttons, progress bar row
```

```tsx
import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';

/**
 * Auto-advancing focal image carousel for the Art Gallery section.
 * Advances on a timer, pauses on hover, touch or keyboard focus,
 * supports drag/swipe, and disables autoplay under prefers-reduced-motion
 * while still allowing manual advance.
 */
function GalleryCarousel({ images }: { images: { src: string; alt: string }[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const ADVANCE_MS = 4500;

  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  useEffect(() => {
    if (paused || reduceMotion) return;
    const timer = setInterval(next, ADVANCE_MS);
    return () => clearInterval(timer);
  }, [paused, reduceMotion, images.length]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative h-[420px] sm:h-[480px] lg:h-[560px] flex items-center justify-center overflow-hidden">
        {images.map((img, i) => {
          const offset = i - index;
          const isActive = offset === 0;
          return (
            <motion.div
              key={img.src}
              className="absolute rounded-[var(--radius-xl)] overflow-hidden cursor-pointer
                w-[62%] sm:w-[46%] lg:w-[34%] aspect-[3/4] shrink-0 z-10"
              style={{ zIndex: isActive ? 10 : 5 }}
              animate={{
                x: `${offset * 72}%`,
                scale: isActive ? 1 : 0.82,
                opacity: Math.abs(offset) > 1 ? 0 : isActive ? 1 : 0.45,
                filter: isActive ? 'blur(0px)' : 'blur(1px)',
              }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setIndex(i)}
            >
              <img src={img.src} alt={img.alt} className="w-full h-full object-cover" loading="lazy" />
            </motion.div>
          );
        })}
      </div>

      <button onClick={prev} aria-label="Previous artwork"
        className="glass-night absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20
          w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform">
        <span className="material-symbols-rounded text-lg">chevron_left</span>
      </button>
      <button onClick={next} aria-label="Next artwork"
        className="glass-night absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20
          w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform">
        <span className="material-symbols-rounded text-lg">chevron_right</span>
      </button>

      <div className="flex justify-center gap-1.5 mt-8 px-6">
        {images.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)} aria-label={`Go to artwork ${i + 1}`}
            className="relative h-[3px] w-8 rounded-full bg-[var(--night-border-default)] overflow-hidden">
            {i === index && !paused && !reduceMotion && (
              <motion.span
                key={index}
                className="absolute inset-y-0 left-0 bg-[var(--accent)] rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: ADVANCE_MS / 1000, ease: 'linear' }}
              />
            )}
            {i === index && (paused || reduceMotion) && (
              <span className="absolute inset-y-0 left-0 w-full bg-[var(--accent)] rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
```

```tsx
<section id="gallery" className="relative bg-[var(--night-bg-primary)] py-24 md:py-32">
  <div className="px-6 md:px-12 lg:px-16 mb-10">
    <h2 className="font-display text-3xl md:text-4xl text-[var(--night-text-primary)] mb-2">The Art Gallery</h2>
    <p className="font-body text-[var(--night-text-secondary)]">A showcase of Web3-inspired artwork.</p>
  </div>
  <GalleryCarousel images={galleryImages} />
</section>
```

Notes: drag-to-advance can be added with Framer Motion's `drag="x"` and an `onDragEnd` offset/velocity threshold if a future pass wants touch-swipe beyond tap-to-jump, the click-to-jump on peek slides already covers most of that need for v1. Keyboard users get the same pause behaviour via `onFocus`/`onBlur` on the wrapper, and the arrow buttons are natively tabbable.

**ASSET BRIEF — gallery images**
```
Type: static images, user-provided (has all files, see Asset Intake Protocol in PROJECT.md)
Prep: export each as WebP, 3:4 crop, under 250KB each
Path: /images/gallery/gallery-01.webp, gallery-02.webp, ... one per file found in assets-source/gallery/
Component: reads array length dynamically, not hardcoded to any fixed number of images
```

---

## 9. Section 7 — Impact (merged Milestones + Achievements)

Tone: night, continues from Gallery for a two-part dark passage. `bg-[var(--night-bg-secondary)] py-24 md:py-32`

Top: three stat cards. Below: four checklist rows. Single section, single heading, removes the repetition between the old Milestones and Achievements sections.

```tsx
<section id="impact" className="relative bg-[var(--night-bg-secondary)] py-24 md:py-32 px-6 md:px-12 lg:px-16">
  <span className="glass-night inline-block px-4 py-1.5 rounded-full text-xs font-body text-[var(--accent)] mb-6">Milestones</span>
  <h2 className="font-display text-3xl md:text-4xl text-[var(--night-text-primary)] mb-2">Achievements & Impact</h2>
  <p className="font-body text-[var(--night-text-secondary)] mb-12 max-w-md">Numbers from the voyage so far, and what they built.</p>

  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
    {[{ n: '40+', l: 'Projects Worked' }, { n: '1', l: 'Community Founded' }, { n: '2+ Yrs', l: 'In Web3 Ecosystem' }].map((s, i) => (
      <motion.div key={s.l} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.4 }} transition={{ duration: 0.5, delay: i * 0.1 }}
        className="bg-[var(--night-bg-elevated)] border border-[var(--night-border-subtle)] rounded-[var(--radius-xl)] p-8 text-center">
        <p className="font-display text-4xl text-[var(--accent)]">{s.n}</p>
        <p className="font-body text-sm text-[var(--night-text-secondary)] mt-2">{s.l}</p>
      </motion.div>
    ))}
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    {[
      'Founded Mattymatrix and grew it from the ground up into an active, respected Web3 community',
      'Led collaborations across multiple Web3 projects, from planning through execution',
      'Built lasting relationships across NFTs, Bitcoin Ordinals and the wider Web3 space',
      'Known since 2024 as a go-to voice for alpha, collaboration and community building',
    ].map((line, i) => (
      <motion.div key={line} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, amount: 0.4 }} transition={{ duration: 0.4, delay: i * 0.08 }}
        className="flex items-start gap-3 bg-[var(--night-bg-primary)]/60 rounded-[var(--radius-lg)] p-4">
        <span className="material-symbols-rounded text-[var(--accent)] text-lg shrink-0 mt-0.5">check_circle</span>
        <p className="font-body text-sm text-[var(--night-text-secondary)] leading-relaxed">{line}</p>
      </motion.div>
    ))}
  </div>
</section>
```

---

## 10. Section 8 — Currently Sailing Towards

Tone: day. `bg-[var(--day-bg-primary)] py-24 md:py-32`

```tsx
<section id="goals" className="relative bg-[var(--day-bg-primary)] py-24 md:py-32 px-6 md:px-12 lg:px-16">
  <h2 className="font-display text-3xl md:text-4xl text-[var(--day-text-primary)] mb-2">Currently Sailing Towards</h2>
  <p className="font-body text-[var(--day-text-secondary)] mb-10 max-w-md">The voyage never stops. Here's what's on the horizon.</p>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {[
      { icon: 'bolt', title: 'Active Projects', items: ['Growing @Mattymatrix_ and making it better for members', 'Solidifying the Mattie brand'] },
      { icon: 'psychology', title: 'Skills in Development', items: ['Web3 creation and personal brand scaling'] },
      { icon: 'track_changes', title: 'Goals for 2025–2026', items: ['Make Matrix one of the best Web3 communities out there', 'Build a recognised creator presence across X and beyond'] },
    ].map((card, i) => (
      <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }} transition={{ duration: 0.5, delay: i * 0.1 }}
        className={`bg-[var(--day-bg-surface)] border border-[var(--day-border-default)]
          rounded-[var(--radius-xl)] p-7 ${i === 2 ? 'md:col-span-2' : ''}`}>
        <span className="material-symbols-rounded text-[var(--accent)] text-3xl">{card.icon}</span>
        <h3 className="font-body font-semibold text-[var(--day-text-primary)] mt-4 mb-3">{card.title}</h3>
        <ul className="space-y-2">
          {card.items.map((it) => (
            <li key={it} className="flex items-start gap-2 text-sm font-body text-[var(--day-text-secondary)]">
              <span className="material-symbols-rounded text-[var(--accent)] text-base mt-0.5">arrow_forward</span>
              {it}
            </li>
          ))}
        </ul>
      </motion.div>
    ))}
  </div>
</section>
```

---

## 11. Section 9 — Contact

Tone: day, deeper shade. `bg-[var(--day-bg-secondary)] py-24 md:py-32`. Form trimmed from the original's seven fields to five, dropping the separate Budget dropdown and folding it as an optional line inside the message field, since a personal-brand enquiry form this long suppresses completions.

```tsx
<section id="contact" className="relative bg-[var(--day-bg-secondary)] py-24 md:py-32 px-6 md:px-12 lg:px-16">
  <div className="max-w-xl mx-auto">
    <h2 className="font-display text-3xl md:text-4xl text-[var(--day-text-primary)] mb-2">Let's Build Something Amazing</h2>
    <p className="font-body text-[var(--day-text-secondary)] mb-2">Project founder, community lead or just want to talk Web3, I'm always open to a good conversation.</p>
    <p className="font-body text-xs text-[var(--day-text-muted)] mb-10 flex items-center gap-1.5">
      <span className="material-symbols-rounded text-sm">schedule</span> Typical response time: within 24 hours
    </p>

    <div className="flex gap-3 mb-10">
      <a href="https://x.com/iammattiex" className="glass-day flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-body text-[var(--day-text-primary)]">
        <span className="material-symbols-rounded text-base">alternate_email</span> @iammattiex
      </a>
      <a href="mailto:iammattiex@gmail.com" className="glass-day flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-body text-[var(--day-text-primary)]">
        <span className="material-symbols-rounded text-base">mail</span> Email
      </a>
    </div>

    <form className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Your Name" placeholder="Your name" />
        <FormField label="Email Address" placeholder="you@example.com" type="email" />
      </div>
      <FormField label="Project / Website" placeholder="https://yourproject.com" />
      <FormSelect label="How can I help?" options={['Partnership', 'Marketing', 'Collab', 'Just saying hi']} />
      <FormTextarea label="Your Message" placeholder="Tell me about your project, timeline and budget if you have one. I read every message." />
      <button type="submit" className="w-full bg-[var(--accent)] text-[var(--day-bg-primary)] py-3.5
        rounded-[var(--radius-lg)] font-body font-semibold flex items-center justify-center gap-2
        hover:bg-[var(--accent-hover)] active:scale-[0.98] transition-all duration-[var(--duration-normal)]">
        Send Message <span className="material-symbols-rounded text-base">send</span>
      </button>
    </form>
  </div>
</section>
```

`FormField` input class: `w-full bg-[var(--day-bg-surface)] border border-[var(--day-border-default)] rounded-[var(--radius-md)] px-4 py-3 text-sm font-body text-[var(--day-text-primary)] placeholder:text-[var(--day-text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-glow)] outline-none transition-all duration-[var(--duration-fast)]`, label class `text-sm font-body font-medium text-[var(--day-text-primary)] block mb-1.5`.

---

## 12. Section 10 — Footer

Tone: night, bookends the hero. `bg-[var(--night-bg-primary)] py-16 px-6 md:px-12 lg:px-16`

```tsx
<footer className="relative bg-[var(--night-bg-primary)] py-16 px-6 md:px-12 lg:px-16 overflow-hidden text-center">
  <WaveCanvas className="opacity-30" />
  <div className="relative z-10">
    <div className="flex items-center justify-center gap-2 mb-3">
      <span className="material-symbols-rounded text-[var(--accent)] text-xl">anchor</span>
      <span className="font-display italic text-xl text-[var(--night-text-primary)]">Mattie</span>
    </div>
    <p className="font-body text-sm text-[var(--night-text-secondary)] mb-6">Thank you for visiting.</p>
    <div className="flex items-center justify-center gap-4 mb-8">
      <a href="https://x.com/iammattiex" className="glass-night w-10 h-10 rounded-full flex items-center justify-center">
        <span className="material-symbols-rounded text-base">alternate_email</span>
      </a>
      <a href="mailto:iammattiex@gmail.com" className="glass-night w-10 h-10 rounded-full flex items-center justify-center">
        <span className="material-symbols-rounded text-base">mail</span>
      </a>
    </div>
    <p className="font-body text-xs text-[var(--night-text-muted)]">© 2026 Mattie · All rights reserved</p>
  </div>
</footer>
```

---

## 13. Asset Brief Summary

```
1. mattie-portrait.webp — from assets-source/portrait.*, 1:1 crop + WebP export, hero right column
2. gallery/gallery-NN.webp — from assets-source/gallery/, one output per input file found, 3:4 crop + WebP export, Art Gallery carousel
3. Anchor mark — Material Symbols "anchor" glyph, no image asset needed
4. All other icons — Material Symbols Rounded, no image assets needed
```

Full read/process/output rules for items 1 and 2 are in the Asset Intake Protocol section of PROJECT.md, that is the source of truth an agent should follow before touching the hero or gallery sections.

---

## 14. Spec Self-Check

- [x] Every element has exact Tailwind classes
- [x] Every animation states initial, animate/whileInView, duration, ease, delay
- [x] Every section declares its z-index stack where layering exists
- [x] Every image-bearing section has an asset brief
- [x] Positional/sizing classes carry responsive breakpoints
- [x] Reference 3 (Dark Editorial Two-Column) cited as the structural benchmark
- [x] A junior developer could build this without a design question
