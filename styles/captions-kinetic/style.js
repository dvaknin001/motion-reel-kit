/* Podcast & talking head — Kinetic Captions
   Word-synced "Hormozi" captions over simulated defocused podcast footage, then a pattern
   interrupt: one giant word per beat, settling into a quotable stack. Every caption state is a
   pure function of time computed from the word table, so each word lands on its exact frame.
   The words, their times and keyword roles, the slam words, the footage colours and the chords are
   params; every effect (colour, shake, punch-in, meter tint, sound) is timed from the word table. */
Reel.style({
  id: 'captions-kinetic', seed: 'captions', order: 1,
  name: 'Kinetic Captions',
  transIn: { type: 'flash', dur: 0.3 },   // how a reel cuts INTO this piece (tools/new-reel.mjs); a reel item's trans overrides it
  niches: {
    primary: ['Podcast clips', 'Talking-head YouTube', 'Motivation & self-improvement'],
    similar: ['Fitness coaching', 'Business & entrepreneurship', 'Sales training', 'Interview clips', 'Sports mindset', 'Sermon & faith clips', 'Creator advice'],
  },
  niche: 'Podcast & Talking Head', title: 'Kinetic Captions', duration: 8, poster: 6.9,
  bg: '#0c0907', palette: ['#FFE14D', '#FF3B3B', '#15100C'],
  techniques: ['Word-synced kinetic captions', 'Keyword colour + footage punch-in', 'Giant-word pattern interrupt'],
  why: 'A caption lands on every word so the eye reads ahead of the ear; colour-coded keywords and punch-ins flag the ideas, and the giant-word slams break the rhythm right where attention would sag.',
  facts: 'Fictional script; word timings authored at about three words per second.',
  defaults: {
    // Caption pages in order; each page is the list of words on screen together. `newLine: true` starts
    // a second (or third) line. t = onset in seconds (omit it to auto-time at wordsPerSecond).
    // kw: "hit" red, hard pop, shake, punch-in · "win" green glow (+ icon "arrow" | "check")
    //     "strike" struck through at strikeAt (default t + 0.4) · "keep" lights up again when the strike lands
    // dur / syl / loud drive the speech meter and head nods; omit them to estimate from the word.
    pages: [
      [
        { text: 'MOST', t: 0.35, dur: 0.22, syl: 1, loud: 0.75 },
        { text: 'PEOPLE', t: 0.60, dur: 0.30, syl: 2, loud: 0.7 },
        { text: 'QUIT', t: 0.95, kw: 'hit', dur: 0.30, syl: 1, loud: 1 },
      ],
      [
        { text: 'RIGHT', t: 1.50, dur: 0.22, syl: 1, loud: 0.72 },
        { text: 'BEFORE', t: 1.75, dur: 0.34, syl: 2, loud: 0.72 },
      ],
      [
        { text: 'IT', t: 2.15, dur: 0.14, syl: 1, loud: 0.6 },
        { text: 'STARTS', t: 2.35, dur: 0.36, syl: 1, loud: 0.75 },
        { text: 'WORKING.', t: 2.80, kw: 'win', icon: 'arrow', dur: 0.44, syl: 2, loud: 0.95 },
      ],
      [
        { text: 'DISCIPLINE', t: 3.60, kw: 'keep', dur: 0.42, syl: 3, loud: 0.85 },
        { text: 'BEATS', t: 4.05, dur: 0.26, syl: 1, loud: 0.75 },
        { text: 'MOTIVATION', t: 4.35, kw: 'strike', newLine: true, dur: 0.52, syl: 4, loud: 0.85 },
      ],
    ],
    // Giant words, one per beat; they settle into the closing stack. kw: "accent" | "hit" | "win" | none (text colour)
    slams: [
      { text: 'EVERY.', t: 5.10, kw: 'accent', dur: 0.36, syl: 2, loud: 1 },
      { text: 'SINGLE.', t: 5.60, dur: 0.38, syl: 2, loud: 1 },
      { text: 'TIME.', t: 6.10, kw: 'accent', dur: 0.46, syl: 1, loud: 1 },
    ],
    wordsPerSecond: 2.6,      // pace for words without t; slams follow 0.75 s after the last caption, 0.5 s apart
    uppercase: true,
    footage: {
      show: true,             // false = captions over the plain background (alpha renders always skip the footage)
      wall: ['#26170d', '#170f0b', '#0b1113', '#06171a'],   // back-wall grade, left to right
      warm: '#FF8A3A',        // practical lamp, string lights, shelf strips, warm rim light
      cool: '#1CC4BE',        // LED wall, acoustic panels, cool rim light
    },
    padNotes: [110, 164.8, 220, 261.6],       // bed under the captions (Hz)
    slamPadNotes: [98, 146.8, 196, 233.1],    // bed under the slams (Hz)
    droneHz: 55,
    colors: { accent: '#FFE14D', hit: '#FF3B3B', win: '#3DFF8A', text: '#FFFFFF', struck: '#C9C9CF' },
  },
  build(S, P) {
    const tl = S.tl, W = 1920, H = 1080, { lerp, norm } = S;
    const C = P.colors, FT = P.footage || {};
    const YEL = C.accent, RED = C.hit, GRN = C.win, WHITE = C.text, GREY = C.struck;
    const ez = (n) => S.ease(n);
    const expoOut = ez('expo.out'), p2out = ez('power2.out'), p3out = ez('power3.out'), p2in = ez('power2.in'), sineIO = ez('sine.inOut');
    const popEase = ez('back.out(2.4)'), popHard = ez('back.out(3.4)');
    const cnv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
    const put = (parent, c, left, top) => { c.style.cssText = `position:absolute;left:${left}px;top:${top}px;width:${c.width}px;height:${c.height}px;`; parent.appendChild(c); return c; };
    const r4 = (x) => Math.round(x * 1e4) / 1e4;                       // derived times land on the authored grid
    const hexRgb = (h) => { const n = parseInt(String(h).replace('#', ''), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
    const rgb = (h) => hexRgb(h).join(',');

    /* ---------------- the word table: timing, speech model, roles ---------------- */
    const caseOf = (s) => (P.uppercase === false ? String(s) : String(s).toUpperCase());
    const sylOf = (s) => {
      const w = String(s).toLowerCase().replace(/[^a-z]/g, '');
      let n = (w.match(/[aeiouy]+/g) || []).length;
      if (n > 1 && /[^aeiouy]e$/.test(w) && !/[^aeiouy]le$/.test(w)) n--;   // silent final e
      return Math.max(1, n);
    };
    const word = (w) => (typeof w === 'string' ? { text: w } : w);                                    // "WORD" is shorthand for { text: "WORD" }
    const PAGES_IN = (P.pages || []).map((pg) => (Array.isArray(pg) ? pg : pg && pg.words) || [])
      .map((pg) => pg.map(word).filter((w) => w && w.text)).filter((pg) => pg.length).slice(0, 8);   // 1–8 pages
    const SLAMS_IN = (P.slams || []).map(word).filter((s) => s && s.text).slice(0, 4);             // 0–4 slams
    const WPS = Math.max(0.8, +P.wordsPerSecond || 2.6);
    const ALL = [];
    PAGES_IN.forEach((pg, pi) => pg.slice(0, 8).forEach((w, wi) =>
      ALL.push(Object.assign({}, w, { icon: undefined, iconName: w.icon, txt: caseOf(w.text), page: pi, first: wi === 0 }))));
    SLAMS_IN.forEach((s) => ALL.push(Object.assign({}, s, { txt: caseOf(s.text), slam: true })));
    ALL.forEach((w) => { w.syl = w.syl || sylOf(w.txt); });
    ALL.forEach((w, i) => {
      const pv = ALL[i - 1];
      if (typeof w.t !== 'number') {
        if (!pv) w.t = 0.35;
        else if (w.slam && !pv.slam) w.t = r4(pv.t + 0.75);            // lead-in to the first slam
        else if (w.slam) w.t = r4(pv.t + 0.5);                          // one slam per half second
        else w.t = r4(pv.t + (0.7 + 0.3 * pv.syl) / WPS + (w.first ? 0.2 : 0));
      }
      if (pv && w.t < pv.t + 0.12) w.t = r4(pv.t + 0.12);              // never on top of the previous word
    });
    ALL.forEach((w, i) => {
      const nx = ALL[i + 1], room = nx ? nx.t - w.t - 0.04 : 0.6;
      if (typeof w.dur !== 'number') w.dur = r4(Math.max(0.12, Math.min(room, 0.1 + 0.09 * w.syl + 0.012 * w.txt.length)));
      if (typeof w.loud !== 'number') w.loud = w.slam || w.kw === 'hit' ? 1 : w.kw === 'win' ? 0.95 : w.kw === 'keep' || w.kw === 'strike' ? 0.85 : w.txt.length <= 2 ? 0.6 : 0.75;
    });
    const CAPS = ALL.filter((w) => !w.slam), SL = ALL.filter((w) => w.slam), NSL = SL.length;
    const lastT = ALL.length ? ALL[ALL.length - 1].t : 0;
    const D = (S.dur = Math.round(Math.max(5, NSL ? SL[NSL - 1].t + 1.9 : lastT + 1.4) * 100) / 100);   // length follows the script
    const S0 = NSL ? SL[0].t : D + 1;                                    // first slam (past the end when there are none)
    const SETTLE = NSL ? r4(SL[NSL - 1].t + 0.48) : D + 1;              // slams settle into the stack
    const HITS = CAPS.filter((w) => w.kw === 'hit').map((w) => w.t);

    // caption pages (timing only here; the DOM is built with the captions below)
    const PAGES = PAGES_IN.map((_, pi) => {
      const ws = CAPS.filter((w) => w.page === pi), lines = [[]];
      ws.forEach((w, k) => { if (w.newLine && k > 0 && lines.length < 3) lines.push([]); lines[lines.length - 1].push(w); });
      return { t0: ws[0].t, lines, words: ws };
    });
    PAGES.forEach((pg, i) => {
      pg.t1 = i + 1 < PAGES.length ? PAGES[i + 1].t0 : NSL ? S0 : r4(D - 0.4);
      pg.exit = i === PAGES.length - 1 && NSL ? 0.13 : 0.07;             // the page before the slams leaves slower
      pg.words.forEach((w) => { w.pg = pg; });
    });

    /* ---------------- speech model: onset, length, syllables, loudness ---------------- */
    const SPEECH = ALL.map((w) => [w.t, w.dur, w.syl, w.loud]);
    const speech = (t) => {
      let e = 0;
      for (const [t0, d, syl, loud] of SPEECH) {
        if (t < t0 || t > t0 + d + 0.1) continue;
        const u = (t - t0) / d; let v;
        if (u <= 1) { const k = u * syl, f = k - Math.floor(k); v = (0.35 + 0.65 * Math.pow(Math.sin(Math.PI * f), 0.6)) * Math.min(1, (t - t0) / 0.03); }
        else v = 0.35 * (1 - (t - t0 - d) / 0.1);
        e = Math.max(e, v * loud);
      }
      return e;
    };

    /* ============================ FOOTAGE (world, camera-affected) ============================ */
    // Colours are authored against a warm base (255,138,58) and a cool base (28,196,190); the params
    // shift every tint by the same offset, so the defaults reproduce the original grade exactly.
    const FWARM = hexRgb(FT.warm || '#FF8A3A'), FCOOL = hexRgb(FT.cool || '#1CC4BE'), WARM0 = [255, 138, 58], COOL0 = [28, 196, 190];
    const shift = (base, ref, c) => c.map((v, i) => Math.max(0, Math.min(255, v + base[i] - ref[i]))).join(',');
    const wt = (r, g, b) => shift(FWARM, WARM0, [r, g, b]), ct = (r, g, b) => shift(FCOOL, COOL0, [r, g, b]);
    const SHOWFOOT = FT.show !== false && !S.alpha;
    const OX = 180, OY = 150, FW = W + 2 * OX, FH = H + 2 * OY;
    const foot = S.layer(S.cam);
    if (!SHOWFOOT) foot.style.display = 'none';                          // still built, so the seeded layout never shifts

    // back wall: grade, practical glows and defocused set pieces (static)
    const wallC = put(foot, cnv(FW, FH), -OX, -OY);
    {
      const x = wallC.getContext('2d'); x.translate(OX, OY);
      let g = x.createLinearGradient(0, 0, W, 0);
      const WALL = Array.isArray(FT.wall) && FT.wall.length ? FT.wall : ['#26170d', '#170f0b', '#0b1113', '#06171a'];
      const WS = WALL.length === 4 ? [0, 0.42, 0.7, 1] : WALL.map((_, i) => i / Math.max(1, WALL.length - 1));
      WALL.forEach((c, i) => g.addColorStop(WS[i], c));
      x.fillStyle = g; x.fillRect(-OX, -OY, FW, FH);
      const glow = (cx, cy, r, rgb, a, sy = 1) => {
        x.save(); x.translate(cx, cy); x.scale(1, sy);
        const gg = x.createRadialGradient(0, 0, 0, 0, 0, r);
        gg.addColorStop(0, `rgba(${rgb},${a})`); gg.addColorStop(0.45, `rgba(${rgb},${a * 0.38})`); gg.addColorStop(1, `rgba(${rgb},0)`);
        x.fillStyle = gg; x.fillRect(-r, -r, 2 * r, 2 * r); x.restore();
      };
      x.globalCompositeOperation = 'lighter';
      glow(300, 560, 620, wt(255, 138, 58), 0.34);      // practical lamp, camera left
      glow(820, 40, 720, wt(255, 176, 110), 0.10);      // ceiling spill
      glow(1680, 360, 660, ct(28, 196, 190), 0.24);     // LED wall, camera right
      glow(1400, 1020, 560, ct(18, 120, 138), 0.12);
      x.filter = 'blur(14px)';
      // bookshelf with warm under-shelf strips
      [[250, 0.5], [470, 0.44], [690, 0.34]].forEach(([y, a], i) => {
        let bx = 30;
        while (bx < 500 - i * 40) {
          const bw = S.rnd(18, 44), bh = S.rnd(64, 118);
          const cr = S.rnd(90, 160) | 0, cg = S.rnd(52, 92) | 0, cb = S.rnd(34, 60) | 0;
          x.fillStyle = `rgba(${wt(cr, cg, cb)},${S.rnd(0.16, 0.34).toFixed(2)})`;
          x.fillRect(bx, y - bh - 4, bw, bh); bx += bw + S.rnd(4, 16);
        }
        x.fillStyle = `rgba(${wt(255, 172, 92)},${a})`; x.fillRect(10, y, 540 - i * 40, 9);
      });
      // table lamp shade
      x.filter = 'blur(20px)';
      x.fillStyle = `rgba(${wt(255, 186, 118)},0.85)`;
      x.beginPath(); x.moveTo(250, 560); x.lineTo(350, 560); x.lineTo(392, 672); x.lineTo(208, 672); x.closePath(); x.fill();
      // acoustic panels + vertical LED strip, camera right
      x.fillStyle = `rgba(${ct(40, 128, 132)},0.16)`; x.fillRect(1400, 80, 130, 720); x.fillRect(1566, 80, 130, 720);
      x.filter = 'blur(10px)';
      x.fillStyle = `rgba(${ct(90, 240, 228)},0.55)`; x.fillRect(1790, 40, 12, 860);
      x.filter = 'none';
      x.globalCompositeOperation = 'source-over';
      g = x.createLinearGradient(0, -OY, 0, H + OY);
      g.addColorStop(0, 'rgba(0,0,0,.5)'); g.addColorStop(0.3, 'rgba(0,0,0,0)'); g.addColorStop(0.72, 'rgba(0,0,0,.12)'); g.addColorStop(1, 'rgba(0,0,0,.62)');
      x.fillStyle = g; x.fillRect(-OX, -OY, FW, FH);
    }

    // bokeh sprites (pre-rendered discs with a faint bright rim, like real lens bokeh)
    const sprite = (r, rgb) => {
      const s = Math.ceil(r * 2 + 10), c = cnv(s, s), x = c.getContext('2d'), m = s / 2;
      const g = x.createRadialGradient(m, m, 0, m, m, r);
      g.addColorStop(0, `rgba(${rgb},0.46)`); g.addColorStop(0.6, `rgba(${rgb},0.55)`); g.addColorStop(0.86, `rgba(${rgb},0.8)`);
      g.addColorStop(0.95, `rgba(${rgb},0.6)`); g.addColorStop(1, `rgba(${rgb},0)`);
      x.filter = 'blur(1.4px)'; x.fillStyle = g; x.beginPath(); x.arc(m, m, r, 0, Math.PI * 2); x.fill();
      return c;
    };
    const WARM = [wt(255, 172, 88), wt(255, 140, 62), wt(255, 206, 142), wt(255, 120, 72)], TEAL = [ct(60, 220, 210), ct(40, 184, 204), ct(124, 236, 228)];
    const bokeh = [];
    const addB = (x, y, r, rgb, a, depth) => bokeh.push({ spr: sprite(r, rgb), x, y, a, depth, fq: S.rnd(0.35, 0.9), ph: S.rnd(0, 100), bob: S.rnd(2, 6) });
    for (let i = 0; i < 15; i++) { // string lights across the back wall
      const u = i / 14;
      addB(lerp(40, 1010, u) + S.rnd(-10, 10), lerp(150, 104, u) + 472 * u * (1 - u) + S.rnd(-6, 6), S.rnd(15, 21), WARM[i % 3 === 0 ? 2 : 0], S.rnd(0.75, 0.95), 0.3);
    }
    for (let i = 0; i < 26; i++) { // far scatter
      const warm = S.rand() < 0.55;
      addB(warm ? S.rnd(-80, 1150) : S.rnd(900, 2000), -40 + 860 * Math.pow(S.rand(), 1.35), S.rnd(14, 42), (warm ? WARM : TEAL)[(S.rand() * 3) | 0], S.rnd(0.3, 0.7), 0.38);
    }
    for (let i = 0; i < 9; i++) { // mid, larger and fainter
      const warm = i % 2 === 0;
      addB(warm ? S.rnd(0, 900) : S.rnd(1100, 1950), S.rnd(80, 760), S.rnd(56, 104), (warm ? WARM : TEAL)[i % 3], S.rnd(0.12, 0.26), 0.62);
    }
    const bkC = put(foot, cnv(FW, FH), -OX, -OY); bkC.style.mixBlendMode = 'screen';
    const bkx = bkC.getContext('2d');

    // speaker silhouette: dark fill, warm/cool rim light, light wrap, soft focus
    const X0 = 1030;
    const headShape = (x, style) => {
      x.fillStyle = x.strokeStyle = style;
      x.beginPath();
      x.moveTo(X0 - 6, 176);
      x.bezierCurveTo(X0 + 18, 166, X0 + 44, 172, X0 + 58, 180);     // tousled hair line
      x.bezierCurveTo(X0 + 96, 186, X0 + 126, 222, X0 + 128, 292);
      x.bezierCurveTo(X0 + 130, 336, X0 + 122, 372, X0 + 115, 404);
      x.bezierCurveTo(X0 + 106, 448, X0 + 72, 492, X0 + 26, 506);
      x.quadraticCurveTo(X0, 512, X0 - 26, 506);
      x.bezierCurveTo(X0 - 72, 492, X0 - 106, 448, X0 - 115, 404);
      x.bezierCurveTo(X0 - 122, 372, X0 - 130, 336, X0 - 128, 292);
      x.bezierCurveTo(X0 - 128, 236, X0 - 104, 196, X0 - 62, 184);
      x.bezierCurveTo(X0 - 44, 170, X0 - 22, 184, X0 - 6, 176);
      x.closePath(); x.fill();
      x.beginPath(); x.ellipse(X0 + 134, 352, 36, 62, -0.06, 0, Math.PI * 2); x.fill();   // headphone cups
      x.beginPath(); x.ellipse(X0 - 134, 352, 36, 62, 0.06, 0, Math.PI * 2); x.fill();
      x.lineWidth = 20; x.lineCap = 'round';
      x.beginPath(); x.arc(X0, 322, 150, Math.PI * 1.08, Math.PI * 1.92); x.stroke();      // headband
    };
    const bodyShape = (x, style) => {
      x.fillStyle = style; x.beginPath();
      x.moveTo(X0 - 62, 430); x.lineTo(X0 + 62, 430);
      x.bezierCurveTo(X0 + 64, 500, X0 + 72, 545, X0 + 104, 572);
      x.bezierCurveTo(X0 + 176, 604, X0 + 270, 616, X0 + 322, 654);
      x.bezierCurveTo(X0 + 376, 694, X0 + 392, 790, X0 + 396, 890);
      x.lineTo(X0 + 414, 1300); x.lineTo(X0 - 414, 1300); x.lineTo(X0 - 396, 890);
      x.bezierCurveTo(X0 - 392, 790, X0 - 376, 694, X0 - 322, 654);
      x.bezierCurveTo(X0 - 270, 616, X0 - 176, 604, X0 - 104, 572);
      x.bezierCurveTo(X0 - 72, 545, X0 - 64, 500, X0 - 62, 430);
      x.closePath(); x.fill();
    };
    const MIC = { x: 902, y: 462, a: -0.24 };
    const micShape = (x, style) => {
      x.fillStyle = x.strokeStyle = style;
      x.save(); x.translate(MIC.x, MIC.y); x.rotate(MIC.a);
      x.beginPath(); x.moveTo(-100, -50); x.lineTo(-46, -50); x.arc(-46, 0, 50, -Math.PI / 2, Math.PI / 2); x.lineTo(-100, 50); x.closePath(); x.fill();
      x.beginPath(); x.moveTo(-100, -44); x.lineTo(-262, -39); x.quadraticCurveTo(-276, -39, -276, -25); x.lineTo(-276, 25);
      x.quadraticCurveTo(-276, 39, -262, 39); x.lineTo(-100, 44); x.closePath(); x.fill();
      x.fillRect(-196, 30, 30, 50);
      x.restore();
      const mx = MIC.x + Math.cos(MIC.a) * -181 - Math.sin(MIC.a) * 80, my = MIC.y + Math.sin(MIC.a) * -181 + Math.cos(MIC.a) * 80;
      x.lineWidth = 20; x.lineCap = 'round'; x.lineJoin = 'round';
      x.beginPath(); x.moveTo(mx, my); x.lineTo(mx - 110, my + 250); x.lineTo(mx - 170, my + 760); x.stroke();
    };
    // Backlight model: a rim band = shape minus itself shifted away from the light, softened, and
    // faded down the body (light falls on top surfaces); plus light wrap outside the edge and a
    // little bounce fill inside, then the whole plate is defocused like the rest of the footage.
    const renderSil = (shape, bx, by, bw, bh, o) => {
      const mk = () => { const c = cnv(bw, bh), x = c.getContext('2d'); x.translate(-bx, -by); return [c, x]; };
      const crescent = (dx, dy, col) => {
        const [c, x] = mk(); shape(x, col); x.globalCompositeOperation = 'destination-out'; x.translate(dx, dy); shape(x, '#000');
        x.setTransform(1, 0, 0, 1, -bx, -by); x.globalCompositeOperation = 'destination-in';
        const g = x.createLinearGradient(0, o.fall[0], 0, o.fall[1]); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, `rgba(0,0,0,${o.fall[2]})`);
        x.fillStyle = g; x.fillRect(bx, by, bw, bh);
        return c;
      };
      const warm = crescent(o.wd[0], o.wd[1], `rgb(${wt(255, 164, 86)})`), teal = crescent(o.td[0], o.td[1], `rgb(${ct(80, 212, 206)})`);
      const [c, x] = mk();
      x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'lighter'; x.filter = `blur(${o.halo}px)`;
      x.globalAlpha = o.hw; x.drawImage(warm, 0, 0); x.globalAlpha = o.ht; x.drawImage(teal, 0, 0); x.restore();
      shape(x, o.fill(x));
      x.save(); x.globalCompositeOperation = 'source-atop';
      if (o.bounce) o.bounce(x);
      x.setTransform(1, 0, 0, 1, 0, 0); x.filter = `blur(${o.rb}px)`;
      x.globalAlpha = o.rw; x.drawImage(warm, 0, 0); x.globalAlpha = o.rt; x.drawImage(teal, 0, 0);
      x.filter = `blur(${o.rb * 0.35}px)`; x.globalAlpha = o.rw * 0.5; x.drawImage(warm, 0, 0); x.restore();
      const out = cnv(bw, bh), ox = out.getContext('2d'); ox.filter = `blur(${o.blur}px)`; ox.drawImage(c, 0, 0);
      return out;
    };
    const soft = (x, cx, cy, r, rgb, a) => { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); x.fillStyle = g; x.fillRect(cx - r, cy - r, 2 * r, 2 * r); };
    const BODY = [X0 - 480, 390, 960, 930], HEAD = [X0 - 210, 120, 420, 430], MICB = [500, 330, 480, 1000];
    const bodyC = put(foot, renderSil(bodyShape, ...BODY, {
      wd: [30, 26], td: [-26, 24], fall: [560, 900, 0.08], halo: 34, hw: 0.42, ht: 0.3, rb: 9, rw: 0.85, rt: 0.55, blur: 7,
      fill: (x) => { const g = x.createLinearGradient(0, 560, 0, 1100); g.addColorStop(0, '#1b140f'); g.addColorStop(1, '#080707'); return g; },
      bounce: (x) => { soft(x, X0 - 300, 700, 260, wt(255, 150, 80), 0.10); soft(x, X0 + 320, 700, 240, ct(60, 190, 190), 0.07); soft(x, X0, 640, 200, wt(255, 200, 160), 0.035); },
    }), BODY[0], BODY[1]);
    const headC = put(foot, renderSil(headShape, ...HEAD, {
      wd: [20, 20], td: [-18, 18], fall: [200, 500, 0.35], halo: 28, hw: 0.5, ht: 0.34, rb: 6, rw: 0.95, rt: 0.6, blur: 6,
      fill: (x) => { const g = x.createRadialGradient(X0 - 22, 380, 10, X0 - 10, 360, 190); g.addColorStop(0, '#2a1d16'); g.addColorStop(1, '#0f0c0b'); return g; },
      bounce: (x) => { soft(x, X0 - 70, 400, 110, wt(255, 160, 100), 0.07); },
    }), HEAD[0], HEAD[1]);
    headC.style.transformOrigin = `${X0 - HEAD[0]}px ${480 - HEAD[1]}px`;   // neck pivot for nods
    bodyC.style.transformOrigin = `${X0 - BODY[0]}px ${1080 - BODY[1]}px`;  // breathing from the frame bottom
    const micC = put(foot, renderSil(micShape, ...MICB, {
      wd: [12, 16], td: [-10, 12], fall: [400, 900, 0.1], halo: 22, hw: 0.4, ht: 0.18, rb: 5, rw: 0.85, rt: 0.3, blur: 9,
      fill: () => '#0c0a0a',
    }), MICB[0], MICB[1]);

    // near, out-of-focus foreground bokeh
    const nearC = put(foot, cnv(FW, FH), -OX, -OY); nearC.style.mixBlendMode = 'screen';
    {
      const x = nearC.getContext('2d'); x.globalCompositeOperation = 'lighter';
      [[150, 980, 230, WARM[1], 0.5], [1790, 120, 210, TEAL[0], 0.42], [1760, 940, 260, TEAL[1], 0.36], [430, 40, 170, WARM[0], 0.34], [60, 520, 150, WARM[2], 0.28]]
        .forEach(([cx, cy, r, rgb, a]) => { const s = sprite(r, rgb); x.globalAlpha = a * 0.3; x.drawImage(s, cx + OX - s.width / 2, cy + OY - s.height / 2); });
    }

    // camera: opener settle, slow push, anticipation pull-back, punch-ins on the hit words and the slams
    const PUNCH = HITS.map((t) => [t, 0.12]).concat(SL.map((s, k) => [s.t, k === NSL - 1 ? 0.13 : 0.10]));
    const PUSH1 = r4(S0 - 0.1), PULL0 = r4(S0 - 0.26);
    const PIV = [1030, 380];
    S.onFrame((t) => {
      let z = 1 + 0.06 * (1 - expoOut(norm(t, 0, 1.1)));
      z *= 1 + 0.035 * sineIO(norm(t, 0.8, PUSH1));
      if (t < S0) z *= 1 - 0.035 * p2out(norm(t, PULL0, S0));
      else z *= 1.06 * (1 + 0.03 * sineIO(norm(t, S0, D)));
      for (const [tp, amp] of PUNCH) if (t >= tp) z *= 1 + amp * (1 - p2out(norm(t, tp, tp + 0.4)));
      S.cam.style.transform = `translate(${PIV[0]}px,${PIV[1]}px) scale(${z.toFixed(4)}) translate(${-PIV[0]}px,${-PIV[1]}px)`;
      if (!SHOWFOOT) return;

      // camera truck + handheld micro-motion, applied per layer by depth (parallax)
      const cx = 40 * (sineIO(t / 8) - 0.5) + 2.4 * S.noise(t * 0.8, 3) + 0.7 * S.noise(t * 3.1, 4);
      const cy = 6 * Math.sin(t * 0.5) + 1.8 * S.noise(t * 0.7, 5) + 0.6 * S.noise(t * 2.9, 6);
      const off = (d) => `translate(${(-cx * d).toFixed(2)}px,${(-cy * d).toFixed(2)}px)`;
      wallC.style.transform = off(0.3);
      nearC.style.transform = off(1.8);
      micC.style.transform = off(1.15);
      const e = speech(t - 0.05);
      const breath = Math.sin(t * 1.7);
      bodyC.style.transform = off(1) + ` scaleY(${(1 + 0.0035 * breath).toFixed(5)})`;
      const nod = -1.3 * e * (0.6 + 0.4 * S.noise(t * 2.2, 7)) + 0.6 * S.noise(t * 0.45, 8);
      headC.style.transform = off(1) + ` translateY(${(2.2 * e - 1.2 * breath).toFixed(2)}px) rotate(${nod.toFixed(3)}deg)`;

      bkx.setTransform(1, 0, 0, 1, 0, 0); bkx.clearRect(0, 0, FW, FH); bkx.globalCompositeOperation = 'lighter';
      for (const b of bokeh) {
        const px = b.x + OX - cx * b.depth + b.bob * Math.sin(t * b.fq + b.ph), py = b.y + OY - cy * b.depth + b.bob * 0.6 * Math.cos(t * b.fq * 0.8 + b.ph);
        bkx.globalAlpha = Math.max(0, b.a * (0.82 + 0.18 * S.noise(t * b.fq * 1.4 + b.ph, 9)));
        bkx.drawImage(b.spr, px - b.spr.width / 2, py - b.spr.height / 2);
      }
    });

    /* ============================ SCREEN-SPACE LAYERS ============================ */
    const HUD = S.hud;
    const desat = S.el('div', { style: 'position:absolute;left:-80px;top:-80px;width:2080px;height:1240px;background:#808080;mix-blend-mode:saturation;opacity:0;' }, HUD);
    const dim = S.el('div', { style: 'position:absolute;left:-80px;top:-80px;width:2080px;height:1240px;background:#060404;opacity:0;' }, HUD);
    const vig = S.el('div', { style: 'position:absolute;left:-80px;top:-80px;width:2080px;height:1240px;background:radial-gradient(ellipse 72% 70% at 51.5% 45%, rgba(0,0,0,0) 46%, rgba(0,0,0,.74) 100%);' }, HUD);
    const pulseRgb = shift(hexRgb(RED), [255, 59, 59], [255, 40, 40]);
    const redPulse = S.el('div', { style: `position:absolute;left:-80px;top:-80px;width:2080px;height:1240px;background:radial-gradient(ellipse 70% 70% at 50% 60%, rgba(${pulseRgb},0) 40%, rgba(${pulseRgb},.55) 100%);opacity:0;` }, HUD);
    const flash = S.el('div', { style: 'position:absolute;left:-80px;top:-80px;width:2080px;height:1240px;background:#fff;opacity:0;' }, HUD);
    if (!SHOWFOOT) desat.style.display = 'none';        // the saturation blend needs footage under it (it greys an empty frame)
    if (S.alpha) vig.style.display = 'none';            // overlays keep only the dim, pulse and flash

    /* ---------------- speech meter (audiogram bars, driven by the speech model) ---------------- */
    const WN = 44, WBW = 6, WGAP = 5, WHM = 64;
    const wvC = put(HUD, cnv(WN * (WBW + WGAP) + 30, WHM + 20), 0, 0);
    wvC.style.left = `${960 - wvC.width / 2}px`; wvC.style.top = `${962 - wvC.height / 2}px`;
    wvC.style.filter = 'drop-shadow(0 2px 6px rgba(0,0,0,.65))';
    const wx = wvC.getContext('2d');
    const prof = Array.from({ length: WN }, (_, i) => { const u = (i - (WN - 1) / 2) / (WN * 0.3); return 0.28 + 0.72 * Math.exp(-u * u); });
    // the meter takes a keyword's colour while its page is up, and a coloured slam's colour for half a second
    const TINT = CAPS.filter((w) => w.kw === 'hit' || w.kw === 'win').map((w) => [w.t, r4(w.pg.t1 - w.pg.exit), w.kw === 'hit' ? RED : GRN])
      .concat(SL.filter((s) => s.kw).map((s) => [s.t, r4(s.t + 0.5), s.kw === 'hit' ? RED : s.kw === 'win' ? GRN : YEL]));
    const METER = `rgba(${rgb(WHITE)},0.88)`;
    const meterCol = (t) => { for (const [a, b, c] of TINT) if (t >= a && t < b) return c; return METER; };
    const MF0 = NSL ? r4(SL[NSL - 1].t + 0.5) : r4(D - 0.5), MF1 = NSL ? r4(SL[NSL - 1].t + 0.75) : r4(D - 0.25);
    S.onFrame((t) => {
      const e = speech(t);
      wx.clearRect(0, 0, wvC.width, wvC.height); wx.fillStyle = meterCol(t);
      const on = norm(t, 0.05, 0.3) * (1 - p2in(norm(t, MF0, MF1)));
      if (on <= 0) return;
      for (let i = 0; i < WN; i++) {
        const n = Math.abs(S.noise(t * 11 + i * 0.83, 40)) * 0.65 + Math.abs(S.noise(t * 23 + i * 1.7, 41)) * 0.35;
        const h = on * (3 + (WHM - 3) * e * prof[i] * (0.32 + 0.68 * n) + 1.5 * Math.abs(S.noise(t * 1.3 + i, 42)));
        if (h < 0.5) continue;
        wx.beginPath(); wx.roundRect(15 + i * (WBW + WGAP), wvC.height / 2 - h / 2, WBW, h, 2.5); wx.fill();
      }
    });

    /* ---------------- STYLE A: word-synced captions ---------------- */
    const CAP_Y = 700, LINE_H = 126, GAP = 36, MAXW = 1600;
    const ring = (arr, R, n, dy = 0) => { for (let i = 0; i < n; i++) { const th = (i / n) * Math.PI * 2 + 0.13; arr.push(`${(Math.cos(th) * R).toFixed(2)}px ${(Math.sin(th) * R + dy).toFixed(2)}px 0 #000`); } return arr; };
    const OUTLINE = ring(ring(ring([], 7.5, 28), 4.2, 14), 7.5, 18, 5.5).join(',');
    const SOFT = '0 12px 26px rgba(0,0,0,.55)';
    const shadowFor = (kw) => OUTLINE + (kw === 'win' ? `, 0 0 22px rgba(${rgb(GRN)},.9), 0 0 50px rgba(${rgb(GRN)},.5)` : kw === 'hit' ? `, 0 0 34px rgba(${rgb(RED)},.45)` : '') + ', ' + SOFT;
    const FONT = 'font:900 96px/1 "Montserrat",sans-serif;letter-spacing:-0.012em;white-space:nowrap;';
    const capL = S.el('div', { style: 'position:absolute;left:0;top:0;width:1920px;height:1080px;' }, HUD);
    const roleOn = (kw) => (kw === 'hit' ? RED : kw === 'win' ? GRN : YEL), roleOff = (kw) => (kw === 'hit' ? RED : kw === 'win' ? GRN : WHITE);
    const ICONS = {
      arrow: ['M10 80 L38 50 L56 64 L90 28', 'M64 24 L94 22 L92 52'],
      check: ['M14 50 L40 76', 'M40 76 L92 20'],
    };
    const iconEl = (parent, name, col) => {
      const d = S.el('div', { style: `position:absolute;left:0;top:0;width:128px;height:118px;transform-origin:30% 70%;filter:drop-shadow(0 0 12px rgba(${rgb(col)},.6)) drop-shadow(0 8px 10px rgba(0,0,0,.5));` }, parent);
      const sv = S.s('svg', { width: 128, height: 118, viewBox: '0 0 104 96' }, d); sv.style.overflow = 'visible';
      const mkP = (dd, c, w) => S.s('path', { d: dd, stroke: c, 'stroke-width': w, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, sv);
      const [LINE, HEADP] = ICONS[name] || ICONS.arrow;
      const parts = [mkP(LINE, '#000', 28), mkP(HEADP, '#000', 28), mkP(LINE, col, 13), mkP(HEADP, col, 13)];
      return { d, sv, parts };
    };
    const ICON_ITEMS = [];
    const widthOf = (ln, gap) => ln.reduce((a, it) => a + it.wd, 0) + gap * (ln.length - 1);
    PAGES.forEach((pg) => {
      // (measured while visible; the frame hook hides pages outside their window)
      pg.el = S.el('div', { style: `position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:960px ${CAP_Y}px;` }, capL);
      pg.items = [];
      pg.lines = pg.lines.map((ws) => {
        const ln = [];
        ws.forEach((w) => { ln.push(w); if (w.iconName) ln.push({ isIcon: true, name: w.iconName, t: r4(w.t + 0.07), col: roleOn(w.kw) }); });
        return ln;
      });
      pg.lines.forEach((ln) => {
        ln.forEach((it) => {
          it.rot0 = S.rnd(-3.5, 3.5);
          if (it.isIcon) { it.ic = iconEl(pg.el, it.name, it.col); it.el = it.ic.d; it.wd = 128; it.ht = 118; it.rot0 = -22; ICON_ITEMS.push(it); }
          else { it.el = S.el('div', { text: it.txt, style: FONT + `position:absolute;left:0;top:0;color:${WHITE};text-shadow:${shadowFor(it.kw)};transform-origin:50% 52%;` }, pg.el); it.wd = it.el.offsetWidth; it.ht = it.el.offsetHeight; }
          pg.items.push(it);
        });
      });
      // auto-fit: a line wider than MAXW breaks once at its most balanced point (up to 3 lines), then the page scales down
      for (let li = 0; li < pg.lines.length && pg.lines.length < 3; li++) {
        const ln = pg.lines[li];
        if (widthOf(ln, GAP) <= MAXW || ln.filter((it) => !it.isIcon).length < 2) continue;
        let best = -1, bestW = Infinity;
        for (let k = 1; k < ln.length; k++) { if (ln[k].isIcon) continue; const w = Math.max(widthOf(ln.slice(0, k), GAP), widthOf(ln.slice(k), GAP)); if (w < bestW) { bestW = w; best = k; } }
        if (best > 0) { pg.lines.splice(li, 1, ln.slice(0, best), ln.slice(best)); li++; }
      }
      const widest = Math.max(...pg.lines.map((ln) => widthOf(ln, GAP)));
      pg.fit = widest > MAXW ? MAXW / widest : 1;
      if (pg.fit < 1) {
        pg.items.forEach((it) => {
          if (it.isIcon) { it.wd = 128 * pg.fit; it.ht = 118 * pg.fit; it.el.style.width = it.wd + 'px'; it.el.style.height = it.ht + 'px'; it.ic.sv.setAttribute('width', it.wd); it.ic.sv.setAttribute('height', it.ht); }
          else { it.el.style.fontSize = 96 * pg.fit + 'px'; it.wd = it.el.offsetWidth; it.ht = it.el.offsetHeight; }
        });
      }
      pg.gap = GAP * pg.fit;
      const nL = pg.lines.length, lh = LINE_H * pg.fit;
      pg.lines.forEach((ln, li) => { ln.y = CAP_Y + (li - (nL - 1) / 2) * lh; ln.forEach((it) => { it.line = ln; }); });
    });
    // colour/scale keyframes: a word lights up on its onset and settles when the next word starts;
    // a struck word greys out when its strike lands, and the page's "keep" word lights up again
    PAGES.forEach((pg) => {
      const words = pg.items.filter((i) => !i.isIcon);
      words.forEach((w, k) => {
        w.tNext = k + 1 < words.length ? words[k + 1].t : pg.t1;
        if (w.kw === 'strike') w.strikeT = typeof w.strikeAt === 'number' ? w.strikeAt : r4(Math.max(w.t + 0.12, Math.min(w.t + 0.4, pg.t1 - 0.25)));
      });
      words.forEach((w) => {
        const act = w.kw === 'hit' ? 1.16 : 1.12;
        w.k = [{ t: w.t, s: act, c: roleOn(w.kw) }];
        if (w.kw === 'strike') { if (w.tNext < w.strikeT) w.k.push({ t: w.tNext, s: 1, c: roleOff(w.kw) }); w.k.push({ t: r4(w.strikeT + 0.01), s: 0.96, c: GREY }); }
        else w.k.push({ t: w.tNext, s: 1, c: roleOff(w.kw) });
        if (w.kw === 'keep') { const st = words.find((o) => o.kw === 'strike' && o.strikeT > w.t); if (st) w.k.push({ t: r4(st.strikeT + 0.05), s: 1.1, c: YEL }); }
        w.k.sort((a, b) => a.t - b.t);
      });
    });
    const STRIKES = CAPS.filter((w) => w.kw === 'strike');
    // icons draw on as they pop
    ICON_ITEMS.forEach((it) => {
      const tH = r4(it.t + 0.13), p = it.ic.parts;
      tl.fromTo(p[1], { opacity: 0 }, { opacity: 1, duration: 0.01 }, tH);
      tl.fromTo(p[3], { opacity: 0 }, { opacity: 1, duration: 0.01 }, tH);
      S.draw([p[0], p[2]], it.t, 0.2, { ease: 'power2.out' });
      S.draw([p[1], p[3]], tH, 0.14, { ease: 'power2.out' });
    });

    // strike-through across each struck word (follows the word when it shares its line)
    // A plain bordered div: any shadow on the strike (SVG stroke or box-shadow) made Chrome
    // composite a dark band into the text-shadowed word underneath.
    STRIKES.forEach((w) => {
      const pg = w.pg, L = w.wd * 0.96 + 70;
      w.strikeL = L; w.solo = w.line.length === 1;
      w.strikeEl = S.el('div', { style: `position:absolute;left:${(960 - L / 2).toFixed(1)}px;top:${(w.line.y - 7).toFixed(1)}px;width:${L.toFixed(1)}px;height:${Math.round(14 * pg.fit)}px;border-radius:7px;background:${RED};transform-origin:0 50%;` }, pg.el);
      tl.fromTo(w.strikeEl, { scaleX: 0, rotation: -1.3 }, { scaleX: 1, rotation: -1.3, duration: 0.2, ease: 'power2.out' }, w.strikeT);
    });

    const target = (it, t) => {
      let s = it.k[0].s, c = it.k[0].c;
      for (let i = 1; i < it.k.length; i++) { const f = it.k[i]; if (t < f.t) break; s = lerp(it.k[i - 1].s, f.s, p3out(norm(t, f.t, f.t + 0.16))); c = f.c; }
      return [s, c];
    };
    const jitter = (t, t0, dur, amp, seed) => { const u = (t - t0) / dur; if (u < 0 || u > 1) return [0, 0, 0]; const d = (1 - u) * (1 - u), k = (t - t0) * 34; return [amp * d * S.noise(k, seed), amp * 0.7 * d * S.noise(k, seed + 1), amp * 0.3 * d * S.noise(k, seed + 2)]; };
    S.onFrame((t) => {
      for (const pg of PAGES) {
        const vis = t >= pg.t0 && t < pg.t1;
        if (vis !== pg._vis) { pg.el.style.display = vis ? '' : 'none'; pg._vis = vis; }
        if (!vis) continue;
        const ex = norm(t, pg.t1 - pg.exit, pg.t1);
        pg.el.style.opacity = (1 - ex).toFixed(3);
        pg.el.style.transform = ex > 0 ? `translateY(${(10 * ex).toFixed(1)}px) scale(${(1 - 0.12 * p2in(ex)).toFixed(4)})` : '';
        for (const ln of pg.lines) {
          let total = pg.gap * (ln.length - 1); const st = [];
          for (const it of ln) {
            const a = norm(t, it.t, it.t + 0.24);
            let s = 1, slot = 1, op = 0, dx = 0, dy = 0, rot = 0, col = null;
            if (t >= it.t) {
              const [tg, c] = it.isIcon ? [1, null] : target(it, t);
              s = tg * lerp(it.kw === 'hit' ? 0.3 : it.isIcon ? 0.15 : 0.5, 1, (it.kw === 'hit' ? popHard : popEase)(a));
              slot = Math.max(lerp(1, tg, p2out(a)), s);   // an overshooting word shoves its neighbours instead of overlapping them
              op = 1;   // hard cut on the onset frame; the scale pop carries the motion
              dy = 16 * (1 - expoOut(a));
              rot = it.rot0 * (1 - expoOut(a));
              col = c;
              if (it.kw === 'hit') { const j = jitter(t, it.t, 0.46, 8, 31); dx += j[0]; dy += j[1]; rot += j[2] * 0.35; }
              if (it.kw === 'strike') { const j = jitter(t, r4(it.strikeT + 0.01), 0.3, 7, 41); dx += j[0]; dy += j[1]; }
              if (it.isIcon) dy += 3 * Math.sin((t - it.t) * 5.5) * norm(t, it.t + 0.3, it.t + 0.6);
            }
            st.push({ it, s, slot, op, dx, dy, rot, col }); total += it.wd * slot;
          }
          let x = 960 - total / 2;
          for (const q of st) {
            const it = q.it, cx = x + (it.wd * q.slot) / 2; x += it.wd * q.slot + pg.gap;
            it.el.style.opacity = q.op.toFixed(3);
            it.el.style.transform = `translate(${(cx - it.wd / 2 + q.dx).toFixed(2)}px,${(ln.y - it.ht / 2 + q.dy).toFixed(2)}px) scale(${q.s.toFixed(4)}) rotate(${q.rot.toFixed(2)}deg)`;
            if (q.col && q.col !== it._c) { it.el.style.color = q.col; it._c = q.col; }
            if (it.strikeEl && !it.solo) it.strikeEl.style.left = `${(cx - it.strikeL / 2).toFixed(1)}px`;
          }
        }
      }
    });

    /* ---------------- STYLE B: giant-word pattern interrupt ---------------- */
    const bigL = S.el('div', { style: 'position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:960px 540px;' }, HUD);
    const TA = { 'font-family': 'Montserrat', 'font-weight': 900, 'text-anchor': 'middle' };
    const measure = (txt, fs) => {
      const sv = S.svg(bigL); const tx = S.s('text', Object.assign({ x: 0, y: 0, 'font-size': fs, 'letter-spacing': (-0.02 * fs).toFixed(2), text: txt }, TA), sv);
      const w = tx.getComputedTextLength() + 0.02 * fs; sv.remove(); return w;
    };
    const svgWord = (txt, fs, fill, sw) => {
      const tw = measure(txt, fs), pad = sw + 0.1 * fs, bw = Math.ceil(tw + 2 * pad), bh = Math.ceil(0.7 * fs + 2 * pad);
      const wrap = S.el('div', { style: `position:absolute;left:0;top:0;width:${bw}px;height:${bh}px;` }, bigL);
      const sv = S.s('svg', { width: bw, height: bh, viewBox: `0 0 ${bw} ${bh}` }, wrap); sv.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;';
      const base = pad + 0.7 * fs, a = Object.assign({ 'font-size': fs, 'letter-spacing': (-0.02 * fs).toFixed(2), text: txt, 'stroke-linejoin': 'round' }, TA);
      S.s('text', Object.assign({ x: bw / 2, y: base + 0.045 * fs, fill: '#000', stroke: '#000', 'stroke-width': sw, opacity: 0.6 }, a), sv);
      S.s('text', Object.assign({ x: bw / 2, y: base, fill, stroke: '#000', 'stroke-width': sw, 'paint-order': 'stroke' }, a), sv);
      return { wrap, sv, bw, bh, tw };
    };
    const slamCol = (kw) => (kw === 'accent' ? YEL : kw === 'hit' ? RED : kw === 'win' ? GRN : WHITE);
    const BIG = SL.map((s) => ({ txt: s.txt, t: s.t, col: slamCol(s.kw) }));
    // every row is set to the same width (a justified stack); a stack taller than MAXH scales down as a whole
    const STACK_W = 1000, ROW_GAP = 58, SW = 22, MAXH = 760;
    BIG.forEach((b) => { const w1 = measure(b.txt, 100) / 100; b.fs = STACK_W / w1; b.fsG = Math.min(520, 1560 / w1); b.G = b.fsG / b.fs; b.capH = 0.7 * b.fs; });
    let stackH = BIG.reduce((a, b) => a + b.capH, 0) + ROW_GAP * (NSL - 1);
    if (stackH > MAXH) {
      const k = (MAXH - ROW_GAP * (NSL - 1)) / (stackH - ROW_GAP * (NSL - 1));
      BIG.forEach((b) => { b.fs *= k; b.G = b.fsG / b.fs; b.capH = 0.7 * b.fs; });
      stackH = MAXH;
    }
    let yy = 532 - stackH / 2;
    BIG.forEach((b) => { b.sy = yy + b.capH / 2; yy += b.capH + ROW_GAP; });
    BIG.forEach((b, k) => {
      const o = svgWord(b.txt, b.fs, b.col, SW); b.o = o;
      o.wrap.style.left = `${960 - o.bw / 2}px`; o.wrap.style.top = `${b.sy - o.bh / 2}px`;
      // slam: visible on the impact frame itself, huge and motion-blurred, then snaps into place
      tl.fromTo(o.wrap, { opacity: 0 }, { opacity: 1, duration: 0.001, ease: 'none' }, b.t - 0.001);
      tl.fromTo(o.wrap, { x: 0, y: 540 - b.sy, scale: b.G * 1.6, filter: 'blur(18px)' },
        { x: 0, y: 540 - b.sy, scale: b.G, filter: 'blur(0px)', duration: 0.32, ease: 'expo.out' }, b.t);
      if (k < NSL - 1) {
        tl.to(o.wrap, { opacity: 0, duration: 0.01, ease: 'none' }, BIG[k + 1].t);
        // re-enter as mini-stamps in their stack slots (same language as the slams)
        const tk = SETTLE + k * 0.08;
        tl.set(o.wrap, { y: 0, scale: 1.42, filter: 'blur(10px)' }, SETTLE - 0.05);
        tl.to(o.wrap, { opacity: 1, duration: 0.001, ease: 'none' }, tk - 0.001);
        tl.to(o.wrap, { scale: 1, filter: 'blur(0px)', duration: 0.3, ease: 'expo.out' }, tk);
      } else {
        tl.to(o.wrap, { y: 0, scale: 1, duration: 0.36, ease: 'expo.out' }, SETTLE);
      }
    });
    // flash, dim, desaturation, red pulse, stack float
    const SLAMS = BIG.map((b) => b.t);
    const DIM0 = r4(S0 - 0.24), DES0 = r4(S0 - 0.2), PRE1 = r4(S0 - 0.02), FL0 = r4(SETTLE + 0.32), FL1 = r4(SETTLE + 0.82);
    const PULSE = HITS.map((h) => [h, r4(h + 0.35)]);
    S.onFrame((t) => {
      let f = 0;
      for (const ts of SLAMS) if (t >= ts && t < ts + 0.14) f = 0.22 * (1 - p2out(norm(t, ts, ts + 0.14)));
      flash.style.opacity = f.toFixed(3);
      dim.style.opacity = (!NSL ? 0 : t < S0 ? 0.42 * p2in(norm(t, DIM0, PRE1)) : 0.56).toFixed(3);
      desat.style.opacity = (!NSL ? 0 : t < S0 ? 0.3 * norm(t, DES0, PRE1) : 0.8).toFixed(3);
      let rp = 0;
      for (const [h0, h1] of PULSE) if (t >= h0) rp = 0.36 * (1 - p2out(norm(t, h0, h1)));
      redPulse.style.opacity = rp.toFixed(3);
      const fl = norm(t, FL0, FL1);
      BIG.forEach((b, k) => { b.o.sv.style.transform = t > SETTLE ? `translateY(${(3.5 * fl * Math.sin((t - FL0) * 2.4 + k * 1.1)).toFixed(2)}px)` : ''; });
      bigL.style.transform = t > SETTLE ? `scale(${(1 + 0.022 * sineIO(norm(t, SETTLE, D))).toFixed(4)})` : '';
    });

    /* ---------------- shake (order matters: each shake's noise seed is its index) ---------------- */
    HITS.forEach((t) => S.shake(t, { amp: 9, dur: 0.36, rot: 0.35 }));
    STRIKES.forEach((w) => S.shake(r4(w.strikeT + 0.01), { amp: 4, dur: 0.22, rot: 0.1 }));
    SL.forEach((s, k) => S.shake(s.t, k === NSL - 1 ? { amp: 19, dur: 0.46 } : { amp: 15, dur: 0.4 }));

    /* ---------------- sound: every cue follows the word it belongs to ---------------- */
    S.sfx(0, 'pad', { dur: NSL ? r4(S0 - 0.05) : D, gain: 0.07, notes: P.padNotes, attack: 0.18, release: 0.3, cutoff: 1100 });
    S.sfx(0, 'drone', { dur: D, gain: 0.035, freq: P.droneHz, cutoff: 240, air: 0.45, fade: 0.25 });
    S.sfx(0, 'whoosh', { dur: 0.5, from: 180, to: 1500, gain: 0.16 });
    let nTick = 0;
    CAPS.forEach((w, i) => {
      if (w.kw) return;
      if (i === 0) S.sfx(w.t, 'pop', { gain: 0.28 });                   // the first word pops, the rest tick
      else S.sfx(w.t, 'tick', { gain: 0.05, pitch: 0.48 + (nTick++ % 3) * 0.05 });
    });
    CAPS.forEach((w) => {
      if (w.kw === 'hit') { S.sfx(w.t, 'thud', { gain: 0.6 }); S.sfx(w.t, 'pop', { gain: 0.3, pitch: 0.78 }); }
      if (w.kw === 'win') { S.sfx(w.t, 'pop', { gain: 0.3, pitch: 1.2 }); S.sfx(r4(w.t + 0.02), 'shimmer', { gain: 0.2 }); }
    });
    ICON_ITEMS.forEach((it) => S.sfx(r4(it.t + 0.01), 'blip', { gain: 0.16, pitch: 1.3 }));
    CAPS.forEach((w) => { if (w.kw === 'keep') S.sfx(w.t, 'pop', { gain: 0.28, pitch: 1.05 }); });
    STRIKES.forEach((w) => S.sfx(w.t, 'pop', { gain: 0.26, pitch: 0.92 }));
    STRIKES.forEach((w) => S.sfx(w.strikeT, 'scratch', { gain: 0.42, dur: 0.22 }));
    if (NSL) S.sfx(r4(S0 - 0.3), 'riser', { dur: 0.3, gain: 0.26 });
    const PITCH = [1, 1.18, 1.4, 1.65];
    SL.forEach((s, k) => {
      const last = k === NSL - 1;
      S.sfx(s.t, 'impact', { gain: last ? 0.66 : 0.62, pitch: PITCH[k] });
      S.sfx(s.t, 'boom', last ? { gain: 0.52, dur: 1.8 } : { gain: 0.38, dur: 0.9 });
      if (k === 0) S.sfx(s.t, 'pad', { dur: r4(D - s.t), gain: 0.065, notes: P.slamPadNotes, attack: 0.3, release: 0.7, cutoff: 900 });
    });
    if (NSL) S.sfx(SETTLE, 'swoosh', { gain: 0.32 });
    for (let k = 0; k < NSL - 1; k++) S.sfx(r4(SETTLE + k * 0.08), 'pop', { gain: [0.18, 0.16, 0.14][k], pitch: [0.9, 1.1, 1.3][k] });   // each slam stamps back in

    /* ---------------- retention notes ---------------- */
    const same = (c, d) => String(c).toLowerCase() === d.toLowerCase();
    const WIN0 = CAPS.find((w) => w.kw === 'win');
    if (CAPS.length) S.beat(CAPS[0].t, `Each word lands on its syllable; the active word ${same(YEL, '#FFE14D') ? 'turns yellow' : 'lights up'}`);
    if (HITS.length) S.beat(HITS[0], 'Keyword gets colour, a shake and a punch-in on the footage');
    if (WIN0) S.beat(WIN0.t, `Payoff word ${same(GRN, '#3DFF8A') ? 'goes green' : 'changes colour'}${WIN0.iconName ? ' with an icon' : ''} so it reads at a glance`);
    if (STRIKES.length) S.beat(STRIKES[0].strikeT, 'Strike-through turns the line into a before-and-after');
    if (NSL) S.beat(S0, 'Pattern interrupt: one giant word per beat resets attention');
    if (NSL) S.beat(r4(SL[NSL - 1].t + 0.5), 'Words settle into a quotable stack that doubles as the thumbnail');

    S.grain({ opacity: 0.075 });
  },
});
