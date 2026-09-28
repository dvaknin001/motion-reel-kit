/* Science & Space — Scale of Giants
   A ladder of spheres at true relative scale (default: Moon, Earth, Jupiter, the Sun, Betelgeuse), redrawn on one
   canvas every frame. A single log-zoom camera pivots on the gap between neighbours: smaller bodies shrink into the
   point the eye is already on while the next giant grows into frame. Sizes are to scale; spacing is not.
   The params carry the 3–6 bodies (names, sizes, surface looks, label chips), the readout units, the payoff callout
   and the closing line. Every scale number on screen (ratios, km per pixel, the payoff body's size in pixels, which
   orbits fit inside the giant) is computed from the sizes. */
Reel.style({
  id: 'science-scale-zoom', seed: 'space', order: 7,
  name: 'True-Scale Zoom',
  transIn: { type: 'iris', dur: 0.6 },   // how a reel cuts INTO this piece (tools/new-reel.mjs); a reel item's trans overrides it
  niches: {
    primary: ['Space & astronomy', 'Science explainers', 'Science education'],
    similar: ['Stars & stellar astronomy', 'Planetary science', 'Moons & dwarf planets', 'Exoplanets', 'Kids science & STEM', 'Sci-fi worldbuilding'],
  },
  niche: 'Science & Space', title: 'Scale of Giants', duration: 9, poster: 8.5,
  bg: '#0B1026', palette: ['#FF6B3D', '#FFD36B', '#1C1442'],
  techniques: ['True-scale log-zoom camera', 'Zooms pivot on the gap between bodies', 'Live km-per-pixel readout'],
  why: 'Every zoom ends with the next giant already edging into frame, so the question renews itself until the payoff shrinks the Sun to a single pixel.',
  facts: 'Mean diameters from NASA planetary fact sheets: Moon 3,474 km, Earth 12,742 km, Jupiter 139,820 km, Sun 1,392,700 km. Betelgeuse radius ~764 solar radii (Joyce et al. 2020; estimates span ~640-1,020), so ~1.06 billion km across and ~3.5 AU in radius, past Mars at 1.52 AU. Coastlines: Natural Earth 1:110m. Sizes to scale; spacing is not.',
  defaults: {
    eyebrow: 'EVERYTHING TO SCALE',
    headline: 'How big can a star get?',
    // 3–6 bodies, smallest first: [0] sits beside [1] in the opening frame, the middle ones are framed in turn and
    // the last is the giant the final zoom reveals. Size = km (diameter) or rSun (radius in solar radii).
    bodies: [
      { id: 'moon', name: 'MOON', km: 3474, look: 'moon', chip: '{ratio} Earth', vs: 'earth', color: '#C9CCDA' },
      { id: 'earth', name: 'EARTH', km: 12742, look: 'earth', chip: 'you are here', color: '#7FD4FF' },
      { id: 'jupiter', name: 'JUPITER', km: 139820, look: 'jupiter', chip: '{ratio} Earth', vs: 'earth', color: '#E9B886' },
      { id: 'sun', name: 'SUN', km: 1392700, look: 'sun', chip: '{ratio} Earth', vs: 'earth', color: '#FFD36B' },
      { id: 'betelgeuse', name: 'BETELGEUSE', rSun: 764, approx: true, look: 'redSupergiant', chip: '{ratio} the Sun', vs: 'sun', color: '#FF6B3D' },
    ],
    callout: { body: 'sun', label: 'the Sun', one: '1 pixel', many: '{n} pixels', part: '{n} pixel' },
    footnote: { body: 'earth', label: 'Earth:', text: 'too small to draw' },
    orbits: [
      { name: 'Earth', label: 'EARTH ORBIT', au: 1, color: null },
      { name: 'Mars', label: 'MARS ORBIT', au: 1.524, color: '#FFD36B' },
    ],
    closing: 'Swap it for the Sun and\nit would reach *past {orbit}.*',
    readout: { label: 'SCALE', prefix: '1 px = ' },
    units: { name: 'km', perKm: 1, million: 'million', billion: 'billion', sunKm: 1392700 },
    // surface presets. Types: rocky, earth, gas, star, giant. A new preset can start from another with
    // `like` and recolour it with `tint`; bodies may also carry their own `tint`.
    looks: {
      moon: { type: 'rocky', surface: ['#E0E2EA', '#A9ACBC'], maria: '#7E8298', crater: ['#E6E8EF', '#8F93A8', '#B7BACA'], light: '#FFFFFF', shade: '#0C0C2C', dot: '#B9BCCA' },
      earth: { type: 'earth', ocean: ['#49A2F0', '#2E7AD8', '#1D55B0'], land: ['#7AD98F', '#3E9C60'], desert: '#E2CB84', forest: '#2E8C54', ice: ['#EEF6FF', '#F0F8FF'], cloud: '#FFFFFF', haze: '#96D7FF', glow: '#6EC4FF', light: '#C8EEFF', shade: '#080A2E', dot: '#4A9AEE' },
      jupiter: {
        type: 'gas', fill: '#BCA88F',
        bands: ['#D6C4A6', '#E8DAC0', '#C79B70', '#F2E6CF', '#B97049', '#EFD7B1', '#E6C095', '#BD7A50', '#F3E5CC', '#CFA47C', '#E7D7BD', '#C8B195', '#B09C86'],
        spot: ['#F6EAD6', '#CF5C3C', '#E3855B'], ovals: '#F9F1E4', limb: '#46261C', light: '#FFF0D7', shade: '#0E0A2C', dot: '#D9B48C',
      },
      sun: {
        type: 'star', disk: ['#FFF8D8', '#FFE27E', '#FFB94A', '#FF9A3C'], glow: '#FF9646', halo: '#FFCE6E', glowSize: 1,
        prominence: '#FFA854', granules: '#FFFAD6', spots: ['#E88A34', '#B9561F'], rim: '#FFECAA', flare: ['#FFD68C', '#FFF4D2', '#FFBE6E', '#FFC878'], pixel: '#FFF6CF',
      },
      redSupergiant: { type: 'giant', disk: ['#FFB86A', '#FF8246', '#EE5634', '#BC332A'], glow: '#FF4E40', halo: '#FF683C', cells: ['#961A18', '#FFCE84'], limb: '#6E0E1A', bloom: ['#FF9664', '#FF785A'], plate: '#3A080E' },
    },
    padNotes: [110, 164.8, 220, 277.2, 329.6],
    droneHz: 55,
    background: 'linear-gradient(165deg, #0B1026 0%, #10143A 48%, #1C1442 100%)',
    colors: {
      ink: '#F4F1FF', muted: '#A9A4D8', dim: '#716DA6', accent: '#FFD36B', shadow: '#040516', marker: '#FFF8DC',
      stars: ['#ECE9FF', '#ECE9FF', '#ECE9FF', '#DCE6FF', '#B9CFFF', '#FFE2BD'], glint: '#F2F0FF', dust: '#D6DAFF',
      nebula: ['#6246BE', '#2860B4', '#AA4696', '#3C3296'],
    },
  },
  build(S, P) {
    const tl = S.tl, W = 1920, H = 1080, TAU = Math.PI * 2, DEG = Math.PI / 180;
    const { clamp, lerp } = S;
    const sm = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
    const C = P.colors, U = P.units || {}, LOOKS = P.looks || {};
    const INK = C.ink, MUTED = C.muted, DIM = C.dim, GOLD = C.accent;
    const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
    const rgbS = (hex) => { const n = parseInt(String(hex).slice(1), 16); return `${n >> 16},${(n >> 8) & 255},${n & 255}`; };
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const fill = (s, vars) => String(s).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
    const fitWidth = (el, maxW) => { const w = el.scrollWidth; if (w > maxW) el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * maxW) / w + 'px'; };
    const SHD = rgbS(C.shadow);
    if (!S.alpha) S.root.style.background = P.background;

    /* ======================= world: km, every centre on one line ======================= */
    let list = (P.bodies || []).filter((b) => b && (+b.km > 0 || +b.rSun > 0));
    if (list.length > 6) list = list.slice(0, 5).concat(list[list.length - 1]);    // supported: 3–6 bodies (the giant is kept)
    if (list.length < 3) { console.warn('[science-scale-zoom] needs 3–6 bodies with a size; rendering the default list'); list = S.def.defaults.bodies; }
    const NB = list.length, M = NB - 3;                // M = framings between the first one and the giant
    const sizeKm = (b) => (+b.km > 0 ? +b.km : +b.rSun * (+U.sunKm || 1392700));
    const B = list.map((b, i) => Object.assign({}, b, { i, id: b.id || 'body' + i, km: sizeKm(b), R: sizeKm(b) / 2, color: b.color || INK }));
    const byId = {};
    B.forEach((b) => (byId[b.id] = b));
    const FIRST = B[1], ANCHOR = B[NB - 2], GIANT = B[NB - 1];
    // framing plan: the first framed body, the middle ones and the giant land at these on-screen diameters and screen
    // x; gaps between neighbours are a layout choice, in px at the framing where each gap matters
    const MID_D = [[], [560], [560, 620], [560, 590, 620]][M], MID_G = [[], [535], [535, 475], [535, 475, 475]][M];
    const FR = [FIRST].concat(B.slice(2, NB - 1), [GIANT]);
    const FD = [360].concat(MID_D, [800]), FSX = [1030].concat(MID_D.map(() => 1010), [1278]);
    FR.forEach((b, k) => { b.z = FD[k] / (2 * b.R); b.sx = FSX[k]; });
    const gap = [190 / FIRST.z];
    for (let k = 0; k < M; k++) gap.push(MID_G[k] / FR[k].z);
    gap.push(105 / GIANT.z);
    B[0].x = 0;
    for (let i = 1; i < NB; i++) B[i].x = B[i - 1].x + B[i - 1].R + gap[i - 1] + B[i].R;
    const Y0 = 500, Q = { x: 960, y: 520 };

    /* ======================= camera: log(zoom) eased about an anchor ======================= */
    // A key frames one body: z = px per km, ox = screen x of the world origin.
    const key = (z, wx, sx) => ({ z, ox: sx - wx * z });
    FR.forEach((b) => (b.key = key(b.z, b.x, b.sx)));
    const KE = FIRST.key, mEM = (B[0].x + FIRST.x) / 2;
    const KE0 = key(FIRST.z * 1.3, mEM, KE.ox + mEM * FIRST.z);
    // velocity profile: smooth ramp in over a, cruise, fast smooth stop over d (so the reveal has a landing frame)
    function trapEase(a, d) {
      const N = 2400, cum = new Float64Array(N + 1);
      const v = (u) => (u < a ? sm(u / a) : u > 1 - d ? sm((1 - u) / d) : 1);
      for (let i = 1; i <= N; i++) cum[i] = cum[i - 1] + v((i - 0.5) / N);
      const tot = cum[N];
      return (u) => { u = clamp(u) * N; const i = Math.min(N - 1, Math.floor(u)); return (cum[i] + (cum[i + 1] - cum[i]) * (u - i)) / tot; };
    }
    // timing: five bodies keep the showcase rhythm; six share the same middle window; three or four bodies end the
    // piece earlier (D < 0) instead of holding dead frames
    const SHOW = [
      { t0: 1.4, t1: 2.5, lab: 2.2, wh: { dur: 1.15, from: 3000, to: 620, gain: 0.4 }, pop: 0.9 },
      { t0: 3.0, t1: 4.05, lab: 3.72, wh: { dur: 1.35, from: 2200, to: 420, gain: 0.46 }, pop: 0.8 },
    ];
    const slot = M <= 2 ? 1.6 : 3.2 / M;
    const MID = M === 2 ? SHOW : Array.from({ length: M }, (_, k) => {
      const f = M > 1 ? k / (M - 1) : 0, t0 = 1.4 + k * slot, t1 = t0 + Math.min(1.1, slot - 0.32);
      return { t0, t1, lab: t1 - 0.3, wh: { dur: t1 - t0 + 0.05 + 0.25 * f, from: 3000 - 800 * f, to: 620 - 200 * f, gain: 0.4 + 0.06 * f }, pop: 0.9 - 0.1 * f };
    });
    const D = M < 2 ? (M - 2) * 1.6 : 0;               // everything from the final zoom on shifts by D
    const FS = 4.6 + D, T_REVEAL = 6.72 + D, DUR = 9 + D;
    if (D) { S.dur = DUR; S.poster = 8.5 + D; }        // shorter lists end sooner; the poster frame follows
    const SEGS = [{ t0: 0.0, t1: 1.15, a: KE0, b: KE, A: mEM, ez: S.ease('expo.out') }];
    MID.forEach((m, k) => SEGS.push({ t0: m.t0, t1: m.t1, a: FR[k].key, b: FR[k + 1].key, A: FR[k].x + FR[k].R + gap[FR[k].i] / 2, ez: S.ease('power2.inOut') }));
    SEGS.push({ t0: FS, t1: T_REVEAL, a: ANCHOR.key, b: GIANT.key, A: ANCHOR.x, ez: trapEase(0.42, 0.15) });
    function camAt(t) {
      for (const s of SEGS) {
        if (t <= s.t0) return s.a;
        if (t < s.t1) {
          const e = s.ez((t - s.t0) / (s.t1 - s.t0));
          const z = s.a.z * Math.pow(s.b.z / s.a.z, e);
          const X = lerp(s.a.ox + s.A * s.a.z, s.b.ox + s.A * s.b.z, e);   // anchor's screen x, eased
          return { z, ox: X - s.A * z };
        }
      }
      return SEGS[SEGS.length - 1].b;
    }
    // slow continuous pull-back on top of the keyed moves, so no frame is ever static
    // the centre line lifts during the long zoom so the giant and its label clear the bottom safe area
    const liftE = S.ease('power2.inOut');
    function view(t) {
      const c = camAt(t), b = Math.exp(-0.009 * t), y0 = Y0 - 40 * liftE(clamp((t - (4.8 + D)) / 1.9));
      return { z: c.z * b, ox: Q.x + (c.ox - Q.x) * b, y: Q.y + (y0 - Q.y) * b };
    }
    const Z0 = view(0).z;
    // the hit lands on the first frame the whole giant fits in frame (the moment of comprehension)
    let T_HIT = T_REVEAL;
    for (let tt = 5.8 + D; tt <= T_REVEAL; tt += 1 / 240) {
      const V = view(tt);
      if (V.ox + GIANT.x * V.z + GIANT.R * V.z < W - 40) { T_HIT = Math.round(tt * 60) / 60; break; }
    }

    /* ======================= Earth coastlines (Natural Earth 1:110m, simplified) ======================= */
    const LAND = 
      '-1800,690 -1743,663 -1746,671 -1719,669 -1699,660 -1725,654 -1730,643 -1784,654 -1787,661 -1799,659 -1800,650 1800,650 1774,646 1792,623 1737,617 1703,599 1689,' +
      '606 1635,599 1620,582 1632,576 1621,549 1604,543 1600,532 1585,530 1568,510 1554,554 1559,568 1637,611 1645,626 1601,605 1593,618 1567,614 1542,598 1550,591 151' +
      '3,588 1513,595 1498,597 1422,590 1351,547 1382,538 1399,542 1414,522 1401,484 1382,463 1349,434 1323,433 1275,398 1295,368 1291,351 1265,344 1261,367 1269,369 1' +
      '247,381 1253,396 1211,389 1222,404 1216,409 1180,392 1175,387 1189,374 1224,375 1192,349 1219,317 1213,307 1221,298 1217,282 1187,245 1159,228 1108,214 1104,203' +
      ' 1085,217 1059,198 1093,134 1092,117 1052,86 1051,99 1001,134 992,92 1030,55 1042,13 1014,28 1001,65 985,84 983,78 988,114 972,169 954,157 942,160 943,182 914,2' +
      '28 905,228 903,218 870,215 865,202 803,159 799,104 775,80 735,160 726,214 705,209 664,254 574,257 565,271 547,265 515,279 501,301 480,300 508,248 510,260 516,25' +
      '8 518,240 540,241 564,264 568,242 598,223 578,202 577,189 553,172 487,140 435,126 427,168 391,213 385,237 346,281 349,295 339,276 324,299 355,231 369,220 375,18' +
      '6 433,124 427,117 446,104 511,120 510,106 477,42 403,-26 392,-47 388,-65 405,-108 408,-147 395,-167 348,-198 355,-241 326,-257 322,-288 282,-328 258,-339 196,-3' +
      '48 182,-339 182,-317 152,-271 143,-221 118,-181 118,-158 137,-107 119,-50 88,-11 94,37 85,48 59,43 43,63 -20,47 -90,48 -124,73 -166,122 -176,147 -161,181 -170,2' +
      '19 -144,263 -96,299 -93,326 -59,358 -22,352 15,366 95,374 111,369 103,338 191,303 201,322 215,328 289,309 310,316 338,310 360,346 362,367 276,367 262,395 292,41' +
      '2 335,420 383,409 417,420 367,452 391,473 350,463 363,451 339,444 325,453 333,461 307,466 277,426 288,411 264,402 249,409 237,407 239,400 226,403 240,377 231,37' +
      '9 232,364 225,364 194,403 195,417 131,457 123,454 126,441 185,402 169,404 171,389 161,380 154,400 89,444 65,431 31,431 30,419 8,410 1,387 -21,367 -54,359 -65,36' +
      '9 -89,369 -94,430 -14,440 -12,460 -46,487 -16,486 -19,498 13,501 47,531 81,535 88,540 81,555 85,571 106,577 109,565 96,555 109,540 197,544 213,552 216,574 241,5' +
      '70 244,584 233,592 291,600 229,598 213,607 215,632 254,651 239,660 222,657 214,644 178,627 171,613 188,601 168,587 159,561 129,554 104,595 84,583 57,586 50,620 ' +
      '59,626 105,645 148,678 192,698 245,710 282,712 313,705 300,702 311,696 403,679 411,668 400,663 332,666 348,659 349,644 370,639 365,648 372,651 396,645 404,648 3' +
      '98,655 421,665 440,661 445,668 435,686 463,682 468,677 456,670 463,667 537,689 545,688 535,682 588,689 599,683 611,689 600,695 606,699 685,681 692,686 669,695 6' +
      '67,710 692,728 726,728 718,714 728,704 726,690 737,684 713,663 724,662 751,678 749,690 736,696 744,706 731,714 749,721 747,728 757,723 753,713 764,712 759,719 7' +
      '76,723 815,717 805,736 868,739 860,745 872,751 1008,764 1044,777 1072,765 1111,767 1141,758 1094,742 1232,730 1233,737 1270,736 1313,708 1323,718 1399,715 1391,' +
      '724 1405,728 1495,722 1530,708 1590,709 1609,694 1678,696 1696,687 1708,690 1700,697 1705,701 1786,694|-905,695 -905,685 -892,693 -873,672 -856,688 -855,699 -82' +
      '6,697 -813,692 -820,681 -813,676 -833,664 -858,666 -873,648 -932,620 -947,589 -932,588 -923,571 -823,551 -821,533 -799,512 -786,526 -798,547 -765,565 -785,588 -' +
      '773,599 -781,623 -738,624 -696,611 -693,590 -677,582 -646,603 -614,570 -618,563 -573,546 -558,533 -557,521 -600,502 -664,502 -711,468 -651,492 -642,487 -651,481' +
      ' -645,462 -615,459 -605,470 -598,459 -654,435 -662,445 -644,453 -671,451 -707,430 -700,416 -737,409 -719,409 -740,408 -749,389 -755,395 -751,384 -759,372 -764,3' +
      '91 -763,381 -770,382 -757,356 -813,314 -801,269 -804,252 -817,259 -841,301 -892,303 -892,293 -902,291 -938,297 -966,283 -974,274 -979,224 -963,193 -944,181 -920' +
      ',187 -908,193 -903,210 -871,215 -889,159 -834,153 -838,111 -814,88 -796,96 -768,86 -749,111 -718,124 -711,121 -719,114 -717,91 -714,110 -699,122 -682,106 -649,1' +
      '01 -619,107 -624,99 -571,60 -540,58 -513,42 -500,17 -504,-1 -486,-2 -486,-12 -478,-6 -449,-16 -446,-27 -400,-29 -356,-51 -347,-73 -351,-90 -387,-131 -393,-179 -' +
      '409,-219 -476,-249 -489,-287 -538,-344 -562,-349 -584,-339 -568,-369 -592,-387 -623,-388 -627,-410 -651,-411 -650,-421 -635,-426 -652,-435 -656,-450 -673,-456 -' +
      '676,-463 -656,-472 -660,-481 -691,-507 -682,-524 -708,-529 -714,-539 -749,-523 -756,-487 -741,-469 -756,-466 -744,-441 -732,-445 -727,-424 -743,-432 -732,-393 -' +
      '736,-372 -714,-324 -702,-198 -715,-174 -760,-146 -798,-72 -813,-61 -814,-47 -798,-27 -810,-22 -809,-11 -771,38 -782,83 -796,89 -809,72 -857,99 -875,133 -912,139' +
      ' -947,162 -966,157 -1035,183 -1055,199 -1060,228 -1139,316 -1148,318 -1147,302 -1094,234 -1100,228 -1122,247 -1123,260 -1151,277 -1142,286 -1173,330 -1206,346 -' +
      '1244,403 -1239,455 -1247,482 -1231,480 -1226,471 -1228,490 -1274,508 -1278,523 -1291,528 -1341,581 -1471,609 -1517,592 -1506,613 -1540,594 -1533,589 -1542,581 -' +
      '1584,560 -1648,544 -1577,576 -1570,589 -1620,587 -1619,596 -1638,598 -1661,615 -1646,631 -1608,638 -1615,644 -1608,648 -1650,644 -1681,657 -1645,666 -1617,661 -' +
      '1668,684 -1566,714 -1365,689 -1281,705 -1258,695 -1244,702 -1243,694 -1215,698 -1152,689 -1139,684 -1153,679 -1089,674 -1078,679 -1088,683 -1082,687 -1061,688 -' +
      '1015,676 -984,678 -977,686 -961,682 -961,673 -942,691 -965,701 -964,712 -952,719 -929,713 -915,702 -924,697|1436,-138 1454,-150 1464,-190 1488,-204 1497,-223 15' +
      '07,-224 1529,-253 1536,-281 1529,-316 1500,-374 1463,-390 1450,-379 1436,-388 1406,-380 1396,-361 1381,-356 1382,-344 1368,-353 1378,-329 1360,-349 1343,-326 13' +
      '13,-315 1166,-350 1150,-342 1158,-322 1133,-261 1142,-263 1134,-244 1141,-218 1142,-225 1167,-207 1209,-197 1230,-164 1239,-171 1235,-166 1257,-142 1271,-138 12' +
      '96,-150 1306,-125 1326,-121 1318,-113 1365,-119 1370,-124 1355,-150 1402,-177 1417,-150 1421,-110 1436,-134|-271,835 -208,827 -314,820 -229,821 -221,817 -232,81' +
      '2 -158,819 -122,813 -200,802 -177,801 -197,788 -197,776 -185,770 -217,766 -198,761 -196,752 -207,752 -194,743 -236,733 -223,722 -248,723 -218,707 -255,714 -252,' +
      '708 -264,702 -223,701 -398,655 -428,627 -424,619 -434,601 -448,600 -483,609 -516,636 -540,672 -509,699 -547,696 -544,708 -514,706 -558,717 -547,726 -573,747 -61' +
      '3,761 -685,761 -714,770 -668,774 -732,784 -657,794 -680,801 -622,813 -626,818 -504,824 -445,817 -468,826 -351,836|-866,732 -858,725 -823,738 -806,727 -808,721 -' +
      '778,728 -679,701 -670,692 -688,687 -619,669 -639,650 -680,663 -653,644 -650,627 -688,637 -662,619 -748,647 -786,646 -779,653 -740,655 -729,677 -790,702 -813,697' +
      ' -895,708 -885,712 -899,712 -894,731 -858,738|-685,831 -619,824 -677,815 -655,815 -712,798 -769,793 -754,785 -798,772 -779,768 -861,763 -896,770 -878,772 -883,7' +
      '79 -850,775 -880,784 -851,793 -869,803 -818,805 -876,805 -916,819 -707,832|1341,-12 1344,-28 1355,-34 1383,-17 1446,-39 1476,-61 1472,-74 1487,-91 1508,-103 147' +
      '9,-101 1447,-76 1426,-93 1391,-81 1376,-84 1387,-73 1379,-54 1337,-35 1330,-41 1320,-28 1337,-22 1305,-9 1340,-8|1179,18 1190,9 1178,8 1161,-40 1149,-41 1133,-3' +
      '1 1102,-29 1091,13 1130,31 1167,69 1192,54 1173,32 1180,23|-1142,731 -1147,727 -1111,725 -1099,730 -1082,717 -1077,721 -1084,731 -1065,731 -1045,710 -1010,700 -' +
      '1027,695 -1024,688 -1133,685 -1173,700 -1124,704 -1179,705 -1161,713 -1194,716 -1152,733|501,-136 504,-157 497,-157 471,-249 454,-256 438,-245 433,-221 444,-201' +
      ' 444,-162 477,-146 492,-120 498,-129|!491,413 504,403 489,388 492,376 538,370 539,390 527,400 529,409 547,410 537,421 528,411 525,428 503,446 530,453 530,469 49' +
      '1,464 467,446 486,418|1058,-59 1026,-42 953,55 975,52 1006,21 1025,14 1038,1 1034,-7 1061,-31 1059,-43|-30,586 -41,576 -20,577 -31,560 17,527 14,513 -52,500 -34' +
      ',514 -53,520 -42,523 -46,535 -29,540 -48,548 -50,558 -56,553 -62,568 -50,586 -42,586|1410,371 1403,351 1372,346 1358,335 1351,346 1310,339 1320,331 1307,310 129' +
      '4,333 1326,354 1357,355 1367,373 1374,368 1394,382 1403,412 1414,414 1419,400 1410,382|575,707 516,715 556,751 682,769 689,765 682,762 585,743 554,724 556,715|-' +
      '145,665 -147,658 -136,651 -187,635 -228,640 -218,644 -240,649 -222,654 -243,656 -237,663 -206,657 -162,665|-1205,714 -1231,709 -1259,719 -1239,737 -1249,743 -12' +
      '15,744 -1155,735 -1205,718|-870,797 -858,793 -908,782 -967,802 -924,813 -878,803|-947,771 -892,756 -801,753 -819,744 -881,744 -924,748 -929,759 -967,772|183,797' +
      ' 215,790 159,768 104,797 170,801|1730,-409 1742,-413 1731,-439 1715,-442 1693,-466 1667,-462 1670,-451 1705,-430 1728,-405|1252,14 1237,2 1202,2 1209,-14 1233,-' +
      '6 1215,-19 1232,-53 1222,-53 1227,-45 1215,-46 1210,-26 1203,-29 1204,-55 1194,-54 1195,-35 1188,-28 1200,6 1251,16|-561,507 -568,498 -535,492 -538,485 -531,487' +
      ' -526,475 -531,467 -542,468 -542,478 -554,469 -563,476 -593,476 -574,507 -556,513|-1082,762 -1059,760 -1063,750 -1137,744 -1118,752 -1177,752 -1154,765 -1091,75' +
      '5 -1105,764 -1086,767|999,789 950,790 912,803 959,813 1002,798|1746,-362 1768,-379 1785,-377 1752,-417 1749,-399 1738,-395 1747,-374 1726,-345 1743,-353|-678,-5' +
      '38 -651,-547 -692,-555 -747,-528 -711,-541 -693,-525 -683,-531|1086,-68 1108,-65 1157,-84 1065,-74 1054,-69 1061,-59 1085,-64|1436,507 1447,490 1432,493 1426,47' +
      '9 1435,461 1427,467 1421,460 1417,533 1427,544 1432,518|-797,228 -742,203 -750,199 -778,199 -771,204 -787,216 -818,226 -850,219 -833,230 -806,231|1439,442 1453,' +
      '444 1455,433 1432,420 1416,427 1411,416 1400,416 1398,426 1414,434 1420,456 1431,445|1213,185 1222,185 1225,171 1217,143 1240,138 1241,125 1206,139 1199,164 120' +
      '7,185|-68,523 -100,518 -92,529 -97,539 -67,552 -57,546 -60,532|-1004,738 -974,738 -981,730 -965,726 -967,717 -993,714 -1025,725 -1004,727 -1015,734|1451,756 144' +
      '3,748 1390,746 1370,753 1375,759 1415,761|1264,84 1254,56 1242,62 1236,78 1219,72 1235,87 1255,90 1254,98 1263,88|254,804 274,801 259,795 201,796 174,803 229,80' +
      '7|-852,657 -801,637 -831,641 -855,631 -872,635 -859,657|1454,-408 1483,-409 1479,-432 1460,-435 1447,-407|-932,728 -954,721 -960,734 -945,741 -905,739 -920,730|' +
      '-726,199 -683,186 -707,184 -714,176 -745,183 -723,187 -732,199|-985,767 -977,763 -982,750 -1009,751 -1009,756 -1025,756 -1026,763 -986,766|-1162,776 -1171,765 -' +
      '1199,761 -1229,761 -1176,775|812,62 799,68 801,98 818,75 816,65';
    const land = LAND.split('|').map((s) => {
      const hole = s[0] === '!';
      const raw = (hole ? s.slice(1) : s).split(' ').map((p) => p.split(',').map((v) => +v / 10));
      const lon = [], lat = [];
      let mx = 0, my = 0;
      for (let i = 0; i < raw.length; i++) {
        const [x1, y1] = raw[i], [x2, y2] = raw[(i + 1) % raw.length];
        let dx = x2 - x1; if (dx > 180) dx -= 360; if (dx < -180) dx += 360;
        const n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(y2 - y1)) / 2.5));
        for (let k = 0; k < n; k++) { lon.push((x1 + (dx * k) / n) * DEG); lat.push((y1 + ((y2 - y1) * k) / n) * DEG); }
        mx += x1; my += y1;
      }
      mx /= raw.length; my /= raw.length;
      const n = lon.length;
      return { hole, n, ice: my > 68 && mx > -60 && mx < -15, lon: Float64Array.from(lon), cl: Float64Array.from(lat, Math.cos), sl: Float64Array.from(lat, Math.sin), px: new Float64Array(2 * n) };
    });

    /* ======================= sphere helpers ======================= */
    const pt = { x: 0, y: 0, z: 0 };
    // orthographic: central meridian phi, north pole tipped toward the viewer by tilt (ce = cos, se = sin). y is screen-down.
    function sph(lon, lat, phi, ce, se) {
      const d = lon - phi, cl = Math.cos(lat), sl = Math.sin(lat), z0 = cl * Math.cos(d);
      pt.x = cl * Math.sin(d); pt.y = -(sl * ce - z0 * se); pt.z = sl * se + z0 * ce;
      return pt;
    }
    // a lon/lat ellipse feature projected to the disk (points behind the limb are pushed onto it)
    function featPath(x, y, r, f, phi, ce, se, k = 1) {
      ctx.beginPath();
      for (let i = 0; i < 28; i++) {
        const a = (i / 28) * TAU, w = f.w * k * (1 + (f.wob || 0) * Math.sin(a * 3 + (f.ph || 0)));
        const p = sph(f.lon + Math.cos(a) * w / Math.max(0.2, Math.cos(f.lat)), f.lat + Math.sin(a) * f.h * k * (1 + (f.wob || 0) * Math.cos(a * 2 + (f.ph || 0))), phi, ce, se);
        let px = p.x, py = p.y;
        if (p.z < 0) { const m = Math.hypot(px, py) || 1; px /= m; py /= m; }
        i ? ctx.lineTo(x + px * r, y + py * r) : ctx.moveTo(x + px * r, y + py * r);
      }
      ctx.closePath();
    }
    // light from the upper right, where the Sun sits in the line-up
    const LX = 0.74, LY = -0.67;
    // bodies so close they overflow the frame (the "walls" at the edge) keep their colour: fade the shading out
    const shadeK = (r) => 1 - sm((r - 700) / 1100);
    function crescent(x, y, r, k, style) {        // disk minus the same disk shifted toward the light: terminator shading
      const f = shadeK(r);
      if (f <= 0.01) return;
      ctx.globalAlpha = f;
      ctx.beginPath();
      ctx.rect(x - r - 2, y - r - 2, 2 * r + 4, 2 * r + 4);
      ctx.arc(x + LX * k * r, y + LY * k * r, r, 0, TAU, true);
      ctx.fillStyle = style; ctx.fill('evenodd');
      ctx.globalAlpha = 1;
    }
    function rimLight(x, y, r, col, wFrac) {
      const a0 = Math.atan2(LY, LX);
      ctx.beginPath(); ctx.arc(x, y, r - r * wFrac * 0.5, a0 - 1.15, a0 + 1.15);
      ctx.strokeStyle = col; ctx.lineWidth = r * wFrac; ctx.lineCap = 'round'; ctx.stroke();
    }
    function glowRing(x, y, r, ext, rgb, a) {
      if (a <= 0.003 || ext < 1) return;
      const o = r + ext;
      if (x + o < 0 || x - o > W || y + o < 0 || y - o > H) return;
      const g = ctx.createRadialGradient(x, y, r, x, y, o);
      g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(0.3, `rgba(${rgb},${a * 0.45})`); g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = g;
      const x0 = Math.max(0, x - o), y0 = Math.max(0, y - o), x1 = Math.min(W, x + o), y1 = Math.min(H, y + o);
      ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    }
    // disk outline; huge disks become a local polygon around the visible arc (keeps canvas numerics sane)
    function diskPath(x, y, r) {
      ctx.beginPath();
      if (r < 5000) { ctx.arc(x, y, r, 0, TAU); return; }
      const ang = Math.atan2(Q.y - y, Q.x - x), span = Math.min(Math.PI, 2800 / r), N = 64, back = r - 4200;
      for (let i = 0; i <= N; i++) { const a = ang - span + (2 * span * i) / N; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
      ctx.lineTo(x + Math.cos(ang + span) * back, y + Math.sin(ang + span) * back);
      ctx.lineTo(x + Math.cos(ang - span) * back, y + Math.sin(ang - span) * back);
      ctx.closePath();
    }
    const visible = (p, m) => p.x + p.r + m > 0 && p.x - p.r - m < W && p.y + p.r + m > 0 && p.y - p.r - m < H;
    const bbox = (p) => { const x0 = Math.max(0, p.x - p.r), y0 = Math.max(0, p.y - p.r); return [x0, y0, Math.min(W, p.x + p.r) - x0, Math.min(H, p.y + p.r) - y0]; };
    function dot(p, col) {                              // sub-pixel bodies: coverage-weighted dot
      const a = clamp((p.r * p.r) / 0.25);
      if (a < 0.02) return;
      ctx.globalAlpha = a; ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(p.r, 0.5), 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
    }

    /* ======================= canvas ======================= */
    const ctx = S.canvas();

    // ---- starfield: 3 depth layers that converge as the camera pulls back (parallax on log zoom) ----
    const LAYERS = [
      { n: 340, lam: 0.016, span: 0.66, size: [0.45, 1.05], a: [0.22, 0.7] },
      { n: 170, lam: 0.032, span: 0.78, size: [0.8, 1.5], a: [0.35, 0.85] },
      { n: 64, lam: 0.056, span: 0.98, size: [1.3, 2.3], a: [0.55, 1] },
    ];
    const STAR_COLS = C.stars;
    for (const L of LAYERS) {
      L.s = [];
      for (let i = 0; i < L.n; i++) L.s.push({ x: Q.x + S.rnd(-1, 1) * W * L.span, y: Q.y + S.rnd(-1, 1) * H * L.span, r: S.rnd(L.size[0], L.size[1]), a: S.rnd(L.a[0], L.a[1]), c: STAR_COLS[(S.rand() * STAR_COLS.length) | 0], f: S.rnd(0.6, 2.2), k: S.rnd(0, 50) });
    }
    const GLINTS = LAYERS[2].s.slice(0, 9);
    const NEB = [[330, 260, 760, 0.2], [1560, 860, 820, 0.14], [1250, 120, 560, 0.09], [260, 950, 600, 0.12]].map(([x, y, r, a], i) => [x, y, r, rgbS(C.nebula[i % C.nebula.length]), a]);
    function drawSky(t, lnz) {
      const d = lnz - Math.log(Z0);
      for (const [nx, ny, nr, rgb, a] of NEB) {
        const s = Math.exp(0.012 * d), x = Q.x + (nx - Q.x) * s, y = Q.y + (ny - Q.y) * s, rr = nr * s;
        const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
        g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = g; ctx.fillRect(x - rr, y - rr, 2 * rr, 2 * rr);
      }
      const dPrev = Math.log(view(Math.max(0, t - 0.045)).z) - Math.log(Z0);
      for (let li = 0; li < LAYERS.length; li++) {
        const L = LAYERS[li], s = Math.exp(L.lam * d), sp = Math.exp(L.lam * dPrev);
        for (const st of L.s) {
          const x = Q.x + (st.x - Q.x) * s, y = Q.y + (st.y - Q.y) * s;
          if (x < -4 || x > W + 4 || y < -4 || y > H + 4) continue;
          const a = st.a * (0.68 + 0.32 * S.noise(t * st.f + st.k, li + 3));
          ctx.globalAlpha = a; ctx.fillStyle = st.c;
          if (li === 2) {
            const px = Q.x + (st.x - Q.x) * sp, py = Q.y + (st.y - Q.y) * sp, m = Math.hypot(x - px, y - py);
            if (m > 1.5) {           // motion streak while the camera is racing back
              ctx.strokeStyle = st.c; ctx.lineWidth = st.r * 1.2; ctx.lineCap = 'round';
              ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
              continue;
            }
          }
          if (st.r < 1.1) ctx.fillRect(x - st.r, y - st.r, st.r * 2, st.r * 2);
          else { ctx.beginPath(); ctx.arc(x, y, st.r, 0, TAU); ctx.fill(); }
        }
      }
      // four-point glints on a few bright stars
      const s2 = Math.exp(LAYERS[2].lam * d);
      GLINTS.forEach((st, i) => {
        const x = Q.x + (st.x - Q.x) * s2, y = Q.y + (st.y - Q.y) * s2;
        if (x < 0 || x > W || y < 0 || y > H) return;
        const k = 0.5 + 0.5 * S.noise(t * 1.3 + i * 7, 11), len = 5 + 8 * k;
        ctx.globalAlpha = 0.35 + 0.5 * k; ctx.fillStyle = C.glint;
        ctx.beginPath(); ctx.moveTo(x - len, y); ctx.lineTo(x, y - 0.9); ctx.lineTo(x + len, y); ctx.lineTo(x, y + 0.9); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x, y - len); ctx.lineTo(x + 0.9, y); ctx.lineTo(x, y + len); ctx.lineTo(x - 0.9, y); ctx.closePath(); ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    // ---- space dust: only shows while the camera races back, streaming into the zoom's pivot point ----
    const DUST = [], DUSTC = rgbS(C.dust);
    for (let i = 0; i < 120; i++) DUST.push({ th: S.rnd(0, TAU), c: S.rand(), a: S.rnd(0.2, 0.62), w: S.rnd(0.8, 2) });
    const anchorX = (t) => { for (const s of SEGS) if (t > s.t0 && t < s.t1 + 0.25) return s.A; return null; };
    function drawDust(t, V) {
      const A = anchorX(t);
      if (A == null) return;
      const lnz = Math.log(V.z), lnzP = Math.log(view(Math.max(0, t - 0.04)).z);
      const k = clamp(((lnzP - lnz) / 0.04 - 0.5) / 3);         // speed in nats per second, gated
      if (k <= 0.01) return;
      const d = Math.log(Z0) - lnz, dP = Math.log(Z0) - lnzP;
      const cx = V.ox + A * V.z, cy = V.y, RMAX = 1400, LN = Math.log(RMAX / 50);
      ctx.lineCap = 'round';
      for (const p of DUST) {
        const c = (p.c + 0.17 * d) % 1, cP = c - 0.17 * (d - dP);
        if (cP < 0) continue;
        const rho = RMAX * Math.exp(-c * LN), rhoP = RMAX * Math.exp(-cP * LN), al = p.a * k * Math.pow(Math.sin(Math.PI * c), 1.3);
        if (al < 0.01) continue;
        const ux = Math.cos(p.th), uy = Math.sin(p.th);
        ctx.strokeStyle = `rgba(${DUSTC},${al.toFixed(3)})`; ctx.lineWidth = p.w;
        ctx.beginPath(); ctx.moveTo(cx + ux * rhoP, cy + uy * rhoP); ctx.lineTo(cx + ux * rho, cy + uy * rho); ctx.stroke();
      }
    }

    /* ======================= surface looks ======================= */
    // A look is a preset in P.looks or an inline object. `like` starts from another preset (default: the showcase
    // preset of its type), `tint` moves every colour's hue and saturation to the tint and scales its lightness,
    // and any key given explicitly wins. `shade` (night side) and `light` (rim light) are never tinted.
    const TYPE_BASE = { rocky: 'moon', earth: 'earth', gas: 'jupiter', star: 'sun', giant: 'redSupergiant' };
    const KEYCOL = { rocky: (l) => l.dot, gas: (l) => l.dot, star: (l) => l.disk && l.disk[1], giant: (l) => l.disk && l.disk[1] };
    const FIXED = { type: 1, like: 1, tint: 1, shade: 1, light: 1 };
    const isHex = (v) => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);
    const toHsl = (hx) => {
      const n = parseInt(hx.slice(1), 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
      if (!d) return [0, 0, l];
      const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      return [h * 60, l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn), l];
    };
    const toHex = ([h, s, l]) => {
      h = ((h % 360) + 360) % 360; s = clamp(s); l = clamp(l);
      const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
      const rgb = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
      return '#' + rgb.map((v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
    };
    function recolor(lk, tint) {
      const ref = KEYCOL[lk.type] && KEYCOL[lk.type](lk);
      if (!isHex(ref) || !isHex(tint)) return Object.assign({}, lk);
      const A = toHsl(ref), T = toHsl(tint), ks = A[1] > 0.04 ? T[1] / A[1] : null, kl = T[2] / Math.max(0.02, A[2]);
      const map = (hx) => { const c = toHsl(hx); return toHex([T[0] + c[0] - A[0], ks == null ? T[1] : c[1] * ks, c[2] * kl]); };
      const out = {};
      for (const k in lk) { const v = lk[k]; out[k] = FIXED[k] ? v : isHex(v) ? map(v) : Array.isArray(v) ? v.map((x) => (isHex(x) ? map(x) : x)) : v; }
      return out;
    }
    function resolveLook(spec, depth) {
      if (typeof spec === 'string') spec = LOOKS[spec] || { type: spec in TYPE_BASE ? spec : 'rocky' };
      const parentName = spec.like || TYPE_BASE[spec.type];
      let out = parentName && LOOKS[parentName] && LOOKS[parentName] !== spec && depth < 5 ? resolveLook(parentName, depth + 1) : {};
      out = Object.assign({}, out, { type: spec.type || out.type || 'rocky' });
      if (spec.tint) out = recolor(out, spec.tint);
      for (const k in spec) if (k !== 'like' && k !== 'tint') out[k] = spec[k];
      return out;
    }
    const mixHex = (h1, h2, t) => '#' + [16, 8, 0].map((s) => Math.round(((parseInt(h1.slice(1), 16) >> s) & 255) * (1 - t) + ((parseInt(h2.slice(1), 16) >> s) & 255) * t).toString(16).padStart(2, '0')).join('');

    // ---- rocky (the Moon): maria + foreshortened craters; later rocky bodies mirror the layout ----
    const MARIA0 = [[-0.52, -0.06, 0.24, 0.4], [-0.24, -0.46, 0.25, 0.2], [0.17, -0.38, 0.15, 0.14], [0.32, -0.1, 0.2, 0.17], [0.72, -0.3, 0.1, 0.12], [0.55, 0.16, 0.13, 0.15], [-0.16, 0.3, 0.16, 0.13], [-0.5, 0.38, 0.1, 0.1]];
    const CRATERS0 = [[-0.08, 0.72, 0.1], [-0.3, -0.12, 0.08], [0.46, 0.52, 0.12], [-0.62, 0.62, 0.09], [0.2, 0.78, 0.07], [0.62, -0.64, 0.08], [-0.78, -0.4, 0.07], [0.05, 0.1, 0.06], [0.82, 0.18, 0.06], [-0.4, 0.82, 0.05], [0.34, -0.72, 0.06], [-0.86, 0.12, 0.05]];
    function makeRocky(lk, n) {
      const mu = n % 2 ? -1 : 1;
      const MARIA = MARIA0.map(([u, v, rx, ry], i) => {
        const pts = [];
        for (let k = 0; k < 20; k++) { const a = (k / 20) * TAU, w = 1 + 0.18 * S.noise(k * 0.9, 40 + i + 20 * n); pts.push([mu * u + Math.cos(a) * rx * w, v + Math.sin(a) * ry * w]); }
        return pts;
      });
      const CRATERS = CRATERS0.map(([u, v, s]) => [mu * u, v, s]);
      const MF = hexA(lk.maria, 0.75), SH1 = hexA(lk.shade, 0.13), SH2 = hexA(lk.shade, 0.38), RL = hexA(lk.light, 0.35), CR = lk.crater;
      return (p) => {
        if (!visible(p, 2)) return;
        if (p.r < 1.6) return dot(p, lk.dot);
        const { x, y, r } = p;
        ctx.save(); diskPath(x, y, r); ctx.clip();
        const g = ctx.createRadialGradient(x + 0.4 * r, y - 0.35 * r, 0, x, y, r * 1.1);
        g.addColorStop(0, lk.surface[0]); g.addColorStop(1, lk.surface[1]);
        ctx.fillStyle = g; ctx.fillRect(...bbox(p));
        ctx.fillStyle = MF;
        for (const m of MARIA) { ctx.beginPath(); m.forEach(([u, v], i) => (i ? ctx.lineTo(x + u * r, y + v * r) : ctx.moveTo(x + u * r, y + v * r))); ctx.closePath(); ctx.fill(); }
        if (r > 9) {
          for (const [u, v, s] of CRATERS) {
            const dd = Math.hypot(u, v), fs = Math.sqrt(Math.max(0.08, 1 - dd * dd));
            ctx.save(); ctx.translate(x + u * r, y + v * r); ctx.rotate(Math.atan2(v, u)); ctx.scale(fs, 1);
            const cr = s * r;
            ctx.beginPath(); ctx.arc(0, 0, cr, 0, TAU); ctx.fillStyle = CR[0]; ctx.fill();     // rim
            ctx.beginPath(); ctx.arc(0, 0, cr * 0.8, 0, TAU); ctx.fillStyle = CR[1]; ctx.fill();  // floor in shadow
            ctx.save(); ctx.clip();
            ctx.rotate(-Math.atan2(v, u));
            ctx.beginPath(); ctx.arc(-LX * cr * 0.3, -LY * cr * 0.3, cr * 0.8, 0, TAU); ctx.fillStyle = CR[2]; ctx.fill();
            ctx.restore(); ctx.restore();
          }
        }
        crescent(x, y, r, 0.2, SH1);
        crescent(x, y, r, 0.56, SH2);
        ctx.restore();
        if (r > 6) rimLight(x, y, r, RL, 0.05);
      };
    }

    // ---- earth: real coastlines on a tilted orthographic globe ----
    const E_TILT = 0.33, E_CE = Math.cos(E_TILT), E_SE = Math.sin(E_TILT);
    const DESERTS = [{ lon: 8 * DEG, lat: 23 * DEG, w: 19 * DEG, h: 6.5 * DEG, wob: 0.2, ph: 1.3 }, { lon: 46 * DEG, lat: 23 * DEG, w: 7.5 * DEG, h: 6 * DEG, wob: 0.16, ph: 0.4 }, { lon: 22 * DEG, lat: -23 * DEG, w: 6 * DEG, h: 4.5 * DEG, wob: 0.15, ph: 2 }, { lon: 62 * DEG, lat: 38 * DEG, w: 12 * DEG, h: 5 * DEG, wob: 0.2, ph: 0.9 }];
    const FORESTS = [{ lon: 22 * DEG, lat: 0, w: 9 * DEG, h: 5 * DEG, wob: 0.2 }, { lon: -62 * DEG, lat: -6 * DEG, w: 13 * DEG, h: 7 * DEG, wob: 0.2 }, { lon: 40 * DEG, lat: 58 * DEG, w: 30 * DEG, h: 5 * DEG, wob: 0.2 }];
    function makeEarth(lk) {
      // clouds: tapered lens-shaped streaks along latitude (storm tracks at mid-latitudes, puffs near the equator)
      const CLOUDS = [];
      for (let i = 0; i < 30; i++) {
        const trop = i % 3 === 0, lat = trop ? S.rnd(-7, 10) : (S.rand() < 0.55 ? 1 : -1) * S.rnd(27, 60);
        CLOUDS.push({ lat: lat * DEG, lon: S.rnd(-180, 180) * DEG, L: (trop ? S.rnd(4, 8) : S.rnd(8, 18)) * DEG, Wt: (trop ? S.rnd(1.8, 2.8) : S.rnd(1.5, 2.6)) * DEG, bend: S.rnd(-1.2, 1.2) * DEG, a: S.rnd(0.82, 0.96) });
      }
      const GLW = rgbS(lk.glow), DES = hexA(lk.desert, 0.82), FOR = hexA(lk.forest, 0.8), ARC = hexA(lk.ice[1], 0.92), CLD = rgbS(lk.cloud);
      const HZ0 = hexA(lk.haze, 0), HZ1 = hexA(lk.haze, 0.38), SH1 = hexA(lk.shade, 0.13), SH2 = hexA(lk.shade, 0.38), RL = hexA(lk.light, 0.55);
      function cloudPt(lon, lat, cph, x, y, r, first) {
        const q = sph(lon, lat, cph, E_CE, E_SE);
        let px = q.x, py = q.y;
        if (q.z < 0) { const m = Math.hypot(px, py) || 1; px /= m; py /= m; }
        first ? ctx.moveTo(x + px * r, y + py * r) : ctx.lineTo(x + px * r, y + py * r);
      }
      return (p, t) => {
        const { x, y, r } = p;
        if (!visible(p, r * 0.2 + 4)) return;
        if (r < 1.4) return dot(p, lk.dot);
        glowRing(x, y, r, r * 0.14 + 2, GLW, 0.5);
        const phi = -0.075 * t, cph = -0.1 * t;
        ctx.save(); diskPath(x, y, r); ctx.clip();
        const og = ctx.createRadialGradient(x + 0.35 * r, y - 0.35 * r, r * 0.05, x, y, r * 1.05);
        og.addColorStop(0, lk.ocean[0]); og.addColorStop(0.6, lk.ocean[1]); og.addColorStop(1, lk.ocean[2]);
        ctx.fillStyle = og; ctx.fillRect(...bbox(p));
        // land
        ctx.beginPath();
        const ice = [];
        for (const g of land) {
          if (g.hole) continue;
          let vis = 0; const Pp = g.px;
          for (let i = 0; i < g.n; i++) {
            const d = g.lon[i] - phi, z0 = g.cl[i] * Math.cos(d);
            let xx = g.cl[i] * Math.sin(d), yU = g.sl[i] * E_CE - z0 * E_SE;
            if (g.sl[i] * E_SE + z0 * E_CE < 0) { const m = Math.hypot(xx, yU) || 1; xx /= m; yU /= m; } else vis++;
            Pp[2 * i] = x + xx * r; Pp[2 * i + 1] = y - yU * r;
          }
          if (!vis) continue;
          if (g.ice) { ice.push(g); continue; }
          ctx.moveTo(Pp[0], Pp[1]); for (let i = 1; i < g.n; i++) ctx.lineTo(Pp[2 * i], Pp[2 * i + 1]); ctx.closePath();
        }
        const lg = ctx.createRadialGradient(x + 0.35 * r, y - 0.35 * r, r * 0.05, x, y, r * 1.05);
        lg.addColorStop(0, lk.land[0]); lg.addColorStop(1, lk.land[1]);
        ctx.fillStyle = lg; ctx.fill();
        if (r > 12) {
          ctx.save(); ctx.clip();
          ctx.fillStyle = DES;
          for (const f of DESERTS) { const c = sph(f.lon, f.lat, phi, E_CE, E_SE); if (c.z > -0.2) { featPath(x, y, r, f, phi, E_CE, E_SE); ctx.fill(); } }
          ctx.fillStyle = FOR;
          for (const f of FORESTS) { const c = sph(f.lon, f.lat, phi, E_CE, E_SE); if (c.z > -0.2) { featPath(x, y, r, f, phi, E_CE, E_SE); ctx.fill(); } }
          ctx.restore();
        }
        // Greenland + the Arctic cap
        ctx.fillStyle = lk.ice[0];
        for (const g of ice) { const Pp = g.px; ctx.beginPath(); ctx.moveTo(Pp[0], Pp[1]); for (let i = 1; i < g.n; i++) ctx.lineTo(Pp[2 * i], Pp[2 * i + 1]); ctx.closePath(); ctx.fill(); }
        ctx.beginPath();
        for (let i = 0; i < 40; i++) { const p2 = sph((i / 40) * TAU, (79 + 2.5 * Math.sin(i * 1.7)) * DEG, phi, E_CE, E_SE); i ? ctx.lineTo(x + p2.x * r, y + p2.y * r) : ctx.moveTo(x + p2.x * r, y + p2.y * r); }
        ctx.closePath(); ctx.fillStyle = ARC; ctx.fill();
        // cloud streaks drift a little faster than the ground
        if (r > 10) {
          const N = 12;
          for (const c of CLOUDS) {
            if (sph(c.lon, c.lat, cph, E_CE, E_SE).z < 0.03) continue;
            const span = c.L / Math.max(0.3, Math.cos(c.lat));
            ctx.beginPath();
            for (let k = 0; k <= N; k++) { const s = k / N, w = c.Wt * Math.pow(Math.sin(Math.PI * s), 0.45); cloudPt(c.lon - span + 2 * span * s, c.lat + c.bend * Math.sin(Math.PI * s) + w, cph, x, y, r, k === 0); }
            for (let k = N; k >= 0; k--) { const s = k / N, w = c.Wt * Math.pow(Math.sin(Math.PI * s), 0.45) * 0.55; cloudPt(c.lon - span + 2 * span * s, c.lat + c.bend * Math.sin(Math.PI * s) - w, cph, x, y, r, false); }
            ctx.closePath(); ctx.fillStyle = `rgba(${CLD},${c.a})`; ctx.fill();
          }
        }
        // atmosphere haze at the limb, then terminator
        const hz = ctx.createRadialGradient(x, y, r * 0.78, x, y, r);
        hz.addColorStop(0, HZ0); hz.addColorStop(1, HZ1);
        ctx.fillStyle = hz; ctx.fillRect(...bbox(p));
        crescent(x, y, r, 0.2, SH1);
        crescent(x, y, r, 0.56, SH2);
        ctx.restore();
        if (r > 6) rimLight(x, y, r, RL, 0.035);
      };
    }

    // ---- gas giant (Jupiter): wavy belts and zones, an optional great spot and white ovals ----
    const J_LAT = [58, 42, 31, 23, 16.5, 7, -4, -8.5, -18.5, -28, -36, -46, -60];
    const OVALS0 = [[-1.6, -40.5, 2.2, 1.4], [-0.9, -41, 1.8, 1.2], [0.2, -40, 2, 1.3], [1.2, -41, 1.7, 1.1], [0.7, 33.5, 1.6, 1]];
    function makeGas(lk, n) {
      const bands = lk.bands && lk.bands.length ? lk.bands : [lk.fill];
      const J_BANDS = J_LAT.map((lat, i) => ({ lat: lat * DEG, col: bands[i % bands.length], amp: (0.5 + ((i * 37) % 10) / 8) * DEG, k: 3 + (i * 5) % 7, ph: i * 1.7 + n * 2.3 }));
      const GRS = { lon: -0.62 + n * 1.9, lat: -22.3 * DEG, w: 7.3 * DEG, h: 4.6 * DEG };
      const OVALS = OVALS0.map(([lon, lat, w, h]) => ({ lon: lon + n * 1.9, lat: lat * DEG, w: w * DEG, h: h * DEG }));
      const LD0 = hexA(lk.limb, 0), LD1 = hexA(lk.limb, 0.32), SH1 = hexA(lk.shade, 0.12), SH2 = hexA(lk.shade, 0.36), RL = hexA(lk.light, 0.4);
      return (p, t) => {
        const { x, y, r } = p;
        if (!visible(p, 3)) return;
        if (r < 1.6) return dot(p, lk.dot);
        const phi = -0.13 * t;
        ctx.save(); diskPath(x, y, r); ctx.clip();
        ctx.fillStyle = lk.fill; ctx.fillRect(...bbox(p));
        const steps = r > 40 ? 26 : 10;
        for (const b of J_BANDS) {
          ctx.beginPath();
          let y0 = 0, y1 = 0;
          for (let k = 0; k <= steps; k++) {
            const d = -Math.PI / 2 + (Math.PI * k) / steps, lat = b.lat + b.amp * Math.sin(b.k * (d + phi) + b.ph);
            const sx = x + Math.cos(lat) * Math.sin(d) * r, sy = y - Math.sin(lat) * r;
            if (k === 0) { y0 = sy; ctx.moveTo(x - r * 1.3, sy); }
            ctx.lineTo(sx, sy); y1 = sy;
          }
          ctx.lineTo(x + r * 1.3, y1); ctx.lineTo(x + r * 1.3, y + r * 1.3); ctx.lineTo(x - r * 1.3, y + r * 1.3); ctx.lineTo(x - r * 1.3, y0);
          ctx.fillStyle = b.col; ctx.fill();
        }
        if (r > 14) {
          if (lk.spot) {
            const c = sph(GRS.lon, GRS.lat, phi, 1, 0);
            if (c.z > 0.05) {
              featPath(x, y, r, GRS, phi, 1, 0, 1.45); ctx.fillStyle = lk.spot[0]; ctx.fill();
              featPath(x, y, r, GRS, phi, 1, 0, 1.0); ctx.fillStyle = lk.spot[1]; ctx.fill();
              featPath(x, y, r, GRS, phi, 1, 0, 0.55); ctx.fillStyle = lk.spot[2]; ctx.fill();
            }
          }
          if (lk.ovals) {
            ctx.fillStyle = lk.ovals;
            for (const o of OVALS) { if (sph(o.lon, o.lat, phi, 1, 0).z > 0.05) { featPath(x, y, r, o, phi, 1, 0); ctx.fill(); } }
          }
        }
        const ld = ctx.createRadialGradient(x, y, r * 0.55, x, y, r);
        ld.addColorStop(0, LD0); ld.addColorStop(1, LD1);
        ctx.fillStyle = ld; ctx.fillRect(...bbox(p));
        crescent(x, y, r, 0.2, SH1);
        crescent(x, y, r, 0.56, SH2);
        ctx.restore();
        if (r > 6) rimLight(x, y, r, RL, 0.03);
      };
    }

    // ---- star (the Sun): glow, prominences, granulation, spots; a single pixel when it gets that small ----
    const SPOTS0 = [[0.3, 0.2, 0.05], [0.36, 0.25, 0.028], [-0.34, -0.24, 0.042], [0.06, 0.46, 0.03]];
    const PROMS0 = [[-2.5, 0.16, 0.13], [0.35, 0.11, 0.09], [1.95, 0.13, 0.11], [-0.9, 0.1, 0.07]];
    function makeStar(lk, n) {
      const GRAN = [];
      for (let i = 0; i < 150; i++) { const rr = Math.sqrt(S.rand()) * 0.95, a = S.rnd(0, TAU); GRAN.push([Math.cos(a) * rr, Math.sin(a) * rr, S.rnd(0.014, 0.032), S.rnd(0, 40)]); }
      // later stars mirror the showcase layout; prominences flip top-to-bottom so they keep clear of the left limb,
      // the side a star shows while it edges into frame as the next giant
      const mu = n % 2 ? -1 : 1;
      const SPOTS = SPOTS0.map(([u, v, s]) => [mu * u, v, s]), PROMS = PROMS0.map(([a, h, w]) => [mu * a, h, w]);
      const GLW = rgbS(lk.glow), HAL = rgbS(lk.halo), PR0 = hexA(lk.glow, 0.28), PR1 = lk.prominence ? hexA(lk.prominence, 0.95) : '';
      const GRN = rgbS(lk.granules || lk.disk[0]), RIM = rgbS(lk.rim || lk.disk[1]), gs = lk.glowSize == null ? 1 : +lk.glowSize;
      return (p, t, fx, i) => {
        const { x, y, r } = p;
        const boost = 1 + 0.06 * S.noise(t * 2.3, 5 + 13 * n) + (fx.boost[i] || 0);
        if (!visible(p, Math.min(r * 2.4 * gs, 900))) return;
        if (r < 1.2) {                                  // the payoff pixel
          ctx.fillStyle = lk.pixel || lk.disk[0]; ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
          return;
        }
        glowRing(x, y, r, Math.min(r * 2.4 * gs, 900), GLW, 0.15 * boost);
        glowRing(x, y, r, Math.min(r * 0.9 * gs, 460) + 18 * clamp((r - 1.2) / 5), HAL, 0.55 * boost);   // stays a beacon as it recedes
        if (r > 20 && lk.prominence) {                  // prominences sit behind the disk edge
          ctx.lineCap = 'round';
          for (const [a, h, w] of PROMS) {
            const a0 = a - w, a1 = a + w, am = a + 0.25 * Math.sin(t * 0.7 + a);
            ctx.beginPath(); ctx.moveTo(x + Math.cos(a0) * r * 0.97, y + Math.sin(a0) * r * 0.97);
            ctx.quadraticCurveTo(x + Math.cos(am) * r * (1 + h * 2.1), y + Math.sin(am) * r * (1 + h * 2.1), x + Math.cos(a1) * r * 0.97, y + Math.sin(a1) * r * 0.97);
            ctx.strokeStyle = PR0; ctx.lineWidth = Math.max(2, r * 0.07); ctx.stroke();
            ctx.strokeStyle = PR1; ctx.lineWidth = Math.max(1, r * 0.03); ctx.stroke();
          }
        }
        ctx.save(); diskPath(x, y, r); ctx.clip();
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, lk.disk[0]); g.addColorStop(0.5, lk.disk[1]); g.addColorStop(0.86, lk.disk[2]); g.addColorStop(1, lk.disk[3]);
        ctx.fillStyle = g; ctx.fillRect(...bbox(p));
        if (r > 40) {
          const gk = 1 - sm((r - 500) / 500);           // granulation only reads at framing size
          if (gk > 0.01 && lk.granules) for (const [u, v, s, k] of GRAN) {
            const dd = u * u + v * v, a = gk * (0.07 + 0.1 * (0.5 + 0.5 * S.noise(t * 0.9 + k, 21))) * (1 - dd * 0.6);
            ctx.fillStyle = `rgba(${GRN},${a.toFixed(3)})`;
            ctx.beginPath(); ctx.arc(x + u * r, y + v * r, s * r * (1 - dd * 0.35), 0, TAU); ctx.fill();
          }
          if (lk.spots) for (const [u, v, s] of SPOTS) {
            const dd = Math.hypot(u, v), fs = Math.sqrt(Math.max(0.1, 1 - dd * dd));
            ctx.save(); ctx.translate(x + u * r, y + v * r); ctx.rotate(Math.atan2(v, u)); ctx.scale(fs, 1);
            ctx.fillStyle = lk.spots[0]; ctx.beginPath(); ctx.arc(0, 0, s * r, 0, TAU); ctx.fill();
            ctx.fillStyle = lk.spots[1]; ctx.beginPath(); ctx.arc(0, 0, s * r * 0.55, 0, TAU); ctx.fill();
            ctx.restore();
          }
        }
        ctx.restore();
        ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.strokeStyle = `rgba(${RIM},${0.5 * clamp(r / 20)})`; ctx.lineWidth = Math.max(1, r * 0.012); ctx.stroke();
      };
    }

    // ---- giant (Betelgeuse): a few giant convection cells, boiling slowly ----
    function makeGiant(lk, n) {
      const CELLS = [];
      const addCells = (cnt, rMax, s0, s1, light, alpha) => {
        for (let i = 0; i < cnt; i++) {
          const rr = Math.sqrt(S.rand()) * rMax, a = S.rnd(0, TAU);
          CELLS.push({ u: Math.cos(a) * rr, v: Math.sin(a) * rr, s: S.rnd(s0, s1), light, alpha, rot: S.rnd(0, Math.PI), ecc: S.rnd(1.05, 1.7), ph: S.rnd(0, TAU), sp: S.rnd(0.2, 0.5), k: CELLS.length * 7 + 3 + n * 97 });
        }
      };
      addCells(7, 0.64, 0.26, 0.44, false, 0.38);
      addCells(9, 0.62, 0.22, 0.4, true, 0.55);
      addCells(18, 0.9, 0.07, 0.14, true, 0.26);
      const GLW = rgbS(lk.glow), HAL = rgbS(lk.halo), CDK = rgbS(lk.cells[0]), CLT = rgbS(lk.cells[1]), LD0 = hexA(lk.limb, 0), LD1 = hexA(lk.limb, 0.5);
      return (p, t, fx, i) => {
        const { x, y, r } = p;
        const bl = 1 + (i === NB - 1 ? fx.bloom : 0) * 0.9;
        if (!visible(p, Math.min(r * 1.1, 900))) return;
        if (r < 1.2) return dot(p, lk.disk[1]);
        glowRing(x, y, r, Math.min(r * 1.1, 900), GLW, 0.13 * bl);
        glowRing(x, y, r, Math.min(r * 0.26, 320), HAL, 0.55 * bl);
        ctx.save(); diskPath(x, y, r); ctx.clip();
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, lk.disk[0]); g.addColorStop(0.45, lk.disk[1]); g.addColorStop(0.8, lk.disk[2]); g.addColorStop(1, lk.disk[3]);
        ctx.fillStyle = g; ctx.fillRect(...bbox(p));
        for (const c of CELLS) {
          const cx = x + (c.u + 0.03 * Math.sin(c.sp * t + c.ph)) * r, cy = y + (c.v + 0.03 * Math.cos(c.sp * 0.8 * t + c.ph)) * r;
          const cr = c.s * r * (1 + 0.07 * Math.sin(0.45 * t + c.ph * 2)), ext = cr * c.ecc;
          if (cx + ext < 0 || cx - ext > W || cy + ext < 0 || cy - ext > H) continue;
          const a = c.alpha * (0.7 + 0.3 * S.noise(t * 0.55 + c.k, 31));
          const rgb = c.light ? CLT : CDK;
          ctx.save(); ctx.translate(cx, cy); ctx.rotate(c.rot + 0.05 * Math.sin(0.3 * t + c.ph)); ctx.scale(c.ecc, 1);
          const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, cr);
          cg.addColorStop(0, `rgba(${rgb},${a.toFixed(3)})`); cg.addColorStop(0.5, `rgba(${rgb},${(a * 0.6).toFixed(3)})`); cg.addColorStop(1, `rgba(${rgb},0)`);
          ctx.fillStyle = cg; ctx.fillRect(-cr, -cr, 2 * cr, 2 * cr);
          ctx.restore();
        }
        const ld = ctx.createRadialGradient(x, y, r * 0.5, x, y, r);
        ld.addColorStop(0, LD0); ld.addColorStop(1, LD1);
        ctx.fillStyle = ld; ctx.fillRect(...bbox(p));
        ctx.restore();
      };
    }

    // every body gets its renderer in list order (the seeded layouts are drawn in that order too)
    const RENDER = { rocky: makeRocky, earth: makeEarth, gas: makeGas, star: makeStar, giant: makeGiant };
    const seen = {};
    B.forEach((b) => {
      let lk = resolveLook(b.look || 'moon', 0);
      if (b.tint) lk = recolor(lk, b.tint);
      if (!RENDER[lk.type]) lk.type = 'rocky';
      b.lk = lk;
      b.draw = RENDER[lk.type](lk, (seen[lk.type] = (seen[lk.type] || 0) + 1) - 1);
    });

    // ---- "swap it for the Sun": orbits drawn inside the giant at true scale (only the ones that fit) ----
    const AU_R = GIANT.R / 1.495978707e8;           // the giant's radius in AU
    // up to 4 orbits (the outermost that fit); with more than two they start earlier so the last lands on time
    const ORB = (P.orbits || []).filter((o) => o && o.au > 0 && o.au < AU_R).sort((a, b) => a.au - b.au).slice(-4)
      .map((o) => ({ name: o.name, label: o.label, au: o.au, col: o.color ? rgbS(o.color) : '255,255,255', lab: o.color || INK }));
    const OFF = Math.max(0, ORB.length - 2), GRP = GIANT.R * view(8.3 + D).z;       // the giant's radius in px as they land
    ORB.forEach((o, i) => {
      o.t0 = 8.05 + D + 0.1 * (i - OFF); o.tl = 8.3 + D + 0.1 * (i - OFF);
      let k = i;                                    // a label moves out past rings packed tighter than a label's height
      while (k + 1 < ORB.length && ((ORB[k + 1].au - ORB[k].au) / AU_R) * GRP < 44) k++;
      o.outer = k;
    });
    const MARK = rgbS(C.marker);
    function drawOrbits(p, t) {
      for (const o of ORB) {
        const q = sm((t - o.t0) / 0.5);
        if (q <= 0) continue;
        const rr = (o.au / AU_R) * p.r, a0 = -Math.PI / 2;
        ctx.setLineDash([7, 9]); ctx.lineDashOffset = -t * 14;
        ctx.strokeStyle = `rgba(${o.col},0.92)`; ctx.lineWidth = 2.6;
        ctx.beginPath(); ctx.arc(p.x, p.y, rr, a0, a0 + TAU * q); ctx.stroke();
        ctx.setLineDash([]);
      }
      if (!ORB.length) return;
      const q = sm((t - (8.05 + D)) / 0.3);
      if (q > 0) {                                   // where the Sun would sit: a crosshair, not a body
        ctx.strokeStyle = `rgba(${MARK},${0.9 * q})`; ctx.lineWidth = 2; ctx.lineCap = 'butt';
        ctx.beginPath(); ctx.moveTo(p.x - 9, p.y); ctx.lineTo(p.x - 3, p.y); ctx.moveTo(p.x + 3, p.y); ctx.lineTo(p.x + 9, p.y);
        ctx.moveTo(p.x, p.y - 9); ctx.lineTo(p.x, p.y - 3); ctx.moveTo(p.x, p.y + 3); ctx.lineTo(p.x, p.y + 9); ctx.stroke();
      }
    }

    // ---- transient light: a star's flare as it arrives, the giant's bloom on the reveal ----
    const FLARES = [];
    MID.forEach((m, k) => {
      const b = FR[k + 1], fl = b.lk.flare;
      if (b.lk.type === 'star' && fl) FLARES.push({ b, t: m.t1 - 0.15, e0: hexA(fl[0], 0), c0: rgbS(fl[1]), e1: hexA(fl[2], 0), c1: rgbS(fl[3]) });
    });
    function fxAt(t) {
      const u2 = t - T_HIT, out = { boost: {}, flare: {}, bloom: u2 > 0 ? Math.exp(-u2 * 2.8) * clamp(u2 / 0.03) : 0 };
      for (const f of FLARES) {
        const u1 = t - f.t;
        out.boost[f.b.i] = u1 > 0 ? 0.55 * Math.exp(-u1 * 2.4) * clamp(u1 / 0.06) : 0;
        out.flare[f.b.i] = u1 > 0 ? Math.exp(-u1 * 2.1) * clamp(u1 / 0.08) : 0;
      }
      return out;
    }
    function drawFlare(p, f, F) {
      if (f < 0.01 || !visible(p, 900)) return;
      const len = Math.min(1500, Math.max(600, p.r * 4)), g = ctx.createLinearGradient(p.x - len, 0, p.x + len, 0);
      g.addColorStop(0, F.e0); g.addColorStop(0.5, `rgba(${F.c0},${0.85 * f})`); g.addColorStop(1, F.e0);
      ctx.fillStyle = g; ctx.fillRect(p.x - len, p.y - 2, 2 * len, 4);
      const g2 = ctx.createLinearGradient(p.x - len * 0.7, 0, p.x + len * 0.7, 0);
      g2.addColorStop(0, F.e1); g2.addColorStop(0.5, `rgba(${F.c1},${0.22 * f})`); g2.addColorStop(1, F.e1);
      ctx.fillStyle = g2; ctx.fillRect(p.x - len * 0.7, p.y - 22, 1.4 * len, 44);
    }
    const GL = GIANT.lk, BLM = GL.bloom || [GL.glow || GL.dot || '#FFFFFF', GL.glow || GL.dot || '#FFFFFF'];
    const BLM0 = rgbS(BLM[0]), BLM1 = hexA(BLM[1], 0);
    const PLATE = rgbS(GL.plate || mixHex(GL.limb || (GL.disk && GL.disk[3]) || GL.dot || '#333333', '#000000', 0.6));

    /* ======================= HUD (screen space, tracks the bodies) ======================= */
    const PER = +U.perKm || 1, UNIT = U.name || 'km', MIL = U.million || 'million', BIL = U.billion || 'billion';
    const sig1 = (v) => +v.toPrecision(1), sig2 = (v) => +v.toPrecision(2);
    const numS = (v) => (v >= 1000 ? S.fmt(v) : String(v));
    function sizeText(b) {                         // "3,474 km", "1.39 million km", "~1 billion km" (approx = 1 figure)
      const v = b.km * PER, ap = !!b.approx, pre = ap ? '~' : '';
      if (v >= 1e9) return pre + (ap ? String(sig1(v / 1e9)) : (v / 1e9).toFixed(2)) + ` ${BIL} ${UNIT}`;
      if (v >= 1e6) return pre + (ap ? String(sig1(v / 1e6)) : (v / 1e6).toFixed(2)) + ` ${MIL} ${UNIT}`;
      return pre + S.fmt(ap ? sig1(v) : Math.round(v)) + ` ${UNIT}`;
    }
    const ratioText = (r, ap) => (ap ? '~' + numS(sig2(r)) : r < 1 ? String(sig2(r)) : r < 10 ? String(+r.toFixed(1)) : S.fmt(Math.round(r))) + '×';
    const chipText = (b) => { const vs = byId[b.vs] || FIRST; return fill(b.chip || '', { ratio: ratioText(b.km / vs.km, !!(b.approx || vs.approx)) }); };
    const approx = '<svg viewBox="0 0 24 24" style="display:inline-block;width:.74em;height:.74em;margin:0 .16em;vertical-align:-.02em;overflow:visible"><path d="M2.5 8.6c3.2-3.4 6.3-.2 9.5-.2s6.3-3.2 9.5 0M2.5 16c3.2-3.4 6.3-.2 9.5-.2s6.3-3.2 9.5 0" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/></svg>';
    function mkLabel(b, o) {
      const col = b.color, chip = chipText(b);
      const wrap = S.el('div', { style: 'position:absolute;left:0;top:0;width:0;height:0;will-change:transform;' }, S.hud);
      const lead = S.el('div', { style: `position:absolute;left:-1px;top:0;width:2px;height:0;background:linear-gradient(${hexA(col, 0.1)},${hexA(col, 0.75)});transform-origin:50% 100%;` }, wrap);
      const box = S.el('div', { style: 'position:absolute;left:0;top:0;transform:translateX(-50%);' }, wrap);
      const inner = S.el('div', { style: 'display:flex;flex-direction:column;align-items:center;white-space:nowrap;' }, box);
      const nm = S.el('div', { text: b.name, style: `font:800 ${o.size || 54}px/1 "Archivo",sans-serif;font-stretch:118%;letter-spacing:.07em;color:${INK};text-shadow:0 3px 24px rgba(${SHD},.85);` }, inner);
      fitWidth(nm, 720);
      const row = S.el('div', { style: 'margin-top:12px;display:flex;align-items:center;gap:14px;' }, inner);
      S.el('span', { text: sizeText(b), style: `font:600 27px "JetBrains Mono",monospace;color:${MUTED};text-shadow:0 2px 12px rgba(${SHD},.9);` }, row);
      if (chip) S.el('span', { html: esc(chip), style: `padding:5px 15px 4px;border-radius:999px;border:2px solid ${col};background:${hexA(col, 0.13)};font:700 24px "JetBrains Mono",monospace;color:${col};` }, row);
      tl.fromTo(inner, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.55, ease: 'expo.out' }, o.t);
      tl.fromTo(lead, { scaleY: 0 }, { scaleY: 1, duration: 0.45, ease: 'power3.out' }, o.t - 0.05);
      return Object.assign({ i: b.i, wrap, lead, fade: o.fade, base: o.base || (() => 0) }, o);
    }
    // label roles: the pair in the opening frame share a baseline; middle bodies land with their framing; the giant last.
    // A middle body whose next neighbour is under ~4.5× bigger stays large after the camera moves on, so its label
    // also fades on time as the next zoom starts.
    const midLabel = (b, i) => {
      const o = { t: MID[i - 2].lab, fade: [150, 240] }, leave = i < NB - 2 ? MID[i - 1].t0 : FS;
      if (B[i + 1].R / b.R < 4.5) o.out = [leave + 0.2, leave + 0.5];
      return o;
    };
    const LABELS = B.map((b, i) => mkLabel(b, i === 0 ? { t: 0.42, fade: [40, 70], out: [1.42, 1.64], shared: true }
      : i === 1 ? { t: 0.56, fade: [100, 170], out: [1.5, 1.78], shared: true }
      : i === NB - 1 ? { t: T_HIT + 0.12, size: 60 }
      : midLabel(b, i)));
    function mkTag(b, dir, win) {
      const wrap = S.el('div', { style: 'position:absolute;left:0;top:0;width:0;height:0;opacity:0;' }, S.hud);
      S.el('div', { style: `position:absolute;left:-1px;${dir < 0 ? 'bottom:0' : 'top:0'};width:2px;height:20px;background:${hexA(INK, 0.55)};` }, wrap);
      S.el('div', { text: b.tag || b.name, style: `position:absolute;left:0;${dir < 0 ? 'bottom:28px' : 'top:28px'};transform:translateX(-50%);font:700 23px/1 "Archivo",sans-serif;font-stretch:112%;letter-spacing:.16em;color:${INK};white-space:nowrap;text-shadow:0 2px 12px rgba(${SHD},.95);` }, wrap);
      return { i: b.i, wrap, dir, win };
    }
    // small tags follow each body once it has shrunk (px diameter window [lo, hi]); they alternate above and below
    const TAGS = B.slice(0, NB - 1).map((b, i) => mkTag(b, i % 2 ? 1 : -1, i === NB - 2 ? [3, 170] : i === 0 ? [6, 55] : i === 1 ? [3, 120] : [12, 160]));

    // header (question) and the closing line (answer) share the top-left
    const head = S.el('div', { style: 'position:absolute;left:120px;top:96px;' }, S.hud);
    const eyebrow = S.el('div', { text: P.eyebrow, style: `font:700 24px "JetBrains Mono",monospace;letter-spacing:.26em;color:${GOLD};` }, head);
    const h1 = S.el('div', { text: P.headline, style: `margin-top:14px;font:800 86px/1.02 "Archivo",sans-serif;font-stretch:112%;letter-spacing:-.01em;color:${INK};white-space:nowrap;text-shadow:0 4px 30px rgba(${SHD},.7);` }, head);
    fitWidth(h1, 1560);
    tl.from(eyebrow, { x: -36, opacity: 0, duration: 0.55, ease: 'expo.out' }, 0.06);
    const hw = S.split(h1, 'words', { mask: 'words' });
    tl.from(hw.words, { yPercent: 110, duration: 0.65, ease: 'expo.out', stagger: 0.055 }, 0.14);
    tl.to(hw.words, { yPercent: -110, duration: 0.38, ease: 'power3.in', stagger: 0.03 }, 1.22);
    tl.to(eyebrow, { opacity: 0, x: -20, duration: 0.3, ease: 'power2.in' }, 1.3);
    tl.to(head, { opacity: 0, duration: 0.2 }, 1.52);           // also clears the masked words' shadows

    // closing line: \n breaks the line, *…* is highlighted, {orbit} = the outermost orbit that fits inside the giant
    const closing = String(P.closing || ''), orbitName = ORB.length ? ORB[ORB.length - 1].name : '';
    let fin = null;
    if (closing && (orbitName || !/\{orbit\}/.test(closing))) {
      const html = esc(fill(closing, { orbit: orbitName })).replace(/\*([^*]+)\*/g, `<span style="color:${GOLD}">$1</span>`).replace(/\n/g, '<br>');
      fin = S.el('div', { html, style: `position:absolute;left:120px;top:112px;font:800 58px/1.12 "Archivo",sans-serif;font-stretch:108%;color:${INK};white-space:nowrap;text-shadow:0 4px 30px rgba(${SHD},.8);` }, S.hud);
      fitWidth(fin, 830);
      const fl = S.split(fin, 'lines', { mask: 'lines' });
      tl.from(fl.lines, { yPercent: 105, duration: 0.7, ease: 'expo.out', stagger: 0.12 }, 7.92 + D);
    }

    // the payoff callout: ring on the (now tiny) callout body, arrow, and a footnote about a second body.
    // `callout: null` drops it; the footnote rides in the same box.
    const CO = P.callout || null, CW = CO || {}, FN = P.footnote;
    const CB = byId[CW.body] || ANCHOR;
    const dAt = (b, t) => 2 * b.R * view(t).z;            // on-screen diameter in px
    const FRACS = [[0.5, '½'], [1 / 3, '⅓'], [0.25, '¼'], [0.2, '⅕'], [0.1, '⅒']];
    const pxWords = (d) => {
      if (d >= 1.5) return fill(CW.many || '{n} pixels', { n: S.fmt(Math.round(d)) });
      if (d >= 0.75) return CW.one || '1 pixel';
      let best = FRACS[0];
      for (const f of FRACS) if (Math.abs(Math.log(d / f[0])) < Math.abs(Math.log(d / best[0]))) best = f;
      return fill(CW.part || '{n} pixel', { n: best[1] });
    };
    const dCB = dAt(CB, 7.2 + D), RR = Math.max(17, dCB / 2 + 10), DX = RR - 17;
    let callG = null, callT = null, c2 = null;
    if (CO) {
      const hs = S.svg(S.hud);
      callG = S.s('g', {}, hs);
      const ring = S.s('circle', { cx: 0, cy: 0, r: RR, fill: 'none', stroke: GOLD, 'stroke-width': 3 }, callG);
      const ring2 = S.s('circle', { cx: 0, cy: 0, r: RR, fill: 'none', stroke: GOLD, 'stroke-width': 2, opacity: 0 }, callG);
      const arrow = S.s('path', { d: `M ${-168 - DX} 10 Q ${-96 - DX} -30 ${-27 - DX} -6`, fill: 'none', stroke: INK, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, callG);
      const head2 = S.s('path', { d: `M ${-45 - DX} -19 L ${-26 - DX} -6 L ${-47 - DX} 2`, fill: 'none', stroke: INK, 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, callG);
      tl.fromTo(ring, { scale: 0, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2.4)' }, 7.12 + D);
      tl.fromTo(ring2, { attr: { r: RR }, opacity: 0.9 }, { attr: { r: RR + 43 }, opacity: 0, duration: 0.8, ease: 'expo.out', immediateRender: false }, 7.12 + D);
      S.draw(arrow, 7.2 + D, 0.42, { ease: 'power2.out' });
      tl.from(head2, { opacity: 0, scale: 0.4, transformOrigin: '100% 50%', duration: 0.25, ease: 'back.out(3)' }, 7.56 + D);
      callT = S.el('div', { style: 'position:absolute;left:0;top:0;width:0;height:0;' }, S.hud);
      const cBox = S.el('div', { style: 'position:absolute;right:0;top:0;transform:translateY(-50%);text-align:right;white-space:nowrap;' }, callT);
      const c1 = S.el('div', { html: `<span style="color:${CB.color}">${esc(CW.label || '')}</span>${approx}${esc(pxWords(dCB))}`, style: `font:800 55px/1 "Archivo",sans-serif;font-stretch:106%;color:${INK};text-shadow:0 4px 26px rgba(${SHD},.9);` }, cBox);
      if (FN && FN.label) {
        const NBd = byId[FN.body] || FIRST, dN = dAt(NBd, 7.2 + D);
        c2 = S.el('div', { html: `<span style="color:${NBd.color}">${esc(FN.label)}</span> ${esc(dN < 0.1 ? FN.text || '' : pxWords(dN))}`, style: `margin-top:14px;font:600 32px "Archivo",sans-serif;color:${MUTED};text-shadow:0 3px 18px rgba(${SHD},.9);` }, cBox);
      }
      const V7 = view(7.32 + D), cRoom = V7.ox + CB.x * V7.z - 186 - DX - 96;       // keep the callout inside the left safe edge
      if (cBox.scrollWidth > cRoom) { const k = Math.max(0.45, cRoom / cBox.scrollWidth); c1.style.fontSize = 55 * k + 'px'; if (c2) c2.style.fontSize = 32 * k + 'px'; }
      tl.from(c1, { x: -40, opacity: 0, duration: 0.55, ease: 'expo.out' }, 7.32 + D);
      if (c2) tl.from(c2, { x: -30, opacity: 0, duration: 0.5, ease: 'expo.out' }, 7.66 + D);
    }

    // orbit labels
    const oLab = ORB.map((o) => S.el('div', { text: o.label, style: `position:absolute;left:0;top:0;transform:translate(-50%,-100%);padding:4px 10px 3px;border-radius:6px;background:rgba(${PLATE},.62);font:700 22px "JetBrains Mono",monospace;letter-spacing:.12em;color:${o.lab};white-space:nowrap;opacity:0;` }, S.hud));
    oLab.forEach((el, i) => tl.to(el, { opacity: 1, duration: 0.35 }, ORB[i].tl));

    // live scale readout, bottom-left: km per pixel on a log ruler
    const RO = P.readout || {};
    const sc = S.el('div', { style: 'position:absolute;left:120px;top:866px;' }, S.hud);
    S.el('div', { text: RO.label, style: `font:700 22px "JetBrains Mono",monospace;letter-spacing:.3em;color:${DIM};` }, sc);
    const scRow = S.el('div', { style: `margin-top:6px;font:700 34px "JetBrains Mono",monospace;color:${INK};white-space:nowrap;` }, sc);
    S.el('span', { text: RO.prefix, style: `color:${MUTED};font-weight:500;` }, scRow);
    const scVal = S.el('span', { text: '' }, scRow);
    const ruler = S.el('div', { style: 'position:relative;margin-top:14px;width:420px;height:14px;' }, sc);
    S.el('div', { style: `position:absolute;left:0;top:6px;width:420px;height:2px;background:${hexA(MUTED, 0.35)};` }, ruler);
    for (let k = 0; k <= 6; k++) S.el('div', { style: `position:absolute;left:${k * 70 - 1}px;top:${k % 3 ? 3 : 0}px;width:2px;height:${k % 3 ? 8 : 14}px;background:${hexA(MUTED, k % 3 ? 0.45 : 0.8)};` }, ruler);
    const rFill = S.el('div', { style: `position:absolute;left:0;top:5px;width:420px;height:4px;background:linear-gradient(90deg,${hexA(GOLD, 0.2)},${GOLD});transform-origin:0 50%;` }, ruler);
    const rDot = S.el('div', { style: `position:absolute;left:-7px;top:0;width:14px;height:14px;border-radius:50%;background:${GOLD};box-shadow:0 0 14px ${GOLD};` }, ruler);
    tl.from(sc, { opacity: 0, y: 16, duration: 0.6, ease: 'expo.out' }, 0.7);
    const sig3 = (v) => { const q = Math.pow(10, Math.floor(Math.log10(v)) - 2); return Math.round(v / q) * q; };
    const fmtKm = (v) => (v >= 1e9 ? (v / 1e9).toFixed(2) + ` ${BIL} ${UNIT}` : v >= 1e6 ? (v / 1e6).toFixed(2) + ` ${MIL} ${UNIT}` : S.fmt(sig3(v)) + ` ${UNIT}`);
    // the ruler spans the whole decades the piece travels through (10 to 10 million km per px by default)
    const RLO = Math.floor(Math.log10(PER / view(0).z)), RHI = Math.max(RLO + 1, Math.ceil(Math.log10(PER / view(DUR).z)));

    let lastSc = '';
    function hud(t, V, POS) {
      for (const L of LABELS) {
        const p = POS[L.i], d = 2 * p.r;
        const a = (L.fade ? sm((d - L.fade[0]) / (L.fade[1] - L.fade[0])) : 1) * (L.out ? 1 - sm((t - L.out[0]) / (L.out[1] - L.out[0])) : 1);
        L.wrap.style.opacity = a.toFixed(3);
        if (a <= 0.001) continue;
        const ay = V.y + Math.max(L.shared ? POS[1].r : p.r, 150) + 28;
        L.wrap.style.transform = `translate(${p.x.toFixed(1)}px,${ay.toFixed(1)}px)`;
        const lh = ay - (p.y + p.r) - 22;
        if (lh > 26) { L.lead.style.display = ''; L.lead.style.top = `${(-lh - 8).toFixed(1)}px`; L.lead.style.height = `${lh.toFixed(1)}px`; }
        else L.lead.style.display = 'none';
      }
      const ta = TAGS.map((T) => {
        const p = POS[T.i], d = 2 * p.r, [lo, hi] = T.win;
        let a = sm((d - lo) / Math.max(1, lo)) * (1 - sm((d - hi * 0.7) / (hi * 0.3)));
        a *= 1 - sm((t - (6.3 + D)) / 0.35);          // tags clear before the payoff callout
        if (p.x < -200 || p.x > W + 200) a = 0;
        return a;
      });
      // two visible tags on the same side that crowd each other: the smaller body's tag gives way
      for (let j = 0; j < TAGS.length; j++) for (let k = j + 1; k < TAGS.length; k++) {
        if (TAGS[j].dir !== TAGS[k].dir || ta[j] <= 0.001 || ta[k] <= 0.001) continue;
        ta[j] *= sm((Math.abs(POS[TAGS[j].i].x - POS[TAGS[k].i].x) - 120) / 60);
      }
      TAGS.forEach((T, j) => {
        const p = POS[T.i], a = ta[j];
        T.wrap.style.opacity = a.toFixed(3);
        if (a > 0.001) T.wrap.style.transform = `translate(${p.x.toFixed(1)}px,${(p.y + T.dir * (p.r + 8)).toFixed(1)}px)`;
      });
      if (callG) {
        const s = POS[CB.i];
        callG.setAttribute('transform', `translate(${(Math.floor(s.x) + 0.5).toFixed(1)},${(Math.floor(s.y) + 0.5).toFixed(1)})`);
        callT.style.transform = `translate(${(s.x - 186 - DX).toFixed(1)}px,${(s.y + 4).toFixed(1)}px)`;
      }
      const b = POS[NB - 1];
      const prevY = [-Infinity, Infinity];
      ORB.forEach((o, i) => {          // labels alternate: under the ring, on top of the next one, and stack if they meet
        const side = i % 2, rr = (ORB[o.outer].au / AU_R) * b.r, lim = side ? prevY[1] - 34 : prevY[0] + 34;
        let y = side ? b.y - rr - 10 : b.y + rr + 10;
        if (side ? y > lim : y < lim) y = lim;
        prevY[side] = y;
        oLab[i].style.transform = side ? `translate(-50%,-100%) translate(${b.x.toFixed(1)}px,${y.toFixed(1)}px)` : `translate(-50%,0) translate(${b.x.toFixed(1)}px,${y.toFixed(1)}px)`;
      });
      const kmpx = PER / V.z, str = fmtKm(kmpx);
      if (str !== lastSc) { scVal.textContent = str; lastSc = str; }
      const u = clamp((Math.log10(kmpx) - RLO) / (RHI - RLO));
      rFill.style.transform = `scaleX(${u.toFixed(4)})`; rDot.style.transform = `translateX(${(u * 420).toFixed(1)}px)`;
    }

    /* ======================= frame ======================= */
    S.onFrame((t) => {
      const V = view(t), fx = fxAt(t);
      ctx.clearRect(0, 0, W, H);
      drawSky(t, Math.log(V.z));
      drawDust(t, V);
      const POS = B.map((b) => ({ x: V.ox + b.x * V.z, y: V.y, r: b.R * V.z }));
      for (let i = NB - 1; i >= 0; i--) B[i].draw(POS[i], t, fx, i);     // biggest first, so small bodies sit on top
      drawOrbits(POS[NB - 1], t);
      for (const f of FLARES) drawFlare(POS[f.b.i], fx.flare[f.b.i], f);
      if (fx.bloom > 0.01) {                              // exposure bloom on the reveal
        const G = POS[NB - 1], g = ctx.createRadialGradient(G.x, G.y, G.r * 0.5, G.x, G.y, G.r * 2.4);
        g.addColorStop(0, `rgba(${BLM0},${0.3 * fx.bloom})`); g.addColorStop(1, BLM1);
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }
      hud(t, V, POS);
    });

    /* ======================= sound ======================= */
    S.sfx(0, 'pad', { dur: DUR, gain: 0.075, notes: P.padNotes, attack: 1.4, release: 2.2, cutoff: 1800 });
    S.sfx(0, 'drone', { dur: DUR, gain: 0.05, freq: P.droneHz, cutoff: 320, air: 0.7, airFreq: 1600 });
    S.sfx(0, 'whoosh', { dur: 0.9, from: 2600, to: 500, gain: 0.26 });
    S.sfx(0.08, 'tick', { gain: 0.2 });
    S.sfx(0.42, 'pop', { pitch: 1.35, gain: 0.22 });
    S.sfx(0.56, 'pop', { pitch: 1.05, gain: 0.26 });
    S.sfx(0.72, 'blip', { pitch: 0.9, gain: 0.12 });
    MID.forEach((m, k) => {                              // each framing: whoosh out, its label pops, it lands
      S.sfx(m.t0, 'whoosh', { dur: m.wh.dur, from: m.wh.from, to: m.wh.to, gain: m.wh.gain });
      S.sfx(m.lab, 'pop', { pitch: m.pop, gain: 0.26 });
      if (FR[k + 1].lk.type === 'star') S.sfx(m.t1 - 0.15, 'shimmer', { gain: 0.24 });      // with the flare
      else S.sfx(m.t1 - 0.02, 'thud', { gain: 0.2, pitch: 0.9 });
    });
    S.sfx(FS, 'whoosh', { dur: 2.3, from: 1500, to: 200, gain: 0.52 });
    S.sfx(4.95 + D, 'riser', { dur: T_HIT - (4.95 + D), gain: 0.2 });
    S.sfx(T_HIT, 'braam', { gain: 0.5, dur: 2.6, freq: 49 });
    S.sfx(T_HIT, 'boom', { gain: 0.6 });
    S.sfx(T_HIT + 0.12, 'pop', { pitch: 0.65, gain: 0.24 });
    if (CO) {                                            // ring, arrow, callout text
      S.sfx(7.12 + D, 'blip', { pitch: 1.8, gain: 0.2 });
      S.sfx(7.2 + D, 'swoosh', { gain: 0.22 });
      S.sfx(7.34 + D, 'pop', { pitch: 1.2, gain: 0.26 });
    }
    if (c2) S.sfx(7.66 + D, 'tick', { gain: 0.22, pitch: 0.9 });
    if (fin) S.sfx(7.92 + D, 'whoosh', { dur: 0.5, from: 700, to: 3200, gain: 0.24 });
    if (ORB.length) S.sfx(8.08 + D, 'shimmer', { gain: 0.14, pitch: 0.8 });
    S.shake(T_HIT, { amp: 9, dur: 0.8, freq: 18, rot: 0.25 });
    // a tick each time the scale crosses a power of ten (100 km/px ... 1 million km/px)
    let prevL = Math.log10(1 / view(0).z);
    for (let i = 1; i <= Math.round(DUR * 240); i++) {
      const tt = i / 240, Lg = Math.log10(1 / view(tt).z);
      if (Math.floor(Lg) > Math.floor(prevL) && Math.abs(tt - T_HIT) > 0.15) S.sfx(tt, 'tick', { pitch: 0.75 + 0.14 * Math.floor(Lg), gain: 0.1 });
      prevL = Lg;
    }

    const title = (s) => String(s).toLowerCase().replace(/(^|[\s-])\S/g, (m) => m.toUpperCase());
    S.beat(0.14, `Open on a question; ${title(B[0].name)} and ${title(FIRST.name)} set the yardstick`);
    S.beat(1.4, 'Zooms pivot on the gap between bodies, so the eye never jumps');
    if (M > 0) S.beat(MID[0].t1 + 0.1, 'The next giant always edges into frame: a built-in cliffhanger');
    S.beat(FS, 'Longest zoom saved for last while the scale readout races');
    S.beat(T_HIT, 'Braam and boom hit the first frame the whole giant fits');
    if (CO) S.beat(7.2 + D, `Payoff made concrete: ${CW.label || title(CB.name)} is now ${dCB >= 0.75 && dCB < 1.5 ? 'a single pixel' : pxWords(dCB)}`);

    S.vignette({ strength: 0.5, inner: 55 });
    S.grain({ opacity: 0.045 });
  },
});
