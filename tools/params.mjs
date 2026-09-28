#!/usr/bin/env node
/*
  Style params, without opening a browser.

  node tools/params.mjs --list                          every style: id, name, length, primary niches, examples
  node tools/params.mjs <style-id>                      print the default params (start a params file from these)
  node tools/params.mjs <style-id> --out my.json        write them to a file (refuses to overwrite without --force)
  node tools/params.mjs <style-id> --examples           list the style's example params files
*/
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, listStyles, loadStyleDefs, examplesOf, parseArgs, pretty } from './lib.mjs';

const { flags, pos } = parseArgs(process.argv.slice(2));
if (flags.list) {
  const defs = loadStyleDefs().sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  for (const d of defs) {
    console.log(`${d.id.padEnd(24)} ${(d.name || d.title || '').padEnd(22)} ${String(d.duration).padStart(4)} s  ${(d.niches?.primary || [d.niche]).join(', ')}  [${examplesOf(d.id).length} example${examplesOf(d.id).length === 1 ? '' : 's'}]`);
  }
  process.exit(0);
}
const id = pos[0];
if (!id || !listStyles().includes(id)) { console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('*/')[0]); if (id) console.log(`unknown style "${id}"`); process.exit(1); }
if (flags.examples) {
  for (const e of examplesOf(id)) console.log(`${e.file.padEnd(60)} ${(e.params.meta && e.params.meta.niche) || ''} · ${(e.params.meta && e.params.meta.title) || ''}`);
  process.exit(0);
}
const [def] = loadStyleDefs([id]);
const json = pretty(def.defaults || {}) + '\n';
if (flags.out) {
  const out = path.resolve(ROOT, flags.out);
  if (fs.existsSync(out) && !flags.force) { console.log(`${flags.out} exists (add --force to overwrite)`); process.exit(1); }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, json);
  console.log(`wrote ${path.relative(ROOT, out)}: edit what you need, delete what you don't (missing keys fall back to the defaults)`);
} else process.stdout.write(json);
