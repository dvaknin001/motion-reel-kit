# Motion Reel Kit

Code-generated motion graphics for YouTube niches, packaged so each style can be re-aimed at a new niche
by changing a JSON file. It's also a way to assemble a whole showreel (a "mock résumé") from those
styles, with a portfolio page to match.

Everything is code: GSAP timelines for picture, Web Audio synthesis for sound, headless Chrome and FFmpeg
for frame-exact MP4s. There are no templates, plugins, stock footage or sample packs.

## What's here

| folder | what |
|---|---|
| [`styles/`](styles/README.md) | **15 styles**, one folder each: `style.js`, a style card (`README.md`), a poster, and example params for other niches |
| [`docs/NICHE-MAP.md`](docs/NICHE-MAP.md) | niche → style lookup |
| [`reels/`](reels/) | reel configs. `opus-5.5-showcase.json` rebuilds the original showcase; `opus-5.5-vol-2.json` is a second reel made only from params (13 new niches, no new code); `_template.json` is a starting point |
| [`showcase/opus-5.5-motion-reel/`](showcase/opus-5.5-motion-reel/) | the original showcase: contact sheet and live portfolio page (`page-as-published/` is the exact page that was published). Its videos are on the [release](https://github.com/dvaknin001/motion-reel-kit/releases/tag/v1.0.0) |
| [`showcase/opus-5.5-motion-reel-vol-2/`](showcase/opus-5.5-motion-reel-vol-2/) | Vol. 2: contact sheet and live portfolio page; videos on the release |
| [`site/`](site/README.md) | the website, [deanbuildsai.pages.dev](https://deanbuildsai.pages.dev): a link-in-bio page whose hero is a kit style playing live, with Instagram and YouTube calls to action that adapt to the visitor |
| `engine/` | the animation kit, the player with 13 transitions, and the procedural sound library |
| `tools/` | render, export, page build, catalog, scaffolding, regression |
| `docs/` | [workflow for a new reel](docs/WORKFLOW.md) · [style authoring rules](docs/STYLE_AUTHORING.md) · [pipeline](docs/PIPELINE.md) · [sound](docs/SOUND.md) |

## The styles

| style | built for | also fits |
|---|---|---|
| `reel-open-bars` / `reel-close-bars` | showreel open and end card | channel intros and outros, episode openers |
| `captions-kinetic` | podcasts, talking heads | coaching, business, motivation |
| `finance-growth-curve` | personal finance, investing | crypto DCA, real estate, business growth |
| `truecrime-case-board` | true crime | mysteries, heists, investigations |
| `gaming-loot-reveal` | gaming | pack openings, gacha pulls, rank-ups |
| `history-campaign-map` | history, military campaigns | expeditions, trade routes, migrations |
| `science-scale-zoom` | space and science | any "scale of…" comparison |
| `sports-head-to-head` | sports comparisons | any A vs B with stats |
| `faith-scroll-reveal` | faith, ancient texts | classics, manuscripts, archaeology |
| `tech-spec-callouts` | tech reviews | gadget comparisons, benchmarks |
| `coldwar-range-rings` | Cold War, geopolitics | disasters, "how far does it reach" explainers |
| `cooking-recipe-card` | cooking | baking, retro recipes |
| `comics-panel-slam` | comics, pop culture | anime, trailer breakdowns |
| `cta-subscribe` | any channel's CTA | follow, join and bell prompts |

The full, generated catalog with posters, niches and example counts is in
[`styles/README.md`](styles/README.md).

## Quick start

You need Node 20+ and Google Chrome (Chromium or Edge also work). `npm install` downloads FFmpeg for you.

```bash
git clone https://github.com/dvaknin001/motion-reel-kit.git
cd motion-reel-kit
npm install
npm run doctor
```

`npm run doctor` checks Chrome, FFmpeg and internet access (GSAP and Google Fonts load from CDNs), builds every
style and encodes a short test clip.

## Make your first video

```bash
node tools/params.mjs --list
node tools/params.mjs finance-growth-curve --out my-video.json
node tools/render.mjs sheet finance-growth-curve --params my-video.json
node tools/render.mjs video finance-growth-curve --params my-video.json --out my-video.mp4
```

1. List the styles, or browse [styles/README.md](styles/README.md) and [docs/NICHE-MAP.md](docs/NICHE-MAP.md).
2. Copy a style's default content into a JSON file, then edit the words, numbers and colours.
3. Preview 12 frames in `build/qa/…-sheet.png`.
4. Render a 1080p60 MP4 with sound. Add `--alpha` for a transparent ProRes 4444 `.mov` to lay over your
   footage (for overlay styles such as `cta-subscribe`).

To cut several pieces into one reel with transitions and a portfolio page, see [docs/WORKFLOW.md](docs/WORKFLOW.md):
`node tools/new-reel.mjs "My Reel" --examples`, then `node tools/export-reel.mjs reels/my-reel.json`.

Using Claude Code? Open this folder and describe the video you want; [CLAUDE.md](CLAUDE.md) teaches it the kit.

## Videos

The rendered reels, pieces and the transparent overlay are too big for git. Download them from the
[v1.0.0 release](https://github.com/dvaknin001/motion-reel-kit/releases/tag/v1.0.0), or re-render any of them:

```bash
node tools/export-reel.mjs reels/opus-5.5-showcase.json
```

The contact sheets and the live portfolio pages are in `showcase/`. Open a `page/preview.html` in a browser
to watch that reel play live from code.

## Changing styles

Style defaults reproduce the showcase, and `tools/regress.mjs` guards them with golden frames. Goldens depend
on your GPU and fonts, so record them on your machine before you edit (`npm run baseline`), then run
`npm run regress` after your changes. See [docs/STYLE_AUTHORING.md](docs/STYLE_AUTHORING.md).

## License

MIT. GSAP loads from cdnjs under its own free license. Map data is Natural Earth (public domain). Fonts are
Google Fonts (SIL Open Font License).
