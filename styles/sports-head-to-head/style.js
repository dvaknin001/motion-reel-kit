/* Sports — Head to Head
   Broadcast stat package: two sides slam shut on a diagonal seam, a VS badge lands, one row of diverging bars
   per stat grows out of the seam with a live verdict, and the VS flips into a buzzer scoreboard.
   Everything hangs off the seam; each row's bars are drawn to scale against that row's own maximum.
   Row winners (ties and lower-is-better stats included), bar lengths and the final tally are computed
   from the params. */
Reel.style({
  id: 'sports-head-to-head', seed: 'sports', order: 6,
  name: 'Head to Head',
  transIn: { type: 'slash', dur: 0.55 },   // how a reel cuts INTO this piece (tools/new-reel.mjs); a reel item's trans overrides it
  niches: {
    primary: ['Sports', 'Basketball', 'GOAT debates'],
    similar: ['Tennis', 'American football', 'Soccer', 'Boxing & MMA tale of the tape', 'Formula 1 drivers', 'Esports players', 'Tech spec face-offs'],
  },
  niche: 'Sports', title: 'Head to Head', duration: 7.5, poster: 7.1,
  bg: '#07040A', palette: ['#CE1141', '#552583', '#FDB927'],
  techniques: ['Diagonal split-screen slam', 'Diverging bars with live verdicts', 'VS badge flips into a buzzer scoreboard'],
  why: 'Every row is a small contest with a visible winner, so the viewer keeps score in their head until the buzzer confirms it.',
  facts: 'NBA career regular-season stats and honours (NBA.com, Basketball-Reference): Jordan 30.1 PPG, 32,292 pts, 6 titles, 5 MVPs, 14 All-Star; Bryant 25.0 PPG, 33,643 pts, 5 titles, 1 MVP, 18 All-Star.',
  defaults: {
    left: { sub: 'MICHAEL', name: 'JORDAN', number: '23' },
    right: { sub: 'KOBE', name: 'BRYANT', number: '24' },
    rows: [                       // 3–6 rows; winners, bar lengths and the tally are computed
      { label: 'POINTS PER GAME', left: 30.1, right: 25.0, decimals: 1 },
      { label: 'CAREER POINTS', left: 32292, right: 33643 },
      { label: 'CHAMPIONSHIPS', left: 6, right: 5 },
      { label: 'MVP AWARDS', left: 5, right: 1 },
      { label: 'ALL-STAR SELECTIONS', left: 14, right: 18 },
    ],
    vs: 'VS',
    finalLabel: 'FINAL',
    caption: 'Career regular season · NBA',
    colors: {
      left: {
        panel: ['#D8163F', '#A90E35', '#55081F', '#23050E', '#0D0207'], sheen: 'rgba(255,92,130,.42)',
        number: 'rgba(255,255,255,.3)', numberFill: 'rgba(0,0,0,.13)', stripe: '#050304', stripeLine: 'rgba(255,255,255,.5)',
        vs: '#9A0C31', bar: ['#6A0821', '#BD103B'], barWin: ['#D51540', '#FF5B80'], barGlow: 'rgba(255,48,96,.8)',
        accent: '#FFFFFF', valueGlow: 'rgba(255,70,110,.85)', plate: ['#E3194B', '#A30D34'],
      },
      right: {
        panel: ['#733AB4', '#542585', '#2B1149', '#160828', '#09040F'], sheen: 'rgba(253,185,39,.26)',
        number: 'rgba(253,185,39,.36)', numberFill: 'rgba(0,0,0,.15)', stripe: '#FDB927', stripeLine: 'rgba(255,255,255,.42)',
        vs: '#45217C', bar: ['#33165A', '#6737A9'], barWin: ['#7440BC', '#BC8DFF'], barGlow: 'rgba(178,120,255,.8)',
        accent: '#FDB927', valueGlow: 'rgba(253,185,39,.6)', plate: ['#6A35AA', '#3E1B6D'],
      },
      spark: '#FDB927',
      backdrop: ['#221328', '#0C0710', '#07040A'],
      scoreboard: { led: '#FF4034', ring: '#FF3326', glow: '#FF281E', tag: '#E0231B', flash: '#FF1E18' },
    },
  },
  build(S, P) {
    const tl = S.tl, W = 1920, H = 1080, C = P.colors, CL = C.left, CR = C.right, SB = C.scoreboard;
    const GOLD = C.spark;
    const ANG = 9, TAN = Math.tan((ANG * Math.PI) / 180), SK = `skewX(${-ANG}deg)`;
    const PY = 440, seamX = (y) => 960 + (PY - y) * TAN;       // the seam: a "/" through (960, PY)
    const EXT = 360, WP = W + 2 * EXT, HP = H + 2 * EXT;          // panel overscan for shake / camera
    const HY = 212, HX = seamX(HY);                               // header centre: VS badge, then scoreboard
    const T_MEET = 0.3, T_VS = 0.7, T_FLIP = 5.0, T_BUZZ = 6.0;
    const E = (name) => S.ease(name);

    /* ---------- helpers ---------- */
    const rgbOf = (c) => {                                        // "#RRGGBB", "#RGB" or "rgb(a)(r,g,b,…)" → "r,g,b"
      c = String(c).trim();
      if (c[0] === '#') { const h = c.length === 4 ? c.slice(1).replace(/./g, (x) => x + x) : c.slice(1, 7); const n = parseInt(h, 16); return `${n >> 16},${(n >> 8) & 255},${n & 255}`; }
      const m = c.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
      return m ? `${m[1]},${m[2]},${m[3]}` : '255,255,255';
    };
    const fade = (c, a) => `rgba(${rgbOf(c)},${a})`;
    const fill = (s, vars) => String(s ?? '').replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
    const stop = (arr, i) => (Array.isArray(arr) ? arr[Math.min(i, arr.length - 1)] : arr);   // short colour lists repeat their last stop
    // natural one-line width of `text` in `css`, measured off-stage (transforms don't count)
    const measure = (text, css) => { const m = S.el('span', { text, style: `position:absolute;left:0;top:0;visibility:hidden;white-space:nowrap;${css}` }, S.hud); const w = m.offsetWidth; m.remove(); return w; };
    const fitTo = (el, text, css, px, maxW) => { const w = measure(text, css); if (w <= maxW) return px; const n = (px * maxW) / w; el.style.fontSize = n + 'px'; return n; };

    /* ---------- the maths: rows, winners, bar scale, tally ---------- */
    // supported: 3–6 rows (extra rows are cut; 1–2 still render)
    const ROWS = (Array.isArray(P.rows) ? P.rows : []).filter((R) => R && typeof R === 'object').slice(0, 6);
    const NR = ROWS.length;
    let scoreL = 0, scoreR = 0;
    const DATA = ROWS.map((R) => {
      const a = Number(R.left) || 0, b = Number(R.right) || 0, dec = R.decimals || 0;
      const ra = +a.toFixed(dec), rb = +b.toFixed(dec);            // judge what the viewer sees
      const win = ra === rb ? 0 : (ra > rb) !== !!R.lowerIsBetter ? -1 : 1;   // -1 left, 1 right, 0 tie
      if (win < 0) scoreL++; else if (win > 0) scoreR++;
      return { R, a, b, dec, win, pre: R.prefix || '', suf: R.suffix || '' };
    });
    const vars = { left: P.left.name, right: P.right.name, leftScore: scoreL, rightScore: scoreR };

    S.root.style.background = stop(C.backdrop, 2);
    S.camSet({ x: 960, y: 540, z: 1.05 });
    S.camTo(T_MEET, { z: 1.0 }, 0.55, 'expo.out');
    S.camTo(0.95, { z: 1.014, y: 536 }, 4.9, 'sine.inOut');
    S.camTo(T_BUZZ, { z: 1.022, y: 528 }, 1.5, 'power2.out');

    // backdrop seen in the gap before the halves meet
    S.el('div', { style: `position:absolute;left:${-EXT}px;top:${-EXT}px;width:${WP}px;height:${HP}px;background:radial-gradient(700px 900px at ${EXT + 960}px ${EXT + 540}px, ${stop(C.backdrop, 0)} 0%, ${stop(C.backdrop, 1)} 55%, ${stop(C.backdrop, 2)} 100%);` });

    /* ================= split panels ================= */
    const mkPanel = (side) => {
      const a = (seamX(-EXT) + EXT).toFixed(1), b = (seamX(H + EXT) + EXT).toFixed(1);
      const poly = side < 0
        ? `polygon(0px 0px, ${a}px 0px, ${b}px ${HP}px, 0px ${HP}px)`
        : `polygon(${a}px 0px, ${WP}px 0px, ${WP}px ${HP}px, ${b}px ${HP}px)`;
      return S.el('div', { style: `position:absolute;left:${-EXT}px;top:${-EXT}px;width:${WP}px;height:${HP}px;clip-path:${poly};overflow:hidden;` });
    };
    const LP = mkPanel(-1), RP = mkPanel(1);
    const Y = (y) => `${EXT + y}px`;
    const panelBg = (c, sx, sy) => `
      radial-gradient(820px 620px at ${EXT + sx}px ${EXT + sy}px, ${c.sheen}, ${fade(c.sheen, 0)} 70%),
      linear-gradient(180deg, ${stop(c.panel, 0)} ${Y(-60)}, ${stop(c.panel, 1)} ${Y(250)}, ${stop(c.panel, 2)} ${Y(470)}, ${stop(c.panel, 3)} ${Y(690)}, ${stop(c.panel, 4)} ${Y(1080)})`;
    S.el('div', { style: `position:absolute;left:0;top:0;width:100%;height:100%;background:${panelBg(CL, 720, 110)};` }, LP);
    S.el('div', { style: `position:absolute;left:0;top:0;width:100%;height:100%;background:${panelBg(CR, 1250, 100)};` }, RP);
    // pinstripe texture parallel to the seam
    [LP, RP].forEach((p) => S.el('div', { style: 'position:absolute;left:0;top:0;width:100%;height:100%;background:repeating-linear-gradient(99deg, rgba(0,0,0,.24) 0 3px, rgba(0,0,0,0) 3px 17px);opacity:.5;' }, p));

    // huge outlined numbers (background depth layer, parallax driven per frame)
    const bigNum = (txt, p, cx, stroke, fillC) => S.el('div', { text: String(txt ?? ''), style: `position:absolute;left:${EXT + cx}px;top:${EXT + 560}px;font:400 900px/1 "Anton",sans-serif;color:${fillC};-webkit-text-stroke:5px ${stroke};white-space:nowrap;` }, p);
    const NUML = bigNum(P.left.number, LP, 455, CL.number, CL.numberFill);
    const NUMR = bigNum(P.right.number, RP, 1470, CR.number, CR.numberFill);

    // team accent stripes riding the leading edge of each panel
    const stripeMask = '-webkit-mask-image:linear-gradient(180deg,#000 0%,#000 43%,rgba(0,0,0,.18) 48%,rgba(0,0,0,.18) 100%);mask-image:linear-gradient(180deg,#000 0%,#000 43%,rgba(0,0,0,.18) 48%,rgba(0,0,0,.18) 100%);';
    const stripe = (p, off, w, bg) => S.el('div', { style: `position:absolute;left:${EXT + 960 + off - w / 2}px;top:${EXT + PY - 1000}px;width:${w}px;height:2000px;background:${bg};transform:rotate(${ANG}deg);${stripeMask}` }, p);
    stripe(LP, -19, 16, CL.stripe); stripe(LP, -35, 3, CL.stripeLine);
    stripe(RP, 17, 12, CR.stripe); stripe(RP, 31, 3, CR.stripeLine);

    // speed streaks inside each panel during the slam
    const streaks = [];
    [[LP, 1], [RP, -1]].forEach(([p, dir]) => {
      for (let i = 0; i < 16; i++) {
        const len = S.rnd(260, 760), th = S.rnd(2, 7), a = S.rnd(0.35, 0.85);
        const d = S.el('div', { style: `position:absolute;left:0;top:0;width:${len.toFixed(0)}px;height:${th.toFixed(1)}px;border-radius:9px;background:linear-gradient(${dir > 0 ? 90 : 270}deg, rgba(255,255,255,0), rgba(255,255,255,${a.toFixed(2)}));opacity:0;` }, p);
        streaks.push({ d, dir, len, y: EXT + S.rnd(30, H - 30), x0: S.rnd(-350, 850), v: S.rnd(2600, 4400), t0: S.rnd(-0.12, 0.16), life: S.rnd(0.3, 0.5) });
      }
    });
    // shockwave light bands that run outward from the seam after the hit
    const band = (p) => S.el('div', { style: `position:absolute;left:0;top:0;width:300px;height:${HP}px;background:linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.26) 60%, rgba(255,255,255,0));opacity:0;transform-origin:50% ${EXT + PY}px;` }, p);
    const bandL = band(LP), bandR = band(RP);

    tl.fromTo(LP, { x: -660 }, { x: 0, duration: T_MEET, ease: 'power1.in' }, 0);
    tl.fromTo(RP, { x: 660 }, { x: 0, duration: T_MEET, ease: 'power1.in' }, 0);
    S.sfx(0, 'swoosh', { dur: 0.32, gain: 0.46, dir: 1, from: 500, to: 5200 });
    S.sfx(0.02, 'swoosh', { dur: 0.3, gain: 0.42, dir: -1, pitch: 0.86, from: 500, to: 5200 });
    S.sfx(T_MEET, 'thud', { gain: 0.5 });
    S.shake(T_MEET, { amp: 12, dur: 0.35 });
    S.beat(T_MEET, 'Both halves slam shut by frame 18: the matchup reads before any text');

    // seam line (a thin live wire from frame 0 that flares on the hit) + bloom, camera space
    const seamLine = S.el('div', { style: `position:absolute;left:${960 - 2.5}px;top:${PY - 1000}px;width:5px;height:2000px;background:#fff;box-shadow:0 0 14px 2px rgba(255,255,255,.8),0 0 50px 8px rgba(255,255,255,.26);` });
    const bloom = S.el('div', { style: `position:absolute;left:${960 - 110}px;top:${PY - 1000}px;width:220px;height:2000px;background:linear-gradient(90deg, rgba(255,255,255,0), #fff 50%, rgba(255,255,255,0));opacity:0;` });
    const flash = S.el('div', { style: 'position:absolute;left:0;top:0;width:1920px;height:1080px;background:#fff;opacity:0;' }, S.hud);

    /* ================= names ================= */
    const NAME_D = 252, MAKE_ROOM = 40;          // names hug the VS, then part for the wider scoreboard
    const nameBlock = (first, last, side) => {
      const x = side < 0 ? HX - NAME_D : HX + NAME_D;
      const box = S.el('div', { style: `position:absolute;top:100px;${side < 0 ? `right:${W - x}px;text-align:right;` : `left:${x}px;text-align:left;`}white-space:nowrap;` });
      gsap.set(box, { skewX: -ANG, transformOrigin: `${side < 0 ? '100%' : '0%'} 100%` });
      const fCss = 'font:800 38px/1 "Archivo",sans-serif;font-stretch:122%;letter-spacing:.3em;';
      const lCss = 'font:400 156px/1.1 "Anton",sans-serif;letter-spacing:.01em;';
      const f = S.el('div', { text: first, style: `${fCss}${side < 0 ? 'margin-right:-.3em;' : ''}color:rgba(255,255,255,.92);` }, box);
      const l = S.el('div', { text: last, style: `margin-top:4px;${lCss}color:#fff;text-shadow:0 8px 34px rgba(0,0,0,.35);` }, box);
      // room between the parted position and the title-safe edge (the skew leans the right name outward)
      const maxW = side < 0 ? x - MAKE_ROOM - 96 : W - 96 - 24 - (x + MAKE_ROOM);
      const fs1 = fitTo(f, first, fCss, 38, maxW), fs2 = fitTo(l, last, lCss, 156, maxW);
      const drop = 38 - fs1 + 1.1 * (156 - fs2);                  // a shrunk name keeps the shared baseline
      if (drop > 0) box.style.top = 100 + drop + 'px';
      return { box, f, l };
    };
    const NJ = nameBlock(String(P.left.sub ?? ''), String(P.left.name ?? ''), -1), NK = nameBlock(String(P.right.sub ?? ''), String(P.right.name ?? ''), 1);
    [NJ, NK].forEach((N, i) => {
      const sp = S.split(N.l, 'chars', { mask: 'chars' });
      const chars = i === 0 ? sp.chars.slice().reverse() : sp.chars;   // rise from the seam outward
      tl.from(chars, { yPercent: 112, duration: 0.62, ease: 'expo.out', stagger: 0.036 }, 0.36 + i * 0.03);
      tl.fromTo(N.f, { clipPath: i === 0 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'expo.out' }, 0.5 + i * 0.03);
    });
    S.sfx(0.38, 'swoosh', { gain: 0.24, pan: -0.5, pitch: 1.2 });
    S.sfx(0.42, 'swoosh', { gain: 0.24, pan: 0.5, pitch: 1.3 });

    /* ================= VS badge ================= */
    const sparks = [];
    for (let i = 0; i < 22; i++) {
      const d = S.el('div', { style: `position:absolute;left:0;top:0;width:${S.rnd(8, 18).toFixed(0)}px;height:${S.rnd(2.5, 4.5).toFixed(1)}px;border-radius:3px;background:${i % 3 ? '#fff' : GOLD};opacity:0;` });
      sparks.push({ d, a: S.rnd(0, Math.PI * 2), v: S.rnd(420, 980) });
    }
    const vsOuter = S.el('div', { style: `position:absolute;left:${HX}px;top:${HY}px;width:0;height:0;` });
    const vsGlow = S.el('div', { style: `position:absolute;left:-320px;top:-220px;width:640px;height:440px;border-radius:50%;background:radial-gradient(closest-side, rgba(255,255,255,.5), ${fade(GOLD, '.2')} 48%, ${fade(GOLD, 0)} 100%);opacity:0;` }, vsOuter);
    const vsBounce = S.el('div', { style: 'position:absolute;left:0;top:0;' }, vsOuter);
    const vsWrap = S.el('div', { style: 'position:absolute;left:0;top:0;' }, vsBounce);
    const vsRing = S.el('div', { style: `position:absolute;left:-96px;top:-68px;width:192px;height:136px;box-sizing:border-box;border:5px solid #fff;opacity:0;` }, vsOuter);
    const vsBox = S.el('div', { style: `position:absolute;left:-94px;top:-66px;width:188px;height:132px;box-sizing:border-box;border:4px solid #fff;background:linear-gradient(90deg, ${CL.vs} 0%, #0B090D 40%, #0B090D 60%, ${CR.vs} 100%);box-shadow:0 0 0 4px rgba(0,0,0,.55),0 0 34px rgba(255,255,255,.5),0 0 90px ${fade(GOLD, '.32')};transform:${SK};display:flex;align-items:center;justify-content:center;` }, vsWrap);
    const vsText = S.el('div', { text: String(P.vs ?? ''), style: 'font:400 98px/1 "Anton",sans-serif;color:#fff;letter-spacing:.02em;text-shadow:0 0 18px rgba(255,255,255,.55);margin-top:2px;' }, vsBox);
    fitTo(vsText, String(P.vs ?? ''), 'font:400 98px/1 "Anton",sans-serif;letter-spacing:.02em;', 98, 160);
    tl.fromTo(vsWrap, { scale: 3, rotation: -16 }, { scale: 1, rotation: 0, duration: 0.2, ease: 'power3.in' }, T_VS - 0.2);
    tl.fromTo(vsWrap, { opacity: 0 }, { opacity: 1, duration: 0.07, ease: 'none' }, T_VS - 0.2);
    S.sfx(T_VS - 0.2, 'whoosh', { dur: 0.22, gain: 0.3, from: 2600, to: 400 });
    S.sfx(T_VS, 'impact', { gain: 0.58 });
    S.sfx(T_VS, 'boom', { gain: 0.22, dur: 1.4 });
    S.shake(T_VS, { amp: 16, dur: 0.45 });
    S.beat(T_VS, 'VS lands on the impact; names rise out of the seam around it');

    /* ================= numbers + parallax ================= */
    const numIn = { k: 1, o: 0 };
    tl.to(numIn, { k: 0, duration: 1.1, ease: 'expo.out' }, 0.3);
    tl.to(numIn, { o: 1, duration: 0.5, ease: 'power2.out' }, 0.3);
    S.sfx(0.32, 'whoosh', { dur: 0.7, gain: 0.16, from: 180, to: 900 });

    /* ================= stat rows ================= */
    // Layout: 5 rows fill the band y 444–884 at 110 px; other counts spread over the same band (pitch 88–150 px,
    // centred) and 6 rows shrink bars and values to 80%. Timing: rows start across the same 1.2–3.8 s window
    // (0.65 s apart for 5 rows, never more than 0.9 s apart), so the flip at 5.0 s always follows the last verdict.
    const L = 560, GAP = 8, GROW = 0.5;
    const DY = NR > 1 ? S.clamp(440 / (NR - 1), 88, 150) : 0;
    const ROW0 = 664 - ((NR - 1) * DY) / 2;
    const k = NR > 1 ? Math.min(1, DY / 110) : 1;
    const BH = 38 * k, TAGY = 29 + 19 * k;                        // bar height; label tag sits TAGY above the bar centre
    const ROW_DT = NR > 1 ? Math.min(0.9, 2.6 / (NR - 1)) : 0;
    const T_ROW0 = 1.2 + (2.6 - (NR - 1) * ROW_DT) / 2;
    const valCss = `font:400 ${74 * k}px/${84 * k}px "Anton",sans-serif;letter-spacing:.01em;`;
    const tagCss = 'font:700 22px/1 "Archivo",sans-serif;font-stretch:112%;letter-spacing:.2em;';
    const rows = [];
    DATA.forEach((D, i) => {
      const R = D.R, yc = ROW0 + i * DY, sx = seamX(yc), max = Math.max(D.a, D.b, 0);
      const t0 = T_ROW0 + i * ROW_DT, tGrow = t0 + 0.06, tWin = tGrow + GROW + 0.02;

      const mkBar = (side, val) => {
        const SC = side < 0 ? CL : CR;
        const len = max > 0 ? (L * Math.max(0, val)) / max : 0;
        const org = side < 0 ? '100%' : '0%';
        const track = S.el('div', { style: `position:absolute;left:${side < 0 ? sx - GAP - L : sx + GAP}px;top:${yc - BH / 2}px;width:${L}px;height:${BH}px;background:rgba(255,255,255,.06);transform-origin:${org} 50%;` });
        gsap.set(track, { skewX: -ANG });
        tl.fromTo(track, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'expo.out' }, t0);
        const wrap = S.el('div', { style: `position:absolute;left:${side < 0 ? sx - GAP - len : sx + GAP}px;top:${yc - BH / 2}px;width:${len}px;height:${BH}px;transform-origin:${org} 50%;transform:${SK} scaleX(0);` });
        const glow = S.el('div', { style: `position:absolute;left:0;top:0;width:100%;height:100%;box-shadow:0 0 28px 5px ${SC.barGlow};opacity:0;` }, wrap);
        const fillEl = S.el('div', { style: `position:absolute;left:0;top:0;width:100%;height:100%;overflow:hidden;filter:saturate(1) brightness(1);background:linear-gradient(${side < 0 ? 270 : 90}deg, ${stop(SC.bar, 0)}, ${stop(SC.bar, 1)});` }, wrap);
        const hi = S.el('div', { style: `position:absolute;left:0;top:0;width:100%;height:100%;background:linear-gradient(${side < 0 ? 270 : 90}deg, ${stop(SC.barWin, 0)}, ${stop(SC.barWin, 1)});opacity:0;` }, fillEl);
        S.el('div', { style: 'position:absolute;left:0;right:0;top:0;height:3px;background:rgba(255,255,255,.34);' }, fillEl);
        const glint = S.el('div', { style: 'position:absolute;top:0;left:0;width:110px;height:100%;background:linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.8), rgba(255,255,255,0));' }, fillEl);
        gsap.set(glint, { x: -140 });
        const chev = S.s('svg', { width: 18, height: 26, viewBox: '0 0 18 26', style: `position:absolute;top:${(BH - 26) / 2}px;${side < 0 ? 'left:14px' : 'right:14px'};overflow:visible;opacity:0;` });
        S.s('path', { d: side < 0 ? 'M14 3 L4 13 L14 23' : 'M4 3 L14 13 L4 23', fill: 'none', stroke: SC.accent, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, chev);
        wrap.appendChild(chev);
        const vo = S.el('div', { style: `position:absolute;left:0;top:${yc - 44 * k}px;width:320px;height:${84 * k}px;text-align:${side < 0 ? 'right' : 'left'};` });
        const vs = S.el('span', { text: '0', style: `display:inline-block;font:400 ${74 * k}px/${84 * k}px "Anton",sans-serif;color:#fff;letter-spacing:.01em;white-space:nowrap;transform-origin:${side < 0 ? '100%' : '0%'} 60%;` }, vo);
        tl.fromTo(vs, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: 'none' }, tGrow);
        return { side, val, len, wrap, glow, fill: fillEl, hi, glint, chev, vo, vs, push: 0, text: D.pre + S.fmt(val, D.dec) + D.suf };
      };
      const bj = mkBar(-1, D.a), bk = mkBar(1, D.b);

      const tag = S.el('div', { text: String(R.label ?? ''), style: `position:absolute;left:${seamX(yc - TAGY).toFixed(1)}px;top:${yc - TAGY}px;padding:8px calc(18px - .2em) 7px 18px;background:#0A080C;border:1px solid rgba(255,255,255,.24);font:700 22px/1 "Archivo",sans-serif;font-stretch:112%;letter-spacing:.2em;color:#fff;white-space:nowrap;` });
      fitTo(tag, String(R.label ?? ''), tagCss, 22, 520);
      gsap.set(tag, { xPercent: -50, yPercent: -50, skewX: -ANG });
      tl.fromTo(tag, { scaleX: 0.15, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.42, ease: 'expo.out' }, t0 - 0.04);
      S.sfx(t0 - 0.04, 'click', { gain: 0.22, pitch: 1.1 });

      // a value next to a short bar slides past the label tag; values shrink to stay inside title-safe
      const tagCx = seamX(yc - TAGY), tagHW = tag.offsetWidth / 2;
      for (const b of [bj, bk]) {
        const inner = b.side < 0 ? sx - GAP - b.len - 24 : sx + GAP + b.len + 24;
        const tagEdge = b.side < 0 ? tagCx - tagHW - 6 : tagCx + tagHW + 6;
        b.push = Math.max(0, b.side < 0 ? inner - tagEdge : tagEdge - inner);
        const room = Math.min(320, b.side < 0 ? inner - b.push - 96 : W - 96 - (inner + b.push));
        const w = measure(b.text, valCss);
        if (w > room) b.vs.style.fontSize = (74 * k * Math.max(room, 40)) / w + 'px';
      }

      const prog = { p: 0 };
      tl.to(prog, { p: 1, duration: GROW, ease: 'power3.out' }, tGrow);
      for (let n = 1; n <= 5; n++) {
        const u = 1 - Math.pow(1 - n / 6, 1 / 3);
        S.sfx(tGrow + u * GROW, 'tick', { gain: 0.09 + 0.018 * n, pitch: 0.95 + 0.08 * n });
      }

      if (D.win) {
        // verdict: winner brightens + chevron + glint, loser dims
        const win = D.win < 0 ? bj : bk, lose = D.win < 0 ? bk : bj, WC = D.win < 0 ? CL : CR;
        tl.to(win.hi, { opacity: 1, duration: 0.22, ease: 'power2.out' }, tWin);
        tl.to(win.glow, { opacity: 1, duration: 0.3, ease: 'power2.out' }, tWin);
        tl.fromTo(win.glint, { x: -140 }, { x: win.len + 30, duration: 0.5, ease: 'power2.inOut', immediateRender: false }, tWin);
        tl.fromTo(win.chev, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(3)', transformOrigin: '50% 50%' }, tWin + 0.04);
        tl.to(win.vs, { scale: 1.13, duration: 0.1, ease: 'power2.out' }, tWin);
        tl.to(win.vs, { scale: 1, duration: 0.35, ease: 'power2.inOut' }, tWin + 0.1);
        tl.to(win.vs, { color: WC.accent, textShadow: `0 0 22px ${WC.valueGlow}`, duration: 0.25 }, tWin);
        tl.to(lose.wrap, { opacity: 0.55, duration: 0.3, ease: 'power2.out' }, tWin);
        tl.to(lose.fill, { filter: 'saturate(.45) brightness(.9)', duration: 0.3, ease: 'power2.out' }, tWin);
        tl.to(lose.vs, { opacity: 0.5, duration: 0.3, ease: 'power2.out' }, tWin);
      } else {
        // tie: no point, nothing dims; both bars glint and both values pulse
        for (const b of [bj, bk]) {
          tl.fromTo(b.glint, { x: -140 }, { x: b.len + 30, duration: 0.5, ease: 'power2.inOut', immediateRender: false }, tWin);
          tl.to(b.vs, { scale: 1.13, duration: 0.1, ease: 'power2.out' }, tWin);
          tl.to(b.vs, { scale: 1, duration: 0.35, ease: 'power2.inOut' }, tWin + 0.1);
        }
      }
      S.sfx(tWin, 'blip', { gain: 0.34, pitch: 1 + i * 0.09, pan: D.win < 0 ? -0.45 : D.win > 0 ? 0.45 : 0 });
      rows.push({ D, sx, bj, bk, prog });
      if (i === 0) S.beat(t0, 'One scale per row, measured from the seam: both bars read true');
      if (i === 1) S.beat(tWin, 'Winner brightens, loser dims: the verdict needs no reading');
    });

    /* ================= scoreboard ================= */
    const sbOuter = S.el('div', { style: `position:absolute;left:${HX}px;top:${HY}px;width:0;height:0;` });
    const SBW = 440, SBH = 200;
    const sbRing = S.el('div', { style: `position:absolute;left:${-SBW / 2 - 14}px;top:${-SBH / 2 - 14}px;width:${SBW + 28}px;height:${SBH + 28}px;box-sizing:border-box;border:5px solid ${SB.ring};box-shadow:0 0 30px 6px ${fade(SB.glow, '.75')}, inset 0 0 22px ${fade(SB.glow, '.6')};transform:${SK};opacity:0;` }, sbOuter);
    const sbBox = S.el('div', { style: `position:absolute;left:${-SBW / 2}px;top:${-SBH / 2}px;width:${SBW}px;height:${SBH}px;box-sizing:border-box;border:4px solid #fff;background:#0A080C;box-shadow:0 0 0 4px rgba(0,0,0,.5),0 18px 60px rgba(0,0,0,.55),0 0 40px rgba(255,255,255,.25);transform:${SK};` }, sbOuter);
    // clock strip with a 7-segment LED readout
    const strip = S.el('div', { style: 'position:absolute;left:0;top:0;width:100%;height:64px;border-bottom:3px solid #fff;background:linear-gradient(180deg,#141116,#060507);' }, sbBox);
    const led = S.s('svg', { width: SBW - 8, height: 64, viewBox: `0 0 ${SBW - 8} 64`, style: 'position:absolute;left:0;top:0;overflow:visible;' });
    strip.appendChild(led);
    const ledFx = S.uid('led');
    const lf = S.s('filter', { id: ledFx, x: '-40%', y: '-40%', width: '180%', height: '180%' }, S.s('defs', null, led));
    S.s('feGaussianBlur', { stdDeviation: 3.2, result: 'b' }, lf);
    const lm = S.s('feMerge', null, lf); S.s('feMergeNode', { in: 'b' }, lm); S.s('feMergeNode', { in: 'SourceGraphic' }, lm);
    const SEG = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
    const LED_ON = SB.led, LED_OFF = fade(SB.led, '.1');
    const seg7 = (x, y, w, h, th) => {
      const g = S.s('g', { transform: `translate(${x},${y})`, filter: `url(#${ledFx})` }, led);
      const gp = th * 0.22;
      const hz = (cx, cy, len) => `${cx - len / 2},${cy} ${cx - len / 2 + th / 2},${cy - th / 2} ${cx + len / 2 - th / 2},${cy - th / 2} ${cx + len / 2},${cy} ${cx + len / 2 - th / 2},${cy + th / 2} ${cx - len / 2 + th / 2},${cy + th / 2}`;
      const vt = (cx, cy, len) => `${cx},${cy - len / 2} ${cx + th / 2},${cy - len / 2 + th / 2} ${cx + th / 2},${cy + len / 2 - th / 2} ${cx},${cy + len / 2} ${cx - th / 2},${cy + len / 2 - th / 2} ${cx - th / 2},${cy - len / 2 + th / 2}`;
      const hl = w - th - 2 * gp, vl = h / 2 - th / 2 - 2 * gp;
      const PT = { a: hz(w / 2, th / 2, hl), g: hz(w / 2, h / 2, hl), d: hz(w / 2, h - th / 2, hl), f: vt(th / 2, h / 4 + th / 4, vl), b: vt(w - th / 2, h / 4 + th / 4, vl), e: vt(th / 2, (3 * h) / 4 - th / 4, vl), c: vt(w - th / 2, (3 * h) / 4 - th / 4, vl) };
      const polys = {}; for (const kk in PT) polys[kk] = S.s('polygon', { points: PT[kk], fill: LED_OFF }, g);
      let cur = null;
      return (d) => { if (d === cur) return; cur = d; const on = SEG[d] || ''; for (const kk in polys) polys[kk].setAttribute('fill', on.includes(kk) ? LED_ON : LED_OFF); };
    };
    const LX = (SBW - 8) / 2;
    const d0 = seg7(LX - 37, 10, 28, 44, 6.5), d1 = seg7(LX + 9, 10, 28, 44, 6.5);
    const dp = S.s('circle', { cx: LX, cy: 51, r: 3.6, fill: LED_ON, filter: `url(#${ledFx})` }, led);
    // score row: the tally computed from the rows
    const scoreRow = S.el('div', { style: 'position:absolute;left:0;top:67px;width:100%;height:125px;display:flex;' }, sbBox);
    const plate = (bg, txt) => S.el('div', { text: txt, style: `position:relative;overflow:hidden;flex:0 0 170px;display:flex;align-items:center;justify-content:center;background:${bg};font:400 118px/1 "Anton",sans-serif;color:#fff;padding-top:4px;` }, scoreRow);
    const pL = plate(`linear-gradient(180deg,${stop(CL.plate, 0)},${stop(CL.plate, 1)})`, String(scoreL));
    const mid = S.el('div', { style: 'position:relative;flex:1 1 auto;' }, scoreRow);
    S.el('div', { style: 'position:absolute;left:50%;top:50%;width:34px;height:11px;margin:-6px 0 0 -17px;background:#fff;' }, mid);  // the en dash, drawn
    const pR = plate(`linear-gradient(180deg,${stop(CR.plate, 0)},${stop(CR.plate, 1)})`, String(scoreR));
    // the winning plate gets the glint and the other dims; an overall tie glints both
    const winPlates = scoreL > scoreR ? [pL] : scoreR > scoreL ? [pR] : [pL, pR];
    const losePlates = scoreL > scoreR ? [pR] : scoreR > scoreL ? [pL] : [];
    const plateGlints = winPlates.map((p) => {
      const g = S.el('div', { style: 'position:absolute;left:0;top:0;width:90px;height:100%;background:linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.55), rgba(255,255,255,0));' }, p);
      gsap.set(g, { x: -120 });
      return g;
    });
    const finalText = fill(P.finalLabel, vars);
    const finalTag = S.el('div', { text: finalText, style: `position:absolute;left:0;top:0;padding:7px calc(22px - .24em) 6px 22px;background:${SB.tag};border:3px solid #fff;font:800 28px/1 "Archivo",sans-serif;font-stretch:118%;letter-spacing:.24em;color:#fff;white-space:nowrap;box-shadow:0 0 24px ${fade(SB.glow, '.7')};` }, sbOuter);
    fitTo(finalTag, finalText, 'font:800 28px/1 "Archivo",sans-serif;font-stretch:118%;letter-spacing:.24em;', 28, 396);   // up to the scoreboard's width
    if (!finalText) finalTag.style.display = 'none';
    const FTY = SBH / 2 + 12;
    gsap.set(finalTag, { xPercent: -50, yPercent: -50, x: -(FTY * TAN), y: FTY, skewX: -ANG });

    gsap.set([vsOuter, sbOuter], { transformPerspective: 900 });
    tl.to(vsOuter, { rotationX: 90, duration: 0.14, ease: 'power2.in' }, T_FLIP);
    tl.fromTo(sbOuter, { rotationX: -90, opacity: 0 }, { rotationX: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.6)' }, T_FLIP + 0.12);
    tl.to(NJ.box, { x: -MAKE_ROOM, duration: 0.5, ease: 'power3.inOut' }, T_FLIP - 0.06);
    tl.to(NK.box, { x: MAKE_ROOM, duration: 0.5, ease: 'power3.inOut' }, T_FLIP - 0.06);
    S.sfx(T_FLIP - 0.04, 'whoosh', { dur: 0.3, gain: 0.34, from: 400, to: 3600 });
    S.sfx(T_FLIP + 0.31, 'stamp', { gain: 0.5 });
    S.shake(T_FLIP + 0.31, { amp: 7, dur: 0.3 });
    S.beat(T_FLIP, 'VS flips into the scoreboard: the matchup becomes a result');
    // shot clock: 0.7 → 0.0, buzzer on zero
    const CLK0 = T_BUZZ - 0.7;
    for (let n = 1; n <= 6; n++) S.sfx(CLK0 + n * 0.1, 'tick', { gain: 0.14 + 0.02 * n, pitch: 1.3 + 0.05 * n });
    S.sfx(T_BUZZ, 'buzzer', { gain: 0.17, dur: 0.8 });
    S.sfx(T_BUZZ, 'thud', { gain: 0.45 });
    S.sfx(T_BUZZ + 0.05, 'wind', { dur: 1.4, gain: 0.1 });
    S.shake(T_BUZZ, { amp: 9, dur: 0.4 });
    tl.fromTo(finalTag, { scale: 1.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.32, ease: 'expo.out' }, T_BUZZ);
    plateGlints.forEach((g) => tl.fromTo(g, { x: -120 }, { x: 220, duration: 0.6, ease: 'power2.inOut', immediateRender: false }, T_BUZZ + 0.15));
    losePlates.forEach((p) => tl.to(p, { opacity: 0.72, duration: 0.4 }, T_BUZZ + 0.1));
    S.beat(T_BUZZ, 'Buzzer on 0.0 closes the loop with a sound every fan knows');
    const edge = S.el('div', { style: `position:absolute;left:0;top:0;width:1920px;height:1080px;box-shadow:inset 0 0 180px 40px ${fade(SB.flash, '.6')};opacity:0;` }, S.hud);

    const SRCY = 940, capText = fill(P.caption, vars);
    const src = S.el('div', { text: capText, style: `position:absolute;left:${seamX(SRCY).toFixed(1)}px;top:${SRCY}px;padding:7px 16px 6px;background:rgba(8,6,10,.92);border:1px solid rgba(255,255,255,.16);font:500 22px/1 "JetBrains Mono",monospace;letter-spacing:.04em;color:rgba(255,255,255,.7);white-space:nowrap;` });
    fitTo(src, capText, 'font:500 22px/1 "JetBrains Mono",monospace;letter-spacing:.04em;', 22, 1100);
    if (!capText) src.style.display = 'none';
    gsap.set(src, { xPercent: -50, yPercent: -50, skewX: -ANG });
    tl.fromTo(src, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, T_FLIP + 0.5);
    if (capText) S.sfx(T_FLIP + 0.5, 'tick', { gain: 0.14, pitch: 0.8 });

    /* ================= per-frame ================= */
    S.onFrame((t) => {
      // streaks
      for (const s of streaks) {
        const u = (t - s.t0) / s.life;
        if (u < 0 || u > 1) { s.d.style.opacity = 0; continue; }
        const run = s.v * (t - s.t0);
        const x = s.dir > 0 ? EXT + s.x0 + run - s.len : EXT + W - s.x0 - run;
        s.d.style.opacity = Math.sin(Math.PI * u).toFixed(3);
        s.d.style.transform = `translate(${x.toFixed(1)}px,${s.y.toFixed(1)}px)`;
      }
      // seam wire, hit flash, bloom and shockwave bands
      const um = t - T_MEET;
      const flick = 0.8 + 0.2 * S.noise(t * 40, 5);
      seamLine.style.opacity = um < 0 ? flick.toFixed(3) : 1;
      seamLine.style.transform = `rotate(${ANG}deg) scaleX(${(um < 0 ? 0.55 : 1 + 2.4 * Math.exp(-um * 16)).toFixed(3)})`;
      flash.style.opacity = um < 0 ? 0 : (0.34 * Math.exp(-um * 26)).toFixed(3);
      bloom.style.opacity = (um < 0 ? 0.2 * flick : 0.85 * Math.exp(-um * 12)).toFixed(3);
      bloom.style.transform = `rotate(${ANG}deg) scaleX(${(um < 0 ? 0.45 : 0.45 + 0.9 * (1 - Math.exp(-um * 14))).toFixed(3)})`;
      const ub = S.clamp(um / 0.55), eb = E('power2.out')(ub), bo = um < 0 || um > 0.55 ? 0 : (1 - ub).toFixed(3);
      bandL.style.opacity = bo; bandR.style.opacity = bo;
      bandL.style.transform = `translateX(${(EXT + seamX(PY) - 180 - eb * 1300).toFixed(1)}px) ${SK}`;
      bandR.style.transform = `translateX(${(EXT + seamX(PY) - 180 + eb * 1300).toFixed(1)}px) ${SK}`;
      // big numbers: slower entry + constant drift = background parallax
      const dx = numIn.k * 300, drift = 16 * t, zs = 1 + 0.16 * numIn.k;
      NUML.style.opacity = numIn.o; NUMR.style.opacity = numIn.o;
      NUML.style.transform = `translate(-50%,-50%) translateX(${(-dx + drift).toFixed(1)}px) ${SK} scale(${zs.toFixed(4)})`;
      NUMR.style.transform = `translate(-50%,-50%) translateX(${(dx - drift).toFixed(1)}px) ${SK} scale(${zs.toFixed(4)})`;
      // VS: follow-through wobble, glow, ring, sparks
      const uv = t - T_VS;
      const wob = uv < 0 ? 0 : 0.085 * Math.exp(-uv * 7) * Math.sin(uv * 30);
      vsBounce.style.transform = `scale(${(1 - wob).toFixed(4)})`;
      const flipFade = 1 - S.norm(t, T_FLIP, T_FLIP + 0.14);
      vsGlow.style.opacity = uv < 0 ? 0 : ((0.62 + 0.38 * Math.exp(-uv * 3) + 0.08 * Math.sin(t * 4.2)) * flipFade).toFixed(3);
      vsRing.style.opacity = uv < 0 || uv > 0.5 ? 0 : (1 - uv / 0.5).toFixed(3);
      vsRing.style.transform = `${SK} scale(${(1 + 1.2 * (1 - Math.exp(-Math.max(0, uv) * 6))).toFixed(3)})`;
      for (const s of sparks) {
        if (uv < 0 || uv > 0.75) { s.d.style.opacity = 0; continue; }
        const dist = (s.v * (1 - Math.exp(-uv * 5))) / 5 + 70;
        const x = HX + Math.cos(s.a) * dist * 1.35, y = HY + Math.sin(s.a) * dist * 0.8;
        s.d.style.opacity = (1 - uv / 0.75).toFixed(3);
        s.d.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${((s.a * 180) / Math.PI).toFixed(1)}deg)`;
      }
      // rows: bar length, riding value and count are all the same function of p
      for (const r of rows) {
        const p = r.prog.p;
        for (const b of [r.bj, r.bk]) {
          b.wrap.style.transform = `${SK} scaleX(${p.toFixed(4)})`;
          let x = b.side < 0 ? r.sx - GAP - b.len * p - 24 : r.sx + GAP + b.len * p + 24;
          if (b.push) x += b.side * b.push * p;
          b.vo.style.transform = `translateX(${(b.side < 0 ? x - 320 : x).toFixed(1)}px) ${SK}`;
          const s = r.D.pre + S.fmt(b.val * p, r.D.dec) + r.D.suf;
          if (s !== b._s) { b.vs.textContent = s; b._s = s; }
        }
      }
      // shot clock + buzzer light
      const cv = Math.max(0, Math.ceil((0.7 - (t - CLK0)) * 10 - 1e-6));
      const shown = t < CLK0 ? 7 : Math.min(7, cv);
      d0(0); d1(shown);
      const ub2 = t - T_BUZZ;
      const blink = ub2 < 0 ? 0 : ub2 < 0.6 ? (Math.floor(ub2 * 10) % 2 ? 0.25 : 1) : 1;
      sbRing.style.opacity = blink;
      edge.style.opacity = ub2 < 0 ? 0 : (0.9 * Math.exp(-ub2 * 3.2)).toFixed(3);
      dp.setAttribute('fill', LED_ON);
    });

    S.sfx(0, 'drone', { dur: 7.5, gain: 0.034, freq: 55, cutoff: 320, air: 0.3 });
    S.vignette({ strength: 0.5, inner: 55 });
    S.grain({ opacity: 0.06 });
  },
});
