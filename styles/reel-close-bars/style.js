/* Reel close — end card, then the line opens back into bars (bookend).
   The title rises over an accent line, a roll-call of skills ticks in, a closing note fades up, then
   everything clears and the line spans the frame and opens back into the bars the reel started on. */
(function () {
  const TOP = ['#C0C0C0', '#C0C000', '#00C0C0', '#00C000', '#C000C0', '#C00000', '#0000C0'];
  const MID = ['#0000C0', '#131313', '#C000C0', '#131313', '#00C0C0', '#131313', '#C0C0C0'];
  const LOW = [[0, 1.25, '#00214C'], [1.25, 2.5, '#FFFFFF'], [2.5, 3.75, '#32006A'], [3.75, 5, '#131313'],
    [5, 5 + 1 / 3, '#090909'], [5 + 1 / 3, 5 + 2 / 3, '#131313'], [5 + 2 / 3, 6, '#1D1D1D'], [6, 7, '#131313']];
  function outroBars(S, parent) {
    const box = S.el('div', { style: 'position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:50% 50%;' }, parent);
    const bw = 1920 / 7;
    TOP.forEach((c, i) => S.el('div', { style: `position:absolute;left:${(i * bw).toFixed(2)}px;top:0;width:${(bw + 0.6).toFixed(2)}px;height:720px;background:${c};` }, box));
    MID.forEach((c, i) => S.el('div', { style: `position:absolute;left:${(i * bw).toFixed(2)}px;top:720px;width:${(bw + 0.6).toFixed(2)}px;height:90px;background:${c};` }, box));
    LOW.forEach(([a, b, c]) => S.el('div', { style: `position:absolute;left:${(a * bw).toFixed(2)}px;top:810px;width:${((b - a) * bw + 0.6).toFixed(2)}px;height:270px;background:${c};` }, box));
    return box;
  }

  Reel.style({
    id: 'reel-close-bars', seed: 'outro', order: 14,
    name: 'Bars & Tone Close',
    transIn: { type: 'dip', dur: 0.5 },   // how a reel cuts INTO this piece (tools/new-reel.mjs); a reel item's trans overrides it
    niches: {
      primary: ['Showreel / portfolio end card', 'Channel outro'],
      similar: ['Episode end card', 'Series or course wrap-up', 'Credits roll-call', 'Tech & broadcast channels', 'Retro / VHS themes'],
    },
    niche: 'Reel close', title: 'End Card', duration: 4.6, poster: 2.9,
    bg: '#0A0B0D', palette: ['#F2B33D', '#ECE9E1', '#0A0B0D'],
    techniques: ['Bookended open and close', 'Capability roll-call', 'Tail tone'],
    why: 'Ends where it began, so the reel feels designed as one piece rather than a playlist.',
    facts: 'Bars layout as in the open; the closing 1 kHz blip mirrors a broadcast tail tone.',
    defaults: {
      title: 'OPUS 5.5',                                                       // shrinks past 1600 px
      roll: ['MOTION DESIGN', 'KINETIC TYPE', 'DATA VIZ', 'MAPS', 'SOUND DESIGN'],   // 2–6 items, one line
      note: 'Every frame and every sound in this reel was generated from code.',
      toneHz: 1000,
      colors: { accent: '#F2B33D', ink: '#ECE9E1', muted: '#8C8F99' },
    },
    build(S, P) {
      const tl = S.tl, C = P.colors, AMBER = C.accent, INK = C.ink, MUTED = C.muted;
      const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return `${n >> 16},${(n >> 8) & 255},${n & 255}`; };
      const fitCentered = (el, maxW) => {
        const keep = el.style.width; el.style.width = 'max-content'; const w = el.offsetWidth; el.style.width = keep;
        if (w > maxW) el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * maxW) / w + 'px';
      };
      const LINE_Y = 600;
      S.camSet({ z: 1.03 });
      S.camTo(0, { z: 1 }, 3.2, 'sine.out');

      const mask = S.el('div', { style: `position:absolute;left:0;width:1920px;top:${LINE_Y - 250}px;height:240px;overflow:hidden;` });
      const title = S.el('div', { text: P.title, style: `position:absolute;left:0;bottom:-14px;width:1920px;text-align:center;font:900 210px/1 "Archivo",sans-serif;font-stretch:125%;color:${INK};white-space:nowrap;` }, mask);
      fitCentered(title, 1600);
      const ts = S.split(title, 'chars');
      tl.from(ts.chars, { yPercent: 105, duration: 0.7, ease: 'expo.out', stagger: Math.min(0.04, 0.32 / Math.max(1, ts.chars.length)) }, 0.25);
      S.sfx(0.3, 'impact', { gain: 0.4 });

      const line = S.el('div', { style: `position:absolute;left:560px;top:${LINE_Y}px;width:800px;height:4px;background:${AMBER};box-shadow:0 0 26px 2px rgba(${rgb(AMBER)},.55);transform-origin:50% 50%;` });
      tl.from(line, { scaleX: 0, duration: 0.6, ease: 'expo.out' }, 0.1);
      S.sfx(0.1, 'swoosh', { gain: 0.3 });

      const roll = (P.roll || []).slice(0, 6);
      const row = S.el('div', { style: `position:absolute;left:0;width:1920px;top:${LINE_Y + 40}px;display:flex;justify-content:center;gap:34px;font:700 30px "JetBrains Mono",monospace;letter-spacing:.2em;color:${INK};white-space:nowrap;` });
      const words = roll.map((w, i) => {
        if (i) S.el('span', { text: '/', style: `color:${AMBER};` }, row);
        return S.el('span', { text: w }, row);
      });
      fitCentered(row, 1700);
      words.forEach((s, i) => {
        tl.from(s, { y: 20, opacity: 0, duration: 0.45, ease: 'expo.out' }, 0.8 + i * 0.12);
        S.sfx(0.8 + i * 0.12, 'tick', { pitch: 0.9 + i * 0.18, gain: 0.2 });
      });
      const note = S.el('div', { text: P.note, style: `position:absolute;left:0;width:1920px;top:${LINE_Y + 120}px;text-align:center;font:500 30px "Archivo",sans-serif;color:${MUTED};white-space:nowrap;` });
      fitCentered(note, 1600);
      tl.from(note, { opacity: 0, y: 12, duration: 0.6 }, 1.6);
      S.beat(0.8, 'Roll-call of the skills the reel just demonstrated');

      // bookend: everything clears, the line spans the frame and opens into bars
      tl.to([mask, row, note], { opacity: 0, duration: 0.25, ease: 'power2.in' }, 3.25);
      tl.to(line, { left: 0, width: 1920, top: 538, backgroundColor: '#ffffff', duration: 0.35, ease: 'expo.inOut' }, 3.3);
      const B = outroBars(S, S.cam);
      tl.fromTo(B, { scaleY: 0.004, opacity: 0 }, { scaleY: 1, opacity: 1, duration: 0.28, ease: 'power3.out' }, 3.62);
      tl.set(line, { opacity: 0 }, 3.66);
      tl.set(B, { opacity: 0 }, 4.25);
      S.sfx(3.3, 'whoosh', { dur: 0.35, from: 300, to: 4200, gain: 0.3 });
      S.sfx(3.62, 'tone', { freq: P.toneHz, dur: 0.6, gain: 0.07 });
      S.beat(3.62, 'Bookend: the reel closes on the signal it opened with');
      S.vignette({ strength: 0.5 });
      S.grain({ opacity: 0.05 });
    },
  });
})();
