#!/usr/bin/env node
/*
  Export every deliverable of a reel into showcase/<slug>/:

    <fileBase>-1080p60.mp4        the full reel (H.264 CRF 16, AAC 256k, loudness -15 LUFS, limiter -1 dBFS)
    <fileBase>-720p-share.mp4     a small copy for messages and email (CRF 22)
    pieces/NN-<key>.mp4           every piece on its own (bookends with a "role" are skipped)
    <key>-alpha.mov               ProRes 4444 with alpha for items flagged "alpha": true
    contact-sheet.png             poster frame of every piece
    page/index.html, preview.html the portfolio page (tools/build-page.mjs)

  node tools/export-reel.mjs <reel.json> [--only reel,share,pieces,alpha,sheet,page] [--workers 8] [--fps 60]

  Full export of a 100 s reel at 60 fps takes roughly 20–30 minutes on 8 workers (the pieces re-render
  on their own). Use --only to redo a part, e.g. --only page after editing page copy.
*/
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, resolveTarget, parseArgs, ffmpegPath, fileBase } from './lib.mjs';

const { flags, pos } = parseArgs(process.argv.slice(2));
if (!pos[0]) { console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('*/')[0]); process.exit(1); }
const target = pos[0];
const reel = resolveTarget(target);
const fps = +(flags.fps || reel.fps || 60);
const only = flags.only ? new Set(String(flags.only).split(',')) : null;
const want = (k) => !only || only.has(k);
const OUT = path.join('showcase', reel.slug);
const base = fileBase(reel);
fs.mkdirSync(path.join(ROOT, OUT, want('pieces') ? 'pieces' : ''), { recursive: true });

const node = (args) => {
  console.log(`\n$ node ${args.join(' ')}`);
  const r = spawnSync(process.execPath, args, { cwd: ROOT, stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`failed: node ${args.join(' ')}`);
};
const common = ['--fps', String(fps), '--workers', String(flags.workers || 8)];
const t0 = Date.now();
const master = path.join(OUT, `${base}-1080p${fps}.mp4`);

if (want('reel')) node(['tools/render.mjs', 'video', target, ...common, '--out', master]);
if (want('share')) {
  if (!fs.existsSync(path.join(ROOT, master))) throw new Error(`no master at ${master} (export "reel" first)`);
  const share = path.join(OUT, `${base}-720p-share.mp4`);
  console.log(`\n$ ffmpeg … ${share}`);
  const r = spawnSync(ffmpegPath(), ['-y', '-loglevel', 'error', '-i', master, '-vf', 'scale=1280:720:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-crf', '22',
    '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', share], { cwd: ROOT, stdio: 'inherit' });
  if (r.status !== 0) throw new Error('ffmpeg share copy failed');
}
if (want('pieces')) {
  const pieces = reel.sequence.filter((it) => !it.role);
  pieces.forEach((it, i) => node(['tools/render.mjs', 'video', target, '--item', it.key, ...common, '--out', path.join(OUT, 'pieces', `${String(i + 1).padStart(2, '0')}-${it.key}.mp4`)]));
}
if (want('alpha')) {
  for (const it of reel.sequence.filter((x) => x.alpha)) node(['tools/render.mjs', 'video', target, '--item', it.key, '--alpha', ...common, '--out', path.join(OUT, `${it.key}-alpha.mov`)]);
}
if (want('sheet')) node(['tools/render.mjs', 'posters', target, '--out', path.join(OUT, 'contact-sheet.png')]);
if (want('page')) node(['tools/build-page.mjs', target]);
console.log(`\nexport done in ${((Date.now() - t0) / 60000).toFixed(1)} min → ${OUT}/`);
