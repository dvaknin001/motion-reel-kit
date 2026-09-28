/* Reel open — SMPTE bars & tone collapse into the title.
   Bars and a burnt-in slate/timecode hold for half a second, the picture collapses to a CRT line, the line
   becomes the title underline, the title rises out of it with a decaying RGB split, then a stat line. */
(function () {
  // SMPTE ECR 1-1978 layout: 75% bars / reverse-blue castellations / -I, white, +Q, black, PLUGE.
  const TOP = ['#C0C0C0', '#C0C000', '#00C0C0', '#00C000', '#C000C0', '#C00000', '#0000C0'];
  const MID = ['#0000C0', '#131313', '#C000C0', '#131313', '#00C0C0', '#131313', '#C0C0C0'];
  const LOW = [[0, 1.25, '#00214C'], [1.25, 2.5, '#FFFFFF'], [2.5, 3.75, '#32006A'], [3.75, 5, '#131313'],
    [5, 5 + 1 / 3, '#090909'], [5 + 1 / 3, 5 + 2 / 3, '#131313'], [5 + 2 / 3, 6, '#1D1D1D'], [6, 7, '#131313']];
  function bars(S, parent) {
    const box = S.el('div', { style: 'position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:50% 50%;filter:brightness(1) saturate(1);' }, parent);
    const bw = 1920 / 7;
    TOP.forEach((c, i) => S.el('div', { style: `position:absolute;left:${(i * bw).toFixed(2)}px;top:0;width:${(bw + 0.6).toFixed(2)}px;height:720px;background:${c};` }, box));
    MID.forEach((c, i) => S.el('div', { style: `position:absolute;left:${(i * bw).toFixed(2)}px;top:720px;width:${(bw + 0.6).toFixed(2)}px;height:90px;background:${c};` }, box));
    LOW.forEach(([a, b, c]) => S.el('div', { style: `position:absolute;left:${(a * bw).toFixed(2)}px;top:810px;width:${((b - a) * bw + 0.6).toFixed(2)}px;height:270px;background:${c};` }, box));
    return box;
  }
  const tc = (t, base = 3600) => { const f = Math.floor(t * 60), s = Math.floor(f / 60) + base; const p = (n) => String(n).padStart(2, '0'); return `${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}:${p(f % 60)}`; };
  window.__reelBars = bars; window.__reelTC = tc;

  Reel.style({
    id: 'reel-open-bars', seed: 'intro', order: 0,
    name: 'Bars & Tone Open',
    niches: {
      primary: ['Showreel / portfolio open', 'Channel intro'],
      similar: ['Episode cold open', 'Documentary title card', 'Tech & broadcast channels', 'Retro / VHS themes', 'Course or series opener'],
    },
    niche: 'Reel open', title: 'Bars & Tone', duration: 3.6, poster: 2.9,
    bg: '#0A0B0D', palette: ['#F2B33D', '#ECE9E1', '#0A0B0D'],
    techniques: ['Broadcast test-signal open', 'CRT collapse into type', 'Letters rise out of the line'],
    why: 'Opens on a signal every editor recognises, then turns it into the title in under two seconds.',
    facts: 'SMPTE colour bars layout (ECR 1-1978): 75% bars, reverse-blue castellations, -I / white / +Q / PLUGE row, 1 kHz line-up tone.',
    defaults: {
      slate: 'OPUS 5.5 — MOTION REEL',       // burnt-in window, top left, over the bars
      timecodeStart: 3600,                   // burnt-in timecode start in seconds (3600 = 01:00:00:00)
      title: 'OPUS 5.5',                     // rises out of the line; shrinks past 1600 px
      subtitle: 'MOTION DESIGN FOR HIGH-RETENTION YOUTUBE',
      stats: ['13 PIECES', '12 NICHES', 'EVERY FRAME AND SOUND GENERATED FROM CODE'],   // 1–4 items
      toneHz: 1000,
      colors: { accent: '#F2B33D', ink: '#ECE9E1', stats: '#A9ABB3' },
    },
    build(S, P) {
      const tl = S.tl, C = P.colors, AMBER = C.accent, INK = C.ink;
      const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return `${n >> 16},${(n >> 8) & 255},${n & 255}`; };
      // shrink a full-width centred line of text until its content fits maxW
      const fitCentered = (el, maxW) => {
        const keep = el.style.width; el.style.width = 'max-content'; const w = el.offsetWidth; el.style.width = keep;
        if (w > maxW) el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * maxW) / w + 'px';
      };
      S.camSet({ z: 1 });
      S.camTo(1.0, { z: 1.035 }, 2.6, 'sine.out');

      // bars + burn-in windows
      const B = bars(S, S.cam);
      const burn = (txt, css) => S.el('div', { text: txt, style: `position:absolute;${css};padding:8px 14px;background:#000;font:700 26px "JetBrains Mono",monospace;letter-spacing:.06em;color:#fff;` }, S.hud);
      const b1 = burn(P.slate, 'left:96px;top:72px;max-width:1300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis');
      const b2 = burn('', 'right:96px;top:72px;font-variant-numeric:tabular-nums');
      S.onFrame((t) => { b2.textContent = 'TC ' + tc(t, P.timecodeStart); });
      S.sfx(0, 'tone', { freq: P.toneHz, dur: 0.55, gain: 0.07 });
      tl.to([b1, b2], { opacity: 0, duration: 0.08 }, 0.55);

      // CRT collapse
      tl.to(B, { scaleY: 0.004, duration: 0.3, ease: 'power3.in' }, 0.55);
      tl.to(B, { filter: 'brightness(2.6) saturate(1.4)', duration: 0.3, ease: 'power2.in' }, 0.55);
      tl.to(B, { opacity: 0, duration: 0.05 }, 0.86);
      S.sfx(0.52, 'whoosh', { dur: 0.36, from: 4200, to: 300, gain: 0.35 });
      S.sfx(0.86, 'thud', { gain: 0.45, pitch: 0.8 });
      S.beat(0, 'Bars and tone: a signal every editor recognises');

      // the line survives the collapse and becomes the underline
      const LINE_Y = 668;
      const line = S.el('div', { style: `position:absolute;left:0;top:${538}px;width:1920px;height:4px;background:#fff;box-shadow:0 0 30px 6px rgba(255,255,255,.8);opacity:0;` });
      tl.set(line, { opacity: 1 }, 0.84);
      tl.to(line, { left: 410, width: 1100, top: LINE_Y, backgroundColor: AMBER, boxShadow: `0 0 26px 2px rgba(${rgb(AMBER)},.55)`, duration: 0.5, ease: 'expo.inOut' }, 0.86);
      S.beat(0.86, 'The collapsed signal becomes the title underline');

      // title rises out of the line
      const mask = S.el('div', { style: `position:absolute;left:0;width:1920px;top:${LINE_Y - 300}px;height:292px;overflow:hidden;` });
      const title = S.el('div', { text: P.title, style: `position:absolute;left:0;bottom:-18px;width:1920px;text-align:center;font:900 260px/1 "Archivo",sans-serif;font-stretch:125%;letter-spacing:-.01em;color:${INK};white-space:nowrap;` }, mask);
      fitCentered(title, 1600);
      const ts = S.split(title, 'chars');
      tl.from(ts.chars, { yPercent: 105, duration: 0.75, ease: 'expo.out', stagger: Math.min(0.045, 0.36 / Math.max(1, ts.chars.length)) }, 1.02);
      S.sfx(1.1, 'impact', { gain: 0.5 });
      S.sfx(1.08, 'braam', { gain: 0.22, dur: 1.8, freq: 55 });
      const ab = { k: 0 };
      tl.fromTo(ab, { k: 1 }, { k: 0, duration: 0.6, ease: 'power2.out' }, 1.15);
      S.onFrame(() => { const d = (ab.k * 14).toFixed(1); title.style.textShadow = ab.k > 0.01 ? `${d}px 0 0 rgba(255,40,90,.7), -${d}px 0 0 rgba(0,220,255,.7)` : 'none'; });
      S.beat(1.02, 'Letters rise from the line with a decaying RGB split');

      // subtitle drops from the line
      const subMask = S.el('div', { style: `position:absolute;left:0;width:1920px;top:${LINE_Y + 10}px;height:60px;overflow:hidden;` });
      const sub = S.el('div', { text: P.subtitle, style: `position:absolute;left:0;top:10px;width:1920px;text-align:center;font:700 32px "JetBrains Mono",monospace;letter-spacing:.32em;color:${INK};white-space:nowrap;` }, subMask);
      fitCentered(sub, 1640);
      tl.from(sub, { yPercent: -120, letterSpacing: '.6em', duration: 0.7, ease: 'expo.out' }, 1.45);
      S.sfx(1.45, 'swoosh', { gain: 0.3 });

      // stat line: coloured dots borrow the bar colours, the last one takes the accent
      const stats = S.el('div', { style: `position:absolute;left:0;width:1920px;top:${LINE_Y + 110}px;display:flex;justify-content:center;gap:42px;font:600 26px "JetBrains Mono",monospace;letter-spacing:.14em;color:${C.stats};white-space:nowrap;` });
      const items = (P.stats || []).slice(0, 4);
      const parts = items.map((txt, i) => {
        const p = S.el('div', { style: 'display:flex;align-items:center;gap:14px;' }, stats);
        S.el('span', { style: `width:10px;height:10px;border-radius:50%;background:${i === items.length - 1 ? AMBER : TOP[(i % 6) + 1]};display:inline-block;` }, p);
        S.el('span', { text: txt }, p);
        return p;
      });
      fitCentered(stats, 1700);
      parts.forEach((p, i) => { tl.from(p, { y: 16, opacity: 0, duration: 0.5, ease: 'expo.out' }, 2.0 + i * 0.13); S.sfx(2.0 + i * 0.13, 'tick', { pitch: 1 + i * 0.25, gain: 0.22 }); });
      if (parts.length) S.beat(2.0, 'Three facts set expectations before the first piece');
      S.vignette({ strength: 0.5 });
      S.grain({ opacity: 0.05 });
    },
  });
})();
