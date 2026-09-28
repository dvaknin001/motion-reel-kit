/* True Crime — The Case Board (fictional case)
   A rostrum camera rides a red string across a cork board of clues, pulls out to show the whole board, types
   the last-seen details and slams a stamp. Every word on the board, the photo subjects, the order the string
   visits them and the colours come from the params; the board layout, camera moves and sound are authored.
   Cork, paper fibre and stamp-ink textures are generated once at build time from the seeded RNG; the desk lamp
   is a moving, flickering multiply-blended gradient. */
Reel.style({
  id: 'truecrime-case-board', seed: 'truecrime', order: 3,
  name: 'Case Board',
  transIn: { type: 'glitch', dur: 0.36 },   // how a reel cuts INTO this piece (tools/new-reel.mjs); a reel item's trans overrides it
  niches: {
    primary: ['True crime', 'Cold cases', 'Missing persons'],
    similar: ['Unsolved mysteries', 'Paranormal & UFO', 'Heists & fraud', 'Conspiracy & cover-ups', 'Historical mysteries', 'Mystery podcasts', 'Crime fiction & ARGs'],
  },
  niche: 'True Crime', title: 'The Case Board', duration: 8, poster: 7.6,
  bg: '#0A0604', palette: ['#B3261E', '#ECE3CF', '#1C130C'],
  techniques: ['Rostrum camera rides the string', 'Two-colour typewriter lower third', 'Stamp slam with dust and lamp sway'],
  why: 'The string gives the eye one path to follow, every stop pays off with a new clue, and the stamp poses the question the video promises to answer.',
  facts: 'Fictional case: the case number, Harlow Point, the Harlow Gazette and every date and time are invented for this piece.',
  defaults: {
    caseFile: 'CASE FILE No. 87-1013',
    caseTitle: 'THE HARLOW POINT DISAPPEARANCE',     // the typist pauses before the last word
    newspaper: {
      name: 'THE HARLOW GAZETTE',
      issue: 'VOL. LXII · No. 287',
      date: 'THURSDAY, OCTOBER 15, 1987',
      price: '35¢',
      headline: 'WOMAN VANISHES\nNEAR LIGHTHOUSE',   // "\n" breaks the line
      subhead: 'Search of Harlow Point to resume at dawn',
      photo: 'lighthouse',                           // lighthouse · shore · house · city · none
    },
    photos: [                                        // exactly 3 polaroids: photo1, photo2, photo3
      { type: 'lighthouse', caption: 'HARLOW PT.', mark: '' },
      { type: 'car', caption: 'WHOSE CAR?', mark: '' },
      { type: 'figure', caption: '', mark: 'question' },
    ],
    map: { place: 'HARLOW POINT', water: 'Harlow Bay', mark: 'circle' },
    cards: ['WHO CALLED\nAT 11:40?', 'TIDE\nWAS OUT'],  // index cards: card1 (bottom right), card2 (top right)
    route: ['photo1', 'photo2', 'photo3', 'map'],     // the order the camera rides the string
    links: { newspaper: 'photo1', card1: 'photo3', card2: 'map' },   // strings that snap in on the pull-out
    lowerThird: { label: 'LAST SEEN:', detail: 'OCT 13, 1987 · 11:42 PM', place: 'HARLOW POINT LIGHTHOUSE' },
    stamp: 'UNSOLVED',
    background: '#0A0604',
    colors: {
      accent: '#B3261E', string: '#B0231A', stringLight: '#FF8C7C', marker: '#C22A1F', stamp: '#CC3326',
      caseFile: '#EFE4CC', caseTitle: '#FFF3DC', paper: '#ECE3CF', ink: '#1D1813', grade: '#6B4420',
      lamp: ['#FFF3DE', '#F0CC9C', '#A87448', '#422919', '#120B07'], lampGlow: ['#FFBA6E', '#FFA05A'],
      cork: { base: '#3B2515', flecks: ['#5A3C22', '#6A472A', '#7A5431', '#482E1A', '#86603A', '#33200F', '#94703F'], dark: '#170C05', light: '#B38A54' },
    },
  },
  build(S, P) {
    const tl = S.tl, C = P.colors;
    const RED = C.accent, STAMP = C.stamp, MARK = C.marker, PAPER = C.paper, INK = C.ink, HUDC = C.caseFile;
    const TSLAM = 6.4;

    /* ---------- helpers ---------- */
    const f1 = (v) => (+v).toFixed(1);
    const rot = (x, y, d) => { const a = (d * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c]; };
    const canvasOf = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
    const uid = (n) => S.uid(n);
    const str = (v) => String(v ?? '');
    const esc = (s) => str(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const brk = (s) => esc(s).replace(/\n/g, '<br>');                  // "\n" in a param = line break
    const rgbOf = (hex) => { const n = parseInt(str(hex).slice(1, 7), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
    // natural size of `html` set in `css`, measured off-stage (no transforms; lines break only at <br>)
    const measure = (html, css) => { const m = S.el('div', { html, style: `${css};position:absolute;left:0;top:0;width:max-content;visibility:hidden;white-space:nowrap;` }, S.fx); const r = [m.offsetWidth, m.offsetHeight]; m.remove(); return r; };
    const fit = (el, html, css, px, maxW) => { const [w] = measure(html, css); if (w > maxW) el.style.fontSize = (px * maxW) / w + 'px'; return w; };
    // typewriter duration estimate at `cps` (S.type's jitter averages out; spaces and punctuation are slower)
    const est = (s, cps) => { let a = 0; for (const ch of s) a += (ch === ' ' || ch === ',' || ch === '.' ? 1.6 : 1) / cps; return a; };

    /* ---------- procedural textures (seeded, built once) ---------- */
    const CK = C.cork;
    const CORK = canvasOf(512, 512, (x, w, h) => {
      x.fillStyle = CK.base; x.fillRect(0, 0, w, h);
      const blob = (px, py, r, e, a) => {
        for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) {
          const X = px + ox, Y = py + oy;
          if (X < -8 || X > w + 8 || Y < -8 || Y > h + 8) continue;
          x.beginPath(); x.ellipse(X, Y, r, r * e, a, 0, 6.2832); x.fill();
        }
      };
      const cols = CK.flecks;
      for (let i = 0; i < 15000; i++) {
        x.globalAlpha = S.rnd(0.35, 0.95); x.fillStyle = cols[(S.rand() * cols.length) | 0];
        blob(S.rnd(0, w), S.rnd(0, h), S.rnd(0.7, 2.6) * (S.rand() < 0.08 ? 1.7 : 1), S.rnd(0.45, 1), S.rnd(0, 3.14));
      }
      x.fillStyle = CK.dark;
      for (let i = 0; i < 1900; i++) { x.globalAlpha = S.rnd(0.3, 0.85); blob(S.rnd(0, w), S.rnd(0, h), S.rnd(0.4, 1.3), 1, 0); }
      x.fillStyle = CK.light;
      for (let i = 0; i < 520; i++) { x.globalAlpha = S.rnd(0.18, 0.45); blob(S.rnd(0, w), S.rnd(0, h), S.rnd(0.4, 1.0), 1, 0); }
      x.globalAlpha = 1;
    }).toDataURL('image/png');

    const FIBRE = canvasOf(256, 256, (x, w, h) => {
      const im = x.createImageData(w, h), d = im.data;
      for (let i = 0; i < d.length; i += 4) { const v = 238 + (S.rand() - 0.5) * 20; d[i] = v; d[i + 1] = v - 2; d[i + 2] = v - 7; d[i + 3] = 255; }
      x.putImageData(im, 0, 0);
      x.lineCap = 'round';
      for (let i = 0; i < 260; i++) {
        const px = S.rnd(0, w), py = S.rnd(0, h), L = S.rnd(5, 18), a = S.rnd(0, 6.28), bend = S.rnd(-4, 4);
        x.strokeStyle = S.rand() < 0.55 ? `rgba(130,105,70,${S.rnd(0.08, 0.2).toFixed(2)})` : `rgba(255,255,255,${S.rnd(0.25, 0.5).toFixed(2)})`;
        x.lineWidth = S.rnd(0.4, 1.1);
        for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) {
          const X = px + ox, Y = py + oy;
          if (X < -20 || X > w + 20 || Y < -20 || Y > h + 20) continue;
          x.beginPath(); x.moveTo(X, Y);
          x.quadraticCurveTo(X + (Math.cos(a) * L) / 2 - Math.sin(a) * bend, Y + (Math.sin(a) * L) / 2 + Math.cos(a) * bend, X + Math.cos(a) * L, Y + Math.sin(a) * L);
          x.stroke();
        }
      }
    }).toDataURL('image/png');

    const INKMASK = canvasOf(860, 270, (x, w, h) => {
      x.fillStyle = '#fff'; x.fillRect(0, 0, w, h);
      x.globalCompositeOperation = 'destination-out';
      const g = x.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, 'rgba(0,0,0,.34)'); g.addColorStop(0.45, 'rgba(0,0,0,.04)'); g.addColorStop(1, 'rgba(0,0,0,.16)');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 22; i++) {
        const px = S.rnd(0, w), py = S.rnd(0, h), r = S.rnd(18, 70);
        const rg = x.createRadialGradient(px, py, 0, px, py, r);
        rg.addColorStop(0, `rgba(0,0,0,${S.rnd(0.18, 0.42).toFixed(2)})`); rg.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = rg; x.fillRect(px - r, py - r, 2 * r, 2 * r);
      }
      x.fillStyle = '#000';
      for (let i = 0; i < 1300; i++) { x.globalAlpha = S.rnd(0.4, 1); x.beginPath(); x.arc(S.rnd(0, w), S.rnd(0, h), S.rnd(0.4, 1.5) * (S.rand() < 0.05 ? 2.2 : 1), 0, 6.2832); x.fill(); }
      x.strokeStyle = '#000';
      for (let i = 0; i < 60; i++) {
        x.globalAlpha = S.rnd(0.15, 0.45); x.lineWidth = S.rnd(0.6, 2);
        const px = S.rnd(0, w), py = S.rnd(0, h), L = S.rnd(20, 90);
        x.beginPath(); x.moveTo(px, py); x.lineTo(px + L, py + S.rnd(-3, 3)); x.stroke();
      }
      x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
    }).toDataURL('image/png');

    const PUFF = canvasOf(64, 64, (x) => {
      const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(228,210,180,1)'); g.addColorStop(0.45, 'rgba(228,210,180,.42)'); g.addColorStop(1, 'rgba(228,210,180,0)');
      x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    });

    // jagged polygon for torn paper: returns a CSS polygon() in px
    function torn(w, h, o) {
      const pts = [], J = o.j || 5, step = o.step || 9;
      const edge = (x0, y0, x1, y1, amp, nx, ny) => {
        const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(2, Math.round(L / step));
        for (let i = 0; i < n; i++) { const u = i / n, k = amp ? S.rnd(0, amp) : S.rnd(0, 1.2); pts.push([x0 + (x1 - x0) * u + nx * k, y0 + (y1 - y0) * u + ny * k]); }
      };
      edge(0, 0, w, 0, o.top ?? J, 0, 1);
      edge(w, 0, w, h, o.right ?? J, -1, 0);
      edge(w, h, 0, h, o.bottom ?? J, 0, -1);
      edge(0, h, 0, 0, o.left ?? J, 1, 0);
      return `polygon(${pts.map(([a, b]) => `${f1(a)}px ${f1(b)}px`).join(',')})`;
    }

    /* ---------- world layers ---------- */
    S.root.style.background = P.background;
    const board = S.el('div', { style: `position:absolute;left:-460px;top:-340px;width:2840px;height:1760px;background:${CK.base} url(${CORK}) 0 0/512px 512px;` });
    S.el('div', { style: 'position:absolute;inset:0;background:radial-gradient(22% 20% at 30% 42%, rgba(0,0,0,.2), transparent), radial-gradient(20% 22% at 68% 64%, rgba(0,0,0,.22), transparent), radial-gradient(18% 14% at 52% 26%, rgba(255,200,140,.06), transparent), radial-gradient(16% 18% at 44% 70%, rgba(255,200,140,.05), transparent);' }, board);
    const items = S.layer(S.cam);
    const strSvg = S.svg(S.cam);
    const pinsL = S.layer(S.cam);
    const LX = -700, LY = -500;
    const lightL = S.el('div', { style: `position:absolute;left:${LX}px;top:${LY}px;width:3320px;height:2080px;mix-blend-mode:multiply;pointer-events:none;` });
    const glowL = S.el('div', { style: `position:absolute;left:${LX}px;top:${LY}px;width:3320px;height:2080px;mix-blend-mode:screen;pointer-events:none;` });
    const stampL = S.layer(S.cam);
    const dust = S.canvas(S.cam);
    dust.canvas.style.mixBlendMode = 'screen';

    /* ---------- item geometry (pins are pivots: items hang from them) ----------
       Authored layout. Param names → slots: photo1 A, photo2 B, photo3 C, map D, newspaper N, card1 K1, card2 K2. */
    const IT = {
      N: { cx: 292, cy: 596, rot: -2.5, w: 330, h: 460, pin: [0, -212] },
      A: { cx: 600, cy: 455, rot: -4, w: 300, h: 362, pin: [0, -170] },
      B: { cx: 1150, cy: 345, rot: 3.5, w: 300, h: 362, pin: [0, -170] },
      C: { cx: 1535, cy: 592, rot: -5.5, w: 300, h: 362, pin: [0, -170] },
      D: { cx: 1095, cy: 796, rot: 2.5, w: 410, h: 280, pin: [-24, -124] },
      K1: { cx: 1640, cy: 880, rot: 4, w: 310, h: 190, pin: [0, -78] },
      K2: { cx: 1668, cy: 214, rot: -3.5, w: 290, h: 176, pin: [0, -72] },
    };
    const SLOT = { photo1: 'A', photo2: 'B', photo3: 'C', map: 'D' };
    const FOCUS = { A: [600, 436], B: [1150, 356], C: [1518, 586], D: [1100, 784] };   // camera target per stop
    const PIN = {};
    for (const k in IT) PIN[k] = { x: IT[k].cx + IT[k].pin[0], y: IT[k].cy + IT[k].pin[1] };
    const EL = {};
    function place(el, k) {
      const it = IT[k];
      el.style.left = f1(it.cx - it.w / 2) + 'px'; el.style.top = f1(it.cy - it.h / 2) + 'px';
      el.style.width = it.w + 'px'; el.style.height = it.h + 'px';
      gsap.set(el, { rotation: it.rot, transformOrigin: `${f1(50 + (it.pin[0] / it.w) * 100)}% ${f1(50 + (it.pin[1] / it.h) * 100)}%` });
      EL[k] = el;
      return el;
    }
    const tape = (parent, x, y, w, r) => S.el('div', { style: `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:26px;background:rgba(226,214,176,.78);transform:rotate(${r}deg);box-shadow:0 1px 2px rgba(0,0,0,.25);clip-path:${torn(w, 26, { top: 0.8, bottom: 0.8, left: 3, right: 3, step: 4 })};` }, parent);

    // the string route (4 stops) and the pull-out links; anything invalid falls back to the authored order
    const route = (Array.isArray(P.route) ? P.route : []).map((s) => SLOT[s]);
    const ROUTE = route.length === 4 && new Set(route).size === 4 && route.every(Boolean) ? route : ['A', 'B', 'C', 'D'];
    const LN = P.links || {};
    const LINK = { N: SLOT[LN.newspaper] || 'A', K1: SLOT[LN.card1] || 'C', K2: SLOT[LN.card2] || 'D' };

    /* ---------- red marker marks, drawn on after an item's pin lands ----------
       question · circle · cross on a photo (264 × 264 space); circle · cross · question on the map (410 × 280) */
    const loopPath = (cx, cy, rx0, ry0, tilt) => {
      let d = '';
      for (let i = 0; i <= 64; i++) {                             // hand-drawn loop, slightly more than one turn
        const th = -0.7 + (i / 64) * 7.0, gr = 1 + 0.035 * (i / 64);
        const rx = (rx0 + 3 * Math.sin(3 * th)) * gr, ry = (ry0 + 2 * Math.cos(2 * th)) * gr;
        const [dx, dy] = rot(rx * Math.cos(th), ry * Math.sin(th), tilt);
        d += (i ? 'L' : 'M') + f1(cx + dx) + ' ' + f1(cy + dy);
      }
      return d;
    };
    const QMARK = [                                                 // authored over the figure's head
      { d: 'M90,72 C88,44 116,33 137,39 C158,45 163,70 150,85 C140,97 124,101 124,124', w: 10, dur: 0.34, op: 0.93, sd: 0.32, g: 0.2 },
      { d: 'M123.6,146 L124.6,149', w: 13, pop: true, at: 0.4, op: 0.93, sd: 0.06, g: 0.14 },
    ];
    const crossAt = (cx, cy, s, w) => [
      { d: `M${f1(cx - s)},${f1(cy - s * 0.92)} C${f1(cx - s * 0.36)},${f1(cy - s * 0.38)} ${f1(cx + s * 0.3)},${f1(cy + s * 0.32)} ${f1(cx + s)},${f1(cy + s)}`, w, dur: 0.18, op: 0.9, sd: 0.16, g: 0.18 },
      { d: `M${f1(cx + s)},${f1(cy - s)} C${f1(cx + s * 0.4)},${f1(cy - s * 0.36)} ${f1(cx - s * 0.34)},${f1(cy + s * 0.36)} ${f1(cx - s * 0.96)},${f1(cy + s * 0.94)}`, w, at: 0.24, dur: 0.18, op: 0.9, sd: 0.16, g: 0.18 },
    ];
    // the subject of each photo type, where a mark lands: [x, y, loop rx, loop ry]
    const ART_FOCUS = { lighthouse: [178, 96, 46, 40], car: [132, 196, 98, 40], figure: [116, 100, 50, 58], lights: [126, 72, 80, 42], house: [173, 162, 36, 30], document: [128, 150, 80, 58], blank: [132, 132, 80, 80] };
    const photoMark = (kind, type) => {
      const [fx, fy, rx, ry] = ART_FOCUS[type] || ART_FOCUS.blank;
      if (kind === 'question') {
        const dx = S.clamp(fx - 116, -76, 87), dy = S.clamp(fy - 100, -17, 97);
        return dx || dy ? QMARK.map((m) => Object.assign({}, m, { g2: `translate(${dx} ${dy})` })) : QMARK;
      }
      if (kind === 'circle') return [{ d: loopPath(fx, fy, rx, ry, -6), w: 7, dur: 0.5, op: 0.9, sd: 0.5, g: 0.18 }];
      if (kind === 'cross') return crossAt(fx, fy, Math.min(62, fx - 12, 252 - fx, fy - 12, 252 - fy), 9);
      return [];
    };
    const mapMark = (kind) => (kind === 'circle' ? [{ d: loopPath(247, 90, 54, 38, -9), w: 5.5, dur: 0.5, op: 0.9, sd: 0.5, g: 0.18 }]
      : kind === 'question' ? QMARK.map((m) => Object.assign({}, m, { g2: 'translate(184 44) scale(.5)', w: m.w * 1.2 }))
        : kind === 'cross' ? crossAt(247, 90, 26, 6) : []);
    const markSvg = (spec) => spec.map((m) => {
      const p = `<path class="mk" d="${m.d}" fill="none" stroke="${MARK}" stroke-width="${m.w}" stroke-linecap="round" stroke-linejoin="round" opacity="${m.pop ? 0 : m.op}"/>`;
      return m.g2 ? `<g transform="${m.g2}">${p}</g>` : p;
    }).join('\n');
    const withMarks = (svg, spec) => (spec.length ? svg.replace(/<\/svg>$/, markSvg(spec) + '\n</svg>') : svg);
    const MK = {};                                                  // slot → { spec, els }

    /* ---------- photo illustrations (flat vector, 264×264) ----------
       lighthouse · car · figure · lights · house · document · blank.
       `px` is the slot letter (A, B, C): SVG ids stay unique even when two photos share a type. */
    function svgLighthouse(px) {
      const q = (n) => uid(px + n);
      let stars = '';
      for (let i = 0; i < 24; i++) {
        const x = S.rnd(4, 260), y = S.rnd(4, 128);
        if (x > 120 && y > 50) continue;
        stars += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${S.rnd(0.5, 1.25).toFixed(2)}" fill="#F4EBD0" opacity="${S.rnd(0.35, 0.9).toFixed(2)}"/>`;
      }
      let refl = '';
      for (let i = 0; i < 9; i++) { const y = 184 + i * 8 + S.rnd(-2, 2), x0 = S.rnd(8, 60), L = S.rnd(30, 90) * (1 - i / 12); refl += `<path d="M${f1(x0)} ${f1(y)}h${f1(L)}" stroke="#E8D6A2" stroke-width="1.3" opacity="${(0.34 - i * 0.03).toFixed(2)}"/>`; }
      const band = (y0, y1) => { const hw = (y) => 12 - ((193 - y) / 85) * 4; return `${f1(178 - hw(y1))},${y1} ${f1(178 + hw(y1))},${y1} ${f1(178 + hw(y0))},${y0} ${f1(178 - hw(y0))},${y0}`; };
      return `<svg viewBox="0 0 264 264" width="264" height="264" style="display:block">
<defs>
<linearGradient id="${q('sky')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#08111C"/><stop offset=".6" stop-color="#16293A"/><stop offset="1" stop-color="#2D4453"/></linearGradient>
<linearGradient id="${q('bl')}" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#FFE9B0" stop-opacity=".9"/><stop offset=".45" stop-color="#FFE0A0" stop-opacity=".3"/><stop offset="1" stop-color="#FFD890" stop-opacity="0"/></linearGradient>
<linearGradient id="${q('br')}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFE9B0" stop-opacity=".6"/><stop offset="1" stop-color="#FFD890" stop-opacity="0"/></linearGradient>
<radialGradient id="${q('gl')}"><stop offset="0" stop-color="#FFF6D8"/><stop offset=".2" stop-color="#FFE3A0" stop-opacity=".75"/><stop offset="1" stop-color="#FFD58A" stop-opacity="0"/></radialGradient>
<linearGradient id="${q('sea')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1C3040"/><stop offset="1" stop-color="#060C12"/></linearGradient>
<radialGradient id="${q('vg')}" cx=".5" cy=".5" r=".72"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></radialGradient>
<filter id="${q('sf')}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.4"/></filter>
</defs>
<rect width="264" height="264" fill="url(#${q('sky')})"/>${stars}
<g filter="url(#${q('sf')})"><polygon points="178,93 -12,30 -12,140" fill="url(#${q('bl')})"/><polygon points="178,93 276,82 276,104" fill="url(#${q('br')})"/></g>
<rect y="176" width="264" height="88" fill="url(#${q('sea')})"/>
<rect y="175.2" width="264" height="1.4" fill="#7C95A3" opacity=".4"/>${refl}
<path d="M100,264 L110,222 C116,210 128,204 140,203 L153,196 C161,190 176,188 190,191 L206,186 C222,182 244,184 264,190 L264,264 Z" fill="#0A1117"/>
<polygon points="166,193 190,193 186,108 170,108" fill="#D9D1BF"/>
<polygon points="${band(160, 170)}" fill="#912B22"/><polygon points="${band(128, 138)}" fill="#912B22"/>
<polygon points="178,193 190,193 186,108 178,108" fill="#1B2229" opacity=".42"/>
<rect x="167" y="104" width="22" height="5" fill="#1C242B"/>
<rect x="168.5" y="98.5" width="19" height="5.5" fill="none" stroke="#1C242B" stroke-width="1.1"/>
<rect x="172" y="87" width="12" height="12" fill="#FFEAB0"/>
<path d="M176 87V99M180 87V99" stroke="#8A7446" stroke-width=".8"/>
<path d="M169,88 L178,77 L187,88 Z" fill="#1C242B"/><circle cx="178" cy="75.6" r="1.6" fill="#1C242B"/>
<circle cx="178" cy="93" r="42" fill="url(#${q('gl')})"/>
<path d="M194,193 L194,183 L202.5,176 L211,183 L211,193 Z" fill="#0E161C"/>
<rect x="200" y="185" width="5" height="4" fill="#E8C878" opacity=".85"/>
<path d="M150,264 C162,242 190,234 220,238 C240,240 254,246 264,250 L264,264 Z" fill="#04080B"/>
<rect width="264" height="264" fill="#FFB070" opacity=".06"/>
<rect width="264" height="264" fill="url(#${q('vg')})"/>
</svg>`;
    }

    function svgSedan(px) {
      const q = (n) => uid(px + n);
      let trees = 'M0,122 L0,108';
      for (let x = 0; x <= 264; x += 6) trees += ` L${x},${f1(104 - S.rnd(0, 12) - (x % 18 === 0 ? S.rnd(4, 10) : 0))}`;
      trees += ' L264,122 Z';
      const dash = (y, w, h) => { const cx = 132, k = (y - 118) / 146; return `<rect x="${f1(cx - (w * (0.3 + k)) / 2)}" y="${f1(y)}" width="${f1(w * (0.3 + k))}" height="${f1(h * (0.3 + k))}" fill="#B9A66A" opacity=".55"/>`; };
      return `<svg viewBox="0 0 264 264" width="264" height="264" style="display:block">
<defs>
<linearGradient id="${q('sky')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05080C"/><stop offset=".42" stop-color="#101820"/><stop offset="1" stop-color="#18212A"/></linearGradient>
<linearGradient id="${q('rd')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121518"/><stop offset="1" stop-color="#2B2F32"/></linearGradient>
<radialGradient id="${q('hl')}"><stop offset="0" stop-color="#FFFBEA"/><stop offset=".16" stop-color="#FFEFC4" stop-opacity=".85"/><stop offset=".45" stop-color="#FFE2A6" stop-opacity=".25"/><stop offset="1" stop-color="#FFD890" stop-opacity="0"/></radialGradient>
<radialGradient id="${q('pool')}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFEBC0" stop-opacity=".32"/><stop offset="1" stop-color="#FFEBC0" stop-opacity="0"/></radialGradient>
<linearGradient id="${q('fl')}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFF1CC" stop-opacity="0"/><stop offset=".5" stop-color="#FFF1CC" stop-opacity=".75"/><stop offset="1" stop-color="#FFF1CC" stop-opacity="0"/></linearGradient>
<radialGradient id="${q('vg')}" cx=".5" cy=".5" r=".72"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></radialGradient>
<filter id="${q('sf')}" x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation="1.6"/></filter>
</defs>
<rect width="264" height="264" fill="url(#${q('sky')})"/>
<path d="${trees}" fill="#04070A"/>
<polygon points="124,117 140,117 300,264 -36,264" fill="url(#${q('rd')})"/>
<path d="M125,117 L-8,264 M139,117 L272,264" stroke="#50565A" stroke-width="1.2" opacity=".55"/>
${dash(121, 4, 3)}${dash(129, 5, 5)}${dash(140, 6, 7)}
<ellipse cx="132" cy="250" rx="160" ry="30" fill="url(#${q('pool')})"/>
<ellipse cx="132" cy="235" rx="90" ry="8" fill="#000" opacity=".75"/>
<rect x="57" y="222" width="25" height="16" rx="3" fill="#050709"/><rect x="182" y="222" width="25" height="16" rx="3" fill="#050709"/>
<path d="M52,186 Q52,177 61,177 L203,177 Q212,177 212,186 L212,226 Q212,230 208,230 L56,230 Q52,230 52,226 Z" fill="#1B2229"/>
<path d="M74,178 L90,143 Q92,140 96,140 L168,140 Q172,140 174,143 L190,178 Z" fill="#12171C"/>
<path d="M82,176 L96,146 L168,146 L182,176 Z" fill="#1F2A35"/>
<path d="M104,146 L114,146 L98,176 L88,176 Z" fill="#fff" opacity=".07"/>
<path d="M93,141.2 L171,141.2" stroke="#6A7782" stroke-width="1.2" opacity=".55"/>
<path d="M56,180.5 L208,180.5" stroke="#46515B" stroke-width="1" opacity=".8"/>
<rect x="61" y="168" width="11" height="7" rx="2" fill="#12171C"/><rect x="192" y="168" width="11" height="7" rx="2" fill="#12171C"/>
<rect x="99" y="189" width="66" height="12" fill="#0B0E11"/>
<path d="M104 189V201M109 189V201M114 189V201M119 189V201M124 189V201M140 189V201M145 189V201M150 189V201M155 189V201M160 189V201" stroke="#2A3138" stroke-width="1.2"/>
<rect x="129.5" y="192" width="5" height="6" fill="#7E8890"/>
<rect x="60" y="188" width="34" height="14" rx="1.5" fill="#FFF7E0"/><rect x="170" y="188" width="34" height="14" rx="1.5" fill="#FFF7E0"/>
<rect x="60" y="203.5" width="34" height="4" fill="#C7832F" opacity=".8"/><rect x="170" y="203.5" width="34" height="4" fill="#C7832F" opacity=".8"/>
<rect x="49" y="210" width="166" height="11" rx="3" fill="#2E353C"/>
<path d="M53 211.6H211" stroke="#8C979F" stroke-width="1" opacity=".45"/>
<rect x="118" y="212.5" width="28" height="7" fill="#9A927E"/>
<circle cx="77" cy="195" r="54" fill="url(#${q('hl')})"/><circle cx="187" cy="195" r="54" fill="url(#${q('hl')})"/>
<rect x="-30" y="193" width="324" height="4" fill="url(#${q('fl')})" filter="url(#${q('sf')})"/>
<rect width="264" height="264" fill="#FFB070" opacity=".05"/>
<rect width="264" height="264" fill="url(#${q('vg')})"/>
</svg>`;
    }

    function svgFigure(px) {
      const q = (n) => uid(px + n);
      const fig = `<ellipse cx="116" cy="104" rx="21" ry="25"/><rect x="107" y="122" width="18" height="34"/><path d="M58,264 C60,206 74,166 98,154 C106,149 126,149 134,154 C158,166 172,206 174,264 Z"/>`;
      return `<svg viewBox="0 0 264 264" width="264" height="264" style="display:block">
<defs>
<radialGradient id="${q('bg')}" cx=".74" cy=".2" r=".95"><stop offset="0" stop-color="#959888"/><stop offset=".32" stop-color="#58605A"/><stop offset=".72" stop-color="#252B29"/><stop offset="1" stop-color="#0D1110"/></radialGradient>
<radialGradient id="${q('lp')}"><stop offset="0" stop-color="#FFE6B8" stop-opacity=".7"/><stop offset="1" stop-color="#FFE6B8" stop-opacity="0"/></radialGradient>
<linearGradient id="${q('fog')}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#9FA8A2" stop-opacity=".22"/><stop offset="1" stop-color="#9FA8A2" stop-opacity="0"/></linearGradient>
<filter id="${q('mb')}" x="-40%" y="-20%" width="180%" height="140%"><feGaussianBlur stdDeviation="6.5 2.2"/></filter>
<filter id="${q('pb')}" x="-100%" y="-10%" width="300%" height="120%"><feGaussianBlur stdDeviation="2.5"/></filter>
<radialGradient id="${q('vg')}" cx=".5" cy=".5" r=".72"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".66"/></radialGradient>
</defs>
<rect width="264" height="264" fill="url(#${q('bg')})"/>
<rect x="198" y="46" width="5" height="220" fill="#0A0D0D" filter="url(#${q('pb')})"/>
<circle cx="200" cy="48" r="52" fill="url(#${q('lp')})"/>
<rect y="228" width="264" height="36" fill="#0A0D0C" opacity=".75"/>
<g fill="#070909" opacity=".38" filter="url(#${q('mb')})" transform="translate(20 2)">${fig}</g>
<g fill="#060808" filter="url(#${q('mb')})">${fig}</g>
<rect width="264" height="264" fill="url(#${q('fog')})"/>
<rect width="264" height="264" fill="#FFB070" opacity=".05"/>
<rect width="264" height="264" fill="url(#${q('vg')})"/>
</svg>`;
    }

    // strange lights hanging over a lake, one witness on the dock
    function svgLights(px) {
      const q = (n) => uid(px + n);
      let stars = '';
      for (let i = 0; i < 26; i++) {
        const x = S.rnd(4, 260), y = S.rnd(4, 150);
        stars += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${S.rnd(0.45, 1.1).toFixed(2)}" fill="#E4EEF0" opacity="${S.rnd(0.25, 0.8).toFixed(2)}"/>`;
      }
      let trees = 'M0,186 L0,172';
      for (let x = 0; x < 264; x += 6) {
        const h = S.rnd(6, 15) + (S.rand() < 0.35 ? S.rnd(5, 13) : 0);
        trees += ` L${x + 1},${f1(172 - h * 0.25)} L${x + 3},${f1(172 - h)} L${x + 5},${f1(172 - h * 0.25)}`;
      }
      trees += ' L264,172 L264,186 Z';
      const orbs = [[82, 76, 1], [132, 58, 0.78], [170, 90, 0.9]];
      let glow = '', refl = '';
      for (const [x, y, s] of orbs) {
        glow += `<circle cx="${x}" cy="${y}" r="${f1(36 * s)}" fill="url(#${q('orb')})"/><circle cx="${x}" cy="${y}" r="${f1(3.6 * s)}" fill="#FFFFFF"/>`;
        refl += `<rect x="${f1(x - 3.5 * s)}" y="190" width="${f1(7 * s)}" height="${f1(56 * s)}" fill="url(#${q('rf')})" filter="url(#${q('bl')})"/>`;
      }
      let ripples = '';
      for (let i = 0; i < 7; i++) { const y = 194 + i * 9, x0 = S.rnd(56, 96), L = S.rnd(70, 120) * (1 - i / 10); ripples += `<path d="M${f1(x0)} ${y}h${f1(L)}" stroke="#BDF3E0" stroke-width="1.1" opacity="${(0.3 - i * 0.03).toFixed(2)}"/>`; }
      return `<svg viewBox="0 0 264 264" width="264" height="264" style="display:block">
<defs>
<linearGradient id="${q('sky')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03060A"/><stop offset=".62" stop-color="#0A171E"/><stop offset="1" stop-color="#16292D"/></linearGradient>
<radialGradient id="${q('orb')}"><stop offset="0" stop-color="#F6FFFB"/><stop offset=".12" stop-color="#D4FCEC" stop-opacity=".9"/><stop offset=".38" stop-color="#8DEBCB" stop-opacity=".3"/><stop offset="1" stop-color="#6FDDBF" stop-opacity="0"/></radialGradient>
<radialGradient id="${q('hz')}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#5FCFB0" stop-opacity=".24"/><stop offset="1" stop-color="#5FCFB0" stop-opacity="0"/></radialGradient>
<linearGradient id="${q('lk')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#10232A"/><stop offset="1" stop-color="#020507"/></linearGradient>
<linearGradient id="${q('rf')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C8FAE8" stop-opacity=".65"/><stop offset="1" stop-color="#C8FAE8" stop-opacity="0"/></linearGradient>
<filter id="${q('bl')}" x="-200%" y="-20%" width="500%" height="140%"><feGaussianBlur stdDeviation="2 3"/></filter>
<radialGradient id="${q('vg')}" cx=".5" cy=".5" r=".72"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></radialGradient>
</defs>
<rect width="264" height="264" fill="url(#${q('sky')})"/>${stars}
<ellipse cx="126" cy="78" rx="130" ry="76" fill="url(#${q('hz')})"/>${glow}
<rect y="184" width="264" height="80" fill="url(#${q('lk')})"/>${refl}${ripples}
<path d="${trees}" fill="#020406"/>
<path d="M150,264 L164,238 L264,232 L264,264 Z" fill="#06080A"/>
<path d="M170,238 V250 M196,236 V252 M224,235 V252 M252,233 V251" stroke="#06080A" stroke-width="3"/>
<circle cx="207" cy="215" r="3.4" fill="#010203"/>
<path d="M202.6,236 L203.6,221 C204,218.6 205.4,218 207,218 C208.6,218 210,218.6 210.4,221 L211.4,236 Z" fill="#010203"/>
<path d="M0,264 L0,222 C9,226 17,236 22,264 Z" fill="#010203"/>
<path d="M5,264 C7,236 11,214 17,198 M13,264 C15,240 21,222 29,206 M21,264 C21,246 25,232 33,222" stroke="#010203" stroke-width="2.2" fill="none" stroke-linecap="round"/>
<rect width="264" height="264" fill="#FFB070" opacity=".04"/>
<rect width="264" height="264" fill="url(#${q('vg')})"/>
</svg>`;
    }

    // a lone house on a rise, one lit window, bare tree, low fog
    function svgHouse(px) {
      const q = (n) => uid(px + n);
      let stars = '';
      for (let i = 0; i < 14; i++) { const x = S.rnd(4, 260), y = S.rnd(4, 110); stars += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${S.rnd(0.4, 1).toFixed(2)}" fill="#EDE6D2" opacity="${S.rnd(0.25, 0.7).toFixed(2)}"/>`; }
      let tree = '';
      const branch = (x, y, a, len, w, d) => {
        const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
        tree += `<path d="M${f1(x)} ${f1(y)}L${f1(x2)} ${f1(y2)}" stroke-width="${w.toFixed(1)}"/>`;
        if (d > 0) { branch(x2, y2, a - S.rnd(0.25, 0.6), len * S.rnd(0.62, 0.78), w * 0.66, d - 1); branch(x2, y2, a + S.rnd(0.2, 0.55), len * S.rnd(0.6, 0.76), w * 0.66, d - 1); }
      };
      branch(52, 216, -Math.PI / 2 - 0.1, 50, 6, 5);
      return `<svg viewBox="0 0 264 264" width="264" height="264" style="display:block">
<defs>
<linearGradient id="${q('sky')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#06090D"/><stop offset=".6" stop-color="#141C23"/><stop offset="1" stop-color="#232B30"/></linearGradient>
<radialGradient id="${q('mn')}"><stop offset="0" stop-color="#F6F0DA" stop-opacity=".55"/><stop offset=".3" stop-color="#C9C4B0" stop-opacity=".16"/><stop offset="1" stop-color="#C9C4B0" stop-opacity="0"/></radialGradient>
<radialGradient id="${q('wg')}"><stop offset="0" stop-color="#FFE3A6" stop-opacity=".8"/><stop offset=".3" stop-color="#FFC878" stop-opacity=".28"/><stop offset="1" stop-color="#FFC878" stop-opacity="0"/></radialGradient>
<linearGradient id="${q('fog')}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#A7B0AE" stop-opacity=".26"/><stop offset="1" stop-color="#A7B0AE" stop-opacity="0"/></linearGradient>
<radialGradient id="${q('vg')}" cx=".5" cy=".5" r=".72"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".64"/></radialGradient>
</defs>
<rect width="264" height="264" fill="url(#${q('sky')})"/>${stars}
<circle cx="204" cy="56" r="48" fill="url(#${q('mn')})"/><circle cx="204" cy="56" r="11.5" fill="#EFE9D2"/>
<path d="M118,70 C146,60 178,66 200,62 C226,58 250,65 272,61 L272,75 C240,80 190,76 118,79 Z" fill="#0A0F14" opacity=".82"/>
<path d="M-10,214 C50,202 120,196 180,200 C220,203 250,207 274,211 L274,264 L-10,264 Z" fill="#05080A"/>
<path d="M112,206 L112,150 L154,116 L196,150 L196,206 Z" fill="#0B1015"/>
<path d="M105,154 L154,113 L203,154" fill="none" stroke="#2C363E" stroke-width="3.2" stroke-linejoin="round"/>
<rect x="174" y="118" width="9" height="26" fill="#0B1015"/><rect x="172.5" y="116" width="12" height="4" fill="#161E25"/>
<rect x="128" y="154" width="13" height="15" fill="#10171D"/>
<circle cx="173.5" cy="161.5" r="34" fill="url(#${q('wg')})"/>
<rect x="167" y="154" width="13" height="15" fill="#FFD88E"/><path d="M173.5 154V169M167 161.5H180" stroke="#6B4A1E" stroke-width="1.3"/>
<rect x="126" y="180" width="15" height="16" fill="#10171D"/><rect x="165" y="178" width="13" height="28" fill="#06090C"/>
<path d="M118,206 L118,176 L190,176 L190,206" fill="none" stroke="#161E25" stroke-width="2"/>
<g stroke="#04070A" stroke-linecap="round" fill="none">${tree}</g>
<path d="M204,214 L264,209 M204,221 L264,216" stroke="#05080A" stroke-width="1.6"/>
<path d="M210,206 V226 M226,205 V224 M242,203 V223 M258,202 V222" stroke="#05080A" stroke-width="3"/>
<rect y="170" width="264" height="94" fill="url(#${q('fog')})"/>
<rect width="264" height="264" fill="#FFB070" opacity=".05"/>
<rect width="264" height="264" fill="url(#${q('vg')})"/>
</svg>`;
    }

    // a typed page on a desk under a lamp, with redaction bars
    function svgDocument(px) {
      const q = (n) => uid(px + n);
      let lines = '', bars = '';
      for (let i = 0; i < 14; i++) {
        const y = 76 + i * 11, L = i % 5 === 4 ? S.rnd(40, 100) : S.rnd(118, 138);
        lines += `<rect x="60" y="${y}" width="${f1(L)}" height="3.4" fill="#6F675B" opacity=".8"/>`;
        if (S.rand() < 0.34 && i % 5 !== 4) { const x0 = 60 + S.rnd(0, 50), w = S.rnd(40, 80); bars += `<rect x="${f1(x0)}" y="${y - 2.6}" width="${f1(Math.min(w, 198 - x0))}" height="8.6" fill="#0C0B0A"/>`; }
      }
      return `<svg viewBox="0 0 264 264" width="264" height="264" style="display:block">
<defs>
<linearGradient id="${q('dk')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2A1C12"/><stop offset="1" stop-color="#0B0705"/></linearGradient>
<radialGradient id="${q('lm')}" cx=".22" cy=".12" r=".95"><stop offset="0" stop-color="#FFE2B0" stop-opacity=".34"/><stop offset=".5" stop-color="#FFC77E" stop-opacity=".08"/><stop offset="1" stop-color="#FFC77E" stop-opacity="0"/></radialGradient>
<filter id="${q('sh')}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
<radialGradient id="${q('vg')}" cx=".5" cy=".5" r=".72"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".66"/></radialGradient>
</defs>
<rect width="264" height="264" fill="url(#${q('dk')})"/>
<path d="M-10,40 C60,52 150,30 280,46 M-10,210 C80,196 170,226 280,204 M-10,130 C90,120 180,146 280,124" stroke="#3A2618" stroke-width="2" fill="none" opacity=".6"/>
<g transform="rotate(-6 132 140)">
<rect x="50" y="36" width="172" height="218" fill="#000" opacity=".6" filter="url(#${q('sh')})"/>
<rect x="44" y="28" width="172" height="218" fill="#E7E0CD"/>
<rect x="60" y="44" width="64" height="7" fill="#2F2A24"/><rect x="60" y="57" width="104" height="3" fill="#6F675B"/>
<rect x="152" y="40" width="50" height="19" fill="none" stroke="#A8322A" stroke-width="1.8" opacity=".75" transform="rotate(7 177 49)"/>
<rect x="158" y="47.5" width="38" height="3.6" fill="#A8322A" opacity=".6" transform="rotate(7 177 49)"/>
${lines}${bars}
<path d="M68,18 L68,46 C68,53 78,53 78,46 L78,24 C78,19 73,19 73,24 L73,42" fill="none" stroke="#AEB5B8" stroke-width="2.2" stroke-linecap="round"/>
</g>
<rect width="264" height="264" fill="url(#${q('lm')})"/>
<rect width="264" height="264" fill="#FFB070" opacity=".05"/>
<rect width="264" height="264" fill="url(#${q('vg')})"/>
</svg>`;
    }

    // an unexposed print: the photo that should be there and isn't
    function svgBlank(px) {
      const q = (n) => uid(px + n);
      return `<svg viewBox="0 0 264 264" width="264" height="264" style="display:block">
<defs>
<radialGradient id="${q('b')}" cx=".4" cy=".36" r=".85"><stop offset="0" stop-color="#2B2723"/><stop offset=".6" stop-color="#171513"/><stop offset="1" stop-color="#0A0908"/></radialGradient>
<linearGradient id="${q('lk')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF9A4A" stop-opacity=".16"/><stop offset=".35" stop-color="#FF9A4A" stop-opacity="0"/></linearGradient>
</defs>
<rect width="264" height="264" fill="url(#${q('b')})"/>
<rect width="264" height="264" fill="url(#${q('lk')})"/>
</svg>`;
    }
    const PHOTO_ART = { lighthouse: svgLighthouse, car: svgSedan, figure: svgFigure, lights: svgLights, house: svgHouse, document: svgDocument, blank: svgBlank };

    function svgMap(placeName, waterName, spec) {
      const q = (n) => uid('D' + n);
      // geography is drawn once and rotated 180° so the point sits in the map's upper right
      const coast = 'M0,66 C36,72 54,87 74,98 C96,110 118,107 142,114 C162,120 184,124 190,138 C196,152 186,164 172,170 C158,176 150,188 160,196 C170,204 188,199 200,206 C214,214 220,231 236,238 C250,244 266,237 282,242 C300,248 312,262 318,280';
      const land = coast + ' L410,280 L410,0 L0,0 Z';
      let grid = '';
      for (let x = 70; x < 410; x += 70) grid += `M${x} 0V280`;
      for (let y = 70; y < 280; y += 70) grid += `M0 ${y}H410`;
      const road = 'M410,52 C362,60 332,92 302,120 C272,148 238,160 214,176 C200,186 186,191 170,191';
      return `<svg viewBox="0 0 410 280" width="410" height="280" style="display:block">
<defs><pattern id="${q('hx')}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0V6" stroke="#8FA3A7" stroke-width="1" opacity=".35"/></pattern></defs>
<rect width="410" height="280" fill="#A9BBBC"/>
<rect width="410" height="280" fill="url(#${q('hx')})"/>
<g transform="rotate(180 205 140)">
<path d="${coast}" fill="none" stroke="#87A0A4" stroke-width="1.2" stroke-dasharray="4 4" transform="translate(-10 12)"/>
<path d="${coast}" fill="none" stroke="#87A0A4" stroke-width="1" stroke-dasharray="3 5" transform="translate(-22 26)"/>
<path d="${land}" fill="#E3D6B4"/>
<path d="${coast}" fill="none" stroke="#6E7F76" stroke-width="1.6"/>
<path d="M300,60 C330,40 372,48 380,74 C388,100 350,112 322,104 C298,97 284,76 300,60 Z M312,68 C332,56 360,62 364,78 C368,94 344,98 328,94 C312,90 302,78 312,68 Z" fill="none" stroke="#B59C6E" stroke-width="1.1" opacity=".6"/>
<path d="${grid}" stroke="#7A6A4E" stroke-width="1" opacity=".22"/>
<path d="${road}" fill="none" stroke="#6E3420" stroke-width="5.2" stroke-linecap="round"/>
<path d="${road}" fill="none" stroke="#E0A060" stroke-width="2.6" stroke-linecap="round"/>
<path d="M302,120 C314,160 334,200 384,228" fill="none" stroke="#7A6A50" stroke-width="1.4" stroke-dasharray="5 3"/>
<g transform="translate(160 191)"><circle r="3.4" fill="#2A2118"/><path d="M-8 0H-5M5 0H8M0 8V5M-5.7 5.7L-3.6 3.6M5.7 5.7L3.6 3.6" stroke="#2A2118" stroke-width="1.3"/></g>
</g>
<text class="mp" x="38" y="204" font-family="Archivo" font-weight="700" font-size="14" letter-spacing="2.6" fill="#3E3222" transform="rotate(-10 38 204)">${esc(placeName)}</text>
<text class="mw" x="316" y="34" font-family="Cormorant Garamond" font-style="italic" font-weight="600" font-size="17" fill="#4B6468">${esc(waterName)}</text>
<text x="96" y="272" font-family="JetBrains Mono" font-size="10" fill="#5E503A">D</text><text x="166" y="272" font-family="JetBrains Mono" font-size="10" fill="#5E503A">E</text><text x="236" y="272" font-family="JetBrains Mono" font-size="10" fill="#5E503A">F</text>
<path d="M206 0V280" stroke="#fff" stroke-width="1.6" opacity=".35"/><path d="M208 0V280" stroke="#000" stroke-width="1.4" opacity=".08"/>
${markSvg(spec)}
</svg>`;
    }

    // halftone strip under the newspaper headline: lighthouse · shore · house · city
    function paperPhoto(kind) {
      const f = (n) => f1(n);
      let scene = null;
      if (kind === 'lighthouse') scene = '<path d="M0,70 L298,66 L298,92 L0,92 Z" fill="#3B352D"/><path d="M150,92 L160,70 L180,64 L220,66 L240,58 L298,62 L298,92 Z" fill="#221E19"/><polygon points="196,64 208,64 205,22 199,22" fill="#E8E0CE"/><rect x="197" y="17" width="10" height="6" fill="#221E19"/>';
      else if (kind === 'shore') {
        let d = 'M0,66';
        for (let x = 0; x <= 298; x += 6) { const h = 14 + 7 * Math.abs(Math.sin(x * 0.29)) + 9 * Math.abs(Math.sin(x * 0.071 + 0.6)); d += ` L${x},${f(66 - h * 0.4)} L${x + 3},${f(66 - h)}`; }
        scene = `<path d="M0,66 L298,66 L298,92 L0,92 Z" fill="#4A443A"/><path d="${d} L298,66 Z" fill="#221E19"/><rect y="72" width="298" height="1.6" fill="#8C8475" opacity=".6"/><rect y="79" width="298" height="1.2" fill="#8C8475" opacity=".4"/>`;
      } else if (kind === 'house') scene = '<path d="M0,76 C80,64 190,62 298,70 L298,92 L0,92 Z" fill="#2A251F"/><path d="M126,68 L126,44 L150,26 L174,44 L174,68 Z" fill="#221E19"/><rect x="160" y="28" width="6" height="12" fill="#221E19"/><rect x="154" y="47" width="9" height="9" fill="#E8E0CE"/><path d="M70,74 L72,38 M72,52 L58,36 M72,46 L86,32 M71,62 L60,54" stroke="#221E19" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
      else if (kind === 'city') {
        let b = '';
        for (let i = 0, x = 0; x < 298; i++) { const w = 18 + ((i * 37) % 23), h = 22 + ((i * 53) % 46); b += `<rect x="${x}" y="${84 - h}" width="${w - 2}" height="${h + 8}" fill="${i % 3 ? '#221E19' : '#2E2922'}"/>`; if (i % 2) b += `<rect x="${x + 5}" y="${90 - h}" width="4" height="4" fill="#E8E0CE"/>`; x += w; }
        scene = `${b}<rect y="84" width="298" height="8" fill="#1B1814"/>`;
      }
      if (!scene) return null;
      return `<svg viewBox="0 0 298 92" width="298" height="92" style="position:absolute;left:0;top:0"><defs><pattern id="${uid('ht')}" width="3.2" height="3.2" patternUnits="userSpaceOnUse"><circle cx="1.6" cy="1.6" r="1" fill="#2A251F" opacity=".45"/></pattern></defs>${scene}<rect width="298" height="92" fill="url(#${uid('ht')})"/></svg>`;
    }

    /* ---------- build the board ---------- */
    // Newspaper clipping (every line shrinks to the 298 px column)
    {
      const NP = P.newspaper || {};
      const wrap = place(S.el('div', { style: 'position:absolute;filter:drop-shadow(0 10px 12px rgba(0,0,0,.55));' }, items), 'N');
      const pg = S.el('div', { style: `position:absolute;inset:0;background:#E3D8BE url(${FIBRE}) 0 0/256px;background-blend-mode:multiply;clip-path:${torn(330, 460, { top: 1.5, left: 2, right: 2, bottom: 14, step: 7 })};padding:16px 16px 0;box-sizing:border-box;color:#16130F;` }, wrap);
      const mast = S.el('div', { text: str(NP.name), style: 'font:800 25.5px/1 "Frank Ruhl Libre",serif;text-align:center;letter-spacing:0;white-space:nowrap;' }, pg);
      fit(mast, esc(NP.name), 'font:800 25.5px/1 "Frank Ruhl Libre",serif;letter-spacing:0', 25.5, 298);
      S.el('div', { style: 'margin-top:7px;height:2px;background:#1B1712;box-shadow:0 4px 0 -1px #1B1712;' }, pg);
      const dl = S.el('div', { style: 'display:flex;justify-content:space-between;margin-top:9px;font:600 9.5px/1 "Inter",sans-serif;letter-spacing:.06em;color:#3A342B;white-space:nowrap;' }, pg);
      const dateline = [NP.issue, NP.date, NP.price].map(str);
      dateline.forEach((s) => S.el('span', { text: s }, dl));
      fit(dl, dateline.map(esc).join(' '), 'font:600 9.5px/1 "Inter",sans-serif;letter-spacing:.06em', 9.5, 298);   // keeps ≥ 1 em between items
      S.el('div', { style: 'margin-top:6px;height:1px;background:#1B1712;' }, pg);
      const hlCss = 'font:400 43px/0.98 "Anton",sans-serif;letter-spacing:.005em';
      const hl = S.el('div', { html: brk(NP.headline), style: 'margin-top:10px;font:400 43px/0.98 "Anton",sans-serif;text-align:center;letter-spacing:.005em;white-space:nowrap;' }, pg);
      const [hw, hh] = measure(brk(NP.headline), hlCss);
      const hs = Math.min(1, 298 / (hw || 1), 110 / (hh || 1));   // 1–3 lines; 3 lines shrink to keep the photo on the page
      if (hs < 1) hl.style.fontSize = 43 * hs + 'px';
      const sub = S.el('div', { text: str(NP.subhead), style: 'margin-top:7px;font:italic 600 17px/1 "Cormorant Garamond",serif;text-align:center;color:#2E281F;white-space:nowrap;' }, pg);
      fit(sub, esc(NP.subhead), 'font:italic 600 17px/1 "Cormorant Garamond",serif', 17, 298);
      const strip = paperPhoto(NP.photo);
      if (strip) {
        const ph = S.el('div', { style: 'position:relative;margin-top:10px;height:92px;background:linear-gradient(#B4AC9C,#8C8475 60%,#5E574B);overflow:hidden;' }, pg);
        ph.innerHTML = strip;
      }
      const cols = S.el('div', { style: 'display:flex;gap:14px;margin-top:10px;' }, pg);
      for (let c = 0; c < 2; c++) {
        const col = S.el('div', { style: 'flex:1;' }, cols);
        for (let i = 0; i < 17; i++) {
          const endP = S.rand() < 0.16;
          S.el('div', { style: `height:4.5px;margin-bottom:4.2px;width:${endP ? S.rnd(35, 75).toFixed(0) : S.rnd(94, 100).toFixed(0)}%;background:#9A9181;${endP ? 'margin-bottom:9px;' : ''}` }, col);
        }
      }
      // coffee ring
      S.el('div', { style: 'position:absolute;left:176px;top:330px;width:112px;height:108px;border-radius:50%;background:radial-gradient(closest-side, rgba(120,72,30,0) 78%, rgba(120,72,30,.22) 88%, rgba(120,72,30,.34) 93%, rgba(120,72,30,0) 100%);' }, pg);
      tape(wrap, -22, -6, 78, -38); tape(wrap, 272, -4, 78, 36);
    }

    function polaroid(k, svg, caption) {
      const el = place(S.el('div', { style: `position:absolute;background:#EEE8DA url(${FIBRE}) 0 0/256px;background-blend-mode:multiply;box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 14px 22px rgba(0,0,0,.6),0 3px 6px rgba(0,0,0,.5);` }, items), k);
      const ph = S.el('div', { html: svg, style: 'position:absolute;left:18px;top:18px;width:264px;height:264px;overflow:hidden;background:#111;' }, el);
      S.el('div', { style: 'position:absolute;left:18px;top:18px;width:264px;height:264px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.4),inset 0 0 14px rgba(0,0,0,.35);background:linear-gradient(128deg, rgba(255,255,255,.16) 0%, rgba(255,255,255,0) 36%, rgba(255,255,255,0) 72%, rgba(255,255,255,.05) 100%);' }, el);
      if (caption) {
        const cap = S.el('div', { text: caption, style: 'position:absolute;left:0;right:0;top:296px;text-align:center;font:400 30px/1 "Permanent Marker",cursive;color:#221E1A;transform:rotate(-2deg);white-space:nowrap;' }, el);
        fit(cap, esc(caption), 'font:400 30px/1 "Permanent Marker",cursive', 30, 264);
      }
      return { el, ph };
    }
    // Polaroids: photo1 → A, photo2 → B, photo3 → C (unknown or missing types become an unexposed print)
    const PHOTOS = Array.isArray(P.photos) ? P.photos : [];
    ['A', 'B', 'C'].forEach((k, i) => {
      const p = PHOTOS[i] || {}, type = PHOTO_ART[p.type] ? p.type : 'blank', art = PHOTO_ART[type], spec = photoMark(p.mark, type);
      const pol = polaroid(k, withMarks(art(k), spec), str(p.caption));
      if (spec.length) MK[k] = { spec, els: [...pol.ph.querySelectorAll('.mk')] };
    });

    // Map snippet
    const MP = P.map || {}, mapSpec = mapMark(MP.mark);
    const Dw = place(S.el('div', { style: 'position:absolute;filter:drop-shadow(0 10px 12px rgba(0,0,0,.55));' }, items), 'D');
    const Dp = S.el('div', { html: svgMap(str(MP.place), str(MP.water), mapSpec), style: `position:absolute;inset:0;clip-path:${torn(410, 280, { j: 6, step: 8 })};` }, Dw);
    S.el('div', { style: `position:absolute;inset:0;background:url(${FIBRE}) 0 0/256px;mix-blend-mode:multiply;opacity:.9;` }, Dp);
    {
      const tp = Dp.querySelector('.mp'), tw = Dp.querySelector('.mw');
      const lp = tp.getComputedTextLength();
      if (lp > 190) { tp.setAttribute('font-size', f1((14 * 190) / lp)); tp.setAttribute('letter-spacing', f1((2.6 * 190) / lp)); }
      let lw = tw.getComputedTextLength();
      if (lw > 120) { tw.setAttribute('font-size', f1((17 * 120) / lw)); lw = 120; }
      if (316 + lw > 398) tw.setAttribute('x', f1(398 - lw));   // long water names slide left, off the torn edge
    }
    if (mapSpec.length) MK.D = { spec: mapSpec, els: [...Dp.querySelectorAll('.mk')] };

    // Index cards: explicit "\n" line breaks, 1–3 short lines; text shrinks to the card
    function card(k, text, size) {
      const el = place(S.el('div', { style: `position:absolute;background-color:#F3EEE2;background-image:linear-gradient(transparent 0 42px, #D57A72 42px 44px, transparent 44px),repeating-linear-gradient(transparent 0 69px, #A8BFD8 69px 70.5px, transparent 70.5px 96px),url(${FIBRE});background-size:100% 100%,100% 26px,256px;background-blend-mode:multiply;box-shadow:0 12px 20px rgba(0,0,0,.55),0 2px 4px rgba(0,0,0,.4);` }, items), k);
      const top = IT[k].h > 180 ? 58 : 52, html = brk(text), css = `font:400 ${size}px/1.08 "Permanent Marker",cursive`;
      const tx = S.el('div', { html, style: `position:absolute;left:0;right:0;top:${top}px;text-align:center;${css};color:#1E1A16;transform:rotate(-2deg);white-space:nowrap;` }, el);
      const [w, h] = measure(html, css);
      const s = Math.min(1, (IT[k].w - 44) / (w || 1), (IT[k].h - top - 12) / (h || 1));
      if (s < 1) tx.style.fontSize = size * s + 'px';
      if (text && !text.includes('\n')) tx.style.top = top + 20 + 'px';   // a single line sits mid-card
      tape(el, IT[k].w / 2 - 34, -12, 68, -3);
      return el;
    }
    const CARDS = Array.isArray(P.cards) ? P.cards : [];
    card('K1', str(CARDS[0]), 38);
    card('K2', str(CARDS[1]), 38);

    /* ---------- pins ---------- */
    const pinCols = { red: ['#FF8C7A', '#D8322A', '#9A140E', '#560604'], brass: ['#FFF0B8', '#D2A64A', '#8C6A22', '#4E3A10'], white: ['#FFFFFF', '#E6E1D8', '#A8A298', '#6C665C'] };
    function pin(x, y, col = 'red') {
      const [hi, mid, lo, edge] = pinCols[col];
      const W = S.el('div', { style: `position:absolute;left:${f1(x - 14)}px;top:${f1(y - 14)}px;width:28px;height:28px;` }, pinsL);
      const sh = S.el('div', { style: 'position:absolute;left:4px;top:8px;width:26px;height:20px;border-radius:50%;background:rgba(0,0,0,.62);filter:blur(3px);' }, W);
      const hd = S.el('div', { style: `position:absolute;left:2px;top:2px;width:24px;height:24px;border-radius:50%;background:radial-gradient(circle at 35% 29%, rgba(255,255,255,.95) 0 1.6px, rgba(255,255,255,0) 4.2px),radial-gradient(circle at 38% 34%, ${hi} 0%, ${mid} 34%, ${lo} 72%, ${edge} 100%);box-shadow:inset 0 -2px 3px rgba(0,0,0,.35),0 1px 1px rgba(0,0,0,.5);` }, W);
      return { W, sh, hd, x, y };
    }
    function land(p, t, g = 0.3) {
      tl.fromTo(p.hd, { scale: 1.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.2, ease: 'power2.in' }, t - 0.2);
      tl.fromTo(p.sh, { x: 22, y: 28, scale: 1.7, opacity: 0 }, { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.2, ease: 'power2.in' }, t - 0.2);
      tl.to(p.hd, { scale: 0.88, duration: 0.05, ease: 'power2.out' }, t);
      tl.to(p.hd, { scale: 1, duration: 0.3, ease: 'back.out(3)' }, t + 0.05);
      const ring = S.el('div', { style: `position:absolute;left:${f1(p.x - 30)}px;top:${f1(p.y - 30)}px;width:60px;height:60px;border-radius:50%;border:2px solid rgba(255,226,192,.8);box-sizing:border-box;opacity:0;` }, pinsL);
      tl.fromTo(ring, { scale: 0.3, opacity: 0 }, { scale: 0.45, opacity: 0.85, duration: 0.03, ease: 'none' }, t);
      tl.to(ring, { scale: 1.6, opacity: 0, duration: 0.45, ease: 'expo.out' }, t + 0.03);
      S.sfx(t, 'thud', { gain: g, pitch: 1.35 });
      S.sfx(t + 0.004, 'click', { gain: g * 0.45, pitch: 0.6 });
    }
    const pins = {};
    for (const k of ['A', 'B', 'C', 'D', 'N', 'K1', 'K2']) pins[k] = pin(PIN[k].x, PIN[k].y);
    // decorative pins that are already on the board (one holds a torn corner of a removed photo)
    S.el('div', { style: `position:absolute;left:800px;top:733px;width:44px;height:36px;background:#EEE8DA url(${FIBRE}) 0 0/256px;background-blend-mode:multiply;clip-path:polygon(0 0,100% 0,62% 100%,40% 64%,8% 78%);transform:rotate(8deg);box-shadow:0 4px 6px rgba(0,0,0,.4);` }, items);
    pin(818, 745, 'brass'); pin(1780, 520, 'white'); pin(420, 360, 'brass'); pin(1330, 990, 'red');

    /* ---------- strings ---------- */
    const sdefs = S.defs(strSvg), sbId = uid('sblur');
    S.s('feGaussianBlur', { stdDeviation: 2.4 }, S.s('filter', { id: sbId, x: '-20%', y: '-20%', width: '140%', height: '140%' }, sdefs));
    const shadowG = S.s('g', { filter: `url(#${sbId})`, opacity: 0.6 }, strSvg);
    const strG = S.s('g', {}, strSvg);
    function string(a, b, t, dur, sagK = 0.07) {
      const p0 = PIN[a], p1 = PIN[b], L = Math.hypot(p1.x - p0.x, p1.y - p0.y), sag = 12 + sagK * L;
      const d = `M${f1(p0.x)} ${f1(p0.y)} Q${f1((p0.x + p1.x) / 2)} ${f1((p0.y + p1.y) / 2 + sag)} ${f1(p1.x)} ${f1(p1.y)}`;
      const els = [
        S.s('path', { d, fill: 'none', stroke: '#000', 'stroke-width': 5, transform: 'translate(7 11)' }, shadowG),
        S.s('path', { d, fill: 'none', stroke: C.string, 'stroke-width': 4.6, 'stroke-linecap': 'round' }, strG),
        S.s('path', { d, fill: 'none', stroke: C.stringLight, 'stroke-width': 1.3, opacity: 0.6, transform: 'translate(-0.7 -1.2)' }, strG),
      ];
      for (const e of els) {
        tl.fromTo(e, { opacity: 0 }, { opacity: e.getAttribute('opacity') || 1, duration: 0.01 }, t);
        S.draw(e, t, dur, { ease: 'power2.inOut' });
      }
    }

    /* ---------- the investigation: the string runs through the 4 route stops, camera rides along ---------- */
    const [R0, R1, R2, R3] = ROUTE, F = ROUTE.map((k) => FOCUS[k]);
    S.camSet({ x: F[0][0], y: F[0][1] + 6, z: 1.72, r: -0.6 });
    S.camTo(0, { z: 1.8, y: F[0][1] }, 0.72, 'sine.inOut');
    S.camTo(0.72, { x: F[1][0], y: F[1][1], z: 1.64, r: 0.5 }, 0.98, 'power2.inOut');
    S.camTo(1.7, { x: F[2][0], y: F[2][1], z: 1.6, r: -0.4 }, 0.94, 'power2.inOut');
    S.camTo(2.64, { x: F[3][0], y: F[3][1], z: 1.56, r: 0.3 }, 0.94, 'power2.inOut');
    S.camTo(3.6, { x: 960, y: 540, z: 1.0, r: 0 }, 1.0, 'expo.inOut');
    S.camTo(4.6, { x: 972, y: 544, z: 1.025 }, 1.6, 'sine.inOut');
    S.camTo(6.2, { z: 1.012 }, 0.2, 'power2.out');
    S.camTo(6.5, { x: 986, y: 548, z: 1.1 }, 1.5, 'sine.inOut');

    // focus pull + shutter flash on the first photo
    tl.fromTo(S.cam, { filter: 'blur(5px)' }, { filter: 'blur(0px)', duration: 0.38, ease: 'power3.inOut' }, 0);
    tl.set(S.cam, { filter: 'none' }, 0.39);
    const flash = S.el('div', { style: 'position:absolute;inset:0;background:#FFF4E2;opacity:0;pointer-events:none;' }, S.fx);
    tl.fromTo(flash, { opacity: 0 }, { opacity: 0.3, duration: 0.03, ease: 'none' }, 0.38);
    tl.to(flash, { opacity: 0, duration: 0.4, ease: 'power2.out' }, 0.41);
    S.sfx(0.38, 'shutter', { gain: 0.45 });
    S.beat(0, 'Open tight on one photo; focus pull and shutter start the clock');

    const LAND = [0.62, 1.62, 2.52, 3.44];
    land(pins[R0], 0.62, 0.3);
    string(R0, R1, 0.78, 0.84);
    land(pins[R1], 1.62, 0.32);
    string(R1, R2, 1.7, 0.82);
    land(pins[R2], 2.52, 0.32);
    string(R2, R3, 2.62, 0.82);
    land(pins[R3], 3.44, 0.34);
    S.beat(0.78, 'Camera rides the red string, so the eye never has to search');
    [0.76, 1.68, 2.6].forEach((t, i) => S.sfx(t, 'whoosh', { dur: 0.9, from: 200, to: 900, gain: 0.12, dir: i % 2 ? -1 : 1 }));

    // items settle when their pin lands
    ROUTE.forEach((k, i) => {
      tl.fromTo(EL[k], { rotation: IT[k].rot + (i % 2 ? -1.6 : 1.6) }, { rotation: IT[k].rot, duration: 0.9, ease: 'elastic.out(1.1, 0.4)' }, LAND[i]);
    });

    // clue marks are drawn on just after their item's pin lands
    ROUTE.forEach((k, i) => {
      const m = MK[k];
      if (!m) return;
      const t = LAND[i] + (k === 'D' ? 0.04 : 0.06);
      m.els.forEach((el, j) => {
        const s = m.spec[j], ts = t + (s.at || 0);
        if (s.pop) tl.fromTo(el, { opacity: 0 }, { opacity: s.op, duration: 0.02 }, ts);
        else { tl.fromTo(el, { opacity: 0 }, { opacity: s.op, duration: 0.01 }, ts); S.draw(el, ts, s.dur, { ease: 'power1.inOut' }); }
        S.sfx(ts, 'scratch', { dur: s.sd, gain: s.g });
      });
    });

    /* ---------- pull-out: the whole board, more strings in parallel ---------- */
    S.sfx(3.56, 'whoosh', { dur: 1.1, from: 150, to: 1300, gain: 0.3 });
    string(LINK.N, 'N', 3.72, 0.55, 0.05);
    string(LINK.K1, 'K1', 3.8, 0.55, 0.05);
    string(LINK.K2, 'K2', 3.86, 0.66, 0.06);
    land(pins.N, 4.27, 0.2);
    land(pins.K1, 4.35, 0.18);
    land(pins.K2, 4.52, 0.2);
    [['N', 4.27], ['K1', 4.35], ['K2', 4.52]].forEach(([k, t], i) => {
      tl.fromTo(EL[k], { rotation: IT[k].rot + (i % 2 ? 1.2 : -1.2) }, { rotation: IT[k].rot, duration: 0.8, ease: 'elastic.out(1.1, 0.4)' }, t);
    });
    S.sfx(4.39, 'bass', { gain: 0.28, freq: 44 });
    S.beat(3.6, 'Pull-out shows the whole board at once: the scale of the case');

    /* ---------- HUD: case header (typed) ---------- */
    // soft shade so the title stays legible while polaroids pass under it
    S.el('div', { style: 'position:absolute;left:0;top:0;width:1200px;height:360px;background:radial-gradient(ellipse 62% 70% at 18% 22%, rgba(12,7,4,.78) 0%, rgba(12,7,4,.45) 45%, rgba(12,7,4,0) 100%);pointer-events:none;' }, S.hud);
    const hud = S.el('div', { style: 'position:absolute;left:120px;top:96px;' }, S.hud);
    const tab = S.el('div', { style: `position:absolute;left:0;top:4px;width:8px;height:104px;background:${RED};box-shadow:0 0 14px rgba(${rgbOf(RED).join(',')},.55);transform-origin:50% 0;` }, hud);
    const h1 = S.el('div', { style: `position:absolute;left:26px;top:0;white-space:nowrap;font:400 34px/44px "Special Elite",monospace;letter-spacing:.08em;color:${HUDC};text-shadow:0 2px 10px rgba(0,0,0,.95),0 0 2px rgba(0,0,0,.8);` }, hud);
    const h2 = S.el('div', { style: `position:absolute;left:26px;top:50px;white-space:nowrap;font:400 46px/56px "Special Elite",monospace;letter-spacing:.03em;color:${C.caseTitle};text-shadow:0 3px 14px rgba(0,0,0,.95),0 0 2px rgba(0,0,0,.8);` }, hud);
    const caseFile = str(P.caseFile), caseTitle = str(P.caseTitle);
    fit(h1, esc(caseFile), 'font:400 34px/44px "Special Elite",monospace;letter-spacing:.08em', 34, 1000);
    fit(h2, esc(caseTitle), 'font:400 46px/56px "Special Elite",monospace;letter-spacing:.03em', 46, 1000);
    tl.fromTo(tab, { scaleY: 0 }, { scaleY: 0.42, duration: 0.35, ease: 'expo.out' }, 0.05);
    // long lines type faster: the case number is done by ~1.3 s, the title by ~3.0 s (before the pull-out)
    const e1 = S.type(h1, caseFile, { t: 0.12, cps: 27 * Math.max(1, est(caseFile, 27) / 1.18), gain: 0.2 });
    // the title starts as the case number finishes; the typist pauses before its last word so the pin landing
    // at 1.62 s sits alone in the mix
    const T2 = Math.max(0.96, e1 - 0.1);
    tl.to(tab, { scaleY: 1, duration: 0.4, ease: 'expo.out' }, T2 + 0.02);
    const cut2 = caseTitle.lastIndexOf(' ') + 1;
    const ta = cut2 ? caseTitle.slice(0, cut2) : caseTitle, tb = cut2 ? caseTitle.slice(cut2) : '';
    const cps2 = 34 * Math.max(1, (est(ta, 34) + est(tb, 34)) / Math.max(0.5, 3.0 - T2 - 0.12));
    const h2a = S.el('span', {}, h2), h2b = S.el('span', {}, h2);
    const ea = S.type(h2a, ta, { t: T2, cps: cps2, gain: 0.13 });
    S.type(h2b, tb, { t: Math.max(T2 + 0.78, ea + 0.12), cps: cps2, gain: 0.13 });

    /* ---------- lower third: typed paper strips (red/black ribbon) ---------- */
    const LT = P.lowerThird || {}, ltLabel = str(LT.label), ltDetail = str(LT.detail), ltPlace = str(LT.place);
    const lt = S.el('div', { style: 'position:absolute;left:120px;top:830px;filter:drop-shadow(0 10px 14px rgba(0,0,0,.6)) drop-shadow(0 2px 2px rgba(0,0,0,.35));' }, S.hud);
    const cut = () => { const pts = ['0 0']; for (let k = 0; k <= 8; k++) pts.push(`calc(100% - ${S.rnd(0, 7).toFixed(1)}px) ${(k * 12.5).toFixed(1)}%`); pts.push('0 100%'); return `polygon(${pts.join(',')})`; };
    const stripCss = `position:absolute;left:0;white-space:nowrap;background:${PAPER} url(${FIBRE}) 0 0/256px;background-blend-mode:multiply;color:${INK};font-family:"Special Elite",monospace;transform-origin:0 50%;`;
    const s1 = S.el('div', { style: stripCss + `top:0;height:76px;padding:0 34px 0 30px;font-size:50px;line-height:79px;letter-spacing:.02em;clip-path:${cut()};` }, lt);
    const s1Text = ltDetail ? `${ltLabel} ${ltDetail}` : ltLabel;
    S.el('span', { text: s1Text, style: 'visibility:hidden;' }, s1);
    fit(s1, esc(s1Text), 'font-family:"Special Elite",monospace;font-size:50px;letter-spacing:.02em', 50, 1000);
    const s1t = S.el('div', { style: 'position:absolute;left:30px;top:0;' }, s1);
    const s1a = S.el('span', { style: `color:${RED};` }, s1t), s1b = S.el('span', {}, s1t);
    const s2 = S.el('div', { style: stripCss + `top:90px;height:60px;padding:0 30px 0 26px;font-size:40px;line-height:63px;letter-spacing:.06em;clip-path:${cut()};` }, lt);
    S.el('span', { text: ltPlace, style: 'visibility:hidden;' }, s2);
    fit(s2, esc(ltPlace), 'font-family:"Special Elite",monospace;font-size:40px;letter-spacing:.06em', 40, 1000);
    if (!ltPlace) s2.style.display = 'none';
    const s2t = S.el('div', { style: 'position:absolute;left:26px;top:0;' }, s2);
    // typing speeds up for long lines so the ding still lands before the stamp (typing budget 4.6 → 6.26 s)
    const need = est(ltLabel, 30) + est(ltDetail ? ' ' + ltDetail : '', 46) + est(ltPlace, 54) + 0.13;
    const SPD = need > 1.66 ? (need - 0.13) / (1.66 - 0.13) : 1;
    tl.fromTo(s1, { x: -46, y: 8, rotation: -4, opacity: 0 }, { x: 0, y: 0, rotation: -0.8, opacity: 1, duration: 0.4, ease: 'back.out(1.5)' }, 4.46);
    S.sfx(4.46, 'paper', { dur: 0.3, gain: 0.2 });
    let te = S.type(s1a, ltLabel, { t: 4.6, cps: 30 * SPD, gain: 0.28 });
    te = S.type(s1b, ltDetail ? ' ' + ltDetail : '', { t: te + 0.05, cps: 46 * SPD, gain: 0.28 });
    if (ltPlace) {
      tl.fromTo(s2, { x: -40, y: 8, rotation: 3, opacity: 0 }, { x: 0, y: 0, rotation: 0.6, opacity: 1, duration: 0.38, ease: 'back.out(1.5)' }, te - 0.16);
      S.sfx(te - 0.16, 'paper', { dur: 0.25, gain: 0.15 });
      te = S.type(s2t, ltPlace, { t: te + 0.08, cps: 54 * SPD, gain: 0.26 });
    }
    S.sfx(te + 0.03, 'ding', { freq: 2350, gain: 0.2 });
    S.beat(4.46, 'Typed lower third answers when and where');

    /* ---------- the stamp ---------- */
    const SX = 986, SY = 546, SR = -10;
    const stamp = S.el('div', { style: `position:absolute;left:${SX - 430}px;top:${SY - 135}px;width:860px;height:270px;opacity:0;-webkit-mask-image:url(${INKMASK});mask-image:url(${INKMASK});-webkit-mask-size:100% 100%;mask-size:100% 100%;` }, stampL);
    const tf = uid('stf');
    stamp.innerHTML = `<svg viewBox="0 0 860 270" width="860" height="270" style="display:block;overflow:visible">
<defs><filter id="${tf}" x="-5%" y="-10%" width="110%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.6" xChannelSelector="R" yChannelSelector="G"/></filter></defs>
<g filter="url(#${tf})">
<rect x="12" y="12" width="836" height="246" rx="20" fill="none" stroke="${STAMP}" stroke-width="14"/>
<rect x="36" y="36" width="788" height="198" rx="8" fill="none" stroke="${STAMP}" stroke-width="5"/>
<text x="441" y="202" text-anchor="middle" font-family="Anton" font-size="150" letter-spacing="22" fill="${STAMP}">${esc(P.stamp)}</text>
</g></svg>`;
    {
      // long stamp words shrink (letter-spacing with them) to stay inside the inner frame, re-centred on it
      const st = stamp.querySelector('text'), sw = st.getComputedTextLength();
      if (sw > 760) {
        const fs = (150 * 760) / sw;
        st.setAttribute('font-size', f1(fs)); st.setAttribute('letter-spacing', f1((22 * fs) / 150));
        st.setAttribute('x', f1(430 + (11 * fs) / 150)); st.setAttribute('y', f1(147 + (55 * fs) / 150));
      }
    }
    gsap.set(stamp, { rotation: SR, transformOrigin: '50% 50%' });
    tl.fromTo(stamp, { scale: 2.5, opacity: 0, rotation: SR + 7, filter: 'blur(10px)' }, { scale: 1, opacity: 0.95, rotation: SR, filter: 'blur(0px)', duration: 0.2, ease: 'power3.in' }, TSLAM - 0.2);
    tl.set(stamp, { filter: 'none' }, TSLAM + 0.01);
    tl.to(stamp, { scale: 0.975, duration: 0.05, ease: 'power2.out' }, TSLAM);
    tl.to(stamp, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.45)' }, TSLAM + 0.05);
    S.shake(TSLAM, { amp: 18, dur: 0.55, rot: 0.6 });
    S.sfx(TSLAM - 0.2, 'whoosh', { dur: 0.22, from: 400, to: 2600, gain: 0.22 });
    S.sfx(TSLAM, 'stamp', { gain: 0.8 });
    S.sfx(TSLAM, 'boom', { gain: 0.4, dur: 1.6 });
    S.sfx(TSLAM + 0.03, 'paper', { dur: 0.35, gain: 0.12 });
    S.beat(TSLAM, 'Stamp slam lands the hook; shake, dust and lamp sway sell the weight');
    S.beat(6.5, 'Slow push on the stamp holds the question open');
    // board jolts on impact
    ['N', 'A', 'B', 'C', 'D', 'K1', 'K2'].forEach((k, i) => {
      const j = (i % 2 ? 1 : -1) * S.rnd(0.8, 1.6);
      tl.to(EL[k], { rotation: IT[k].rot + j, duration: 0.05, ease: 'power1.out' }, TSLAM);
      tl.to(EL[k], { rotation: IT[k].rot, duration: 0.9, ease: 'elastic.out(1.2, 0.3)' }, TSLAM + 0.05);
    });

    // dust puff from under the stamp (analytic: drag-damped ballistic paths)
    const puffs = [], specks = [];
    for (let i = 0; i < 96; i++) {
      const s = S.rand(); let lx, ly, nx, ny;
      if (s < 0.36) { lx = S.rnd(-430, 430); ly = -135; nx = 0; ny = -1; }
      else if (s < 0.72) { lx = S.rnd(-430, 430); ly = 135; nx = 0; ny = 1; }
      else if (s < 0.86) { lx = -430; ly = S.rnd(-135, 135); nx = -1; ny = 0; }
      else { lx = 430; ly = S.rnd(-135, 135); nx = 1; ny = 0; }
      const [wx, wy] = rot(lx, ly, SR), [vx, vy] = rot(nx + S.rnd(-0.55, 0.55), ny + S.rnd(-0.55, 0.55), SR), sp = S.rnd(140, 520);
      puffs.push({ x: SX + wx, y: SY + wy, vx: vx * sp, vy: vy * sp, r: S.rnd(14, 42), life: S.rnd(0.8, 1.6), a: S.rnd(0.16, 0.34), k: S.rnd(2.6, 4.2) });
    }
    for (let i = 0; i < 34; i++) {
      const a = S.rnd(0, 6.283), [wx, wy] = rot(Math.cos(a) * 470, Math.sin(a) * 160, SR), sp = S.rnd(220, 700);
      specks.push({ x: SX + wx, y: SY + wy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 180, life: S.rnd(0.5, 1.0), r: S.rnd(1.2, 2.6) });
    }
    let dustOn = false;
    S.onFrame((t) => {
      const u = t - TSLAM;
      if (u < 0 || u > 1.6) { if (dustOn) { dust.clearRect(0, 0, 1920, 1080); dustOn = false; } return; }
      dust.clearRect(0, 0, 1920, 1080); dustOn = true;
      for (const p of puffs) {
        if (u > p.life) continue;
        const e = (1 - Math.exp(-p.k * u)) / p.k, q = u / p.life, r = p.r * (1 + 1.6 * q);
        dust.globalAlpha = p.a * Math.pow(1 - q, 1.6) * Math.min(1, u / 0.04);
        dust.drawImage(PUFF, p.x + p.vx * e - r, p.y + p.vy * e - 18 * u - r, 2 * r, 2 * r);
      }
      dust.fillStyle = '#FFE9C8';
      for (const p of specks) {
        if (u > p.life) continue;
        const e = (1 - Math.exp(-3 * u)) / 3;
        dust.globalAlpha = 0.8 * (1 - u / p.life);
        dust.fillRect(p.x + p.vx * e, p.y + p.vy * e + 420 * u * u, p.r, p.r);
      }
      dust.globalAlpha = 1;
    });

    /* ---------- the lamp: warm pool that follows the investigation, flickers, sways after the slam ---------- */
    const stop = (arr, i) => (Array.isArray(arr) ? arr[Math.min(i, arr.length - 1)] : arr);   // short colour lists repeat their last stop
    const LAMP = [0, 1, 2, 3, 4].map((i) => rgbOf(stop(C.lamp, i))), LG0 = rgbOf(stop(C.lampGlow, 0)).join(','), LG1 = rgbOf(stop(C.lampGlow, 1)).join(',');
    S.onFrame((t) => {
      const c = S.camState, zf = S.clamp((c.z - 1) / 0.75), w = 0.45 + 0.4 * zf;
      let sx = S.lerp(975, c.x, w) + 34 * Math.sin(t * 0.52 + 0.8) + 12 * S.noise(t * 0.9, 21);
      let sy = S.lerp(525, c.y, w) + 20 * Math.sin(t * 0.37 + 2.1) + 8 * S.noise(t * 0.8, 22);
      let R = 430 + 560 / c.z;
      if (t > TSLAM) {
        const u = t - TSLAM, d = Math.exp(-u * 1.15);
        sx += 64 * d * Math.sin(u * 4.2); sy += 14 * d * Math.sin(u * 4.2 + 0.7);
        R -= 90 * S.ease('power2.inOut')(S.clamp(u / 1.2));
      }
      const fl = 1 - 0.035 * (0.5 + 0.5 * S.noise(t * 13, 5)) - 0.05 * Math.max(0, S.noise(t * 2.1, 9) - 0.4);
      const k = ([r, g, b]) => `rgb(${Math.round(r * fl)},${Math.round(g * fl)},${Math.round(b * fl)})`;
      const px = f1(sx - LX), py = f1(sy - LY);
      lightL.style.background = `radial-gradient(${(R * 1.32).toFixed(0)}px ${(R * 0.92).toFixed(0)}px at ${px}px ${py}px, ${k(LAMP[0])} 0%, ${k(LAMP[1])} 24%, ${k(LAMP[2])} 52%, ${k(LAMP[3])} 80%, ${k(LAMP[4])} 100%)`;
      glowL.style.background = `radial-gradient(circle ${(R * 0.55).toFixed(0)}px at ${px}px ${py}px, rgba(${LG0},${(0.1 * fl).toFixed(3)}) 0%, rgba(${LG1},0) 100%)`;
    });

    /* ---------- sound bed ---------- */
    S.sfx(0, 'drone', { dur: 8, freq: 41.2, cutoff: 280, air: 0.35, gain: 0.1 });
    S.sfx(0, 'wind', { dur: 2.6, gain: 0.035 });
    [1.08, 1.95, 2.82, 3.7, 4.78, 5.62].forEach((t, i) => S.sfx(t, 'heartbeat', { gain: 0.3 + i * 0.03 }));
    S.sfx(7.3, 'heartbeat', { gain: 0.22 });

    /* ---------- film finish ---------- */
    S.el('div', { style: `position:absolute;inset:0;background:${C.grade};mix-blend-mode:color;opacity:.14;pointer-events:none;` }, S.fx);
    S.vignette({ strength: 0.72, inner: 42 });
    S.grain({ opacity: 0.11 });
  },
});
