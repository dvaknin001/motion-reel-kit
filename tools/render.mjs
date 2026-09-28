#!/usr/bin/env node
/*
  Frame-exact renderer (headless Chrome + FFmpeg). <target> = a style id or a reel file (reels/*.json).

  node tools/render.mjs sheet <target> [t1,t2,...] [--n 12] [--cols 4] [--w 480]   contact sheet -> build/qa/<slug>-sheet.png
  node tools/render.mjs strip <target> <from> <to> <step> [--cols 6]               motion strip  -> build/qa/<slug>-strip.png
  node tools/render.mjs frame <target> <t>                                         full-res PNG  -> build/qa/<slug>-<t>.png
  node tools/render.mjs video <target> [--fps 60] [--workers 8] [--crf 16] [--out f.mp4] [--no-audio] [--lufs -15]
  node tools/render.mjs video <target> --alpha                                     transparent ProRes 4444 .mov
  node tools/render.mjs audio <target> [--out f.wav]
  node tools/render.mjs info <target>                                              timing of every item
  node tools/render.mjs posters <target> [--all] [--cols 4] [--w 480]              poster frame of every piece -> build/qa/<slug>-posters.png
  node tools/render.mjs sfxtest                                                    level table of every sound

  Options for any command: --params <file.json> (style targets), --item <key> (one item of a reel).
  Page errors and console warnings are printed; fix every one of them.
*/
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ROOT, chromePath, CHROME_ARGS, ffmpegPath, resolveTarget, writeDevPage, parseArgs } from './lib.mjs';

const { flags, pos } = parseArgs(process.argv.slice(2));
const [cmd, target] = pos;
if (!cmd) { console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0]); process.exit(0); }
const reel = resolveTarget(cmd === 'sfxtest' ? target || 'finance-growth-curve' : target, { params: flags.params, item: flags.item });
// posters: every item stands alone (no transition overlaps), so each poster frame is clean
if (cmd === 'posters') { reel.sequence = reel.sequence.map((it) => ({ ...it, trans: undefined })); reel.slug += '--posters'; }
const DEV_URL = pathToFileURL(writeDevPage(reel)).href;
const QA = path.join(ROOT, 'build', 'qa');
fs.mkdirSync(QA, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: chromePath(), headless: true, protocolTimeout: 600000,
  args: [...CHROME_ARGS, '--autoplay-policy=no-user-gesture-required',
    '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'],
  defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
});

async function open() {
  const page = await browser.newPage();
  const logs = [];
  page.on('pageerror', (e) => logs.push('PAGE ERROR: ' + ((e && e.message) || e)));
  page.on('console', (m) => { const ty = m.type(); if (ty === 'error' || ty === 'warn' || ty === 'warning') logs.push(`${ty.toUpperCase()}: ${m.text()}`); });
  page.on('requestfailed', (r) => logs.push('REQUEST FAILED: ' + r.url()));
  await page.goto(`${DEV_URL}?render=1${flags.alpha ? '&alpha=1' : ''}`, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.__rl && window.Reel', { timeout: 60000 });
  let info;
  try { info = await page.evaluate(() => window.__rl.init()); }
  catch (e) { logs.forEach((l) => console.log('  ' + l)); throw new Error('init failed: ' + e.message); }
  const cdp = await page.createCDPSession();
  if (flags.alpha) await cdp.send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  return { page, cdp, info, logs };
}
async function grab(ctx, t, format = 'png') {
  await ctx.page.evaluate((tt) => window.__rl.seek(tt), t);
  const { data } = await ctx.cdp.send('Page.captureScreenshot', {
    format, ...(format === 'jpeg' ? { quality: 90 } : {}),
    clip: { x: 0, y: 0, width: 1920, height: 1080, scale: 1 }, optimizeForSpeed: true, captureBeyondViewport: false,
  });
  return Buffer.from(data, 'base64');
}
function printLogs(ctx) {
  const uniq = [...new Set(ctx.logs)];
  if (uniq.length) { console.log(`--- ${uniq.length} page message(s):`); uniq.slice(0, 40).forEach((l) => console.log('  ' + l)); }
  else console.log('--- no page errors or warnings');
}
async function composeSheet(frames, cols, w, out, title) {
  const h = Math.round((w * 9) / 16);
  const html = `<html><body style="margin:0;background:#1b1b1e;font:600 14px ui-monospace,monospace;color:#cfcfcf">
  <div id="g" style="display:inline-grid;grid-template-columns:repeat(${cols},${w}px);gap:8px;padding:8px">
  ${frames.map((f) => `<div><img src="data:image/jpeg;base64,${f.b64}" style="width:${w}px;height:${h}px;display:block"><div style="padding:3px 0 0">${f.label || `${title} · t=${f.t.toFixed(2)}s`}</div></div>`).join('')}
  </div></body></html>`;
  const p = await browser.newPage();
  await p.setViewport({ width: cols * (w + 8) + 8, height: 200, deviceScaleFactor: 1 });
  await p.setContent(html, { waitUntil: 'load' });
  await (await p.$('#g')).screenshot({ path: out });
  await p.close();
}
const run = (bin, args) => new Promise((res, rej) => { const p = spawn(bin, args, { stdio: ['ignore', 'inherit', 'inherit'] }); p.on('close', (c) => (c === 0 ? res() : rej(new Error(`${bin} exited ${c}`)))); });
const lufsOf = (file) => new Promise((res) => { let err = ''; const p = spawn(ffmpegPath(), ['-hide_banner', '-i', file, '-af', 'ebur128=framelog=quiet', '-f', 'null', '-']); p.stderr.on('data', (d) => (err += d)); p.on('close', () => { const m = err.match(/I:\s+(-?[\d.]+) LUFS/g); res(m ? parseFloat(m.pop().split(/\s+/)[1]) : -99); }); });

try {
  const slug = reel.slug;
  if (cmd === 'sheet' || cmd === 'strip') {
    const ctx = await open();
    const dur = ctx.info.duration;
    let times;
    if (cmd === 'strip') { const [a, b, st] = pos.slice(2).map(Number); times = []; for (let t = a; t <= b + 1e-6; t += st) times.push(+t.toFixed(4)); }
    else if (pos[2]) times = pos[2].split(',').map(Number);
    else { const n = +(flags.n || 12); times = Array.from({ length: n }, (_, i) => +(((i + 0.5) * dur) / n).toFixed(3)); }
    const frames = [];
    for (const t of times) frames.push({ t, b64: (await grab(ctx, t, 'jpeg')).toString('base64') });
    const cols = +(flags.cols || (cmd === 'strip' ? 6 : 4)), w = +(flags.w || (cmd === 'strip' ? 320 : 480));
    const out = flags.out ? path.resolve(ROOT, flags.out) : path.join(QA, `${slug}-${cmd}.png`);
    await composeSheet(frames, cols, w, out, slug);
    console.log(`duration ${dur.toFixed(2)}s · ${ctx.info.cues} sound cues · wrote ${out}`);
    printLogs(ctx);
  } else if (cmd === 'frame') {
    const ctx = await open();
    const t = +pos[2];
    const out = flags.out ? path.resolve(ROOT, flags.out) : path.join(QA, `${slug}-${t.toFixed(2)}.png`);
    fs.writeFileSync(out, await grab(ctx, t, out.endsWith('.jpg') ? 'jpeg' : 'png'));
    console.log(`wrote ${out}`);
    printLogs(ctx);
  } else if (cmd === 'posters') {
    const ctx = await open();
    const role = (key) => (reel.sequence.find((it) => it.key === key) || {}).role;
    const scenes = ctx.info.scenes.filter((sc) => flags.all || !role(sc.key));
    const frames = [];
    for (const [i, sc] of scenes.entries()) {
      const t = sc.start + (sc.poster ?? (sc.end - sc.start) * 0.8);
      frames.push({ t, label: `${String(i + 1).padStart(2, '0')} · ${sc.key} · ${sc.id}`, b64: (await grab(ctx, t, 'jpeg')).toString('base64') });
    }
    const out = flags.out ? path.resolve(ROOT, flags.out) : path.join(QA, `${reel.slug}.png`);
    await composeSheet(frames, +(flags.cols || 4), +(flags.w || 480), out, reel.slug);
    console.log(`${frames.length} posters · wrote ${out}`);
    printLogs(ctx);
  } else if (cmd === 'info') {
    const ctx = await open();
    console.log(`${reel.name} · duration ${ctx.info.duration.toFixed(2)}s · ${ctx.info.cues} cues`);
    ctx.info.scenes.forEach((s) => console.log(`  ${s.key.padEnd(22)} ${s.id.padEnd(22)} ${s.start.toFixed(2).padStart(7)} → ${s.end.toFixed(2).padStart(7)}`));
    printLogs(ctx);
  } else if (cmd === 'audio') {
    const ctx = await open();
    const { b64, stats } = await ctx.page.evaluate(() => window.__rl.wav(48000));
    const out = flags.out ? path.resolve(ROOT, flags.out) : path.join(QA, `${slug}.wav`);
    fs.writeFileSync(out, Buffer.from(b64, 'base64'));
    console.log(`wrote ${out} · peak ${stats.peak.toFixed(3)} · rms ${stats.rms.toFixed(4)} · ${(await lufsOf(out)).toFixed(1)} LUFS`);
    printLogs(ctx);
  } else if (cmd === 'sfxtest') {
    const ctx = await open();
    console.table(await ctx.page.evaluate(() => window.__rl.sfxTest()));
    printLogs(ctx);
  } else if (cmd === 'video') {
    const fps = +(flags.fps || reel.fps || 60), workers = +(flags.workers || 8), crf = flags.crf || '16';
    const probe = await open();
    const dur = probe.info.duration; printLogs(probe); await probe.page.close();
    const N = Math.round(dur * fps), chunk = Math.ceil(N / workers);
    const tmp = path.join(ROOT, 'build', `tmp_${slug}_${Date.now()}`);
    fs.mkdirSync(tmp, { recursive: true });
    const started = Date.now(); let done = 0;
    const tick = setInterval(() => { const el = (Date.now() - started) / 1000; process.stdout.write(`\r  ${done}/${N} frames · ${(done / el || 0).toFixed(1)} fps · ${el.toFixed(0)}s   `); }, 2000);
    await Promise.all(Array.from({ length: workers }, async (_, w) => {
      const a = w * chunk, b = Math.min(N, a + chunk);
      if (a >= b) return;
      const ctx = await open();
      const enc = flags.alpha
        ? ['-c:v', 'prores_ks', '-profile:v', '4444', '-pix_fmt', 'yuva444p10le', '-vendor', 'apl0', '-r', String(fps), path.join(tmp, `c${String(w).padStart(2, '0')}.mov`)]
        : ['-c:v', 'libx264', '-preset', 'medium', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-r', String(fps), path.join(tmp, `c${String(w).padStart(2, '0')}.mp4`)];
      const ff = spawn(ffmpegPath(), ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-', ...enc], { stdio: ['pipe', 'inherit', 'inherit'] });
      const closed = new Promise((r) => ff.on('close', r));
      for (let i = a; i < b; i++) {
        const buf = await grab(ctx, i / fps, 'png');
        if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
        done++;
      }
      ff.stdin.end(); await closed; await ctx.page.close();
    }));
    clearInterval(tick);
    console.log(`\n  frames done in ${((Date.now() - started) / 1000).toFixed(0)}s`);
    const ext = flags.alpha ? '.mov' : '.mp4';
    fs.writeFileSync(path.join(tmp, 'list.txt'), fs.readdirSync(tmp).filter((f) => f.endsWith(ext)).sort().map((f) => `file '${path.join(tmp, f).replace(/\\/g, '/')}'`).join('\n'));
    const silent = path.join(tmp, 'video' + ext);
    await run(ffmpegPath(), ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(tmp, 'list.txt'), '-c', 'copy', silent]);
    const out = path.resolve(ROOT, flags.out || path.join('build', 'renders', flags.alpha ? `${slug}-alpha.mov` : `${slug}.mp4`));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    if (flags['no-audio']) fs.copyFileSync(silent, out);
    else {
      const ctx = await open();
      const { b64, stats } = await ctx.page.evaluate(() => window.__rl.wav(48000));
      const wav = path.join(tmp, 'audio.wav'); fs.writeFileSync(wav, Buffer.from(b64, 'base64'));
      // loudness: linear gain to the target + a -1 dBFS limiter (keeps dynamics, unlike single-pass loudnorm)
      const target = +(flags.lufs || reel.lufs || -15), I = await lufsOf(wav), gain = Math.max(-12, Math.min(12, target - I));
      console.log(`  audio peak ${stats.peak.toFixed(3)} · ${I.toFixed(1)} LUFS → gain ${gain.toFixed(1)} dB to ${target} LUFS`);
      await run(ffmpegPath(), ['-y', '-loglevel', 'error', '-i', silent, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
        '-af', `volume=${gain.toFixed(2)}dB,alimiter=limit=0.891:attack=2:release=40:level=0`,
        ...(flags.alpha ? ['-c:a', 'pcm_s16le'] : ['-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart']), '-shortest', out]);
    }
    fs.rmSync(tmp, { recursive: true, force: true });
    console.log(`wrote ${out}`);
  } else {
    console.log('unknown command ' + cmd);
  }
} finally {
  await browser.close();
}
