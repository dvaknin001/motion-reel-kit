/* History — Campaign Map (default: Hannibal's March, 218–216 BC)
   Natural Earth coastline in Mercator. The campaign route is a centripetal Catmull-Rom spline through the
   `route` stops; the camera follows its head with look-ahead. Pins, battle markers and the army token are
   map-bound but counter-scaled, so they stay one size on screen while the map zooms underneath them.
   A weather beat on the storm stop drives the falling army counter; the final stop lands hardest.
   Stop times derive from the route length (the 9-stop showcase keeps its hand-tuned rhythm). */
Reel.style({
  id: 'history-campaign-map', seed: 'hannibal', order: 5,
  name: 'Campaign Map',
  transIn: { type: 'burn', dur: 0.7 },   // how a reel cuts INTO this piece (tools/new-reel.mjs); a reel item's trans overrides it
  niches: {
    primary: ['Ancient history', 'Military history', 'History explainers'],
    similar: ['Napoleonic & modern campaigns', 'Data storytelling (Minard-style)', 'Exploration & expeditions', 'Polar & mountaineering disasters', 'Historical migrations', 'Trade routes & caravans', 'Road-trip & travel recaps'],
  },
  niche: 'History', title: "Hannibal's March", duration: 9, poster: 8.4,
  bg: '#0E171C', palette: ['#D8412F', '#E2B65C', '#16222A'],
  techniques: ['Follow-cam on a live route head', 'Antique map from real coastline data', 'Weather beat drives a falling counter'],
  why: 'The camera rides the army token so the eye never hunts; every stop pays off with a pin, a storm or a battle, and the army count falls before the biggest number lands at Cannae.',
  facts: 'Polybius, Histories III: ~38,000 infantry, 8,000 cavalry and 37 elephants at the Rhône; ~20,000 infantry and 6,000 cavalry reached Italy. Trebia 218, Trasimene 217, Cannae 216 BC; Cannae dead ~50,000 (Livy ~48,000, Polybius ~70,000). Natural Earth 50m coastline; route and Alpine pass are schematic.',
  defaults: {
    map: 'med',                                   // region key in data/mapdata.js (data/maps.config.json)
    date: '218 BC',                               // big gold date, top left
    title: 'HANNIBAL’S MARCH ON ROME',            // letter-spaced line under the date
    // 4–12 stops in marching order. kind: pin (default) · storm (one stop: weather beat, counter falls on the next leg)
    // · battle · via (no marker). label: left · right · above · below. count/note: counter value at that stop.
    // turn: true draws the route after this stop in colors.routeBack (a return journey). The last stop lands hardest.
    route: [
      { name: 'NEW CARTHAGE', lon: -0.98, lat: 37.6 },
      { name: 'EBRO', lon: 0.6, lat: 40.8, size: 22 },
      { name: 'PYRENEES', lon: 2.86, lat: 42.46 },
      { name: 'RHÔNE', lon: 4.75, lat: 44.0, count: 46000, note: 'AT THE RHÔNE' },
      { name: 'THE ALPS', lon: 7.05, lat: 44.7, kind: 'storm' },
      { name: 'TAURINI', lon: 7.69, lat: 45.07, kind: 'via', count: 26000, note: 'REACHED ITALY' },
      { name: 'TREBIA', lon: 9.6, lat: 45.0, kind: 'battle', year: '218 BC', label: 'right' },
      { name: 'TRASIMENE', lon: 12.1, lat: 43.13, kind: 'battle', year: '217 BC' },
      { name: 'CANNAE', lon: 16.13, lat: 41.3, kind: 'battle', year: '216 BC', label: 'above' },
    ],
    weather: 'snow',                              // snow · rain · sand · none
    token: 'elephant',                            // army token: 'elephant', or a 1–3 letter monogram ('N')
    counter: {
      label: 'HANNIBAL’S ARMY',
      side: 'left',                               // left: exits as the camera pulls wide · right: stays to the end
      stat: { label: 'ELEPHANTS', value: '37', icon: 'elephant' },   // second column; null hides it
    },
    cities: [                                     // 0–4 reference cities that pop as the camera pulls wide
      { name: 'ROME', lon: 12.5, lat: 41.9, color: '#5A2A6E', label: 'left' },
      { name: 'CARTHAGE', lon: 10.32, lat: 36.85, color: 'route', label: 'left' },
    ],
    finale: {                                     // lower third on the last stop; {name} {year} = that stop
      title: '{name}', date: '{year}',
      value: 50000, prefix: '~', suffix: '',       // counts up inside `line`; value null = plain text
      line: '{value} Romans killed in a single day',
      note: 'Ancient figures range from ~48,000 (Livy) to ~70,000 (Polybius)',
    },
    camera: {
      zoom: 1,                                    // multiplies the follow-cam zoom (2.34 → 1.56 × region frame)
      wide: [1030, 660, 0.94],                    // [x, y, zoom] in map px as the pull-out lands (5.95 s); null = fit route + cities
      end: [1070, 650, 1],                        // [x, y, zoom] at the last frame; null = a slow push from `wide`
    },
    rivers: [
      [[-4.05, 43.0], [-3.3, 42.75], [-2.45, 42.47], [-1.6, 42.05], [-0.88, 41.65], [-0.1, 41.25], [0.45, 41.0], [0.55, 40.82], [0.86, 40.72]],
      [[8.3, 46.55], [7.6, 46.24], [7.0, 46.2], [6.9, 46.38], [6.15, 46.21], [5.82, 45.95], [5.35, 45.82], [4.83, 45.76], [4.86, 45.2], [4.74, 44.55], [4.8, 43.95], [4.63, 43.68], [4.72, 43.38]],
      [[7.1, 44.7], [7.45, 44.87], [7.69, 45.07], [8.2, 45.15], [8.8, 45.07], [9.7, 45.05], [10.3, 45.0], [10.9, 45.05], [11.6, 45.02], [12.1, 44.97], [12.46, 44.95]],
      [[12.07, 43.78], [12.25, 43.4], [12.39, 43.1], [12.45, 42.7], [12.55, 42.35], [12.48, 41.9], [12.25, 41.74]],
    ],
    lakes: [[[6.16, 46.24], [6.4, 46.36], [6.65, 46.44], [6.86, 46.42]]],
    // ridge lines; glyph size/spacing/jitter in map px, snow caps, keep = share of glyphs drawn
    mountains: [
      { size: 10, spacing: 9, jitter: 10, pts: [[-1.75, 43.1], [-0.9, 42.88], [0.0, 42.74], [0.9, 42.64], [1.8, 42.5], [2.55, 42.44], [3.0, 42.4]] },
      { size: 12.5, spacing: 9, jitter: 14, snow: true, pts: [[7.55, 43.97], [7.0, 44.22], [6.72, 44.6], [6.62, 45.1], [6.88, 45.62], [7.5, 45.96], [8.3, 46.22], [9.2, 46.42], [10.2, 46.42], [11.2, 46.58], [12.3, 46.56], [13.3, 46.45], [14.2, 46.5], [15.3, 47.15]] },
      { size: 10, spacing: 10, jitter: 6, snow: true, keep: 0.9, pts: [[6.02, 44.35], [6.2, 44.9], [6.42, 45.4], [6.8, 45.95]] },
      { size: 8.5, spacing: 10, jitter: 7, pts: [[8.7, 44.45], [9.6, 44.45], [10.4, 44.24], [11.2, 44.04], [12.0, 43.66], [12.7, 43.16], [13.3, 42.62], [13.9, 42.06], [14.5, 41.56], [15.1, 41.06], [15.6, 40.56], [15.95, 40.0], [16.15, 39.35], [16.25, 38.8]] },
      { size: 7, spacing: 14, jitter: 6, keep: 0.8, pts: [[-6.4, 40.25], [-5.2, 40.32], [-4.0, 40.74], [-3.4, 41.1]] },
      { size: 7, spacing: 14, jitter: 6, keep: 0.8, pts: [[-3.9, 37.06], [-2.9, 37.12], [-2.3, 37.26]] },
      { size: 7, spacing: 14, jitter: 6, keep: 0.8, pts: [[-6.4, 43.0], [-5.0, 43.06], [-3.8, 43.12]] },
      { size: 7, spacing: 14, jitter: 6, keep: 0.8, pts: [[-2.9, 41.95], [-2.0, 41.3], [-1.3, 40.62], [-0.9, 40.1]] },
      { size: 7, spacing: 14, jitter: 6, keep: 0.8, pts: [[3.1, 45.3], [3.35, 44.85], [3.6, 44.35]] },
      { size: 7, spacing: 14, jitter: 6, keep: 0.8, pts: [[-1.0, 35.3], [1.0, 35.95], [3.0, 36.3], [5.0, 36.32], [7.0, 36.3]] },
      { size: 7, spacing: 14, jitter: 6, keep: 0.8, pts: [[-5.5, 35.02], [-4.3, 35.06], [-3.3, 35.12]] },
      { size: 7, spacing: 14, jitter: 6, keep: 0.8, pts: [[14.6, 45.5], [15.8, 44.6], [17.0, 43.8], [18.2, 43.0], [19.0, 42.5]] },
      { size: 7, spacing: 14, jitter: 6, keep: 0.8, pts: [[8.95, 42.35], [9.15, 41.9]] },
    ],
    // map lettering: land labels in Cinzel, sea: true in italic Garamond; along = [[lon,lat],[lon,lat]] sets the angle
    labels: [
      { text: 'IBERIA', lon: -3.4, lat: 38.35, size: 36, spacing: 18, opacity: 0.6 },
      { text: 'GAUL', lon: 2.9, lat: 45.2, size: 36, spacing: 18, opacity: 0.6 },
      { text: 'ITALY', lon: 14.45, lat: 41.2, size: 30, spacing: 16, opacity: 0.66, along: [[11.4, 43.55], [15.4, 40.75]] },
      { text: 'AFRICA', lon: 9.2, lat: 35.3, size: 36, spacing: 18, opacity: 0.55 },
      { text: 'MEDITERRANEAN SEA', lon: 5.3, lat: 38.25, size: 30, spacing: 9, opacity: 0.85, sea: true },
    ],
    padNotes: [110, 130.8, 164.8, 220],           // pad chord under the finale (Hz)
    droneHz: 46.25,                               // low drone under the whole piece
    colors: {
      route: '#D8412F', routeHi: '#F0583F', routeGlow: '#FF5A3A', routeCore: '#FF9A80', routeShadow: '#1E0905',
      routeBack: '#2B1E16', routeBackCore: '#7A6650',
      gold: '#E2B65C', goldShadow: '#7A5A22', cream: '#F6ECD4', parchment: '#E9DDBF', ink: '#231910', titleText: '#F1E6CB',
      muted: '#A89C85', footnote: '#B3A98F', panel: '#0D1317', panelTop: '#182127', shade: '#070B0E',
      labelHalo: '#140E08', cityHalo: '#F0E4C6', battleDisc: '#1C140F', shock: '#FFD9C9', tokenRing: '#8E2416', iconCut: '#16202A',
      flash: '#FF7850', bg: '#0E171C',
    },
    mapColors: {
      sea: ['#1B2B34', '#16222A', '#0C1418'], land: ['#D3C29B', '#C8B68C', '#B6A276'],
      waterLines: ['#2B4452', '#4C6876', '#30505E'], landShade: '#4E3E24', coast: '#6F5E3E',
      river: '#5B7C8A', riverEdge: '#E4D7B4', mountains: ['#5E4D30', '#E4D6B0', '#977F55', '#FBF8EF'],
      landLabel: '#6B5736', seaLabel: '#8AA2AE',
    },
  },
  build(S, P) {
    const tl = S.tl, W = 1920, H = 1080, clamp = S.clamp, lerp = S.lerp, norm = S.norm, ease = S.ease;
    const C = P.colors, MC = P.mapColors;
    const RED = C.route, RED_HI = C.routeHi, GOLD = C.gold, PARCH = C.parchment, CREAM = C.cream, INK = C.ink;
    const M = MAPDATA[P.map];
    if (!M) throw new Error(`history-campaign-map: no map "${P.map}" in data/mapdata.js (add it to data/maps.config.json, then run node tools/mapgen.mjs)`);
    const PR = Reel.mercator(M.k, M.tx, M.ty);
    const f2 = (n) => n.toFixed(2);
    const T = (x) => Math.round(x * 1e4) / 1e4;                     // derived times land on the same doubles as literals
    const r2 = (x) => Math.round(x * 100) / 100;
    const rgb = (hex) => { const n = parseInt(String(hex).slice(1), 16); return `${n >> 16},${(n >> 8) & 255},${n & 255}`; };
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const fill = (s, vars) => String(s ?? '').replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
    const fitWidth = (el, maxW) => { const w = el.scrollWidth; if (w > maxW) el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * maxW) / w + 'px'; };
    const cap = (s) => String(s).toLowerCase().replace(/(^|[\s-])\S/g, (m) => m.toUpperCase());
    const path = (d, a, parent) => S.s('path', Object.assign({ d, fill: 'none', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, a), parent);

    // centripetal Catmull-Rom through points -> cubic bezier segments [p1, c1, c2, p2]
    function catmull(pts) {
      const out = [], n = pts.length, d = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
      for (let i = 0; i < n - 1; i++) {
        const p1 = pts[i], p2 = pts[i + 1];
        const p0 = i ? pts[i - 1] : [2 * p1[0] - p2[0], 2 * p1[1] - p2[1]];
        const p3 = i + 2 < n ? pts[i + 2] : [2 * p2[0] - p1[0], 2 * p2[1] - p1[1]];
        const l01 = d(p0, p1), l12 = d(p1, p2), l23 = d(p2, p3), a01 = Math.sqrt(l01), a12 = Math.sqrt(l12), a23 = Math.sqrt(l23);
        const A = 2 * l01 + 3 * a01 * a12 + l12, N = 3 * a01 * (a01 + a12);
        const B = 2 * l23 + 3 * a23 * a12 + l12, Mm = 3 * a23 * (a23 + a12);
        const c1 = [0, 1].map((k) => (p1[k] * A - p0[k] * l12 + p2[k] * l01) / N);
        const c2 = [0, 1].map((k) => (p2[k] * B + p1[k] * l23 - p3[k] * l12) / Mm);
        out.push([p1, c1, c2, p2]);
      }
      return out;
    }
    const bzD = (segs) => `M${f2(segs[0][0][0])},${f2(segs[0][0][1])}` + segs.map(([, a, b, c]) => `C${f2(a[0])},${f2(a[1])} ${f2(b[0])},${f2(b[1])} ${f2(c[0])},${f2(c[1])}`).join('');
    const smoothD = (lls) => bzD(catmull(lls.map(PR)));

    /* ======================= STOPS + TIMING (derived from the route) ======================= */
    const KINDS = ['pin', 'storm', 'battle', 'via'];
    const WP = (P.route || []).slice(0, 12).map((w) => Object.assign({}, w, { kind: KINDS.includes(w.kind) ? w.kind : 'pin', ll: [w.lon, w.lat], year: w.year ?? '' }));
    if (WP.length < 2) throw new Error('history-campaign-map: route needs at least 2 stops (4–12 read well)');
    const NW = WP.length, LAST = NW - 1, FIN = WP[LAST];
    let stormI = P.weather === 'none' ? -1 : WP.findIndex((w) => w.kind === 'storm');
    if (stormI < 1 || stormI > NW - 2) stormI = -1;                  // the storm needs a stop before and after it
    WP.forEach((w, i) => { if (w.kind === 'storm' && i !== stormI) w.kind = 'pin'; });
    const T0 = 0.85, TF = 6.42;                                       // march starts; the last stop lands (finale)
    const SHOW = { t: [0.85, 1.5, 2.15, 2.85, 3.55, 4.42, 5.05, 5.72, 6.42], pulse: [1.15, 1.5, 1.83, 2.15, 2.5, 2.85, 3.2] };
    const showcase = NW === 9 && stormI === 4;
    if (showcase) WP.forEach((w, i) => { w.t = SHOW.t[i]; });
    else {
      // every leg takes the same time except the storm leg (x1.3); the whole march fits 0.85 → 6.42 s
      const wt = WP.slice(0, LAST).map((w, i) => (i === stormI ? 1.3 : 1)), tot = wt.reduce((a, b) => a + b, 0);
      let acc = 0; WP.forEach((w, i) => { w.t = i === LAST ? TF : T(T0 + ((TF - T0) * acc) / tot); if (i < LAST) acc += wt[i]; });
    }
    const STORM = stormI >= 0 ? WP[stormI] : null, AFTER = STORM ? WP[stormI + 1] : null;
    const vars = { name: FIN.name, year: FIN.year };
    if (!S.alpha) S.root.style.background = C.bg;

    /* ======================= MAP (world space, inside the camera) ======================= */
    const map = S.svg(S.cam);
    const defs = S.defs(map);
    const ID = { sea: S.uid('sea'), land: S.uid('land'), clip: S.uid('lclip') };
    const grad = (tag, attrs, stops) => { const g = S.s(tag, attrs, defs); stops.forEach(([o, c]) => S.s('stop', { offset: o, 'stop-color': c }, g)); };
    grad('radialGradient', { id: ID.sea, gradientUnits: 'userSpaceOnUse', cx: 1060, cy: 700, r: 1250 }, [[0, MC.sea[0]], [0.5, MC.sea[1]], [1, MC.sea[2]]]);
    grad('linearGradient', { id: ID.land, gradientUnits: 'userSpaceOnUse', x1: 0, y1: -100, x2: 0, y2: 1180 }, [[0, MC.land[0]], [0.55, MC.land[1]], [1, MC.land[2]]]);
    S.s('path', { d: M.land }, S.s('clipPath', { id: ID.clip }, defs));

    // sea + antique "water lines" hugging the coast (light stroke, then over-painted with the sea itself)
    const WL = MC.waterLines;
    S.s('rect', { x: -1000, y: -1000, width: 3920, height: 3080, fill: `url(#${ID.sea})` }, map);
    path(M.land, { stroke: WL[0], 'stroke-width': 44, 'stroke-opacity': 0.3 }, map);
    path(M.land, { stroke: WL[1], 'stroke-width': 17, 'stroke-opacity': 0.8 }, map);
    path(M.land, { stroke: `url(#${ID.sea})`, 'stroke-width': 15 }, map);
    path(M.land, { stroke: WL[1], 'stroke-width': 9.5, 'stroke-opacity': 0.6 }, map);
    path(M.land, { stroke: `url(#${ID.sea})`, 'stroke-width': 7.5 }, map);
    path(M.land, { stroke: WL[2], 'stroke-width': 20, 'stroke-opacity': 0.3 }, map);

    // land: parchment gradient, soft inner shadow along the coast, rivers, inked coastline
    S.s('path', { d: M.land, fill: `url(#${ID.land})` }, map);
    const shade = S.s('g', { 'clip-path': `url(#${ID.clip})` }, map);
    [[30, 0.07], [16, 0.09], [7, 0.14]].forEach(([w, o]) => path(M.land, { stroke: MC.landShade, 'stroke-width': w, 'stroke-opacity': o }, shade));

    const rivG = S.s('g', {}, map);
    (P.rivers || []).forEach((r) => { if (r.length < 2) return; const d = smoothD(r); path(d, { stroke: MC.riverEdge, 'stroke-width': 4.2, 'stroke-opacity': 0.55 }, rivG); path(d, { stroke: MC.river, 'stroke-width': 1.9 }, rivG); });
    (P.lakes || []).forEach((r) => { if (r.length >= 2) path(smoothD(r), { stroke: MC.river, 'stroke-width': 5.5 }, rivG); });
    path(M.land, { stroke: MC.coast, 'stroke-width': 1.5 }, map);

    // mountains: two-tone triangle glyphs scattered along ridge lines, painted north to south
    const glyphs = [];
    const chain = (lls, spacing, jitter, size, snow, keep = 1) => {
      const xy = lls.map(PR);
      for (let i = 0; i < xy.length - 1; i++) {
        const [x0, y0] = xy[i], [x1, y1] = xy[i + 1], len = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.round(len / spacing));
        const nx = -(y1 - y0) / len, ny = (x1 - x0) / len;
        for (let k = 0; k < n; k++) {
          const u = (k + S.rnd(0.15, 0.85)) / n, rows = S.rand() < 0.6 ? 2 : 1;
          for (let r = 0; r < rows; r++) {
            if (S.rand() > keep) continue;
            const off = (rows === 2 ? (r ? 0.5 : -0.5) * jitter : 0) + S.rnd(-0.3, 0.3) * jitter;
            glyphs.push({ x: x0 + (x1 - x0) * u + nx * off, y: y0 + (y1 - y0) * u + ny * off, s: size * S.rnd(0.72, 1.15), snow });
          }
        }
      }
    };
    (P.mountains || []).forEach((m) => { if (m.pts && m.pts.length > 1) chain(m.pts, m.spacing ?? 10, m.jitter ?? 7, m.size ?? 9, !!m.snow, m.keep ?? 1); });
    glyphs.sort((a, b) => a.y - b.y);
    let gL = '', gR = '', gS = '', gO = '';
    for (const g of glyphs) {
      const h = g.s, w = g.s * 0.92, mx = g.x + w * 0.16, ax = g.x, ay = g.y - h;
      const P3 = (a, b, c) => `M${f2(a[0])},${f2(a[1])}L${f2(b[0])},${f2(b[1])}L${f2(c[0])},${f2(c[1])}Z`;
      gL += P3([g.x - w, g.y], [ax, ay], [mx, g.y]);
      gR += P3([mx, g.y], [ax, ay], [g.x + w, g.y]);
      gO += P3([g.x - w, g.y], [ax, ay], [g.x + w, g.y]);
      if (g.snow) { const k = 0.4; gS += `M${f2(ax)},${f2(ay)}L${f2(ax - w * k)},${f2(ay + h * k)}L${f2(ax - w * 0.12)},${f2(ay + h * 0.3)}L${f2(ax + w * 0.08)},${f2(ay + h * 0.42)}L${f2(ax + w * k)},${f2(ay + h * k)}Z`; }
    }
    const mtn = S.s('g', {}, map), MT = MC.mountains;
    S.s('path', { d: gO, fill: 'none', stroke: MT[0], 'stroke-width': 2.2, 'stroke-linejoin': 'round', opacity: 0.55 }, mtn);
    S.s('path', { d: gL, fill: MT[1] }, mtn);
    S.s('path', { d: gR, fill: MT[2] }, mtn);
    S.s('path', { d: gS, fill: MT[3] }, mtn);

    // region + sea labels (part of the map: they zoom with it)
    const regions = [];
    const region = (txt, ll, font, ls, fillC, op, rot) => {
      const [x, y] = PR(ll);
      const el = S.s('text', { x: x + ls / 2, y, 'text-anchor': 'middle', text: txt, transform: rot ? `rotate(${rot} ${f2(x)} ${f2(y)})` : null, style: `font:${font};letter-spacing:${ls}px;fill:${fillC};opacity:${op};` }, map);
      if (!rot) { const b = el.getBBox(); regions.push({ el, op, x0: b.x, y0: b.y, x1: b.x + b.width - ls, y1: b.y + b.height }); }
      return el;
    };
    (P.labels || []).forEach((L) => {
      const sea = !!L.sea, size = L.size ?? (sea ? 30 : 36), ls = L.spacing ?? (sea ? 9 : 18);
      let rot = 0;
      if (L.along) { const a = PR(L.along[0]), b = PR(L.along[1]); rot = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI; }
      region(L.text, [L.lon, L.lat], sea ? `italic 600 ${size}px "Cormorant Garamond"` : `600 ${size}px Cinzel`, ls, sea ? MC.seaLabel : MC.landLabel, L.opacity ?? (sea ? 0.85 : 0.6), rot);
    });

    // paper texture (seeded value noise, generated once) multiplied over land and sea
    (() => {
      const X0 = -320, Y0 = -320, WW = 2560, HH = 1720, SC = 3, w = Math.round(WW / SC), h = Math.round(HH / SC);
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const cx = cv.getContext('2d'), im = cx.createImageData(w, h), d = im.data;
      const hs = (i, j, s) => S.ihash(i * 7919 + j * 104729 + s * 1299709);
      const vn = (x, y, s) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), a = hs(xi, yi, s), b = hs(xi + 1, yi, s), c = hs(xi, yi + 1, s), e = hs(xi + 1, yi + 1, s); return a + (b - a) * u + (c - a) * v + (a - b - c + e) * u * v; };
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const x = X0 + i * SC, y = Y0 + j * SC;
        const n = vn(x / 230, y / 230, 1) * 0.5 + vn(x / 75, y / 75, 2) * 0.32 + vn(x / 24, y / 24, 3) * 0.18, fib = vn(x / 5, y / 38, 4);
        const v = 0.8 + 0.2 * n + 0.05 * (fib - 0.5), k = (j * w + i) * 4;
        d[k] = 255 * v; d[k + 1] = 255 * (v - 0.012); d[k + 2] = 255 * (v - 0.035); d[k + 3] = 255;
      }
      cx.putImageData(im, 0, 0);
      cv.style.cssText = `position:absolute;left:${X0}px;top:${Y0}px;width:${WW}px;height:${HH}px;mix-blend-mode:multiply;opacity:.6;pointer-events:none;`;
      S.cam.appendChild(cv);
    })();

    /* ======================= ROUTE + MARKERS (world space, counter-scaled) ======================= */
    const ov = S.svg(S.cam);
    const odefs = S.defs(ov);
    const GLOW = S.uid('glow'), SOFT = S.uid('soft');
    const gf = S.s('filter', { id: GLOW, x: '-20%', y: '-20%', width: '140%', height: '140%' }, odefs);
    const glowBlur = S.s('feGaussianBlur', { stdDeviation: 4 }, gf);
    const sf = S.s('filter', { id: SOFT, x: '-60%', y: '-60%', width: '220%', height: '220%' }, odefs);
    S.s('feGaussianBlur', { stdDeviation: 5 }, sf);

    const pts = WP.map((w) => PR(w.ll));
    const segs = catmull(pts);
    const ROUTE = bzD(segs);
    const meas = S.s('path', { d: ROUTE, fill: 'none', stroke: 'none' }, ov);
    const TOTAL = meas.getTotalLength();
    const segLen = segs.map((s) => { meas.setAttribute('d', bzD([s])); return meas.getTotalLength(); });
    const kfix = TOTAL / segLen.reduce((a, b) => a + b, 0);
    const cum = [0]; segLen.forEach((l, i) => { segLen[i] = l * kfix; cum.push(cum[i] + segLen[i]); });
    meas.setAttribute('d', ROUTE);
    const LUT = []; for (let L = 0; L < TOTAL; L += 1) { const p = meas.getPointAtLength(L); LUT.push([p.x, p.y]); }
    { const p = meas.getPointAtLength(TOTAL); LUT.push([p.x, p.y], [p.x, p.y]); }
    meas.remove();
    const headXY = (L) => { L = clamp(L, 0, TOTAL); const i = Math.min(LUT.length - 2, Math.floor(L)), f = L - i, a = LUT[i], b = LUT[i + 1]; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; };
    // arrival times at each waypoint; within a leg the march eases but never fully stops
    const legEase = (u) => u - (0.7 * Math.sin(2 * Math.PI * u)) / (2 * Math.PI);
    const headLen = (t) => {
      if (t <= WP[0].t) return 0;
      for (let i = 0; i < WP.length - 1; i++) if (t < WP[i + 1].t) return cum[i] + segLen[i] * legEase((t - WP[i].t) / (WP[i + 1].t - WP[i].t));
      return TOTAL;
    };

    /* ---------- camera: look-ahead follow of the route head, then a wide reveal ---------- */
    const CZ = P.camera?.zoom ?? 1;
    let wide = P.camera?.wide, wideEnd = P.camera?.end;
    if (!wide) {                                                      // fit the route + cities with room for title and HUD
      const xy = pts.concat((P.cities || []).map((c) => PR([c.lon, c.lat])));
      const xs = xy.map((p) => p[0]), ys = xy.map((p) => p[1]);
      const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      const z = clamp(Math.min(1380 / Math.max(1, x1 - x0), 620 / Math.max(1, y1 - y0)), 0.6, 1.6);
      wide = [(x0 + x1) / 2, (y0 + y1) / 2 + 60 / z, z];
      if (!wideEnd) wideEnd = [wide[0] + 16 / z, wide[1] - 6 / z, z * 1.03];
    }
    if (!wideEnd) wideEnd = [wide[0] + 40, wide[1] - 10, wide[2] * 1.064];
    let Z = 2.3, CX = pts[0][0], CY = pts[0][1];
    const zoomAt = (t) => {
      if (t < 0.9) return lerp(2.34 * CZ, 2.12 * CZ, ease('expo.out')(norm(t, 0, 0.9)));
      if (t < 3.55) return lerp(2.12 * CZ, 1.64 * CZ, ease('sine.inOut')(norm(t, 0.9, 3.55)));
      if (t < 4.5) return lerp(1.64 * CZ, 1.56 * CZ, ease('sine.inOut')(norm(t, 3.55, 4.5)));
      if (t < 5.95) return lerp(1.56 * CZ, wide[2], ease('power2.inOut')(norm(t, 4.5, 5.95)));
      return lerp(wide[2], wideEnd[2], ease('sine.inOut')(norm(t, 5.95, 9)));
    };
    const WIDE0 = [wide[0], wide[1]], WIDE1 = [wideEnd[0], wideEnd[1]];
    S.onFrame((t) => {
      let sx = 0, sy = 0, sw = 0;
      for (let k = -4; k <= 5; k++) { const w = Math.exp(-((k - 0.6) ** 2) / 6), p = headXY(headLen(t + k * 0.12)); sx += p[0] * w; sy += p[1] * w; sw += w; }
      const wb = ease('power2.inOut')(norm(t, 4.5, 5.95)), wd = ease('sine.inOut')(norm(t, 5.95, 9));
      CX = lerp(sx / sw, lerp(WIDE0[0], WIDE1[0], wd), wb);
      CY = lerp(sy / sw, lerp(WIDE0[1], WIDE1[1], wd), wb);
      Z = zoomAt(t);
      Object.assign(S.camState, { x: CX, y: CY, z: Z });
      S.cam.style.transform = `translate(${W / 2}px,${H / 2}px) scale(${Z.toFixed(5)}) translate(${(-CX).toFixed(2)}px,${(-CY).toFixed(2)}px)`;
    });

    /* ---------- route: shadow, glow, ink, highlight — all revealed by one dash length ---------- */
    const rG = S.s('g', {}, ov);
    const rShadow = path(ROUTE, { stroke: C.routeShadow, 'stroke-opacity': 0.5 }, rG);
    const rGlow = path(ROUTE, { stroke: C.routeGlow, 'stroke-opacity': 0.6, filter: `url(#${GLOW})` }, rG);
    const rMain = path(ROUTE, { stroke: RED }, rG);
    const rCore = path(ROUTE, { stroke: C.routeCore, 'stroke-opacity': 0.55 }, rG);
    const routeLayers = [[rShadow, 11], [rGlow, 16], [rMain, 6.5], [rCore, 1.6]];
    // optional return leg (turn: true on a stop): drawn over the outbound line in its own ink
    const turnI = WP.findIndex((w, i) => w.turn && i > 0 && i < LAST);
    const LT = turnI > 0 ? cum[turnI] : TOTAL, backLayers = [];
    if (turnI > 0) {
      const BACK = bzD(segs.slice(turnI)), bG = S.s('g', {}, ov);
      backLayers.push([path(BACK, { stroke: C.routeShadow, 'stroke-opacity': 0.5 }, bG), 11, true]);
      backLayers.push([path(BACK, { stroke: C.routeBack }, bG), 6.5]);
      backLayers.push([path(BACK, { stroke: C.routeBackCore, 'stroke-opacity': 0.55 }, bG), 1.6]);
    }
    S.onFrame((t) => {
      const L = headLen(t), Lo = backLayers.length ? Math.min(L, LT) : L, vis = L > 0.5 ? 'visible' : 'hidden', dash = `${f2(Lo)} ${f2(TOTAL + 200)}`;
      for (const [el, w] of routeLayers) { el.setAttribute('stroke-width', (w / Z).toFixed(3)); el.style.strokeDasharray = dash; el.style.visibility = vis; }
      rShadow.setAttribute('transform', `translate(${(1.4 / Z).toFixed(3)},${(2.8 / Z).toFixed(3)})`);
      glowBlur.setAttribute('stdDeviation', (5 / Z).toFixed(3));
      if (backLayers.length) {
        const Lb = L - LT, bvis = Lb > 0.5 ? 'visible' : 'hidden', bdash = `${f2(Math.max(0, Lb))} ${f2(TOTAL + 200)}`;
        for (const [el, w, sh] of backLayers) {
          el.setAttribute('stroke-width', (w / Z).toFixed(3)); el.style.strokeDasharray = bdash; el.style.visibility = bvis;
          if (sh) el.setAttribute('transform', `translate(${(1.4 / Z).toFixed(3)},${(2.8 / Z).toFixed(3)})`);
        }
      }
    });

    /* ---------- counter-scaled map objects ---------- */
    const pinned = [];
    const layer = () => S.s('g', {}, ov);
    const L_PIN = layer(), L_CITY = layer(), L_BAT = layer(), L_TOK = layer();
    const anchor = (x, y, parent) => { const o = { g: S.s('g', {}, parent), x, y, k: 0, upd: null }; pinned.push(o); return o; };
    const txt = (parent, s, x, y, a, css) => S.s('text', { x, y, 'text-anchor': a, text: s, style: css }, parent);
    const halo = (fillC, stroke, sw) => `fill:${fillC};stroke:${stroke};stroke-width:${sw}px;paint-order:stroke;stroke-linejoin:round;`;
    const HALO = `rgba(${rgb(C.labelHalo)},.82)`, HALO2 = `rgba(${rgb(C.labelHalo)},.85)`;
    const PIN_SIDE = (side, size) => ({ left: [4 - size, 8, 'end'], right: [size - 4, 8, 'start'], above: [0, -16, 'middle'], below: [0, size + 12, 'middle'] }[side] || [4 - size, 8, 'end']);
    const BAT_SIDE = { left: [-40, -6, 'end'], right: [40, -6, 'start'], above: [0, -58, 'middle'], below: [0, 58, 'middle'] };
    const BIG_SIDE = { left: [-50, -6, 'end'], right: [50, -6, 'start'], above: [0, -64, 'middle'], below: [0, 70, 'middle'] };

    // waypoint pins
    const mkPin = (w, o) => {
      const [x, y] = PR(w.ll), a = anchor(x, y, L_PIN), t0 = o.t0 ?? w.t;
      const ring = S.s('circle', { r: 10, fill: 'none', stroke: CREAM, 'stroke-width': 2.5 }, a.g);
      S.s('circle', { r: 7.5, fill: CREAM, stroke: INK, 'stroke-width': 3 }, a.g);
      const lab = txt(a.g, w.name, o.dx, o.dy, o.anchor, `font:700 ${o.size || 24}px Cinzel;letter-spacing:3px;` + halo(CREAM, HALO, 6));
      a.upd = (t) => {
        a.k = t < t0 ? 0 : ease('back.out(2.6)')(norm(t, t0, t0 + 0.45));
        const ru = norm(t, t0, t0 + 0.8);
        ring.setAttribute('r', f2(8 + 30 * ease('expo.out')(ru))); ring.setAttribute('opacity', f2(ru > 0 ? (1 - ru) * 0.9 : 0));
        const lu = ease('expo.out')(norm(t, t0 + 0.05, t0 + 0.7));
        lab.setAttribute('opacity', f2(lu * (o.out ? 1 - 0.45 * ease('power1.inOut')(norm(t, o.out, o.out + 0.6)) : 1)));
        lab.setAttribute('transform', `translate(${f2((1 - lu) * (o.anchor === 'end' ? 16 : -16))},0)`);
      };
      S.sfx(t0, 'pop', { gain: 0.3, pitch: o.pitch || 1 });
    };
    // pins pop on a rising pitch ladder (the storm pin drops low); labels that met the follow-cam dim as it pulls wide
    let ladder = 0, dimmed = 0;
    const loop = Math.hypot(pts[0][0] - pts[LAST][0], pts[0][1] - pts[LAST][1]) < 24;   // route ends where it began
    WP.forEach((w, i) => {
      if (i === LAST || (w.kind !== 'pin' && w.kind !== 'storm')) return;
      let [dx, dy, anc] = PIN_SIDE(w.label, w.size || 24);
      if (i === 0 && loop) { const p = { left: [-26, 0], right: [26, 0], above: [0, -26], below: [0, 26] }[w.label] || [-26, 0]; dx += p[0]; dy += p[1]; }
      const o = { dx, dy, anchor: anc, size: w.size };
      if (i === 0) Object.assign(o, { pitch: 0.9, t0: 0.5 });
      else {
        o.pitch = w.kind === 'storm' ? 0.8 : Math.min(1.6, r2(1.05 + 0.1 * ladder++));
        if (w.t < 4.5) { o.out = T(4.7 + Math.max(0, dimmed - 1) * 0.05); dimmed++; }
      }
      mkPin(w, o);
    });

    // reference cities (appear as the camera pulls wide)
    const mkCity = (name, ll, t0, col, side) => {
      const [x, y] = PR(ll), a = anchor(x, y, L_CITY);
      S.s('circle', { r: 9, fill: CREAM, stroke: col, 'stroke-width': 3 }, a.g);
      S.s('circle', { r: 3.6, fill: col }, a.g);
      const lab = txt(a.g, name, side * 18, 8, side < 0 ? 'end' : 'start', `font:700 24px Cinzel;letter-spacing:3px;` + halo(INK, `rgba(${rgb(C.cityHalo)},.9)`, 6));
      a.upd = (t) => { a.k = t < t0 ? 0 : ease('back.out(2.4)')(norm(t, t0, t0 + 0.45)); lab.setAttribute('opacity', f2(ease('power2.out')(norm(t, t0 + 0.08, t0 + 0.5)))); };
      S.sfx(t0, 'pop', { gain: 0.2, pitch: 0.75 });
    };
    (P.cities || []).slice(0, 4).forEach((c, i) => mkCity(c.name, [c.lon, c.lat], T(5.0 + 0.25 * i), C[c.color] || c.color || INK, c.label === 'right' ? 1 : -1));

    // battle markers: crossed swords on a dark disc, burst, name + year. The last stop gets the big treatment.
    const swords = (g, col) => {
      for (const rot of [-45, -135]) {
        const s = S.s('g', { transform: `rotate(${rot}) translate(-5,0)` }, g);
        S.s('path', { d: 'M-3,-2.3L17,-2.3L22,0L17,2.3L-3,2.3Z', fill: col }, s);
        S.s('rect', { x: -5.2, y: -7.5, width: 2.6, height: 15, rx: 1.2, fill: col }, s);
        S.s('rect', { x: -12, y: -1.7, width: 7, height: 3.4, rx: 1, fill: col }, s);
        S.s('circle', { cx: -13.6, cy: 0, r: 2.6, fill: col }, s);
      }
    };
    const battles = [];
    const mkBattle = (w, o) => {
      const [x, y] = PR(w.ll), a = anchor(x, y, L_BAT), t0 = w.t, big = o.big ? 1.2 : 1;
      const pulse = S.s('g', {}, a.g);
      const rings = [0, 1, 2].map(() => S.s('circle', { r: 30, fill: 'none', stroke: RED_HI, 'stroke-width': 3.5, opacity: 0 }, pulse));
      const shock = S.s('circle', { r: 30, fill: 'none', stroke: C.shock, 'stroke-width': 6, opacity: 0 }, pulse);
      const glow = S.s('circle', { r: 40 * big, fill: RED, opacity: 0, filter: `url(#${SOFT})` }, a.g);
      const burst = S.s('g', {}, a.g);
      for (let i = 0; i < 12; i++) { const an = (i / 12) * Math.PI * 2 + 0.26; S.s('line', { x1: Math.cos(an) * 34, y1: Math.sin(an) * 34, x2: Math.cos(an) * 50, y2: Math.sin(an) * 50, stroke: GOLD, 'stroke-width': 3, 'stroke-linecap': 'round' }, burst); }
      const body = S.s('g', { transform: `scale(${big})` }, a.g);
      if (o.pin) {                                                   // a non-battle finale: a big pin instead of swords
        S.s('circle', { r: 30, fill: 'none', stroke: GOLD, 'stroke-width': 1.5, opacity: 0.8 }, body);
        S.s('circle', { r: 19, fill: CREAM, stroke: INK, 'stroke-width': 4 }, body);
        S.s('circle', { r: 7.5, fill: RED }, body);
      } else {
        S.s('circle', { r: 33, fill: 'none', stroke: GOLD, 'stroke-width': 1.5, opacity: 0.8 }, body);
        S.s('circle', { r: 27, fill: C.battleDisc, stroke: RED, 'stroke-width': 4.5 }, body);
        swords(body, CREAM);
      }
      const lab = S.s('g', {}, a.g);
      if (w.name) txt(lab, w.name, o.dx, o.dy, o.anchor, `font:700 ${o.size || 26}px Cinzel;letter-spacing:3px;` + halo(CREAM, HALO2, 6));
      if (w.year) txt(lab, w.year, o.dx, o.dy + 27, o.anchor, `font:700 22px Cinzel;letter-spacing:3px;` + halo(GOLD, HALO2, 6));
      a.upd = (t) => {
        a.k = t < t0 ? 0 : ease('back.out(2.2)')(norm(t, t0, t0 + 0.5));
        const bu = norm(t, t0, t0 + 0.55);
        burst.setAttribute('opacity', f2(bu > 0 ? 1 - bu : 0)); burst.setAttribute('transform', `scale(${f2(0.7 + 0.7 * ease('expo.out')(bu))})`);
        const lu = ease('expo.out')(norm(t, t0 + 0.12, t0 + 0.7));
        lab.setAttribute('opacity', f2(lu)); lab.setAttribute('transform', `translate(0,${f2((1 - lu) * 10)})`);
        if (o.big) {
          const on = t >= t0 + 0.05, su = norm(t, t0, t0 + 0.8);
          shock.setAttribute('r', f2(34 + 300 * ease('expo.out')(su))); shock.setAttribute('opacity', f2(su > 0 && su < 1 ? Math.pow(1 - su, 1.5) : 0)); shock.setAttribute('stroke-width', f2(9 - 8 * su));
          glow.setAttribute('opacity', f2(on ? 0.5 + 0.18 * Math.sin((t - t0) * 5) : 0));
          rings.forEach((r, i) => {
            const ph = (t - t0 - i * 0.42) / 1.26, fr = ph - Math.floor(ph);
            const live = on && ph >= 0;
            r.setAttribute('r', f2(32 + 100 * ease('power2.out')(fr))); r.setAttribute('opacity', f2(live ? Math.min(1, 1.15 * (1 - fr)) : 0)); r.setAttribute('stroke-width', f2(5.5 - 4 * fr));
          });
        }
      };
      battles.push(a);
    };
    WP.forEach((w, i) => {
      if (i === LAST || w.kind !== 'battle') return;
      const [dx, dy, anc] = BAT_SIDE[w.label] || BAT_SIDE.left;
      mkBattle(w, { dx, dy, anchor: anc, size: w.size });
    });
    { const [dx, dy, anc] = BIG_SIDE[FIN.label] || BIG_SIDE.above; mkBattle(FIN, { dx, dy, anchor: anc, size: FIN.size || 28, big: true, pin: FIN.kind !== 'battle' }); }

    // army token at the route head: disc, icon (war elephant) or monogram, direction arrow
    const ELE = 'M8,24C8,15 15,10 25,10C32,10 37,8 42,7C50,5 57,9 58,16C59,21 58,26 59,31C60,36 62,40 64,41L63.5,44C59.5,43.5 56.5,40 55,35C54.2,32.5 53,31 51,31L51,44L45,44L45,36C39,38 30,38 24,36L24,44L17,44L16,34C12,32 8,29 8,24Z';
    const elephant = (g, fillC, cut) => {
      S.s('path', { d: 'M8.5,22C6,25 5,29 5.5,33', fill: 'none', stroke: fillC, 'stroke-width': 1.6, 'stroke-linecap': 'round' }, g);
      S.s('path', { d: ELE, fill: fillC }, g);
      S.s('path', { d: 'M42,12C37,13 36,22 40,27C43,29 47,26 47.5,21', fill: 'none', stroke: cut, 'stroke-width': 1.8, 'stroke-linecap': 'round' }, g);
      S.s('circle', { cx: 53, cy: 15, r: 1.5, fill: cut }, g);
      S.s('path', { d: 'M52.5,30.5C55.5,33.5 58,34.5 61.5,33.5', fill: 'none', stroke: cut, 'stroke-width': 3.8, 'stroke-linecap': 'round' }, g);
      S.s('path', { d: 'M52.5,30.5C55.5,33.5 58,34.5 61.5,33.5', fill: 'none', stroke: '#FFFFFF', 'stroke-width': 2, 'stroke-linecap': 'round' }, g);
    };
    const tok = anchor(pts[0][0], pts[0][1], L_TOK);
    S.s('circle', { r: 34, cx: 2, cy: 5, fill: '#000', opacity: 0.4, filter: `url(#${SOFT})` }, tok.g);
    const arrow = S.s('g', {}, tok.g);
    S.s('path', { d: 'M30,-13L53,0L30,13Z', fill: RED, stroke: CREAM, 'stroke-width': 3, 'stroke-linejoin': 'round' }, arrow);
    S.s('circle', { r: 32, fill: RED, stroke: CREAM, 'stroke-width': 3.5 }, tok.g);
    S.s('circle', { r: 26.5, fill: 'none', stroke: C.tokenRing, 'stroke-width': 1.2, opacity: 0.8 }, tok.g);
    const TOKEN = String(P.token ?? 'elephant');
    if (TOKEN === 'elephant') elephant(S.s('g', { transform: 'translate(-25.5,-19) scale(0.79)' }, tok.g), CREAM, RED);
    else if (TOKEN && TOKEN !== 'none') {
      const mono = TOKEN.slice(0, 3), fs = [0, 36, 27, 20][mono.length];
      S.s('text', { x: 0, y: fs * 0.36, 'text-anchor': 'middle', text: mono, style: `font:700 ${fs}px Cinzel;fill:${CREAM};letter-spacing:${mono.length > 1 ? 1 : 0}px;` }, tok.g);
    }
    const tIn = 0.6, tOut = T(FIN.t - 0.08);
    tok.upd = (t) => {
      const L = headLen(t), p = headXY(L), a = headXY(L - 5), b = headXY(L + 5);
      tok.x = p[0]; tok.y = p[1];
      if (Math.hypot(b[0] - a[0], b[1] - a[1]) > 0.5) arrow.setAttribute('transform', `rotate(${f2((Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI)})`);
      tok.k = t < tIn ? 0 : t < tOut ? ease('back.out(2)')(norm(t, tIn, tIn + 0.5)) : 1 - ease('power3.in')(norm(t, tOut, tOut + 0.14));
    };

    S.onFrame((t) => {
      for (const o of pinned) {
        if (o.upd) o.upd(t);
        if (o.k <= 0.001) { o.g.style.display = 'none'; continue; }
        o.g.style.display = '';
        o.g.setAttribute('transform', `translate(${f2(o.x)},${f2(o.y)}) scale(${(o.k / Z).toFixed(4)})`);
      }
    });

    /* ======================= HUD (screen space) ======================= */
    const blackout = S.el('div', { style: 'position:absolute;left:0;top:0;width:1920px;height:1080px;background:#000;' }, S.hud);
    tl.fromTo(blackout, { opacity: 1 }, { opacity: 0, duration: 0.95, ease: 'power2.out' }, 0.05);

    // weather: a colour wash + wind-driven particles (canvas, analytic paths) around the storm stop
    const WX = {
      snow: { wash: ['rgba(222,236,248,.42)', 'rgba(176,200,224,.18)', 'rgba(150,178,206,.08)'], rgb: '246,249,255', vx: [170, 330], vy: [200, 380], near: [0.22, 7, 4], far: [0.3, 0.62, 1.3, 3.2], tail: 0.02 },
      rain: { wash: ['rgba(96,116,138,.46)', 'rgba(70,88,110,.26)', 'rgba(52,66,84,.14)'], rgb: '206,220,238', vx: [60, 120], vy: [1100, 900], near: [0.16, 3, 1.5], far: [0.22, 0.5, 1, 1.4], tail: 0.035 },
      sand: { wash: ['rgba(226,178,104,.46)', 'rgba(200,150,84,.26)', 'rgba(170,120,64,.14)'], rgb: '232,196,136', vx: [700, 900], vy: [30, 90], near: [0.2, 6, 3], far: [0.3, 0.55, 1.2, 2.6], tail: 0.018 },
    }[P.weather] || null;
    const frost = S.el('div', { style: `position:absolute;left:0;top:0;width:1920px;height:1080px;background:radial-gradient(ellipse 85% 75% at 62% 16%, ${(WX || { wash: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)'] }).wash[0]}, ${WX ? WX.wash[1] : 'rgba(0,0,0,0)'} 50%, ${WX ? WX.wash[2] : 'rgba(0,0,0,0)'} 100%);opacity:0;` }, S.hud);
    const SN0 = STORM ? T(STORM.t - 0.15) : 99, SN1 = STORM ? T(AFTER.t + 0.43) : 99;
    if (STORM && WX) {
      tl.fromTo(frost, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'power2.out' }, T(STORM.t - 0.13));
      tl.to(frost, { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, T(AFTER.t - 0.02));
    }
    const snow = S.canvas(S.hud);
    const FL = []; for (let i = 0; i < 460; i++) { const near = i < 26; FL.push({ x: S.rnd(0, W + 160), y: S.rnd(0, H + 160), d: near ? S.rnd(1.3, 1.9) : S.rnd(0.25, 1), ph: S.rnd(0, 6.28), sw: S.rnd(6, 24) }); }
    let snowDirty = false;
    S.onFrame((t) => {
      const env = STORM && WX ? clamp(Math.min(norm(t, SN0, SN0 + 0.4), 1 - norm(t, SN1 - 0.55, SN1))) : 0;
      if (env <= 0) { if (snowDirty) { snow.clearRect(0, 0, W, H); snowDirty = false; } return; }
      snowDirty = true; snow.clearRect(0, 0, W, H); snow.lineCap = 'round';
      const u = t - SN0 + 2;
      for (const f of FL) {
        const vx = -(WX.vx[0] + WX.vx[1] * f.d), vy = WX.vy[0] + WX.vy[1] * f.d, near = f.d > 1.2;
        let x = f.x + vx * u + Math.sin(u * 2.6 + f.ph) * f.sw, y = f.y + vy * u;
        x = ((x % (W + 160)) + (W + 160)) % (W + 160) - 80; y = ((y % (H + 160)) + (H + 160)) % (H + 160) - 80;
        const a = near ? env * WX.near[0] : env * (WX.far[0] + WX.far[1] * f.d);
        snow.strokeStyle = `rgba(${WX.rgb},${a.toFixed(3)})`; snow.lineWidth = near ? WX.near[1] + WX.near[2] * (f.d - 1.3) : WX.far[2] + WX.far[3] * f.d;
        snow.beginPath(); snow.moveTo(x, y); snow.lineTo(x - vx * WX.tail, y - vy * WX.tail); snow.stroke();
      }
    });
    // red light flash that tracks the finale's on-screen position at the hit
    const [cnX, cnY] = PR(FIN.ll);
    const flash = S.el('div', { style: `position:absolute;left:0;top:0;width:1500px;height:1500px;margin:-750px 0 0 -750px;border-radius:50%;background:radial-gradient(circle, rgba(${rgb(C.flash)},.6) 0%, rgba(${rgb(RED)},.28) 28%, rgba(${rgb(RED)},0) 62%);mix-blend-mode:screen;opacity:0;pointer-events:none;` }, S.hud);
    S.onFrame((t) => {
      const u = norm(t, FIN.t, T(FIN.t + 0.88)), o = u <= 0 || u >= 1 ? 0 : u < 0.05 ? u / 0.05 : Math.pow(1 - (u - 0.05) / 0.95, 2.2);
      flash.style.opacity = o.toFixed(3);
      if (o > 0) flash.style.transform = `translate(${f2(W / 2 + (cnX - CX) * Z)}px,${f2(H / 2 + (cnY - CY) * Z)}px)`;
    });

    // antique neatline
    const neat = S.el('div', { style: `position:absolute;left:30px;top:30px;width:1860px;height:1020px;box-sizing:border-box;border:1.5px solid rgba(${rgb(GOLD)},.42);box-shadow:inset 0 0 0 7px rgba(0,0,0,0), inset 0 0 0 8.5px rgba(${rgb(GOLD)},.22);pointer-events:none;` }, S.hud);
    tl.fromTo(neat, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0.2);

    // title block (docks smaller when the camera pulls wide)
    const SH = rgb(C.shade);
    const tShade = S.el('div', { style: `position:absolute;left:0;top:0;width:1250px;height:560px;background:radial-gradient(ellipse 72% 72% at 0% 0%, rgba(${SH},.86) 0%, rgba(${SH},.55) 45%, rgba(${SH},0) 100%);transform-origin:0 0;` }, S.hud);
    const title = S.el('div', { style: 'position:absolute;left:96px;top:92px;transform-origin:0 0;' }, S.hud);
    const yr = S.el('div', { text: P.date, style: `font:900 124px/0.92 Cinzel,serif;color:${GOLD};letter-spacing:.02em;text-shadow:0 3px 0 ${C.goldShadow}, 0 12px 34px rgba(0,0,0,.65);white-space:nowrap;width:max-content;transform-origin:0 60%;` }, title);
    fitWidth(yr, 1000);
    const rule = S.el('div', { style: 'position:relative;margin-top:16px;width:600px;height:12px;transform-origin:0 50%;' }, title);
    S.el('div', { style: `position:absolute;left:0;top:5px;width:600px;height:2px;background:linear-gradient(90deg, rgba(${rgb(GOLD)},.95), rgba(${rgb(GOLD)},.35) 80%, rgba(${rgb(GOLD)},0));` }, rule);
    S.el('div', { style: `position:absolute;left:-1px;top:1px;width:10px;height:10px;background:${GOLD};transform:rotate(45deg);` }, rule);
    const sub = S.el('div', { text: P.title, style: `margin-top:14px;font:700 32px/1 Cinzel,serif;letter-spacing:8px;color:${C.titleText};text-shadow:0 2px 3px rgba(0,0,0,.8),0 4px 16px rgba(0,0,0,.7);white-space:nowrap;width:max-content;` }, title);
    fitWidth(sub, 1100);
    // measure both title lines at their resting layout (before any tween touches letter-spacing)
    const tRects = [yr, sub].map((e) => [e.offsetLeft, e.offsetTop, e.offsetLeft + e.offsetWidth, e.offsetTop + e.offsetHeight]);
    tRects[1][1] = rule.offsetTop;
    const subW = sub.offsetWidth, subN = sub.textContent.length;
    tl.fromTo(yr, { opacity: 0, scale: 1.35, filter: 'blur(14px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.55, ease: 'expo.out' }, 0.1);
    tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'expo.out' }, 0.3);
    tl.fromTo(sub, { opacity: 0, letterSpacing: '26px' }, { opacity: 1, letterSpacing: '8px', duration: 1.0, ease: 'expo.out' }, 0.36);
    tl.fromTo(tShade, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.05);
    tl.to([title, tShade], { scale: 0.7, duration: 0.8, ease: 'power3.inOut' }, 1.5);
    // region labels dim while they pass under the title block (screen boxes per line, per frame)
    S.onFrame(() => {
      const sc = gsap.getProperty(title, 'scale'), mg = 18;
      tRects[1][2] = tRects[1][0] + subW + (parseFloat(gsap.getProperty(sub, 'letterSpacing')) - 8) * subN;
      for (const L of regions) {
        const a0 = W / 2 + (L.x0 - CX) * Z, a1 = W / 2 + (L.x1 - CX) * Z, b0 = H / 2 + (L.y0 - CY) * Z, b1 = H / 2 + (L.y1 - CY) * Z;
        let d = 1e9;
        for (const [x0, y0, x1, y1] of tRects) {
          const X0 = 96 + x0 * sc - mg, Y0 = 92 + y0 * sc - mg, X1 = 96 + x1 * sc + mg, Y1 = 92 + y1 * sc + mg;
          d = Math.min(d, Math.hypot(Math.max(X0 - a1, a0 - X1, 0), Math.max(Y0 - b1, b0 - Y1, 0)));
        }
        L.el.style.opacity = (L.op * (0.08 + 0.92 * ease('power1.inOut')(clamp(d / 36)))).toFixed(3);
      }
    });
    S.sfx(0.14, 'drum', { gain: 0.5, pitch: 0.88 });
    S.sfx(0.14, 'braam', { gain: 0.085, dur: 1.6, freq: 46 });
    S.sfx(0.36, 'swoosh', { gain: 0.2, pitch: 0.8 });
    S.sfx(0.5, 'drum', { gain: 0.3, pitch: 1.3 });
    S.sfx(1.5, 'swoosh', { gain: 0.14, pitch: 0.7 });
    S.beat(0.14, 'The date slams in on a drum hit while the map fades up');

    // army HUD: appears at the first stop with a count, bleeds men on the way to each next count (the storm drives it)
    const CNT = WP.filter((w) => typeof w.count === 'number');
    const CO = P.counter || {}, STAT = CO.stat || null, RIGHT = CO.side === 'right';
    const PNL = rgb(C.panel);
    const army = S.el('div', { style: `position:absolute;${RIGHT ? 'right' : 'left'}:96px;top:818px;display:flex;align-items:stretch;padding:18px 32px 18px 28px;background:linear-gradient(180deg, rgba(${rgb(C.panelTop)},.95), rgba(${PNL},.95));border:1px solid rgba(${rgb(GOLD)},.62);box-shadow:0 0 0 4px rgba(${PNL},.92),0 0 0 5px rgba(${rgb(GOLD)},.26),0 20px 44px rgba(0,0,0,.55);` }, S.hud);
    const colA = S.el('div', { style: 'position:relative;width:330px;' }, army);
    const armyL = S.el('div', { text: CO.label ?? '', style: `font:700 22px/1 Cinzel,serif;letter-spacing:.24em;color:${GOLD};white-space:nowrap;` }, colA);
    const armyN = S.el('div', { text: CNT.length ? S.fmt(CNT[0].count) : '', style: `margin-top:10px;font:700 76px/1 Cinzel,serif;color:${PARCH};white-space:nowrap;` }, colA);
    // widen the column for big numbers (up to 470 px), then shrink the type
    const probe = S.el('span', { style: 'position:absolute;visibility:hidden;font:700 76px/1 Cinzel,serif;white-space:nowrap;' }, colA);
    const numW = Math.max(0, ...CNT.map((w) => { probe.textContent = S.fmt(w.count); return probe.offsetWidth; }));
    probe.remove();
    if (numW > 320) colA.style.width = Math.min(470, numW + 10) + 'px';
    const colW = parseFloat(colA.style.width);
    if (numW > colW) armyN.style.fontSize = (76 * colW) / numW + 'px';
    fitWidth(armyL, colW + 20);
    const notes = CNT.map((w, j) => {
      const el = j === 0
        ? S.el('div', { text: w.note ?? '', style: `margin-top:10px;font:600 22px/1 Cinzel,serif;letter-spacing:.2em;color:${C.muted};white-space:nowrap;` }, colA)
        : S.el('div', { text: w.note ?? '', style: `position:absolute;left:0;bottom:0;font:700 22px/1 Cinzel,serif;letter-spacing:.2em;color:${RED_HI};white-space:nowrap;opacity:0;` }, colA);
      fitWidth(el, colW + 20);
      return el;
    });
    const losses = CNT.slice(1).map((w, j) => {
      const dv = w.count - CNT[j].count;
      return S.el('div', { text: (dv < 0 ? '−' : '+') + S.fmt(Math.abs(dv)), style: `position:absolute;left:150px;top:-84px;padding:6px 14px 8px;background:rgba(${PNL},.92);border:1px solid rgba(${rgb(RED_HI)},.7);font:700 40px/1 Cinzel,serif;color:${RED_HI};text-shadow:0 0 18px rgba(${rgb(RED)},.7);white-space:nowrap;opacity:0;` }, colA);
    });
    if (STAT) {
      S.el('div', { style: `width:2px;margin:2px 34px 0 26px;background:linear-gradient(180deg, rgba(${rgb(GOLD)},0), rgba(${rgb(GOLD)},.75), rgba(${rgb(GOLD)},0));` }, army);
      const colB = S.el('div', {}, army);
      S.el('div', { text: STAT.label ?? '', style: `font:700 22px/1 Cinzel,serif;letter-spacing:.24em;color:${GOLD};` }, colB);
      const eRow = S.el('div', { style: 'margin-top:10px;display:flex;align-items:center;gap:14px;' }, colB);
      if (STAT.icon === 'elephant') elephant(S.svg(eRow, { width: 76, height: 57, viewBox: '0 0 66 50', style: 'position:relative;' }), CREAM, C.iconCut);
      S.el('div', { text: String(STAT.value ?? ''), style: `font:700 76px/1 Cinzel,serif;color:${PARCH};` }, eRow);
    }
    if (!CNT.length) army.style.display = 'none';
    // rolls between consecutive counts: they start as the storm hits, or after a beat to read the previous count
    const rolls = CNT.slice(1).map((w, j) => {
      const a = CNT[j], stormed = STORM && STORM.t >= a.t && STORM.t < w.t;
      const t0 = T(stormed ? STORM.t + 0.17 : Math.max(a.t + 0.17, Math.min(a.t + 0.77, w.t - 0.35))), end = T(w.t + 0.02);
      return { from: a.count, to: w.count, t0, dur: T(end - t0), land: w.t };
    });
    const T_HUD = CNT.length ? CNT[0].t : 99;
    const T_OUT = CNT.length > 1 ? T(Math.max(5.15, CNT[CNT.length - 1].t + 0.73)) : 5.15;
    if (CNT.length) tl.fromTo(army, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, T_HUD);
    const ez = ease('power2.inOut');
    let lastArmy = null;
    S.onFrame((t) => {
      let v = CNT.length ? CNT[0].count : 0;
      for (const r of rolls) if (t >= r.t0) v = r.from + (r.to - r.from) * ez(norm(t, r.t0, r.t0 + r.dur));
      const s = S.fmt(v);
      if (s !== lastArmy) { armyN.textContent = s; lastArmy = s; }
    });
    if (rolls.length) tl.to(armyN, { color: RED_HI, duration: 0.5, ease: 'power1.inOut' }, rolls[0].t0);
    rolls.forEach((r, j) => {
      tl.fromTo(losses[j], { opacity: 0, y: 10, scale: 0.6 }, { opacity: 1, y: -6, scale: 1, duration: 0.35, ease: 'back.out(2.5)' }, r.land);
      tl.to(losses[j], { opacity: 0, y: -30, duration: 0.35, ease: 'power2.in' }, T(r.land + 0.43));
      tl.to(notes[j], { opacity: 0, duration: 0.2 }, r.land);
      tl.fromTo(notes[j + 1], { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.4, ease: 'expo.out' }, T(r.land + 0.04));
    });
    if (CNT.length && !RIGHT) tl.to(army, { opacity: 0, y: 60, duration: 0.45, ease: 'power2.in' }, Math.min(6.2, T_OUT));
    if (CNT.length) { S.sfx(T_HUD, 'swoosh', { gain: 0.22 }); S.sfx(T(T_HUD + 0.05), 'thud', { gain: 0.25 }); }
    rolls.forEach((r) => {
      for (let i = 0; i < 12; i++) S.sfx(r.t0 + (r.dur * Math.acos(1 - (2 * (i + 0.5)) / 12)) / Math.PI, 'tick', { gain: 0.1, pitch: 1.3 - i * 0.05 });
      S.sfx(r.land, 'thud', { gain: 0.4 });
      S.sfx(T(r.land + 0.02), 'impact', { gain: 0.22, pitch: 1.3 });
    });

    // storm: wind, shake, cold
    if (STORM && WX) {
      S.sfx(T(STORM.t - 0.19), 'wind', { dur: T(AFTER.t - STORM.t + 0.83), gain: 0.3 });
      S.sfx(STORM.t, 'whoosh', { dur: 0.9, from: 160, to: 700, gain: 0.2 });
      S.shake(T(STORM.t + 0.05), { amp: 4, dur: 1.0, freq: 11, rot: 0.2 });
    }
    rolls.forEach((r) => S.shake(r.land, { amp: 7, dur: 0.45, freq: 20 }));
    if (STORM && WX) S.beat(STORM.t, `Storm beat: ${P.weather}, wind and the army count falling`);

    // march: whooshes and a quiet drum pulse under the pins (strong between stops, soft on them)
    S.sfx(0.6, 'thud', { gain: 0.3, pitch: 0.9 });
    S.sfx(0.8, 'whoosh', { dur: 0.9, from: 200, to: 1300, gain: 0.16 });
    let pulse = SHOW.pulse;
    if (!showcase) {
      pulse = []; const stop = Math.min(STORM ? STORM.t : 4.45, 4.45);
      for (let i = 0; i < LAST; i++) { const m = T((WP[i].t + WP[i + 1].t) / 2); if (m < stop) pulse.push(m); if (WP[i + 1].t < stop) pulse.push(WP[i + 1].t); }
    }
    pulse.forEach((t, i) => S.sfx(t, 'drum', { gain: i % 2 ? 0.05 : 0.09, pitch: i % 2 ? 1.2 : 1.0 }));
    S.beat(0.85, 'Camera rides the army token so the eye never searches');

    // pull-out to the whole theatre, battles
    S.sfx(4.5, 'whoosh', { dur: 1.4, from: 220, to: 1500, gain: 0.28 });
    S.beat(4.5, 'Pull-out reveals the whole route right as the battles start');
    WP.filter((w, i) => i < LAST && w.kind === 'battle').map((w, j) => [w.t, r2(Math.min(0.58, 0.46 + 0.04 * j)), r2(Math.max(0.8, 1.0 - 0.05 * j))])
      .forEach(([t, g, p]) => { S.sfx(t, 'drum', { gain: g, pitch: p }); S.sfx(t, 'impact', { gain: 0.16, pitch: 1.2 }); });
    S.sfx(FIN.t, 'drum', { gain: 0.62, pitch: 0.82 });
    S.sfx(FIN.t, 'boom', { gain: 0.24, dur: 1.6 });
    S.sfx(FIN.t, 'braam', { gain: 0.09, dur: 1.6, freq: 41 });
    S.shake(FIN.t, { amp: 10, dur: 0.55, freq: 22 });
    S.beat(FIN.t, `${cap(FIN.name || 'The finale')} lands hardest: pulse rings, then the big number`);

    // lower third: the finale
    const FI = P.finale || {};
    const lt = S.el('div', { style: 'position:absolute;left:96px;top:790px;width:820px;height:194px;' }, S.hud);
    const ltPlate = S.el('div', { style: `position:absolute;left:0;top:0;width:820px;height:194px;background:linear-gradient(90deg, rgba(${PNL},.96), rgba(${PNL},.9));border:1px solid rgba(${rgb(GOLD)},.55);box-shadow:0 0 0 4px rgba(${PNL},.9),0 0 0 5px rgba(${rgb(GOLD)},.24),0 20px 44px rgba(0,0,0,.55);` }, lt);
    const ltBar = S.el('div', { style: `position:absolute;left:0;top:0;width:9px;height:194px;background:${RED};transform-origin:50% 100%;` }, lt);
    const ltTitle = fill(FI.title, vars), ltDate = fill(FI.date, vars);
    const ltT = S.el('div', { html: esc(ltTitle) + (ltTitle && ltDate ? ` <span style="color:${GOLD}">·</span> ` : '') + esc(ltDate), style: `position:absolute;left:40px;top:22px;font:700 60px/1 Cinzel,serif;letter-spacing:.05em;color:${CREAM};white-space:nowrap;` }, lt);
    const ltS = S.el('div', { style: `position:absolute;left:42px;top:96px;font:italic 600 42px/1 "Cormorant Garamond",serif;color:${PARCH};white-space:nowrap;` }, lt);
    const hasVal = typeof FI.value === 'number', LINE = String(FI.line ?? '');
    const [pre, post] = hasVal && LINE.includes('{value}') ? LINE.split('{value}') : [LINE, null];
    if (pre) ltS.appendChild(document.createTextNode(pre));
    const ltN = hasVal && post !== null ? S.el('span', { text: (FI.prefix ?? '') + S.fmt(FI.value) + (FI.suffix ?? ''), style: `font-style:normal;font-weight:700;color:${RED_HI};` }, ltS) : null;
    if (post) ltS.appendChild(document.createTextNode(post));
    const ltF = S.el('div', { text: FI.note ?? '', style: `position:absolute;left:42px;top:148px;font:600 27px/1 "Cormorant Garamond",serif;letter-spacing:.01em;color:${C.footnote};white-space:nowrap;` }, lt);
    // grow the plate for long lines (up to 1100 px), then shrink the type
    const ltW = Math.max(ltT.scrollWidth + 40, ltS.scrollWidth + 42, ltF.scrollWidth + 42) + 36;
    if (ltW > 820) { const w = Math.min(1100, ltW); lt.style.width = ltPlate.style.width = w + 'px'; }
    const ltMax = parseFloat(lt.style.width) - 78;
    [ltT, ltS, ltF].forEach((el) => fitWidth(el, ltMax));
    if (!FI.note) ltF.style.display = 'none';
    tl.fromTo(ltPlate, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.6, ease: 'expo.out' }, 6.68);
    tl.fromTo(ltBar, { scaleY: 0 }, { scaleY: 1, duration: 0.45, ease: 'expo.out' }, 6.64);
    tl.fromTo(ltT, { opacity: 0, y: 22, clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: 0.6, ease: 'expo.out' }, 6.8);
    tl.fromTo(ltS, { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.5, ease: 'expo.out' }, 7.02);
    if (ltN) S.count(ltN, { from: 0, to: FI.value, t: 7.04, dur: 0.7, ease: 'power3.out', prefix: FI.prefix ?? '', suffix: FI.suffix ?? '' });
    tl.fromTo(ltF, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 7.85);
    S.sfx(6.64, 'swoosh', { gain: 0.3 });
    S.sfx(6.82, 'thud', { gain: 0.32 });
    if (ltN) for (let i = 0; i < 9; i++) S.sfx(7.04 + 0.7 * (1 - Math.pow(1 - (i + 1) / 10, 1 / 4)), 'tick', { gain: 0.08, pitch: 0.8 + i * 0.03 });
    S.sfx(7.74, 'bass', { gain: 0.24, freq: 41 });
    S.sfx(7.74, 'impact', { gain: 0.18, pitch: 0.7 });
    S.sfx(T(FIN.t + 0.03), 'pad', { dur: T(9 - FIN.t - 0.03), gain: 0.05, notes: P.padNotes, attack: 0.8, release: 0.5 });
    S.sfx(0, 'drone', { dur: 9, freq: P.droneHz, cutoff: 240, gain: 0.07 });

    S.vignette({ strength: 0.62, inner: 46 });
    S.grain({ opacity: 0.06 });
    S.beats.sort((a, b) => a.t - b.t);                              // retention notes in time order
  },
});
