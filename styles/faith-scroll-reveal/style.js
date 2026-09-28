/* Faith & Ancient History — Scroll Reveal (showcase: The Isaiah Scroll)
   A parchment (or papyrus) scroll unrolls between turning wooden rollers under a shaft of candle-warm light. The
   text inks in along its own reading direction, one line is gilded by a light sweep in reading order, its
   translation arrives word by word, and a timeline counts the years between two dates. Parchment, papyrus, wood
   grain and dust are procedural. Every word, date and colour comes from the params; the text auto-fits the scroll.
   Showcase: Isaiah 40:1–8 in Hebrew, right-to-left, 40:8 gilded, counting to the Aleppo Codex. */
Reel.style({
  id: 'faith-scroll-reveal', seed: 'scroll', order: 8,
  name: 'Scroll Reveal',
  transIn: { type: 'dip', dur: 0.6 },   // how a reel cuts INTO this piece (tools/new-reel.mjs); a reel item's trans overrides it
  niches: {
    primary: ['Faith & Bible history', 'Biblical archaeology', 'Ancient history'],
    similar: ['Classics & ancient literature', 'Jewish history & Torah', 'Church history & Latin texts', 'Mythology & epic poetry', 'Manuscript & book history', 'Historical documents & charters', 'Ancient philosophy quotes'],
  },
  niche: 'Faith & Ancient History', title: 'The Isaiah Scroll', duration: 8, poster: 7.6,
  bg: '#0D0906', palette: ['#E2B65C', '#E8D5AE', '#1A120B'],
  techniques: ['Unroll on turning wooden rollers', 'Right-to-left ink and gold sweep', 'Count-up timeline bracket'],
  why: 'The unroll is a reveal the viewer waits for, the gold sweep points at the one line that matters, and the count turns a date into a gap you can feel.',
  facts: 'Great Isaiah Scroll (1QIsaᵃ): found 1947 in Qumran Cave 1, dated c. 125 BC; Aleppo Codex c. 930 AD, so over 1,000 years older (about 1,054 years). Hebrew shown is the consonantal Masoretic text of Isaiah 40:1–8, not a transcription of the scroll’s own spelling; English of 40:8 as in the ESV.',
  defaults: {
    chip: 'DEAD SEA SCROLLS · FOUND 1947 · QUMRAN',
    dir: 'rtl',                        // reading direction of `lines`: 'rtl' or 'ltr' (ink, gold sweep and column order follow it)
    font: 'Frank Ruhl Libre, serif',   // CSS family list for the scroll text
    flow: true,                        // true: lines run on as justified text (like the scroll); false: one line per row (verse)
    columns: 2,                        // 1 or 2 text columns
    split: 4,                          // with 2 columns: how many lines fill the first column (in reading order)
    gild: 7,                           // index of the gilded line (0 = first, -1 = last); it always gets its own row
    lines: [
      'נחמו נחמו עמי יאמר אלהיכם',
      'דברו על לב ירושלם וקראו אליה כי מלאה צבאה כי נרצה עונה כי לקחה מיד יהוה כפלים בכל חטאתיה',
      'קול קורא במדבר פנו דרך יהוה ישרו בערבה מסלה לאלהינו',
      'כל גיא ינשא וכל הר וגבעה ישפלו והיה העקב למישור והרכסים לבקעה',
      'ונגלה כבוד יהוה וראו כל בשר יחדו כי פי יהוה דבר',
      'קול אמר קרא ואמר מה אקרא כל הבשר חציר וכל חסדו כציץ השדה',
      'יבש חציר נבל ציץ כי רוח יהוה נשבה בו אכן חציר העם',
      'יבש חציר נבל ציץ ודבר אלהינו יקום לעולם',
    ],
    translation: ['The grass withers, the flower fades,', 'but the word of our God will *stand forever.*'],   // rows; *words* are gold
    reference: 'ISAIAH 40:8',
    timeline: {
      from: { year: -125, date: 'c. 125 BC', label: 'Great Isaiah Scroll' },   // year: negative = BC (used for the count)
      to: { year: 930, date: 'c. 930 AD', label: 'Aleppo Codex' },
      roundTo: 1000,                   // the count rounds the gap down to a multiple of this and adds "+" (1 = exact)
      unit: 'YEARS OLDER',
    },
    material: 'parchment',             // 'parchment' (ruled, stitched seam) or 'papyrus' (fibre strips, glued joins)
    padNotes: [146.83, 220, 329.63, 369.99],
    droneNote: 73.42,
    pingNote: 587.3,                   // the gold sweep's ping (Hz); keep it in the pad's key
    colors: {
      gold: '#E2B65C', cream: '#EFE3C8', gilt: '#F3D08A', ink: '#2A170A', inkAlt: '#40281A',
      parchment: '#AA8656', parchmentLight: '#ECD0A2', bg: '#0D0906',
    },
  },
  build(S, P) {
    const tl = S.tl, C = P.colors, TLN = Object.assign({ from: {}, to: {} }, P.timeline);
    const GOLD = C.gold, CREAM = C.cream, INKC = '#2E1B0E';
    const f1 = (v) => (+v).toFixed(1);
    const hexRGB = (h) => { const n = parseInt(String(h).replace('#', ''), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
    const GOLDC = hexRGB(GOLD).join(','), BGC = hexRGB(C.bg).join(',');
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const fitWidth = (el, maxW) => { const w = el.scrollWidth; if (w > maxW) el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * maxW) / w + 'px'; };
    const canvasOf = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
    const h2 = (ix, iy, s) => S.ihash(Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(s + 1, 1274126177));
    const vn = (x, y, s) => {
      const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
      const a = h2(ix, iy, s), b = h2(ix + 1, iy, s), c = h2(ix, iy + 1, s), d = h2(ix + 1, iy + 1, s);
      const top = a + (b - a) * ux, bot = c + (d - c) * ux;
      return top + (bot - top) * uy;
    };
    const fbm = (x, y, s) => { let v = 0, a = 0.5, f = 1; for (let o = 0; o < 4; o++) { v += a * vn(x * f, y * f, s + o * 17); f *= 2; a *= 0.5; } return v / 0.9375; };
    const GENERIC = /^(serif|sans-serif|monospace|cursive|fantasy|system-ui)$/i;
    const FONT = String(P.font || 'serif').split(',').map((f) => f.trim().replace(/^["']+|["']+$/g, '')).filter(Boolean)
      .map((f) => (GENERIC.test(f) ? f : `"${f}"`)).join(',');

    /* ---------- text: columns in reading order, the gilded line on its own row, auto-fit to the scroll ---------- */
    const RTL = P.dir !== 'ltr', DIR = RTL ? 'rtl' : 'ltr', ALIGN = RTL ? 'right' : 'left';
    const V = (P.lines && P.lines.length ? P.lines : ['…']).map((s) => String(s).trim().replace(/\s+/g, ' ') || '…');
    const NL = V.length, GI = Math.floor(+P.gild || 0), KEYI = Math.min(NL - 1, Math.max(0, GI < 0 ? NL + GI : GI));
    const SLOTS = +P.columns === 1 ? [{ x0: 285, w: 1350 }] : RTL ? [{ x0: 1005, w: 630 }, { x0: 285, w: 630 }] : [{ x0: 285, w: 630 }, { x0: 1005, w: 630 }];
    const SPLIT = SLOTS.length === 1 ? NL : Math.min(NL, Math.max(1, Math.floor(+P.split || 1)));
    const FLOW = P.flow !== false, TY0 = 250, TYMAX = 640, FSMIN = 22;
    const mc = document.createElement('canvas').getContext('2d');
    let FS = 40, LH = 64, LINES, COLS, wid;
    for (;;) {                                   // shrink the text (never below FSMIN) until every column fits
      mc.font = `400 ${FS}px ${FONT}`;
      wid = (s) => mc.measureText(s).width;
      const maxRows = Math.floor((TYMAX - TY0) / LH), wrap = FS <= FSMIN;   // at the smallest size, long verse lines wrap
      let fits = true;
      LINES = []; COLS = [];
      SLOTS.forEach((slot, ci) => {
        const rows = [];
        let run = [];
        const breakLines = (words) => {
          const out = []; let cur = [];
          for (const w of words) { if (cur.length && wid(cur.concat(w).join(' ')) > slot.w) { out.push(cur); cur = [w]; } else cur.push(w); }
          if (cur.length) out.push(cur);
          return out;
        };
        const flush = () => { if (run.length) breakLines(run.join(' ').split(' ')).forEach((ws, i, a) => rows.push({ ws, last: i === a.length - 1 })); run = []; };
        for (let i = ci ? SPLIT : 0; i < (ci ? NL : SPLIT); i++) {
          if (i === KEYI) { flush(); rows.push({ ws: V[i].split(' '), last: true, key: true }); }
          else if (FLOW) run.push(V[i]);
          else if (wrap && wid(V[i]) > slot.w) breakLines(V[i].split(' ')).forEach((ws) => rows.push({ ws, last: true }));
          else rows.push({ ws: V[i].split(' '), last: true });
        }
        flush();
        rows.forEach((r) => { r.w = wid(r.ws.join(' ')); if (r.w > slot.w + 0.5) fits = false; });
        // a gilded line still too wide at the smallest size keeps one row and gets its own smaller size
        if (wrap) rows.forEach((r) => { if (r.key && r.w > slot.w) { r.fs = +((FS * slot.w) / r.w).toFixed(2); r.w = slot.w; } });
        if (rows.length > maxRows) fits = false;
        // verse sits as a block centred in its column; run-on text fills the column and is justified
        const bw = FLOW ? slot.w : Math.min(slot.w, Math.max(0, ...rows.map((r) => r.w)) + 2);
        const col = { x0: slot.x0 + (slot.w - bw) / 2, w: bw, n: rows.length };
        COLS.push(col);
        rows.forEach((r, i) => LINES.push(Object.assign(r, { col, row: i })));
      });
      if (fits || FS <= FSMIN) break;
      FS = Math.max(FSMIN, +(FS * 0.94).toFixed(2)); LH = +(FS * 1.6).toFixed(2);
    }
    // still too long at the smallest size: drop trailing rows of a full column (never the gilded one)
    const MAXROWS = Math.floor((TYMAX - TY0) / LH);
    for (const col of COLS) {
      let rows = LINES.filter((L) => L.col === col);
      while (rows.length > MAXROWS) { LINES.splice(LINES.indexOf(rows.filter((r) => !r.key).pop()), 1); rows = LINES.filter((L) => L.col === col); }
      rows.forEach((r, i) => (r.row = i));
    }
    const fm = mc.measureText(RTL ? 'בגד' : 'HNE'), fA = fm.fontBoundingBoxAscent || FS * 0.9, fD = fm.fontBoundingBoxDescent || FS * 0.3;
    const baseOff = (LH - (fA + fD)) / 2 + fA, capH = fm.actualBoundingBoxAscent || FS * 0.5;
    for (const L of LINES) {
      L.top = TY0 + L.row * LH; L.x0 = L.col.x0; L.cw = L.col.w;
      L.ws2 = L.last ? 0 : (L.cw - L.w) / Math.max(1, L.ws.length - 1);
      L.rule = L.top + baseOff - capH - 3;
    }
    const KEY = LINES.find((L) => L.key);
    const KX1 = RTL ? KEY.x0 + KEY.cw : KEY.x0 + KEY.w, KX0 = RTL ? KX1 - KEY.w : KEY.x0, KCX = (KX0 + KX1) / 2, KCY = KEY.top + LH / 2;

    /* ---------- parchment / papyrus texture (seeded, built once) ---------- */
    const PAPYRUS = P.material === 'papyrus';
    const PX0 = 175, PY0 = 190, PW = 1570, PH = 510;
    const PD = hexRGB(C.parchment), PL = hexRGB(C.parchmentLight);
    // papyrus: horizontal strips and long fibres of the recto, faint verso fibres, glued sheet joins. Its own RNG, so
    // the rest of the seeded layout (fibres, dust, glints) is identical on parchment and papyrus.
    const papyrusFibres = (x, w, h) => {
      const r = Reel.mulberry32(Reel.hashStr('papyrus')), R = (a, b) => a + (b - a) * r();
      for (let y = 0; y < h;) { const bh = R(4, 15); x.fillStyle = r() < 0.5 ? `rgba(98,66,28,${R(0.03, 0.1).toFixed(3)})` : `rgba(255,242,210,${R(0.04, 0.12).toFixed(3)})`; x.fillRect(0, y, w, bh); y += bh; }
      for (let i = 0; i < 220; i++) { x.fillStyle = `rgba(98,66,28,${R(0.015, 0.05).toFixed(3)})`; x.fillRect(R(0, w), 0, R(1, 5), h); }
      x.lineCap = 'round';
      for (let i = 0; i < 1500; i++) {
        const py = R(0, h), px = R(-200, w), L = R(80, 620);
        x.strokeStyle = r() < 0.58 ? `rgba(96,62,24,${R(0.05, 0.17).toFixed(3)})` : `rgba(255,246,220,${R(0.06, 0.2).toFixed(3)})`;
        x.lineWidth = R(0.5, 1.9);
        x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + L / 2, py + R(-1.6, 1.6), px + L, py + R(-1.2, 1.2)); x.stroke();
      }
      for (let sx = R(240, 400); sx < w - 140; sx += R(330, 440)) {
        const g = x.createLinearGradient(sx - 12, 0, sx + 16, 0);
        g.addColorStop(0, 'rgba(92,60,24,0)'); g.addColorStop(0.4, 'rgba(92,60,24,.13)'); g.addColorStop(1, 'rgba(92,60,24,.06)');
        x.fillStyle = g; x.fillRect(sx - 12, 0, 28, h);
        x.fillStyle = 'rgba(70,44,16,.24)'; x.fillRect(sx + 15, 0, 1.2, h);
      }
    };
    const PARCH_C = canvasOf(PW, PH, (x, w, h) => {
      const sw = Math.ceil(w / 5), sh = Math.ceil(h / 5);
      const small = canvasOf(sw, sh, (y) => {
        const im = y.createImageData(sw, sh), d = im.data;
        for (let j = 0; j < sh; j++) for (let i = 0; i < sw; i++) {
          const n = fbm(i / 22, j / 22, 3), n2 = fbm(i / 6, j / 6, 41);
          const v = S.clamp(0.18 + 0.95 * (n - 0.5) + 0.5 + 0.28 * (n2 - 0.5), 0, 1);
          const k = (j * sw + i) * 4;
          d[k] = PD[0] + (PL[0] - PD[0]) * v; d[k + 1] = PD[1] + (PL[1] - PD[1]) * v; d[k + 2] = PD[2] + (PL[2] - PD[2]) * v; d[k + 3] = 255;
        }
        y.putImageData(im, 0, 0);
      });
      x.imageSmoothingEnabled = true; x.drawImage(small, 0, 0, w, h);
      if (PAPYRUS) papyrusFibres(x, w, h);
      // fine grain
      const g = x.getImageData(0, 0, w, h), gd = g.data;
      for (let i = 0; i < gd.length; i += 4) { const e = (S.rand() - 0.5) * 16; gd[i] += e; gd[i + 1] += e; gd[i + 2] += e * 0.8; }
      x.putImageData(g, 0, 0);
      // fibres
      x.lineCap = 'round';
      for (let i = 0; i < 900; i++) {
        const px = S.rnd(0, w), py = S.rnd(0, h), L = S.rnd(6, 26), a = S.rnd(-0.5, 0.5) + (S.rand() < 0.5 ? 0 : Math.PI / 2);
        x.strokeStyle = S.rand() < 0.5 ? `rgba(110,74,36,${S.rnd(0.06, 0.16).toFixed(2)})` : `rgba(255,240,205,${S.rnd(0.08, 0.2).toFixed(2)})`;
        x.lineWidth = S.rnd(0.5, 1.3);
        x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a) * L * 0.5 + S.rnd(-3, 3), py + Math.sin(a) * L * 0.5 + S.rnd(-3, 3), px + Math.cos(a) * L, py + Math.sin(a) * L); x.stroke();
      }
      // stains and foxing
      for (let i = 0; i < 16; i++) {
        const px = S.rnd(0, w), py = S.rnd(0, h), r = S.rnd(30, 170);
        const rg = x.createRadialGradient(px, py, r * 0.2, px, py, r);
        rg.addColorStop(0, `rgba(96,60,24,${S.rnd(0.06, 0.16).toFixed(2)})`); rg.addColorStop(0.8, `rgba(96,60,24,${S.rnd(0.02, 0.07).toFixed(2)})`); rg.addColorStop(1, 'rgba(96,60,24,0)');
        x.fillStyle = rg; x.fillRect(px - r, py - r, 2 * r, 2 * r);
      }
      for (let i = 0; i < 520; i++) { x.fillStyle = `rgba(80,48,20,${S.rnd(0.1, 0.4).toFixed(2)})`; x.beginPath(); x.arc(S.rnd(0, w), S.rnd(0, h), S.rnd(0.4, 1.8), 0, 6.2832); x.fill(); }
      if (!PAPYRUS) {
        // dry-point ruling under the text, column margins (papyrus was never ruled: its fibres guide the pen)
        for (const L of LINES) {
          const xl = L.x0 - PX0, y = L.rule - PY0;
          x.fillStyle = 'rgba(92,60,28,.26)'; x.fillRect(xl - 8, y, L.cw + 16, 1);
          x.fillStyle = 'rgba(255,238,200,.2)'; x.fillRect(xl - 8, y + 1, L.cw + 16, 1);
        }
        for (const col of COLS) if (col.n) for (const cx of [col.x0 + col.w, col.x0]) { x.fillStyle = 'rgba(92,60,28,.12)'; x.fillRect(cx - PX0 + (cx % 2 ? 10 : -10), 40, 1, h - 80); }
        // sheet seam with stitches in the gutter
        if (SLOTS.length === 2) {
          const sx = 960 - PX0;
          x.fillStyle = 'rgba(70,42,18,.35)'; x.fillRect(sx - 1, 0, 2, h);
          x.fillStyle = 'rgba(255,236,200,.18)'; x.fillRect(sx + 1, 0, 1, h);
          for (let y = 22; y < h - 10; y += 28) { x.fillStyle = 'rgba(58,34,14,.5)'; x.fillRect(sx - 6, y, 12, 2.4); }
        }
      }
      // worm holes
      for (let i = 0; i < 7; i++) {
        const px = S.rnd(40, w - 40), py = S.rand() < 0.5 ? S.rnd(10, 60) : S.rnd(h - 60, h - 10), r = S.rnd(2.5, 6);
        x.fillStyle = 'rgba(40,22,8,.35)'; x.beginPath(); x.arc(px, py, r + 2.5, 0, 6.2832); x.fill();
        x.fillStyle = '#120A05'; x.beginPath(); x.ellipse(px, py, r, r * S.rnd(0.6, 1), S.rnd(0, 3), 0, 6.2832); x.fill();
      }
      // aged edges
      const eg = x.createLinearGradient(0, 0, 0, h);
      eg.addColorStop(0, 'rgba(70,40,14,.55)'); eg.addColorStop(0.07, 'rgba(70,40,14,0)'); eg.addColorStop(0.93, 'rgba(70,40,14,0)'); eg.addColorStop(1, 'rgba(70,40,14,.6)');
      x.fillStyle = eg; x.fillRect(0, 0, w, h);
    });
    const PARCH = PARCH_C.toDataURL('image/jpeg', 0.92);
    // wavy, worn top and bottom edges
    const edgePts = [];
    for (let xx = 0; xx <= PW; xx += 18) edgePts.push([xx, 3 + 5 * vn(xx / 60, 0.5, 7) + (S.rand() < 0.06 ? S.rnd(3, 9) : 0)]);
    for (let xx = PW; xx >= 0; xx -= 18) edgePts.push([xx, PH - 3 - 6 * vn(xx / 55, 3.5, 9) - (S.rand() < 0.06 ? S.rnd(3, 10) : 0)]);
    const PCLIP = `polygon(${edgePts.map(([a, b]) => `${f1(a)}px ${f1(b)}px`).join(',')})`;

    const SPARK = canvasOf(64, 64, (x) => {
      const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,236,200,1)'); g.addColorStop(0.25, 'rgba(255,214,150,.55)'); g.addColorStop(1, 'rgba(255,190,120,0)');
      x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    });

    /* ---------- world ---------- */
    S.root.style.background = C.bg;
    const glow = S.el('div', { style: 'position:absolute;left:-400px;top:-300px;width:2720px;height:1680px;background:radial-gradient(1000px 560px at 1360px 770px, rgba(150,88,34,.34), rgba(70,36,12,.14) 52%, rgba(0,0,0,0) 78%);' });
    const shadow = S.el('div', { style: 'position:absolute;top:214px;height:500px;left:900px;width:120px;background:rgba(0,0,0,.55);box-shadow:0 40px 70px 20px rgba(0,0,0,.72);border-radius:12px;' });
    const parchWrap = S.layer(S.cam);
    const parch = S.el('div', { style: `position:absolute;left:${PX0}px;top:${PY0}px;width:${PW}px;height:${PH}px;background:url(${PARCH}) 0 0/${PW}px ${PH}px;clip-path:${PCLIP};` }, parchWrap);
    const inkWrap = S.el('div', { style: 'position:absolute;left:0;top:0;width:1920px;height:1080px;mix-blend-mode:multiply;' }, parchWrap);
    S.el('div', { style: `position:absolute;left:${PX0}px;top:${PY0}px;width:${PW}px;height:${PH}px;clip-path:${PCLIP};mix-blend-mode:multiply;background:radial-gradient(1250px 640px at 540px 150px, #FFF7EA 0%, #EEDCC0 42%, #B08C62 82%, #8A6844 100%);` }, parchWrap);
    const dim = S.el('div', { style: `position:absolute;left:${PX0}px;top:${PY0}px;width:${PW}px;height:${PH}px;background:rgba(16,9,4,.66);clip-path:${PCLIP};opacity:0;` }, parchWrap);
    // the translation sits 190 px under the gilded line: below the scroll when that line is low, else on a pool of shade
    const EY = KCY + 190, PB = PY0 + PH;
    const pool = EY < PB ? S.el('div', { style: `position:absolute;left:${PX0}px;top:${f1(EY - 100)}px;width:${PW}px;height:${f1(PB - EY + 100)}px;background:linear-gradient(rgba(${BGC},0), rgba(${BGC},.8) 100px);opacity:0;` }, parchWrap) : null;
    const HALOW = Math.max(1040, Math.round(KEY.w) + 400);
    const halo = S.el('div', { style: `position:absolute;left:${f1(KCX - HALOW / 2)}px;top:${f1(KCY - 120)}px;width:${HALOW}px;height:240px;background:radial-gradient(closest-side, rgba(${GOLDC},.34), rgba(${GOLDC},.1) 55%, rgba(${GOLDC},0));mix-blend-mode:screen;opacity:0;` }, parchWrap);
    const goldWrap = S.el('div', { style: 'position:absolute;left:0;top:0;width:1920px;height:1080px;' }, parchWrap);
    const edgeShade = S.el('div', { style: 'position:absolute;left:0;top:0;width:1920px;height:1080px;pointer-events:none;' }, parchWrap);
    const rollL = S.layer(S.cam);
    const eng = S.layer(S.cam);

    // ink lines (word spans with slight density variation, soft bleed)
    const lineEls = LINES.map((L) => {
      const el = S.el('div', { style: `position:absolute;left:${f1(L.x0)}px;top:${L.top}px;width:${L.cw}px;height:${LH}px;direction:${DIR};text-align:${ALIGN};white-space:nowrap;font:400 ${L.fs || FS}px/${LH}px ${FONT};color:${INKC};word-spacing:${f1(L.ws2)}px;text-shadow:0 0 1px rgba(40,22,10,.55),0 0 3px rgba(60,32,14,.3);opacity:0;`, dir: DIR }, inkWrap);
      L.ws.forEach((w, i) => {
        if (i) el.appendChild(document.createTextNode(' '));
        S.el('span', { text: w, style: `opacity:${S.rnd(0.8, 1).toFixed(2)};color:${S.rand() < 0.5 ? C.ink : C.inkAlt};` }, el);
      });
      return el;
    });
    const KTXT = KEY.ws.join(' ');
    const keyCss = `position:absolute;left:${f1(KEY.x0)}px;top:${KEY.top}px;width:${KEY.cw}px;height:${LH}px;direction:${DIR};text-align:${ALIGN};white-space:nowrap;font:400 ${KEY.fs || FS}px/${LH}px ${FONT};`;
    const keyGold = S.el('div', { text: KTXT, dir: DIR, style: keyCss + `color:${C.gilt};text-shadow:0 0 1px rgba(90,56,10,.9),0 0 10px rgba(${GOLDC},.75),0 0 26px rgba(226,160,70,.45);` }, goldWrap);
    const keySweep = S.el('div', { text: KTXT, dir: DIR, style: keyCss + 'color:#FFF8E6;text-shadow:0 0 8px rgba(255,244,214,.9),0 0 22px rgba(255,220,150,.7);' }, goldWrap);
    const sweepGlow = S.el('div', { style: `position:absolute;left:0;top:${f1(KCY - 90)}px;width:220px;height:180px;background:radial-gradient(closest-side, rgba(255,228,160,.55), rgba(255,210,130,0));mix-blend-mode:screen;opacity:0;` }, goldWrap);
    keyGold.style.opacity = keySweep.style.opacity = 0;

    /* ---------- rollers: turned wood handles; the sheet wound on each roll thins as it unrolls ---------- */
    const woodV = 'linear-gradient(90deg,#1A0E06 0%,#4A2C14 14%,#8A5A2E 32%,#C89456 43%,#9A6534 57%,#5A3518 78%,#20120A 100%)';
    const RMAX = 62, RMIN = 36, ROD = 30, RY0 = 164, RY1 = 726, CW = 2 * (RMAX + 4) * 2, CH = (RY1 - RY0) * 2;
    const GR = []; for (let i = 0; i < 30; i++) GR.push({ ph: S.rnd(0, 6.283), w: S.rnd(0.8, 3.2), a: S.rnd(0.18, 0.55), dark: S.rand() < 0.72, wob: S.rnd(0, 6.28) });
    function roller(side) {
      const R = S.el('div', { style: 'position:absolute;left:0;top:0;width:0;height:0;' }, rollL);
      const part = (x, y, w, h, rad, extra) => S.el('div', { style: `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${rad};background:${woodV};${extra || ''}` }, R);
      const hi = 'box-shadow:inset 0 4px 5px rgba(255,214,160,.28),inset 0 -5px 6px rgba(0,0,0,.55),0 6px 10px rgba(0,0,0,.45);';
      const sh = S.el('div', { style: `position:absolute;left:0;top:${PY0 + 6}px;width:80px;height:${PH - 12}px;background:linear-gradient(${side < 0 ? 90 : 270}deg, rgba(40,20,6,.6), rgba(40,20,6,0));` }, R);
      part(-24, 80, 48, 44, '50%', 'box-shadow:inset 6px 7px 8px rgba(255,218,160,.3),inset -6px -8px 10px rgba(0,0,0,.6);');
      part(-21, 120, 42, 11, '5px', hi);
      part(-12, 130, 24, 18, '3px');
      part(-RMAX - 1, 146, 2 * RMAX + 2, 20, '10px', hi);
      const cv = document.createElement('canvas'); cv.width = CW; cv.height = CH;
      cv.style.cssText = `position:absolute;left:${-CW / 4}px;top:${RY0}px;width:${CW / 2}px;height:${RY1 - RY0}px;`;
      R.appendChild(cv);
      part(-RMAX - 1, 724, 2 * RMAX + 2, 20, '10px', hi);
      part(-12, 742, 24, 18, '3px');
      part(-21, 759, 42, 11, '5px', hi);
      part(-24, 766, 48, 44, '50%', 'box-shadow:inset 6px 7px 8px rgba(255,218,160,.26),inset -6px -8px 10px rgba(0,0,0,.6);');
      return { R, sh, side, ctx: cv.getContext('2d'), last: '' };
    }
    function cylinder(x, cx, y0, h, rad, theta, stops, stripes, lite, darkC, shade) {
      const g = x.createLinearGradient(cx - rad, 0, cx + rad, 0);
      stops.forEach(([o, c]) => g.addColorStop(o, c));
      x.fillStyle = g; x.fillRect(cx - rad, y0, 2 * rad, h);
      for (const s of stripes) {
        const a = s.ph + theta, c = Math.cos(a);
        if (c < 0.04) continue;
        const px = cx + rad * Math.sin(a), ww = Math.max(0.6, s.w * 2 * c);
        x.globalAlpha = s.a * Math.sqrt(c);
        x.fillStyle = s.dark ? darkC : lite;
        x.beginPath();
        for (let yy = y0; yy <= y0 + h; yy += 53) { const off = 1.6 * Math.sin(yy / 90 + s.wob) * c; x[yy === y0 ? 'moveTo' : 'lineTo'](px + off - ww / 2, yy); }
        for (let yy = y0 + h; yy >= y0; yy -= 53) { const off = 1.6 * Math.sin(yy / 90 + s.wob) * c; x.lineTo(px + off + ww / 2, yy); }
        x.closePath(); x.fill();
      }
      x.globalAlpha = 1;
      const sg = x.createLinearGradient(cx - rad, 0, cx + rad, 0);
      sg.addColorStop(0, `rgba(0,0,0,${shade})`); sg.addColorStop(0.28, 'rgba(0,0,0,0)'); sg.addColorStop(0.45, 'rgba(255,226,170,.16)'); sg.addColorStop(0.62, 'rgba(0,0,0,0)'); sg.addColorStop(1, `rgba(0,0,0,${shade + 0.08})`);
      x.fillStyle = sg; x.fillRect(cx - rad, y0, 2 * rad, h);
    }
    function drawRoll(r, theta, rr) {
      const key = theta.toFixed(4) + '|' + rr.toFixed(2);
      if (key === r.last) return;
      r.last = key;
      const x = r.ctx, cx = CW / 2;
      x.clearRect(0, 0, CW, CH);
      cylinder(x, cx, 0, CH, ROD * 2, theta, [[0, '#1C0F06'], [0.18, '#5A3518'], [0.36, '#A06A36'], [0.47, '#CC9658'], [0.6, '#8C5A2C'], [0.85, '#3E2410'], [1, '#170C05']], GR, '#E8B878', '#2A1608', 0.6);
      const py0 = (PY0 - RY0) * 2 + 4, ph = PH * 2 - 8;
      // the roll: the real sheet texture wrapped on a cylinder, sliced so it scrolls as it turns
      const N = 56, TW = PW - 12;
      for (let k = 0; k < N; k++) {
        const a0 = -Math.PI / 2 + (Math.PI * k) / N, a1 = a0 + Math.PI / N;
        const x0 = cx + rr * 2 * Math.sin(a0), x1 = cx + rr * 2 * Math.sin(a1);
        const du = (Math.PI / N) * rr, u = ((((theta + a0) * rr + 40) % (TW - du)) + (TW - du)) % (TW - du);
        x.drawImage(PARCH_C, u, 0, du, PH, x0, py0, x1 - x0 + 0.6, ph);
      }
      const rs = x.createLinearGradient(cx - rr * 2, 0, cx + rr * 2, 0);
      [[0, 'rgba(20,10,2,.82)'], [0.14, 'rgba(40,22,8,.42)'], [0.34, 'rgba(0,0,0,0)'], [0.46, 'rgba(255,236,200,.1)'], [0.6, 'rgba(0,0,0,0)'], [0.84, 'rgba(40,22,8,.45)'], [1, 'rgba(20,10,2,.86)']].forEach(([o, c]) => rs.addColorStop(o, c));
      x.fillStyle = rs; x.fillRect(cx - rr * 2, py0, rr * 4, ph);
      const lf = x.createLinearGradient(0, py0, 0, py0 + ph);
      lf.addColorStop(0, 'rgba(255,230,190,.06)'); lf.addColorStop(0.5, 'rgba(30,16,4,.08)'); lf.addColorStop(1, `rgba(30,16,4,${r.side < 0 ? 0.34 : 0.42})`);
      x.fillStyle = lf; x.fillRect(cx - rr * 2, py0, rr * 4, ph);
      const vg = x.createLinearGradient(0, py0, 0, py0 + ph);
      vg.addColorStop(0, 'rgba(60,34,12,.5)'); vg.addColorStop(0.06, 'rgba(60,34,12,0)'); vg.addColorStop(0.94, 'rgba(60,34,12,0)'); vg.addColorStop(1, 'rgba(60,34,12,.55)');
      x.fillStyle = vg; x.fillRect(cx - rr * 2, py0, rr * 4, ph);
      r.sh.style.left = r.side < 0 ? `${f1(rr - 10)}px` : `${f1(-rr - 70)}px`;
    }
    const RL = roller(-1), RR = roller(1);
    const XL0 = 960 - RMAX - 1, XR0 = 960 + RMAX + 1, XL1 = 146, XR1 = 1774, RAVG = 46;
    const unroll = { p: 0 };
    tl.to(unroll, { p: 1, duration: 1.9, ease: 'expo.inOut' }, 0.5);
    S.onFrame(() => {
      const p = unroll.p, xl = S.lerp(XL0, XL1, p), xr = S.lerp(XR0, XR1, p), rr = S.lerp(RMAX, RMIN, p);
      RL.R.style.transform = `translateX(${f1(xl)}px)`; RR.R.style.transform = `translateX(${f1(xr)}px)`;
      drawRoll(RL, (xl - XL0) / RAVG, rr); drawRoll(RR, (xr - XR0) / RAVG, rr);
      parchWrap.style.clipPath = `inset(0px ${f1(1920 - xr)}px 0px ${f1(xl)}px)`;
      shadow.style.left = f1(xl) + 'px'; shadow.style.width = f1(xr - xl) + 'px';
    });

    /* ---------- camera: unroll wide, then close on the gilded line (it lands 200 px above centre) ---------- */
    S.camSet({ x: 960, y: 445, z: 1.26 });
    S.camTo(0, { z: 1.3 }, 0.5, 'sine.inOut');
    S.camTo(0.5, { z: 0.97, y: 445 }, 1.9, 'expo.inOut');
    const ZF = 1.2, FY = KCY + 200 / ZF;
    S.camTo(2.4, { x: KCX, y: FY, z: ZF }, 2.8, 'power2.inOut');
    S.camTo(5.2, { z: ZF + 0.035, y: FY + 4 }, 2.8, 'sine.inOut');

    /* ---------- light: candle-warm beam from the top-left with drifting dust ---------- */
    const fxL = S.layer(S.shaker); S.shaker.insertBefore(fxL, S.hud);
    const bc = document.createElement('canvas'); bc.width = 1920; bc.height = 1080;
    bc.style.cssText = 'position:absolute;left:0;top:0;width:1920px;height:1080px;mix-blend-mode:screen;';
    fxL.appendChild(bc);
    const bx = bc.getContext('2d');
    const AX = -260, AY = -320, ANG = Math.atan2(560 - AY, 900 - AX), SPREAD = 0.2;
    const BEAM0 = canvasOf(960, 540, (x) => {
      x.save(); x.scale(0.5, 0.5);
      for (let i = 0; i < 140; i++) {
        const u = (i / 139) * 2 - 1, a0 = ANG + u * SPREAD, a1 = a0 + (2 * SPREAD) / 139 + 0.002;
        const ray = 0.62 + 0.38 * vn(i / 7, 0.5, 23);
        x.globalAlpha = Math.exp(-u * u * 2.6) * 0.24 * ray;
        x.fillStyle = 'rgb(255,196,120)';
        x.beginPath(); x.moveTo(AX, AY); x.lineTo(AX + Math.cos(a0) * 3200, AY + Math.sin(a0) * 3200); x.lineTo(AX + Math.cos(a1) * 3200, AY + Math.sin(a1) * 3200); x.closePath(); x.fill();
      }
      x.restore();
      x.globalCompositeOperation = 'destination-in';
      const rg = x.createRadialGradient(AX / 2, AY / 2, 0, AX / 2, AY / 2, 1300);
      rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(0.45, 'rgba(0,0,0,.85)'); rg.addColorStop(1, 'rgba(0,0,0,.12)');
      x.fillStyle = rg; x.fillRect(0, 0, 960, 540);
    });
    const BEAM = canvasOf(960, 540, (x) => { x.filter = 'blur(6px)'; x.drawImage(BEAM0, 0, 0); });
    const motes = [];
    for (let i = 0; i < 190; i++) {
      const d = S.rnd(0.25, 1);
      motes.push({ x: S.rnd(-100, 2020), y: S.rnd(-100, 1180), d, vx: S.rnd(4, 16) * d, vy: S.rnd(-8, 6) * d, ax: S.rnd(6, 22), ay: S.rnd(5, 16), wx: S.rnd(0.2, 0.7), wy: S.rnd(0.15, 0.6), ph: S.rnd(0, 6.28), r: S.rnd(1.2, 3.2) * (d > 0.9 ? 2.4 : 1), tw: S.rnd(0.5, 2) });
    }
    const flick = (t) => 0.93 + 0.045 * S.noise(t * 6.5, 1) + 0.025 * S.noise(t * 17, 2);
    const beamOn = { v: 0.4 };
    tl.to(beamOn, { v: 1, duration: 0.8, ease: 'power2.out' }, 0);
    S.onFrame((t) => {
      const fl = flick(t), bi = beamOn.v * fl, z = S.camState.z;
      bx.clearRect(0, 0, 1920, 1080);
      bx.globalCompositeOperation = 'source-over';
      bx.globalAlpha = bi; bx.drawImage(BEAM, 0, 0, 1920, 1080);
      bx.globalCompositeOperation = 'lighter';
      const ca = Math.cos(ANG), sa = Math.sin(ANG);
      for (const m of motes) {
        let x = m.x + m.vx * t + m.ax * Math.sin(m.wx * t + m.ph) + 10 * S.noise(t * 0.35 + m.ph, 5);
        let y = m.y + m.vy * t + m.ay * Math.sin(m.wy * t + m.ph * 1.7);
        x = ((x + 100) % 2120 + 2120) % 2120 - 100; y = ((y + 100) % 1280 + 1280) % 1280 - 100;
        const k = 1 + (z - 1) * 0.6 * m.d; x = 960 + (x - 960) * k; y = 540 + (y - 540) * k;
        const rx = x - AX, ry = y - AY, along = rx * ca + ry * sa, perp = Math.abs(-rx * sa + ry * ca);
        const inBeam = Math.exp(-Math.pow(perp / (along * Math.tan(SPREAD) * 0.62 + 1), 2));
        const a = (0.06 + 0.94 * inBeam) * bi * (0.55 + 0.45 * Math.sin(t * m.tw + m.ph)) * (0.35 + 0.65 * m.d);
        if (a < 0.02) continue;
        const r = m.r * (0.6 + 0.6 * m.d) * k;
        bx.globalAlpha = Math.min(1, a); bx.drawImage(SPARK, x - r * 2, y - r * 2, r * 4, r * 4);
      }
      bx.globalAlpha = 1; bx.globalCompositeOperation = 'source-over';
      glow.style.opacity = (0.55 + 0.45 * beamOn.v) * fl;
    });
    const dark = S.el('div', { style: `position:absolute;inset:0;background:${C.bg};opacity:.6;pointer-events:none;` }, fxL);
    fxL.insertBefore(dark, bc);
    tl.fromTo(dark, { opacity: 0.62 }, { opacity: 0, duration: 0.9, ease: 'power2.out' }, 0);
    S.sfx(0, 'pad', { dur: 8, gain: 0.08, notes: P.padNotes, attack: 1.4, release: 1.6 });
    S.sfx(0, 'drone', { dur: 8, freq: P.droneNote, cutoff: 260, air: 0.5, gain: 0.05 });
    S.sfx(0, 'wind', { dur: 1.6, gain: 0.05 });
    S.beat(0, 'Light and dust in frame one: atmosphere before information');

    /* ---------- chip ---------- */
    const chip = S.el('div', { style: `position:absolute;right:120px;top:96px;padding:10px 24px 9px;border:1.5px solid rgba(${GOLDC},.55);border-radius:999px;background:rgba(${BGC},.9);font:600 22px/1 "Cinzel",serif;letter-spacing:.24em;color:${GOLD};white-space:nowrap;` }, S.hud);
    chip.textContent = P.chip || '';
    fitWidth(chip, 1300);
    if (!P.chip) chip.style.display = 'none';
    tl.fromTo(chip, { x: 24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: 'expo.out' }, 0.25);
    const topShade = S.el('div', { style: `position:absolute;left:0;top:0;width:1920px;height:320px;background:linear-gradient(rgba(${BGC},.94), rgba(${BGC},.62) 48%, rgba(${BGC},0));opacity:0;` }, S.hud);
    S.hud.insertBefore(topShade, chip);
    tl.to(topShade, { opacity: 1, duration: 1.0, ease: 'power2.inOut' }, 3.3);
    if (P.chip) S.sfx(0.25, 'blip', { gain: 0.12, pitch: 0.75 });

    /* ---------- unroll sound ---------- */
    // expo.inOut winds up slowly: sound follows the visible motion (≈0.85 s to ≈2.05 s), not the tween start
    S.sfx(0.84, 'thud', { gain: 0.22, pitch: 0.75 });
    S.sfx(0.8, 'paper', { dur: 1.4, gain: 0.26 });
    S.sfx(0.76, 'drone', { dur: 1.5, freq: 43, cutoff: 150, gain: 0.1, fade: 0.45 });
    S.sfx(0.9, 'whoosh', { dur: 1.05, from: 120, to: 620, gain: 0.15 });
    S.sfx(2.02, 'thud', { gain: 0.26, pitch: 0.85 });
    S.sfx(2.03, 'click', { gain: 0.1, pitch: 0.5 });
    S.beat(0.5, 'Unroll from the centre: the reveal itself is the hook');

    /* ---------- ink in, along the reading direction, line by line (11 lines keep the 0.085 s rhythm) ---------- */
    const INK_STEP = LINES.length <= 11 ? 0.085 : 0.85 / (LINES.length - 1);
    const inkT = LINES.map((L, i) => 2.2 + i * INK_STEP + (L.key ? 0.06 : 0));
    const inkD = LINES.map((L) => (L.key ? 0.6 : 0.5));
    const eo = S.ease('power2.out'), eio = S.ease('power2.inOut');
    const inkState = LINES.map(() => -1);
    const INK_TO = RTL ? 'to left' : 'to right';
    // rows the translation would sit on (only when the gilded line is high on the scroll) fade out with the dim
    const covered = LINES.map((L) => EY < PB && !L.key && L.top + LH > EY - 50);
    S.onFrame((t) => {
      lineEls.forEach((el, i) => {
        const p = S.clamp((t - inkT[i]) / inkD[i]);
        if (covered[i]) {
          const e = eo(p), a = -20 + 125 * e, k = 1 - 0.9 * eio(S.clamp((t - 3.4) / 0.7));
          el.style.opacity = (p <= 0 ? 0 : Math.min(1, p * 2.5) * k).toFixed(3);
          el.style.filter = p > 0 && p < 1 ? `blur(${((1 - e) * 5).toFixed(2)}px)` : 'none';
          el.style.webkitMaskImage = el.style.maskImage = p > 0 && p < 1 ? `linear-gradient(${INK_TO}, #000 ${a.toFixed(1)}%, rgba(0,0,0,0) ${(a + 20).toFixed(1)}%)` : 'none';
          return;
        }
        if (p === inkState[i] && (p === 0 || p === 1)) return;
        inkState[i] = p;
        if (p <= 0) { el.style.opacity = 0; return; }
        if (p >= 1) { el.style.opacity = 1; el.style.filter = 'none'; el.style.webkitMaskImage = el.style.maskImage = 'none'; return; }
        const e = eo(p), a = -20 + 125 * e;
        el.style.opacity = Math.min(1, p * 2.5).toFixed(3);
        el.style.filter = `blur(${((1 - e) * 5).toFixed(2)}px)`;
        el.style.webkitMaskImage = el.style.maskImage = `linear-gradient(${INK_TO}, #000 ${a.toFixed(1)}%, rgba(0,0,0,0) ${(a + 20).toFixed(1)}%)`;
      });
    });
    inkT.forEach((t, i) => { if (i % 2 === 0) S.sfx(t, 'scratch', { dur: 0.14, gain: 0.06 }); });
    S.sfx(2.3, 'whoosh', { dur: 2.4, from: 180, to: 700, gain: 0.08 });
    S.beat(2.2, 'Text inks in while the camera closes on one line');

    /* ---------- the key line gilded: a sweep in reading order, the rest dims ---------- */
    const TS0 = 3.45, TSD = 0.85;
    tl.to(dim, { opacity: 1, duration: 0.7, ease: 'power2.inOut' }, 3.4);
    if (pool) tl.to(pool, { opacity: 1, duration: 0.7, ease: 'power2.inOut' }, 3.4);
    tl.to(halo, { opacity: 1, duration: 0.8, ease: 'power2.out' }, 3.55);
    const sweep = { p: 0 };
    tl.to(sweep, { p: 1, duration: TSD, ease: 'sine.inOut' }, TS0);
    S.onFrame(() => {
      const p = sweep.p;
      if (p <= 0) { keyGold.style.opacity = keySweep.style.opacity = sweepGlow.style.opacity = 0; return; }
      const span = KEY.w + 160, xc = RTL ? KX1 + 80 - span * p : KX0 - 80 + span * p;   // sweep front, world x
      const loc = (xc - KEY.x0) / KEY.cw * 100;                                          // % across the line box (0 = left)
      keyGold.style.opacity = 1;
      keyGold.style.webkitMaskImage = keyGold.style.maskImage = RTL
        ? `linear-gradient(to right, rgba(0,0,0,0) ${(loc - 2).toFixed(2)}%, #000 ${(loc + 6).toFixed(2)}%)`
        : `linear-gradient(to right, #000 ${(loc - 6).toFixed(2)}%, rgba(0,0,0,0) ${(loc + 2).toFixed(2)}%)`;
      const on = p < 1 ? 1 : 0;
      keySweep.style.opacity = on;
      keySweep.style.webkitMaskImage = keySweep.style.maskImage = RTL
        ? `linear-gradient(to right, rgba(0,0,0,0) ${(loc - 7).toFixed(2)}%, #000 ${loc.toFixed(2)}%, rgba(0,0,0,0) ${(loc + 9).toFixed(2)}%)`
        : `linear-gradient(to right, rgba(0,0,0,0) ${(loc - 9).toFixed(2)}%, #000 ${loc.toFixed(2)}%, rgba(0,0,0,0) ${(loc + 7).toFixed(2)}%)`;
      sweepGlow.style.opacity = (Math.sin(Math.PI * p) * 0.95).toFixed(3);
      sweepGlow.style.transform = `translateX(${f1(xc - 110)}px)`;
    });
    S.sfx(3.4, 'shimmer', { gain: 0.2 });
    S.sfx(TS0, 'whoosh', { dur: TSD, from: 1400, to: 5200, gain: 0.08 });
    S.sfx(TS0 + 0.05, 'ping', { freq: P.pingNote, gain: 0.12 });
    S.beat(3.4, `Gold sweep runs ${RTL ? 'right-to-left' : 'left-to-right'}, in reading order`);
    // glints along the line after the sweep passes
    for (let i = 0; i < 9; i++) {
      const u = S.rnd(0.04, 0.96), gx = RTL ? KX1 - KEY.w * u : KX0 + KEY.w * u, gy = KCY + S.rnd(-24, 18), ts = TS0 + TSD * (u * 0.9 + 0.08) + S.rnd(0, 0.08), sz = S.rnd(18, 34);
      const g = S.el('div', { style: `position:absolute;left:${f1(gx - sz / 2)}px;top:${f1(gy - sz / 2)}px;width:${f1(sz)}px;height:${f1(sz)}px;opacity:0;`, html: `<svg viewBox="-10 -10 20 20" width="100%" height="100%" style="display:block;overflow:visible"><path d="M0-10C.8-2.2 2.2-.8 10 0 2.2.8.8 2.2 0 10-.8 2.2-2.2.8-10 0-2.2-.8-.8-2.2 0-10Z" fill="#FFF3D0"/><circle r="2.2" fill="#fff"/></svg>` }, goldWrap);
      g.style.filter = 'drop-shadow(0 0 4px rgba(255,220,150,.9))';
      tl.fromTo(g, { scale: 0, rotation: -30, opacity: 0 }, { scale: 1, rotation: 15, opacity: 1, duration: 0.16, ease: 'power2.out' }, ts);
      tl.to(g, { scale: 0, rotation: 60, opacity: 0, duration: 0.4, ease: 'power2.in' }, ts + 0.16);
    }

    /* ---------- translation, word by word, under the gilded line ---------- */
    // rows of words; *asterisks* mark the gold words. 1–2 rows read best, 3 shrink to fit
    const EN = (Array.isArray(P.translation) ? P.translation : [P.translation]).filter((r) => r != null && String(r).trim()).map((row) => {
      let gold = false;
      return String(row).trim().split(/\s+/).map((tok) => {
        let t = tok; if (t.startsWith('*')) { gold = true; t = t.slice(1); }
        const c = t.indexOf('*'), w = { text: c >= 0 ? t.slice(0, c) + t.slice(c + 1) : t, gold };
        if (c >= 0) { if (c > 0 && c < t.length - 1) w.cut = c; gold = false; }   // "*word*," gilds the word, not the comma
        return w;
      }).filter((w) => w.text);
    }).filter((r) => r.length).slice(0, 3);
    const TFS = 44, TLHK = 1.27;
    const rowW = EN.map((ws) => ws.reduce((acc, w, i) => { mc.font = `italic ${w.gold ? 600 : 500} ${TFS}px "Cormorant Garamond"`; return acc + mc.measureText((i ? ' ' : '') + w.text).width; }, 0));
    const TK = Math.min(1, 1320 / Math.max(1, ...rowW), 126 / (Math.max(1, EN.length) * TFS * TLHK));
    const eBox = S.el('div', { style: `position:absolute;left:${f1(KCX - 700)}px;top:${+EY.toFixed(2)}px;width:1400px;text-align:center;font:italic 500 44px/1.27 "Cormorant Garamond",serif;color:${CREAM};text-shadow:0 2px 14px rgba(0,0,0,.8);` }, eng);
    if (TK < 1) eBox.style.fontSize = (TFS * TK).toFixed(2) + 'px';
    const wordEls = [], golds = [];
    EN.forEach((ln) => {
      const row = S.el('div', {}, eBox);
      ln.forEach((w, wi) => {
        if (wi) row.appendChild(document.createTextNode(' '));
        golds.push(w.gold);
        const goldCss = `color:${GOLD};font-weight:600;text-shadow:0 0 18px rgba(${GOLDC},.45),0 2px 14px rgba(0,0,0,.8);`;
        if (w.cut) {
          const el = S.el('span', { style: 'display:inline-block;' }, row);
          S.el('span', { text: w.text.slice(0, w.cut), style: goldCss }, el);
          el.appendChild(document.createTextNode(w.text.slice(w.cut)));
          wordEls.push(el);
        } else wordEls.push(S.el('span', { text: w.text, style: `display:inline-block;${w.gold ? goldCss : ''}` }, row));
      });
    });
    // reading pace: 0.075 s a word, 0.2 s after punctuation; a longer text compresses to the showcase's 1.3 s span
    const PAUSE = /[,;:.!?—–]$/, stepOf = (el) => (PAUSE.test(el.textContent) ? 0.2 : 0.075);
    const wSpan = wordEls.slice(0, -1).reduce((a, el) => a + stepOf(el), 0), WK = wSpan > 1.3 + 1e-6 ? 1.3 / wSpan : 1;
    let wt = 4.45;
    const wTimes = [];
    wordEls.forEach((el) => {
      wTimes.push(wt);
      tl.fromTo(el, { opacity: 0, y: 16, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55, ease: 'power3.out' }, wt);
      tl.set(el, { filter: 'none' }, wt + 0.56);
      const st = stepOf(el);
      wt += WK === 1 ? st : st * WK;
    });
    wTimes.forEach((t, i) => S.sfx(t, 'tick', { gain: 0.035, pitch: 0.5 + (i % 3) * 0.04 }));
    if (wTimes.length) { const gi = golds.indexOf(true); S.sfx(wTimes[gi >= 0 ? gi : wTimes.length - 1], 'bell', { gain: 0.07 }); }
    S.beat(4.45, 'Translation arrives word by word, at reading pace');
    // citation
    const REF = String(P.reference || '');
    mc.font = '600 28px "Cinzel"';
    const refW = mc.measureText(REF).width, CK = Math.min(1, 900 / Math.max(1, refW + REF.length * 0.26 * 28));
    const citeW = Math.max(600, Math.ceil((refW + REF.length * 0.5 * 28) * CK) + 204);
    const cite = S.el('div', { style: `position:absolute;left:${f1(KCX - citeW / 2)}px;top:${+(EY + Math.round(EN.length * TFS * TK * TLHK) + 16).toFixed(2)}px;width:${citeW}px;display:flex;align-items:center;justify-content:center;gap:22px;` }, eng);
    const ruleL = S.el('div', { style: `width:70px;height:1.5px;background:linear-gradient(90deg, rgba(${GOLDC},0), ${GOLD});transform-origin:100% 50%;` }, cite);
    const citeT = S.el('div', { text: REF, style: `font:600 28px/1 "Cinzel",serif;letter-spacing:.26em;margin-right:-.26em;color:${GOLD};` }, cite);
    const ruleR = S.el('div', { style: `width:70px;height:1.5px;background:linear-gradient(90deg, ${GOLD}, rgba(${GOLDC},0));transform-origin:0 50%;` }, cite);
    if (CK < 1) citeT.style.fontSize = (28 * CK).toFixed(2) + 'px';
    if (!REF) cite.style.display = 'none';
    tl.fromTo(citeT, { opacity: 0, letterSpacing: '.5em' }, { opacity: 1, letterSpacing: '.26em', duration: 0.8, ease: 'expo.out' }, 5.55);
    tl.fromTo([ruleL, ruleR], { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'expo.out' }, 5.65);
    if (REF) S.sfx(5.55, 'swoosh', { gain: 0.1, pitch: 0.8 });

    /* ---------- timeline strip: two dated nodes, the gap counted up ---------- */
    // when the camera frames a high line, the scroll's lower edge and the rollers reach down here: shade them first
    if (pool) {
      const low = S.el('div', { style: `position:absolute;left:0;top:780px;width:1920px;height:300px;background:linear-gradient(rgba(${BGC},0), rgba(${BGC},.86) 70px, rgba(${BGC},.93));` }, S.hud);
      tl.fromTo(low, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.inOut' }, 5.6);
    }
    const XA = 540, XB = 1380, AY0 = 926;
    const tsv = S.svg(S.hud), tdefs = S.defs(tsv), axG = S.uid('axg');
    const lg = S.s('linearGradient', { id: axG, x1: 380, x2: 1540, y1: 0, y2: 0, gradientUnits: 'userSpaceOnUse' }, tdefs);
    [[0, 0], [0.14, 0.5], [0.86, 0.5], [1, 0]].forEach(([o, a]) => S.s('stop', { offset: o, 'stop-color': GOLD, 'stop-opacity': a }, lg));
    const axis = S.s('path', { d: `M380 ${AY0}H1540`, stroke: `url(#${axG})`, 'stroke-width': 2, fill: 'none' }, tsv);
    const BY = 886;
    const brL = S.s('path', { d: `M960 ${BY}H${XA + 8}Q${XA} ${BY} ${XA} ${BY + 8}V${BY + 14}`, stroke: GOLD, 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }, tsv);
    const brR = S.s('path', { d: `M960 ${BY}H${XB - 8}Q${XB} ${BY} ${XB} ${BY + 8}V${BY + 14}`, stroke: GOLD, 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }, tsv);
    const notch = S.s('path', { d: `M947 ${BY}L960 ${BY - 12}L973 ${BY}`, stroke: GOLD, 'stroke-width': 2.5, fill: 'none', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, tsv);
    tl.fromTo(axis, { drawSVG: '50% 50%' }, { drawSVG: '0% 100%', duration: 0.6, ease: 'expo.out' }, 6.0);
    S.sfx(6.0, 'swoosh', { gain: 0.16, pitch: 0.7 });
    const node = (x, t) => {
      const d = S.el('div', { style: `position:absolute;left:${x - 8}px;top:${AY0 - 8}px;width:16px;height:16px;background:${GOLD};transform:rotate(45deg);box-shadow:0 0 14px rgba(${GOLDC},.8);` }, S.hud);
      tl.fromTo(d, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(3)' }, t);
      S.sfx(t, 'pop', { gain: 0.16, pitch: x < 960 ? 0.8 : 1 });
    };
    node(XA, 6.12); node(XB, 6.22);
    // "date · label" centred on its node; shrinks past 760 px so the two labels never meet
    const label = (x, pt, t) => {
      const date = String(pt.date || ''), name = String(pt.label || '');
      const L = S.el('div', { style: `position:absolute;left:${x - 400}px;top:${AY0 + 18}px;width:800px;text-align:center;white-space:nowrap;` }, S.hud);
      const html = (k) => (date ? `<span style="font:700 ${k === 1 ? 26 : (26 * k).toFixed(2)}px/1 'Cinzel',serif;letter-spacing:.08em;color:${GOLD}">${esc(date)}</span>` : '')
        + (name ? `<span style="font:italic 500 ${k === 1 ? 29 : (29 * k).toFixed(2)}px/1 'Cormorant Garamond',serif;color:${CREAM}">${date ? ' · ' : ''}${esc(name)}</span>` : '');
      L.innerHTML = html(1);
      const w = [...L.children].reduce((a, c) => a + c.offsetWidth, 0);
      if (w > 760) L.innerHTML = html(760 / w);
      tl.fromTo(L, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, t);
    };
    label(XA, TLN.from || {}, 6.16);
    label(XB, TLN.to || {}, 6.26);
    [brL, brR].forEach((b) => S.draw(b, 6.3, 0.6, { ease: 'power2.inOut' }));
    tl.fromTo(notch, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)' }, 6.3);
    S.sfx(6.3, 'swoosh', { gain: 0.12, pitch: 1.1 });
    // counter: the gap between the two years (there is no year 0), rounded down to `roundTo`, "+" when it was more
    const YA = +(TLN.from || {}).year || 0, YB = +(TLN.to || {}).year || 0;
    const GAPY = Math.abs(YB - YA) - ((YA < 0) !== (YB < 0) ? 1 : 0);
    const RND = Math.max(1, Math.floor(+TLN.roundTo || 1));
    let SHOWN = Math.floor(GAPY / RND) * RND;
    if (SHOWN <= 0) SHOWN = GAPY;
    const PLUS = GAPY > SHOWN, UNIT = String(TLN.unit || '');
    mc.font = '700 58px "Cinzel"'; const wNum = mc.measureText(S.fmt(SHOWN)).width, wPlus = mc.measureText('+').width;
    mc.font = '600 28px "Cinzel"'; const wYrs = mc.measureText(UNIT).width + UNIT.length * 0.22 * 28;
    const GAP = 18, lead = PLUS ? wNum + 4 + wPlus : wNum, gx0 = 960 - (lead + GAP + wYrs) / 2;
    const ctr = S.el('div', { style: 'position:absolute;left:0;top:800px;width:1920px;height:70px;' }, S.hud);
    const num = S.el('div', { text: '0', style: `position:absolute;right:${f1(1920 - (gx0 + wNum))}px;top:0;font:700 58px/70px "Cinzel",serif;color:${GOLD};text-align:right;text-shadow:0 0 24px rgba(${GOLDC},.45);white-space:nowrap;` }, ctr);
    const plus = PLUS ? S.el('div', { text: '+', style: `position:absolute;left:${f1(gx0 + wNum + 4)}px;top:0;font:700 58px/70px "Cinzel",serif;color:${GOLD};text-shadow:0 0 24px rgba(${GOLDC},.6);transform-origin:50% 55%;` }, ctr) : null;
    const yrs = S.el('div', { text: UNIT, style: `position:absolute;left:${f1(PLUS ? gx0 + wNum + 4 + wPlus + GAP : gx0 + wNum + GAP)}px;top:21px;font:600 28px/1 "Cinzel",serif;letter-spacing:.22em;color:${CREAM};white-space:nowrap;` }, ctr);
    if (lead + GAP + wYrs > 1500) { ctr.style.transformOrigin = '960px 35px'; ctr.style.transform = `scale(${(1500 / (lead + GAP + wYrs)).toFixed(3)})`; }
    tl.fromTo([num, yrs], { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, 6.36);
    S.count(num, { from: 0, to: SHOWN, t: 6.4, dur: 0.72, ease: 'power2.out' });
    for (let k = 1; k <= 10; k++) { const tt = 6.4 + 0.72 * (1 - Math.sqrt(1 - k / 10)); S.sfx(tt, 'tick', { gain: 0.05 + 0.006 * k, pitch: 0.8 + 0.05 * k }); }
    if (plus) tl.fromTo(plus, { scale: 2.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.42, ease: 'back.out(2.4)' }, 7.14);
    else { num.style.transformOrigin = '50% 55%'; tl.to(num, { scale: 1.16, duration: 0.1, ease: 'power2.out' }, 7.14); tl.to(num, { scale: 1, duration: 0.42, ease: 'back.out(2.4)' }, 7.24); }
    S.sfx(7.14, 'braam', { gain: 0.3, dur: 1.2, freq: 55 });
    S.sfx(7.14, 'boom', { gain: 0.38, dur: 1.3 });
    S.sfx(7.18, 'shimmer', { gain: 0.1 });
    S.beat(6.0, 'Timeline turns the age into a gap the viewer can feel');

    S.vignette({ strength: 0.72, inner: 40 });
    S.grain({ opacity: 0.05 });
  },
});
