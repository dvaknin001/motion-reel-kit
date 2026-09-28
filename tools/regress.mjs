#!/usr/bin/env node
/*
  Visual regression against golden frames (.regress/golden/<style>/t<time>.(png|jpg) + manifest.json).
  Every style renders deterministically, so default params must reproduce the goldens.

  Goldens are per machine (GPU and font rasterisation differ between computers), so they are not in git.
  On a clean checkout run `npm run baseline` once; after you change a style or the engine, run
  `npm run regress` to prove the defaults still render the same.

  node tools/regress.mjs check [style ...]      compare (all styles in the manifest by default)
  node tools/regress.mjs snapshot <style ...>   goldens for a NEW style (existing ones need --force: only after an
                                                intentional visual change you have reviewed)
  node tools/regress.mjs compact                store goldens as JPEG q92 + exact md5 (small enough to sync)
  node tools/regress.mjs determinism [style …]  play each style frame by frame (30 fps, like a video render) and
                                                compare 3 frames with direct seeks: they must match. Catches state
                                                that depends on playback history (run it on every new style)

  Pass = identical pixels (md5) or PSNR >= 42 dB (visually identical; allows sub-pixel text jitter).
  Failed frames are written to build/regress/<style>/ next to a diff image.
*/
import puppeteer from 'puppeteer-core';
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, chromePath, CHROME_ARGS, ffmpegPath, resolveTarget, writeDevPage, listStyles, readJSON } from './lib.mjs';

const argv = process.argv.slice(2), FORCE = argv.includes('--force');
const [cmd, ...only] = argv.filter((a) => a !== '--force');
const GOLD = path.join(ROOT, '.regress', 'golden');
const MAN = path.join(GOLD, 'manifest.json');
const manifest = fs.existsSync(MAN) ? readJSON(MAN) : {};
const md5 = (buf) => crypto.createHash('md5').update(buf).digest('hex');
const PSNR_OK = 42;

function psnr(a, b) {
  const r = spawnSync(ffmpegPath(), ['-hide_banner', '-i', a, '-i', b, '-lavfi', 'psnr', '-f', 'null', '-'], { encoding: 'utf8' });
  const m = (r.stderr || '').match(/average:(inf|[\d.]+)/);
  return m ? (m[1] === 'inf' ? Infinity : parseFloat(m[1])) : 0;
}

async function renderFrames(browser, style, times) {
  const page = await browser.newPage();
  const logs = [];
  page.on('pageerror', (e) => logs.push('PAGE ERROR: ' + e.message));
  page.on('console', (m) => { if (['error', 'warn', 'warning'].includes(m.type())) logs.push(m.type().toUpperCase() + ': ' + m.text()); });
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(writeDevPage(resolveTarget(style))).href + '?render=1', { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.__rl && window.Reel', { timeout: 60000 });
  const info = await page.evaluate(() => window.__rl.init());
  const cdp = await page.createCDPSession();
  const out = [];
  for (const t of times(info)) {
    await page.evaluate((tt) => window.__rl.seek(tt), t);
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1920, height: 1080, scale: 1 }, optimizeForSpeed: true, captureBeyondViewport: false });
    out.push({ t, buf: Buffer.from(data, 'base64') });
  }
  await page.close();
  return { frames: out, info, logs };
}

if (cmd === 'compact') {
  for (const [style, m] of Object.entries(manifest)) {
    m.md5 = m.md5 || {};
    for (const t of m.times) {
      const png = path.join(GOLD, style, `t${t.toFixed(3)}.png`);
      if (!fs.existsSync(png)) continue;
      m.md5[t.toFixed(3)] = md5(fs.readFileSync(png));
      spawnSync(ffmpegPath(), ['-y', '-loglevel', 'error', '-i', png, '-q:v', '2', path.join(GOLD, style, `t${t.toFixed(3)}.jpg`)]);
      fs.rmSync(png);
    }
  }
  fs.writeFileSync(MAN, JSON.stringify(manifest, null, 2));
  console.log('goldens compacted to JPEG + md5');
  process.exit(0);
}
if (cmd === 'determinism') {
  const ids = only.length ? only : listStyles();
  const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, protocolTimeout: 600000,
    args: CHROME_ARGS,
    defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 } });
  let bad = 0;
  try {
    for (const id of ids) {
      const url = pathToFileURL(writeDevPage(resolveTarget(id))).href + '?render=1';
      const open = async () => {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 120000 });
        await page.waitForFunction('window.__rl && window.Reel', { timeout: 60000 });
        const info = await page.evaluate(() => window.__rl.init());
        return { page, info, cdp: await page.createCDPSession() };
      };
      const grab = async (c) => Buffer.from((await c.cdp.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1920, height: 1080, scale: 1 }, optimizeForSpeed: true })).data, 'base64');
      const seq = await open(), FPS = 30, D = seq.info.duration;
      const at = [0.35, 0.65, 0.95].map((f) => Math.round(D * f * FPS));
      const shots = {};
      for (let i = 0; i <= at[2]; i++) { await seq.page.evaluate((t) => window.__rl.seek(t), i / FPS); if (at.includes(i)) shots[i] = await grab(seq); }
      await seq.page.close();
      const dir = await open(), dirDir = path.join(ROOT, 'build', 'regress', id); fs.mkdirSync(dirDir, { recursive: true });
      const res = [];
      for (const i of at) {
        await dir.page.evaluate((t) => window.__rl.seek(t), i / FPS);
        const b = await grab(dir);
        if (md5(b) === md5(shots[i])) { res.push('='); continue; }
        const fa = path.join(dirDir, `seq-${i}.png`), fb = path.join(dirDir, `direct-${i}.png`);
        fs.writeFileSync(fa, shots[i]); fs.writeFileSync(fb, b);
        const p = psnr(fa, fb); res.push(p.toFixed(0));
        if (p < PSNR_OK) bad++;
      }
      await dir.page.close();
      const ok = res.every((r) => r === '=' || +r >= PSNR_OK);
      console.log(`${ok ? 'pass' : 'FAIL'}  ${id.padEnd(24)} sequential vs direct at ${at.map((i) => (i / FPS).toFixed(2) + 's').join(', ')}: ${res.join(' · ')}${ok ? '' : '  (frames in build/regress/' + id + '/)'}`);
    }
  } finally { await browser.close(); }
  process.exit(bad ? 1 : 0);
}
if (cmd !== 'check' && cmd !== 'snapshot') { console.log('usage: node tools/regress.mjs check|snapshot|compact|determinism [style ...]'); process.exit(1); }

const styles = only.length ? only : cmd === 'snapshot' ? listStyles() : Object.keys(manifest);
if (cmd === 'check' && !Object.keys(manifest).length) {
  console.log(['No baseline on this machine yet. Goldens are per machine, so record them from a clean checkout first:',
    '  npm run baseline', 'then, after your changes:', '  npm run regress'].join('\n'));
  process.exit(1);
}
if (cmd === 'snapshot' && !FORCE) {
  const existing = styles.filter((s) => manifest[s]);
  if (existing.length) { console.log(`refusing to overwrite goldens of ${existing.join(', ')} (defaults must keep matching them). Add --force only after an intentional, reviewed visual change.`); process.exit(1); }
}
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, protocolTimeout: 600000,
  args: CHROME_ARGS,
  defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 } });
let failed = 0;
try {
  for (const style of styles) {
    if (cmd === 'snapshot') {
      const { frames, info } = await renderFrames(browser, style, (info) => {
        const D = info.duration, ts = Array.from({ length: 8 }, (_, i) => +(((i + 0.5) * D) / 8).toFixed(3));
        if (info.scenes[0].poster != null) ts.push(+info.scenes[0].poster.toFixed(3));
        return ts;
      });
      fs.rmSync(path.join(GOLD, style), { recursive: true, force: true });
      fs.mkdirSync(path.join(GOLD, style), { recursive: true });
      manifest[style] = { duration: info.duration, times: frames.map((f) => f.t), md5: {} };
      for (const f of frames) { fs.writeFileSync(path.join(GOLD, style, `t${f.t.toFixed(3)}.png`), f.buf); manifest[style].md5[f.t.toFixed(3)] = md5(f.buf); }
      console.log(`${style}: snapshot ${frames.length} frames`);
      continue;
    }
    const m = manifest[style];
    if (!m) { console.log(`${style}: no goldens (run snapshot)`); failed++; continue; }
    const { frames, logs } = await renderFrames(browser, style, () => m.times);
    let worst = Infinity, exact = 0;
    const bad = [];
    for (const f of frames) {
      const key = f.t.toFixed(3);
      const goldPng = path.join(GOLD, style, `t${key}.png`), goldJpg = path.join(GOLD, style, `t${key}.jpg`);
      const goldMd5 = (m.md5 && m.md5[key]) || (fs.existsSync(goldPng) ? md5(fs.readFileSync(goldPng)) : null);
      if (goldMd5 && goldMd5 === md5(f.buf)) { exact++; continue; }
      const dir = path.join(ROOT, 'build', 'regress', style); fs.mkdirSync(dir, { recursive: true });
      const cur = path.join(dir, `t${key}.png`); fs.writeFileSync(cur, f.buf);
      const ref = fs.existsSync(goldPng) ? goldPng : goldJpg;
      const p = fs.existsSync(ref) ? psnr(ref, cur) : 0;
      worst = Math.min(worst, p);
      if (p < (ref.endsWith('.jpg') ? PSNR_OK - 4 : PSNR_OK)) {
        bad.push(`t=${key} PSNR ${p.toFixed(1)} dB`);
        spawnSync(ffmpegPath(), ['-y', '-loglevel', 'error', '-i', ref, '-i', cur, '-filter_complex', 'blend=all_mode=difference,eq=brightness=0.1:contrast=4', path.join(dir, `t${key}-diff.png`)]);
      }
    }
    const status = bad.length ? 'FAIL' : 'pass';
    if (bad.length) failed++;
    console.log(`${status}  ${style.padEnd(24)} ${exact}/${frames.length} exact${worst < Infinity ? ` · worst PSNR ${worst.toFixed(1)} dB` : ''}${bad.length ? ' · ' + bad.join(', ') : ''}`);
    [...new Set(logs)].slice(0, 5).forEach((l) => console.log('      ' + l));
  }
  if (cmd === 'snapshot') fs.writeFileSync(MAN, JSON.stringify(manifest, null, 2));
} finally {
  await browser.close();
}
if (cmd === 'check') { console.log(failed ? `\n${failed} style(s) failed` : '\nall styles match their goldens'); process.exit(failed ? 1 : 0); }
