/* Gaming — Legendary Drop
   A loot card drops in spinning, climbs a rarity ladder (four tiers in the showcase), charges, flashes and flips
   to the item: a glitch-in name, a type line and counted stats. Card and item panel are DOM/SVG (3D flip);
   god-rays are conic gradients; sparks, implosion, shockwaves and embers are canvas particles with analytic
   motion. Every frame is a pure function of t and tween state.
   Content comes from params: the ladder, the card back, the item (name, type line, drawn icon, pips), the stats
   and the colours. Two colour families keep a re-theme to a couple of keys: `colors.theme` re-tints the scene's
   purples and `tiers[last].color` re-tints the reveal's gold (both are identity at their defaults). */
Reel.style({
  id: 'gaming-loot-reveal', seed: 'loot', order: 4,
  name: 'Loot Reveal',
  transIn: { type: 'zoom', dur: 0.5 },   // how a reel cuts INTO this piece (tools/new-reel.mjs); a reel item's trans overrides it
  niches: {
    primary: ['Gaming', 'RPG & looter games', 'Game item & patch breakdowns'],
    similar: ['Trading-card pack openings', 'Mobile gacha pulls', 'Fitness app rank-ups', 'Esports rank reveals', 'Creator milestones', 'Study & habit streaks', 'Fantasy sports player cards'],
  },
  niche: 'Gaming', title: 'Legendary Drop', duration: 7, poster: 6.6,
  bg: '#0A0614', palette: ['#FFB938', '#B04DFF', '#0A0614'],
  techniques: ['3D card flip with rarity escalation', 'Charge, white flash and particle burst', 'Glitch-in name with counted stats'],
  why: 'Four rarity steps turn the wait into a ladder the viewer has to see the top of, and the flash pays it off in a single frame.',
  facts: 'Fictional item, stats and drop rates.',
  defaults: {
    tiers: [                                   // bottom to top, 1–6 (3–5 read best); the last one is the reveal
      { name: 'COMMON', color: '#9AA0A6', chance: '62%' },
      { name: 'RARE', color: '#3D8BFF', chance: '24%' },
      { name: 'EPIC', color: '#B04DFF', chance: '8.5%' },
      { name: 'LEGENDARY', color: '#FFB938', chance: '0.4%' },
    ],
    chanceLabel: 'DROP CHANCE',                // under the ladder: label + the current tier's chance
    cardBack: { glyph: '?', label: 'LOOT DROP' },
    item: {
      name: 'VOIDREAVER',                      // decodes in with an RGB split
      type: 'TWO-HANDED GREATSWORD · ITEM LEVEL 60',
      icon: 'blade',                           // drawn art: blade | trophy | gem
      pips: 5,                                 // rarity pips under the art, 0–7
    },
    stats: [                                   // 0–4 rows; bar = value / max (nearest 1%)
      { label: 'DAMAGE', value: 1240, max: 1500, unit: '' },
      { label: 'CRIT CHANCE', value: 35, max: 100, unit: '%' },
      { label: 'ATTACK SPEED', value: 1.8, max: 3, unit: '' },
    ],
    badge: 'NEW!',                             // starburst on the card; "" hides it
    padNotes: [110, 130.8, 164.8, 196],
    droneHz: 49,
    chordNotes: [523.3, 659.3, 784, 1046.5],   // the reveal chord under the rarity line
    background: 'radial-gradient(95% 85% at 50% 44%, #1D1036 0%, #120A25 46%, #0A0614 100%)',
    colors: { theme: '#765CB0', flash: '#FFF8E8', ink: '#F6F0FF', muted: '#BBA9E8', dim: '#7A68A3', badge: '#FF2E63' },
  },
  build(S, P) {
    const tl = S.tl, W = 1920, H = 1080, TAU = Math.PI * 2;
    const { clamp, lerp } = S;
    const sm = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
    const C = P.colors, IT = P.item || {};
    const INK = C.ink, LAV = C.muted, DIMV = C.dim;
    const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
    const mix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const natural = (el) => { const w0 = el.style.width; el.style.width = 'max-content'; const w = el.offsetWidth; el.style.width = w0; return w; };
    const fitWidth = (el, maxW) => { const w = natural(el); if (w > maxW) { el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * maxW) / w + 'px'; return true; } return false; };
    const measure = (text, css) => { const e = S.el('span', { text, style: `position:absolute;left:0;top:0;white-space:nowrap;visibility:hidden;${css}` }, S.hud); const w = e.offsetWidth; e.remove(); return w; };

    /* ---------- colour families ---------- */
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
    // Shades drawn around the anchor `from`, re-tinted so the anchor lands on `to`: hue turns, saturation scales,
    // lightness is remapped around the anchor (white stays white). Unchanged anchor = identity, so defaults are exact.
    const family = (from, to) => {
      if (!to || String(from).toUpperCase() === String(to).toUpperCase()) return { rgb: (c) => c, hex: (h) => h };
      const A = toHsl(hex2rgb(from)), B = toHsl(hex2rgb(to));
      const L = (l) => (l <= A[2] ? (l * B[2]) / A[2] : B[2] + ((l - A[2]) * (1 - B[2])) / (1 - A[2]));
      const map = (c) => { const [h, s, l] = toHsl(c); return fromHsl([h + B[0] - A[0], clamp(A[1] ? (s * B[1]) / A[1] : B[1]), clamp(L(l))]); };
      return { rgb: map, hex: (h) => toHex(map(hex2rgb(h))) };
    };

    /* ---------- the rarity ladder: 1–6 tiers; timings and intensity derive from the count ---------- */
    const TL = (Array.isArray(P.tiers) && P.tiers.length ? P.tiers : [{ name: '', color: '#FFB938', chance: '' }]).slice(-6);
    const NT = TL.length, LAST = NT - 1;
    const rank = (i) => (LAST ? (i * 3) / LAST : 3);        // position on the showcase's 4-step ladder (0..3)
    const ladder = (arr, i) => { const p = rank(i), k = Math.floor(p), f = p - k; return k >= arr.length - 1 ? arr[arr.length - 1] : f ? arr[k] + (arr[k + 1] - arr[k]) * f : arr[k]; };
    const TONES = [587, 659.3, 740, 880, 987.8, 1175];       // D major; four tiers ring D F# A D
    const TIERS = TL.map((T, i) => ({
      name: String(T.name ?? ''), col: hex2rgb(T.color), chance: String(T.chance ?? ''),
      t: LAST ? +(0.8 + (i * 1.8) / LAST).toFixed(4) : 2.6,  // the ladder always spans 0.8 s → 2.6 s
      shake: ladder([3, 6, 10, 15], i), burst: Math.round(ladder([8, 18, 30, 50], i)), glow: ladder([20, 36, 54, 76], i),
      rays: ladder([0.16, 0.26, 0.38, 0.54], i), tone: TONES[Math.round(LAST ? (i * 5) / LAST : 5)], blip: ladder([0.9, 1.1, 1.35, 1.65], i),
    }));
    const TOPT = TIERS[LAST];
    const T_LAND = 0.52, T_CHARGE = 3.15, T_FLASH = 3.5, T_FLIP = 3.56, T_RAR = 3.9, T_NAME = 4.05, T_STATS = 4.5, T_NEW = 6.0;

    const TH = family('#765CB0', C.theme);                   // the scene's purples: card faces, motes, trail, panel, blade
    const TOP = family('#FFB938', TL[LAST].color);           // the reveal's gold: frame, metal, panel accents, embers, flash
    const PRE = hex2rgb(C.theme), WHITE = hex2rgb(C.flash);
    const GOLD = TL[LAST].color, G3 = TOPT.col;

    // rarity colour / glow / ray strength as a pure function of time
    function tierAt(t) {
      let col = PRE, glow = 10, rays = 0.1, idx = -1;
      for (let i = 0; i < NT; i++) {
        const T = TIERS[i], k = sm((t - T.t) / 0.14);
        if (k <= 0) break;
        col = mix(col, T.col, k); glow = lerp(glow, T.glow, k); rays = lerp(rays, T.rays, k); idx = i;
      }
      // each tier hit flashes the border toward white for a few frames
      for (const T of TIERS) { const u = t - T.t; if (u > 0 && u < 0.3) { const k = Math.exp(-u * 16) * (1 - Math.exp(-u * 90)); col = mix(col, WHITE, 0.7 * k); glow += 30 * k; } }
      const ch = sm((t - T_CHARGE) / (T_FLASH - T_CHARGE));
      if (ch > 0) { col = mix(col, WHITE, ch * 0.8); glow = lerp(glow, 130, ch); rays = lerp(rays, 0.85, ch); }
      const af = sm((t - T_FLASH) / 0.7);
      if (af > 0) { col = mix(col, TOPT.col, af); glow = lerp(glow, 56, af); rays = lerp(rays, 0.26, af); }
      return { idx, col, glow, rays };
    }

    /* ======================= backdrop ======================= */
    if (!S.alpha) S.root.style.background = P.background;
    S.camSet({ x: 960, y: 540, z: 1 });
    S.camTo(0, { z: 1.025 }, 3.1, 'sine.inOut');
    S.camTo(3.12, { z: 1.075 }, 0.38, 'power2.in');          // lean in on the charge
    S.camTo(3.5, { z: 1.0 }, 0.55, 'expo.out');               // snap back on the flash
    S.camTo(4.05, { z: 1.03, x: 968 }, 2.95, 'sine.inOut');

    const CX = 960, CY = 480, CW = 420, CH = 600;
    const FALL0 = -430;
    const CS = { x: 0, y: FALL0, s: 0.84, sx: 1, sy: 1, ry: -720, rz: -14 };   // card state (tweened)
    const cardCenter = () => ({ x: CX + CS.x, y: CY + CS.y });

    const bctx = S.canvas();                                   // motes behind everything
    // god-rays: two counter-rotating conic layers, masked to a soft ring
    const rayMask = 'radial-gradient(circle, rgba(0,0,0,0) 6%, #000 15%, rgba(0,0,0,.55) 33%, rgba(0,0,0,0) 58%)';
    const rays = [0, 1].map(() => S.el('div', { style: `position:absolute;left:${CX - 1400}px;top:${CY - 1400}px;width:2800px;height:2800px;border-radius:50%;-webkit-mask-image:${rayMask};mask-image:${rayMask};will-change:transform;` }));
    const floor = S.el('div', { style: 'position:absolute;left:0;top:0;width:1100px;height:220px;margin:-110px 0 0 -550px;border-radius:50%;' });
    const shadow = S.el('div', { style: 'position:absolute;left:0;top:0;width:520px;height:70px;margin:-35px 0 0 -260px;border-radius:50%;background:radial-gradient(closest-side, rgba(0,0,0,.6), rgba(0,0,0,0));' });

    /* ======================= the card ======================= */
    const cardPos = S.el('div', { style: `position:absolute;left:${CX}px;top:${CY}px;width:0;height:0;` });
    const persp = S.el('div', { style: `position:absolute;left:${-CW / 2}px;top:${-CH / 2}px;width:${CW}px;height:${CH}px;perspective:1800px;` }, cardPos);
    const sway = S.el('div', { style: 'position:absolute;left:0;top:0;width:100%;height:100%;transform-style:preserve-3d;' }, persp);
    const card = S.el('div', { style: 'position:absolute;left:0;top:0;width:100%;height:100%;transform-style:preserve-3d;' }, sway);
    const FACE = 'position:absolute;left:0;top:0;width:100%;height:100%;border-radius:26px;backface-visibility:hidden;-webkit-backface-visibility:hidden;';
    const faceA = S.el('div', { style: FACE }, card);
    const faceB = S.el('div', { style: FACE + 'transform:rotateY(180deg);' }, card);

    // SVG text that must fit a width: shrink the font, keep it optically centred on `cy` when given
    const fitSvgText = (el, maxW, cy) => {
      const w = el.getComputedTextLength();
      if (!(w > maxW)) return;
      const fs = (parseFloat(getComputedStyle(el).fontSize) * maxW) / w;
      el.style.fontSize = fs + 'px';
      if (cy != null) el.setAttribute('y', (cy + 0.357 * fs).toFixed(1));
    };
    const BACK = P.cardBack || {};
    let artN = 0;
    function backArt(parent) {
      const n = ++artN;
      const sv = S.s('svg', { width: CW, height: CH, viewBox: `0 0 ${CW} ${CH}` }, parent);
      sv.style.cssText = 'position:absolute;left:0;top:0;display:block;border-radius:26px;';
      const d = S.s('defs', null, sv);
      const bg = S.uid('bbg' + n), pat = S.uid('bpat' + n), halo = S.uid('bhalo' + n);
      const g = S.s('linearGradient', { id: bg, x1: 0, y1: 0, x2: 0.3, y2: 1 }, d);
      S.s('stop', { offset: 0, 'stop-color': TH.hex('#24133F') }, g); S.s('stop', { offset: 1, 'stop-color': TH.hex('#0D0719') }, g);
      const p = S.s('pattern', { id: pat, width: 18, height: 18, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, d);
      S.s('rect', { x: 0, y: 0, width: 2, height: 18, fill: '#FFFFFF', opacity: 0.05 }, p);
      const rg = S.s('radialGradient', { id: halo }, d);
      S.s('stop', { offset: 0, 'stop-color': 'currentColor', 'stop-opacity': 0.55 }, rg); S.s('stop', { offset: 1, 'stop-color': 'currentColor', 'stop-opacity': 0 }, rg);
      S.s('rect', { x: 0, y: 0, width: CW, height: CH, rx: 26, fill: `url(#${bg})` }, sv);
      S.s('rect', { x: 0, y: 0, width: CW, height: CH, rx: 26, fill: `url(#${pat})` }, sv);
      S.s('circle', { cx: 210, cy: 290, r: 190, fill: `url(#${halo})` }, sv);
      S.s('rect', { x: 3, y: 3, width: CW - 6, height: CH - 6, rx: 24, fill: 'none', stroke: 'currentColor', 'stroke-width': 6 }, sv);
      S.s('rect', { x: 18, y: 18, width: CW - 36, height: CH - 36, rx: 14, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6, opacity: 0.5 }, sv);
      [[18, 18, 1, 1], [CW - 18, 18, -1, 1], [18, CH - 18, 1, -1], [CW - 18, CH - 18, -1, -1]].forEach(([x, y, sx, sy]) =>
        S.s('path', { d: `M${x} ${y + sy * 46} L${x} ${y} L${x + sx * 46} ${y} M${x + sx * 10} ${y + sy * 10} l${sx * 14} ${sy * 14}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 4, 'stroke-linecap': 'round' }, sv));
      S.s('path', { d: 'M210 176 L324 290 L210 404 L96 290 Z', fill: rgba(TH.rgb([10, 6, 20]), '.55'), stroke: 'currentColor', 'stroke-width': 5, 'stroke-linejoin': 'round' }, sv);
      S.s('path', { d: 'M210 214 L286 290 L210 366 L134 290 Z', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, opacity: 0.55 }, sv);
      const q = S.s('text', { x: 210, y: 330, 'text-anchor': 'middle', fill: 'currentColor', style: 'font:400 112px "Anton",sans-serif;' }, sv); q.textContent = String(BACK.glyph ?? '');
      fitSvgText(q, 124, 290);
      const lt = S.s('text', { x: 210, y: 528, 'text-anchor': 'middle', fill: 'currentColor', opacity: 0.85, style: 'font:700 22px "Chakra Petch",sans-serif;letter-spacing:.34em;' }, sv); lt.textContent = String(BACK.label ?? '');
      fitSvgText(lt, 330);
      return sv;
    }
    backArt(faceA);
    const backCopy = backArt(faceB);

    // front: the revealed item
    const front = S.s('svg', { width: CW, height: CH, viewBox: `0 0 ${CW} ${CH}` }, faceB);
    front.style.cssText = 'position:absolute;left:0;top:0;display:block;border-radius:26px;opacity:0;';
    const fd = S.s('defs', null, front);
    const id = (k) => S.uid('f_' + k);
    const lin = (k, x2, y2, stops) => { const g = S.s('linearGradient', { id: id(k), x1: 0, y1: 0, x2, y2 }, fd); stops.forEach(([o, c, a]) => S.s('stop', { offset: o, 'stop-color': c, 'stop-opacity': a ?? 1 }, g)); return `url(#${id(k)})`; };
    const rad = (k, cx, cy, r, stops) => { const g = S.s('radialGradient', { id: id(k), cx, cy, r, gradientUnits: 'userSpaceOnUse' }, fd); stops.forEach(([o, c, a]) => S.s('stop', { offset: o, 'stop-color': c, 'stop-opacity': a ?? 1 }, g)); return `url(#${id(k)})`; };
    const fBg = rad('bg', 210, 250, 400, [[0, TH.hex('#4C2186')], [0.5, TH.hex('#1F0C3D')], [1, TH.hex('#0B0517')]]);
    const fHalo = rad('halo', 210, 240, 210, [[0, GOLD, 0.42], [1, GOLD, 0]]);
    const goldV = lin('gold', 0, 1, [[0, TOP.hex('#FFF0B8')], [0.45, TOP.hex('#FFC24A')], [1, TOP.hex('#A2650F')]]);
    const goldF = lin('goldf', 1, 1, [[0, TOP.hex('#FFE39A')], [0.5, TOP.hex('#E3A43A')], [1, TOP.hex('#FFE7A8')]]);
    const METAL_LINE = TOP.hex('#7A4A0C');
    const blur = S.s('filter', { id: id('blur'), x: '-50%', y: '-20%', width: '200%', height: '140%' }, fd); S.s('feGaussianBlur', { stdDeviation: 13 }, blur);
    const glowF = S.s('filter', { id: id('glow'), x: '-80%', y: '-80%', width: '260%', height: '260%' }, fd);
    S.s('feGaussianBlur', { stdDeviation: 2.6, result: 'b' }, glowF);
    const fm = S.s('feMerge', null, glowF); S.s('feMergeNode', { in: 'b' }, fm); S.s('feMergeNode', { in: 'b' }, fm); S.s('feMergeNode', { in: 'SourceGraphic' }, fm);
    S.s('rect', { x: 0, y: 0, width: CW, height: CH, rx: 26, fill: fBg }, front);
    const burstG = S.s('g', { opacity: 0.9 }, front);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * TAU, w = 0.07;
      S.s('path', { d: `M210 250 L${210 + Math.cos(a - w) * 460} ${250 + Math.sin(a - w) * 460} L${210 + Math.cos(a + w) * 460} ${250 + Math.sin(a + w) * 460} Z`, fill: TOP.hex('#FFD27A'), opacity: 0.075 }, burstG);
    }
    S.s('circle', { cx: 210, cy: 240, r: 210, fill: fHalo }, front);
    const artBob = S.s('g', {}, front);
    const art = S.s('g', { transform: 'translate(0 -4)' }, artBob);

    /* ---------- item art: each icon draws into the 420×600 card (art centred on x 210, y 60–560) and returns
       { aura, pulses }: the aura breathes, the pulses light up in a wave (bottom to top) ---------- */
    const ICONS = {
      // broad notched blade: dark left bevel, bright right bevel, glinting edges, rune-lit fuller, winged guard
      blade(g) {
        const bladeL = lin('bl', 1, 0.2, [[0, TH.hex('#2A0E55')], [1, TH.hex('#6B38D8')]]);
        const bladeR = lin('br', 1, 0.2, [[0, TH.hex('#9A6BFF')], [1, TH.hex('#EEE4FF')]]);
        const gemG = rad('gem', 206, 405, 16, [[0, TH.hex('#F4E4FF')], [0.45, TH.hex('#A45CFF')], [1, TH.hex('#3A0E80')]]);
        const BLADE = 'M210 48 L231 98 L241 150 L244 206 L233 220 L246 236 L247 300 L246 390 L174 390 L173 300 L174 236 L187 220 L176 206 L179 150 L189 98 Z';
        const aura = S.s('path', { d: BLADE, fill: TH.hex('#A45CFF'), filter: `url(#${id('blur')})`, opacity: 0.8, transform: 'translate(210 230) scale(1.18 1.05) translate(-210 -230)' }, g);
        S.s('path', { d: 'M210 48 L189 98 L179 150 L176 206 L187 220 L174 236 L173 300 L174 390 L210 390 Z', fill: bladeL }, g);
        S.s('path', { d: 'M210 48 L231 98 L241 150 L244 206 L233 220 L246 236 L247 300 L246 390 L210 390 Z', fill: bladeR }, g);
        S.s('path', { d: 'M210 50 L231 98 L241 150 L244 206', fill: 'none', stroke: '#FFFFFF', 'stroke-width': 2.4, opacity: 0.9, 'stroke-linecap': 'round' }, g);
        S.s('path', { d: 'M246 238 L247 300 L246 386', fill: 'none', stroke: TH.hex('#EDE4FF'), 'stroke-width': 2, opacity: 0.6, 'stroke-linecap': 'round' }, g);
        S.s('path', { d: 'M189 98 L179 150 L176 206', fill: 'none', stroke: TH.hex('#B58CFF'), 'stroke-width': 1.6, opacity: 0.55, 'stroke-linecap': 'round' }, g);
        S.s('path', { d: 'M210 58 L210 108', stroke: TH.hex('#F4EEFF'), 'stroke-width': 2, opacity: 0.7, 'stroke-linecap': 'round' }, g);
        S.s('rect', { x: 200, y: 112, width: 20, height: 268, rx: 10, fill: TH.hex('#140524'), opacity: 0.94 }, g);
        const RUNES = ['M-4 -9 L-4 9 M-4 -5 L4 -9 M-4 1 L4 -3', 'M0 -9 L0 9 M0 -2 L-5 -8 M0 -2 L5 -8', 'M0 -9 L5 -3 L0 3 L-5 -3 Z M-5 9 L0 3 L5 9', 'M-4 -9 L-4 9 M-4 -9 L3 -5 L-4 -1 L4 9', 'M0 -9 L0 9 M-5 -4 L0 -9 L5 -4', 'M-4 9 L-4 -9 L4 1 M4 9 L4 -9 L-4 1', 'M-3 -9 L-3 9 M-3 -4 L4 0 L-3 4'];
        const runes = RUNES.map((dd, i) => S.s('path', { d: dd, transform: `translate(210 ${134 + i * 38})`, fill: 'none', stroke: TH.hex('#8CF6FF'), 'stroke-width': 2.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', filter: `url(#${id('glow')})` }, g));
        // swept, winged crossguard with a gem plate
        S.s('path', { d: 'M84 368 C108 392 160 396 210 394 C260 396 312 392 336 368 C342 390 334 406 312 414 C276 422 248 420 230 434 L190 434 C172 420 144 422 108 414 C86 406 78 390 84 368 Z', fill: goldV, stroke: METAL_LINE, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, g);
        S.s('path', { d: 'M98 380 C130 400 170 404 210 403 C250 404 290 400 322 380', fill: 'none', stroke: TOP.hex('#FFF3C4'), 'stroke-width': 1.6, opacity: 0.7 }, g);
        S.s('path', { d: 'M176 396 L210 384 L244 396 L238 424 L210 434 L182 424 Z', fill: goldF, stroke: METAL_LINE, 'stroke-width': 1.4, 'stroke-linejoin': 'round' }, g);
        S.s('circle', { cx: 210, cy: 410, r: 12.5, fill: gemG, stroke: TOP.hex('#FFE7A8'), 'stroke-width': 2 }, g);
        S.s('circle', { cx: 205.5, cy: 405.5, r: 3.2, fill: '#FFFFFF', opacity: 0.9 }, g);
        const gripClip = id('grip');
        S.s('rect', { x: 198, y: 432, width: 24, height: 80, rx: 6 }, S.s('clipPath', { id: gripClip }, fd));
        S.s('rect', { x: 198, y: 432, width: 24, height: 80, rx: 6, fill: TH.hex('#2A1742') }, g);
        const wrap = S.s('g', { 'clip-path': `url(#${gripClip})` }, g);
        for (let i = 0; i < 8; i++) S.s('path', { d: `M190 ${436 + i * 12} L230 ${426 + i * 12}`, stroke: TH.hex('#5A3E84'), 'stroke-width': 5 }, wrap);
        S.s('path', { d: 'M210 504 L236 530 L210 558 L184 530 Z', fill: goldV, stroke: METAL_LINE, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, g);
        S.s('circle', { cx: 210, cy: 531, r: 8, fill: gemG }, g);
        return { aura, pulses: runes };
      },
      // trophy cup: cylinder-shaded bowl with handles, a bevelled star medallion, knotted stem and a dark plinth
      // with a gold nameplate; the studs around the lip pulse in a wave
      trophy(g) {
        const metalX = lin('tmx', 1, 0, [[0, TOP.hex('#7A4A0C')], [0.16, TOP.hex('#C98A22')], [0.46, TOP.hex('#FFC24A')], [0.64, TOP.hex('#FFF0B8')], [0.8, TOP.hex('#E3A43A')], [1, TOP.hex('#8A5510')]]);
        const inner = lin('tin', 0, 1, [[0, TH.hex('#140524')], [1, TOP.hex('#7A4A0C')]]);
        const plinth = lin('tpl', 0, 1, [[0, TH.hex('#2A1742')], [1, TH.hex('#0B0517')]]);
        const top = S.s('g', { transform: 'translate(210 322) scale(1.12) translate(-210 -300)' }, g);
        const BOWL = 'M112 116 L308 116 C308 214 276 284 228 306 L192 306 C144 284 112 214 112 116 Z';
        const aura = S.s('path', { d: BOWL, fill: TH.hex('#A45CFF'), filter: `url(#${id('blur')})`, opacity: 0.8, transform: 'translate(210 210) scale(1.16 1.1) translate(-210 -210)' }, top);
        // handles (behind the bowl): dark outline, metal body, glint
        [['M124 142 C62 132 50 204 92 228 C110 240 132 244 150 252'], ['M296 142 C358 132 370 204 328 228 C310 240 288 244 270 252']].forEach(([d]) => {
          S.s('path', { d, fill: 'none', stroke: METAL_LINE, 'stroke-width': 19, 'stroke-linecap': 'round' }, top);
          S.s('path', { d, fill: 'none', stroke: goldV, 'stroke-width': 13, 'stroke-linecap': 'round' }, top);
          S.s('path', { d, fill: 'none', stroke: TOP.hex('#FFF3C4'), 'stroke-width': 2.5, opacity: 0.55, 'stroke-linecap': 'round', transform: 'translate(0 -3)' }, top);
        });
        // stem, knot, collar and plinth
        S.s('path', { d: 'M198 318 L222 318 L230 372 L190 372 Z', fill: metalX, stroke: METAL_LINE, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, top);
        S.s('ellipse', { cx: 210, cy: 322, rx: 26, ry: 11, fill: goldF, stroke: METAL_LINE, 'stroke-width': 1.6 }, top);
        S.s('path', { d: 'M160 372 L260 372 L278 394 L142 394 Z', fill: metalX, stroke: METAL_LINE, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, top);
        S.s('rect', { x: 130, y: 394, width: 160, height: 70, fill: plinth, stroke: goldF, 'stroke-width': 4 }, top);
        S.s('rect', { x: 158, y: 412, width: 104, height: 34, rx: 3, fill: goldF, stroke: METAL_LINE, 'stroke-width': 1.4 }, top);
        [[174, 424, 72], [184, 434, 52]].forEach(([x, y, w]) => S.s('rect', { x, y, width: w, height: 3, rx: 1.5, fill: METAL_LINE, opacity: 0.55 }, top));
        S.s('rect', { x: 116, y: 464, width: 188, height: 18, rx: 4, fill: metalX, stroke: METAL_LINE, 'stroke-width': 1.6 }, top);
        // the bowl: cylinder shading, highlight streak, dark mouth and a gold lip
        S.s('path', { d: BOWL, fill: metalX, stroke: METAL_LINE, 'stroke-width': 2, 'stroke-linejoin': 'round' }, top);
        S.s('path', { d: 'M268 132 C272 190 262 244 236 286', fill: 'none', stroke: '#FFFFFF', 'stroke-width': 5, opacity: 0.55, 'stroke-linecap': 'round' }, top);
        S.s('path', { d: 'M136 140 C138 196 154 240 180 272', fill: 'none', stroke: TOP.hex('#FFE39A'), 'stroke-width': 2.5, opacity: 0.35, 'stroke-linecap': 'round' }, top);
        S.s('ellipse', { cx: 210, cy: 116, rx: 98, ry: 17, fill: inner }, top);
        S.s('ellipse', { cx: 210, cy: 116, rx: 98, ry: 17, fill: 'none', stroke: goldF, 'stroke-width': 8 }, top);
        S.s('ellipse', { cx: 210, cy: 116, rx: 98, ry: 17, fill: 'none', stroke: METAL_LINE, 'stroke-width': 1.4, opacity: 0.8 }, top);
        // star medallion
        S.s('circle', { cx: 210, cy: 200, r: 50, fill: rgba(TH.rgb([20, 5, 36]), '.55'), stroke: goldF, 'stroke-width': 5 }, top);
        const star = (k, r) => { const a = -Math.PI / 2 + (k * Math.PI) / 5; return [210 + Math.cos(a) * r, 200 + Math.sin(a) * r]; };
        for (let k = 0; k < 10; k++) {
          const [ax, ay] = star(k, k % 2 ? 16 : 38), [bx, by] = star(k + 1, (k + 1) % 2 ? 16 : 38);
          S.s('path', { d: `M210 200 L${ax.toFixed(1)} ${ay.toFixed(1)} L${bx.toFixed(1)} ${by.toFixed(1)} Z`, fill: TOP.hex(k % 2 ? '#E3A43A' : '#FFF3C4'), stroke: METAL_LINE, 'stroke-width': 0.8, 'stroke-linejoin': 'round' }, top);
        }
        // studs on the front of the lip
        const studs = [];
        for (let i = 0; i < 7; i++) { const a = ((160 - i * 20) * Math.PI) / 180; studs.push(S.s('circle', { cx: (210 + Math.cos(a) * 98).toFixed(1), cy: (116 + Math.sin(a) * 17).toFixed(1), r: 4.6, fill: TH.hex('#8CF6FF'), filter: `url(#${id('glow')})` }, top)); }
        return { aura, pulses: studs };
      },
      // brilliant-cut gem: shaded crown and pavilion facets, glass edges; white facet sheens shimmer in a wave
      gem(g) {
        const T1 = [140, 154], T2 = [210, 154], T3 = [280, 154], G0 = [66, 222], G1 = [138, 222], G2 = [210, 222], G3 = [282, 222], G4 = [354, 222], K = [210, 452];
        const GP = [66, 102, 138, 174, 210, 246, 282, 318, 354].map((x) => [x, 222]);   // girdle points of the pavilion
        const FACETS = [
          [[G0, T1, G1], '#A2650F'], [[T1, G2, G1], '#E3A43A'], [[T1, T2, G2], '#FFE39A'], [[T2, T3, G2], '#FFF0B8'], [[T3, G3, G2], '#FFC24A'], [[T3, G4, G3], '#FFE39A'],
          ...['#7A4A0C', '#A2650F', '#C98A22', '#8A5510', '#FFC24A', '#E3A43A', '#FFE39A', '#C98A22'].map((c, i) => [[GP[i], GP[i + 1], K], c]),
        ];
        const pts = (P3) => P3.map(([x, y]) => `${x},${y}`).join(' ');
        const OUT = pts([G0, T1, T3, G4, K]);
        const aura = S.s('polygon', { points: OUT, fill: TH.hex('#A45CFF'), filter: `url(#${id('blur')})`, opacity: 0.8, transform: 'translate(210 300) scale(1.14 1.1) translate(-210 -300)' }, g);
        S.s('polygon', { points: OUT, fill: 'none', stroke: METAL_LINE, 'stroke-width': 8, 'stroke-linejoin': 'round' }, g);
        FACETS.forEach(([P3, c]) => S.s('polygon', { points: pts(P3), fill: TOP.hex(c), stroke: TOP.hex('#FFF3C4'), 'stroke-width': 1.2, 'stroke-opacity': 0.5, 'stroke-linejoin': 'round' }, g));
        const sheens = FACETS.map(([P3]) => S.s('polygon', { points: pts(P3), fill: '#FFFFFF', 'fill-opacity': 0.2 }, S.s('g', {}, g)).parentNode);
        S.s('polygon', { points: OUT, fill: 'none', stroke: TOP.hex('#FFF3C4'), 'stroke-width': 2.2, 'stroke-linejoin': 'round', opacity: 0.85 }, g);
        S.s('path', { d: 'M154 166 L198 166', stroke: '#FFFFFF', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.85 }, g);
        S.s('path', { d: 'M226 262 L214 380', stroke: '#FFFFFF', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.5 }, g);
        S.s('path', { d: 'M0 -18 L3.2 -3.2 L18 0 L3.2 3.2 L0 18 L-3.2 3.2 L-18 0 L-3.2 -3.2 Z', fill: '#FFFFFF', transform: 'translate(270 160)' }, g);
        return { aura, pulses: sheens };
      },
    };
    const ICON = (ICONS[IT.icon] || ICONS.blade)(art);
    // frame, gem, rarity pips
    S.s('rect', { x: 4, y: 4, width: CW - 8, height: CH - 8, rx: 23, fill: 'none', stroke: goldF, 'stroke-width': 7 }, front);
    S.s('rect', { x: 18, y: 18, width: CW - 36, height: CH - 36, rx: 14, fill: 'none', stroke: TOP.hex('#FFD27A'), 'stroke-width': 1.5, opacity: 0.5 }, front);
    [[18, 18], [CW - 18, 18], [18, CH - 18], [CW - 18, CH - 18]].forEach(([x, y]) => S.s('path', { d: `M${x} ${y - 9} L${x + 9} ${y} L${x} ${y + 9} L${x - 9} ${y} Z`, fill: goldV }, front));
    S.s('path', { d: 'M210 2 L226 18 L210 34 L194 18 Z', fill: goldV, stroke: METAL_LINE, 'stroke-width': 1.5 }, front);
    const NPIP = clamp(Math.round(+(IT.pips ?? 5) || 0), 0, 7);
    for (let i = 0; i < NPIP; i++) S.s('path', { d: `M${166 + (5 - NPIP) * 11 + i * 22} 570 l7 -7 l7 7 l-7 7 Z`, fill: goldV }, front);
    const sparkles = [[88, 120, 1], [338, 170, 0.8], [96, 330, 0.7], [330, 360, 1.1], [300, 96, 0.6]].map(([x, y, s], i) =>
      S.s('path', { d: 'M0 -12 L2.2 -2.2 L12 0 L2.2 2.2 L0 12 L-2.2 2.2 L-12 0 L-2.2 -2.2 Z', fill: TOP.hex('#FFF3D0'), transform: `translate(${x} ${y}) scale(${s})`, 'data-k': i }, front));

    /* ======================= particles (front canvas) ======================= */
    const fctx = S.canvas();
    const SPARKS = [];
    function burst(t0, n, o) {
      for (let i = 0; i < n; i++) {
        let x0, y0, dx, dy;
        if (o.edge) {                                   // spawn on the card's outline, fly outward
          const side = S.rand() * 4 | 0, k = S.rnd(-1, 1);
          if (side === 0) { x0 = k * CW / 2; y0 = -CH / 2; } else if (side === 1) { x0 = k * CW / 2; y0 = CH / 2; } else if (side === 2) { x0 = -CW / 2; y0 = k * CH / 2; } else { x0 = CW / 2; y0 = k * CH / 2; }
          const a = Math.atan2(y0 * 0.7, x0) + S.rnd(-0.5, 0.5); dx = Math.cos(a); dy = Math.sin(a);
        } else { const a = S.rnd(0, TAU); dx = Math.cos(a); dy = Math.sin(a); x0 = dx * S.rnd(0, 60); y0 = dy * S.rnd(0, 90); }
        const v = S.rnd(o.v[0], o.v[1]);
        SPARKS.push({ t0: t0 + S.rnd(0, o.spread || 0), x0: (o.cx ?? CX) + x0, y0: (o.cy ?? CY) + y0, vx: dx * v, vy: dy * v - (o.lift || 0), k: S.rnd(o.drag[0], o.drag[1]), g: o.g ?? 260, life: S.rnd(o.life[0], o.life[1]), w: S.rnd(o.w[0], o.w[1]), col: o.cols[(S.rand() * o.cols.length) | 0], st: o.streak ?? 0.03 });
      }
    }
    // landing dust along the floor
    const DUST = TH.rgb([190, 160, 255]);
    for (let i = 0; i < 26; i++) { const dir = i % 2 ? 1 : -1, v = S.rnd(160, 520); SPARKS.push({ t0: T_LAND, x0: CX + dir * S.rnd(40, 200), y0: CY + CH / 2 + S.rnd(-6, 8), vx: dir * v, vy: -S.rnd(10, 90), k: S.rnd(3, 5), g: 120, life: S.rnd(0.4, 0.8), w: S.rnd(2, 4), col: DUST, st: 0.02 }); }
    TIERS.forEach((T, i) => { const r = rank(i); burst(T.t, T.burst, { edge: true, v: [240 + r * 80, 620 + r * 160], drag: [2.6, 4.2], life: [0.45, 0.8 + r * 0.12], w: [1.6, 3 + r * 0.5], cols: [T.col, mix(T.col, WHITE, 0.6)], g: 180 }); });
    burst(T_FLASH, 170, { v: [500, 1900], drag: [2, 3.6], life: [0.7, 1.6], w: [2, 5], cols: [TOP.rgb([255, 214, 120]), TOP.rgb([255, 246, 220]), G3, TH.rgb([196, 120, 255])], g: 380, streak: 0.04 });
    const IMPLODE = [], IMPC = [TOP.rgb([255, 214, 140]), TOP.rgb([255, 250, 236])];
    for (let i = 0; i < 90; i++) IMPLODE.push({ a: S.rnd(0, TAU), r0: S.rnd(480, 940), ts: T_CHARGE - 0.1 + S.rnd(0, 0.18), sw: S.rnd(0.5, 1.3), w: S.rnd(1.5, 3.5), col: S.rand() < 0.5 ? IMPC[0] : IMPC[1] });
    const EMBERS = [];
    for (let i = 0; i < 46; i++) EMBERS.push({ t0: 3.7 + S.rnd(0, 3.3), x: S.rnd(-260, 260), y: S.rnd(-120, 320), v: S.rnd(40, 110), life: S.rnd(1.2, 2.2), amp: S.rnd(6, 22), f: S.rnd(1, 2.6), w: S.rnd(1.5, 3.2), k: i * 13 });
    const RINGS = [
      { t0: T_LAND, dur: 0.6, r0: 80, r1: 560, sq: 0.18, w: 6, col: TH.rgb([190, 150, 255]), floor: true },
      ...TIERS.map((T, i) => ({ t0: T.t, dur: 0.55, r0: 250, r1: 560 + rank(i) * 120, sq: 1, w: 5 + rank(i) * 2, col: T.col })),
      { t0: T_FLASH, dur: 0.85, r0: 120, r1: 1500, sq: 1, w: 22, col: TOP.rgb([255, 236, 190]) },
    ];
    const MOTES = [];
    for (let i = 0; i < 90; i++) MOTES.push({ x: S.rnd(0, W), y: S.rnd(0, H), v: S.rnd(10, 38), amp: S.rnd(8, 30), f: S.rnd(0.2, 0.7), ph: S.rnd(0, TAU), w: S.rnd(0.8, 2.6), a: S.rnd(0.2, 0.7), k: i * 7 });
    const MOTE_A = TH.rgb([200, 170, 255]), MOTE_B = TH.rgb([205, 180, 255]), TRAIL_A = TH.rgb([190, 160, 255]), TRAIL_B = TH.rgb([215, 195, 255]);
    const GDUST = TOP.rgb([255, 196, 90]).join(','), EMB_A = TOP.rgb([255, 190, 90]).join(','), EMB_B = TOP.rgb([255, 232, 170]).join(',');

    function drawBack(t, cc, T) {
      bctx.clearRect(0, 0, W, H);
      bctx.globalCompositeOperation = 'lighter';
      const legend = sm((t - 2.6) / 0.4);                    // the top tier always lands at 2.6 s
      for (const m of MOTES) {
        const y = ((m.y - m.v * t) % (H + 40) + H + 40) % (H + 40) - 20, x = m.x + m.amp * Math.sin(m.f * t + m.ph);
        const a = m.a * (0.6 + 0.4 * S.noise(t * 1.4 + m.k, 3));
        const c = m.k % 3 === 0 ? mix(MOTE_A, T.col, 0.6) : MOTE_B;
        bctx.fillStyle = rgba(c, a * 0.18); bctx.beginPath(); bctx.arc(x, y, m.w * 3.2, 0, TAU); bctx.fill();
        bctx.fillStyle = rgba(c, a); bctx.beginPath(); bctx.arc(x, y, m.w, 0, TAU); bctx.fill();
      }
      if (legend > 0) {                                        // gold dust joins once it hits the top tier
        for (let i = 0; i < 30; i++) {
          const m = MOTES[i], y = ((m.y * 0.7 + 300 - m.v * 2.2 * t) % (H + 40) + H + 40) % (H + 40) - 20, x = m.x * 0.6 + 380 + m.amp * Math.sin(m.f * 1.6 * t + m.ph);
          bctx.fillStyle = `rgba(${GDUST},${(0.55 * legend * (0.5 + 0.5 * S.noise(t * 2 + i, 8))).toFixed(3)})`;
          bctx.beginPath(); bctx.arc(x, y, m.w * 0.9, 0, TAU); bctx.fill();
        }
      }
      bctx.globalCompositeOperation = 'source-over';
    }

    function drawFront(t, cc, T) {
      fctx.clearRect(0, 0, W, H);
      fctx.globalCompositeOperation = 'lighter';
      fctx.lineCap = 'round';
      // light trail behind the falling card
      if (t < T_LAND + 0.08) {
        const p = clamp(t / T_LAND), v = (-FALL0 * 2 * p) / T_LAND, L = v * 0.16 * (1 - sm((t - T_LAND) / 0.08));
        if (L > 2) {
          const top = cc.y - (CH / 2) * CS.s;
          [[0.42, 0.34, 1], [0.2, 0.4, 1.25], [0.03, 0.6, 1.5]].forEach(([hw, a, lk]) => {
            const g = fctx.createLinearGradient(0, top - L * lk, 0, top + 30);
            g.addColorStop(0, rgba(TRAIL_A, 0)); g.addColorStop(1, rgba(TRAIL_B, a));
            fctx.fillStyle = g; fctx.beginPath();
            fctx.moveTo(cc.x - CW * hw, top + 30); fctx.lineTo(cc.x - CW * hw * 0.25, top - L * lk); fctx.lineTo(cc.x + CW * hw * 0.25, top - L * lk); fctx.lineTo(cc.x + CW * hw, top + 30);
            fctx.closePath(); fctx.fill();
          });
        }
      }
      // shockwave rings
      for (const R of RINGS) {
        const u = (t - R.t0) / R.dur;
        if (u < 0 || u > 1) continue;
        const e = 1 - Math.pow(1 - u, 3), r = lerp(R.r0, R.r1, e), cx = R.floor ? CX : cc.x, cy = R.floor ? CY + CH / 2 + 6 : cc.y;
        fctx.strokeStyle = rgba(R.col, 0.75 * Math.pow(1 - u, 1.6)); fctx.lineWidth = R.w * (1 - u) + 1;
        fctx.beginPath(); fctx.ellipse(cx, cy, r, r * R.sq * (R.floor ? 1 : 1.25), 0, 0, TAU); fctx.stroke();
      }
      // ballistic sparks with velocity streaks: x = x0 + v(1 - e^-ku)/k, gravity on y
      for (const p of SPARKS) {
        const u = t - p.t0;
        if (u < 0 || u > p.life) continue;
        const ek = Math.exp(-p.k * u), e = (1 - ek) / p.k;
        const x = p.x0 + p.vx * e, y = p.y0 + p.vy * e + 0.5 * p.g * u * u;
        const vx = p.vx * ek, vy = p.vy * ek + p.g * u, a = Math.pow(1 - u / p.life, 1.4);
        fctx.strokeStyle = rgba(p.col, a); fctx.lineWidth = p.w * (0.6 + 0.4 * a);
        fctx.beginPath(); fctx.moveTo(x - vx * p.st, y - vy * p.st); fctx.lineTo(x, y); fctx.stroke();
      }
      // charge: particles spiral into the card
      for (const p of IMPLODE) {
        const span = T_FLASH - p.ts, u = (t - p.ts) / span;
        if (u < 0 || u >= 1) continue;
        const f = (q) => { const e = q * q * q; return [cc.x + Math.cos(p.a + p.sw * q) * p.r0 * (1 - e), cc.y + Math.sin(p.a + p.sw * q) * p.r0 * (1 - e) * 0.8]; };
        const [x, y] = f(u), [px, py] = f(Math.max(0, u - 0.07)), a = sm(u * 4) * (1 - sm((u - 0.9) / 0.1));
        fctx.strokeStyle = rgba(p.col, a); fctx.lineWidth = p.w;
        fctx.beginPath(); fctx.moveTo(px, py); fctx.lineTo(x, y); fctx.stroke();
      }
      // embers rising off the revealed card
      for (const m of EMBERS) {
        const u = (t - m.t0) / m.life;
        if (u < 0 || u > 1) continue;
        const x = cc.x + m.x + m.amp * Math.sin(m.f * (t - m.t0) * 3 + m.k), y = cc.y + m.y - m.v * (t - m.t0);
        const a = Math.sin(Math.PI * u) * (0.55 + 0.45 * S.noise(t * 6 + m.k, 17));
        fctx.fillStyle = `rgba(${EMB_A},${(a * 0.25).toFixed(3)})`; fctx.beginPath(); fctx.arc(x, y, m.w * 3, 0, TAU); fctx.fill();
        fctx.fillStyle = `rgba(${EMB_B},${a.toFixed(3)})`; fctx.beginPath(); fctx.arc(x, y, m.w, 0, TAU); fctx.fill();
      }
      fctx.globalCompositeOperation = 'source-over';
    }

    /* ======================= rarity label under the card ======================= */
    const labBox = S.el('div', { style: `position:absolute;left:${CX}px;top:${CY + CH / 2 + 34}px;width:0;height:0;` });
    const tierEls = TIERS.map((T) => S.el('div', { text: T.name, style: `position:absolute;left:0;top:0;transform:translateX(-50%);font:400 86px/1 "Anton",sans-serif;letter-spacing:.06em;color:${rgba(T.col, 1)};white-space:nowrap;text-shadow:0 0 26px ${rgba(T.col, 0.75)},0 0 70px ${rgba(T.col, 0.4)};` }, labBox));
    tierEls.forEach((e) => fitWidth(e, 1180));
    const tierInner = tierEls.map((e) => { const t = e.textContent; e.textContent = ''; return S.el('span', { text: t, style: 'display:inline-block;' }, e); });
    const chance = S.el('div', { style: `position:absolute;left:0;top:104px;transform:translateX(-50%);font:600 26px "Chakra Petch",sans-serif;letter-spacing:.2em;color:${LAV};white-space:nowrap;` }, labBox);
    S.el('span', { text: `${P.chanceLabel ?? ''}  `, style: `color:${DIMV};` }, chance);
    const chanceV = S.el('span', { text: '', style: `color:${INK};font-weight:700;` }, chance);
    chanceV.textContent = TIERS.reduce((a, T) => (T.chance.length > a.length ? T.chance : a), '');
    fitWidth(chance, 1180);
    chanceV.textContent = '';
    if (!P.chanceLabel && TIERS.every((T) => !T.chance)) chance.style.display = 'none';
    TIERS.forEach((T, i) => {
      tl.fromTo(tierInner[i], { scale: 1.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.32, ease: 'back.out(2.2)' }, T.t);
      const tOut = i < LAST ? TIERS[i + 1].t : T_FLASH;
      tl.to(tierInner[i], { scale: i < LAST ? 0.82 : 1.25, opacity: 0, y: i < LAST ? -14 : 0, duration: i < LAST ? 0.1 : 0.08, ease: 'power2.in' }, tOut - (i < LAST ? 0.06 : 0));
    });
    tl.fromTo(chance, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'expo.out' }, 0.86);
    tl.to(chance, { opacity: 0, duration: 0.1 }, T_FLASH - 0.04);

    /* ======================= item panel ======================= */
    // The tooltip is vertically centred on the card's final spot (y 540); its height follows the content
    // (name size, 0–4 stat rows) and is 676 px for the showcase layout.
    const PX = 916, PW = 840;
    const tip = S.el('div', { style: `position:absolute;left:${PX - 44}px;top:0px;width:938px;height:676px;border-radius:22px;background:linear-gradient(160deg,${rgba(TH.rgb([28, 14, 52]), '.86')},${rgba(TH.rgb([12, 6, 26]), '.9')});box-shadow:0 30px 80px rgba(0,0,0,.55),inset 0 0 0 1.5px ${rgba(G3, '.28')};transform-origin:0 50%;` });
    S.el('div', { style: `position:absolute;left:0;top:0;width:100%;height:5px;border-radius:22px 22px 0 0;background:linear-gradient(90deg,${GOLD},${rgba(G3, '.15')});` }, tip);
    [[0, 0, 1, 1], [1, 0, -1, 1], [0, 1, 1, -1], [1, 1, -1, -1]].forEach(([ax, ay]) => S.el('div', { style: `position:absolute;${ax ? 'right' : 'left'}:10px;${ay ? 'bottom' : 'top'}:10px;width:22px;height:22px;border-${ax ? 'right' : 'left'}:3px solid ${GOLD};border-${ay ? 'bottom' : 'top'}:3px solid ${GOLD};opacity:.8;` }, tip));
    tl.fromTo(tip, { opacity: 0, scaleX: 0.92, x: -24 }, { opacity: 1, scaleX: 1, x: 0, duration: 0.55, ease: 'expo.out' }, 3.82);
    S.sfx(3.82, 'swoosh', { gain: 0.2, pitch: 0.8 });
    const panel = S.el('div', { style: `position:absolute;left:${PX}px;top:0px;width:880px;` });
    const dia = (c) => `<svg viewBox="0 0 20 20" style="width:.5em;height:.5em;vertical-align:.08em;overflow:visible"><path d="M10 0 L20 10 L10 20 L0 10 Z" fill="${c}"/></svg>`;
    const rar = S.el('div', { style: `display:flex;align-items:center;gap:18px;font:700 42px/1 "Chakra Petch",sans-serif;letter-spacing:.34em;filter:drop-shadow(0 0 14px ${rgba(G3, '.55')});` }, panel);
    S.el('span', { html: dia(GOLD) }, rar);
    const shine = S.el('span', { text: TOPT.name, style: `background:linear-gradient(100deg,${TOP.hex('#E0A22E')} 0%,${TOP.hex('#FFC53D')} 38%,${TOP.hex('#FFE9A8')} 45%,#FFFFFF 50%,${TOP.hex('#FFE9A8')} 55%,${TOP.hex('#FFC53D')} 62%,${TOP.hex('#E0A22E')} 100%);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;padding-right:.1em;` }, rar);
    S.el('span', { html: dia(GOLD), style: 'margin-left:-.3em;' }, rar);
    fitWidth(rar, PW);
    // name: one line at 150 px; too wide, it shrinks, and a long multi-word name that would drop under 90 px
    // breaks onto two balanced lines instead (up to 108 px each)
    let NAME = String(IT.name ?? '');
    const nameWrap = S.el('div', { style: 'position:relative;margin-top:18px;height:150px;' }, panel);
    const NAME_FONT = 'font:400 150px/1 "Anton",sans-serif;letter-spacing:.015em;';
    const NAME_STYLE = `position:absolute;left:0;top:0;${NAME_FONT}color:${INK};white-space:nowrap;`;
    const nameEl = S.el('div', { text: NAME, style: NAME_STYLE }, nameWrap);
    const slices = [0, 1].map((i) => S.el('div', { text: NAME, style: NAME_STYLE + `color:${i ? '#7DF9FF' : '#FF3D8B'};opacity:0;` }, nameWrap));
    let nameH = 150;
    const nw = natural(nameEl);
    if (nw > PW) {
      let fs = (150 * PW) / nw, lh = 1, lines = 1;
      if (fs < 90) {
        let best = null;
        for (let k = NAME.indexOf(' '); k > 0; k = NAME.indexOf(' ', k + 1)) {
          const w = Math.max(measure(NAME.slice(0, k), NAME_FONT), measure(NAME.slice(k + 1), NAME_FONT));
          if (!best || w < best.w) best = { k, w };
        }
        const f2 = best ? Math.min(108, (150 * PW) / best.w) : 0;
        if (f2 > fs * 1.15) { NAME = NAME.slice(0, best.k) + '\n' + NAME.slice(best.k + 1); fs = f2; lh = 0.96; lines = 2; }
      }
      [nameEl, ...slices].forEach((e) => { e.textContent = NAME; e.style.fontSize = fs + 'px'; e.style.lineHeight = lh; if (lines > 1) e.style.whiteSpace = 'pre'; });
      nameH = fs * lh * lines;
      nameWrap.style.height = nameH + 'px';
    }
    const TYPE = String(IT.type ?? '');
    const sub = S.el('div', { text: TYPE, style: `margin-top:18px;font:500 26px "Chakra Petch",sans-serif;letter-spacing:.18em;color:${LAV};white-space:nowrap;` }, panel);
    const subH = sub.offsetHeight;
    let subCut = 0;
    if (!TYPE) { sub.style.display = 'none'; subCut = 18 + subH; }   // no type line: close the gap
    else if (fitWidth(sub, PW)) sub.style.height = subH + 'px';       // keep the row height when the text shrinks
    const rule = S.el('div', { style: `margin-top:26px;width:840px;height:2px;background:linear-gradient(90deg,${rgba(G3, '.9')},${rgba(G3, 0)});transform-origin:0 50%;` }, panel);
    // stats: 0–4 rows; the stagger spreads over the same 4.56 → 5.24 s window whatever the count
    const STATS = (Array.isArray(P.stats) ? P.stats : []).slice(0, 4);
    const NS = STATS.length, SGAP = NS > 1 ? 0.68 / (NS - 1) : 0;
    const statBox = S.el('div', { style: 'margin-top:22px;width:840px;' }, panel);
    STATS.forEach((st, i) => {
      const t = +(4.56 + i * SGAP).toFixed(4);
      const to = +st.value || 0, dec = st.decimals ?? (String(st.value).split('.')[1] || '').length;
      const frac = clamp(Math.round((to / (+st.max || to || 1)) * 100) / 100);
      const pre = String(st.prefix ?? ''), unit = String(st.unit ?? '');
      const row = S.el('div', { style: `position:relative;height:88px;${i ? 'margin-top:6px;' : ''}` }, statBox);
      const lab = S.el('div', { text: String(st.label ?? ''), style: `position:absolute;left:0;top:14px;font:700 28px "Chakra Petch",sans-serif;letter-spacing:.16em;color:${LAV};white-space:nowrap;` }, row);
      const val = S.el('div', { text: pre + S.fmt(to, dec) + unit, style: `position:absolute;right:0;top:0;font:400 54px/1 "Anton",sans-serif;letter-spacing:.02em;color:${INK};font-variant-numeric:tabular-nums;white-space:nowrap;` }, row);
      fitWidth(lab, PW - val.offsetWidth - 28);
      val.textContent = '0';
      const track = S.el('div', { style: 'position:absolute;left:0;top:64px;width:840px;height:14px;border-radius:7px;background:rgba(255,255,255,.07);box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);' }, row);
      const fill = S.el('div', { style: `position:absolute;left:0;top:0;width:840px;height:14px;border-radius:7px;background:linear-gradient(90deg,${TOP.hex('#A8620E')},${GOLD} 70%,${TOP.hex('#FFE9B0')});box-shadow:0 0 18px ${rgba(G3, '.6')};transform-origin:0 50%;transform:scaleX(0);` }, track);
      const sep = TH.rgb([10, 6, 20]);
      S.el('div', { style: `position:absolute;inset:0;border-radius:7px;background:repeating-linear-gradient(90deg,${rgba(sep, 0)} 0 80px,${rgba(sep, '.55')} 80px 84px);` }, track);
      tl.fromTo(row, { opacity: 0, x: 46 }, { opacity: 1, x: 0, duration: 0.45, ease: 'expo.out' }, t - 0.08);
      tl.fromTo(fill, { scaleX: 0 }, { scaleX: frac, duration: 0.8, ease: 'power3.out' }, t);
      S.count(val, { from: 0, to, t, dur: 0.8, ease: 'power3.out', decimals: dec, prefix: pre, suffix: unit });
      S.sfx(t - 0.06, 'swoosh', { gain: 0.16, pitch: 1.2 });
      S.sfx(t, 'ratchet', { count: 9, gap: 0.05, gain: 0.12 });
      S.sfx(t + 0.62, 'blip', { pitch: 1.2 + i * 0.25, gain: 0.2 });
    });
    // size and centre the tooltip on the content
    const tipH = 676 + (nameH - 150) - subCut + (NS ? NS * 94 - 6 : 0) - 276, tipTop = 540 - tipH / 2;
    tip.style.top = tipTop + 'px'; tip.style.height = tipH + 'px';
    panel.style.top = tipTop + 50 + 'px';
    tl.fromTo(rar, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.5, ease: 'expo.out' }, T_RAR);
    tl.fromTo(sub, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: 'expo.out' }, 4.32);
    tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'expo.out' }, 4.42);

    // NEW! badge, pinned to the card's top-right corner (outside the 3D flip)
    const BADGE = String(P.badge ?? '');
    const BD = family('#FF2E63', C.badge);
    const badge = S.el('div', { style: 'position:absolute;left:0;top:0;width:0;height:0;' }, cardPos);
    const badgeIn = S.el('div', { style: `position:absolute;left:${CW / 2 - 70}px;top:${-CH / 2 - 44}px;width:140px;height:140px;` }, badge);
    if (BADGE) {
      let star = '';
      for (let i = 0; i < 28; i++) { const a = (i / 28) * TAU - Math.PI / 2, r = i % 2 ? 54 : 68; star += (i ? 'L' : 'M') + (70 + Math.cos(a) * r).toFixed(1) + ' ' + (70 + Math.sin(a) * r).toFixed(1); }
      // the word fits the star's inner disc: one line up to 104 px, else two balanced lines up to 88 px
      const BF = "'Anton',sans-serif;letter-spacing:.03em;", bm = (s) => measure(s, `font:400 40px/1 ${BF}`), bw = bm(BADGE);
      let bHtml = esc(BADGE), bSize = 40, bLh = '1';
      if (bw > 104) {
        let best = null;
        for (let k = BADGE.indexOf(' '); k > 0; k = BADGE.indexOf(' ', k + 1)) { const w = Math.max(bm(BADGE.slice(0, k)), bm(BADGE.slice(k + 1))); if (!best || w < best.w) best = { k, w }; }
        if (best) { bSize = Math.min(40, (40 * 88) / best.w); bHtml = `${esc(BADGE.slice(0, best.k))}<br>${esc(BADGE.slice(best.k + 1))}`; bLh = '.92'; }
        else bSize = (40 * 104) / bw;
      }
      badgeIn.innerHTML = `<svg viewBox="0 0 140 140" width="140" height="140" style="position:absolute;left:0;top:0;overflow:visible;filter:drop-shadow(0 6px 16px ${rgba(BD.rgb([255, 40, 100]), '.55')})"><path d="${star}Z" fill="${BD.hex('#FF2E63')}" stroke="#FFFFFF" stroke-width="4" stroke-linejoin="round"/></svg><div style="position:absolute;left:0;top:0;width:140px;height:140px;display:flex;align-items:center;justify-content:center;${bLh === '1' ? '' : 'text-align:center;'}font:400 ${+bSize.toFixed(2)}px/${bLh} ${BF}color:#fff;">${bHtml}</div>`;
      tl.fromTo(badgeIn, { scale: 0, rotation: -70, opacity: 0 }, { scale: 1, rotation: -14, opacity: 1, duration: 0.55, ease: 'back.out(3)' }, T_NEW);
    }

    // flash overlay (above everything, under the grain)
    const flash = S.el('div', { style: `position:absolute;left:0;top:0;width:1920px;height:1080px;background:radial-gradient(circle at 50% 45%, #FFFFFF 0%, ${TOP.hex('#FFF4DC')} 60%, ${TOP.hex('#FFE2A8')} 100%);opacity:0;` }, S.fx);

    /* ======================= card motion ======================= */
    tl.to(CS, { y: 0, s: 1, duration: T_LAND, ease: 'power2.in' }, 0);
    tl.to(CS, { ry: 0, duration: 0.64, ease: 'power2.out' }, 0);
    tl.to(CS, { rz: 0, duration: 0.6, ease: 'power2.out' }, 0);
    tl.to(CS, { y: -30, duration: 0.12, ease: 'power2.out' }, T_LAND);
    tl.to(CS, { y: 0, duration: 0.13, ease: 'power2.in' }, T_LAND + 0.12);
    tl.to(CS, { sx: 1.08, sy: 0.9, duration: 0.045, ease: 'power2.out' }, T_LAND);
    tl.to(CS, { sx: 1, sy: 1, duration: 0.5, ease: 'elastic.out(1,0.45)' }, T_LAND + 0.045);
    tl.to(CS, { s: 0.95, duration: T_FLASH - T_CHARGE, ease: 'power2.in' }, T_CHARGE);        // anticipation squeeze
    tl.to(CS, { s: 1.07, duration: 0.07, ease: 'power2.out' }, T_FLASH);
    tl.to(CS, { s: 1, duration: 0.6, ease: 'elastic.out(1,0.5)' }, T_FLASH + 0.07);
    tl.to(CS, { ry: 180, duration: 0.62, ease: 'back.out(1.5)' }, T_FLIP);
    tl.to(CS, { x: -372, y: 60, duration: 0.7, ease: 'power3.inOut' }, 3.62);

    const kick = (u) => (u > 0 ? Math.exp(-u * 9) * (1 - Math.exp(-u * 70)) : 0);
    let lastChance = '', lastName = '', lastRay = '';
    const GL = 'ABCDEFGHJKLMNPQRSTUVWXYZ#%&$0123456789/<>';
    const NAME_GLOW = rgba(TH.rgb([176, 77, 255]), '.6');
    const PULSES = ICON.pulses || [], NPUL = PULSES.length;
    S.onFrame((t) => {
      const T = tierAt(t), cc = cardCenter();
      // jitter: each tier hit shakes harder; the charge rattles continuously
      let jx = 0, jy = 0, jr = 0, punch = 0;
      TIERS.forEach((Ti, i) => {
        const u = t - Ti.t;
        if (u < 0 || u > 0.5) return;
        const d = Math.pow(1 - u / 0.5, 2) * Ti.shake;
        jx += d * S.noise(u * 38, 11 + i); jy += d * S.noise(u * 38, 21 + i); jr += d * 0.25 * S.noise(u * 30, 31 + i);
        punch += 0.065 * kick(u);
      });
      const ch = sm((t - T_CHARGE) / (T_FLASH - T_CHARGE));
      if (ch > 0 && t < T_FLASH) { const a = 2 + 12 * ch; jx += a * S.noise(t * 55, 41); jy += a * S.noise(t * 55, 42); jr += a * 0.2 * S.noise(t * 45, 43); }
      const hold = sm((t - 4.3) / 0.8);
      const bob = hold * 7 * Math.sin((t - 4.3) * 1.7);
      cardPos.style.transform = `translate(${(CS.x + jx).toFixed(2)}px,${(CS.y + jy + bob).toFixed(2)}px) rotate(${(CS.rz + jr).toFixed(3)}deg) scale(${(CS.s * (1 + punch)).toFixed(4)})`;
      sway.style.transform = `rotateY(${(hold * 5 * Math.sin((t - 4.3) * 0.9)).toFixed(3)}deg) rotateX(${(hold * 3 * Math.sin((t - 4.3) * 1.3)).toFixed(3)}deg) scale(${CS.sx.toFixed(4)},${CS.sy.toFixed(4)})`;
      card.style.transform = `rotateY(${CS.ry.toFixed(3)}deg)`;
      // rarity colour on the back, glow on both faces
      const colStr = rgba(T.col, 1);
      faceA.style.color = colStr; backCopy.style.color = colStr;
      const g = T.glow;
      const glow = `0 0 ${g.toFixed(1)}px ${(g * 0.22).toFixed(1)}px ${rgba(T.col, 0.75)}, 0 0 ${(g * 2.2).toFixed(1)}px ${rgba(T.col, 0.3)}`;
      faceA.style.boxShadow = glow; faceB.style.boxShadow = glow;
      const shown = t >= T_FLASH;
      front.style.opacity = shown ? 1 : 0; backCopy.style.opacity = shown ? 0 : 1;
      // god-rays follow the card, spin up with each tier and on the charge
      const ang = 5 * t + 20 * sm((t - 1.4) / 2) + 120 * sm((t - T_CHARGE) / 0.5) + 30 * sm((t - T_FLASH) / 1.2);
      const rs = `repeating-conic-gradient(from 0deg, ${rgba(T.col, (T.rays).toFixed(3))} 0deg 3.2deg, ${rgba(T.col, 0)} 7deg 15deg)`;
      const rs2 = `repeating-conic-gradient(from 7deg, ${rgba(mix(T.col, WHITE, 0.4), (T.rays * 0.55).toFixed(3))} 0deg 1.6deg, ${rgba(T.col, 0)} 4deg 22.5deg)`;
      if (rs !== lastRay) { rays[0].style.background = rs; rays[1].style.background = rs2; lastRay = rs; }
      rays[0].style.transform = `translate(${(cc.x - CX).toFixed(1)}px,${(cc.y - CY).toFixed(1)}px) rotate(${ang.toFixed(2)}deg)`;
      rays[1].style.transform = `translate(${(cc.x - CX).toFixed(1)}px,${(cc.y - CY).toFixed(1)}px) rotate(${(-ang * 0.7).toFixed(2)}deg)`;
      // floor glow + contact shadow (shadow firms up as the card comes down)
      const near = clamp(1 + CS.y / -FALL0), fy = CY + CH / 2 + Math.max(0, CS.y);     // the floor stays put while the card is airborne
      floor.style.transform = `translate(${cc.x.toFixed(1)}px,${(fy + 26).toFixed(1)}px)`;
      floor.style.background = `radial-gradient(closest-side, ${rgba(T.col, (0.5 * near).toFixed(3))}, ${rgba(T.col, 0)})`;
      shadow.style.transform = `translate(${cc.x.toFixed(1)}px,${(fy + 22).toFixed(1)}px) scale(${(0.4 + 0.6 * near).toFixed(3)})`;
      shadow.style.opacity = (0.25 + 0.75 * near).toFixed(3);
      // drop-chance readout rolls with the tier
      const ci = T.idx;
      const cs = ci < 0 ? '' : TIERS[ci].chance;
      if (cs !== lastChance) { chanceV.textContent = cs; lastChance = cs; }
      // flash: hard white on the hit frame, fast decay
      const fu = t - T_FLASH;
      flash.style.opacity = fu < 0 ? 0 : fu < 0.03 ? (fu / 0.03).toFixed(3) : Math.exp(-(fu - 0.03) * 6.5).toFixed(3);
      // item life: aura breathes, pulses light in a wave up the art, halo rays turn
      if (shown) {
        if (ICON.aura) ICON.aura.setAttribute('opacity', (0.55 + 0.3 * Math.sin(t * 3.1)).toFixed(3));
        PULSES.forEach((r, i) => r.setAttribute('opacity', (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 5.2 - (NPUL - 1 - i) * 0.8))).toFixed(3)));
        burstG.setAttribute('transform', `rotate(${(t * 9).toFixed(2)} 210 250)`);
        artBob.setAttribute('transform', `translate(0 ${(4 * Math.sin(t * 2.2)).toFixed(2)})`);
        sparkles.forEach((sp, i) => sp.setAttribute('opacity', (0.5 + 0.5 * Math.sin(t * 4 + i * 1.9)).toFixed(3)));
      }
      // rarity shimmer: a highlight sweeps across on reveal and every 1.5 s after
      const su = t - T_RAR - 0.1, sweep = su < 0 ? 0 : (su % 1.5) / 0.9;
      shine.style.backgroundPosition = `${(100 - 100 * clamp(sweep)).toFixed(2)}% 0`;
      // name: decode-scramble + RGB split + slice jitter while it lands
      const nu = t - T_NAME;
      if (nu < 0) { nameWrap.style.opacity = 0; }
      else {
        nameWrap.style.opacity = nu < 0.07 && Math.floor(t * 60) % 2 ? 0.35 : 1;
        const f = Math.floor(t * 30);
        let s = '';
        for (let i = 0; i < NAME.length; i++) s += NAME[i] === ' ' || nu >= 0.08 + i * 0.03 ? NAME[i] : GL[Math.floor(S.ihash(f * 131 + i * 17) * GL.length)];
        if (s !== lastName) { nameEl.textContent = s; slices[0].textContent = s; slices[1].textContent = s; lastName = s; }
        const micro = t > 5.55 && t < 5.62 ? 0.5 : 0;
        const amp = Math.max(nu < 0.6 ? Math.pow(1 - nu / 0.6, 1.5) : 0, micro);
        const dx = amp * 16 * S.noise(t * 42, 5);
        nameEl.style.textShadow = `${dx.toFixed(1)}px 0 0 rgba(255,40,110,.85), ${(-dx).toFixed(1)}px 0 0 rgba(0,235,255,.85), 0 0 34px ${NAME_GLOW}`;
        nameEl.style.transform = `translateX(${(amp * 10 * S.noise(t * 26, 9)).toFixed(1)}px) skewX(${(amp * 9 * S.noise(t * 31, 13)).toFixed(2)}deg)`;
        slices.forEach((sl, i) => {
          const on = amp > 0.05 && S.ihash(f * 7 + i * 3) < 0.7;
          sl.style.opacity = on ? 0.9 : 0;
          if (on) { const y0 = S.ihash(f * 13 + i) * 80, h = 10 + S.ihash(f * 17 + i) * 34; sl.style.clipPath = `inset(${y0.toFixed(0)}% 0 ${Math.max(0, 100 - y0 - h).toFixed(0)}% 0)`; sl.style.transform = `translateX(${((S.ihash(f * 23 + i) - 0.5) * 70 * amp).toFixed(1)}px)`; }
        });
      }
      // NEW! breathes once it has landed
      if (BADGE && t > T_NEW + 0.55) badge.style.transform = `scale(${(1 + 0.04 * Math.sin((t - T_NEW - 0.55) * 9)).toFixed(4)})`;
      drawBack(t, cc, T);
      drawFront(t, cc, T);
    });

    /* ======================= sound ======================= */
    S.sfx(0, 'drone', { dur: 7, gain: 0.07, freq: P.droneHz, cutoff: 280, air: 0.35 });
    S.sfx(0, 'pad', { dur: 7, gain: 0.05, notes: P.padNotes, attack: 1.2, release: 1.6, cutoff: 1400 });
    S.sfx(0, 'whoosh', { dur: 0.58, from: 380, to: 3200, gain: 0.42 });
    S.sfx(0.18, 'swoosh', { gain: 0.2, pitch: 0.9 });
    S.sfx(T_LAND, 'thud', { gain: 0.6 });
    S.sfx(T_LAND, 'impact', { gain: 0.26, pitch: 1.3 });
    TIERS.forEach((T, i) => {
      const r = rank(i);
      S.sfx(T.t, 'tone', { freq: T.tone, dur: 0.34, gain: 0.13 + r * 0.015 });
      S.sfx(T.t, i === LAST ? 'coin' : 'blip', { pitch: T.blip, gain: i === LAST ? 0.2 : 0.26 + r * 0.03 });
      if (i) S.sfx(T.t, 'thud', { gain: 0.14 + r * 0.08, pitch: 1.2 - r * 0.1 });
    });
    S.sfx(2.7, 'shimmer', { gain: 0.14, pitch: 1.2 });
    S.sfx(2.92, 'riser', { dur: T_FLASH - 2.92, gain: 0.42 });
    S.sfx(T_FLASH, 'boom', { gain: 0.72 });
    S.sfx(T_FLASH, 'shimmer', { gain: 0.34 });
    S.sfx(T_FLIP + 0.02, 'whoosh', { dur: 0.42, from: 700, to: 3800, gain: 0.3 });
    S.sfx(T_RAR, 'chord', { notes: P.chordNotes, dur: 1.3, wave: 'triangle', gain: 0.17 });
    S.sfx(T_NAME, 'glitch', { dur: 0.42, gain: 0.36 });
    S.sfx(4.32, 'tick', { gain: 0.18 });
    S.sfx(4.42, 'swoosh', { gain: 0.16 });
    S.sfx(T_STATS, 'levelup', { gain: 0.15 });
    S.sfx(5.55, 'glitch', { dur: 0.08, gain: 0.14 });
    if (BADGE) {
      S.sfx(T_NEW, 'pop', { pitch: 1.3, gain: 0.45 });
      S.sfx(T_NEW + 0.05, 'ding', { freq: 2093, gain: 0.14 });
    }
    S.shake(T_LAND, { amp: 9, dur: 0.35, freq: 22 });
    TIERS.forEach((T, i) => { if (i) S.shake(T.t, { amp: ladder([0, 4, 8, 13], i), dur: ladder([0.3, 0.3, 0.35, 0.42], i) }); });
    S.shake(T_FLASH, { amp: 30, dur: 0.75, freq: 20, rot: 0.8 });

    S.beat(0.0, 'Card is already falling and spinning on frame one');
    S.beat(TIERS[0].t, NT > 1 ? `${['Two', 'Three', 'Four', 'Five', 'Six'][NT - 2]} tiers, each brighter, louder and shakier than the last` : 'One rarity hit, then the long charge');
    S.beat(T_CHARGE, 'Anticipation: sparks implode while the riser climbs');
    S.beat(T_FLASH, 'White flash hides the swap to the card front');
    S.beat(T_NAME, 'Name decodes with an RGB split; stats count in on a stagger');

    S.vignette({ strength: 0.6, inner: 48 });
    S.grain({ opacity: 0.05 });
  },
});
