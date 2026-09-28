/* Dev / render bootstrap. ?scene=<id|id,id|reel>&t=<sec>&render=1 */
(async function () {
  const q = new URLSearchParams(location.search);
  const stage = document.getElementById('stage');
  // window.REEL is inlined by tools/dev.mjs: { name, sequence: [{ key, style, params, meta, trans, mix }] }
  const items = () => (window.REEL.sequence || []).map((it) => ({ def: it.style, params: it.params, meta: it.meta, trans: it.trans, mix: it.mix, key: it.key }));
  await Reel.ready();
  let player = null;
  window.__rl = {
    async init() {
      const alpha = !!q.get('alpha');
      if (alpha) { document.documentElement.style.background = 'transparent'; document.body.style.background = 'transparent'; stage.style.background = 'transparent'; }
      player = new Reel.Player(stage, items(), { alpha });
      await document.fonts.ready;
      return { duration: player.duration, cues: player.cues.length, scenes: player.items.map((e) => ({ id: e.def.id, key: e.key, start: e.start, end: e.end, poster: e.kit.poster })) };
    },
    seek(t) { player.seek(t); return true; },
    // metadata, merged params and retention beats of every item (tools/catalog.mjs, tools/params.mjs)
    catalog() {
      return player.items.map((e) => ({
        key: e.key, id: e.def.id, name: e.def.name || e.def.title, order: e.def.order, niches: e.def.niches || null,
        duration: e.kit.dur, poster: e.kit.poster, bg: e.def.bg, palette: e.kit.palette, meta: e.kit.meta,
        defaults: e.def.defaults || {}, params: e.kit.P, cues: e.kit.cues.length,
        beats: e.kit.beats.map((b) => ({ t: +b.t.toFixed(2), label: b.label })),
      }));
    },
    async wav(sr) {
      const buf = await SFX.renderOffline(player.cues, player.duration, sr || 48000);
      return { b64: SFX.wavBase64(buf), stats: SFX.stats(buf) };
    },
    async sfxTest() {
      const out = [];
      for (const name of SFX.names()) {
        const buf = await SFX.renderOffline([{ t: 0.05, name, o: {} }], 3, 44100);
        const s = SFX.stats(buf); out.push({ name, peak: +s.peak.toFixed(3), rms: +s.rms.toFixed(4) });
      }
      return out;
    },
  };
  if (q.get('render')) { document.body.classList.add('render'); return; }

  /* ---------- interactive dev view ---------- */
  await window.__rl.init();
  const hud = document.getElementById('hud');
  const fit = () => { const k = Math.min(innerWidth / 1920, (innerHeight - 40) / 1080); stage.style.transform = `scale(${k})`; hud.style.top = 1080 * k + 'px'; hud.style.width = 1920 * k + 'px'; };
  addEventListener('resize', fit); fit();
  const bar = hud.querySelector('.bar'), fill = hud.querySelector('.fill'), lab = hud.querySelector('.lab');
  const audio = new SFX.Live(); player.audio = audio;
  const show = () => { fill.style.width = (100 * player.t) / player.duration + '%'; lab.textContent = `${player.t.toFixed(2)} / ${player.duration.toFixed(2)}s  ${player.playing ? '▶' : '❚❚'}  rate ${player.rate}  ${audio.on ? 'sound on' : 'muted (m)'}  [space] play  [←→] frame  [l] loop  [,] half speed`; };
  player.on('time', show).on('play', show).on('pause', show);
  bar.addEventListener('pointerdown', (e) => { const r = bar.getBoundingClientRect(); player.seek(((e.clientX - r.left) / r.width) * player.duration); show(); });
  addEventListener('keydown', async (e) => {
    if (e.code === 'Space') { e.preventDefault(); player.toggle(); }
    else if (e.code === 'ArrowRight') { player.seek(player.t + (e.shiftKey ? 1 : 1 / 60)); }
    else if (e.code === 'ArrowLeft') { player.seek(player.t - (e.shiftKey ? 1 : 1 / 60)); }
    else if (e.key === 'm') { if (audio.on) audio.disable(); else await audio.enable(); }
    else if (e.key === 'l') { player.loop = !player.loop; }
    else if (e.key === ',') { player.setRate(player.rate === 1 ? 0.5 : player.rate === 0.5 ? 0.25 : 1); }
    show();
  });
  const t0 = parseFloat(q.get('t') || '0'); player.seek(t0); show();
  if (q.get('play')) player.play();
})();
