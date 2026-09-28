#!/usr/bin/env node
// Generate an interactive dev page for a style or a reel and print its path.
//   node tools/dev.mjs finance-growth-curve [--params styles/finance-growth-curve/examples/index-fund-weekly.json]
//   node tools/dev.mjs reels/opus-5.5-showcase.json [--item finance]
// Open the printed file in Chrome: space = play, arrows = step, m = sound, l = loop, "," = slow motion.
import { pathToFileURL } from 'node:url';
import { resolveTarget, writeDevPage, parseArgs } from './lib.mjs';

const { flags, pos } = parseArgs(process.argv.slice(2));
if (!pos[0]) { console.log('usage: node tools/dev.mjs <style-id | reels/x.json> [--params file.json] [--item key]'); process.exit(1); }
const file = writeDevPage(resolveTarget(pos[0], { params: flags.params, item: flags.item }));
console.log(pathToFileURL(file).href);
