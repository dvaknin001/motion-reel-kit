#!/usr/bin/env node
/*
  Scaffold a reel (a mock résumé): bookends + the pieces you pick, with transitions, mix and page copy
  ready to edit.

  node tools/new-reel.mjs "<Reel Name>" --pieces <style[:example]>,<style[:example]>,... [--title "SHORT TITLE"] [--out reels/x.json]
  node tools/new-reel.mjs "<Reel Name>" --examples            every style with its first example (a second-niche reel)
  node tools/new-reel.mjs "<Reel Name>" --all                 every style with its defaults

  <style:example> uses styles/<style>/examples/<example>.json as the item's params, e.g.
    finance-growth-curve:index-fund-weekly
  Then edit the reel file (order, transitions, page copy) and run:
    node tools/render.mjs sheet reels/<slug>.json            quick look
    node tools/export-reel.mjs reels/<slug>.json             MP4s + portfolio page into showcase/<slug>/
*/
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, listStyles, loadStyleDefs, examplesOf, parseArgs, pretty, slugify } from './lib.mjs';

const { flags, pos } = parseArgs(process.argv.slice(2));
const name = pos[0];
if (!name || !(flags.pieces || flags.examples || flags.all)) { console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('*/')[0]); process.exit(1); }
const BOOKENDS = new Set(['reel-open-bars', 'reel-close-bars']);
const defs = Object.fromEntries(loadStyleDefs().map((d) => [d.id, d]));
const byOrder = Object.values(defs).filter((d) => !BOOKENDS.has(d.id)).sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

let picks;
if (flags.pieces) picks = String(flags.pieces).split(',').map((s) => s.trim()).filter(Boolean).map((s) => { const [style, example] = s.split(':'); return { style, example }; });
else if (flags.examples) picks = byOrder.map((d) => ({ style: d.id, example: (examplesOf(d.id)[0] || {}).name }));
else picks = byOrder.map((d) => ({ style: d.id }));
for (const p of picks) {
  if (!listStyles().includes(p.style)) throw new Error(`unknown style "${p.style}"`);
  if (p.example && !examplesOf(p.style).some((e) => e.name === p.example)) throw new Error(`no example "${p.example}" in styles/${p.style}/examples (have: ${examplesOf(p.style).map((e) => e.name).join(', ') || 'none'})`);
}

// a style's own transIn (the cut that speaks its language) wins; otherwise cycle the house list
const TRANS = [
  { type: 'flash', dur: 0.3 }, { type: 'whip', dur: 0.45, dir: 1 }, { type: 'glitch', dur: 0.36 }, { type: 'zoom', dur: 0.5 },
  { type: 'burn', dur: 0.7 }, { type: 'slash', dur: 0.55 }, { type: 'iris', dur: 0.6 }, { type: 'dip', dur: 0.6 },
  { type: 'swipe', dur: 0.5 }, { type: 'blinds', dur: 0.5, angle: 0, stripe: 12 }, { type: 'push', dur: 0.5, dir: 1 }, { type: 'halftone', dur: 0.55 },
];
const nicheOf = (p) => {
  const ex = p.example && examplesOf(p.style).find((e) => e.name === p.example);
  return (ex && ex.params.meta && ex.params.meta.niche) || defs[p.style].niche || p.style;
};
const keys = new Set();
const keyOf = (p) => { let k = (p.example || p.style.split('-')[0]).replace(/[^a-z0-9]+/gi, '-').toLowerCase(); while (keys.has(k)) k += '-2'; keys.add(k); return k; };
const title = String(flags.title || name).toUpperCase();
const niches = [...new Set(picks.map(nicheOf))];
const words = ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN'];
const n2w = (n) => (words[n] || String(n));
const cap = (w) => w[0] + w.slice(1).toLowerCase();

const sequence = [{ key: 'intro', style: 'reel-open-bars', role: 'open', params: {
  slate: `${title} — MOTION REEL`, title,
  stats: [`${picks.length} PIECES`, `${niches.length} NICHES`, 'EVERY FRAME AND SOUND GENERATED FROM CODE'],
} }];
picks.forEach((p, i) => {
  const it = { key: keyOf(p), style: p.style };
  if (p.example) it.paramsFile = `styles/${p.style}/examples/${p.example}.json`;
  it.trans = defs[p.style].transIn || TRANS[i % TRANS.length];
  sequence.push(it);
});
sequence.push({ key: 'outro', style: 'reel-close-bars', role: 'close', trans: defs['reel-close-bars'].transIn || { type: 'dip', dur: 0.5 }, params: { title } });

const reel = {
  name, fps: 60, lufs: -15,
  about: 'Edit freely: order, transitions (engine/engine.js TR has every type), per-item "mix" trims in dB after listening, "params" / "paramsFile" / "meta" per item. Roles "open"/"close" mark bookends (not listed as pieces on the page).',
  sequence,
  page: {
    title: name, brand: flags.title || name, brandSub: 'Motion reel',
    eyebrow: 'Showreel',
    headline: 'Motion graphics that keep people watching.',
    lede: `${cap(n2w(picks.length))} pieces across ${n2w(niches.length).toLowerCase()} YouTube niches, cut as one reel. Every frame and every sound effect on this page is generated live from code.`,
    resume: [['Role', 'Motion designer for YouTube channels'], ['Niches', niches.join(', ')], ['Output', 'H.264 MP4, 1080p60, 48 kHz stereo; one file per piece plus the full reel']],
    rulesIntro: 'The numbers in this section are measured from the reel\'s own timeline when the page loads.',
    rules: [
      { title: 'Change something every two seconds', text: 'Pattern interrupts reset attention. Across the {pieces} pieces, the longest stretch without a new visual event is {maxGap}.', links: [] },
      { title: 'Put a sound on every hit', text: 'The reel carries {cues} sound cues in {duration}, one every {cueEvery}, each placed on the frame of the event it belongs to.', links: [] },
    ],
    deliver: ['The full reel as an MP4 with sound, loudness-matched to −15 LUFS', 'Each piece as its own MP4', 'Source code for every piece: change a number, a name or a timing and re-render'],
    onRequest: ['9:16 reframes for Shorts', 'Any piece as a transparent overlay for your editor', 'Your channel\'s fonts, colours and sound palette'],
    footer: [name, 'Map data: Natural Earth · Type: Google Fonts · Animation: GSAP'],
  },
};
const out = path.resolve(ROOT, flags.out || path.join('reels', slugify(name) + '.json'));
if (fs.existsSync(out) && !flags.force) throw new Error(`${path.relative(ROOT, out)} exists (add --force to overwrite)`);
fs.writeFileSync(out, pretty(reel) + '\n');
console.log(`wrote ${path.relative(ROOT, out)} · ${picks.length} pieces · ${niches.length} niches: ${niches.join(', ')}
next:
  node tools/render.mjs info ${path.relative(ROOT, out).replace(/\\/g, '/')}
  node tools/render.mjs posters ${path.relative(ROOT, out).replace(/\\/g, '/')}
  node tools/export-reel.mjs ${path.relative(ROOT, out).replace(/\\/g, '/')}`);
