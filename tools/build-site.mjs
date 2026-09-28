#!/usr/bin/env node
/*
  The website: a landing page whose hero is a kit style playing live in the browser, calls to action that
  adapt to where the visitor came from (Instagram → YouTube, YouTube → Instagram), the kit's reels, styles
  and downloads, plus each reel's live portfolio page.

  node tools/build-site.mjs             build into build/site/ (needs Chrome + FFmpeg for the images)
  node tools/build-site.mjs --deploy    build, then deploy to Cloudflare Pages with wrangler
                                        (first time: `npx wrangler login` in a terminal and approve in the browser)

  Everything you'd edit is in site/site.config.json (links, copy, which reels) and site/hero.json (the hero
  animation's params). Add your YouTube channel there later and redeploy: the buttons switch on by themselves.
  Tag your bio links (…/?from=ig on Instagram, …/?from=yt on YouTube) so the page knows who's visiting.
*/
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';
import {
  ROOT, readJSON, parseArgs, gsapTags, ffmpegPath, chromePath, CHROME_ARGS, loadStyleDefs, examplesOf, listStyles,
  resolveTarget, releaseAssets, repoInfo,
} from './lib.mjs';

const { flags } = parseArgs(process.argv.slice(2));
const cfg = readJSON(path.join(ROOT, 'site', 'site.config.json'));
const heroParams = readJSON(path.join(ROOT, cfg.hero.params));
const OUT = path.join(ROOT, 'build', 'site'), TMP = path.join(ROOT, 'build', 'site-tmp');
const repo = repoInfo();
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const mb = (b) => (b >= 1e9 ? (b / 1e9).toFixed(1) + ' GB' : Math.round(b / 1e6) + ' MB');
const node = (args) => { const r = spawnSync(process.execPath, args, { cwd: ROOT, stdio: 'inherit' }); if (r.status !== 0) throw new Error(`failed: node ${args.join(' ')}`); };
const ff = (args) => { const r = spawnSync(ffmpegPath(), ['-y', '-loglevel', 'error', ...args], { cwd: ROOT, encoding: 'utf8' }); if (r.status !== 0) throw new Error('ffmpeg: ' + r.stderr); };

fs.rmSync(OUT, { recursive: true, force: true });
for (const d of ['img/styles', 'img/reels', 'kit']) fs.mkdirSync(path.join(OUT, d), { recursive: true });
fs.mkdirSync(TMP, { recursive: true });
const t0 = Date.now();

/* ---------- icons ---------- */
const icons = {
  ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.3" fill="currentColor"/></svg>',
  yt: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4.5" fill="currentColor"/><path d="M10 9.1v5.8l5-2.9z" style="fill:var(--yt-play,#0D0E10)"/></svg>',
  code: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 7 3.5 12l5 5M15.5 7l5 5-5 5"/></svg>',
  down: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19.5h14"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.8v14.4c0 .8.9 1.3 1.6.9l11.2-7.2c.6-.4.6-1.3 0-1.7L8.6 3.9C7.9 3.5 7 4 7 4.8z" fill="currentColor"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>',
  soundOff: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="m16 9.5 5 5m0-5-5 5"/></svg>',
  soundOn: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/></svg>',
};
const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="15" fill="${cfg.colors?.green || '#08DA71'}"/><path d="M25 18.5v27c0 1.5 1.7 2.4 3 1.6l21.5-13.5c1.2-.8 1.2-2.5 0-3.3L28 16.9c-1.3-.8-3 .1-3 1.6z" fill="#0D0E10"/></svg>`;

/* ---------- images, made with the kit ---------- */
console.log('images');
const heroPng = path.join(TMP, 'hero.png');
node(['tools/render.mjs', 'frame', cfg.hero.style, String(cfg.hero.poster), '--params', cfg.hero.params, '--out', path.relative(ROOT, heroPng)]);
ff(['-i', heroPng, '-vf', 'scale=1280:720:flags=lanczos', '-q:v', '3', path.join(OUT, 'img', 'hero-poster.jpg')]);
ff(['-i', heroPng, '-vf', 'scale=1200:675:flags=lanczos,crop=1200:630:0:22', '-q:v', '3', path.join(OUT, 'img', 'og.jpg')]);
fs.writeFileSync(path.join(OUT, 'img', 'favicon.svg'), FAVICON);
{
  const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: CHROME_ARGS });
  const page = await browser.newPage();
  await page.setViewport({ width: 180, height: 180, deviceScaleFactor: 1 });
  await page.setContent(`<html><body style="margin:0;background:#0D0E10">${FAVICON.replace('<svg ', '<svg width="180" height="180" ')}</body></html>`);
  await page.screenshot({ path: path.join(OUT, 'img', 'apple-touch-icon.png'), clip: { x: 0, y: 0, width: 180, height: 180 } });
  await browser.close();
}
const order = Object.fromEntries(loadStyleDefs().map((d) => [d.id, d]));
const styles = listStyles().map((id) => order[id]).sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
for (const d of styles) {
  const src = path.join(ROOT, 'styles', d.id, 'poster.jpg');
  if (fs.existsSync(src)) ff(['-i', src, '-vf', 'scale=800:-2:flags=lanczos', '-q:v', '4', path.join(OUT, 'img', 'styles', d.id + '.jpg')]);
}

/* ---------- reels: live pages, contact sheets, downloads ---------- */
console.log('reel pages');
const reels = cfg.reels.map((r) => {
  const reel = resolveTarget(r.file);
  node(['tools/build-page.mjs', r.file, '--out', path.join('build', 'site', r.path), '--site', '../../']);
  const sheet = path.join(ROOT, 'showcase', reel.slug, 'contact-sheet.png');
  const img = `img/reels/${reel.slug}.jpg`;
  if (fs.existsSync(sheet)) ff(['-i', sheet, '-vf', 'scale=1400:-2:flags=lanczos', '-q:v', '4', path.join(OUT, img)]);
  const pieces = reel.sequence.filter((it) => !it.role);
  const niches = new Set(pieces.map((it) => ((it.params.meta && it.params.meta.niche) || (order[it.style] && order[it.style].niche) || '').toLowerCase())).size;
  return { ...r, reel, img: fs.existsSync(sheet) ? img : null, pieces: pieces.length, niches, assets: releaseAssets(reel) };
});

/* ---------- numbers for the page ---------- */
const nicheSet = new Set();
for (const d of styles) {
  [...(d.niches?.primary || []), ...(d.niches?.similar || [])].forEach((n) => nicheSet.add(n.trim().toLowerCase()));
  examplesOf(d.id).forEach((e) => e.params.meta?.niche && nicheSet.add(e.params.meta.niche.trim().toLowerCase()));
}
const transitions = (fs.readFileSync(path.join(ROOT, 'engine', 'engine.js'), 'utf8').match(/^\s*TR\.\w+ = /gm) || []).length;
const IG = cfg.instagram?.url, YT = cfg.youtube?.url;

/* ---------- html ---------- */
const btn = (cls, href, icon, label, small, ext) => `<a class="btn ${cls}" href="${esc(href)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${icon}<span class="txt">${esc(label)}${small ? `<small>${esc(small)}</small>` : ''}</span></a>`;
const dl = (a, label) => `<a href="${esc(repo.assetUrl(a.name))}">${icons.down}${esc(label)} <span>${mb(a.size)}</span></a>`;
const reelCard = (r) => {
  const get = (k) => r.assets.find((a) => a.kind === k);
  const pieceCount = r.assets.filter((a) => a.kind === 'piece').length, alpha = r.assets.filter((a) => a.kind === 'alpha');
  return `<article class="reel">
      <a class="reel-img" href="${esc(r.path)}">${r.img ? `<img src="${esc(r.img)}" alt="Contact sheet: one frame from each piece of ${esc(r.title)}" loading="lazy" width="1400" height="875">` : ''}<span class="play">${icons.play}Watch it live</span></a>
      <div class="reel-body">
        <h3>${esc(r.title)}</h3>
        <p>${esc(r.blurb)}</p>
        <div class="dl">${[get('reel') && dl(get('reel'), '1080p60 MP4'), get('share') && dl(get('share'), '720p MP4'),
          pieceCount ? `<a href="${esc(repo.url)}/releases/tag/${esc(repo.tag)}" target="_blank" rel="noopener">${icons.down}${pieceCount} pieces <span>separately</span></a>` : '',
          ...alpha.map((a) => dl(a, 'Transparent overlay'))].filter(Boolean).join('')}</div>
      </div>
    </article>`;
};
const card = (d) => {
  const ex = examplesOf(d.id)[0];
  const primary = (d.niches?.primary || [d.niche]).slice(0, 3).join(' · ');
  return `<a class="card" href="${esc(repo.url)}/tree/main/styles/${esc(d.id)}" target="_blank" rel="noopener">
        <div class="thumb"><img src="img/styles/${esc(d.id)}.jpg" alt="${esc(d.name)} poster frame" loading="lazy" width="800" height="450"></div>
        <div class="meta"><span class="name">${esc(d.name || d.title)}</span><span class="niche">${esc(primary)}</span>${ex && ex.params.meta?.niche ? `<span class="ex">Also shipped as: <b>${esc(ex.params.meta.niche)}</b></span>` : ''}</div>
      </a>`;
};
const cmds = [
  `git clone ${repo.url}.git`,
  'cd motion-reel-kit && npm install',
  'node tools/params.mjs finance-growth-curve --out my-video.json',
  'node tools/render.mjs video finance-growth-curve --params my-video.json --out my-video.mp4',
];
const siteData = {
  instagram: cfg.instagram, youtube: cfg.youtube, welcome: cfg.welcome, icons,
  hero: { style: cfg.hero.style, params: heroParams, poster: cfg.hero.poster, fonts: cfg.hero.fonts },
};
const fontsUrl = 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,500..900&family=Inter:wght@400..800&family=JetBrains+Mono:wght@400..700&family=Montserrat:wght@800..900&display=swap';
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(cfg.brand)} · ${esc(cfg.name)}</title>
<meta name="description" content="${esc(cfg.description)}">
<meta name="theme-color" content="#0B0C0E">
<link rel="icon" href="img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="img/apple-touch-icon.png">
<link rel="canonical" href="${esc(cfg.url)}/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(cfg.brand)}">
<meta property="og:url" content="${esc(cfg.url)}/">
<meta property="og:title" content="${esc(cfg.brand)} · ${esc(cfg.name)}">
<meta property="og:description" content="${esc(cfg.description)}">
<meta property="og:image" content="${esc(cfg.url)}/img/og.jpg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<script>document.documentElement.className='js';setTimeout(function(){if(!window.__siteReady)document.documentElement.className=''},2500)</script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>
<link rel="stylesheet" href="${fontsUrl}">
<link rel="stylesheet" href="site.css">
<link rel="preload" as="image" href="img/hero-poster.jpg">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="nav">
  <a class="logo" href="#top" aria-label="${esc(cfg.brand)}, back to top"><span class="logo-mark" aria-hidden="true"></span><span>${esc(cfg.brand.toUpperCase())}</span></a>
  <nav class="nav-social" aria-label="Social">
    ${IG ? `<a class="icon-btn" href="${esc(IG)}" target="_blank" rel="noopener" aria-label="Instagram @${esc(cfg.instagram.handle)}">${icons.ig}<span class="lbl">@${esc(cfg.instagram.handle)}</span></a>` : ''}
    ${YT ? `<a class="icon-btn" href="${esc(YT)}" target="_blank" rel="noopener" aria-label="YouTube">${icons.yt}<span class="lbl">YouTube</span></a>` : `<span class="icon-btn soon" title="YouTube channel coming soon">${icons.yt}<span class="lbl">Soon</span></span>`}
  </nav>
</header>
<div class="welcome" id="welcome" hidden></div>
<main id="main">
<section class="hero wrap" id="top">
  <div class="hero-copy">
    <p class="eyebrow reveal"><span class="dot" aria-hidden="true"></span>${esc(cfg.eyebrow)}</p>
    <h1 class="reveal" style="--d:70ms">${cfg.headlineHtml}</h1>
    <p class="lede reveal" style="--d:140ms">${esc(cfg.bio)}</p>
    <div class="cta-row reveal" style="--d:210ms" id="hero-ctas">${IG ? btn('btn-primary', IG, icons.ig, 'Follow on Instagram', '@' + cfg.instagram.handle, true) : ''}${btn('btn-ghost', '#kit', icons.code, 'Get the free motion kit', 'Open source · MIT')}</div>
  </div>
  <figure class="hero-media reveal" style="--d:280ms">
    <div class="screen" id="hero-screen" style="background-image:url(img/hero-poster.jpg)" role="img" aria-label="Animated captions: I build faceless AI YouTube channels. Documenting the journey from $0 to $10K a month. Watch me build.">
      <div class="stage" id="hero-stage"></div>
    </div>
    <figcaption><span class="live"><i aria-hidden="true"></i>Live · rendered from code in your browser</span><button class="chip" id="hero-sound" type="button" aria-pressed="false">${icons.soundOff}<span>Sound off</span></button></figcaption>
  </figure>
</section>

<section class="band" id="kit"><div class="wrap">
  <div class="sec-head reveal">
    <p class="eyebrow">Free · open source</p>
    <h2>The motion graphics are code. I open-sourced the kit.</h2>
    <p class="lede">Motion Reel Kit: ${styles.length} motion graphics styles for YouTube niches. Change a JSON file, render a frame-exact MP4 with sound. No templates, no plugins, no After Effects.</p>
  </div>
  <ul class="stats" data-stagger>
    <li><b>${styles.length}</b><span>styles</span></li>
    <li><b>${nicheSet.size}</b><span>niches mapped</span></li>
    <li><b>${transitions}</b><span>transitions</span></li>
    <li><b>MIT</b><span>free to use</span></li>
  </ul>
  <div class="cta-row reveal">${btn('btn-primary', cfg.reels[0].path, icons.play, 'Watch the reel live', 'In your browser, with sound')}${btn('btn-ghost', repo.url, icons.code, 'Get the code on GitHub', 'Clone and render', true)}${btn('btn-ghost', `${repo.url}/releases/tag/${repo.tag}`, icons.down, 'All downloads', 'MP4 · ProRes', true)}</div>
  <div class="reels" data-stagger>
    ${reels.map(reelCard).join('\n    ')}
  </div>
</div></section>

<section class="band" id="styles"><div class="wrap">
  <div class="sec-head reveal">
    <p class="eyebrow">${styles.length} styles</p>
    <h2>One animation, a whole family of niches.</h2>
    <p class="lede">Every style takes its words, numbers and colours from a JSON file. The same growth curve does compound interest or crypto; the same map does Hannibal or Napoleon.</p>
  </div>
  <div class="gallery" data-stagger>
      ${styles.map(card).join('\n      ')}
  </div>
  <p class="gallery-more reveal">Looking for your niche? Check the <a href="${esc(repo.url)}/blob/main/docs/NICHE-MAP.md" target="_blank" rel="noopener">niche map</a> (${nicheSet.size} niches).</p>
</div></section>

<section class="band" id="start"><div class="wrap">
  <div class="sec-head reveal">
    <p class="eyebrow">Get started</p>
    <h2>Your first video in four commands.</h2>
    <p class="lede">Clone it, pick a style, edit a JSON file, render. Works on Windows, Mac and Linux.</p>
  </div>
  <div class="code reveal"><div class="code-bar"><span><i></i><i></i><i></i>Terminal</span><button class="chip copy" type="button" data-copy="${esc(cmds.join('\n'))}">Copy</button></div><pre><code>${cmds.map((c) => `<span class="p">$ </span>${esc(c)}`).join('\n')}</code></pre></div>
  <p class="note reveal">Needs Node 20+ and Chrome. <code>npm install</code> downloads FFmpeg, and <code>npm run doctor</code> checks your setup.</p>
</div></section>

<section class="band" id="follow"><div class="wrap">
  <div class="sec-head reveal">
    <p class="eyebrow"><span class="dot" aria-hidden="true"></span>Follow along</p>
    <h2>${esc(cfg.follow.headline)}</h2>
    <p class="lede">${esc(cfg.follow.lede)}</p>
  </div>
  <div class="follow-grid" id="follow-grid" data-stagger>
    ${IG ? `<article class="follow-card ig" data-platform="instagram">
      <p class="platform">${icons.ig}Instagram · @${esc(cfg.instagram.handle)}</p>
      <h3>${esc(cfg.instagram.title || 'Follow on Instagram')}</h3>
      <p class="pitch">${esc(cfg.instagram.pitch || '')}</p>
      ${btn('btn-primary', IG, icons.ig, 'Follow on Instagram', '@' + cfg.instagram.handle, true)}
    </article>` : ''}
    ${YT ? `<article class="follow-card yt" data-platform="youtube">
      <p class="platform">${icons.yt}YouTube · @${esc(cfg.youtube.handle)}</p>
      <h3>${esc(cfg.youtube.title || 'Subscribe on YouTube')}</h3>
      <p class="pitch">${esc(cfg.youtube.pitch || '')}</p>
      ${btn('btn-red', YT + '?sub_confirmation=1', icons.yt, 'Subscribe on YouTube', '@' + cfg.youtube.handle, true)}
    </article>` : ''}
  </div>
  ${YT ? '' : '<p class="soon-yt reveal">YouTube channel: coming soon.</p>'}
</div></section>
</main>

<footer class="foot">
  <div class="row">
    <span>&copy; <span id="year">2026</span> ${esc(cfg.name)} · ${esc(cfg.brand)}</span>
    <nav aria-label="Footer">${IG ? `<a href="${esc(IG)}" target="_blank" rel="noopener">Instagram</a>` : ''}${YT ? `<a href="${esc(YT)}" target="_blank" rel="noopener">YouTube</a>` : ''}<a href="${esc(repo.url)}" target="_blank" rel="noopener">Motion Reel Kit on GitHub</a></nav>
  </div>
  <div class="row" style="margin-top:10px"><span>The hero animation is rendered live in your browser by the Motion Reel Kit.</span></div>
</footer>
<div class="dock" id="dock" hidden></div>
<script>window.SITE = ${JSON.stringify(siteData).replace(/</g, '\\u003c')};</script>
<script src="site.js"></script>
${gsapTags()}
<script src="kit/engine.js"></script>
<script src="kit/sfx.js"></script>
<script src="kit/${esc(cfg.hero.style)}.js"></script>
</body>
</html>
`;
fs.writeFileSync(path.join(OUT, 'index.html'), html);
fs.copyFileSync(path.join(ROOT, 'site', 'site.css'), path.join(OUT, 'site.css'));
fs.copyFileSync(path.join(ROOT, 'site', 'site.js'), path.join(OUT, 'site.js'));
fs.copyFileSync(path.join(ROOT, 'engine', 'engine.js'), path.join(OUT, 'kit', 'engine.js'));
fs.copyFileSync(path.join(ROOT, 'engine', 'sfx.js'), path.join(OUT, 'kit', 'sfx.js'));
fs.copyFileSync(path.join(ROOT, 'styles', cfg.hero.style, 'style.js'), path.join(OUT, 'kit', cfg.hero.style + '.js'));
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n`);
fs.writeFileSync(path.join(OUT, '_headers'), ['/img/*', '  Cache-Control: public, max-age=604800', '/kit/*', '  Cache-Control: public, max-age=86400', '/*', '  X-Content-Type-Options: nosniff', '  Referrer-Policy: strict-origin-when-cross-origin', ''].join('\n'));
fs.rmSync(TMP, { recursive: true, force: true });

const size = (dir) => fs.readdirSync(dir, { withFileTypes: true }).reduce((s, e) => s + (e.isDirectory() ? size(path.join(dir, e.name)) : fs.statSync(path.join(dir, e.name)).size), 0);
console.log(`build/site · ${mb(size(OUT))} · ${styles.length} styles · ${reels.length} reel pages · ${((Date.now() - t0) / 1000).toFixed(0)} s`);

if (flags.deploy) {
  const wr = (args, inherit = true) => spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['--yes', 'wrangler@latest', ...args],
    { cwd: ROOT, encoding: 'utf8', stdio: inherit ? 'inherit' : 'pipe', shell: process.platform === 'win32' });
  const deploy = () => wr(['pages', 'deploy', 'build/site', '--project-name', cfg.project, '--branch', 'main', '--commit-dirty=true']);
  let r = deploy();
  if (r.status !== 0) {
    // first deploy: create the project on classic Pages (--force skips wrangler's delegation to Workers, which
    // would not give a <project>.pages.dev address), then deploy again
    const c = wr(['pages', 'project', 'create', cfg.project, '--production-branch', 'main', '--force']);
    if (c.status === 0) r = deploy();
  }
  if (r.status !== 0) throw new Error('wrangler deploy failed (first time? run `npx wrangler login` in a terminal and approve in the browser)');
  console.log(`live: https://${cfg.project}.pages.dev`);
}
