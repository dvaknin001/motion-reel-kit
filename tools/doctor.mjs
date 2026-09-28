#!/usr/bin/env node
/*
  First-run check: is this machine ready to render?

  node tools/doctor.mjs            everything (about 30 s): tools, network, every style builds, a test encode
  node tools/doctor.mjs --quick    tools and network only

  Checks Node, FFmpeg (and the encoders/filters the renderer uses), Chrome, that GSAP and the Google Fonts
  load (the renderer needs internet), that every style builds without page errors, and that a short
  H.264 clip with sound encodes. Writes a sample frame to build/qa/doctor-frame.png.
*/
import puppeteer from 'puppeteer-core';
import { spawnSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, CHROME, CHROME_ARGS, ffmpegPath, listStyles, writeDevPage, parseArgs } from './lib.mjs';

const { flags } = parseArgs(process.argv.slice(2));
let failed = 0;
const ok = (msg) => console.log(`  ✓ ${msg}`);
const bad = (msg, fix) => { failed++; console.log(`  ✗ ${msg}${fix ? `\n      fix: ${fix}` : ''}`); };
const QA = path.join(ROOT, 'build', 'qa');
fs.mkdirSync(QA, { recursive: true });

console.log('Motion Reel Kit · doctor\n');

// Node
const major = +process.versions.node.split('.')[0];
if (major >= 20) ok(`Node ${process.versions.node}`); else bad(`Node ${process.versions.node} is too old`, 'install Node 20 or newer (https://nodejs.org)');

// FFmpeg
let FF = null;
try {
  FF = ffmpegPath();
  const ver = (spawnSync(FF, ['-hide_banner', '-version'], { encoding: 'utf8' }).stdout || '').split('\n')[0];
  const enc = spawnSync(FF, ['-hide_banner', '-encoders'], { encoding: 'utf8' }).stdout || '';
  const fil = spawnSync(FF, ['-hide_banner', '-filters'], { encoding: 'utf8' }).stdout || '';
  const need = [['libx264', enc], ['prores_ks', enc], ['aac', enc], ['ebur128', fil], ['alimiter', fil]].filter(([n, s]) => !new RegExp(`\\s${n}\\s`).test(s)).map(([n]) => n);
  if (need.length) bad(`FFmpeg at ${FF} lacks: ${need.join(', ')}`, 'use a full build, or set FFMPEG to the ffmpeg-static binary (npm install downloads one)');
  else ok(`FFmpeg: ${ver.replace(/ Copyright.*/, '')} (${FF === 'ffmpeg' ? 'on PATH' : FF})`);
} catch (e) { bad('FFmpeg not found', e.message.split('\n')[0]); }

// Chrome
if (CHROME && fs.existsSync(CHROME)) ok(`Chrome: ${CHROME}`);
else bad('Chrome not found', 'install Google Chrome, or run: npx @puppeteer/browsers install chrome@stable --path .chrome (or set CHROME=/path/to/chrome)');

if (CHROME) {
  const ids = listStyles();
  const reel = { name: 'doctor', slug: `doctor-${process.pid}`, sequence: ids.map((id) => ({ key: id, style: id, params: {} })) };
  const devPage = writeDevPage(reel);
  let browser;
  try {
    browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: CHROME_ARGS, defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 } });
    const page = await browser.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(String(e.message || e)));
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    page.on('requestfailed', (r) => errs.push('request failed: ' + r.url()));
    await page.goto(pathToFileURL(devPage).href + '?render=1', { waitUntil: 'networkidle0', timeout: 120000 });
    const net = await page.evaluate(() => ({ gsap: !!window.gsap, split: !!window.SplitText, fonts: document.fonts.check('40px "Archivo"') }));
    if (net.gsap && net.split) ok('GSAP loaded from cdnjs'); else bad('GSAP did not load', 'the renderer needs internet access to cdnjs.cloudflare.com');
    if (!flags.quick) {
      await page.waitForFunction('window.__rl && window.Reel', { timeout: 60000 });
      const info = await page.evaluate(() => window.__rl.init());
      const fontsNow = await page.evaluate(() => document.fonts.check('40px "Archivo"') && document.fonts.check('40px "Inter"'));
      if (fontsNow) ok('Google Fonts loaded'); else bad('Google Fonts did not load', 'the renderer needs internet access to fonts.googleapis.com');
      const buildErrs = errs.filter((e) => /failed to build|PAGE|Error/i.test(e));
      if (!buildErrs.length) ok(`all ${info.scenes.length} styles build (${info.duration.toFixed(0)} s of animation, ${info.cues} sound cues)`);
      else bad(`style errors:\n      ${[...new Set(buildErrs)].slice(0, 6).join('\n      ')}`, 'see the message; a style may have been edited into a broken state');
      // one frame to look at
      const fin = info.scenes.find((s) => s.id === 'finance-growth-curve') || info.scenes[0];
      await page.evaluate((t) => window.__rl.seek(t), fin.start + (fin.poster ?? 1));
      await page.screenshot({ path: path.join(QA, 'doctor-frame.png'), clip: { x: 0, y: 0, width: 1920, height: 1080 } });
      ok('rendered a frame: build/qa/doctor-frame.png');
      // test encode: 30 frames + audio through the same FFmpeg path the renderer uses
      if (FF) {
        const out = path.join(QA, 'doctor-encode.mp4');
        const ff = spawn(FF, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'png', '-i', '-', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=1', '-t', '1',
          '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', out], { stdio: ['pipe', 'ignore', 'pipe'] });
        let ferr = ''; ff.stderr.on('data', (d) => (ferr += d));
        const done = new Promise((r) => ff.on('close', r));
        const cdp = await page.createCDPSession();
        for (let i = 0; i < 30; i++) {
          await page.evaluate((t) => window.__rl.seek(t), fin.start + i / 30);
          const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1920, height: 1080, scale: 1 } });
          ff.stdin.write(Buffer.from(data, 'base64'));
        }
        ff.stdin.end();
        const code = await done;
        if (code === 0 && fs.existsSync(out) && fs.statSync(out).size > 10000) ok('encoded a test clip with sound: build/qa/doctor-encode.mp4');
        else bad('test encode failed', ferr.trim().split('\n').slice(-2).join(' ') || `ffmpeg exited ${code}`);
      }
    }
  } catch (e) {
    bad(`Chrome could not run the kit: ${e.message.split('\n')[0]}`, 'check the Chrome path above, or set CHROME to another Chromium build');
  } finally {
    if (browser) await browser.close();
    fs.rmSync(devPage, { force: true });
  }
}

console.log(failed ? `\n${failed} problem(s). Fix them and run npm run doctor again.` : '\nReady. Next: node tools/params.mjs --list, then see README "Make your first video".');
process.exit(failed ? 1 : 0);
