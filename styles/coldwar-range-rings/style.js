/* Cold War — Range Rings (default: Thirteen Days, October 1962)
   A CRT situation display. The range rings are true geodesic circles around the site, recomputed and
   re-projected (Mercator) every frame from the current radius; each city flips red on the exact frame the
   ring's great-circle radius reaches its distance from the site. Distances and hit times are computed from
   the params (site, cities, ring radii), so a new story is a new params file. */
Reel.style({
  id: 'coldwar-range-rings', seed: 'coldwar', order: 10,
  name: 'Range Rings',
  transIn: { type: 'blinds', dur: 0.5, angle: 0, stripe: 12 },   // how a reel cuts INTO this piece (tools/new-reel.mjs); a reel item's trans overrides it
  niches: {
    primary: ['Cold War history', 'Military & geopolitics', 'Nuclear history'],
    similar: ['Volcano & disaster explainers', 'Explosions & shockwaves', 'Current-events missile ranges', 'Aviation & drone range', 'Radio & broadcast coverage', 'Earthquake reach'],
  },
  niche: 'Cold War History', title: 'Thirteen Days', duration: 8.5, poster: 8.0,
  bg: '#020A05', palette: ['#58FF9A', '#FFB347', '#FF4545'],
  techniques: ['True geodesic range rings', 'Contact-timed city hits', 'CRT phosphor display'],
  why: 'The rings are a countdown the viewer can watch: each city flips red the instant the circle touches it, the capital lands last on the very edge of the first ring, and the alarm only sounds once the whole country is inside.',
  facts: 'Rings from the CIA October 1962 briefing map: SS-4 MRBM 1,020 nm and SS-5 IRBM 2,200 nm, centred on the San Cristóbal MRBM sites a U-2 photographed on 14 Oct 1962. City distances are great-circle distances computed from the site (Washington 1,019 nm). Crisis 16–28 Oct 1962; SAC went to DEFCON 2 on 24 Oct. Natural Earth 50m map.',
  defaults: {
    map: 'cold',                                   // region key in data/mapdata.js (data/maps.config.json)
    unit: 'nm',                                    // nm · km · mi: ring radii and every distance on screen
    // the ring centre. {coords} = its lat/lon in degrees and minutes. highlight = a country path in the region
    // data (maps.config "countries"), tinted in colors.accent on lock. null = the region's own site
    site: { name: 'SAN CRISTÓBAL', sub: 'MRBM SITES · {coords}', lon: -83.05, lat: 22.72, highlight: 'cuba' },
    // 1–3 rings, growing in turn. label + radius make the tag on the ring; readout is the panel line while it grows
    rings: [
      { label: 'SS-4', radius: 1020, readout: 'SS-4 · MRBM' },
      { label: 'SS-5', radius: 2200, readout: 'SS-5 · IRBM' },
    ],
    ringLabelBearing: 290,                         // compass bearing where the ring tags sit
    target: 'Washington',                          // city name: big callout, camera punch and screen tear on contact
    // 3–24 cities. label: left · right (side for the few that get a label). callout: the target's big label
    cities: [
      { name: 'Miami', lon: -80.19, lat: 25.76, label: 'right' },
      { name: 'New Orleans', lon: -90.07, lat: 29.95 },
      { name: 'Houston', lon: -95.37, lat: 29.76 },
      { name: 'Atlanta', lon: -84.39, lat: 33.75 },
      { name: 'Dallas', lon: -96.8, lat: 32.78 },
      { name: 'Washington', lon: -77.04, lat: 38.9, callout: 'WASHINGTON, D.C.', label: 'left' },
      { name: 'St. Louis', lon: -90.2, lat: 38.63 },
      { name: 'New York', lon: -74.01, lat: 40.71 },
      { name: 'Chicago', lon: -87.63, lat: 41.88 },
      { name: 'Detroit', lon: -83.05, lat: 42.33 },
      { name: 'Boston', lon: -71.06, lat: 42.36 },
      { name: 'Denver', lon: -104.99, lat: 39.74 },
      { name: 'Minneapolis', lon: -93.27, lat: 44.98 },
      { name: 'Los Angeles', lon: -118.24, lat: 34.05, label: 'left' },
      { name: 'San Francisco', lon: -122.42, lat: 37.77, label: 'right' },
      { name: 'Seattle', lon: -122.33, lat: 47.61, label: 'right' },
      { name: 'Mexico City', lon: -99.13, lat: 19.43 },
    ],
    header: { label: 'SITUATION DISPLAY', text: '14 OCT 1962 — U-2 RECONNAISSANCE' },
    readout: { range: 'RANGE', count: 'CITIES IN RANGE:' },
    inRange: 'INSIDE RANGE',                       // after the target's distance
    outOfRange: 'OUT OF RANGE',                    // after cities the last ring never reaches
    alert: { text: 'DEFCON 2', sub: 'SAC · 24 OCT 1962' },   // flashing badge after the last ring; null hides it
    closing: { text: 'THE WORLD HAD ', accent: '13 DAYS.', sub: 'THE CRISIS RAN 16–28 OCTOBER 1962' },
    // camera: [x, y, zoom] in map px at 0, 1.45, 2.35, 3.85, 4.3, 5.95 and 8.5 s; null = framed from the site and rings
    framing: [[985, 575, 1.07], [1000, 585, 1.0], [1172, 772, 1.55], [1112, 616, 1.13], [1106, 606, 1.14], [978, 474, 0.915], [985, 474, 0.935]],
    graticule: { lon: [-150, -30], lat: [-10, 70], step: 10 },   // degrees; null = cover the frame
    droneHz: 36.7,                                 // low drone and the closing bass note
    colors: {
      phosphor: '#58FF9A', pale: '#C9FFE0', accent: '#FFB347', hit: '#FF4545', bg: '#020A05', shade: '#010603', panel: '#020905',
      closing: '#EAFFF2', closingAccent: '#FFC56E', closingSub: '#AAFFCD', alertSub: '#FFD9A8', alertBg: '#281600',
      crt: { pulse: '#C8FFE1', sweep: '#BEFFD7', band: '#78FFB4', glare: '#D2FFE6', tear: '#C8FFDC', powerLine: '#E6FFF0', powerFlash: '#DFFFEA' },
    },
  },
  build(S, P) {
    const tl = S.tl, W = 1920, H = 1080, clamp = S.clamp, lerp = S.lerp, norm = S.norm, ease = S.ease;
    const C = P.colors, CRT = C.crt;
    const GREEN = C.phosphor, AMBER = C.accent, RED = C.hit, PALE = C.pale, BG = C.bg;
    const rgb = (hex) => { const n = parseInt(String(hex).slice(1), 16); return `${n >> 16},${(n >> 8) & 255},${n & 255}`; };
    const G = rgb(GREEN), A = rgb(AMBER), DIMG = `rgba(${G},.55)`;
    const MD = MAPDATA[P.map];
    if (!MD) throw new Error(`coldwar-range-rings: no map "${P.map}" in data/mapdata.js (add it to data/maps.config.json, then run node tools/mapgen.mjs)`);
    const PR = Reel.mercator(MD.k, MD.tx, MD.ty);
    const f2 = (n) => n.toFixed(2);
    const T = (x) => Math.round(x * 1e4) / 1e4;
    const fill = (s, vars) => String(s ?? '').replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
    const MONO = '"JetBrains Mono",monospace', VT = 'VT323,monospace';
    const DUR = 8.5;
    if (!S.alpha) S.root.style.background = BG;

    /* ======================= SITE, UNITS, CITIES ======================= */
    const ST = P.site || (MD.site ? { name: String(MD.site.name).toUpperCase(), lon: MD.site.lon, lat: MD.site.lat } : null);
    if (!ST) throw new Error('coldwar-range-rings: no site in params or region data');
    const SITE = [ST.lon, ST.lat], [SX, SY] = PR(SITE);
    const UNIT = { km: 'KM', mi: 'MI' }[P.unit] || 'NM';
    const KM_PER = { NM: 1.852, KM: 1, MI: 1.609344 }[UNIT];
    const toDeg = UNIT === 'NM' ? (d) => d / 60 : (d) => (d * KM_PER) / 111.19508;   // 1 nm = 1 arc-minute
    const dm = (v, pos, neg) => { let d = Math.floor(Math.abs(v)), m = Math.round((Math.abs(v) - d) * 60); if (m === 60) { d++; m = 0; } return `${d}°${String(m).padStart(2, '0')}'${v < 0 ? neg : pos}`; };
    const coords = `${dm(ST.lat, 'N', 'S')} ${dm(ST.lon, 'E', 'W')}`;
    // city list: great-circle distance from the site, rounded to whole units; projected positions to 0.1 px
    const srcCities = (P.cities || (MD.cities || []).map((c) => ({ name: c.name, lon: c.lon, lat: c.lat }))).slice(0, 24);
    const CITIES0 = srcCities.map((c) => {
      const p = PR([c.lon, c.lat]), km = Reel.geoDistKm(SITE, [c.lon, c.lat]);
      return Object.assign({}, c, { x: +p[0].toFixed(1), y: +p[1].toFixed(1), km: Math.round(km), nm: Math.round(km / KM_PER) });
    }).sort((a, b) => a.km - b.km);

    /* ======================= RANGE MATH ======================= */
    const RD = (P.rings || (MD.rings || []).map((r) => ({ label: r.label, radius: r.nm }))).slice(0, 3);
    if (!RD.length) throw new Error('coldwar-range-rings: needs at least one ring');
    const NR = RD.length;
    // ring windows inside 2.4 → 6.05 s (the two-ring showcase keeps its hand-tuned split)
    const WIN = NR === 2 ? [[2.4, 4.12], [4.35, 6.05]] : Array.from({ length: NR }, (_, j) => { const d = (3.65 - 0.23 * (NR - 1)) / NR; return [T(2.4 + j * (d + 0.23)), T(2.4 + j * (d + 0.23) + d)]; });
    const RINGS = RD.map((r, j) => ({ R: r.radius, prev: j ? RD[j - 1].radius : 0, a: WIN[j][0], b: WIN[j][1], ez: ease(j ? 'sine.out' : 'power2.out'), label: r.label, readout: r.readout ?? r.label }));
    const T1a = RINGS[0].a, T1b = RINGS[0].b, TLb = RINGS[NR - 1].b;
    const rAt = (g, t) => (t < g.a && g.prev ? g.prev : g.prev + (g.R - g.prev) * g.ez(norm(t, g.a, g.b)));
    const reach = (t) => { let r = 0; for (const g of RINGS) if (t >= g.a) r = rAt(g, t); return r; };
    const hitTime = (nm) => { if (reach(DUR) < nm) return Infinity; let a = 0, b = DUR; for (let i = 0; i < 44; i++) { const m = (a + b) / 2; if (reach(m) >= nm) b = m; else a = m; } return b; };
    const ringD = (nm) => {
      if (nm < 1) return 'M0,0';
      const pts = Reel.geoCircle(SITE, toDeg(nm), 200).map(PR);
      return 'M' + pts.map((p) => f2(p[0]) + ',' + f2(p[1])).join('L') + 'Z';
    };
    const CITIES = CITIES0.map((c, i) => Object.assign(c, { i, tHit: hitTime(c.nm), ang: Math.atan2(c.y - SY, c.x - SX) }));
    const DC = CITIES.find((c) => c.name === P.target && isFinite(c.tHit)) || null;
    const T_DC = DC ? DC.tHit : Infinity;

    /* ======================= CAMERA (pure function of t) ======================= */
    let FR = P.framing;
    if (!FR || FR.length !== 7) {
      // automatic framing: open wide, push onto the site, follow the first ring, settle on the last
      const box = (R) => {
        const pts = Reel.geoCircle(SITE, toDeg(R), 120).map(PR).concat(CITIES.filter((c) => c.nm <= R).map((c) => [c.x, c.y]), [[SX, SY]]);
        const xs = pts.map((p) => clamp(p[0], -40, 1960)), ys = pts.map((p) => clamp(p[1], -40, 1120));
        const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
        const z = clamp(Math.min(1500 / Math.max(1, x1 - x0), 760 / Math.max(1, y1 - y0)), 0.86, 2.2);
        return [(x0 + x1) / 2, (y0 + y1) / 2 - 70 / z, z];              // keep the header band (top 220 px) clear
      };
      const b1 = box(RINGS[0].R), bL = box(RINGS[NR - 1].R);
      const c0 = [960 + 0.1 * (SX - 960), 540 + 0.1 * (SY - 540)], c1 = [960 + 0.17 * (SX - 960), 540 + 0.17 * (SY - 540)];
      const near = [SX + 0.35 * (b1[0] - SX), SY + 0.35 * (b1[1] - SY), clamp(b1[2] * 1.37, 1.2, 2.4)];
      FR = [[c0[0], c0[1], 1.07], [c1[0], c1[1], 1.0], near, b1, [b1[0] - 6, b1[1] - 10, b1[2] * 1.01], bL, [bL[0] + 7, bL[1], bL[2] * 1.022]];
    }
    const KT = [0, 1.45, 2.35, 3.85, 4.3, 5.95, 8.5], KE = [null, 'sine.inOut', 'power2.inOut', 'power2.inOut', 'sine.inOut', 'power2.inOut', 'sine.inOut'];
    const KEYS = FR.map((f, i) => ({ t: KT[i], x: f[0], y: f[1], z: f[2], e: KE[i] }));
    let CX = KEYS[0].x, CY = KEYS[0].y, Z = KEYS[0].z;
    S.onFrame((t) => {
      let k = 0; while (k < KEYS.length - 1 && t >= KEYS[k + 1].t) k++;
      const a = KEYS[k], b = KEYS[Math.min(k + 1, KEYS.length - 1)];
      const u = b === a ? 1 : ease(b.e || 'sine.inOut')(norm(t, a.t, b.t));
      CX = lerp(a.x, b.x, u); CY = lerp(a.y, b.y, u); Z = lerp(a.z, b.z, u);
      // punch toward the target on contact
      if (DC) {
        const bu = t < T_DC ? 0 : Math.min(1, (t - T_DC) / 0.07) * Math.exp(-Math.max(0, t - T_DC - 0.07) * 3.2);
        Z *= 1 + 0.05 * bu; CX += (DC.x - CX) * 0.08 * bu; CY += (DC.y - CY) * 0.08 * bu;
      }
      Object.assign(S.camState, { x: CX, y: CY, z: Z });
      S.cam.style.transform = `translate(${W / 2}px,${H / 2}px) scale(${Z.toFixed(5)}) translate(${(-CX).toFixed(2)}px,${(-CY).toFixed(2)}px)`;
    });
    const scr = (x, y) => [W / 2 + (x - CX) * Z, H / 2 + (y - CY) * Z];

    /* ======================= MAP (world space) ======================= */
    const map = S.svg(S.cam);
    const defs = S.defs(map);
    const LANDCLIP = S.uid('land'), BLUR = S.uid('blur');
    S.s('path', { d: MD.land }, S.s('clipPath', { id: LANDCLIP }, defs));
    S.s('feGaussianBlur', { stdDeviation: 4 }, S.s('filter', { id: BLUR, x: '-100%', y: '-100%', width: '300%', height: '300%' }, defs));

    // graticule: Mercator meridians are vertical, parallels horizontal
    let GR = P.graticule;
    if (!GR) {
      const a = PR.invert([-500, -400]), b = PR.invert([2420, 1480]), span = b[0] - a[0], step = span > 60 ? 10 : 5;
      GR = { lon: [Math.floor(a[0] / step) * step, Math.ceil(b[0] / step) * step], lat: [Math.floor(b[1] / step) * step, Math.min(80, Math.ceil(a[1] / step) * step)], step };
    }
    const grat = S.s('g', { stroke: GREEN, 'stroke-opacity': 0.16, fill: 'none' }, map);
    const gLines = [];
    for (let lon = GR.lon[0]; lon <= GR.lon[1]; lon += GR.step) { const x = PR([lon, 0])[0]; gLines.push(S.s('path', { d: `M${f2(x)},${f2(PR([0, GR.lat[1]])[1])}V${f2(PR([0, GR.lat[0]])[1])}` }, grat)); }
    for (let lat = GR.lat[0]; lat <= GR.lat[1]; lat += GR.step) { const y = PR([0, lat])[1]; gLines.push(S.s('path', { d: `M${f2(PR([GR.lon[0] - GR.step, 0])[0])},${f2(y)}H${f2(PR([GR.lon[1] + GR.step, 0])[0])}` }, grat)); }
    gLines.forEach((l, i) => S.draw(l, 0.22 + (i % 9) * 0.05, 0.9, { ease: 'power2.out', from: '50% 50%' }));

    // faint land fill + the red "in range" tints (ring interiors clipped to land), outermost ring first
    const landFill = S.s('path', { d: MD.land, fill: GREEN, opacity: 0 }, map);
    tl.to(landFill, { opacity: 0.05, duration: 0.8, ease: 'power1.out' }, 1.1);
    for (let j = NR - 1; j >= 0; j--) RINGS[j].tint = S.s('path', { d: 'M0,0', fill: RED, opacity: j ? 0.07 : 0.09, 'clip-path': `url(#${LANDCLIP})` }, map);
    const HL = ST.highlight && MD[ST.highlight] ? MD[ST.highlight] : null;
    const cuba = HL ? S.s('path', { d: HL, fill: AMBER, 'fill-opacity': 0, stroke: 'none' }, map) : null;

    // coastline: split into short chunks that trace outward from the site
    const coast = S.s('g', { fill: 'none', stroke: GREEN, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', style: `filter:drop-shadow(0 0 3px rgba(${G},.85)) drop-shadow(0 0 9px rgba(${G},.3));` }, map);
    const chunks = [];
    for (const sp of MD.land.split('M').filter(Boolean)) {
      const pts = sp.replace(/Z/g, '').split('L').map((p) => p.split(',').map(Number));
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const [x, y] of pts) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 < -260 || x0 > 2180 || y1 < -260 || y0 > 1340) continue;
      pts.push(pts[0]);
      for (let i = 0; i < pts.length - 1; i += 26) {
        const seg = pts.slice(i, Math.min(pts.length, i + 27));
        if (seg.length < 2) continue;
        let cx = 0, cy = 0; for (const p of seg) { cx += p[0]; cy += p[1]; } cx /= seg.length; cy /= seg.length;
        if (cx < -320 || cx > 2240 || cy < -320 || cy > 1400) continue;
        chunks.push({ d: 'M' + seg.map((p) => p[0] + ',' + p[1]).join('L'), dist: Math.hypot(cx - SX, cy - SY) });
      }
    }
    const maxD = Math.max(1, ...chunks.map((c) => c.dist));
    const DRAW0 = 0.12, DRAWS = 1.3, DRAWP = 0.85;   // draw front: dist = maxD * ((t - DRAW0) / DRAWS)^(1/DRAWP)
    for (const c of chunks) S.draw(S.s('path', { d: c.d }, coast), DRAW0 + DRAWS * Math.pow(c.dist / maxD, DRAWP), 0.34, { ease: 'power1.inOut' });
    const borders = S.s('g', { fill: 'none', stroke: GREEN, 'stroke-opacity': 0.5, 'stroke-linejoin': 'round' }, map);
    (MD.borders || '').split('M').filter(Boolean).forEach((sp, i) => S.draw(S.s('path', { d: 'M' + sp }, borders), 1.0 + (i % 7) * 0.08, 0.7, { ease: 'power2.inOut' }));
    const cubaLine = HL ? S.s('path', { d: HL, fill: 'none', stroke: AMBER, 'stroke-opacity': 0, 'stroke-linejoin': 'round' }, map) : null;

    /* ---------- rings ---------- */
    const ringG = S.s('g', { fill: 'none', 'stroke-linejoin': 'round' }, map);
    const mkRing = () => ({
      glow: S.s('path', { d: 'M0,0', stroke: GREEN, 'stroke-opacity': 0.35, filter: `url(#${BLUR})` }, ringG),
      line: S.s('path', { d: 'M0,0', stroke: GREEN }, ringG),
    });
    RINGS.forEach((g) => { g.el = mkRing(); });
    const setRing = (rg, nm, speed, on) => {
      if (!on) { rg.line.style.display = rg.glow.style.display = 'none'; return; }
      rg.line.style.display = rg.glow.style.display = '';
      const d = ringD(nm); rg.line.setAttribute('d', d); rg.glow.setAttribute('d', d);
      const hot = clamp(speed / 900);                 // wavefront glows hotter while it travels
      rg.line.setAttribute('stroke-width', f2((2.2 + 1.6 * hot) / Z)); rg.line.setAttribute('stroke', hot > 0.05 ? PALE : GREEN);
      rg.glow.setAttribute('stroke-width', f2((7 + 8 * hot) / Z)); rg.glow.setAttribute('stroke-opacity', f2(0.28 + 0.4 * hot));
    };
    S.onFrame((t) => {
      grat.setAttribute('stroke-width', f2(1.1 / Z));
      coast.setAttribute('stroke-width', f2(1.7 / Z));
      borders.setAttribute('stroke-width', f2(1.1 / Z));
      if (cubaLine) cubaLine.setAttribute('stroke-width', f2(2.4 / Z));
      RINGS.forEach((g, j) => {
        const on = t >= g.a, r = j ? rAt(g, t) : (on ? rAt(g, t) : 0), sp = (rAt(g, t + 0.02) - rAt(g, t - 0.02)) / 0.04;
        const vis = j ? on && r > g.prev + 0.5 : on && r > 1;
        setRing(g.el, r, t < g.b ? sp : 0, vis);
        g.tint.setAttribute('d', (j ? vis : r > 1) ? ringD(r) : 'M0,0');
      });
    });

    /* ======================= MARKS (counter-scaled, constant screen size) ======================= */
    const marks = S.svg(S.cam);
    const pinned = [];
    const anchor = (x, y) => { const o = { g: S.s('g', {}, marks), x, y, k: 1, upd: null }; pinned.push(o); return o; };
    const text = (g, s, x, y, anchorPos, css) => S.s('text', { x, y, 'text-anchor': anchorPos, text: s, style: css }, g);
    const dist = (c) => `${S.fmt(c.nm)} ${UNIT}`;

    // cities
    const cityObjs = CITIES.map((c) => {
      const a = anchor(c.x, c.y);
      const ping = S.s('circle', { r: 8, fill: 'none', stroke: RED, 'stroke-width': 3, opacity: 0 }, a.g);
      const halo = S.s('circle', { r: 16, fill: RED, opacity: 0, filter: `url(#${BLUR})` }, a.g);
      const dot = S.s('circle', { r: 5, fill: GREEN }, a.g);
      return { c, a, ping, halo, dot };
    });
    const tIn = 1.35;
    S.onFrame((t) => {
      const sweep = (t * 2 * Math.PI) / 2.3 - Math.PI / 2;
      for (const o of cityObjs) {
        const lit = t >= o.c.tHit, u = norm(t, o.c.tHit, o.c.tHit + 0.7);
        let dd = (sweep - o.c.ang) % (2 * Math.PI); if (dd < 0) dd += 2 * Math.PI;
        const blip = t > 1.6 ? Math.exp(-dd * 1.8) : 0;
        o.a.k = t < tIn ? 0 : ease('back.out(3)')(norm(t, tIn + o.c.i * 0.015, tIn + o.c.i * 0.015 + 0.35));
        if (lit) {
          o.dot.setAttribute('fill', RED); o.dot.setAttribute('opacity', 1); o.dot.setAttribute('r', f2(6.5 + 3 * (1 - ease('power2.out')(u)) + 1.2 * blip));
          o.halo.setAttribute('opacity', f2(0.4 + 0.35 * blip + 0.4 * (1 - u)));
          o.ping.setAttribute('r', f2(8 + 44 * ease('expo.out')(u))); o.ping.setAttribute('opacity', f2(u < 1 ? (1 - u) : 0));
        } else {
          o.dot.setAttribute('fill', GREEN); o.dot.setAttribute('r', f2(4.5 + 1.5 * blip)); o.dot.setAttribute('opacity', f2(0.55 + 0.45 * blip));
          o.halo.setAttribute('opacity', 0); o.ping.setAttribute('opacity', 0);
        }
      }
    });

    // story labels on the map: the first hit, the farthest hit, and up to three cities left outside
    const objOf = (c) => cityObjs.find((o) => o.c === c);
    const sideOf = (c) => (c.label === 'left' || c.label === 'right' ? c.label : c.x >= SX ? 'right' : 'left');
    const cityLabel = (c, lines, col, t0) => {
      const o = objOf(c), g = S.s('g', { opacity: 0 }, o.a.g), right = sideOf(c) === 'right';
      lines.forEach(([s, css], i) => text(g, s, right ? 16 : -16, 8 + i * 28, right ? 'start' : 'end', css + `fill:${col};`));
      tl.fromTo(g, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' }, t0);
      return g;
    };
    const L1 = `font:400 34px ${VT};letter-spacing:1px;paint-order:stroke;stroke:${BG};stroke-width:5px;`;
    const L2 = `font:700 22px ${MONO};paint-order:stroke;stroke:${BG};stroke-width:5px;`;
    const order = CITIES.filter((c) => isFinite(c.tHit)).sort((a, b) => a.tHit - b.tHit);
    // camera zoom at time t (no punch), to keep the first-hit label clear of the site label
    const zAt = (t) => { let k = 0; while (k < KEYS.length - 1 && t >= KEYS[k + 1].t) k++; const a = KEYS[k], b = KEYS[Math.min(k + 1, KEYS.length - 1)]; return lerp(a.z, b.z, b === a ? 1 : ease(b.e || 'sine.inOut')(norm(t, a.t, b.t))); };
    const FIRST = order.find((c) => c !== DC && Math.hypot(c.x - SX, c.y - SY) * zAt(c.tHit) > 110) || null;
    const FAR = order.slice().reverse().find((c) => c !== DC && c !== FIRST) || null;
    const OUT = CITIES.filter((c) => !isFinite(c.tHit)).slice(0, 3);
    if (FIRST) {
      const lab = cityLabel(FIRST, [[FIRST.name.toUpperCase(), L1], [dist(FIRST), L2]], RED, FIRST.tHit);
      if (NR > 1) tl.to(lab, { opacity: 0, duration: 0.4, ease: 'power2.in' }, T(RINGS[1].a + 0.05));
    }
    if (FAR) cityLabel(FAR, [[FAR.name.toUpperCase(), L1], [dist(FAR), L2]], RED, FAR.tHit);
    const T_OUT = T(TLb - 0.15);
    OUT.forEach((c, i) => cityLabel(c, [[c.name.toUpperCase(), L1], [`${dist(c)} · ${P.outOfRange}`, L2]], GREEN, T(T_OUT + i * 0.1)));

    // target callout: lands hard; if the camera is about to pull wide, hand off to a compact tag
    if (DC) {
      const dcO = objOf(DC), R = sideOf(DC) === 'right', sg = R ? 1 : -1, anc = R ? 'start' : 'end';
      const dcG = S.s('g', {}, dcO.a.g);
      const dcBox = S.s('g', { transform: `translate(${22 * sg},-18)` }, dcG);
      const dcLead = S.s('path', { d: `M${8 * sg},-8L${46 * sg},-46L${70 * sg},-46`, fill: 'none', stroke: RED, 'stroke-width': 2.5 }, dcG);
      const dcT1 = text(dcBox, DC.callout || DC.name.toUpperCase(), 56 * sg, -52, anc, `font:400 46px ${VT};fill:${RED};letter-spacing:1px;paint-order:stroke;stroke:${BG};stroke-width:6px;`);
      const dcT2 = text(dcBox, `${dist(DC)} · ${P.inRange}`, 56 * sg, -24, anc, `font:700 22px ${MONO};fill:${PALE};paint-order:stroke;stroke:${BG};stroke-width:5px;`);
      tl.fromTo(dcLead, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.18, ease: 'power2.out' }, T_DC);
      tl.fromTo([dcT1, dcT2], { opacity: 0 }, { opacity: 1, duration: 0.06, stagger: 0.08 }, T_DC + 0.05);
      if (T_DC < 4.6) {
        tl.to(dcG, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 4.6);
        const dcTag = S.s('g', { opacity: 0 }, dcO.a.g);
        text(dcTag, DC.name.toUpperCase(), 18 * sg, 4, anc, `font:400 38px ${VT};fill:${RED};letter-spacing:1px;paint-order:stroke;stroke:${BG};stroke-width:6px;`);
        text(dcTag, dist(DC), 18 * sg, 28, anc, `font:700 22px ${MONO};fill:${PALE};paint-order:stroke;stroke:${BG};stroke-width:5px;`);
        tl.fromTo(dcTag, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 4.85);
      }
      const dcRing = S.s('circle', { r: 20, fill: 'none', stroke: RED, 'stroke-width': 4, opacity: 0 }, dcO.a.g);
      S.onFrame((t) => { const u = norm(t, T_DC, T_DC + 0.9); dcRing.setAttribute('r', f2(14 + 150 * ease('expo.out')(u))); dcRing.setAttribute('opacity', f2(u > 0 && u < 1 ? Math.pow(1 - u, 1.4) : 0)); dcRing.setAttribute('stroke-width', f2(6 - 5 * u)); });
    }

    // ring labels, set once each ring locks
    const ringTag = (bearing, nm, label, t0) => {
      const [x, y] = PR(Reel.geoDest(SITE, bearing, toDeg(nm)));
      const a = anchor(x, y), g = S.s('g', {}, a.g);
      const box = S.s('rect', { x: -116, y: -20, width: 232, height: 40, fill: BG, stroke: AMBER, 'stroke-width': 2, opacity: 0.94 }, g);
      const tx = text(g, label, 0, 8, 'middle', `font:700 22px ${MONO};fill:${AMBER};letter-spacing:1px;`);
      const w = tx.getComputedTextLength() + 18;
      if (w > 232) { box.setAttribute('x', f2(-w / 2)); box.setAttribute('width', f2(w)); }
      a.upd = (t) => { a.k = t < t0 ? 0 : ease('back.out(2.5)')(norm(t, t0, t0 + 0.35)); };
      return a;
    };
    RINGS.forEach((g) => ringTag(P.ringLabelBearing ?? 290, g.R, `${g.label ? g.label + ' · ' : ''}${S.fmt(g.R)} ${UNIT}`, g.b - 0.05));
    // the cities the last ring stops short of get a steady green "clear" ring
    OUT.forEach((c, i) => {
      const o = objOf(c), r = S.s('circle', { r: 13, fill: 'none', stroke: GREEN, 'stroke-width': 2.5, opacity: 0 }, o.a.g);
      tl.fromTo(r, { opacity: 0, attr: { r: 34 } }, { opacity: 0.9, attr: { r: 13 }, duration: 0.4, ease: 'expo.out' }, T_OUT + i * 0.1);
    });

    // site marker + reticle + label
    const site = anchor(SX, SY);
    const siteDot = S.s('path', { d: 'M0,-9L9,0L0,9L-9,0Z', fill: AMBER, opacity: 0 }, site.g);
    const ret = S.s('g', { opacity: 0 }, site.g);
    const retInner = S.s('g', {}, ret);
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => S.s('path', { d: `M${sx * 62},${sy * 38}V${sy * 62}H${sx * 38}`, fill: 'none', stroke: GREEN, 'stroke-width': 3.5 }, retInner));
    S.s('circle', { r: 44, fill: 'none', stroke: GREEN, 'stroke-width': 1.6, 'stroke-dasharray': '5 7' }, retInner);
    S.s('path', { d: 'M-96,0H-20M20,0H96M0,-96V-20M0,20V96', stroke: GREEN, 'stroke-width': 1.6 }, retInner);
    const siteLab = S.s('g', { opacity: 0 }, site.g);
    const sl1 = text(siteLab, '', 78, -10, 'start', `font:400 44px ${VT};fill:${AMBER};letter-spacing:1px;paint-order:stroke;stroke:${BG};stroke-width:6px;`);
    const sl2 = text(siteLab, '', 80, 20, 'start', `font:700 22px ${MONO};fill:${PALE};paint-order:stroke;stroke:${BG};stroke-width:5px;`);
    const T_RET = 1.6, T_LOCK = 2.08;
    tl.fromTo(ret, { opacity: 0 }, { opacity: 1, duration: 0.12 }, T_RET);
    tl.to(ret, { opacity: 0.85, duration: 0.2 }, T_LOCK + 0.2);
    const retPaths = [...retInner.querySelectorAll('path')];
    let retCol = '';
    S.onFrame((t) => {
      const u = ease('expo.out')(norm(t, T_RET, T_RET + 0.48));
      const s = lerp(3.4, 1, u) * lerp(1, 0.52, ease('power3.inOut')(norm(t, T_LOCK + 0.2, T_LOCK + 0.55)));
      retInner.setAttribute('transform', `rotate(${f2(lerp(45, 0, u))}) scale(${s.toFixed(4)})`);
      const col = t >= T_LOCK ? AMBER : GREEN;
      if (col !== retCol) { retPaths.forEach((p) => p.setAttribute('stroke', col)); retCol = col; }
    });
    tl.fromTo(siteDot, { opacity: 0 }, { opacity: 1, duration: 0.1 }, T_LOCK);
    tl.fromTo(siteLab, { opacity: 0 }, { opacity: 1, duration: 0.05 }, T_LOCK + 0.04);
    if (cuba) {
      tl.fromTo(cuba, { fillOpacity: 0 }, { fillOpacity: 0.45, duration: 0.06 }, T_LOCK);
      tl.to(cuba, { fillOpacity: 0.12, duration: 0.7, ease: 'power2.out' }, T_LOCK + 0.1);
      tl.fromTo(cubaLine, { strokeOpacity: 0 }, { strokeOpacity: 1, duration: 0.06 }, T_LOCK);
    }
    S.type(sl1, String(ST.name ?? ''), { t: T_LOCK + 0.06, cps: 34, gain: 0.14 });
    S.type(sl2, fill(ST.sub ?? '{coords}', { coords }), { t: T_LOCK + 0.28, cps: 60, gain: 0.08 });
    S.onFrame((t) => {
      site.k = 1;
      const s = 1 + 0.25 * Math.max(0, Math.sin((t - T_LOCK) * 7)) * (t > T_LOCK ? 1 : 0);
      siteDot.setAttribute('transform', `scale(${f2(s)})`);
    });

    S.onFrame((t) => {
      for (const o of pinned) {
        if (o.upd) o.upd(t);
        if (o.k <= 0.001) { o.g.style.display = 'none'; continue; }
        o.g.style.display = '';
        o.g.setAttribute('transform', `translate(${f2(o.x)},${f2(o.y)}) scale(${(o.k / Z).toFixed(4)})`);
      }
    });

    /* ======================= HUD (screen space) ======================= */
    // radar sweep centred on the site (canvas, screen space; angles are invariant to pan/zoom)
    const sw = S.canvas(S.hud);
    const SWEEP_T = 2.3, PU = rgb(CRT.pulse), SWL = rgb(CRT.sweep);
    S.onFrame((t) => {
      sw.clearRect(0, 0, W, H);
      const [cx, cy] = scr(SX, SY);
      // reveal pulse: rides the coastline draw-on front outward from the site
      const pu = (t - DRAW0) / DRAWS;
      if (pu > 0 && pu < 1.15) {
        const rr = maxD * Math.pow(Math.min(pu, 1.15), 1 / DRAWP) * Z + 10, a = 0.55 * Math.pow(1 - clamp(pu / 1.15), 1.2);
        const rg = sw.createRadialGradient(cx, cy, Math.max(0, rr - 90), cx, cy, rr + 6);
        rg.addColorStop(0, `rgba(${G},0)`); rg.addColorStop(0.85, `rgba(${G},${(a * 0.18).toFixed(3)})`); rg.addColorStop(1, `rgba(${G},0)`);
        sw.fillStyle = rg; sw.beginPath(); sw.arc(cx, cy, rr + 6, 0, Math.PI * 2); sw.fill();
        sw.strokeStyle = `rgba(${PU},${a.toFixed(3)})`; sw.lineWidth = 2.5; sw.beginPath(); sw.arc(cx, cy, rr, 0, Math.PI * 2); sw.stroke();
      }
      const on = clamp(norm(t, 0.9, 1.7));
      if (on <= 0) return;
      const ang = (t * 2 * Math.PI) / SWEEP_T - Math.PI / 2, span = 1.05;
      const g = sw.createConicGradient(ang - span, cx, cy), e = span / (2 * Math.PI);
      g.addColorStop(0, `rgba(${G},0)`); g.addColorStop(e * 0.6, `rgba(${G},${0.02 * on})`); g.addColorStop(e * 0.995, `rgba(${G},${0.11 * on})`); g.addColorStop(e, `rgba(${G},0)`); g.addColorStop(1, `rgba(${G},0)`);
      sw.fillStyle = g; sw.fillRect(0, 0, W, H);
      sw.strokeStyle = `rgba(${SWL},${0.42 * on})`; sw.lineWidth = 2;
      sw.beginPath(); sw.moveTo(cx, cy); sw.lineTo(cx + Math.cos(ang) * 2600, cy + Math.sin(ang) * 2600); sw.stroke();
    });

    // header (on a dark band so map strokes never cut through the type)
    const SH = rgb(C.shade), HD = P.header || {};
    const hBand = S.el('div', { style: `position:absolute;left:40px;top:74px;width:1000px;height:128px;background:linear-gradient(90deg, rgba(${SH},.86) 0%, rgba(${SH},.74) 62%, rgba(${SH},0) 100%);` }, S.hud);
    tl.fromTo(hBand, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.3);
    const head = S.el('div', { style: 'position:absolute;left:96px;top:90px;' }, S.hud);
    const hk = S.el('div', { style: `font:700 22px/1 ${MONO};letter-spacing:.22em;color:${DIMG};display:flex;align-items:center;gap:12px;` }, head);
    const rec = S.el('div', { style: `width:12px;height:12px;border-radius:50%;background:${RED};box-shadow:0 0 10px ${RED};` }, hk);
    S.el('span', { text: HD.label ?? '' }, hk);
    const h1 = S.el('div', { style: `margin-top:8px;font:400 64px/1 ${VT};color:${GREEN};letter-spacing:.02em;white-space:nowrap;text-shadow:0 0 8px rgba(${G},.75),0 0 24px rgba(${G},.3);` }, head);
    const HTXT = String(HD.text ?? '');
    h1.textContent = HTXT; if (h1.scrollWidth > 1000) h1.style.fontSize = (64 * 1000) / h1.scrollWidth + 'px'; h1.textContent = '';
    tl.fromTo(hk, { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.36);
    S.type(h1, HTXT, { t: 0.46, cps: 30, caret: true, gain: 0.16 });
    S.onFrame((t) => { rec.style.opacity = t < 0.36 ? 0 : Math.floor(t * 2.4) % 2 ? 0.25 : 1; });

    // readout panel (right)
    const RO = P.readout || {};
    const pnl = S.el('div', { style: `position:absolute;left:1478px;top:292px;width:346px;box-sizing:border-box;padding:18px 20px 20px 22px;background:rgba(${rgb(C.panel)},.8);border:1px solid rgba(${G},.2);` }, S.hud);
    const corner = (css) => S.el('div', { style: `position:absolute;width:18px;height:18px;border-color:${GREEN};border-style:solid;opacity:.8;${css}` }, pnl);
    corner('left:-6px;top:-6px;border-width:2px 0 0 2px;'); corner('right:-6px;top:-6px;border-width:2px 2px 0 0;');
    corner('left:-6px;bottom:-6px;border-width:0 0 2px 2px;'); corner('right:-6px;bottom:-6px;border-width:0 2px 2px 0;');
    S.el('div', { text: RO.range ?? '', style: `font:700 22px/1 ${MONO};letter-spacing:.22em;color:${DIMG};white-space:nowrap;` }, pnl);
    const rng = S.el('div', { text: `0 ${UNIT}`, style: `margin-top:6px;font:400 84px/0.9 ${VT};color:${GREEN};white-space:nowrap;text-shadow:0 0 8px rgba(${G},.7),0 0 22px rgba(${G},.3);` }, pnl);
    const wpn = S.el('div', { text: RINGS[0].readout, style: `margin-top:8px;font:700 22px/1 ${MONO};letter-spacing:.12em;color:${AMBER};white-space:nowrap;` }, pnl);
    S.el('div', { style: `margin:22px 0 18px;height:2px;background:linear-gradient(90deg, rgba(${G},.6), rgba(${G},0));` }, pnl);
    const cntL = S.el('div', { text: RO.count ?? '', style: `font:400 44px/1 ${VT};color:${PALE};letter-spacing:.02em;white-space:nowrap;` }, pnl);
    const cnt = S.el('div', { text: '0', style: `margin-top:-6px;font:400 170px/0.9 ${VT};color:${RED};text-shadow:0 0 12px rgba(${rgb(RED)},.8),0 0 36px rgba(${rgb(RED)},.35);transform-origin:0 60%;` }, pnl);
    const last = S.el('div', { text: '', style: `margin-top:6px;font:700 22px/1 ${MONO};color:${PALE};white-space:nowrap;` }, pnl);
    // auto-fit: size each changing line once, for its longest value
    const fitOnce = (el, texts, maxW) => { let w = 0; for (const s of texts) { el.textContent = s; w = Math.max(w, el.scrollWidth); } if (w > maxW) el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * maxW) / w + 'px'; };
    const lastLine = (c) => `+ ${c.name.toUpperCase()}  ${dist(c)}`;
    fitOnce(rng, RINGS.map((g) => `${S.fmt(g.R)} ${UNIT}`), 330); rng.textContent = `0 ${UNIT}`;
    fitOnce(wpn, RINGS.map((g) => g.readout), 330); wpn.textContent = RINGS[0].readout;
    fitOnce(cntL, [RO.count ?? ''], 330);
    fitOnce(last, order.map(lastLine), 330); last.textContent = '';
    tl.fromTo(pnl, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.5, ease: 'expo.out' }, T1a - 0.1);
    let lastR = '', lastN = -1, lastL = '';
    S.onFrame((t) => {
      const r = Math.round(reach(t)), rs = `${S.fmt(r)} ${UNIT}`;
      if (rs !== lastR) { rng.textContent = rs; lastR = rs; }
      let ws = RINGS[0].readout; for (const g of RINGS) if (t >= g.a) ws = g.readout;
      if (wpn.textContent !== ws) wpn.textContent = ws;
      let n = 0, lc = null; for (const c of order) if (t >= c.tHit) { n++; lc = c; }
      if (n !== lastN) { cnt.textContent = String(n); lastN = n; }
      const ls = lc ? lastLine(lc) : '';
      if (ls !== lastL) { last.textContent = ls; lastL = ls; }
      const kick = lc ? Math.exp(-(t - lc.tHit) * 9) : 0;
      cnt.style.transform = `scale(${f2(1 + 0.12 * kick)})`;
    });

    // alert badge (top right)
    const T_DEF = 6.2, AL = P.alert;
    if (AL) {
      const def = S.el('div', { style: `position:absolute;right:96px;top:92px;padding:12px 26px 14px;border:3px solid ${AMBER};background:rgba(${rgb(C.alertBg)},.55);box-shadow:0 0 22px rgba(${A},.45), inset 0 0 22px rgba(${A},.2);text-align:right;` }, S.hud);
      const defT = S.el('div', { text: AL.text ?? '', style: `font:400 104px/0.9 ${VT};color:${AMBER};letter-spacing:.03em;white-space:nowrap;text-shadow:0 0 10px rgba(${A},.85),0 0 30px rgba(${A},.4);` }, def);
      const defS = S.el('div', { text: AL.sub ?? '', style: `margin-top:6px;font:700 22px/1 ${MONO};letter-spacing:.14em;color:${C.alertSub};white-space:nowrap;` }, def);
      [defT, defS].forEach((el) => { if (el.scrollWidth > 760) el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * 760) / el.scrollWidth + 'px'; });
      tl.fromTo(def, { opacity: 0, scale: 1.25 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'expo.out' }, T_DEF);
      S.onFrame((t) => { const u = t - T_DEF; def.style.visibility = u < 0 ? 'hidden' : u < 0.72 && Math.floor(u / 0.12) % 2 === 1 ? 'hidden' : 'visible'; });
      S.shake(T_DEF, { amp: 9, dur: 0.5, freq: 22 });
      [0, 0.24, 0.48].forEach((d) => S.sfx(T_DEF + d, 'buzzer', { dur: 0.12, gain: 0.26 }));
      S.sfx(T_DEF, 'impact', { gain: 0.55 });
      S.beat(T_DEF, 'The alarm sounds only once the last ring has locked');
    }

    // closing line (bottom left)
    const CL = P.closing || {};
    const fBand = S.el('div', { style: `position:absolute;left:0;top:820px;width:1100px;height:260px;background:radial-gradient(ellipse 75% 85% at 0% 100%, rgba(${SH},.82), rgba(${SH},.5) 55%, rgba(${SH},0) 100%);opacity:0;` }, S.hud);
    tl.fromTo(fBand, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 6.55);
    const fin = S.el('div', { style: 'position:absolute;left:96px;top:882px;white-space:nowrap;' }, S.hud);
    const fa = S.el('span', { style: `font:400 72px/1 ${VT};color:${C.closing};text-shadow:0 0 8px rgba(${G},.9),0 0 26px rgba(${G},.4);` }, fin);
    const fb = S.el('span', { style: `font:400 72px/1 ${VT};color:${C.closingAccent};text-shadow:0 0 8px rgba(${A},.95),0 0 26px rgba(${A},.45);` }, fin);
    const fsub = S.el('div', { text: CL.sub ?? '', style: `position:absolute;left:98px;top:962px;font:700 22px/1 ${MONO};letter-spacing:.18em;color:rgba(${rgb(C.closingSub)},.85);opacity:0;white-space:nowrap;` }, S.hud);
    const CA = String(CL.text ?? ''), CB = String(CL.accent ?? '');
    fa.textContent = CA; fb.textContent = CB;
    if (fin.scrollWidth > 1180) { const fs = (72 * 1180) / fin.scrollWidth + 'px'; fa.style.fontSize = fb.style.fontSize = fs; }
    fa.textContent = fb.textContent = '';
    if (fsub.scrollWidth > 1200) fsub.style.fontSize = (22 * 1200) / fsub.scrollWidth + 'px';
    // long lines type faster so the whole line lands before the end (the showcase keeps 30 and 20 cps)
    const tA = S.type(fa, CA, { t: 6.72, cps: Math.max(30, CA.length / 0.8), gain: 0.24 });
    const tB = S.type(fb, CB, { t: tA + 0.04, cps: Math.max(20, CB.length / 0.45), caret: true, gain: 0.3 });
    tl.fromTo(fsub, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' }, Math.min(tB + 0.08, 8.05));
    S.sfx(tB, 'bass', { gain: 0.3, freq: P.droneHz });
    const NUMW = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    const nWords = (CA + CB).trim().split(/\s+/).filter(Boolean).length;
    S.beat(6.72, `Closing line types out the stakes in ${NUMW[nWords] || nWords} words`);

    /* ======================= CRT FINISH (fx) ======================= */
    const fx = S.fx;
    const add = (css) => { const d = document.createElement('div'); d.style.cssText = 'position:absolute;left:0;top:0;width:1920px;height:1080px;pointer-events:none;' + css; fx.appendChild(d); return d; };
    add(`background:radial-gradient(ellipse 70% 60% at 55% 50%, rgba(${G},.06), rgba(0,0,0,0) 70%);mix-blend-mode:screen;`);
    add('background:repeating-linear-gradient(180deg, rgba(0,0,0,.34) 0px, rgba(0,0,0,.34) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 3px);');
    const BD = rgb(CRT.band);
    const band = add(`height:260px;background:linear-gradient(180deg, rgba(${BD},0), rgba(${BD},.045) 50%, rgba(${BD},0));`);
    const flick = add('background:#000;opacity:0;');
    S.vignette({ strength: 0.6, inner: 48, size: '78% 80%' });
    add(`left:10px;top:10px;width:1900px;height:1060px;border-radius:56px;box-shadow:0 0 0 80px #000, inset 0 0 110px 26px rgba(0,0,0,.9), inset 0 0 3px 2px rgba(${G},.12);`);
    add(`background:radial-gradient(ellipse 45% 30% at 26% 14%, rgba(${rgb(CRT.glare)},.07), rgba(0,0,0,0) 70%);`);
    S.grain({ opacity: 0.08 });
    S.onFrame((t) => {
      band.style.transform = `translateY(${f2(((t * 420) % 1500) - 260)}px)`;
      let f = 0.035 + 0.03 * S.noise(t * 38, 7);
      f += 0.25 * Math.exp(-Math.max(0, t - T_DC) * 14) * (t >= T_DC ? 1 : 0) * (0.5 + 0.5 * S.noise(t * 90, 3));
      if (AL) f += 0.2 * Math.exp(-Math.max(0, t - T_DEF) * 10) * (t >= T_DEF ? 1 : 0);
      flick.style.opacity = f2(clamp(f));
    });
    // screen tears on the target's hit (and the alarm)
    const TR = rgb(CRT.tear);
    const tears = [0, 1, 2, 3, 4].map((i) => add(`height:${2 + (i % 3) * 2}px;background:linear-gradient(90deg, rgba(${TR},0), rgba(${TR},.55) 20%, rgba(${TR},.55) 80%, rgba(${TR},0));mix-blend-mode:screen;display:none;`));
    const TEAR = [DC ? [T_DC, 0.16] : null, AL ? [T_DEF, 0.1] : null].filter(Boolean);
    S.onFrame((t) => {
      tears.forEach((d, i) => {
        let on = false, f = 0;
        for (const [t0, len] of TEAR) { const u = t - t0; if (u >= 0 && u < len) { on = true; f = Math.floor(u * 60) + Math.round(t0 * 100); } }
        const vis = on && S.ihash(f * 7 + i) > 0.3;
        d.style.display = vis ? '' : 'none';
        if (vis) d.style.transform = `translate(${f2((S.ihash(f * 3 + i) - 0.5) * 240)}px,${f2(120 + S.ihash(f * 13 + i * 5) * 840)}px)`;
      });
    });

    // power-on: line, shutters, flash
    const shTop = add('height:540px;background:#000;transform-origin:50% 0;');
    const shBot = add('top:540px;height:540px;background:#000;transform-origin:50% 100%;');
    const pline = add(`top:538px;height:4px;background:${CRT.powerLine};box-shadow:0 0 18px 6px rgba(${G},.9);transform-origin:50% 50%;`);
    const pflash = add(`background:${CRT.powerFlash};opacity:0;`);
    tl.fromTo(pline, { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 0.11, ease: 'expo.out' }, 0.02);
    tl.fromTo([shTop, shBot], { scaleY: 1 }, { scaleY: 0, duration: 0.22, ease: 'expo.out' }, 0.11);
    tl.to(pline, { opacity: 0, scaleY: 8, duration: 0.14, ease: 'power2.out' }, 0.12);
    tl.fromTo(pflash, { opacity: 0 }, { opacity: 0.42, duration: 0.04 }, 0.12);
    tl.to(pflash, { opacity: 0, duration: 0.24, ease: 'power2.out' }, 0.16);
    S.sfx(0.02, 'crt', { gain: 0.55 });
    S.beat(0.05, 'CRT power-on gives a strong first frame and sets the era');

    /* ======================= SOUND ======================= */
    S.sfx(0.1, 'drone', { dur: 8.4, freq: P.droneHz, cutoff: 220, gain: 0.06, air: 0.12 });
    S.sfx(0.32, 'whoosh', { dur: 1.3, from: 150, to: 1100, gain: 0.12 });
    S.sfx(T_RET, 'swoosh', { gain: 0.28, pitch: 0.8 });
    [1.72, 1.84, 1.96].forEach((t, i) => S.sfx(t, 'tone', { freq: 1400 + i * 120, dur: 0.05, gain: 0.07 }));
    S.sfx(T_LOCK, 'ping', { gain: 0.28, freq: 1250 });
    S.beat(T_RET, 'Reticle narrows a continent down to one site');
    S.sfx(T1a, 'whoosh', { dur: 1.5, from: 120, to: 900, gain: 0.26 });
    S.sfx(T1a, 'riser', { dur: (DC ? T_DC : T1b) - T1a, gain: 0.12 });
    S.beat(T1a, 'Rings are true geodesic circles; each city flips on contact');
    let prevHit = -1;
    order.forEach((c, i) => {
      if (c === DC) return;
      if (c.tHit - prevHit < 0.03) return;
      prevHit = c.tHit;
      S.sfx(c.tHit, 'blip', { gain: 0.26, pitch: Math.min(2, 0.85 + i * 0.06) });
    });
    if (DC) {
      S.sfx(T_DC, 'impact', { gain: 0.62 });
      S.sfx(T_DC, 'bass', { gain: 0.32, freq: 41 });
      S.sfx(T_DC, 'glitch', { dur: 0.18, gain: 0.22 });
      S.shake(T_DC, { amp: 11, dur: 0.55, freq: 24 });
      const ri = RINGS.findIndex((g) => T_DC <= g.b + 1e-9), inRing = order.filter((c) => c.tHit <= RINGS[Math.max(0, ri)].b + 1e-9);
      const lastIn = inRing.length && inRing[inRing.length - 1] === DC;
      const cap = DC.name.replace(/\b\w/g, (m) => m.toUpperCase());
      S.beat(T_DC, lastIn ? `${cap} sits on the edge of ring ${NUMW[ri + 1] || ri + 1}, so it lands last` : `${cap} lands with a camera punch and a screen tear`);
    }
    RINGS.forEach((g, j) => {
      if (j < NR - 1) S.sfx(g.b, 'click', { gain: 0.3 });
      if (j + 1 < NR) S.sfx(RINGS[j + 1].a, 'whoosh', { dur: 1.7, from: 140, to: 1000, gain: 0.26 });
    });
    S.sfx(TLb, 'thud', { gain: 0.3 });
    S.sfx(TLb + 0.05, 'blip', { gain: 0.16, pitch: 0.6 });
    S.beats.sort((a, b) => a.t - b.t);                              // retention notes in time order
  },
});
