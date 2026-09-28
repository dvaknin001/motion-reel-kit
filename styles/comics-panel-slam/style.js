/* Comics & Pop Culture — Panel Slam
   A 1960s comic page builds panel by panel (storm, eyes, KRAKOOM!), then the camera dives
   into the explosion and the halftone dots become the cut to the issue #1 cover.
   Fictional hero: The Crimson Comet. Every word (caption, balloon, SFX, masthead, cover copy) and the print
   palette come from params and are fitted to their boxes; the panels, art, timing and sound stay in code. */
Reel.style({
  id: 'comics-panel-slam', seed: 'comics', order: 12,
  name: 'Panel Slam',
  transIn: { type: 'halftone', dur: 0.55 },   // how a reel cuts INTO this piece (tools/new-reel.mjs); a reel item's trans overrides it
  niches: {
    primary: ['Comics & pop culture', 'Superhero film & TV', 'Comic book history'],
    similar: ['Movie trailer breakdowns', 'Anime & manga recaps', 'Video game story recaps', 'Webcomic & indie comic promos', 'Origin-story explainers', 'Sports hype intros', 'Personalized hero intros'],
  },
  niche: 'Comics & Pop Culture', title: 'Panel Slam', duration: 7, poster: 6.6,
  bg: '#FFF6E0', palette: ['#E53935', '#FFD400', '#00AEEF'],
  techniques: ['Panel slams with impact shake', 'Letter-by-letter SFX lettering', 'Halftone dot transition'],
  why: 'Each panel lands on its own beat, the KRAKOOM hit pays off a riser, and the dive through the dots turns the payoff into the cover reveal.',
  facts: 'Fictional hero and title; the 12¢ cover price is period-correct, as US newsstand comics rose from 10¢ to 12¢ over 1961–62.',
  defaults: {
    caption: 'MIDNIGHT...',                        // panel 1 caption box; "" hides it
    balloon: { text: 'NOT TONIGHT.', kind: 'speech' },   // panel 2 balloon: speech | thought | shout
    sfx: 'KRAKOOM!',                               // panel 3 lettering, one letter at a time
    hero: 'CRIMSON COMET',                         // the cover masthead
    cover: {
      the: 'THE',                                  // tilted box above the masthead
      price: '12¢',                                // corner box, big
      issue: 'ISSUE #1',                           // corner box, band
      badge: ['FIRST', 'APPEARANCE!'],             // starburst, 1–2 lines
      blurb: ['FROM THE STARS', 'A HERO IS BORN!'],// caption box, 1–3 lines
    },
    padNotes: [261.6, 329.6, 392, 523.3],          // the cover's pad (C major)
    chordNotes: [523.3, 659.3, 784, 1046.5],       // the stab when the cover lands
    droneHz: 55,                                   // the page's low drone
    colors: { yellow: '#FFD400', cyan: '#00AEEF', magenta: '#EC008C', hero: '#E53935', ink: '#151313', paper: '#FFF6E0', skin: '#F8C9A4' },
  },
  build(S, P) {
    const tl = S.tl, CO = P.colors || {}, CV = P.cover || {};
    const clamp = S.clamp;

    /* ---------- colour families: shades drawn around a palette colour follow it; identity at the defaults ---------- */
    const hex2rgb = (h) => { let s = String(h).trim().replace('#', ''); if (s.length === 3) s = s.replace(/./g, '$&$&'); const n = parseInt(s, 16) || 0; return [n >> 16, (n >> 8) & 255, n & 255]; };
    const toHex = (c) => '#' + c.map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('').toUpperCase();
    const toHsl = ([r, g, b]) => {
      r /= 255; g /= 255; b /= 255;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
      if (!d) return [0, 0, l];
      const h = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      return [h * 60, d / (1 - Math.abs(2 * l - 1)), l];
    };
    const fromHsl = ([h, s, l]) => {
      const c = (1 - Math.abs(2 * l - 1)) * s, hp = (((h % 360) + 360) % 360) / 60, x = c * (1 - Math.abs((hp % 2) - 1)), m = l - c / 2;
      const [r, g, b] = hp < 1 ? [c, x, 0] : hp < 2 ? [x, c, 0] : hp < 3 ? [0, c, x] : hp < 4 ? [0, x, c] : hp < 5 ? [x, 0, c] : [c, 0, x];
      return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
    };
    const family = (from, to) => {
      if (!to || String(from).toUpperCase() === String(to).toUpperCase()) return { hex: (h) => h };
      const A = toHsl(hex2rgb(from)), B = toHsl(hex2rgb(to));
      const L = (l) => (l <= A[2] ? (l * B[2]) / A[2] : B[2] + ((l - A[2]) * (1 - B[2])) / (1 - A[2]));
      const map = (c) => { const [h, s, l] = toHsl(c); return fromHsl([h + B[0] - A[0], clamp(A[1] ? (s * B[1]) / A[1] : B[1]), clamp(L(l))]); };
      return { hex: (h) => toHex(map(hex2rgb(h))) };
    };
    const Y = CO.yellow, C = CO.cyan, M = CO.magenta, RED = CO.hero, INK = CO.ink, PAPER = CO.paper;
    const HF = family('#E53935', RED), CF = family('#00AEEF', C), MF = family('#EC008C', M), YF = family('#FFD400', Y);

    /* ---------- text helpers ---------- */
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const measure = (text, css) => { const e = S.el('span', { text, style: `position:absolute;left:0;top:0;white-space:nowrap;visibility:hidden;${css}` }, S.hud); const w = e.offsetWidth; e.remove(); return w; };
    const natural = (el) => { const w0 = el.style.width; el.style.width = 'max-content'; const w = el.offsetWidth; el.style.width = w0; return w; };
    const linesOf = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]).map(String).filter((s) => s.length);
    // the balanced split of `text` at a space: the two halves whose wider one is narrowest
    const split2 = (text, width) => { let best = null; for (let k = text.indexOf(' '); k > 0; k = text.indexOf(' ', k + 1)) { const a = text.slice(0, k), b = text.slice(k + 1), w = Math.max(width(a), width(b)); if (!best || w < best.w) best = { lines: [a, b], w }; } return best; };

    const rad = Math.PI / 180;
    const R = (a, b) => S.rnd(a, b);
    const f2 = (v) => (+v).toFixed(2);
    const MR = [3, 2]; // colour plate out of register with the black plate
    const tex = (w, h, paint) => { const c = document.createElement('canvas'); c.width = w; c.height = h; paint(c.getContext('2d'), w, h); return c.toDataURL('image/png'); };
    const grad = (defs, type, id, attrs, stops) => {
      const g = S.s(type, Object.assign({ id }, attrs), defs);
      stops.forEach(([o, c, a]) => S.s('stop', { offset: o, 'stop-color': c, 'stop-opacity': a ?? 1 }, g));
      return `url(#${id})`;
    };
    // text-shadow builders: a round outline and a stepped 3D extrusion
    const ring = (w, c, n = 16, dx = 0, dy = 0) => Array.from({ length: n }, (_, k) => `${f2(dx + Math.cos((k / n) * 2 * Math.PI) * w)}px ${f2(dy + Math.sin((k / n) * 2 * Math.PI) * w)}px 0 ${c}`);
    const extrude = (n, c, from = 1) => Array.from({ length: n }, (_, k) => `${k + from}px ${k + from}px 0 ${c}`);

    /* ---------- procedural print textures ---------- */
    const paperURL = tex(512, 512, (x, w, h) => {
      x.fillStyle = PAPER; x.fillRect(0, 0, w, h);
      const wrap = (fn) => { for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) { x.save(); x.translate(ox, oy); fn(); x.restore(); } };
      for (let i = 0; i < 46; i++) {
        const cx = R(0, w), cy = R(0, h), r = R(30, 130), a = R(0.02, 0.06);
        wrap(() => { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, `rgba(196,150,70,${a.toFixed(3)})`); g.addColorStop(1, 'rgba(196,150,70,0)'); x.fillStyle = g; x.fillRect(cx - r, cy - r, 2 * r, 2 * r); });
      }
      for (let i = 0; i < 1100; i++) {
        const x0 = R(0, w), y0 = R(0, h), len = R(3, 12), a = R(0, 6.3), dark = S.rand() < 0.6;
        const col = dark ? `rgba(140,110,60,${R(0.06, 0.2).toFixed(3)})` : `rgba(255,255,248,${R(0.3, 0.7).toFixed(3)})`, lw = R(0.5, 1.1);
        wrap(() => { x.strokeStyle = col; x.lineWidth = lw; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x0 + Math.cos(a) * len, y0 + Math.sin(a) * len); x.stroke(); });
      }
      for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(110,80,40,${R(0.1, 0.3).toFixed(3)})`; const s = R(0.6, 1.6); x.fillRect(R(0, w), R(0, h), s, s); }
    });
    // size-modulated halftone (the printed-gradient look), fn(u,v) -> ink coverage 0..1
    const halftone = (w, h, cell, angle, color, fn, k = 0.62) => tex(w, h, (x) => {
      x.fillStyle = color;
      const ca = Math.cos(angle * rad), sa = Math.sin(angle * rad), n = Math.ceil(Math.hypot(w, h) / cell / 2) + 2;
      for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) {
        const px = w / 2 + (i * ca - j * sa) * cell, py = h / 2 + (i * sa + j * ca) * cell;
        if (px < -cell || py < -cell || px > w + cell || py > h + cell) continue;
        const v = fn(S.clamp(px / w), S.clamp(py / h), px, py);
        if (v <= 0.02) continue;
        x.beginPath(); x.arc(px, py, cell * k * Math.sqrt(Math.min(1, v)), 0, Math.PI * 2); x.fill();
      }
    });
    // flat Ben-Day dots (CSS radial-gradient pattern, 45° lattice)
    const benday = (color, cell, r) => `radial-gradient(circle,${color} ${r}px,transparent ${r + 0.9}px) 0 0/${cell}px ${cell}px,radial-gradient(circle,${color} ${r}px,transparent ${r + 0.9}px) ${cell / 2}px ${cell / 2}px/${cell}px ${cell}px`;

    /* ---------- the page ---------- */
    S.camSet({ x: 540, y: 300, z: 1.5, r: -1.2 });
    if (!S.alpha) S.el('div', { style: `position:absolute;left:-240px;top:-240px;width:2400px;height:1560px;background:${PAPER} url(${paperURL}) 0 0/512px 512px;` });
    const BW = 9;
    const panel = (x, y, w, h) => {
      const wrap = S.el('div', { style: `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform-origin:50% 50%;` });
      const clip = S.el('div', { style: `position:absolute;inset:0;overflow:hidden;background:${PAPER};` }, wrap);
      const col = S.el('div', { style: `position:absolute;left:${MR[0]}px;top:${MR[1]}px;width:${w}px;height:${h}px;` }, clip);
      const bg = S.el('div', { style: `position:absolute;inset:0;` }, col);
      const cs = S.svg(col, { width: w, height: h, viewBox: `0 0 ${w} ${h}` });
      const ink = S.svg(clip, { width: w, height: h, viewBox: `0 0 ${w} ${h}` });
      S.el('div', { style: `position:absolute;inset:0;background:url(${paperURL}) 0 0/512px 512px;mix-blend-mode:multiply;opacity:.6;pointer-events:none;` }, clip);
      S.el('div', { style: `position:absolute;inset:0;border:${BW}px solid ${INK};pointer-events:none;` }, wrap);
      return { wrap, col, bg, cs, cd: S.defs(cs), ink, id: S.defs(ink) };
    };
    const P1 = [80, 80, 920, 440], P2 = [1030, 80, 810, 440], P3 = [80, 550, 1760, 450];

    /* ---------- panel 1: the city, a storm, lightning ---------- */
    const p1 = panel(...P1);
    p1.bg.style.background = 'linear-gradient(180deg,#0B1650 0%,#1A2F88 46%,#4B3AA0 78%,#7C44A8 100%)';
    S.el('div', { style: `position:absolute;inset:0;background:url(${halftone(920, 440, 11, 45, M, (u, v) => 0.75 * Math.pow(S.clamp((v - 0.3) / 0.7), 1.5))});opacity:.75;` }, p1.bg);
    // moon + storm clouds
    S.s('circle', { cx: 176, cy: 118, r: 58, fill: '#FFF2AE' }, p1.cs);
    [[156, 102, 11], [194, 136, 8], [170, 146, 6], [200, 100, 5]].forEach(([cx, cy, r]) => S.s('circle', { cx, cy, r, fill: '#EAD27A', opacity: 0.7 }, p1.cs));
    const clouds = S.s('g', { fill: '#0A1033' }, p1.cs);
    [[20, 20, 70], [110, 0, 64], [236, 40, 58], [300, 12, 70], [390, 30, 62], [470, 6, 72], [560, 34, 60], [640, 8, 74], [736, 26, 66], [820, 4, 70], [900, 30, 64], [262, 86, 34], [330, 70, 40]].forEach(([cx, cy, r]) => S.s('circle', { cx, cy, r }, clouds));
    // the bolt (behind the skyline), with glow
    const boltG = S.s('g', { opacity: 0 }, p1.cs);
    const blurId = S.uid('blur');
    S.s('feGaussianBlur', { stdDeviation: 9 }, S.s('filter', { id: blurId, x: '-50%', y: '-50%', width: '200%', height: '200%' }, p1.cd));
    const BOLT = '612,-10 574,58 606,64 552,146 584,150 522,262 548,266 500,380';
    const FORK = '552,146 610,190 598,196 648,236';
    S.s('polyline', { points: BOLT, fill: 'none', stroke: Y, 'stroke-width': 44, opacity: 0.55, filter: `url(#${blurId})`, 'stroke-linejoin': 'round' }, boltG);
    [[BOLT, 15, 6], [FORK, 9, 3.5]].forEach(([pts, w1, w2]) => {
      S.s('polyline', { points: pts, fill: 'none', stroke: Y, 'stroke-width': w1, 'stroke-linejoin': 'miter', 'stroke-miterlimit': 10, 'stroke-linecap': 'round' }, boltG);
      S.s('polyline', { points: pts, fill: 'none', stroke: '#FFFFFF', 'stroke-width': w2, 'stroke-linejoin': 'miter', 'stroke-miterlimit': 10, 'stroke-linecap': 'round' }, boltG);
    });
    const flashOv = S.el('div', { style: 'position:absolute;inset:0;background:radial-gradient(ellipse 70% 90% at 58% 30%,#FFFFFF 0%,#BDF0FF 45%,#7FD8FF 100%);opacity:0;' }, p1.col);
    // back skyline (navy, colour plate) and front skyline (black plate) with lit windows
    const back = S.s('g', { fill: '#231C5C' }, p1.cs);
    let bx = -6;
    while (bx < 930) { const w = R(38, 84), h = R(150, 250); S.s('rect', { x: f2(bx), y: f2(440 - h), width: f2(w), height: f2(h) }, back); if (S.rand() < 0.35 && (bx > 270 || bx + w < 100)) S.s('rect', { x: f2(bx + w / 2 - 2), y: f2(440 - h - R(16, 40)), width: 4, height: 40 }, back); bx += w + R(-6, 4); }
    const FRONT = [[-6, 96, 150], [86, 70, 112], [150, 112, 206], [258, 64, 140], [316, 122, 178], [434, 78, 120], [508, 104, 236, 'deco'], [608, 70, 160], [674, 124, 204], [794, 58, 128], [848, 84, 182]];
    const front = S.s('g', { fill: INK }, p1.ink);
    const wins = S.s('g', { fill: Y }, p1.ink);
    FRONT.forEach(([x, w, h, kind]) => {
      const top = 440 - h;
      if (kind === 'deco') {
        S.s('path', { d: `M${x} 440 V${top} H${x + 14} V${top - 26} H${x + 28} V${top - 48} H${x + 40} V${top - 66} L${x + w / 2} ${top - 124} L${x + w - 40} ${top - 66} V${top - 48} H${x + w - 28} V${top - 26} H${x + w - 14} V${top} H${x + w} V440 Z` }, front);
      } else S.s('rect', { x, y: top, width: w, height: 440 - top }, front);
      if (w > 100 && S.rand() < 0.9) { // rooftop water tower
        const tx = x + w * 0.3;
        S.s('path', { d: `M${tx} ${top} l4 -18 h26 l4 18 Z M${tx + 2} ${top - 18} v-26 h30 v26 Z M${tx - 2} ${top - 44} l19 -14 l19 14 Z` }, front);
      }
      for (let yy = top + 16; yy < 430; yy += 24) for (let xx = x + 10; xx < x + w - 14; xx += 18) if (S.rand() < 0.22) S.s('rect', { x: xx, y: yy, width: 8, height: 12 }, wins);
    });
    // rain (black plate, pale blue), falling
    const rain = [];
    for (let i = 0; i < 46; i++) rain.push({ el: S.s('line', { stroke: '#CFE6FF', 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: 0.5 }, p1.ink), x: R(0, 1000), y: R(0, 520), L: R(24, 48), v: R(900, 1300) });
    // caption box: one line, or wrapped inside 560 px and shrunk until it fits two lines
    const CAP = String(P.caption ?? '');
    const cap = S.el('div', { text: CAP, style: `position:absolute;left:24px;top:24px;padding:10px 18px 6px;background:${Y};border:4px solid ${INK};font:400 36px/1 Bangers,sans-serif;letter-spacing:.05em;color:${INK};transform-origin:0 0;` }, p1.wrap);
    if (!CAP) cap.style.display = 'none';
    else if (cap.offsetWidth > 560) {
      cap.style.maxWidth = 560 - 44 + 'px';
      for (let fs = 36, k = 0; k < 20 && cap.offsetHeight > 2 * fs + 26; k++) { fs *= 0.94; cap.style.fontSize = fs + 'px'; }   // 2 lines + 24 px padding/border
    }

    /* ---------- panel 2: the eyes ---------- */
    const p2 = panel(...P2);
    const [mr, mg, mb] = hex2rgb(M);
    p2.bg.style.background = `${benday(`rgba(${mr},${mg},${mb},.42)`, 9, 1.9)},${CO.skin}`;
    S.el('div', { style: `position:absolute;inset:0;background:url(${halftone(810, 440, 10, 15, MF.hex('#C2185B'), (u, v) => 0.5 * Math.pow(S.clamp((v - 0.52) / 0.48), 1.2) + 0.35 * Math.pow(Math.abs(u - 0.5) * 2, 3))});opacity:.55;` }, p2.bg);
    const MASK = 'M405 170 C455 150,540 128,640 118 C700 112,745 102,782 86 C770 140,735 205,668 250 C610 285,520 292,470 262 C445 248,425 238,405 238 C385 238,365 248,340 262 C290 292,200 285,142 250 C75 205,40 140,28 86 C65 102,110 112,170 118 C270 128,355 150,405 170 Z';
    const HOLE_R = 'M468 214 C502 172,590 158,654 184 C630 228,540 252,468 214 Z';
    const HOLE_L = 'M342 214 C308 172,220 158,156 184 C180 228,270 252,342 214 Z';
    // eyes: sclera + iris (colour plate), clipped to the openings
    const eyeClip = S.uid('eyeclip');
    const ec = S.s('clipPath', { id: eyeClip }, p2.cd);
    S.s('path', { d: HOLE_R }, ec); S.s('path', { d: HOLE_L }, ec);
    const eyesC = S.s('g', { 'clip-path': `url(#${eyeClip})` }, p2.cs);
    S.s('rect', { x: 140, y: 150, width: 530, height: 110, fill: '#FFFDF4' }, eyesC);
    const irisC = S.s('g', {}, eyesC);
    [[562, 208], [248, 208]].forEach(([cx, cy]) => { S.s('circle', { cx, cy, r: 34, fill: C }, irisC); S.s('circle', { cx, cy, r: 34, fill: 'none', stroke: CF.hex('#0A4FA0'), 'stroke-width': 6 }, irisC); });
    // the domino mask with its two openings (evenodd), plus a gloss streak
    S.s('path', { d: `${MASK} ${HOLE_R} ${HOLE_L}`, fill: RED, 'fill-rule': 'evenodd' }, p2.cs);
    S.s('path', { d: 'M470 158 C540 138,620 128,700 120', fill: 'none', stroke: HF.hex('#FF9A8F'), 'stroke-width': 7, 'stroke-linecap': 'round', opacity: 0.9 }, p2.cs);
    S.s('path', { d: 'M340 158 C300 146,250 136,190 128', fill: 'none', stroke: HF.hex('#FF9A8F'), 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.7 }, p2.cs);
    // black plate: pupils, lids, mask outline, brows, furrows, nose
    const eyeInkClip = S.uid('eyeinkclip');
    const eic = S.s('clipPath', { id: eyeInkClip }, p2.id);
    S.s('path', { d: HOLE_R }, eic); S.s('path', { d: HOLE_L }, eic);
    const pupils = S.s('g', { 'clip-path': `url(#${eyeInkClip})` }, p2.ink);
    const pupilG = S.s('g', {}, pupils);
    [[562, 208], [248, 208]].forEach(([cx, cy]) => { S.s('circle', { cx, cy, r: 15, fill: INK }, pupilG); S.s('circle', { cx: cx - 11, cy: cy - 11, r: 7, fill: '#FFFFFF' }, pupilG); });
    const lids = S.s('g', {}, pupils);
    const lidR = S.s('path', { d: 'M440 120 L700 120 L700 186 C640 170,560 168,468 214 L440 214 Z', fill: INK }, lids);
    const lidL = S.s('path', { d: 'M370 120 L110 120 L110 186 C170 170,250 168,342 214 L370 214 Z', fill: INK }, lids);
    S.s('path', { d: `${MASK} ${HOLE_R} ${HOLE_L}`, fill: 'none', stroke: INK, 'stroke-width': 6, 'stroke-linejoin': 'round' }, p2.ink);
    S.s('path', { d: 'M430 158 C500 118,610 94,716 88 C640 104,540 124,444 170 Z', fill: INK }, p2.ink);
    S.s('path', { d: 'M380 158 C310 118,200 94,94 88 C170 104,270 124,366 170 Z', fill: INK }, p2.ink);
    S.s('path', { d: 'M394 112 C390 128,391 142,396 154 M416 112 C420 128,419 142,414 154', fill: 'none', stroke: INK, 'stroke-width': 5, 'stroke-linecap': 'round' }, p2.ink);
    S.s('path', { d: 'M428 250 C432 296,440 330,456 356 C464 368,456 380,440 378', fill: 'none', stroke: INK, 'stroke-width': 5, 'stroke-linecap': 'round' }, p2.ink);
    S.s('path', { d: 'M388 372 C396 380,408 382,418 378', fill: 'none', stroke: INK, 'stroke-width': 4, 'stroke-linecap': 'round' }, p2.ink);
    // radial focus lines (black plate), boiling
    const focus = S.s('g', {}, p2.ink);
    for (let i = 0; i < 90; i++) {
      const a = (i / 90) * 2 * Math.PI + R(-0.02, 0.02), r0 = R(262, 330), r1 = 760, wd = R(0.006, 0.016);
      const p = (r, aa) => `${f2(405 + Math.cos(aa) * r * 1.25)},${f2(212 + Math.sin(aa) * r * 0.62)}`;
      S.s('polygon', { points: `${p(r0, a)} ${p(r1, a - wd)} ${p(r1, a + wd)}`, fill: INK }, focus);
    }
    // the balloon, breaking the top border. Its right edge stays put; longer lines take two lines and the
    // balloon grows left and down (up to 472 × 150) before the lettering shrinks.
    const BAL = typeof P.balloon === 'string' ? { text: P.balloon } : P.balloon || {};
    const BT = String(BAL.text ?? ''), KIND = ['thought', 'shout'].includes(BAL.kind) ? BAL.kind : 'speech';
    const B58 = (s) => measure(s, 'font:400 58px/1 Bangers,sans-serif;letter-spacing:.03em;');
    let bLines = [BT], bF = 58, bW = 344, bH = 134;
    const bw1 = BT ? B58(BT) : 0;
    if (bw1 > 316) {
      const fit = (ws) => {
        for (let f = 58; f > 18; f *= 0.97) {
          const a = (Math.max(...ws) * f) / 116 + 8, b = (ws.length * f) / 2 + 4, ry = Math.min(75, Math.max(67, b * 1.9)), q = 0.9 - (b * b) / (ry * ry);
          if (q > 0.1) { const rx = Math.max(172, a / Math.sqrt(q)); if (rx <= 236) return { f, W: 2 * rx, H: 2 * ry }; }
        }
        return { f: 18, W: 472, H: 150 };
      };
      let best = { lines: [BT], ...fit([bw1]) };
      const two = split2(BT, B58);
      if (two) { const L = fit(two.lines.map(B58)); if (L.f > best.f * 1.05) best = { lines: two.lines, ...L }; }
      bLines = best.lines; bF = best.f; bW = best.W; bH = best.H;
    }
    const bub = S.el('div', { style: `position:absolute;left:${1452 - (bW - 344)}px;top:44px;width:${bW + 16}px;height:${bH + 16}px;transform-origin:18% 100%;` });
    if (BT) {
      const bsv = S.s('svg', { width: bW + 16, height: bH + 56, viewBox: `0 0 ${bW + 16} ${bH + 56}`, style: 'position:absolute;left:0;top:0;overflow:visible;' }, bub);
      const BST = { fill: '#FFFFFF', stroke: INK, 'stroke-width': 5, 'stroke-linejoin': 'round' };
      const U = (u) => f2(8 + u * bW), V = (v) => f2(8 + v * bH), ecx = 8 + bW / 2, ecy = 8 + bH / 2, erx = bW / 2, ery = bH / 2;
      const onEllipse = (a, k) => [ecx + Math.cos(a) * erx * k, ecy + Math.sin(a) * ery * k];
      if (KIND === 'speech') {
        const d = bW === 344 && bH === 134
          ? 'M180 8 C282 8,352 38,352 76 C352 114,282 142,186 142 C164 142,146 141,128 138 L84 170 L94 132 C34 120,8 98,8 76 C8 38,78 8,180 8 Z'
          : `M${U(0.5)} ${V(0)} C${U(0.7965)} ${V(0)},${U(1)} ${V(0.2239)},${U(1)} ${V(0.5075)} C${U(1)} ${V(0.791)},${U(0.7965)} ${V(1)},${U(0.5174)} ${V(1)} C${U(0.4535)} ${V(1)},${U(0.4012)} ${V(0.9925)},${U(0.3488)} ${V(0.9701)} L${U(0.2209)} ${V(1.209)} L${U(0.25)} ${V(0.9254)} C${U(0.0756)} ${V(0.8358)},${U(0)} ${V(0.6716)},${U(0)} ${V(0.5075)} C${U(0)} ${V(0.2239)},${U(0.2035)} ${V(0)},${U(0.5)} ${V(0)} Z`;
        S.s('path', { d, ...BST }, bsv);
      } else if (KIND === 'thought') {
        // cloud: outward bumps around the ellipse, then three shrinking puffs toward the speaker
        const n = Math.max(9, Math.round((Math.PI * (erx + ery)) / 58)), pt = (k) => onEllipse((k / n) * 2 * Math.PI - Math.PI / 2, 0.92);
        let d = `M${pt(0).map(f2).join(' ')}`;
        for (let k = 1; k <= n; k++) { const [x0, y0] = pt(k - 1), [x1, y1] = pt(k % n), r = Math.hypot(x1 - x0, y1 - y0) * 0.62; d += ` A${f2(r)} ${f2(r)} 0 0 1 ${f2(x1)} ${f2(y1)}`; }
        S.s('path', { d: d + ' Z', ...BST }, bsv);
        [[0.3, 1.08, 12], [0.25, 1.23, 8], [0.21, 1.34, 5]].forEach(([u, v, r]) => S.s('circle', { cx: U(u), cy: V(v), r, ...BST, 'stroke-width': 4 }, bsv));
      } else {
        // shout: a jagged burst with one long spike toward the speaker
        const n = Math.max(14, Math.round((Math.PI * (erx + ery)) / 40)), pts = [];
        const tipA = Math.atan2((1.24 - 0.5) * bH, (0.2209 - 0.5) * bW);
        for (let k = 0; k < 2 * n; k++) {
          const a = (k / (2 * n)) * 2 * Math.PI - Math.PI / 2, s = k % 2 ? 0.9 : 1.08 + 0.06 * S.ihash(k * 13 + 5);
          const a2 = ((k + 1) / (2 * n)) * 2 * Math.PI - Math.PI / 2;
          pts.push(onEllipse(a, s));
          if (a < tipA && a2 >= tipA) pts.push([+U(0.2209), +V(1.24)]);
        }
        S.s('polygon', { points: pts.map((p) => p.map(f2).join(',')).join(' '), ...BST, 'stroke-linejoin': 'miter' }, bsv);
      }
      S.el('div', { html: bLines.map(esc).join('<br>'), style: `position:absolute;left:0;top:${+(8 + (bH - bLines.length * bF) / 2 - 2).toFixed(1)}px;width:${bW + 16}px;text-align:center;font:400 ${+bF.toFixed(2)}px/1 Bangers,sans-serif;letter-spacing:.03em;color:${INK};` }, bub);
    }

    /* ---------- panel 3: the SFX hit ---------- */
    const p3 = panel(...P3);
    p3.bg.style.background = `radial-gradient(ellipse 45% 70% at 50% 50%,#FFFBE0 0%,rgba(255,251,224,0) 60%),repeating-conic-gradient(from 3deg at 50% 50%,${Y} 0deg 7deg,${YF.hex('#FF9E1B')} 7deg 14deg)`;
    S.el('div', { style: `position:absolute;inset:0;background:url(${halftone(1760, 450, 13, 45, RED, (u, v) => { const d = Math.hypot((u - 0.5) * 1.6, (v - 0.5) * 0.9); return 0.55 * Math.pow(S.clamp((d - 0.4) / 0.5), 1.4); })});opacity:.8;` }, p3.bg);
    const burstPts = (rx, ry, n, jit, seedOff) => {
      const pts = [];
      for (let i = 0; i < n * 2; i++) {
        const a = (i / (n * 2)) * 2 * Math.PI + (i % 2 ? 0 : S.ihash(i * 7 + seedOff) * 0.12);
        const rr = i % 2 ? 0.58 + 0.08 * S.ihash(i * 13 + seedOff) : 1 - jit * S.ihash(i * 31 + seedOff);
        pts.push(`${f2(880 + Math.cos(a) * rx * rr)},${f2(225 + Math.sin(a) * ry * rr)}`);
      }
      return pts.join(' ');
    };
    const burst = S.s('g', {}, p3.cs), burstInk = S.s('g', {}, p3.ink);
    const B1 = burstPts(700, 330, 17, 0.25, 1), B2 = burstPts(520, 240, 15, 0.25, 2), B3 = burstPts(330, 150, 13, 0.2, 3);
    S.s('polygon', { points: B1, fill: RED }, burst);
    S.s('polygon', { points: B2, fill: Y }, burst);
    S.s('polygon', { points: B3, fill: '#FFFDF0' }, burst);
    S.s('polygon', { points: B1, fill: 'none', stroke: INK, 'stroke-width': 7, 'stroke-linejoin': 'miter' }, burstInk);
    S.s('polygon', { points: B2, fill: 'none', stroke: INK, 'stroke-width': 4, 'stroke-linejoin': 'miter' }, burstInk);
    // debris shards flying out (analytic ballistic paths)
    const shards = [];
    for (let i = 0; i < 22; i++) {
      const a = R(0, Math.PI * 2), s = R(10, 26);
      const el = S.s('polygon', { points: `0,${-s} ${f2(s * 0.7)},${f2(s * 0.6)} ${f2(-s * 0.5)},${f2(s * 0.4)}`, fill: INK, opacity: 0 }, p3.ink);
      shards.push({ el, a, v: R(520, 1100), spin: R(-900, 900) });
    }
    // the SFX word, outside the panel clip so it can break the borders. Eight letters' worth of seeded jitter
    // is always drawn (so a new word never moves the cover's random layout); past 8 letters it comes from a hash.
    const SFXT = String(P.sfx ?? ''), SW = [...SFXT], NK = SW.length, KMID = (NK - 1) / 2;
    const KR = Array.from({ length: 8 }, () => [R(-12, 12), R(-22, 22), R(0.92, 1.1)]);
    const K_SHADOW = [...ring(6, INK), ...extrude(13, RED, 1), ...ring(6, INK, 16, 14, 14), '20px 20px 0 rgba(0,0,0,.25)'].join(',');
    const kw = S.el('div', { style: `position:absolute;left:${P3[0]}px;top:${P3[1] - 30}px;width:${P3[2]}px;height:${P3[3] + 60}px;display:flex;justify-content:center;align-items:center;pointer-events:none;` });
    const bang = NK > 0 && /[!?]/.test(SW[NK - 1]);                        // a closing !/? is drawn a size up
    const kLetters = SW.map((ch, i) => {
      const outer = S.el('span', { style: 'display:inline-block;margin:0 -2px;transform-origin:50% 70%;' }, kw);
      const inner = S.el('span', { text: ch === ' ' ? ' ' : ch, style: `display:inline-block;font:400 ${i === NK - 1 && bang ? 220 : 206}px/1 Bangers,sans-serif;color:${Y};text-shadow:${K_SHADOW};` }, outer);
      const r = i < 8 ? KR[i] : [(S.ihash(i * 7 + 1) - 0.5) * 24, (S.ihash(i * 7 + 2) - 0.5) * 44, 0.92 + 0.18 * S.ihash(i * 7 + 3)];
      return { outer, inner, rot: r[0] + (i - KMID) * 1.6, dy: r[1], sc: r[2], seed: i * 11 + 3 };
    });
    const kwW = NK ? natural(kw) : 0;                                         // fit the word inside the panel
    if (kwW > 1560) kLetters.forEach((L, i) => { L.inner.style.fontSize = ((i === NK - 1 && bang ? 220 : 206) * 1560) / kwW + 'px'; });

    /* ---------- screen-space halftone canvas (flash + transition) ---------- */
    const hx = S.canvas(S.hud);
    const HT_CELL = 44;
    const htDots = [];
    { const ca = Math.cos(45 * rad), sa = Math.sin(45 * rad), n = Math.ceil(1200 / HT_CELL);
      for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) {
        const px = 960 + (i * ca - j * sa) * HT_CELL, py = 540 + (i * sa + j * ca) * HT_CELL;
        if (px < -HT_CELL || py < -HT_CELL || px > 1920 + HT_CELL || py > 1080 + HT_CELL) continue;
        htDots.push([px, py, Math.min(1, Math.hypot((px - 960) / 960, (py - 540) / 540) / 1.25)]);
      } }
    const drawDots = (color, rOf) => {
      hx.fillStyle = color; hx.beginPath();
      for (const [px, py, d] of htDots) { const r = rOf(d); if (r > 0.3) { hx.moveTo(px + r, py); hx.arc(px, py, r, 0, Math.PI * 2); } }
      hx.fill();
    };

    /* ---------- the cover (screen space) ---------- */
    const cover = S.el('div', { style: 'position:absolute;left:0;top:0;width:1920px;height:1080px;overflow:hidden;visibility:hidden;' }, S.hud);
    const cv = S.el('div', { style: 'position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:50% 45%;' }, cover);
    const cCol = S.el('div', { style: `position:absolute;left:${MR[0] - 20}px;top:${MR[1] - 20}px;width:1960px;height:1120px;background:linear-gradient(180deg,${CF.hex('#0B1D63')} 0%,${CF.hex('#10479F')} 38%,${CF.hex('#0B8FD6')} 70%,${C} 100%);` }, cv);
    S.el('div', { style: `position:absolute;inset:0;background:url(${halftone(1960, 1120, 16, 15, M, (u, v) => 0.62 * Math.pow(S.clamp(1 - v / 0.7), 1.3))});opacity:.7;` }, cCol);
    S.el('div', { style: `position:absolute;inset:0;background:url(${halftone(1960, 1120, 14, 75, Y, (u, v) => { const d = Math.hypot((u - 0.66) * 1.7, (v - 0.56) * 1.1); return 0.55 * Math.pow(S.clamp(1 - d / 0.55), 1.6); })});opacity:.8;` }, cCol);
    const coverSvg = S.svg(cv), cDefs = S.defs(coverSvg);
    // speed lines along the flight path
    const HEAD = [1300, 600], TAIL = [-420, 1210];
    const ux = (HEAD[0] - TAIL[0]) / Math.hypot(HEAD[0] - TAIL[0], HEAD[1] - TAIL[1]), uy = (HEAD[1] - TAIL[1]) / Math.hypot(HEAD[0] - TAIL[0], HEAD[1] - TAIL[1]);
    const nx = -uy, ny = ux, ANG = Math.atan2(uy, ux) / rad;
    const speed = S.s('g', { stroke: CF.hex('#DDF6FF'), 'stroke-linecap': 'round', opacity: 0.55 }, coverSvg);
    const speedLines = [];
    for (let i = 0; i < 26; i++) {
      const off = R(-520, 520), s0 = R(-1100, 300), len = R(160, 520);
      speedLines.push({ el: S.s('line', { 'stroke-width': f2(R(2, 5)) }, speed), off, s0, len, v: R(700, 1300) });
    }
    const placeSpeed = (t) => {
      for (const L of speedLines) {
        let a = L.s0 - L.v * Math.max(0, t - 4.2); a = (((a + 1100) % 1400) + 1400) % 1400 - 1100;
        const x0 = HEAD[0] + ux * a + nx * L.off, y0 = HEAD[1] + uy * a + ny * L.off;
        L.el.setAttribute('x1', f2(x0)); L.el.setAttribute('y1', f2(y0)); L.el.setAttribute('x2', f2(x0 - ux * L.len)); L.el.setAttribute('y2', f2(y0 - uy * L.len));
      }
    };
    placeSpeed(0);
    // the comet streak: tapered, flame-edged layers in the hero's colour
    const cometG = S.s('g', {}, coverSvg);
    const streakPts = (scale, wob, ph) => {
      const L = [], Rr = [], N = 60;
      for (let i = 0; i <= N; i++) {
        const s = i / N, bx2 = TAIL[0] + (HEAD[0] - TAIL[0]) * s, by2 = TAIL[1] + (HEAD[1] - TAIL[1]) * s;
        const bow = Math.sin(Math.PI * s) * 70;
        const hw = (8 + 118 * Math.pow(s, 0.9)) * scale * (1 + wob * Math.sin(s * 44 + scale * 3 + ph));
        const cx = bx2 + nx * bow, cy = by2 + ny * bow;
        L.push(`${f2(cx + nx * hw)},${f2(cy + ny * hw)}`); Rr.push(`${f2(cx - nx * hw)},${f2(cy - ny * hw)}`);
      }
      const h = 126 * scale, cap = [];
      for (let k = 1; k < 12; k++) { const a = Math.PI / 2 - (k / 12) * Math.PI; cap.push(`${f2(HEAD[0] + (ux * Math.cos(a) + nx * Math.sin(a)) * h)},${f2(HEAD[1] + (uy * Math.cos(a) + ny * Math.sin(a)) * h)}`); }
      return [...L, ...cap, ...Rr.reverse()].join(' ');
    };
    const streaks = [[1, 0.1, RED, INK], [0.7, 0.14, HF.hex('#FF8C1A')], [0.46, 0.1, Y], [0.2, 0.05, '#FFFDF0']].map(([sc, wb, fill, stroke]) => ({ sc, wb, el: S.s('polygon', { points: streakPts(sc, wb, 0), fill, stroke: stroke || 'none', 'stroke-width': stroke ? 6 : 0, 'stroke-linejoin': 'round' }, cometG) }));
    const glowId = S.uid('cglow');
    grad(cDefs, 'radialGradient', glowId, { cx: 0.5, cy: 0.5, r: 0.5 }, [[0, YF.hex('#FFF6B0'), 0.9], [0.45, Y, 0.45], [1, Y, 0]]);
    const cometGlow = S.s('circle', { cx: HEAD[0], cy: HEAD[1], r: 260, fill: `url(#${glowId})` }, cometG);
    // the hero: black silhouette flying face-down (local +x = forward, -y = his back), cape in the hero colour
    const hero = S.s('g', {}, cometG), heroBob = S.s('g', {}, hero);
    const heroIn = S.s('g', { transform: `translate(${f2(HEAD[0] + ux * 70)},${f2(HEAD[1] + uy * 70 - 8)}) rotate(${f2(ANG - 4)}) scale(1.02)` }, heroBob);
    // cape (behind the body): billows off the shoulders, flutters past the boots
    S.s('path', { d: 'M62 -46 C20 -88,-80 -98,-170 -90 C-240 -84,-310 -102,-380 -82 C-398 -77,-412 -70,-430 -76 C-418 -58,-420 -46,-440 -34 C-410 -34,-388 -32,-368 -38 C-372 -24,-376 -12,-396 0 C-360 -4,-330 -8,-300 -16 C-230 -24,-150 -32,-70 -38 C-10 -46,30 -50,62 -46 Z', fill: RED, stroke: INK, 'stroke-width': 5.5, 'stroke-linejoin': 'round' }, heroIn);
    S.s('path', { d: 'M10 -68 C-70 -78,-170 -78,-300 -88 M-130 -52 C-210 -54,-290 -56,-384 -54', fill: 'none', stroke: HF.hex('#A61C1C'), 'stroke-width': 8, 'stroke-linecap': 'round', opacity: 0.85 }, heroIn);
    S.s('path', { d: 'M-8 -80 C-70 -88,-150 -90,-230 -90', fill: 'none', stroke: HF.hex('#FF8A80'), 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.85 }, heroIn);
    const sil = S.s('g', { fill: INK }, heroIn);
    S.s('ellipse', { cx: 74, cy: -62, rx: 26, ry: 28 }, sil);                                            // head
    S.s('path', { d: 'M56 -50 L82 -46 L99 -50 L97 -36 L76 -24 L48 -24 Z' }, sil);                         // neck + jaw
    S.s('path', { d: 'M62 -46 C30 -60,-10 -56,-40 -46 C-70 -40,-92 -40,-106 -32 C-120 -24,-120 10,-106 22 C-70 30,-30 30,10 34 C44 38,72 32,80 14 C86 -4,84 -32,62 -46 Z' }, sil); // torso
    S.s('path', { d: 'M30 -42 C64 -60,96 -66,118 -70 C136 -74,152 -80,170 -88 L182 -58 C164 -52,148 -46,130 -40 C106 -32,78 -12,52 2 Z' }, sil); // reaching arm
    S.s('rect', { x: 164, y: -100, width: 50, height: 46, rx: 14, transform: 'rotate(-18 189 -77)' }, sil);   // fist
    S.s('path', { d: 'M-98 -32 C-140 -34,-180 -28,-210 -24 C-240 -21,-266 -20,-284 -19 L-286 6 C-262 8,-236 12,-210 14 C-180 16,-140 20,-102 20 Z' }, sil); // near leg
    S.s('path', { d: 'M-280 -21 C-304 -23,-328 -19,-346 -8 C-332 4,-306 9,-282 8 Z' }, sil);                // near boot
    S.s('path', { d: 'M-100 0 C-132 10,-162 18,-186 22 C-206 26,-230 32,-254 36 L-250 56 C-226 54,-198 48,-176 44 C-150 38,-120 30,-94 26 Z' }, sil); // far leg, bent
    S.s('path', { d: 'M-250 34 C-274 36,-298 42,-314 51 C-298 62,-272 62,-248 58 Z' }, sil);                // far boot
    S.s('path', { d: 'M80 -70 C88 -73,96 -74,103 -72 C99 -66,92 -63,84 -63 Z', fill: '#FFFDF0' }, heroIn); // mask eye slit
    // chest emblem: a small yellow comet
    S.s('path', { d: 'M44 10 C30 14,12 14,-6 8 C10 18,26 22,40 20 Z M48 14 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0', fill: Y }, heroIn);
    // city skyline (black plate) at the foot of the cover
    const sky2 = S.s('g', { fill: INK }, coverSvg), win2 = S.s('g', { fill: Y }, coverSvg);
    let sx = -10;
    while (sx < 1930) {
      const w = R(70, 150), h = R(110, 250), top = 1080 - h;
      S.s('rect', { x: f2(sx), y: f2(top), width: f2(w), height: f2(h) }, sky2);
      if (S.rand() < 0.3) S.s('rect', { x: f2(sx + w / 2 - 3), y: f2(top - 40), width: 6, height: 42 }, sky2);
      for (let yy = top + 18; yy < 1070; yy += 26) for (let xx = sx + 12; xx < sx + w - 16; xx += 20) if (S.rand() < 0.2) S.s('rect', { x: f2(xx), y: f2(yy), width: 9, height: 13 }, win2);
      sx += w + R(-8, 6);
    }
    S.el('div', { style: `position:absolute;inset:0;background:url(${paperURL}) 0 0/512px 512px;mix-blend-mode:multiply;opacity:.55;pointer-events:none;` }, cv);

    // corner box: price + issue number (each shrinks to fit the 204 px box)
    const PRICE = String(CV.price ?? ''), ISSUE = String(CV.issue ?? '');
    const corner = S.el('div', { style: `position:absolute;left:92px;top:88px;width:218px;height:226px;background:${PAPER};border:7px solid ${INK};box-sizing:border-box;transform-origin:0 0;box-shadow:8px 8px 0 rgba(0,0,0,.28);` }, cv);
    const priceEl = S.el('div', { text: PRICE, style: `position:absolute;left:0;right:0;top:20px;text-align:center;font:400 104px/1 Bangers,sans-serif;color:${INK};letter-spacing:.02em;` }, corner);
    const pw = PRICE ? measure(PRICE, 'font:400 104px/1 Bangers,sans-serif;letter-spacing:.02em;') : 0;
    if (pw > 184) { const fs = (104 * 184) / pw; priceEl.style.fontSize = fs + 'px'; priceEl.style.top = 20 + (104 - fs) / 2 + 'px'; }
    const issueEl = S.el('div', { text: ISSUE, style: `position:absolute;left:0;right:0;bottom:0;height:62px;line-height:66px;text-align:center;background:${RED};font:400 42px Bangers,sans-serif;letter-spacing:.06em;color:${Y};text-shadow:${ring(2.5, INK, 12).join(',')};` }, corner);
    const iw = ISSUE ? measure(ISSUE, 'font:400 42px Bangers,sans-serif;letter-spacing:.06em;') : 0;
    if (iw > 188) issueEl.style.fontSize = (42 * 188) / iw + 'px';
    const hasCorner = !!(PRICE || ISSUE);
    if (!hasCorner) corner.style.display = 'none';
    // masthead: out-of-register yellow over a black key with a 3D extrusion in the hero colour
    const mast = S.el('div', { style: 'position:absolute;left:350px;top:96px;width:1150px;height:250px;transform-origin:45% 60%;' }, cv);
    const THE = String(CV.the ?? '');
    const theBox = S.el('div', { text: THE, style: `position:absolute;left:6px;top:0;padding:6px 16px 2px;background:${RED};border:5px solid ${INK};font:400 52px/1 Bangers,sans-serif;letter-spacing:.08em;color:#FFFFFF;transform:rotate(-5deg);box-shadow:6px 6px 0 ${INK};` }, mast);
    if (!THE) theBox.style.display = 'none';
    else if (theBox.offsetWidth > 560) theBox.style.fontSize = (52 * (560 - 42)) / (theBox.offsetWidth - 42) + 'px';
    const M_SHADOW = [...ring(7, INK), ...extrude(17, RED, 1), ...ring(7, INK, 16, 18, 18), '26px 26px 0 rgba(0,0,0,.28)'].join(',');
    const mastText = String(P.hero ?? '');
    const mk = S.el('div', { text: mastText, style: `position:absolute;left:0;top:58px;white-space:nowrap;font:400 190px/1 Bangers,sans-serif;letter-spacing:.02em;color:${INK};text-shadow:${M_SHADOW};` }, mast);
    const my = S.el('div', { text: mastText, style: `position:absolute;left:-3px;top:56px;white-space:nowrap;font:400 190px/1 Bangers,sans-serif;letter-spacing:.02em;color:${Y};` }, mast);
    // fit the masthead to its box: one line up to 1120 px; a multi-word title that would drop under 72%
    // stacks on two balanced lines (up to 88%)
    const mw = mk.offsetWidth || 1100;
    let mfit = Math.min(1, 1120 / mw);
    if (mfit < 0.72) {
      const two = split2(mastText, (s) => measure(s, 'font:400 190px/1 Bangers,sans-serif;letter-spacing:.02em;'));
      const f2l = two ? Math.min(0.88, 1120 / two.w) : 0;
      if (f2l > mfit * 1.12) { [mk, my].forEach((e) => { e.textContent = two.lines.join('\n'); e.style.whiteSpace = 'pre'; e.style.lineHeight = '.9'; }); mfit = f2l; }
    }
    [mk, my].forEach((e) => { e.style.transformOrigin = '0 0'; e.style.transform = `scale(${f2(mfit)})`; });
    // starburst badge: line 1 big, line 2 smaller, each shrinks to fit the burst
    const BADGE = linesOf(CV.badge).slice(0, 2);
    const badge = S.el('div', { style: 'position:absolute;left:1500px;top:52px;width:360px;height:340px;transform-origin:50% 50%;' }, cv);
    const badgeIn = S.el('div', { style: 'position:absolute;inset:0;transform-origin:50% 50%;' }, badge);
    const bsv2 = S.s('svg', { width: 360, height: 340, viewBox: '-180 -170 360 340', style: 'position:absolute;left:0;top:0;overflow:visible;' }, badgeIn);
    const bpts = []; for (let i = 0; i < 36; i++) { const a = (i / 36) * 2 * Math.PI, rr = i % 2 ? 0.8 : 1; bpts.push(`${f2(Math.cos(a) * 178 * rr)},${f2(Math.sin(a) * 160 * rr)}`); }
    S.s('polygon', { points: bpts.join(' '), fill: INK, transform: 'translate(8,8)', opacity: 0.35 }, bsv2);
    S.s('polygon', { points: bpts.join(' '), fill: Y, stroke: INK, 'stroke-width': 6, 'stroke-linejoin': 'miter' }, bsv2);
    if (BADGE.length) {
      const bs = BADGE.map((s, i) => { const base = i ? 47 : 72, w = measure(s, `font:400 ${base}px/1 Bangers,sans-serif;letter-spacing:.03em;`); return w > 262 ? (base * 262) / w : base; });
      const bh = bs.reduce((a, s, i) => a + s * (i ? 1 : 0.92), 0);
      S.el('div', { html: BADGE.map((s, i) => `<div style="font-size:${+bs[i].toFixed(2)}px;line-height:${i ? '1' : '.92'}">${esc(s)}</div>`).join(''), style: `position:absolute;left:0;right:0;top:${+(98 + (113.24 - bh) / 2).toFixed(2)}px;text-align:center;font-family:Bangers,sans-serif;letter-spacing:.03em;color:${RED};text-shadow:${ring(2.5, INK, 12).join(',')};transform:rotate(-8deg);` }, badgeIn);
    } else badge.style.display = 'none';
    // cover blurb in a caption box: 1–3 lines, shrinks past 636 px of text
    const BLURB = linesOf(CV.blurb).slice(0, 3);
    const blurb = S.el('div', { html: BLURB.map(esc).join('<br>'), style: `position:absolute;left:118px;top:548px;padding:14px 26px 10px;background:${Y};border:6px solid ${INK};box-shadow:9px 9px 0 rgba(0,0,0,.3);font:400 50px/1.02 Bangers,sans-serif;letter-spacing:.04em;color:${INK};transform:rotate(-3deg);transform-origin:0 50%;` }, cv);
    if (!BLURB.length) blurb.style.display = 'none';
    else { const bw = natural(blurb); if (bw > 700) blurb.style.fontSize = (50 * 636) / (bw - 64) + 'px'; }

    /* ================= timeline ================= */
    // P1 slams in from 1.3x with a spin, lightning cracks as it lands
    const SL1 = 0.28;
    tl.fromTo(p1.wrap, { scale: 1.34, rotation: -7 }, { scale: 1, rotation: 0, duration: SL1, ease: 'power3.in' }, 0);
    tl.to(p1.wrap, { scale: 0.985, duration: 0.06, ease: 'power2.out' }, SL1);
    tl.to(p1.wrap, { scale: 1, duration: 0.3, ease: 'back.out(3)' }, SL1 + 0.06);
    S.shake(SL1, { amp: 12, dur: 0.35, rot: 0.4 });
    S.sfx(0, 'whoosh', { gain: 0.35, dur: 0.3, from: 300, to: 2600 });
    S.sfx(SL1, 'impact', { gain: 0.5 });
    S.sfx(SL1 + 0.02, 'thunder', { gain: 0.55 });
    if (CAP) S.pop(cap, 0.56, { from: 0.3, gain: 0.22, pitch: 1.2 });
    const FL = [[0.3, 1], [0.41, 0.55], [0.49, 0.9], [0.7, 0.3]];
    const flash = (t) => { let v = 0; for (const [t0, a] of FL) { const u = t - t0; if (u >= 0) v += a * Math.exp(-u / 0.06); } return Math.min(1, v); };
    S.onFrame((t) => {
      const f = flash(t);
      flashOv.style.opacity = (0.8 * f).toFixed(3);
      boltG.setAttribute('opacity', t < 0.3 ? 0 : f2(S.clamp((0.35 + f) * (1 - S.norm(t, 0.85, 1.15)))));
      for (const d of rain) {
        const y = ((d.y + d.v * t) % 520) - 60, x = d.x - (y + 60) * 0.26;
        d.el.setAttribute('x1', f2(x)); d.el.setAttribute('y1', f2(y)); d.el.setAttribute('x2', f2(x - d.L * 0.26)); d.el.setAttribute('y2', f2(y - d.L));
      }
    });
    S.beat(0, 'Panel slams in at 1.3x on frame one; thunder sells the landing');

    // P2 slams in from the right; eyes snap to camera; the balloon pops
    const SL2 = 1.08;
    tl.fromTo(p2.wrap, { x: 1150, rotation: 12 }, { x: 0, rotation: 0, duration: 0.22, ease: 'power3.in' }, SL2 - 0.22);
    tl.to(p2.wrap, { x: -16, duration: 0.07, ease: 'power2.out' }, SL2);
    tl.to(p2.wrap, { x: 0, duration: 0.32, ease: 'back.out(2.5)' }, SL2 + 0.07);
    S.shake(SL2, { amp: 9, dur: 0.3, rot: 0.3 });
    S.sfx(SL2 - 0.24, 'swoosh', { gain: 0.45 });
    S.sfx(SL2, 'thud', { gain: 0.45 });
    tl.fromTo([pupilG, irisC], { x: -26 }, { x: 0, duration: 0.14, ease: 'power3.out' }, 1.2);
    tl.fromTo([lidR, lidL], { y: -12 }, { y: 4, duration: 0.16, ease: 'power2.out' }, 1.2);
    S.sfx(1.2, 'tick', { gain: 0.16, pitch: 0.7 });
    if (BT) S.pop(bub, 1.3, { from: 0.2, gain: 0.42, pitch: 1.05, ease: 'back.out(2.6)', dur: 0.4 });
    S.onFrame((t) => { const k = Math.floor(t * 12); focus.setAttribute('transform', `rotate(${f2((S.ihash(k * 3 + 1) - 0.5) * 1.6)} 405 212)`); });
    const nWords = BT.split(/\s+/).filter(Boolean).length;
    S.beat(0.9, nWords ? `Extreme close-up on the eyes; the line is ${['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'][nWords - 1] || nWords} word${nWords > 1 ? 's' : ''}` : 'Extreme close-up on the eyes, no words');

    // anticipation, then P3 bursts: boom, flash, shake, lettering (the stagger tightens past 8 letters)
    S.sfx(1.5, 'riser', { dur: 0.4, gain: 0.28 });
    const HIT = 1.9;
    tl.fromTo(p3.wrap, { scale: 0.35, rotation: 5, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.26, ease: 'back.out(1.5)' }, 1.8);
    tl.fromTo([burst, burstInk], { scale: 0.08, svgOrigin: '880 225' }, { scale: 1, svgOrigin: '880 225', duration: 0.55, ease: 'expo.out' }, HIT);
    S.shake(HIT, { amp: 26, dur: 0.65, freq: 26, rot: 1 });
    S.sfx(HIT, 'boom', { gain: 0.62 });
    S.sfx(HIT, 'impact', { gain: 0.5 });
    const KST = NK > 8 ? 0.406 / (NK - 1) : 0.058, KPT = NK > 8 ? 0.49 / (NK - 1) : 0.07;
    kLetters.forEach((L, i) => {
      const t0 = HIT + 0.06 + i * KST;
      tl.fromTo(L.outer, { scale: 0, rotation: L.rot - 40, y: L.dy - 60, opacity: 0 }, { scale: L.sc, rotation: L.rot, y: L.dy, opacity: 1, duration: 0.34, ease: 'back.out(3)' }, t0);
      S.sfx(t0, 'pop', { gain: 0.15, pitch: 0.75 + i * KPT });
    });
    S.onFrame((t) => {
      const u = t - HIT;
      for (const L of kLetters) {
        const k = Math.floor(t * 12), amp = u < 0 ? 0 : 1.2 + 5 * Math.exp(-u * 2.2);
        L.inner.style.transform = `translate(${f2((S.ihash(k * 7 + L.seed) - 0.5) * amp)}px,${f2((S.ihash(k * 5 + L.seed + 1) - 0.5) * amp)}px)`;
      }
      for (const s of shards) {
        if (u < 0 || u > 1.3) { s.el.setAttribute('opacity', 0); continue; }
        const x = 880 + Math.cos(s.a) * (150 + s.v * u) * 1.6, y = 225 + Math.sin(s.a) * (150 + s.v * u) * 0.7 + 380 * u * u;
        s.el.setAttribute('opacity', f2(S.clamp(u / 0.06) * (1 - u / 1.3)));
        s.el.setAttribute('transform', `translate(${f2(x)},${f2(y)}) rotate(${f2(s.spin * u)})`);
      }
    });
    const WORD = SFXT.replace(/[^\p{L}\p{N}' -]/gu, '').trim();
    S.beat(1.5, `Riser, then the ${WORD ? WORD + ' ' : ''}hit: shake, halftone flash, lettering`);

    // camera: tight on panel 1, pull back as panel 2 lands, lean into the empty slot, get kicked back by the blast, then dive
    const DIVE = 3.2, CUT = 4.2;
    S.camTo(0, { x: 548, y: 306, z: 1.56, r: -0.7 }, 0.8, 'sine.out');
    S.camTo(0.8, { x: 960, y: 548, z: 1.0, r: 0 }, 0.5, 'power3.inOut');
    S.camTo(1.46, { x: 960, y: 610, z: 1.07 }, HIT - 1.46, 'power2.in');          // lean toward the empty slot
    S.camTo(HIT, { x: 960, y: 546, z: 0.985 }, 0.5, 'expo.out');                  // kicked back by the blast
    S.camTo(HIT + 0.5, { x: 962, y: 552, z: 1.03 }, DIVE - HIT - 0.5, 'sine.inOut');
    S.camTo(DIVE, { x: 960, y: 775, z: 2.55 }, CUT - DIVE, 'power2.in');
    S.sfx(DIVE, 'riser', { dur: CUT - DIVE, gain: 0.3 });
    S.sfx(3.7, 'whoosh', { gain: 0.35, dur: 0.55, from: 300, to: 4000 });
    S.beat(DIVE, 'Camera dives into the panel; its dots grow into the cut');

    // cover reveal
    tl.fromTo(cover, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.001 }, CUT);
    tl.fromTo(S.cam, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.001 }, CUT + 0.01);
    tl.fromTo(cv, { scale: 1.08 }, { scale: 1, duration: 1.1, ease: 'expo.out' }, CUT);
    tl.to(cv, { scale: 1.035, duration: 7 - CUT - 1.1, ease: 'sine.inOut' }, CUT + 1.1);
    tl.fromTo(mast, { scale: 1.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.42, ease: 'expo.out' }, CUT + 0.04);
    if (THE) tl.fromTo(theBox, { scale: 0, rotation: -30 }, { scale: 1, rotation: -5, duration: 0.4, ease: 'back.out(2.5)' }, CUT + 0.2);
    S.shake(CUT + 0.04, { amp: 14, dur: 0.4, rot: 0.4 });
    S.sfx(CUT + 0.04, 'chord', { notes: P.chordNotes, dur: 1.1, gain: 0.34, wave: 'sawtooth' });
    S.sfx(CUT + 0.04, 'impact', { gain: 0.45 });
    if (THE) S.sfx(CUT + 0.2, 'pop', { gain: 0.25, pitch: 1.3 });
    tl.fromTo(hero, { x: -ux * 1500, y: -uy * 1500 }, { x: 0, y: 0, duration: 0.75, ease: 'expo.out' }, CUT + 0.18);
    tl.fromTo(cometG, { opacity: 0 }, { opacity: 1, duration: 0.12 }, CUT + 0.18);
    S.sfx(CUT + 0.16, 'whoosh', { gain: 0.4, dur: 0.6, from: 350, to: 5200 });
    if (hasCorner) S.pop(corner, CUT + 0.45, { from: 0.3, gain: 0.3, pitch: 0.9 });
    if (BADGE.length) {
      S.pop(badge, CUT + 0.72, { from: 0, gain: 0.35, pitch: 1.2, ease: 'back.out(2.2)', dur: 0.5 });
      S.sfx(CUT + 0.74, 'blip', { gain: 0.2, pitch: 1.2 });
    }
    if (BLURB.length) {
      tl.fromTo(blurb, { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'expo.out' }, CUT + 0.95);
      S.sfx(CUT + 0.95, 'swoosh', { gain: 0.25, pitch: 1.1 });
    }
    S.sfx(CUT + 0.9, 'shimmer', { gain: 0.14 });
    S.onFrame((t) => {
      const u = Math.max(0, t - (CUT + 0.72));
      badgeIn.style.transform = `rotate(${f2(-7 + 6 * Math.sin(u * 2 * Math.PI * 1.15))}deg) scale(${f2(1 + 0.04 * Math.sin(u * 2 * Math.PI * 2.3))})`;
      const g = 1 + 0.06 * Math.sin(t * 7.3) + 0.04 * Math.sin(t * 13.1);
      cometGlow.setAttribute('r', f2(260 * g));
      if (t >= CUT) {
        const ph = (t - CUT) * 7;
        for (const st of streaks) st.el.setAttribute('points', streakPts(st.sc, st.wb, ph));
        const b = 5 * Math.sin((t - CUT) * 3.3);
        heroBob.setAttribute('transform', `translate(${f2(nx * b)},${f2(ny * b)})`);
        placeSpeed(t);
      }
    });
    S.beat(CUT, 'Cover lands on a bright major-chord stab: payoff and title');

    // halftone flash on the hit, and the dot transition
    const GROW0 = 3.62, SHRINK1 = 4.55;
    S.onFrame((t) => {
      const flashOn = t >= HIT && t < HIT + 0.42, transOn = t >= GROW0 && t < SHRINK1;
      hx.canvas.style.display = flashOn || transOn ? '' : 'none';
      if (!flashOn && !transOn) return;
      hx.clearRect(0, 0, 1920, 1080);
      if (flashOn) {
        const u = (t - HIT) / 0.42, a = 0.8 * Math.exp(-(t - HIT) / 0.035);
        if (a > 0.01) { hx.fillStyle = `rgba(255,252,236,${a.toFixed(3)})`; hx.fillRect(0, 0, 1920, 1080); }
        const ringR = 0.08 + u * 1.25, fade = Math.pow(1 - u, 0.6);
        hx.fillStyle = '#FFFBEA'; hx.beginPath();
        for (const [px, py] of htDots) {
          const dd = Math.hypot((px - 960) / 1100, (py - 768) / 1100), k = Math.exp(-Math.pow((dd - ringR) / 0.16, 2));
          const r = HT_CELL * 0.62 * k * fade;
          if (r > 0.4) { hx.moveTo(px + r, py); hx.arc(px, py, r, 0, Math.PI * 2); }
        }
        hx.fill();
      }
      if (transOn) {
        if (t < CUT) { const p = S.ease('power2.in')((t - GROW0) / (CUT - GROW0)); drawDots(C, (d) => HT_CELL * 0.76 * S.clamp((p * 1.5 - d * 0.5))); }
        else { const q = S.ease('power2.out')((t - CUT) / (SHRINK1 - CUT)); drawDots(C, (d) => HT_CELL * 0.76 * S.clamp(1 - (q * 1.6 - d * 0.6))); }
      }
    });

    /* ---------- bed ---------- */
    S.sfx(0, 'drone', { dur: CUT + 0.2, freq: P.droneHz, gain: 0.08, cutoff: 380 });
    S.sfx(CUT, 'pad', { dur: 7 - CUT, gain: 0.07, notes: P.padNotes, attack: 0.3, release: 1.2 });
    S.vignette({ strength: 0.32, inner: 58 });
    S.grain({ opacity: 0.06 });
  },
});
