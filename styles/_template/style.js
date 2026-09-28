/* {{NAME}} — one line on what the piece does.
   Copied from styles/_template by tools/new-style.mjs. Rules: docs/STYLE_AUTHORING.md.
   Content lives in `defaults` (JSON only); choreography, easing, camera and sound live in build(). */
Reel.style({
  id: '{{ID}}', order: 50,
  name: '{{NAME}}',
  transIn: { type: 'whip', dur: 0.45, dir: 1 },   // how a reel cuts INTO this piece (types: docs/PIPELINE.md)
  niches: {
    primary: ['Primary niche'],
    similar: ['Similar niche', 'Another similar niche'],
  },
  niche: 'Primary niche', title: 'Card title', duration: 5, poster: 3.2,
  bg: '#0B0B10', palette: ['#FF5A3D', '#F4F1EA', '#15151C'],
  techniques: ['Masked word rise', 'Drawn accent rule', 'Slow camera push'],
  why: 'One sentence on the retention job this piece does.',
  facts: '',
  defaults: {
    eyebrow: 'EYEBROW LABEL',
    headline: 'The hook, in six words.',
    sub: 'A supporting line that lands the point.',
    background: 'radial-gradient(120% 90% at 20% 10%, #1D1D27 0%, #0B0B10 60%)',
    padNotes: [196, 246.9, 293.7],
    colors: { accent: '#FF5A3D', ink: '#F4F1EA', muted: '#8C8A99' },
  },
  build(S, P) {
    const tl = S.tl, C = P.colors;
    const fitWidth = (el, maxW) => { const w = el.scrollWidth; if (w > maxW) el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * maxW) / w + 'px'; };

    if (!S.alpha) S.root.style.background = P.background;
    S.camSet({ x: 960, y: 540, z: 1 });
    S.camTo(0, { x: 960, y: 540, z: 1.04 }, 5, 'sine.inOut');       // every style moves a little

    const box = S.el('div', { style: 'position:absolute;left:160px;top:360px;' });
    const eyebrow = S.el('div', { text: P.eyebrow, style: `font:700 28px "JetBrains Mono",monospace;letter-spacing:.24em;color:${C.accent};white-space:nowrap;` }, box);
    const h1 = S.el('div', { text: P.headline, style: `margin-top:18px;font:800 120px/1 "Archivo",sans-serif;font-stretch:112%;color:${C.ink};white-space:nowrap;width:max-content;` }, box);
    fitWidth(h1, 1600);
    const rule = S.el('div', { style: `margin-top:34px;width:220px;height:8px;border-radius:4px;background:${C.accent};transform-origin:0 50%;` }, box);
    const sub = S.el('div', { text: P.sub, style: `margin-top:30px;font:500 44px "Inter",sans-serif;color:${C.muted};white-space:nowrap;width:max-content;` }, box);
    fitWidth(sub, 1600);

    tl.from(eyebrow, { x: -40, opacity: 0, duration: 0.6, ease: 'expo.out' }, 0.1);
    S.sfx(0.1, 'tick', { gain: 0.25 });
    const words = S.split(h1, 'words', { mask: 'words' }).words;
    tl.from(words, { yPercent: 110, duration: 0.75, ease: 'expo.out', stagger: 0.08 }, 0.3);
    S.sfx(0.28, 'whoosh', { dur: 0.45, gain: 0.3 });
    S.beat(0.3, 'Hook lands word by word inside the first second');
    tl.from(rule, { scaleX: 0, duration: 0.6, ease: 'expo.inOut' }, 1.2);
    S.sfx(1.2, 'swoosh', { gain: 0.25 });
    tl.from(sub, { y: 24, opacity: 0, duration: 0.6, ease: 'expo.out' }, 1.6);
    S.sfx(1.6, 'pop', { pitch: 1.2, gain: 0.25 });
    S.beat(1.6, 'Payoff line resolves the hook');

    S.sfx(0, 'pad', { dur: 5, gain: 0.07, notes: P.padNotes, attack: 1.2, release: 1.5 });
    S.vignette({ strength: 0.5 });
    S.grain({ opacity: 0.05 });
  },
});
