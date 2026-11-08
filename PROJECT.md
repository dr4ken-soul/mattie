# PROJECT.md — Mattie Verse Rebuild

## What this is

A personal portfolio and marketing site for Mattie, a Web3 partnerships manager and marketing strategist. Redesign of an existing live site (iammattiex.com), same owner, same content and brand name, new visual execution under the Coastal Editorial direction. Static, single page, no backend, no accounts, no payments.

## Stack

React 18, Vite, TypeScript, Tailwind CSS 3, Framer Motion (`motion/react`). Icons from Google Material Symbols Rounded via CDN link, no icon package installed. Fonts from Google Fonts: Newsreader (display) and Manrope (body).

## Folder structure

```
src/
  components/
    Nav.tsx
    WaveCanvas.tsx
    PortholeFrame.tsx
    FormField.tsx
  sections/
    Hero.tsx
    About.tsx
    Expertise.tsx
    VoyageLog.tsx
    Gallery.tsx
    Impact.tsx
    Goals.tsx
    Contact.tsx
    Footer.tsx
  data/
    voyageEntries.ts
    galleryImages.ts
  index.css
  App.tsx
public/
  images/
    mattie-portrait.webp
    gallery/
assets-source/
  portrait.*
  gallery/
```

`assets-source/` sits at the project root, outside `src` and `public`. It is where the raw, unprocessed image files go. Treat it as read-only input, nothing in the build should delete from it. See Asset Intake Protocol below.

## Section order

Nav, Hero, Who's Mattie, Core Expertise, Voyage Log, Art Gallery, Impact, Currently Sailing Towards, Contact, Footer. Full exact classes, animation values and copy for each in `FRONTEND_SPEC.md`.

## What changed from the original, and why

- Milestones and Achievements merged into one Impact section, the two said largely the same thing back to back.
- The colourful mixed icon pack (star, compass, handshake, megaphone, etc.) replaced with Material Symbols throughout, one consistent icon language instead of several.
- The floating decorative badges around the hero avatar dropped in favour of two small tag chips (Founder, Web3 Strategy), same idea, less clutter.
- Contact form trimmed from seven fields to five, the separate Budget dropdown folded into the message field as an optional line.
- Hero switched from centred to split-screen with the portrait in a circular porthole frame, so the first screen carries a real content hierarchy instead of a stacked badge-then-headline layout.
- Anchor mark now the Material Symbols "anchor" glyph in the accent colour rather than a sourced or generated image, resolved this way since Material Symbols already has one built in.
- Art Gallery kept its auto-advancing behaviour from the original but rebuilt as a focal peek carousel: one image large and centred, a sliver of the next and previous peeking at the edges, a thin progress bar per image instead of dots, pauses on hover, touch or keyboard focus, tap any peeking image to jump to it. Full spec in `FRONTEND_SPEC.md` Section 8.

Everything else, the Voyage Log entries, the bio, the goals, the socials, carried over as-is.

## Asset Intake Protocol

Read this before building the Hero or Art Gallery sections. Place raw files in `assets-source/` before starting, the build reads from there and writes finished files to `public/images/`.

**Portrait**
1. Look in `assets-source/portrait.*`, there should be exactly one file, any common format (jpg, png, heic, webp).
2. Crop to a 1:1 square centred on the face and shoulders.
3. Export as WebP, 800x800px, target under 300KB.
4. Save to `public/images/mattie-portrait.webp`. This exact path is what `Hero.tsx` references, do not rename it.

**Gallery**
1. Look in `assets-source/gallery/`, there can be any number of files, any filenames, any common format.
2. Sort them alphabetically by original filename, that becomes the display order.
3. For each one, crop to 3:4, export as WebP, target under 250KB.
4. Save sequentially to `public/images/gallery/gallery-01.webp`, `gallery-02.webp`, and so on, one output file per input file found. Do not assume a fixed count, use however many are actually present in the folder.
5. Generate or update `src/data/galleryImages.ts` to export an array with exactly one entry per processed file, in the same order:
   ```ts
   export const galleryImages = [
     { src: '/images/gallery/gallery-01.webp', alt: 'Mattie Verse artwork 01' },
     { src: '/images/gallery/gallery-02.webp', alt: 'Mattie Verse artwork 02' },
     // one entry per file actually found in assets-source/gallery/
   ];
   ```
6. `GalleryCarousel` in the Art Gallery section reads this array's length dynamically, so no component code needs to change no matter how many images end up in the folder.

If `assets-source/` is empty when the build runs, use a solid `bg-[var(--night-bg-elevated)]` placeholder in the same aspect ratio rather than blocking the rest of the build, and note in the console which files are still missing.

## Code conventions

camelCase for all JavaScript and TypeScript identifiers. JSDoc comment on every function, including components, describing what it does and its props.

## Build order

1. Tailwind config, `index.css` tokens, fonts, Material Symbols link
2. Run the Asset Intake Protocol against `assets-source/`, populate `public/images/` and `galleryImages.ts`
3. `WaveCanvas`, `PortholeFrame`, `Nav`
4. Hero, then the remaining sections top to bottom, including `GalleryCarousel`
5. Contact form logic
6. Responsive pass on all breakpoints

## Status

Design gates 1–7 confirmed, FRONTEND_SPEC.md complete. Ready to build once you give the go-ahead.


## Writing Rules, apply to all copy, labels, code comments, JSDoc, README and the deck

- British English throughout
- No em dashes anywhere, in any file, in any string, in any comment. Use commas or full stops
- No banned AI filler: elevate, seamless, unleash, unlock, next-gen, empower, revolutionise, transform, cutting-edge, state-of-the-art, supercharge, discover, leverage, streamline
- No empty aspirational subheadings of the "the future of X" or "X made simple" shape
- No "not just X, it's Y" constructions, and no "X theatre" phrasings
- No placeholder data. No John Doe, no Acme Inc, no 99.9%. Every name, number and log line in the spec is final and believable
- Button labels are verb plus object. Link text stands alone out of context
- One CTA intent on the page, one label, three placements. That label is "Start a run"
- Maximum two eyebrows across the whole landing page, hero and integration, and they are already allocated