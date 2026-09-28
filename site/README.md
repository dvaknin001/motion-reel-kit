# The website

A link-in-bio site whose hero is a Motion Reel Kit style playing live in the browser. It points visitors to
Instagram and YouTube, and to the kit's live reels, downloads and code. It's deployed to Cloudflare Pages.

| file | what |
|---|---|
| `site.config.json` | every link and line of copy: Instagram, YouTube, welcome lines, follow cards, which reels to show |
| `hero.json` | the hero animation: params for a kit style (`captions-kinetic`), in the brand colours |
| `site.css`, `site.js` | the page's look, the live hero, and the calls to action that adapt to the visitor |
| `../tools/build-site.mjs` | builds everything into `build/site/`, and deploys it with `--deploy` |

## Update and deploy

```bash
node tools/build-site.mjs --deploy
```

The first time only, run `npx wrangler login` in a terminal and approve in the browser.

## Visitors from Instagram and YouTube

The page works out where a visitor came from and puts the other platform first:

- From Instagram: a welcome line, and **Subscribe on YouTube** as the first button.
- From YouTube: a welcome line, and **Follow on Instagram** as the first button.
- Everyone else: both.

It reads the Instagram in-app browser and the referrer, but tagged links are the most reliable. Use these
in your bios:

- Instagram bio: `https://deanbuildsai.pages.dev/?from=ig`
- YouTube links and descriptions: `https://deanbuildsai.pages.dev/?from=yt`

## Change the hero

Edit `hero.json`: the words, their timing, the keyword colours (`hit` red, `win` green) and the slams.
Preview it with:

```bash
node tools/render.mjs sheet captions-kinetic --params site/hero.json
```

Then rebuild. Any other style works as the hero too: set `hero.style` in `site.config.json`, and set
`hero.fonts` to the font families that style uses.
