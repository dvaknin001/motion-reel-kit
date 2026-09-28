#!/usr/bin/env node
/*
  Portfolio page: bundles a reel into one self-contained HTML page (player, NLE timeline with live
  editing notes, piece cards with hover previews, measured retention rules, résumé sheet).

  node tools/build-page.mjs <reel.json> [--out dir]      default out: showcase/<slug>/page/
  node tools/build-page.mjs <reel.json> --out dir --site [homeHref]   one full index.html for the website

  Writes index.html (a fragment: the Artifact host wraps it in <html><head><body>) and preview.html
  (the same content as a full document, for local viewing and tools/pagecheck.mjs). With --site it writes a
  single full-document index.html with a link back to the website's home page (tools/build-site.mjs).
  Page copy comes from the reel's "page" block; see reels/_template.json for every key.
*/
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, resolveTarget, gsapTags, fontsUrl, parseArgs, loadStyleDefs, deepMerge } from './lib.mjs';

const { flags, pos } = parseArgs(process.argv.slice(2));
if (!pos[0]) { console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('*/')[0]); process.exit(1); }
const reel = resolveTarget(pos[0]);
const fps = reel.fps || 60;
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), 'utf8');
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const P = reel.page || {};
const nPieces = reel.sequence.filter((it) => !it.role).length;
const copy = {
  title: P.title || reel.name,
  brand: P.brand || reel.name,
  brandSub: P.brandSub || 'Motion reel',
  spec: P.spec || `1920×1080 · ${fps} fps · stereo 48 kHz`,
  eyebrow: P.eyebrow || 'Showreel',
  headline: P.headline || 'Motion graphics that keep people watching.',
  lede: P.lede || `${nPieces} pieces cut as one reel. Every frame and every sound effect on this page is generated live from code.`,
  piecesTitle: P.piecesTitle || 'The pieces',
  piecesIntro: P.piecesIntro || 'Each piece speaks one niche\'s visual language. Hover a thumbnail to preview it; the play button jumps the reel to that piece.',
  rulesTitle: P.rulesTitle || 'How I cut for retention',
  rulesIntro: P.rulesIntro || 'The numbers in this section are measured from the reel\'s own timeline when the page loads.',
  fps: String(fps),
};
const raw = {
  resume: (P.resume || []).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('\n      '),
  rules: (P.rules || []).length ? 'yes' : '',
  deliver: (P.deliver || ['The full reel as an MP4 with sound', 'Each piece as its own MP4']).map((x) => `<li>${esc(x)}</li>`).join(''),
  onRequest: (P.onRequest || []).map((x) => `<li>${esc(x)}</li>`).join(''),
  footer: (P.footer || [`${reel.name}`]).map((x) => `<span>${esc(x)}</span>`).join('\n    '),
};

let html = read('page', 'page.html');
html = html.replace(/<!--if:(\w+)-->([\s\S]*?)<!--\/if:\1-->\n?/g, (m, k, body) => (raw[k] || copy[k] ? body : ''));
html = html.replace(/\{\{\{(\w+)\}\}\}/g, (m, k) => raw[k] ?? '');
html = html.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in copy ? esc(copy[k]) : m));
const left = html.match(/\{\{\w+\}\}/g);
if (left) throw new Error('unfilled page placeholders: ' + left.join(' '));

const styles = [...new Set(reel.sequence.map((it) => it.style))];
const styleSrc = styles.map((id) => `/* ---- styles/${id}/style.js ---- */\n` + read('styles', id, 'style.js'));
const needsMap = styleSrc.some((s) => s.includes('MAPDATA'));
// map data: only the regions the reel's items use (a style reads its region from the "map" param)
function mapData() {
  const src = read('data', 'mapdata.js');
  const all = JSON.parse(src.slice(src.indexOf('=') + 1).trim().replace(/;\s*$/, ''));
  const defs = Object.fromEntries(loadStyleDefs(styles).map((d) => [d.id, d]));
  const used = new Set();
  for (const it of reel.sequence) {
    if (!read('styles', it.style, 'style.js').includes('MAPDATA')) continue;
    const region = deepMerge(defs[it.style].defaults || {}, it.params || {}).map;
    if (typeof region !== 'string' || !all[region]) return src;          // can't tell: ship every region
    used.add(region);
  }
  const pick = Object.fromEntries([...used].map((k) => [k, all[k]]));
  return `/* data/mapdata.js, regions used by this reel: ${[...used].join(', ')} */
window.MAPDATA = ${JSON.stringify(pick)};
`;
}
const pageReel = { name: reel.name, slug: reel.slug, fps, sequence: reel.sequence, page: P };
const js = [
  read('engine', 'engine.js'), read('engine', 'sfx.js'), ...(needsMap ? [mapData()] : []),
  ...styleSrc, `window.REEL = ${JSON.stringify(pageReel)};`, read('page', 'app.js'),
].join('\n;\n').replace(/<\/script/gi, '<\\/script');

const fragment = `<title>${esc(copy.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fontsUrl()}">
<style>
${read('page', 'page.css')}
</style>
${html}
${gsapTags()}
<script>
${js}
</script>
`;
const out = path.resolve(ROOT, flags.out || path.join('showcase', reel.slug, 'page'));
fs.mkdirSync(out, { recursive: true });
const head = (extra = '') => `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">${extra}</head><body>\n`;
if (flags.site) {
  // website build (tools/build-site.mjs): one full document, with a link back to the site's home page
  const home = typeof flags.site === 'string' ? flags.site : '../../';
  const page = fragment.replace('<div class="spec">', `<div class="spec"><a href="${home}" style="color:var(--amber);text-decoration:none;margin-right:20px">&larr; All reels &amp; styles</a>`);
  const desc = `<meta name="description" content="${esc(copy.lede)}"><meta property="og:title" content="${esc(copy.title)}"><meta property="og:description" content="${esc(copy.lede)}">`;
  fs.writeFileSync(path.join(out, 'index.html'), head(desc) + page + '</body></html>\n');
} else {
  fs.writeFileSync(path.join(out, 'index.html'), fragment);
  fs.writeFileSync(path.join(out, 'preview.html'), head() + fragment + '</body></html>\n');
}
console.log(`${path.relative(ROOT, out)}/index.html ${(fragment.length / 1024).toFixed(0)} KB · ${styles.length} styles${needsMap ? ' + map data' : ''} · ${reel.sequence.length} items`);
