# Motion Reel Kit

A code-only motion-graphics kit for YouTube-style pieces and showreels ("mock résumés"). Every frame is
rendered by GSAP timelines in headless Chrome, every sound is synthesised with Web Audio, and FFmpeg
encodes frame-exact MP4s. There are no templates, stock footage or plugins.

The first showcase built with it is `showcase/opus-5.5-motion-reel/`: 13 pieces across 12 niches, plus
the bookends. Its source is `reels/opus-5.5-showcase.json`. `reels/opus-5.5-vol-2.json` proves the reuse: the
same 15 styles aimed at 13 other niches purely through each style's `examples/*.json` params.

## Layout

```
engine/      engine.js (Kit API, Player, transitions), sfx.js (procedural sound), dev-boot.js
styles/      one folder per reusable style: style.js · README.md (style card) · poster.jpg · examples/*.json|jpg
             _template/ is the starting point for new styles; styles/README.md is the index
reels/       reel configs: running order, transitions, mix trims, per-item params, page copy
data/        maps.config.json → mapdata.js (Natural Earth land in Mercator, per region)
page/        the portfolio page template (page.html, page.css, app.js)
tools/       every command (below). tools/lib.mjs holds the shared helpers
docs/        STYLE_AUTHORING.md (rules for styles) · WORKFLOW.md (new mock résumé) · PIPELINE.md · SOUND.md · NICHE-MAP.md
showcase/    finished deliverables per reel: MP4s, pieces/, alpha overlays, contact sheet, page/
.regress/    golden frames of every style's defaults (tools/regress.mjs)
build/       scratch output (dev pages, QA sheets, test renders). Safe to delete
```

## Picking a style for a niche

Look the niche up in `docs/NICHE-MAP.md` (generated), then read that style's card
(`styles/<id>/README.md`): params table, adapting recipes, limits, examples. `node tools/params.mjs --list`
gives the same overview in the terminal.

## Commands (run from the kit root)

| task | command |
|---|---|
| every style at a glance | `node tools/params.mjs --list` |
| a style's default params | `node tools/params.mjs <style> [--out my-params.json]` |
| look at a style (12 frames) | `node tools/render.mjs sheet <style> [--params file.json]` → `build/qa/…-sheet.png` |
| motion around a moment | `node tools/render.mjs strip <style> 2.0 2.6 0.05` |
| one full-res frame | `node tools/render.mjs frame <style> 4.5 [--out x.jpg]` |
| scrub it live with sound | `node tools/dev.mjs <style or reel.json>` (prints a file URL; space plays, arrows step, m sound) |
| render a video | `node tools/render.mjs video <style or reel.json> [--params f] [--item key] [--alpha]` |
| start a new reel (mock résumé) | `node tools/new-reel.mjs "Name" --pieces style[:example],…` |
| check a reel | `node tools/render.mjs info reels/x.json` · `node tools/render.mjs posters reels/x.json` |
| export everything | `node tools/export-reel.mjs reels/x.json [--only reel,share,pieces,alpha,sheet,page]` |
| portfolio page only | `node tools/build-page.mjs reels/x.json` then `node tools/pagecheck.mjs reels/x.json` |
| start a new style | `node tools/new-style.mjs <niche-technique> [--from <style>]` |
| smaller goldens (optional) | `node tools/regress.mjs compact` (PNG → JPEG + md5, ~350 MB → ~45 MB, slightly less sensitive) |
| style defaults unchanged? | `node tools/regress.mjs check [style…]` (all 15 in about a minute) |
| playback-independent? | `node tools/regress.mjs determinism [style…]` (sequential frames = direct seeks) |
| refresh cards, index, niche map | `node tools/catalog.mjs` |
| add a map region | edit `data/maps.config.json`, then `node tools/mapgen.mjs` |

## Hard rules

1. **Determinism.** Styles are pure functions of time. Never use `Math.random`, `Date`, timers, rAF or CSS
   animations. Use `S.rand()`/`S.rnd()` (seeded) and `S.noise()`. See docs/STYLE_AUTHORING.md.
2. **Defaults are the showcase.** Each style's `defaults` must reproduce its golden frames. Run
   `node tools/regress.mjs check` after touching a style or the engine. Change content through params
   files, never by editing defaults. Only re-baseline goldens (`snapshot <id> --force`) after an intentional
   visual change you have reviewed frame by frame.
3. **Facts.** Every real-world figure on screen must be true and sourced in the item's `meta.facts`.
   Invented content says so ("Fictional…", "Illustrative…"). No real platform logos or trademarked
   characters. Don't impersonate real channels.
4. **Look at your frames.** Render sheets and full frames, and view them with the Read tool before calling
   anything done. Fix every page error the tools print.
5. **Windows notes.** Keep LF line endings. If you script file edits with Python, open files in binary mode
   (text mode writes CRLF, and `\1` in a replacement string becomes a control byte). Run
   `node --check <file>` after edits, without truncating its output.

## Making a new mock résumé

Follow `docs/WORKFLOW.md`. In short: pick niches, map them to styles, write a params file per piece in
`reels/<name>/` (facts sourced), run `new-reel.mjs`, QA with `posters` and `sheet`, tune the order,
transitions and `mix`, then run `export-reel.mjs`. Publish `showcase/<slug>/page/index.html` as the
portfolio page if wanted.
