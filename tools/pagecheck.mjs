#!/usr/bin/env node
/*
  Loads a built portfolio page headless, reports errors, and screenshots it at rest and while playing.

  node tools/pagecheck.mjs <reel.json | path/to/preview.html> [--w 1440] [--h 900] [--play 2.5] [--full] [--at "#pieces"] [--wait 1]

  A reel file checks showcase/<slug>/page/preview.html (build it first with tools/build-page.mjs).
  Screenshots: build/qa/page-rest-<w>.png and build/qa/page-play-<w>.png
*/
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, chromePath, CHROME_ARGS, resolveTarget, parseArgs } from './lib.mjs';

const { flags, pos } = parseArgs(process.argv.slice(2));
if (!pos[0]) { console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('*/')[0]); process.exit(1); }
const file = pos[0].endsWith('.json') ? path.join(ROOT, 'showcase', resolveTarget(pos[0]).slug, 'page', 'preview.html') : path.resolve(ROOT, pos[0]);
if (!fs.existsSync(file)) throw new Error(`no page at ${file} (run tools/build-page.mjs first)`);
const W = +(flags.w || 1440), H = +(flags.h || 900), PLAY = flags.play === undefined ? 2.5 : +flags.play, FULL = !!flags.full;
const QA = path.join(ROOT, 'build', 'qa');
fs.mkdirSync(QA, { recursive: true });

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: [...CHROME_ARGS, '--autoplay-policy=no-user-gesture-required'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  const logs = [];
  page.on('pageerror', (e) => logs.push('PAGE ERROR: ' + e.message));
  page.on('console', (m) => { if (['error', 'warn', 'warning'].includes(m.type())) logs.push(m.type().toUpperCase() + ': ' + m.text()); });
  const t0 = Date.now();
  await page.goto(pathToFileURL(file).href, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.__page', { timeout: 60000 });
  console.log(`ready in ${Date.now() - t0} ms · ${path.relative(ROOT, file)}`);
  const info = await page.evaluate(() => ({
    duration: +window.__page.player.duration.toFixed(2), cues: window.__page.player.cues.length,
    cards: document.querySelectorAll('#grid .card').length, rules: document.querySelectorAll('#rules-list .rule').length,
    jumps: document.querySelectorAll('.jump').length, beats: document.querySelectorAll('#lane-b .beat').length,
  }));
  console.log('page:', JSON.stringify(info));
  if (flags.wait) await new Promise((r) => setTimeout(r, +flags.wait * 1000));
  if (flags.at) { await page.evaluate((sel) => document.querySelector(sel).scrollIntoView({ block: 'start' }), flags.at); await new Promise((r) => setTimeout(r, 400)); }
  const rest = path.join(QA, `page-rest-${W}${flags.at ? '-at' : ''}.png`);
  await page.screenshot({ path: rest, fullPage: FULL });
  console.log('wrote ' + rest);
  if (PLAY) {
    await page.click('#bigplay');
    await new Promise((r) => setTimeout(r, PLAY * 1000));
    const st = await page.evaluate(() => ({ t: +window.__page.player.t.toFixed(2), playing: window.__page.player.playing, sound: window.__page.audio.on }));
    console.log('after play:', JSON.stringify(st));
    const play = path.join(QA, `page-play-${W}.png`);
    await page.screenshot({ path: play });
    console.log('wrote ' + play);
  }
  console.log(logs.length ? [...new Set(logs)].join('\n') : 'no errors');
} finally {
  await browser.close();
}
