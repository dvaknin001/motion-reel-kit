/* Tech reviews — Spec Callouts
   A fictional phone built from CSS/SVG and floated in CSS 3D (front + back of the same device).
   Callout dots are projected from each phone's live 3D pose every frame, so the leader lines stay
   locked to the features while the phones drift. Benchmarks race on one scale per section.
   Device name, callouts, benchmark data and colours are params; the takeaway chip and every
   difference on screen are computed from the benchmark numbers. */
Reel.style({
  id: 'tech-spec-callouts', seed: 'tech', order: 9,
  name: 'Spec Callouts',
  transIn: { type: 'swipe', dur: 0.5, color: '#7FE3FF' },   // how a reel cuts INTO this piece (tools/new-reel.mjs); a reel item's trans overrides it
  niches: {
    primary: ['Tech reviews', 'Smartphone launches', 'Spec breakdowns'],
    similar: ['Phone vs phone comparisons', 'Mobile gaming', 'Budget tech', 'Camera phone tests', 'Tech news recaps', 'Consumer tech explainers'],
  },
  niche: 'Tech Reviews', title: 'Spec Callouts', duration: 7.5, poster: 7.0,
  bg: '#070B14', palette: ['#2DE2C9', '#8B7CFF', '#0C1426'],
  techniques: ['CSS 3D product float with light sweeps', 'Leader lines projected from the 3D pose', 'Shared-scale benchmark race'],
  why: 'A new callout every half second walks the eye around the device, then the data panel lands one number, +38%, as the takeaway.',
  facts: 'Fictional device, illustrative figures. +38% = 9,950 / 7,210 = 1.38; battery 26 h vs 21 h = +5 h.',
  defaults: {
    eyebrow: 'FIRST LOOK',
    device: 'NOVA X1',                  // lockup + the "ours" rows
    brand: 'NOVA',                      // wordmark on the back glass
    clock: '10:08',                     // lock-screen clock
    // 1–4 callouts, one per feature, a new one every 0.5 s in list order.
    // feature: "display" (front screen) · "camera" (periscope) · "chip" (x-ray processor) · "battery" (x-ray cell)
    // optional: icon (display | camera | chip | battery | bolt | fan | speaker), xray: false (chip/battery art off)
    callouts: [
      { feature: 'display', label: 'DISPLAY', value: '6.3-inch 120 Hz OLED' },
      { feature: 'camera', label: 'CAMERA', value: '50 MP periscope · 5× optical' },
      { feature: 'chip', label: 'PROCESSOR', value: '3 nm chip' },
      { feature: 'battery', label: 'BATTERY', value: '5,000 mAh' },
    ],
    rival: { name: 'NOVA 9', note: '(last gen)' },   // the note shows on the first section only
    // 1–2 sections. The first is the takeaway (filled badge + ding). delta: "pct" (vs the rival) or "diff" (units).
    // chip: text template for the badge/chip, {delta} is filled in. Differences are computed, never typed.
    benchmarks: [
      { label: 'MULTI-CORE SCORE', ours: 9950, rival: 7210, unit: '', decimals: 0, higherIsBetter: true, delta: 'pct', chip: '{delta}' },
      { label: 'BATTERY · VIDEO PLAYBACK', ours: 26, rival: 21, unit: ' h', decimals: 0, higherIsBetter: true, delta: 'diff', chip: '{delta}' },
    ],
    note: 'Fictional device. Illustrative figures.',
    padNotes: [196, 293.7, 370, 440],
    background: 'radial-gradient(60% 55% at 50% 45%, #0F182C 0%, #080D19 60%, #05080F 100%)',
    colors: {
      accent: '#2DE2C9', ink: '#EAF1FF', faint: '#5E6A86', worse: '#FF7A7A',
      glowA: '#1ED7C8', glowB: '#8062FF', grid: '#A0BEFF', mote: '#AFC8FF',
      bar: ['#1FD1BC', '#5E95FF', '#A07CFF'], barGlow: '#50AAFF', badgeEnd: '#7FE7FF', badgeText: '#04121A',
      back: ['#2E3B56', '#1B243A', '#0F1526'], screen: ['#0C1C50', '#1C1048', '#060A1C'],
      wallpaper: ['#2CECD2', '#8B6EFF', '#FF5CAA'], ribbons: ['#2CECD2', '#9B7BFF', '#FF6FB5'],
    },
  },
  build(S, P) {
    const tl = S.tl, W = 1920, H = 1080, RAD = Math.PI / 180, C = P.colors;
    const TEAL = C.accent, INK = C.ink, FAINT = C.faint;
    const PERSP = 2000, OX = 960, OY = 540, PW = 288, PH = 600;
    const E = (n) => S.ease(n);
    const inv = (ez, y) => { let a = 0, b = 1; for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (ez(m) < y) a = m; else b = m; } return (a + b) / 2; };
    const r4 = (x) => Math.round(x * 1e4) / 1e4;
    const rgb = (h) => { const n = parseInt(String(h).replace('#', ''), 16); return `${n >> 16},${(n >> 8) & 255},${n & 255}`; };
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const fill = (s, vars) => String(s).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
    const fitWidth = (el, maxW) => { const w = el.scrollWidth; if (w > maxW) el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * maxW) / w + 'px'; };
    const textW = (text, css, parent) => { const e = S.el('div', { text, style: `position:absolute;left:0;top:0;white-space:nowrap;visibility:hidden;${css}` }, parent || S.hud); const w = e.offsetWidth; e.remove(); return w; };
    const shrinkTo = (el, text, css, maxW) => { const w = textW(text, css); if (w > maxW) el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * maxW) / w + 'px'; };
    const SCR = C.screen, WP = C.wallpaper, RB = C.ribbons, BK = C.back, BAR = C.bar;

    if (!S.alpha) S.root.style.background = P.bg || '#070B14';
    S.camSet({ x: 960, y: 540, z: 1 });
    S.camTo(0, { z: 1.03, x: 968 }, 7.5, 'sine.inOut');

    /* ================= studio backdrop ================= */
    const bd = [];
    bd.push(S.el('div', { style: `position:absolute;left:-240px;top:-200px;width:2400px;height:1480px;background:${P.background};` }));
    const glowT = S.el('div', { style: `position:absolute;left:0;top:0;width:1200px;height:960px;margin:-480px 0 0 -600px;border-radius:50%;background:radial-gradient(closest-side, rgba(${rgb(C.glowA)},.22), rgba(${rgb(C.glowA)},0));` });
    const glowV = S.el('div', { style: `position:absolute;left:0;top:0;width:1400px;height:1100px;margin:-550px 0 0 -700px;border-radius:50%;background:radial-gradient(closest-side, rgba(${rgb(C.glowB)},.26), rgba(${rgb(C.glowB)},0));` });
    const MASK = 'radial-gradient(58% 60% at 50% 45%, #000 0%, rgba(0,0,0,.4) 62%, rgba(0,0,0,0) 100%)';
    bd.push(glowT, glowV, S.el('div', { style: `position:absolute;left:-100px;top:-100px;width:2120px;height:1280px;background-image:radial-gradient(circle, rgba(${rgb(C.grid)},.15) 1.2px, rgba(0,0,0,0) 1.9px);background-size:34px 34px;-webkit-mask-image:${MASK};mask-image:${MASK};` }));
    bd.push(S.el('div', { style: 'position:absolute;left:-200px;top:880px;width:2320px;height:400px;background:linear-gradient(180deg, rgba(120,150,255,.06), rgba(120,150,255,0) 70%);' }));
    const motes = [];
    for (let i = 0; i < 38; i++) {
      const r = S.rnd(1.4, 4.2);
      const d = S.el('div', { style: `position:absolute;left:0;top:0;width:${(r * 2).toFixed(1)}px;height:${(r * 2).toFixed(1)}px;border-radius:50%;background:${i % 3 ? `rgba(${rgb(C.mote)},.95)` : `rgba(${rgb(TEAL)},.95)`};filter:blur(${(r * 0.4).toFixed(1)}px);opacity:0;` });
      motes.push({ d, x: S.rnd(-40, W + 40), y: S.rnd(0, H), vy: S.rnd(8, 26), vx: S.rnd(-7, 7), a: S.rnd(0.12, 0.42), ph: S.rnd(0, 6.28) });
    }
    if (S.alpha) { bd.forEach((e) => { e.style.display = 'none'; }); motes.forEach((m) => { m.d.style.display = 'none'; }); }   // overlays keep the product and data only

    /* ================= phones ================= */
    const METAL = 'linear-gradient(118deg, #6F7A8E 0%, #E8EDF4 13%, #9CA6B8 25%, #434C5D 43%, #C3CAD6 61%, #5D677A 79%, #DCE2EA 100%)';
    const shadowF = S.el('div', { style: 'position:absolute;left:0;top:0;width:280px;height:54px;margin:-27px 0 0 -140px;border-radius:50%;background:radial-gradient(closest-side, rgba(0,0,0,.75), rgba(0,0,0,0));opacity:0;' });
    const shadowB = S.el('div', { style: 'position:absolute;left:0;top:0;width:260px;height:48px;margin:-24px 0 0 -130px;border-radius:50%;background:radial-gradient(closest-side, rgba(0,0,0,.7), rgba(0,0,0,0));opacity:0;' });
    const stage3d = S.el('div', { style: `position:absolute;left:0;top:0;width:${W}px;height:${H}px;perspective:${PERSP}px;perspective-origin:${OX}px ${OY}px;` });

    const lens = (p, x, y, d) => {
      const o = S.el('div', { style: `position:absolute;left:${x}px;top:${y}px;width:${d}px;height:${d}px;border-radius:50%;background:conic-gradient(from 210deg, #E6EBF2, #6C7588, #F5F8FC, #4E5667, #C9D0DC, #E6EBF2);box-shadow:0 4px 10px rgba(0,0,0,.6);` }, p);
      const g = S.el('div', { style: 'position:absolute;left:4px;top:4px;right:4px;bottom:4px;border-radius:50%;overflow:hidden;background:radial-gradient(circle at 50% 50%, #0B0F1C 0%, #0B0F1C 28%, #1C2548 30%, #070A14 44%, #02030A 72%);box-shadow:inset 0 0 0 3px #080B14, inset 0 0 0 5px rgba(140,160,200,.28);' }, o);
      S.el('div', { style: 'position:absolute;left:0;top:0;width:100%;height:100%;background:radial-gradient(circle at 34% 30%, rgba(165,135,255,.7), rgba(90,60,200,0) 40%), radial-gradient(circle at 70% 72%, rgba(40,230,210,.38), rgba(40,230,210,0) 30%);' }, g);
      S.el('div', { style: `position:absolute;left:${d * 0.25}px;top:${d * 0.21}px;width:${d * 0.13}px;height:${d * 0.13}px;border-radius:50%;background:rgba(255,255,255,.92);filter:blur(.6px);` }, g);
      return o;
    };
    const sweepBand = (p) => {
      const s = S.el('div', { style: 'position:absolute;left:-150%;top:-10%;width:120%;height:120%;background:linear-gradient(105deg, rgba(255,255,255,0) 30%, rgba(255,255,255,.3) 47%, rgba(255,255,255,.08) 53%, rgba(255,255,255,0) 68%);mix-blend-mode:screen;' }, p);
      return s;
    };

    const mkPhone = (kind) => {
      const root = S.el('div', { style: `position:absolute;left:${-PW / 2}px;top:${-PH / 2}px;width:${PW}px;height:${PH}px;opacity:0;` }, stage3d);
      const btn = (side, y, h) => S.el('div', { style: `position:absolute;${side < 0 ? 'left:-4px' : 'right:-4px'};top:${y}px;width:8px;height:${h}px;border-radius:4px;background:linear-gradient(90deg,#59637A,#D2D9E3,#59637A);` }, root);
      if (kind === 'front') { btn(1, 172, 76); btn(-1, 140, 46); btn(-1, 198, 46); } else { btn(-1, 172, 76); btn(1, 140, 46); btn(1, 198, 46); }
      S.el('div', { style: `position:absolute;left:0;top:0;width:100%;height:100%;border-radius:48px;background:${METAL};box-shadow:0 50px 90px rgba(0,0,0,.55),0 12px 26px rgba(0,0,0,.45),inset 0 0 0 1px rgba(255,255,255,.35);` }, root);
      const face = S.el('div', { style: `position:absolute;left:6px;top:6px;width:${PW - 12}px;height:${PH - 12}px;border-radius:42px;overflow:hidden;background:${kind === 'front' ? '#02040A' : `linear-gradient(165deg, ${BK[0]} 0%, ${BK[1]} 42%, ${BK[2]} 100%)`};box-shadow:inset 0 0 0 1px rgba(0,0,0,.6);` }, root);
      const ph = { kind, root, face };
      if (kind === 'front') {
        const SW = PW - 30, SH = PH - 30;
        const scr = S.el('div', { style: `position:absolute;left:9px;top:9px;width:${SW}px;height:${SH}px;border-radius:34px;overflow:hidden;background:linear-gradient(165deg, ${SCR[0]}, ${SCR[1]} 55%, ${SCR[2]});` }, face);
        ph.wp = S.el('div', { style: `position:absolute;left:-40%;top:-25%;width:180%;height:150%;background:radial-gradient(28% 21% at 34% 32%, rgba(${rgb(WP[0])},.95), rgba(${rgb(WP[0])},0) 100%),radial-gradient(33% 25% at 66% 52%, rgba(${rgb(WP[1])},.95), rgba(${rgb(WP[1])},0) 100%),radial-gradient(30% 21% at 40% 76%, rgba(${rgb(WP[2])},.72), rgba(${rgb(WP[2])},0) 100%);` }, scr);
        const rib = S.svg(scr, { width: SW, height: SH, viewBox: `0 0 ${SW} ${SH}` });
        const rd = S.defs(rib), g1 = S.uid('rib1'), g2 = S.uid('rib2'), rb = S.uid('ribblur');
        const lg1 = S.s('linearGradient', { id: g1, x1: 0, y1: 0, x2: 1, y2: 0.3 }, rd);
        S.s('stop', { offset: 0, 'stop-color': RB[0], 'stop-opacity': 0.9 }, lg1); S.s('stop', { offset: 1, 'stop-color': RB[1], 'stop-opacity': 0.9 }, lg1);
        const lg2 = S.s('linearGradient', { id: g2, x1: 0, y1: 0, x2: 1, y2: 0 }, rd);
        S.s('stop', { offset: 0, 'stop-color': '#FFFFFF', 'stop-opacity': 0.55 }, lg2); S.s('stop', { offset: 1, 'stop-color': RB[2], 'stop-opacity': 0.25 }, lg2);
        S.s('feGaussianBlur', { stdDeviation: 2.2 }, S.s('filter', { id: rb, x: '-10%', y: '-30%', width: '120%', height: '160%' }, rd));
        ph.rib1 = S.s('path', { d: `M-30 ${SH * 0.55} C 60 ${SH * 0.42}, 150 ${SH * 0.72}, ${SW + 30} ${SH * 0.5} L ${SW + 30} ${SH * 0.62} C 150 ${SH * 0.84}, 50 ${SH * 0.56}, -30 ${SH * 0.7} Z`, fill: `url(#${g1})`, filter: `url(#${rb})` }, rib);
        ph.rib2 = S.s('path', { d: `M-30 ${SH * 0.36} C 80 ${SH * 0.26}, 170 ${SH * 0.46}, ${SW + 30} ${SH * 0.3} L ${SW + 30} ${SH * 0.35} C 170 ${SH * 0.53}, 70 ${SH * 0.33}, -30 ${SH * 0.43} Z`, fill: `url(#${g2})`, filter: `url(#${rb})` }, rib);
        // lock screen: clock, status icons, home bar, quick buttons, punch-hole camera
        const CLOCK = 'font:600 68px/1 "Inter",sans-serif;letter-spacing:-.03em;';
        const clk = S.el('div', { text: P.clock, style: `position:absolute;left:0;top:74px;width:100%;text-align:center;${CLOCK}color:rgba(255,255,255,.95);text-shadow:0 2px 14px rgba(20,10,60,.35);` }, scr);
        shrinkTo(clk, P.clock, CLOCK, SW - 36);
        const sb = S.el('div', { style: 'position:absolute;right:24px;top:17px;display:flex;align-items:flex-end;gap:3px;' }, scr);
        [5, 7, 9, 11].forEach((h) => S.el('div', { style: `width:3px;height:${h}px;border-radius:1px;background:rgba(255,255,255,.9);` }, sb));
        const bat = S.el('div', { style: 'margin-left:6px;width:21px;height:10px;border-radius:3px;border:1.5px solid rgba(255,255,255,.85);box-sizing:border-box;padding:1.5px;' }, sb);
        S.el('div', { style: 'width:78%;height:100%;border-radius:1px;background:#fff;' }, bat);
        S.el('div', { style: 'position:absolute;left:50%;top:14px;width:14px;height:14px;margin-left:-7px;border-radius:50%;background:#000;box-shadow:0 0 0 1.5px rgba(255,255,255,.12);' }, scr);
        S.el('div', { style: `position:absolute;left:50%;bottom:9px;width:96px;height:4px;margin-left:-48px;border-radius:2px;background:rgba(255,255,255,.8);` }, scr);
        [24, SW - 24 - 40].forEach((x) => S.el('div', { style: `position:absolute;left:${x}px;bottom:30px;width:40px;height:40px;border-radius:50%;background:rgba(10,14,40,.35);box-shadow:inset 0 0 0 1px rgba(255,255,255,.14);` }, scr));
        ph.refl = S.el('div', { style: 'position:absolute;left:-30%;top:0;width:160%;height:100%;background:linear-gradient(115deg, rgba(255,255,255,.16) 0%, rgba(255,255,255,.04) 30%, rgba(255,255,255,0) 42%);' }, scr);
        ph.sw1 = sweepBand(scr); ph.sw2 = sweepBand(scr);
      } else {
        S.el('div', { style: 'position:absolute;left:0;top:0;width:100%;height:100%;background:linear-gradient(100deg, rgba(255,255,255,0) 18%, rgba(255,255,255,.07) 33%, rgba(255,255,255,0) 50%);' }, face);
        const isl = S.el('div', { style: 'position:absolute;left:16px;top:16px;width:150px;height:150px;border-radius:38px;background:linear-gradient(145deg, #36425C, #151C2C 70%);box-shadow:0 8px 18px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.22), inset 0 0 0 1px rgba(255,255,255,.08);' }, face);
        lens(isl, 12, 12, 62); lens(isl, 12, 77, 62);
        const peri = S.el('div', { style: 'position:absolute;left:86px;top:16px;width:50px;height:50px;border-radius:13px;background:linear-gradient(135deg, #E6EBF2, #6C7588 40%, #F5F8FC 60%, #4E5667);box-shadow:0 4px 10px rgba(0,0,0,.6);' }, isl);
        S.el('div', { style: 'position:absolute;left:4px;top:4px;right:4px;bottom:4px;border-radius:9px;background:linear-gradient(135deg, #04060E 0%, #0C1433 40%, #4A36B8 52%, #0C1433 64%, #04060E 100%);box-shadow:inset 0 0 0 2px #080B14;' }, peri);
        S.el('div', { style: 'position:absolute;left:101px;top:92px;width:22px;height:22px;border-radius:50%;background:radial-gradient(circle, #FFF7DD 0%, #E3CF96 50%, #8F7F55 100%);box-shadow:0 0 0 2px #1A2030, 0 0 0 3px rgba(255,255,255,.12);' }, isl);
        S.el('div', { style: 'position:absolute;left:109px;top:128px;width:6px;height:6px;border-radius:50%;background:#05070D;' }, isl);
        const MARK = 'font:700 17px/1 "Inter",sans-serif;letter-spacing:.62em;';
        ph.mark = S.el('div', { text: P.brand, style: `position:absolute;left:0;bottom:30px;width:100%;text-align:center;${MARK}text-indent:.62em;color:rgba(255,255,255,.34);` }, face);
        shrinkTo(ph.mark, P.brand, MARK, PW - 60);
        ph.dark = S.el('div', { style: 'position:absolute;left:0;top:0;width:100%;height:100%;background:rgba(3,6,14,.55);opacity:0;' }, face);
        // x-ray line art (logic board chip + battery), drawn when their callouts fire
        const xr = S.svg(face, { width: PW - 12, height: PH - 12, viewBox: `0 0 ${PW - 12} ${PH - 12}` });
        const xd = S.defs(xr), xg = S.uid('xglow'), xc = S.uid('xclip');
        const xf = S.s('filter', { id: xg, x: '-20%', y: '-20%', width: '140%', height: '140%' }, xd);
        S.s('feGaussianBlur', { stdDeviation: 2.4, result: 'b' }, xf);
        const xm = S.s('feMerge', null, xf); S.s('feMergeNode', { in: 'b' }, xm); S.s('feMergeNode', { in: 'SourceGraphic' }, xm);
        const st = { fill: 'none', stroke: TEAL, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
        ph.chipG = S.s('g', { filter: `url(#${xg})`, opacity: 0.95 }, xr);
        const chipP = [];
        chipP.push(S.s('rect', Object.assign({ x: 110, y: 196, width: 80, height: 80, rx: 9 }, st), ph.chipG));
        chipP.push(S.s('rect', Object.assign({ x: 128, y: 214, width: 44, height: 44, rx: 5 }, st), ph.chipG));
        let pins = '';
        for (let k = 0; k < 6; k++) {
          const q = 119 + k * 12.4, r2 = 205 + k * 12.4;
          pins += `M${q} 196 V187 M${q} 276 V285 M110 ${r2} H101 M190 ${r2} H199 `;
        }
        chipP.push(S.s('path', Object.assign({ d: pins }, st), ph.chipG));
        chipP.push(S.s('path', Object.assign({ d: 'M150 187 V174 H112 V168 M199 236 H236 V300 M101 236 H60 V300 M150 285 V304' }, st, { 'stroke-width': 1.5, opacity: 0.8 }), ph.chipG));
        ph.chipP = chipP;
        ph.batG = S.s('g', { filter: `url(#${xg})` }, xr);
        const batP = [];
        batP.push(S.s('rect', Object.assign({ x: 64, y: 322, width: 148, height: 182, rx: 18 }, st), ph.batG));
        batP.push(S.s('path', Object.assign({ d: 'M120 322 V314 H156 V322' }, st), ph.batG));
        batP.push(S.s('path', Object.assign({ d: 'M74 367 H202 M74 413 H202 M74 459 H202' }, st, { 'stroke-width': 1.4, 'stroke-dasharray': '5 6', opacity: 0.75 }), ph.batG));
        ph.batP = batP;
        ph.batClip = S.s('rect', { x: 64, y: 504, width: 148, height: 0 }, S.s('clipPath', { id: xc }, xd));
        ph.batFill = S.s('rect', { x: 70, y: 328, width: 136, height: 170, rx: 13, fill: TEAL, opacity: 0.26, 'clip-path': `url(#${xc})` }, ph.batG);
        ph.sw1 = sweepBand(face); ph.sw2 = sweepBand(face);
      }
      return ph;
    };
    const B = mkPhone('back'), F = mkPhone('front');     // back phone first = behind
    F.base = { x: 870, y: 580, z: 60, ry: 14, rx: 4, rz: -3, s: 1 };
    B.base = { x: 1114, y: 478, z: -40, ry: -16, rx: 4, rz: 3, s: 1 };
    F.fl = { a: 7, ph: 0 }; B.fl = { a: 8, ph: 2.1 };
    F.st = Object.assign({ o: 0 }, F.base); B.st = Object.assign({ o: 0 }, B.base);

    // rise + 3D settle (0–1.1), light sweep across the glass
    [[F, 0, 400, 40, 28, -12], [B, 0.08, 440, -44, 30, 14]].forEach(([ph, d, dy, ry, rx, rz]) => {
      tl.fromTo(ph.st, { y: ph.base.y + dy }, { y: ph.base.y, duration: 1.1, ease: 'expo.out' }, d);
      tl.fromTo(ph.st, { ry, rx, rz }, { ry: ph.base.ry, rx: ph.base.rx, rz: ph.base.rz, duration: 1.3, ease: 'back.out(1.25)' }, d);
      tl.fromTo(ph.st, { o: 0.45 }, { o: 1, duration: 0.3, ease: 'power1.out' }, d);
      tl.fromTo(ph.sw1, { xPercent: 0 }, { xPercent: 290, duration: 0.85, ease: 'power2.inOut' }, 0.42 + d);
    });
    S.sfx(0, 'whoosh', { dur: 0.45, gain: 0.3, from: 260, to: 2000 });
    S.sfx(0.24, 'whoosh', { dur: 0.75, gain: 0.14, from: 900, to: 300 });
    S.sfx(0.5, 'shimmer', { gain: 0.1, count: 6 });
    S.sfx(0.9, 'thud', { gain: 0.16, pitch: 1.5 });
    S.beat(0, 'Product rises into a 3D settle; a light sweep sells the glass');

    // brand lockup, top right
    const lock = S.el('div', { style: 'position:absolute;right:124px;top:100px;text-align:right;white-space:nowrap;' });
    const LK1 = 'font:700 22px/1 "JetBrains Mono",monospace;letter-spacing:.26em;', LK2 = 'font:800 56px/1.1 "Inter",sans-serif;letter-spacing:-.01em;';
    const lk1 = S.el('div', { text: P.eyebrow, style: `${LK1}margin-right:-.26em;color:${TEAL};` }, lock);
    const lk2 = S.el('div', { text: P.device, style: `margin-top:10px;${LK2}color:#fff;` }, lock);
    shrinkTo(lk1, P.eyebrow, LK1, 640); shrinkTo(lk2, P.device, LK2, 640);   // long names shrink instead of reaching the phones
    if (!P.eyebrow) lk1.style.visibility = 'hidden';
    tl.from(lk1, { x: 30, opacity: 0, duration: 0.6, ease: 'expo.out' }, 0.45);
    tl.from(S.split(lk2, 'chars', { mask: 'chars' }).chars, { yPercent: 110, duration: 0.6, ease: 'expo.out', stagger: 0.03 }, 0.5);
    S.sfx(0.5, 'swoosh', { gain: 0.16, pan: 0.6, pitch: 1.3 });

    /* ================= projection (matches CSS: parent perspective, translate3d·rotY·rotX·rotZ·scale) ================= */
    const project = (st, u, v) => {
      const cz = Math.cos(st.rz * RAD), sz = Math.sin(st.rz * RAD), cx = Math.cos(st.rx * RAD), sx = Math.sin(st.rx * RAD);
      const cy = Math.cos(st.ry * RAD), sy = Math.sin(st.ry * RAD);
      const x0 = u * st.s, y0 = v * st.s;
      const x1 = x0 * cz - y0 * sz, y1 = x0 * sz + y0 * cz;
      const y2 = y1 * cx, z2 = y1 * sx;
      const x3 = x1 * cy + z2 * sy, z3 = -x1 * sy + z2 * cy;
      const X = x3 + st.x, Y = y2 + st.y, Z = z3 + st.z, k = PERSP / (PERSP - Z);
      return [OX + (X - OX) * k, OY + (Y - OY) * k];
    };
    const live = (ph, t) => {
      const s = ph.st, w = 2 * Math.PI;
      return { x: s.x, y: s.y + ph.fl.a * Math.sin((w * t) / 3.4 + ph.fl.ph), z: s.z, ry: s.ry + 1.8 * Math.sin((w * t) / 5.2 + ph.fl.ph * 1.3), rx: s.rx + 1.1 * Math.sin((w * t) / 4.3 + ph.fl.ph * 0.7), rz: s.rz, s: s.s, o: s.o };
    };

    /* ================= callouts ================= */
    const csvg = S.svg();
    const cdefs = S.defs(csvg), cglow = S.uid('cglow');
    const cf = S.s('filter', { id: cglow, x: '-100%', y: '-100%', width: '300%', height: '300%' }, cdefs);
    S.s('feGaussianBlur', { stdDeviation: 3.5, result: 'b' }, cf);
    const cm = S.s('feMerge', null, cf); S.s('feMergeNode', { in: 'b' }, cm); S.s('feMergeNode', { in: 'SourceGraphic' }, cm);
    const ICON = {
      display: '<rect x="7" y="2" width="14" height="24" rx="3"/><path d="M11.5 22.5h5"/>',
      camera: '<rect x="2" y="7" width="24" height="17" rx="4"/><circle cx="14" cy="15.5" r="5"/><path d="M9 7l2-3h6l2 3"/>',
      chip: '<rect x="7" y="7" width="14" height="14" rx="2"/><path d="M11 3v4M17 3v4M11 21v4M17 21v4M3 11h4M3 17h4M21 11h4M21 17h4"/>',
      battery: '<rect x="2" y="8" width="21" height="12" rx="3"/><path d="M26 12.5v3"/><rect x="5" y="11" width="11" height="6" rx="1" fill="currentColor" stroke="none"/>',
      bolt: '<path d="M16 2L6 16h7l-2 10 11-15h-7z"/>',
      fan: '<circle cx="14" cy="14" r="2.5"/><path d="M14 11.5C13 7 14 3 18 3c3 0 3 5-1.5 8.5M16.5 14c4.5-1 8.5 0 8.5 4 0 3-5 3-8.5-1.5M14 16.5c1 4.5 0 8.5-4 8.5-3 0-3-5 1.5-8.5M11.5 14C7 15 3 14 3 10c0-3 5-3 8.5 1.5"/>',
      speaker: '<path d="M4 11h5l7-6v18l-7-6H4z"/><path d="M20 10c1.5 1.2 1.5 6.8 0 8M23 7c3 2.5 3 11.5 0 14"/>',
    };
    // anchors live on the device geometry: phone, point on its face (u, v from centre), side, elbow offset, label column
    const FEAT = {
      display: { ph: F, u: -64, v: -24, side: -1, off: [-62, -62], endX: 684 },
      camera: { ph: B, u: -13, v: -237, side: -1, off: [-78, -96], endX: 684 },
      chip: { ph: B, u: 12, v: -58, side: 1, off: [74, -70], endX: 1316 },
      battery: { ph: B, u: 0, v: 119, side: 1, off: [82, 72], endX: 1316 },
    };
    const seen = new Set();
    const CALLS = (P.callouts || []).filter((c) => c && FEAT[c.feature] && !seen.has(c.feature) && seen.add(c.feature)).slice(0, 4)
      .map((c, i) => Object.assign({}, FEAT[c.feature], { feature: c.feature, t: 1.0 + 0.5 * i, cat: c.label, title: c.value, icon: ICON[c.icon] ? c.icon : c.feature, xray: c.xray !== false }));
    const T_RET = 3.6;
    const CAT = 'font:700 22px/1 "JetBrains Mono",monospace;letter-spacing:.18em;', TTL = 'font:700 36px/1.1 "Inter",sans-serif;letter-spacing:-.012em;';
    CALLS.forEach((c, i) => {
      const d0 = project(c.ph.base, c.u, c.v);
      c.elbow = [d0[0] + c.off[0], d0[1] + c.off[1]];
      c.end = [c.endX, c.elbow[1]];
      c.st = { line: 0, dot: 0 };
      c.path = S.s('path', { fill: 'none', stroke: 'rgba(226,238,255,.9)', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, csvg);
      c.cap = S.s('circle', { cx: c.end[0], cy: c.end[1], r: 4, fill: TEAL, opacity: 0 }, csvg);
      c.dg = S.s('g', {}, csvg);
      c.pulse = S.s('circle', { r: 9, fill: 'none', stroke: TEAL, 'stroke-width': 2 }, c.dg);
      S.s('circle', { r: 13, fill: TEAL, opacity: 0.25 }, c.dg);
      S.s('circle', { r: 6.5, fill: '#fff', filter: `url(#${cglow})` }, c.dg);
      const card = S.el('div', { style: `position:absolute;top:${c.end[1]}px;${c.side < 0 ? `right:${W - c.end[0] + 14}px;` : `left:${c.end[0] + 14}px;`}padding:15px 26px 18px 22px;border-radius:18px;background:linear-gradient(160deg, rgba(255,255,255,.11), rgba(255,255,255,.035));border:1px solid rgba(255,255,255,.17);backdrop-filter:blur(18px) saturate(150%);-webkit-backdrop-filter:blur(18px) saturate(150%);box-shadow:0 24px 60px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.14);white-space:nowrap;` });
      gsap.set(card, { yPercent: -50 });
      const row = S.el('div', { style: `display:flex;align-items:center;gap:10px;color:${TEAL};` }, card);
      const ic = S.s('svg', { width: 26, height: 26, viewBox: '0 0 28 28', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      ic.innerHTML = ICON[c.icon]; row.appendChild(ic);
      const catEl = S.el('div', { text: c.cat, style: `${CAT}color:${TEAL};` }, row);
      const ttl = S.el('div', { text: c.title, style: `margin-top:10px;${TTL}color:${INK};` }, card);
      // the card must stay inside the title-safe area: a long value shrinks a little, then wraps to two
      // balanced lines (shrinking again only if two lines are not enough)
      const maxW = (c.side < 0 ? c.end[0] - 14 - 96 : W - 96 - c.end[0] - 14) - 48, tw = textW(c.title, TTL);
      if (tw > maxW && tw * 0.8 <= maxW) shrinkTo(ttl, c.title, TTL, maxW);
      else if (tw > maxW) {
        const k = Math.min(1, (1.8 * maxW) / tw);
        Object.assign(ttl.style, { whiteSpace: 'normal', textWrap: 'balance', width: `${Math.min(maxW, Math.ceil(((tw * k) / 2) * 1.15))}px`, fontSize: `${36 * k}px` });
      }
      shrinkTo(catEl, c.cat, CAT, maxW - 36);
      const top = c.end[1] - card.offsetHeight / 2;
      if (top < 84) card.style.top = `${c.end[1] + 84 - top}px`;   // keep tall cards below the top safe line
      c.card = card;
      // choreography
      tl.fromTo(c.st, { dot: 0 }, { dot: 1, duration: 0.42, ease: 'back.out(3)' }, c.t);
      tl.to(c.st, { line: 1, duration: 0.4, ease: 'power2.inOut' }, c.t + 0.08);
      tl.fromTo(card, { x: -c.side * 38, opacity: 0 }, { x: 0, opacity: 1, duration: 0.55, ease: 'expo.out' }, c.t + 0.36);
      // titles always wipe in reading order so a number is never shown with its first digit cut off
      tl.fromTo(ttl, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'power3.out' }, c.t + 0.4);
      S.sfx(c.t, 'blip', { gain: 0.28, pitch: 1 + i * 0.12, pan: c.side * 0.35 });
      S.sfx(c.t + 0.38, 'click', { gain: 0.22, pan: c.side * 0.5, pitch: 1.1 + i * 0.05 });
      // retract: label folds back into the line, line rewinds into the dot, dot closes
      tl.to(card, { x: -c.side * 30, opacity: 0, duration: 0.24, ease: 'power2.in' }, T_RET + i * 0.03);
      tl.to(c.st, { line: 0, duration: 0.24, ease: 'power2.in' }, T_RET + 0.04 + i * 0.03);
      tl.to(c.st, { dot: 0, duration: 0.18, ease: 'back.in(2)' }, T_RET + 0.14 + i * 0.03);
    });
    if (CALLS.length) S.beat(CALLS[0].t, CALLS.length > 1 ? 'One callout every half second walks the eye around the device' : 'A single callout pins the headline spec to the device');
    // x-ray: the chip draws with its callout, the battery draws and fills with its own
    const XCHIP = CALLS.find((c) => c.feature === 'chip' && c.xray), XBAT = CALLS.find((c) => c.feature === 'battery' && c.xray);
    const XFIRST = [XCHIP, XBAT].filter(Boolean).sort((a, b) => a.t - b.t)[0];
    if (!XCHIP) B.chipG.style.display = 'none';
    if (!XBAT) B.batG.style.display = 'none';
    if (XFIRST) tl.fromTo(B.dark, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' }, r4(XFIRST.t - 0.05));
    if (XCHIP) B.chipP.forEach((p, k) => S.draw(p, XCHIP.t + k * 0.06, 0.55, { ease: 'power2.inOut' }));
    if (XBAT) {
      B.batP.forEach((p, k) => S.draw(p, XBAT.t + k * 0.06, 0.5, { ease: 'power2.inOut' }));
      tl.to(B.batClip, { attr: { y: 322, height: 182 }, duration: 0.85, ease: 'power2.inOut' }, r4(XBAT.t + 0.2));
      tl.to(B.mark, { opacity: 0.12, duration: 0.3 }, r4(XBAT.t - 0.05));
    }
    if (XCHIP) S.sfx(r4(XCHIP.t + 0.02), 'ping', { gain: 0.08, freq: 1568 });
    if (XBAT) S.sfx(r4(XBAT.t + 0.2), 'riser', { dur: 0.8, gain: 0.07 });
    if (XFIRST) S.beat(XFIRST.t, 'X-ray line art shows what the spec means, not just the number');
    if (XFIRST) {
      tl.to([B.chipG, B.batG], { opacity: 0, duration: 0.3, ease: 'power2.in' }, T_RET + 0.04);
      tl.to(B.dark, { opacity: 0, duration: 0.4, ease: 'power2.inOut' }, T_RET + 0.1);
    }
    if (XBAT) tl.to(B.mark, { opacity: 1, duration: 0.4 }, T_RET + 0.15);
    S.sfx(T_RET, 'whoosh', { dur: 0.35, gain: 0.16, from: 3200, to: 600 });
    S.beat(T_RET, 'Callouts clear before the data arrives: one idea at a time');

    // phones slide left and turn toward the panel
    const T_SLIDE = 3.7;
    tl.to(F.st, { x: 470, y: 596, ry: 24, rz: -4, s: 0.9, duration: 0.62, ease: 'power3.inOut' }, T_SLIDE);
    tl.to(B.st, { x: 690, y: 486, ry: 20, rz: 2, s: 0.9, duration: 0.62, ease: 'power3.inOut' }, T_SLIDE + 0.03);
    S.sfx(T_SLIDE, 'whoosh', { dur: 0.7, gain: 0.26, from: 300, to: 2200, dir: -1 });

    /* ================= benchmark panel ================= */
    // 1–2 sections; with one, the panel shrinks around it and stays centred
    const BM = (P.benchmarks || []).filter((b) => b && +b.ours > 0 && +b.rival > 0).slice(0, 2);
    const NB = BM.length;
    const SEC = [
      { top: 42, hdrT: 4.4, lblT: 4.44, raceT: 4.56, dur: 0.85, div: 10, g0: 0.08, p0: 0.9, click: { gain: 0.24, pitch: 0.8 } },
      { top: 340, hdrT: 5.46, lblT: 5.54, raceT: 5.66, dur: 0.58, div: 6, g0: 0.09, p0: 1.1, click: { gain: 0.22, pitch: 0.85 } },
    ];
    const PX0 = 846, PWD = 944, PHT = NB > 1 ? 610 : 312, PY0 = 541 - PHT / 2, BX = 46, LMAX = 560;
    const panel = S.el('div', { style: `position:absolute;left:${PX0}px;top:${PY0}px;width:${PWD}px;height:${PHT}px;border-radius:28px;background:linear-gradient(160deg, rgba(255,255,255,.10), rgba(255,255,255,.035) 60%, rgba(255,255,255,.05));border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(24px) saturate(150%);-webkit-backdrop-filter:blur(24px) saturate(150%);box-shadow:0 40px 100px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.16);` });
    if (!NB) panel.style.display = 'none';
    tl.fromTo(panel, { x: 120, opacity: 0 }, { x: 0, opacity: 1, duration: 0.65, ease: 'expo.out' }, 4.26);
    const sheenBox = S.el('div', { style: 'position:absolute;left:0;top:0;width:100%;height:100%;border-radius:28px;overflow:hidden;pointer-events:none;' }, panel);
    const sheen = S.el('div', { style: 'position:absolute;left:-60%;top:-20%;width:45%;height:140%;background:linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,.09) 45%, rgba(255,255,255,.02) 60%, rgba(255,255,255,0));' }, sheenBox);
    gsap.set(sheen, { skewX: -14 });
    tl.fromTo(sheen, { xPercent: 0 }, { xPercent: 420, duration: 1.1, ease: 'power2.inOut' }, 4.3);
    if (NB) S.sfx(4.26, 'swoosh', { gain: 0.3, dir: -1 });
    const HDR = 'font:700 24px/1 "JetBrains Mono",monospace;letter-spacing:.2em;';
    const hdr = (top, text, t) => {
      const e = S.el('div', { style: `position:absolute;left:${BX}px;top:${top}px;${HDR}color:${TEAL};white-space:pre;` }, panel);
      shrinkTo(e, text, HDR, PWD - 2 * BX);
      S.type(e, text, { t, cps: 42, sfx: 'tick', gain: 0.05 });
      return e;
    };
    const VAL = 'font:800 44px/50px "Inter",sans-serif;font-variant-numeric:tabular-nums;letter-spacing:-.01em;';
    const mkBar = (top, name, sub, x1, max, target) => {
      const labHtml = (k) => `<span style="font:${x1 ? 800 : 700} ${28 * k}px/1 Inter,sans-serif;color:${x1 ? '#fff' : '#C3CCDD'}">${esc(name)}</span>${sub ? `<span style="margin-left:${12 * k}px;font:500 ${24 * k}px/1 Inter,sans-serif;color:#7F8BA5">${esc(sub)}</span>` : ''}`;
      const lab = S.el('div', { html: labHtml(1), style: `position:absolute;left:${BX}px;top:${top - 42}px;white-space:nowrap;` }, panel);
      if (lab.scrollWidth > PWD - 2 * BX) lab.innerHTML = labHtml((PWD - 2 * BX) / lab.scrollWidth);
      const bar = S.el('div', { style: `position:absolute;left:${BX}px;top:${top}px;width:0px;height:38px;border-radius:0 10px 10px 0;background:${x1 ? `linear-gradient(90deg, ${BAR[0]}, ${BAR[1]} 62%, ${BAR[2]})` : 'linear-gradient(90deg, #394560, #56637F)'};${x1 ? `box-shadow:0 0 26px rgba(${rgb(C.barGlow)},.42);` : ''}` }, panel);
      const val = S.el('div', { text: '0', style: `position:absolute;left:0;top:${top - 6}px;${VAL}color:${x1 ? '#fff' : '#AEB8CC'};white-space:nowrap;` }, panel);
      return { lab, bar, val, max, target, top, x1 };
    };
    const axis = (p, q, t) => {    // zero ticks: both bars in a section start from the same x, on one scale
      [p, q].forEach((b, k) => {
        const a = S.el('div', { style: `position:absolute;left:${BX - 3}px;top:${b.top - 6}px;width:3px;height:50px;border-radius:2px;background:rgba(255,255,255,.4);transform-origin:50% 50%;` }, panel);
        tl.from(a, { scaleY: 0, duration: 0.45, ease: 'expo.out' }, t + k * 0.08);
      });
    };
    // the data: every difference and the takeaway are computed here
    const RIV = P.rival || {};
    const SECS = BM.map((bm, i) => {
      const ours = +bm.ours, rival = +bm.rival, max = Math.max(ours, rival);
      const dec = bm.decimals || 0, unit = bm.unit || '', pre = bm.prefix || '';
      const num = (v) => (dec ? S.fmt(v, dec) : S.fmt(Math.round(v)));
      const fmt = (v) => pre + num(v) + unit;
      const better = bm.higherIsBetter === false ? ours <= rival : ours >= rival;
      const d = ours - rival, sgn = (x) => (x > 0 ? '+' : x < 0 ? '−' : '');
      const pct = Math.round((d / rival) * 100), isPct = (bm.delta || 'pct') === 'pct';
      const abs = isPct ? `${Math.abs(pct)}%` : `${pre}${num(Math.abs(d))}${unit}`, delta = `${sgn(isPct ? pct : d)}${abs}`;
      return { bm, i, sc: SEC[i], ours, rival, max, fmt, better, delta, text: fill(bm.chip || '{delta}', { delta, abs: abs.trim() }), race: { v: 0 } };
    });
    if (NB) SECS[0].hdr = hdr(SEC[0].top, BM[0].label, SEC[0].hdrT);
    SECS.forEach((s, i) => {
      s.r1 = mkBar(s.sc.top + 94, RIV.name, i === 0 ? RIV.note : '', false, s.max, s.rival);
      s.r2 = mkBar(s.sc.top + 194, P.device, '', true, s.max, s.ours);
      if (i < NB - 1) S.el('div', { style: `position:absolute;left:${BX}px;top:${s.sc.top + 270}px;width:${PWD - 2 * BX}px;height:1px;background:rgba(255,255,255,.1);` }, panel);
    });
    SECS.forEach((s) => {
      tl.from([s.r1.lab, s.r2.lab], { x: -18, opacity: 0, duration: 0.45, ease: 'expo.out', stagger: 0.08 }, s.sc.lblT);
      axis(s.r1, s.r2, s.sc.lblT);
    });
    SECS.forEach((s) => [s.r1, s.r2].forEach((b) => tl.fromTo(b.val, { opacity: 0 }, { opacity: 1, duration: 0.15 }, s.sc.raceT)));
    SECS.forEach((s, i) => { if (i > 0) s.hdr = hdr(s.sc.top, s.bm.label, s.sc.hdrT); });
    // bar scale per section: the longest bar is LMAX unless the value text and chip need the room
    const BADGE = 'padding:6px 16px 7px;border-radius:999px;font:800 32px/1.1 "Inter",sans-serif;', CHIP = 'padding:5px 14px 6px;border-radius:999px;border:2px solid;font:800 26px/1.1 "Inter",sans-serif;';
    SECS.forEach((s, i) => {
      const valW = (b, v) => { b.val.textContent = s.fmt(v); const w = b.val.offsetWidth; b.val.textContent = '0'; return w; };
      s.vwO = valW(s.r2, s.ours); s.vwR = valW(s.r1, s.rival);
      s.gap = i === 0 ? 15 : 9; s.cw = textW(s.text, i === 0 ? BADGE : CHIP, panel);
      const avail = PWD - BX - 24 - 18;
      const L = Math.min(LMAX, (avail - s.vwO - s.gap - s.cw) / (s.ours / s.max), (avail - s.vwR) / (s.rival / s.max));
      s.L = Math.max(240, L);
      if (L < 240) {   // extreme values: shrink the numbers rather than run out of the panel
        const k = Math.max(0.5, Math.min((avail - s.gap - s.cw - 240 * (s.ours / s.max)) / s.vwO, (avail - 240 * (s.rival / s.max)) / s.vwR));
        [s.r1, s.r2].forEach((b) => { b.val.style.fontSize = 44 * k + 'px'; b.val.style.lineHeight = 50 * k + 'px'; b.val.style.top = b.top - 6 + 25 * (1 - k) + 'px'; });
        s.vwO *= k; s.vwR *= k;
      }
    });
    const ezR = E('power2.inOut');
    SECS.forEach((s) => tl.to(s.race, { v: s.max, duration: s.sc.dur, ease: 'power2.inOut' }, s.sc.raceT));
    SECS.forEach((s) => { s.stop = s.sc.raceT + s.sc.dur * inv(ezR, Math.min(s.ours, s.rival) / s.max); s.end = s.sc.raceT + s.sc.dur; });
    SECS.forEach((s) => { for (let k = 1; k < s.sc.div; k++) S.sfx(s.sc.raceT + s.sc.dur * inv(ezR, k / s.sc.div), 'tick', { gain: s.sc.g0 + 0.012 * k, pitch: s.sc.p0 + 0.07 * k }); });
    SECS.forEach((s) => S.sfx(s.stop, 'click', s.sc.click));
    if (NB) {
      const s0 = SECS[0], who = s0.rival <= s0.ours ? (/last|old|prev/i.test(RIV.note || '') ? 'the old model' : 'the rival') : `the ${P.device}`;
      S.beat(s0.sc.raceT, `Bars race on one shared scale; ${who} stops first`);
    }
    // the gap, made visible: dashed guide at the shorter bar's finish + hatched surplus on the longer bar
    const guide = (p, q, frac, t, L, onRival) => {
      const g = S.el('div', { style: `position:absolute;left:${BX + L * frac - 1}px;top:${p.top - 8}px;width:0;height:${q.top - p.top + 54}px;border-left:2px dashed rgba(255,255,255,.4);transform-origin:50% 0;` }, panel);
      tl.fromTo(g, { scaleY: 0, opacity: 0 }, { scaleY: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }, t);
      const h = S.el('div', { style: `position:absolute;left:${BX + L * frac}px;top:${(onRival ? p : q).top}px;width:${L * (1 - frac)}px;height:38px;border-radius:0 10px 10px 0;background:repeating-linear-gradient(135deg, rgba(255,255,255,.34) 0 5px, rgba(255,255,255,0) 5px 11px);` }, panel);
      return h;
    };
    SECS.forEach((s) => { s.hatch = guide(s.r1, s.r2, Math.min(s.ours, s.rival) / s.max, s.stop, s.L, s.rival > s.ours); });
    SECS.forEach((s) => tl.fromTo(s.hatch, { opacity: 0 }, { opacity: 1, duration: 0.3 }, s.end));
    SECS.forEach((s, i) => {
      const left = BX + (s.L * s.ours) / s.max + 18 + s.vwO + s.gap, col = s.better ? TEAL : C.worse;
      if (i === 0) {   // the takeaway: filled badge on the ding
        const badge = S.el('div', { text: s.text, style: `position:absolute;left:${left}px;top:${s.r2.top - 5}px;${BADGE}background:linear-gradient(90deg, ${s.better ? TEAL : C.worse}, ${s.better ? C.badgeEnd : C.worse});color:${C.badgeText};box-shadow:0 0 30px rgba(${rgb(col)},.55);white-space:nowrap;transform-origin:0% 50%;` }, panel);
        S.pop(badge, s.end, { sfx: false, from: 0.3, dur: 0.6, ease: 'back.out(3)' });
        S.sfx(s.end, 'ding', { gain: 0.3, freq: 1760 });
        S.beat(s.end, `${s.text} lands on the ding: the one number to remember`);
      } else {
        const chip = S.el('div', { text: s.text, style: `position:absolute;left:${left}px;top:${s.r2.top - 1}px;${CHIP.replace('border:2px solid;', `border:2px solid ${col};`)}color:${col};white-space:nowrap;transform-origin:0% 50%;` }, panel);
        S.pop(chip, s.end, { sfx: 'blip', pitch: 1.4, gain: 0.26, from: 0.3, dur: 0.5, ease: 'back.out(3)' });
      }
    });
    const foot = S.el('div', { text: P.note, style: `position:absolute;left:${PX0 + BX}px;top:${PY0 + PHT + 26}px;font:500 22px/1 "JetBrains Mono",monospace;color:${FAINT};white-space:nowrap;` });
    fitWidth(foot, W - 96 - PX0 - BX);
    tl.from(foot, { opacity: 0, y: 8, duration: 0.6, ease: 'power2.out' }, 5.95);

    // final glint on the glass during the hold
    [F, B].forEach((ph, k) => tl.fromTo(ph.sw2, { xPercent: 0 }, { xPercent: 290, duration: 0.9, ease: 'power2.inOut' }, 6.45 + k * 0.1));
    S.sfx(6.5, 'shimmer', { gain: 0.08, count: 5 });

    /* ================= per-frame ================= */
    S.onFrame((t) => {
      // backdrop drift
      glowT.style.transform = `translate(${(660 + 60 * Math.sin(t * 0.5)).toFixed(1)}px,${(380 + 40 * Math.cos(t * 0.43)).toFixed(1)}px)`;
      glowV.style.transform = `translate(${(1290 - 70 * Math.sin(t * 0.37 + 1)).toFixed(1)}px,${(690 + 50 * Math.sin(t * 0.41)).toFixed(1)}px)`;
      for (const m of motes) {
        const y = ((m.y - m.vy * t) % (H + 40) + H + 40) % (H + 40) - 20, x = m.x + m.vx * t + 10 * Math.sin(t * 0.7 + m.ph);
        m.d.style.opacity = (m.a * (0.6 + 0.4 * Math.sin(t * 1.3 + m.ph)) * S.clamp(t / 0.6)).toFixed(3);
        m.d.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
      }
      // phones
      const lv = new Map();
      for (const ph of [F, B]) {
        const L = live(ph, t); lv.set(ph, L);
        ph.root.style.opacity = L.o.toFixed(3);
        ph.root.style.transform = `translate3d(${L.x.toFixed(2)}px,${L.y.toFixed(2)}px,${L.z.toFixed(2)}px) rotateY(${L.ry.toFixed(3)}deg) rotateX(${L.rx.toFixed(3)}deg) rotateZ(${L.rz.toFixed(3)}deg) scale(${L.s.toFixed(4)})`;
        const base = project(L, 0, PH / 2);
        const sh = ph === F ? shadowF : shadowB, lift = (L.y - ph.st.y) / ph.fl.a;
        sh.style.opacity = (L.o * (0.62 - 0.12 * lift)).toFixed(3);
        sh.style.transform = `translate(${base[0].toFixed(1)}px,${(base[1] + (ph === F ? 44 : 38)).toFixed(1)}px) scale(${(L.s * (1 - 0.05 * lift)).toFixed(3)})`;
      }
      const LF = lv.get(F);
      F.refl.style.transform = `translateX(${((LF.ry - 14) * 5).toFixed(1)}px)`;
      F.wp.style.transform = `translate(${(8 * Math.sin(t * 0.6)).toFixed(1)}px,${(6 * Math.cos(t * 0.5)).toFixed(1)}px)`;
      F.rib1.setAttribute('transform', `translate(0 ${(6 * Math.sin(t * 0.9)).toFixed(2)})`);
      F.rib2.setAttribute('transform', `translate(0 ${(5 * Math.sin(t * 0.8 + 1.5)).toFixed(2)})`);
      // callouts: dot follows the projected feature; elbow + label stay put
      for (const c of CALLS) {
        const [dx, dy] = project(lv.get(c.ph), c.u, c.v);
        const ds = c.st.dot;
        c.dg.setAttribute('transform', `translate(${dx.toFixed(1)} ${dy.toFixed(1)}) scale(${Math.max(0, ds).toFixed(3)})`);
        const age = t - c.t, fr = age < 0 ? 0 : (age % 1.3) / 1.3;
        c.pulse.setAttribute('r', (9 + 16 * fr).toFixed(2));
        c.pulse.setAttribute('opacity', (ds > 0.01 ? 0.7 * (1 - fr) : 0).toFixed(3));
        const l1 = Math.hypot(c.elbow[0] - dx, c.elbow[1] - dy), l2 = Math.abs(c.end[0] - c.elbow[0]), tot = l1 + l2;
        c.path.setAttribute('d', `M${dx.toFixed(1)} ${dy.toFixed(1)} L${c.elbow[0].toFixed(1)} ${c.elbow[1].toFixed(1)} L${c.end[0]} ${c.end[1].toFixed(1)}`);
        const drawn = tot * c.st.line;
        c.path.setAttribute('stroke-dasharray', `${drawn.toFixed(1)} ${(tot + 10).toFixed(1)}`);
        c.path.setAttribute('opacity', drawn > 0.5 ? 1 : 0);
        c.cap.setAttribute('opacity', c.st.line > 0.985 ? 1 : 0);
      }
      // benchmark race: bar length, riding value and counter share one value
      for (const s of SECS) {
        for (const b of [s.r1, s.r2]) {
          const v = Math.min(b.target, s.race.v), w = (s.L * v) / b.max;
          b.bar.style.width = `${w.toFixed(2)}px`;
          b.val.style.transform = `translateX(${(BX + w + 18).toFixed(1)}px)`;
          const str = s.fmt(v);
          if (str !== b._s) { b.val.textContent = str; b._s = str; }
        }
      }
    });

    S.sfx(0, 'pad', { dur: 7.5, gain: 0.055, notes: P.padNotes, attack: 0.45, release: 1.6 });
    S.vignette({ strength: 0.5, inner: 52 });
    S.grain({ opacity: 0.045 });
  },
});
