/* Cooking — Recipe Card (showcase: Sunday Meatloaf, 1955)
   A family index card slides onto a gingham tablecloth and writes itself, each ingredient ticked in red pencil.
   Then a chrome oven dial clicks to the bake temperature, a mid-century timer sweeps the bake time, and the ding
   delivers the finished dish, drawn in code (a glazed meatloaf or a lattice apple pie). Every word, number and
   colour comes from the params; the dial angle, the detent clicks and the timer sweep are computed from them. */
Reel.style({
  id: 'cooking-recipe-card', seed: 'recipe', order: 11,
  name: 'Recipe Card',
  transIn: { type: 'push', dur: 0.5, dir: 1 },   // how a reel cuts INTO this piece (tools/new-reel.mjs); a reel item's trans overrides it
  niches: {
    primary: ['Cooking', 'Family recipes', 'Retro & vintage food'],
    similar: ['Baking', 'Food history', 'Heirloom & grandma recipes', 'Comfort food', 'Budget home cooking', 'Holiday baking'],
  },
  niche: 'Cooking', title: 'Sunday Meatloaf, 1955', duration: 7.5, poster: 7.1,
  bg: '#6A1F15', palette: ['#C8322B', '#F6EEDC', '#2E7C79'],
  techniques: ['Soft-edge handwriting reveal', 'Detent-stepped dial with synced clicks', 'Time-lapse timer into payoff swap'],
  why: 'A steady write-and-tick beat pulls the eye down the card, then three tactile payoffs (click, sweep, ding) turn a list into a finished dish.',
  facts: 'Amounts, the ketchup and brown-sugar glaze and 350°F for about an hour follow standard mid-century American recipes for a 2 lb meatloaf; the card itself is fictional.',
  defaults: {
    title: 'Sunday Meatloaf',
    year: '1955',                          // rubber stamp beside the title ('' hides it)
    kitchen: '',                           // a name written after the printed kitchenLabel on the last ruled line ('' = none)
    kitchenLabel: 'FROM THE KITCHEN OF',
    ingredients: [                         // 3–8 rows (7 with a kitchen line); `more` adds an indented row under the same tick
      { amount: '2 lb', item: 'ground beef' },
      { amount: '1 cup', item: 'bread crumbs' },
      { amount: '2', item: 'eggs, beaten' },
      { amount: '1', item: 'onion, chopped' },
      { amount: '¾ cup', item: 'milk' },
      { prefix: 'Glaze:', amount: '½ cup', item: 'ketchup', more: '+ 2 tbsp brown sugar' },
    ],
    method: 'BAKE AT {temp} · {time}',     // the typed strip under the dial (a string or up to 2 lines); {temp} and {time} are filled in
    oven: { temp: 350, unit: 'F' },        // 'F' dial 200–500 in 25s, 'C' dial 100–240 in 10s; min/max/step/major override the scale
    timer: 60,                             // bake time in minutes: the timer winds to it (max 60) and {time} prints it
    dish: 'meatloaf',                      // the payoff drawing: 'meatloaf' or 'pie'
    ding: 'DING!',
    padNotes: [174.6, 220, 261.6, 329.6],
    colors: { ink: '#1E2747', pencil: '#C4382D', stamp: '#AE2F29', red: '#C7372C', card: '#F6EEDC' },
    cloth: { base: '#F0E2CF', check: '#A81E1A', weave: '#5A1E12', shade: '#5C1E0E', vignette: '#280802', shadow: '#2E0A02', cardShadow: '#320A02' },
  },
  build(S, P) {
    const tl = S.tl, C = P.colors, CL = P.cloth;
    const INK = C.ink, PENCIL = C.pencil, CREAM = C.card, STAMP = C.stamp, RED = C.red;
    const rad = Math.PI / 180;
    const R = (a, b) => S.rnd(a, b);
    const f2 = (v) => (+v).toFixed(2);
    const polar = (r, deg) => [r * Math.sin(deg * rad), -r * Math.cos(deg * rad)];
    const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const rgb = (h) => hex(h).join(',');
    const mix = (a, b, k) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`; };
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const tex = (w, h, paint) => { const c = document.createElement('canvas'); c.width = w; c.height = h; paint(c.getContext('2d'), w, h); return c.toDataURL('image/png'); };
    const mc = document.createElement('canvas').getContext('2d');
    const measure = (font, s) => { mc.font = font; return mc.measureText(s).width; };
    const grad = (defs, type, id, attrs, stops) => {
      const g = S.s(type, Object.assign({ id }, attrs), defs);
      stops.forEach(([o, c, a]) => S.s('stop', { offset: o, 'stop-color': c, 'stop-opacity': a ?? 1 }, g));
      return `url(#${id})`;
    };
    // an HTML box (for GSAP transforms) holding an SVG drawn in local coords around (0,0)
    const svgBox = (cx, cy, w, h, parent) => {
      const box = S.el('div', { style: `position:absolute;left:${cx - w / 2}px;top:${cy - h / 2}px;width:${w}px;height:${h}px;transform-origin:50% 50%;` }, parent);
      const sv = S.s('svg', { width: w, height: h, viewBox: `${-w / 2} ${-h / 2} ${w} ${h}`, style: 'position:absolute;left:0;top:0;overflow:visible;text-rendering:geometricPrecision;' }, box);
      return { box, sv, defs: S.defs(sv) };
    };
    const inv = (ez, y) => { let a = 0, b = 1; for (let i = 0; i < 32; i++) { const m = (a + b) / 2; if (ez(m) < y) a = m; else b = m; } return (a + b) / 2; };
    const SHADOW = rgb(CL.shadow);

    /* ---------- procedural textures (seeded, built once) ---------- */
    const WEAVE = rgb(CL.weave);
    const weaveURL = tex(256, 256, (x, w, h) => {
      x.fillStyle = '#fff'; x.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 2) { x.fillStyle = `rgba(${WEAVE},${R(0, 0.11).toFixed(3)})`; x.fillRect(0, y, w, S.rand() < 0.3 ? 2 : 1); }
      for (let i = 0; i < w; i += 2) { x.fillStyle = `rgba(${WEAVE},${R(0, 0.11).toFixed(3)})`; x.fillRect(i, 0, S.rand() < 0.3 ? 2 : 1, h); }
    });
    const CW = 1140, CH = 684, CX = 104, CY = 196;
    const paperURL = tex(CW, CH, (x, w, h) => {
      x.fillStyle = CREAM; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 110; i++) {
        const cx = R(0, w), cy = R(0, h), r = R(30, 170), a = R(0.01, 0.045);
        const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, `rgba(168,120,58,${a.toFixed(3)})`); g.addColorStop(1, 'rgba(168,120,58,0)');
        x.fillStyle = g; x.fillRect(cx - r, cy - r, 2 * r, 2 * r);
      }
      for (let i = 0; i < 3200; i++) {
        const x0 = R(0, w), y0 = R(0, h), len = R(3, 15), a = R(0, Math.PI * 2), bend = R(-3, 3), dark = S.rand() < 0.62;
        x.strokeStyle = dark ? `rgba(122,94,58,${R(0.05, 0.17).toFixed(3)})` : `rgba(255,252,242,${R(0.25, 0.6).toFixed(3)})`;
        x.lineWidth = R(0.5, 1.15);
        x.beginPath(); x.moveTo(x0, y0);
        x.quadraticCurveTo(x0 + Math.cos(a) * len * 0.5 - Math.sin(a) * bend, y0 + Math.sin(a) * len * 0.5 + Math.cos(a) * bend, x0 + Math.cos(a) * len, y0 + Math.sin(a) * len);
        x.stroke();
      }
      for (let i = 0; i < 650; i++) { const s = R(0.6, 1.9); x.fillStyle = `rgba(92,62,32,${R(0.08, 0.32).toFixed(3)})`; x.fillRect(R(0, w), R(0, h), s, s); }
      // a coffee ring from decades of Sundays: broken, uneven, darker at its rim (lower right, clear of the text)
      const ring = (cx, cy, r0, strength, from, to) => {
        const g = x.createRadialGradient(cx, cy, 0, cx, cy, r0); g.addColorStop(0, `rgba(160,108,48,${(0.05 * strength).toFixed(3)})`); g.addColorStop(1, `rgba(160,108,48,${(0.07 * strength).toFixed(3)})`);
        x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r0, 0, Math.PI * 2); x.fill();
        for (let k = 0; k < 220; k++) {
          const a0 = from + ((to - from) * k) / 220, a1 = a0 + (to - from) / 200;
          const wob = S.noise(k * 0.09, 5) * 3, a = S.clamp(0.1 + 0.16 * (0.5 + 0.5 * S.noise(k * 0.05, 9))) * strength;
          x.strokeStyle = `rgba(128,78,30,${a.toFixed(3)})`; x.lineWidth = 2.2 + 2.4 * (0.5 + 0.5 * S.noise(k * 0.07, 3));
          x.beginPath(); x.arc(cx, cy, r0 + wob, a0, a1); x.stroke();
        }
      };
      ring(1030, 598, 66, 0.8, 0, Math.PI * 2);
      ring(1052, 622, 64, 0.45, 2.4, 5.2);
    });
    const stampMask = tex(320, 150, (x, w, h) => {
      x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
      x.globalCompositeOperation = 'destination-out';
      for (let i = 0; i < 520; i++) { x.globalAlpha = R(0.35, 1); x.beginPath(); x.arc(R(0, w), R(0, h), R(0.4, 2.3), 0, 7); x.fill(); }
      for (let i = 0; i < 14; i++) { x.globalAlpha = R(0.15, 0.4); x.beginPath(); x.ellipse(R(0, w), R(0, h), R(6, 22), R(2, 6), R(0, 3), 0, 7); x.fill(); }
      const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.65, 'rgba(0,0,0,0.06)'); g.addColorStop(1, 'rgba(0,0,0,0.5)');
      x.globalAlpha = 1; x.fillStyle = g; x.fillRect(0, 0, w, h);
    });

    /* ---------- camera: tight on the card while it writes (bigger handwriting), then pull out to the oven ---------- */
    const CAM_OUT = 3.98, CAM_D = 0.56;
    S.camSet({ x: 706, y: 546, z: 1.2, r: -0.5 });
    S.camTo(0, { x: 700, y: 574, z: 1.235, r: -0.2 }, CAM_OUT, 'sine.inOut');
    S.camTo(CAM_OUT, { x: 952, y: 544, z: 1.0, r: 0.1 }, CAM_D, 'power3.inOut');
    S.camTo(CAM_OUT + CAM_D, { x: 960, y: 548, z: 1.03, r: 0.25 }, 7.5 - CAM_OUT - CAM_D, 'sine.out');

    /* ---------- gingham tablecloth, defocused, warm light ---------- */
    const CHK = 42, CR = `rgba(${rgb(CL.check)},.54)`;
    const cloth = S.el('div', { style: `position:absolute;left:-400px;top:-360px;width:2720px;height:1800px;transform:rotate(-4deg);background-color:${CL.base};background-image:url(${weaveURL}),repeating-linear-gradient(0deg,${CR} 0 ${CHK}px,transparent ${CHK}px ${CHK * 2}px),repeating-linear-gradient(90deg,${CR} 0 ${CHK}px,transparent ${CHK}px ${CHK * 2}px);background-size:256px 256px,auto,auto;background-blend-mode:multiply,normal,normal;filter:blur(3.4px);` });
    // a soft fold line pressed into the cloth
    S.el('div', { style: 'position:absolute;inset:0;background:linear-gradient(90deg,transparent 21.5%,rgba(255,246,232,.32) 22.1%,rgba(70,18,8,.16) 22.9%,transparent 24%);' }, cloth);
    S.el('div', { style: 'position:absolute;left:-200px;top:-200px;width:2320px;height:1480px;mix-blend-mode:soft-light;background:radial-gradient(ellipse 45% 50% at 40% 38%,rgba(255,206,140,.85) 0%,rgba(255,206,140,0) 72%);' });
    const SHADE = rgb(CL.shade);
    S.el('div', { style: `position:absolute;left:-200px;top:-200px;width:2320px;height:1480px;mix-blend-mode:multiply;background:radial-gradient(ellipse 62% 66% at 46% 44%,rgba(${SHADE},0) 46%,rgba(${SHADE},.62) 100%);` });

    /* ---------- the index card ---------- */
    const cardWrap = S.el('div', { style: `position:absolute;left:${CX}px;top:${CY}px;width:${CW}px;height:${CH}px;transform-origin:50% 60%;` });
    S.el('div', { style: `position:absolute;left:12px;top:24px;width:${CW}px;height:${CH}px;border-radius:10px;background:rgba(${rgb(CL.cardShadow)},.55);filter:blur(15px);` }, cardWrap);
    const card = S.el('div', { style: `position:absolute;left:0;top:0;width:${CW}px;height:${CH}px;border-radius:5px;overflow:hidden;background:url(${paperURL}) 0 0/100% 100%;box-shadow:0 1px 1px rgba(70,30,10,.45),inset 0 0 0 1px rgba(140,105,60,.3),inset 0 0 46px rgba(168,122,58,.24);` }, cardWrap);
    const csv = S.s('svg', { width: CW, height: CH, viewBox: `0 0 ${CW} ${CH}`, style: 'position:absolute;left:0;top:0;overflow:visible;text-rendering:geometricPrecision;' }, card);
    const cdefs = S.defs(csv);
    const HEAD = 134, ROW0 = 198, ROWH = 63;
    S.s('line', { x1: 0, x2: CW, y1: HEAD, y2: HEAD, stroke: '#D95F58', 'stroke-width': 2.4, opacity: 0.9 }, csv);
    for (let k = 0; k < 8; k++) S.s('line', { x1: 0, x2: CW, y1: ROW0 + ROWH * k, y2: ROW0 + ROWH * k, stroke: '#8BB0D8', 'stroke-width': 1.7, opacity: 0.8 }, csv);
    // warm light falling across the card
    S.el('div', { style: 'position:absolute;inset:0;pointer-events:none;background:linear-gradient(122deg,rgba(255,247,226,.3) 0%,rgba(255,247,226,0) 46%,rgba(112,62,22,.08) 100%);' }, card);

    // pencil grain for the red ticks
    const pencilId = S.uid('pencil');
    const pf = S.s('filter', { id: pencilId, x: '-30%', y: '-30%', width: '160%', height: '160%' }, cdefs);
    S.s('feTurbulence', { type: 'fractalNoise', baseFrequency: 0.85, numOctaves: 2, seed: 11, result: 'n' }, pf);
    S.s('feColorMatrix', { in: 'n', type: 'matrix', values: '0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.3 0 0 0 -0.45', result: 'a' }, pf);
    S.s('feComposite', { in: 'SourceGraphic', in2: 'a', operator: 'in', result: 'g' }, pf);
    S.s('feDisplacementMap', { in: 'g', in2: 'n', scale: 2.2, xChannelSelector: 'R', yChannelSelector: 'G' }, pf);

    // handwriting: SVG text revealed left→right through a soft-edged gradient mask; o.maxW shrinks long lines to fit
    let hwN = 0;
    const writeOn = (text, x, y, size, t, o = {}) => {
      if (o.maxW) { const tw = measure(`400 ${size}px "Homemade Apple"`, text); if (tw > o.maxW) size = +((size * o.maxW) / tw).toFixed(2); }
      const id = S.uid('hw' + ++hwN), gid = id + 'g';
      const lg = S.s('linearGradient', { id: gid, gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 1, y2: 0 }, cdefs);
      S.s('stop', { offset: 0, 'stop-color': '#fff' }, lg); S.s('stop', { offset: 1, 'stop-color': '#000' }, lg);
      const m = S.s('mask', { id, maskUnits: 'userSpaceOnUse', x: 0, y: y - size * 1.6, width: CW, height: size * 2.8 }, cdefs);
      S.s('rect', { x: 0, y: y - size * 1.6, width: CW, height: size * 2.8, fill: `url(#${gid})` }, m);
      const tx = S.s('text', { x, y, 'font-family': 'Homemade Apple', 'font-size': size, fill: INK, mask: `url(#${id})`, text }, csv);
      const w = tx.getComputedTextLength();
      const dur = o.dur ?? S.clamp(w / 1450, 0.25, 0.33);
      const E = 0.9 * size, x0 = x - 0.62 * size;
      tl.fromTo(lg, { attr: { x1: x0 - E, x2: x0 } }, { attr: { x1: x + w + 8, x2: x + w + 8 + E }, duration: dur, ease: o.ease || 'sine.inOut' }, t);
      // pen scratch texture, panned to the card side
      const n = Math.max(2, Math.round(dur / 0.085));
      for (let k = 0; k < n; k++) S.sfx(t + (k + 0.15) * (dur / n), 'scratch', { gain: 0.07 + 0.035 * S.rand(), dur: 0.05 + 0.05 * S.rand(), pan: -0.1 });
      return { tx, w, dur };
    };
    const tick = (cx, cy, t) => {
      const s = R(0.92, 1.08), rot = R(-7, 5);
      const p = S.s('path', { d: 'M-21 -7 C-16 -3,-11 3,-7 11 C0 -6,10 -22,25 -35', transform: `translate(${cx},${cy}) rotate(${f2(rot)}) scale(${f2(s)})`, fill: 'none', stroke: PENCIL, 'stroke-width': 5.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', filter: `url(#${pencilId})` }, csv);
      S.draw(p, t, 0.15, { ease: 'power1.in' });
      S.sfx(t, 'scratch', { gain: 0.24, dur: 0.13, pan: -0.15 });
    };

    // title + year stamp (the title shrinks so the stamp always fits on the card)
    const YEAR = String(P.year ?? ''), TITLE = String(P.title ?? '');
    const stampW = YEAR ? measure('400 52px "Alfa Slab One"', YEAR) + YEAR.length * 2.6 + 66 : 0;
    const title = TITLE ? writeOn(TITLE, 96, 104, 72, 0.62, { dur: 0.7, ease: 'power1.inOut', maxW: CW - 126 - (YEAR ? 70 + stampW : 0) }) : { w: 0 };
    if (YEAR) {
      const stamp = S.el('div', { style: `position:absolute;left:${Math.round(96 + title.w + 70)}px;top:26px;padding:5px;border:4px solid ${STAMP};border-radius:10px;mix-blend-mode:multiply;-webkit-mask-image:url(${stampMask});mask-image:url(${stampMask});-webkit-mask-size:100% 100%;mask-size:100% 100%;` }, card);
      S.el('div', { text: YEAR, style: `padding:9px 22px 3px;border:2px solid ${STAMP};border-radius:6px;font:400 52px/1 "Alfa Slab One",serif;letter-spacing:.05em;color:${STAMP};` }, stamp);
      tl.fromTo(stamp, { scale: 1.55, rotation: -15, opacity: 0 }, { scale: 1, rotation: -8, opacity: 0.9, duration: 0.13, ease: 'power3.in' }, 1.34);
      S.sfx(1.47, 'stamp', { gain: 0.5, pan: 0.1 });
      S.shake(1.47, { amp: 3, dur: 0.22, rot: 0.1 });
    }

    // ingredients, written row by row on a steady beat, each ticked in red pencil. Rows clamp to the ruled lines
    // (8, or 7 with a kitchen line); the beat is 0.44 s for the showcase's 6 items and fits any length into 1.2–3.4 s
    const ROWS = P.kitchen ? 7 : 8;
    const list = [];
    let used = 0;
    for (const it of P.ingredients || []) {
      const o = typeof it === 'string' ? { text: it } : { text: [it.prefix, it.amount, it.item].filter((s) => s != null && String(s).trim()).join(' '), more: it.more ? String(it.more) : '' };
      if (!o.text) continue;
      const need = o.more ? 2 : 1;
      if (used + need > ROWS) break;
      list.push(Object.assign({ row: used }, o)); used += need;
    }
    const lastBeat = list.length ? list[list.length - 1].row : 0;
    const BEAT = lastBeat > 0 ? Math.min(0.55, (3.4 - 1.2) / lastBeat) : 0, T0 = 3.4 - BEAT * lastBeat;
    const beatT = (b) => +(T0 + BEAT * b).toFixed(4);
    const TX0 = 124, TICKX = 74;
    let listEnd = 1.2;
    list.forEach((it) => {
      const base = ROW0 + ROWH * it.row, st = beatT(it.row);
      const w = writeOn(it.text, TX0, base, 47, st, { maxW: CW - TX0 - 40 });
      if (!it.more) { tick(TICKX, base - 12, st + w.dur + 0.01); listEnd = st + w.dur; return; }
      const end1 = st + w.dur;   // a `more` row is written straight after its item and shares its tick
      const w2 = writeOn(it.more, TX0 + 52, base + ROWH, 47, end1 + 0.02, { maxW: CW - TX0 - 92 });
      tick(TICKX, base - 12, end1 + 0.02 + w2.dur + 0.01);
      listEnd = end1 + 0.02 + w2.dur;
    });

    // card slides across the cloth and settles at a slight angle
    tl.fromTo(cardWrap, { x: -1020, y: 110 }, { x: 0, y: 0, duration: 0.85, ease: 'expo.out' }, 0);
    tl.fromTo(cardWrap, { rotation: -15 }, { rotation: -2, duration: 1.05, ease: 'back.out(1.5)' }, 0);
    S.sfx(0, 'swoosh', { gain: 0.2, dur: 0.5, from: 260, to: 1700, pan: -0.3 });
    S.sfx(0.03, 'paper', { gain: 0.32, dur: 0.62, pan: -0.3 });

    /* ---------- oven dial (chrome); the scale, the setting and the detent count come from params.oven ---------- */
    const OV = P.oven || {}, UNIT = String(OV.unit || 'F').toUpperCase() === 'C' ? 'C' : 'F';
    const SC = Object.assign(UNIT === 'C' ? { min: 100, max: 240, step: 10, major: 20 } : { min: 200, max: 500, step: 25, major: 50 },
      ...['min', 'max', 'step', 'major'].filter((k) => OV[k] != null).map((k) => ({ [k]: +OV[k] })));
    const TEMP = OV.temp != null ? +OV.temp : UNIT === 'C' ? 180 : 350;
    const NTICK = Math.round((SC.max - SC.min) / SC.step);
    const D = S.clamp(Math.round((TEMP - SC.min) / SC.step), 0, NTICK), TSET = SC.min + D * SC.step;   // detents after the sweep to min
    const DPU = 240 / (SC.max - SC.min), DEG = (240 * SC.step) / (SC.max - SC.min);
    const DX = 1545, DY = 306, DS = 1.05;
    const dial = svgBox(DX, DY, 460, 460);
    dial.box.style.filter = `drop-shadow(9px 15px 11px rgba(${SHADOW},.5))`;
    const dsv = dial.sv, dd = dial.defs;
    const chrome = grad(dd, 'linearGradient', S.uid('chr'), { x1: 0, y1: 0, x2: 1, y2: 1 }, [[0, '#FFFFFF'], [0.2, '#C9CDD2'], [0.36, '#5F5553'], [0.5, '#F3F3F1'], [0.64, '#9EA2A7'], [0.8, '#4F4543'], [1, '#DADCDE']]);
    const enamel = grad(dd, 'radialGradient', S.uid('ena'), { cx: 0.42, cy: 0.36, r: 0.72 }, [[0, '#FDF8EE'], [0.72, '#F1E7D4'], [1, '#E0D2B8']]);
    const capG = grad(dd, 'radialGradient', S.uid('cap'), { cx: 0.36, cy: 0.3, r: 0.8 }, [[0, '#FFFFFF'], [0.22, '#E8EAEC'], [0.55, '#9DA3A9'], [0.8, '#5E5553'], [1, '#B3B7BB']]);
    const gripG = grad(dd, 'linearGradient', S.uid('grip'), { x1: 0, y1: 0, x2: 1, y2: 0 }, [[0, '#5A5F65'], [0.28, '#E7E9EB'], [0.42, '#FFFFFF'], [0.62, '#A8ADB2'], [1, '#4E545A']]);
    S.s('circle', { r: 172, fill: chrome }, dsv);
    S.s('circle', { r: 172, fill: 'none', stroke: 'rgba(30,20,18,.5)', 'stroke-width': 1.5 }, dsv);
    S.s('circle', { r: 159, fill: enamel, stroke: 'rgba(80,58,38,.5)', 'stroke-width': 2 }, dsv);
    const ang = (v) => -120 + DPU * (v - SC.min);
    let nSet = null, tickSet = null;
    for (let k = 0; k <= NTICK; k++) {
      const v = SC.min + k * SC.step, a = ang(v), q = (v - SC.min) / SC.major, major = Math.abs(q - Math.round(q)) < 1e-6;
      const [x0, y0] = polar(major ? 139 : 144, a), [x1, y1] = polar(152, a);
      const ln = S.s('line', { x1: f2(x0), y1: f2(y0), x2: f2(x1), y2: f2(y1), stroke: '#3A322E', 'stroke-width': major ? 3.5 : 2, 'stroke-linecap': 'round' }, dsv);
      if (k === D) tickSet = ln;
      if (major) {
        const [tx, ty] = polar(108, a);
        const el = S.s('text', { x: f2(tx), y: f2(ty), 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Archivo', 'font-weight': 800, 'font-size': 24, fill: '#2B2421', text: String(+v.toFixed(1)) }, dsv);
        if (k === D) nSet = el;
      }
    }
    S.s('text', { x: 0, y: 112, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Archivo', 'font-weight': 800, 'font-size': 22, 'letter-spacing': 2, fill: '#B3302A', text: 'OFF' }, dsv);
    // knob: conic chrome skirt (static light), knurl + grip + pointer rotate
    const RS = 76;
    for (let i = 0; i < 90; i++) {
      const a0 = (i / 90) * 360, a1 = ((i + 1.3) / 90) * 360, m = ((i + 0.5) / 90) * 2 * Math.PI;
      const L = S.clamp(0.52 + 0.34 * Math.cos(2 * (m - 0.75)) + 0.12 * Math.cos(5 * m + 0.8));
      const [x0, y0] = polar(RS, a0), [x1, y1] = polar(RS, a1);
      S.s('path', { d: `M0 0L${f2(x0)} ${f2(y0)}A${RS} ${RS} 0 0 1 ${f2(x1)} ${f2(y1)}Z`, fill: mix('#4A4240', '#F7F8F9', L) }, dsv);
    }
    S.s('circle', { r: RS, fill: 'none', stroke: 'rgba(30,24,22,.55)', 'stroke-width': 2 }, dsv);
    const knurl = S.s('g', {}, dsv);
    for (let i = 0; i < 72; i++) { const [a, b] = polar(68, i * 5), [c, d] = polar(RS - 1, i * 5); S.s('line', { x1: f2(a), y1: f2(b), x2: f2(c), y2: f2(d), stroke: 'rgba(36,32,30,.38)', 'stroke-width': 1.4 }, knurl); }
    S.s('circle', { r: 57, fill: capG, stroke: 'rgba(40,34,32,.45)', 'stroke-width': 1.5 }, dsv);
    const grip = S.s('g', {}, dsv);
    S.s('rect', { x: -14, y: -73, width: 28, height: 146, rx: 14, fill: gripG, stroke: 'rgba(40,34,32,.55)', 'stroke-width': 1.5 }, grip);
    S.s('rect', { x: -3.5, y: -69, width: 7, height: 40, rx: 3.5, fill: RED }, grip);
    // oven-on pilot lamp
    const lampOnId = S.uid('lampon'), lampGlowId = S.uid('lampglow');
    grad(dd, 'radialGradient', lampOnId, { cx: 0.4, cy: 0.35, r: 0.7 }, [[0, '#FFE2A8'], [0.45, '#FF7A3A'], [1, '#C4200F']]);
    grad(dd, 'radialGradient', lampGlowId, { cx: 0.5, cy: 0.5, r: 0.5 }, [[0, '#FF8A3D', 0.75], [1, '#FF8A3D', 0]]);
    const lamp = S.s('g', { transform: 'translate(150,150)' }, dsv);
    S.s('circle', { r: 19, fill: chrome }, lamp);
    S.s('circle', { r: 12.5, fill: '#5C1712' }, lamp);
    const lampOn = S.s('g', { opacity: 0 }, lamp);
    S.s('circle', { r: 34, fill: `url(#${lampGlowId})` }, lampOn);
    S.s('circle', { r: 12.5, fill: `url(#${lampOnId})` }, lampOn);
    S.s('circle', { cx: -4, cy: -4.5, r: 3.4, fill: '#FFFFFF', opacity: 0.75 }, lamp);

    tl.fromTo(dial.box, { scale: 0.62 * DS, y: 26 }, { scale: DS, y: 0, duration: 0.5, ease: 'back.out(1.7)' }, 4.3);
    tl.fromTo(dial.box, { opacity: 0 }, { opacity: 1, duration: 0.1, ease: 'power1.out' }, 4.3);
    S.sfx(CAM_OUT, 'whoosh', { gain: 0.24, dur: 0.6, from: 220, to: 1800, pan: 0.2 });
    S.sfx(4.32, 'pop', { gain: 0.3, pitch: 0.8, pan: 0.3 });

    // detent-stepped rotation: OFF (180°) sweeps to the scale's minimum (240°), then snaps one step per detent
    const knob = { p: 0 }, KT0 = 4.56, KD = 0.6, KE = S.ease('power1.inOut'), PEND = 1 + D;
    tl.to(knob, { p: PEND, duration: KD, ease: 'power1.inOut' }, KT0);
    const knobAngle = (p) => {
      if (p <= 1) return 180 + 60 * S.ease('sine.inOut')(p);
      const k = Math.min(D - 1, Math.floor(p - 1)), f = S.clamp(p - 1 - k);
      return 240 + DEG * k + DEG * S.ease('power3.out')(S.clamp(f / 0.42));
    };
    const tAt = (p) => KT0 + KD * inv(KE, p / PEND);
    const tOn = tAt(0.14);
    S.sfx(tOn, 'click', { gain: 0.42, pitch: 0.55, pan: 0.3 });
    for (let k = 0; k < D; k++) S.sfx(tAt(1.3 + k), 'ratchet', { count: 1, gain: 0.34 + k * 0.02 * (5 / Math.max(5, D - 1)), pan: 0.3 });
    const tSet = tAt(D + 0.3);
    S.sfx(tSet + 0.01, 'thud', { gain: 0.22, pitch: 1.4, pan: 0.3 });
    tl.fromTo(lampOn, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: 'power2.out' }, tOn);
    if (nSet) {
      tl.fromTo(nSet, { scale: 1 }, { scale: 1.32, duration: 0.14, ease: 'power2.out', transformOrigin: '50% 50%' }, tSet);
      tl.to(nSet, { scale: 1.12, duration: 0.3, ease: 'back.out(3)' }, tSet + 0.14);
      tl.fromTo(nSet, { fill: '#2B2421' }, { fill: RED, duration: 0.12 }, tSet);
    } else {
      // an unlabelled setting (e.g. 425 °F): the tick turns red and a red dot pops beside it
      const [mx, my] = polar(127, ang(TSET));
      const dot = S.s('circle', { cx: f2(mx), cy: f2(my), r: 7, fill: RED }, dsv);
      tl.fromTo(dot, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.3, ease: 'back.out(3)' }, tSet);
      tl.fromTo(tickSet, { attr: { stroke: '#3A322E', 'stroke-width': 2 } }, { attr: { stroke: RED, 'stroke-width': 4 }, duration: 0.12 }, tSet);
    }
    S.sfx(tSet + 0.03, 'blip', { gain: 0.18, pitch: 0.9, pan: 0.3 });
    let lastA = null;
    S.onFrame(() => {
      const a = knobAngle(knob.p);
      if (a !== lastA) { const tr = `rotate(${a.toFixed(2)})`; grip.setAttribute('transform', tr); knurl.setAttribute('transform', tr); lastA = a; }
    });

    // typed method line(s) on a torn paper strip: {temp} in red, {time} from the timer
    const MINS = Math.max(1, Math.round(+P.timer || 60)), TMIN = Math.min(60, MINS);
    const fmtTime = (m) => (m % 60 === 0 ? `${m / 60} HOUR${m === 60 ? '' : 'S'}` : m < 60 ? `${m} MIN` : `${Math.floor(m / 60)} HR ${m % 60} MIN`);
    const TEMPS = `${+TEMP.toFixed(1)}°${UNIT}`;
    const METHOD = (Array.isArray(P.method) ? P.method : [P.method]).filter((s) => s != null && String(s).trim()).slice(0, 2).map(String);
    const mPlain = METHOD.map((s) => s.replace('{temp}', TEMPS).replace('{time}', fmtTime(MINS)));
    const mHtml = METHOD.map((s) => esc(s).replace('{temp}', `<span style="color:${RED}">${TEMPS}</span>`).replace('{time}', fmtTime(MINS)));
    const LW = 560, LH = 76 + 50 * Math.max(0, METHOD.length - 1), LY = 540;
    const labelOuter = S.el('div', { style: `position:absolute;left:${DX - LW / 2}px;top:${LY - 38}px;width:${LW}px;height:${LH}px;filter:drop-shadow(4px 7px 5px rgba(${SHADOW},.42));transform:rotate(1.4deg);` });
    let poly = [];
    for (let i = 0; i <= 10; i++) poly.push(`${f2(R(0, 1.2))}% ${i * 10}%`);
    for (let i = 10; i >= 0; i--) poly.push(`${f2(100 - R(0, 1.2))}% ${i * 10}%`);
    const label = S.el('div', { style: `position:absolute;inset:0;background:#F4EAD5 url(${paperURL}) -300px -200px;clip-path:polygon(${poly.join(',')});` }, labelOuter);
    const mText = S.el('div', { html: mHtml.join('<br>'), style: `position:absolute;left:0;right:0;top:${METHOD.length > 1 ? 13 : 0}px;line-height:${METHOD.length > 1 ? 50 : LH + 4}px;text-align:center;font:400 41px "Special Elite",monospace;color:#2A211C;white-space:nowrap;` }, label);
    const mW = Math.max(0, ...mPlain.map((s) => measure('400 41px "Special Elite"', s)));
    if (mW > 520) mText.style.fontSize = ((41 * 520) / mW).toFixed(2) + 'px';
    if (!METHOD.length) labelOuter.style.display = 'none';
    tl.fromTo(labelOuter, { clipPath: 'inset(-30% 100% -30% -4%)' }, { clipPath: 'inset(-30% -4% -30% -4%)', duration: 0.38, ease: 'power2.out' }, tSet + 0.08);
    if (METHOD.length) S.sfx(tSet + 0.08, 'paper', { gain: 0.2, dur: 0.3, pan: 0.3 });

    /* ---------- mid-century kitchen timer: winds to the bake time, then an hour-or-less sweeps by ---------- */
    const TX = 1545, TY = 826, TS = 1.08;
    const timer = svgBox(TX, TY, 360, 360);
    timer.box.style.filter = `drop-shadow(9px 14px 10px rgba(${SHADOW},.5))`;
    const tsv = timer.sv, td = timer.defs;
    const bodyG = grad(td, 'radialGradient', S.uid('tb'), { cx: 0.34, cy: 0.28, r: 0.85 }, [[0, '#D5F2E7'], [0.5, '#9FD7C4'], [1, '#62A895']]);
    const chrome2 = grad(td, 'linearGradient', S.uid('tc'), { x1: 0, y1: 0, x2: 1, y2: 1 }, [[0, '#FFFFFF'], [0.3, '#BFC4C9'], [0.5, '#5E5654'], [0.68, '#EEEEEC'], [1, '#8E9398']]);
    const cap2 = grad(td, 'radialGradient', S.uid('tcap'), { cx: 0.35, cy: 0.3, r: 0.8 }, [[0, '#FFFFFF'], [0.5, '#A9AFB4'], [1, '#5A5250']]);
    const wob = S.s('g', {}, tsv);
    S.s('ellipse', { cx: -72, cy: 114, rx: 24, ry: 10, fill: '#3F7266' }, wob);
    S.s('ellipse', { cx: 72, cy: 114, rx: 24, ry: 10, fill: '#3F7266' }, wob);
    S.s('rect', { x: -17, y: -140, width: 34, height: 26, rx: 7, fill: chrome2, stroke: 'rgba(40,34,32,.45)', 'stroke-width': 1.5 }, wob);
    S.s('circle', { r: 124, fill: bodyG, stroke: '#4B8A7A', 'stroke-width': 3 }, wob);
    S.s('path', { d: 'M-98 -46 A108 108 0 0 1 -36 -102', fill: 'none', stroke: '#FFFFFF', 'stroke-width': 7, 'stroke-linecap': 'round', opacity: 0.55 }, wob);
    S.s('circle', { r: 101, fill: chrome2 }, wob);
    S.s('circle', { r: 93, fill: '#FBF6EA' }, wob);
    const wedge = S.s('path', { d: 'M0 0Z', fill: '#E04A3C', opacity: 0.92 }, wob);
    const face = S.s('g', {}, wob);
    for (let m = 0; m < 60; m++) {
      const major = m % 5 === 0, [a, b] = polar(major ? 76 : 82, m * 6), [c, d] = polar(89, m * 6);
      S.s('line', { x1: f2(a), y1: f2(b), x2: f2(c), y2: f2(d), stroke: '#2B2421', 'stroke-width': major ? 3 : 1.4, 'stroke-linecap': 'round' }, face);
    }
    for (let m = 0; m < 60; m += 10) {
      const [x, y] = polar(59, m * 6);
      S.s('text', { x: f2(x), y: f2(y), 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Archivo', 'font-weight': 800, 'font-size': 22, fill: '#2B2421', text: String(m) }, face);
    }
    S.s('path', { d: 'M0 -86 L-10 -108 L10 -108 Z', fill: RED, stroke: '#7A1C15', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, wob);
    S.s('circle', { r: 17, fill: cap2, stroke: 'rgba(40,34,32,.4)', 'stroke-width': 1.5 }, wob);

    const tm = { m: 0 };
    const wedgePath = (m, r) => {
      if (m <= 0.05) return 'M0 0Z';
      if (m >= 59.95) return `M0 ${-r}A${r} ${r} 0 1 1 0 ${r}A${r} ${r} 0 1 1 0 ${-r}Z`;
      const [x, y] = polar(r, -m * 6);
      return `M0 0L${f2(x)} ${f2(y)}A${r} ${r} 0 ${m > 30 ? 1 : 0} 1 0 ${-r}Z`;
    };
    const DING = 6.02;
    tl.fromTo(timer.box, { scale: 0.3 * TS, rotation: -28 }, { scale: TS, rotation: 0, duration: 0.5, ease: 'back.out(1.8)' }, 5.2);
    tl.fromTo(timer.box, { opacity: 0 }, { opacity: 1, duration: 0.1, ease: 'power1.out' }, 5.2);
    S.sfx(5.2, 'pop', { gain: 0.34, pitch: 1.1, pan: 0.3 });
    tl.to(tm, { m: TMIN, duration: 0.22, ease: 'power2.out' }, 5.34);
    S.sfx(5.34, 'ratchet', { count: Math.max(2, Math.round((6 * TMIN) / 60)), gap: 0.032, gain: 0.2, pan: 0.3 });
    tl.to(tm, { m: 0, duration: DING - 5.58, ease: 'sine.in' }, 5.58);
    [5.58, 5.69, 5.78, 5.86, 5.925, 5.97, 6.0].forEach((tt, i) => S.sfx(tt, 'tick', { gain: 0.16 + i * 0.012, pitch: i % 2 ? 0.62 : 0.82, pan: 0.3 }));
    S.onFrame((t) => {
      wedge.setAttribute('d', wedgePath(tm.m, 93));
      face.setAttribute('transform', `rotate(${f2(-tm.m * 6)})`);
      const u = t - DING;
      if (u > 0 && u < 0.7) {
        const d = Math.exp(-6.5 * u);
        wob.setAttribute('transform', `translate(0 ${f2(-9 * d * Math.abs(Math.sin(u * 2 * Math.PI * 4.2)))}) rotate(${f2(7 * d * Math.sin(u * 2 * Math.PI * 8))} 0 112)`);
      } else wob.setAttribute('transform', '');
    });
    // DING! burst
    const ding = svgBox(1716, 676, 280, 190);
    const dpts = [];
    for (let i = 0; i < 28; i++) { const a = (i / 28) * 2 * Math.PI, rr = i % 2 ? 0.78 : 1; dpts.push(`${f2(Math.cos(a) * 122 * rr)},${f2(Math.sin(a) * 78 * rr)}`); }
    S.s('polygon', { points: dpts.join(' '), fill: '#FFF7E8', stroke: RED, 'stroke-width': 5, 'stroke-linejoin': 'round' }, ding.sv);
    const DTXT = String(P.ding ?? ''), dW = measure('400 52px "Alfa Slab One"', DTXT);
    S.s('text', { x: 0, y: 3, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Alfa Slab One', 'font-size': dW > 190 ? f2((52 * 190) / dW) : 52, fill: RED, 'letter-spacing': 1, text: DTXT }, ding.sv);
    ding.box.style.filter = `drop-shadow(5px 8px 6px rgba(${SHADOW},.4))`;
    if (!DTXT) ding.box.style.display = 'none';
    tl.fromTo(ding.box, { scale: 0, opacity: 0, rotation: -14 }, { scale: 1, opacity: 1, rotation: 8, duration: 0.42, ease: 'back.out(2.6)' }, DING);
    tl.to(ding.box, { opacity: 0, scale: 0.86, y: -18, duration: 0.3, ease: 'power2.in' }, DING + 0.5);
    S.sfx(DING, 'ding', { gain: 0.5, freq: 2350, pan: 0.35 });
    S.sfx(DING + 0.11, 'ding', { gain: 0.18, freq: 2350, pan: 0.35 });
    tl.to(timer.box, { scale: 0, opacity: 0, duration: 0.16, ease: 'back.in(1.8)' }, DING + 0.2);
    S.sfx(DING + 0.2, 'swoosh', { gain: 0.14, pitch: 1.2, pan: 0.3 });

    /* ---------- the payoff: the finished dish, steaming ---------- */
    const panGrads = (d) => ({
      panG: grad(d, 'linearGradient', S.uid('pan'), { x1: 0, y1: 0, x2: 0, y2: 1 }, [[0, '#3C8F89'], [1, '#215D58']]),
      rimG: grad(d, 'linearGradient', S.uid('rim'), { x1: 0, y1: 0, x2: 0, y2: 1 }, [[0, '#86D0C8'], [1, '#2E7A75']]),
      rimBackG: grad(d, 'linearGradient', S.uid('rimb'), { x1: 0, y1: 0, x2: 0, y2: 1 }, [[0, '#5FB1A9'], [1, '#2B716C']]),
      glintG: grad(d, 'linearGradient', S.uid('gl'), { x1: 0, y1: 0, x2: 1, y2: 0 }, [[0, '#FFFFFF', 0], [0.5, '#FFFFFF', 0.8], [1, '#FFFFFF', 0]]),
    });
    const DISHES = {
      // glazed meatloaf in a teal enamel loaf pan
      meatloaf(lsv, ld) {
        const meatG = grad(ld, 'linearGradient', S.uid('meat'), { x1: 0, y1: 0, x2: 0, y2: 1 }, [[0, '#9A5733'], [0.55, '#7A4125'], [1, '#552816']]);
        const glazeG = grad(ld, 'linearGradient', S.uid('glz'), { x1: 0, y1: 0, x2: 0, y2: 1 }, [[0, '#EE6A3B'], [0.6, '#CF4326'], [1, '#A92C1A']]);
        const { panG, rimG, rimBackG, glintG } = panGrads(ld);
        // pan opening: back rim and the dark interior that shows at the loaf's ends
        S.s('rect', { x: -233, y: -26, width: 466, height: 46, rx: 13, fill: rimBackG }, lsv);
        S.s('rect', { x: -216, y: -15, width: 432, height: 28, rx: 9, fill: '#16403C' }, lsv);
        // the loaf: domed, crusty sides
        S.s('path', { d: 'M-200 14 C-206 -30,-192 -74,-148 -90 C-98 -104,98 -104,148 -90 C192 -74,206 -30,200 14 Z', fill: meatG }, lsv);
        for (let i = 0; i < 46; i++) {
          const x = R(-186, 186), y = R(-46, 6), light = S.rand() < 0.28;
          S.s('ellipse', { cx: f2(x), cy: f2(y), rx: f2(light ? R(1.5, 3) : R(2.5, 6.5)), ry: f2(light ? R(1.2, 2.2) : R(1.6, 3.6)), fill: light ? '#EBD3A6' : '#4A2211', opacity: f2(light ? R(0.55, 0.85) : R(0.35, 0.65)) }, lsv);
        }
        // ketchup + brown sugar glaze with drips, a caramelised edge and wet highlights
        const GLAZE = 'M-188 -40 C-184 -70,-168 -84,-140 -93 C-90 -106,90 -106,140 -93 C168 -84,184 -70,188 -40 C184 -36,180 -30,177 -22 C174 -12,164 -13,164 -24 C163 -35,150 -42,132 -45 C116 -48,108 -40,106 -30 C104 -19,92 -20,92 -32 C91 -45,68 -52,36 -54 C6 -56,-18 -54,-32 -49 C-42 -45,-45 -37,-47 -28 C-49 -18,-60 -19,-60 -30 C-60 -42,-82 -48,-110 -48 C-134 -48,-148 -42,-154 -34 C-158 -28,-160 -19,-168 -19 C-176 -19,-176 -30,-178 -35 C-181 -39,-185 -40,-188 -40 Z';
        S.s('path', { d: GLAZE, fill: glazeG, stroke: '#86220F', 'stroke-width': 1.6, 'stroke-opacity': 0.6 }, lsv);
        S.s('path', { d: 'M-134 -84 C-70 -97,40 -98,128 -87', fill: 'none', stroke: '#FFFFFF', 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.55 }, lsv);
        S.s('path', { d: 'M152 -79 C162 -73,169 -65,173 -56', fill: 'none', stroke: '#FFFFFF', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.42 }, lsv);
        [[-152, -70, 3.6, 0.7], [-100, -88, 2.4, 0.6], [62, -93, 2.2, 0.55], [100, -30, 2.2, 0.45], [-56, -34, 2, 0.4]].forEach(([cx, cy, r, o]) => S.s('circle', { cx, cy, r, fill: '#FFFFFF', opacity: o }, lsv));
        const glzClip = S.uid('glzclip');
        S.s('path', { d: GLAZE }, S.s('clipPath', { id: glzClip }, ld));
        const glint = S.s('rect', { x: -28, y: -124, width: 56, height: 140, fill: glintG, transform: 'skewX(-22)' }, S.s('g', {}, S.s('g', { 'clip-path': `url(#${glzClip})` }, lsv)));
        // teal enamel loaf pan, front face and rim
        S.s('path', { d: 'M-222 12 L222 12 L204 98 Q202 107 193 107 L-193 107 Q-202 107 -204 98 Z', fill: panG }, lsv);
        S.s('path', { d: 'M-190 24 L-158 24 L-165 99 L-196 99 Z', fill: '#FFFFFF', opacity: 0.11 }, lsv);
        S.s('path', { d: 'M-148 24 L-139 24 L-145 99 L-154 99 Z', fill: '#FFFFFF', opacity: 0.07 }, lsv);
        S.s('rect', { x: -233, y: 0, width: 466, height: 21, rx: 10.5, fill: rimG, stroke: 'rgba(20,50,48,.35)', 'stroke-width': 1.5 }, lsv);
        S.s('line', { x1: -218, x2: 218, y1: 5, y2: 5, stroke: '#FFFFFF', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.55 }, lsv);
        return { glint, steamDY: 0 };
      },
      // lattice-top apple pie in a teal enamel pie plate, seen from a little above (a dome projected onto an ellipse)
      pie(sv, d) {
        const RX = 206, RY = 84, PCY = 2, HD = 28, K = 0.93, cyR = PCY + 14;
        const pt = (u, v, h = 0) => [RX * u, PCY + RY * v - h];
        const hgt = (u, v) => HD * Math.max(0, 1 - u * u - v * v);
        const P2 = ([x, y]) => `${f2(x)} ${f2(y)}`;
        const ring = (r, h) => { const out = []; for (let k = 0; k < 96; k++) { const a = (k / 96) * 2 * Math.PI; out.push(pt(r * Math.cos(a), r * Math.sin(a), h)); } return 'M' + out.map(P2).join('L') + 'Z'; };
        const crustG = grad(d, 'linearGradient', S.uid('crust'), { gradientUnits: 'userSpaceOnUse', x1: -140, y1: PCY - RY - 20, x2: 140, y2: PCY + RY }, [[0, '#F7D48C'], [0.35, '#E6A553'], [0.7, '#C47C31'], [1, '#93501B']]);
        const fillG = grad(d, 'radialGradient', S.uid('pfill'), { cx: 0.45, cy: 0.42, r: 0.62 }, [[0, '#E9A84E'], [0.5, '#B8651F'], [1, '#6E320C']]);
        const { panG, rimG, rimBackG, glintG } = panGrads(d);
        // enamel pie plate: lip and well, the front wall under the lip, the lip's lit front band
        S.s('ellipse', { cx: 0, cy: cyR, rx: 240, ry: 100, fill: rimBackG }, sv);
        S.s('ellipse', { cx: 0, cy: cyR + 3, rx: 222, ry: 90, fill: '#16403C' }, sv);
        S.s('path', { d: `M-240 ${cyR} A240 100 0 0 0 240 ${cyR} L200 ${cyR + 40} A200 82 0 0 1 -200 ${cyR + 40} Z`, fill: panG }, sv);
        S.s('path', { d: `M-240 ${cyR} A240 100 0 0 0 240 ${cyR} L222 ${cyR + 3} A222 90 0 0 1 -222 ${cyR + 3} Z`, fill: rimG }, sv);
        S.s('path', { d: `M-206 ${cyR + 50} A236 96 0 0 0 206 ${cyR + 50}`, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.4 }, sv);
        // bubbling apple filling with slices catching the light
        S.s('path', { d: ring(0.95, 4), fill: fillG }, sv);
        for (let i = 0; i < 34; i++) {
          const u = R(-0.85, 0.85), v = R(-0.85, 0.85);
          if (u * u + v * v > 0.72) continue;
          const [x, y] = pt(u, v, hgt(u, v));
          S.s('ellipse', { cx: f2(x), cy: f2(y), rx: f2(R(9, 17)), ry: f2(R(3.5, 6.5)), transform: `rotate(${f2(R(-30, 30))} ${f2(x)} ${f2(y)})`, fill: S.rand() < 0.65 ? '#F4C66E' : '#5E2A0A', opacity: f2(R(0.45, 0.85)) }, sv);
        }
        // woven lattice on the dome: every other crossing puts the front-to-back strip on top
        const POS = [-0.54, -0.18, 0.18, 0.54], HW = 0.07;
        const strip = (dir, c, lo, hi, hw) => {
          const edge = (b) => {
            const am = Math.sqrt(Math.max(0, K * K - b * b)), a0 = Math.max(-am, lo), a1 = Math.min(am, hi), out = [];
            for (let k = 0; k <= 20; k++) { const a = a0 + ((a1 - a0) * k) / 20, u = dir === 'u' ? a : b, v = dir === 'u' ? b : a; out.push(pt(u, v, hgt(u, v) + 3)); }
            return out;
          };
          return 'M' + edge(c - hw).concat(edge(c + hw).reverse()).map(P2).join('L') + 'Z';
        };
        const paint = (dir, c, lo = -2, hi = 2) => {
          const pd = strip(dir, c, lo, hi, HW);
          S.s('path', { d: pd, fill: 'rgba(60,24,4,.45)', transform: 'translate(2 5)' }, sv);
          S.s('path', { d: pd, fill: crustG, stroke: '#8E4F1D', 'stroke-width': 1.4, 'stroke-linejoin': 'round' }, sv);
          S.s('path', { d: strip(dir, c - HW * 0.25, lo, hi, HW * 0.3), fill: '#FFE7B0', opacity: 0.32 }, sv);   // rounded, egg-washed top
        };
        POS.forEach((c) => paint('v', c));
        POS.forEach((c) => paint('u', c));
        POS.forEach((cv, i) => POS.forEach((cu, j) => { if ((i + j) % 2 === 0) paint('v', cv, cu - HW - 0.035, cu + HW + 0.035); }));
        // fluted crust rim over the strip ends: a ring, pinched every few degrees, lit from the top left
        S.s('path', { d: ring(1.07, 6) + ring(0.84, 10), 'fill-rule': 'evenodd', fill: crustG, stroke: '#8E4F1D', 'stroke-width': 1.5 }, sv);
        for (let i = 0; i < 40; i++) {
          const a = (i / 40) * 2 * Math.PI, c = Math.cos(a), s = Math.sin(a);
          const [x0, y0] = pt(0.87 * c, 0.87 * s, 10), [x1, y1] = pt(1.05 * c, 1.05 * s, 6);
          S.s('line', { x1: f2(x0), y1: f2(y0), x2: f2(x1), y2: f2(y1), stroke: '#9C5820', 'stroke-width': 3.2, 'stroke-linecap': 'round', opacity: 0.7 }, sv);
          const [x2, y2] = pt(0.9 * Math.cos(a + 0.05), 0.9 * Math.sin(a + 0.05), 10), [x3, y3] = pt(1.02 * Math.cos(a + 0.05), 1.02 * Math.sin(a + 0.05), 6);
          S.s('line', { x1: f2(x2), y1: f2(y2), x2: f2(x3), y2: f2(y3), stroke: '#FCE2A6', 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: 0.55 }, sv);
        }
        // sugar sparkle on the rim
        for (let i = 0; i < 16; i++) {
          const th = R(0, 2 * Math.PI), rr = R(0.88, 1.04), [x, y] = pt(Math.cos(th) * rr, Math.sin(th) * rr, 9);
          S.s('circle', { cx: f2(x), cy: f2(y), r: f2(R(1.2, 2.4)), fill: '#FFFFFF', opacity: f2(R(0.5, 0.9)) }, sv);
        }
        const clip = S.uid('pieclip');
        S.s('path', { d: ring(1.08, 6) }, S.s('clipPath', { id: clip }, d));
        const glint = S.s('rect', { x: -28, y: -124, width: 56, height: 260, fill: glintG, transform: 'skewX(-22)' }, S.s('g', {}, S.s('g', { 'clip-path': `url(#${clip})` }, sv)));
        return { glint, steamDY: 64 };
      },
    };
    const MX = 1545, MY = 852, MSC = 1.06, PAY = DING + 0.36;
    const loaf = svgBox(MX, MY, 600, 460);
    loaf.box.style.filter = `drop-shadow(8px 14px 10px rgba(${SHADOW},.5))`;
    const { glint, steamDY } = (DISHES[P.dish] || DISHES.meatloaf)(loaf.sv, loaf.defs);
    // steam (separate box: no drop shadow), fading as it rises
    const steam = svgBox(MX, MY, 600, 460);
    steam.box.style.transform = `scale(${MSC})`;
    const blurId = S.uid('sblur'), stG = S.uid('stg');
    S.s('feGaussianBlur', { stdDeviation: 5 }, S.s('filter', { id: blurId, x: '-50%', y: '-50%', width: '200%', height: '200%' }, steam.defs));
    grad(steam.defs, 'linearGradient', stG, { gradientUnits: 'userSpaceOnUse', x1: 0, y1: -100, x2: 0, y2: -232 }, [[0, '#FFF8EE', 0.95], [0.65, '#FFF8EE', 0.7], [1, '#FFF8EE', 0]]);
    const steamRoot = steamDY ? S.s('g', { transform: `translate(0 ${steamDY})` }, steam.sv) : steam.sv;
    const CURLS = ['M-84 -104 C-110 -126,-62 -144,-88 -172 C-106 -192,-72 -206,-84 -226', 'M2 -110 C28 -134,-24 -156,2 -184 C22 -204,-10 -218,4 -238', 'M92 -102 C70 -124,112 -140,92 -164 C76 -182,102 -194,94 -214'];
    const curls = CURLS.map((d, i) => {
      const g = S.s('g', {}, steamRoot);
      const glow = S.s('path', { d, fill: 'none', stroke: `url(#${stG})`, 'stroke-width': 20, 'stroke-linecap': 'round', opacity: 0.3, filter: `url(#${blurId})` }, g);
      const line = S.s('path', { d, fill: 'none', stroke: `url(#${stG})`, 'stroke-width': 8, 'stroke-linecap': 'round' }, g);
      const t0 = PAY + 0.14 + i * 0.08;
      [glow, line].forEach((p) => { S.draw(p, t0, 0.5, { ease: 'power1.out' }); tl.to(p, { drawSVG: '30% 100%', duration: 7.45 - (t0 + 0.46), ease: 'sine.inOut' }, t0 + 0.46); });
      return { g, t0, ph: i * 1.9 };
    });
    S.onFrame((t) => {
      for (const c of curls) {
        const u = Math.max(0, t - c.t0);
        c.g.setAttribute('transform', `translate(${f2(3.5 * Math.sin(2.3 * t + c.ph))} ${f2(-10 * u)})`);
      }
    });
    tl.fromTo(loaf.box, { scale: 0.25 * MSC, y: 40 }, { scale: MSC, y: 0, duration: 0.62, ease: 'back.out(1.6)' }, PAY);
    tl.fromTo(loaf.box, { opacity: 0 }, { opacity: 1, duration: 0.1, ease: 'power1.out' }, PAY);
    S.sfx(PAY, 'pop', { gain: 0.45, pitch: 0.72, pan: 0.3 });
    S.sfx(PAY + 0.07, 'thud', { gain: 0.28, pan: 0.3 });
    S.sfx(PAY + 0.14, 'whoosh', { gain: 0.07, dur: 1.0, from: 180, to: 700, pan: 0.3 });
    tl.fromTo(glint, { x: -250 }, { x: 250, duration: 0.55, ease: 'power2.inOut' }, PAY + 0.46);
    S.sfx(PAY + 0.48, 'shimmer', { gain: 0.12, count: 6, pan: 0.3 });

    /* ---------- "from the kitchen of": printed label on the last ruled line, the name signed after the list ---------- */
    if (P.kitchen) {
      const KB = ROW0 + ROWH * 7, KL = String(P.kitchenLabel || '');
      const kl = S.s('text', { x: TX0, y: KB - 4, 'font-family': 'Archivo', 'font-weight': 700, 'font-size': 20, 'letter-spacing': 3, fill: '#C9514A', text: KL }, csv);
      const kx = TX0 + (KL ? kl.getComputedTextLength() + 20 : 0);
      writeOn(String(P.kitchen), kx, KB - 2, 40, listEnd + 0.1, { maxW: CW - kx - 50 });
    }

    /* ---------- bed + notes ---------- */
    S.sfx(0, 'pad', { dur: 7.5, gain: 0.07, notes: P.padNotes, attack: 1.4, release: 1.6 });
    S.beat(0, 'Card slides in tight: prop, era and topic land in the first frame');
    S.beat(0.62, 'Title writes at pen speed so the eye reads along');
    S.beat(beatT(0), `Each ingredient is written, then ticked, on a steady ${+BEAT.toFixed(2)} s beat`);
    S.beat(CAM_OUT, 'Camera pulls out as the list completes, revealing the oven');
    S.beat(KT0, `Dial snaps through detents, one click per ${+SC.step.toFixed(1)} degrees`);
    S.beat(5.58, `${TMIN === 60 ? 'An hour' : `${TMIN} minutes`} sweeps by in half a second; the ding delivers the dish`);

    S.vignette({ strength: 0.42, color: `rgba(${rgb(CL.vignette)},.5)`, inner: 55 });
    S.grain({ opacity: 0.06 });
  },
});
