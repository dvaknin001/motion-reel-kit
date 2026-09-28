/* Finance — Growth Curve
   A savings/investment curve draws in real time with a value tag riding its head, milestones pop on a
   rising pitch ladder, the gap between deposits and value fills gold, and the total slams in.
   Every number is computed from the params (future value of periodic deposits + optional lump sum). */
Reel.style({
  id: 'finance-growth-curve', seed: 'finance', order: 2,
  name: 'Growth Curve',
  transIn: { type: 'whip', dur: 0.45, dir: 1 },   // how a reel cuts INTO this piece (tools/new-reel.mjs); a reel item's trans overrides it
  niches: {
    primary: ['Personal finance', 'Investing', 'Retirement planning'],
    similar: ['Crypto (DCA)', 'Real estate', 'Business revenue growth', 'Creator income', 'Savings challenges', 'Any "this compounds over time" story'],
  },
  niche: 'Personal Finance', title: 'The Compound Curve', duration: 8, poster: 7.6,
  bg: '#050E09', palette: ['#3DF28B', '#FFC94A', '#0B2016'],
  techniques: ['Data-driven line reveal', 'Counter that rides the curve', 'Colour-linked payoff'],
  why: 'The eye tracks one moving dot while the number under it climbs, and the payoff lands twice: once on the chart and once as a slammed total.',
  facts: 'Future value of $500 deposited monthly at a 10% annual return, compounded monthly, 360 deposits.',
  defaults: {
    eyebrow: 'COMPOUND INTEREST',
    headline: '$500 a month. 30 years.',
    chip: 'AT 10% A YEAR',
    currency: '$',
    initial: 0,               // lump sum at the start
    monthly: 500,             // deposit per period (per compounding period)
    rate: 0.10,               // annual return
    years: 30,
    periodsPerYear: 12,       // compounding and deposit frequency
    axisMax: 1200000,         // y-axis top; null = automatic
    axisStep: 300000,         // y gridline step; null = automatic
    xStep: 5,                 // x tick every n years
    milestones: [100000, 250000, 500000, 1000000],   // values above the final total are skipped
    depositsLabel: 'YOU DEPOSITED',
    growthLabel: 'COMPOUND GROWTH',
    totalLabel: 'AFTER {years} YEARS',
    reframe: '{pct} of it you never deposited.',
    note: 'Illustrative: 10% average annual return, compounded monthly. Not financial advice.',
    padNotes: [220, 277.2, 329.6, 415.3],
    background: 'radial-gradient(110% 90% at 18% 8%, #10301F 0%, #081A11 48%, #040B07 100%)',
    colors: {
      accent: '#3DF28B', gold: '#FFC94A', ink: '#EAF7EF', muted: '#86A895', deposits: '#A9C2B4', note: '#4F7362',
      grid: '#16362A', gridBase: '#2F6146', gridV: '#112B1F', ringFill: '#07170F', tagBg: 'rgba(5,16,10,.88)', dot: '#E9FFF2',
    },
  },
  build(S, P) {
    const tl = S.tl, C = P.colors;
    const MINT = C.accent, GOLD = C.gold, INK = C.ink, MUTED = C.muted, SAGE = C.deposits;
    const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return `${n >> 16},${(n >> 8) & 255},${n & 255}`; };
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const fill = (s, vars) => String(s).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
    const fitWidth = (el, maxW) => { const w = el.scrollWidth; if (w > maxW) el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * maxW) / w + 'px'; };

    /* ---------- the maths ---------- */
    const YEARS = P.years, PPY = P.periodsPerYear, N = Math.round(YEARS * PPY);
    const r = P.rate / PPY, PMT = P.monthly, INIT = P.initial || 0, CUR = P.currency;
    const V = (m) => (r === 0 ? INIT + PMT * m : INIT * Math.pow(1 + r, m) + (PMT * (Math.pow(1 + r, m) - 1)) / r);
    const DEP = (m) => INIT + PMT * m;
    const FINAL = V(N), DEPOSITS = DEP(N), GROWTH = FINAL - DEPOSITS;
    const periodsTo = (val) => {                       // first period count where V reaches val
      if (INIT === 0 && r > 0) return Math.log(1 + (val * r) / PMT) / Math.log(1 + r);
      let a = 0, b = N; for (let i = 0; i < 60; i++) { const m = (a + b) / 2; if (V(m) < val) a = m; else b = m; } return (a + b) / 2;
    };
    const niceStep = (x) => { const e = Math.pow(10, Math.floor(Math.log10(x))), f = x / e; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * e; };
    const STEP = P.axisStep || niceStep((FINAL * 1.06) / 4);
    const VMAX = P.axisMax || Math.ceil((FINAL * 1.06) / STEP) * STEP;
    const abbr = (v) => { const t = (x) => String(+x.toFixed(2)); return v >= 1e6 ? `${CUR}${t(v / 1e6)}M` : v >= 1e3 ? `${CUR}${t(v / 1e3)}K` : `${CUR}${S.fmt(v)}`; };
    const vars = { years: YEARS, pct: Math.round((GROWTH / FINAL) * 100) + '%' };

    const X0 = 190, X1 = 1130, Y0 = 900, Y1 = 330;
    const px = (yr) => X0 + (yr / YEARS) * (X1 - X0);
    const py = (v) => Y0 - (v / VMAX) * (Y0 - Y1);

    S.root.style.background = P.background;
    S.camSet({ x: 960, y: 540, z: 1 });
    S.camTo(0, { x: 1000, y: 552, z: 1.045 }, 8, 'sine.inOut');

    /* ---------- header ---------- */
    const head = S.el('div', { style: 'position:absolute;left:120px;top:84px;' });
    const eyebrow = S.el('div', { text: P.eyebrow, style: `font:700 26px "JetBrains Mono",monospace;letter-spacing:.24em;color:${MINT};white-space:nowrap;display:inline-block;` }, head);
    const h1 = S.el('div', { text: P.headline, style: `margin-top:14px;font:800 96px/1 "Archivo",sans-serif;font-stretch:112%;color:${INK};letter-spacing:-.01em;white-space:nowrap;width:max-content;` }, head);
    fitWidth(h1, 1340);
    const chip = S.el('div', { text: P.chip, style: `position:absolute;left:${Math.max(410, eyebrow.offsetWidth + 30)}px;top:-9px;padding:9px 18px;border:2px solid ${GOLD};border-radius:999px;font:700 24px "JetBrains Mono",monospace;letter-spacing:.14em;color:${GOLD};white-space:nowrap;transform-origin:0 50%;` }, head);
    if (!P.chip) chip.style.display = 'none';
    tl.from(eyebrow, { x: -40, opacity: 0, duration: 0.6, ease: 'expo.out' }, 0.12);
    S.sfx(0.12, 'tick', { gain: 0.25 });
    const hs = S.split(h1, 'words', { mask: 'words' });
    tl.from(hs.words, { yPercent: 110, duration: 0.7, ease: 'expo.out', stagger: 0.07 }, 0.3);
    S.sfx(0.28, 'whoosh', { dur: 0.45, gain: 0.3, from: 600, to: 4000 });
    if (P.chip) S.pop(chip, 0.78, { pitch: 1.2, from: 0.4 });
    S.beat(0.3, 'Hook states the promise in five words');

    /* ---------- chart ---------- */
    const sv = S.svg();
    const defs = S.defs(sv);
    const grad = (id, stops, x2 = 0, y2 = 1) => { const g = S.s('linearGradient', { id, x1: 0, y1: 0, x2, y2 }, defs); stops.forEach(([o, c, a]) => S.s('stop', { offset: o, 'stop-color': c, 'stop-opacity': a }, g)); return `url(#${id})`; };
    const fillMint = grad(S.uid('gm'), [[0, MINT, 0.26], [1, MINT, 0]]);
    const fillGold = grad(S.uid('gg'), [[0, GOLD, 0.42], [1, GOLD, 0.06]]);
    const clipId = S.uid('clip'), clipGapId = S.uid('clipgap'), glowId = S.uid('glow');
    const clipRect = S.s('rect', { x: X0 - 12, y: 0, width: 0, height: 1080 }, S.s('clipPath', { id: clipId }, defs));
    const gapRect = S.s('rect', { x: 0, y: Y0, width: 1920, height: 0 }, S.s('clipPath', { id: clipGapId }, defs));
    const f = S.s('filter', { id: glowId, x: '-20%', y: '-20%', width: '140%', height: '140%' }, defs);
    S.s('feGaussianBlur', { stdDeviation: 7 }, f);

    // grid + axes
    const yVals = []; for (let v = 0; v <= VMAX + 1e-6; v += STEP) yVals.push(v);
    const xVals = []; for (let yr = 0; yr <= YEARS + 1e-6; yr += P.xStep) xVals.push(yr);
    const hLines = yVals.map((v) => S.s('line', { x1: X0, x2: X1, y1: py(v), y2: py(v), stroke: v === 0 ? C.gridBase : C.grid, 'stroke-width': v === 0 ? 3 : 2 }, sv));
    const vLines = xVals.filter((yr) => yr > 0).map((yr) => S.s('line', { x1: px(yr), x2: px(yr), y1: Y1, y2: Y0, stroke: C.gridV, 'stroke-width': 2 }, sv));
    tl.from(hLines, { scaleX: 0, transformOrigin: '0% 50%', duration: 1, ease: 'expo.out', stagger: 0.05 }, 0.05);
    tl.from(vLines, { scaleY: 0, transformOrigin: '50% 100%', duration: 0.9, ease: 'expo.out', stagger: 0.04 }, 0.35);
    const yLab = yVals.map((v) => S.el('div', { text: v === 0 ? `${CUR}0` : abbr(v), style: `position:absolute;right:${1920 - X0 + 22}px;top:${py(v) - 14}px;font:500 22px "JetBrains Mono",monospace;color:${MUTED};text-align:right;` }));
    const xLab = xVals.map((yr) => S.el('div', { text: yr === YEARS ? `${YEARS} YRS` : String(yr), style: `position:absolute;left:${px(yr) - 60}px;width:120px;top:${Y0 + 18}px;font:500 22px "JetBrains Mono",monospace;color:${MUTED};text-align:center;` }));
    tl.from(yLab, { x: -16, opacity: 0, duration: 0.5, stagger: 0.05 }, 0.8);
    tl.from(xLab, { y: 12, opacity: 0, duration: 0.5, stagger: 0.04 }, 0.95);

    // series
    const stepM = Math.max(1, Math.round(N / 400)), gapStep = Math.max(1, Math.round(N / 60));
    let dG = '';
    for (let m = 0; m <= N; m += stepM) dG += (m ? 'L' : 'M') + px(m / PPY).toFixed(1) + ' ' + py(V(m)).toFixed(1);
    if (N % stepM) dG += 'L' + px(YEARS).toFixed(1) + ' ' + py(FINAL).toFixed(1);
    let dGap = dG; for (let m = N; m >= 0; m -= gapStep) dGap += `L${px(m / PPY).toFixed(1)} ${py(DEP(m)).toFixed(1)}`; dGap += 'Z';
    S.s('path', { d: dGap, fill: fillGold, 'clip-path': `url(#${clipGapId})` }, sv);
    const rev = S.s('g', { 'clip-path': `url(#${clipId})` }, sv);
    S.s('path', { d: dG + `L${px(YEARS)} ${Y0}L${px(0)} ${Y0}Z`, fill: fillMint }, rev);
    S.s('path', { d: `M${px(0)} ${py(DEP(0))}L${px(YEARS)} ${py(DEPOSITS)}`, stroke: SAGE, 'stroke-width': 5, 'stroke-dasharray': '2 11', 'stroke-linecap': 'round', fill: 'none' }, rev);
    S.s('path', { d: dG, stroke: MINT, 'stroke-width': 12, fill: 'none', opacity: 0.55, filter: `url(#${glowId})` }, rev);
    S.s('path', { d: dG, stroke: MINT, 'stroke-width': 5, fill: 'none', 'stroke-linejoin': 'round' }, rev);

    // head: dot + halo, and a value tag that rides the curve
    const headG = S.s('g', {}, sv);
    const halo = S.s('circle', { r: 22, fill: MINT, opacity: 0.18 }, headG);
    S.s('circle', { r: 10, fill: C.dot, stroke: MINT, 'stroke-width': 4 }, headG);
    const pulse = S.s('circle', { r: 12, fill: 'none', stroke: MINT, 'stroke-width': 3, opacity: 0 }, headG);
    const tag = S.el('div', { style: `position:absolute;left:0;top:0;padding:6px 14px;border-radius:10px;background:${C.tagBg};border:2px solid ${MINT};font:800 30px "Inter",sans-serif;font-variant-numeric:tabular-nums;color:${MINT};white-space:nowrap;` });
    const REV0 = 1.3, REVD = 3.6;
    const tAtYear = (yr) => REV0 + (REVD * Math.acos(1 - 2 * (yr / YEARS))) / Math.PI;   // inverse of the sine.inOut reveal
    const prog = { p: 0 };
    tl.to(prog, { p: 1, duration: REVD, ease: 'sine.inOut' }, REV0);
    tl.fromTo(headG, { opacity: 0 }, { opacity: 1, duration: 0.25 }, REV0 - 0.1);
    tl.fromTo(tag, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, REV0 + 0.05);
    tl.to(tag, { opacity: 0, y: 10, duration: 0.25, ease: 'power2.in' }, 5.0);
    tl.fromTo(pulse, { attr: { r: 12 }, opacity: 0.9 }, { attr: { r: 64 }, opacity: 0, duration: 0.8, ease: 'expo.out', immediateRender: false }, REV0 + REVD);
    S.sfx(REV0, 'pop', { pitch: 0.9, gain: 0.35 });
    S.sfx(REV0, 'riser', { dur: REVD, gain: 0.14 });
    const tickEvery = Math.max(1, Math.ceil(YEARS / 40));
    for (let y = tickEvery; y <= YEARS; y += tickEvery) {
      const p = y / YEARS;
      S.sfx(tAtYear(y), 'tick', { pitch: 0.7 + 0.9 * p, gain: 0.07 + 0.08 * p });
    }
    S.sfx(REV0 + REVD, 'thud', { gain: 0.4 });
    S.beat(REV0, 'Line draws in real time; the tag reads the value under the dot');
    let lastTag = '';
    S.onFrame(() => {
      const yr = prog.p * YEARS, v = V(yr * PPY), hx = px(yr), hy = py(v);
      clipRect.setAttribute('width', (hx - X0 + 12).toFixed(1));
      headG.setAttribute('transform', `translate(${hx.toFixed(1)},${hy.toFixed(1)})`);
      halo.setAttribute('r', (22 + 6 * Math.sin(yr * 1.7)).toFixed(1));
      const s = CUR + S.fmt(v);
      if (s !== lastTag) { tag.textContent = s; lastTag = s; }
      tag.style.left = hx + 22 + 'px'; tag.style.top = hy + 18 + 'px';
    });

    // big outline year counter, top right
    const yrBox = S.el('div', { style: 'position:absolute;right:120px;top:70px;text-align:right;' });
    S.el('div', { text: 'YEAR', style: `font:700 24px "JetBrains Mono",monospace;letter-spacing:.3em;color:${MUTED};` }, yrBox);
    const yrNum = S.el('div', { text: '0', style: `margin-top:-6px;font:900 190px/1 "Archivo",sans-serif;font-stretch:118%;font-variant-numeric:tabular-nums;color:transparent;-webkit-text-stroke:3px rgba(${rgb(MINT)},.55);` }, yrBox);
    tl.from(yrBox, { opacity: 0, x: 40, duration: 0.6, ease: 'expo.out' }, 1.1);
    let lastYr = -1;
    S.onFrame(() => { const y = Math.floor(prog.p * YEARS + 1e-6); if (y !== lastYr) { yrNum.textContent = String(y); lastYr = y; } });

    // milestones: ring on the curve + label above-left, rising pitch ladder
    const MS = (P.milestones || []).filter((v) => v > V(0) && v < FINAL);
    MS.forEach((val, i) => {
      const yr = periodsTo(val) / PPY, tt = tAtYear(yr);
      const x = px(yr), y = py(val);
      const ring = S.s('circle', { cx: x, cy: y, r: 9, fill: C.ringFill, stroke: MINT, 'stroke-width': 3.5 }, sv);
      const L = S.el('div', { style: `position:absolute;right:${1920 - x + 16}px;bottom:${1080 - y + 12}px;text-align:right;white-space:nowrap;transform-origin:100% 100%;` });
      S.el('div', { text: abbr(val), style: `font:800 ${i === MS.length - 1 ? 46 : 36}px/1 "Inter",sans-serif;color:${INK};` }, L);
      S.el('div', { text: 'YEAR ' + Math.ceil(yr), style: `margin-top:4px;font:600 17px "JetBrains Mono",monospace;letter-spacing:.14em;color:${MUTED};` }, L);
      tl.from(ring, { scale: 0, transformOrigin: '50% 50%', duration: 0.45, ease: 'back.out(3)' }, tt);
      S.pop(L, tt + 0.04, { pitch: 1 + i * 0.22, gain: 0.3, from: 0.5 });
      if (i === 0) S.beat(tt, 'Milestones pop on a rising pitch ladder');
    });

    /* ---------- the receipt ---------- */
    const panel = S.el('div', { style: 'position:absolute;left:1230px;top:350px;width:590px;' });
    const row = (color, label, top, dashed) => {
      const R = S.el('div', { style: `position:absolute;left:0;top:${top}px;display:flex;gap:22px;align-items:flex-start;` }, panel);
      S.el('div', { style: `margin-top:10px;width:26px;height:26px;border-radius:7px;${dashed ? `border:3px dashed ${color};` : `background:${color};`}` }, R);
      const box = S.el('div', {}, R);
      S.el('div', { text: label, style: `font:700 24px "JetBrains Mono",monospace;letter-spacing:.16em;color:${MUTED};white-space:nowrap;` }, box);
      const v = S.el('div', { style: `margin-top:6px;font:800 60px/1 "Inter",sans-serif;font-variant-numeric:tabular-nums;color:${INK};white-space:nowrap;` }, box);
      return { R, v };
    };
    const r1 = row(SAGE, P.depositsLabel, 0, true);
    const r2 = row(GOLD, P.growthLabel, 140);
    r2.v.style.color = GOLD;
    [[r1.v, DEPOSITS], [r2.v, GROWTH]].forEach(([el, v]) => { el.textContent = CUR + S.fmt(v); fitWidth(el, 510); });
    tl.from(r1.R, { x: 60, opacity: 0, duration: 0.55, ease: 'expo.out' }, 5.2);
    S.count(r1.v, { from: 0, to: DEPOSITS, t: 5.2, dur: 0.6, prefix: CUR });
    S.sfx(5.2, 'blip', { gain: 0.25 });
    tl.from(r2.R, { x: 60, opacity: 0, duration: 0.55, ease: 'expo.out' }, 5.6);
    S.count(r2.v, { from: 0, to: GROWTH, t: 5.6, dur: 0.85, prefix: CUR, ease: 'power3.out' });
    S.sfx(5.6, 'blip', { gain: 0.25, pitch: 1.25 });
    tl.to(gapRect, { attr: { y: Y1 - 20, height: Y0 - Y1 + 20 }, duration: 0.9, ease: 'power2.out' }, 5.6);
    S.sfx(5.65, 'shimmer', { gain: 0.16 });
    S.beat(5.6, 'Colour link: the gold area is the gold number');

    const rule = S.el('div', { style: `position:absolute;left:0;top:286px;width:560px;height:3px;background:linear-gradient(90deg, ${INK}, rgba(${rgb(INK)},0));transform-origin:0 50%;` }, panel);
    tl.from(rule, { scaleX: 0, duration: 0.5, ease: 'expo.out' }, 6.15);
    S.sfx(6.15, 'swoosh', { gain: 0.3 });
    const totL = S.el('div', { text: fill(P.totalLabel, vars), style: `position:absolute;left:0;top:314px;font:700 26px "JetBrains Mono",monospace;letter-spacing:.2em;color:${MINT};white-space:nowrap;` }, panel);
    const tot = S.el('div', { text: CUR + S.fmt(FINAL), style: `position:absolute;left:-6px;top:352px;font:800 98px/1 "Inter",sans-serif;font-variant-numeric:tabular-nums;letter-spacing:-.02em;color:${MINT};white-space:nowrap;transform-origin:0 60%;text-shadow:0 0 36px rgba(${rgb(MINT)},.55);` }, panel);
    fitWidth(tot, 580);
    tl.from(totL, { opacity: 0, y: 10, duration: 0.4 }, 6.3);
    tl.fromTo(tot, { scale: 1.5, opacity: 0, filter: 'blur(14px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.5, ease: 'expo.out' }, 6.4);
    S.sfx(6.4, 'impact', { gain: 0.55 });
    S.sfx(6.44, 'cash', { gain: 0.32 });
    S.shake(6.4, { amp: 7, dur: 0.4 });
    S.beat(6.4, 'Payoff number lands with impact and a cash-register hit');
    const pctHtml = `<span style="color:${GOLD};font-weight:800">${vars.pct}</span>`;
    const sub = S.el('div', { html: esc(P.reframe).replace('{pct}', pctHtml), style: `position:absolute;left:0;top:482px;font:500 36px "Archivo",sans-serif;color:${INK};white-space:nowrap;` }, panel);
    fitWidth(sub, 640);
    tl.from(sub, { y: 18, opacity: 0, duration: 0.55, ease: 'expo.out' }, 7.0);
    S.sfx(7.0, 'pop', { pitch: 1.4, gain: 0.25 });
    S.beat(7.0, 'Reframe the number so it sticks');

    // gold sparks off the total (analytic ballistic paths)
    const sparks = [];
    for (let i = 0; i < 26; i++) {
      const d = S.el('div', { style: `position:absolute;left:0;top:0;width:${6 + S.rnd(0, 6)}px;height:${3 + S.rnd(0, 3)}px;border-radius:2px;background:${i % 3 ? GOLD : MINT};opacity:0;` });
      sparks.push({ d, a: S.rnd(-Math.PI * 0.95, -Math.PI * 0.05), v: S.rnd(420, 900), spin: S.rnd(-8, 8), x0: 1230 + S.rnd(40, 520), y0: 350 + 402 });
    }
    S.onFrame((t) => {
      const u = t - 6.4;
      for (const s of sparks) {
        if (u < 0 || u > 1.2) { s.d.style.opacity = 0; continue; }
        const x = s.x0 + Math.cos(s.a) * s.v * u, y = s.y0 + Math.sin(s.a) * s.v * u + 900 * u * u;
        s.d.style.opacity = (1 - u / 1.2).toFixed(3);
        s.d.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${(s.spin * u * 57).toFixed(1)}deg)`;
      }
    });

    const note = S.el('div', { text: P.note, style: `position:absolute;left:120px;top:1010px;font:500 17px "JetBrains Mono",monospace;color:${C.note};white-space:nowrap;` }, S.hud);
    tl.from(note, { opacity: 0, duration: 0.8 }, 1.2);
    S.sfx(0, 'pad', { dur: 8, gain: 0.07, notes: P.padNotes, attack: 1.5, release: 1.8 });
    S.vignette({ strength: 0.55 });
    S.grain({ opacity: 0.05 });
  },
});
