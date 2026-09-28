/* ==========================================================================
   SFX — procedural sound design (Web Audio). No samples: every sound is
   synthesized, so the same cue list plays live and renders offline to WAV.
   Cue: { t, name, o }  o.gain = peak level (0..1), o.pitch = multiplier,
   o.dur = length for sustained sounds, o.pan = -1..1, o.wet = reverb send.
   ========================================================================== */
(function (G) {
  'use strict';
  const cache = new WeakMap();
  function buffers(ctx) {
    let b = cache.get(ctx);
    if (b) return b;
    const sr = ctx.sampleRate, len = sr * 2;
    const white = ctx.createBuffer(1, len, sr), pink = ctx.createBuffer(1, len, sr), brown = ctx.createBuffer(1, len, sr);
    const r = Reel.mulberry32(4242);
    const w = white.getChannelData(0), p = pink.getChannelData(0), br = brown.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
    for (let i = 0; i < len; i++) {
      const x = r() * 2 - 1; w[i] = x;
      b0 = 0.99886 * b0 + x * 0.0555179; b1 = 0.99332 * b1 + x * 0.0750759; b2 = 0.969 * b2 + x * 0.153852;
      b3 = 0.8665 * b3 + x * 0.3104856; b4 = 0.55 * b4 + x * 0.5329522; b5 = -0.7616 * b5 - x * 0.016898;
      p[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + x * 0.5362) * 0.11; b6 = x * 0.115926;
      last = (last + 0.02 * x) / 1.02; br[i] = last * 3.5;
    }
    const irLen = Math.floor(sr * 2.4), ir = ctx.createBuffer(2, irLen, sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch), rr = Reel.mulberry32(77 + ch);
      for (let i = 0; i < irLen; i++) { const tt = i / sr; d[i] = (rr() * 2 - 1) * Math.pow(1 - i / irLen, 2) * Math.exp(-tt * 2.2) * (tt < 0.012 ? tt / 0.012 : 1); }
    }
    b = { white, pink, brown, ir };
    cache.set(ctx, b);
    return b;
  }

  class Engine {
    constructor(ctx, dest) {
      this.ctx = ctx; this.B = buffers(ctx);
      this.master = ctx.createGain(); this.master.gain.value = 0.9;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 28;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18; comp.knee.value = 10; comp.ratio.value = 3; comp.attack.value = 0.005; comp.release.value = 0.2;
      const lim = ctx.createDynamicsCompressor();
      lim.threshold.value = -4; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.001; lim.release.value = 0.09;
      this.master.connect(hp); hp.connect(comp); comp.connect(lim); lim.connect(dest || ctx.destination);
      this.verb = ctx.createConvolver(); this.verb.buffer = this.B.ir;
      const vg = ctx.createGain(); vg.gain.value = 0.8; this.verb.connect(vg); vg.connect(this.master);
      this.bus = this.master;
      this._curves = {};
    }
    osc(type, f, t, dur) { const o = this.ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.start(t); o.stop(t + dur + 0.05); return o; }
    noise(t, dur, kind = 'white') { const s = this.ctx.createBufferSource(); s.buffer = this.B[kind]; s.loop = true; s.start(t, (t * 7.31) % 1.5); s.stop(t + dur + 0.05); return s; }
    filt(type, f, q = 0.707, t = 0) { const b = this.ctx.createBiquadFilter(); b.type = type; b.frequency.setValueAtTime(f, t); b.Q.setValueAtTime(q, t); return b; }
    vca(t, a, peak, d) {
      const g = this.ctx.createGain(); peak = Math.max(peak, 0.0002);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + Math.max(a, 0.0005)); g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(a, 0.0005) + d);
      return g;
    }
    gain(v) { const g = this.ctx.createGain(); g.gain.value = v; return g; }
    curve(k) {
      if (this._curves[k]) return this._curves[k];
      const n = 1024, c = new Float32Array(n);
      for (let i = 0; i < n; i++) { const x = (i / (n - 1)) * 2 - 1; c[i] = Math.tanh(k * x) / Math.tanh(k); }
      return (this._curves[k] = c);
    }
    shaper(k) { const w = this.ctx.createWaveShaper(); w.curve = this.curve(k); return w; }
    out(o = {}, wet = 0.15) {
      const g = this.ctx.createGain(); let head = g;
      if (o.pan) { const p = this.ctx.createStereoPanner(); p.pan.value = o.pan; g.connect(p); head = p; }
      head.connect(this.bus);
      const w = o.wet ?? wet;
      if (w > 0) { const s = this.ctx.createGain(); s.gain.value = w * (this._lvl ?? 1); head.connect(s); s.connect(this.verb); }
      return g;
    }
    chain(...n) { for (let i = 0; i < n.length - 1; i++) n[i].connect(n[i + 1]); return n[n.length - 1]; }
    play(name, t, o = {}) {
      const f = LIB[name];
      if (!f) { console.warn('[sfx] unknown sound', name); return; }
      const lvl = o.level ?? 1, bus = this.bus, prev = this._lvl;
      if (lvl !== 1) { const g = this.ctx.createGain(); g.gain.value = lvl; g.connect(bus); this.bus = g; this._lvl = lvl; }
      try { f(this, Math.max(0, t), o, Reel.mulberry32(Reel.hashStr(name + ':' + t.toFixed(3)))); } catch (e) { console.warn('[sfx]', name, e); }
      finally { this.bus = bus; this._lvl = prev; }
    }
  }

  /* ---------------------------------- library ---------------------------------- */
  const LIB = {};
  const env = (S, t, a, peak, hold, rel) => { const g = S.ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a); g.gain.setValueAtTime(Math.max(peak, 0.0002), t + a + hold); g.gain.exponentialRampToValueAtTime(0.0001, t + a + hold + rel); return g; };

  // Air movement: pink noise through a sweeping band-pass, panned across.
  LIB.whoosh = (S, t, o, r) => {
    const dur = o.dur ?? 0.5, g = o.gain ?? 0.5, pt = o.pitch ?? 1;
    const f0 = (o.from ?? 350) * pt, f1 = (o.to ?? 3500) * pt;
    const n = S.noise(t, dur, 'pink');
    const bp = S.filt('bandpass', f0, o.q ?? 1.1, t); bp.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.8);
    const lp = S.filt('lowpass', 11000, 0.7, t);
    const v = S.ctx.createGain(); v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(g * 4.2, t + dur * 0.62); v.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const p = S.ctx.createStereoPanner(); const side = o.dir ?? (r() < 0.5 ? -1 : 1);
    p.pan.setValueAtTime(-0.6 * side, t); p.pan.linearRampToValueAtTime(0.6 * side, t + dur);
    S.chain(n, bp, lp, v, p, S.out(o, 0.18));
  };
  LIB.swoosh = (S, t, o, r) => LIB.whoosh(S, t, Object.assign({ dur: 0.26, from: 900, to: 6500, q: 0.8 }, o), r);

  // Bubble pop: quick upward chirp then drop, with a click transient.
  LIB.pop = (S, t, o, r) => {
    const g = o.gain ?? 0.45, p = (o.pitch ?? 1) * (0.95 + r() * 0.1);
    const s = S.osc('sine', 420 * p, t, 0.2);
    s.frequency.exponentialRampToValueAtTime(1150 * p, t + 0.018); s.frequency.exponentialRampToValueAtTime(300 * p, t + 0.11);
    S.chain(s, S.vca(t, 0.004, g, 0.12), S.out(o, 0.08));
    const n = S.noise(t, 0.03);
    S.chain(n, S.filt('highpass', 3000, 0.7, t), S.vca(t, 0.001, g * 0.4, 0.018), S.out(o, 0));
  };

  LIB.click = (S, t, o, r) => {
    const g = o.gain ?? 0.4, p = o.pitch ?? 1;
    S.chain(S.noise(t, 0.02), S.filt('bandpass', 3800 * p, 1.4, t), S.vca(t, 0.0008, g * 2.4, 0.012), S.out(o, 0.03));
    S.chain(S.osc('square', 2200 * p, t, 0.02), S.vca(t, 0.0005, g * 0.12, 0.006), S.out(o, 0));
  };
  LIB.tick = (S, t, o) => {
    const g = o.gain ?? 0.3, p = o.pitch ?? 1;
    S.chain(S.osc('sine', 2600 * p, t, 0.05), S.vca(t, 0.001, g, 0.035), S.out(o, 0.05));
    S.chain(S.osc('triangle', 5200 * p, t, 0.03), S.vca(t, 0.0005, g * 0.2, 0.012), S.out(o, 0));
  };
  LIB.blip = (S, t, o) => {
    const g = o.gain ?? 0.3, p = o.pitch ?? 1;
    const s = S.osc('triangle', 880 * p, t, 0.15); s.frequency.exponentialRampToValueAtTime(1480 * p, t + 0.05);
    S.chain(s, S.vca(t, 0.002, g, 0.1), S.out(o, 0.1));
  };
  // Typewriter key: strike + body thunk + release click.
  LIB.type = (S, t, o, r) => {
    const g = o.gain ?? 0.35;
    S.chain(S.noise(t, 0.05), S.filt('bandpass', 2200 + r() * 1800, 1.6, t), S.vca(t, 0.0008, g * 2.6, 0.028), S.out(o, 0.06));
    S.chain(S.osc('sine', 140 + r() * 40, t, 0.08), S.vca(t, 0.001, g * 0.7, 0.05), S.out(o, 0));
    S.chain(S.noise(t + 0.014, 0.02), S.filt('highpass', 5000, 0.7, t), S.vca(t + 0.014, 0.0005, g * 0.6, 0.01), S.out(o, 0));
  };
  // Struck bell (inharmonic partials).
  LIB.ding = (S, t, o) => {
    const g = o.gain ?? 0.3, f = (o.freq ?? 2093) * (o.pitch ?? 1);
    [[1, 1, 1.6], [2, 0.3, 0.9], [2.76, 0.45, 0.7], [5.4, 0.22, 0.35], [8.93, 0.1, 0.2]].forEach(([m, a, d]) => {
      S.chain(S.osc('sine', f * m, t, d + 0.1), S.vca(t, 0.002, g * a, d), S.out(o, 0.28));
    });
  };
  LIB.bell = (S, t, o, r) => { LIB.ding(S, t, Object.assign({}, o, { freq: 1318.5 }), r); LIB.ding(S, t + 0.13, Object.assign({}, o, { freq: 1760 }), r); };

  // Hits
  LIB.impact = (S, t, o) => {
    const g = o.gain ?? 0.7, p = o.pitch ?? 1;
    const s = S.osc('sine', 150 * p, t, 1.2); s.frequency.exponentialRampToValueAtTime(40 * p, t + 0.4);
    S.chain(s, S.vca(t, 0.004, g, 0.9), S.out(o, 0.15));
    const lp = S.filt('lowpass', 1400, 0.8, t); lp.frequency.exponentialRampToValueAtTime(200, t + 0.3);
    S.chain(S.noise(t, 0.5, 'pink'), lp, S.vca(t, 0.002, g * 2.2, 0.32), S.out(o, 0.3));
    S.chain(S.noise(t, 0.05), S.filt('highpass', 2500, 0.7, t), S.vca(t, 0.0005, g * 0.6, 0.04), S.out(o, 0.1));
  };
  LIB.thud = (S, t, o) => {
    const g = o.gain ?? 0.5, p = o.pitch ?? 1;
    const s = S.osc('sine', 110 * p, t, 0.4); s.frequency.exponentialRampToValueAtTime(50 * p, t + 0.12);
    S.chain(s, S.vca(t, 0.003, g, 0.28), S.out(o, 0.1));
    S.chain(S.noise(t, 0.12, 'brown'), S.filt('lowpass', 500, 0.7, t), S.vca(t, 0.002, g * 0.9, 0.1), S.out(o, 0.05));
  };
  LIB.boom = (S, t, o, r) => {
    const g = o.gain ?? 0.7, dur = o.dur ?? 2.2;
    const s = S.osc('sine', 80, t, dur); s.frequency.exponentialRampToValueAtTime(28, t + dur * 0.7);
    S.chain(s, S.vca(t, 0.01, g, dur), S.out(o, 0.2));
    const lp = S.filt('lowpass', 600, 0.6, t); lp.frequency.exponentialRampToValueAtTime(90, t + dur);
    S.chain(S.noise(t, dur, 'brown'), lp, S.vca(t, 0.01, g * 1.3, dur * 0.9), S.out(o, 0.4));
    LIB.impact(S, t, { gain: g * 0.55, pitch: 0.8, pan: o.pan }, r);
  };
  // Trailer "braam": detuned low saws through an opening filter, saturated.
  LIB.braam = (S, t, o) => {
    const g = o.gain ?? 0.4, dur = o.dur ?? 2.2, f = o.freq ?? 55;
    const lp = S.filt('lowpass', 220, 2, t); lp.frequency.linearRampToValueAtTime(1100, t + 0.22); lp.frequency.exponentialRampToValueAtTime(260, t + dur);
    [1, 1.006, 0.994, 2.003, 0.5].forEach((m) => { const s = S.osc('sawtooth', f * m, t, dur); S.chain(s, S.gain(0.3), lp); });
    S.chain(lp, S.shaper(2.2), env(S, t, 0.08, g, dur * 0.35, dur * 0.57), S.out(o, 0.35));
  };
  LIB.bass = (S, t, o) => {
    const g = o.gain ?? 0.6, f = o.freq ?? 55;
    const s = S.osc('sine', f * 2, t, 1.6); s.frequency.exponentialRampToValueAtTime(f, t + 0.06);
    S.chain(s, S.shaper(1.5), S.vca(t, 0.003, g, 1.3), S.out(o, 0.05));
  };
  LIB.stamp = (S, t, o, r) => {
    const g = o.gain ?? 0.7;
    LIB.thud(S, t, { gain: g, pitch: 0.9, pan: o.pan }, r);
    S.chain(S.noise(t, 0.15, 'pink'), S.filt('bandpass', 900, 0.9, t), S.vca(t, 0.001, g * 3, 0.09), S.out(o, 0.22));
    S.chain(S.noise(t + 0.005, 0.06), S.filt('highpass', 2000, 0.7, t), S.vca(t + 0.005, 0.001, g * 0.6, 0.05), S.out(o, 0.1));
  };
  LIB.drum = (S, t, o) => {
    const g = o.gain ?? 0.6, p = o.pitch ?? 1;
    const s = S.osc('sine', 105 * p, t, 1); s.frequency.exponentialRampToValueAtTime(52 * p, t + 0.22);
    S.chain(s, S.vca(t, 0.002, g, 0.75), S.out(o, 0.35));
    const tr = S.osc('triangle', 210 * p, t, 0.4); tr.frequency.exponentialRampToValueAtTime(95 * p, t + 0.12);
    S.chain(tr, S.vca(t, 0.001, g * 0.35, 0.22), S.out(o, 0.3));
    S.chain(S.noise(t, 0.2, 'brown'), S.filt('lowpass', 380, 0.7, t), S.vca(t, 0.001, g * 1.4, 0.16), S.out(o, 0.3));
  };
  LIB.heartbeat = (S, t, o) => {
    const g = o.gain ?? 0.55;
    const beat = (tt, gg) => { const s = S.osc('sine', 68, tt, 0.3); s.frequency.exponentialRampToValueAtTime(42, tt + 0.1); S.chain(s, S.filt('lowpass', 160, 0.7, tt), S.vca(tt, 0.006, gg, 0.16), S.out(o, 0.1)); };
    beat(t, g); beat(t + 0.26, g * 0.7);
  };

  // Tension & motion beds
  LIB.riser = (S, t, o) => {
    const dur = o.dur ?? 1.2, g = o.gain ?? 0.4;
    const bp = S.filt('bandpass', 400, 2.5, t); bp.frequency.exponentialRampToValueAtTime(9000, t + dur);
    const v = S.ctx.createGain(); v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(g * 2.4, t + dur); v.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.05);
    S.chain(S.noise(t, dur + 0.05, 'pink'), bp, S.filt('lowpass', 7000, 0.7, t), v, S.out(o, 0.35));
    const s = S.osc('sawtooth', 90, t, dur); s.frequency.exponentialRampToValueAtTime(720, t + dur);
    const lp = S.filt('lowpass', 300, 1, t); lp.frequency.exponentialRampToValueAtTime(4000, t + dur);
    const v2 = S.ctx.createGain(); v2.gain.setValueAtTime(0.0001, t); v2.gain.exponentialRampToValueAtTime(g * 0.22, t + dur); v2.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.04);
    S.chain(s, lp, v2, S.out(o, 0.3));
  };
  LIB.drone = (S, t, o) => {
    const dur = o.dur ?? 4, g = o.gain ?? 0.16, f = o.freq ?? 55, fade = Math.min(o.fade ?? 0.8, dur / 3), cut = o.cutoff ?? 420;
    const lp = S.filt('lowpass', cut, 0.9, t);
    const lfo = S.osc('sine', 0.18, t, dur); const lg = S.gain(cut * 0.35); lfo.connect(lg); lg.connect(lp.frequency);
    [[1, 'sawtooth', 0.2], [1.004, 'sawtooth', 0.2], [2.002, 'triangle', 0.16], [0.5, 'sine', 0.5]].forEach(([m, ty, a]) => S.chain(S.osc(ty, f * m, t, dur), S.gain(a), lp));
    S.chain(lp, env(S, t, fade, g, Math.max(0, dur - 2 * fade), fade), S.out(o, 0.35));
    if (o.air) {
      const a = typeof o.air === 'number' ? o.air : 0.6;
      S.chain(S.noise(t, dur, 'pink'), S.filt('bandpass', o.airFreq ?? 1100, 0.6, t), env(S, t, fade, g * a * 1.4, Math.max(0, dur - 2 * fade), fade), S.out(o, 0.4));
    }
  };
  LIB.pad = (S, t, o) => {
    const dur = o.dur ?? 4, g = o.gain ?? 0.12, notes = o.notes || [220, 277.2, 329.6], att = Math.min(o.attack ?? 1.2, dur / 2), rel = Math.min(o.release ?? 1.5, dur / 2);
    const lp = S.filt('lowpass', o.cutoff ?? 2200, 0.5, t);
    notes.forEach((f) => [-7, 0, 7].forEach((c) => S.chain(S.osc(o.wave || 'triangle', f * Math.pow(2, c / 1200), t, dur), S.gain(0.17 / Math.sqrt(notes.length)), lp)));
    S.chain(lp, env(S, t, att, g, Math.max(0, dur - att - rel), rel), S.out(o, 0.6));
  };
  LIB.wind = (S, t, o, r) => {
    const dur = o.dur ?? 2, g = o.gain ?? 0.25;
    const bp = S.filt('bandpass', 600, 2.2, t); let f = 520;
    for (let k = 1; k <= Math.ceil(dur / 0.25); k++) { f = Math.min(1500, Math.max(280, f * (0.8 + r() * 0.45))); bp.frequency.linearRampToValueAtTime(f, t + k * 0.25); }
    const v = S.ctx.createGain(); v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(g * 5, t + dur * 0.35); v.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    S.chain(S.noise(t, dur, 'pink'), bp, v, S.out(o, 0.3));
  };
  LIB.thunder = (S, t, o) => {
    const g = o.gain ?? 0.6;
    S.chain(S.noise(t, 0.3), S.filt('highpass', 1200, 0.7, t), S.vca(t, 0.002, g * 1.2, 0.25), S.out(o, 0.4));
    const lp = S.filt('lowpass', 900, 0.7, t); lp.frequency.exponentialRampToValueAtTime(120, t + 3);
    const v = S.ctx.createGain(); v.gain.setValueAtTime(0.0001, t + 0.05); v.gain.exponentialRampToValueAtTime(g * 2, t + 0.25); v.gain.exponentialRampToValueAtTime(g * 0.7, t + 0.9); v.gain.exponentialRampToValueAtTime(0.0001, t + 3);
    S.chain(S.noise(t + 0.05, 3, 'brown'), lp, v, S.out(o, 0.5));
  };

  // Texture & foley
  LIB.paper = (S, t, o, r) => {
    const dur = o.dur ?? 0.8, g = o.gain ?? 0.3, step = 0.012;
    const v = S.ctx.createGain(); v.gain.setValueAtTime(0.0001, t);
    for (let k = 0; k * step < dur; k++) { const e = Math.sin((Math.PI * k * step) / dur); v.gain.setValueAtTime(Math.max(0.0001, g * 3 * e * (r() < 0.35 ? r() : r() * 0.15)), t + k * step); }
    v.gain.setValueAtTime(0.0001, t + dur);
    S.chain(S.noise(t, dur), S.filt('bandpass', 3200, 0.7, t), S.filt('highpass', 800, 0.7, t), v, S.out(o, 0.15));
  };
  LIB.scratch = (S, t, o) => {
    const g = o.gain ?? 0.35, dur = o.dur ?? 0.25;
    const bp = S.filt('bandpass', 700, 3, t); bp.frequency.exponentialRampToValueAtTime(3600, t + dur * 0.45); bp.frequency.exponentialRampToValueAtTime(900, t + dur);
    S.chain(S.noise(t, dur), bp, env(S, t, 0.02, g * 3.2, Math.max(0, dur - 0.05), 0.03), S.out(o, 0.1));
  };
  LIB.shutter = (S, t, o, r) => {
    const g = o.gain ?? 0.4;
    LIB.click(S, t, { gain: g, pitch: 0.8 }, r);
    S.chain(S.noise(t + 0.02, 0.06, 'pink'), S.filt('bandpass', 1500, 1, t), S.vca(t + 0.02, 0.003, g * 2, 0.05), S.out(o, 0.1));
    LIB.click(S, t + 0.085, { gain: g * 0.8, pitch: 0.6 }, r);
  };
  LIB.ratchet = (S, t, o, r) => {
    const n = o.count ?? 6, gap = o.gap ?? 0.06, g = o.gain ?? 0.3;
    for (let i = 0; i < n; i++) LIB.click(S, t + i * gap, { gain: g * (0.8 + r() * 0.3), pitch: 0.7 + i * 0.03, pan: o.pan }, r);
  };
  LIB.cash = (S, t, o, r) => {
    const g = o.gain ?? 0.4;
    LIB.click(S, t, { gain: g * 1.4, pitch: 0.5 }, r);
    S.chain(S.noise(t, 0.07, 'pink'), S.filt('bandpass', 1400, 1.2, t), S.vca(t, 0.002, g * 2, 0.06), S.out(o, 0.1));
    [0.07, 0.19].forEach((dt, j) => {
      const tt = t + dt;
      [2637, 3520, 4186, 5274, 6645].forEach((f, i) => S.chain(S.osc('sine', f * (1 + j * 0.02), tt, 1.2), S.vca(tt, 0.002, g * (0.5 - i * 0.07), 0.6 + (4 - i) * 0.12), S.out(o, 0.3)));
    });
  };
  LIB.shimmer = (S, t, o, r) => {
    const g = o.gain ?? 0.22, n = o.count ?? 7, notes = [1568, 1760, 2093, 2349, 2637, 3136, 3520, 4186];
    for (let i = 0; i < n; i++) {
      const ti = t + i * (0.035 + r() * 0.03), f = notes[(r() * notes.length) | 0] * (o.pitch ?? 1);
      const pn = S.ctx.createStereoPanner(); pn.pan.value = r() * 1.4 - 0.7;
      S.chain(S.osc('sine', f, ti, 1), S.vca(ti, 0.003, g * (0.5 + r() * 0.5), 0.5 + r() * 0.4), pn, S.out(o, 0.55));
    }
  };
  LIB.glitch = (S, t, o, r) => {
    const dur = o.dur ?? 0.3, g = o.gain ?? 0.35, step = 0.022;
    const lp = S.filt('lowpass', 6000, 0.7, t); lp.connect(S.out(o, 0.05));
    for (let k = 0; k * step < dur; k++) {
      const ti = t + k * step; if (r() < 0.25) continue;
      const s = S.osc(r() < 0.5 ? 'square' : 'sawtooth', 60 + r() * r() * 2400, ti, step);
      const v = S.ctx.createGain(); v.gain.setValueAtTime(g * (0.2 + r() * 0.4), ti); v.gain.setValueAtTime(0.0001, ti + step * 0.85);
      S.chain(s, v, lp);
    }
    const v = S.ctx.createGain(); v.gain.setValueAtTime(0.0001, t);
    for (let k = 0; k * step < dur; k++) v.gain.setValueAtTime(r() < 0.4 ? g * 0.8 : 0.0001, t + k * step);
    v.gain.setValueAtTime(0.0001, t + dur);
    S.chain(S.noise(t, dur), S.filt('bandpass', 1800, 0.8, t), v, lp);
  };
  LIB.ping = (S, t, o) => {
    const g = o.gain ?? 0.3, f = (o.freq ?? 1250) * (o.pitch ?? 1);
    S.chain(S.osc('sine', f, t, 1.6), S.vca(t, 0.003, g, 1.3), S.out(o, 0.55));
    S.chain(S.osc('sine', f * 2.01, t, 0.8), S.vca(t, 0.002, g * 0.2, 0.5), S.out(o, 0.4));
  };
  LIB.buzzer = (S, t, o) => {
    const g = o.gain ?? 0.3, dur = o.dur ?? 0.9;
    const lp = S.filt('lowpass', 2600, 0.8, t);
    [[233, 'sawtooth'], [236.5, 'sawtooth'], [116.5, 'square']].forEach(([f, ty]) => S.chain(S.osc(ty, f, t, dur), S.gain(0.4), lp));
    S.chain(lp, S.shaper(3), env(S, t, 0.015, g, Math.max(0, dur - 0.08), 0.06), S.out(o, 0.2));
  };
  LIB.crt = (S, t, o, r) => {
    const g = o.gain ?? 0.4;
    LIB.thud(S, t, { gain: g * 0.8, pitch: 0.7 }, r);
    S.chain(S.noise(t, 0.4), S.filt('highpass', 3500, 0.7, t), S.vca(t, 0.002, g * 0.7, 0.35), S.out(o, 0.1));
    S.chain(S.osc('sine', 7800, t, 1.5), S.vca(t, 0.01, g * 0.04, 1.3), S.out(o, 0));
  };
  LIB.chord = (S, t, o) => {
    const g = o.gain ?? 0.22, dur = o.dur ?? 0.7, notes = o.notes || [261.6, 329.6, 392, 523.3];
    const lp = S.filt('lowpass', 5000, 1.2, t); lp.frequency.exponentialRampToValueAtTime(700, t + dur);
    notes.forEach((f) => [-6, 6].forEach((c) => S.chain(S.osc(o.wave || 'sawtooth', f * Math.pow(2, c / 1200), t, dur), S.gain(1.3 / notes.length), lp)));
    S.chain(lp, S.vca(t, 0.004, g, dur), S.out(o, 0.35));
  };
  LIB.coin = (S, t, o) => {
    const g = o.gain ?? 0.16, s = S.osc('square', 988, t, 0.5); s.frequency.setValueAtTime(1319, t + 0.07);
    const v = S.ctx.createGain(); v.gain.setValueAtTime(g, t); v.gain.setValueAtTime(g, t + 0.07); v.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    S.chain(s, v, S.out(o, 0.1));
  };
  LIB.levelup = (S, t, o) => {
    const g = o.gain ?? 0.14;
    [523.3, 659.3, 784, 1046.5].forEach((f, i) => { const tt = t + i * 0.07; S.chain(S.osc('square', f, tt, 0.35), S.vca(tt, 0.002, g, 0.28), S.out(o, 0.2)); });
  };
  LIB.tone = (S, t, o) => {
    const g = o.gain ?? 0.12, dur = o.dur ?? 0.4, f = o.freq ?? 1000;
    S.chain(S.osc('sine', f, t, dur), env(S, t, 0.01, g, Math.max(0, dur - 0.03), 0.02), S.out(o, 0));
  };

  /* ---------------------------------- live + offline ---------------------------------- */
  class Live {
    constructor() { this.on = false; this.ctx = null; this.eng = null; this.bus = null; }
    async enable() {
      if (!this.ctx) { this.ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' }); this.eng = new Engine(this.ctx); }
      if (this.ctx.state !== 'running') await this.ctx.resume();
      this.on = true; this._newBus();
    }
    disable() { this.halt(); this.on = false; }
    _newBus() { const b = this.ctx.createGain(); b.gain.value = 1; b.connect(this.eng.master); this.eng.bus = b; this.bus = b; }
    play(cue, delay) { if (!this.on) return; this.eng.play(cue.name, this.ctx.currentTime + Math.max(0, delay) + 0.03, cue.o); }
    halt() {
      if (!this.bus) return;
      const b = this.bus, now = this.ctx.currentTime;
      b.gain.cancelScheduledValues(now); b.gain.setValueAtTime(b.gain.value, now); b.gain.linearRampToValueAtTime(0, now + 0.06);
      setTimeout(() => { try { b.disconnect(); } catch (e) {} }, 500);
      this._newBus();
    }
    resumeAt(player) {
      for (const c of player.cues) {
        if (c.t >= player.t) break;
        const d = c.o && c.o.dur; if (!d) continue;
        const rem = c.t + d - player.t;
        if (rem > 0.6 && (c.name === 'drone' || c.name === 'pad' || c.name === 'wind')) this.eng.play(c.name, this.ctx.currentTime + 0.03, Object.assign({}, c.o, { dur: rem, fade: Math.min(0.4, rem / 3), attack: 0.3 }));
      }
    }
  }

  async function renderOffline(cues, duration, sr = 48000) {
    const ctx = new OfflineAudioContext(2, Math.ceil(duration * sr), sr);
    const eng = new Engine(ctx);
    for (const c of cues) if (c.t < duration) eng.play(c.name, c.t, c.o);
    return ctx.startRendering();
  }
  function stats(buf) {
    let peak = 0, sum = 0, n = 0;
    for (let ch = 0; ch < buf.numberOfChannels; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < d.length; i++) { const a = Math.abs(d[i]); if (a > peak) peak = a; sum += d[i] * d[i]; n++; } }
    return { peak, rms: Math.sqrt(sum / n) };
  }
  function wavBase64(buf, normalizeTo = 0.93) {
    const { peak } = stats(buf); const k = peak > normalizeTo ? normalizeTo / peak : 1;
    const nch = buf.numberOfChannels, len = buf.length, sr = buf.sampleRate;
    const bytes = new Uint8Array(44 + len * nch * 2), dv = new DataView(bytes.buffer);
    const wr = (o, s) => { for (let i = 0; i < s.length; i++) bytes[o + i] = s.charCodeAt(i); };
    wr(0, 'RIFF'); dv.setUint32(4, 36 + len * nch * 2, true); wr(8, 'WAVE'); wr(12, 'fmt ');
    dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, nch, true); dv.setUint32(24, sr, true);
    dv.setUint32(28, sr * nch * 2, true); dv.setUint16(32, nch * 2, true); dv.setUint16(34, 16, true); wr(36, 'data'); dv.setUint32(40, len * nch * 2, true);
    const chs = []; for (let c = 0; c < nch; c++) chs.push(buf.getChannelData(c));
    let o = 44;
    for (let i = 0; i < len; i++) for (let c = 0; c < nch; c++) { const v = Math.max(-1, Math.min(1, chs[c][i] * k)); dv.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true); o += 2; }
    let s = ''; const CH = 0x8000;
    for (let i = 0; i < bytes.length; i += CH) s += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
    return btoa(s);
  }

  G.SFX = { Engine, Live, LIB, renderOffline, stats, wavBase64, names: () => Object.keys(LIB) };
})(window);
