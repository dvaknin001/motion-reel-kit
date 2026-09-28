# Style authoring guide

A **style** is one reusable motion-graphics piece (5–9 s) in its own folder under `styles/<style-id>/`.
Its choreography, easing, camera and sound design live in code; its **content** (words, numbers, lists,
colours) lives in JSON **params**. A new video for a new niche is a new params file, not new code.

The bar: a senior motion designer at a top YouTube channel would ship it. Every piece is judged on
composition, typography, easing and timing, detail, sound sync and factual accuracy.

## Folder layout

```
styles/<style-id>/
  style.js            the style: Reel.style({ id, seed, name, niches, defaults, build(S, P) })
  README.md           the style card (see styles/_template/README.md)
  poster.jpg          default params at the poster time (node tools/render.mjs frame <id> <poster> --out styles/<id>/poster.jpg)
  examples/
    <niche>.json      params for another niche (only the keys that change; arrays replace wholesale)
    <niche>.jpg       its poster frame
```

Style ids read `<niche>-<technique>` (e.g. `finance-growth-curve`). `seed` keeps the seeded random
layout of a renamed style identical (it defaults to the id).

## The style definition

```js
Reel.style({
  id: 'finance-growth-curve', seed: 'finance', order: 2,
  name: 'Growth Curve',                                   // human name for the catalog
  transIn: { type: 'whip', dur: 0.45, dir: 1 },            // the cut into this piece that new-reel.mjs uses
  niches: { primary: ['Personal finance', 'Investing'], similar: ['Crypto', 'Business growth', 'Fitness progress'] },
  duration: 8, poster: 7.6, bg: '#050E09', palette: ['#3DF28B', '#FFC94A', '#0B2016'],
  // page / catalog copy (a reel item or params.meta can override any of these)
  niche: 'Personal Finance', title: 'The Compound Curve', why: '…', techniques: ['…', '…', '…'], facts: '…',
  defaults: {                                             // EVERY piece of content, JSON only
    eyebrow: 'COMPOUND INTEREST', headline: '$500 a month. 30 years.',
    monthly: 500, rate: 0.10, years: 30,
    colors: { accent: '#3DF28B', gold: '#FFC94A' },
  },
  build(S, P) { /* read content from P, never hard-code it here */ },
});
```

`S.P` is the same merged params object as `P`; `S.meta` holds the merged niche/title/why/facts and
`S.palette` the palette (params can override `palette`, `bg` and `meta`).

### Params rules
1. **Defaults reproduce the showcase exactly.** `node tools/regress.mjs check <id>` must pass.
2. **JSON only**: strings, numbers, booleans, arrays, plain objects. No functions, no DOM.
3. **Content, not choreography.** Params carry words, numbers, lists, colours, and toggles. Timings stay in
   code unless a list length drives them (then derive timings from the list, keeping the showcase rhythm).
4. **Robust to new content.** Text that can change length must fit its box (measure and scale down, or
   wrap to a documented max lines). Lists document their supported range (e.g. 3–6 rows) and clamp.
   Numbers get formatted by the style (thousands separators, currency, units from params).
5. **Facts travel with content.** If params change real-world numbers, `meta.facts` must change too.
6. Name keys for what they are on screen (`headline`, `rows[].label`), group related ones, keep them flat
   enough to edit by hand.

## Determinism (hard rules — the renderer seeks to arbitrary times)
1. Everything visual is driven by `S.tl` tweens or `S.onFrame((t) => …)` hooks (t = style-local seconds).
   Frame hooks are pure functions of `t` and tween-driven state.
2. Never use `Math.random`, `Date`, `performance.now`, `setTimeout`, `setInterval`, `requestAnimationFrame`,
   CSS `animation`/`transition`, `<animate>`, or `tl.call()`/`onComplete` for visuals. Use `S.rand()` /
   `S.rnd(a,b)` (seeded) at build time and `S.noise(x, seed)` in frame hooks.
3. For each element+property only the FIRST tween may be `from()`/`fromTo()`; later ones must be `to()`.
4. Changing numbers: `S.count(el, {from,to,t,dur,ease,prefix,suffix,decimals})`. Typewriter: `S.type(el, text, {t, cps, caret, sfx})`.
5. The timeline must not run past `duration`. SVG ids must be unique: `S.uid('name')`. If the content decides the
   length (a longer script, fewer bodies), set `S.dur` in build and, if needed, `S.poster`. The defaults must keep the
   declared `duration`, and a poster past the end is pulled back to `dur − 0.4` automatically.
6. Avoid shadows/filters on elements animated over heavy text-shadow outlines (Chrome can composite a dark
   band into the text); prefer plain shapes or borders there.

## Stage, layers, camera
- 1920×1080. `S.root` clips; inside it `S.shaker` → `S.cam` (camera world, default parent) and `S.hud`
  (screen space). `S.fx` sits on top for `S.grain()` / `S.vignette()`.
- Camera: `S.camSet({x,y,z,r})`, `S.camTo(t, {x,y,z,r}, dur, ease)`. A slow push or drift in every style.
- Title-safe: keep text ≥ 96 px from edges; min text ~22 px; primary text 56 px+ (phones).
- Transparent overlays: when `S.alpha` is true, skip full-frame backgrounds (`render.mjs video <id> --alpha`).

## Sound
`S.sfx(t, name, {gain, pitch, dur, pan, wet})`. Names: whoosh swoosh pop click tick blip type ding bell
impact thud boom braam bass stamp drum heartbeat riser drone pad wind thunder paper scratch shutter ratchet
cash shimmer glitch ping buzzer crt chord coin levelup tone. Every visible event gets a sound; a low bed
(drone/pad ≤ 0.12) under the whole style; ≤ 3 sounds at one instant; hits exactly on the impact frame.
See docs/SOUND.md.

## Retention notes
4–6 `S.beat(t, 'note')` per style: the editing decision in plain words, ≤ 70 characters. They appear on the
portfolio timeline.

## QA loop (look at your frames)
- `node tools/render.mjs sheet <id> [--params file]` → build/qa/<slug>-sheet.png (12 frames)
- `node tools/render.mjs strip <id> 2.0 2.6 0.05` → frame-by-frame motion around a hit
- `node tools/render.mjs frame <id> 4.5` → one full-res frame
- `node tools/regress.mjs check <id>` → defaults still match the goldens
- `node tools/regress.mjs determinism <id>` → frame-by-frame playback equals direct seeks (run it on every new style)
View PNGs with the Read tool. Fix every printed page error. Check overlaps, clipped text, dead frames,
legibility, beat timing, the poster frame, and a strong first 0.5 s.
