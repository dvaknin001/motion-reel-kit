/* ==========================================================================
   REEL ENGINE — deterministic motion graphics on GSAP  (motion-reel-kit)
   --------------------------------------------------------------------------
   Every pixel is a pure function of time. Scenes add tweens to S.tl and
   per-frame hooks with S.onFrame(t => ...). Nothing reads the wall clock and
   nothing uses Math.random, so the same code plays live in a browser and
   renders frame-exact to video.
   ========================================================================== */
(function (G) {
  'use strict';
  const W = 1920, H = 1080, NS = 'http://www.w3.org/2000/svg';
  gsap.registerPlugin(DrawSVGPlugin, SplitText, CustomEase, MotionPathPlugin, MorphSVGPlugin);
  gsap.config({ force3D: false, nullTargetWarn: false });

  /* ---------- deterministic math ---------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashStr(str) {
    let h = 2166136261 >>> 0; str = String(str);
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function ihash(n) {
    n = n | 0;
    n = Math.imul(n ^ (n >>> 16), 0x7feb352d);
    n = Math.imul(n ^ (n >>> 15), 0x846ca68b);
    n = n ^ (n >>> 16);
    return (n >>> 0) / 4294967295;
  }
  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const norm = (v, a, b) => clamp((v - a) / (b - a));
  function noise1(x, seed = 0) {
    const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
    const a = ihash(i * 374761 + seed * 668265), b = ihash((i + 1) * 374761 + seed * 668265);
    return (a + (b - a) * u) * 2 - 1;
  }
  const _ease = {};
  const ease = (name) => _ease[name] || (_ease[name] = gsap.parseEase(name));
  function fmtNum(v, d = 0) {
    const neg = v < 0; v = Math.abs(v);
    let [i, f] = v.toFixed(d).split('.');
    i = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? '−' : '') + i + (f ? '.' + f : '');
  }

  /* ---------- params: styles take JSON params merged over their defaults ---------- */
  const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
  function deepMerge(a, b) {
    const out = isObj(a) ? Object.assign({}, a) : {};
    if (!isObj(b)) return out;
    for (const k in b) { const bv = b[k]; out[k] = isObj(bv) && isObj(out[k]) ? deepMerge(out[k], bv) : bv; }
    return out;
  }
  const clone = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)));

  /* ---------- geo helpers (maps are Mercator, matching tools/mapgen.mjs) ---------- */
  const RAD = Math.PI / 180;
  function mercator(k, tx, ty) {
    const f = ([lon, lat]) => [tx + k * lon * RAD, ty - k * Math.log(Math.tan(Math.PI / 4 + (lat * RAD) / 2))];
    f.invert = ([x, y]) => [((x - tx) / k) / RAD, (2 * Math.atan(Math.exp((ty - y) / k)) - Math.PI / 2) / RAD];
    return f;
  }
  // destination point from [lon,lat] along bearing (deg) for angular distance (deg)
  function geoDest([lon, lat], bearing, dist) {
    const φ1 = lat * RAD, λ1 = lon * RAD, θ = bearing * RAD, δ = dist * RAD;
    const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
    const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));
    return [λ2 / RAD, φ2 / RAD];
  }
  function geoCircle(center, radiusDeg, steps = 120) {
    const pts = [];
    for (let i = 0; i <= steps; i++) pts.push(geoDest(center, (360 * i) / steps, radiusDeg));
    return pts;
  }
  function geoDistKm([lon1, lat1], [lon2, lat2]) {
    const φ1 = lat1 * RAD, φ2 = lat2 * RAD, dφ = (lat2 - lat1) * RAD, dλ = (lon2 - lon1) * RAD;
    const a = Math.sin(dφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
    return 6371.0088 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /* ---------- shared textures ---------- */
  let GRAIN = null;
  function grainURL() {
    if (GRAIN) return GRAIN;
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const x = c.getContext('2d'); const im = x.createImageData(256, 256); const r = mulberry32(90210);
    for (let i = 0; i < im.data.length; i += 4) { const v = (r() * 255) | 0; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    x.putImageData(im, 0, 0);
    return (GRAIN = c.toDataURL('image/png'));
  }

  let UID = 0;
  function setAttrs(e, attrs) {
    if (!attrs) return e;
    for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'text') e.textContent = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'style') { if (typeof v === 'string') e.style.cssText += ';' + v; else Object.assign(e.style, v); }
      else if (k === 'class') e.setAttribute('class', v);
      else e.setAttribute(k, v);
    }
    return e;
  }

  /* ==========================================================================
     Scene kit — the API every scene builds with (see SCENE_GUIDE.md)
     ========================================================================== */
  class Kit {
    constructor(def, host, opts = {}) {
      this.def = def; this.id = def.id; this.dur = def.duration; this.poster = def.poster; this.W = W; this.H = H;
      this.alpha = !!opts.alpha; // transparent-overlay render: scenes skip their backgrounds when true
      // P: the style's JSON params (defaults deep-merged with the reel item's params; arrays replace)
      this.P = deepMerge(clone(def.defaults || {}), clone(opts.params || {}));
      this.palette = this.P.palette || def.palette;
      this.meta = Object.assign({ niche: def.niche, title: def.title, why: def.why, techniques: def.techniques, facts: def.facts }, this.P.meta || {}, opts.meta || {});
      this.cues = []; this.beats = []; this._frames = []; this._shakes = [];
      this._seed = hashStr(def.seed || def.id); // `seed` keeps a renamed style's random layout identical
      this.rand = mulberry32(this._seed);
      this.uidN = ++UID;
      this.tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
      const root = (this.root = document.createElement('div'));
      root.className = 'rl-scene';
      root.dataset.scene = def.id;
      root.style.cssText = `position:absolute;left:0;top:0;width:${W}px;height:${H}px;overflow:hidden;background:${this.alpha ? 'transparent' : this.P.bg || def.bg || '#000'};contain:strict;`;
      host.appendChild(root);
      this.shaker = this.layer(root);
      this.cam = this.layer(this.shaker); this.cam.style.transformOrigin = '0 0';
      this.hud = this.layer(this.shaker);
      this.fx = this.layer(root); this.fx.style.pointerEvents = 'none';
      this.camState = { x: W / 2, y: H / 2, z: 1, r: 0 };
      this._usesCam = false;
      // expose helpers
      this.clamp = clamp; this.lerp = lerp; this.norm = norm; this.noise = noise1; this.ease = ease; this.fmt = fmtNum; this.ihash = ihash;
    }
    /* --- construction --- */
    layer(parent) { const d = document.createElement('div'); d.style.cssText = `position:absolute;left:0;top:0;width:${W}px;height:${H}px;`; (parent || this.cam).appendChild(d); return d; }
    el(tag, attrs, parent) { const e = setAttrs(document.createElement(tag), attrs); if (parent !== false) (parent || this.cam).appendChild(e); return e; }
    s(tag, attrs, parent) { const e = setAttrs(document.createElementNS(NS, tag), attrs); if (parent) parent.appendChild(e); return e; }
    svg(parent, attrs) {
      const sv = this.s('svg', Object.assign({ width: W, height: H, viewBox: `0 0 ${W} ${H}` }, attrs || {}));
      sv.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;' + ((attrs && attrs.style) || '');
      (parent || this.cam).appendChild(sv);
      return sv;
    }
    defs(svgEl) { return svgEl.querySelector(':scope > defs') || this.s('defs', null, svgEl); }
    canvas(parent, w = W, h = H) {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      c.style.cssText = `position:absolute;left:0;top:0;width:${w}px;height:${h}px;`;
      (parent || this.cam).appendChild(c);
      return c.getContext('2d');
    }
    uid(name) { return `rl${this.uidN}_${name}`; }
    rnd(a = 0, b = 1) { return a + (b - a) * this.rand(); }
    /* --- timing, sound, annotations --- */
    sfx(t, name, o) { this.cues.push({ t, name, o: o || {} }); return this; }
    beat(t, label) { this.beats.push({ t, label }); return this; }
    onFrame(fn) { this._frames.push(fn); return this; }
    /* --- camera: animate S.camState {x,y (world focus px), z (zoom), r (deg)} --- */
    camSet(o) { Object.assign(this.camState, o); this._usesCam = true; return this; }
    camTo(t, o, dur = 1, ez = 'power2.inOut') {
      this._usesCam = true;
      const v = {}; for (const k of ['x', 'y', 'z', 'r']) if (o[k] != null) v[k] = o[k];
      this.tl.to(this.camState, Object.assign({ duration: dur, ease: ez }, v), t);
      return this;
    }
    shake(t, o = {}) {
      this._shakes.push({ t, amp: o.amp ?? 14, dur: o.dur ?? 0.45, freq: o.freq ?? 24, rot: o.rot ?? 0.5, seed: this._shakes.length * 17 + 3 });
      return this;
    }
    /* --- finishing layers --- */
    grain(o = {}) {
      if (this.alpha) return document.createElement('div'); // no baked texture on transparent overlays
      const g = document.createElement('div');
      g.style.cssText = `position:absolute;left:-64px;top:-64px;width:${W + 128}px;height:${H + 128}px;background-image:url(${grainURL()});background-size:256px 256px;opacity:${o.opacity ?? 0.07};mix-blend-mode:${o.blend || 'overlay'};pointer-events:none;`;
      this.fx.appendChild(g); this._grain = g; this._grainFps = o.fps || 24;
      return g;
    }
    vignette(o = {}) {
      if (this.alpha) return document.createElement('div');
      const v = document.createElement('div');
      v.style.cssText = `position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse ${o.size || '80% 80%'} at 50% 50%, rgba(0,0,0,0) ${o.inner ?? 50}%, ${o.color || `rgba(0,0,0,${o.strength ?? 0.65})`} 100%);`;
      this.fx.appendChild(v);
      return v;
    }
    /* --- motion helpers --- */
    pop(target, t, o = {}) {
      this.tl.fromTo(target, { scale: o.from ?? 0, opacity: 0 }, { scale: 1, opacity: 1, duration: o.dur ?? 0.55, ease: o.ease || 'back.out(2.2)' }, t);
      if (o.sfx !== false) this.sfx(t, o.sfx || 'pop', { pitch: o.pitch || 1, gain: o.gain ?? 0.45 });
      return this;
    }
    draw(path, t, dur = 1, o = {}) {
      this.tl.fromTo(path, { drawSVG: o.from || '0%' }, { drawSVG: o.to || '100%', duration: dur, ease: o.ease || 'power2.inOut' }, t);
      return this;
    }
    split(target, type = 'chars,words', o = {}) {
      return SplitText.create(target, Object.assign({ type, charsClass: 'rl-ch', wordsClass: 'rl-w', linesClass: 'rl-l', aria: 'none' }, o));
    }
    // Frame-driven number roll. o: {from,to,t,dur,ease,decimals,prefix,suffix,fmt}
    count(target, o) {
      const from = o.from ?? 0, to = o.to, t0 = o.t ?? 0, dur = o.dur ?? 1, ez = ease(o.ease || 'power2.out');
      const fmt = o.fmt || ((v) => (o.prefix || '') + fmtNum(v, o.decimals || 0) + (o.suffix || ''));
      let last = null;
      this.onFrame((t) => {
        const v = from + (to - from) * ez(norm(t, t0, t0 + dur));
        const s = fmt(v);
        if (s !== last) { target.textContent = s; last = s; }
      });
      return this;
    }
    // Frame-driven typewriter with human rhythm. Returns the time typing ends.
    type(target, text, o = {}) {
      const t0 = o.t ?? 0, cps = o.cps ?? 20, jitter = o.jitter ?? 0.55;
      const r = mulberry32(hashStr(text) ^ this._seed);
      const times = []; let acc = t0;
      for (let i = 0; i < text.length; i++) {
        times.push(acc);
        let step = (1 / cps) * (1 - jitter / 2 + jitter * r());
        if (text[i] === ' ' || text[i] === ',' || text[i] === '.') step *= 1.6;
        acc += step;
      }
      let last = -1;
      const caret = o.caret ? this.el('span', { style: `display:inline-block;width:.5em;height:1em;vertical-align:-.12em;margin-left:.06em;background:${o.caret === true ? 'currentColor' : o.caret}` }, false) : null;
      this.onFrame((t) => {
        let k = 0; while (k < times.length && times[k] <= t) k++;
        if (k !== last) { target.textContent = text.slice(0, k); if (caret) target.appendChild(caret); last = k; }
        if (caret) { const done = t >= acc; caret.style.opacity = t < t0 ? 0 : (!done ? 1 : (Math.floor((t - acc) * 2.2) % 2 ? 0 : 1)); }
      });
      if (o.sfx !== false) {
        for (let i = 0; i < text.length; i++) if (text[i] !== ' ') this.sfx(times[i], o.sfx || 'type', { gain: o.gain ?? 0.35 });
      }
      return acc;
    }
    /* --- internal --- */
    _finalize() {
      // a style may set S.dur / S.poster in build() when its length follows its content; keep the poster inside
      if (this.poster == null || this.poster > this.dur - 0.05) this.poster = Math.max(0, Math.round((this.dur - 0.4) * 100) / 100);
      this.tl.set({}, {}, this.dur);
      if (this.tl.duration() > this.dur + 1e-3) console.warn(`[reel] scene "${this.id}" timeline runs ${this.tl.duration().toFixed(2)}s > declared ${this.dur}s`);
    }
    frame(t) {
      if (this._usesCam) {
        const c = this.camState;
        this.cam.style.transform = `translate(${W / 2}px,${H / 2}px) rotate(${c.r}deg) scale(${c.z}) translate(${-c.x}px,${-c.y}px)`;
      }
      if (this._shakes.length) {
        let x = 0, y = 0, r = 0;
        for (const s of this._shakes) {
          const u = (t - s.t) / s.dur; if (u < 0 || u > 1) continue;
          const d = (1 - u) * (1 - u), k = (t - s.t) * s.freq;
          x += s.amp * d * noise1(k, s.seed); y += s.amp * d * noise1(k, s.seed + 1); r += s.rot * d * noise1(k, s.seed + 2);
        }
        this.shaker.style.transform = x || y || r ? `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) rotate(${r.toFixed(3)}deg)` : '';
      }
      if (this._grain) {
        const f = Math.floor(t * this._grainFps);
        this._grain.style.transform = `translate(${Math.round(ihash(f * 2 + 1) * 64 - 32)}px,${Math.round(ihash(f * 2 + 2) * 64 - 32)}px)`;
      }
      for (const fn of this._frames) fn(t);
    }
  }

  /* ==========================================================================
     Transitions between scenes (applied per frame by the Player)
     ========================================================================== */
  const TR = {};
  const clr = (e) => { const s = e.style; s.transform = ''; s.filter = ''; s.clipPath = ''; s.opacity = ''; s.zIndex = ''; s.maskImage = ''; s.webkitMaskImage = ''; s.maskSize = ''; s.webkitMaskSize = ''; s.maskPosition = ''; s.webkitMaskPosition = ''; s.visibility = ''; };
  const mask = (e, img, size, pos) => { e.style.maskImage = e.style.webkitMaskImage = img; if (size) e.style.maskSize = e.style.webkitMaskSize = size; if (pos) e.style.maskPosition = e.style.webkitMaskPosition = pos; };
  const ovl = (player, css) => { const d = document.createElement('div'); d.style.cssText = `position:absolute;left:0;top:0;width:${W}px;height:${H}px;pointer-events:none;display:none;` + css; player.transLayer.appendChild(d); return d; };
  const A = (tr) => tr.a.kit.root, B = (tr) => tr.b.kit.root;
  const resetAB = (tr) => { clr(A(tr)); clr(B(tr)); if (tr.ov) for (const o of [].concat(tr.ov)) o.style.display = 'none'; };

  TR.cut = { apply() {}, reset() {} };

  // Whip pan with directional smear
  TR.whip = {
    cues: (tr) => [{ t: tr.start - 0.08, name: 'whoosh', o: { dur: (tr.end - tr.start) + 0.16, from: 500, to: 5000, gain: 0.55 } }],
    apply(tr, p) {
      const d = tr.dir || 1, e = ease('expo.inOut')(p), s = Math.sin(Math.PI * p);
      A(tr).style.transform = `translateX(${-d * e * W}px) scaleX(${1 + 0.18 * s})`; A(tr).style.filter = `blur(${(s * 26).toFixed(1)}px)`;
      B(tr).style.transform = `translateX(${d * (1 - e) * W}px) scaleX(${1 + 0.18 * s})`; B(tr).style.filter = `blur(${(s * 26).toFixed(1)}px)`;
    },
    reset: resetAB,
  };
  // Zoom-through: outgoing flies at camera, incoming settles from depth
  TR.zoom = {
    cues: (tr) => [{ t: tr.start - 0.1, name: 'whoosh', o: { dur: (tr.end - tr.start) + 0.1, from: 250, to: 3000, gain: 0.6 } }, { t: tr.start + (tr.end - tr.start) * 0.55, name: 'thud', o: { gain: 0.35 } }],
    apply(tr, p) {
      const e = ease('power3.in')(norm(p, 0, 0.6)), e2 = ease('expo.out')(norm(p, 0.35, 1));
      A(tr).style.transform = `scale(${1 + 2.2 * e})`; A(tr).style.filter = `blur(${(e * 24).toFixed(1)}px)`; A(tr).style.opacity = 1 - norm(p, 0.35, 0.6);
      B(tr).style.transform = `scale(${0.55 + 0.45 * e2})`; B(tr).style.filter = `blur(${((1 - e2) * 20).toFixed(1)}px)`; B(tr).style.opacity = norm(p, 0.35, 0.55);
    },
    reset: resetAB,
  };
  // Diagonal slash bands in the incoming scene's colours
  TR.slash = {
    setup(tr, pl) {
      const cols = tr.colors || tr.b.kit.palette || ['#fff', '#888', '#222'];
      tr.ov = cols.slice(0, 3).map((c) => ovl(pl, `background:${c};width:${W * 1.6}px;left:${-W * 0.3}px;transform-origin:50% 50%;`));
    },
    cues: (tr) => [{ t: tr.start, name: 'swoosh', o: { gain: 0.55 } }, { t: tr.start + (tr.end - tr.start) * 0.35, name: 'swoosh', o: { gain: 0.4, pitch: 1.3 } }],
    apply(tr, p) {
      const d = tr.dir || 1;
      tr.ov.forEach((o, i) => {
        const q = ease('power3.inOut')(norm(p, i * 0.09, 0.72 + i * 0.09));
        o.style.display = '';
        o.style.transform = `translateX(${d * (-1.7 + 3.4 * q) * W}px) skewX(${-24 * d}deg)`;
        o.style.zIndex = 3 - i;
      });
      A(tr).style.visibility = p < 0.5 ? '' : 'hidden';
      B(tr).style.visibility = p < 0.5 ? 'hidden' : '';
      B(tr).style.transform = `scale(${1.06 - 0.06 * ease('expo.out')(norm(p, 0.5, 1))})`;
    },
    reset: resetAB,
  };
  // Circular iris from a point, with a ring
  TR.iris = {
    setup(tr, pl) { tr.ov = ovl(pl, `border-radius:50%;border:${tr.ring ?? 14}px solid ${tr.color || '#fff'};width:0;height:0;box-sizing:content-box;`); },
    cues: (tr) => [{ t: tr.start, name: 'whoosh', o: { dur: 0.5, from: 300, to: 2200, gain: 0.45 } }],
    apply(tr, p) {
      const cx = tr.x ?? W / 2, cy = tr.y ?? H / 2, e = ease('power3.inOut')(p), r = e * 1260;
      B(tr).style.clipPath = `circle(${r.toFixed(1)}px at ${cx}px ${cy}px)`;
      A(tr).style.transform = `scale(${1 + 0.08 * e})`;
      const o = tr.ov, rr = r + (tr.ring ?? 14);
      o.style.display = r > 1 && p < 0.98 ? '' : 'none';
      o.style.width = o.style.height = `${r * 2}px`;
      o.style.left = `${cx - rr}px`; o.style.top = `${cy - rr}px`;
      o.style.opacity = 1 - norm(p, 0.75, 1);
    },
    reset: resetAB,
  };
  // Digital glitch: slice flicker, RGB split, jitter
  TR.glitch = {
    setup(tr, pl) {
      tr.ov = [];
      for (let i = 0; i < 9; i++) tr.ov.push(ovl(pl, `height:${8 + ((i * 37) % 60)}px;mix-blend-mode:screen;`));
    },
    cues: (tr) => [{ t: tr.start, name: 'glitch', o: { dur: tr.end - tr.start, gain: 0.5 } }],
    apply(tr, p) {
      const f = Math.floor(p * 18), r1 = ihash(f * 13 + 7), r2 = ihash(f * 29 + 3);
      const showB = p > 0.5 ? r1 > 0.18 : r1 > 0.82;
      A(tr).style.visibility = showB ? 'hidden' : '';
      B(tr).style.visibility = showB ? '' : 'hidden';
      const tgt = showB ? B(tr) : A(tr), amp = Math.sin(Math.PI * p);
      tgt.style.transform = `translateX(${((r2 - 0.5) * 90 * amp).toFixed(1)}px)`;
      tgt.style.filter = `drop-shadow(${(12 * amp).toFixed(1)}px 0 0 rgba(255,0,80,.75)) drop-shadow(${(-12 * amp).toFixed(1)}px 0 0 rgba(0,240,255,.75))`;
      const cols = ['#ff0055', '#00f0ff', '#ffffff', '#b6ff00'];
      tr.ov.forEach((o, i) => {
        const on = ihash(f * 101 + i * 7) < 0.55 * amp;
        o.style.display = on ? '' : 'none';
        if (on) { o.style.top = `${ihash(f * 31 + i) * H}px`; o.style.left = `${(ihash(f * 17 + i) - 0.3) * W}px`; o.style.width = `${(0.2 + ihash(f * 7 + i)) * W}px`; o.style.background = cols[(i + f) % 4]; o.style.opacity = 0.5; }
      });
      (showB ? A(tr) : B(tr)).style.transform = ''; (showB ? A(tr) : B(tr)).style.filter = '';
    },
    reset: resetAB,
  };
  // White flash cut
  TR.flash = {
    setup(tr, pl) { tr.ov = ovl(pl, `background:${tr.color || '#fff'};`); },
    cues: (tr) => [{ t: tr.start + (tr.end - tr.start) * 0.5, name: 'impact', o: { gain: 0.5 } }, { t: tr.start - 0.25, name: 'riser', o: { dur: 0.25 + (tr.end - tr.start) * 0.5, gain: 0.35 } }],
    apply(tr, p) {
      tr.ov.style.display = ''; tr.ov.style.opacity = Math.pow(1 - Math.abs(2 * p - 1), 0.7);
      A(tr).style.visibility = p < 0.5 ? '' : 'hidden'; B(tr).style.visibility = p < 0.5 ? 'hidden' : '';
      A(tr).style.transform = `scale(${1 + 0.12 * ease('power2.in')(norm(p, 0, 0.5))})`;
      B(tr).style.transform = `scale(${1.1 - 0.1 * ease('expo.out')(norm(p, 0.5, 1))})`;
    },
    reset: resetAB,
  };
  // Vertical push
  TR.push = {
    cues: (tr) => [{ t: tr.start - 0.05, name: 'whoosh', o: { dur: (tr.end - tr.start) + 0.1, from: 300, to: 2600, gain: 0.5 } }],
    apply(tr, p) {
      const d = tr.dir || 1, e = ease('expo.inOut')(p), s = Math.sin(Math.PI * p);
      A(tr).style.transform = `translateY(${-d * e * H}px) scale(${1 - 0.06 * s})`;
      B(tr).style.transform = `translateY(${d * (1 - e) * H}px) scale(${1 - 0.06 * s})`;
      A(tr).style.filter = B(tr).style.filter = `blur(${(s * 10).toFixed(1)}px)`;
    },
    reset: resetAB,
  };
  // Halftone dot reveal (comics)
  TR.halftone = {
    cues: (tr) => [{ t: tr.start, name: 'swoosh', o: { gain: 0.5 } }, { t: tr.start + (tr.end - tr.start) * 0.5, name: 'pop', o: { pitch: 0.7, gain: 0.35 } }],
    apply(tr, p) {
      const cell = tr.cell || 44, r = ease('power2.inOut')(p) * cell * 0.75;
      mask(B(tr), `radial-gradient(circle at 50% 50%, #000 ${r.toFixed(2)}px, transparent ${(r + 1).toFixed(2)}px)`, `${cell}px ${cell}px`, 'center');
      B(tr).style.transform = `scale(${1.08 - 0.08 * p})`;
    },
    reset: resetAB,
  };
  // Venetian blinds
  TR.blinds = {
    cues: (tr) => [{ t: tr.start, name: 'whoosh', o: { dur: 0.4, gain: 0.4, from: 900, to: 4000 } }],
    apply(tr, p) {
      const n = tr.stripe || 120, w = ease('power3.inOut')(p) * n;
      mask(B(tr), `repeating-linear-gradient(${tr.angle ?? 90}deg, #000 0 ${w.toFixed(2)}px, transparent ${w.toFixed(2)}px ${n}px)`);
    },
    reset: resetAB,
  };
  // Light-leak burn crossfade (warm, filmic)
  TR.burn = {
    setup(tr, pl) { tr.ov = ovl(pl, `mix-blend-mode:screen;background:radial-gradient(ellipse 60% 90% at 30% 50%, ${tr.color || 'rgba(255,170,80,1)'} 0%, rgba(255,90,40,.6) 35%, rgba(0,0,0,0) 70%);`); },
    cues: (tr) => [{ t: tr.start, name: 'whoosh', o: { dur: (tr.end - tr.start), from: 200, to: 1200, gain: 0.35 } }],
    apply(tr, p) {
      const s = Math.sin(Math.PI * p);
      tr.ov.style.display = ''; tr.ov.style.opacity = s; tr.ov.style.transform = `translateX(${(-0.3 + p * 0.8) * W}px) scale(${1.2 + s})`;
      B(tr).style.opacity = ease('power1.inOut')(norm(p, 0.25, 0.75));
      A(tr).style.filter = `brightness(${1 + s * 0.8})`;
      B(tr).style.filter = `brightness(${1 + s * 0.8})`;
    },
    reset: resetAB,
  };
  // Dip to black
  TR.dip = {
    setup(tr, pl) { tr.ov = ovl(pl, `background:${tr.color || '#000'};`); },
    apply(tr, p) {
      tr.ov.style.display = ''; tr.ov.style.opacity = 1 - Math.abs(2 * p - 1);
      A(tr).style.visibility = p < 0.5 ? '' : 'hidden'; B(tr).style.visibility = p < 0.5 ? 'hidden' : '';
    },
    reset: resetAB,
  };
  // Hard swipe reveal with a light edge
  TR.swipe = {
    setup(tr, pl) { tr.ov = ovl(pl, `width:6px;background:${tr.color || '#fff'};box-shadow:0 0 40px 8px ${tr.color || '#fff'};`); },
    cues: (tr) => [{ t: tr.start, name: 'swoosh', o: { gain: 0.5 } }],
    apply(tr, p) {
      const e = ease('expo.inOut')(p), x = (1 - e) * W;
      B(tr).style.clipPath = `inset(0 0 0 ${x.toFixed(1)}px)`;
      A(tr).style.transform = `translateX(${-e * W * 0.25}px)`;
      tr.ov.style.display = p > 0.02 && p < 0.98 ? '' : 'none'; tr.ov.style.left = `${x - 3}px`;
    },
    reset: resetAB,
  };

  /* ==========================================================================
     Player — composes scenes, drives time, schedules sound
     ========================================================================== */
  const SCENES = {};
  class Player {
    constructor(host, items, o = {}) {
      this.host = host; this.items = []; this.trans = []; this.cues = []; this.beats = [];
      this.t = 0; this.rate = 1; this.playing = false; this.loop = !!o.loop; this.listeners = {};
      this.transLayer = document.createElement('div');
      this.transLayer.style.cssText = `position:absolute;left:0;top:0;width:${W}px;height:${H}px;pointer-events:none;z-index:50;overflow:hidden;`;
      this.master = gsap.timeline({ paused: true });
      let cursor = 0;
      items.forEach((it, i) => {
        const def = typeof it.def === 'string' ? SCENES[it.def] : it.def;
        if (!def) throw new Error(`[reel] unknown style ${it.def}`);
        const kit = new Kit(def, host, { alpha: o.alpha, params: it.params, meta: it.meta });
        try { def.build(kit, kit.P); }
        catch (err) { console.error(`[reel] scene "${def.id}" failed to build`, err); kit.tl.clear(); kit.cues.length = 0; kit.beats.length = 0; kit._frames.length = 0; kit.cam.innerHTML = kit.hud.innerHTML = ''; }
        kit._finalize();
        const tr = i > 0 && it.trans ? it.trans : null;
        const ov = tr ? tr.dur || 0 : 0;
        const start = Math.max(0, cursor - ov), end = start + kit.dur;
        kit.tl.paused(false); // a paused child would ignore the master's playhead
        this.master.add(kit.tl, start);
        const entry = { kit, def, start, end, index: i, key: it.key || def.id, _vis: null };
        this.items.push(entry);
        if (tr && TR[tr.type]) this.trans.push(Object.assign({}, tr, { start, end: start + ov, a: this.items[i - 1], b: entry }));
        const lvl = it.mix ? Math.pow(10, it.mix / 20) : 1; // per-piece mix trim in dB, set in the edit
        for (const c of kit.cues) this.cues.push({ t: start + c.t, name: c.name, o: lvl === 1 ? c.o : Object.assign({}, c.o, { level: lvl * (c.o.level ?? 1) }), scene: i });
        for (const b of kit.beats) this.beats.push({ t: start + b.t, label: b.label, scene: i });
        cursor = end;
      });
      host.appendChild(this.transLayer);
      this.duration = cursor;
      this.master.set({}, {}, this.duration);
      for (const tr of this.trans) {
        const T = TR[tr.type];
        if (T.setup) T.setup(tr, this);
        if (T.cues) for (const c of T.cues(tr)) this.cues.push(Object.assign({ scene: -1 }, c));
      }
      this.cues.sort((a, b) => a.t - b.t);
      // Initialise every tween now, while every scene is still displayed. GSAP measures the transform of an
      // element inside display:none by reparenting it and putting it back before its nextElementSibling,
      // which skips text nodes: split letters would jump across the spaces between words.
      this.master.seek(this.duration, true);
      this.master.seek(0, true);
      this.seek(0);
    }
    on(ev, fn) { (this.listeners[ev] || (this.listeners[ev] = [])).push(fn); return this; }
    emit(ev, v) { for (const fn of this.listeners[ev] || []) fn(v); }
    sceneAt(t) { let cur = this.items[0]; for (const e of this.items) if (t >= e.start) cur = e; return cur; }
    seek(t) {
      t = clamp(t, 0, this.duration); this.t = t;
      const last = this.items[this.items.length - 1];
      // show the scenes on screen before the timeline renders (see the note in the constructor)
      for (const e of this.items) {
        const vis = t >= e.start && (t < e.end || (e === last && t <= e.end));
        if (vis !== e._vis) { e.kit.root.style.display = vis ? '' : 'none'; e._vis = vis; }
      }
      this.master.seek(t, false);
      for (const e of this.items) if (e._vis) e.kit.frame(t - e.start);
      for (const tr of this.trans) {
        const T = TR[tr.type], on = t >= tr.start && t < tr.end;
        if (on) { if (!tr._on) resetAB(tr); T.apply(tr, (t - tr.start) / (tr.end - tr.start)); tr._on = true; }
        else if (tr._on) { T.reset(tr); tr._on = false; }
      }
      this._schedT = t;
      return this;
    }
    play() {
      if (this.playing) return;
      if (this.t >= this.duration - 1e-3) this.seek(0);
      this.playing = true; this._last = performance.now(); this._schedT = this.t;
      if (this.audio && this.audio.on) this.audio.resumeAt(this);
      const tick = (now) => {
        if (!this.playing) return;
        const dt = Math.min(0.1, (now - this._last) / 1000); this._last = now;
        let t = this.t + dt * this.rate;
        if (t >= this.duration) {
          if (this.loop) { this.seek(0); this.emit('loop'); if (this.audio && this.audio.on) this.audio.resumeAt(this); }
          else { this.seek(this.duration); this.pause(); this.emit('time', this.t); this.emit('ended'); return; }
        } else {
          const sched = this._schedT; this.seek(t); this._schedT = sched; this._schedule();
        }
        this.emit('time', this.t);
        this._raf = requestAnimationFrame(tick);
      };
      this._raf = requestAnimationFrame(tick);
      this.emit('play');
    }
    pause() { if (!this.playing) return; this.playing = false; cancelAnimationFrame(this._raf); if (this.audio) this.audio.halt(); this.emit('pause'); }
    toggle() { this.playing ? this.pause() : this.play(); }
    setRate(r) { this.rate = r; if (this.audio) { this.audio.halt(); if (this.playing && this.audio.on) this.audio.resumeAt(this); } }
    _schedule() {
      if (!this.audio || !this.audio.on || this.rate < 0.75) { this._schedT = this.t; return; }
      const ahead = this.t + 0.12;
      for (const c of this.cues) { if (c.t > ahead) break; if (c.t > this._schedT) this.audio.play(c, (c.t - this.t) / this.rate); }
      this._schedT = ahead;
    }
    destroy() { this.pause(); this.master.kill(); for (const e of this.items) { e.kit.tl.kill(); e.kit.root.remove(); } this.transLayer.remove(); }
  }

  /* ---------- fonts ---------- */
  const FONT_FACES = [
    ['900 40px "Archivo"'], ['400 40px "Archivo"'], ['800 40px "Archivo"'],
    ['400 40px "Anton"'], ['400 40px "Bangers"'], ['500 40px "Chakra Petch"'], ['700 40px "Chakra Petch"'],
    ['700 40px "Cinzel"'], ['900 40px "Cinzel"'], ['500 40px "Cinzel"'],
    ['400 40px "Cormorant Garamond"'], ['600 40px "Cormorant Garamond"'], ['italic 400 40px "Cormorant Garamond"'], ['italic 600 40px "Cormorant Garamond"'],
    ['400 40px "Frank Ruhl Libre"', 'אבגד abc'], ['700 40px "Frank Ruhl Libre"', 'אבגד abc'],
    ['500 40px "EB Garamond"', 'ΜΗΝΙΝ ἄειδε abc'], ['700 40px "EB Garamond"', 'ΜΗΝΙΝ ἄειδε abc'],   // Greek (classics)
    ['400 40px "Homemade Apple"'], ['400 40px "Inter"'], ['600 40px "Inter"'], ['800 40px "Inter"'],
    ['400 40px "JetBrains Mono"'], ['700 40px "JetBrains Mono"'], ['800 40px "Montserrat"'], ['900 40px "Montserrat"'],
    ['400 40px "Permanent Marker"'], ['400 40px "Special Elite"'], ['400 40px "VT323"'], ['400 40px "Alfa Slab One"'],
  ];
  let readyP = null;
  function ready() {
    if (readyP) return readyP;
    readyP = (async () => {
      try { await Promise.all(FONT_FACES.map(([f, txt]) => document.fonts.load(f, txt || 'BESbswy0123'))); } catch (e) { console.warn('[reel] font load', e); }
      await document.fonts.ready;
    })();
    return readyP;
  }

  G.Reel = {
    W, H, Kit, Player, TR, SCENES,
    style(def) { SCENES[def.id] = def; return def; },
    scene(def) { SCENES[def.id] = def; return def; }, // legacy alias of style()
    list() { return Object.values(SCENES).sort((a, b) => (a.order ?? 99) - (b.order ?? 99)); },
    ready, mulberry32, hashStr, ihash, clamp, lerp, norm, noise1, ease, fmtNum, deepMerge, clone,
    mercator, geoDest, geoCircle, geoDistKm,
    FONTS_URL: 'https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Anton&family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Bangers&family=Chakra+Petch:wght@500;700&family=Cinzel:wght@500..900&family=Cormorant+Garamond:ital,wght@0,400..700;1,400..700&family=EB+Garamond:wght@400..800&family=Frank+Ruhl+Libre:wght@300..900&family=Homemade+Apple&family=Inter:wght@400..800&family=JetBrains+Mono:wght@400..800&family=Montserrat:wght@600..900&family=Permanent+Marker&family=Special+Elite&family=VT323&display=swap',
  };
})(window);
