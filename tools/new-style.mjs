#!/usr/bin/env node
/*
  Scaffold a new style.

  node tools/new-style.mjs <new-id> [--name "Display Name"]                 from styles/_template (a working title card)
  node tools/new-style.mjs <new-id> [--name "Display Name"] --from <style>  fork an existing style's code

  Ids read <niche>-<technique>, e.g. "fitness-rep-counter". A fork gets its own random seed, a fresh README from
  the template and no examples. Then: edit style.js, iterate with `node tools/render.mjs sheet <new-id>`, and when
  it's final, `node tools/regress.mjs snapshot <new-id>` to record its goldens (see docs/STYLE_AUTHORING.md).
*/
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, listStyles, parseArgs } from './lib.mjs';

const { flags, pos } = parseArgs(process.argv.slice(2));
const id = pos[0];
if (!id) { console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('*/')[0]); process.exit(1); }
if (!/^[a-z0-9]+(-[a-z0-9]+)+$/.test(id)) throw new Error(`style id "${id}" must be kebab-case with at least two parts, e.g. fitness-rep-counter`);
const dir = path.join(ROOT, 'styles', id);
if (fs.existsSync(dir)) throw new Error(`styles/${id} already exists`);
const name = flags.name || id.split('-').slice(1).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
const T = path.join(ROOT, 'styles', '_template');
const fill = (s) => s.replace(/\{\{ID\}\}/g, id).replace(/\{\{NAME\}\}/g, name);

let src;
if (flags.from) {
  if (!listStyles().includes(flags.from)) throw new Error(`unknown style ${flags.from}`);
  src = fs.readFileSync(path.join(ROOT, 'styles', flags.from, 'style.js'), 'utf8');
  const before = src;
  src = src.replace(new RegExp(`id: '${flags.from}'`), `id: '${id}'`)
    .replace(/\bseed: '[^']*',\s*/, '')                       // a new style gets its own random layout
    .replace(/\bname: '[^']*'/, `name: '${name.replace(/'/g, "\\'")}'`)
    .replace(/\border: \d+/, 'order: 50');
  if (src === before || !src.includes(`id: '${id}'`)) throw new Error('could not rewrite the id in the forked style.js');
  src = `/* Forked from ${flags.from} by tools/new-style.mjs. Update this header, name, niches and defaults. */\n` + src;
} else {
  src = fill(fs.readFileSync(path.join(T, 'style.js'), 'utf8'));
}
fs.mkdirSync(path.join(dir, 'examples'), { recursive: true });
fs.writeFileSync(path.join(dir, 'style.js'), src);
fs.writeFileSync(path.join(dir, 'README.md'), fill(fs.readFileSync(path.join(T, 'README.md'), 'utf8')));
console.log(`created styles/${id}/ (style.js, README.md, examples/)${flags.from ? ` forked from ${flags.from}` : ''}

next:
  node tools/render.mjs sheet ${id}                  look at it (build/qa/${id}-sheet.png)
  node tools/dev.mjs ${id}                           open it in a browser: space plays, arrows step frames, m toggles sound
  node tools/render.mjs frame ${id} <poster> --out styles/${id}/poster.jpg
  node tools/regress.mjs snapshot ${id}              once it's final: record goldens so later edits can't drift
  node tools/catalog.mjs                             refresh the README block, styles/README.md and docs/NICHE-MAP.md`);
