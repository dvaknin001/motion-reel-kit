// Shared helpers for every tool: paths, style discovery, reel resolution, dev-page generation.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* ---------- Chrome (any Chromium works) ---------- */
// $CHROME wins; then the usual install locations per OS; then a Chrome for Testing in .chrome/
// (npx @puppeteer/browsers install chrome@stable --path .chrome).
function findChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  const env = process.env, home = os.homedir();
  const pf = env.PROGRAMFILES || 'C:/Program Files', pf86 = env['PROGRAMFILES(X86)'] || 'C:/Program Files (x86)';
  const known = {
    win32: [`${pf}/Google/Chrome/Application/chrome.exe`, `${pf86}/Google/Chrome/Application/chrome.exe`,
      `${env.LOCALAPPDATA || home + '/AppData/Local'}/Google/Chrome/Application/chrome.exe`,
      `${pf86}/Microsoft/Edge/Application/msedge.exe`, `${pf}/Microsoft/Edge/Application/msedge.exe`],
    darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', `${home}/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`,
      '/Applications/Chromium.app/Contents/MacOS/Chromium', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'],
    linux: ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/snap/bin/chromium', '/usr/bin/microsoft-edge'],
  }[process.platform] || [];
  const hit = known.find((p) => fs.existsSync(p));
  if (hit) return hit;
  const cft = path.join(ROOT, '.chrome', 'chrome');
  if (fs.existsSync(cft)) {
    for (const v of fs.readdirSync(cft).sort().reverse()) {
      for (const sub of fs.readdirSync(path.join(cft, v))) {
        const base = path.join(cft, v, sub);
        for (const exe of ['chrome.exe', 'chrome', 'Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing']) if (fs.existsSync(path.join(base, exe))) return path.join(base, exe);
      }
    }
  }
  return null;
}
export const CHROME = findChrome();
export function chromePath() {
  if (!CHROME) throw new Error('Chrome not found. Install Google Chrome (or Chromium/Edge), or run\n  npx @puppeteer/browsers install chrome@stable --path .chrome\nor set CHROME=/path/to/chrome. `npm run doctor` checks your setup.');
  return CHROME;
}
// Launch flags every renderer shares. D3D11 ANGLE is Windows-only; other platforms keep Chrome's default GPU path.
export const CHROME_ARGS = ['--hide-scrollbars', '--force-color-profile=srgb', '--disable-lcd-text', '--allow-file-access-from-files',
  '--ignore-gpu-blocklist', '--enable-gpu-rasterization', ...(process.platform === 'win32' ? ['--use-angle=d3d11'] : [])];

/* ---------- FFmpeg ---------- */
// $FFMPEG wins; then ffmpeg on PATH; then the ffmpeg-static binary that `npm install` downloads.
let ffmpegCache;
export function ffmpegPath() {
  if (ffmpegCache) return ffmpegCache;
  if (process.env.FFMPEG) return (ffmpegCache = process.env.FFMPEG);
  if (spawnSync('ffmpeg', ['-hide_banner', '-version'], { encoding: 'utf8' }).status === 0) return (ffmpegCache = 'ffmpeg');
  try {
    const p = createRequire(import.meta.url)('ffmpeg-static');
    if (p && fs.existsSync(p)) return (ffmpegCache = p);
  } catch { /* not installed */ }
  throw new Error('FFmpeg not found. Run `npm install` (it downloads a copy), install FFmpeg on your PATH, or set FFMPEG=/path/to/ffmpeg.');
}
export const GSAP = '3.15.0';
export const GSAP_LIBS = ['gsap', 'DrawSVGPlugin', 'SplitText', 'CustomEase', 'MotionPathPlugin', 'MorphSVGPlugin'];
export const gsapTags = () => GSAP_LIBS.map((f) => `<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/${GSAP}/${f}.min.js"></script>`).join('\n');
export const fontsUrl = () => fs.readFileSync(path.join(ROOT, 'engine', 'engine.js'), 'utf8').match(/FONTS_URL:\s*'([^']+)'/)[1];
export const readJSON = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
export const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '');

export function listStyles() {
  const dir = path.join(ROOT, 'styles');
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('_') && fs.existsSync(path.join(dir, d.name, 'style.js')))
    .map((d) => d.name).sort();
}

/**
 * Style definitions without a browser: runs each styles/<id>/style.js in a sandbox with a stub Reel and
 * returns the plain definitions (id, name, niches, duration, defaults, meta fields…; build() is never called).
 */
export function loadStyleDefs(ids = listStyles()) {
  const defs = [];
  for (const id of ids) {
    const file = path.join(ROOT, 'styles', id, 'style.js');
    const found = [];
    const Reel = new Proxy({ style: (d) => (found.push(d), d), scene: (d) => (found.push(d), d) }, { get: (o, k) => (k in o ? o[k] : () => {}) });
    const sandbox = { Reel, console, MAPDATA: {} };
    sandbox.window = sandbox;
    vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
    if (!found.length) throw new Error(`${id}/style.js did not call Reel.style()`);
    defs.push(...found);
  }
  return defs;
}
export function examplesOf(id) {
  const dir = path.join(ROOT, 'styles', id, 'examples');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => ({ name: f.replace(/\.json$/, ''), file: `styles/${id}/examples/${f}`, params: readJSON(path.join(dir, f)) }));
}

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
export function deepMerge(a, b) {
  const out = isObj(a) ? { ...a } : {};
  if (!isObj(b)) return out;
  for (const k of Object.keys(b)) out[k] = isObj(b[k]) && isObj(out[k]) ? deepMerge(out[k], b[k]) : b[k];
  return out;
}
function resolvePath(p, baseDir) {
  for (const cand of [path.resolve(baseDir, p), path.resolve(ROOT, p)]) if (fs.existsSync(cand)) return cand;
  throw new Error(`File not found: ${p}`);
}

/**
 * Resolve a render target into a normalized reel:
 *   { name, slug, fps, lufs, page, sequence: [{ key, style, params, meta, trans, mix, alpha, role }] }
 * target: a style id ("finance-growth-curve") or a reel file ("reels/opus-5.5-showcase.json").
 * opts.params: JSON file merged into the params (single-style targets, or the --item of a reel).
 * opts.item:   keep only this sequence key (renders one piece of a reel on its own).
 */
export function resolveTarget(target, opts = {}) {
  let reel, baseDir = ROOT;
  const asFile = target.endsWith('.json') ? path.resolve(ROOT, target) : null;
  if (asFile && fs.existsSync(asFile)) {
    reel = readJSON(asFile); baseDir = path.dirname(asFile);
    reel.slug = reel.slug || slugify(path.basename(asFile, '.json'));
  } else if (listStyles().includes(target)) {
    reel = { name: target, slug: target, sequence: [{ style: target }] };
  } else {
    throw new Error(`Unknown target "${target}". Use a style id (${listStyles().join(', ')}) or a reel .json file.`);
  }
  const known = new Set(listStyles()), keys = new Set();
  reel.sequence = (reel.sequence || []).map((it, i) => {
    if (!known.has(it.style)) throw new Error(`Reel item ${i} uses unknown style "${it.style}"`);
    let params = {};
    if (it.paramsFile) params = readJSON(resolvePath(it.paramsFile, baseDir));
    if (typeof it.params === 'string') params = deepMerge(params, readJSON(resolvePath(it.params, baseDir)));
    else if (it.params) params = deepMerge(params, it.params);
    let key = it.key || it.style;
    while (keys.has(key)) key += '-' + (i + 1);
    keys.add(key);
    const { paramsFile, ...rest } = it;   // keep role, alpha, label… for the tools that read them
    return { ...rest, key, params };
  });
  if (opts.item) {
    reel.sequence = reel.sequence.filter((it) => it.key === opts.item).map((it) => ({ ...it, trans: undefined }));
    if (!reel.sequence.length) throw new Error(`No item "${opts.item}" in ${target}`);
    reel.slug += '--' + opts.item;
  }
  if (opts.params) {
    const extra = readJSON(path.resolve(ROOT, opts.params));
    if (reel.sequence.length !== 1) throw new Error('--params needs a single-style target (a style id, or a reel with --item)');
    reel.sequence[0].params = deepMerge(reel.sequence[0].params, extra);
    reel.slug += '--' + slugify(path.basename(opts.params, '.json'));
  }
  return reel;
}

/** Write build/dev-<slug>.html that loads the engine, map data, the needed styles and the reel. */
export function writeDevPage(reel) {
  const styles = [...new Set(reel.sequence.map((it) => it.style))];
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${reel.name} · dev</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fontsUrl()}">
<style>
html,body{margin:0;background:#101012;overflow:hidden;font:12px/1.4 ui-monospace,monospace;color:#bbb}
#stage{position:absolute;left:0;top:0;width:1920px;height:1080px;overflow:hidden;background:#000;transform-origin:0 0}
#hud{position:absolute;left:0;height:40px}
#hud .bar{height:10px;background:#2a2a2e;cursor:pointer;margin-top:6px}#hud .fill{height:100%;background:#e6a23c;width:0}
#hud .lab{padding:4px 6px;white-space:nowrap}
body.render #hud{display:none}
</style>
${gsapTags()}
<script src="../engine/engine.js"></script>
<script src="../engine/sfx.js"></script>
<script src="../data/mapdata.js"></script>
${styles.map((id) => `<script src="../styles/${id}/style.js"></script>`).join('\n')}
<script>window.REEL = ${JSON.stringify(reel)};</script>
</head><body><div id="stage"></div><div id="hud"><div class="bar"><div class="fill"></div></div><div class="lab"></div></div>
<script src="../engine/dev-boot.js"></script>
</body></html>`;
  fs.mkdirSync(path.join(ROOT, 'build'), { recursive: true });
  const file = path.join(ROOT, 'build', `dev-${reel.slug}.html`);
  fs.writeFileSync(file, html);
  return file;
}

/** JSON for humans: 2-space indent, arrays of plain values on one line, short objects in arrays on one line. */
const inline = (x) => (Array.isArray(x) ? '[' + x.map(inline).join(', ') + ']'
  : x && typeof x === 'object' ? '{ ' + Object.keys(x).map((k) => JSON.stringify(k) + ': ' + inline(x[k])).join(', ') + ' }'
    : JSON.stringify(x));
export function pretty(v, ind = '') {
  const nx = ind + '  ';
  if (Array.isArray(v)) {
    if (!v.length) return '[]';
    if (v.every((x) => x === null || typeof x !== 'object')) return inline(v);
    return '[\n' + v.map((x) => { const one = inline(x); return nx + (one.length <= 100 ? one : pretty(x, nx)); }).join(',\n') + '\n' + ind + ']';
  }
  if (v && typeof v === 'object') {
    const ks = Object.keys(v);
    if (!ks.length) return '{}';
    if (ind && ks.every((k) => v[k] === null || typeof v[k] !== 'object') && inline(v).length <= 90) return inline(v);
    return '{\n' + ks.map((k) => nx + JSON.stringify(k) + ': ' + pretty(v[k], nx)).join(',\n') + '\n' + ind + '}';
  }
  return JSON.stringify(v);
}

/* ---------- publishing: file names, GitHub coordinates, release assets ---------- */
/** File-name stem of a reel's renders: reel.fileBase, or the name with spaces as dashes. */
export const fileBase = (reel) => reel.fileBase || reel.name.replace(/[^A-Za-z0-9.]+/g, '-').replace(/^-|-$/g, '');
/** Every reel config in reels/ (not the _template). */
export const listReels = () => fs.readdirSync(path.join(ROOT, 'reels')).filter((f) => f.endsWith('.json') && !f.startsWith('_')).sort().map((f) => `reels/${f}`);
/** GitHub owner/repo/tag from package.json (repository.url and version). */
export function repoInfo() {
  const pkg = readJSON(path.join(ROOT, 'package.json'));
  const m = String((pkg.repository && pkg.repository.url) || '').match(/github\.com[/:]([^/]+)\/([^/.]+)/);
  const owner = m && m[1], repo = m && m[2], tag = 'v' + pkg.version;
  return {
    owner, repo, tag, version: pkg.version, homepage: pkg.homepage,
    url: m ? `https://github.com/${owner}/${repo}` : null,
    assetUrl: (name) => (m ? `https://github.com/${owner}/${repo}/releases/download/${tag}/${encodeURIComponent(name)}` : name),
  };
}
/** The rendered files of a reel that exist in showcase/<slug>/, with unique names for a GitHub Release. */
export function releaseAssets(reel) {
  const dir = path.join(ROOT, 'showcase', reel.slug), base = fileBase(reel), fps = reel.fps || 60, out = [];
  const add = (kind, file, name, extra = {}) => {
    const local = path.join(dir, file);
    if (fs.existsSync(local)) out.push({ reel: reel.slug, kind, local, name, size: fs.statSync(local).size, ...extra });
  };
  add('reel', `${base}-1080p${fps}.mp4`, `${base}-1080p${fps}.mp4`);
  add('share', `${base}-720p-share.mp4`, `${base}-720p-share.mp4`);
  reel.sequence.filter((it) => !it.role).forEach((it, i) => {
    const nn = String(i + 1).padStart(2, '0');
    add('piece', `pieces/${nn}-${it.key}.mp4`, `${base}-${nn}-${it.key}.mp4`, { key: it.key, n: i + 1 });
  });
  reel.sequence.filter((it) => it.alpha).forEach((it) => add('alpha', `${it.key}-alpha.mov`, `${base}-${it.key}-alpha.mov`, { key: it.key }));
  return out;
}

/** Minimal flag parser: positional args + --key value / --flag. */
export function parseArgs(argv) {
  const flags = {}, pos = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) { const k = a.slice(2), nx = argv[i + 1]; if (nx !== undefined && !nx.startsWith('--')) { flags[k] = nx; i++; } else flags[k] = true; }
    else pos.push(a);
  }
  return { flags, pos };
}
