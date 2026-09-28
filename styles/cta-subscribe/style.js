/* Universal CTA — Subscribe & Bell
   A generic channel card. A cursor glides in on a curved motion path, hovers and clicks; the button
   morphs, the count rolls over on an odometer, confetti fires, the bell rings and the like pops.
   No platform logos or wordmarks: every icon is drawn here from scratch. The channel, counts, labels,
   which micro-interactions play, and every colour come from the params. */
Reel.style({
  id: 'cta-subscribe', seed: 'subscribe', order: 13,
  name: 'Subscribe Card',
  transIn: { type: 'whip', dur: 0.45, dir: -1 },   // how a reel cuts INTO this piece (tools/new-reel.mjs); a reel item's trans overrides it
  niches: {
    primary: ['Universal CTA', 'Channel end screens', 'Creator branding'],
    similar: ['Cooking channels', 'Gaming channels', 'Tech reviews', 'Podcasts (follow)', 'Newsletters', 'Music artists (follow)', 'Fitness coaches', 'Education channels'],
  },
  niche: 'Universal CTA', title: 'Subscribe & Bell', duration: 5.5, poster: 4.8,
  bg: '#0d0b0d', palette: ['#FF0033', '#F4F1EE', '#1A171B'],
  techniques: ['Cursor-led UI choreography', 'Odometer roll-over', 'Micro-interaction payoffs'],
  why: 'A moving cursor gives the eye a path to follow, and each click pays off with a new reaction (morph, count, confetti, bell, like), so the ask feels like an event rather than a request.',
  facts: 'Generic UI with no platform branding; the channel name and subscriber counts are placeholders.',
  defaults: {
    channel: 'Your Channel',
    initials: 'YC',                 // 1–3 characters on the avatar
    countFrom: 99999,               // the odometer rolls from this…
    countTo: 100000,                // …to this (must be ≥ countFrom)
    countLabel: 'subscribers',      // after the number on the card
    button: 'SUBSCRIBE',
    buttonDone: 'SUBSCRIBED',
    badge: '{short}',               // the big number: {short} = 100K, {count} = 100,000
    badgeLabel: 'SUBSCRIBERS',
    show: { like: true, bell: true, confetti: true },
    padNotes: [196, 246.9, 293.7, 392],
    endChord: [392, 493.9, 587.3, 784],
    endPing: 2093,
    background: 'radial-gradient(110% 95% at 50% 36%, #2b0b14 0%, #19090e 40%, #0c0a0c 100%)',
    colors: {
      accent: '#FF0033', buttonInk: '#FFFFFF', hover: '#FF2A57', hoverGlow: '#FF1446',
      soft: '#FF6B85', light: '#FF8FA3', likeEdge: '#FF3C64',
      ink: '#F4F1EE', count: '#A9A2A7', countAfter: '#C9C2C7', done: '#2D2B32', doneInk: '#ECE9EC',
      gold: '#FFD08A', badge: ['#FFE9C9', '#FFFFFF', '#FF9C70'], badgeLabel: '#FF7890', badgeGlow: '#FF785A', badgeShadow: '#FF6E50',
      ring: ['#FF0033', '#FF7A3D', '#FF2E88'], avatar: ['#5A1424', '#2A0C14', '#1A0A0F'], card: ['#2E2A31', '#19171C'],
      lights: ['#BE0E30', '#FF465A', '#78143C', '#FF966E'], bokeh: ['#FF5A6E', '#FFC4A0'],
      confetti: ['#FF0033', '#FF4D6D', '#FFD08A', '#FFFFFF', '#FF8FA3', '#FFB36B'],
    },
  },
  build(S, P) {
    const tl = S.tl, W = 1920, H = 1080, { norm } = S, C = P.colors, SHOW = P.show || {};
    const RED = C.accent, INK = C.ink, MUTED = C.count, GOLD = C.gold;
    const LIKE = SHOW.like !== false, BELL = SHOW.bell !== false, CONFETTI = SHOW.confetti !== false;
    const rgb = (hex) => { const n = parseInt(String(hex).slice(1), 16); return `${n >> 16},${(n >> 8) & 255},${n & 255}`; };
    const pick = (arr, i) => arr[i % arr.length];
    const fill = (s, vars) => String(s).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
    const cnv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

    /* ---------------- counts (every number on screen comes from countFrom / countTo) ---------------- */
    const FROM = Math.max(0, Math.round(+P.countFrom || 0)), TO = Math.max(FROM, Math.round(+P.countTo || 0));
    const short = (v) => { const u = v >= 1e9 ? [1e9, 'B'] : v >= 1e6 ? [1e6, 'M'] : v >= 1e3 ? [1e3, 'K'] : [1, '']; return +(v / u[0]).toFixed(1) + u[1]; };
    const vars = { short: short(TO), count: S.fmt(TO), from: S.fmt(FROM) };

    /* ---------------- background: charcoal to deep red, soft defocused light ---------------- */
    if (!S.alpha) S.root.style.background = P.background;
    // camera: tight on the card for the interaction, pull back to reveal the badge, slow push to rest
    S.camSet({ x: 960, y: 566, z: 1.1 });
    S.camTo(0, { y: 560, z: 1.125 }, 2.3, 'sine.inOut');
    S.camTo(2.3, { y: 452, z: 1.0 }, 0.95, 'power3.inOut');
    S.camTo(3.25, { y: 446, z: 1.045 }, 2.25, 'sine.inOut');
    const glowC = cnv(W + 400, H + 300); glowC.style.cssText = `position:absolute;left:-200px;top:-150px;width:${W + 400}px;height:${H + 300}px;`;
    if (!S.alpha) S.cam.appendChild(glowC); // transparent-overlay renders keep only the card and its effects
    const gx = glowC.getContext('2d');
    const blob = (r, rgbs, a) => { const c = cnv(r * 2, r * 2), x = c.getContext('2d'), g = x.createRadialGradient(r, r, 0, r, r, r); g.addColorStop(0, `rgba(${rgbs},${a})`); g.addColorStop(0.5, `rgba(${rgbs},${a * 0.4})`); g.addColorStop(1, `rgba(${rgbs},0)`); x.fillStyle = g; x.fillRect(0, 0, r * 2, r * 2); return c; };
    const disc = (r, rgbs, a) => { const s = Math.ceil(r * 2 + 8), c = cnv(s, s), x = c.getContext('2d'), m = s / 2, g = x.createRadialGradient(m, m, 0, m, m, r); g.addColorStop(0, `rgba(${rgbs},${a * 0.6})`); g.addColorStop(0.85, `rgba(${rgbs},${a})`); g.addColorStop(1, `rgba(${rgbs},0)`); x.filter = 'blur(2px)'; x.fillStyle = g; x.beginPath(); x.arc(m, m, r, 0, Math.PI * 2); x.fill(); return c; };
    const LC = C.lights.map(rgb), BC = C.bokeh.map(rgb);
    const lights = [
      { s: blob(640, pick(LC, 0), 0.34), x: 960, y: 380, f: 0.12, a: 60 },
      { s: blob(520, pick(LC, 1), 0.12), x: 340, y: 820, f: 0.09, a: 80 },
      { s: blob(560, pick(LC, 2), 0.22), x: 1640, y: 240, f: 0.1, a: 70 },
      { s: blob(420, pick(LC, 3), 0.07), x: 1500, y: 900, f: 0.14, a: 50 },
    ];
    for (let i = 0; i < 14; i++) lights.push({ s: disc(S.rnd(18, 64), i % 3 ? pick(BC, 0) : pick(BC, 1), S.rnd(0.04, 0.09)), x: S.rnd(80, 1840), y: S.rnd(60, 1020), f: S.rnd(0.2, 0.5), a: S.rnd(10, 28), ph: S.rnd(0, 6) });
    S.onFrame((t) => {
      gx.setTransform(1, 0, 0, 1, 0, 0); gx.clearRect(0, 0, glowC.width, glowC.height); gx.globalCompositeOperation = 'lighter';
      for (const L of lights) {
        const px = L.x + 200 + L.a * Math.sin(t * L.f * 2 + (L.ph || 0)), py = L.y + 150 + L.a * 0.6 * Math.cos(t * L.f * 1.6 + (L.ph || 0));
        gx.drawImage(L.s, px - L.s.width / 2, py - L.s.height / 2);
      }
    });

    /* ---------------- channel card ---------------- */
    const CX = 300, CY = 442, CW = 1320, CH = 236, PH = 88, PY = (CH - PH) / 2;
    const card = S.el('div', { style: `position:absolute;left:${CX}px;top:${CY}px;width:${CW}px;height:${CH}px;border-radius:44px;background:linear-gradient(180deg, rgba(${rgb(C.card[0])},.95), rgba(${rgb(C.card[1])},.95));border:1.5px solid rgba(255,255,255,.09);box-shadow:0 44px 100px rgba(0,0,0,.6), 0 10px 26px rgba(0,0,0,.35), inset 0 1.5px 0 rgba(255,255,255,.07);transform-origin:50% 50%;` });
    const clip = S.el('div', { style: 'position:absolute;inset:0;border-radius:44px;overflow:hidden;pointer-events:none;' }, card);
    const sheen = S.el('div', { style: 'position:absolute;top:-40px;left:0;width:220px;height:320px;background:linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.075) 50%, rgba(255,255,255,0));transform:translateX(-400px) skewX(-18deg);' }, clip);
    const font = (w, px, extra = '') => `font:${w} ${px}px/1 "Inter",sans-serif;${extra}`;
    const measureW = (text, style) => { const m = S.el('span', { text, style: style + 'position:absolute;left:0;top:0;white-space:nowrap;visibility:hidden;' }, card); const w = m.offsetWidth; m.remove(); return w; };

    // avatar: gradient ring (draws on) around a monogram disc
    const AVX = 40 + 88, AVY = CH / 2;
    const av = S.el('div', { style: `position:absolute;left:${AVX - 76}px;top:${AVY - 76}px;width:152px;height:152px;border-radius:50%;background:radial-gradient(120% 120% at 30% 25%, ${C.avatar[0]} 0%, ${C.avatar[1]} 60%, ${C.avatar[2]} 100%);display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06);` }, card);
    const INITF = font(800, 60, `color:${INK};letter-spacing:-0.02em;`);
    const initTxt = String(P.initials).slice(0, 3);
    const initials = S.el('div', { text: initTxt, style: INITF }, av);
    const initW = measureW(initTxt, INITF);
    if (initW > 116) initials.style.fontSize = (60 * 116) / initW + 'px';     // three wide letters still sit inside the disc
    const avSvg = S.s('svg', { width: 200, height: 200, viewBox: '-100 -100 200 200' }, card);
    avSvg.style.cssText = `position:absolute;left:${AVX - 100}px;top:${AVY - 100}px;overflow:visible;`;
    const rg = S.uid('ring');
    const lg = S.s('linearGradient', { id: rg, x1: 0, y1: 0, x2: 1, y2: 1 }, S.defs(avSvg));
    [[0, C.ring[0]], [0.5, C.ring[1]], [1, C.ring[2]]].forEach(([o, c]) => S.s('stop', { offset: o, 'stop-color': c }, lg));
    const ringG = S.s('g', {}, avSvg);
    const ring = S.s('circle', { r: 88, fill: 'none', stroke: `url(#${rg})`, 'stroke-width': 7, 'stroke-linecap': 'round', transform: 'rotate(-90)' }, ringG);

    // controls: [like] [BUTTON]  ->  [like] [BUTTON DONE] [bell]; labels are measured, long ones shrink
    let LABF = font(800, 32, 'letter-spacing:.06em;');
    let lwA = measureW(P.button, LABF), lwB = measureW(P.buttonDone, LABF);
    const LMAX = 390, lk = LMAX / Math.max(lwA, lwB);
    if (lk < 1) { LABF = font(800, 32 * lk, 'letter-spacing:.06em;'); lwA = measureW(P.button, LABF); lwB = measureW(P.buttonDone, LABF); }
    const wA = lwA + 80, wB = lwB + 30 + 12 + 80;
    const A = { pill: CW - 40 - wA }, B = { pill: BELL ? CW - 40 - PH - 16 - wB : CW - 40 - wB, bell: CW - 40 - PH };
    A.like = A.pill - 16 - PH; B.like = B.pill - 16 - PH;

    // name + odometer count, fitted to the space left of the buttons
    const TX = AVX + 88 + 34, TXW = Math.min(LIKE ? A.like : A.pill, LIKE ? B.like : B.pill) - 36 - TX;
    const txt = S.el('div', { style: `position:absolute;left:${TX}px;top:62px;` }, card);
    const NAMEF = font(800, 52, `color:${INK};letter-spacing:-0.015em;white-space:nowrap;`);
    const nameEl = S.el('div', { text: P.channel, style: NAMEF }, txt);
    const nameW = measureW(P.channel, NAMEF);
    if (nameW > TXW) { nameEl.style.fontSize = (52 * TXW) / nameW + 'px'; nameEl.style.height = nameEl.style.lineHeight = '52px'; }
    const SUBF = font(500, 30, `font-variant-numeric:tabular-nums;`);
    const subs = S.el('div', { style: SUBF + `margin-top:18px;height:36px;line-height:36px;display:flex;align-items:flex-start;color:${MUTED};white-space:nowrap;` }, txt);
    const DW = measureW('0', SUBF), CMW = measureW(',', SUBF);
    const numWrap = S.el('span', { style: 'display:inline-flex;height:36px;' }, subs);
    const col = (cells, w) => {
      const c = S.el('span', { style: `display:inline-block;position:relative;overflow:hidden;height:36px;width:${w}px;` }, numWrap);
      const strip = S.el('span', { style: 'position:absolute;left:0;top:0;width:100%;text-align:center;' }, c);
      for (const ch of cells) S.el('span', { text: ch, style: 'display:block;height:36px;line-height:36px;' }, strip);
      return { c, strip };
    };
    // right-align both formatted numbers; each position is static, rolls forward digit by digit, or grows in
    const sa = S.fmt(FROM).split(''), sb = S.fmt(TO).split('');
    while (sa.length < sb.length) sa.unshift('');
    const ODO = [];
    let finalW = 0;
    sb.forEach((b, i) => {
      const a = sa[i], w = b === ',' ? CMW : DW;
      finalW += w;
      if (a === b) {
        S.el('span', { text: b, style: `display:inline-block;width:${w}px;${b === ',' ? '' : 'text-align:center;'}height:36px;line-height:36px;` }, numWrap);
      } else if (a === '') {
        ODO.push(Object.assign(col(['', b], 0), { grow: w }));
      } else {
        const d0 = +a, steps = (+b - d0 + 10) % 10, cells = [];
        for (let k = 0; k <= steps; k++) cells.push(String((d0 + k) % 10));
        ODO.push(Object.assign(col(cells, w), { steps }));
      }
    });
    S.el('span', { text: ' ' + P.countLabel, style: 'height:36px;line-height:36px;' }, subs);   // no-break space: survives the flex item's line start
    const subsW = finalW + measureW(' ' + P.countLabel, SUBF);
    if (subsW > TXW) gsap.set(subs, { scale: TXW / subsW, transformOrigin: '0% 50%' });

    const pill = S.el('div', { style: `position:absolute;left:${A.pill}px;top:${PY}px;width:${wA}px;height:${PH}px;border-radius:999px;background-color:${RED};overflow:hidden;box-shadow:0 10px 30px rgba(${rgb(RED)},.28);border:1.5px solid rgba(255,255,255,0);box-sizing:border-box;transform-origin:50% 50%;` }, card);
    const labA = S.el('div', { text: P.button, style: LABF + `position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:${C.buttonInk};` }, pill);
    const labB = S.el('div', { style: LABF + `position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:12px;color:${C.doneInk};opacity:0;` }, pill);
    const chk = S.s('svg', { width: 30, height: 30, viewBox: '0 0 24 24' }, labB); chk.style.overflow = 'visible';
    const chkP = S.s('path', { d: 'M4.5 12.6 L9.8 17.6 L19.6 6.8', fill: 'none', stroke: C.doneInk, 'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, chk);
    S.el('span', { text: P.buttonDone }, labB);
    const roundBtn = (left, extra = '') => S.el('div', { style: `position:absolute;left:${left}px;top:${PY}px;width:${PH}px;height:${PH}px;border-radius:50%;background-color:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.12);box-sizing:border-box;display:flex;align-items:center;justify-content:center;transform-origin:50% 50%;${extra}` }, card);
    let likeB = null, thumb = null, thumbP = null;
    if (LIKE) {
      likeB = roundBtn(A.like);
      thumb = S.s('svg', { width: 44, height: 44, viewBox: '0 0 24 24' }, likeB); thumb.style.cssText = 'overflow:visible;transform-origin:50% 60%;';
      thumbP = S.s('path', { d: 'M8 10.4 L12.2 3.7 C12.8 2.7 14.3 2.8 14.7 3.9 C14.9 4.4 14.9 4.9 14.8 5.4 L14.05 9.2 H19.5 C20.85 9.2 21.8 10.45 21.5 11.7 L19.95 18.75 C19.7 19.85 18.75 20.6 17.6 20.6 H8 Z M2.6 10.4 H5.9 V20.6 H2.6 Z', fill: INK, 'fill-opacity': 0, stroke: INK, 'stroke-width': 1.7, 'stroke-linejoin': 'round' }, thumb);
    }
    let bellB = null, bell = null, clapper = null, dot = null;
    if (BELL) {
      bellB = roundBtn(B.bell, 'opacity:0;');
      bell = S.s('svg', { width: 44, height: 44, viewBox: '0 0 24 24' }, bellB); bell.style.cssText = 'overflow:visible;transform-origin:50% 12%;';
      const bellBody = S.s('g', {}, bell);
      S.s('path', { d: 'M12 3.2 C8.8 3.2 6.6 5.7 6.6 8.9 V13.1 L4.8 16.2 C4.45 16.8 4.9 17.5 5.55 17.5 H18.45 C19.1 17.5 19.55 16.8 19.2 16.2 L17.4 13.1 V8.9 C17.4 5.7 15.2 3.2 12 3.2 Z', fill: INK }, bellBody);
      S.s('circle', { cx: 12, cy: 2.6, r: 1.35, fill: INK }, bellBody);
      clapper = S.s('path', { d: 'M9.9 18.7 A2.15 2.15 0 0 0 14.1 18.7 Z', fill: INK }, bell);
      dot = S.el('div', { style: `position:absolute;left:${PH - 30}px;top:10px;width:22px;height:22px;border-radius:50%;background:${RED};border:3px solid #221f25;box-sizing:border-box;transform-origin:50% 50%;opacity:0;` }, bellB);
    }

    /* ---------------- milestone badge ---------------- */
    const badge = S.el('div', { style: 'position:absolute;left:560px;top:196px;width:800px;text-align:center;transform-origin:400px 70px;opacity:0;' });
    const badgeGlow = S.el('div', { style: `position:absolute;left:660px;top:120px;width:600px;height:300px;border-radius:50%;background:radial-gradient(closest-side, rgba(${rgb(C.badgeGlow)},.30), rgba(${rgb(C.badgeGlow)},0));opacity:0;` });
    const [bLight, bHi, bEnd] = C.badge;
    const big = S.el('div', { text: fill(P.badge, vars), style: font(800, 144, `display:inline-block;letter-spacing:-0.035em;padding:0 10px;white-space:nowrap;background-image:linear-gradient(100deg, ${GOLD} 0%, ${bLight} 30%, ${bHi} 42%, ${bLight} 54%, ${GOLD} 70%, ${bEnd} 100%);background-size:260% 100%;background-position:100% 0;-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 10px 30px rgba(${rgb(C.badgeShadow)},.35));`) }, badge);
    if (big.offsetWidth > 790) big.style.fontSize = (144 * 790) / big.offsetWidth + 'px';
    const subRow = S.el('div', { style: 'margin-top:14px;display:flex;align-items:center;justify-content:center;gap:18px;' }, badge);
    const hair = () => S.el('div', { style: `width:64px;height:2px;background:linear-gradient(90deg, rgba(${rgb(C.soft)},0), rgba(${rgb(C.soft)},.9));` }, subRow);
    const h1 = hair();
    const SUBLF = font(700, 24, `letter-spacing:.42em;margin-right:-.42em;color:${C.badgeLabel};`);
    const subLab = S.el('div', { text: P.badgeLabel, style: SUBLF }, subRow);
    const subLW = measureW(P.badgeLabel, SUBLF);
    if (subLW > 560) subLab.style.fontSize = (24 * 560) / subLW + 'px';
    const h2 = hair(); h2.style.transform = 'scaleX(-1)';
    const shock = S.el('div', { style: `position:absolute;left:860px;top:166px;width:200px;height:200px;border-radius:50%;border:6px solid rgba(${rgb(GOLD)},.75);box-sizing:border-box;opacity:0;filter:blur(1.5px);` });

    /* ---------------- cursor + ripples + particles ---------------- */
    const ripple = (x, y) => S.el('div', { style: `position:absolute;left:${x - 60}px;top:${y - 60}px;width:120px;height:120px;border-radius:50%;border:3px solid rgba(255,255,255,.85);box-sizing:border-box;opacity:0;` });
    const PILL_C = { x: CX + A.pill + wA / 2, y: CY + CH / 2 };
    const LIKE_C = { x: CX + B.like + PH / 2, y: CY + CH / 2 };
    const rip1 = ripple(PILL_C.x + 10, PILL_C.y + 10), rip2 = LIKE ? ripple(LIKE_C.x, LIKE_C.y) : null;
    const FXO = [200, 320], fx = cnv(W + 400, H + 520); fx.style.cssText = `position:absolute;left:${-FXO[0]}px;top:${-FXO[1]}px;`; S.cam.appendChild(fx);
    const fxx = fx.getContext('2d');
    const cur = S.el('div', { style: 'position:absolute;left:0;top:0;width:40px;height:56px;transform-origin:0 0;filter:drop-shadow(0 8px 10px rgba(0,0,0,.5));' });
    const curS = S.s('svg', { width: 40, height: 56, viewBox: '-2 -2 34 48' }, cur); curS.style.overflow = 'visible';
    S.s('path', { d: 'M0 0 L0 36.5 L9.2 28 L15.4 42.4 L21.7 39.7 L15.6 25.6 L27.8 25.6 Z', fill: '#FFFFFF', stroke: '#141214', 'stroke-width': 2.6, 'stroke-linejoin': 'round' }, curS);

    /* ================================ TIMELINE ================================ */
    // 0.0 — card rises, avatar ring draws, content staggers in
    tl.fromTo(card, { y: 70, scale: 0.955 }, { y: 0, scale: 1, duration: 0.8, ease: 'expo.out' }, 0.02);
    tl.fromTo(card, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: 'power2.out' }, 0.02);
    S.sfx(0.02, 'swoosh', { gain: 0.3 });
    S.draw(ring, 0.12, 0.75, { ease: 'power2.inOut' });
    S.pop(av, 0.12, { from: 0.6, pitch: 0.95, gain: 0.3 });
    S.pop(initials, 0.24, { from: 0.4, sfx: false });
    tl.from(nameEl, { x: -24, opacity: 0, duration: 0.6, ease: 'expo.out' }, 0.2);
    tl.from(subs, { x: -24, opacity: 0, duration: 0.6, ease: 'expo.out' }, 0.28);
    if (LIKE) {
      tl.fromTo(likeB, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2.2)' }, 0.32);
      S.sfx(0.32, 'blip', { gain: 0.14, pitch: 1.2 });
    }
    tl.fromTo(pill, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(2)' }, 0.4);
    S.sfx(0.4, 'pop', { gain: 0.32, pitch: 0.9 });
    S.beat(0.02, 'Card and CTA are on screen in the first half-second');

    // 0.55 — cursor glides in on a curve
    const HOV = { x: PILL_C.x + 12, y: PILL_C.y + 12 };
    tl.set(cur, { x: 2010, y: 1210 }, 0);
    tl.to(cur, { motionPath: { path: [{ x: 2010, y: 1210 }, { x: 1790, y: 900 }, { x: 1590, y: 700 }, { x: HOV.x, y: HOV.y }], curviness: 1.3, fromCurrent: false }, duration: 0.8, ease: 'power3.inOut' }, 0.55);
    S.sfx(0.55, 'whoosh', { dur: 0.7, from: 300, to: 2600, gain: 0.26, dir: -1 });
    S.beat(0.55, 'Cursor arrives on a curve, leading the eye to the button');
    // hover: button brightens and lifts
    tl.to(pill, { backgroundColor: C.hover, boxShadow: `0 14px 44px rgba(${rgb(C.hoverGlow)},.55)`, scale: 1.035, duration: 0.25, ease: 'power2.out' }, 1.28);
    S.sfx(1.28, 'tick', { gain: 0.1, pitch: 1.3 });
    // click: press + ripple
    const CLK = 1.58;
    tl.to(cur, { scale: 0.84, duration: 0.06, ease: 'power2.out' }, CLK);
    tl.to(cur, { scale: 1, duration: 0.3, ease: 'back.out(2.5)' }, CLK + 0.07);
    tl.to(pill, { scale: 0.94, duration: 0.07, ease: 'power2.out' }, CLK);
    tl.to(pill, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, CLK + 0.08);
    tl.fromTo(rip1, { scale: 0.25, opacity: 0.9 }, { scale: 2.3, opacity: 0, duration: 0.6, ease: 'expo.out', immediateRender: false }, CLK);
    S.sfx(CLK, 'click', { gain: 0.5 });
    const HOV2 = { x: HOV.x + 44, y: HOV.y + 62 };
    tl.to(cur, { x: HOV2.x, y: HOV2.y, duration: 0.7, ease: 'sine.inOut' }, CLK + 0.2);
    S.beat(CLK, 'Click lands with a press, a ripple and an instant state change');

    // 1.66 — morph to the done state; the row reflows and the bell slides in
    const MO = CLK + 0.08;
    tl.to(pill, { left: B.pill, width: wB, backgroundColor: C.done, boxShadow: '0 10px 26px rgba(0,0,0,.35)', borderColor: 'rgba(255,255,255,.12)', duration: 0.45, ease: 'power3.inOut' }, MO);
    if (LIKE) tl.to(likeB, { left: B.like, duration: 0.45, ease: 'power3.inOut' }, MO);
    tl.to(labA, { yPercent: -70, opacity: 0, duration: 0.22, ease: 'power2.in' }, MO);
    tl.fromTo(labB, { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.4, ease: 'expo.out' }, MO + 0.14);
    S.draw(chkP, MO + 0.24, 0.3, { ease: 'power2.out' });
    if (BELL) tl.fromTo(bellB, { scale: 0.3, opacity: 0, x: -30 }, { scale: 1, opacity: 1, x: 0, duration: 0.5, ease: 'back.out(2)' }, MO + 0.22);
    S.sfx(MO, 'pop', { gain: 0.26, pitch: 1.15 });
    S.sfx(MO + 0.04, 'swoosh', { gain: 0.16, pitch: 0.8 });
    S.sfx(MO + 0.24, 'blip', { gain: 0.16, pitch: 1.45 });

    // 1.98 — odometer: carries ripple right to left, new leading digits grow in last
    const OD = 1.98;
    let k = 0;
    for (let i = ODO.length - 1; i >= 0; i--, k++) {
      const c = ODO[i], at = OD + k * 0.05;
      if (c.grow) {
        tl.fromTo(c.c, { width: 0 }, { width: c.grow, duration: 0.32, ease: 'power3.out' }, at);
        tl.to(c.strip, { y: -36, duration: 0.32, ease: 'back.out(1.7)' }, at);
      } else tl.to(c.strip, { y: -36 * c.steps, duration: 0.32, ease: 'back.out(1.7)' }, at);
    }
    const FL = ODO.length <= 6 ? 0.3 : ODO.length * 0.05;     // the count flashes once the last column lands
    if (ODO.length) {
      tl.to(subs, { color: '#FFFFFF', duration: 0.12 }, OD + FL);
      tl.to(subs, { color: C.countAfter, duration: 0.8 }, OD + 0.9 + (FL - 0.3));
      S.sfx(OD, 'ratchet', { count: ODO.length, gap: 0.05, gain: 0.2 });
    }
    S.beat(OD, `Odometer rolls over to ${S.fmt(TO)}${CONFETTI ? '; confetti rewards the action' : ''}`);

    // 2.42 — milestone badge + confetti
    const BK = 2.42;
    tl.fromTo(badge, { scale: 0.35, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.8)' }, BK);
    tl.fromTo(badgeGlow, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'expo.out' }, BK);
    tl.fromTo(shock, { scale: 0.4, opacity: 0.85 }, { scale: 4.2, opacity: 0, duration: 0.55, ease: 'power3.out', immediateRender: false }, BK);
    tl.fromTo([h1, h2], { scaleX: 0 }, { scaleX: (i) => (i ? -1 : 1), duration: 0.5, ease: 'expo.out' }, BK + 0.2);
    tl.from(subLab, { opacity: 0, y: 10, duration: 0.45, ease: 'expo.out' }, BK + 0.16);
    tl.to(big, { backgroundPosition: '0% 0', duration: 0.9, ease: 'power2.inOut' }, BK + 0.3);
    S.sfx(BK, 'pop', { gain: 0.3, pitch: 0.8 });
    S.sfx(BK + 0.02, 'shimmer', { gain: 0.26 });
    S.sfx(BK + 0.05, 'coin', { gain: 0.16 });

    // 2.78 — bell rings (decaying wobble), notification dot pops
    const RING = 2.78;
    if (BELL) {
      S.sfx(RING, 'bell', { gain: 0.3 });
      tl.fromTo(dot, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(3)' }, RING + 0.14);
      S.sfx(RING + 0.14, 'pop', { gain: 0.2, pitch: 1.6 });
      S.beat(RING, 'Bell rings on its own to show what the viewer gets');
      S.onFrame((t) => {
        const u = t - RING;
        if (u < 0 || u > 1.1) { bell.style.transform = ''; clapper.setAttribute('transform', ''); return; }
        const d = Math.exp(-3.6 * u), w = 2 * Math.PI * 4.2 * u;
        bell.style.transform = `rotate(${(24 * d * Math.sin(w)).toFixed(2)}deg)`;
        clapper.setAttribute('transform', `translate(${(2.4 * d * Math.sin(w - 0.9)).toFixed(3)},0)`);
      });
    }

    // 3.03 — cursor glides to like; 3.52 click: thumb fills, pops, bursts
    const LK = 3.52;
    if (LIKE) {
      tl.to(cur, { motionPath: { path: [{ x: HOV2.x, y: HOV2.y }, { x: (HOV2.x + LIKE_C.x) / 2, y: LIKE_C.y - 60 }, { x: LIKE_C.x + 12, y: LIKE_C.y + 14 }], curviness: 1.2, fromCurrent: false }, duration: 0.46, ease: 'power3.inOut' }, 3.03);
      S.sfx(3.03, 'swoosh', { gain: 0.2 });
      tl.to(cur, { scale: 0.84, duration: 0.06, ease: 'power2.out' }, LK);
      tl.to(cur, { scale: 1, duration: 0.3, ease: 'back.out(2.5)' }, LK + 0.07);
      tl.to(likeB, { scale: 0.9, duration: 0.07, ease: 'power2.out' }, LK);
      tl.to(likeB, { scale: 1, duration: 0.5, ease: 'back.out(3)', backgroundColor: `rgba(${rgb(RED)},.2)`, borderColor: `rgba(${rgb(C.likeEdge)},.55)` }, LK + 0.08);
      tl.fromTo(thumb, { scale: 0.55, rotation: -24 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(3.2)', immediateRender: false }, LK + 0.02);
      tl.to(thumbP, { attr: { 'fill-opacity': 1 }, duration: 0.12 }, LK + 0.02);
      tl.fromTo(rip2, { scale: 0.3, opacity: 0.9 }, { scale: 1.9, opacity: 0, duration: 0.55, ease: 'expo.out', immediateRender: false }, LK);
      S.sfx(LK, 'click', { gain: 0.45 });
      S.sfx(LK + 0.02, 'pop', { gain: 0.32, pitch: 1.3 });
      S.sfx(LK + 0.04, 'blip', { gain: 0.12, pitch: 1.8 });
      S.beat(LK, 'Like pays off last, then the frame rests as the end card');

      // 3.86 — cursor leaves, a glass sheen crosses the card, the frame rests
      tl.to(cur, { motionPath: { path: [{ x: LIKE_C.x + 12, y: LIKE_C.y + 14 }, { x: LIKE_C.x + 150, y: 820 }, { x: LIKE_C.x + 360, y: 1230 }], curviness: 1, fromCurrent: false }, duration: 0.55, ease: 'power2.in' }, 3.86);
      S.sfx(3.86, 'whoosh', { dur: 0.5, from: 500, to: 1800, gain: 0.16 });
    } else {
      // no like: the cursor leaves straight after the bell, and the card rests longer
      tl.to(cur, { motionPath: { path: [{ x: HOV2.x, y: HOV2.y }, { x: HOV2.x + 150, y: 820 }, { x: HOV2.x + 360, y: 1230 }], curviness: 1, fromCurrent: false }, duration: 0.55, ease: 'power2.in' }, 3.1);
      S.sfx(3.1, 'whoosh', { dur: 0.5, from: 500, to: 1800, gain: 0.16 });
      S.beat(3.1, 'Cursor leaves early; the card rests as the end card');
    }
    tl.to(sheen, { x: CW + 400, duration: 0.75, ease: 'power2.inOut' }, 3.95);
    S.sfx(3.98, 'swoosh', { gain: 0.12, pitch: 0.7 });

    /* ---------------- confetti (analytic ballistic flutter) + like burst ---------------- */
    const CONF = C.confetti;
    const bits = [];
    for (let i = 0; i < 130; i++) {
      const ang = -Math.PI / 2 + S.rnd(-1.3, 1.3), sp = S.rnd(650, 1800);
      bits.push({ x0: 960 + S.rnd(-60, 60), y0: 262 + S.rnd(-16, 16), vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, k: S.rnd(2.6, 3.8), g: S.rnd(900, 1200),
        w: S.rnd(11, 21), h: S.rnd(6, 11), c: CONF[i % CONF.length], rot: S.rnd(0, 6.28), spin: S.rnd(-9, 9), flip: S.rnd(6, 14), ph: S.rnd(0, 6.28),
        wob: S.rnd(8, 26), wf: S.rnd(3, 6), round: i % 7 === 0, delay: S.rnd(0, 0.06) });
    }
    const sparks = [];
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 + S.rnd(-0.14, 0.14); sparks.push({ a, v: S.rnd(420, 720), len: S.rnd(14, 26), w: S.rnd(4, 6), c: [RED, C.soft, GOLD, '#FFFFFF'][i % 4], dot: false }); }
    for (let i = 0; i < 12; i++) { const a = ((i + 0.5) / 12) * Math.PI * 2 + S.rnd(-0.1, 0.1); sparks.push({ a, v: S.rnd(220, 360), r: S.rnd(2.8, 4.4), c: ['#FFFFFF', GOLD, C.light][i % 3], dot: true }); }
    S.onFrame((t) => {
      fxx.setTransform(1, 0, 0, 1, 0, 0); fxx.clearRect(0, 0, fx.width, fx.height); fxx.setTransform(1, 0, 0, 1, FXO[0], FXO[1]);
      const u0 = t - BK;
      if (CONFETTI && u0 > 0 && u0 < 2.2) {
        for (const b of bits) {
          const u = u0 - b.delay; if (u <= 0) continue;
          const e = (1 - Math.exp(-b.k * u)) / b.k, vt = b.g / b.k;
          const x = b.x0 + b.vx * e + b.wob * Math.sin(b.wf * u + b.ph) * norm(u, 0.2, 0.8);
          const y = b.y0 + vt * u + (b.vy - vt) * e;
          const a = 1 - norm(u, 1.4, 2.0);
          if (a <= 0 || y > H + 40) continue;
          fxx.save(); fxx.globalAlpha = a; fxx.translate(x, y); fxx.rotate(b.rot + b.spin * u); fxx.scale(1, Math.max(0.12, Math.abs(Math.cos(b.flip * u + b.ph))));
          fxx.fillStyle = b.c;
          if (b.round) { fxx.beginPath(); fxx.arc(0, 0, b.h * 0.7, 0, Math.PI * 2); fxx.fill(); } else fxx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
          fxx.restore();
        }
      }
      const u1 = t - (LK + 0.02);
      if (LIKE && u1 > 0 && u1 < 0.6) {
        fxx.lineCap = 'round';
        for (const s of sparks) {
          const d = 40 + s.v * (1 - Math.exp(-7.5 * u1)) / 7.5, a = 1 - norm(u1, s.dot ? 0.2 : 0.28, s.dot ? 0.5 : 0.58), cs = Math.cos(s.a), sn = Math.sin(s.a);
          if (a <= 0) continue;
          fxx.globalAlpha = a;
          if (s.dot) { fxx.fillStyle = s.c; fxx.beginPath(); fxx.arc(LIKE_C.x + cs * d, LIKE_C.y + sn * d, s.r, 0, Math.PI * 2); fxx.fill(); continue; }
          const L = s.len * (1 - norm(u1, 0.12, 0.5)) + 1;
          fxx.strokeStyle = s.c; fxx.lineWidth = s.w;
          fxx.beginPath(); fxx.moveTo(LIKE_C.x + cs * (d - L), LIKE_C.y + sn * (d - L)); fxx.lineTo(LIKE_C.x + cs * d, LIKE_C.y + sn * d); fxx.stroke();
        }
        fxx.globalAlpha = 1;
      }
      ringG.setAttribute('transform', `rotate(${(t * 22).toFixed(2)})`);
    });

    /* ---------------- bed, finish ---------------- */
    S.sfx(0, 'pad', { dur: 5.5, gain: 0.075, notes: P.padNotes, attack: 0.3, release: 0.8, cutoff: 1800 });
    S.sfx(4.32, 'ping', { gain: 0.08, freq: P.endPing });
    S.sfx(4.34, 'chord', { notes: P.endChord, dur: 1.1, gain: 0.05, wave: 'triangle' });
    S.vignette({ strength: 0.6, inner: 42 });
    S.grain({ opacity: 0.05 });
  },
});
