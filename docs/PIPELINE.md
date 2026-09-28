# Pipeline

How a reel goes from JSON to frames, sound, MP4s and a page.

## 1. Resolve (tools/lib.mjs)

`resolveTarget(target)` accepts a style id or a reel file and returns a normalised reel:
`{ name, slug, fps, lufs, page, sequence: [{ key, style, params, meta, trans, mix, alpha, role }] }`.
`paramsFile` is read first and inline `params` merge over it (objects deep-merge; arrays replace).
`--item <key>` keeps one item and drops its transition. `--params <file>` merges into a single-item target.
`writeDevPage(reel)` writes `build/dev-<slug>.html`, which loads the fonts, GSAP 3.15 (cdnjs), the engine,
map data, the needed styles and the reel.

## 2. Build (engine/engine.js)

`new Reel.Player(stage, items)` creates one **Kit** per item: `new Kit(def, host, { params, meta, alpha })`.

- `S.P` = `deepMerge(def.defaults, item.params)`. `S.meta` = the def's card copy, overridden by
  `params.meta`, then by the reel item's `meta`. `S.palette` = `params.palette || def.palette`.
- `def.build(S, S.P)` builds DOM/SVG/canvas into `S.cam` (camera world) and `S.hud` (screen space). It
  records tweens on `S.tl` (a GSAP timeline), frame hooks (`S.onFrame`), sound cues (`S.sfx`) and editing
  notes (`S.beat`).
- The Player lays the items end to end. An item's `trans.dur` overlaps it with the previous one, the
  transition renders in that overlap, and cue times shift by the item's start. `mix` (dB) scales every cue
  of the item.

`player.seek(t)` sets the master timeline and runs the frame hooks, so any frame renders on its own.
That is why styles must be deterministic.

When it is constructed, the Player initialises every tween once (it seeks to the end and back) while every
scene is still displayed, and each seek shows the on-screen scenes before rendering. This matters because
GSAP measures the transform of an element inside `display:none` by reparenting it, then puts it back
before its `nextElementSibling`, which skips text nodes: split letters would jump across word spaces. Lazy
initialisation also made frame-by-frame playback differ from direct seeks. `regress.mjs determinism` guards
both.

### Transitions (`trans` on the incoming item)

| type | what it does | options (defaults) |
|---|---|---|
| `cut` | hard cut | — |
| `whip` | whip pan with motion blur | `dir` 1 / −1 |
| `zoom` | punch through into the next piece | — |
| `slash` | diagonal colour bars wipe | `colors` (incoming palette), `dir` |
| `iris` | circle opens from a point with a ring | `x`, `y` (centre), `color` (#fff), `ring` (14) |
| `glitch` | RGB split and slice tear | — |
| `flash` | white flash frame | `color` (#fff) |
| `push` | the next piece pushes the last one out | `dir` |
| `halftone` | Ben-Day dot dissolve | `cell` (44) |
| `blinds` | stripes open | `angle` (90), `stripe` (120 px) |
| `burn` | film light leak | `color` |
| `dip` | dip to a colour | `color` (#000) |
| `swipe` | a light bar wipes across | `color` (#fff) |

Every transition gets its own whoosh/flash sound from the engine. The usual lengths are 0.3–0.7 s.

## 3. Render video (tools/render.mjs video)

1. A probe page reports the duration. The frame range is split across `--workers` (8) headless Chrome
   pages.
2. Each worker seeks frame by frame (`i / fps`), captures a PNG over CDP and pipes it into its own FFmpeg
   (libx264 CRF 16 yuv420p bt709, or ProRes 4444 `yuva444p10le` with `--alpha`). The chunks are concatenated.
3. Audio: `OfflineAudioContext` renders every cue to a 48 kHz WAV. The export measures integrated
   loudness (ebur128), applies a linear gain to the target (−15 LUFS, capped at ±12 dB), then a −1 dBFS
   limiter (`alimiter` 0.891), and muxes AAC 256k (or PCM for .mov).

Chrome flags that matter: `--force-color-profile=srgb`, `--disable-lcd-text` and GPU rasterisation on.
Frames are identical run to run (up to GPU raster noise), which is what `regress.mjs` relies on.

## 4. Export (tools/export-reel.mjs)

The full reel, a 720p share copy (lanczos, CRF 22, AAC 160k), each piece on its own (`--item`, normalised
separately), alpha overlays for `alpha: true` items, a posters contact sheet, and the page. All of it goes
to `showcase/<slug>/`.

## 5. Page (tools/build-page.mjs)

`page/page.html` is a template: `{{key}}` is escaped text, `{{{key}}}` is generated HTML, and
`<!--if:key-->…<!--/if:key-->` is an optional section. The builder inlines page.css, the engine, sfx, map
data (only if a used style reads `MAPDATA`), the used styles, `window.REEL` and `page/app.js` into one file.
`index.html` is a fragment (for a claude.ai Artifact) and `preview.html` is a full document.

`app.js` rebuilds the same Player live in the browser. It adds a V1/A1/NOTES timeline (clips, transitions,
every sound cue by category, every `S.beat` note), piece cards with lazy hover previews built from the
same params, and the retention rules with numbers measured from the timeline.

## 6. Regression (tools/regress.mjs)

`.regress/golden/<style>/t<time>.(png|jpg)` + `manifest.json` (times, md5). `check` renders each style's
defaults at the golden times. A frame passes on an md5 match or PSNR ≥ 42 dB (≥ 38 dB against JPEG goldens).
Failures write the frame and a difference image to `build/regress/<style>/`. `snapshot <id>` records goldens
for a new style (`--force` to replace existing ones). `compact` converts PNG goldens to JPEG + md5.

## 7. Maps (tools/mapgen.mjs)

`data/maps.config.json` holds the regions: bounds, pad, clip, optional borders/countries/site/rings/cities.
`mapgen` projects Natural Earth 50m land (world-atlas) with d3-geo Mercator into 1920×1080 and writes
`data/mapdata.js` (`window.MAPDATA[region] = { k, tx, ty, land, … }`). In a style, use
`Reel.mercator(M.k, M.tx, M.ty)` for the projection, `Reel.geoCircle`, `Reel.geoDest` and `Reel.geoDistKm`
for true geodesics.

## Requirements

Node 20+, Google Chrome (path in `tools/lib.mjs`, or set the `CHROME` env var), FFmpeg on PATH, and an
internet connection for Google Fonts and the GSAP CDN. Run `npm install` for puppeteer-core, d3-geo,
topojson-client and world-atlas.
