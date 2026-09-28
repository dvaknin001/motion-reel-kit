# Workflow: a new mock résumé

A reel is a sequence of styles, each fed its own params, cut together with transitions and bookended by
`reel-open-bars` and `reel-close-bars`. Everything below runs from the kit root.

## 1. Pick the niches and the styles

1. List the niches the reel should prove (for example: fitness, real estate, a podcast, gaming).
2. Look each one up in [NICHE-MAP.md](NICHE-MAP.md). A **bold** style was built for it. An _italic_ one
   already has an example params file for it. A plain one adapts with params.
3. Read each chosen style's card (`styles/<id>/README.md`): params, "Adapting it" recipes, limits.
4. If no style fits a niche, fork the closest one (`node tools/new-style.mjs <id> --from <style>`) or
   start from the template (docs/STYLE_AUTHORING.md). Build the style before the reel.

Aim for 8–14 pieces, alternating energy (a hook, then data, then mood, then spectacle) and never putting
two similar palettes side by side.

## 2. Write the content (params files)

For every piece:

```bash
node tools/params.mjs <style> --out reels/<reel-slug>/<piece>.json
```

Edit the file. Keep only the keys you change: missing keys fall back to the defaults, objects merge, and
arrays replace wholesale. Always set:

```json
"meta": { "niche": "Fitness", "title": "The 12-Week Cut", "facts": "Where every number comes from, or 'Fictional …'" }
```

Set `palette` (three swatches for the page) when the colours change. Look at every piece before moving on:

```bash
node tools/render.mjs sheet <style> --params reels/<reel-slug>/<piece>.json
```

Then read the PNG and fix the content until nothing clips, overlaps or reads wrong. Check the facts again
here. Real numbers need a source in `meta.facts`.

## 3. Assemble the reel

```bash
node tools/new-reel.mjs "Jane Doe Motion Reel" --title "JANE DOE" --pieces finance-growth-curve,sports-head-to-head:federer-vs-nadal
```

`style:example` uses a shipped example. For your own params files, edit the generated
`reels/<slug>.json` and point each item at them with `"paramsFile": "reels/<reel-slug>/<piece>.json"`
(paths resolve from the reel file's folder, then from the kit root). Per item you can also set:

| key | meaning |
|---|---|
| `key` | short unique name (used by `--item`, the pieces/ file names and page rule links) |
| `params` | inline params, merged over `paramsFile` |
| `meta` | override card copy (`niche`, `title`, `why`, `techniques`, `facts`) |
| `trans` | transition INTO this item: `{ "type": "whip", "dur": 0.45, … }`. Types: cut, whip, zoom, slash, iris, glitch, flash, push, halftone, blinds, burn, dip, swipe (options in PIPELINE.md) |
| `mix` | level trim in dB after listening (−3…+3). The export normalises the whole reel to −15 LUFS anyway |
| `alpha` | `true` also exports a transparent ProRes 4444 overlay of this item |
| `role` | `"open"` / `"close"` for bookends (they're not listed as pieces on the page) |

Update the bookends' params: the open's `slate`, `title` and `stats` (make the counts true) and the
close's `title`, `roll` and `note`.

## 4. QA the cut

```bash
node tools/render.mjs info reels/<slug>.json       # timings of every item
node tools/render.mjs posters reels/<slug>.json    # contact sheet of every piece's poster frame
node tools/render.mjs sheet reels/<slug>.json --n 24
node tools/dev.mjs reels/<slug>.json               # scrub with sound in a browser
node tools/render.mjs audio reels/<slug>.json      # peak, RMS and LUFS of the mix
```

Check that each transition suits both neighbours, that no two adjacent pieces share a palette, that the
first 3 seconds hook, and that the levels are even (adjust `mix`).

## 5. Page copy

The reel's `page` block fills the portfolio page: `title`, `brand`, `brandSub`, `eyebrow`, `headline`,
`lede`, `resume` (`[label, text]` rows), `piecesTitle`, `piecesIntro`, `rulesTitle`, `rulesIntro`, `rules`,
`deliver`, `onRequest`, `footer`. A rule is `{ title, text, links: [{ key, at, label, rate? }] }`. `text`
can quote measured numbers: `{pieces}`, `{maxGap}`, `{cues}`, `{cueEvery}`, `{duration}` and
`{transitions}`. Links jump the reel to `at` seconds into item `key`. See `reels/opus-5.5-showcase.json`
for a full example.

## 6. Export

```bash
node tools/export-reel.mjs reels/<slug>.json
node tools/pagecheck.mjs reels/<slug>.json --full
```

This writes into `showcase/<slug>/`: the full reel (1080p60), a 720p share copy, `pieces/NN-key.mp4`,
alpha overlays, `contact-sheet.png` and `page/`. It takes about 20–30 min for a 100 s reel. Re-run part
of it with `--only page` or `--only pieces`. To publish the page as a claude.ai Artifact, publish
`showcase/<slug>/page/index.html`.

## 7. Before you call it done

- `node tools/regress.mjs check`: all styles still match their goldens (if you touched a style).
- Watch the full reel MP4 through once, with sound.
- Every real figure is sourced in `meta.facts`, and invented content is labelled.
